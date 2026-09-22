- 1. 요구사항 → SQL로 번역하기
    
    찾아보기: 화면 요구사항을 SELECT 컬럼, FROM 테이블, JOIN 관계, WHERE 조건, ORDER BY/LIMIT으로 나누는 방법을 정리해 보세요.
    
    # 요구사항을 SQL로 번역하기
    
    SQL 작성 전, 먼저 화면에서 **어떤 데이터**를 보여줘야 하는지 **요구사항을 분석**해야 한다.
    
    `문학 카테고리에서 대여 가능한 도서를 최신순으로 10권 보여준다` 와 같은 요구사항이 있을 때,
    이 문장을 그대로 SQL로 작성하는 것이 아니라 여러 요소로 나눠서 생각할 수 있다
    
    | SQL 요소 | 요구사항 |
    | --- | --- |
    | `SELECT` | 책 제목,  카테고리 등 화면에 보여줄 데이터 선택 |
    | `FROM` | 도서 정보를 가지고 있는 `book` 테이블을 기준으로 조회 |
    | `JOIN` | `book`에 없는 카테고리 이름을 가져오기 위해 `category` 테이블 연결 |
    | `WHERE` | ‘문학’ 카테고리만 조회 |
    | `WHERE` | 대여 가능한 책만 조회 |
    | `ORDER BY` | 도서를 최신순으로 정렬 |
    | `LIMIT` | 최대 10개의 데이터만 조회 |
    
    ```sql
    SELECT 
        b.title,
        b.description,
        c.name AS category_name
    FROM book b
    JOIN category c 
        ON b.category_id = c.category_id
    WHERE c.name = '문학'
      AND b.is_available = TRUE
    ORDER BY b.book_id DESC
    LIMIT 10;
    ```
    
    → 즉, 단순히 문법을 조합하는 게 아니라, 화면의 **요구사항**을 **DB**가 이해할 수 있는 **조회 조건**으로 **변환**하는 과정
    
    ---
    
    ---
    
    ### SELECT
    
    > 조회 결과로 **어떤 컬럼을 가져올지** 결정한다.
    > 
    
    `book` 테이블에서 책의 제목과 설명만 가져오려면, 
    
    ```sql
    SELECT title, description
    FROM book;
    ```
    
    이와 같은 쿼리를 이용할 수 있다.
    
    `SELECT *` 를 사용해 모든 데이터를 가져올 수도 있지만, 필요하지 않은 컬럼까지 모두 조회할 필요는 없기 때문에 화면에 필요한 컬럼을 명확하게 지정하는 것이 좋다!
    
    ### FROM
    
    > **어떤 테이블**을 **기준**으로 데이터를 조회할지 결정한다.
    > 
    
    도서 정보를 조회한다면 `book` 테이블을 기준으로 사용할 수 있다.
    
    하지만 화면에서 카테고리 이름도 함께 보여줘야 하는 경우에는 `book` 테이블만으로는 부족하다.
    `book` 테이블에는 `category_id`가 있지만 실제 카테고리 이름은 `category` 테이블에 있기 때문이다.
    
    ### JOIN
    
    > 서로 **다른 테이블**에 저장된 **데이터**를 ****하나의 조회 결과로 **연결**할 때 사용한다.
    > 
    
    `book`의 `category_id`와 `category`의 `category_id`를 이용해 두 테이블을 연결할 수 있다.
    
    ```sql
    FROM book b JOIN category c ON b.category_id = c.category_id
    ```
    
    여기서 `b`와 `c`는 각각 `book`, `category` 테이블의 별칭
    
    JOIN이 필요한지 판단할 때는 **화면에 필요한 데이터가 현재 테이블에 모두 존재하는지** 먼저 확인하고, 다른 테이블의 정보가 필요하다면 ERD의 관계를 따라 JOIN을 추가한다.
    
    ---
    
    ### WHERE
    
    > 조회할 행의 **조건을 지정**한다.
    > 
    
    대여 가능한 책만 조회하려면
    `WHERE is_available = TRUE` 를 사용하면 된다.
    
    조건이 여러 개라면 `AND`  등을 이용해 연결한다
    
    ```sql
    WHERE c.name = '문학'
      AND b.is_available = TRUE
    ```
    
    : 카테고리 이름이 `문학` 이고, 대여 가능한 상태인 도서만 조회하라는 의미이다.
    
    즉, `WHERE`는 **전체 데이터 중에서 실제 요구사항에 맞는 데이터만 걸러내는 역할**을 한다.
    
    ---
    
    ### ORDER BY
    
    > 조회된 데이터의 **정렬 순서**를 결정한다.
    > 
    
    책의 `book_id`가 증가 or 감소하는 순서대로 정렬하려면 다음과 같이 작성한다.
    
    ```sql
    ORDER BY book_id ASC  -- 오름차순
    ORDER BY book_id DESC -- 내림차순
    ```
    
    목록 화면에서 최신순, 오래된 순, 반납 예정일 순과 같이 특정한 정렬 기준이 요구된다면 
    `ORDER BY`를 사용하여 화면에서 원하는 순서를 명확하게 지정해야 한다.
    
    ### LIMIT
    
    > 조회 결과에서 가져올 데이터의 **최대 개수**를 **제한**한다.
    > 
    
    10개의 도서만 보여주고 싶다면 다음과 같이 작성한다.
    
    `LIMIT 10` 
    
    `LIMIT`은 많은 데이터 중 화면에 필요한 일부만 보여줄 때 사용할 수 있으며, **페이지네이션**에서도 활용된다.
    
- 2. DDL과 DML
    
    찾아보기: CREATE TABLE이 테이블 구조를, INSERT가 행 데이터를 담당하는 이유와 ALTER TABLE과의 차이를 살펴보세요.
    
    # DDL과 DML
    
    SQL은 데이터베이스를 다룰 때 테이블의 **구조**를 **정의하는 작업**과 테이블에 **저장된 데이터**를 **다루는 작업**으로 나눌 수 있는데, 이때 사용하는 SQL 명령어를 크게 **DDL**과 **DML**로 구분할 수 있다.
    
    | 종류 | 의미 | 명령어 |
    | --- | --- | --- |
    | DDL | DB 구조 정의, 변경 | `CREATE`, `ALTER`, `DROP` |
    | DML | 데이터 조회, 조작 | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
    
    → DDL은 데이터를 담을 구조를 만들고, DML은 그 구조 안에 실제 데이터를 다루는 역할
    
    ---
    
    ## DDL
    
    > DB의 테이블, 컬럼 등의 **구조**를 **정의**하거나 **변경**하는 명령어
    > 
    
    대표적인 DDL 명령어로는 `CREATE`, `ALTER`, `DROP` 등이 있다.
    
    #### CREATE TABLE
    
    : 새로운 테이블의 **구조를 생성**한다.
    
    ```sql
    CREATE TABLE category ( 
    	category_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    	name VARCHAR(50) NOT NULL
    );
    ```
    
    → `category` 라는 테이블이 생성됨
    
    `CREATE TABLE` 은 테이블 자체를 만드는 DDL 명령어이다.
    
    #### ALTER TABLE
    
    : 이미 존재하는 테이블의 **구조를 변경**한다.
    
    예를 들어 `category` 테이블에 설명을 저장할 `description` 컬럼을 추가하려면,
    
    ```sql
    ALTER TABLE category
    ADD COLUMN description TEXT;
    ```
    
    → 기존 `category` 테이블에 `description` 컬럼이 추가됨
    
    `ALTER TABLE`은 기존 테이블의 데이터를 새로 추가하는 것이 아니라 **컬럼이나 제약조건 등 테이블의 구조를 변경**할 때 사용한다.
    
    #### DROP TABLE
    
    : 기존 테이블을 **삭제**한다.
    
    ```sql
    DROP TABLE category;
    ```
    
    → `category` 테이블 자체가 삭제됨
    
    테이블의 구조뿐만 아니라 **테이블에 저장되어 있던 데이터도 함께 삭제**되므로 주의해야 한다.
    
    ---
    
    ## DML
    
    > 테이블에 저장된 **실제 데이터**를 **조회하거나 추가, 수정, 삭제**하는 명령어
    > 
    
    대표적인 DML 명령어로는 `SELECT`, `INSERT`, `UPDATE`, `DELETE`가 있다.
    
    #### SELECT
    
    : 테이블에 저장된 데이터를 **조회**한다.
    
    ```sql
    SELECT *
    FROM category;
    ```
    
    → `category` 테이블에 저장된 모든 데이터를 조회함
    
    필요한 컬럼만 지정하여 조회할 수도 있다.
    
    ```sql
    SELECT category_id, name
    FROM category;
    ```
    
    → `category_id`와 `name` 컬럼의 데이터만 조회함
    
    `SELECT`는 **테이블의 구조나 데이터를 변경하지 않고 필요한 데이터를 가져오는 명령어**이다.
    
    ---
    
    #### INSERT
    
    : 테이블에 **새로운 행 데이터를 추가**한다.
    
    ```sql
    INSERT INTO category (name)
    VALUES ('문학');
    ```
    
    → `category` 테이블에 `문학`이라는 새로운 데이터가 추가됨
    
    여러 데이터를 한 번에 추가할 수도 있다.
    
    ```sql
    INSERT INTO category (name)
    VALUES
        ('문학'),
        ('과학');
    ```
    
    → `문학`, `과학` 데이터가 각각 새로운 행으로 추가됨
    
    `INSERT`는 테이블의 구조를 변경하는 것이 아니라 **이미 존재하는 테이블에 실제 데이터를 추가**한다.
    
    ---
    
    #### UPDATE
    
    : 테이블에 저장된 기존 **데이터를 수정**한다.
    
    예를 들어 `category_id`가 1인 카테고리의 이름을 변경하려면,
    
    ```sql
    UPDATE category
    SET name = '소설'
    WHERE category_id = 1;
    ```
    
    → `category_id`가 1인 데이터의 `name`이 `소설`로 변경됨
    
    `WHERE` 조건을 사용하지 않으면 여러 행의 데이터가 한꺼번에 변경될 수 있으므로 주의해야 한다.
    
    ```sql
    UPDATE category
    SET name = '소설';
    ```
    
    → `category` 테이블의 모든 행의 `name`이 `소설`로 변경됨
    
    따라서 `UPDATE`를 사용할 때는 **어떤 데이터를 수정할 것인지 WHERE 조건을 함께 확인하는 것이 중요**하다.
    
    ---
    
    #### DELETE
    
    : 테이블에 저장된 기존 **행 데이터를 삭제**한다.
    
    ```sql
    DELETE FROM category
    WHERE category_id = 1;
    ```
    
    → `category_id`가 1인 데이터가 삭제됨
    
    `DELETE` 역시 `WHERE` 조건을 사용하지 않으면 테이블의 **모든 행이 삭제될 수 있으므로** 주의해야 한다.
    
    ```sql
    DELETE FROM category;
    ```
    
    → `category` 테이블의 모든 행이 삭제됨
    
    단, `DELETE`는 **테이블 자체를 삭제하는 것이 아니라 테이블 안의 데이터만 삭제**한다.
    
    ---
    
    ## DDL과 DML의 차이
    
    DDL과 DML의 가장 큰 차이는 **무엇을 대상으로 작업하는가**이다.
    
    DDL → 테이블의 구조를 다룸 → CREATE / ALTER / DROP 
    DML → 테이블에 저장된 데이터를 다룸 → SELECT / INSERT / UPDATE / DELETE
    
    예를 들어,
    
    ```sql
    CREATE TABLE category (...);
    ```
    
    는 데이터를 저장할 **테이블의 구조를 생성**하는 것이고,
    
    ```sql
    INSERT INTO category (name)
    VALUES ('문학');
    ```
    
    는 만들어진 테이블에 **실제 데이터를 추가**하는 것이다.
    
    또한,
    
    ```sql
    ALTER TABLE category
    ADD COLUMN description TEXT;
    ```
    
    는 기존 테이블의 **구조를 변경**하는 것이고,
    
    ```sql
    UPDATE category
    SET name = '소설'
    WHERE category_id = 1;
    ```
    
    는 기존 테이블에 저장된 **데이터를 변경**하는 것이다.
    
    따라서 SQL을 작성할 때 **테이블의 구조를 변경하려는 것인지, 테이블 안의 데이터를 변경하려는 것인지**를 먼저 구분하면 각 명령어의 역할을 쉽게 이해할 수 있다.
    
- 3. PK·FK와 JOIN 조건
    
    찾아보기: PK·FK가 무엇을 보장하는지, ON 절에서 관계가 잘못 연결되면 왜 중복 행이 생기는지 확인해 보세요.
    
    # PK·FK와 JOIN 조건
    
    데이터베이스에서는 여러 테이블에 데이터를 나누어 저장하고, 서로 관계가 있는 데이터를 연결해서 조회한다.
    
    이때 각 데이터를 **고유하게 식별하고 테이블 사이의 관계를 표현하기 위해 PK와 FK를 사용**하며, 실제 조회 과정에서 이러한 관계를 연결하는 데 `JOIN`을 사용한다.
    
    ---
    
    ## PK
    
    > 테이블에서 각 **행을 고유하게 식별**하기 위한 키
    > 
    
    PK는 테이블의 각 행을 구분할 수 있도록 **중복되지 않는 값**을 가지는 컬럼이다.
    
    ```sql
    CREATE TABLE category (
        category_id BIGINT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL
    );
    ```
    
    → `category_id`가 `category` 테이블의 PK가 됨
    
    PK에는 일반적으로 다음과 같은 특징이 있다.
    
    - 각 행을 **고유하게 식별**할 수 있음
    - 중복된 값을 가질 수 없음
    - `NULL` 값을 가질 수 없음
    - 다른 테이블에서 해당 데이터를 참조하는 기준이 될 수 있음
    
    ---
    
    ## FK
    
    > 다른 테이블의 PK를 **참조하여 테이블 간 관계를 표현**하는 키
    > 
    
    FK는 다른 테이블의 PK를 참조하는 컬럼이다.
    
    온라인 도서 대여 시스템에서는 `book`의 `category_id`가 `category`의 `category_id`를 참조한다.
    
    ```sql
    CREATE TABLE book (
        book_id BIGINT PRIMARY KEY AUTO_INCREMENT,
        category_id BIGINT NOT NULL,
        title VARCHAR(100) NOT NULL,
        FOREIGN KEY (category_id)
            REFERENCES category(category_id)
    );
    ```
    
    → `book.category_id`가 `category.category_id`를 참조하는 FK가 된다.
    
    FK를 사용하면 다른 테이블에 존재하지 않는 값을 참조하는 것을 제한하여 **테이블 사이의 데이터 관계를 유지**할 수 있다.
    
    예를 들어 `category` 테이블에 `category_id = 1`이 존재한다면,
    
    ```sql
    book.category_id = 1
    ```
    
    와 같이 해당 카테고리를 참조할 수 있다.
    
    ---
    
    ## PK와 FK의 관계
    
    > PK는 데이터를 **식별**하고, FK는 다른 테이블의 데이터를 **참조**한다.
    > 
    
    예를 들어,
    
    ```
    category
    ┌─────────────┬──────────┐
    │ category_id │ name     │
    ├─────────────┼──────────┤
    │ 1           │ 문학     │
    │ 2           │ 과학     │
    └─────────────┴──────────┘
    
    book
    ┌─────────┬─────────────┬──────────────┐
    │ book_id │ category_id │ title        │
    ├─────────┼─────────────┼──────────────┤
    │ 1       │ 1           │ 달빛 도서관  │
    │ 2       │ 1           │ 겨울의 편지  │
    │ 3       │ 2           │ 우주를 읽는 법│
    └─────────┴─────────────┴──────────────┘
    ```
    
    여기서 `category.category_id`는 PK이고, `book.category_id`는 FK이다.
    
    따라서 하나의 카테고리에 여러 권의 책이 연결될 수 있다.
    
    ```
    category 1 ───── N book
    ```
    
    이처럼 PK와 FK는 ERD에서 표현한 **테이블 간 관계를 실제 데이터베이스에서 유지하는 기준**이 된다.
    
    ---
    
    ## JOIN
    
    > 서로 다른 테이블의 **관련된 데이터를 하나의 조회 결과로 연결**하는 명령어
    > 
    
    PK와 FK로 테이블 사이의 관계를 정의했다면, `JOIN`을 이용하여 해당 관계를 따라 데이터를 함께 조회할 수 있다.
    
    예를 들어 책의 제목과 카테고리 이름을 함께 조회하려면,
    
    ```sql
    SELECT
        b.title,
        c.name AS category_name
    FROM book b
    JOIN category c
        ON b.category_id = c.category_id;
    ```
    
    → `book`과 `category`를 `category_id`를 기준으로 연결
    
    ---
    
    ## ON
    
    > JOIN할 두 테이블의 **연결 조건을 지정**한다.
    > 
    
    `ON`은 어떤 컬럼을 기준으로 두 테이블을 연결할 것인지 작성하는 부분이다.
    
    ```sql
    JOIN category c
        ON b.category_id = c.category_id
    ```
    
    이 경우, `book.category_id = category.category_id` 인 데이터끼리 연결된다.
    즉, `ON` 조건은 **ERD에서 정의한 PK와 FK 관계를 SQL로 표현하는 부분**이라고 볼 수 있다.
    
    #### ON 조건이 잘못되면?
    
    → JOIN 조건을 잘못 작성하면 **원하지 않는 데이터가 연결되거나 결과 행이 중복될 수 있다.**
    
    예를 들어 다음과 같이 책과 카테고리를 연결한다고 하자.
    
    ```sql
    SELECT
        b.title,
        c.name
    FROM book b
    JOIN category c
        ON b.category_id = c.category_id;
    ```
    
    이 경우 `book.category_id`와 `category.category_id`가 같은 데이터만 연결되므로 정상적인 결과가 나온다.
    
    하지만 관계와 상관없는 조건으로 JOIN하거나, 두 테이블의 관계를 정확하게 연결하지 않으면 **하나의 행이 여러 행과 연결될 수 있다.**
    
    예를 들어 다음과 같이 의미 없는 조건으로 연결하면,
    
    ```sql
    SELECT
        b.title,
        c.name
    FROM book b
    JOIN category c
        ON b.category_id = b.category_id;
    ```
    
    `b.category_id = b.category_id`는 `category` 테이블과의 관계를 확인하는 조건이 아니다.
    
    결과적으로 하나의 `book` 행이 여러 `category` 행과 연결될 수 있으며, 같은 책이 여러 번 나타나는 **중복 행**이 발생할 수 있다.
    
    ---
    
    ## JOIN에서 중복 행이 생기는 이유
    
    JOIN은 단순히 테이블을 붙이는 것이 아니라 **ON 조건을 만족하는 행들을 서로 연결**한다.
    
    예를 들어,
    
    ```
    book
    1 → 달빛 도서관
    2 → 겨울의 편지
    
    category
    1 → 문학
    2 → 과학
    3 → 역사
    ```
    
    정상적인 JOIN 조건이
    
    ```sql
    ON book.category_id = category.category_id
    ```
    
    라면, `달빛 도서관 → 문학` , `겨울의 편지 → 문학` 처럼 필요한 관계만 연결된다. 하지만 하나의 `book` 행이 여러 `category` 행과 매칭되는 JOIN 조건을 작성하면, 하나의 책이 여러 번 조회될 수 있다.
    
    ```
    달빛 도서관 → 문학
    달빛 도서관 → 과학
    달빛 도서관 → 역사
    ```
    
    즉, JOIN 결과의 중복은 단순히 SQL이 같은 데이터를 복사해서 만드는 것이 아니라 **JOIN 조건을 만족하는 여러 행이 서로 매칭되기 때문에 발생**한다.
    
    따라서 JOIN을 작성할 때는 항상 **ERD의 PK/FK 관계를 확인하고, 실제로 어떤 행과 어떤 행을 연결해야 하는지 생각한 뒤 `ON` 조건을 작성해야 한다.**
    
- 4. WHERE와 NULL
    
    찾아보기: WHERE 조건에서 NULL을 = 과 비교할 수 없는 이유와 IS NULL을 사용하는 이유를 알아보세요.
    
    # WHERE와 NULL
    
    SQL에서 `WHERE`는 원하는 조건에 맞는 데이터만 조회하기 위해 사용한다.
    
    이때 주의해야 할 값이 **NULL**이다. `NULL`은 단순히 숫자 `0`이나 빈 문자열 `''`을 의미하는 것이 아니라, **값이 존재하지 않거나 아직 알 수 없는 상태**를 나타낸다.
    
    따라서 `NULL`을 일반적인 값처럼 `=` 연산자로 비교할 수 없으며, `IS NULL` 또는 `IS NOT NULL`을 사용해야 한다.
    
    ---
    
    ## WHERE
    
    > 조회할 데이터의 **조건을 지정**하는 절
    > 
    
    예를 들어 대여 가능한 책만 조회하려면 `WHERE`를 사용한다.
    
    ```sql
    SELECT title
    FROM book
    WHERE is_available = TRUE;
    ```
    
    → `is_available`이 `TRUE`인 책만 조회됨
    
    여러 조건을 함께 사용해야 한다면 `AND`, `OR` 등을 사용할 수 있다.
    
    ```sql
    WHERE is_available = TRUE
      AND category_id = 1
    ```
    
    → 대여 가능하면서 `category_id`가 1인 책만 조회됨
    
    즉, `WHERE`는 전체 테이블의 데이터 중 **요구사항에 맞는 행만 필터링하는 역할**을 한다.
    
    ---
    
    ## NULL
    
    > 값이 **존재하지 않거나 알 수 없는 상태**를 나타내는 특별한 값
    > 
    
    `NULL`은 `0`, `''`과 다르다.
    
    ```
    0    → 숫자 값이 0
    ''   → 빈 문자열
    NULL → 값이 없음 / 알 수 없음
    ```
    
    예를 들어 `rental` 테이블의 `returned_at`은 아직 반납하지 않은 경우 값이 없을 수 있다.
    
    ```
    rental
    ┌───────────┬────────────┐
    │ rental_id │ returned_at│
    ├───────────┼────────────┤
    │ 1         │ NULL       │
    │ 2         │ 2026-08-07 │
    └───────────┴────────────┘
    ```
    
    여기서 `returned_at`이 `NULL`이라는 것은 **아직 반납되지 않았다는 상태**를 나타낼 수 있다.
    
    ---
    
    ## NULL을 =로 비교할 수 없는 이유
    
    > `NULL`은 일반적인 값이 아니기 때문에 `=` 연산자로 비교할 수 없다.
    > 
    
    예를 들어 아직 반납하지 않은 책을 찾기 위해 다음과 같이 작성한다고 해보자.
    
    ```sql
    WHERE returned_at = NULL
    ```
    
    하지만 이 조건은 원하는 결과를 가져오지 못한다.
    
    SQL에서 `NULL`은 **값이 없거나 알 수 없는 상태**이기 때문에 `NULL = NULL`과 같은 비교 자체가 참이라고 판단되지 않는다.
    
    따라서 `NULL` 여부를 확인할 때는 `=` 대신 `IS NULL`을 사용해야 한다.
    
    ---
    
    ## IS NULL
    
    > 특정 컬럼의 값이 **NULL인지 확인**한다.
    > 
    
    아직 반납하지 않은 책을 조회하려면 다음과 같이 작성한다.
    
    ```sql
    SELECT book_id, rented_at, due_at
    FROM rental
    WHERE returned_at IS NULL;
    ```
    
    → `returned_at`이 NULL인 대여 기록만 조회됨
    
    즉, 온라인 도서 대여 시스템에서
    
    > “사용자가 아직 반납하지 않은 책을 보여준다.”
    > 
    
    라는 요구사항이 있다면 `returned_at IS NULL` 조건을 사용할 수 있다.
    
    ---
    
    ## IS NOT NULL
    
    > 특정 컬럼의 값이 **NULL이 아닌지 확인**한다.
    > 
    
    반대로 이미 반납한 책만 조회하려면 `IS NOT NULL`을 사용한다.
    
    ```sql
    SELECT book_id, returned_at
    FROM rental
    WHERE returned_at IS NOT NULL;
    ```
    
    → `returned_at`에 실제 반납 시간이 저장된 데이터만 조회됨
    
    따라서 `IS NULL`과 `IS NOT NULL`은 각각 **값이 없는 데이터와 값이 존재하는 데이터를 구분할 때 사용**한다.
    
    ---
    
    ## WHERE와 NULL 정리
    
    `WHERE`에서 일반적인 값은 `=`, `>`, `<` 등의 비교 연산자를 사용할 수 있지만, `NULL` 여부를 확인할 때는 `IS NULL` 또는 `IS NOT NULL`을 사용해야 한다.
    
    ```sql
    일반적인 값
    → WHERE category_id = 1
    
    NULL인지 확인
    → WHERE returned_at IS NULL
    
    NULL이 아닌지 확인
    → WHERE returned_at IS NOT NULL
    ```
    
    따라서 SQL에서 `NULL`을 조회 조건으로 사용할 때는 **`NULL`을 일반적인 값으로 생각하지 않고, 값의 존재 여부를 확인한다는 관점으로 접근하는 것이 중요하다.**
    
- 5. ORDER BY와 일관된 정렬
    
    찾아보기: ORDER BY가 없을 때 목록 순서가 보장되지 않는 이유와 동일 값일 때의 보조 정렬 기준을 찾아보세요.
    
    # ORDER BY와 일관된 정렬
    
    목록 데이터를 조회할 때는 **어떤 순서로 데이터를 보여줄 것인지**를 정하는 것이 중요하다.
    
    SQL에서는 `ORDER BY`를 사용하여 조회 결과의 정렬 순서를 지정할 수 있다.
    
    특히 페이지네이션이나 목록 화면에서는 정렬 기준이 매번 달라지면 같은 데이터가 여러 페이지에 나타나거나 누락될 수 있기 때문에, **일관된 정렬 기준을 지정하는 것이 중요하다.**
    
    ---
    
    ## ORDER BY
    
    > 조회 결과를 **특정 컬럼을 기준으로 정렬**한다.
    > 
    
    예를 들어 책을 `book_id`가 큰 순서대로 조회하려면 다음과 같이 작성할 수 있다.
    
    ```sql
    SELECT title, description
    FROM book
    ORDER BY book_id DESC;
    ```
    
    → `book_id`가 큰 데이터부터 조회됨
    
    `ORDER BY` 뒤에 정렬할 컬럼을 작성하고, `ASC` 또는 `DESC`를 이용하여 정렬 방향을 지정할 수 있다.
    
    - `ASC` : 오름차순
    - `DESC` : 내림차순
    
    ```sql
    ORDER BY book_id ASC;
    ORDER BY book_id DESC;
    ```
    
    `ASC`는 작은 값부터 큰 값 순서로, `DESC`는 큰 값부터 작은 값 순서로 정렬한다.
    
    ---
    
    ## ORDER BY가 없으면?
    
    > SQL에서 `ORDER BY`를 사용하지 않으면 **조회 결과의 순서를 보장할 수 없다.**
    > 
    
    예를 들어 다음과 같이 작성하면,
    
    ```sql
    SELECT title
    FROM book;
    ```
    
    데이터가 특정 순서로 반환되는 것처럼 보일 수 있다.
    
    하지만 이것은 **DB가 그 순서를 항상 보장한다는 의미가 아니다.**
    
    데이터베이스는 `ORDER BY`가 없는 경우 결과를 특정 순서로 반환해야 할 의무가 없기 때문에, 데이터의 저장 상태나 실행 계획 등의 상황에 따라 결과 순서가 달라질 수 있다.
    
    따라서 화면에서
    
    > “최신순으로 보여준다.”
    > 
    
    와 같이 특정한 순서가 요구된다면 반드시 `ORDER BY`를 사용해야 한다.
    
    ---
    
    ## 동일한 값이 있을 때
    
    `ORDER BY`를 사용하더라도 **정렬 기준으로 지정한 값이 동일한 데이터가 여러 개 존재할 수 있다.**
    
    예를 들어 대여 예정일을 기준으로 정렬한다고 하자.
    
    ```sql
    SELECT book_id, due_at
    FROM rental
    ORDER BY due_at ASC;
    ```
    
    여러 대여 기록의 `due_at`이 동일하다면, 같은 `due_at`을 가진 데이터끼리 어떤 순서로 나올지는 추가로 지정하지 않은 상태이다.
    
    이처럼 **정렬 기준의 값이 동일한 경우까지 순서를 명확하게 지정하려면 보조 정렬 기준을 추가**할 수 있다.
    
    ---
    
    ## 보조 정렬 기준
    
    > 첫 번째 정렬 기준의 값이 같을 때 **추가로 적용할 정렬 기준**
    > 
    
    `ORDER BY` 뒤에 여러 컬럼을 작성하면 앞에 작성한 컬럼부터 순서대로 정렬 기준이 적용된다.
    
    ```sql
    SELECT book_id, due_at
    FROM rental
    ORDER BY due_at ASC, book_id ASC;
    ```
    
    먼저 `due_at`을 기준으로 오름차순 정렬하고, `due_at`이 같은 데이터가 있다면 `book_id`를 기준으로 다시 정렬한다.
    
    예를 들어 다음과 같은 데이터가 있다면,
    
    | book_id | due_at |
    | --- | --- |
    | 3 | 2026-08-20 |
    | 1 | 2026-08-20 |
    | 2 | 2026-08-18 |
    
    `due_at ASC`만 적용하면 `2026-08-20`인 두 데이터의 순서는 추가로 보장되지 않는다.
    
    하지만
    
    ```sql
    ORDER BY due_at ASC, book_id ASC;
    ```
    
    로 작성하면 결과는 다음과 같은 순서가 된다.
    
    | book_id | due_at |
    | --- | --- |
    | 2 | 2026-08-18 |
    | 1 | 2026-08-20 |
    | 3 | 2026-08-20 |
    
    즉, **첫 번째 정렬 기준 → 두 번째 정렬 기준** 순서로 적용된다.
    
- 6. LIMIT / OFFSET과 페이지네이션
    
    찾아보기: LIMIT/OFFSET이 페이지 번호 방식과 어떻게 연결되는지, 데이터가 많아질 때 어떤 한계가 있는지 살펴보세요.
    
    # LIMIT / OFFSET과 페이지네이션
    
    많은 데이터를 한 번에 화면에 보여주면 조회 결과가 너무 많아질 수 있기 때문에, 일반적으로 데이터를 **여러 페이지로 나누어 보여주는 페이지네이션(Pagination)**을 사용한다.
    
    SQL에서는 `LIMIT`과 `OFFSET`을 이용하여 **한 번에 가져올 데이터의 개수와 건너뛸 데이터의 개수**를 지정할 수 있다.
    
    ---
    
    ## LIMIT
    
    > 조회 결과에서 가져올 **데이터의 개수**를 제한한다.
    > 
    
    예를 들어 책을 최대 10권만 조회하려면,
    
    ```sql
    SELECT title, description
    FROM book
    ORDER BY book_id DESC
    LIMIT 10;
    ```
    
    → 조회 결과에서 최대 10개의 데이터만 가져옴
    
    `LIMIT`은 페이지네이션에서 **한 페이지에 몇 개의 데이터를 보여줄 것인지**를 결정하는 데 사용할 수 있다.
    
    예를 들어 한 페이지에 10개의 데이터를 보여준다면 `LIMIT 10`을 사용한다.
    
    ---
    
    ## OFFSET
    
    > 조회 결과에서 **몇 개의 데이터를 건너뛸지** 지정한다.
    > 
    
    예를 들어 앞의 10개 데이터를 건너뛰고 그다음 데이터부터 조회하려면,
    
    ```sql
    SELECT title, description
    FROM book
    ORDER BY book_id DESC
    LIMIT 10 OFFSET 10;
    ```
    
    → 앞에서 10개의 데이터를 건너뛴 뒤, 그다음 10개의 데이터를 조회함
    
    따라서 `LIMIT 10 OFFSET 10`은 **11번째 데이터부터 20번째 데이터까지 조회**하는 것과 같은 의미이다.
    
    ---
    
    ## LIMIT / OFFSET과 페이지 번호
    
    페이지네이션에서는 일반적으로 **페이지 번호를 LIMIT과 OFFSET으로 변환**해서 사용한다.
    
    한 페이지에 10개의 데이터를 보여준다고 하면 다음과 같이 계산할 수 있다.
    
    > `OFFSET = (페이지 번호 - 1) × 페이지 크기`
    > 
    
    예를 들어 페이지 크기가 10이라면,
    
    | 페이지 | LIMIT | OFFSET |
    | --- | --- | --- |
    | 1페이지 | 10 | 0 |
    | 2페이지 | 10 | 10 |
    | 3페이지 | 10 | 20 |
    | 4페이지 | 10 | 30 |
    
    따라서 3페이지의 데이터를 조회하려면,
    
    ```sql
    SELECT title, description
    FROM book
    ORDER BY book_id DESC
    LIMIT 10 OFFSET 20;
    ```
    
    처럼 작성할 수 있다.
    
    즉, **페이지 번호를 SQL의 OFFSET 값으로 변환하여 원하는 페이지의 데이터를 가져오는 방식**이다.
    
    ---
    
    ## 페이지네이션에서 ORDER BY가 중요한 이유
    
    `LIMIT`과 `OFFSET`만 사용하는 것보다 **일관된 정렬 기준과 함께 사용하는 것이 중요하다.**
    
    예를 들어 다음과 같이 작성할 수 있다.
    
    ```sql
    SELECT title, description
    FROM book
    ORDER BY book_id DESC
    LIMIT 10 OFFSET 10;
    ```
    
    `ORDER BY book_id DESC`로 정렬한 뒤 `OFFSET`으로 앞의 10개를 건너뛰기 때문에, 페이지마다 어떤 데이터를 가져올지 기준이 명확해진다.
    
    반대로 `ORDER BY` 없이 `LIMIT`과 `OFFSET`만 사용하면 조회 결과의 순서가 보장되지 않기 때문에 페이지를 이동할 때 데이터가 중복되거나 누락될 가능성이 있다.
    
    따라서 일반적으로 **정렬 기준을 먼저 정하고 `LIMIT`과 `OFFSET`을 적용**한다.
    
    ---
    
    ## 데이터가 많아질 때의 한계
    
    `LIMIT`과 `OFFSET`은 간단하게 페이지네이션을 구현할 수 있다는 장점이 있지만, **데이터가 매우 많아지고 OFFSET 값이 커질수록 비효율적일 수 있다.**
    
    예를 들어 수백만 개의 데이터가 있고 마지막 페이지를 조회한다고 생각해보자.
    
    ```sql
    LIMIT 10 OFFSET 999990;
    ```
    
    이 경우 원하는 데이터는 10개뿐이지만, DB는 앞의 많은 데이터를 확인하고 건너뛰는 작업이 필요할 수 있다.
    
    즉, `OFFSET` 값이 커질수록 **뒤쪽 페이지를 조회하는 데 부담이 커질 수 있다.**
    
    또한 데이터가 계속 추가되거나 삭제되는 상황에서는 페이지를 조회하는 사이에 데이터의 위치가 변경될 수 있다.
    
    예를 들어 1페이지를 조회한 뒤 새로운 데이터가 추가되면, 이후 2페이지를 조회할 때 기존에 보던 데이터가 다시 나오거나 일부 데이터가 누락될 가능성이 있다.
    
    ---
    
    ## LIMIT / OFFSET의 한계와 대안
    
    데이터가 많지 않은 일반적인 목록에서는 `LIMIT / OFFSET` 방식으로 페이지네이션을 구현할 수 있다.
    
    하지만 대규모 데이터에서는 `OFFSET` 대신 **커서 기반 페이지네이션(Cursor-based Pagination)**을 사용하는 방법도 있다.
    
    커서 기반 페이지네이션은 이전에 조회한 마지막 데이터의 값을 기준으로 다음 데이터를 조회하는 방식이다.
    
    예를 들어 `book_id`가 증가하는 순서로 데이터를 조회한다면,
    
    ```sql
    SELECT title, description
    FROM book
    WHERE book_id > 100
    ORDER BY book_id ASC
    LIMIT 10;
    ```
    
    처럼 마지막으로 조회한 `book_id`를 기준으로 다음 데이터를 가져올 수 있다.
    
    이 방식은 페이지 번호를 기준으로 앞의 많은 데이터를 건너뛰는 `OFFSET` 방식과 달리 **이전에 조회한 위치를 기준으로 다음 데이터를 찾을 수 있다는 특징**이 있다.
    
    다만 커서 기반 페이지네이션은 단순히 페이지 번호를 계산하는 방식보다 구현이 복잡할 수 있기 때문에, **데이터 규모와 서비스의 조회 방식에 따라 적절한 페이지네이션 방식을 선택해야 한다.**