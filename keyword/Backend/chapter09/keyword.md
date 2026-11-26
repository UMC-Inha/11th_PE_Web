- Swagger / OpenAPI
    
    ## OpenAPI란?
    
    > HTTP API의 요청과 응답 구조를 정해진 형식으로 표현하는 명세이다.
    > 
    
    프론트엔드가 영화 상세 API를 사용하려면 여러 정보를 알아야 한다.
    
    ```
    어떤 주소로 요청하는가?
    어떤 HTTP method를 사용하는가?
    영화 ID는 어디에 전달하는가?
    로그인이 필요한가?
    성공하면 어떤 데이터가 오는가?
    영화가 없으면 어떤 오류가 오는가?
    ```
    
    OpenAPI는 이런 정보를 JSON이나 YAML 형식으로 기술하는 규칙을 제공한다.
    
    예를 들어 영화 상세 API의 계약을 다음과 같이 정의할 수 있다.
    
    | 항목 | 내용 |
    | --- | --- |
    | HTTP method | `GET` |
    | 경로 | `/movies/{movieId}` |
    | 경로 파라미터 | 조회할 영화의 ID |
    | 성공 응답 | `200`과 영화 상세 정보 |
    | 실패 응답 | 영화가 없으면 `404` |
    | 응답 필드 | `id`, `title`, `synopsis` |
    
    이 명세를 통해 사람이 API의 사용법을 확인하고, 도구가 문서를 표시하거나 클라이언트 코드를 생성할 수도 있다.
    
    ---
    
    ## Swagger란?
    
    > OpenAPI 명세를 작성하고 시각화하거나 활용하는 도구 모음이다.
    > 
    
    실무에서 “Swagger 문서를 확인한다”는 말은 주로 Swagger UI에서 API 문서를 확인한다는 뜻으로 사용된다.
    
    | 구분 | 역할 |
    | --- | --- |
    | OpenAPI | API를 표현하는 명세 |
    | Swagger UI | OpenAPI 명세를 사람이 읽고 호출할 수 있는 화면으로 표시 |
    | Swagger Editor | 명세 작성과 확인을 지원 |
    | 코드 생성 도구 | 명세를 기반으로 클라이언트 코드 등을 생성 |
    
    Swagger UI에서는 API별 설명, 요청값, 응답 예시를 확인하고 `Try it out`으로 실제 요청을 보낼 수 있다. 이 요청은 연결된 API 서버로 전달되므로 데이터를 등록하거나 삭제하는 API라면 실제 변경이 발생할 수 있다.
    
    ---
    
    ## NestJS에서 문서 만들기
    
    NestJS에서는 `@nestjs/swagger`를 사용해 Controller와 DTO의 정보를 바탕으로 OpenAPI 문서를 생성할 수 있다.
    
    다음 코드는 Nest 애플리케이션의 `app`이 생성된 뒤 실행한다고 가정한다.
    
    ```tsx
    import {
      DocumentBuilder,
      SwaggerModule,
    } from "@nestjs/swagger";
    
    const config = new DocumentBuilder()
      .setTitle("영화 서비스 API")
      .setDescription("영화 조회와 예매 기능을 제공하는 API")
      .setVersion("1.0")
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(
      app,
      config,
    );
    
    SwaggerModule.setup("docs", app, document);
    ```
    
    → `/docs`에서 Swagger UI를 확인할 수 있도록 구성함
    
    Controller에는 API 설명과 응답 정보를 작성할 수 있다.
    
    ```tsx
    @Get(":movieId")
    @ApiOperation({
      summary: "영화 상세 조회",
    })
    @ApiOkResponse({
      description: "영화 상세 정보를 반환합니다.",
      type: MovieResponseDto,
    })
    @ApiNotFoundResponse({
      description: "해당 영화를 찾을 수 없습니다.",
    })
    findOne(
      @Param("movieId", ParseIntPipe) movieId: number,
    ) {
      return this.moviesService.findOne(movieId);
    }
    ```
    
    `MovieResponseDto`는 응답 구조를 표현하는 DTO라고 가정한다. DTO의 필드 정보는 `@ApiProperty()`나 Swagger 플러그인 등을 통해 문서에 반영할 수 있다.
    
    ---
    
    ## 문서와 실제 동작을 함께 관리하기
    
    문서에 `404`를 작성했다면 실제로 존재하지 않는 영화 요청에서도 `404`가 반환되어야 한다. 응답 DTO를 변경했다면 문서의 필드 설명과 예시도 확인해야 한다.
    
    또한 Swagger의 인증 관련 설정은 API의 인증 요구를 문서에 표현한다. 실제 토큰 검증과 권한 판단은 Guard 등의 코드에서 수행한다.
    
    | 선언·구현 | 담당 역할 |
    | --- | --- |
    | `@ApiBearerAuth()` | Bearer 인증이 필요하다는 문서 정보 |
    | 인증 Guard | 전달된 토큰 검증 |
    | `@ApiProperty()` | 필드의 문서 정보 |
    | ValidationPipe와 검증 데코레이터 | 실제 요청값 검증 |
    
    문서를 통해 계약을 확인하고, 자동화된 테스트로 실제 응답이 그 계약을 만족하는지 검사할 수 있다.
    
- 단위 테스트
    
    ## 단위 테스트란?
    
    > 함수나 클래스처럼 정한 작은 동작 단위를 실행해, 기대한 결과가 나오는지 확인하는 테스트이다.
    > 
    
    영화 조회 Service를 테스트한다면 다음 동작을 확인할 수 있다.
    
    ```
    영화가 존재한다.
    → 영화 정보를 반환한다.
    
    영화가 존재하지 않는다.
    → 조회 실패 예외를 발생시킨다.
    ```
    
    단위의 경계는 테스트 설계에 따라 정한다. 단일 함수일 수도 있고, 하나의 업무 동작을 수행하는 클래스일 수도 있다.
    
    단위 테스트에서는 보통 DB나 외부 영화 API 같은 의존성을 테스트용 객체로 대체하여 조건을 쉽게 통제한다.
    
    ---
    
    ## 테스트할 영화 조회 기능
    
    다음은 Repository 역할을 하는 의존성을 전달받는 간단한 Service 예시이다.
    
    ```tsx
    import {
      NotFoundException,
    } from "@nestjs/common";
    
    type Movie = {
      id: number;
      title: string;
    };
    
    type MovieReader = {
      findById(id: number): Promise<Movie | null>;
    };
    
    export class MoviesService {
      constructor(
        private readonly movieReader: MovieReader,
      ) {}
    
      async findOne(id: number): Promise<Movie> {
        const movie =
          await this.movieReader.findById(id);
    
        if (movie === null) {
          throw new NotFoundException(
            "영화를 찾을 수 없습니다.",
          );
        }
    
        return movie;
      }
    }
    ```
    
    이 Service를 테스트할 때 필요한 조건은 다음 두 가지다.
    
    | 조건 | 의존성이 반환할 값 | Service에서 기대할 결과 |
    | --- | --- | --- |
    | 영화 존재 | 영화 객체 | 해당 영화 반환 |
    | 영화 없음 | `null` | `NotFoundException` 발생 |
    
    ---
    
    ## Jest 단위 테스트 예시
    
    ```tsx
    describe("MoviesService", () => {
      it("존재하는 영화의 정보를 반환한다", async () => {
        const movie = {
          id: 42,
          title: "달빛 극장",
        };
    
        const movieReader = {
          findById: jest.fn().mockResolvedValue(movie),
        };
    
        const service = new MoviesService(movieReader);
    
        const result = await service.findOne(42);
    
        expect(result).toEqual(movie);
      });
    
      it("영화가 없으면 예외를 발생시킨다", async () => {
        const movieReader = {
          findById: jest.fn().mockResolvedValue(null),
        };
    
        const service = new MoviesService(movieReader);
    
        await expect(
          service.findOne(999),
        ).rejects.toBeInstanceOf(NotFoundException);
      });
    });
    ```
    
    `await expect(...).rejects`를 사용하면 비동기 함수가 실패했을 때 발생한 예외를 확인할 수 있다.
    
    Promise를 사용하는 테스트는 완료될 때까지 Jest가 기다릴 수 있도록 `await`하거나 해당 Promise를 반환해야 한다.
    
    ---
    
    ## 단위 테스트로 확인할 수 있는 범위
    
    위 테스트는 Repository가 주어진 값을 반환했을 때 Service가 어떻게 처리하는지 확인한다.
    
    | 확인할 수 있는 내용 | 별도의 테스트가 필요한 내용 |
    | --- | --- |
    | 영화 객체를 반환하는가? | 실제 DB 쿼리가 올바른가? |
    | 영화가 없을 때 예외가 발생하는가? | 테이블·컬럼 매핑이 올바른가? |
    | 업무 조건에 따른 분기가 맞는가? | HTTP 응답이 실제로 404인가? |
    
    Service가 `NotFoundException`을 발생시키는 것까지는 확인했지만, HTTP 응답으로 변환하는 과정은 이 테스트에 포함되지 않는다.
    
    단위 테스트는 조건을 빠르게 바꿔 다양한 분기를 확인하기 좋다. 영화 예매에서는 매진, 예매 마감, 잘못된 취소 상태 같은 조건을 집중적으로 검증할 수 있다.
    
- 통합 테스트
    
    ## 통합 테스트란?
    
    > 여러 구성 요소를 연결하여, 서로 협력하는 과정이 기대대로 동작하는지 확인하는 테스트이다.
    > 
    
    영화 상세 조회 기능은 여러 계층이 연결되어 동작한다.
    
    ```
    HTTP 요청
        ↓
    Controller
        ↓
    Service
        ↓
    Repository
        ↓
    DB
    ```
    
    통합 테스트는 이 중 정해진 범위를 실제로 연결해 검사한다.
    
    | 테스트 범위 | 확인하는 내용 |
    | --- | --- |
    | Service + Repository + DB | 업무 로직과 DB 접근이 함께 동작하는가? |
    | Controller + Service | 입력 전달과 결과 처리가 연결되는가? |
    | HTTP 요청 + Nest 앱 + DB | 라우팅, 검증, 조회, 응답까지 이어지는가? |
    
    테스트마다 연결 범위가 다를 수 있으므로, 무엇을 실제로 사용하고 무엇을 대체했는지 확인하는 것이 중요하다.
    
    ---
    
    ## 영화 서비스에서 확인할 수 있는 문제
    
    단위 테스트용 Repository가 항상 정상 객체를 반환하면 실제 DB 매핑 오류는 드러나지 않는다.
    
    통합 테스트에서는 다음과 같은 문제를 발견할 수 있다.
    
    - Entity의 컬럼 이름과 실제 DB 스키마가 맞지 않는다.
    - NestJS 모듈에서 필요한 Provider를 등록하지 않았다.
    - 경로 파라미터 변환이 의도대로 적용되지 않았다.
    - 예매 저장 실패 시 앞서 변경한 좌석 수가 롤백되지 않는다.
    - 중복 좌석 배정을 제한할 UNIQUE가 실제 DB에 없다.
    
    특히 DB의 제약조건, 잠금, 트랜잭션을 확인하려면 실제 DB 동작을 포함하는 테스트가 필요하다.
    
    ---
    
    ## HTTP 통합 테스트 예시
    
    다음은 테스트용 Nest 앱과 DB가 준비되어 있다는 전제의 예시이다.
    
    `createTestMovie()`는 테스트용 영화를 DB에 저장하는 헬퍼이며, 테스트 후 생성한 데이터와 앱·DB 연결을 정리하는 구성은 별도로 필요하다.
    
    ```tsx
    import request from "supertest";
    
    it("GET /movies/:id가 저장된 영화를 반환한다", async () => {
      const movie = await createTestMovie({
        title: "달빛 극장",
      });
    
      const response = await request(
        app.getHttpServer(),
      )
        .get(`/movies/${movie.id}`)
        .expect(200);
    
      expect(response.body).toMatchObject({
        id: movie.id,
        title: "달빛 극장",
      });
    });
    ```
    
    이 테스트는 API가 응답 본문에 `id`, `title`을 직접 반환한다는 계약을 가정한다.
    
    서비스에서 `{ data: ... }`처럼 응답을 감싼다면 테스트도 실제 계약에 맞춰 작성해야 한다.
    
    ---
    
    ## 운영과 같은 요청 설정 적용하기
    
    실제 서버는 `main.ts`에서 ValidationPipe 등을 전역 설정했는데, 테스트 앱에는 빠뜨리는 경우가 있다.
    
    ```
    실제 앱
    → ValidationPipe 적용
    → 잘못된 입력에 400 반환
    
    테스트 앱
    → ValidationPipe 누락
    → 잘못된 입력이 Controller까지 전달
    ```
    
    HTTP 동작을 검사하려면 테스트 앱에도 필요한 전역 Pipe, Filter, Interceptor 등을 적용해야 한다.
    
    테스트 DB는 운영 데이터와 분리하고, 테스트 순서에 따라 결과가 바뀌지 않도록 데이터를 준비·정리한다. 동시 실행되는 테스트가 같은 영화나 좌석을 공유하면 서로 결과에 영향을 줄 수 있다.
    
    ---
    
    ## 통합 테스트와 E2E 테스트
    
    E2E 테스트는 사용자가 접근하는 입구부터 주요 처리 결과까지 이어지는 흐름을 확인하는 데 초점을 둔다.
    
    NestJS에서는 Supertest로 HTTP 요청을 보내는 애플리케이션 테스트를 E2E 테스트라고 부르는 경우가 많다. 이때도 외부 결제 서비스 등을 대체했다면 테스트 범위를 함께 밝혀야 한다.
    
    | 테스트 | 주된 초점 |
    | --- | --- |
    | 단위 테스트 | 작은 동작 단위의 판단과 결과 |
    | 통합 테스트 | 구성 요소 사이의 연결과 협력 |
    | E2E 테스트 | 실제 사용 진입점에서 이어지는 주요 흐름 |
    
    파일 이름이 `.e2e-spec.ts`인지보다, 실제로 어떤 구성 요소가 실행되는지가 테스트의 범위를 결정한다.
    
- Mock, Stub
    
    ## 테스트 더블이란?
    
    > 테스트에서 실제 의존성을 대신하는 객체나 함수를 말한다.
    > 
    
    영화 예매 테스트에서 외부 결제 서버에 매번 실제 결제를 요청하면 비용, 네트워크 지연, 외부 장애가 테스트 결과에 영향을 줄 수 있다.
    
    테스트에서는 결제 의존성을 대체해 원하는 상황을 만들 수 있다.
    
    ```
    결제 성공을 반환하는 대체 함수
    결제 실패를 반환하는 대체 함수
    응답 지연을 표현하는 대체 함수
    ```
    
    Mock과 Stub은 이런 테스트 더블을 설명하는 용어이다.
    
    ---
    
    ## Stub
    
    > 테스트 대상이 특정 경로를 실행하도록, 미리 정한 응답이나 실패를 제공하는 역할이다.
    > 
    
    영화가 존재하는 상황을 만들고 싶다면 영화 조회 함수가 정해진 객체를 반환하도록 한다.
    
    ```tsx
    const movieReaderStub = {
      findById: async (_id: number) => ({
        id: 42,
        title: "달빛 극장",
      }),
    };
    ```
    
    영화가 없는 상황은 다음처럼 만들 수 있다.
    
    ```tsx
    const movieReaderStub = {
      findById: async (_id: number) => null,
    };
    ```
    
    Stub을 사용하면 DB에 직접 데이터를 넣지 않고도 Service의 조건별 동작을 확인할 수 있다.
    
    ```
    Stub이 영화 객체 반환
            ↓
    Service가 영화 반환
    
    Stub이 null 반환
            ↓
    Service가 조회 실패 예외 발생
    ```
    
    ---
    
    ## Mock
    
    > 의존성과 어떤 상호작용이 일어났는지 확인하는 데 사용하는 대체 객체나 함수이다.
    > 
    
    영화 조회 Service가 요청받은 영화 ID를 Repository에 올바르게 전달하는지 확인할 수 있다.
    
    ```tsx
    const findById = jest.fn().mockResolvedValue({
      id: 42,
      title: "달빛 극장",
    });
    
    const service = new MoviesService({
      findById,
    });
    
    await service.findOne(42);
    
    expect(findById).toHaveBeenCalledWith(42);
    expect(findById).toHaveBeenCalledTimes(1);
    ```
    
    호출 인자와 횟수를 검사하여 Service와 의존성 사이의 협력을 확인한다.
    
    ---
    
    ## Mock과 Stub 비교
    
    | 구분 | Stub | Mock |
    | --- | --- | --- |
    | 주된 역할 | 원하는 상황을 만들 응답 제공 | 호출과 상호작용 확인 |
    | 질문 | 어떤 값을 반환하게 할까? | 어떤 인자로 몇 번 호출되었을까? |
    | 영화 서비스 예시 | 영화가 없다는 `null` 반환 | 영화 ID 42로 조회했는지 확인 |
    | 확인 대상 | 그 응답에 따른 결과 | 의존성 사용 방식 |
    
    Jest의 `jest.fn()`은 반환값 설정과 호출 기록을 모두 지원한다.
    
    ```tsx
    const findById = jest.fn().mockResolvedValue(null);
    ```
    
    이 함수는 Jest에서 mock function이라고 부르지만, 테스트에서 `null`을 제공하는 데 사용한다면 Stub 역할도 수행한다. 하나의 도구가 두 역할을 지원할 수 있다.
    
    ---
    
    ## 무엇을 대체하고 무엇을 검사할까?
    
    단위 테스트에서는 DB, 결제 서버, 메일 발송처럼 외부 조건의 영향을 받는 의존성을 대체할 수 있다.
    
    테스트하려는 업무 판단 자체는 실제 코드를 실행해야 한다.
    
    ```
    테스트 대상
    → 예매 가능 여부를 판단하는 Service
    
    대체할 의존성
    → 상영 회차 조회
    → 외부 결제 요청
    → 알림 발송
    ```
    
    호출 횟수도 의미 있는 경우에 검사한다.
    
    | 검사 | 확인할 업무적 의미 |
    | --- | --- |
    | 결제 요청이 1번 발생 | 중복 결제 요청 방지 |
    | 예매 실패 시 메일 발송이 0번 발생 | 확정되지 않은 예매 알림 방지 |
    | 조회 함수의 모든 내부 호출 순서 검사 | 구현 방식 변경 시 테스트 수정이 자주 필요할 수 있음 |
    
    특히 Mock의 응답만으로 DB 트랜잭션과 UNIQUE가 실제로 동작하는지 확인할 수는 없다. 해당 동작은 DB를 포함한 테스트에서 검증해야 한다.
    
- given-when-then
    
    ## given-when-then이란?
    
    > 테스트를 준비 조건, 실행할 행동, 기대 결과의 세 부분으로 나누어 표현하는 방식이다.
    > 
    
    | 구분 | 의미 | 영화 예매 예시 |
    | --- | --- | --- |
    | Given | 어떤 상황이 준비되어 있는가? | 상영 회차의 남은 좌석이 0개 |
    | When | 어떤 행동을 실행하는가? | 회원이 해당 회차 예매 요청 |
    | Then | 어떤 결과가 나와야 하는가? | 매진 오류가 발생하고 예매가 생성되지 않음 |
    
    테스트를 읽는 사람이 조건과 행동, 결과를 빠르게 파악하도록 구성한다.
    
    ---
    
    ## 영화 조회 예시
    
    ```
    Given
    42번 영화가 저장되어 있다.
    
    When
    42번 영화의 상세 정보를 조회한다.
    
    Then
    42번 영화의 제목과 ID를 반환한다.
    ```
    
    이를 Jest 코드에 적용하면 다음과 같다.
    
    ```tsx
    it("저장된 영화의 상세 정보를 반환한다", async () => {
      // Given
      const movie = {
        id: 42,
        title: "달빛 극장",
      };
    
      const movieReader = {
        findById: jest.fn().mockResolvedValue(movie),
      };
    
      const service = new MoviesService(movieReader);
    
      // When
      const result = await service.findOne(42);
    
      // Then
      expect(result).toEqual(movie);
    });
    ```
    
    성공 조건뿐 아니라 실패 조건도 같은 구조로 작성할 수 있다.
    
    ```tsx
    it("영화가 없으면 조회 실패 예외를 발생시킨다", async () => {
      // Given
      const movieReader = {
        findById: jest.fn().mockResolvedValue(null),
      };
    
      const service = new MoviesService(movieReader);
    
      // When
      const result = service.findOne(999);
    
      // Then
      await expect(result).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
    ```
    
    ---
    
    ## 각 단계에 작성할 내용
    
    ### Given
    
    테스트의 전제조건을 준비한다.
    
    ```
    사용자 역할
    영화·상영 회차 데이터
    남은 좌석 수
    의존성이 반환할 값
    현재 시각
    ```
    
    예를 들어 예매 마감 테스트라면 현재 시각과 상영 시작 시각의 관계가 중요하다. 테스트가 실행되는 실제 날짜에 의존하지 않도록 기준 시각을 고정할 수 있다.
    
    ### When
    
    검증하려는 주요 행동을 실행한다.
    
    ```
    영화 상세 조회
    좌석 예매 요청
    예매 취소
    관리자용 영화 수정 요청
    ```
    
    한 테스트 안에서 서로 다른 업무를 연속 실행하면 어떤 동작의 실패인지 파악하기 어려워질 수 있다. 하나의 시나리오가 확인하려는 행동을 분명하게 정한다.
    
    ### Then
    
    실행 결과와 필요한 상태 변화를 확인한다.
    
    ```
    반환한 영화가 맞는가?
    올바른 예외가 발생했는가?
    DB의 남은 좌석이 1 줄었는가?
    실패한 예매 내역이 남지 않았는가?
    확정된 예매에만 알림을 보냈는가?
    ```
    
    관련된 결과가 여러 개라면 한 테스트에서 함께 확인할 수 있다. 예매 실패 시 `예매 내역 없음`과 `좌석 수 유지`는 같은 업무 결과를 검증한다.
    
    ---
    
    ## 다른 테스트 개념과의 관계
    
    given-when-then은 테스트를 구성하고 설명하는 방식이다. 단위 테스트, 통합 테스트, 회귀 테스트에도 적용할 수 있다.
    
    또한 BDD에서 사용하는 Gherkin 문법의 `Given`, `When`, `Then`과 연결되는 표현이다. Jest에서는 별도 문법 없이 주석과 코드 배치로 사용할 수 있다.
    
- 회귀 테스트
    
    ## 회귀 테스트란?
    
    > 기능 추가나 코드 수정 이후, 기존에 정상 동작하던 기능에 문제가 생기지 않았는지 확인하는 테스트이다.
    > 
    
    영화 예매 기능에 할인 쿠폰을 추가했다고 하자.
    
    쿠폰 계산은 정확해도 예매 흐름을 수정하면서 기존 좌석 차감이나 취소 기능이 달라질 수 있다.
    
    ```
    변경 전
    → 일반 예매 정상
    → 매진 처리 정상
    → 예매 취소 정상
    
    쿠폰 기능 추가
            ↓
    기존 시나리오 다시 실행
            ↓
    기존 동작이 유지되는지 확인
    ```
    
    회귀 테스트는 변경의 영향을 확인하려는 목적을 설명한다.
    
    ---
    
    ## 단위·통합 테스트와의 관계
    
    | 구분 | 분류 기준 |
    | --- | --- |
    | 단위 테스트 | 작은 동작 단위를 확인하는 범위 |
    | 통합 테스트 | 여러 구성 요소의 연결을 확인하는 범위 |
    | 회귀 테스트 | 변경으로 기존 동작이 깨졌는지 확인하는 목적 |
    | given-when-then | 시나리오를 구성하는 방식 |
    
    기존의 `MoviesService` 단위 테스트를 영화 조회 로직 변경 후 다시 실행하면 회귀를 확인하는 데 사용된다.
    
    예매 취소의 HTTP·DB 통합 테스트를 새 쿠폰 기능 도입 후 실행하는 것도 같은 목적을 가진다.
    
    ---
    
    ## 영화 서비스의 회귀 시나리오
    
    | 변경 사항 | 함께 확인할 기존 동작 |
    | --- | --- |
    | 쿠폰 할인 기능 추가 | 일반 예매 가격, 좌석 차감, 예매 취소 |
    | 인증 Guard 수정 | 비회원 요청 거절, 일반 회원·관리자 권한 구분 |
    | 영화 조회 쿼리 최적화 | 영화 상세 응답, 검색 조건, 정렬, 페이지네이션 |
    | 예매 트랜잭션 리팩터링 | 예매 실패 시 롤백, 좌석 중복 방지 |
    | 응답 DTO 변경 | 기존 필드의 타입과 NULL 처리 |
    
    변경한 파일만 보는 것보다 해당 기능을 사용하는 호출 경로와 함께 달라질 수 있는 결과를 살펴보면 확인할 시나리오를 정하기 쉽다.
    
    ---
    
    ## 버그 수정과 함께 테스트 남기기
    
    예를 들어 예매 내역 저장이 실패했는데 좌석 수가 복구되지 않는 버그를 발견했다고 하자.
    
    이 경우 다음 조건을 재현하는 테스트를 작성할 수 있다.
    
    ```
    Given
    예매 가능한 좌석이 1개 있다.
    예매 저장 단계에서 실패하도록 상황을 준비한다.
    
    When
    해당 좌석을 예매한다.
    
    Then
    예매 요청이 실패한다.
    남은 좌석은 1개로 유지된다.
    완료된 예매 내역이 남지 않는다.
    ```
    
    실제 트랜잭션 롤백을 확인하려면 이 시나리오는 DB를 포함해 실행한다. 단순히 `rollback()` 함수가 호출되었다는 검사와, DB의 값이 실제로 복구되었다는 검사는 확인 범위가 다르다.
    
    버그를 재현한 테스트가 수정 전에는 실패하고 수정 후에는 통과하는지 확인하면, 테스트가 해당 결함을 포착하는지도 알 수 있다.
    
    ---
    
    ## 수정 확인과 회귀 확인
    
    | 확인 목적 | 질문 |
    | --- | --- |
    | 수정 확인 | 발견했던 버그가 해결되었는가? |
    | 회귀 확인 | 수정 과정에서 다른 기존 동작이 깨지지 않았는가? |
    
    롤백 버그를 수정했다면 실패 경로를 확인하는 동시에 정상 예매도 점검한다.
    
    ```
    정상 예매
    → 좌석 차감과 예매 저장이 커밋되는가?
    
    저장 실패
    → 좌석 차감까지 롤백되는가?
    
    매진 상태
    → 예매가 생성되지 않는가?
    
    예매 취소
    → 기존 취소 동작이 유지되는가?
    ```
    
    이런 테스트를 자동화해 변경 때마다 실행하면, 이전에 수정했던 결함이 다시 발생하거나 기존 API 동작이 바뀌는 상황을 빠르게 발견할 수 있다.