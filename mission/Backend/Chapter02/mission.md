- **미션 기록**
    
    #### 1. 01_schema.sql·02_seed.sql 실행 확인 화면
    
    !스키마 생성 결과
    
    스키마 생성 결과
    
    !시드 데이터 실행 화면
    
    시드 데이터 실행 화면
    
    #### 2. 미션 1 ~ 3
    
    1. 미션 1 - 문학 카테고리의 대여 가능한 도서를 최신순으로 10개 조회
        - 쿼리
        
        ```sql
        SELECT book.title, book.description, category.name
        FROM (book JOIN rental USING(book_id)) JOIN category USING(category_id)
        WHERE book.is_available = true AND category.name = '문학'
        ORDER BY returned_at DESC
        LIMIT 10 OFFSET 0;
        ```
        
        - 결과
            
            !image.png
            
        - 설명
            
            `book` 을 기준으로 책의 제목과 설명을 조회하고
            
            반납일을 기준으로 정렬하기 위해 `rental`
            
            카테고리 이름을 조회하고 필터링하기 위해 `category` 를 조인했다.
            
            `where` 절에서는 현재 대여할 수 있는 문학 카테고리의 책만 선택하고, 최근 반납된 순서로 정렬해 제일 최근 반납된 10개를 죄회했다.
            
        
    2. 미션 2 - 특정 사용자가 아직 반납하지 않은 책을 반납 예정일 순으로 조회
        - 쿼리
        
        ```sql
        SELECT book.title, rental.rented_at, rental.due_at
        FROM book JOIN rental USING(book_id)
        WHERE rental.returned_at IS NULL AND rental.user_id = 1
        ORDER BY rental.due_at;
        ```
        
        - 결과
            
            !image.png
            
        - 설명
            
            `rental` 을 기준으로 대여한 책의 제목을 가져오기 위해 `book` 을 `book_id` 로 조인했다.
            
            `where` 절에서는 사용자 1(특정 사용자)의 대여 기록 중 아직 반납하지 않은 기록만 선택하고, 반납 예정일이 가까운 순서로 정렬했다.
            
    3. 미션 3 - 특정 책의 태그 목록과 특정 사용자의 좋아요 여부를 조회
        - 쿼리
        
        ```sql
        SELECT
            b.book_id,
            t.tag_id,
            t.name AS tag_name,
            bl.user_id IS NOT NULL AS is_liked
        FROM book b
        LEFT JOIN book_tag bt
            ON b.book_id = bt.book_id
        LEFT JOIN tag t
            ON bt.tag_id = t.tag_id
        LEFT JOIN book_like bl
            ON b.book_id = bl.book_id
            AND bl.user_id = 1
        WHERE b.book_id = 1
        ORDER BY t.tag_id;
        ```
        
        - 결과
            
            !image.png
            
        - 설명
            
            `book` 을 기준으로 태그 목록을 가져오기 위해 `book_tag` 와 tag를 조인하고, 사용자 1의 좋아요 여부를 확인하기 위해 `book_like` 을 조인했다.
            
            `where` 절에서는 1번 책만 선택하며, 태크가 없는 책도 조회할 수 있도록 `LEFT JOIN` 을 사용하고 태그 번호가 작은 순서로 목록을 정렬했다.
            
    
    #### 3. 1주차 확장 미션
    
    - 자신의 1주차 ERD에서 같은 방식으로 화면 조회 요구사항 1개와 SQL을 작성합니다.
    - 1주차 기준 ERD 또는 자신의 ERD에서 JOIN 경로를 표시합니다.
    - 실행 결과가 요구사항 문장과 일치하는지 한 문장으로 검증합니다.
    
    - ERD
    
    !umc_workbook_final.png
    
    - 설명
        
        ## 1. `region` — 지역
        
        사용자와 가게가 어느 지역에 속하는지 관리하는 기준 테이블이다.
        
        | 컬럼 | 의미 | 언제 사용하는가 |
        | --- | --- | --- |
        | `id` | 지역을 구분하는 PK | 사용자·가게의 지역을 연결할 때 |
        | `name` | 지역 이름 | 지역별 가게 조회, 사용자 지역 표시 등에 사용 |
        
        ---
        
        ## 2. `food_category` — 음식 종류
        
        한식, 중식, 일식처럼 음식 카테고리를 관리한다.
        
        | 컬럼 | 의미 | 언제 사용하는가 |
        | --- | --- | --- |
        | `id` | 음식 카테고리 PK | 가게와 사용자의 선호 음식에 연결할 때 |
        | `name` | 음식 종류 이름 | 카테고리 목록이나 가게의 음식 종류를 표시할 때 |
        | `image_url` | 카테고리 이미지 주소 | 화면에 음식 카테고리 이미지를 보여줄 때 |
        | `created_at` | 생성 일시 | 카테고리가 등록된 시점을 확인할 때 |
        | `updated_at` | 수정 일시 | 카테고리가 마지막으로 수정된 시점을 확인할 때 |
        | `deleted_at` | 삭제 일시 | 실제 삭제 대신 소프트 삭제할 때 사용 |
        
        ---
        
        ## 3. `member` — 사용자
        
        서비스를 이용하는 사용자의 계정과 개인 정보를 관리한다.
        
        | 컬럼 | 의미 | 언제 사용하는가 |
        | --- | --- | --- |
        | `id` | 사용자 PK | 사용자를 다른 테이블과 연결할 때 |
        | `region_id` | 사용자가 속한 지역의 FK | 사용자 주변의 가게나 미션을 조회할 때 |
        | `social_type` | 소셜 로그인 종류 | 카카오·네이버·구글·애플 로그인 제공자를 구분할 때 |
        | `social_id` | 소셜 서비스에서 받은 사용자 식별자 | 소셜 로그인 사용자를 찾을 때 |
        | `email` | 사용자 이메일 | 계정 정보 표시나 알림에 사용할 때 |
        | `name` | 사용자 이름 | 프로필이나 사용자 정보에 표시할 때 |
        | `gender` | 사용자 성별 | 사용자 정보 저장이나 통계에 사용할 때 |
        | `birth` | 생년월일 | 나이 확인이나 맞춤 정보 제공에 사용할 때 |
        | `zipcode` | 우편번호 | 사용자 주소를 관리할 때 |
        | `address` | 기본 주소 | 사용자의 거주 지역을 표시할 때 |
        | `address_detail` | 상세 주소 | 동·호수 등 상세 주소를 저장할 때 |
        | `point` | 보유 포인트 | 미션 보상 지급이나 포인트 사용 시 사용 |
        | `status` | 회원 상태 | 정상 회원과 탈퇴·비활성 회원을 구분할 때 |
        | `created_at` | 가입 일시 | 회원 가입 시점을 확인할 때 |
        | `updated_at` | 수정 일시 | 회원 정보가 마지막으로 변경된 시점을 확인할 때 |
        | `deleted_at` | 탈퇴·삭제 일시 | 회원 정보를 소프트 삭제할 때 |
        
        `social_type`과 `social_id`를 함께 사용하면 소셜 로그인 사용자를 구분할 수 있다.
        
        ---
        
        ## 4. `store` — 가게
        
        서비스에 등록된 음식점의 기본 정보와 영업시간을 관리한다.
        
        | 컬럼 | 의미 | 언제 사용하는가 |
        | --- | --- | --- |
        | `id` | 가게 PK | 가게를 미션과 연결할 때 |
        | `region_id` | 가게가 속한 지역의 FK | 지역별 가게를 조회할 때 |
        | `food_id` | 가게의 음식 카테고리 FK | 한식·중식 등 음식 종류별로 조회할 때 |
        | `name` | 가게 이름 | 가게 목록과 상세 화면에 표시할 때 |
        | `address` | 가게 주소 | 가게 위치를 표시할 때 |
        | `open_at` | 영업 시작 시간 | 현재 영업 중인지 판단할 때 |
        | `close_at` | 영업 종료 시간 | 현재 영업 중인지 판단할 때 |
        | `created_at` | 생성 일시 | 가게가 등록된 시점을 확인할 때 |
        | `updated_at` | 수정 일시 | 가게 정보의 마지막 수정 시점을 확인할 때 |
        | `deleted_at` | 삭제 일시 | 폐점한 가게 등을 소프트 삭제할 때 |
        
        ---
        
        ## 5. `mission` — 미션
        
        특정 가게에서 사용자가 수행할 수 있는 미션을 관리한다.
        
        | 컬럼 | 의미 | 언제 사용하는가 |
        | --- | --- | --- |
        | `id` | 미션 PK | 사용자의 미션 수행 기록과 연결할 때 |
        | `store_id` | 미션을 진행하는 가게의 FK | 특정 가게의 미션을 조회할 때 |
        | `condition` | 미션 수행 조건 | ‘15,000원 이상 주문하기’ 등의 조건을 표시할 때 |
        | `start_at` | 미션 시작 일시 | 미션이 시작되었는지 확인할 때 |
        | `end_at` | 미션 종료 일시 | 미션 기간이 끝났는지 확인할 때 |
        | `required_amount` | 미션 달성에 필요한 금액 | 최소 주문 금액 등을 검사할 때 |
        | `reward_point` | 미션 완료 보상 포인트 | 미션 완료 후 사용자에게 포인트를 지급할 때 |
        | `created_at` | 생성 일시 | 미션 등록 시점을 확인할 때 |
        | `updated_at` | 수정 일시 | 미션의 마지막 수정 시점을 확인할 때 |
        | `deleted_at` | 삭제 일시 | 종료·삭제된 미션을 소프트 삭제할 때 |
        
        ---
        
        ## 6. `member_prefer_food` — 사용자 선호 음식
        
        사용자와 음식 카테고리의 N:M 관계를 표현하는 연결 테이블이다. 한 사용자가 여러 음식 종류를 선호하고, 하나의 음식 종류를 여러 사용자가 선호할 수 있다.
        
        | 컬럼 | 의미 | 언제 사용하는가 |
        | --- | --- | --- |
        | `id` | 선호 음식 기록 PK | 각각의 선호 기록을 구분할 때 |
        | `member_id` | 사용자 FK | 특정 사용자의 선호 음식 목록을 조회할 때 |
        | `food_id` | 음식 카테고리 FK | 특정 음식 종류를 선호하는 사용자를 조회할 때 |
        | `created_at` | 생성 일시 | 선호 음식이 등록된 시점을 확인할 때 |
        | `updated_at` | 수정 일시 | 선호 기록의 마지막 수정 시점을 확인할 때 |
        | `deleted_at` | 삭제 일시 | 선호 음식 선택을 소프트 삭제할 때 |
        
        사용자의 선호 카테고리에 맞는 가게나 미션을 추천할 때 사용한다.
        
        ---
        
        ## 7. `member_mission` — 사용자 미션 수행 기록
        
        어떤 사용자가 어떤 미션에 참여했으며 현재 어떤 상태인지 관리하는 연결 테이블이다.
        
        | 컬럼 | 의미 | 언제 사용하는가 |
        | --- | --- | --- |
        | `id` | 미션 수행 기록 PK | 개별 수행 기록을 구분할 때 |
        | `member_id` | 미션에 참여한 사용자 FK | 사용자가 참여한 미션을 조회할 때 |
        | `mission_id` | 사용자가 참여한 미션 FK | 특정 미션의 참여자를 조회할 때 |
        | `status` | 미션 진행 상태 | 도전 중과 완료 상태를 구분할 때 |
        | `completed_at` | 미션 완료 일시 | 미션을 완료한 시점을 기록할 때 |
        | `created_at` | 미션 참여 시작 일시 | 사용자가 미션을 시작한 시점을 확인할 때 |
        | `updated_at` | 수정 일시 | 진행 상태의 마지막 변경 시점을 확인할 때 |
        | `deleted_at` | 삭제 일시 | 수행 기록을 소프트 삭제할 때 |
        
        `status`가 `CHALLENGING`일 때 `completed_at`은 `NULL`이고, 완료되면 `COMPLETE`와 함께 완료 시간을 저장한다.
        
        ---
        
        ## 8. `term` — 약관
        
        서비스 이용약관, 개인정보 처리방침 등의 약관 내용을 관리한다.
        
        | 컬럼 | 의미 | 언제 사용하는가 |
        | --- | --- | --- |
        | `id` | 약관 PK | 사용자 동의 기록과 연결할 때 |
        | `title` | 약관 제목 | 약관 목록에 제목을 표시할 때 |
        | `content` | 약관 내용 | 약관 상세 내용을 보여줄 때 |
        | `is_required` | 필수 동의 여부 | 필수 약관과 선택 약관을 구분할 때 |
        | `version` | 약관 버전 | 약관이 변경됐을 때 이전 버전과 구분할 때 |
        | `created_at` | 생성 일시 | 약관이 등록된 시점을 확인할 때 |
        | `updated_at` | 수정 일시 | 약관이 마지막으로 수정된 시점을 확인할 때 |
        | `deleted_at` | 삭제 일시 | 사용하지 않는 약관을 소프트 삭제할 때 |
        
        `version`이 필요한 이유는 약관 내용이 변경되었을 때 사용자가 어느 버전의 약관에 동의했는지 구분해야 하기 때문이다.
        
        ---
        
        ## 9. `member_term` — 사용자 약관 동의
        
        사용자가 어떤 약관에 동의했는지를 관리하는 연결 테이블이다.
        
        | 컬럼 | 의미 | 언제 사용하는가 |
        | --- | --- | --- |
        | `id` | 약관 동의 기록 PK | 개별 동의 기록을 구분할 때 |
        | `member_id` | 동의한 사용자 FK | 특정 사용자의 동의 내역을 조회할 때 |
        | `term_id` | 동의 대상 약관 FK | 어떤 약관에 동의했는지 확인할 때 |
        | `agreed` | 동의 여부 | 동의와 미동의를 구분할 때 |
        | `agreed_at` | 동의 처리 일시 | 사용자가 약관에 동의한 시점을 확인할 때 |
        
        회원가입 시 필수 약관에 모두 동의했는지 검사하거나, 특정 약관 버전에 대한 사용자의 동의 기록을 확인할 때 사용한다.
        
        ## 공통 시간 컬럼
        
        - `created_at`: 데이터가 처음 생성된 시간
        - `updated_at`: 데이터가 마지막으로 수정된 시간
        - `deleted_at`: 데이터가 삭제된 시간
        - `deleted_at IS NULL`: 현재 사용 중인 데이터
        - `deleted_at IS NOT NULL`: 삭제 처리된 데이터
        
        `deleted_at`을 사용하는 방식은 행을 실제로 지우지 않고 삭제 상태로 관리하는 **소프트 삭제** 방식이다.
        
    - 시드 데이터
        
        ```sql
        -- 1. 지역
        INSERT INTO region (id, name)
        VALUES
            (1, '서울특별시 마포구'),
            (2, '인천광역시 미추홀구'),
            (3, '경기도 수원시');
        
        -- 2. 음식 카테고리
        INSERT INTO food_category (
            id, name, image_url,
            created_at, updated_at, deleted_at
        )
        VALUES
            (1, '한식', '/images/korean-food.png', NOW(), NOW(), NULL),
            (2, '일식', '/images/japanese-food.png', NOW(), NOW(), NULL),
            (3, '카페·디저트', '/images/cafe.png', NOW(), NOW(), NULL),
            (4, '중식', '/images/chinese-food.png', NOW(), NOW(), NULL);
        
        -- 3. 사용자
        INSERT INTO member (
            id, region_id, social_type, social_id,
            email, name, gender, birth,
            zipcode, address, address_detail,
            point, status,
            created_at, updated_at, deleted_at
        )
        VALUES
            (
                1, 1, 'KAKAO', 'kakao_1001',
                'jieun@example.com', '이지은', 'FEMALE', '2002-05-15',
                '04001', '서울특별시 마포구 월드컵로', '101동 101호',
                1200, 'ACTIVE',
                NOW(), NOW(), NULL
            ),
            (
                2, 2, 'GOOGLE', 'google_2001',
                'minsu@example.com', '김민수', 'MALE', '2001-03-20',
                '22100', '인천광역시 미추홀구 인하로', '202동 202호',
                500, 'ACTIVE',
                NOW(), NOW(), NULL
            ),
            (
                3, 1, 'NAVER', 'naver_3001',
                'yuri@example.com', '최유리', 'FEMALE', '2003-08-11',
                '04002', '서울특별시 마포구 양화로', '303호',
                0, 'INACTIVE',
                NOW(), NOW(), NOW()
            );
        
        -- 4. 가게
        INSERT INTO store (
            id, region_id, food_id,
            name, address, open_at, close_at,
            created_at, updated_at, deleted_at
        )
        VALUES
            (
                1, 1, 1,
                '온담한식', '서울특별시 마포구 월드컵로 10',
                '09:00:00', '21:00:00',
                NOW(), NOW(), NULL
            ),
            (
                2, 1, 2,
                '스시하루', '서울특별시 마포구 홍익로 20',
                '11:00:00', '22:00:00',
                NOW(), NOW(), NULL
            ),
            (
                3, 1, 3,
                '카페모먼트', '서울특별시 마포구 양화로 30',
                '10:00:00', '23:00:00',
                NOW(), NOW(), NULL
            ),
            (
                4, 2, 1,
                '인천밥상', '인천광역시 미추홀구 인하로 40',
                '09:00:00', '20:00:00',
                NOW(), NOW(), NULL
            ),
            (
                5, 1, 4,
                '홍등루', '서울특별시 마포구 독막로 50',
                '11:00:00', '21:00:00',
                NOW(), NOW(), NOW()
            );
        
        -- 5. 미션
        INSERT INTO mission (
            id, store_id, `condition`,
            start_at, end_at,
            required_amount, reward_point,
            created_at, updated_at, deleted_at
        )
        VALUES
            -- 현재 참여 가능: 사용자 1과 같은 지역
            (
                1, 1, '15,000원 이상 주문',
                DATE_SUB(NOW(), INTERVAL 5 DAY),
                DATE_ADD(NOW(), INTERVAL 10 DAY),
                15000, 500,
                NOW(), NOW(), NULL
            ),
            (
                2, 2, '20,000원 이상 주문',
                DATE_SUB(NOW(), INTERVAL 3 DAY),
                DATE_ADD(NOW(), INTERVAL 5 DAY),
                20000, 700,
                NOW(), NOW(), NULL
            ),
            (
                3, 3, '음료 2잔 이상 주문',
                DATE_SUB(NOW(), INTERVAL 1 DAY),
                DATE_ADD(NOW(), INTERVAL 2 DAY),
                12000, 700,
                NOW(), NOW(), NULL
            ),
        
            -- 다른 지역이므로 사용자 1의 목록에서 제외
            (
                4, 4, '10,000원 이상 주문',
                DATE_SUB(NOW(), INTERVAL 2 DAY),
                DATE_ADD(NOW(), INTERVAL 7 DAY),
                10000, 1000,
                NOW(), NOW(), NULL
            ),
        
            -- 이미 종료된 미션
            (
                5, 1, '리뷰 작성하기',
                DATE_SUB(NOW(), INTERVAL 10 DAY),
                DATE_SUB(NOW(), INTERVAL 1 DAY),
                NULL, 300,
                NOW(), NOW(), NULL
            ),
        
            -- 삭제된 미션
            (
                6, 2, '포장 주문하기',
                DATE_SUB(NOW(), INTERVAL 1 DAY),
                DATE_ADD(NOW(), INTERVAL 10 DAY),
                NULL, 900,
                NOW(), NOW(), NOW()
            ),
        
            -- 아직 시작되지 않은 미션
            (
                7, 3, '디저트 함께 주문',
                DATE_ADD(NOW(), INTERVAL 3 DAY),
                DATE_ADD(NOW(), INTERVAL 15 DAY),
                18000, 800,
                NOW(), NOW(), NULL
            ),
        
            -- 가게가 삭제된 경우
            (
                8, 5, '30,000원 이상 주문',
                DATE_SUB(NOW(), INTERVAL 1 DAY),
                DATE_ADD(NOW(), INTERVAL 20 DAY),
                30000, 1500,
                NOW(), NOW(), NULL
            );
        
        -- 6. 사용자 선호 음식
        INSERT INTO member_prefer_food (
            id, member_id, food_id,
            created_at, updated_at, deleted_at
        )
        VALUES
            (1, 1, 1, NOW(), NOW(), NULL),
            (2, 1, 3, NOW(), NOW(), NULL),
            (3, 2, 1, NOW(), NOW(), NULL),
            (4, 2, 2, NOW(), NOW(), NULL);
        
        -- 7. 사용자 미션 수행 기록
        INSERT INTO member_mission (
            id, member_id, mission_id,
            status, completed_at,
            created_at, updated_at, deleted_at
        )
        VALUES
            (
                1, 1, 1,
                'CHALLENGING', NULL,
                NOW(), NOW(), NULL
            ),
            (
                2, 1, 5,
                'COMPLETE', DATE_SUB(NOW(), INTERVAL 2 DAY),
                DATE_SUB(NOW(), INTERVAL 5 DAY), NOW(), NULL
            ),
            (
                3, 2, 4,
                'CHALLENGING', NULL,
                NOW(), NOW(), NULL
            );
        
        -- 8. 약관
        INSERT INTO term (
            id, title, content,
            is_required, version,
            created_at, updated_at, deleted_at
        )
        VALUES
            (
                1, '서비스 이용약관',
                '서비스 이용에 필요한 기본 약관입니다.',
                TRUE, '1.0',
                NOW(), NOW(), NULL
            ),
            (
                2, '개인정보 처리방침',
                '개인정보 수집 및 이용에 관한 약관입니다.',
                TRUE, '1.0',
                NOW(), NOW(), NULL
            ),
            (
                3, '마케팅 정보 수신 동의',
                '이벤트 및 혜택 정보 수신에 관한 약관입니다.',
                FALSE, '1.0',
                NOW(), NOW(), NULL
            );
        
        -- 9. 사용자 약관 동의
        INSERT INTO member_term (
            id, member_id, term_id,
            agreed, agreed_at
        )
        VALUES
            (1, 1, 1, TRUE, NOW()),
            (2, 1, 2, TRUE, NOW()),
            (3, 1, 3, FALSE, NOW()),
            (4, 2, 1, TRUE, NOW()),
            (5, 2, 2, TRUE, NOW());
        ```
        
    
    - 회면 조회 요구사항
        
        <aside>
        💡
        
        ### 화면 요구사항
        
        **사용자가 자신의 지역에서 현재 도전할 수 있는 미션 목록을 조회한다.**
        
        화면에는 다음 정보를 표시한다.
        
        - 가게 이름
        - 음식 카테고리
        - 미션 수행 조건
        - 필요한 금액
        - 보상 포인트
        - 미션 종료 일시
        
        조회 조건은 다음과 같다.
        
        - 로그인한 사용자와 같은 지역의 가게만 조회
        - 아직 종료되지 않은 미션만 조회
        - 삭제되지 않은 가게와 미션만 조회
        - 보상 포인트가 높은 순서로 정렬
        - 보상 포인트가 같으면 종료 일시가 빠른 순서로 정렬
        - 한 페이지에 10개씩 조회
        </aside>
        
    - SQL
        - 쿼리
            
            ```sql
            SELECT
                s.name AS store_name,
                fc.name AS food_category,
                m.`condition` AS mission_condition,
                m.required_amount,
                m.reward_point,
                m.end_at
            FROM member mem
            JOIN store s
                ON mem.region_id = s.region_id
            JOIN food_category fc
                ON s.food_id = fc.id
            JOIN mission m
                ON s.id = m.store_id
            WHERE mem.id = 1
              AND mem.deleted_at IS NULL
              AND s.deleted_at IS NULL
              AND fc.deleted_at IS NULL
              AND m.deleted_at IS NULL
              AND m.start_at <= NOW()
              AND m.end_at >= NOW()
            ORDER BY m.reward_point DESC, m.end_at ASC
            LIMIT 10 OFFSET 0;
            ```
            
        - 결과
            
            !image.png
            
        - 설명
            
            `member` 를 기준으로 사용자 1과 같은 지역에 있는 가게를 찾고, 
            
            음식 종류와 진행 가능한 미션 정보를 조회하기 위해 `store` , `food_category` , `mission` 을 조인했다.
            
            삭제되지 않았으며 현재 날짜가 미션 진행 기간에 포함되는 데이터만 조회하고, 리워드 포인트가 높은 순서로 정렬하되 포인트가 같으면 종료일이 빠른 미션을 먼저 표시한다.