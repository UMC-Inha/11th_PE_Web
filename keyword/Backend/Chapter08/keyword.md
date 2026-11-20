- 트랜잭션(Transaction)
    
    트랜잭션은 여러 데이터베이스 작업을 **하나의 논리적인 작업 단위**로 묶는 것이다.
    
    계좌 이체를 예로 들면 다음 두 작업은 반드시 함께 처리되어야 한다.
    
    ```
    A 계좌에서 10,000원 차감
    B 계좌에 10,000원 증가
    ```
    
    첫 번째 작업만 성공하고 두 번째 작업이 실패하면 돈이 사라진다. 따라서 두 작업을 하나의 트랜잭션으로 묶어 모두 성공하거나 모두 취소되도록 해야 한다.
    
    ### 예시
    
    ```java
    @Service
    @RequiredArgsConstructor
    public class TransferService {
    
        private final AccountRepository accountRepository;
    
        @Transactional
        public void transfer(
                Long fromId,
                Long toId,
                long amount
        ) {
            Account from = accountRepository
                    .findById(fromId)
                    .orElseThrow();
    
            Account to = accountRepository
                    .findById(toId)
                    .orElseThrow();
    
            from.withdraw(amount);
            to.deposit(amount);
        }
    }
    ```
    
    ```
    transfer() 시작
    → 트랜잭션 시작
    → 출금 처리
    → 입금 처리
    → 모두 성공하면 commit
    → 중간에 실패하면 rollback
    ```
    
    일반적으로 `@Transactional`은 여러 데이터 변경이 하나의 업무를 구성하는 Service 계층에 적용한다.
    
- commit / rollback
    
    ### Commit
    
    Commit은 트랜잭션에서 수행한 변경 내용을 데이터베이스에 최종 반영하는 것이다.
    
    ```sql
    START TRANSACTION;
    
    UPDATE account
    SET balance = balance - 10000
    WHERE account_id = 1;
    
    UPDATE account
    SET balance = balance + 10000
    WHERE account_id = 2;
    
    COMMIT;
    ```
    
    `COMMIT`이 완료되면 트랜잭션의 변경 내용이 확정된다.
    
    ### Rollback
    
    Rollback은 트랜잭션에서 수행한 변경 내용을 취소하고 트랜잭션 시작 전 상태로 되돌리는 것이다.
    
    ```sql
    START TRANSACTION;
    
    UPDATE account
    SET balance = balance - 10000
    WHERE account_id = 1;
    
    -- 입금 처리 중 오류 발생
    
    ROLLBACK;
    ```
    
    출금 작업이 이미 실행되었더라도 `ROLLBACK`되면 출금 전 상태로 복구된다.
    
    ### Spring의 기본 Rollback 기준
    
    Spring의 `@Transactional`은 기본적으로 다음 예외에서 Rollback한다.
    
    - `RuntimeException`
    - `Error`
    
    Checked Exception까지 Rollback하려면 별도로 설정한다.
    
    ```java
    @Transactional(rollbackFor = Exception.class)
    public void process() throws Exception {
        // 작업
    }
    ```
    
    Spring은 기본 설정에서 unchecked exception이 트랜잭션 밖으로 전달될 때 Rollback 대상으로 처리한다. docs.spring.io
    
    예외를 메서드 내부에서 잡고 정상적으로 종료하면 Spring이 실패를 알지 못해 Commit될 수 있으므로 주의해야 한다.
    
    ```java
    @Transactional
    public void process() {
        try {
            // DB 작업
        } catch (RuntimeException exception) {
            // 예외를 무시하면 commit될 수 있음
        }
    }
    ```
    
- 원자성(Atomicity)
    
    원자성은 트랜잭션에 포함된 작업이 **모두 성공하거나 모두 실패해야 한다**는 성질이다.
    
    ```
    작업 A 성공 + 작업 B 성공
    → 전체 성공
    
    작업 A 성공 + 작업 B 실패
    → 작업 A도 취소
    → 전체 실패
    ```
    
    계좌 이체에서는 출금과 입금이 하나의 원자적인 작업이어야 한다.
    
    ```
    출금만 성공: 허용하지 않음
    입금만 성공: 허용하지 않음
    출금과 입금 모두 성공: 허용
    ```
    
    Commit과 Rollback은 원자성을 구현하기 위한 핵심 수단이다.
    
    > 원자성은 작업을 더 나눌 수 없다는 의미가 아니라, 여러 작업을 성공과 실패 관점에서 하나처럼 처리한다는 의미다.
    > 
- ACID
    
    ACID는 트랜잭션이 안전하게 동작하기 위해 지켜야 하는 네 가지 성질이다.
    
    | 속성 | 의미 |
    | --- | --- |
    | Atomicity | 모든 작업이 성공하거나 모두 취소되어야 함 |
    | Consistency | 트랜잭션 전후로 데이터 규칙이 지켜져야 함 |
    | Isolation | 동시에 실행되는 트랜잭션이 서로 부적절하게 영향을 주면 안 됨 |
    | Durability | Commit된 결과는 장애가 발생해도 유지되어야 함 |
    
    ### Atomicity: 원자성
    
    ```
    출금과 입금이 모두 성공하거나 모두 실패
    ```
    
    ### Consistency: 일관성
    
    트랜잭션 수행 전후에 데이터베이스의 제약 조건과 업무 규칙이 유지되어야 한다.
    
    ```
    잔액은 음수가 될 수 없음
    이메일은 중복될 수 없음
    외래 키는 존재하는 데이터를 참조해야 함
    ```
    
    트랜잭션이 성공하더라도 애플리케이션의 잘못된 로직까지 데이터베이스가 자동으로 해결해 주는 것은 아니다. 업무 규칙과 제약 조건을 올바르게 작성해야 한다.
    
    ### Isolation: 격리성
    
    여러 트랜잭션이 동시에 실행될 때 다른 트랜잭션의 중간 상태에 부적절하게 영향을 받지 않아야 한다.
    
    ```
    트랜잭션 A가 잔액 변경 중
    트랜잭션 B가 같은 계좌 변경 시도
    → 격리 수준과 잠금 정책에 따라 처리
    ```
    
    격리 수준이 높을수록 동시성 문제는 줄어들지만 대기와 잠금이 늘어 성능이 낮아질 수 있다.
    
    ### Durability: 지속성
    
    Commit이 완료된 데이터는 서버나 데이터베이스에 장애가 발생해도 복구할 수 있어야 한다.
    
    ```
    Commit 완료
    → 장애 발생
    → 재시작 후에도 변경 결과 유지
    ```
    
- UNIQUE 제약 조건
    
    `UNIQUE`는 특정 컬럼이나 여러 컬럼의 조합이 중복되지 않도록 데이터베이스가 보장하는 제약 조건이다.
    
    ```sql
    CREATE TABLE member (
        member_id BIGINT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL,
        CONSTRAINT uk_member_email UNIQUE (email)
    );
    ```
    
    같은 이메일로 두 요청이 동시에 들어오면 애플리케이션의 사전 조회만으로는 중복을 완전히 막을 수 없다.
    
    ```
    요청 A: 이메일 조회 → 없음
    요청 B: 이메일 조회 → 없음
    
    요청 A: INSERT → 성공
    요청 B: INSERT → UNIQUE 위반
    ```
    
    `UNIQUE` 제약이 없다면 두 요청이 모두 성공할 수 있다. 따라서 애플리케이션의 중복 조회는 사용자에게 오류를 미리 안내하는 용도이고, 데이터베이스의 `UNIQUE` 제약은 중복을 막는 최종 안전장치다.
    
    ### 복합 UNIQUE
    
    ```sql
    CREATE TABLE book_like (
        member_id BIGINT NOT NULL,
        book_id BIGINT NOT NULL,
    
        CONSTRAINT uk_book_like
            UNIQUE (member_id, book_id)
    );
    ```
    
    같은 사용자가 같은 책에 좋아요를 두 번 등록하는 것은 불가능하지만, 서로 다른 책에 좋아요를 누르는 것은 가능하다.
    
    ### 트랜잭션과의 관계
    
    트랜잭션 안에서 `UNIQUE` 위반이 발생하면 예외가 발생한다. 해당 예외가 트랜잭션 밖으로 전달되면 전체 트랜잭션을 Rollback할 수 있다.
    
    ```java
    @Transactional
    public void signUp(SignUpRequest request) {
        memberRepository.save(
                new Member(request.email())
        );
    
        // 다른 DB 작업
    }
    ```
    
    MySQL InnoDB와 같은 트랜잭션 스토리지 엔진에서는 고유 키 위반이 발생한 데이터 변경 명령이 Rollback된다. dev.mysql.com
    
- 낙관적 잠금(Optimistic Locking)
    
    낙관적 잠금은 데이터 충돌이 자주 발생하지 않을 것이라고 가정하고, 데이터를 조회할 때 실제 DB 잠금을 걸지 않는 동시성 제어 방식이다.
    
    대신 데이터에 버전 번호를 저장하고 수정 시점에 버전이 같은지 확인한다.
    
    ### 동작 과정
    
    ```
    초기 데이터
    balance = 10000
    version = 1
    ```
    
    사용자 A와 B가 동시에 데이터를 조회한다.
    
    ```
    사용자 A: balance = 10000, version = 1
    사용자 B: balance = 10000, version = 1
    ```
    
    사용자 A가 먼저 수정한다.
    
    ```
    balance = 9000
    version = 2
    ```
    
    사용자 B도 자신이 조회한 `version = 1`을 기준으로 수정하려고 한다.
    
    ```
    현재 DB version = 2
    사용자 B의 version = 1
    → 버전 불일치
    → 수정 실패
    ```
    
    이를 통해 사용자 A의 변경 내용을 사용자 B가 덮어쓰는 갱신 손실을 막는다.
    
    ### JPA의 `@Version`
    
    ```java
    @Entity
    public class Product {
    
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long productId;
    
        private String name;
    
        private int stock;
    
        @Version
        private Long version;
    }
    ```
    
    JPA는 수정할 때 개념적으로 다음과 같은 SQL을 실행한다.
    
    ```sql
    UPDATE product
    SET stock = ?,
        version = version + 1
    WHERE product_id = ?
      AND version = ?;
    ```
    
    버전이 일치하면 한 행이 수정되고 버전이 증가한다. 이미 다른 트랜잭션이 수정했다면 조건에 맞는 행이 없어 낙관적 잠금 예외가 발생한다.
    
    JPA에서는 버전 검증에 실패하면 `OptimisticLockException`이 발생하고 해당 트랜잭션이 Rollback된다. jakarta.ee
    
    ### 적절한 상황
    
    - 데이터 충돌이 자주 발생하지 않는 경우
    - 조회는 많고 수정은 적은 경우
    - 긴 시간 동안 DB 잠금을 유지하고 싶지 않은 경우
    - 다른 사용자의 변경을 덮어쓰면 안 되는 경우
    
    ### 주의할 점
    
    낙관적 잠금은 충돌 자체를 막는 방식이 아니라, 충돌을 감지하는 방식이다. 충돌이 발생하면 다음 중 하나로 처리해야 한다.
    
    - 사용자에게 다시 시도하도록 안내
    - 최신 데이터를 다시 조회
    - 일정 횟수 자동 재시도
    - 변경 내용을 병합
    
    충돌이 매우 빈번한 재고 차감이나 결제 처리에서는 무조건 재시도하면 중복 처리될 수 있으므로 업무 특성에 따라 비관적 잠금, 원자적 UPDATE나 별도의 동시성 제어가 필요할 수 있다.
    
    ---
    
    ## UNIQUE 제약과 낙관적 잠금의 차이
    
    | 구분 | `UNIQUE` 제약 | 낙관적 잠금 |
    | --- | --- | --- |
    | 목적 | 중복 데이터 방지 | 기존 데이터의 동시 수정 충돌 감지 |
    | 대표 상황 | 중복 이메일, 중복 좋아요 | 같은 상품이나 게시글 동시 수정 |
    | 기준 | 컬럼 값의 중복 여부 | 버전 번호 일치 여부 |
    | 처리 결과 | 중복 키 예외 | 낙관적 잠금 예외 |
    
    > `UNIQUE`는 동일한 데이터의 중복 생성을 막고, 낙관적 잠금은 같은 데이터를 동시에 수정할 때 이전 변경을 덮어쓰는 문제를 막는다. 트랜잭션은 이러한 작업들을 하나의 단위로 묶어 Commit과 Rollback으로 일관성을 유지한다.
    >