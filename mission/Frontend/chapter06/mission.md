#### 1. QueryClient 설정 (`main.tsx`)

```tsx
const ONE_MINUTE = 60 * 1000;
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: ONE_MINUTE } },
});
```

- 전역 `staleTime`을 1분으로 지정해 1분 안에는 같은 데이터를 다시 요청하지 않도록 했다.

#### 2. 목록 (`movie-list-page.tsx`)

```tsx
const moviesQuery = useQuery({
  queryKey: ["movies", "list", { page }],
  queryFn: () => getMovies({ page }),
});

const movies = moviesQuery.data?.results ?? [];
const totalPages = moviesQuery.data?.total_pages ?? 0;

{moviesQuery.isPending ? (
  <p>영화 목록을 불러오는 중이에요.</p>
) : moviesQuery.isError ? (
  <p>영화 목록을 불러오지 못했어요.</p>
) : movies.length === 0 ? (
  <p>조건에 맞는 영화가 없어요.</p>
) : (
  <MovieGrid movies={movies} /* ... */ />
)}
```

- `page`를 key에 포함해 페이지별로 캐시를 따로 저장한다.

#### 3. 검색 (`search-page.tsx`)

```tsx
const normalizedQuery = query?.trim() ?? "";
const hasQuery = normalizedQuery !== "";

const searchQuery = useQuery({
  queryKey: ["movies", "search", { query: normalizedQuery }],
  queryFn: () => searchMovies({ query: normalizedQuery }),
  enabled: hasQuery,
});

const movies = searchQuery.data?.results ?? [];
```

- 검색어를 key에 포함해 검색어마다 캐시를 구분한다.
- `enabled`로 검색어가 있을 때만 요청한다. 검색어가 없을 때는 `isPending`이 참이어도 요청하지 않으므로 로딩 표시는 `isLoading`으로 판단한다.



#### 4. 상세 (`movie-detail-page.tsx`)

```tsx
const movieId = Number(movieIdParam);
const isValidMovieId = Number.isInteger(movieId) && movieId > 0;

const movieDetailQuery = useQuery({
  queryKey: ["movies", "detail", movieId],
  queryFn: () => getMovieDetail(movieId),
  enabled: isValidMovieId,
  staleTime: 30 * 1000, // 미니 실습: 전역 1분 대신 30초
});

if (!isValidMovieId) { /* 올바르지 않은 영화 번호 */ }
if (movieDetailQuery.isPending) { /* 로딩 */ }
if (movieDetailQuery.isError) { /* 오류 */ }
const movie = movieDetailQuery.data;
```

- 영화 ID를 key에 포함해 영화마다 캐시를 구분한다.
- 잘못된 번호에서도 `isPending`이 참이므로, 번호 검증을 로딩보다 먼저 처리한다.

!image.png

#### 5. query key 정리

| 화면 | query key | key에 넣은 값 |
| --- | --- | --- |
| 목록 | `["movies", "list", { page }]` | 페이지 번호 |
| 검색 | `["movies", "search", { query }]` | 검색어 |
| 상세 | `["movies", "detail", movieId]` | 영화 ID |
