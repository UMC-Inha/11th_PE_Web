- Swagger / OpenAPI

  HTTP API의 사용 방법을 사람과 도구가 함께 이해할 수 있도록 정리하는 규격과 도구.

  **이름 구분**

  | 구분 | 역할 |
      | --- | --- |
  | OpenAPI | URL, Method, 요청·응답, 인증 방식 등을 표현하는 표준 규격. JSON 또는 YAML로 작성 |
  | Swagger UI | OpenAPI 문서를 읽어 API 목록과 요청 실행 화면을 제공하는 도구 |
  | springdoc-openapi | Spring Controller·DTO·어노테이션을 읽어 OpenAPI 문서를 생성하는 라이브러리 |

  Spring 코드 → springdoc이 OpenAPI 문서 생성 → Swagger UI가 문서를 읽어 화면 표시. 문서 규격과 화면을 같은 것으로 보는 것은 X.

  **문서에 들어갈 내용**

    - API의 목적, HTTP Method와 URL.
    - 경로 변수·쿼리 파라미터·요청 바디의 이름, 타입, 필수 여부, 입력 예시.
    - 성공·실패 HTTP 상태 코드, 응답 구조, 애플리케이션의 `code`와 `message`.
    - 토큰 필요 여부와 전달 방식. 프론트가 코드 내부를 보지 않고도 요청을 만들 수 있어야 하는 API 계약.

  **Spring에서 사용하는 어노테이션**

    - `@Tag`: 회원·평점·즐겨찾기처럼 API 묶음 구분.
    - `@Operation`: 개별 API의 요약·설명.
    - `@Schema`: DTO와 필드 설명·예시.
    - `@ApiResponse`: 특정 상태 코드의 응답 설명. 프로젝트에서 만든 공통 응답 DTO `ApiResponse<T>`와 이름은 같지만 역할은 다름.
    - `@SecurityRequirement`: 해당 API에 필요한 인증 방식을 문서에 표시.

  워크북의 기본 경로: `/swagger-ui.html`은 문서 화면 진입점, `/v3/api-docs`는 화면이 읽는 OpenAPI JSON. 인터셉터를 사용하는 경우 문서 화면과 JSON 경로 모두 접근 설정 확인.

  **추가 핵심 정리**

    - 자물쇠 표시는 문서의 인증 요구사항. 실제 인증·인가 처리는 서버의 인터셉터나 필터에서 별도로 수행.
    - `type: http`, `scheme: bearer` 설정에서는 Authorize에 JWT 값 입력 → 요청 헤더에 `Bearer {토큰}`으로 전달.
    - 자동 생성으로 경로·타입의 불일치를 줄일 수 있지만, 직접 적은 설명·예시·실패 응답까지 항상 정확해지는 것은 X. 구현 변경 시 문서도 함께 확인.
    - `@Schema(example = "...")`는 문서 예시, `@NotNull`·`@Positive` 등은 실제 입력 검증. 설명을 적었다고 검증 로직이 생기는 것은 X.
    - Try it out은 예시 화면만 보여주는 기능 X → 실제 서버에 요청 전송. 등록·삭제 요청이면 실제 데이터 변경.
    - OpenAPI 문서는 Swagger UI 외에도 클라이언트 코드 생성, 협업 문서 공유 등에 활용 가능.

  **참고 자료**

    - OpenAPI 공식 규격
    - springdoc-openapi 공식 문서
- 단위 테스트

  검증할 동작의 범위를 작게 잡고, 해당 코드가 조건에 따라 올바르게 판단하는지 확인하는 테스트. 이번 워크북에서는 FavoriteService의 즐겨찾기 등록·중복 판단이 대상.

  **어떤 것을 확인하는가**

    - 정상 조건에서 올바른 결과를 반환하는지.
    - 중복·권한 없음 같은 실패 조건에서 정해진 예외를 던지는지.
    - 실패한 경우 저장이나 외부 호출이 실행되지 않는지.
    - 대상이 Service라고 반드시 단위 테스트인 것은 X. 실제 DB·다른 계층까지 함께 실행하는지 등 검증 범위로 구분.

  **의존성을 가짜로 바꾸는 이유**

  FavoriteService는 실제 객체로 실행하고, MemberRepository·FavoriteRepository는 Mock으로 대체. “회원은 존재하고, 이미 즐겨찾기한 상태”라는 조건을 DB 없이 준비 가능.

  Spring 컨테이너나 MySQL을 띄우지 않아도 실행 가능 → 빠르고 실패 원인 파악이 비교적 쉬움. 모든 단위 테스트에 Mock이 필수인 것은 X. 단순 계산이나 독립된 객체는 그대로 생성해서 검증 가능.

  워크북의 Mockito 구성 발췌

    ```java
    @ExtendWith(MockitoExtension.class)
    class FavoriteServiceTest {
        @Mock
        private FavoriteRepository favoriteRepository;
    
        @Mock
        private MemberRepository memberRepository;
    
        @InjectMocks
        private FavoriteService favoriteService;
    }
    ```

    - `@Mock`: 테스트용 가짜 의존성 생성.
    - `@InjectMocks`: 해당 가짜 의존성을 테스트 대상 객체에 주입. FavoriteService까지 가짜로 만드는 어노테이션 X.
    - JUnit은 테스트 실행, Mockito는 가짜 객체와 호출 검증, AssertJ는 결과·예외 검증에 사용.

  **추가 핵심 정리**

    - Service를 직접 호출하므로 HTTP 상태 코드보다 반환값·예외·저장 호출 여부를 검증. 예외가 실제 409 응답으로 변환되는지는 API 테스트에서 확인.
    - Mock의 `save()` 호출 확인 ≠ 실제 DB 저장 성공. SQL, 엔티티 매핑, UNIQUE 제약, 트랜잭션 롤백은 별도 검증 필요.
    - 정상 흐름만 확인하면 중복 검사를 지워도 통과할 수 있음 → 실패 조건과 경계값도 함께 작성.
    - 내부 메서드 호출 순서까지 과하게 고정하면 리팩토링 때 불필요하게 깨지기 쉬움. 업무상 중요한 결과와 부수 효과를 중심으로 검증.

  **참고 자료**

    - Spring — Unit Testing
    - JUnit 5 — 테스트 작성과 Assertions
- 통합 테스트

  여러 구성 요소를 함께 연결해서, 각 부분이 실제로 맞물려 동작하는지 확인하는 테스트. Service 로직이 맞아도 URL 매핑·인증·DTO 검증·DB 연결이 틀리면 API는 실패할 수 있음.

  **워크북에서 확인하는 범위**

  요청 → 인증 인터셉터 → Controller → Service → Repository·테스트 DB → 응답. 단위 테스트에서 대체했던 부분을 실제로 연결해 확인.

  | 요청 상황 | 확인할 결과 |
      | --- | --- |
  | 토큰 없이 즐겨찾기 등록 | 401과 인증 실패 code |
  | 유효한 토큰으로 정상 등록 | 201과 등록한 영화 ID |
  | 이미 즐겨찾기한 영화 재등록 | 409과 중복 오류 code |
  | 즐겨찾기하지 않은 영화 여부 조회 | 200과 `isFavorite: false` |

  HTTP 상태만 맞아도 성공이라고 보기 어려움 → 공통 응답의 `isSuccess`, `code`, `result`와 필요한 DB 결과도 함께 검증.

  **Spring의 테스트 구성**

    ```java
    @SpringBootTest
    @AutoConfigureMockMvc
    @Transactional
    class FavoriteApiTest {
        // 테스트 메서드
    }
    ```

  워크북의 구성 방식만 정리한 예시.

    - `@SpringBootTest`: 애플리케이션 컨텍스트를 올려 Bean과 설정을 함께 사용.
    - `@AutoConfigureMockMvc`: Spring MVC 요청·응답을 검증할 MockMvc 구성.
    - 테스트의 `@Transactional`: 테스트 트랜잭션에서 수행한 변경을 기본적으로 종료 후 롤백. 개발 DB 대신 테스트 전용 DB 설정도 별도로 필요.

  **추가 핵심 정리**

    - 기본 `@SpringBootTest` + MockMvc는 8080 포트의 서버에 HTTP 요청을 보내는 방식 X. 실제 Spring MVC 처리 흐름을 모의 요청·응답으로 실행하므로 실행 중인 서버가 없어도 검증 가능.
    - 실제 HTTP 서버까지 띄우려면 `webEnvironment = RANDOM_PORT` 같은 별도 설정 사용. 이 경우 서버 요청은 다른 스레드·트랜잭션에서 실행되어 테스트의 자동 롤백 범위와 달라질 수 있음.
    - H2는 빠르고 테스트 데이터 분리에 편리하지만, MySQL 호환 모드여도 MySQL과 완전히 동일한 DB는 X. DB 고유 SQL·제약 동작은 실제 사용 DB와 같은 종류의 테스트 환경에서도 확인 필요.
    - `@WebMvcTest`는 주로 MVC 계층, `@DataJpaTest`는 JPA 계층을 좁혀 확인하는 슬라이스 테스트. 통합 테스트가 항상 애플리케이션 전체를 올려야 하는 것은 X.
    - 테스트 정리용 롤백과 서비스가 실패 시 수행하는 롤백은 구분. 트랜잭션 검증은 첫 저장 이후 실제 실패가 발생하고, 서비스 트랜잭션 종료 뒤 데이터가 남지 않았는지 확인.
    - 서버 테스트가 통과해도 브라우저의 CORS 정책 적용이나 실제 화면 연동까지 검증한 것은 X.

  **참고 자료**

    - Spring Boot 3.5 — 애플리케이션 테스트
    - Spring — MockMvc
    - Spring — 테스트 트랜잭션과 롤백
- Mock, Stub

  테스트 대상이 의존하는 실제 객체를 대신하는 **테스트 더블(Test Double)**의 종류. DB·외부 API에 의존하지 않고 필요한 상황을 만들 때 사용.

  **차이점**

  | 구분 | 중심 역할 | 즐겨찾기 예시 |
      | --- | --- | --- |
  | Stub | 미리 정한 반환값·예외로 테스트 조건 제공 | 중복 조회 시 true 반환 |
  | Mock | 어떤 메서드가 어떤 인자로 호출되었는지 등 상호작용 검증 | 중복이면 save가 호출되지 않았는지 확인 |

  Stub은 “무엇을 돌려줄 것인가”, Mock은 “어떤 호출이 있었는가”에 초점. 무조건 서로 다른 라이브러리나 별도 클래스여야 하는 것은 X.

  **Mockito에서는 어떻게 사용하는가**

  Mockito의 `@Mock`으로 만든 객체에 반환값을 설정하는 작업을 **Stubbing**이라고 부름. 따라서 같은 객체를 Stub 역할과 호출 검증 역할에 함께 사용 가능.

  워크북 예시 발췌

    ```java
    given(favoriteRepository
            .existsByMember_MemberIdAndMovieId(1L, 550L))
            .willReturn(true);
    
    // 테스트 대상 실행 후 저장 호출 여부 검증
    verify(favoriteRepository, never()).save(any(Favorite.class));
    ```

  첫 부분은 “이미 등록된 상태” 준비, 두 번째는 “저장하지 않았는지” 검증. 이 사이에서 FavoriteService의 실제 로직을 실행해야 테스트 대상의 판단을 확인 가능.

  **반환값 검증과 호출 검증**

    - `assertThat(response.movieId()).isEqualTo(550L)`: 실행 결과 값 검증.
    - `verify(repository).save(...)`: 해당 저장 메서드 호출 검증. 기본적으로 1회 호출 기대.
    - `verify(repository, never()).save(...)`: 해당 호출이 0회인지 검증.
    - 반환값만 맞아도 불필요한 저장이 발생할 수 있으므로, 저장 금지 같은 업무 규칙에는 호출 검증도 유용.

  **추가 핵심 정리**

    - Mockito Mock은 기본적으로 실제 구현을 실행하지 않음. 설정하지 않은 메서드는 타입에 맞는 기본값을 반환할 수 있어, 필요한 Stubbing 누락이나 인자 불일치 확인 필요.
    - 가짜 Repository의 `save()`는 실제 INSERT를 실행하는 것이 X → DB의 UNIQUE나 외래 키가 지켜지는지는 알 수 없음.
    - Fake는 메모리 저장소처럼 간단하지만 실제로 동작하는 대체 구현, Spy는 실제 객체의 동작을 사용하면서 일부 호출을 관찰·대체하는 방식.
    - Mock을 많이 만드는 것 자체가 목표 X. 테스트 대상은 실제로 실행하고, 검증 범위 밖의 의존성만 필요에 따라 대체.

  **참고 자료**

    - Mockito — Stubbing과 호출 검증
    - Martin Fowler — Mocks Aren’t Stubs
- given-when-then

  테스트를 **준비 → 실행 → 검증**으로 나누는 작성 방식. 어떤 조건에서 무엇을 실행하고, 어떤 결과를 기대하는지 드러내는 구조.

  | 단계 | 의미 | 즐겨찾기 예시 |
      | --- | --- | --- |
  | Given | 실행 전 데이터·조건 준비 | 회원 존재, 같은 영화의 즐겨찾기는 없음 |
  | When | 검증할 동작 실행 | 즐겨찾기 등록 메서드 호출 |
  | Then | 기대 결과 검증 | 영화 ID가 응답에 포함되고 저장 1회 호출 |

  Arrange–Act–Assert(AAA)와 비슷한 구분. Java의 예약어나 필수 문법이 아니라 테스트를 읽기 쉽게 구성하는 규칙.

  **워크북의 정상 등록 테스트 발췌**

    ```java
    // given
    given(memberRepository.findById(1L))
            .willReturn(Optional.of(member));
    given(favoriteRepository
            .existsByMember_MemberIdAndMovieId(1L, 550L))
            .willReturn(false);
    given(favoriteRepository.save(any(Favorite.class)))
            .willReturn(Favorite.builder()
                    .member(member).movieId(550L).build());
    
    // when
    FavoriteResponse response =
            favoriteService.create(1L, new CreateFavoriteRequest(550L));
    
    // then
    assertThat(response.movieId()).isEqualTo(550L);
    verify(favoriteRepository).save(any(Favorite.class));
    ```

  `given(...).willReturn(...)`은 Mock의 반환값 준비. 이것만 적으면 Service를 검증한 것은 X → When에서 실제 Service 호출, Then에서 결과 확인.

  **실패 상황은 어떻게 나누는가**

    - Given: 이미 즐겨찾기한 상태로 설정.
    - When: 같은 영화 등록 시도.
    - Then: 정해진 예외 발생, 저장 호출은 0회.
    - 예외 검증은 실행 코드를 `assertThatThrownBy(() -> ...)` 안에 넣으므로 When과 Then이 한 표현식에 함께 들어갈 수 있음.

  **추가 핵심 정리**

    - 테스트 하나는 한 가지 시나리오에 집중. 정상 등록·중복 등록·인증 실패를 한 메서드에 몰아넣으면 어느 규칙이 깨졌는지 파악하기 어려움.
    - 한 시나리오에 필요한 검증은 여러 개여도 가능. 예: 409 상태와 오류 code를 함께 확인.
    - 공통 준비는 `@BeforeEach`, 특정 조건은 각 테스트의 Given에 배치. 준비 코드를 너무 숨기면 테스트만 읽고 상황을 이해하기 어려움.
    - 테스트 이름도 “이미 즐겨찾기한 영화면 예외를 던지고 저장하지 않는다”처럼 조건과 기대 결과가 드러나도록 작성.
    - 이 구조를 사용한다고 테스트 작성 시점까지 정해지는 것은 X. 구현보다 테스트를 먼저 작성하는 TDD와는 다른 구분.

  **참고 자료**

    - Martin Fowler — Given When Then
    - Mockito — BDDMockito의 given과 검증
- 회귀 테스트

  코드를 변경한 뒤에도 **기존에 동작하던 기능과 규칙이 유지되는지** 다시 확인하는 테스트. 기능 추가·버그 수정·리팩토링으로 다른 기능이 망가지는 회귀(Regression)를 발견하기 위한 목적.

  **단위·통합 테스트와의 관계**

    - 단위·통합은 “어느 범위를 함께 확인하는가”의 구분.
    - 회귀는 “왜 다시 확인하는가”의 구분.
    - 기존 테스트를 다시 실행해 즐겨찾기 중복 차단이 유지되는지 확인한다면, 단위 테스트와 통합 테스트 모두 회귀 테스트 역할 수행.
    - 회귀 테스트라는 별도의 어노테이션이나 전용 테스트 종류가 필수인 것은 X.

  **검증할 내용 고르기**

    - 정상 기능: 등록·조회·수정·삭제의 기대 결과.
    - 실패 규칙: 인증 누락, 중복 등록, 다른 회원 데이터 수정.
    - 응답 계약: HTTP 상태 코드와 공통 응답 구조·code.
    - 데이터 결과: 실패한 요청으로 일부 데이터만 남지 않는지.
    - 실제로 발생했던 버그: 같은 조건을 재현하는 테스트를 추가하고 수정 후 재실행.

  **추가 핵심 정리**

    - 테스트가 계속 초록색이어도 검증이 충분하다는 뜻은 X. 중요한 로직을 제거했을 때 관련 테스트가 실패하는지도 확인하면 검증의 빈틈을 찾기 쉬움.
    - 예를 들어 즐겨찾기 중복을 저장 전에 차단하는 구조라면, 평점 개수가 그대로인 결과만으로 저장 후 롤백을 증명할 수 없음. 롤백 검증은 첫 저장 이후의 실패 조건이 필요.
    - 실행할 때마다 통과 여부가 바뀌면 원인 추적이 어려움 → 다른 테스트가 남긴 데이터·실행 순서·현재 시각·외부 서비스 의존성 관리.
    - 커버리지는 코드가 실행된 범위를 보여주는 지표. 실행 결과를 올바르게 검증했는지까지 보장하는 것은 X.
    - 작은 로직 검증은 빠른 단위 테스트로 자주 실행하고, 계층 간 연결은 통합 테스트로 보완. CI에 연결하면 커밋·PR마다 자동 재검증 가능.
    - 테스트 실패 시 기대값을 바로 바꾸기보다, 의도한 요구사항 변경인지 기존 동작의 결함인지 먼저 판단.

  **참고 자료**

    - JUnit 5 — 테스트 실행
    - Spring — 테스트 트랜잭션 검증 시 주의점