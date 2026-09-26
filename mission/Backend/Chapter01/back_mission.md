- **미션 기록**
    
    # ERD 설계 과정
    
    ## 1. 기능 정리
    
    화면과 추가 요구사항을 보고 필요한 기능을 먼저 정리했다.
    
    - 소셜 로그인과 회원가입
    - 회원 정보 수정 및 회원 탈퇴
    - 약관 동의
    - 음식 선호 조사
    - 가게 목록, 지도 및 검색
    - 미션 수행과 완료
    - 리뷰 작성
    - 포인트 적립 및 사용 내역 조회
    - 알림 설정 및 조회
    - 1:1 문의 작성과 문의 목록 조회
    - 사장님의 점포 관리
    
    ---
    
    ## 2. 규칙
    
    테이블과 컬럼 이름은 모두 `snake_case` 소문자로 작성했다. 모든 테이블의 PK는 `id BIGINT AUTO_INCREMENT`로 통일했다.
    
    각 테이블이 자신의 `id`를 PK로 가지도록 하여 테이블 사이의 관계는 점선인 비식별 관계로 연결했다. 회원과 미션처럼 N:M 관계인 경우에는 중간 테이블을 만들었다.
    
    반드시 필요한 값에는 `NOT NULL`을 설정하고, 입력하지 않을 수 있는 값은 `NULL`을 허용했다.
    
    ---
    
    ## 3. 회원과 소셜 로그인
    
    회원 정보는 `members`에 저장하고, 카카오나 구글 같은 소셜 로그인 정보는 `social_accounts`에 따로 저장했다.
    
    ```
    members 1 : 0..N social_accounts
    ```
    
    소셜 로그인 제공자가 추가되더라도 `members`에 새로운 컬럼을 계속 만들 필요가 없도록 분리했다.
    
    ---
    
    ## 4. 회원 탈퇴
    
    회원이 탈퇴하더라도 미션, 리뷰, 포인트 내역까지 모두 삭제하면 이전 기록을 확인할 수 없게 된다. 따라서 회원 데이터를 실제로 삭제하지 않고 탈퇴 여부만 표시하는 Soft Delete 방식을 사용했다.
    
    `members`에는 다음 컬럼을 두었다.
    
    ```
    status
    deleted_at
    ```
    
    - 정상 회원: `status = 'ACTIVE'`, `deleted_at = NULL`
    - 탈퇴 회원: `status = 'WITHDRAWN'`, `deleted_at = 탈퇴한 시간`
    
    회원 목록이나 로그인 처리에서는 `deleted_at IS NULL`인 회원만 조회한다.
    
    ---
    
    ## 5. 약관과 알림 설정
    
    처음에는 약관 동의와 알림 설정이 비슷해 보였지만, 사용 목적이 달라서 분리했다.
    
    - `terms`: 약관 제목, 내용, 버전
    - `member_term_agreements`: 회원이 동의한 약관과 동의 시간
    - `member_settings`: 현재 적용 중인 알림 설정
    
    회원 한 명은 여러 약관에 동의할 수 있고, 하나의 약관에도 여러 회원이 동의할 수 있다. 따라서 중간 테이블을 사용했다.
    
    ```
    members 1 : 0..N member_term_agreements
    terms   1 : 0..N member_term_agreements
    ```
    
    반면 회원 설정은 회원 한 명당 최대 하나만 존재한다.
    
    ```
    members 1 : 0..1 member_settings
    ```
    
    약관 동의 내역은 기록으로 남기고, 알림 설정은 사용자가 설정을 바꿀 때 현재 값을 수정한다.
    
    ---
    
    ## 6. 음식 선호와 가게 분류
    
    회원은 한식, 일식, 중식 등 여러 음식 종류를 선택할 수 있다. 하나의 음식 종류도 여러 회원에게 선택될 수 있기 때문에 `member_food_preferences`라는 중간 테이블을 만들었다.
    
    ```
    members 1 : N member_food_preferences N : 1 food_categories
    ```
    
    가게도 여러 음식 종류에 포함될 수 있어 `store_food_categories`를 만들었다.
    
    ```
    stores 1 : N store_food_categories N : 1 food_categories
    ```
    
    ---
    
    ## 7. 가게, 지도 및 검색
    
    가게 정보는 `stores`에 저장한다.
    
    - 가게명
    - 주소
    - 전화번호
    - 설명
    - 위도와 경도
    - 운영 상태
    
    지도에서 주변 가게를 보여주기 위해 `latitude`와 `longitude`를 저장했다. 가게 검색은 가게명, 주소, 음식 카테고리를 기준으로 할 수 있도록 했다.
    
    회원의 최근 검색어가 필요할 수 있어 `search_histories`도 추가했다.
    
    ```
    members 1 : 0..N search_histories
    ```
    
    ---
    
    ## 8. 사장님과 점포 관리
    
    사장님도 로그인하는 회원이므로 별도의 사장님 테이블을 만들지 않고 `members`를 같이 사용했다.
    
    한 사장님이 여러 점포를 운영할 수 있고, 하나의 점포에 공동 사장이나 관리자가 있을 수도 있다고 보고 `store_managers`를 중간 테이블로 만들었다.
    
    ```
    members 1 : N store_managers N : 1 stores
    ```
    
    `store_managers`의 `manager_role`로 사장님과 일반 관리자를 구분한다.
    
    사장님이 관리할 수 있는 정보는 다음과 같이 나눴다.
    
    - `stores`: 가게 기본 정보
    - `store_business_hours`: 요일별 영업시간과 휴무일
    - `store_images`: 가게 이미지
    - `store_food_categories`: 가게 음식 종류
    - `missions`: 가게에서 제공하는 미션
    
    ---
    
    ## 9. 미션 관리
    
    미션 자체의 내용과 회원이 받은 미션의 상태는 다른 정보이기 때문에 테이블을 분리했다.
    
    - `missions`: 미션 제목, 조건, 보상 포인트, 기간
    - `member_missions`: 미션을 받은 회원과 진행 상태
    
    ```
    members 1 : N member_missions N : 1 missions
    stores  1 : N missions
    ```
    
    회원과 미션은 N:M 관계이므로 `member_missions`가 중간 테이블 역할을 한다.
    
    미션 상태는 다음과 같이 관리한다.
    
    - `ASSIGNED`: 미션을 받음
    - `IN_PROGRESS`: 수행 중
    - `COMPLETED`: 완료
    - `EXPIRED`: 기간 만료
    
    같은 회원에게 같은 미션이 중복으로 배정되지 않도록 다음 조건도 추가했다.
    
    ```sql
    UNIQUE (member_id, mission_id)
    ```
    
    ---
    
    ## 10. 리뷰
    
    리뷰는 회원이 완료한 미션을 기준으로 작성하도록 했다. 하나의 회원 미션에는 리뷰를 하나만 작성할 수 있다.
    
    ```
    member_missions 1 : 0..1 reviews
    ```
    
    미션을 완료했지만 리뷰를 작성하지 않을 수도 있기 때문에 `0..1`로 설정했다. 같은 미션에 리뷰가 여러 개 작성되지 않도록 `member_mission_id`에 `UNIQUE`를 설정했다.
    
    리뷰에는 여러 이미지를 첨부할 수 있다.
    
    ```
    reviews 1 : 0..N review_images
    ```
    
    ---
    
    ## 11. 포인트
    
    회원의 현재 포인트만 저장하면 포인트가 언제, 왜 바뀌었는지 알 수 없다. 따라서 `point_transactions`에 모든 적립과 사용 내역을 저장하도록 했다.
    
    ```
    members 1 : 0..N point_transactions
    member_missions 1 : 0..N point_transactions
    ```
    
    미션 보상은 양수, 포인트 사용은 음수로 저장한다.
    
    ---
    
    ## 12. 알림
    
    새로운 미션이나 리뷰 작성 요청을 저장하기 위해 `notifications`를 만들었다.
    
    ```
    members 1 : 0..N notifications
    member_missions 1 : 0..N notifications
    ```
    
    `read_at`에 시간이 없으면 읽지 않은 알림, 시간이 있으면 읽은 알림으로 처리한다.
    
    ---
    
    ## 13. 1:1 문의
    
    서비스에서 말하는 ‘1:1 문의’는 회원과 문의 테이블이 1:1이라는 뜻이 아니다. 회원 한 명이 여러 문의를 남길 수 있기 때문에 회원과 문의는 1:N 관계로 설정했다.
    
    ```
    members 1 : 0..N inquiries
    ```
    
    하나의 문의에는 답변이 없거나 하나만 등록될 수 있도록 했다.
    
    ```
    inquiries 1 : 0..1 inquiry_answers
    ```
    
    문의에 이미지를 여러 장 첨부할 수 있도록 `inquiry_images`도 따로 만들었다.
    
    ```
    inquiries 1 : 0..N inquiry_images
    ```
    
    ---
    
    ## 14. 정리
    
    한 테이블에 모든 정보를 넣지 않고 회원, 가게, 미션, 리뷰, 포인트, 문의처럼 역할이 다른 정보는 각각 나누어 저장했다.
    
    회원과 약관, 회원과 음식 종류, 회원과 미션, 사장님과 점포처럼 여러 데이터가 서로 연결되는 경우에는 중간 테이블을 만들었다. 이미지와 포인트 내역처럼 여러 개가 생길 수 있는 데이터도 별도의 테이블로 분리했다.
    
    또한 회원 탈퇴 시 관련 기록이 함께 사라지지 않도록 실제 데이터를 삭제하지 않고 `status`와 `deleted_at`으로 탈퇴 상태를 관리하도록 결정했다.
    
    ERD 사진
    
    !umc-week1-ver2.png
    
    + ERD를 만들 때는 항상 테이블 배치가 가장 어렵다 ㅜㅜ  🦖
       최대한 부모 테이블을 왼쪽에, 자식 테이블을 오른쪽에, 중간 테이블은 두 테이블의 중간에 두려고 하는데
       쉽지 않다. 꿀팁이 있으면 배우고 싶다.