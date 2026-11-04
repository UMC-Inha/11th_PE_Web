- 필수 미션
    
    ### 1. 목록·검색·상세 요청을 useQuery로 변경
    
    기존 `useEffect`와 요청 데이터를 관리하던 `useState`를 제거하고, `useQuery`가 데이터·로딩·오류 상태를 관리하도록 했다. 요청 종류와 조건을 query key에 포함해 캐시를 구분했다.
    
    ```tsx
    // 목록: 페이지별로 구분
    const moviesQuery = useQuery({
      queryKey: ["movies", "list", { page }],
      queryFn: () => getMovies({ page }),
    });
    
    // 검색: 검색어별로 구분
    const moviesQuery = useQuery({
      queryKey: ["movies", "search", { query: normalizedQuery }],
      queryFn: () => searchMovies({ query: normalizedQuery }),
      enabled: normalizedQuery.length > 0,
    });
    
    // 상세: 영화 ID별로 구분
    const movieQuery = useQuery({
      queryKey: ["movies", "detail", movieId],
      queryFn: () => getMovieDetail(movieId),
      enabled: Number.isInteger(movieId) && movieId > 0,
      staleTime: 30 * 1000,
    });
    ```
    
    빈 검색어와 유효하지 않은 영화 ID는 요청하지 않도록 했다.
    
    ---
    
    ### 2. 요청 상태를 기존 UI에 연결
    
    `data`에서 영화 목록을 가져오고, `isPending`과 `isError`를 사용해 로딩·오류·빈 결과·성공 화면을 구분했다.
    
    ```tsx
    const movies = moviesQuery.data?.results ?? [];
    
    {moviesQuery.isPending ? (
      <p role="status">영화 목록을 불러오는 중이에요.</p>
    ) : moviesQuery.isError ? (
      <p role="alert">영화 목록을 불러오지 못했어요.</p>
    ) : movies.length === 0 ? (
      <p>조건에 맞는 영화가 없어요.</p>
    ) : (
      <MovieGrid movies={movies} />
    )}
    ```
    
    ---
    
    ### 3. 캐시 유지 시간을 설정했다
    
    `main.tsx`에서 공통 `staleTime`을 1분으로 설정했다. 상세 조회는 개별 옵션으로 30초를 적용했다.
    
    ```tsx
    const ONE_MINUTE = 60 * 1000;
    
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: ONE_MINUTE,
        },
      },
    });
    ```
    
    성공적으로 조회한 데이터가 fresh 상태이면 같은 화면을 다시 열 때 캐시를 재사용하도록 했다.
    
    ---
    
    ### 4. Query 개발자 도구를 연결하고 검증했다
    
    앱을 `QueryClientProvider`로 감싸고 Query 개발자 도구를 연결해 query key와 캐시 상태를 확인할 수 있도록 했다.
    
    ```tsx
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
    ```
    
    가짜 응답을 이용한 코드 테스트에서 `1 → 2 → 1`페이지의 캐시 재사용과 시간 경과 후 재조회를 확인했다.
    
    fresh
    <img width="1895" height="907" alt="Image" src="https://github.com/user-attachments/assets/526bed80-5d31-4b8b-b9f2-66d8f3925b01" />

    stale
    <img width="1896" height="901" alt="Image" src="https://github.com/user-attachments/assets/fe0c563d-d6b6-46c8-9a28-02a8e4733644" />

    <img width="1897" height="626" alt="Image" src="https://github.com/user-attachments/assets/9016d2b6-3794-4f5a-bddb-b4a7bfe8dd43" />
    <img width="1917" height="906" alt="Image" src="https://github.com/user-attachments/assets/c0c5e287-db74-41fc-8706-eb917c170142" />