# chapter05

- HTTP와 API
    - API, endpoint, HTTP method와 status code는 요청과 응답에서 각각 어떤 역할을 할까요?
        
        ### API란?
        
        API(Application Programming Interface)는 서로 다른 프로그램이 데이터나 기능을 주고받을 수 있도록 정해 놓은 방법이다.
        
        예를 들어 UMCine에서 영화 정보를 표시하려면 영화 제목, 포스터, 개봉일 등의 데이터가 필요하다.
        
        이때 모든 영화 정보를 직접 저장하는 대신 TMDB API를 통해 필요한 데이터를 가져올 수 있다.
        
        ```
        UMCine (브라우저)
              ↓ 영화 정보 요청
        TMDB API 서버
              ↓ 영화 정보 응답
        UMCine 화면에 영화 표시
        ```
        
        즉, API를 사용하면 다른 프로그램에서 제공하는 데이터나 기능을 활용할 수 있다.
        
        ### Endpoint란?
        
        Endpoint는 API에서 특정 데이터나 기능에 접근하기 위한 주소이다.
        
        같은 API 서버라도 어떤 Endpoint로 요청하는지에 따라 다른 데이터를 받을 수 있다.
        
        이번 미션에서 사용한 TMDB API의 Endpoint는 다음과 같다.
        
        | Endpoint | 역할 |
        | --- | --- |
        | `/movie/popular` | 인기 영화 목록 조회 |
        | `/search/movie` | 영화 검색 |
        | `/movie/969681` | ID가 969681인 영화의 상세 정보 조회 |
        
        예를 들어 다음 주소로 요청하면 인기 영화 목록을 가져올 수 있다.
        
        ```
        https://api.themoviedb.org/3/movie/popular
        ```
        
        여기서 `/movie/popular`가 인기 영화 목록을 조회하는 Endpoint이다.
        
        ### HTTP Method란?
        
        HTTP Method는 서버에 어떤 작업을 요청할지 나타내는 방법이다.
        
        대표적인 HTTP Method는 다음과 같다.
        
        | Method | 역할 | 예시 |
        | --- | --- | --- |
        | `GET` | 데이터 조회 | 영화 목록 가져오기 |
        | `POST` | 데이터 생성 | 게시글 작성하기 |
        | `PUT` | 데이터 전체 수정 또는 교체 | 게시글 내용 수정하기 |
        | `DELETE` | 데이터 삭제 | 게시글 삭제하기 |
        
        이번 UMCine 미션에서는 TMDB에서 영화 정보를 가져오기 위해 `GET`을 사용했다.
        
        ```tsx
        const response = await fetch(
          `${env.tmdbApiBaseUrl}/movie/popular`,
          {
            method: "GET",
          },
        );
        ```
        
        `fetch`는 HTTP Method를 별도로 지정하지 않으면 기본적으로 `GET`을 사용한다. 따라서 실제 미션 코드에서는 `method: "GET"`을 생략했다.
        
        ### HTTP Status Code란?
        
        HTTP Status Code는 서버가 요청을 처리한 결과를 숫자로 알려주는 것이다.
        
        브라우저는 이 숫자를 통해 요청이 성공했는지, 오류가 발생했는지 확인할 수 있다.
        
        | 상태 코드 | 의미 |
        | --- | --- |
        | `200 OK` | 요청 성공 |
        | `201 Created` | 데이터 생성 성공 |
        | `400 Bad Request` | 잘못된 요청 |
        | `401 Unauthorized` | 인증 정보가 없거나 유효하지 않음 |
        | `404 Not Found` | 요청한 리소스를 찾을 수 없음 |
        | `500 Internal Server Error` | 서버 내부 오류 |
        
        이번 미션에서는 순수 `fetch`로 인기 영화 목록을 요청한 뒤, Chrome 개발자 도구의 Network 패널에서 `200` 응답을 확인했다.
        
        또한 `fetch`는 서버에서 `404`나 `500`과 같은 오류 상태 코드를 반환하더라도 자동으로 예외를 발생시키지 않는다.
        
        따라서 `response.ok`를 사용하여 요청이 성공했는지 확인했다.
        
        ```tsx
        if (!response.ok) {
          throw new Error(`영화 목록 요청에 실패했어요: ${response.status}`);
        }
        ```
        
        `response.ok`는 HTTP 상태 코드가 200~299 범위이면 `true`, 그렇지 않으면 `false`가 된다.
        
        따라서 API는 데이터를 주고받는 방법, Endpoint는 요청할 주소, HTTP Method는 요청할 작업, Status Code는 요청 처리 결과라고 이해할 수 있다.
        
    - 브라우저와 API 서버의 origin이 다를 때 CORS는 어떤 역할을 할까요?
        
        ### Origin이란?
        
        Origin은 웹페이지가 어디에서 제공되었는지를 나타내는 출처이다.
        
        Origin은 다음 세 가지 요소의 조합으로 구분된다.
        
        ```
        프로토콜 + 호스트 + 포트
        ```
        
        예를 들어 다음 두 주소를 살펴보자.
        
        ```
        http://localhost:5173
        http://localhost:5174
        ```
        
        두 주소는 포트 번호가 다르기 때문에 서로 다른 Origin으로 취급된다.
        
        이번 UMCine 미션에서도 브라우저와 TMDB API 서버의 Origin은 서로 다르다.
        
        ```
        UMCine
        http://localhost:5173
        
        TMDB API
        https://api.themoviedb.org
        ```
        
        ### CORS란?
        
        CORS(Cross-Origin Resource Sharing)는 서로 다른 Origin 사이에서 브라우저가 API 응답에 접근할 수 있도록 허용하는 방식이다.
        
        브라우저에는 보안을 위해 다른 Origin의 응답을 JavaScript에서 마음대로 읽지 못하도록 제한하는 **동일 출처 정책(Same-Origin Policy)**이 있다.
        
        하지만 실제 웹사이트에서는 다른 서버의 API를 사용해야 하는 경우가 많다.
        
        이때 API 서버가 CORS 관련 응답 헤더를 통해 접근을 허용하면 브라우저에서 해당 응답을 사용할 수 있다.
        
        ```
        UMCine (localhost:5173)
                ↓
            TMDB API 요청
                ↓
           TMDB API 서버
                ↓
         CORS 허용 응답 헤더 전달
                ↓
         브라우저에서 응답 사용
                ↓
         영화 목록 화면에 표시
        ```
        
        즉, CORS는 서로 다른 Origin 사이에서 데이터를 주고받을 때 브라우저가 응답을 사용해도 되는지 확인하는 역할을 한다.
        
        ### CORS 관련 응답 헤더
        
        대표적인 CORS 응답 헤더에는 `Access-Control-Allow-Origin`이 있다.
        
        ```
        Access-Control-Allow-Origin: *
        ```
        
        여기서 `*`는 모든 Origin을 허용한다는 의미이다. 다만 쿠키 등의 자격 증명이 포함된 요청에는 `*`를 사용할 수 없다.
        
        특정 Origin만 허용하도록 설정할 수도 있다.
        
        ```
        Access-Control-Allow-Origin: http://localhost:5173
        ```
        
        이 경우에는 `http://localhost:5173`에서 실행되는 웹페이지가 해당 API 응답에 접근할 수 있다.
        
        ### CORS 오류가 발생하면?
        
        API 서버가 브라우저의 Origin을 허용하지 않으면 CORS 오류가 발생할 수 있다.
        
        예를 들어 서버가 정상적으로 응답을 보내더라도 CORS 허용 조건을 만족하지 않으면 브라우저의 JavaScript에서 응답 데이터를 읽지 못할 수 있다.
        
        이러한 문제는 일반적으로 API 서버의 CORS 설정을 수정하거나, 접근이 허용된 백엔드 서버를 통해 API를 요청하는 방식으로 해결할 수 있다.
        
        이번 UMCine 미션에서는 브라우저에서 TMDB API를 직접 호출했고, 실제 영화 목록과 검색 결과를 정상적으로 받아 화면에 표시할 수 있었다.
        
        따라서 CORS는 다른 Origin의 API를 사용할 때 브라우저가 해당 응답에 접근할 수 있는지 결정하는 보안 장치라고 이해할 수 있다.
        
- Promise와 비동기 처리
    - Promise의 pending, fulfilled와 rejected 상태는 각각 무엇을 의미할까요?
        
        ### Promise란?
        
        Promise는 시간이 걸리는 비동기 작업의 결과를 나타내는 JavaScript 객체이다.
        
        예를 들어 서버에서 영화 정보를 가져오는 작업은 네트워크 상태에 따라 시간이 걸릴 수 있다. 이때 Promise를 사용하면 요청이 완료될 때까지 기다린 뒤 성공 결과를 처리하거나, 실패했을 때 오류를 처리할 수 있다.
        
        Promise는 다음 세 가지 상태를 가진다.
        
        | 상태 | 의미 |
        | --- | --- |
        | `pending` | 작업이 아직 완료되지 않은 상태 |
        | `fulfilled` | 작업이 성공적으로 완료된 상태 |
        | `rejected` | 작업이 실패한 상태 |
        
        ### Promise의 상태 변화
        
        Promise는 처음에 `pending` 상태로 시작하며, 작업 결과에 따라 `fulfilled` 또는 `rejected` 상태로 변경된다.
        
        ```
                        Promise 생성
                             ↓
                          pending
                         /       \
                        ↓         ↓
                   fulfilled    rejected
                     (성공)       (실패)
        ```
        
        한 번 `fulfilled` 또는 `rejected` 상태가 되면 다른 상태로 변경되지 않는다.
        
        이번 UMCine 미션에서 사용한 `getMovies()` 함수도 Promise를 반환한다.
        
        ```tsx
        function getMovies({ page = 1 }: GetMoviesRequest = {}) {
          return tmdbClient
            .get("movie/popular", {
              searchParams: {
                language: "ko-KR",
                page,
              },
            })
            .json<GetMoviesResponse>();
        }
        ```
        
        위 함수로 영화 목록을 요청하면 다음과 같은 과정이 진행된다.
        
        1. `pending`: TMDB 서버에서 영화 정보를 가져오는 중
        2. `fulfilled`: 요청이 성공하여 영화 데이터를 받아온 상태
        3. `rejected`: 네트워크 오류나 HTTP 오류 등으로 요청에 실패한 상태
        
        즉, Promise는 비동기 작업이 진행 중인지, 성공했는지, 실패했는지를 관리하는 객체라고 이해할 수 있다.
        
    - `.then().catch()`와 `async/await`는 같은 비동기 흐름을 어떻게 다르게 표현하나요?
        
        ### `.then().catch()` 방식
        
        `.then().catch()`는 Promise의 결과에 따라 실행할 함수를 연결하는 방식이다.
        
        - `.then()`: Promise가 성공했을 때 결과 처리
        - `.catch()`: Promise가 실패했을 때 오류 처리
        - `.finally()`: 성공과 실패에 관계없이 마지막에 실행
        
        이번 미션의 영화 검색 화면에서는 다음과 같이 사용했다.
        
        ```tsx
        searchMovies({ query: normalizedQuery })
          .then((response) => {
            if (!ignore) {
              setSearchResults(response.results);
            }
          })
          .catch(() => {
            if (!ignore) {
              setErrorMessage("검색 결과를 불러오지 못했어요.");
            }
          })
          .finally(() => {
            if (!ignore) {
              setIsLoading(false);
            }
          });
        ```
        
        위 코드는 검색 요청이 성공하면 영화 목록을 저장하고, 실패하면 오류 메시지를 설정한다. 마지막에는 로딩 상태를 종료한다.
        
        ### `async/await` 방식
        
        `async/await`는 Promise를 사용하는 비동기 코드를 일반적인 순서대로 실행되는 코드처럼 작성할 수 있는 문법이다.
        
        - `async`: 함수 안에서 `await`를 사용할 수 있도록 선언
        - `await`: Promise가 처리될 때까지 해당 비동기 함수의 실행을 기다림
        - `try/catch`: 비동기 작업 중 발생한 오류 처리
        - `finally`: 성공과 실패에 관계없이 마지막에 실행
        
        이번 미션의 영화 상세 화면에서는 다음과 같이 사용했다.
        
        ```tsx
        async function loadMovie() {
          try {
            setIsLoading(true);
        
            const response = await getMovieDetail(Number(movieId));
        
            if (!ignore) {
              setMovie(response);
            }
          } catch {
            if (!ignore) {
              setErrorMessage("영화 정보를 불러오지 못했어요.");
            }
          } finally {
            if (!ignore) {
              setIsLoading(false);
            }
          }
        }
        ```
        
        `await getMovieDetail()`에서 영화 정보를 받아올 때까지 기다린 뒤, 성공하면 `setMovie()`로 데이터를 저장한다.
        
        요청이 실패하면 `catch`에서 오류 메시지를 설정한다.
        
        ### 두 방식의 차이
        
        | 구분 | `.then().catch()` | `async/await` |
        | --- | --- | --- |
        | 작성 방식 | Promise에 처리 함수를 연결 | 일반적인 코드 실행 순서처럼 작성 |
        | 성공 처리 | `.then()` | `await` 이후 코드 |
        | 오류 처리 | `.catch()` | `try/catch` |
        | 공통 마무리 | `.finally()` | `finally` |
        
        두 방식 모두 Promise를 처리하며, 기능상의 목적은 같고 코드를 표현하는 방법이 다르다.
        
        이번 UMCine 미션에서는 검색 화면에 `.then().catch()`를, 상세 화면에 `async/await`를 사용했다.
        
    - `await`를 사용해도 브라우저 전체가 멈추지 않는 이유는 무엇일까요?
        
        ### 동기 처리와 비동기 처리
        
        동기 처리는 앞의 작업이 끝난 뒤 다음 작업을 진행하는 방식이다.
        
        반면 비동기 처리는 시간이 걸리는 작업의 완료를 기다리는 동안 다른 작업을 처리할 수 있는 방식이다.
        
        예를 들어 영화 정보를 서버에서 가져오는 데 2초가 걸린다고 가정해 보자.
        
        만약 브라우저 전체가 멈춘다면 영화 정보를 받아올 때까지 버튼 클릭이나 다른 화면 작업도 처리하지 못할 것이다.
        
        하지만 `await`는 브라우저 전체를 멈추는 것이 아니라, 현재 실행 중인 비동기 함수의 이후 코드 실행만 잠시 기다리게 한다.
        
        ### `await`의 동작 과정
        
        ```tsx
        async function loadMovies() {
          console.log("영화 요청 시작");
        
          const movies = await getMovies();
        
          console.log("영화 요청 완료");
        }
        ```
        
        위 코드의 실행 과정은 다음과 같다.
        
        ```
        loadMovies() 실행
               ↓
        "영화 요청 시작" 출력
               ↓
        getMovies()로 API 요청
               ↓
        await에서 함수 실행 일시 중단
               ↓
        브라우저는 다른 작업 처리 가능
               ↓
        API 응답 도착
               ↓
        loadMovies() 실행 재개
               ↓
        "영화 요청 완료" 출력
        ```
        
        JavaScript는 이벤트 루프(Event Loop)를 통해 비동기 작업이 완료된 뒤 실행할 코드를 적절한 시점에 다시 처리한다.
        
        따라서 API 응답을 기다리는 동안에도 브라우저는 다른 이벤트를 처리할 수 있다.
        
        ### UMCine에서의 실제 사용
        
        이번 미션에서는 영화 상세 정보를 가져올 때 `await`를 사용했다.
        
        ```tsx
        setIsLoading(true);
        
        const response = await getMovieDetail(Number(movieId));
        
        setMovie(response);
        setIsLoading(false);
        ```
        
        영화 데이터를 가져오는 동안에는 로딩 메시지를 표시하고, 응답이 도착하면 영화 정보를 화면에 표시하도록 구현했다.
        
        이때 `await`로 인해 브라우저 전체가 멈추는 것은 아니므로 사용자는 다른 버튼을 클릭하거나 페이지를 이동할 수 있다.
        
        다만 JavaScript에서 시간이 오래 걸리는 동기 계산을 실행하면 브라우저의 화면 반응이 느려질 수 있다. `await`가 모든 작업을 자동으로 백그라운드에서 처리해 주는 것은 아니다.
        
        따라서 `await`는 비동기 작업이 완료될 때까지 현재 함수의 실행을 잠시 중단할 뿐, 브라우저 전체의 실행을 중단하지 않기 때문에 다른 작업을 계속 처리할 수 있다.
        
- fetch와 HTTP 요청 라이브러리
    - `fetch`에서 네트워크 오류와 HTTP 오류를 따로 처리해야 하는 이유는 무엇일까요?
        
        ### 네트워크 오류란?
        
        네트워크 오류는 브라우저가 서버와 정상적으로 통신하지 못한 경우를 의미한다.
        
        예를 들어 인터넷 연결이 끊기거나 서버에 연결할 수 없는 경우가 있다.
        
        이러한 상황에서는 `fetch()`가 반환한 Promise가 `rejected` 상태가 되므로 `catch`에서 오류를 처리할 수 있다.
        
        ```tsx
        try {
          const response = await fetch(url);
        } catch (error) {
          console.log("네트워크 오류 발생");
        }
        ```
        
        ### HTTP 오류란?
        
        HTTP 오류는 서버가 요청을 받았지만 정상적으로 처리하지 못한 경우를 의미한다.
        
        대표적으로 다음과 같은 상태 코드가 있다.
        
        | 상태 코드 | 의미 |
        | --- | --- |
        | `400` | 잘못된 요청 |
        | `401` | 인증 실패 |
        | `404` | 요청한 리소스를 찾을 수 없음 |
        | `500` | 서버 내부 오류 |
        
        중요한 점은 `fetch()`는 서버가 `404`나 `500`을 반환하더라도 Promise를 자동으로 `rejected` 상태로 만들지 않는다는 것이다.
        
        서버로부터 HTTP 응답을 정상적으로 받았다면 상태 코드가 오류를 나타내더라도 Promise는 `fulfilled` 상태가 된다.
        
        따라서 `response.ok`를 사용하여 HTTP 요청의 성공 여부를 직접 확인해야 한다.
        
        ```tsx
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`요청 실패: ${response.status}`);
        }
        
        const data = await response.json();
        ```
        
        `response.ok`는 상태 코드가 200~299 범위일 때 `true`를 반환한다.
        
        ### UMCine에서의 실제 사용
        
        이번 미션에서는 TMDB 인기 영화 목록을 요청할 때 다음과 같이 구현했다.
        
        ```tsx
        const response = await fetch(
          `${env.tmdbApiBaseUrl}/movie/popular?${searchParams}`,
          {
            headers: {
              Authorization: `Bearer ${env.tmdbAccessToken}`,
            },
          },
        );
        
        if (!response.ok) {
          throw new Error(`영화 목록 요청에 실패했어요: ${response.status}`);
        }
        
        return response.json();
        ```
        
        `response.ok`를 확인하여 HTTP 오류가 발생하면 직접 예외를 던지도록 했다.
        
        이렇게 하면 네트워크 오류뿐 아니라 HTTP 오류도 호출하는 쪽의 `catch`에서 처리할 수 있다.
        
        따라서 네트워크 오류는 서버와의 통신 자체에 실패한 경우이고, HTTP 오류는 서버가 오류 상태 코드로 응답한 경우이므로 구분하여 처리해야 한다.
        
    - 순수 `fetch`로 여러 API 함수를 작성하면 어떤 설정과 처리가 반복될까요?
        
        ### 순수 fetch에서 반복되는 코드
        
        `fetch`는 별도의 라이브러리 없이 HTTP 요청을 보낼 수 있는 JavaScript의 기본 기능이다.
        
        하지만 여러 API를 호출할 때는 공통으로 사용하는 설정과 처리 코드를 반복해서 작성해야 할 수 있다.
        
        대표적으로 다음과 같은 부분이 반복된다.
        
        - API 기본 URL: 요청을 보낼 서버 주소
        - 인증 헤더: Access Token 등의 인증 정보
        - 쿼리 파라미터: 언어, 페이지 번호, 검색어 등의 요청 조건
        - 오류 처리: `response.ok`를 이용한 HTTP 오류 확인
        - 응답 변환: `response.json()`을 이용한 JSON 데이터 읽기
        
        예를 들어 TMDB 인기 영화 목록과 검색 API를 순수 `fetch`로 각각 작성한다면 다음과 같다.
        
        ```tsx
        // 인기 영화 목록
        const response = await fetch(
          `${env.tmdbApiBaseUrl}/movie/popular`,
          {
            headers: {
              Authorization: `Bearer ${env.tmdbAccessToken}`,
            },
          },
        );
        
        // 영화 검색
        const searchResponse = await fetch(
          `${env.tmdbApiBaseUrl}/search/movie?query=스파이더맨`,
          {
            headers: {
              Authorization: `Bearer ${env.tmdbAccessToken}`,
            },
          },
        );
        ```
        
        두 요청 모두 API 기본 URL과 인증 헤더를 사용하므로 비슷한 코드가 반복된다.
        
        API 요청이 많아질수록 이러한 중복 코드가 늘어나고, 인증 방식 등을 변경할 때 여러 파일을 수정해야 할 수도 있다.
        
        ### UMCine에서의 해결 방법
        
        이번 미션에서는 이러한 중복을 줄이기 위해 `ky` 라이브러리로 공통 API 인스턴스를 생성했다.
        
        ```tsx
        export const tmdbClient = ky.create({
          baseUrl: `${env.tmdbApiBaseUrl}/`,
          headers: {
            Authorization: `Bearer ${env.tmdbAccessToken}`,
          },
        });
        ```
        
        이렇게 공통 설정을 작성하면 각 API 함수에서는 필요한 Endpoint와 요청 조건만 지정하면 된다.
        
        ```tsx
        function getMovies({ page = 1 }: GetMoviesRequest = {}) {
          return tmdbClient
            .get("movie/popular", {
              searchParams: {
                language: "ko-KR",
                page,
              },
            })
            .json<GetMoviesResponse>();
        }
        ```
        
        인증 헤더와 기본 URL을 매번 작성하지 않아도 되므로 코드가 간결해진다.
        
        따라서 여러 API에서 공통으로 사용하는 설정과 처리를 한곳에 모으면 코드 중복을 줄이고 유지보수를 쉽게 할 수 있다.
        
    - ky와 Axios는 JSON 응답을 읽고 공통 요청 처리를 추가하는 방식이 어떻게 다를까요?
        
        ### ky란?
        
        ky는 JavaScript의 `fetch`를 기반으로 만든 HTTP 요청 라이브러리이다.
        
        기본 `fetch`보다 간결하게 API 요청을 작성할 수 있으며, JSON 응답 처리와 HTTP 오류 처리 등을 편리하게 사용할 수 있다.
        
        예를 들어 순수 `fetch`에서는 응답을 받은 뒤 `response.json()`을 호출한다.
        
        ```tsx
        const response = await fetch(url);
        const data = await response.json();
        ```
        
        반면 `ky`에서는 다음과 같이 작성할 수 있다.
        
        ```tsx
        const data = await ky.get(url).json();
        ```
        
        `ky`는 기본적으로 HTTP 오류 상태 코드에 대해 예외를 발생시키므로, 일반적인 요청에서는 `response.ok`를 직접 확인하는 코드도 줄일 수 있다.
        
        ### Axios란?
        
        Axios도 HTTP 요청을 편리하게 작성할 수 있도록 도와주는 라이브러리이다.
        
        Axios는 JSON 응답을 기본적으로 변환하여 응답 객체의 `data` 속성으로 제공한다.
        
        ```tsx
        const response = await axios.get(url);
        
        const data = response.data;
        ```
        
        따라서 JSON 응답을 읽는 방식에는 다음과 같은 차이가 있다.
        
        | 구분 | ky | Axios |
        | --- | --- | --- |
        | 기반 | `fetch` 기반 | 자체 HTTP 요청 인터페이스 |
        | JSON 응답 읽기 | `.json()` | `.data` |
        | 공통 인스턴스 생성 | `ky.create()` | `axios.create()` |
        | 공통 요청 처리 | Hooks | Interceptors |
        
        ### 공통 요청 설정 방식
        
        ky와 Axios 모두 API 기본 URL이나 인증 헤더 등을 공통으로 설정할 수 있다.
        
        ky의 공통 인스턴스
        
        이번 UMCine 미션에서 실제로 사용한 방식이다.
        
        ```tsx
        const tmdbClient = ky.create({
          baseUrl: `${env.tmdbApiBaseUrl}/`,
          headers: {
            Authorization: `Bearer ${env.tmdbAccessToken}`,
          },
        });
        ```
        
        Axios의 공통 인스턴스
        
        Axios에서도 비슷하게 공통 설정을 작성할 수 있다.
        
        ```tsx
        const tmdbClient = axios.create({
          baseURL: env.tmdbApiBaseUrl,
          headers: {
            Authorization: `Bearer ${env.tmdbAccessToken}`,
          },
        });
        ```
        
        두 라이브러리 모두 공통 인스턴스를 만들면 여러 API 함수에서 동일한 설정을 재사용할 수 있다.
        
        ### Hooks와 Interceptors의 차이
        
        API 요청을 보내기 전이나 응답을 받은 뒤 공통으로 실행할 작업을 추가할 수도 있다.
        
        예를 들어 모든 API 요청을 보낼 때 로그를 출력하거나, 인증 오류가 발생했을 때 공통으로 처리하는 경우가 있다.
        
        - ky: `beforeRequest`, `afterResponse` 등의 Hooks를 사용한다.
        - Axios: `interceptors.request`, `interceptors.response`를 사용한다.
        
        두 기능 모두 요청과 응답 사이에 공통 처리를 추가한다는 목적은 비슷하지만, 설정하는 방식이 다르다.
        
        이번 UMCine 미션에서는 별도의 Hooks를 추가하지 않고, `ky.create()`를 이용해 API 기본 URL과 인증 헤더를 공통으로 설정했다.
        
        따라서 ky는 `fetch`와 비슷한 문법으로 `.json()`을 사용하고, Axios는 응답 객체의 `.data`로 JSON 데이터를 가져온다. 또한 공통 요청 처리는 ky의 Hooks와 Axios의 Interceptors를 통해 추가할 수 있다.
        
- 비동기 데이터의 UI 상태
    - 서버 데이터를 보여 주는 화면에서 로딩, 오류, 빈 결과와 성공 상태를 구분해야 하는 이유는 무엇일까요?
        
        ### 비동기 데이터의 UI 상태란?
        
        서버에서 데이터를 가져오는 작업은 네트워크 상황이나 서버의 응답 속도에 따라 시간이 걸릴 수 있다.
        
        따라서 서버 데이터를 사용하는 화면에서는 현재 요청이 어떤 상태인지 구분하여 사용자에게 알려주는 것이 중요하다.
        
        대표적으로 다음 네 가지 상태가 있다.
        
        | 상태 | 의미 | 화면 예시 |
        | --- | --- | --- |
        | 로딩(Loading) | 서버에서 데이터를 가져오는 중 | 영화 정보를 불러오는 중이에요. |
        | 오류(Error) | 요청에 실패한 상태 | 영화 정보를 불러오지 못했어요. |
        | 빈 결과(Empty) | 요청은 성공했지만 표시할 데이터가 없는 상태 | 검색 결과가 없어요. |
        | 성공(Success) | 요청이 성공하고 표시할 데이터가 있는 상태 | 영화 목록 표시 |
        
        ### 각 상태를 구분해야 하는 이유
        
        예를 들어 사용자가 UMCine에서 `스파이더맨`을 검색했다고 가정해 보자.
        
        검색 결과가 화면에 나타나지 않는다고 해서 항상 같은 상황은 아니다.
        
        - 아직 서버에서 검색 결과를 가져오는 중일 수 있다.
        - 네트워크 문제로 요청에 실패했을 수 있다.
        - 요청은 성공했지만 검색 결과가 없을 수 있다.
        
        이러한 상황을 구분하지 않으면 사용자는 데이터를 기다려야 하는지, 오류가 발생했는지, 실제로 검색 결과가 없는지 알 수 없다.
        
        이번 UMCine 미션에서도 영화 목록, 검색, 상세 화면에서 로딩과 오류 상태를 구분하고, 데이터가 없는 경우에는 별도의 안내 문구를 표시하도록 구현했다.
        
        따라서 비동기 데이터의 상태를 구분하면 사용자가 현재 화면의 상황을 정확하게 이해할 수 있다.
        
    - 각 상태를 사용자가 이해할 수 있게 표현하려면 어떤 정보와 동작이 필요할까요?
        
        ### 로딩 상태
        
        로딩 상태에서는 데이터를 가져오는 중이라는 사실을 알려줘야 한다.
        
        아무런 안내 없이 빈 화면만 보여주면 사용자는 화면이 멈췄다고 생각할 수 있다.
        
        이번 미션에서는 `isLoading` 상태를 사용하여 API 요청 중에 로딩 메시지를 표시했다.
        
        ```tsx
        const [isLoading, setIsLoading] = useState(true);
        ```
        
        ```tsx
        if (isLoading) {
          return <p>영화 정보를 불러오는 중이에요.</p>;
        }
        ```
        
        데이터를 가져오는 중에는 로딩 메시지를 표시하고, 요청이 완료되면 실제 영화 정보를 보여준다.
        
        ### 오류 상태
        
        오류 상태에서는 요청에 실패했다는 사실을 알려줘야 한다.
        
        예를 들어 인터넷 연결이 끊어지거나 서버에서 오류가 발생하면 영화 정보를 가져오지 못할 수 있다.
        
        이번 미션에서는 `errorMessage`를 사용하여 오류 메시지를 관리했다.
        
        ```tsx
        const [errorMessage, setErrorMessage] = useState("");
        ```
        
        ```tsx
        catch {
          if (!ignore) {
            setErrorMessage("영화 정보를 불러오지 못했어요.");
          }
        }
        ```
        
        오류가 발생했을 때는 사용자가 이해하기 쉬운 메시지를 표시하는 것이 좋다. 필요하다면 다시 시도할 수 있는 버튼을 제공할 수도 있다.
        
        ### 빈 결과 상태
        
        빈 결과 상태는 API 요청은 성공했지만 화면에 표시할 데이터가 없는 경우이다.
        
        예를 들어 UMCine에서 존재하지 않는 영화 제목을 검색하면 서버가 정상적으로 응답하더라도 검색 결과는 빈 배열일 수 있다.
        
        ```tsx
        if (searchResults.length === 0) {
          return <p>검색 결과가 없어요.</p>;
        }
        ```
        
        이때 오류 메시지를 표시하면 사용자는 서버에 문제가 있다고 오해할 수 있다.
        
        따라서 검색 결과가 없다는 사실을 안내하고, 다른 검색어를 입력할 수 있도록 하는 것이 좋다.
        
        ### 성공 상태
        
        성공 상태에서는 서버에서 받아온 데이터를 화면에 정상적으로 표시해야 한다.
        
        이번 UMCine 미션에서는 TMDB API에서 받아온 영화 목록을 `useState`에 저장한 뒤 화면에 표시했다.
        
        ```tsx
        const response = await getMovies({ page: apiPage });
        
        if (!ignore) {
          setMovies(response.results);
        }
        ```
        
        이후 영화 카드 컴포넌트에서 제목, 포스터, 개봉일 등의 정보를 표시했다.
        
        전체 과정을 정리하면 다음과 같다.
        
        ```
        API 요청 시작
              ↓
           로딩 상태
              ↓
          요청 완료
           /      \
          성공     실패
           ↓        ↓
        데이터 확인  오류 메시지
         /     \
        있음    없음
         ↓       ↓
        영화 표시  빈 결과 안내
        ```
        
        따라서 로딩 상태에는 진행 안내, 오류 상태에는 실패 안내, 빈 결과 상태에는 데이터가 없다는 안내, 성공 상태에는 실제 데이터를 표시해야 한다.
        
    - API 응답 타입과 화면에서 사용하는 타입을 분리하면 어떤 상황에서 도움이 될까요?
        
        ### API 응답 타입이란?
        
        API 응답 타입은 서버에서 전달하는 데이터의 구조를 TypeScript로 정의한 것이다.
        
        예를 들어 TMDB API에서 반환하는 영화 정보에는 다음과 같은 필드가 있다.
        
        ```tsx
        interface TmdbMovieListItem {
          id: number;
          title: string;
          poster_path: string | null;
          release_date: string;
          overview: string;
        }
        ```
        
        TMDB API는 `poster_path`, `release_date`처럼 단어 사이에 밑줄이 들어가는 이름을 사용한다.
        
        ### 화면에서 사용하는 타입이란?
        
        화면에서 사용하는 타입은 컴포넌트가 실제로 필요로 하는 데이터의 구조를 정의한 것이다.
        
        예를 들어 영화 카드에서 영화 제목, 포스터 URL, 개봉일만 필요하다면 다음과 같이 별도의 타입을 만들 수 있다.
        
        ```tsx
        interface MovieCardData {
          id: number;
          title: string;
          posterUrl: string;
          releaseDate: string;
        }
        ```
        
        이렇게 하면 API에서 받은 데이터를 화면에서 사용하기 편한 형태로 변환할 수 있다.
        
        ```tsx
        const movieCardData: MovieCardData = {
          id: movie.id,
          title: movie.title,
          posterUrl: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "",
          releaseDate: movie.release_date,
        };
        ```
        
        위 코드는 API 응답을 화면용 데이터로 변환하는 예시이다.
        
        ### 타입을 분리하면 좋은 점
        
        API 응답 타입과 화면 타입을 분리하면 다음과 같은 장점이 있다.
        
        - API 변경에 대응하기 쉽다. 서버의 데이터 구조가 변경되어도 변환하는 부분을 중심으로 수정할 수 있다.
        - 컴포넌트가 단순해진다. 화면에서 필요한 데이터만 전달하므로 컴포넌트가 API의 세부 구조를 몰라도 된다.
        - 데이터를 가공하기 편하다. 포스터 경로를 전체 URL로 바꾸거나 개봉일의 표시 형식을 변경할 수 있다.
        
        예를 들어 TMDB API 대신 다른 영화 API를 사용하게 되더라도, 새로운 API 응답을 `MovieCardData` 형태로 변환하면 기존 영화 카드 컴포넌트를 크게 수정하지 않고 재사용할 수 있다.
        
        ### UMCine에서의 실제 사용
        
        이번 미션에서는 `TmdbMovieListItem`, `TmdbMovieDetail` 등의 타입을 정의하여 TMDB API 응답의 구조를 관리했다.
        
        다만 실제 구현에서는 영화 카드 컴포넌트에서도 `TmdbMovieListItem`을 사용했으므로, API 응답 타입과 화면용 타입을 완전히 분리하지는 않았다.
        
        현재처럼 하나의 API를 사용하는 작은 프로젝트에서는 API 응답 타입을 그대로 사용해도 괜찮다.
        
        하지만 여러 API를 사용하거나 화면에서 데이터를 복잡하게 가공해야 하는 경우에는 API 응답 타입과 화면용 타입을 분리하는 것이 유지보수에 도움이 된다.
