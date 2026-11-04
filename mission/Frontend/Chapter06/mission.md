- 필수 미션

  **1. TanStack Query 공통 설정**

    - 목록·검색·상세의 API 요청을 `useQuery`로 변경. 서버 응답과 로딩·오류 상태는 Query에서 관리하고, 페이지 번호·입력 중인 검색어는 기존 클라이언트 상태로 관리
    - `main.tsx`에서 QueryClient를 생성하고 Provider로 앱에 전달. 전역 `staleTime`은 1분으로 설정하고 Query 개발자 도구 연결

    ```tsx
    const ONE_MINUTE = 60 * 1000;
    const queryClient = new QueryClient({
      defaultOptions: { queries: { staleTime: ONE_MINUTE } },
    });
    ```

    ```tsx
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
    ```

  **2. 화면별 조회 조건과 query key 구분**

    - **목록**: key와 API 요청에 `page`를 함께 전달해 페이지별 캐시 구분. 페이지 버튼 → `setPage()` → key 변경 → 해당 페이지 조회로 연결.
    - 응답의 `results`와 `total_pages`를 목록·페이지네이션에 사용. 페이지 번호는 한 번에 5개씩 표시.

    ```tsx
    const moviesQuery = useQuery({
      queryKey: ["movies", "list", { page }],
      queryFn: () => getMovies({ page }),
    });
    
    const movies = moviesQuery.data?.results ?? [];
    const totalPages = moviesQuery.data?.total_pages ?? 0;
    ```

    - **검색**: URL 검색어의 앞뒤 공백을 제거한 `normalizedQuery`를 key와 요청에 사용. 검색어가 있을 때만 자동 요청하도록 `enabled` 설정
    - 입력값과 URL을 맞추는 Effect, 검색 제출·지우기 동작은 유지하고 서버 조회 부분을 Query로 교체

    ```tsx
    const searchQuery = useQuery({
      queryKey: ["movies", "search", { query: normalizedQuery }],
      queryFn: () => searchMovies({ query: normalizedQuery }),
      enabled: normalizedQuery.length > 0,
    });
    
    const searchResults = searchQuery.data?.results ?? [];
    ```

    - **상세**: URL의 영화 ID를 숫자로 변환하고 양의 정수인지 확인. 영화별 key를 사용하며 유효한 ID일 때만 자동 요청
    - 상세 조회에는 `staleTime: 30 * 1000`을 따로 지정해 전역 1분 대신 30초 적용

    ```tsx
    const movieDetailQuery = useQuery({
      queryKey: ["movies", "detail", parsedMovieId],
      queryFn: () => getMovieDetail(parsedMovieId),
      staleTime: 30 * 1000,
      enabled: isValidMovieId,
    });
    ```

  **3. 요청 상태에 따른 화면 처리**

    - 목록은 `isPending` → `isError` → 빈 목록 → 영화 카드 순서로 분기
    - 검색은 검색어가 있을 때 결과 영역 표시. `isLoading`으로 실제 첫 요청 중 로딩을 표시하고, `isError`와 성공 후 빈 결과를 구분
    - 상세는 잘못된 ID 안내를 먼저 처리한 뒤 로딩·오류·성공 화면 표시. 오류 메시지는 기존 `getMovieDetailErrorMessage()` 사용
    - 성공 응답을 기존 포스터·제목·개봉일·장르 UI에 연결하고 영화 ID를 사용하는 북마크 동작 유지

  **4. 캐시 재사용 확인**

    - Network 패널을 열고 새로고침 없이 목록 1 → 2 → 1페이지로 이동
    - 1분 안에 돌아온 1페이지는 기존 캐시를 재사용하고 같은 목록 요청이 추가되지 않는 것 확인
    - Query 개발자 도구에서 페이지별 key와 저장된 데이터를 확인하고 확인 화면 첨부
    - `pnpm build` 성공

  **참고 자료**

    - TanStack Query — Query Keys
    - TanStack Query — Disabling/Pausing Queries
    - TanStack Query — Important Defaults

  !image.png