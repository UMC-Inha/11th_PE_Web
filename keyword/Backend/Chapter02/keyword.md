- 1. 요구사항 → SQL로 번역하기
    
    ### 1. SELECT 컬럼
    
    - 화면에 표시할 데이터
    - 예: 게시글 제목, 작성자 이름, 작성일
    
    ### 2. FROM 테이블
    
    - 조회의 기준이 되는 테이블
    - 예: 게시글 목록을 조회한다면 `posts` 테이블
    
    ### 3. JOIN 관계
    
    - 다른 테이블의 정보가 필요할 때 연결할 테이블과 조건
    - 예: 작성자 이름을 가져오기 위해 `posts.member_id`와 `members.id`를 연결
    
    ### 4. WHERE 조건
    
    - 조회할 데이터를 제한하는 조건
    - 예: 검색어, 카테고리, 작성자, 삭제 여부, 날짜 범위
    
    ### 5. ORDER BY / LIMIT
    
    - `ORDER BY`: 데이터의 정렬 기준
    - `LIMIT`: 조회할 데이터의 개수
    - 예: 최신순으로 정렬한 뒤 10개만 조회
    
- 2. DDL과 DML
    
    ### DDL(Data Definition Language)
    
    데이터베이스의 **구조를 정의하거나 변경하는 명령어**이다.
    
    - `CREATE`: 테이블, 데이터베이스 등을 생성
    - `ALTER`: 기존 테이블의 구조를 변경
    - `DROP`: 테이블 등의 구조를 삭제
    - `TRUNCATE`: 테이블 구조는 유지하면서 모든 행을 삭제
    
    ### DML(Data Manipulation Language)
    
    테이블 안의 **데이터를 조회하거나 변경하는 명령어**이다.
    
    - `SELECT`: 데이터 조회
    - `INSERT`: 새로운 행 추가
    - `UPDATE`: 기존 행 수정
    - `DELETE`: 기존 행 삭제
    
    ## CREATE TABLE과 INSERT의 역할
    
    ### CREATE TABLE
    
    `CREATE TABLE`은 테이블의 이름과 컬럼, 데이터 타입, 제약조건 등을 정의한다. 즉, 데이터를 저장할 **틀을 만드는 명령어**이다.
    
    ```
    CREATETABLE members (
        id BIGINTPRIMARYKEY,
        nameVARCHAR(50)NOTNULL
    );
    ```
    
    위 SQL은 `members`라는 테이블의 구조만 만들며, 실제 회원 데이터는 추가하지 않는다.
    
    ### INSERT
    
    `INSERT`는 이미 만들어진 테이블에 실제 데이터를 **하나의 행으로 추가하는 명령어**이다.
    
    ```
    INSERTINTO members (id, name)VALUES (1,'이지은');
    ```
    
    `CREATE TABLE`이 데이터를 담을 틀을 만든다면, `INSERT`는 그 틀에 실제 데이터를 넣는다.
    
    ## CREATE TABLE과 ALTER TABLE의 차이
    
    | 구분 | 역할 | 사용 시점 |
    | --- | --- | --- |
    | `CREATE TABLE` | 새로운 테이블 구조 생성 | 테이블이 없을 때 |
    | `ALTER TABLE` | 기존 테이블 구조 변경 | 테이블이 이미 있을 때 |
    
    예를 들어 기존 `members` 테이블에 이메일 컬럼을 추가하려면 `ALTER TABLE`을 사용한다.
    
- 3. PK·FK와 JOIN 조건
    
    ## PK, FK와 JOIN 조건
    
    ### PK(Primary Key)
    
    PK는 테이블의 각 행을 유일하게 구분하는 기본 키이다.
    
    - 값이 중복될 수 없다.
    - `NULL` 값을 가질 수 없다.
    - 하나의 행을 정확하게 식별하는 것을 보장한다.
    
    ```sql
    CREATE TABLE members (
        member_id BIGINT PRIMARY KEY,
        name VARCHAR(50) NOT NULL
    );
    ```
    
    `member_id`가 PK이므로 같은 회원 번호를 가진 행을 두 개 이상 저장할 수 없다.
    
    ### FK(Foreign Key)
    
    FK는 다른 테이블의 PK 또는 `UNIQUE` 컬럼을 참조하는 외래 키이다.
    
    - 테이블 사이의 관계를 표현한다.
    - 참조 대상에 없는 값을 저장하지 못하게 한다.
    - 잘못된 참조 데이터가 생기는 것을 방지한다.
    
    ```sql
    CREATE TABLE orders (
        order_id BIGINT PRIMARY KEY,
        member_id BIGINT NOT NULL,
        FOREIGN KEY (member_id) REFERENCES members(member_id)
    );
    ```
    
    `orders.member_id`는 `members.member_id`를 참조하므로 존재하지 않는 회원의 주문을 등록할 수 없다.
    
    ## JOIN의 ON절
    
    `ON`절에는 두 테이블이 어떤 컬럼을 기준으로 연결되는지 작성한다.
    
    ```sql
    SELECT m.name, o.order_id
    FROM members m
    JOIN orders o ON m.member_id = o.member_id;
    ```
    
    회원 PK와 주문의 FK를 연결하면 각 주문이 해당 주문을 한 회원과 정확하게 연결된다.
    
    ## 잘못된 JOIN에서 중복 행이 생기는 이유
    
    `JOIN`은 `ON` 조건을 만족하는 **모든 행의 조합**을 결과로 만든다. 따라서 관계없는 컬럼을 연결하거나 조건을 빠뜨리면 한 행이 여러 행과 일치하여 결과가 불필요하게 늘어난다.
    
    ```sql
    -- 잘못된 JOIN
    SELECT m.name, o.order_id
    FROM members m
    JOIN orders o ON m.name = o.order_status;
    ```
    
    이름과 주문 상태처럼 관계없는 컬럼을 연결하면 같은 값을 가진 행들이 서로 모두 조합될 수 있다.
    
    `ON`절 자체를 생략하거나 항상 참인 조건을 사용하면 두 테이블의 모든 행이 조합되는 `Cartesian Product`가 발생한다.
    
    ```sql
    SELECT *
    FROM members m
    JOIN orders o ON 1 = 1;
    ```
    
    회원이 3명이고 주문이 5개라면 결과는 `3 × 5 = 15개`가 된다.
    
    ## 정상적인 중복과 잘못된 중복 구분
    
    회원과 주문은 `1:N` 관계이므로 한 회원이 여러 건의 주문을 했다면 회원 정보가 여러 번 나타나는 것은 정상이다.
    
    | 상황 | 중복 발생 이유 |
    | --- | --- |
    | 한 회원에게 주문이 여러 개 있음 | `1:N` 관계에 따른 정상적인 결과 |
    | 관계없는 컬럼으로 연결함 | 잘못된 `ON` 조건 |
    | 필요한 JOIN 조건을 일부 빠뜨림 | 하나의 행이 여러 행과 잘못 연결됨 |
    | `ON` 조건을 작성하지 않음 | 모든 행이 서로 조합됨 |
    
    따라서 JOIN을 작성할 때는 PK와 FK의 관계를 확인하고, 필요한 연결 조건을 `ON`절에 정확하게 작성해야 한다.
    
- 4. WHERE와 NULL
    
    ### NULL의 의미
    
    `NULL`은 숫자 `0`이나 빈 문자열 `''`이 아니라 **값이 없거나 알 수 없는 상태**를 의미한다.
    
    ### NULL을 `=`로 비교할 수 없는 이유
    
    `NULL`은 특정한 값이 아니므로 `=` 연산자로 비교할 수 없다.
    
    ```sql
    WHERE deleted_at = NULL
    ```
    
    위 조건은 `TRUE`나 `FALSE`가 아니라 `UNKNOWN`으로 평가된다. SQL의 `WHERE`절은 결과가 `TRUE`인 행만 조회하기 때문에 해당 조건으로는 `NULL`인 행을 찾을 수 없다.
    
    `NULL`끼리 비교하는 경우에도 두 값이 같다고 판단할 수 없다.
    
    ```
    NULL=NULL-- UNKNOWN
    ```
    
    ### IS NULL을 사용하는 이유
    
    `IS NULL`은 해당 컬럼에 값이 없는지를 직접 확인하는 연산자이다.
    
    ```sql
    SELECT * FROM members 
    WHERE deleted_at IS NULL;
    ```
    
    위 SQL은 `deleted_at`에 값이 없는 회원을 조회한다.
    
    반대로 값이 존재하는 행은 `IS NOT NULL`로 조회한다.
    
    ```sql
    SELECT * FROM members
    WHERE deleted_at IS NOT NULL;
    ```
    
- 5. ORDER BY와 일관된 정렬
    
    ### ORDER BY가 필요한 이유
    
    SQL에서 `ORDER BY`를 사용하지 않으면 조회 결과의 순서는 보장되지 않는다.
    
    데이터베이스는 데이터를 저장된 순서대로 조회할 의무가 없으며, 실행 계획이나 인덱스 사용 여부 등에 따라 행을 가져오는 순서가 달라질 수 있다. 따라서 같은 SQL을 실행하더라도 결과 순서가 바뀔 수 있다.
    
    ```sql
    SELECT * FROM posts;
    ```
    
    위 SQL은 게시글의 조회 순서를 보장하지 않는다.
    
    최신 게시글부터 조회하려면 정렬 기준을 명확하게 작성해야 한다.
    
    ```sql
    SELECT * 
    FROM posts
    ORDER BY created_at DESC;
    ```
    
    ### 동일한 값이 있을 때 발생하는 문제
    
    첫 번째 정렬 기준의 값이 같으면 해당 행들 사이의 순서는 여전히 보장되지 않는다.
    
    ```sql
    ORDER BY created_at DESC;
    ```
    
    여러 게시글의 `created_at`이 같다면 그 게시글들이 어떤 순서로 조회될지는 알 수 없다. 이 경우 값이 겹치지 않는 PK와 같은 컬럼을 보조 정렬 기준으로 추가한다.
    
    ```sql
    ORDER BY created_at DESC, post_id DESC;
    ```
    
    먼저 `created_at`을 기준으로 최신순 정렬하고, 작성 시간이 같으면 `post_id`가 큰 게시글부터 정렬한다.
    
    ### 정렬 기준 적용 순서
    
    `ORDER BY`에 여러 컬럼을 작성하면 왼쪽에 있는 컬럼부터 순서대로 적용된다.
    
    ```sql
    ORDER BY category ASC, created_at DESC, post_id DESC;
    ```
    
    1. `category`를 오름차순으로 정렬한다.
    2. 카테고리가 같으면 `created_at`을 내림차순으로 정렬한다.
    3. 작성 시간도 같으면 `post_id`를 내림차순으로 정렬한다.
- 6. LIMIT / OFFSET과 페이지네이션
    
    ### LIMIT과 OFFSET
    
    - `LIMIT`: 한 번에 조회할 행의 개수
    - `OFFSET`: 조회 결과에서 건너뛸 행의 개수
    
    ```sql
    SELECT * 
    FROM posts
    ORDER BY created_at DESC, post_id DESC
    LIMIT 10 OFFSET 20;
    ```
    
    위 SQL은 앞의 20개 행을 건너뛰고, 그다음 10개 행을 조회한다.
    
    ## 페이지 번호와의 연결
    
    페이지 번호가 1부터 시작한다면 `OFFSET`은 다음과 같이 계산한다.
    
    ```
    OFFSET = (페이지 번호 - 1) × 페이지 크기
    ```
    
    한 페이지에 10개씩 조회할 경우 다음과 같다.
    
    | 페이지 | LIMIT | OFFSET |
    | --- | --- | --- |
    | 1페이지 | 10 | 0 |
    | 2페이지 | 10 | 10 |
    | 3페이지 | 10 | 20 |
    
    ```sql
    -- 3페이지 조회
    SELECT * 
    FROM posts 
    ORDER BY created_at DESC, post_id DESC
    LIMIT 10 OFFSET 20;
    ```
    
    ## 데이터가 많아질 때의 한계
    
    ### 1. 뒤쪽 페이지로 갈수록 느려진다
    
    데이터베이스는 `OFFSET`에 지정된 행을 결과에서 제외하더라도 내부적으로는 앞의 행들을 확인하고 건너뛰어야 한다.
    
    ```sql
    LIMIT 10 OFFSET 100000;
    ```
    
    위 쿼리는 100,000개의 행을 건너뛴 뒤 10개를 반환하므로, `OFFSET`이 커질수록 조회 비용이 증가한다.
    
    ### 2. 데이터 중복이나 누락이 발생할 수 있다
    
    사용자가 페이지를 이동하는 사이에 새로운 데이터가 추가되거나 기존 데이터가 삭제되면 행의 위치가 달라진다. 이 때문에 이전 페이지에서 본 데이터가 다음 페이지에 다시 나타나거나 일부 데이터가 빠질 수 있다.
    
    ### 대안: 커서 기반 페이지네이션
    
    마지막으로 조회한 데이터의 값을 기준으로 다음 페이지를 조회하는 방식이다.
    
    ```sql
    SELECT * 
    FROM posts 
    WHERE post_id < 100
    ORDER BY post_id DESC LIMIT 10;
    ```
    
    `OFFSET`으로 앞의 데이터를 모두 건너뛰지 않기 때문에 데이터가 많아도 비교적 일정한 조회 성능을 유지할 수 있다.
    
    ### 정리
    
    | 방식 | 장점 | 단점 |
    | --- | --- | --- |
    | `LIMIT / OFFSET` | 구현이 간단하고 특정 페이지로 바로 이동 가능 | 뒤쪽 페이지가 느리고 데이터 변경 시 중복·누락 가능 |
    | 커서 기반 | 데이터가 많아도 빠르고 중복·누락이 적음 | 특정 페이지로 바로 이동하기 어려움 |
    
    일반적인 게시판처럼 데이터가 많지 않고 페이지 번호가 필요하면 `LIMIT / OFFSET`을 사용할 수 있다. 무한 스크롤이나 대용량 데이터 조회에는 커서 기반 페이지네이션이 더 적합하다.