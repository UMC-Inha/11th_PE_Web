- 3계층 아키텍처 이외에 어떤 아키텍처들이 있을까?

  **아키텍처 구조**

    - 시스템을 어떤 단위로 나누고, 각 단위가 무엇에 의존하며 어떻게 협력하는지 정하는 설계 방식
    - 3계층 아키텍처는 Controller → Service → Repository처럼 **역할에 따라 코드의 책임을 나누는 방식**. 다른 아키텍처와 무조건 대립하는 개념 X

  **코드의 의존성을 나누는 방식**

    - **클린 아키텍처 / 헥사고날 아키텍처(Ports & Adapters)**
        - 핵심 비즈니스 규칙을 안쪽에 두고 DB, 웹 프레임워크 같은 기술은 바깥쪽에 둠
        - 안쪽 코드는 DB 구현체를 직접 알지 않고 인터페이스(Port)에 의존. MySQL용 Repository, 테스트용 가짜 Repository가 그 인터페이스를 구현하는 Adapter 역할
        - 장점: 기술 교체·단위 테스트 용이. 단점: 작은 CRUD 프로젝트에서는 인터페이스·계층 추가 비용 증가 가능
        - 3계층 구조에서도 Repository를 인터페이스로 분리하고 의존성 방향을 조정하면 함께 적용 가능

  **배포 단위를 나누는 방식**

    - **모놀리식 아키텍처**
        - 여러 기능을 하나의 애플리케이션으로 빌드·배포. 현재의 작은 Spring 실습 프로젝트가 여기에 가까움
        - 장점: 개발·배포·테스트 흐름이 단순하고 기능 간 호출이 빠름
        - 단점: 규모가 커지면 변경 영향 범위가 넓어지고, 일부 기능만 따로 배포·확장하기 어려움
    - **마이크로서비스 아키텍처(MSA)**
        - 사용자, 도서, 대여처럼 독립적인 업무 기능을 별도 서비스로 나눠 배포
        - 장점: 서비스별 독립 배포·확장, 장애 범위 분리
        - 단점: 서비스 간 통신·데이터 일관성·운영·관측 복잡도 증가. 테이블 분리만으로는 MSA X

  **통신 방식을 나누는 방식**

    - **이벤트 기반 아키텍처(EDA)**
        - 대여 완료 같은 사건을 발행하면 알림·통계 등이 이벤트를 받아 각자 처리
        - 발행자와 수신자를 느슨하게 연결할 수 있지만, 처리 순서·중복·실패 재시도와 최종적 일관성 고려 필요

  **정리**

    - ‘3계층 vs MSA’는 같은 기준의 양자택일 X. 하나의 모놀리식 서비스 내부에 3계층이나 헥사고날 구조 적용 가능, 일부 작업은 이벤트로 처리 가능
    - 구조가 복잡할수록 무조건 좋은 것은 아니며, 현재 규모와 변경 가능성에 맞춘 선택 필요

  **참고자료**

    - Microsoft Learn - 일반적인 웹 애플리케이션 아키텍처
    - Microsoft Learn - 아키텍처 스타일 비교
    - Alistair Cockburn - 헥사고날 아키텍처 원문
- SQL Injection을 포함한 대표적인 웹 보안 공격 기법

  **SQL Injection(SQL 삽입)**

    - 사용자 입력을 SQL 문자열에 그대로 이어 붙일 때, 입력값이 데이터가 아니라 쿼리의 일부로 해석되는 취약점
    - 예: `"SELECT * FROM users WHERE id = " + userInput`처럼 만들면 공격자가 조건을 바꾸거나 의도하지 않은 쿼리 실행을 유도 가능
    - 방어: SQL 구조를 먼저 고정하고 `?` 바인딩/Prepared Statement 사용. 테이블·컬럼명처럼 바인딩할 수 없는 부분은 허용 목록으로 제한. DB 계정 권한도 최소화
    - 이번 실습의 `findAllByCategory`는 `?` 자리에 `categoryId`를 바인딩. Raw SQL 자체가 문제 X, **입력을 쿼리 문자열에 결합하는 방식**이 위험

  **XSS(Cross-Site Scripting)**

    - 악성 스크립트가 포함된 값을 페이지에 그대로 출력해 다른 사용자의 브라우저에서 실행되게 하는 공격
    - 예: 책 설명에 입력된 HTML/스크립트를 화면에서 검증 없이 렌더링
    - 방어: 출력 위치(HTML 본문·속성·URL 등)에 맞는 인코딩, 프레임워크의 기본 이스케이프 활용, 위험한 HTML 삽입 API 주의
    - SQL 바인딩은 DB 보호 방법, XSS 방어 X

  **CSRF(Cross-Site Request Forgery)**

    - 로그인한 사용자의 브라우저가 악성 사이트의 요청을 보내게 만들어, 사용자 의도와 무관한 상태 변경을 일으키는 공격
    - 브라우저가 인증 쿠키를 자동 전송하는 환경에서 특히 문제. 공격자는 쿠키 내용을 몰라도 요청 유도 가능
    - 방어: CSRF 토큰, Origin/Fetch Metadata 검사, SameSite 쿠키 등을 인증 방식과 배포 환경에 맞게 적용. SameSite만으로 모든 경우가 해결되지는 않음

  **IDOR / 객체 수준 인가 누락**

    - URL의 ID만 바꿔 타인의 데이터에 접근하거나 수정할 수 있는 취약점
    - 예: `PATCH /rentals/2/return`에서 로그인한 사용자가 2번 대여의 소유자인지 확인하지 않으면 다른 사람의 대여도 반납 처리 가능
    - 방어: ‘로그인했는가’에 더해 **이 사용자가 이 객체를 조작할 권한이 있는가**를 매 요청마다 확인. UUID로 ID를 숨기는 것만으로는 충분하지 않음

  **참고자료**

    - OWASP - SQL Injection Prevention
    - OWASP - XSS Prevention
    - OWASP - CSRF Prevention
    - OWASP - IDOR Prevention
- 커넥션 풀(Connection Pool)이란?

  **커넥션 풀**

    - DB 연결(Connection)을 일정 수 보관하고, 요청마다 빌려 쓰고 반납하도록 관리하는 방식
    - 연결을 매번 새로 만들면 인증·네트워크 연결 비용 발생 → 연결 재사용으로 반복 비용 감소
    - 흐름: 요청 → 풀에서 유휴 연결 대여 → SQL 실행 → 연결 반납. 연결 반납 ≠ DB 접속 종료

  **핵심 설정**

    - `maximumPoolSize`: 풀이 보유할 수 있는 최대 연결 수. 서버 요청 수만큼 무조건 늘리는 설정 X
    - `connectionTimeout`: 빌릴 연결이 없을 때 최대 대기 시간. 이 시간이 지나면 연결 획득 실패 예외
    - `minimumIdle`: 유지하려는 최소 유휴 연결 수. 실제 적정 값은 DB 허용 연결 수·쿼리 시간·트래픽을 보고 설정 필요
    - 풀이 작거나 쿼리가 오래 걸리면 대기 요청 증가. 반대로 지나치게 큰 풀은 DB 연결·메모리 부담 증가

  **이번 Spring 실습에서는**

    - `spring-boot-starter-jdbc` 사용 시 Spring Boot가 HikariCP 의존성을 제공하고, DataSource와 JdbcTemplate을 자동 설정
    - `application.yaml`의 `spring.datasource.*`는 연결 정보, `spring.datasource.hikari.*`는 풀 세부 설정에 사용

  **실습 코드 — application.yaml**

    ```yaml
    spring:
      application:
        name: umc_11th-web_spring
    
      datasource:
        driver-class-name: com.mysql.cj.jdbc.Driver
        url: ${DB_URL}
        username: ${DB_USER}
        password: ${DB_PW}
    ```

    - 이 프로젝트의 풀 크기 별도 설정 X → Spring Boot 자동 설정 사용
    - `JdbcTemplate`은 SQL 실행 도구, **HikariCP는 연결 관리 풀** → 역할 구분
    - 쿼리 실행 후 연결을 돌려주는 과정은 프레임워크가 처리하지만, 느린 쿼리나 긴 트랜잭션의 문제까지 해결하는 것은 X

  **주의점**

    - ‘풀에 연결이 있다’와 ‘DB가 정상 응답한다’는 별개. DB 재시작, 네트워크 단절, 잘못된 URL·계정 설정은 별도 확인 필요
    - 연결 부족이 발생하면 풀 크기만 키우기 전에 느린 쿼리, 장시간 트랜잭션, 연결 누수 여부부터 점검

  **참고자료**

    - Spring Boot - SQL Databases
    - HikariCP - 설정 및 풀 크기 설명
- Raw SQL vs ORM

  **Raw SQL**

    - 개발자가 실행할 SQL 문장을 직접 작성하는 방식. 이번 실습의 `JdbcTemplate` 쿼리가 예시

  **실습 코드 — BookRepository의 메서드**

    ```java
    public List<Map<String, Object>> findAll() {
        String sql = "SELECT * FROM book";
    
        return jdbcTemplate.queryForList(sql);
    }
    ```

    - 장점: 어떤 테이블을 어떻게 조회·수정할지 명확하고, 복잡한 JOIN·집계·DB 고유 기능을 직접 표현 가능
    - 단점: 컬럼명 변경 시 문자열을 직접 수정해야 하고, 조회 결과를 객체나 응답 형태로 변환하는 코드가 늘어남. 문자열·매핑 오류를 컴파일 시점에 잡기 어려움

  **ORM(Object-Relational Mapping)**

    - 객체(예: Java 클래스)와 관계형 DB의 테이블을 매핑해, 객체를 중심으로 저장·조회하게 돕는 기술. Java의 관련 기술: JPA, Hibernate
    - 장점: 반복적인 CRUD·매핑 코드 감소, 객체 관계 중심의 도메인 로직 구성에 유리
    - 단점: 생성되는 SQL을 이해하지 못하면 불필요한 조회나 N+1 문제 발생 가능. 복잡한 조회는 별도 쿼리가 더 명확한 경우도 존재
    - ORM은 SQL과 DB를 없애는 기술 X. 내부적으로 SQL이 실행되므로 실행 쿼리와 인덱스·트랜잭션 확인 필요

  **같은 도서 조회를 비교하면**

    - Raw SQL: `SELECT * FROM book WHERE category_id = ?`를 직접 작성하고 결과를 `Map` 등의 형태로 수신
    - ORM: Book 객체의 매핑과 조회 메서드를 이용. SQL 생성·결과 매핑은 프레임워크가 담당
    - ORM에서도 필요하면 네이티브 SQL을 사용할 수 있으므로 ‘둘 중 하나만 선택’하는 관계 X

  **선택 기준**

    - 쿼리 동작을 직접 배우거나 특수한 조회를 정밀하게 제어해야 할 때 Raw SQL이 유용
    - 엔티티 관계와 CRUD가 많은 서비스에서는 ORM이 반복 작업을 줄여줌
    - 어느 쪽이든 파라미터 바인딩, 실행 계획, 쿼리 수 확인은 필요. ORM을 써도 SQL Injection·성능 문제 자동 해결 X

  **참고자료**

    - Spring Boot - SQL Databases(JDBC와 ORM)
    - Spring Framework - JdbcTemplate 사용법
    - Hibernate - ORM 소개
- INSERT 외에 데이터를 다루는 핵심 SQL 문법

  **CRUD와 SQL**

    - Create → `INSERT`, Read → `SELECT`, Update → `UPDATE`, Delete → `DELETE`
    - 네 문법은 테이블의 데이터를 다루는 기본 작업. 테이블 자체를 만드는 `CREATE TABLE` 같은 DDL과는 구분

  **SELECT: 조회**

    - `SELECT book_id, title FROM book WHERE category_id = ? ORDER BY book_id DESC;`
    - 필요한 컬럼과 조건을 골라 조회. `JOIN`으로 다른 테이블을 연결하고, `ORDER BY`·`LIMIT`으로 화면에 필요한 순서와 개수 지정 가능
    - `SELECT *`는 실습에는 편하지만, API 응답을 설계할 때는 필요한 컬럼만 명시하는 편이 변경 영향을 줄이기 좋음

  **UPDATE: 기존 행 수정**

    - `SET`에 바꿀 컬럼, `WHERE`에 대상 행을 지정. 선택 미션의 도서 반납이 예시

  **실습 코드 — BookRepository의 메서드**

    ```java
    public void updateRental(Long rentalId) {
        String sql = "UPDATE rental SET returned_at = NOW() WHERE rental_id = ?";
    
        jdbcTemplate.update(
                sql,
                rentalId
        );
    }
    ```

    - `WHERE` 누락 시 테이블의 전체 행 수정 위험. 이미 반납된 기록을 다시 바꾸지 않으려면 `AND returned_at IS NULL` 같은 조건도 고려

  **DELETE: 행 삭제**

    - `DELETE FROM rental WHERE rental_id = ?;`
    - 지정한 행을 삭제. `WHERE`가 없으면 모든 행이 삭제될 수 있으므로 실행 전 조건과 대상 건수를 확인
    - 실제 서비스에서는 삭제 이력을 남겨야 하는지, 외래키로 연결된 데이터가 있는지까지 고려

  **여러 변경을 하나로 묶을 때: 트랜잭션**

    - 대여 기록 생성과 책의 대여 가능 상태 변경이 모두 성공해야 한다면 한 트랜잭션으로 처리
    - 중간에 실패하면 `ROLLBACK`으로 되돌리고, 모두 성공하면 `COMMIT`. 그렇지 않으면 ‘대여 기록은 있는데 책은 여전히 대여 가능’ 같은 불일치 발생 가능
    - MySQL은 일반적으로 자동 커밋이 켜져 있어 각 문장이 개별적으로 확정될 수 있으므로, 여러 문장을 원자적으로 묶으려면 트랜잭션 경계 명시 필요

  **Spring JdbcTemplate에서**

    - 조회: `queryForList(...)`, 변경: `update(...)`
    - `update(...)`의 반환값은 영향받은 행 수. `0`이면 대상 ID가 없을 수 있으므로 무조건 성공 응답을 주지 않도록 확인 가능

  **참고자료**

    - MySQL - SELECT 문
    - MySQL - UPDATE 문
    - MySQL - DELETE 문
    - MySQL - 트랜잭션 문
    - Spring Framework - JdbcTemplate