- 1. 요구사항 → SQL로 번역하기
    
    찾아보기: 화면 요구사항을 SELECT 컬럼, FROM 테이블, JOIN 관계, WHERE 조건, ORDER BY/LIMIT으로 나누는 방법을 정리해 보세요.
    
    **“어떤 데이터를 보여 달라”는 요구사항을 SQL의 각 구문으로 나누는 과정**이다.
    
    바로 SQL부터 작성하기보다, 필요한 정보와 조건을 먼저 정리하면 쿼리를 만들기 편하다.
    
    | 생각할 내용 | SQL 구문 | 역할 |
    | --- | --- | --- |
    | 무엇을 보여 줄까? | `SELECT` | 결과에 표시할 컬럼 선택 |
    | 어디에서 가져올까? | `FROM` | 기준 테이블 선택 |
    | 다른 테이블도 필요할까? | `JOIN … ON` | 테이블 연결 및 연결 조건 지정 |
    | 어떤 데이터만 가져올까? | `WHERE` | 조건에 맞는 행 선택 |
    | 어떤 순서로 보여 줄까? | `ORDER BY` | 결과 정렬 |
    | 얼마나 가져올까? | `LIMIT / OFFSET` | 조회 개수와 건너뛸 개수 지정 |
    
    ### 예시
    
    > 문학 카테고리에서 대여 가능한 책의 제목, 설명, 카테고리 이름을 최신순으로 최대 10개 보여 주세요.
    > 
    
    ```
    SELECT book.title, book.description, category.name
    FROM book
    JOIN category
        ON book.category_id = category.category_id
    WHERE category.name = '문학'
      AND book.is_available = TRUE
    ORDER BY book.book_id DESC
    LIMIT 10;
    ```
    
    제목과 설명은 book에, 카테고리 이름은 category에 있으므로 두 테이블을 연결하고 그중 문학 카테고리이면서 대여 가능한 책만 골라 최대 10개를 가져온다.
    
- 2. DDL과 DML
    
    찾아보기: CREATE TABLE이 테이블 구조를, INSERT가 행 데이터를 담당하는 이유와 ALTER TABLE과의 차이를 살펴보세요.
    
    **DDL은 테이블의 구조를 다루고, DML은 그 안의 데이터를 다룬다.**
    
    | 구분 | 의미 | 대표 명령어 |
    | --- | --- | --- |
    | **DDL** | 데이터베이스 구조를 정의하거나 변경 | `CREATE`, `ALTER`, `DROP` |
    | **DML** | 저장된 데이터를 조회·추가·수정·삭제 | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
    
    `CREATE TABLE`은 테이블을 새로 만들고, `ALTER TABLE`은 기존 테이블에 컬럼을 추가하는 등 구조를 변경한다. 반면 `INSERT`는 만들어진 테이블에 새로운 행을 넣는다.
    
    MySQL 공식 문서에서는 조회 명령인 `SELECT`도 DML로 분류한다. 
    
    ### 예시
    
    > 책 정보를 저장할 테이블을 만들고, 책 한 권을 넣은 뒤 작가 컬럼을 추가한다.
    > 
    
    ```
    -- DDL: 테이블 구조 생성
    CREATE TABLE sample_book (
        book_id INT PRIMARY KEY,
        title VARCHAR(100)
    );
    
    -- DML: 책 한 권의 데이터 추가
    INSERT INTO sample_book (book_id, title)
    VALUES (1, 'SQL 입문');
    
    -- DDL: 기존 테이블에 작가 컬럼 추가
    ALTER TABLE sample_book
    ADD COLUMN author VARCHAR(50);
    ```
    
    첫 번째 명령은 **저장 공간의 구조**를 만들고, 두 번째는 **그 안에 데이터**를 넣는다. 세 번째는 **저장할 정보의 종류**를 추가한다.
    
    > **`INSERT` = 새 행 추가 / `ALTER TABLE` = 테이블 구조 변경**
    > 
- 3. PK·FK와 JOIN 조건
    
    찾아보기: PK·FK가 무엇을 보장하는지, ON 절에서 관계가 잘못 연결되면 왜 중복 행이 생기는지 확인해 보세요.
    
    **PK와 FK는 데이터의 관계를 정의하고 보호하는 데 사용하고, JOIN은 그 관계를 이용해 정보를 연결하여 조회하는 데 사용한다.**
    
    **PK(Primary Key, 기본키)**
    
    각 행을 구별하는 식별자다. 중복과 `NULL`을 허용하지 않는다. 예를 들어 `book_id`가 PK라면 같은 책 번호를 가진 행이 두 개 존재할 수 없다. 여러 컬럼의 조합을 하나의 PK로 지정할 수도 있다.
    
    **FK(Foreign Key, 외래키)**
    
    다른 테이블의 키를 참조하는 제약조건이다. FK 검사가 적용되면 존재하지 않는 대상을 참조하는 데이터 입력을 막는다. 예를 들어 `book.category_id`는 실제로 존재하는 카테고리를 가리켜야 한다.
    
    **JOIN과 ON**
    
    `JOIN`은 테이블을 연결하고, `ON`은 **어떤 행끼리 연결할지** 정한다. FK를 만들었다고 조회할 때 자동으로 JOIN되는 것은 아니다. 
    
    ### 예시
    
    > 책 제목과 해당 책의 카테고리 이름을 함께 조회한다.
    > 
    
    ```
    SELECT book.title, category.name
    FROM book
    JOIN category
        ON book.category_id = category.category_id;
    ```
    
    연결 기준
    
    ```
    book.category_id = category.category_id
    
    책에 저장된 카테고리 번호와
    카테고리 테이블의 번호가 같은 행끼리 연결한다.
    ```
    
    ### JOIN 결과가 여러 행이 되는 이유
    
    조건 없이 JOIN하면 모든 행의 조합이 만들어진다. 예를 들어 책 3행과 카테고리 2행을 조건 없이 연결하면 **3 × 2 = 6행**이 되어, 책과 관계없는 카테고리까지 붙는다. 잘못된 `ON` 조건도 불필요한 행을 연결할 수 있다. 
    
    다만 **같은 책이 여러 번 나온다고 항상 오류는 아니 ㅣ다.** 책 하나에 태그가 두 개라면, 책과 태그를 연결한 결과가 두 행인 것은 정상이다. 결과 한 행이 무엇을 의미하는지 확인해야 한다.
    
- 4. WHERE와 NULL
    
    찾아보기: WHERE 조건에서 NULL을 = 과 비교할 수 없는 이유와 IS NULL을 사용하는 이유를 알아보세요.
    
    `WHERE`는 **조건이 참인 행만** 결과에 포함한다.
    
    `NULL`은 값이 없거나 아직 알려지지 않았음을 나타낸다. 숫자 `0`이나 빈 문자열 `''`과는 다르다.
    
    NULL을 `=` 또는 `<>`로 비교하면 결과는 참이나 거짓이 아니라 **‘알 수 없음’**이 된다. 따라서 `NULL = NULL`도 참이 아니다. 
    
    | 확인할 내용 | 올바른 조건 |
    | --- | --- |
    | 값이 NULL인가? | `IS NULL` |
    | 값이 NULL이 아닌가? | `IS NOT NULL` |
    
    ### 예시
    
    > 사용자 1이 아직 반납하지 않은 대여 기록을 조회한다.
    > 
    
    ```
    SELECT rental_id, book_id, due_at
    FROM rental
    WHERE user_id = 1
    AND returned_at IS NULL;SELECT rental_id, book_id, due_atFROM rentalWHERE user_id=1AND returned_atISNULL;
    ```
    
    여기서는 `returned_at`이 NULL인 기록을 **아직 반납하지 않은 상태**로 판단한다. 따라서 사용자 번호가 1이면서 반납일이 기록되지 않은 행만 조회한다.
    
    > **주의:** `returned_at = NULL`은 문법 오류가 나지는 않지만, 조건이 참이 되지 않아 원하는 미반납 기록을 찾지 못한다. 반드시 `returned_at IS NULL`을 사용해야 한다.
    > 
- 5. ORDER BY와 일관된 정렬
    
    찾아보기: ORDER BY가 없을 때 목록 순서가 보장되지 않는 이유와 동일 값일 때의 보조 정렬 기준을 찾아보세요.
    
    `ORDER BY`는 **조회 결과의 순서를 지정하는 구문**이다.
    
    | 정렬 방향 | 숫자 | 날짜 |
    | --- | --- | --- |
    | `ASC` — 오름차순 | 작은 값부터 | 과거부터 |
    | `DESC` — 내림차순 | 큰 값부터 | 최신부터 |
    
    방향을 생략하면 기본값은 `ASC`이다. `ORDER BY`를 작성하지 않으면 입력한 순서나 PK 순서로 결과가 나온다고 보장할 수 없다. 
    
    또한 **정렬 기준의 값이 같으면 그 행들 사이의 순서는 정해지지 않는다.** 일정한 순서가 필요할 때는 PK처럼 중복되지 않는 컬럼을 보조 정렬 기준으로 추가한다.
    
    ### 예시
    
    > 미반납 대여 기록을 반납 예정일이 빠른 순서로 조회한다. 예정일이 같으면 대여 번호가 작은 순서로 조회한다.
    > 
    
    ```
    SELECT rental_id, book_id, due_at
    FROM rental
    WHERE returned_at IS NULL
    ORDER BY due_at ASC, rental_id ASC;
    ```
    
    정렬은 다음 순서로 적용된다.
    
    ```
    1차 기준: due_at이 빠른 순서
    2차 기준: due_at이 같으면 rental_id가 작은 순서
    ```
    
    예를 들어 아래처럼 정렬된다. 
    
    | 반납 예정일 — due_at | 대여 번호 — rental_id |
    | --- | --- |
    | 2026-08-17 10:00:00 | 1 |
    | 2026-08-17 10:00:00 | 3 |
    | 2026-08-18 10:00:00 | 2 |
    
    **보조 정렬 기준을 지정하면, 데이터가 그대로인 상태에서 같은 날짜의 기록들도 일정한 순서로 조회된다.**
    
- 6. LIMIT / OFFSET과 페이지네이션
    
    찾아보기: LIMIT/OFFSET이 페이지 번호 방식과 어떻게 연결되는지, 데이터가 많아질 때 어떤 한계가 있는지 살펴보세요.
    
    **페이지네이션은 전체 조회 결과를 여러 페이지로 나누어 보여주는 방식**이다.
    
    `LIMIT`은 **최대 몇 행을 가져올지**, `OFFSET`은 **앞에서 몇 행을 건너뛸지** 정한다. OFFSET은 책 번호가 아니라 정렬된 결과에서 건너뛸 행의 개수다.
    
    한 페이지에 10개씩 보여준다면 다음과 같다.
    
    | 페이지 | SQL | 의미 |
    | --- | --- | --- |
    | 1페이지 | `LIMIT 10 OFFSET 0` | 건너뛰지 않고 최대 10행 |
    | 2페이지 | `LIMIT 10 OFFSET 10` | 앞의 10행을 건너뛰고 최대 10행 |
    | 3페이지 | `LIMIT 10 OFFSET 20` | 앞의 20행을 건너뛰고 최대 10행 |
    
    페이지 번호가 1부터 시작할 때의 계산식은 다음과 같다.
    
    ```
    OFFSET = (페이지 번호 - 1) × 페이지당 개수
    ```
    
    ### 예시
    
    > 책 목록을 책 번호 내림차순으로 정렬하여 두 번째 페이지를 조회한다.
    > 
    
    ```
    SELECT book_id, title
    FROM book
    ORDER BY book_id DESC
    LIMIT 10 OFFSET 10;
    ```
    
    책 번호가 큰 순서로 정렬한 뒤, 앞의 10행을 건너뛰고 그다음 최대 10행을 가져온다.
    
    **`LIMIT 10`은 반드시 10행이 나온다는 뜻이 아니다.** 남은 결과가 10행보다 적으면 그만큼만 나오고, 건너뛴 뒤 남은 행이 없으면 결과는 0건이다.
    
    ### 한계
    
    **뒤쪽 페이지는 느려질 수 있다.** OFFSET이 커질수록 건너뛸 행을 처리하는 비용이 커진다.
    
    **페이지 사이에 중복·누락이 생길 수 있다.** 페이지를 이동하는 사이 데이터가 추가·삭제되면 행의 위치가 바뀌기 때문이다. `ORDER BY`를 지정해도 데이터 변경에 따른 위치 변화까지 막지는 못한다.