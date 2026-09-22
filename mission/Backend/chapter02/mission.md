## 01_schema.sql·02_seed.sql 실행 확인 화면
<img width="897" height="667" alt="Image" src="https://github.com/user-attachments/assets/e82a3465-6291-4ec1-9dd5-63a9ee998eff" />

# 미션 1
문학 카테고리의 대여 가능한 도서를 최신순으로 10개 조회
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
- 기준 테이블: `book` 테이블을 기준으로 조회한다. 실제로 조회하려는 대상이 도서이기 때문에 `book`을 기준 테이블로 설정하고, 각 도서의 제목, 설명 등의 정보를 가져온다.
JOIN한 이유: `book` 테이블에는 카테고리의 이름이 아닌 `category_id`만 저장되어 있기 때문에, `category` 테이블과 JOIN하여 해당 도서가 어떤 카테고리에 속하는지 확인한다. `b.category_id = c.category_id` 조건을 통해 각 도서와 해당 카테고리를 연결하고, `c.name`을 이용해 카테고리 이름을 조회한다.
- WHERE 조건: `c.name = '문학'`을 통해 문학 카테고리에 속하는 도서만 조회한다. 또한 `b.is_available = TRUE` 조건을 추가하여 현재 대여 가능한 도서만 결과에 포함한다. 따라서 문학 카테고리에 속하더라도 현재 대여 중인 도서는 조회되지 않는다.
- 정렬·목록 기준: `ORDER BY b.book_id DESC`를 사용하여 `book_id`가 큰 도서부터 내림차순으로 정렬한다. 이 데이터에서는 `book_id`가 증가하는 순서로 새로운 도서가 추가되므로, ID가 큰 도서를 최신 도서로 간주한다. 이후 `LIMIT 10`을 사용하여 정렬된 결과 중 최대 10개의 도서만 조회한다.

<img width="586" height="145" alt="Image" src="https://github.com/user-attachments/assets/1a2d3beb-1363-4f24-b9d5-ed54d21cfb48" />

# 미션 2
특정 사용자가 아직 반납하지 않은 책을 반납 예정일 순으로 조회
```sql
SELECT
    b.title,
    r.rented_at,
    r.due_at
FROM rental r
JOIN book b
    ON r.book_id = b.book_id
WHERE r.user_id = 1
  AND r.returned_at IS NULL
ORDER BY r.due_at ASC;
```
- 기준 테이블: `rental` 테이블을 기준으로 조회한다. 이 미션에서 필요한 정보는 특정 사용자의 대여 기록이므로, 어떤 사용자가 어떤 책을 대여했는지를 기록하고 있는 `rental` 테이블을 기준으로 설정한다.
- JOIN한 이유: `rental` 테이블에는 대여한 책을 식별하기 위한 `book_id`가 저장되어 있지만, 책의 실제 제목은 `book` 테이블에 저장되어 있다. 따라서 `r.book_id = b.book_id` 조건으로 `book` 테이블과 JOIN하여 사용자가 대여한 책의 제목을 가져온다.
- WHERE 조건: `r.user_id = 1`을 통해 사용자 ID가 1인 사용자의 대여 기록만 조회한다. 또한 `r.returned_at IS NULL` 조건을 사용하여 아직 반납되지 않은 대여 기록만 조회한다. `returned_at`에 반납 시간이 기록되어 있다면 이미 반납한 책이므로 결과에서 제외된다.
정렬·목록 기준: ORDER BY r.due_at ASC를 사용하여 반납 예정일인 due_at을 오름차순으로 정렬한다. 따라서 반납 예정일이 가장 빠른 책부터 순서대로 조회되며, 별도의 LIMIT을 설정하지 않았기 때문에 해당 사용자가 아직 반납하지 않은 모든 대여 기록을 조회한다.
- 조회 결과: 최종적으로 사용자 ID가 1인 사용자가 현재 대여 중인 책을 대상으로 책 제목, 대여일, 반납 예정일을 확인할 수 있으며, 반납 예정일이 빠른 순서대로 결과가 정렬된다.

<img width="512" height="129" alt="Image" src="https://github.com/user-attachments/assets/7a011c16-0800-4fba-8e01-39765c23f928" />

# 미션 3
특정 책의 태그 목록과 특정 사용자의 좋아요 여부 조회
```sql
SELECT
    b.title,
    t.name AS tag_name,
    CASE
        WHEN bl.user_id IS NOT NULL THEN TRUE
        ELSE FALSE
    END AS is_liked
FROM book b
JOIN book_tag bt
    ON b.book_id = bt.book_id
JOIN tag t
    ON bt.tag_id = t.tag_id
LEFT JOIN book_like bl
    ON b.book_id = bl.book_id
   AND bl.user_id = 1
WHERE b.book_id = 1;
```
- 기준 테이블: `book` 테이블을 기준으로 조회하며, `book_id = 1`인 특정 책의 태그와 좋아요 정보를 확인한다.
- JOIN한 이유: `book_tag`와 `tag`를 JOIN하여 해당 책에 연결된 태그 이름을 가져온다. `book_like`는 특정 사용자의 좋아요 기록을 확인하기 위해 JOIN한다. 좋아요 기록이 없는 경우에도 책의 태그 정보는 조회되어야 하므로 `book_like`에는 LEFT JOIN을 사용한다.
- WHERE 조건: `b.book_id = 1`로 조회할 책을 지정하고, `bl.user_id = 1`인 좋아요 기록만 연결하여 특정 사용자의 좋아요 여부를 확인한다.
- 정렬·목록 기준: 별도의 `ORDER BY`나 `LIMIT`이 없어 해당 책에 연결된 모든 태그를 조회한다.

<img width="502" height="142" alt="Image" src="https://github.com/user-attachments/assets/cdab268f-c74a-49b1-a1e5-5cc4514aead3" />

---
### 확장 미션

- 특정 사용자가 받은 미션 목록 조회
    
    ```sql
    SELECT
        m.title,
        m.description,
        m.reward_point,
        um.status,
        um.received_at
    FROM UserMission um
    JOIN Mission m
        ON um.mission_id = m.id
    WHERE um.user_id = 1
    ORDER BY um.received_at DESC;
    ```
    
    - 기준 테이블: `UserMission`을 기준으로 조회한다. 특정 사용자가 받은 미션 정보를 조회하는 것이므로 사용자의 미션 참여 기록을 담고 있는 `UserMission`을 기준으로 한다.
    - JOIN한 이유: `UserMission`에는 미션 ID만 저장되어 있으므로 `Mission`과 JOIN하여 미션 제목, 설명, 보상 포인트 등의 정보를 가져온다.
    - WHERE 조건: `um.user_id = 1`을 통해 특정 사용자에게 해당하는 미션만 조회한다.
    - 정렬·목록 기준: `received_at`을 내림차순으로 정렬하여 최근에 받은 미션부터 조회한다. 별도의 `LIMIT`이 없으므로 해당 사용자가 받은 모든 미션을 조회한다.