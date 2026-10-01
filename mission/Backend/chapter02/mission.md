- 미션1 정답

    ```sql
    SELECT b.title, b.description, c.name
    FROM book b
    JOIN category c ON b.category_id = c.category_id
    WHERE c.name = '문학'
      AND b.is_available = TRUE
    ORDER BY b.book_id DESC
    LIMIT 10;
    ```

  `book`을 기준으로 시작하고, 카테고리 이름이 필요하여 `book.category_id(FK)`로 `category`를 INNER JOIN했다. WHERE로 카테고리 이름이 '문학'이면서 `is_available`이 TRUE인 책만 남겼다. 최신순은 PK인 `book_id` 내림차순으로 정렬하고 LIMIT 10으로 개수를 제한했다.

![image (1).png](image%20%281%29.png)

- 미션2 정답

    ```sql
    SELECT b.title, r.rented_at, r.due_at
    FROM rental r
    JOIN book b ON r.book_id = b.book_id
    WHERE r.user_id = 1
      AND r.returned_at IS NULL
    ORDER BY r.due_at ASC;
    ```

  미반납 여부와 사용자 조건이 모두 대여 기록에 있어 `rental`을 기준으로 시작하고, 책 제목을 위해 `rental.book_id(FK)`로 `book`을 INNER JOIN했다. WHERE로 특정 사용자이면서 `returned_at IS NULL`인 대여만 남겼으며, NULL은 `=`로 비교할 수 없어 `IS NULL`을 사용했다. 반납이 임박한 순서로 보여주기 위해 `due_at` 오름차순으로 정렬했다.

![image (2).png](image%20%282%29.png)

- 미션3 정답

    ```sql
    SELECT b.title,
           t.name,
           CASE WHEN bl.user_id IS NULL THEN FALSE ELSE TRUE END AS is_liked
    FROM book b
    LEFT JOIN book_tag bt ON b.book_id = bt.book_id
    LEFT JOIN tag t ON bt.tag_id = t.tag_id
    LEFT JOIN book_like bl ON b.book_id = bl.book_id AND bl.user_id = 1
    WHERE b.book_id = 1;
    ```

  상세 화면의 주체인 `book`을 기준으로, 태그는 `book_tag`를 거쳐 `tag`로, 좋아요는 `book_like`로 연결했다. 태그가 없거나 좋아요를 누르지 않아도 책은 나와야 하므로 LEFT JOIN을 썼고, 사용자 조건은 WHERE가 아닌 ON에 두어 행이 사라지지 않게 했다. WHERE로 특정 `book_id`만 조회하며, 단건 상세라 정렬과 LIMIT은 두지 않았다.

![image (3).png](image%20%283%29.png)

- 미션4 정답

    ```sql
    SELECT s.name AS store_name, m.mission_condition, m.reward_point
    FROM member_mission mm
    JOIN mission m ON mm.mission_id = m.id
    JOIN store s ON m.store_id = s.id
    WHERE mm.member_id = 1
      AND mm.status = 'CHALLENGING'
      AND mm.deleted_at IS NULL
    ORDER BY mm.created_at DESC, mm.id DESC;
    ```

  사용자와 진행 상태가 모두 수행 기록에 있어 `member_mission`을 기준으로 시작하고, 미션 조건과 보상을 위해 `mission`을, 가게 이름을 위해 `mission.store_id(FK)`로 `store`를 JOIN했다. WHERE로 특정 사용자이면서 상태가 `CHALLENGING`이고 삭제되지 않은(`deleted_at IS NULL`) 기록만 남겼다.
  
![image (4).png](image%20%284%29.png)