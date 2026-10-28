- **JPA / Hibernate와 TypeORM** — ORM과 구현체·라이브러리의 역할은 어떻게 다른가?

  **-ORM**은 객체와 관계형 데이터베이스의 테이블을 매핑해주는 개념이다. 객체 그래프와 관계형 테이블 사이의 불일치(상속, 연관관계, 식별자, 그래프 탐색 방식의 차이)를 매핑 규칙으로 메우는 기법 전반을 가르킨다.

  ```jsx
  // DB에 이런 테이블이 정의되어 있다고 했을 때
  USER
  ----------------
  id
  name
  email

  // 애플리케이션에서 이를 객체로 다루는 것이다.
  class User {
      Long id;
      String name;
      String email;
  }

  // 이런 SQL문을 직접 작성하는 대신
  SELECT id, name, email
  FROM user
  WHERE id = 1;

  // 객체 중심으로 데이터를 조회할 수 있다.
  User user = entityManager.find(User.class, 1L);

  ```

  \-여기서 JPA 자체가 DB와 직접 통신하는 ORM은 아니다. JPA는 Java Persistence API라는 표준규격이다. `EntityManager`, `@Entity`, `@OneToMany` 와 같이 인터페이스와 어노테이션, 동작 규칙만 정의한 명세이다. 여기서 명세 자체에는 SQL을 생성하는 코드가 없다. 실제로 SQL을 만들고 실행하는 쪽은 Hibernate같은 구현체이다. (**실제 SQL 생성 및 ORM 동작은 Hibernate가 담당)**

  JPA ├─ EntityManager ├─ @Entity ├─ @Id ├─ JPQL └─ 표준 규칙 ↓ Hibernate ├─ SQL 생성 ├─ 객체 상태 관리 ├─ Dirty Checking ├─ 1차 캐시 ├─ Lazy Loading └─ DB와 실제 통신

  \-TypeScript/Node.js의 **TypeORM**은 이러한 분리 없이 JPA와 Hibernate를 합쳐 놓은 것과 가까운 역할을 한다. → TypeORM을 쓴다는 것은 곧 그 구현을 쓴다는 뜻

  TypeORM에는 Entity 정의부터 Repository, QueryBuilder, 관계 매핑 등의 ORM 기능이 들어 있다.

  | 구분        | JPA                   | Hibernate              | Spring Data JPA   | TypeORM                   |
  | ----------- | --------------------- | ---------------------- | ----------------- | ------------------------- |
  | 성격        | 표준 명세             | JPA 구현체             | 편의 추상화 계층  | 단일 라이브러리           |
  | SQL 생성    | 하지 않음             | 함                     | Hibernate에 위임  | 함                        |
  | 교체 가능성 | 구현체를 바꿀 수 있음 | 고유 기능 사용 시 종속 | JPA 구현체에 의존 | 교체하려면 코드 전면 수정 |

- **Entity Lifecycle과 Persistence Context** — 엔티티를 저장할 때 즉시 SQL이 실행되지 않을 수 있는 이유는 무엇인가?

  JPA 엔티티는 네 가지 상태를 가진다. 1. new(아직 JPA가 관리하지 않는 일반 JAVA객체)로 방금 만든 비영속, 2. persist() 이후 영속성 컨텍스트가 관리하는 영속, 3. 컨텍스트에서 떨어져나온 준영속, 4. 삭제 예약된 삭제 상태이다.

  ```jsx
            persist()
     NEW ───────────────→ MANAGED
                             │
                             │ flush / transaction commit
                             ↓
                           DB 반영

  MANAGED ── detach() ──→ DETACHED
     │
     └──── remove() ────→ REMOVED


     entityManager.persist(user); // user가 Persistence Context의 관리 대상이 됨

  	// persist()의 핵심 역할은 엔티티를 Persistence Context에 등록하는 것이다.
  ```

  Persist Context란 JPA가 엔티티를 관리하는 메모리상 작업 공간이다. `persist()`를 호출하면 엔티티는 이 공간에 등록되고, INSERT 문은 쓰기 지연 저장소에 쌓일 뿐 아직 DB로 가지 않는다. 실제 전송은 flush 시점에 일어난다.

  persist() → Persistence Context에 등록 → 엔티티 상태 추적 → flush() → SQL 생성 및 DB 전송

  왜 굳이 SQL 실행을 늦추는가?

  ```jsx
  User user = new User();
  user.setName("Kim");

  entityManager.persist(user);

  user.setName("Lee");

  ```

  다음과 같은 코드 있다고 했을 때 만약 \*\*`persist()`\*\*할 때마다 즉시 SQL을 실행한다면

  ```jsx
  INSERT INTO user (name)
  VALUES ('Kim');

  UPDATE user
  SET name = 'Lee'
  WHERE id = 1;
  // 불필요하게 INSERT -> UPDATE 두 번 실행
  ```

  가 될 수 있다. 하지만 JPA는 Persistence Context에서 최종 상태를 관리하다가 flush할 수 있다.

  persist() → name = “Kim” → user.setName(”Lee”) → name = “Lee” → flush() → DB 반영

  즉 중간 상태인 Kim을 굳이 DB에 반영하지 않는다.

  핵심은 늦춘다가 아니라 모아서 처리한다.

- **DTO와 API Contract** — Entity를 그대로 응답하면 어떤 문제가 생길까?

  Entity는 데이터베이스 스키마의 표현이고, API 응답은 클라이언트와의 계약이다. 둘을 하나의 클래스로 겸하면 서로 다른 이유로 바뀌어야 할 것들이 묶여 버린다.

  예를 들어

  ```jsx
  @Entity
  public class User {

      @Id
      private Long id;

      private String email;
      private String password;

      private String name;

      @ManyToOne
      private Team team;
  }
  ```

  이걸 컨트롤러에서 그대로 반환하면

  ```jsx
  @GetMapping("/users/{id}")
  public User getUser(@PathVariable Long id) {
      return userService.findById(id);
  }
  ```

  1. Entity에 `password`, `refreshToken`, 내부용 상태값 등이 존재한다면 API 응답에 포함될 수 있어 보안 문제가 발생한다.
  2. Entity를 그대로 반환하면 사실상 Entity 구조 = API 응답 구조가 되어 ntity의 필드명을 변경하면 DB나 도메인 모델 변경 때문에 API 응답까지 바뀔 수 있다.
  3. 양방향 연관관계를 직렬화하면 서로를 끊임없이 따라 순환참조 문제가 발생한다.

  ```jsx
  class User {
      @ManyToOne
      Team team;
  }

  class Team {
      @OneToMany(mappedBy = "team")
      List<User> users;
  }

  // User → Team → Users → Team → Users...
  ```

  1. 같은 User라도 API마다 필요한 정보가 다르지만 Entity 하나를 그대로 반환하면 API별 표현을 Entity에 맞추게 되는 이상한 구조가 된다.

  → DTO를 두면 응답에 무엇이 나가는지가 코드에 명시적으로 드러나고, 조회 쿼리도 DTO에 필요한 컬럼만 가져오도록 최적화할 수 있다.

  **DTO**(\*\*Data Transfer Object)\*\*는 데이터를 전달하기 위한 객체이다. 즉 DTO를 사용하면 외부의 어떤 데이터를 어떤 형태로 공개할 것인가를 분리할 수 있다.

  **DB의 데이터를 API가 바로 노출하지 않고, 각 계층의 역할에 맞게 변환해서 전달**

  DB → Entity → Service/Domain → DTO(DTO는 외부와 약속한 API 형태) → API Client
  - **DB**: 실제 데이터가 저장되어 있는 곳
    - 예: `users` 테이블에 `id`, `email`, `password` 등이 저장됨
  - **Entity**: DB 데이터를 애플리케이션에서 다루기 위한 객체
    - 예: `User` 객체
    - JPA를 사용한다면 \*\*`@Entity`\*\*가 붙은 클래스
  - **Service / Domain**: 비즈니스 로직을 처리하는 영역
    - 예: "탈퇴한 사용자는 조회하지 않는다", "이 사용자의 주문 목록을 가져온다" 등
  - **DTO**: API로 **어떤 데이터를 외부에 보여줄지** 정의하는 객체
    - Entity의 모든 데이터를 그대로 노출하지 않고 필요한 데이터만 선택
    - 예: `UserResponse(id, name, email)`
  - **API Client**: API를 사용하는 쪽
    - 프론트엔드, 모바일 앱, 다른 서버 등이 해당

- **Validation** — 요청 검증을 Controller 단에서 수행해야 하는 이유는 무엇인가?

  Controller에서는 필수값 누락, 문자열 길이, 이메일 형식, 숫자 범위처럼 요청 자체만 보고 판단할 수 있는 것을 검사한다. 핵심은 Controller는 외부에서 들어오는 요청을 가장 먼저 받는 경계라는 것이다. (모든 검증을 Controller에서 한다는 의미는 아님)
  - 잘못된 요청을 서비스에 전달하지 않기 위해
    - Service는 정상적인 입력을 받는다고 가정하고 비즈니스 로직에 집중할 수 있다.
  - 외부 입력과 내부 로직을 분리하기 위해
    - HTTP 요청의 형식 검증은 Controller 계층의 책임이다.
    - 예: `@NotBlank`, `@Email`, `@Size`
  - 공통적인 검증을 일관되게 처리하기 위해
    - 여러 API에서 동일한 DTO 검증 방식을 사용할 수 있다.

  Client → Controller(요청 형식/입력값 검증) → Service(비지니스 로직) →Repository

- **N+1 Query** — 관계 데이터를 함께 조회할 때 쿼리가 예상보다 많이 실행되는 이유는 무엇인가?

  N+1 Query는 처음에 1번 조회했는데 연관 데이터를 가져오면서 추가 쿼리를 발생시키는 문제이다.

  ```jsx
  List<User> users = userRepository.findAll();

  // 처음에는 사용자 전체를 가져오기 위해 1번 실행
  SELECT * FROM users;

  // 그러나 각 User의 Team을 조회한다면
  for (User user : users) {
      user.getTeam().getName();
  }

  /* User가 100명이라면 Team을 가져오기 위해 추가로 쿼리 실행
  1번  → 모든 User 조회
  100번 → 각 User의 Team 조회
  -----------------------
  총 101번 */
  ```

  User 100명 조회 → SELECT users (1번) → 각 User의 Team 접근 → SELECT team ... (N번)

  처음 User를 조회할 때 Team까지 가져오지 않고 getTeam()을 호출해야 그때 Team 조회 쿼리가 발생하면서 N + 1 문제가 생긴다.

  결국 JPA에서는 연관관계가 있다고 해서 항상 한 번에 조회되는 것은 아니다.

- **Migration과 synchronize** — 운영 환경에서 자동 스키마 변경이 위험한 이유는 무엇인가?

  핵심은 운영 DB의 스키마 변경은 데이터와 서비스에 직접 영향을 주기 때문이다.

  private String name; 을 private String username; 으로 변경했다고 했을 때 자동동기화를 사용하면 이를 보고 DB의 `name` 컬럼을 삭제하고 \*\*`username`\*\*을 만들려고 할 수 있다. 문제는 기존 데이터가 어떻게 처리될지 통제하기 어렵다는 것이다. 또한 운영 환경에서는
  - 데이터가 많아서 스키마 변경이 오래 걸릴 수 있고
  - 테이블 Lock이 발생할 수 있고
  - 잘못된 변경으로 데이터가 손실될 수 있고
  - 배포 시점에 예상하지 못한 DB 변경이 발생할 수 있다.

  그래서 일반적으로 다음과 같이 관리한다.

  ```jsx
  개발 환경
  Entity → 자동 Synchronize 가능

  운영 환경
  Entity 변경
     ↓
  Migration 파일 작성
     ↓
  검토 / 테스트
     ↓
  운영 DB에 명시적으로 적용

  ```

  - **Migration :** 개발자가 변경 내용을 명시적으로 작성하고 순서대로 DB에 적용
  - **synchronize** : Entity와 DB 구조를 비교해서 ORM이 DB 스키마를 자동으로 변경

  즉 Synchronize는 "현재 Entity와 DB를 맞춰줘"이고, Migration은 "이 변경을 이 순서대로 적용해줘" 이다.

  운영에서는 DB 변경을 예측 가능하고 되돌릴 수 있게 관리하는 것이 중요하기 때문에 Migration을 사용한다.
