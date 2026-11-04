# chapter06

## 1. 구현 방법

### TanStack Query 설정 및 공통 캐시 관리

기존에는 영화 목록, 검색, 상세 화면에서 `useEffect`와 `useState`를 사용하여 TMDB API 요청과 응답 데이터를 직접 관리했다.

이번 미션에서는 TanStack Query를 적용하여 API 요청 상태와 서버 데이터를 관리하도록 변경했다.

`src/main.tsx`에서 `QueryClient`를 생성하고, `QueryClientProvider`로 앱을 감싸 모든 화면에서 TanStack Query를 사용할 수 있도록 구성했다. 또한 전체 Query의 기본 `staleTime`을 1분으로 설정하여 일정 시간 동안 캐시 데이터를 최신 상태로 유지하도록 했다.

```tsx
const ONE_MINUTE = 60 * 1000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: ONE_MINUTE,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);
```

### 영화 목록 화면 TanStack Query 적용

기존 `MovieListPage`에서는 `useEffect`로 영화 목록을 요청하고 `useState`로 로딩, 오류, 응답 데이터를 관리했지만, 이를 `useQuery`로 변경했다.

영화 목록 요청에는 `["movies", "list", { page: apiPage }]`를 `queryKey`로 설정하여 API 페이지별로 캐시가 구분되도록 구현했다.

```tsx
const [currentPage, setCurrentPage] = useState(1);

// 화면 페이지 2개당 TMDB API 페이지 1개 사용
const apiPage = Math.ceil(currentPage / 2);

const moviesQuery = useQuery({
  queryKey: ["movies", "list", { page: apiPage }],
  queryFn: () => getMovies({ page: apiPage }),
});

const movies = moviesQuery.data?.results ?? [];

// 받아온 영화 20개 중 현재 화면에 표시할 10개 선택
const startIndex = ((currentPage - 1) % 2) * 10;
const visibleMovies = movies.slice(startIndex, startIndex + 10);
```

기존 페이지네이션 방식은 유지하면서, 같은 API 페이지의 데이터를 다시 사용할 때 불필요한 요청이 발생하지 않도록 구성했다.

또한 `isPending`, `isError`와 응답 데이터의 길이를 이용하여 로딩, 오류, 빈 결과 및 정상 조회 상태에 따라 화면을 구분했다.

```tsx
{moviesQuery.isPending ? (
  <p>영화 목록을 불러오는 중...</p>
) : moviesQuery.isError ? (
  <p role="alert">영화 목록을 불러오지 못했어요.</p>
) : movies.length === 0 ? (
  <p>표시할 영화가 없어요.</p>
) : (
  <MovieGrid movies={visibleMovies} />
)}
```

### 영화 검색 화면 TanStack Query 적용

기존 검색 화면에서는 `useEffect`로 검색 API를 호출하고 검색 결과와 로딩 상태를 직접 관리했지만, 이를 `useQuery`로 변경했다.

검색어를 `queryKey`에 포함하여 서로 다른 검색어의 결과가 별도로 캐시되도록 구성했다. 또한 검색어가 비어 있을 때 불필요한 API 요청이 발생하지 않도록 `enabled` 옵션을 적용했다.

```tsx
const normalizedQuery = query?.trim() ?? "";

const searchQuery = useQuery({
  queryKey: ["movies", "search", { query: normalizedQuery }],
  queryFn: () => searchMovies({ query: normalizedQuery }),
  enabled: normalizedQuery.length > 0,
});

const searchResults = searchQuery.data?.results ?? [];
const totalResults = searchQuery.data?.total_results ?? 0;
```

검색 화면에서도 TanStack Query의 요청 상태를 이용하여 로딩, 오류, 검색 결과 없음 및 정상 조회 화면을 구분하도록 변경했다.

기존 검색창, 영화 카드, 북마크 버튼과 상세 보기 링크는 그대로 유지했다.

### 영화 상세 화면 TanStack Query 적용

영화 상세 화면에서는 기존 `useEffect`를 이용한 상세 정보 요청을 `useQuery`로 변경했다.

URL에서 가져온 영화 ID를 `queryKey`에 포함하여 영화마다 상세 데이터가 구분되도록 구성하고, 유효한 영화 ID일 때만 API 요청이 실행되도록 `enabled` 옵션을 설정했다.

또한 상세 조회에는 `staleTime`을 30초로 개별 설정하여 전역 설정과 다르게 적용했다.

```tsx
const { movieId: movieIdParam } = useParams({
  from: "/movies/$movieId",
});

const movieId = Number(movieIdParam);
const isValidMovieId = Number.isInteger(movieId) && movieId > 0;

const movieDetailQuery = useQuery({
  queryKey: ["movies", "detail", movieId],
  queryFn: () => getMovieDetail(movieId),
  enabled: isValidMovieId,
  staleTime: 30 * 1000,
});
```

기존 상세 화면의 포스터, 배경 이미지, 영화 정보, 북마크 기능과 평점 입력 UI는 그대로 유지하면서 API 요청과 데이터 관리 부분만 변경했다.

## 2. 실행 결과

### 영화 목록 조회 및 캐시 재사용 확인

영화 목록의 1페이지에서 3페이지로 이동한 뒤, 1분 이내에 다시 1페이지로 돌아오는 방식으로 캐시 재사용을 확인했다.

Network 패널에서 3페이지에 해당하는 TMDB API의 `page=2` 요청은 발생했지만, 다시 1페이지로 돌아왔을 때 `page=1` 요청은 추가로 발생하지 않는 것을 확인했다.

또한 TanStack Query Devtools에서 현재 1페이지 Query는 `Fresh`, 이전에 조회한 2페이지 Query는 `Inactive` 상태로 표시되어 페이지별 캐시가 유지되는 것을 확인했다.

!image.png

### **영화 검색 기능 동작 확인**

기존 검색 화면의 디자인과 기능을 유지하면서 영화 검색 API 요청을 TanStack Query로 변경했다.

영화 제목을 검색했을 때 검색 결과가 정상적으로 표시되는 것을 확인했으며, 검색 결과가 없는 경우에도 기존 안내 문구가 정상적으로 표시되는 것을 확인했다.

### 영화 상세 조회 및 staleTime 확인

영화 상세 페이지에서 영화 정보가 정상적으로 표시되는 것을 확인했다.

상세 조회의 `staleTime`을 30초로 설정한 뒤 TanStack Query Devtools에서 상세 데이터가 처음에는 `fresh` 상태로 표시되고, 30초가 지난 후 `stale` 상태로 변경되는 것을 확인했다.

!image.png

!image.png

### Query Key 구분 및 캐시 상태 확인

TanStack Query Devtools에서 영화 목록, 검색, 상세 조회의 Query가 각각 구분되어 저장되는 것을 확인했다.

실제 Devtools에서 다음과 같은 Query Key가 표시되었다.

```tsx
["movies", "list", { page: 1 }]
["movies", "search", { query: "다크 나이트" }]
["movies", "detail", 155]
```

목록의 페이지 번호, 검색어, 영화 ID에 따라 Query Key가 구분되는 것을 확인했다.

또한 검색어가 비어 있는 경우에는 `disabled` 상태로 표시되어 API 요청이 발생하지 않는 것도 확인했다.

!image.png

### 빌드 확인

`pnpm build`를 실행한 결과 TypeScript 검사와 Vite 프로덕션 빌드가 오류 없이 정상적으로 완료되었다.
