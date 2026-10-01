- 3계층 아키텍처 이외에 어떤 아키텍처들이 있을까?
    
    ### 아키텍처의 의미
    
    **소프트웨어 아키텍처는 프로그램을 어떤 구성 요소로 나누고, 각 요소가 어떤 책임을 가지며, 서로 어떻게 연결되는지 정하는 구조이다.**
    
    워크북에서는 Controller가 요청·응답을, Service가 업무 규칙을, Repository가 DB 접근을 담당하는 **3계층 아키텍처**를 사용한다. 역할을 분리하면 코드를 수정하거나 재사용하기 쉬워진다. 
    
    ```
    Controller → Service → Repository → DB
    요청·응답     업무 처리    DB 접근
    ```
    
    ### 추가 개념: 대표적인 다른 설계 방식
    
    | 구분 | 핵심 개념 | 예시 및 특징 |
    | --- | --- | --- |
    | **MVC 패턴** | Model·View·Controller로 데이터 및 업무 처리, 화면, 요청 처리의 역할을 나눈다. | 도서 데이터를 Model에서 관리하고 View에서 화면으로 보여준다. 화면과 데이터 처리를 분리하기 좋다. |
    | **헥사고날·클린 아키텍처** | 서로 다른 설계 방식이지만, 핵심 업무 규칙을 DB나 웹 같은 외부 기술과 분리한다는 공통점이 있다. | 도서 대여 규칙이 특정 DB 구현에 직접 의존하지 않도록 만든다. 테스트와 기술 교체가 쉬워지지만 설계가 복잡해질 수 있다. |
    | **마이크로서비스 아키텍처, MSA** | 시스템을 독립적으로 배포할 수 있는 여러 서비스로 나눈다. | 회원·도서·대여 서비스를 따로 운영한다. 개별 확장은 쉽지만 서비스 간 통신과 운영이 복잡해진다. |
    | **이벤트 기반 아키텍처, EDA** | 어떤 일이 발생했다는 이벤트를 전달하고, 필요한 기능이 이를 받아 처리한다. | “도서 대여 완료” 이벤트를 받은 알림 기능이 메시지를 보낸다. 기능 간 의존성을 줄일 수 있지만 중복 처리와 실패 대응이 필요하다. |
    
    **이 구조들은 서로 반드시 하나만 선택해야 하는 관계가 아니다.** 예를 들어 MSA로 나눈 각각의 서비스 내부에서 3계층 구조를 사용할 수 있다.
    
    또한 MVC의 Model·View·Controller와 3계층의 Controller·Service·Repository는 나누는 관점이 다르므로 일대일로 대응시키면 안 된다.
    
- SQL Injection을 포함한 대표적인 웹 보안 공격 기법
    
    ### SQL Injection
    
    **SQL Injection은 사용자 입력이 SQL 명령의 일부로 해석되어, 의도하지 않은 데이터 조회나 변경이 발생하도록 하는 공격이다.**
    
    워크북에서는 사용자 입력을 SQL 문자열에 직접 연결하지 않고, `?`를 사용하는 **파라미터 바인딩**으로 전달하도록 안내한다.
    
    **위험한 방식**
    
    ```
    String sql = "SELECT * FROM book WHERE title = '" + title + "'";
    ```
    
    사용자가 입력한 `title`이 SQL 문장에 그대로 합쳐진다. 입력 내용에 따라 SQL의 구조가 바뀔 수 있다.
    
    **파라미터 바인딩을 사용하는 방식**
    
    ```
    String sql = "SELECT * FROM book WHERE title = ?";
    return jdbcTemplate.queryForList(sql, title);
    ```
    
    SQL 구조와 입력값을 분리하므로, 입력값을 SQL 명령이 아닌 **데이터로 처리**하도록 한다.
    
    문자열을 `+`로 연결하는 것 자체가 문제가 아니라, **사용자 입력을 SQL 문법에 직접 끼워 넣는 것**이 문제이다. 또한 입력값의 길이나 형식을 검사하더라도 파라미터 바인딩은 별도로 필요하다.
    
    ### 추가 개념: 함께 알아둘 공격 기법
    
    | 공격·취약점 | 의미와 예시 | 주요 방어 방법 |
    | --- | --- | --- |
    | **XSS** | 입력한 내용이 다른 사용자의 브라우저에서 악성 스크립트로 실행되는 문제이다. 예를 들어 도서 리뷰를 안전하지 않은 HTML로 출력할 때 발생할 수 있다. | 일반 문자열은 텍스트로 출력하고, 출력 위치에 맞는 인코딩을 적용한다. HTML을 허용한다면 안전하게 정제한다. |
    | **CSRF** | 로그인한 사용자의 브라우저를 이용해 사용자가 의도하지 않은 요청을 보내게 하는 공격이다. | 쿠키 기반 인증에서는 CSRF 토큰 검증 등을 적용한다. SameSite 쿠키도 방어에 활용한다. |
    | **접근 제어 취약점, IDOR** | 데이터에 접근할 권한을 제대로 검사하지 않는 문제이다. 대여 번호를 바꾸어 다른 사람의 대여 기록을 조회하는 경우가 해당한다. | 서버에서 요청마다 사용자의 권한과 데이터 소유 관계를 검사한다. |
    
    **파라미터 바인딩만으로 모든 보안 문제가 해결되지는 않는다.** SQL을 안전하게 실행하는 것과 로그인 여부·접근 권한·필수 입력을 검증하는 것은 별개의 작업이다.
    
    DB 비밀번호는 코드에 직접 작성하지 않고 분리하여 관리하며, 운영 환경에서는 `root` 대신 필요한 권한만 가진 전용 DB 계정을 사용하는 것이 중요하다.
    
- 커넥션 풀(Connection Pool)이란?
    
    **커넥션 풀은 DB 연결을 관리하면서 여러 작업이 재사용할 수 있도록 하는 구조이다.**
    
    DB 작업마다 연결을 새로 만들고 끊으면 연결 비용이 반복된다. 커넥션 풀에서는 필요한 연결을 빌려 사용하고, 작업이 끝나면 반환하여 다음 작업에서 재사용한다. 
    
    ```
    DB 작업 요청
        ↓
    풀에서 커넥션을 빌린다.
        ↓
    SQL을 실행한다.
        ↓
    커넥션을 풀에 반환한다.
    ```
    
    ### Spring Boot 실습에서의 역할
    
    워크북에서는 JDBC 의존성과 DB 접속 정보를 설정하여 Spring Boot가 DB 접근 도구를 자동으로 준비하도록 하였다.
    
    | 구성 요소 | 역할 |
    | --- | --- |
    | **DataSource** | DB 커넥션을 얻기 위한 표준 인터페이스이다. |
    | **HikariCP** | 커넥션의 대여·반환과 풀 크기를 관리하는 커넥션 풀 구현체이다. |
    | **JdbcTemplate** | SQL 실행과 결과 처리, JDBC 자원 정리 등의 반복 작업을 줄여 주는 도구이다. |
    
    ```
    BookRepository
        ↓ SQL 실행 요청
    JdbcTemplate
        ↓ 커넥션 획득
    DataSource / HikariCP
        ↓
    MySQL
    ```
    
    즉 **JdbcTemplate은 SQL 작업을 쉽게 수행하도록 하고, HikariCP는 그 작업에 필요한 연결을 관리한다.**
    
    ### 추가로 기억할 점
    
    최대 연결이 10개인 풀에서 10개가 모두 사용 중이라면, 다른 작업은 연결이 반환될 때까지 기다린다. 제한 시간 안에 연결을 얻지 못하면 오류가 발생할 수 있다.
    
    대표 설정은 다음과 같다.
    
    - **`maximum-pool-size`**: 풀에서 관리할 수 있는 전체 커넥션의 최대 개수이다.
    - **`connection-timeout`**: 커넥션을 얻기 위해 기다리는 최대 시간이다. SQL 실행 자체의 제한 시간은 아니다.
    
    **풀 크기가 10이라고 사용자를 10명만 받을 수 있다는 뜻은 아니다.** 여러 요청이 짧게 연결을 빌려 쓰고 반환하면서 공유한다.
    
    또한 연결 수를 무조건 늘린다고 빨라지는 것은 아니다. DB의 처리 능력에 맞게 조정해야 하며, 커넥션을 오래 점유하거나 반환하지 않으면 다른 요청이 기다리게 된다.
    
- Raw SQL vs ORM
    
    ### 두 방식의 차이
    
    **Raw SQL은 개발자가 SQL을 직접 작성하는 방식이고, ORM은 객체와 DB 테이블을 매핑하여 객체 중심으로 데이터를 다루는 기술이다.**
    
    이번 주차 워크북은 `JdbcTemplate`으로 SQL을 실행하고 결과를 `List<Map<String, Object>>`로 반환하는 Raw SQL 방식이다.
    
    ```
    public List<Map<String, Object>> findAll() {
        String sql = "SELECT * FROM book";
        return jdbcTemplate.queryForList(sql);
    }
    ```
    
    ### 비교
    
    | 항목 | Raw SQL | ORM |
    | --- | --- | --- |
    | 중심 | 테이블·컬럼·SQL 문장이다. | 객체·필드·객체 간 관계이다. |
    | SQL 작성 | 개발자가 직접 작성한다. | 기본적인 저장·조회 SQL을 생성해 준다. 필요한 경우 직접 쿼리를 작성할 수도 있다. |
    | 장점 | 복잡한 조회와 DB 고유 기능을 직접 제어하기 좋다. | 반복적인 저장·조회 코드와 객체 매핑 작업을 줄일 수 있다. |
    | 주의점 | SQL 작성과 결과 매핑을 직접 관리해야 한다. | 객체 매핑과 조회 동작을 이해하고, 실제로 생성되는 SQL도 확인해야 한다. |
    
    ### 추가 개념: JPA·Hibernate·Spring Data JPA
    
    Spring에서 ORM을 배울 때는 다음 세 가지를 구분해야 한다.
    
    - **JPA**: Java 객체와 관계형 데이터를 매핑하고 관리하기 위한 표준 명세이다.
    - **Hibernate**: JPA를 구현하는 대표적인 ORM 구현체이다.
    - **Spring Data JPA**: JPA 기반 Repository를 편리하게 작성하도록 돕는 Spring 프로젝트이다.
    
    예를 들어 `Book` 엔티티가 DB에 매핑되어 있고 `categoryId` 필드를 가진다고 가정하면, 다음과 같이 조회 메서드를 선언할 수 있다.
    
    ```
    public interface BookJpaRepository extends JpaRepository<Book, Long> {
    
        List<Book> findByCategoryId(Long categoryId);
    }
    ```
    
    Spring Data JPA는 메서드 이름과 엔티티 정보를 바탕으로 조회를 구성한다. 이는 비교용 예시이며, 현재 JDBC 실습 코드에 그대로 추가할 코드는 아니다.
    
    ### ORM과 DTO는 별개이다
    
    워크북은 의도적으로 **Raw SQL + No DTO** 방식을 사용해 Map의 문자열 키 오타와 DB 컬럼명 노출 문제를 경험하게 했지만 Raw SQL을 사용한다고 반드시 Map을 써야 하는 것은 아니다. Raw SQL에서도 DTO나 명확한 타입의 객체를 사용할 수 있다.
    
    ```
    ORM → 객체와 DB 사이의 저장·조회 방식을 다룬다.
    DTO → 요청·응답 등에 사용할 데이터 전달 형식을 정한다.
    ```
    
    **ORM을 사용해도 실제 DB에서는 SQL이 실행되므로 SQL 지식은 여전히 필요하다.** 또한 DTO를 만든다고 입력 검증까지 자동으로 완성되는 것은 아니다.
    
- INSERT 외에 데이터를 다루는 핵심 SQL 문법
    
    ### SELECT: 필요한 데이터를 조회한다
    
    `SELECT`는 조회할 컬럼, `FROM`은 테이블, `WHERE`는 조건, `ORDER BY`는 정렬, `LIMIT`은 조회 개수를 지정한다.
    
    ```
    SELECT book_id, title, description
    FROM book
    WHERE is_available = TRUE
    ORDER BY book_id DESC
    LIMIT 10;
    ```
    
    대여 가능한 도서를 도서 번호가 큰 순서로 최대 10개 조회하는 예시이다.
    
    **결과 순서가 중요하면 `ORDER BY`를 명시해야 한다.** 입력된 순서대로 항상 조회된다고 가정해서는 안 된다. 4a6e0f2e-e8ab-4d4c-9c23-ed8091b…
    
    ### JOIN: 여러 테이블의 정보를 연결한다
    
    ```
    SELECT b.title, c.name AS category_name
    FROM book AS b
    INNER JOIN category AS c
        ON b.category_id = c.category_id;
    ```
    
    도서 제목은 `book`에서, 카테고리 이름은 `category`에서 가져온다. `ON`은 어떤 행끼리 연결할지 지정한다.
    
    `INNER JOIN`은 연결 조건을 만족하는 행을 조회한다. `LEFT JOIN`은 왼쪽 테이블의 행을 유지하며, 오른쪽에 대응하는 행이 없으면 해당 컬럼을 `NULL`로 보여준다.
    
    ### GROUP BY·HAVING: 그룹별로 집계한다
    
    ```
    SELECT category_id, COUNT(*) AS book_count
    FROM book
    GROUP BY category_id
    HAVING COUNT(*) >= 2;
    ```
    
    카테고리별 도서 수를 계산하고, 도서가 2권 이상인 카테고리만 조회한다.
    
    **`WHERE`는 집계 전 개별 행에 조건을 적용하고, `HAVING`은 집계된 그룹에 조건을 적용한다.**
    
    ### UPDATE·DELETE: 기존 데이터를 수정하거나 삭제한다
    
    ```
    -- 4번 도서를 대여 불가능 상태로 변경한다.
    UPDATE book
    SET is_available = FALSE
    WHERE book_id = 4;
    
    -- 1번 사용자가 1번 도서에 남긴 좋아요를 삭제한다.
    DELETE FROM book_like
    WHERE user_id = 1 AND book_id = 1;
    ```
    
    **`WHERE`를 생략하면 전체 행이 수정되거나 삭제될 수 있다.** 실행 전 같은 조건의 SELECT로 대상이 맞는지 확인하는 것이 중요하다.
    
    ```
    SELECT *
    FROM book_like
    WHERE user_id = 1 AND book_id = 1;
    ```
    
    위 변경문은 학습 예시이며, 실행하면 실제 데이터가 변경된다.
    
    ### NULL과 테이블 구조 변경
    
    `NULL` 여부는 `= NULL`이 아니라 **`IS NULL` 또는 `IS NOT NULL`**로 검사한다.
    
    ```
    SELECT *
    FROM rental
    WHERE returned_at IS NULL;
    ```
    
    반납일이 없는 대여 기록을 조회하는 예시이다.
    
    테이블 구조를 다루는 명령은 행 데이터를 다루는 명령과 구분한다. 워크북에서도 `CREATE TABLE`은 구조 생성, `INSERT`는 데이터 추가로 설명한다. 
    
    | 명령 | 역할 |
    | --- | --- |
    | `CREATE TABLE` | 새로운 테이블을 만든다. |
    | `ALTER TABLE` | 컬럼 추가 등 테이블 구조를 변경한다. |
    | `DROP TABLE` | 테이블 자체를 삭제한다. |
    | `DELETE` | 테이블은 유지하고 조건에 맞는 행을 삭제한다. |
    
    ### 추가 개념: 트랜잭션
    
    **트랜잭션은 관련된 여러 DB 작업을 하나의 작업 단위로 묶는 방법이다.** `COMMIT`은 변경을 확정하고, `ROLLBACK`은 미확정 변경을 취소한다.
    
    ```
    START TRANSACTION;
    
    UPDATE book
    SET is_available = FALSE
    WHERE book_id = 4;
    
    -- 연습이므로 변경을 확정하지 않고 되돌린다.
    ROLLBACK;
    ```
    
    위 예시는 트랜잭션을 지원하는 InnoDB 테이블을 전제로 한다.
    
    도서 대여 기능에서는 **대여 기록 추가와 도서 상태 변경**을 함께 처리해야 할 수 있다. 이를 하나의 트랜잭션으로 묶고 실패 시 롤백하도록 구현하면, 한쪽 작업만 반영되는 상황을 방지할 수 있다.
    
    단, MySQL의 `DROP TABLE` 같은 여러 DDL은 암묵적 커밋을 발생시키므로 일반 데이터 변경처럼 `ROLLBACK`으로 되돌릴 수 있다고 생각해서는 안 된다.