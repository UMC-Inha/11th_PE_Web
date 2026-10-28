# UMCine TMDB API 연동 정리

로컬 영화 데이터(`src/data/movies.ts`)를 TMDB API로 교체하고 목록, 검색, 상세 화면을 실제 데이터에 연결했다.

- 기술: React 19(`useState`, `useEffect`), TanStack Router, ky 2.x, `fetch`, Vite 환경변수, TypeScript, Tailwind CSS
- API(TMDB v3, 읽기 전용 토큰으로 Bearer 인증)
  - `GET /movie/popular`: 인기 영화 목록
  - `GET /search/movie`: 영화 검색
  - `GET /movie/{movie_id}`: 영화 상세

## 환경변수와 응답 타입

`umcine/.env.local`에 `VITE_TMDB_API_BASE_URL`, `VITE_TMDB_ACCESS_TOKEN`을 두었다.

- Vite는 `VITE_`로 시작하는 변수만 클라이언트 코드에 노출하고, `.env` 파일은 Vite 루트에서 읽는다.
- `.env` 파일은 개발 서버가 시작할 때만 읽으므로 값을 바꾸면 서버를 재시작해야 한다.
- 값은 `src/config/env.ts` 한 곳에서 `import.meta.env`로 읽어 `env` 객체로 내보냈다.

`src/api/movies/models.ts`에는 TMDB 응답 형태 그대로 snake_case 타입을 정의했다.

```ts
type TmdbMovieListItem = {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  genre_ids: number[];
  vote_average: number;
};
type TmdbMovieListResponse = {
  page: number;
  results: TmdbMovieListItem[];
  total_pages: number;
  total_results: number;
};
type TmdbMovieDetail = Omit<TmdbMovieListItem, "genre_ids"> & {
  tagline: string;
  runtime: number | null;
  genres: { id: number; name: string }[];
};
```

상세 타입은 목록 항목에서 `genre_ids`만 `Omit`으로 빼고 상세 전용 필드를 교차 타입으로 붙였다. 화면 컴포넌트는 기존 camelCase `Movie` 타입(`src/types/movie.ts`)을 그대로 쓰기 때문에, 응답을 화면에 넘기기 전에 형식을 변환한다.

## 1. 순수 fetch 요청

`src/api/movies/get-movies-with-fetch.ts`에서 라이브러리 없이 인기 영화를 요청했다.

```ts
const searchParams = new URLSearchParams({
  language: "ko-KR",
  page: String(page),
});
const response = await fetch(
  `${env.tmdbApiBaseUrl}/movie/popular?${searchParams}`,
  {
    headers: { Authorization: `Bearer ${env.tmdbAccessToken}` },
  },
);
if (!response.ok) {
  throw new Error(`영화 목록 요청에 실패했어요: ${response.status}`);
}
return response.json();
```

- 쿼리스트링은 `URLSearchParams`로 직접 만들었다.
- `fetch`는 4xx나 5xx 응답에서도 reject하지 않으므로 `response.ok`를 확인해 직접 에러를 던졌다.
- `src/examples/fetch-movies.ts`에서 이 함수를 한 번 호출해 Console에 응답을 출력했다. `main.tsx`에서 import하므로 앱이 시작될 때 실행된다.
- Network 패널에서 확인한 것
  - Status 200
  - `Authorization` 헤더 포함 여부
  - 응답의 `page`, `results`, `total_pages`, `total_results`
- 개발 모드에서는 StrictMode 때문에 Effect가 두 번 실행되어 요청이 중복으로 보일 수 있다.

## 2. ky 인스턴스와 화면 연결

`src/api/movies/tmdb-client.ts`에 공통 설정을 모은 ky 인스턴스를 만들었다.

```ts
const tmdbClient = ky.create({
  prefix: env.tmdbApiBaseUrl,
  headers: { Authorization: `Bearer ${env.tmdbAccessToken}` },
  searchParams: { language: "ko-KR" },
});
```

- 기본 주소, 인증 헤더, 언어를 한 번만 선언한다.
- 2xx가 아닌 응답은 ky가 `HTTPError`로 던지므로 `response.ok` 분기가 필요 없다.
- 인스턴스의 기본 `searchParams`와 요청별 `searchParams`는 자동으로 병합된다.
- ky 2.x에서는 기본 주소 옵션이 `prefixUrl`에서 `prefix`로 바뀌었다. `baseUrl`을 쓰면 URL 해석 규칙 때문에 `/3` 경로가 사라지므로 `prefix`를 썼다.

API 함수는 요청 하나당 파일 하나로 나누었다.

```ts
// get-movies.ts
tmdbClient
  .get("movie/popular", { searchParams: { page } })
  .json<TmdbMovieListResponse>();
// search-movies.ts
tmdbClient
  .get("search/movie", { searchParams: { query, page } })
  .json<TmdbMovieListResponse>();
// get-movie-detail.ts
tmdbClient.get(`movie/${movieId}`).json<TmdbMovieDetail>();
```

TMDB의 `poster_path`에는 `/abc.jpg` 같은 경로만 들어 있다. 그래서 `src/utils/movies/tmbd-images.ts`의 `getTmdbImageUrl(path)`로 `https://image.tmdb.org/t/p/w500`을 붙였고, `null`이면 빈 문자열을 반환하게 했다.

### 목록 (`movie-list-page.tsx`)

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

- `ignore` 플래그는 컴포넌트가 사라지거나 Effect가 다시 실행된 뒤 늦게 도착한 응답이 state를 덮어쓰지 않게 막는다.
- `MovieCard`는 `posterPath`(camelCase)를 읽기 때문에 응답을 `Movie` 형식으로 매핑한다. 이때 `getTmdbImageUrl`로 이미지 주소도 완성한다.
- 목록 응답에 없는 `tagline`, `genres`, `runtime`은 빈 값으로 채웠다.

### 검색 (`search-page.tsx`)

- 검색어는 라우터 검색 파라미터에서 읽는다: `const { query = "" } = useSearch({ from: "/search" });`
- Effect 의존성을 `[query]`로 두어 URL의 검색어가 바뀔 때마다 다시 요청한다. 공백뿐인 검색어는 요청하지 않는다.
- 이 화면은 `MovieCard`를 쓰지 않기 때문에 JSX에서 `poster_path`, `original_title`, `release_date`를 그대로 사용한다.

### 상세 (`movie-detail-page.tsx`)

- `useParams({ from: "/movies/$movieId" })`로 id를 읽어 `getMovieDetail(Number(movieId))`를 호출한다.
- 응답은 `Movie`로 변환해 기존 `MovieDetail` 컴포넌트에 그대로 넘긴다.
  - 장르: `detail.genres.map((genre) => genre.name)`
  - 상영 시간: `` `${detail.runtime}분` ``

## 3. 로딩, 오류, 빈 결과, 성공 상태

세 화면 모두 `isLoading`, `errorMessage`, 데이터 유무로 상태를 나눈다.

```tsx
{isLoading ? <p>영화 목록을 불러오는 중이에요.</p>
  : errorMessage ? <p>{errorMessage}</p>
  : movies.length === 0 ? <p>표시할 영화가 없어요.</p>
  : <><MovieGrid movies={pagedMovies} /><Pagination ... /></>}
```

| 화면 | 로딩        | 오류           | 빈 결과                  | 성공                  |
| ---- | ----------- | -------------- | ------------------------ | --------------------- |
| 목록 | 불러오는 중 | 목록 요청 실패 | 표시할 영화 없음         | 그리드와 페이지네이션 |
| 검색 | 검색 중     | 검색 요청 실패 | 검색 결과 없음           | 결과 리스트           |
| 상세 | 불러오는 중 | 상세 요청 실패 | 영화를 찾을 수 없음(404) | 상세 화면             |

상세 화면은 존재하지 않는 id에 대한 404를 오류가 아니라 빈 결과로 처리했다.

```tsx
} catch (error) {
  if (ignore) return;
  if (!(error instanceof HTTPError && error.response.status === 404)) {
    setErrorMessage("영화 정보를 불러오지 못했어요.");
  }
}
```

- 404일 때는 `movie`가 `null`로 남아 "영화를 찾을 수 없어요." 화면이 나온다.
- 네트워크 오류나 5xx만 오류 문구로 보여 준다.

**URL 직접 접근과 새로고침**

- 확인한 경로: `/`, `/search?query=...`, `/movies/550`, `/movies/999999999`
- Vite 개발 서버는 모르는 경로에도 `index.html`을 돌려주고(SPA fallback), TanStack Router가 URL을 해석해 화면을 그린다.
- 검색어와 영화 id를 state가 아니라 URL에서 읽기 때문에 새로고침해도 같은 화면이 나온다.

**상태별 화면 확인 방법**

- 로딩: DevTools Network 속도를 `Slow 4G`로 바꾼다.
- 오류: `Offline`으로 바꾼다.
- 빈 결과: 없는 검색어를 넣거나 없는 영화 id로 들어간다.
