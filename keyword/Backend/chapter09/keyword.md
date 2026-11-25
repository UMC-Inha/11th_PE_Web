- Swagger / OpenAPI

  ### **1. 정의**

    - **OpenAPI**는 HTTP API를 설명하는 **규격(명세 형식)**이다. 어떤 URL에 어떤 Method로 무엇을 보내면 무엇이 돌아오는지를 JSON(또는 YAML) 문서 하나에 정해진 모양으로 적는다.
    - **Swagger**는 원래 이 규격의 이름이었고, 지금은 OpenAPI 문서를 다루는 **도구 모음**의 이름이다. 그중 **Swagger UI**는 OpenAPI JSON을 읽어 사람이 보기 좋은 문서 화면으로 그려 준다.
    - 스프링에서는 **springdoc-openapi**가 컨트롤러와 DTO를 읽어 OpenAPI JSON을 자동으로 만들고, Swagger UI 화면까지 함께 띄워 준다.
    - 핵심은 **코드에서 문서를 만든다**는 점이다. 손으로 쓴 문서는 코드가 바뀔 때 따로 고쳐야 하지만, 코드에서 만든 문서는 코드와 어긋날 수 없다.

  ### **2. 이름 정리**

  | **이름** | **정체** | **우리 프로젝트 주소** |
      | --- | --- | --- |
  | OpenAPI | API 설명 규격, 기계가 읽는 JSON | `http://localhost:8080/v3/api-docs` |
  | Swagger UI | OpenAPI JSON을 그려 주는 화면 | `http://localhost:8080/swagger-ui.html` |
  | springdoc-openapi | 스프링 코드를 읽어 위 둘을 만들어 주는 라이브러리 | `build.gradle`의 `springdoc-openapi-starter-webmvc-ui:2.8.9` |

  ### **3. 코드 예시: 인증 방식 등록과 연결**

    ```java
    // SwaggerConfig.java: "이 서버는 Bearer 토큰 방식을 쓴다"고 선언
    .components(new Components()
            .addSecuritySchemes(BEARER_AUTH, new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")));
    ```

    ```java
    // FavoriteController.java: 같은 이름으로 연결하면 이 컨트롤러 API에 자물쇠가 붙음
    @Tag(name ="즐겨찾기", description ="로그인한 회원의 영화 즐겨찾기 API")
    @SecurityRequirement(name = SwaggerConfig.BEARER_AUTH)
    public class FavoriteController {
    ```

    - 선언(`SwaggerConfig`)과 사용(`@SecurityRequirement`)이 나뉘어 있다. 두 곳의 이름이 같아야 하므로 문자열 대신 상수 `BEARER_AUTH`를 쓴다.
    - Authorize 버튼에 토큰을 넣으면 Swagger UI가 `Authorization: Bearer 토큰` 헤더를 알아서 붙여 보낸다.

  ### **4. 손으로 쓴 문서 vs Swagger**

  | **비교** | **표 (8주차까지)** | **Swagger** |
      | --- | --- | --- |
  | 코드가 바뀌면 | 사람이 기억해서 고쳐야 함 | URL, 필드가 같이 바뀜 |
  | 직접 호출 | Postman을 따로 열어야 함 | 문서 화면에서 Try it out |
  | 예시 값 | 복사해서 붙여 넣기 | `example`이 입력창에 미리 채워짐 |
  | 프론트 활용 | 읽기만 가능 | OpenAPI JSON으로 API 클라이언트 코드 자동 생성 가능 |

- 단위 테스트

  ### **1. 정의**

    - **단위 테스트(Unit Test)**는 클래스나 메서드 **하나의 판단**이 맞는지 따로 떼어 확인하는 테스트다.
    - 그 클래스가 의존하는 다른 객체(Repository 등)는 진짜 대신 **가짜(Mock)**로 바꿔 끼운다. 그래서 DB, 서버, 네트워크 없이 돈다.
    - 스프링 서버를 띄우지 않으므로 **아주 빠르고**, 실패하면 원인이 그 클래스 안에 있다고 바로 좁혀진다.

  ### **2. 무엇을 단위로 보나**

  | **계층** | **단위 테스트로 확인하기 좋은 것** | **우리 코드 예** |
      | --- | --- | --- |
  | Service | 비즈니스 판단 (중복이면 막기, 내 것인지 확인) | `FavoriteService.create`의 중복 검사 |
  | Entity, 유틸 | 계산, 값 변환 | `Rating.update`, `JwtUtil` 토큰 파싱 |
  | Controller | 보통 단위 테스트보다 통합 테스트로 확인 | URL, 인증, 검증은 연결이 중요하기 때문 |

  ### **3. 코드 예시: 실습 4 FavoriteServiceTest**

    ```java
    @ExtendWith(MockitoExtension.class) // 스프링 없이 Mockito만 사용
    class FavoriteServiceTest {
    
        @Mock private FavoriteRepository favoriteRepository; // 가짜
        @Mock private MemberRepository memberRepository;     // 가짜
        @InjectMocks private FavoriteService favoriteService; // 진짜 (가짜 두 개를 주입받음)
    
        @Test
        @DisplayName("이미 즐겨찾기한 영화면 FAVORITE409_1 예외를 던지고 저장하지 않는다")
        void createFavoriteWhenDuplicated() {
            given(memberRepository.findById(1L)).willReturn(Optional.of(member));
            given(favoriteRepository.existsByMember_MemberIdAndMovieId(1L, 550L)).willReturn(true);
    
            assertThatThrownBy(() -> favoriteService.create(1L, new CreateFavoriteRequest(550L)))
                    .isInstanceOf(ApiException.class)
                    .hasMessage("이미 이 영화를 즐겨찾기하셨습니다.");
    
            verify(favoriteRepository, never()).save(any(Favorite.class));
        }
    }
    ```

    - DB에 실제로 중복 데이터를 넣지 않아도 `willReturn(true)` 한 줄로 "이미 즐겨찾기한 상황"을 만든다.
    - `verify(..., never()).save(...)`로 "저장을 시도조차 하지 않았다"까지 확인한다. 결과뿐 아니라 **하지 말아야 할 일을 안 했는지**도 볼 수 있다.

  ### **4. 단위 테스트가 잡는 것과 못 잡는 것**

  | **잡는다** | **못 잡는다** |
      | --- | --- |
  | 중복 검사 `if`를 지웠다 | URL 오타 (`/favorite`) |
  | 예외 code, 메시지를 바꿨다 | 인터셉터 예외 목록 실수 |
  | 저장 전에 검사 순서가 바뀌었다 | DTO `@Valid` 검증 누락 |
  |  | 엔티티와 DB 테이블 매핑 오류 |
    - 오른쪽은 여러 부품이 **연결**돼야 드러나는 문제라서 통합 테스트가 맡는다.

- 통합 테스트

  ### **1. 정의**

    - **통합 테스트(Integration Test)**는 여러 부품을 **실제로 연결한 상태**에서 요청부터 응답까지 흐름 전체가 맞는지 확인하는 테스트다.
    - 우리 프로젝트에서는 인터셉터(토큰 검사) → `@Valid` 검증 → 컨트롤러 → 서비스 → Repository → DB까지 가짜 없이 돈다.
    - 단위 테스트가 "엔진이 도는가"라면, 통합 테스트는 "조립한 차가 도로를 달리는가"다.

  ### **2. 구성 요소**

  | **애노테이션 / 도구** | **하는 일** |
      | --- | --- |
  | `@SpringBootTest` | 서버를 켤 때처럼 모든 Bean을 올린다 |
  | `@AutoConfigureMockMvc` + `MockMvc` | 진짜 포트를 열지 않고 HTTP 요청을 흉내 낸다 |
  | `@Transactional` | 테스트 하나가 끝나면 저장한 데이터를 되돌린다 |
  | H2 메모리 DB | 테스트 때만 메모리에 생겼다 사라지는 DB |
  | `src/test/resources/application.yaml` | 테스트 때 main 설정 대신 쓰이는 설정 (H2 주소, 테스트용 JWT 값) |
    - 개발용 MySQL을 쓰면 테스트 데이터가 쌓이고, 남은 데이터 때문에 다음 테스트가 실패할 수 있다. 그래서 H2를 `ddl-auto: create-drop`으로 쓴다.

  ### **3. 코드 예시: 실습 5 FavoriteApiTest**

    ```java
    @Test
    @DisplayName("토큰 없이 즐겨찾기를 등록하면 401과 AUTH401_2를 응답한다")
    void createFavoriteWithoutToken() throws Exception{
        mockMvc.perform(post("/favorites")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateFavoriteRequest(550L))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH401_2"));
    }
    
    @Test
    @DisplayName("Swagger 문서 경로는 토큰 없이도 열려 있다")
    void apiDocsIsPublic() throws Exception{
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk());
    }
    ```

    - `mockMvc.perform(...)`는 Postman의 Send, `andExpect`는 응답을 눈으로 확인하던 일이다.
    - `jsonPath("$.code")`로 응답 JSON의 `code`까지 확인한다. 상태 코드만 보면 놓치는 차이를 잡는다.
    - 두 번째 테스트는 인터셉터 예외 목록을 누가 건드리면 바로 실패한다. 단위 테스트로는 확인할 수 없는 **설정과 연결**을 지킨다.

  ### **4. 단위 테스트 vs 통합 테스트**

  | **비교** | **단위 테스트** | **통합 테스트** |
      | --- | --- | --- |
  | 확인하는 것 | 클래스 하나의 판단 | 요청부터 응답까지 전체 흐름 |
  | 의존 객체 | Mock으로 대체 | 전부 진짜 |
  | DB | 없음 | H2 메모리 DB |
  | 속도 | 매우 빠름 (스프링 안 띄움) | 느림 (스프링 컨텍스트를 올림) |
  | 실패가 알려 주는 것 | 로직이 틀렸다 | 연결이 틀렸다 |
  | 이번 주 개수 | `FavoriteServiceTest` 2개 | `FavoriteApiTest` 5개 |
    - 둘은 서로를 대신하지 않는다. 빠른 단위 테스트로 판단을 촘촘히 보고, 통합 테스트로 중요한 흐름을 확인한다.
    - 스프링에는 그 사이 크기도 있다. `@WebMvcTest`(컨트롤러 계층만), `@DataJpaTest`(JPA 계층만)처럼 필요한 부분만 올리는 슬라이스 테스트다.

  ### **5. 통합 테스트도 못 잡는 것**

    - **CORS**는 브라우저가 스스로 거는 제약이라 MockMvc 요청에서는 생기지 않는다. 이번 주 프론트에서 `localhost:3000` CORS 오류를 겪었듯, 테스트가 초록불이어도 브라우저에서 한 번은 직접 확인해야 한다.

- Mock, Stub

  ### **1. 정의**

    - 둘 다 테스트에서 진짜 객체 대신 넣는 **대역(Test Double)**이다. 영화 촬영의 대역 배우처럼, 진짜가 하기 어렵거나 느린 일을 대신한다.
    - **Stub**은 "이렇게 물어보면 이렇게 대답해"라고 **정해진 답을 돌려주는** 대역이다. 상황(given)을 만드는 데 쓴다.
    - **Mock**은 정해진 답을 줄 뿐 아니라 **어떤 메서드가 몇 번, 어떤 값으로 불렸는지 기록**해서, 테스트가 그 호출을 검증할 수 있게 하는 대역이다.
    - 즉 Stub은 **상태(결과값)**를 확인하는 데 쓰이고, Mock은 **행동(호출 여부)**까지 확인하는 데 쓰인다.

  ### **2. 테스트 대역 종류**

  | **종류** | **하는 일** | **예** |
      | --- | --- | --- |
  | Dummy | 자리만 채움, 실제로 안 씀 | 생성자 인자를 채우는 빈 객체 |
  | Stub | 정해진 값을 돌려줌 | `existsBy...`가 불리면 `true` |
  | Spy | 진짜를 쓰면서 호출을 기록 | 진짜 객체 일부만 바꿔 끼움 |
  | Mock | 값을 돌려주고 호출을 검증 | `save`가 한 번도 안 불렸는지 확인 |
  | Fake | 단순하지만 실제로 동작하는 구현 | 메모리 Map으로 만든 Repository, H2 DB |

  ### **3. 코드 예시: Mockito에서 둘이 섞여 쓰이는 모습**

    ```java
    @Mock
    private FavoriteRepository favoriteRepository; // Mockito가 만든 Mock 객체
    
    // Stub 역할: 이 호출에는 true를 돌려주도록 대본을 줌
    given(favoriteRepository.existsByMember_MemberIdAndMovieId(1L, 550L)).willReturn(true);
    
    // Mock 역할: save가 한 번도 불리지 않았는지 호출 기록을 검증
    verify(favoriteRepository, never()).save(any(Favorite.class));
    ```

    - Mockito의 `@Mock`으로 만든 객체 하나가 `given(...).willReturn(...)`을 쓰면 Stub처럼, `verify(...)`를 쓰면 Mock처럼 동작한다.
    - 대본을 안 준 메서드는 기본값을 돌려준다. 객체는 `null`, `boolean`은 `false`, 숫자는 `0`, `List`는 빈 리스트, `Optional`은 `Optional.empty()`다. 실습 6에서 `save`가 `null`을 돌려줘 NullPointerException이 난 이유다.

  ### **4. Stub 검증 vs Mock 검증**

  | **비교** | **상태 검증 (Stub 중심)** | **행동 검증 (Mock 중심)** |
      | --- | --- | --- |
  | 확인하는 것 | 결과값이 맞는가 | 특정 메서드가 불렸는가 |
  | 코드 | `assertThat(response.movieId()).isEqualTo(550L)` | `verify(favoriteRepository).save(any())` |
  | 장점 | 내부 구현이 바뀌어도 결과만 같으면 통과 | 결과로 드러나지 않는 일(저장 안 함)을 확인 |
  | 주의 | 부수 효과를 못 봄 | 구현을 조금만 바꿔도 깨지기 쉬움 |
    - 실습 4에서 쓴 `@ExtendWith(MockitoExtension.class)`는 기본으로 **엄격 모드(strict stubs)**라서, 준비한 대본(Stub)이 한 번도 안 쓰이면 `UnnecessaryStubbingException`으로 실패시킨다. 실습 6에서 중복 검사를 지웠을 때 정상 등록 테스트까지 실패한 이유다.

- given-when-then

  ### **1. 정의**

    - 테스트 하나를 **given(상황) → when(실행) → then(확인)** 세 덩어리로 나눠 쓰는 방식이다.
    - BDD(Behavior-Driven Development, 행동 주도 개발)에서 나온 표현으로, 테스트를 **사람이 읽는 문장**처럼 만들어 무엇을 검증하는지 바로 읽히게 한다.
    - 비슷한 이름으로 **Arrange-Act-Assert(AAA)**가 있다. 단계는 같고 이름만 다르다.

  ### **2. 세 덩어리**

  | **단계** | **하는 일** | **즐겨찾기 중복 등록 예** |
      | --- | --- | --- |
  | given | 테스트에 필요한 상황을 만든다 | 회원이 있고, 이미 550번을 즐겨찾기했다 |
  | when | 확인하고 싶은 동작 하나를 실행한다 | 550번 즐겨찾기를 등록한다 |
  | then | 결과가 기대와 같은지 확인한다 | `FAVORITE409_1` 예외가 나고 저장은 안 됐다 |
    - Postman으로 확인할 때 머릿속으로 하던 "이 상태에서(given) 이걸 누르면(when) 이게 나와야 해(then)"를 그대로 코드로 옮긴 것이다.

  ### **3. 코드 예시: 실습 4 정상 등록**

    ```java
    @Test
    @DisplayName("아직 즐겨찾기하지 않은 영화면 즐겨찾기를 저장한다")
    void createFavorite() {
        // given: 회원은 존재하고, 아직 이 영화를 즐겨찾기하지 않은 상황
        given(memberRepository.findById(1L)).willReturn(Optional.of(member));
        given(favoriteRepository.existsByMember_MemberIdAndMovieId(1L, 550L)).willReturn(false);
        given(favoriteRepository.save(any(Favorite.class)))
                .willReturn(Favorite.builder().member(member).movieId(550L).build());
    
        // when: 즐겨찾기를 등록하면
        FavoriteResponse response = favoriteService.create(1L, new CreateFavoriteRequest(550L));
    
        // then: 저장된 영화 ID가 응답에 담기고, 저장이 실제로 호출된다
        assertThat(response.movieId()).isEqualTo(550L);
        verify(favoriteRepository).save(any(Favorite.class));
    }
    ```

    - 위 코드의 given 칸에서는 가짜 Repository에게 `given(...).willReturn(...)`으로 대본을 줬다. Mockito에는 똑같은 일을 하는 `when(...).thenReturn(...)`도 있다.
    - 그런데 `when`을 쓰면 **준비(given) 칸에 `when`이라는 단어**가 들어가서, 바로 아래 **실행(when) 칸**과 이름이 겹친다. 그래서 준비 칸에서는 이름도 given인 `BDDMockito.given`을 쓴다.

    ```java
    // when(...)을 쓰면: 준비 칸인데 when이 나와서 실행 칸과 헷갈림
    // given
    when(favoriteRepository.existsByMember_MemberIdAndMovieId(1L, 550L)).thenReturn(false);
    // when
    FavoriteResponse response = favoriteService.create(1L, new CreateFavoriteRequest(550L));
    
    // given(...)을 쓰면: 칸 이름과 메서드 이름이 맞음 (실습 4 코드)
    // given
    given(favoriteRepository.existsByMember_MemberIdAndMovieId(1L, 550L)).willReturn(false);
    // when
    FavoriteResponse response = favoriteService.create(1L, new CreateFavoriteRequest(550L));
    ```

    - `@DisplayName`도 "~면 ~한다" 문장으로 적어서, 실패했을 때 어떤 규칙이 깨졌는지 이름만 보고 안다.

  ### **4. 나눠 쓸 때 vs 섞어 쓸 때**

    - "섞어 쓴 테스트"는 준비·실행·확인이 순서 없이 뒤섞이고, 여러 상황을 테스트 하나에 몰아넣은 테스트다.

    ```java
    // (설명용 예시) 실습 4의 두 테스트를 하나에 섞어 쓴 모습
    @Test
    void favoriteTest() {
        given(memberRepository.findById(1L)).willReturn(Optional.of(member));
        given(favoriteRepository.existsByMember_MemberIdAndMovieId(1L, 550L)).willReturn(false);
        given(favoriteRepository.save(any(Favorite.class)))
                .willReturn(Favorite.builder().member(member).movieId(550L).build());
        FavoriteResponse response = favoriteService.create(1L, new CreateFavoriteRequest(550L));
        assertThat(response.movieId()).isEqualTo(550L);
        given(favoriteRepository.existsByMember_MemberIdAndMovieId(1L, 550L)).willReturn(true);
        assertThatThrownBy(() -> favoriteService.create(1L, new CreateFavoriteRequest(550L)))
                .isInstanceOf(ApiException.class);
    }
    ```

    - 정상 등록과 중복 등록이 한 테스트에 들어 있고, 준비(`given`)와 실행(`create`), 확인(`assertThat`)이 번갈아 나온다. 이 테스트가 실패하면 정상 등록이 깨진 건지 중복 검사가 깨진 건지 이름만 봐서는 모른다.
    - 실습 4는 이것을 `createFavorite`, `createFavoriteWhenDuplicated` 두 테스트로 나누고, 각각을 given → when → then 순서로 썼다.

  | **비교** | **섞어 쓴 테스트** | **given-when-then으로 나눈 테스트** |
      | --- | --- | --- |
  | 읽기 | 어디까지가 준비이고 어디가 검사인지 찾아야 함 | 주석 세 줄만 보면 흐름이 보임 |
  | when 개수 | 여러 동작을 한 번에 실행하기 쉬움 | when은 하나로 제한하게 됨 |
  | 실패 원인 | 어느 동작 때문인지 헷갈림 | 한 동작의 결과만 보므로 원인이 좁혀짐 |
    - 예외를 확인할 때는 `assertThatThrownBy(() -> ...)` 안에서 실행과 확인이 같이 일어나므로 `// when & then`으로 합쳐 적는다.

- 회귀 테스트

  ### **1. 정의**

    - **회귀(Regression)**는 예전에 잘 되던 기능이 코드를 고친 뒤 다시 안 되는 것, 즉 **뒤로 돌아가 버린** 버그를 말한다.
    - **회귀 테스트**는 코드를 바꿀 때마다 "예전에 되던 게 지금도 되는지" 다시 확인하는 테스트다.
    - 따로 만드는 특별한 테스트가 아니라, 지금까지 쌓은 단위·통합 테스트를 **매번 다시 돌리는 것** 자체가 회귀 테스트다.

  ### **2. 사람이 확인할 때 vs 테스트가 확인할 때**

  | **비교** | **Postman으로 사람이 확인 (8주차까지)** | **테스트 코드로 확인 (9주차)** |
      | --- | --- | --- |
  | 방법 | 서버 켜기 → 로그인 → 토큰 복사 → 요청 → 눈으로 확인 | `.\gradlew test` 한 번 |
  | 범위 | 고친 API만 확인하기 쉬움 | 쌓인 테스트 전부 |
  | 놓치는 것 | 안 고친 곳이 깨진 것 | 테스트를 안 쓴 부분 |
  | 비용 | API가 늘수록 클릭이 늘어남 | 한 번 쓰면 계속 공짜 |

  ### **3. 실습 6 결과: 중복 검사를 지웠을 때**

    ```java
    // FavoriteService.create에서 이 블록을 주석 처리했을 때
    if (favoriteRepository.existsByMember_MemberIdAndMovieId(memberId, request.movieId())) {
        throw new ApiException(HttpStatus.CONFLICT, "FAVORITE409_1",
                "이미 이 영화를 즐겨찾기하셨습니다.");
    }
    ```

  | **실패한 테스트** | **실패 메시지** | **알려 준 것** |
      | --- | --- | --- |
  | 단위 `createFavoriteWhenDuplicated` | ApiException 기대, NullPointerException 발생 | 중복인데 save까지 내려갔다 |
  | 단위 `createFavorite` | `UnnecessaryStubbingException` | 중복 검사 단계 자체가 사라졌다 |
  | 통합 `createFavoriteWhenDuplicated` | `expected:<FAVORITE409_1> but was:<COMMON4091>` | DB 제약이 막긴 했지만 응답 code가 바뀌었다 |
    - 실수로 지운 코드를 **사람이 아니라 테스트가 먼저** 발견했다. 주석을 되돌리자 8개가 다시 초록불이 됐다.
    - 통합 테스트 실패가 특히 중요하다. 409라는 상태 코드는 같아서 Postman으로 대충 보면 지나칠 수 있지만, 프론트는 `FAVORITE409_1`을 보고 안내 문구를 정하기 때문에 실제로는 기능이 깨진 것이다.

  ### **4. 회귀 테스트를 잘 쓰려면**

  | **습관** | **이유** |
      | --- | --- |
  | 버그를 고칠 때 그 버그를 재현하는 테스트를 먼저 추가 | 같은 버그가 다시 생기면 바로 잡힘 |
  | 커밋, push 전에 전체 테스트 실행 | 내 변경이 다른 곳을 깨뜨렸는지 확인 |
  | 테스트는 빠르게 유지 (단위 테스트 비중 높게) | 느리면 안 돌리게 됨 |
  | 실패한 테스트를 지우거나 끄지 않기 | 테스트를 끄면 회귀를 숨기는 것 |