- **JPA / Hibernate와 TypeORM** — ORM과 구현체·라이브러리의 역할은 어떻게 다른가?
    - **ORM(Object-Relational Mapping)**: 객체의 필드·관계를 DB의 테이블·컬럼·외래 키에 대응시키는 방식. 반복적인 SQL·결과 매핑을 줄여 주지만, SQL과 DB 동작을 몰라도 된다는 뜻은 X.
    - **JPA(Jakarta Persistence)**: Java에서 영속성 관리·엔티티 매핑을 어떻게 할지 정한 표준 API/명세. JPA 자체가 DB에 SQL을 보내는 구현체는 X.
    - **Hibernate**: JPA 명세를 구현한 ORM. 엔티티 상태 관리, 변경 감지, SQL 생성·실행 등을 담당. **Spring Data JPA**는 그 위에서 `JpaRepository` 같은 저장소 인터페이스를 제공해 반복 코드를 줄이는 계층.
    - **TypeORM**: TypeScript/JavaScript 환경의 별도 ORM 라이브러리. 엔티티·관계 매핑, Repository, QueryBuilder, migration 등을 제공하지만 JPA 구현체는 X.
    - **추가 핵심 정리**
        - 매핑 예시: 이번 Spring 실습의 `Book` 엔티티는 `book` 테이블에 대응, `@ManyToOne`과 `@JoinColumn(name = "category_id")`은 도서 → 카테고리 관계를 표현.
        - ORM을 사용해도 복잡한 집계·대량 갱신·성능이 중요한 조회는 직접 SQL/JPQL/QueryBuilder가 더 적합할 수 있음. 생성된 SQL과 실행 계획 확인 필요.
        - 관계를 `LAZY`로 둔 것과 실제 쿼리 수는 별개. 필요한 화면 데이터를 어떻게 조회할지까지 설계해야 함.
    - **참고 자료**: Jakarta Persistence 명세 · Hibernate 소개
- **Entity Lifecycle과 Persistence Context** — 엔티티를 저장할 때 즉시 SQL이 실행되지 않을 수 있는 이유는 무엇인가?
    - **영속성 컨텍스트**: 엔티티를 식별자 기준으로 관리하는 공간. 조회한 엔티티를 같은 트랜잭션 안에서 재사용하고, 변경 내용을 DB에 반영할 시점을 조절.
    - 엔티티 상태는 보통 **비영속 → 영속 → 준영속/삭제**로 구분. 새 객체를 `persist`하거나 Repository의 `save`를 호출하면 관리 대상이 될 수 있지만, 그 호출 자체가 항상 즉시 `INSERT`를 뜻하지는 않음.
    - 변경 내용을 모아 두었다가 **flush** 시점에 SQL 실행. 트랜잭션 커밋 전이나 일부 쿼리 실행 전 등에 flush가 발생할 수 있으며, **flush는 DB에 SQL을 보내는 것, commit은 트랜잭션 확정**으로 서로 다름.
    - 단, ID 생성 전략·구현 방식에 따라 즉시 SQL이 필요할 수 있음. 이번 `Book`의 `GenerationType.IDENTITY`는 DB가 생성한 ID를 받아야 하므로 신규 엔티티 저장 시 `INSERT`가 일찍 실행될 수 있음. “`save`는 항상 SQL을 미룬다”는 설명은 X.
    - **추가 핵심 정리**
        - **1차 캐시**: 동일 영속성 컨텍스트에서 같은 식별자의 엔티티를 다시 찾으면 관리 중인 객체를 활용. 애플리케이션 전체가 공유하는 캐시는 X.
        - **변경 감지(Dirty Checking)**: 관리 중인 엔티티의 필드가 바뀌면 flush 때 차이를 확인해 `UPDATE`. 단순 Java 객체나 영속성 컨텍스트 밖의 준영속 객체는 자동 반영되지 않음.
        - **지연 로딩**: 연관 객체가 필요해지는 시점에 추가 조회 가능. 트랜잭션 밖에서 접근하면 초기화 오류가 날 수 있어 조회·DTO 변환 범위를 고려.
    - **참고 자료**: Jakarta Persistence API · Hibernate User Guide: Flushing
- **DTO와 API Contract** — Entity를 그대로 응답하면 어떤 문제가 생길까?
    - **Entity**는 DB 저장 구조와 영속성 관리를 위한 객체, **DTO**는 API에서 주고받을 데이터를 목적에 맞게 정의한 객체. 둘의 변경 주기를 분리하는 것이 핵심.
    - Entity를 그대로 직렬화하면 원하지 않는 필드 노출, 양방향 관계의 순환 참조, 지연 로딩 중 추가 SQL 또는 초기화 오류가 발생 가능. DB 컬럼·연관관계 변경이 곧바로 응답 JSON 변경으로 이어질 수도 있음.
    - **API Contract**는 클라이언트와 약속한 요청·응답 구조와 의미. 필드명·자료형·필수 여부뿐 아니라 상태 코드, 오류 응답, 정렬·검색 규칙도 포함.
    - 이번 실습은 `BookRequest`로 입력을 받고, `BookResponse.from(book)`에서 `bookId`·`title`·`description`·`categoryName`·`isAvailable`만 응답으로 변환. Entity의 `Category` 객체 전체를 노출하지 않음.
    - **추가 핵심 정리**
        - 생성 요청과 조회 응답은 필요한 정보가 달라 DTO를 분리하는 편이 명확. 예: 요청에는 `categoryId`, 응답에는 화면 표시용 `categoryName`.
        - DTO 변환 위치도 조회 성능에 영향. `BookResponse.from(book)`가 `book.getCategory().getName()`을 읽을 때 연관 데이터가 아직 로딩되지 않았다면 추가 쿼리 발생 가능.
        - API를 바꿀 때는 클라이언트 호환성 확인. 기존 필드의 이름·의미를 갑자기 바꾸거나 제거하면 서버 내부 변경보다 영향 범위가 큼.
    - **참고 자료**: Spring MVC 응답 본문 변환 · Spring MVC ResponseEntity
- **Validation** — 요청 검증을 Controller 단에서 수행해야 하는 이유는 무엇인가?
    - Controller는 외부 입력이 애플리케이션으로 들어오는 경계. 형식이 잘못된 요청을 여기서 걸러야 Service의 핵심 로직이 유효한 형태의 데이터로 시작 가능.
    - Spring에서는 `@RequestBody`로 JSON을 DTO에 바인딩하고 `@Valid`로 제약 조건 검사. 검증 실패 시 일반적으로 400 응답으로 처리해 잘못된 입력과 서버 오류를 구분.
    - 이번 `BookRequest`의 `categoryId`에는 `@NotNull`, `title`에는 `@NotBlank`·`@Size(max = 100)` 적용. `BookController`의 `@Valid @RequestBody BookRequest`가 이 검증을 실행.
    - 단, Controller 검증은 주로 **입력 형식·기본 제약** 담당. “실제로 존재하는 카테고리인가?”, “제목이 이미 등록됐는가?” 같은 도메인·DB 상태 검사는 Service에서 처리.
    - **추가 핵심 정리**
        - 검증 계층 구분: DTO 제약(빈 제목 X) → Service의 비즈니스 규칙(카테고리 존재) → DB 제약(`UNIQUE` 등 최종 무결성). 서로 대체 관계가 아니라 보완 관계.
        - `existsByTitle`처럼 저장 전에 중복을 확인해도 동시 요청 사이의 경쟁 조건은 남음. 제목의 최종 중복 방지는 DB의 unique 제약이 담당하고, 제약 위반은 적절한 오류 응답으로 변환해야 함.
        - 값의 의미에 맞는 제약 선택 중요. `@NotNull`은 `null`만 막고, 문자열의 빈값·공백까지 막으려면 `@NotBlank` 사용.
    - **참고 자료**: Spring MVC @RequestBody와 검증 · Jakarta Bean Validation 명세
- **N+1 Query** — 관계 데이터를 함께 조회할 때 쿼리가 예상보다 많이 실행되는 이유는 무엇인가?
    - 목록을 조회하는 **1번의 쿼리** 뒤에, 각 결과의 연관 엔티티를 사용할 때 추가 조회가 반복되는 현상
      ex) 도서 목록 조회 후 도서마다 카테고리 이름 접근 → 카테고리 조회 쿼리 추가.
    - `LAZY`는 관계를 처음부터 모두 가져오지 않도록 할 뿐, 나중에 관계 필드에 접근하면 SQL이 필요할 수 있음. 반대로 `EAGER`로 바꾼다고 모든 목록 조회의 N+1이 해결되는 것도 X.
    - 이번 `BookService.getBooks()`는 도서 목록을 가져온 뒤 `BookResponse.from(book)`을 호출하고, 변환 과정에서 `book.getCategory().getName()`에 접근. 현재 `Book.category`가 `LAZY`라 목록 API의 N+1 점검 지점.
    - “항상 정확히 1+N번”은 아님. 같은 카테고리를 여러 도서가 공유하면 영속성 컨텍스트의 1차 캐시 등으로 추가 쿼리 수가 줄 수 있음. 실제 실행 SQL로 확인 필요.
    - **추가 핵심 정리**
        - 해결 방향: 필요한 관계를 한 번에 가져오는 **fetch join** 또는 `@EntityGraph`, 필요한 컬럼만 조회하는 **DTO projection**, 상황에 따른 batch fetching.
        - **JPQL 직접 조회 예시**

            ```java
            @Query("""
            				select b 
            				from book b 
            				join fetch b.category
            				order by b.bookId desc
            				""")
            List<Book> findAllWithCategory();
            ```

        - **일반 JOIN과 JOIN FETCH의 차이**: `JOIN b.category`는 조회 조건에 관계를 사용할 수 있지만 `b.category`의 로딩까지 보장하지는 않음. `JOIN FETCH b.category`는 연관 엔티티를 함께 로딩해, 이후 카테고리 이름에 접근할 때 개별 추가 조회를 피할 수 있음.
        - **필요한 필드만 조회할 때**: JPQL의 DTO 생성자 표현식(`SELECT new ...`)으로 도서 제목·카테고리 이름 등 응답에 필요한 값만 바로 조회하는 방법도 가능. 다만 DTO 생성자와 선택 필드가 일치해야 함.
        - 도서 → 카테고리 같은 다대일 관계의 fetch join은 유용하지만, 일대다 컬렉션을 여러 개 함께 가져오면 중복 행·페이징 문제를 검토해야 함. 무조건 모든 관계를 join하는 방식은 X.
        - 확인 방법: Hibernate SQL 로그/통계로 목록 건수를 바꾸어가며 쿼리 횟수 비교. 응답 시간이 느리다는 사실만으로 N+1이라고 단정하지 않기.
    - **참고 자료**: Hibernate User Guide: Fetching · Spring Data JPA EntityGraph
- **Migration과 synchronize** — 운영 환경에서 자동 스키마 변경이 위험한 이유는 무엇인가
    - **자동 스키마 동기화**: 실행 시 Entity 정의와 DB 스키마의 차이를 보고 변경을 적용. Spring/Hibernate의 `ddl-auto: update`, TypeORM의 `synchronize: true`가 예시.
    - 개발 초기에는 빠르지만, 운영 DB에는 이미 데이터와 다른 버전의 애플리케이션이 존재 가능. 컬럼 이름 변경을 삭제+추가로 해석하거나, 타입·제약 변경이 데이터와 충돌하면 유실·기동 실패·긴 잠금으로 이어질 수 있음.
    - **Migration**: “어떤 스키마 변경을 어떤 순서로 적용할지”를 버전 관리하는 파일/절차. 예: `V2__add_book_title_unique.sql`을 검토한 뒤 배포 시 실행. 팀원·환경마다 동일한 변경 이력 추적 가능.
    - 이번 실습 설정의 `ddl-auto: update`는 로컬에서 Entity 변경을 시험하는 데 사용 중. 실제 운영 설정은 별도로 관리하고, 변경 SQL을 검토·기록하는 migration 방식이 안전.
    - **추가 핵심 정리**
        - Spring에서는 Flyway/Liquibase 같은 도구 사용
        - 배포 전 확인: 기존 데이터가 새 제약을 만족하는지, 오래된 앱과 새 앱이 잠시 같이 동작해도 되는지, 대량 데이터 변경·인덱스 생성이 얼마나 걸리는지.
        - `ddl-auto: validate`는 Entity와 DB 스키마 불일치를 확인하는 용도이며 자동 변경은 하지 않음. DB 변경 주체를 migration 하나로 정하면 이력 추적과 재현이 쉬움.
    - **참고 자료**: Spring Boot DB 초기화