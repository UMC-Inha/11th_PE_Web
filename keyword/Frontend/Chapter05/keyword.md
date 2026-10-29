- HTTP와 API
    - API, endpoint, HTTP method와 status code는 요청과 응답에서 각각 어떤 역할을 할까요?
        - **API**: 프로그램 사이에서 어떤 데이터와 기능을 어떤 규칙으로 주고받을지 정한 인터페이스. HTTP API는 이 약속을 HTTP 요청·응답으로 제공
        - **endpoint**: 기능에 접근할 주소. TMDB의 base URL이 `https://api.themoviedb.org/3`이면 인기 영화 path는 `/movie/popular`. 실제 기능은 주소와 method를 함께 보고 구분.
        - **HTTP method**: 요청의 목적.
            - `GET` 조회
            - `POST` 생성·처리
            - `PUT` 대상 표현 교체
            - `PATCH` 부분 수정
            - `DELETE` 삭제
        - **status code**: 서버가 알려주는 처리 결과.
            - `200` 성공
            - `201` 생성
            - `204` 성공·body 없음
            - `400` 잘못된 요청
            - `401` 인증 필요·실패
            - `403` 접근 거부
            - `404` 대상 없음
            - `500` 서버 내부 오류
            - `4xx`는 클라이언트 요청 관련, `5xx`는 서버 처리 관련 오류 범주.

  **추가 핵심 정리**

    - **요청 데이터의 위치**: path param은 대상 식별(`/movie/550`), query는 조건·페이지(`?page=2`), body는 생성·수정 데이터. 문자열을 직접 이어 붙이기보다 `URLSearchParams`나 라이브러리의 query 옵션으로 인코딩.
    - **안전성과 멱등성**: `GET`은 서버 상태 변경을 의도하지 않는 조회. 멱등성은 같은 요청을 반복해도 의도한 서버 효과가 같다는 성질로 응답 내용이 매번 같다는 뜻은 X. `PUT`·`DELETE`는 멱등성이 있고, `POST` 재시도는 중복 처리를 고려.
    - **성공 응답도 body 확인**: `204`처럼 body가 없는 성공 응답에 무조건 JSON 파싱을 적용하지 않기. HTTP 성공과 화면에 필요한 데이터가 실제로 있는지도 별도로 판단.

  **참고 자료**

    - MDN — HTTP method
    - MDN — HTTP status
- Promise와 비동기 처리
    - Promise의 pending, fulfilled와 rejected 상태는 각각 무엇을 의미할까요?
        - **Promise**: 나중에 정해질 작업 결과를 나타내는 객체. 결과가 아직 없더라도 Promise를 먼저 반환하고, 완료 뒤 실행할 처리를 연결할 수 있음.
        - **pending**: 성공·실패가 아직 확정되지 않은 상태.
        - **fulfilled**: 성공값으로 완료.
        - **rejected**: 실패 이유로 완료. fulfilled/rejected를 합쳐 **settled**라고 부르고, 한 번 확정된 상태는 다시 pending으로 돌아가지 않음.
        - `resolve(value)`는 값 또는 다른 Promise의 결과를 받아 처리, `reject(error)`는 실패로 처리. 다른 pending Promise에 연결된 경우 `resolve` 호출 즉시 fulfilled가 되는 것은 X.
        - Promise 성공과 HTTP 성공은 구분. `fetch`는 서버가 `404`를 보내도 `Response`로 fulfilled 가능 → 상태 코드를 따로 검사.
    - `.then().catch()`와 `async/await`는 같은 비동기 흐름을 어떻게 다르게 표현하나요?
        - `.then()`은 성공 후 이어갈 콜백, `.catch()`는 앞 체인의 실패 처리, `.finally()`는 성공·실패 뒤 공통 정리. 각 메서드는 다음 처리를 연결할 새 Promise를 반환.
        - `async` 함수는 항상 Promise 반환. `await`는 그 결과를 받아 다음 줄로 이어가고, rejection은 해당 위치에서 예외처럼 전달 → `try...catch`로 처리. 요청 속도나 통신 방식이 달라지는 문법은 X.

        ```tsx
        function getTitle(): Promise<string> {
          return Promise.resolve("인셉션");
        }
        
        function showWithThen() {
          return getTitle()
            .then((title) => console.log(title))
            .catch((error) => console.error(error));
        }
        
        async function showWithAwait() {
          try {
            const title = await getTitle();
            console.log(title);
          } catch (error) {
            console.error(error);
          }
        }
        ```

        - 간단한 연결은 `.then()`으로 표현 가능, 여러 단계의 값·조건 처리는 `async/await`가 읽기 편한 경우가 많음
    - `await`를 사용해도 브라우저 전체가 멈추지 않는 이유는 무엇일까요?
        - `await`는 현재 async 함수의 **await 이후 실행을 잠시 보류**하고 제어권을 돌려줌. 브라우저 전체나 다른 JavaScript 실행을 멈추는 명령은 X.
        - 브라우저가 네트워크 작업을 진행하는 동안 메인 스레드는 다른 코드 실행 가능. Promise가 완료되면 후속 처리가 마이크로태스크로 예약되어 현재 실행 중인 동기 코드 뒤에 이어짐. 이미 완료된 Promise를 await해도 이후 코드는 나중에 재개.

        ```jsx
        async function showOrder() {
          console.log("1");
          await Promise.resolve();
          console.log("3");
        }
        
        showOrder();
        console.log("2");
        
        // 출력 순서: 1 → 2 → 3
        ```

        - **비동기 문법 ≠ 무거운 계산의 병렬 실행**. `async` 함수 안에서도 긴 반복문이나 큰 동기 계산은 화면을 멈추게 할 수 있음. 긴 계산은 작업 분할·Web Worker 등 별도 접근 검토.

  **추가 핵심 정리**

    - **독립 요청 묶기**: `Promise.all([getMovies(), getMovieDetail(550)])`처럼 필요한 요청을 먼저 시작하고 결과를 함께 기다릴 수 있음. 하나가 실패하면 전체 Promise가 reject되지만 이미 시작한 나머지 요청이 자동 취소되지는 않음. 각 성공·실패를 모두 확인하려면 `Promise.allSettled` 검토.
    - **오류를 삼키지 않기**: `.catch()`에서 로그만 남기고 정상 반환하면 다음 체인에는 처리된 것으로 전달. 호출한 화면에서도 실패를 알아야 하면 오류를 다시 던지거나 명확한 결과 타입 반환.
    - **finally의 역할**: 로딩 해제 같은 정리에 사용. `.finally()` 콜백의 일반 반환값은 기존 성공값을 대체하지 않지만, 오류를 던지거나 실패 Promise를 반환하면 다음 체인도 실패하므로 정리 로직 위주로 작성.

  **참고 자료**

    - MDN — Promise
    - MDN — async function
    - MDN — await
- fetch와 HTTP 요청 라이브러리
    - `fetch`에서 네트워크 오류와 HTTP 오류를 따로 처리해야 하는 이유는 무엇일까요?
        - **fetch**는 브라우저의 기본 HTTP 요청 API. 반환 Promise의 성공은 응답을 받았다는 뜻으로, 업무 성공이나 `2xx` 상태 보장은 X.
        - **네트워크 계열 실패**: 연결·DNS 문제나 CORS 차단 등으로 사용할 수 있는 응답을 얻지 못하면 reject.
        - **HTTP 오류**: `401`·`404`·`500` 응답은 받아도 기본 fetch는 reject하지 않음 → `response.ok` 또는 `status` 검사 필요. `ok`는 status가 `200~299`일 때 true.

        ```tsx
        async function readJson(url: string): Promise<unknown> {
          const response = await fetch(url);
        
          if (!response.ok) {
            throw new Error("HTTP 요청 실패: " + response.status);
          }
        
          return response.json();
        }
        ```

        - HTTP 오류를 직접 `throw`하면 호출한 쪽의 `catch`에서 네트워크 실패와 함께 처리 가능. 구체적인 안내가 필요하면 오류 객체에 status를 담거나 HTTPError처럼 구분 가능한 타입 사용.
        - **응답 수신과 body 읽기도 별개**: `fetch`가 완료되어도 `response.json()`은 별도 Promise. body 수신·JSON 문법 오류가 발생할 수 있고, JSON 파싱 성공만으로 필요한 필드가 있다는 보장도 X.
    - 순수 `fetch`로 여러 API 함수를 작성하면 어떤 설정과 처리가 반복될까요?
        - base URL, 인증 header, 공통 언어·페이지 query, 요청 body의 JSON 변환, 응답 파싱, HTTP 오류 검사, 취소 signal 전달. 목록·검색·상세마다 복사하면 토큰이나 정책 변경 시 수정 누락 위험.
        - 공통 HTTP client에는 서버 주소·인증·공통 오류 정책, endpoint 함수에는 path·요청값·응답 타입, 컴포넌트에는 로딩·오류·표시 상태를 배치 → 역할 분리.
    - ky와 Axios는 JSON 응답을 읽고 공통 요청 처리를 추가하는 방식이 어떻게 다를까요?
        - **ky**: Fetch API 기반. `await client.get(path).json<ResponseType>()`로 JSON body를 바로 얻음. `ky.create()`의 인스턴스와 `beforeRequest`·`afterResponse` 같은 hooks로 공통 처리.
        - **Axios**: `await client.get<ResponseType>(path)`는 응답 객체를 반환하고 body는 `response.data`. `axios.create()`와 요청·응답 interceptors로 공통 처리. 기본 JSON 응답 변환을 제공하며 status·header도 응답 객체에서 조회.

        ```tsx
        // ky: JSON body를 바로 받기
        const body = await tmdbClient
          .get("movie/popular")
          .json<TmdbMovieListResponse>();
        
        // Axios: 응답 객체에서 data 읽기
        const response = await axiosClient
          .get<TmdbMovieListResponse>("movie/popular");
        const axiosBody = response.data;
        ```

        - ky의 `.json<T>()`와 Axios의 응답 제네릭은 타입 검사에 사용할 모양을 알려주는 것. 서버가 실제로 그 JSON을 보냈는지 자동 검증하는 기능은 X.

  **추가 핵심 정리**

    - **재시도와 타임아웃**: fetch 자체는 범용 자동 재시도·timeout 옵션을 제공하지 않아 직접 제어 필요. ky는 조건에 따른 재시도가 있으므로 Network의 중복 요청 원인을 구분. 인증 실패나 잘못된 요청을 무조건 반복하지 않고 method·status·횟수 기준 설정.
    - **취소**: `AbortController`의 signal을 요청에 전달하고 필요할 때 `abort()` 호출. 취소를 일반 실패 문구로 보여줄지 구분. UI에서 이전 응답을 무시하는 것과 통신 취소는 서로 다른 동작.
    - **진단 순서**: Network에서 URL·method·query·header → status → 응답 body 확인. 토큰 자체를 로그·스크린샷에 노출하지 않고, 공통 client가 있어도 CORS 허용 정책을 프론트에서 바꿀 수는 없음.

  **참고 자료**

    - MDN — Response.ok
    - Axios — Response Schema
    - Axios — Interceptors · 오류 처리
- 비동기 데이터의 UI 상태
    - 서버 데이터를 보여 주는 화면에서 로딩, 오류, 빈 결과와 성공 상태를 구분해야 하는 이유는 무엇일까요?
        - 요청 전에는 데이터가 없고, 응답 지연·실패·정상적인 0건 결과가 모두 가능. 배열이 비었다는 사실만으로는 요청 중인지, 실패인지, 실제 결과가 없는지 구분 불가.
        - **로딩**: 아직 처리 중 → 기다리는 화면. **오류**: 데이터를 확인하지 못함 → 실패 안내. **빈 결과**: 요청은 성공했지만 표시 항목 0개. **성공**: 사용할 데이터가 있어 정상 표시. 서로 다른 원인이므로 사용자에게도 다른 정보 필요.
        - 예: 검색 API의 `200 + results: []`는 검색 결과 0건, `401`은 인증 실패, `404` 상세 응답은 영화 없음. 모든 실패를 “검색 결과가 없어요”로 처리하면 원인 혼동.
        - 검색 전 **idle**도 따로 고려. 빈 검색어에는 검색 안내를 표시하고 요청하지 않으며, 실제로 검색한 뒤 0건일 때만 빈 결과 안내.
    - 각 상태를 사용자가 이해할 수 있게 표현하려면 어떤 정보와 동작이 필요할까요?
        - **로딩**: “영화 목록을 불러오는 중이에요”나 skeleton으로 진행 상태 표시. 포스터 영역 크기를 유지하면 응답 뒤 화면이 갑자기 밀리는 현상 감소. 중복 제출이 문제라면 해당 동작 제한.
        - **오류**: 사용자가 이해할 문구와 다음 행동 제공. 예: 연결 상태 확인, 다시 시도, 목록으로 돌아가기. 개발자에게 필요한 status·진단 정보와 사용자 문구는 구분하고 원시 오류·토큰을 그대로 노출하지 않기.
        - **빈 결과·성공**: 빈 결과에는 현재 검색어·조건과 변경 안내, 성공에는 제목·포스터·페이지 등 필요한 정보 표시. 성공 응답에서도 `poster_path: null` 같은 필드 누락 가능 → 같은 크기의 “이미지 없음” 영역 제공.
        - 첫 요청의 표시 순서는 로딩 → 오류 → 빈 결과 → 목록처럼 정리. 새 요청 시작 시 이전 오류를 초기화하고, 완료·실패 시 로딩 종료. 검색어가 바뀌는 경우 이전 결과를 비울지 유지할지도 명시적으로 선택.
    - API 응답 타입과 화면에서 사용하는 타입을 분리하면 어떤 상황에서 도움이 될까요?
        - **API 응답 타입**은 서버 계약 표현. TMDB의 `poster_path`, `release_date`, nullable 필드와 `results` 포장 구조를 그대로 기술. **UI 타입**은 카드 표시와 상호작용에 필요한 값 표현.
        - 예: API의 `poster_path`를 완성 이미지 URL로, `release_date`를 화면 표시용 이름으로 변환. adapter가 두 타입을 연결하면 API 필드 변경을 여러 컴포넌트에서 고치지 않고 변환 지점에 모을 수 있음.

        ```tsx
        interface ApiMovie {
          id: number;
          title: string;
          release_date: string;
        }
        
        interface MovieCardModel {
          id: number;
          title: string;
          releaseDate: string;
        }
        
        function toMovieCard(movie: ApiMovie): MovieCardModel {
          return {
            id: movie.id,
            title: movie.title,
            releaseDate: movie.release_date,
          };
        }
        ```

        - 위 코드는 필드 이름 변환만 보여주는 축약 예시. 실제로 포스터 URL·기본 표시값·날짜 형식 등을 adapter에서 처리 가능. 이름만 같은 의미로 복사하는 정도라면 타입·변환 코드가 늘어나는 비용도 고려.
        - 북마크 여부는 서버 영화 타입에 넣어 중복 저장하기보다 해당 영화 ID를 기준으로 Zustand에서 계산. API 타입·UI 타입을 분리해도 실행 중 데이터 검증이 자동으로 생기지는 않음 → 필요 시 `unknown`과 검증 함수·스키마 사용.

  **추가 핵심 정리**

    - **응답 순서 역전**: A 검색 뒤 B 검색을 했는데 A 응답이 늦게 와 B 결과를 덮을 수 있음. Effect cleanup에서 `ignore = true`로 설정하고 성공·실패·로딩 해제 전에 확인. 이 방식은 이전 응답의 state 반영 방지이며 요청 자체 취소는 X.
    - **책임 분리**: API 함수는 데이터 반환·오류 전달, 화면은 상태 전환·사용자 안내 담당. 응답 구조·형식 변환은 adapter로 모을 수 있지만, 실제 요청 성공 여부와 화면 상태 관리는 별도로 확인.

  **참고 자료**

    - React — useEffect의 데이터 요청·cleanup