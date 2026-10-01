- 1. 요구사항 → SQL로 번역하기

찾아보기: 화면 요구사항을 SELECT 컬럼, FROM 테이블, JOIN 관계, WHERE 조건, ORDER BY/LIMIT으로 나누는 방법을 정리해 보세요.

#### 1. 요구사항 문장을 절로 나누는 법

| 요구사항 속 표현 | 가는 곳 |
    | --- | --- |
| "~을 보여준다", "~와 ~를 함께" | SELECT |
| 요구사항의 주된 대상 (책, 대여 기록) | FROM |
| "~의 ~", "~별", 다른 테이블 정보가 섞임 | JOIN |
| "대여 가능한", "아직 반납하지 않은", "로그인한 사용자의" | WHERE |
| "최신순", "반납 예정일 순" | ORDER BY |
| "10권", "한 페이지에" | LIMIT / OFFSET |

#### 2. 적용 예시

요구사항: **"문학 카테고리에서 대여 가능한 도서를 최신순으로 10권 보여 준다."**

  ```
  문학 카테고리에서 → category.name = '문학'   (JOIN + WHERE)
  대여 가능한       → is_available = TRUE      (WHERE)
  도서를            → FROM book
  최신순으로        → ORDER BY book_id DESC
  10권              → LIMIT 10
  보여 준다         → SELECT title, description
  ```

  ```sql
  SELECT b.title, b.description, c.name
  FROM book b
  JOIN category c ON b.category_id = c.category_id
  WHERE c.name = '문학'
    AND b.is_available = TRUE
  ORDER BY b.book_id DESC
  LIMIT 10;
  ```

#### 3. 작성 순서와 실행 순서는 다르다

  ```
  작성: SELECT → FROM → JOIN → WHERE → ORDER BY → LIMIT
  실행: FROM → JOIN → WHERE → SELECT → ORDER BY → LIMIT
  ```

WHERE가 SELECT보다 먼저 실행되므로, SELECT에서 만든 별칭을 WHERE에서 쓸 수 없다. ORDER BY는 SELECT 뒤라서 쓸 수 있다.

  ```sql
  SELECT title AS t FROM book WHERE t = '달빛 도서관';   -- 에러
  SELECT title AS t FROM book ORDER BY t;                -- 정상
  ```

#### 4. JOIN 판단 기준

**JOIN이 필요한 순간** — 결과 컬럼이나 조건에 기준 테이블 밖의 정보가 등장할 때. 카테고리 이름이 필요하니 `category`를 붙이는 식이다.

**INNER vs LEFT**

| 상황 | 선택 |
    | --- | --- |
| 짝이 반드시 존재 (book → category, FK NOT NULL) | INNER JOIN(교집합) |
| 짝이 없어도 결과에 남아야 함 (태그 없는 책, 좋아요 안 누른 상태) | LEFT JOIN(왼쪽 전부 + 오른쪽에서 매칭) |
- 2. DDL과 DML

찾아보기: CREATE TABLE이 테이블 구조를, INSERT가 행 데이터를 담당하는 이유와 ALTER TABLE과의 차이를 살펴보세요.

#### 1. DDL / DML 구분 기준

    - SQL 명령은 **무엇을 다루는가**에 따라 나뉜다.

| 분류 | 대상 | 명령어 |
    | --- | --- | --- |
| **DDL** (Data Definition Language) | 구조(스키마) | CREATE, ALTER, DROP, TRUNCATE |
| **DML** (Data Manipulation Language) | 행 데이터 | INSERT, UPDATE, DELETE, SELECT |

#### 2. CREATE TABLE이 구조를 담당하는 이유

  ```sql
  CREATE TABLE book (
    book_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    category_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (category_id) REFERENCES category(category_id)
  );
  ```

여기서 정하는 것은 **틀**이다.

    - 어떤 컬럼이 있는가 (`title`, `is_available`)
    - 각 컬럼이 어떤 값을 받는가 (`VARCHAR(100)`, `BOOLEAN`)
    - 어떤 값이 허용되지 않는가 (`NOT NULL`, `PRIMARY KEY`, `FOREIGN KEY`)

이 틀이 먼저 존재해야 데이터를 넣을 자리가 생긴다. 그래서 실행 순서가 `01_schema.sql` → `02_seed.sql`인 것이다.

### 3. INSERT가 행을 담당하는 이유

  ```sql
  INSERT INTO book (category_id, title, description, is_available)
  VALUES (1, '달빛 도서관', '소설', TRUE);
  ```

INSERT는 이미 정해진 틀에 **행 하나를 채워 넣는다.** 컬럼을 새로 만들거나 타입을 바꿀 수는 없다. CREATE TABLE에서 `NOT NULL`로 선언한 컬럼을 비우면 거부되는 것도, 구조가 데이터보다 상위 규칙이기 때문이다.

### 4. ALTER TABLE과의 차이

ALTER TABLE은 **이미 만들어진 구조를 바꾸는** DDL이다. CREATE와 같은 계층이고 INSERT와는 층이 다르다.

  ```sql
  ALTER TABLE book ADD COLUMN created_at DATETIME;      -- 컬럼 추가
  ALTER TABLE book MODIFY COLUMN title VARCHAR(200);    -- 타입 변경
  ALTER TABLE book DROP COLUMN description;             -- 컬럼 삭제
  ```

|  | CREATE TABLE | ALTER TABLE | INSERT |
    | --- | --- | --- | --- |
| 분류 | DDL | DDL | DML |
| 시점 | 테이블이 없을 때 | 테이블이 있을 때 | 구조가 갖춰진 뒤 |
| 바꾸는 것 | 구조 (새로 만듦) | 구조 (수정) | 데이터 (행 추가) |
- 3. PK·FK와 JOIN 조건

찾아보기: PK·FK가 무엇을 보장하는지, ON 절에서 관계가 잘못 연결되면 왜 중복 행이 생기는지 확인해 보세요.

#### 1. PK가 보장하는 것

**PRIMARY KEY = 유일성 + NOT NULL.** 한 테이블 안에서 행 하나를 특정할 수 있는 값이다.

  ```sql
  CREATE TABLE category (
    category_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL
  );
  ```

`category_id`가 1인 행은 테이블 전체에 **정확히 하나만** 존재한다. 중복도 NULL도 들어갈 수 없다. 이 "하나뿐"이라는 보장이 JOIN에서 결정적인 역할을 한다.

#### 2. FK가 보장하는 것

**FOREIGN KEY = 참조 무결성.** 다른 테이블에 실제로 존재하는 값만 들어갈 수 있다.

  ```sql
  FOREIGN KEY (category_id) REFERENCES category(category_id)
  ```

이 선언이 있으면 `category` 테이블에 없는 `category_id = 99`를 `book`에 넣으려 할 때 DB가 거부한다. 부모 행을 함부로 삭제하는 것도 막는다. 데이터가 깨진 참조를 갖지 않도록 DB 차원에서 지켜주는 장치다.

    - FK는 PK와 달리 **중복을 허용한다.** 한 카테고리에 책이 여러 권 있어야 하므로 당연한 일이고, 이것이 1:N 관계의 실체다.

#### 3. ON 절이 잘못 연결되면 왜 중복 행이 생기는가

    1. **JOIN의 동작 원리**
    - 왼쪽 행 하나당, 오른쪽에서 ON 조건을 만족하는 행 수만큼 결과가 만들어진다.

| 오른쪽 매칭 행 수 | 결과 |
    | --- | --- |
| 0개 | 그 행은 사라짐 (INNER 기준) |
| 1개 | 1행 유지 |
| 2개 이상 | **그 수만큼 복제** |

**2. PK로 JOIN하면 매칭이 1개로 고정된다**

  ```sql
  JOIN category c ON b.category_id = c.category_id
  ```

    - `c.category_id`는 **PK** → 유일성이 보장되므로 매칭이 2개일 수 없다
    - `b.category_id`는 **FK** → 존재하는 값만 들어가므로 매칭이 0개일 수 없다

매칭이 정확히 1개로 고정되어 행 수가 보존된다. 이것이 PK·FK를 따라 JOIN해야 하는 이유다.
  
---

**1 - 1 예시**

**book**

| book_id | category_id | title |
    | --- | --- | --- |
| 1 | 1 | 달빛 도서관 |
| 2 | 1 | 겨울의 편지 |
| 3 | 2 | 우주를 읽는 법 |

**category** — 정상 상태

| category_id | name |
    | --- | --- |
| 1 | 문학 |
| 2 | 과학 |

**1- 2. PK로 JOIN — 행 수 유지**

`ON b.category_id = c.category_id`

| book 행 | 오른쪽 매칭 | 결과 |
    | --- | --- | --- |
| 달빛 도서관 (1) | category 1행 | 1행 |
| 겨울의 편지 (1) | category 1행 | 1행 |
| 우주를 읽는 법 (2) | category 1행 | 1행 |

**결과 3행**

| title | name |
    | --- | --- |
| 달빛 도서관 | 문학 |
| 겨울의 편지 | 문학 |
| 우주를 읽는 법 | 과학 |

`category_id`는 PK라 매칭이 항상 1개다. 3행 넣으면 3행 나온다.

**1 - 3. 중복 가능한 컬럼으로 JOIN — 행 수 증가**

`category`에 문학이 하나 더 들어갔다고 하자.

| category_id | name |
    | --- | --- |
| 1 | 문학 |
| 2 | 과학 |
| **3** | **문학** |

`ON b.category_name = c.name` 으로 이으면:

| book 행 | 오른쪽 매칭 | 결과 |
    | --- | --- | --- |
| 달빛 도서관 (문학) | **2행** | **2행** |
| 겨울의 편지 (문학) | **2행** | **2행** |
| 우주를 읽는 법 (과학) | 1행 | 1행 |

**결과 5행**

| title | name |
    | --- | --- |
| 달빛 도서관 | 문학 |
| 달빛 도서관 | 문학 |
| 겨울의 편지 | 문학 |
| 겨울의 편지 | 문학 |
| 우주를 읽는 법 | 과학 |

`name`은 PK가 아니라 중복 가능하다. 매칭이 2개인 행은 2행으로 복제된다.

- 4. WHERE와 NULL

찾아보기: WHERE 조건에서 NULL을 = 과 비교할 수 없는 이유와 IS NULL을 사용하는 이유를 알아보세요.

#### 1. NULL은 값이 아니라 "값이 없음"이다

NULL은 0도 아니고 빈 문자열도 아니다. **아직 모르거나 존재하지 않는 상태**를 뜻한다.

| 표현 | 의미 |
    | --- | --- |
| `0` | 숫자 0이라는 값 |
| `''` | 길이 0인 문자열이라는 값 |
| `NULL` | 값이 없음 |

#### 2. = 으로 비교할 수 없는 이유

SQL의 비교 연산은 참·거짓만 반환하지 않는다. **참 / 거짓 / UNKNOWN** 세 가지가 있다 (3값 논리).

| 비교 | 결과 |
    | --- | --- |
| `1 = 1` | TRUE |
| `1 = 2` | FALSE |
| `NULL = 1` | **UNKNOWN** |
| `NULL = NULL` | **UNKNOWN** |
| `NULL <> NULL` | **UNKNOWN** |

"모르는 값"과 무언가를 비교하면 결과도 알 수 없다. 나이를 모르는 두 사람이 동갑인지 물어도 답할 수 없는 것과 같다.

#### 3. 그래서 IS NULL을 쓴다

`IS NULL`은 값을 비교하는 것이 아니라 **상태를 판별하는** 전용 연산자다. 결과가 항상 TRUE 또는 FALSE로 나온다.

| 목적 | 올바른 표현 | 잘못된 표현 |
    | --- | --- | --- |
| 아직 반납 안 함 | `returned_at IS NULL` | `returned_at = NULL` |
| 이미 반납함 | `returned_at IS NOT NULL` | `returned_at <> NULL` |

  ```sql
  SELECT b.title, r.rented_at, r.due_at
  FROM rental r
  JOIN book b ON r.book_id = b.book_id
  WHERE r.user_id = 1
    AND r.returned_at IS NULL
  ORDER BY r.due_at;
  ```

#### 4. 예제

**rental**

| rental_id | user_id | book_id | returned_at |
    | --- | --- | --- | --- |
| 1 | 1 | 2 | NULL |
| 2 | 2 | 1 | 2026-08-07 15:00:00 |

| 조건 | 결과 |
    | --- | --- |
| `returned_at = NULL` | **0행** — 모든 행이 UNKNOWN |
| `returned_at IS NULL` | 1행 (rental_id 1) |
| `returned_at IS NOT NULL` | 1행 (rental_id 2) |

문법 오류가 없어 DB가 조용히 실행하므로, 빈 결과를 보고 "데이터가 원래 없나" 하고 넘어가기 쉽다.

- 5. ORDER BY와 일관된 정렬

찾아보기: ORDER BY가 없을 때 목록 순서가 보장되지 않는 이유와 동일 값일 때의 보조 정렬 기준을 찾아보세요.

#### 1. ORDER BY가 없으면 순서가 보장되지 않는다

SQL 표준에서 테이블은 **집합**이다. 집합에는 순서 개념이 없다. `ORDER BY`를 쓰지 않으면 DB는 순서를 지킬 의무가 없고, 가장 빠른 방식으로 행을 내보낸다.

같은 쿼리를 두 번 실행해도 결과 순서가 달라질 수 있으며, 이는 버그가 아니라 명세대로 동작하는 것이다.

**순서가 바뀌는 실제 원인**

| 원인 | 설명 |
    | --- | --- |
| 실행 계획 변경 | 옵티마이저가 인덱스를 쓸지 풀스캔할지 상황에 따라 다르게 결정 |
| 인덱스 사용 여부 | 인덱스를 타면 인덱스 순서로, 아니면 저장 순서로 나옴 |
| 데이터 변경 | UPDATE·DELETE 후 물리적 저장 위치가 재사용되며 순서가 틀어짐 |
| 병렬 처리 | 여러 스레드가 나눠 읽으면 도착 순서가 달라짐 |

#### 2. 페이지네이션에서 치명적인 이유

정렬 없이 `LIMIT`/`OFFSET`을 쓰면 각 페이지가 **서로 다른 기준으로 잘린다.**

|  | 1페이지 조회 시 순서 | 2페이지 조회 시 순서 |
    | --- | --- | --- |
| 1 | A | B |
| 2 | B | A |
| 3 | C | D |
| 4 | D | C |

1페이지(`LIMIT 2 OFFSET 0`)에서 A, B를 보여줬는데, 2페이지(`LIMIT 2 OFFSET 2`)를 조회할 때 순서가 바뀌면 D, C가 나온다. 운이 나쁘면 **같은 행이 두 페이지에 중복되거나, 어떤 행은 아예 누락된다.**

사용자는 스크롤을 내리다가 같은 책을 두 번 보거나, 존재하는 책을 못 보게 된다.

#### 3. 동일 값일 때는 보조 정렬이 필요하다

정렬 기준 컬럼의 값이 같으면, 그들 사이의 순서는 **다시 보장되지 않는다.**

  ```sql
  ORDER BY due_at ASC
  ```

**rental**

| rental_id | due_at |
    | --- | --- |
| 1 | 2026-08-17 |
| 5 | 2026-08-17 |
| 2 | 2026-08-20 |

1번과 5번 중 뭐가 먼저 나올지 알 수 없다. 조회할 때마다 바뀔 수 있다.

**해결: 유일한 값을 가진 컬럼을 뒤에 붙인다**

  ```sql
  ORDER BY due_at ASC, rental_id ASC
  ```

이제 `due_at`이 같으면 `rental_id`로 순서가 결정된다. `rental_id`는 PK라 중복이 없으므로 **순서가 완전히 확정**된다.

### 4. 보조 정렬 기준 선택법

| 기준 | 적합성 |
    | --- | --- |
| PK (`book_id`, `rental_id`) | 가장 안전. 유일성이 보장됨 |
| UNIQUE 컬럼 | 안전하지만 NULL 허용 여부 확인 필요 |
| `created_at` | 같은 시각에 여러 건 생길 수 있어 불충분 |
| 이름·제목 | 중복 가능하므로 단독으로는 부족 |
- 6. LIMIT / OFFSET과 페이지네이션

찾아보기: LIMIT/OFFSET이 페이지 번호 방식과 어떻게 연결되는지, 데이터가 많아질 때 어떤 한계가 있는지 살펴보세요.

#### 1. 페이지 번호 방식과 어떻게 연결되는가

| 키워드 | 역할 |
    | --- | --- |
| LIMIT | 몇 개 가져올지 (한 페이지 크기) |
| OFFSET | 앞에서 몇 개 건너뛸지 |

**`OFFSET = (페이지번호 - 1) × LIMIT`**

| 페이지 | LIMIT | OFFSET |
    | --- | --- | --- |
| 1 | 10 | 0 |
| 2 | 10 | 10 |
| 3 | 10 | 20 |

LIMIT은 서비스 정책이라 고정이고, OFFSET만 페이지에 따라 배수로 커진다.

#### 2. 데이터가 많아질 때의 한계

    - **뒤 페이지일수록 느려진다**

OFFSET은 건너뛸 행을 실제로 읽은 뒤 버린다. 1만 페이지를 요청하면 10만 행을 읽고 99,990행을 버린 뒤 10행만 반환한다.

    - **조회 중 데이터가 바뀌면 어긋난다**

1페이지를 본 뒤 2페이지를 요청하는 사이에 새 글이 등록되면 전체가 한 칸씩 밀려, **이미 본 항목이 다시 나오거나 못 본 항목이 누락된다.**

    - **전체 개수 조회 비용**

페이지 번호 UI를 그리려면 `COUNT(*)`를 함께 실행해야 하는데, 데이터가 많으면 이 쿼리 자체가 부담이 된다.

#### 3. 대안 — 커서 기반

마지막으로 본 행의 값부터 이어서 가져오는 방식.

  ```sql
  WHERE book_id < 40 ORDER BY book_id DESC LIMIT 10;
  ```

|  | OFFSET | 커서 |
    | --- | --- | --- |
| 뒤 페이지 속도 | 느려짐 | 일정 |
| 데이터 변경 시 | 중복·누락 | 영향 없음 |
| 특정 페이지 점프 | 가능 | 불가능 |
| 적합한 UI | 페이지 번호 | 무한 스크롤 |