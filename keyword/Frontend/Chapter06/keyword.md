- query key와 요청 상태
    - 목록, 검색과 상세에 같은 query key를 쓰면 어떤 문제가 생길까요? 페이지 번호, 검색어와 영화 ID를 포함하는 이유도 함께 생각해 보세요.
        
        TanStack Query는 **query key를 기준으로 서버 데이터를 캐시에 저장하고 구분**한다. 따라서 서로 다른 데이터를 조회하는 요청에 같은 query key를 사용하면 TanStack Query가 이들을 같은 데이터로 인식할 수 있다.
        
        ```
        // 영화 목록
        useQuery({
          queryKey: ["movies"],
          queryFn: fetchMovies,
        });
        
        // 영화 검색 결과
        useQuery({
          queryKey: ["movies"],
          queryFn: () => searchMovies("겨울왕국"),
        });
        
        // 특정 영화 상세 정보
        useQuery({
          queryKey: ["movies"],
          queryFn: () => fetchMovieDetail(10),
        });
        ```
        
        위 세 요청은 결과의 형태와 내용이 다르지만 모두 `["movies"]`라는 같은 캐시 공간을 사용한다. 이 경우 다음 문제가 발생할 수 있다.
        
        - 목록 화면에 검색 결과나 상세 정보가 표시될 수 있다.
        - 이전에 저장된 캐시가 잘못 재사용될 수 있다.
        - 서로 다른 요청이 같은 캐시 데이터를 덮어쓸 수 있다.
        - 데이터 무효화나 갱신 범위를 정확하게 구분하기 어려워진다.
        - 목록과 상세의 데이터 구조가 다르면 런타임 오류가 발생할 수 있다.
        
        따라서 데이터의 종류와 요청 조건을 query key에 포함해야 한다. TanStack Query 공식 문서도 query 함수가 의존하는 변수를 query key에 포함하도록 안내한다. TanStack Query React Docs
        
        ```
        // 인기 영화 1페이지
        queryKey: ["movies", "list", { page: 1 }]
        
        // "겨울왕국" 검색 결과 1페이지
        queryKey: ["movies", "search", { keyword: "겨울왕국", page: 1 }]
        
        // ID가 10인 영화의 상세 정보
        queryKey: ["movies", "detail", 10]
        ```
        
        ### 페이지 번호를 포함하는 이유
        
        ```
        queryKey: ["movies", "list", { page }]
        ```
        
        1페이지와 2페이지는 서로 다른 데이터를 반환한다. 페이지 번호를 넣지 않으면 모든 페이지가 같은 캐시를 사용하여 페이지를 변경해도 이전 페이지 데이터가 나타날 수 있다.
        
        ```
        ["movies", "list", { page: 1 }]
        ["movies", "list", { page: 2 }]
        ```
        
        각 페이지가 별도의 캐시로 관리되므로 이전에 조회했던 페이지로 돌아갔을 때 해당 캐시를 재사용할 수도 있다.
        
        ### 검색어를 포함하는 이유
        
        ```
        queryKey: ["movies", "search", { keyword, page }]
        ```
        
        `"겨울왕국"`과 `"어벤져스"`의 검색 결과는 서로 다르다. 검색어를 query key에 포함해야 검색어가 바뀌었을 때 새로운 요청이 실행되고 검색 결과도 별도의 캐시로 관리된다.
        
        ```
        ["movies", "search", { keyword: "겨울왕국", page: 1 }]
        ["movies", "search", { keyword: "어벤져스", page: 1 }]
        ```
        
        검색 결과도 여러 페이지가 존재할 수 있으므로 검색어와 페이지 번호를 모두 포함해야 한다.
        
        ### 영화 ID를 포함하는 이유
        
        ```
        queryKey: ["movies", "detail", movieId]
        ```
        
        영화 ID는 어떤 영화의 상세 정보를 조회할지 결정한다. ID를 생략하면 서로 다른 영화의 상세 페이지가 같은 캐시를 사용하게 된다.
        
        ```
        ["movies", "detail", 10]
        ["movies", "detail", 20]
        ```
        
        정리하면, **query key에는 요청 결과를 바꾸는 모든 값을 포함해야 한다.** 이렇게 해야 데이터가 독립적으로 캐시되고 조건이 바뀌었을 때 적절한 요청이 다시 실행된다.
        
        ---
        
        ## 
        
    - `enabled: false`인데도 `isPending`이 참일 수 있는 이유는 무엇이며, 이때 `isLoading`은 어떤 값일까요?
        
        ```
        const movieQuery = useQuery({
          queryKey: ["movies", "detail", movieId],
          queryFn: () => fetchMovieDetail(movieId),
          enabled: false,
        });
        ```
        
        `enabled: false`는 **요청을 자동으로 실행하지 않겠다**는 뜻이다. 요청이 성공하거나 데이터가 존재한다는 뜻은 아니다.
        
        캐시에 데이터가 없는 상태에서 쿼리를 비활성화하면 상태는 다음과 같다.
        
        ```
        status === "pending"
        fetchStatus === "idle"
        
        isPending === true
        isFetching === false
        isLoading === false
        ```
        
        `isPending`은 현재 사용할 수 있는 데이터가 없고 쿼리가 아직 성공 상태가 아니라는 의미이다. 반면 `isFetching`은 실제 네트워크 요청이 진행 중인지를 나타낸다.
        
        따라서 `enabled: false`이면 요청은 실행되지 않지만, 데이터도 없으므로 `isPending`은 `true`가 될 수 있다. 공식 문서에서도 캐시가 없는 비활성 쿼리는 `pending` 상태이면서 `fetchStatus`는 `idle` 상태로 시작한다고 설명한다. TanStack Query React Docs
        
        ### 이때 `isLoading`은 어떤 값일까요?
        
        TanStack Query v5에서 `isLoading`은 다음 조건으로 계산된다.
        
        ```
        isLoading = isPending && isFetching
        ```
        
        현재 상태는 다음과 같다.
        
        ```
        isPending  = true
        isFetching = false
        ```
        
        따라서 다음과 같이 계산된다.
        
        ```
        isLoading = true && false
                  = false
        ```
        
        `isLoading`은 **데이터가 없으면서 첫 번째 요청이 실제로 진행 중일 때만** `true`가 된다. TanStack Query React Docs
        
        | 상태 | 의미 | `enabled: false`, 캐시 없음 |
        | --- | --- | --- |
        | `isPending` | 아직 사용할 데이터가 없음 | `true` |
        | `isFetching` | 실제 요청이 진행 중임 | `false` |
        | `isLoading` | 데이터 없이 첫 요청을 진행 중임 | `false` |
        
        그러므로 비활성화된 쿼리의 화면을 구성할 때 `isPending`만 보고 로딩 화면을 표시하면, 실제 요청이 시작되지 않았는데도 로딩 표시가 계속 나타날 수 있다.
        
        ```
        if (query.isLoading) {
          return <p>영화 정보를 불러오는 중입니다.</p>;
        }
        
        if (!movieId) {
          return <p>영화를 선택해 주세요.</p>;
        }
        ```
        
        핵심은 **`isPending`은 데이터 상태를 나타내고, `isFetching`은 요청 상태를 나타내며, `isLoading`은 두 조건이 모두 참인 최초 요청 상태**라는 점이다.
        
- 캐시 수명과 재조회
    - `staleTime`과 `gcTime`은 각각 언제부터 계산하며, 시간이 지난 뒤 캐시에 어떤 차이가 생길까요?
        
        ### `staleTime`
        
        `staleTime`은 서버 요청이 성공해 데이터가 캐시에 저장되거나 갱신된 시점부터 계산한다. 정확히는 데이터가 마지막으로 갱신된 시간인 `dataUpdatedAt`을 기준으로 한다.
        
        ```
        useQuery({
          queryKey: ["movies", "detail", movieId],
          queryFn: () => fetchMovieDetail(movieId),
          staleTime: 60 * 1000,
        });
        ```
        
        위 설정에서는 데이터를 받아온 뒤 1분 동안 `fresh` 상태로 취급한다.
        
        ```
        요청 성공
        → 1분 동안 fresh
        → 1분이 지나면 stale
        ```
        
        `staleTime`이 지나도 데이터가 캐시에서 삭제되지는 않는다. 데이터는 캐시에 남아 있지만 최신 데이터라고 보장하지 않는 `stale` 상태가 된다.
        
        `stale` 상태에서는 다음과 같은 상황에 백그라운드 재조회가 발생할 수 있다.
        
        - 해당 query를 사용하는 컴포넌트가 다시 마운트될 때
        - 사용자가 브라우저 창으로 돌아올 때
        - 네트워크 연결이 복구될 때
        - `invalidateQueries()`로 query를 무효화했을 때
        
        이때 TanStack Query는 기존 캐시 데이터를 먼저 화면에 보여주고, 백그라운드에서 새로운 데이터를 가져올 수 있다.
        
        ### `gcTime`
        
        `gcTime`은 해당 query를 사용하는 컴포넌트가 모두 사라져 query가 비활성 상태가 된 시점부터 계산한다.
        
        ```
        useQuery({
          queryKey: ["movies", "detail", movieId],
          queryFn: () => fetchMovieDetail(movieId),
          gcTime: 5 * 60 * 1000,
        });
        ```
        
        영화 상세 화면을 벗어나 해당 query를 사용하는 컴포넌트가 없어지면 `gcTime` 계산이 시작된다.
        
        ```
        상세 화면 진입
        → query 활성 상태
        
        다른 화면으로 이동
        → query 비활성 상태
        → gcTime 계산 시작
        
        5분 동안 다시 사용하지 않음
        → 캐시에서 query 삭제
        ```
        
        `gcTime`이 지나기 전에 같은 query를 다시 사용하면 캐시가 삭제되지 않는다. 이후 query가 다시 비활성화되면 `gcTime` 계산도 다시 시작한다.
        
        ### 시간 경과 후의 차이
        
        | 구분 | `staleTime` | `gcTime` |
        | --- | --- | --- |
        | 계산 시작 | 데이터가 저장·갱신된 시점 | query가 비활성화된 시점 |
        | 관리 대상 | 데이터의 신선도 | 캐시의 보관 기간 |
        | 시간이 지나면 | `fresh`에서 `stale`로 변경 | 캐시에서 데이터 삭제 |
        | 캐시 데이터 | 그대로 남아 있음 | 완전히 사라짐 |
        | 다시 조회할 때 | 캐시를 보여주면서 재조회 가능 | 캐시가 없어 처음부터 요청 |
        | 기본값 | `0` | 클라이언트에서 5분 |
        
        예를 들어 다음과 같이 설정했다고 가정한다.
        
        ```
        useQuery({
          queryKey: ["movies", "list", { page }],
          queryFn: () => fetchMovies(page),
          staleTime: 60 * 1000,
          gcTime: 5 * 60 * 1000,
        });
        ```
        
        - 요청 성공 후 1분 동안은 `fresh` 상태이다.
        - 1분이 지나면 `stale` 상태가 되지만 캐시는 남아 있다.
        - query가 비활성화된 후 5분이 지나면 캐시에서 삭제된다.
        
        > `staleTime`은 데이터가 언제부터 오래된 것으로 취급되는지를 결정하고, `gcTime`은 사용하지 않는 캐시를 언제 삭제할지를 결정한다.
        > 
    - 전역 기본값과 개별 `useQuery`의 `staleTime`은 어떤 기준으로 정하면 좋을까요?
        
        ### 전역 `staleTime`
        
        전역 기본값은 애플리케이션의 대부분 데이터에 적용해도 문제가 없는 값을 설정한다.
        
        ```
        const queryClient = new QueryClient({
          defaultOptions: {
            queries: {
              staleTime: 60 * 1000,
            },
          },
        });
        ```
        
        위 설정은 별도의 `staleTime`을 지정하지 않은 모든 query에 1분을 적용한다.
        
        영화 목록이나 영화 상세 정보처럼 대부분의 데이터가 실시간으로 변경되지 않는 서비스라면 전역 `staleTime`을 어느 정도 설정하여 다음과 같은 불필요한 요청을 줄일 수 있다.
        
        - 페이지를 이동했다가 다시 돌아왔을 때 발생하는 요청
        - 컴포넌트가 다시 마운트될 때 발생하는 요청
        - 브라우저 창으로 다시 돌아올 때 발생하는 요청
        
        전역 기본값은 특정 데이터 하나가 아니라 **대부분의 query에 공통으로 적용할 수 있는 보수적인 값**으로 정하는 것이 좋다.
        
        ### 개별 `useQuery`의 `staleTime`
        
        특정 데이터의 변경 주기나 최신성 요구가 전역 설정과 다르면 개별 query에서 `staleTime`을 별도로 설정한다. 개별 설정은 전역 설정을 덮어쓴다.
        
        #### 자주 변경되는 데이터
        
        현재 상영 정보, 재고, 알림처럼 최신성이 중요한 데이터는 짧게 설정한다.
        
        ```
        useQuery({
          queryKey: ["movies", "now-playing"],
          queryFn: fetchNowPlayingMovies,
          staleTime: 10 * 1000,
        });
        ```
        
        #### 비교적 자주 변경되지 않는 데이터
        
        영화 상세 설명처럼 자주 변경되지 않는 데이터는 길게 설정할 수 있다.
        
        ```
        useQuery({
          queryKey: ["movies", "detail", movieId],
          queryFn: () => fetchMovieDetail(movieId),
          staleTime: 10 * 60 * 1000,
        });
        ```
        
        #### 거의 변경되지 않는 데이터
        
        장르, 국가 코드와 같은 기준 정보는 수시간 또는 `Infinity`로 설정할 수 있다.
        
        ```
        useQuery({
          queryKey: ["genres"],
          queryFn: fetchGenres,
          staleTime: Infinity,
        });
        ```
        
        `Infinity`로 설정하면 시간이 지나도 자동으로 `stale` 상태가 되지 않는다. 다만 `invalidateQueries()`를 사용하면 직접 무효화하여 다시 조회할 수 있다.
        
        ### 설정 기준
        
        | 데이터 종류 | `staleTime` 예시 | 설정 이유 |
        | --- | --- | --- |
        | 재고, 알림, 실시간 상태 | 0초~수초 | 최신성이 중요함 |
        | 검색 결과, 인기 영화 목록 | 수십 초~수분 | 짧은 시간 캐시해도 문제가 적음 |
        | 영화 상세 정보 | 수분~수십 분 | 변경 빈도가 낮음 |
        | 장르, 국가 코드 | 수시간~`Infinity` | 거의 변경되지 않음 |
        
        `staleTime`은 다음 기준으로 정한다.
        
        - 서버 데이터가 얼마나 자주 바뀌는가
        - 오래된 데이터를 잠시 보여줘도 되는가
        - API 호출 횟수와 비용을 줄여야 하는가
        - 데이터 변경 후 `invalidateQueries()`를 호출할 수 있는가
        - 사용자가 같은 화면을 얼마나 자주 다시 방문하는가
        
        > 전역 `staleTime`은 대부분의 query에 적용할 공통 기준으로 설정하고, 개별 `staleTime`은 데이터의 변경 주기와 최신성 요구에 맞춰 조정한다.
        >