- 필수 미션

  **1. fetch 요청과 공통 클라이언트 분리**

    - 로컬 영화 배열 대신 TMDB 인기 영화·검색·상세 응답을 사용하도록 변경.
    - 먼저 `getMoviesWithFetch()`에서 URL, query, Bearer 인증 header를 직접 작성. `response.ok`를 검사해 HTTP 실패를 예외로 전달하고 성공 응답은 JSON으로 반환.

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

    - `.env.local`의 주소·토큰을 `env.ts`에서 읽고, ky 인스턴스에 공통 설정을 모아 endpoint별 요청 함수에서 재사용. `.env.local`은 Git ignore 대상인지 확인.

    ```tsx
    import ky from "ky";
    import { env } from "../config/env";
    
    export const tmdbClient = ky.create({
      baseUrl: `${env.tmdbApiBaseUrl}/`,
      headers: {
        Authorization: `Bearer ${env.tmdbAccessToken}`,
      },
    });
    ```

    - `get-movies.ts`, `search-movies.ts`, `get-movie-detail.ts`로 요청 함수 분리. 목록·검색은 `results` 배열, 상세는 영화 객체를 받아 사용.
    - `models.ts`에 공통 영화·목록·상세 타입 분리. 실제 응답의 `poster_path`, `release_date`, `original_title` 등 필드명을 그대로 사용하고, 목록의 `genre_ids`와 상세의 `genres`를 구분.

  **2. 목록·검색·상세 화면에 서버 데이터 연결**

    - `useEffect`에서 요청하고 `movies`, `isLoading`, `errorMessage`로 데이터·로딩·오류 상태 관리. 요청 시작 시 오류 초기화 → 성공 시 응답 저장 → 실패 시 안내 문구 → 마지막에 로딩 종료.
    - cleanup에서 `ignore = true`로 설정해 화면 이동 뒤 도착한 이전 응답의 상태 반영 방지.

    ```tsx
    useEffect(() => {
      let ignore = false;
      async function loadMovies() {
        setIsLoading(true);
        setErrorMessage(null);
    
        try {
          const response = await getMovies({ page: 1 });
          if (!ignore) setMovies(response.results);
        } catch {
          if (!ignore) setErrorMessage("영화 목록을 불러오지 못했어요.");
        } finally {
          if (!ignore) setIsLoading(false);
        }
      }
    
      loadMovies();
    
      return () => {
        ignore = true;
      };
    }, []);
    ```

    - 화면은 로딩 → 오류 → 빈 결과 → 영화 목록 순서로 분기.
    - 검색어는 URL의 `query`에서 읽고 제출할 때 URL 갱신. `normalizedQuery` 변경 시 검색 API를 다시 호출하고, 빈 검색어는 검색 안내 화면 표시.

    ```tsx
    function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
      event.preventDefault();
      const nextQuery = searchText.trim();
      navigate({
        search: nextQuery ? { query: nextQuery } : {},
      });
    }
    ```

    - 상세는 URL의 영화 ID를 양의 정수로 검사한 뒤 `getMovieDetail()` 호출. 잘못된 ID 안내와 API의 `404` 안내를 구분.
    - `tmdb-image.ts`에서 포스터·배경 이미지 URL 생성. 이미지 경로가 `null`이면 대체 영역 표시, 상영 시간이 `null`이면 별도 안내 문구 표시.
    - 북마크는 TMDB 영화 ID를 기준으로 기존 Zustand store와 연결. 공통 footer에 TMDB 로고와 출처 문구 유지.

  **3. Spring 백엔드 연결 확인 화면**

    - `backend-client.ts`에 Spring 주소를 따로 두고, `week5-api-page.tsx`를 `/api` 라우트에 연결.
    - `ApiCheck`에 입력값·응답 문자열·로딩 상태를 두고 재사용. 각 입력칸의 확인 버튼에서 GET 요청을 보내고 결과를 바로 아래 `pre`에 표시.

    ```tsx
    import ky from "ky";
    
    export const backendClient = ky.create({
      baseUrl: "http://localhost:8080/",
    });
    ```

    - `getPath` props로 닉네임·이메일·회원별 평가 endpoint를 전달. 입력값은 `trim()`으로 정리하고 `encodeURIComponent()`로 URL에 넣을 수 있도록 인코딩.
    - 요청 결과는 `JSON.stringify(response, null, 2)`로 들여쓰기하여 표시. 요청 중 버튼 비활성화, 실패 시 오류 메시지 표시.

    ```tsx
    const response = await backendClient
      .get(getPath(input), { retry: 0 })
      .json<unknown>();
    
    setResult(JSON.stringify(response, null, 2));
    ```

  **확인 결과**

    - TMDB 영화 목록과 이미지 표시, 카드에서 상세 이동, 검색 결과·검색 결과 없음·검색어 지우기 동작 확인.
    - 목록·검색·상세 URL 직접 접근과 새로고침, 잘못된 영화 ID와 존재하지 않는 영화 안내 확인. 정상 사용 흐름에서 Console 오류 없음.
    - `/api`에서 닉네임·이메일 사용 가능 여부가 JSON으로 표시되는 것 확인. 회원 ID `1`로 조회 시 평가 2건 표시 확인, 해당 화면 Console 오류 없음.
    - `pnpm build` 성공.
    - TMDB — API 문서
    - MDN — Fetch API 사용
    - React — Effect에서 데이터 요청