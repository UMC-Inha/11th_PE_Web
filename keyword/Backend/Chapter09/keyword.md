- Swagger / OpenAPI
    
    ### OpenAPI
    
    OpenAPI는 **HTTP API의 사용 방법을 문서로 표현하는 표준 명세**다.
    
    다음과 같은 내용을 JSON이나 YAML 형식으로 정의한다.
    
    - API 경로와 HTTP 메서드
    - 요청 파라미터와 요청 본문
    - 응답 데이터 구조와 상태 코드
    - 인증 방식
    
    ```yaml
    paths:
      /members/{memberId}:
        get:
          summary: 회원 조회
          parameters:
            - name: memberId
              in: path
              required: true
              schema:
                type: integer
          responses:
            "200":
              description: 조회 성공
            "404":
              description: 회원 없음
    ```
    
    ### Swagger
    
    Swagger는 **OpenAPI 명세를 작성하고 확인하는 도구들의 집합**이다. 대표적으로 Swagger UI는 명세를 웹 화면으로 보여주고, 브라우저에서 API를 직접 호출할 수 있게 한다. Swagger Docs
    
    Spring Boot에서는 보통 `springdoc-openapi`를 이용해 Controller와 DTO를 기반으로 OpenAPI 문서를 생성한다.
    
    ```java
    @Operation(summary = "회원 조회")
    @GetMapping("/{memberId}")
    public ResponseEntity<MemberResponse> findMember(
            @PathVariable Long memberId
    ) {
        return ResponseEntity.ok(
                memberService.findMember(memberId)
        );
    }
    ```
    
    Swagger UI에서 요청을 직접 보내는 것은 수동 확인에 가깝다. 기대 결과를 자동으로 검증하는 테스트 코드를 대신하지는 않는다.
    
    > OpenAPI는 API 문서의 표준이고, Swagger는 그 표준을 활용하는 도구다.
    > 
- 단위 테스트
    
    단위 테스트는 **하나의 기능이나 클래스가 의도대로 동작하는지 독립적으로 검증하는 테스트**다.
    
    예를 들어 회원 Service를 테스트할 때 실제 DB 대신 가짜 Repository를 사용하면 Service의 비즈니스 로직에 집중할 수 있다.
    
    ```java
    @ExtendWith(MockitoExtension.class)
    class MemberServiceTest {
    
        @Mock
        private MemberRepository memberRepository;
    
        @InjectMocks
        private MemberService memberService;
    
        @Test
        void 중복된_이메일이면_가입에_실패한다() {
            // given
            String email = "user@example.com";
    
            when(memberRepository.existsByEmail(email))
                    .thenReturn(true);
    
            // when & then
            assertThrows(
                    DuplicateEmailException.class,
                    () -> memberService.signUp(email)
            );
        }
    }
    ```
    
    - `@Mock`: 실제 객체 대신 사용할 테스트 대역 생성
    - `@InjectMocks`: 테스트 대상 객체에 Mock 의존성 주입
    - `assertThrows()`: 예상한 예외가 발생하는지 검증
    
    일반적으로 Spring 컨텍스트와 실제 DB를 실행하지 않으므로 빠르다. 다만 실제 SQL, Bean 설정과 트랜잭션 연동 문제까지 확인하지는 못한다.
    
    > 단위 테스트는 의존성을 분리하여 특정 로직 자체가 올바른지 확인한다.
    > 
- 통합 테스트
    
    통합 테스트는 **여러 구성 요소를 연결했을 때 정상적으로 동작하는지 검증하는 테스트**다.
    
    ```
    Service
    → Repository
    → 테스트 DB
    ```
    
    각 클래스가 개별적으로 정상 동작하더라도, 실제로 연결하면 SQL 오류나 트랜잭션 설정 문제 등이 발생할 수 있다. 통합 테스트는 이런 연동 문제를 확인한다.
    
    ### Spring Boot 예시
    
    ```java
    @SpringBootTest
    @Transactional
    class MemberIntegrationTest {
    
        @Autowired
        private MemberService memberService;
    
        @Autowired
        private MemberRepository memberRepository;
    
        @Test
        void 회원가입하면_DB에서_조회할_수_있다() {
            // given
            String email = "user@example.com";
    
            // when
            Long memberId = memberService.signUp(email);
    
            // then
            Member savedMember = memberRepository
                    .findById(memberId)
                    .orElseThrow();
    
            assertEquals(email, savedMember.getEmail());
        }
    }
    ```
    
    `@SpringBootTest`는 Spring Boot 애플리케이션 컨텍스트를 구성한다. 기본 설정만으로 실제 HTTP 서버까지 실행하는 것은 아니며, 실제 서버가 필요하면 `webEnvironment = RANDOM_PORT` 등을 지정한다. docs.spring.io
    
    위 예시의 테스트용 `@Transactional`은 일반적으로 테스트 종료 후 DB 변경을 롤백하여 다른 테스트에 영향을 줄인다. 테스트 DB는 운영 DB와 분리해야 한다.
    
    ### 단위 테스트와 비교
    
    | 구분 | 단위 테스트 | 통합 테스트 |
    | --- | --- | --- |
    | 범위 | 하나의 기능·클래스 중심 | 여러 구성 요소의 연결 |
    | 의존성 | Mock 등으로 대체 가능 | 실제 구성 요소를 함께 사용 |
    | 속도 | 일반적으로 빠름 | 상대적으로 느림 |
    | 주요 검증 | 비즈니스 로직 | DB·설정·트랜잭션 등의 연동 |
    
    > 통합 테스트는 모든 시스템을 반드시 실행하는 테스트가 아니라, 필요한 구성 요소 사이의 연동을 확인하는 테스트다.
    > 
- Mock, Stub
    
    Mock과 Stub은 **실제 의존성을 대신하는 테스트 대역(Test Double)**이다. 실제 DB나 외부 API에 의존하지 않고 원하는 상황을 재현할 때 사용한다.
    
    ### Stub
    
    Stub은 **미리 정해 둔 값을 반환하여 테스트 상황을 만드는 역할**을 한다.
    
    ```java
    when(memberRepository.existsByEmail("user@example.com"))
            .thenReturn(true);
    ```
    
    실제 DB에 회원이 없어도 중복 이메일이 존재하는 상황을 재현할 수 있다.
    
    ```
    “중복 이메일이 존재할 때”
    → Service가 가입을 거부하는지 확인
    ```
    
    ### Mock
    
    Mock은 **의존성이 예상한 방식으로 호출되었는지 검증하는 역할**을 한다.
    
    ```java
    memberService.delete(1L);
    
    verify(memberRepository).deleteById(1L);
    ```
    
    다음과 같은 상호작용을 확인할 수 있다.
    
    - 어떤 메서드가 호출되었는가
    - 어떤 인자가 전달되었는가
    - 몇 번 호출되었는가
    
    ```java
    verify(memberRepository, times(1)).deleteById(1L);
    ```
    
    ### 차이
    
    | 구분 | Stub | Mock |
    | --- | --- | --- |
    | 핵심 목적 | 테스트에 필요한 응답 제공 | 호출과 상호작용 검증 |
    | 대표 코드 | `when(...).thenReturn(...)` | `verify(...)` |
    | 확인 관점 | 주어진 조건에서 결과가 맞는가 | 의존성을 올바르게 사용했는가 |
    
    Mockito의 `@Mock`으로 만든 객체는 두 역할을 모두 할 수 있다. 즉, **서로 다른 종류의 객체라기보다 테스트에서 사용하는 역할의 차이**로 이해하는 것이 정확하다. javadoc.io
    
- given-when-then
    
    given-when-then은 **테스트를 준비·실행·검증의 세 단계로 나누는 작성 방식**이다.
    
    | 단계 | 의미 | 예시 |
    | --- | --- | --- |
    | given | 테스트 조건 준비 | 회원 데이터, Mock 반환값 설정 |
    | when | 테스트 대상 실행 | 회원가입 메서드 호출 |
    | then | 결과 검증 | 반환값, 예외, DB 상태 확인 |
    
    ```java
    @Test
    void 잔액에서_출금액만큼_차감된다() {
        // given
        Account account = new Account(10000L);
    
        // when
        account.withdraw(3000L);
    
        // then
        assertEquals(7000L, account.getBalance());
    }
    ```
    
    예외 상황은 실행과 검증을 함께 표현하기도 한다.
    
    ```java
    @Test
    void 잔액보다_많이_출금하면_실패한다() {
        // given
        Account account = new Account(1000L);
    
        // when & then
        assertThrows(
                InsufficientBalanceException.class,
                () -> account.withdraw(2000L)
        );
    }
    ```
    
    특정 라이브러리가 강제하는 문법은 아니다. 테스트의 조건과 기대 동작을 쉽게 읽을 수 있도록 하는 구조다.
    
    > given은 준비, when은 실행, then은 검증이다.
    > 
- 회귀 테스트
    
    회귀 테스트는 **코드를 변경한 뒤 기존에 정상 동작하던 기능이 망가지지 않았는지 확인하는 테스트**다.
    
    ```
    기능 추가 또는 버그 수정
    → 기존 테스트 재실행
    → 기존 기능이 유지되는지 확인
    ```
    
    예를 들어 회원가입의 비밀번호 규칙을 변경했다면 다음 기능이 여전히 정상인지 확인한다.
    
    - 올바른 입력으로 회원가입이 되는가
    - 중복 이메일 가입이 차단되는가
    - 기존 회원이 로그인할 수 있는가
    - 잘못된 비밀번호로는 로그인할 수 없는가
    
    버그를 수정할 때는 그 버그를 재현하는 테스트를 추가하면 좋다.
    
    ```
    버그를 재현하는 테스트 작성
    → 테스트 실패 확인
    → 코드 수정
    → 테스트 성공 확인
    → 이후 변경에서도 같은 버그의 재발 여부 확인
    ```
    
    회귀 테스트는 단위·통합 테스트와 대립하는 분류가 아니다.
    
    | 분류 | 구분 기준 |
    | --- | --- |
    | 단위·통합 테스트 | 얼마나 넓은 범위를 검증하는가 |
    | 회귀 테스트 | 기존 기능의 손상을 확인하려는 목적인가 |
    
    따라서 기존 단위 테스트와 통합 테스트를 반복 실행하는 것이 회귀 테스트가 될 수 있다. 이를 CI에 연결하면 PR이나 코드 병합 때 자동으로 확인할 수 있다.
    
    > 단위 테스트와 통합 테스트는 테스트의 범위이고, 회귀 테스트는 코드 변경 이후 기존 기능을 보호하려는 목적이다.
    >