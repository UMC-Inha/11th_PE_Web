# Backend Chapter04

## 키워드 정리

### JPA / Hibernate와 TypeORM — ORM과 구현체·라이브러리의 역할은 어떻게 다른가?

**JPA (Java Persistence API)**

- 자바 ORM 기술에 대한 API 표준 명세임
- 특정 기능을 하는 라이브러리가 아니라, ORM을 사용하기 위한 인터페이스를 모아둔 것
- 자바 애플리케이션에서 관계형 데이터베이스를 어떻게 다룰지 정의하는 방법 중 하나
- 단순한 명세(Specification)이며 그 자체로는 구현체가 없음

**Hibernate**

- JPA를 구현한 ORM 프레임워크
- 가장 범용적으로 쓰이며 다양한 기능을 제공
- JPA가 "인터페이스"라면 Hibernate는 그 인터페이스를 실제로 구현해서 SQL을 만들고 실행하는 "엔진". 이론적으로는 Hibernate 대신 EclipseLink 같은 다른 JPA 구현체로 교체 가능

**TypeORM과의 비교**

- Node.js/TypeScript 진영의 ORM. Java처럼 "표준 명세(JPA) + 구현체(Hibernate)"가 분리되어 있지 않고, TypeORM 자체가 API와 구현을 동시에 제공함. 즉 명세만 따로 떼어 다른 구현체로 바꿔 끼우는 구조가 아님
- `@Entity()`, `@Column()` 같은 데코레이터로 엔티티를 정의하는 방식은 JPA의 `@Entity`, `@Column` 어노테이션과 유사한 접근
- `synchronize: true` 옵션 하나로 엔티티 변경 사항을 DB 스키마에 즉시 반영 가능. 편리한 만큼 운영 환경에서는 위험함 (아래 "Migration과 synchronize" 항목과 연결)

### Entity Lifecycle과 Persistence Context — 엔티티를 저장할 때 즉시 SQL이 실행되지 않을 수 있는 이유는 무엇인가?

- Entity는 **비영속(Transient) → 영속(Managed) → 준영속(Detached)/삭제(Removed)** 생명주기를 가짐. `save()`를 호출하면 영속성 컨텍스트가 관리하는 영속 상태가 됨
- 영속성 컨텍스트는 엔티티를 1차 캐시에만 올려두고, **트랜잭션 커밋 시점 / JPQL 실행 직전 / `flush()` 호출 시점**에만 SQL을 실제로 전송함 (쓰기 지연, Write-Behind). 덕분에 같은 트랜잭션에서 여러 번 수정해도 최종 상태 하나로만 UPDATE가 나감
- 필드만 바꿔도 다시 `save()`를 호출할 필요 없이 변경이 자동 반영되는 것도, 영속성 컨텍스트가 최초 스냅샷과 현재 값을 비교해 변경분을 찾아내기 때문 (Dirty Checking)

```java
Book book = new Book(category, "제목", "설명"); // 비영속
bookRepository.save(book);                       // 영속 상태 전환, 이 시점에 INSERT가 바로 안 나갈 수 있음

book.setTitle("수정된 제목");                      // save() 재호출 없이도 Dirty Checking으로 UPDATE 예약
// 트랜잭션 커밋 시점에 flush → 그제서야 INSERT/UPDATE SQL이 실제로 실행됨
```

- 다만 `@GeneratedValue(strategy = GenerationType.IDENTITY)`는 예외. DB가 INSERT를 실행해야 PK를 알 수 있어서, `save()` 즉시 INSERT가 나감 (Chapter04 미션의 `Book` 엔티티가 이 경우)

### DTO와 API Contract — Entity를 그대로 응답하면 어떤 문제가 생길까?

- **민감 정보 노출:** 비밀번호 해시 등 클라이언트가 몰라도 되는 필드까지 그대로 노출될 수 있음
- **LAZY 직렬화 오류:** `@ManyToOne(fetch = LAZY)` 필드를 트랜잭션 밖에서 직렬화하면 `LazyInitializationException` 발생
- **순환 참조:** 양방향 연관관계(`Book ↔ Category`)를 그대로 직렬화하면 `StackOverflowError` 발생 가능
- **Mass Assignment 위험:** 요청 바디를 Entity에 그대로 바인딩하면 의도하지 않은 필드(`isAdmin` 등)까지 조작당할 수 있음
- **해결책:** Entity는 DB 구조를, DTO는 API 계약을 표현하도록 분리. Chapter04의 `CreateBookRequest`/`BookResponse`가 이 패턴

### Validation — 요청 검증을 Controller 단에서 수행해야 하는 이유는 무엇인가?

- **요청 검증이 하는 일:** 클라이언트가 보낸 요청 데이터가 정해둔 규칙(필수값인지, 빈 문자열은 아닌지, 길이 제한을 넘지 않는지 등)을 만족하는지, Controller 메서드 본문이 실행되기 전에 자동으로 확인하는 것. 규칙을 어기면 비즈니스 로직은 실행되지 않고 바로 400으로 끊김

```java
// 1) DTO 필드에 "무엇을 검증할지" 규칙을 선언
public record CreateBookRequest(
        @NotNull Long categoryId,
        @NotBlank @Size(max = 100) String title,
        String description
) {}

// 2) Controller는 @Valid로 "이 규칙들을 먼저 확인해라"라고 지시만 함
public BookResponse createBook(@Valid @RequestBody CreateBookRequest request) { ... }
```

- `@RequestBody`가 요청 JSON을 `CreateBookRequest` 객체로 변환하면, `@Valid`가 그 객체 필드에 붙은 `@NotNull`/`@NotBlank`/`@Size` 규칙을 자동으로 검사함. 즉 실제 "검증 내용"은 DTO에, "검증을 실행하라"는 지시는 Controller에 있음
- **Fail Fast:** `@Valid`가 Controller 진입 시점에 검증하므로, 잘못된 요청이 Service나 DB까지 가지 않음
- **관심사 분리:** Controller는 "형식이 맞는가"(`@NotBlank`, `@Size` 등), Service는 "비즈니스 규칙에 맞는가"(예: `categoryId` 존재 여부)를 담당
- **일관된 에러 응답:** 검증 실패 시 `@RestControllerAdvice`가 항상 같은 형태(`400` + 메시지)로 응답하므로, Service마다 검증 코드를 중복 작성할 필요 없음

### N+1 Query — 관계 데이터를 함께 조회할 때 쿼리가 예상보다 많이 실행되는 이유는 무엇인가?

- 목록 조회 쿼리 1번 이후, 각 결과가 연관 엔티티(LAZY)에 접근할 때마다 추가 쿼리가 1번씩 더 나가 총 `1 + N`번 실행되는 현상

```java
List<Book> books = bookRepository.findAllByOrderByBookIdDesc(); // 쿼리 1번: SELECT * FROM book

books.forEach(book -> book.getCategory().getName());
// LAZY 프록시가 초기화되며, 책 개수(N)만큼 SELECT * FROM category WHERE category_id = ? 가 추가로 나감
```

- Chapter04 미션의 `BookResponse.from(book)`이 `book.getCategory().getName()`을 호출하는 부분이 정확히 이 패턴 (책 4권 → 1+4=5번 쿼리). 데이터가 많아질수록 쿼리 수가 그대로 비례해서 늘어남
- **해결책:** Fetch Join(`JOIN FETCH`), `@EntityGraph`, Batch Size 설정, 또는 DTO 프로젝션으로 애초에 한 번에 조회

### Migration과 synchronize — 운영 환경에서 자동 스키마 변경이 위험한 이유는 무엇인가?

**Migration이란**

- DB 스키마(테이블, 컬럼, 인덱스 등)의 변경 사항을 SQL 스크립트나 코드로 기록해, 버전 단위로 순차 적용·추적하는 방식
- 변경 하나하나가 버전으로 남기 때문에 지금 DB가 어떤 상태인지 추적 가능하고, 필요하면 이전 버전으로 롤백도 가능함
- 반대로 `ddl-auto`/`synchronize`는 이런 버전 관리 없이, 엔티티 클래스를 기준으로 ORM이 스키마를 그 자리에서 즉시 바꿔버리는 방식

**자동 스키마 변경이 운영에서 위험한 이유**

- `ddl-auto: update/create`나 TypeORM의 `synchronize: true`는 엔티티 기준으로 DB 스키마를 자동으로 바꿔주는 옵션
- 필드명을 바꾸면 "컬럼 추가+삭제"로 인식해 데이터가 든 기존 컬럼을 그대로 `DROP`할 수 있음
- 여러 서버 인스턴스가 동시에 스키마를 바꾸려다 충돌할 수 있고, 변경 이력 추적과 롤백도 불가능함
- Chapter04에서 `ddl-auto: validate`로 설정한 것도 같은 이유 (검증만 하고 자동으로 바꾸지 않음)
- **권장 대안:** Flyway, Liquibase(Java) / TypeORM 자체 migration(Node)처럼 버전이 있고 리뷰·롤백 가능한 마이그레이션 도구 사용
