- 3계층 아키텍처 이외에 어떤 아키텍처들이 있을까?
    
    ### 3계층 아키텍처
    
    Spring Boot에서 가장 흔하게 사용하는 구조로, 애플리케이션을 역할에 따라 세 계층으로 나눈다.
    
    ```
    Controller → Service → Repository → Database
    ```
    
    - **Controller**: HTTP 요청을 받고 응답을 반환한다.
    - **Service**: 핵심 비즈니스 로직을 처리한다.
    - **Repository**: 데이터베이스에 접근한다.
    
    구조가 단순하고 이해하기 쉽지만, 규모가 커지면 계층 간 의존성이 복잡해지거나 비즈니스 로직이 Service에 몰릴 수 있다.
    
    ### 계층형 아키텍처
    
    애플리케이션을 여러 수평 계층으로 분리하는 방식이다. 3계층 아키텍처도 계층형 아키텍처의 한 종류다.
    
    ```
    Presentation
    → Application
    → Domain
    → Infrastructure
    ```
    
    각 계층은 일반적으로 바로 아래 계층에 의존한다. 역할이 명확하지만, 하위 계층에 대한 의존성이 강해질 수 있다.
    
    ### MVC 아키텍처
    
    화면과 요청 처리를 Model, View, Controller로 나누는 구조다.
    
    - **Model**: 데이터와 비즈니스 로직
    - **View**: 사용자에게 보여줄 화면
    - **Controller**: 요청을 받아 Model과 View를 연결
    
    Spring MVC에서는 `@Controller`가 요청을 처리하고 Thymeleaf나 JSP가 View를 담당한다. REST API에서는 View 대신 JSON 응답을 반환한다.
    
    ### 헥사고날 아키텍처
    
    비즈니스 로직을 중심에 두고 데이터베이스, 웹, 외부 API 같은 기술 요소를 바깥으로 분리하는 구조다. 포트와 어댑터 아키텍처라고도 한다.
    
    ```
    웹 요청 → 입력 어댑터 → 포트 → 비즈니스 로직
    데이터베이스 ← 출력 어댑터 ← 포트 ← 비즈니스 로직
    ```
    
    핵심 로직이 JPA나 외부 API에 직접 의존하지 않아 테스트와 기술 교체가 쉽다. 대신 클래스와 인터페이스 수가 많아져 작은 프로젝트에는 복잡할 수 있다.
    
    ### 클린 아키텍처
    
    비즈니스 규칙을 중심에 두고 외부 기술이 안쪽 영역에 영향을 주지 않도록 의존성 방향을 관리한다.
    
    ```
    Framework → Interface Adapter → Use Case → Entity
    ```
    
    안쪽 계층은 바깥쪽 계층을 알지 못한다. 핵심 로직을 프레임워크와 분리할 수 있지만 초기 설계 비용이 크다.
    
    ### 마이크로서비스 아키텍처
    
    하나의 큰 서비스를 회원, 결제, 주문처럼 작은 서비스로 분리하여 각각 독립적으로 개발하고 배포하는 방식이다.
    
    서비스별로 확장하고 배포할 수 있지만, 네트워크 통신, 분산 트랜잭션, 장애 대응, 로그 추적 등 운영 복잡도가 커진다.
    
    > 3계층·헥사고날·클린 아키텍처는 주로 한 애플리케이션 내부 구조를 설명하고, 모놀리식·마이크로서비스는 시스템을 어떤 단위로 나누고 배포하는지를 설명한다.
    > 
- SQL Injection을 포함한 대표적인 웹 보안 공격 기법
    
    ### SQL Injection
    
    사용자 입력값을 SQL에 직접 연결할 때 공격자가 SQL 구문을 삽입하는 공격이다.
    
    ```java
    String sql =
        "SELECT * FROM member WHERE email = '" + email + "'";
    ```
    
    공격자가 다음과 같은 값을 입력할 수 있다.
    
    ```
    ' OR '1'='1
    ```
    
    그러면 조건이 항상 참이 되어 의도하지 않은 데이터가 조회될 수 있다.
    
    문자열 연결 대신 파라미터 바인딩을 사용해야 한다.
    
    ```java
    String sql = "SELECT * FROM member WHERE email = ?";
    
    Member member = jdbcTemplate.queryForObject(
        sql,
        memberRowMapper,
        email
    );
    ```
    
    JPA의 파라미터 바인딩도 사용할 수 있다.
    
    ```java
    @Query("SELECT m FROM Member m WHERE m.email = :email")
    Optional<Member> findByEmail(@Param("email") String email);
    ```
    
    다만 JPA를 사용하더라도 사용자 입력으로 쿼리 문자열을 직접 조합하면 안전하지 않다.
    
    ### XSS
    
    공격자가 게시글이나 입력창에 악성 JavaScript를 삽입하여 다른 사용자의 브라우저에서 실행되게 하는 공격이다.
    
    ```html
    <script>
      alert(document.cookie);
    </script>
    ```
    
    출력값을 HTML에 그대로 넣지 않고 이스케이프해야 한다. 쿠키에는 `HttpOnly`를 설정하고 CSP도 적용할 수 있다.
    
    ### CSRF
    
    로그인된 사용자의 권한을 이용해 공격자가 원하지 않는 요청을 보내게 하는 공격이다. 예를 들어 사용자가 로그인한 상태에서 악성 페이지를 열었을 때 계좌 이체 요청이 전송되는 경우다.
    
    CSRF 토큰과 `SameSite` 쿠키를 사용할 수 있으며, 상태를 변경하는 요청에 GET을 사용하면 안 된다.
    
    ### 인증·인가 취약점
    
    - **인증**: 사용자가 누구인지 확인
    - **인가**: 해당 사용자가 요청한 기능을 사용할 권한이 있는지 확인
    
    로그인만 확인하고 자원의 소유권을 확인하지 않으면 다른 사용자의 데이터를 조회하거나 수정할 수 있다.
    
    ```
    GET /members/10/orders
    ```
    
    URL의 회원 번호만 믿지 말고 현재 로그인한 사용자가 해당 정보에 접근할 권한이 있는지 서버에서 확인해야 한다.
    
    ### 무차별 대입 공격
    
    비밀번호나 인증 코드를 반복해서 입력하여 값을 알아내는 공격이다. 요청 횟수 제한, 로그인 실패 잠금, 추가 인증 등을 적용할 수 있다.
    
    ### 파일 업로드 공격
    
    실행 파일이나 악성 스크립트를 업로드하여 서버에서 실행시키는 공격이다. 확장자만 확인하지 말고 MIME 타입과 실제 파일 내용을 검사하고, 파일명도 서버에서 새로 생성해야 한다
    
- 커넥션 풀(Connection Pool)이란?
    
    ### 커넥션 풀(Connection Pool)
    
    데이터베이스 연결을 미리 여러 개 만들어 두고 재사용하는 구조다.
    
    DB 연결은 다음 과정을 거치므로 비용이 크다.
    
    ```
    DB 연결 생성
    → 인증
    → SQL 실행
    → 연결 종료
    ```
    
    요청마다 연결을 새로 생성하고 종료하면 시간이 오래 걸린다. 커넥션 풀을 사용하면 미리 생성된 연결을 빌려 쓰고 반납한다.
    
    ```
    서버 시작
    → DB 연결 여러 개 생성
    → 요청이 연결을 빌림
    → SQL 실행
    → 연결을 풀에 반납
    ```
    
    Spring Boot에서는 일반적으로 **HikariCP**가 기본 커넥션 풀로 사용된다.
    
    ```
    요청 → HikariCP에서 Connection 대여
         → SQL 실행
         → Connection 반납
    ```
    
    ```yaml
    spring:
      datasource:
        hikari:
          maximum-pool-size: 10
          minimum-idle: 5
          connection-timeout: 30000
    ```
    
    - `maximum-pool-size`: 풀에서 관리할 수 있는 최대 커넥션 수
    - `minimum-idle`: 최소로 유지할 유휴 커넥션 수
    - `connection-timeout`: 커넥션을 기다릴 최대 시간
    
    커넥션 수가 너무 적으면 요청이 대기하고, 너무 많으면 DB가 감당해야 하는 연결과 작업이 늘어난다. 따라서 애플리케이션 서버 수와 DB의 최대 연결 수를 함께 고려해야 한다.
    
- Raw SQL vs ORM
    
    ### Raw SQL
    
    개발자가 SQL을 직접 작성하여 데이터베이스를 다루는 방식이다. Spring에서는 JDBC 또는 `JdbcTemplate`으로 사용할 수 있다.
    
    ```java
    String sql = """
        SELECT member_id, name
        FROM member
        WHERE member_id = ?
        """;
    
    Member member = jdbcTemplate.queryForObject(
        sql,
        memberRowMapper,
        memberId
    );
    ```
    
    #### 장점
    
    - 실행되는 SQL을 명확하게 알 수 있다.
    - 복잡한 조회와 집계 쿼리를 세밀하게 최적화할 수 있다.
    - DB 고유 기능을 직접 사용할 수 있다.
    
    #### 단점
    
    - 반복되는 SQL과 데이터 변환 코드가 많다.
    - 테이블 구조가 변경되면 관련 SQL을 직접 수정해야 한다.
    - DB 종류에 따라 SQL 문법이 달라질 수 있다.
    
    ### ORM
    
    객체와 관계형 데이터베이스 테이블을 연결하여 객체 중심으로 데이터를 다루는 방식이다. Java에서는 JPA가 ORM 표준이고 Hibernate가 대표적인 구현체다.
    
    ```java
    @Entity
    public class Member {
    
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
    
        private String name;
    }
    ```
    
    ```java
    Member member = memberRepository.findById(memberId)
        .orElseThrow();
    ```
    
    #### 장점
    
    - 기본적인 CRUD SQL을 직접 작성하지 않아도 된다.
    - 객체와 연관관계를 중심으로 코드를 작성할 수 있다.
    - 반복되는 데이터 접근 코드가 줄어든다.
    
    #### 단점
    
    - ORM의 동작 방식을 모르면 예상하지 못한 SQL이 실행될 수 있다.
    - N+1 문제나 불필요한 조회가 발생할 수 있다.
    - 복잡한 통계와 집계 쿼리는 표현하거나 최적화하기 어려울 수 있다.
    
    ### 비교
    
    | 구분 | Raw SQL | ORM |
    | --- | --- | --- |
    | 작성 방식 | SQL 직접 작성 | 객체와 메서드 중심 |
    | SQL 제어 | 높음 | 상대적으로 낮음 |
    | 반복 코드 | 많음 | 적음 |
    | 복잡한 조회 | 유리 | 경우에 따라 복잡 |
    | 학습 대상 | SQL과 JDBC | JPA와 영속성 컨텍스트 |
    | 성능 확인 | 비교적 명확 | 생성된 SQL 확인 필요 |
    
    실무에서는 둘 중 하나만 사용하는 것이 아니라, 일반적인 CRUD는 ORM으로 처리하고 복잡한 통계나 성능이 중요한 조회는 직접 SQL을 작성하거나 QueryDSL 등을 함께 사용하기도 한다.
    
- INSERT 외에 데이터를 다루는 핵심 SQL 문법
    
    데이터를 직접 다루는 핵심 DML은 `SELECT`, `INSERT`, `UPDATE`, `DELETE`다.
    
    ### SELECT
    
    저장된 데이터를 조회한다.
    
    ```sql
    SELECT member_id, name
    FROM member
    WHERE status = 'ACTIVE'
    ORDER BY member_id DESC;
    ```
    
    ### UPDATE
    
    기존 데이터를 수정한다.
    
    ```sql
    UPDATE member
    SET name = '새 이름'
    WHERE member_id = 1;
    ```
    
    `WHERE`가 없으면 모든 행이 수정되므로 주의해야 한다.
    
    ```sql
    UPDATE member
    SET status = 'INACTIVE';
    ```
    
    ### DELETE
    
    기존 데이터를 삭제한다.
    
    ```sql
    DELETE FROM member
    WHERE member_id = 1;
    ```
    
    `WHERE`가 없으면 모든 행이 삭제된다.
    
    ```sql
    DELETE FROM member;
    ```
    
    ### UPSERT
    
    데이터가 없으면 삽입하고, 이미 존재하면 수정하는 방식이다. SQL 표준 명령어 하나를 뜻한다기보다 이러한 처리 방식을 부르는 이름이다.
    
    MySQL에서는 다음과 같이 작성할 수 있다.
    
    ```sql
    INSERT INTO member (member_id, name)
    VALUES (1, '진진')
    ON DUPLICATE KEY UPDATE
        name = VALUES(name);
    ```
    
    ### 트랜잭션 관련 문법
    
    여러 SQL을 하나의 작업으로 처리할 때 사용한다.
    
    ```sql
    START TRANSACTION;
    
    UPDATE wallet
    SET balance = balance - 10000
    WHERE wallet_id = 1;
    
    UPDATE wallet
    SET balance = balance + 10000
    WHERE wallet_id = 2;
    
    COMMIT;
    ```
    
    중간에 문제가 발생하면 변경 내용을 취소한다.
    
    ```sql
    ROLLBACK;
    ```
    
    정리하면 다음과 같다.
    
    | 명령어 | 역할 |
    | --- | --- |
    | `SELECT` | 데이터 조회 |
    | `INSERT` | 데이터 추가 |
    | `UPDATE` | 데이터 수정 |
    | `DELETE` | 데이터 삭제 |
    | `COMMIT` | 트랜잭션 변경 확정 |
    | `ROLLBACK` | 트랜잭션 변경 취소 |