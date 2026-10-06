# 🎯 핵심 키워드

---

<aside>
💡

아래 키워드는 이번 주차의 핵심 개념이자, 다음 API 설계 단계에서 더 깊게 탐색해 볼 주제입니다. 공식 문서 우선으로 정의·동작·장단점을 정리해 보세요.

</aside>

- **JPA / Hibernate와 TypeORM** — ORM과 구현체·라이브러리의 역할은 어떻게 다른가?
    
    ### ORM이란?
    
    ORM(Object-Relational Mapping)은 객체와 관계형 데이터베이스의 테이블을 연결하는 기술이다. 개발자는 SQL을 일일이 작성하는 대신 객체와 메서드를 이용해 데이터를 저장하고 조회할 수 있다.
    
    ```
    Java·TypeScript 객체 ↔ ORM ↔ 데이터베이스 테이블
    ```
    
    예를 들어 `Member` 객체를 저장하면 ORM이 `INSERT` SQL을 생성해 데이터베이스에 전달한다.
    
    ---
    
    ### JPA
    
    JPA(Java Persistence API)는 Java에서 ORM을 사용하는 방법을 정해 놓은 **표준 명세**다.
    
    JPA는 `@Entity`, `EntityManager` 등의 규칙과 인터페이스를 정의하지만, 실제 SQL을 생성하거나 데이터베이스에 접근하는 기능을 직접 구현하지는 않는다.
    
    ```java
    @Entity
    public class Member {
    
        @Id
        @GeneratedValue
        private Long id;
    
        private String name;
    }
    ```
    
    즉, JPA는 ORM 구현체가 따라야 할 **사용법과 규칙**이다.
    
    ---
    
    ### Hibernate
    
    Hibernate는 JPA 명세를 실제로 구현한 **ORM 구현체**다. 엔티티 정보를 확인하고 SQL을 생성하며 데이터베이스와 통신한다.
    
    ```
    Spring Data JPA
    → JPA 표준 인터페이스
    → Hibernate
    → JDBC
    → Database
    ```
    
    Spring Boot에서 Spring Data JPA를 사용하면 기본적으로 Hibernate가 JPA 구현체로 사용된다.
    
    ```java
    memberRepository.save(member);
    ```
    
    위 코드를 실행하면 Hibernate가 상황에 맞는 `INSERT` 또는 `UPDATE` SQL을 생성한다.
    
    Hibernate는 JPA 기능뿐 아니라 자체 기능도 제공한다. 다만 Hibernate 전용 기능을 많이 사용하면 다른 JPA 구현체로 교체하기 어려워질 수 있다.
    
    ---
    
    ### TypeORM
    
    TypeORM은 TypeScript와 JavaScript 환경에서 사용하는 **ORM 라이브러리**다. 주로 Node.js와 NestJS에서 사용한다.
    
    ```java
    @Entity()
    export class Member {
      @PrimaryGeneratedColumn()
      id: number;
    
      @Column()
      name: string;
    }
    ```
    
    ```java
    await memberRepository.save(member);
    ```
    
    TypeORM은 JPA처럼 별도의 Java 표준 명세가 아니라, 엔티티 정의부터 SQL 생성과 데이터베이스 접근까지 직접 제공하는 하나의 라이브러리다.
    
    ---
    
    ### 비교
    
    | 구분 | JPA | Hibernate | TypeORM |
    | --- | --- | --- | --- |
    | 환경 | Java | Java | JavaScript·TypeScript |
    | 정체 | ORM 표준 명세 | JPA 구현체 | ORM 라이브러리 |
    | 직접 실행 기능 | 없음 | 있음 | 있음 |
    | 주요 역할 | ORM 사용 규칙 정의 | JPA 규칙을 실제로 구현 | ORM 기능 전체 제공 |
    | 주 사용 환경 | Spring Boot | Spring Boot | Node.js·NestJS |
    
    ### 정리
    
    ```
    ORM
    ├── Java
    │   ├── JPA: ORM 사용 방법을 정의한 표준
    │   └── Hibernate: JPA를 실제로 구현한 도구
    └── TypeScript
        └── TypeORM: ORM 기능을 제공하는 라이브러리
    ```
    
    따라서 **ORM은 객체와 테이블을 연결하는 기술 전체를 의미하고, JPA는 Java ORM의 표준, Hibernate는 그 표준을 구현한 구현체, TypeORM은 TypeScript 환경에서 ORM 기능을 제공하는 라이브러리**다.
    
- **Entity Lifecycle과 Persistence Context** — 엔티티를 저장할 때 즉시 SQL이 실행되지 않을 수 있는 이유는 무엇인가?
    
    JPA는 엔티티를 저장할 때 데이터베이스에 즉시 SQL을 보내는 대신, 엔티티를 먼저 **영속성 컨텍스트**에서 관리할 수 있다. 실제 SQL은 `flush`가 발생하는 시점에 데이터베이스로 전달된다.
    
    ```
    엔티티 저장
    → 영속성 컨텍스트에 등록
    → SQL을 쓰기 지연 저장소에 보관
    → flush
    → 데이터베이스에 SQL 실행
    ```
    
    ### 엔티티 생명주기
    
    | 상태 | 의미 |
    | --- | --- |
    | 비영속 | 영속성 컨텍스트와 관계없는 새 객체 |
    | 영속 | 영속성 컨텍스트가 관리하는 객체 |
    | 준영속 | 영속성 컨텍스트에서 분리된 객체 |
    | 삭제 | 삭제 대상으로 등록된 객체 |
    
    ```java
    Member member = new Member();  // 비영속
    
    entityManager.persist(member); // 영속
    ```
    
    `persist()`를 호출하면 객체가 바로 DB에 저장된다고 생각하기 쉽지만, 정확히는 엔티티가 영속 상태가 되고 `INSERT` 작업이 예약된다.
    
    ### 영속성 컨텍스트란?
    
    영속성 컨텍스트는 JPA가 엔티티를 관리하는 논리적인 공간이다. 엔티티의 현재 상태와 변경 내용을 추적하며 다음 기능을 제공한다.
    
    - 1차 캐시
    - 변경 감지
    - 동일성 보장
    - 지연 로딩
    - 쓰기 지연
    
    ### 쓰기 지연
    
    JPA는 `INSERT`, `UPDATE`, `DELETE` SQL을 모아 두었다가 `flush` 시점에 실행할 수 있다. 이를 **쓰기 지연**이라고 한다.
    
    ```java
    @Transactional
    public void createMember() {
        Member member = new Member("지은");
        entityManager.persist(member);
    
        // 아직 SQL이 실행되지 않을 수 있음
    }
    ```
    
    트랜잭션이 끝나기 직전에 `flush`가 실행되면서 SQL이 데이터베이스로 전달되고, 이후 `commit`으로 변경 사항이 확정된다.
    
    ```
    persist
    → SQL 예약
    → flush
    → SQL 실행
    → commit
    → 변경 확정
    ```
    
    ### flush가 발생하는 시점
    
    일반적으로 다음 상황에서 `flush`가 발생한다.
    
    - 트랜잭션을 커밋하기 직전
    - `entityManager.flush()`를 직접 호출할 때
    - JPQL 쿼리를 실행하기 전
    
    ```java
    entityManager.persist(member);
    entityManager.flush();
    ```
    
    `flush`는 SQL을 데이터베이스에 전달하는 작업이며 트랜잭션을 확정하는 `commit`과는 다르다. `flush` 후에도 트랜잭션이 롤백되면 변경 사항은 취소된다.
    
    ### 즉시 INSERT가 실행되는 경우
    
    기본키 생성 전략이 `IDENTITY`이면 데이터베이스가 기본키를 생성한다. JPA는 생성된 ID를 알아야 엔티티를 관리할 수 있으므로 `persist()` 시점에 `INSERT` SQL이 즉시 실행될 수 있다.
    
    ```java
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    ```
    
    따라서 엔티티 저장 시 SQL이 즉시 실행되지 않을 수 있는 이유는 **JPA가 영속성 컨텍스트에서 엔티티와 SQL을 관리하고, flush 시점까지 SQL 실행을 지연할 수 있기 때문**이다.
    
- **DTO와 API Contract** — Entity를 그대로 응답하면 어떤 문제가 생길까?
    
    Entity는 데이터베이스 테이블과 매핑하기 위한 객체이고, DTO는 API에서 주고받을 데이터의 형태를 정의하는 객체다. Entity를 그대로 응답하면 데이터베이스 구조와 API 명세가 직접 연결되어 여러 문제가 생길 수 있다.
    
    ### 1. 불필요하거나 민감한 정보가 노출될 수 있다
    
    Entity에는 API 사용자에게 보여 주면 안 되는 필드가 포함될 수 있다.
    
    ```java
    @Entity
    public class Member {
    
        @Id
        private Long id;
    
        private String email;
        private String password;
        private String name;
    }
    ```
    
    이 Entity를 그대로 반환하면 비밀번호처럼 민감한 정보가 응답에 포함될 위험이 있다.
    
    DTO에서는 응답에 필요한 필드만 선택한다.
    
    ```java
    public record MemberResponse(
        Long id,
        String name
    ) {
    }
    ```
    
    ### 2. 데이터베이스 변경이 API 응답에 영향을 준다
    
    Entity의 필드를 추가하거나 이름을 변경하면 API 응답 구조도 함께 바뀔 수 있다. 프론트엔드는 기존 응답 형식을 기준으로 동작하므로 예상치 못한 오류가 발생할 수 있다.
    
    ```
    Entity 변경
    → API 응답 변경
    → 프론트엔드 코드에 영향
    ```
    
    DTO를 사용하면 Entity가 변경되어도 API 응답 형식을 일정하게 유지할 수 있다.
    
    ### 3. API에 불필요한 데이터까지 전달될 수 있다
    
    Entity는 데이터베이스 저장을 위해 많은 필드를 가지지만, 화면에서는 일부 값만 필요할 수 있다.
    
    ```json
    {
      "id": 1,
      "title": "영화 제목",
      "createdAt": "...",
      "updatedAt": "...",
      "deletedAt": null,
      "internalStatus": "..."
    }
    ```
    
    DTO를 사용하면 화면에 필요한 값만 응답할 수 있다.
    
    ```json
    {
      "id": 1,
      "title": "영화 제목"
    }
    ```
    
    ### 4. 연관관계 때문에 순환 참조가 발생할 수 있다
    
    양방향 연관관계가 설정된 Entity를 JSON으로 변환하면 서로를 계속 참조하는 문제가 발생할 수 있다.
    
    ```
    Member → Orders → Member → Orders → ...
    ```
    
    이 경우 JSON 직렬화 오류나 무한 반복이 발생할 수 있다. DTO에서는 필요한 연관 데이터만 선택하여 순환 참조를 막을 수 있다.
    
    ### 5. 지연 로딩 문제가 발생할 수 있다
    
    Entity의 연관관계가 지연 로딩으로 설정되어 있으면 응답을 JSON으로 변환하는 과정에서 추가 SQL이 실행될 수 있다.
    
    ```
    Entity 조회
    → JSON 변환
    → 연관 Entity 접근
    → 추가 SELECT 실행
    ```
    
    여러 Entity에서 이런 조회가 반복되면 N+1 문제가 생길 수 있다. 영속성 컨텍스트가 종료된 후 접근하면 `LazyInitializationException`이 발생할 수도 있다.
    
    ### 6. 요청값으로 Entity를 직접 받으면 위험하다
    
    요청 데이터를 Entity에 바로 매핑하면 사용자가 수정하면 안 되는 필드까지 전달할 수 있다.
    
    ```json
    {
      "name": "지은",
      "role": "ADMIN"
    }
    ```
    
    요청 DTO를 사용하면 클라이언트가 입력할 수 있는 필드를 제한할 수 있다.
    
    ```java
    public record MemberCreateRequest(
        String name
    ) {
    }
    ```
    
    ### DTO와 API Contract
    
    API Contract는 클라이언트와 서버가 약속한 요청과 응답의 구조다. DTO는 이 계약을 코드로 표현한다.
    
    ```
    요청 DTO
    → 클라이언트가 보낼 수 있는 데이터 정의
    
    응답 DTO
    → 서버가 반환할 데이터 정의
    ```
    
    | 구분 | Entity | DTO |
    | --- | --- | --- |
    | 목적 | 데이터베이스 테이블 매핑 | API 요청·응답 정의 |
    | 변경 이유 | DB 구조나 비즈니스 로직 변경 | API 명세 변경 |
    | 포함 데이터 | 저장에 필요한 데이터 | 통신에 필요한 데이터 |
    | 외부 노출 | 직접 노출하지 않는 것이 좋음 | 외부 전달을 목적으로 사용 |
    
    따라서 Entity를 그대로 응답하지 않고 DTO로 변환하면 **민감한 정보의 노출을 막고, DB 구조와 API를 분리하며, 안정적인 API Contract를 유지할 수 있다.**
    
- **Validation** — 요청 검증을 Controller 단에서 수행해야 하는 이유는 무엇인가?
    
    Controller는 클라이언트의 요청이 애플리케이션 내부로 들어오는 입구다. 따라서 형식이 잘못되었거나 필수값이 빠진 요청은 Controller에서 먼저 검증하여 Service까지 전달되지 않게 하는 것이 좋다.
    
    ### 1. 잘못된 요청을 초기에 차단할 수 있다
    
    ```java
    public record MemberCreateRequest(
    
        @NotBlank
        String name,
    
        @Email
        String email,
    
        @Min(1)
        int age
    ) {
    }
    ```
    
    ```java
    @PostMapping("/members")
    public ResponseEntity<Void> createMember(
        @Valid @RequestBody MemberCreateRequest request
    ) {
        memberService.createMember(request);
        return ResponseEntity.ok().build();
    }
    ```
    
    `@Valid`를 사용하면 Controller 메서드가 실행되기 전에 요청 DTO의 제약 조건을 검사한다. 검증에 실패하면 Service 로직을 실행하지 않고 `400 Bad Request`를 반환할 수 있다.
    
    ### 2. 불필요한 비즈니스 로직과 DB 접근을 막을 수 있다
    
    이메일 형식이 틀렸거나 이름이 비어 있는 요청까지 Service와 Repository로 전달하면 불필요한 연산과 데이터베이스 접근이 발생할 수 있다.
    
    ```
    클라이언트 요청
    → Controller에서 형식 검증
    → 정상 요청만 Service로 전달
    → Repository와 DB 접근
    ```
    
    ### 3. Controller와 Service의 역할을 분리할 수 있다
    
    Controller는 HTTP 요청의 형식을 검증하고, Service는 비즈니스 규칙을 검사한다.
    
    | 검증 종류 | 담당 영역 | 예시 |
    | --- | --- | --- |
    | 요청 형식 검증 | Controller·DTO | 필수값, 문자열 길이, 이메일 형식 |
    | 비즈니스 규칙 검증 | Service | 이메일 중복, 잔액 부족, 대여 가능 여부 |
    | 데이터 무결성 검증 | Database | `NOT NULL`, `UNIQUE`, `FOREIGN KEY` |
    
    예를 들어 `@Email`로 이메일 형식을 검사하는 것은 요청 검증이고, 이미 가입된 이메일인지 확인하는 것은 DB 조회가 필요한 비즈니스 검증이다.
    
    ### 4. 일관된 오류 응답을 제공할 수 있다
    
    검증 오류를 전역 예외 처리기로 처리하면 모든 API에서 같은 형식의 오류 응답을 반환할 수 있다.
    
    ```java
    @RestControllerAdvice
    public class GlobalExceptionHandler {
    
        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<String> handleValidationException(
            MethodArgumentNotValidException exception
        ) {
            return ResponseEntity.badRequest()
                .body("요청값이 올바르지 않습니다.");
        }
    }
    ```
    
    ```json
    {
      "code": "INVALID_REQUEST",
      "message": "요청값이 올바르지 않습니다."
    }
    ```
    
    ### 주의할 점
    
    Controller에서 모든 검증을 처리하는 것은 아니다. 요청의 기본 형식은 Controller에서 검증하되, 핵심 비즈니스 규칙은 Service에서도 반드시 검증해야 한다.
    
    ```
    Controller
    → 요청값의 형식과 필수값 검증
    
    Service
    → 업무 규칙과 상태 검증
    
    Database
    → 최종 데이터 무결성 보장
    ```
    
    따라서 Controller 단에서 요청을 검증하는 이유는 **잘못된 입력을 애플리케이션 진입 시점에 차단하고, 불필요한 로직 실행을 막으며, 각 계층의 책임과 오류 응답을 명확하게 만들기 위해서다.**
    
- **N+1 Query** — 관계 데이터를 함께 조회할 때 쿼리가 예상보다 많이 실행되는 이유는 무엇인가?
    
    N+1 문제는 부모 엔티티 목록을 한 번의 쿼리로 조회한 뒤, 각 부모의 연관 데이터를 가져오기 위해 추가 쿼리가 반복해서 실행되는 문제다.
    
    ```
    부모 목록 조회 1번
    + 부모 N개의 연관 데이터 조회 N번
    = 총 N+1번의 쿼리
    ```
    
    ### 발생 예시
    
    영화와 카테고리가 다대일 관계라고 가정한다.
    
    ```java
    @Entity
    public class Movie {
    
        @Id
        private Long id;
    
        @ManyToOne(fetch = FetchType.LAZY)
        private Category category;
    }
    ```
    
    먼저 영화 10개를 조회한다.
    
    ```java
    List<Movie> movies = movieRepository.findAll();
    ```
    
    이때 영화만 조회하는 SQL이 한 번 실행된다.
    
    ```sql
    SELECT *
    FROM movie;
    ```
    
    이후 각 영화의 카테고리에 접근한다.
    
    ```java
    for (Movie movie : movies) {
        System.out.println(movie.getCategory().getName());
    }
    ```
    
    지연 로딩된 카테고리를 사용할 때마다 추가 쿼리가 실행될 수 있다.
    
    ```sql
    SELECT * FROM category WHERE category_id = 1;
    SELECT * FROM category WHERE category_id = 2;
    SELECT * FROM category WHERE category_id = 3;
    -- 반복
    ```
    
    영화 목록을 조회한 쿼리 1번과 영화별 카테고리를 조회하는 쿼리 N번이 실행되어 N+1 문제가 발생한다.
    
    ### 발생하는 이유
    
    JPA는 객체의 연관관계를 표현하지만, 처음 실행한 JPQL이 연관 엔티티까지 항상 한 번에 조회하는 것은 아니다.
    
    ```java
    movieRepository.findAll();
    ```
    
    기본 조회 쿼리가 `Movie`만 대상으로 하면 연관된 `Category`는 별도의 조회가 필요하다. 이후 코드에서 연관 객체를 사용할 때 JPA가 추가 SQL을 실행한다.
    
    N+1 문제는 지연 로딩에서 쉽게 발견되지만, 연관관계를 즉시 로딩으로 설정해도 조회 방식에 따라 발생할 수 있다. 따라서 단순히 `EAGER`로 변경하는 것은 확실한 해결 방법이 아니다.
    
    ### 해결 방법 1: Fetch Join
    
    JPQL의 `fetch join`을 사용해 연관 데이터를 한 번에 조회한다.
    
    ```java
    @Query("""
        SELECT m
        FROM Movie m
        JOIN FETCH m.category
        """)
    List<Movie> findAllWithCategory();
    ```
    
    실제로는 다음과 같은 JOIN SQL이 실행된다.
    
    ```sql
    SELECT m.*, c.*
    FROM movie m
    JOIN category c
        ON m.category_id = c.category_id;
    ```
    
    ### 해결 방법 2: EntityGraph
    
    조회할 때 함께 가져올 연관관계를 지정할 수 있다.
    
    ```java
    @EntityGraph(attributePaths = "category")
    List<Movie> findAll();
    ```
    
    ### 해결 방법 3: Batch Fetching
    
    연관 엔티티를 하나씩 조회하지 않고 여러 ID를 묶어서 조회한다.
    
    ```yaml
    spring:
      jpa:
        properties:
          hibernate:
            default_batch_fetch_size: 100
    ```
    
    ```sql
    SELECT *
    FROM category
    WHERE category_id IN (1, 2, 3, ...);
    ```
    
    쿼리를 반드시 한 번으로 만들지는 않지만 전체 쿼리 수를 줄일 수 있다.
    
    ### 해결 방법 4: DTO Projection
    
    화면에 필요한 데이터만 JOIN하여 DTO로 직접 조회한다.
    
    ```java
    @Query("""
        SELECT new com.example.MovieResponse(
            m.id,
            m.title,
            c.name
        )
        FROM Movie m
        JOIN m.category c
        """)
    List<MovieResponse> findMovieResponses();
    ```
    
    | 해결 방법 | 특징 |
    | --- | --- |
    | Fetch Join | 엔티티와 연관 데이터를 한 번에 조회 |
    | EntityGraph | Repository 메서드에서 함께 조회할 관계 지정 |
    | Batch Fetching | 여러 연관 데이터를 `IN` 쿼리로 묶어 조회 |
    | DTO Projection | 필요한 필드만 직접 조회 |
    
    따라서 N+1 문제는 **부모 목록을 조회한 후 각 부모의 연관 데이터를 개별적으로 조회하면서 발생한다.** 연관 데이터를 실제로 어떻게 사용할지에 따라 Fetch Join, EntityGraph, Batch Fetching 또는 DTO Projection을 선택해야 한다.
    
- **Migration과 synchronize** — 운영 환경에서 자동 스키마 변경이 위험한 이유는 무엇인가?
    
    `synchronize`는 Entity 정의와 데이터베이스 스키마를 비교하여 테이블과 컬럼을 자동으로 변경하는 기능이다. 개발 환경에서는 편리하지만, 운영 환경에서는 데이터 손실이나 서비스 장애로 이어질 수 있다.
    
    TypeORM에서는 다음과 같이 설정할 수 있다.
    
    ```tsx
    {
      synchronize: true
    }
    ```
    
    JPA/Hibernate의 다음 설정도 비슷한 위험이 있다.
    
    ```yaml
    spring:
      jpa:
        hibernate:
          ddl-auto: update
    ```
    
    ### 자동 스키마 변경의 위험
    
    #### 1. 데이터가 손실될 수 있다
    
    Entity에서 필드를 삭제하거나 타입을 변경하면 대응되는 컬럼이 삭제되거나 변경될 수 있다.
    
    ```tsx
    @Column()
    nickname: string;
    ```
    
    이 필드를 코드에서 제거한 후 자동 동기화가 실행되면 기존 데이터가 저장된 컬럼에 영향을 줄 수 있다.
    
    #### 2. 예상하지 못한 스키마가 만들어질 수 있다
    
    필드 이름을 변경했지만 ORM이 이를 이름 변경이 아닌 기존 컬럼 삭제와 새 컬럼 추가로 판단할 수 있다.
    
    ```
    nickname 컬럼 삭제
    → display_name 컬럼 추가
    → 기존 nickname 데이터 손실
    ```
    
    #### 3. 테이블 잠금과 서비스 지연이 발생할 수 있다
    
    데이터가 많은 테이블에서 컬럼이나 인덱스를 변경하면 작업 시간이 길어질 수 있다. 변경 중 테이블 잠금이 발생하면 정상적인 조회와 저장 요청이 대기하거나 실패할 수 있다.
    
    #### 4. 변경 내용을 사전에 검토하기 어렵다
    
    자동 동기화는 애플리케이션 실행 시 ORM이 변경 사항을 판단한다. 실제로 어떤 SQL이 실행될지 명확하게 검토하지 못한 상태에서 운영 DB가 변경될 수 있다.
    
    #### 5. 롤백이 어렵다
    
    자동 변경으로 문제가 발생해도 이전 스키마로 되돌릴 명확한 SQL이 준비되어 있지 않을 수 있다. 특히 컬럼이 삭제되어 데이터까지 사라지면 단순한 스키마 롤백으로 복구할 수 없다.
    
    #### 6. 여러 서버가 동시에 변경을 시도할 수 있다
    
    운영 환경에 여러 애플리케이션 인스턴스가 있다면 배포 과정에서 각 서버가 동시에 스키마 동기화를 시도할 수 있다. 이로 인해 충돌이나 배포 실패가 발생할 수 있다.
    
    ### Migration이란?
    
    Migration은 데이터베이스 스키마 변경 내용을 파일로 작성하고 버전별로 관리하는 방식이다.
    
    ```sql
    ALTER TABLE member
    ADD COLUMN nickname VARCHAR(30);
    ```
    
    ```
    V1__create_member.sql
    V2__add_member_nickname.sql
    V3__create_member_email_index.sql
    ```
    
    Migration을 사용하면 다음 내용을 확인할 수 있다.
    
    - 어떤 스키마가 변경되는지
    - 변경 순서가 무엇인지
    - 누가 어떤 변경을 추가했는지
    - 운영 DB에 어떤 변경이 적용됐는지
    - 문제가 생겼을 때 어떻게 복구할지
    
    Spring Boot에서는 주로 Flyway나 Liquibase를 사용하고, TypeORM에서는 TypeORM Migration을 사용할 수 있다.
    
    ### 환경별 권장 설정
    
    | 환경 | 권장 방식 |
    | --- | --- |
    | 로컬 개발 | `synchronize` 또는 `ddl-auto: update` 사용 가능 |
    | 테스트 | 테스트 목적에 따라 자동 생성 가능 |
    | 운영 | 자동 변경 비활성화 후 Migration 사용 |
    
    Spring Boot 운영 환경에서는 보통 다음처럼 설정한다.
    
    ```yaml
    spring:
      jpa:
        hibernate:
          ddl-auto: validate
    ```
    
    `validate`는 Entity와 DB 스키마가 맞는지 확인하지만 스키마를 자동으로 변경하지 않는다.
    
    TypeORM에서는 다음과 같이 자동 동기화를 끈다.
    
    ```tsx
    {
      synchronize: false,
      migrationsRun: true
    }
    ```
    
    따라서 운영 환경에서는 자동 스키마 변경보다 **검토하고 버전 관리할 수 있는 Migration을 사용해야 한다.** 자동 동기화는 편리하지만 변경 과정과 결과를 통제하기 어려워 데이터 손실, 테이블 잠금, 배포 실패가 발생할 수 있다.