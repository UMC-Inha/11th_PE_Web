# mission

## 기존 영화 화면에 TanStack Query 적용하기

영화 **목록 · 검색 · 상세** 화면에서 `useEffect` + `useState`로 처리하던 요청을 TanStack Query의 `useQuery`로 바꿨습니다.
화면(UI)은 그대로 두고, **데이터를 가져오고 상태를 관리하는 방식**만 바꿨습니다.

| 화면      | 파일                                            | query key                                          |
| --------- | ----------------------------------------------- | -------------------------------------------------- |
| 목록      | `umcine/src/pages/movies/movie-list-page.tsx`   | `["movies", "list", { page: 1 }]`                  |
| 검색      | `umcine/src/pages/movies/search-page.tsx`       | `["movies", "search", { query: normalizedQuery }]` |
| 상세      | `umcine/src/pages/movies/movie-detail-page.tsx` | `["movies", "detail", movieId]`                    |
| 공통 설정 | `umcine/src/main.tsx`                           | –                                                  |

---

## 0. 공통 설정 – `QueryClientProvider`

`useQuery`는 `QueryClientProvider` 안에서만 동작하므로, 앱 전체를 감쌌습니다.

```tsx
// main.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient(); // 컴포넌트 밖에서 한 번만 생성

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools /> {/* 개발 모드에서만 보이는 캐시 확인 도구 */}
    </QueryClientProvider>
  </StrictMode>,
);
```

- `QueryClient`는 캐시 저장소입니다. 컴포넌트 안에서 만들면 렌더링할 때마다 캐시가 초기화되므로 밖에서 만듭니다.

---

## 1. 바뀐 방식 한눈에 보기

### 이전 (useEffect)

```tsx
const [movies, setMovies] = useState([]); // 데이터
const [isLoading, setIsLoading] = useState(true); // 로딩
const [errorMessage, setErrorMessage] = useState(null); // 오류

useEffect(() => {
  let ignore = false; // 경쟁 상태(race condition) 방지
  setIsLoading(true);
  api()
    .then((res) => {
      if (!ignore) setMovies(res.results);
    })
    .catch(() => {
      if (!ignore) setErrorMessage("...");
    })
    .finally(() => {
      if (!ignore) setIsLoading(false);
    });
  return () => {
    ignore = true;
  }; // 정리(cleanup)
}, [의존값]);
```

### 지금 (useQuery)

```tsx
const query = useQuery({
  queryKey: ["movies", 종류, 의존값], // 캐시 이름표 = 이전의 의존성 배열 역할
  queryFn: () => api(의존값), // 데이터를 가져오는 함수
  enabled: 요청해도_되는지, // false면 요청하지 않음 (선택)
});

query.data; // 이전의 movies state
query.isPending; // 이전의 isLoading state
query.isError; // 이전의 errorMessage state
query.error; // 실제 오류 객체
```

| 이전에 직접 하던 일                  | 지금 누가 하나                                   |
| ------------------------------------ | ------------------------------------------------ |
| 데이터 / 로딩 / 오류 `useState` 3개  | `useQuery`의 `data`, `isPending`, `isError`      |
| `setIsLoading(true/false)` 직접 호출 | React Query가 자동으로 관리                      |
| `try/catch` 또는 `.catch()`          | `queryFn`이 throw하면 자동으로 `isError`         |
| `ignore` 플래그 + cleanup            | 현재 `queryKey`의 결과만 화면에 반영 → 필요 없음 |
| 의존성 배열 `[query]`, `[movieId]`   | `queryKey`가 바뀌면 자동으로 다시 요청           |
| 요청을 막는 `if (!값) return`        | `enabled: false`                                 |

---

## 2. 목록 화면 – `movie-list-page.tsx`

### 이전

```tsx
const [movies, setMovies] = useState<TmdbMovieListItem[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

### 지금

```tsx
const [page, setPage] = useState(1); // 화면 안에서만 쓰는 페이지 번호 → useState 유지

const moviesQuery = useQuery({
  queryKey: ["movies", "list", { page: 1 }],
  queryFn: () => getMovies({ page: 1 }),
});

const movies = moviesQuery.data?.results ?? [];
```

```tsx
{
  moviesQuery.isPending ? (
    <p>영화 목록을 불러오는 중이에요.</p>
  ) : moviesQuery.isError ? (
    <p>영화 목록을 불러오지 못했어요.</p>
  ) : movies.length === 0 ? (
    <p>표시할 영화가 없어요.</p>
  ) : (
    <>
      <MovieGrid movies={pagedMovies} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </>
  );
}
```

**포인트**

- 항상 요청하는 화면이라 `enabled` 없이 `isPending`으로 로딩을 판단합니다.
- TMDB 1페이지(20개)를 받아서 화면에서 10개씩 나누는 **기존 방식은 그대로** 유지
  (`Pagination`이 전체 페이지 수만큼 버튼을 그리기 때문에, TMDB의 `total_pages`(최대 500)를 그대로 쓰면 버튼이 500개가 됩니다.)
- `data?.results ?? []` – 데이터가 아직 없을 때(`undefined`)도 빈 배열로 안전하게 다룹니다.

---

## 3. 검색 화면 – `search-page.tsx`

### 이전

```tsx
const [movies, setMovies] = useState<TmdbMovieListItem[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [errorMessage, setErrorMessage] = useState<string | null>(null);

useEffect(() => {
  let ignore = false;
  const normalizedQuery = query.trim();
  setMovies([]);
  setErrorMessage(null);

  if (!normalizedQuery) {
    // 검색어가 없으면 요청하지 않음
    setIsLoading(false);
    return;
  }

  setIsLoading(true);
  searchMovies({ query: normalizedQuery })
    .then((response) => {
      if (!ignore) setMovies(response.results);
    })
    .catch(() => {
      if (!ignore) setErrorMessage("검색 결과를 불러오지 못했어요.");
    })
    .finally(() => {
      if (!ignore) setIsLoading(false);
    });

  return () => {
    ignore = true;
  };
}, [query]);
```

### 지금

```tsx
const { query } = useSearch({ from: "/search" });
const normalizedQuery = query?.trim() ?? "";

const searchQuery = useQuery({
  queryKey: ["movies", "search", { query: normalizedQuery }],
  queryFn: () => searchMovies({ query: normalizedQuery }),
  enabled: normalizedQuery.length > 0, // 검색어가 있을 때만 요청
});

const searchResults = searchQuery.data?.results ?? [];
```

```tsx
{!normalizedQuery ? (
  /* 큰 검색 폼: "어떤 영화를 찾고 있나요?" */
) : (
  <>
    {/* 상단 작은 검색 폼 + "‘검색어’ 검색 결과 / 영화 N편" */}
    {searchQuery.isLoading ? (
      <p>검색 중이에요.</p>
    ) : searchQuery.isError ? (
      <p>{searchQuery.error.message}</p>
    ) : searchQuery.isSuccess && searchResults.length === 0 ? (
      <p>검색 결과가 없어요.</p>
    ) : (
      /* searchResults로 검색 결과 목록 표시 */
    )}
  </>
)}
```

**포인트**

- `enabled` – 예전의 `if (!normalizedQuery) return`을 대신합니다. 검색어가 비어 있으면 TMDB에 요청하지 않습니다.
- `isLoading`을 쓴 이유 – `enabled: false`일 때 `isPending`은 계속 `true`로 남지만, `isLoading`(= `isPending && isFetching`)은 **실제로 요청 중일 때만** `true`입니다.
- 검색어를 `trim()`한 값을 key에 넣어서 `"스파이더맨"`과 `"스파이더맨 "`이 같은 캐시를 쓰도록 했습니다.
- 검색창 입력값(`searchText`)과 URL 검색어 동기화(`prevQuery`)는 **서버 데이터가 아닌 UI 상태**라서 `useState`로 그대로 유지했습니다.

---

## 4. 상세 화면 – `movie-detail-page.tsx`

### 이전

```tsx
const { movieId } = useParams({ from: "/movies/$movieId" });
const [movie, setMovie] = useState<Movie | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [errorMessage, setErrorMessage] = useState<string | null>(null);

useEffect(() => {
  let ignore = false;
  async function loadMovie() {
    setIsLoading(true);
    setErrorMessage(null);
    setMovie(null);
    try {
      const detail = await getMovieDetail(Number(movieId));
      if (ignore) return;
      setMovie({
        /* TMDB 응답 → Movie 변환 */
      });
    } catch (error) {
      if (ignore) return;
      if (!(error instanceof HTTPError && error.response.status === 404)) {
        setErrorMessage("영화 정보를 불러오지 못했어요.");
      }
    } finally {
      if (!ignore) setIsLoading(false);
    }
  }
  loadMovie();
  return () => {
    ignore = true;
  };
}, [movieId]);
```

### 지금

```tsx
const { movieId: movieIdParam } = useParams({ from: "/movies/$movieId" });
const movieId = Number(movieIdParam);
const isValidMovieId = Number.isInteger(movieId) && movieId > 0;

const movieDetailQuery = useQuery({
  queryKey: ["movies", "detail", movieId],
  queryFn: () => getMovieDetail(movieId),
  enabled: isValidMovieId, // /movies/abc 같은 잘못된 번호는 요청하지 않음
});
```

```tsx
{
  !isValidMovieId ? (
    <main>올바르지 않은 영화 번호예요.</main>
  ) : movieDetailQuery.isPending ? (
    <main>영화 정보를 불러오는 중이에요.</main>
  ) : movieDetailQuery.isError ? (
    <main>{getMovieDetailErrorMessage(movieDetailQuery.error)}</main>
  ) : (
    <MovieDetail movie={toMovie(movieDetailQuery.data)} />
  );
}
```

```tsx
// 404면 "찾을 수 없음", 나머지는 일반 오류 메시지
function getMovieDetailErrorMessage(error: Error) {
  if (error instanceof HTTPError && error.response.status === 404) {
    return "영화를 찾을 수 없어요.";
  }
  return "영화 정보를 불러오지 못했어요.";
}

// TMDB 응답(snake_case) → 화면용 Movie(camelCase)
function toMovie(detail: TmdbMovieDetail): Movie {
  return {
    id: detail.id,
    title: detail.title,
    originalTitle: detail.original_title,
    // ...
    genres: detail.genres.map((genre) => genre.name),
    runtime: detail.runtime ? `${detail.runtime}분` : "",
  };
}
```

**포인트**

- URL의 `movieId`는 문자열이므로 숫자로 바꾸고, 올바른 번호인지 먼저 검사합니다.
- `!isValidMovieId` 분기가 먼저 걸러 주므로, 그 뒤에서는 `isPending`을 써도 안전합니다.
- **타입 좁히기** – `isPending`, `isError`를 먼저 확인했기 때문에 마지막 분기에서 `movieDetailQuery.data`는 `undefined`가 아닌 타입으로 확정되어 `toMovie()`에 바로 넘길 수 있습니다.
- 예전 `useEffect` 안에 있던 응답 변환 코드는 `toMovie()` 함수로 분리했습니다. 캐시에는 TMDB 원본을 저장하고, 화면에 넘길 때 변환합니다.

---

## 5. query key 설계

```
["movies", "list",   { page: 1 }]
["movies", "search", { query: "스파이더맨" }]
["movies", "detail", 550]
   ↑ 범위    ↑ 종류     ↑ 요청을 구분하는 값
```

1. **`queryFn`에서 쓰는 값은 모두 key에 넣습니다.** key가 바뀌면 React Query가 새 요청을 보냅니다. (예전 의존성 배열과 같은 역할)
2. **두 번째 칸**으로 목록 / 검색 / 상세 요청을 구분하고, **세 번째 칸**으로 같은 종류 안의 서로 다른 요청을 구분합니다.
3. **넓은 범위 → 좁은 범위** 순서라서 `invalidateQueries({ queryKey: ["movies"] })`처럼 앞부분만으로 관련 캐시를 한 번에 갱신할 수 있습니다.

---

## 6. 바꾸면서 달라진 동작

| 항목              | 설명                                                                                                        |
| ----------------- | ----------------------------------------------------------------------------------------------------------- |
| 캐시              | 같은 key로 다시 들어오면(같은 검색어, 같은 영화) 저장된 데이터를 바로 보여 줍니다.                          |
| 자동 재시도       | 요청이 실패하면 기본 3번 다시 시도한 뒤 오류를 보여 줍니다. 그래서 오류 문구가 몇 초 늦게 보일 수 있습니다. |
| 창 포커스 시 갱신 | 브라우저 창으로 다시 돌아오면 백그라운드에서 최신 데이터를 다시 받아 옵니다.                                |
| 경쟁 상태         | 검색어를 빠르게 바꿔도 현재 key의 결과만 보여 주므로 `ignore` 플래그가 필요 없습니다.                       |
| Devtools          | 개발 모드에서 화면 구석의 버튼으로 각 key의 캐시 상태를 확인할 수 있습니다.                                 |

---

## 7. 정리

- **서버에서 오는 데이터**(영화 목록, 검색 결과, 상세 정보) → `useQuery`
- **화면 안에서만 쓰는 상태**(페이지 번호, 검색창 입력값) → `useState` 유지
- 화면은 `isPending` / `isLoading` → `isError` → (빈 결과) → 성공 순서로 분기합니다.
- 기존 UI, 문구, 스타일은 그대로 유지했습니다.
