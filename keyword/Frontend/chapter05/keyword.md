- HTTP와 API
    - API, endpoint, HTTP method와 status code는 요청과 응답에서 각각 어떤 역할을 할까요?

  | **용어** | **역할** | **우리 코드 예** |
      | --- | --- | --- |
  | API | "이렇게 물으면 이렇게 답한다"는 약속 | TMDB API |
  | endpoint | base URL 뒤에 붙는 요청 주소 | /movie/popular, /search/movie, /movie/{movie_id} |
  | HTTP method | 하려는 동작 (조회, 생성, 수정, 삭제) | 이번 주 요청은 전부 GET |
  | query | ? 뒤에 붙는 조건 | ?language=ko-KR&page=1 |
  | header | 요청에 붙이는 부가 정보 | Authorization: Bearer {토큰} |
  | status code | 결과를 알려주는 번호 | 200, 401, 404 |

  **우리 코드에서 (4장에서 보낸 인기 영화 요청)**

  위 용어들이 실제 요청과 응답의 어느 자리에 들어가는지, 4장 Network 탭에서 확인한 값으로 보면 이렇다.

    ```yaml
    요청:
      method: GET
      url: https://api.themoviedb.org/3/movie/popular?language=ko-KR&page=1
      endpoint: /movie/popular
      query:
        language: ko-KR
        page: 1
      header:
        Authorization: Bearer eyJ...
    응답:
      status code: 200
      header:
        Access-Control-Allow-Origin: "*"
      body: { page: 1, results: [ ... ], total_pages: 1001, total_results: ... }
    ```

  **CRUD와 method**

  | **CRUD** | **method** |
      | --- | --- |
  | Create (만들기) | POST |
  | Read (읽기) | GET |
  | Update (바꾸기) | PUT (전체 교체), PATCH (일부 수정) |
  | Delete (지우기) | DELETE |

  **자주 보는 status code**

  | **번호** | **뜻** | **이번 주에 겪은 상황** |
      | --- | --- | --- |
  | 2xx | 성공 | 200 인기 영화 목록을 잘 받음 |
  | 4xx | 요청이 잘못됨 | 401 토큰을 일부러 틀리게 넣었을 때, 
    404 없는 영화 번호(/movies/99999999) |
  | 5xx | 서버 내부 오류 |  |

    - 브라우저와 API 서버의 origin이 다를 때 CORS는 어떤 역할을 할까요?

  **origin** - 프로토콜 + 호스트 + 포트. 셋 중 하나라도 다르면 다른 origin

  **SOP** - 다른 origin의 응답을 JS가 읽지 못하게 막는 브라우저 규칙

  **CORS** - 서버가 Access-Control-Allow-Origin 헤더로 "이 origin은 읽어도 된다"고 허락해서 그 막힘을 풀어주는 규칙

    ```
    우리 화면:  http://localhost:5173
    TMDB API:  https://api.themoviedb.org      ← 
    프로토콜, 호스트, 포트 모두 다름 → 다른 origin
    ```

  **우리 코드에서**

    ```
    localhost:5173 → TMDB 요청 → TMDB 응답
    응답 헤더: Access-Control-Allow-Origin: *
    브라우저: "*"니까 아무 origin이나 OK → JS에 응답 전달 ✅
    ```

  4장 Network 탭 Response headers에서 Access-Control-Allow-Origin: *를 직접 확인했다. 그래서 CORS 에러 없이 받아졌다.

  허락하지 않는 서버는 응답이 와도 브라우저가 JS에 넘기지 않고 Console에 CORS 에러를 띄운다.

  **CORS 에러는 HTTP 오류가 아니라 네트워크 오류처럼 보인다**

  401 에러는 서버가 "거절"이라고 답한 응답을 JS가 받아서 읽는다. CORS 에러는 브라우저가 응답을 JS에 아예 안 넘겨준다.
  그래서 JS 입장에서는 와이파이가 끊겨서 응답을 못 받은 것과 똑같이 보인다.

  |  | **401, 404 (HTTP 오류)** | **CORS 에러** |
      | --- | --- | --- |
  | 요청이 서버까지 갔나? | 갔다 | 갔다 |
  | 브라우저가 응답을 JS에 넘겨주나? | 넘겨준다 | 안 넘겨준다 |
  | JS가 status 번호를 알 수 있나? | 안다 (401) | 모른다 |
  | fetch 결과 | 성공(fulfilled), 대신 response.ok가 false | 실패(rejected), TypeError: Failed to fetch |
  | 우리 코드에서 가는 곳 | if (!response.ok) 검사 | catch (와이파이가 끊겼을 때와 같은 곳) |
  | Network 탭 Status 칸 | 401 | CORS error |

  그래서 6.3의 오류 문구 함수에서도 CORS 에러는 404로 잡히지 않고 "영화 정보를 불러오지 못했어요."로 간다.

- Promise와 비동기 처리
    - Promise의 pending, fulfilled와 rejected 상태는 각각 무엇을 의미할까요?

  Promise는 나중에 결과가 들어올 상자이고, 상태는 아래 셋 중 하나다.

  | **상태** | **뜻** | **받는 곳** |
      | --- | --- | --- |
  | pending | 아직 결과가 없음 (기다리는 중) |  |
  | fulfilled | 성공해서 값이 들어있음 | .then() |
  | rejected | 실패해서 이유가 들어있음 | .catch() |

  한 번 fulfilled나 rejected가 되면 다시 바뀌지 않는다.

  **우리 코드에서 (promise-status.ts)**

    ```tsx
    const movieRequest= new Promise<string>((resolve) => {
      setTimeout(() => resolve("영화 요청이 끝났어요."), 300);
    });
    
    console.log("1. 요청을 시작했어요.");
    
    movieRequest
      .then((message) => console.log(`2.${message}`))
      .catch((error) => console.error(error))
      .finally(() => console.log("3. 요청 처리를 마쳤어요."));
    ```

  1이 먼저 찍히고(pending), 0.3초 뒤 resolve()로 fulfilled가 되면 2, 마지막으로 .finally가 3을 찍는다.

  resolve 대신 reject(new Error(...))를 부르면 rejected가 되어 1 → 에러 → 3 순서로 찍힌다.

  fetch와 ky의 .json()도 부르는 순간 데이터가 아니라 pending 상태의 Promise를 돌려준다. 그래서 await나 .then()으로 기다려서 꺼내야 한다

    - `.then().catch()`와 `async/await`는 같은 비동기 흐름을 어떻게 다르게 표현하나요?

  둘은 다른 기능이 아니라 같은 Promise를 읽는 두 가지 문법이다.

  |  | **.then().catch()** | **async/await** |
      | --- | --- | --- |
  | 표현 방식 | 결과를 콜백으로 이어 붙인다 | 결과를 기다렸다가 변수에 담아 위에서 아래로 쓴다 |
  | 값 받기 | .then((value) => ...) 안에서 | const value = await ... |
  | 오류 처리 | .catch(...) | try { } catch { } |
  | 끝나면 항상 | .finally(...) | finally { } |
  | 잘 맞는 곳 | 짧은 연결 | 단계가 여러 개인 로직 |

  **우리 코드에서**

    ```tsx
    // movie-list-page.tsx (async/await)
    async function loadMovies() {
      setIsLoading(true);
      try {
        const response= await getMovies({ page: 1 });
        if (!ignore) setMovies(response.results);
      } catch {
        if (!ignore) setErrorMessage("영화 목록을 불러오지 못했어요.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    ```

    ```tsx
    // search-page.tsx (.then().catch())
    searchMovies({ query: normalizedQuery})
      .then((response) => {
        if (!ignore) setMovies(response.results);
      })
      .catch(() => {
        if (!ignore) setErrorMessage("검색 결과를 불러오지 못했어요.");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });
    ```

  두 코드가 하는 일(성공 → 데이터 저장, 실패 → 오류 문구, 끝 → 로딩 끄기)은 똑같다. 쓰는 모양만 다르다.

    - `await`를 사용해도 브라우저 전체가 멈추지 않는 이유는 무엇일까요?

  await는 그 async 함수만 잠깐 쉬게 할 뿐, JS 전체를 멈추지 않는다.

  **싱글 스레드** - JS는 한 번에 한 가지 일만 한다

  **Web API** - 그래서 서버 요청처럼 기다리는 일은 브라우저에게 맡긴다

  **이벤트 루프** - 맡긴 일의 결과가 오면, JS가 한가할 때 이어서 실행시켜 준다

  **await** - 그 함수의 나머지 줄만 결과가 올 때까지 미뤄 둔다

  **찍히는 순서로 확인**

    ```tsx
    async function loadMovies() {
      console.log("1. 요청 시작");
      const response= await getMovies({ page: 1 });
      console.log("3. 응답 도착");
    }
    
    loadMovies();
    console.log("2. loadMovies 밖의 코드");
    ```

  1 → 2 → 3 순서로 찍힌다. loadMovies는 await에서 멈추고 밖으로 나온다. 그래서 loadMovies(); 다음 줄인 2가 먼저 찍히고, 응답이 오면 loadMovies로 돌아와 3을 찍는다.

- fetch와 HTTP 요청 라이브러리
    - `fetch`에서 네트워크 오류와 HTTP 오류를 따로 처리해야 하는 이유는 무엇일까요?

  fetch는 서버 응답이 오기만 하면 성공(fulfilled)으로 처리한다. 401, 404도 응답은 온 것이라 성공이 된다. 그래서 HTTP 오류는 response.ok로 직접 검사해야 한다.

  | **상황** | **fetch 결과** | **처리하는 곳** |
      | --- | --- | --- |
  | 네트워크 오류 (와이파이 끊김, 주소를 못 찾음, CORS 차단) | 실패(rejected) | catch |
  | HTTP 오류 (401, 404, 500) | 성공(fulfilled), response.ok가 false | if (!response.ok) 검사 |
  | 정상 (200~299) | 성공(fulfilled), response.ok가 true | 그대로 진행 |

  **우리 코드에서 (get-movies-with-fetch.ts)**

    ```tsx
    const response= await fetch(
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

  if (!response.ok)가 없으면 401 응답의 오류 JSON을 영화 목록인 줄 알고 그대로 돌려준다. 그러면 화면에서 results가 없어서 엉뚱한 곳에서 에러가 난다.

  4.2에서 토큰을 일부러 틀리게 넣었더니 Network는 401, Console은 "영화 목록 요청에 실패했어요: 401"이 찍혔다. response.ok 검사가 오류를 잡은 것이다.

    - 순수 `fetch`로 여러 API 함수를 작성하면 어떤 설정과 처리가 반복될까요?

  함수마다 아래 ①~⑤를 똑같이 써야 하고, 하나가 바뀌면 모든 함수를 고쳐야 한다.

  | **반복되는 것** | **fetch 버전에서 쓴 코드** |
      | --- | --- |
  | ① base URL | ${env.tmdbApiBaseUrl}/movie/popular |
  | ② 인증 헤더 | headers: { Authorization: "Bearer " + 토큰 } |
  | ③ query 만들기 | new URLSearchParams({ language: "ko-KR", page: String(page) }) |
  | ④ HTTP 오류 검사 | if (!response.ok) throw new Error(...) |
  | ⑤ JSON과 타입 | response.json()과 반환 타입을 함수마다 직접 적기 |

  **우리 코드에서 (tmdb-client.ts, get-movies.ts)**

  ky로 base URL과 인증 헤더(①, ②)는 tmdbClient 한 곳에 모으고, query(③)는 searchParams 객체로, JSON과 타입(⑤)은 .json() 한 번으로 줄였다.

    ```tsx
    export const tmdbClient= ky.create({
      baseUrl: `${env.tmdbApiBaseUrl}/`,
      headers: {
        Authorization: `Bearer${env.tmdbAccessToken}`,
      },
    });
    ```

    ```tsx
    function getMovies({ page = 1 }: GetMoviesRequest = {}) {
      return tmdbClient
        .get("movie/popular", {
          searchParams: { language: "ko-KR", page},
        })
        .json<GetMoviesResponse>();
    }
    ```

  오류 검사(④)는 ky가 2xx가 아니면 알아서 HTTPError를 던져 줘서 따로 쓰지 않아도 된다.

    - ky와 Axios는 JSON 응답을 읽고 공통 요청 처리를 추가하는 방식이 어떻게 다를까요?

  둘 다 요청을 보내고 JSON을 받는 도구다.
  차이는 크게 두 가지인데 JSON을 꺼내는 위치가 다르고(ky는 .json(), Axios는 response.data), 공통 처리를 붙이는 이름이 다르다(ky는 hooks, Axios는 interceptors).

  |  | **ky** | **Axios** |
      | --- | --- | --- |
  | 기반 | 브라우저 fetch를 확장 | 자체 API (브라우저, Node.js 공통) |
  | JSON 읽기 | .json()의 결과가 바로 body | response.data에서 body를 꺼냄 |
  | 공통 설정 | ky.create({ baseUrl, headers }) | axios.create({ baseURL, headers }) |
  | query | searchParams | params |
  | 공통 전후 처리 | hooks (beforeRequest, afterResponse) | interceptors (request.use, response.use) |
  | HTTP 오류 | 2xx가 아니면 HTTPError | 2xx가 아니면 AxiosError |

  **같은 요청을 둘로 쓰면**

    ```tsx
    // ky
    const movies= await tmdbClient
      .get("movie/popular", { searchParams: { page: 1 } })
      .json<TmdbMovieListResponse>();
    movies.results;
    
    // Axios
    const response= await tmdbAxios.get<TmdbMovieListResponse>("movie/popular", {
      params: { page: 1 },
    });
    response.data.results;
    ```

  ky는 .json()의 결과가 곧 TMDB가 보낸 JSON이라 movies.results로 바로 쓴다. Axios는 status, headers 같은 응답 정보와 body를 한 객체에 담아 주기 때문에 response.data를 한 번 거쳐야 body가 나온다.

  **공통 처리 추가 (모든 요청 전에 로그 남기기)**

    ```tsx
    // ky
    ky.create({
      hooks: {
        beforeRequest: [({ request }) => console.log(request.url)],
      },
    });
    
    // Axios
    tmdbAxios.interceptors.request.use((config) => {
      console.log(config.url);
      return config;
    });
    ```

  공통 처리는 모든 요청의 앞이나 뒤에 자동으로 끼어드는 함수다. 로그 남기기, 토큰 붙이기, 401이면 로그인 화면으로 보내기 같은 일을 API 함수마다 쓰지 않고 한 곳에서 처리한다. ky는 hooks 배열에 함수를 넣고, Axios는 interceptors.request.use로 등록한다. Axios는 config를 return해야 요청이 계속 진행된다.

- 비동기 데이터의 UI 상태
    - 서버 데이터를 보여 주는 화면에서 로딩, 오류, 빈 결과와 성공 상태를 구분해야 하는 이유는 무엇일까요?

  로딩 중, 실패, 결과 0개일 때 movies는 모두 []라서 배열만으로는 구분이 안 된다. 그래서 isLoading과 errorMessage를 따로 둔다.

  **우리 코드에서 (movie-list-page.tsx)**

    ```tsx
    const [movies, setMovies] = useState<TmdbMovieListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    ```

    ```tsx
    {isLoading? (
      <p>영화 목록을 불러오는 중이에요.</p>
    ) : errorMessage? (
      <p>{errorMessage}</p>
    ) : movies.length=== 0 ? (
      <p>조건에 맞는 영화가 없어요.</p>
    ) : (
      <MovieGrid movies={movies} />
    )}
    ```

  검사 순서가 중요하다. 로딩 중에도 movies는 []라서, 빈 결과 검사를 먼저 하면 "영화가 없어요"가 먼저 떴다가 바뀐다.

  isLoading을 true로 시작하는 것도 같은 이유다. false로 시작하면 첫 화면에 "결과 없음"이 잠깐 보인다.

  **ignore로 늦게 온 응답 막기 (search-page.tsx)**

  검색어를 "인"에서 "인셉션"으로 빨리 바꾸면 늦게 도착한 "인" 결과가 화면을 덮어쓸 수 있다. 정리 함수가 이전 요청의 ignore를 true로 바꿔서 그 결과를 무시한다.

    ```tsx
    useEffect(() => {
      let ignore= false;
    
      searchMovies({ query: normalizedQuery})
        .then((response) => {
          if (!ignore) setMovies(response.results);
        });
    
      return () => {
        ignore= true;
      };
    }, [normalizedQuery]);
    ```

    - 각 상태를 사용자가 이해할 수 있게 표현하려면 어떤 정보와 동작이 필요할까요?

  상태마다 지금 무슨 일인지(보여줄 정보)와 다음에 뭘 하면 되는지(필요한 동작)를 알려줘야 한다.

  | **상태** | **보여줄 정보** | **필요한 동작** | **우리 코드** |
      | --- | --- | --- | --- |
  | 로딩 | 기다리는 중이라는 표시 (문구, skeleton) | 레이아웃이 크게 흔들리지 않게 자리 유지 | 영화 목록을 불러오는 중이에요. |
  | 오류 | 무엇이 실패했는지, 원인에 맞는 문구 | 다시 시도 버튼 (선택 미션) | 404 → 영화를 찾을 수 없어요. / 그 외 → 영화 정보를 불러오지 못했어요. |
  | 빈 결과 | 요청은 성공했지만 결과가 없다는 사실 | 다른 검색어 입력 유도 | 검색 결과가 없어요. |
  | 성공 | 데이터 | 상세 이동, 북마크 | 영화 카드 |

  **우리 코드에서 (get-movie-detail-error-message.ts)**

    ```tsx
    export function getMovieDetailErrorMessage(error: unknown) {
      if (isHTTPError(error) && error.response.status=== 404) {
        return "영화를 찾을 수 없어요.";
      }
    
      return "영화 정보를 불러오지 못했어요.";
    }
    ```

  없는 영화(404)와 잠깐 실패(네트워크, 500)는 사용자가 할 일이 다르다. 앞은 다른 영화를 찾고, 뒤는 다시 시도하면 된다.

  **요청 전에 막는 상태**

  | **상황** | **요청** | **보여주는 것** |
      | --- | --- | --- |
  | 검색어가 비어 있음 | 안 보냄 | 검색어를 입력해 주세요. |
  | 상세 URL이 /movies/abc처럼 이상함 | 안 보냄 | 올바르지 않은 영화 번호예요. |
  | 이미지가 없음 (poster_path: null) | 이미지 요청 안 함 | 회색 박스에 이미지 없음 |
    - API 응답 타입과 화면에서 사용하는 타입을 분리하면 어떤 상황에서 도움이 될까요?

  | **상황** | **분리하면** |
      | --- | --- |
  | 서버 응답이 바뀔 때 | TMDB가 필드 이름을 바꿔도 변환 함수(adapter) 하나만 고치고 화면 컴포넌트는 그대로 둔다 |
  | 여러 API를 섞어 쓸 때 | TMDB와 우리 백엔드가 둘 다 영화 데이터를 줘도 같은 화면 타입으로 바꿔 같은 카드를 쓴다 |
  | 서버가 모르는 값을 합칠 때 | 북마크 여부처럼 화면에만 필요한 값을 화면 타입에 함께 둔다 |

  **API 타입과 화면 타입**

  |  | **API 타입** | **화면 타입** |
      | --- | --- | --- |
  | 기준 | 서버가 보내는 JSON 그대로 | 화면이 쓰기 편한 모양 |
  | 이름 | poster_path, release_date (snake_case) | posterUrl, releaseDate (camelCase) |
  | 값 | poster_path: "/abc.jpg", runtime: 145, genres: [{ id, name }] | 전체 URL, "2시간 25분", "액션, 모험" |
  | 예 | TmdbMovieListItem, TmdbMovieDetail | 2주차 Movie |

  **우리 코드에서**

  분리하지 않고 API 타입을 바로 썼다. MovieCard가 TmdbMovieListItem을 직접 받아서 getTmdbPosterUrl(movie.poster_path), movie.release_date를 화면에서 바꿔 쓴다. 상세 화면의 formatRuntime, genres.map(...)도 컴포넌트 안에서 했다.

  북마크 여부도 API 타입에 넣지 않고 store에서 movie.id로 따로 계산했다.

  **분리하면 (선택 미션 adapter 예시)**

    ```tsx
    function toMovieCardItem(movie: TmdbMovieListItem) {
      return {
        id: movie.id,
        title: movie.title,
        posterUrl: getTmdbPosterUrl(movie.poster_path),
        releaseDate: movie.release_date,
      };
    }
    ```

  서버 응답이 바뀌면 toMovieCardItem만 고치면 된다.