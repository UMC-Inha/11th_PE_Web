1. 미션 1. 문학 카테고리의 대여 가능한 도서를 최신순으로 10개 조회합니다.
    - 미션 1 결과에는 책 제목, 설명, 카테고리 이름을 포함합니다.
    
    ```jsx
    SELECT b.title, b.description, c.name
    FROM book b 
    JOIN category c ON c.category_id = b.category_id
    WHERE c.name = "문학"
    AND b.is_available = TRUE
    ORDER BY b.book_id DESC
    LIMIT 10;
    ```
    
    !스크린샷 2026-09-21 오후 5.31.31.png
    
    - 미션 2. 특정 사용자가 아직 반납하지 않은 책을 반납 예정일 순으로 조회합니다.
    
    ```jsx
    SELECT b.title, r.rented_at, r.due_at
    FROM rental r
    JOIN book b ON b.book_id = r.book_id
    WHERE r.user_id = 1
    AND r.returned_at IS NULL
    ORDER BY r.due_at ASC, r.rental_id ASC;
    ```
    
    !스크린샷 2026-09-21 오후 5.31.13.png
    
2. 미션 2 결과에는 책 제목, 대여일, 반납 예정일을 포함합니다.
    - 미션 3. 특정 책의 태그 목록과 특정 사용자의 좋아요 여부를 조회합니다.
    
    ```jsx
    SELECT b.title, t.name,
        CASE
            WHEN bl.user_id IS NOT NULL THEN "좋아요"
            ELSE "좋아요 안 함"
        END
    FROM book b 
    LEFT JOIN book_tag bt ON b.book_id = bt.book_id
    LEFT JOIN tag t ON bt.tag_id = t.tag_id
    LEFT JOIN book_like bl ON b.book_id = bl.book_id
    AND bl.user_id = ?
    WHERE b.book_id = ?
    ORDER BY t.name ASC;
    ```
    
    - 각 쿼리에서 기준 테이블, JOIN한 이유, WHERE 조건, 정렬·목록 기준을 설명합니다.
    
    ```
    SELECT b.title, t.name,
        CASE
            WHEN bl.user_id IS NOT NULL THEN "좋아요"
            ELSE "좋아요 안 함"
        END
    FROM book b 
    LEFT JOIN book_tag bt ON b.book_id = bt.book_id
    LEFT JOIN tag t ON bt.tag_id = t.tag_id
    LEFT JOIN book_like bl ON b.book_id = bl.book_id
    AND bl.user_id = ?
    WHERE b.book_id = ?
    ORDER BY t.name ASC;
    ```
    
    우선 이 쿼리의 기준 테이블은 book이다. 
    
    book과 tag는 다대다 관계로 책에 어떤 태그가 있는지 조인하여 확인하여야 한다.  
    
    book_tag에는 tag_id만 있어 태그 이름을 가져오기 위해 조인한다.
    
    사용자가 책을 좋아요 눌렀는지 확인하기 위해 book과 book_like 테이블을 조인하여야한다. bl.user_id의 존재 여부로 확인한다.
    
    book_id로 필터링하고 태그 name을 기준으로 오름차순 정리한다.
    
    - 확장. 자신의 1주차 ERD에서 같은 방식으로 화면 조회 요구사항 1개와 SQL을 작성합니다.
        
        요구사항: 회원이 선호 음식 카테고리로 설정한 식당 목록을 평점순으로 20개까지 조회
        
    
    ```jsx
    SELECT r.restaurant_name, r.address, fc.food_type, r.average_rating, r.review_count
    FROM member_food_category mfc
    JOIN food_category fc ON r.food_category_id2
    JOIN restaurant r ON r.food_category_id = fc.food_category_id
    WHERE mfc.member_id = ?
    ORDER BY r.average_rating DESC, r.review_count DESC, r.restaurant_id ASC
    LIMIT 20;
    ```
    
          식당 이름, 주소, 음식 카테고리, 평점, 리뷰수를 나타내게 된다.
    
    member_food_category를 기준 테이블로 하여 음식 카테고리명과 긷당을 가져온다. 후에 평점이 높은순 → 리뷰 수가 많은 순 → 식당 id순으로 최대 20개만 나타내게 된다.
    
3. 공통 더미 데이터에서 실행한 결과를 캡처합니다.
    - 1주차 기준 ERD 또는 자신의 ERD에서 JOIN 경로를 표시합니다.
        
        !F7FD02B3-005D-42CA-96EF-D01CA3B9C709_1_201_a.jpeg
        
    - 실행 결과가 요구사항 문장과 일치하는지 한 문장으로 검증합니다.
        
        회원의 선호 음식 카테고리의 식당을 평점→리뷰수→식당 id순으로 최대 20개 조회하게 된다.