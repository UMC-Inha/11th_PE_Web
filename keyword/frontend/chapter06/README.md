# chapter06

- query key와 요청 상태
    - 목록, 검색과 상세에 같은 query key를 쓰면 어떤 문제가 생길까요? 페이지 번호, 검색어와 영화 ID를 포함하는 이유도 함께 생각해 보세요.
        
        ### Query Key란?
        
        `queryKey`는 TanStack Query에서 어떤 데이터를 요청하고 저장했는지 구분하기 위해 사용하는 값이다.
        
        TanStack Query는 API에서 받아온 데이터를 캐시에 저장하는데, 이때 `queryKey`를 기준으로 데이터를 구분한다. 쉽게 말하면 각각의 데이터에 붙이는 이름표라고 생각할 수 있다.
        
        이번 UMCine 미션에서는 영화 목록, 검색, 상세 조회에 각각 다른 Query Key를 사용했다.
        
        ```tsx
        // 영화 목록
        ["movies", "list", { page: 1 }]
        
        // 영화 검색
        ["movies", "search", { query: "다크 나이트" }]
        
        // 영화 상세 조회
        ["movies", "detail", 155]
        ```
        
        ### 목록, 검색, 상세에 같은 Query Key를 사용하면?
        
        서로 다른 API 요청에 같은 `queryKey`를 사용하면 TanStack Query가 데이터를 제대로 구분하지 못할 수 있다.
        
        예를 들어 영화 목록과 영화 상세 조회에 모두 `["movies"]`라는 Query Key를 사용한다고 가정해 보자.
        
        ```tsx
        // 영화 목록
        useQuery({
          queryKey: ["movies"],
          queryFn: () => getMovies({ page: 1 }),
        });
        
        // 영화 상세
        useQuery({
          queryKey: ["movies"],
          queryFn: () => getMovieDetail(155),
        });
        ```
        
        두 요청은 서로 다른 데이터를 가져오지만 Query Key가 동일하다.
        
        이 경우 TanStack Query는 두 요청을 같은 Query로 취급하므로, 영화 상세 화면에서 목록 데이터가 사용되는 등 잘못된 데이터가 표시될 수 있다.
        
        따라서 서로 다른 데이터를 가져오는 요청에는 서로 다른 Query Key를 사용해야 한다.
        
        ### 페이지 번호, 검색어, 영화 ID를 포함하는 이유
        
        같은 종류의 API 요청이라도 페이지 번호나 검색어, 영화 ID에 따라 받아오는 데이터가 달라지기 때문이다.
        
        예를 들어 영화 목록에서는 다음과 같이 페이지 번호를 포함한다.
        
        ```tsx
        ["movies", "list", { page: 1 }]
        ["movies", "list", { page: 2 }]
        ```
        
        이렇게 하면 1페이지와 2페이지의 데이터를 별도로 저장할 수 있다.
        
        검색과 상세 조회도 마찬가지다.
        
        ```tsx
        // 검색어에 따라 구분
        ["movies", "search", { query: "다크 나이트" }]
        ["movies", "search", { query: "아바타" }]
        
        // 영화 ID에 따라 구분
        ["movies", "detail", 155]
        ["movies", "detail", 19995]
        ```
        
        검색어가 달라지면 검색 결과가 달라지고, 영화 ID가 달라지면 상세 정보도 달라지므로 각각 다른 Query Key가 필요하다.
        
        실제로 이번 미션에서도 영화 목록의 1페이지에서 3페이지로 이동한 뒤 다시 1페이지로 돌아왔을 때, 이전에 받아온 데이터를 재사용하는 것을 확인했다.
        
        즉, **페이지 번호, 검색어, 영화 ID를 Query Key에 포함하면 서로 다른 데이터를 구분할 수 있고, 같은 데이터를 다시 조회할 때 이전에 받아온 결과를 재사용할 수 있다.**
        
    - `enabled: false`인데도 `isPending`이 참일 수 있는 이유는 무엇이며, 이때 `isLoading`은 어떤 값일까요?
        
        ### enabled란?
        
        `enabled`는 TanStack Query에서 API 요청을 자동으로 실행할지 결정하는 옵션이다.
        
        `enabled: true`이면 API 요청을 실행할 수 있고, `enabled: false`이면 자동으로 요청하지 않는다.
        
        이번 UMCine 미션에서는 검색어가 비어 있을 때 불필요한 API 요청을 보내지 않도록 `enabled` 옵션을 사용했다.
        
        ```tsx
        const normalizedQuery = query?.trim() ?? "";
        
        const searchQuery = useQuery({
          queryKey: ["movies", "search", { query: normalizedQuery }],
          queryFn: () => searchMovies({ query: normalizedQuery }),
          enabled: normalizedQuery.length > 0,
        });
        ```
        
        검색어가 비어 있으면 `normalizedQuery.length`가 `0`이 되므로 `enabled`가 `false`로 설정된다.
        
        ### isPending과 isLoading이란?
        
        `isPending`은 아직 사용할 수 있는 데이터가 없는 상태를 나타낸다.
        
        반면 `isLoading`은 데이터가 없는 상태에서 실제로 API 요청이 진행 중인지를 나타낸다.
        
        두 상태는 비슷해 보이지만 의미가 다르다.
        
        | 상태 | 의미 |
        | --- | --- |
        | `isPending` | 아직 사용할 수 있는 데이터가 없음 |
        | `isFetching` | 현재 API 요청이 진행 중임 |
        | `isLoading` | 데이터가 없는 상태에서 API 요청이 진행 중임 |
        
        `isLoading`은 다음과 같이 계산된다.
        
        ```tsx
        isLoading = isPending && isFetching;
        ```
        
        즉, 데이터가 없는 것뿐만 아니라 실제 API 요청도 진행 중이어야 `isLoading`이 `true`가 된다.
        
        ### enabled: false인데도 isPending이 true일 수 있는 이유
        
        `enabled: false`는 API 요청을 자동으로 실행하지 않도록 설정하는 것이지, 데이터가 존재한다는 뜻은 아니다.
        
        따라서 API 요청을 실행하지 않았고 이전에 저장된 데이터도 없다면 `isPending`은 `true`가 된다.
        
        하지만 실제 API 요청은 진행되지 않으므로 `isFetching`은 `false`이고, 이에 따라 `isLoading`도 `false`가 된다.
        
        | 상태 | 값 | 이유 |
        | --- | --- | --- |
        | `enabled` | `false` | API 요청을 자동으로 실행하지 않음 |
        | `isPending` | `true` | 아직 사용할 수 있는 데이터가 없음 |
        | `isFetching` | `false` | API 요청이 진행되지 않음 |
        | `isLoading` | `false` | 실제로 데이터를 불러오는 중이 아님 |
        
        실제로 이번 미션에서 검색 화면에 처음 들어갔을 때 검색어가 비어 있었지만, Devtools에는 `["movies", "search", { query: "" }]`가 표시되었다.
        
        처음에는 API 요청이 발생한 것으로 생각했지만, 해당 Query가 `disabled` 상태로 표시되는 것을 확인했다.
        
        즉, **Query가 생성되는 것과 실제 API 요청이 발생하는 것은 다르며, `isPending`이 `true`라고 해서 반드시 데이터를 불러오는 중인 것은 아니다.**
        
- 캐시 수명과 재조회
    - `staleTime`과 `gcTime`은 각각 언제부터 계산하며, 시간이 지난 뒤 캐시에 어떤 차이가 생길까요?
        
        ### staleTime이란?
        
        `staleTime`은 TanStack Query에서 받아온 데이터를 얼마나 오랫동안 최신 데이터로 취급할지 정하는 시간이다.
        
        API 요청이 성공하여 데이터를 받아온 시점을 기준으로 계산하며, 설정한 시간 동안 데이터는 `Fresh` 상태로 유지된다.
        
        설정한 시간이 지나면 데이터는 `Stale` 상태로 변경된다.
        
        | 상태 | 의미 |
        | --- | --- |
        | `Fresh` | 데이터를 최신 상태로 취급하는 기간 |
        | `Stale` | 최신 상태로 취급하는 시간이 지난 상태 |
        
        여기서 중요한 점은 `Stale` 상태가 되었다고 해서 데이터가 바로 삭제되거나 API 요청이 즉시 발생하는 것은 아니라는 것이다.
        
        기존 데이터는 그대로 사용할 수 있으며, 컴포넌트가 다시 마운트되거나 브라우저 창에 다시 포커스하는 등의 상황에서 재조회가 발생할 수 있다.
        
        이번 UMCine 미션에서는 전체 Query의 기본 `staleTime`을 1분으로 설정했다.
        
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
        
        또한 영화 상세 조회에는 `staleTime`을 30초로 별도 설정했다.
        
        ```tsx
        const movieDetailQuery = useQuery({
          queryKey: ["movies", "detail", movieId],
          queryFn: () => getMovieDetail(movieId),
          enabled: isValidMovieId,
          staleTime: 30 * 1000,
        });
        ```
        
        실제로 TanStack Query Devtools에서 영화 상세 데이터가 처음에는 `Fresh` 상태로 표시되고, 30초가 지나자 `Stale` 상태로 변경되는 것을 확인했다.
        
        ### gcTime이란?
        
        `gcTime`은 사용하지 않는 캐시 데이터를 메모리에 얼마나 오래 보관할지 정하는 시간이다.
        
        TanStack Query에서는 해당 Query를 사용하는 컴포넌트가 없어지면 `Inactive` 상태가 될 수 있다.
        
        이처럼 Query가 더 이상 사용되지 않는 시점부터 `gcTime`이 계산되며, 설정한 시간이 지나도 다시 사용되지 않으면 캐시 데이터가 삭제된다.
        
        예를 들어 `gcTime`이 5분이라면 다음과 같이 동작한다.
        
        ```
        영화 목록 1페이지 조회
                ↓
        다른 페이지로 이동
                ↓
        1페이지 Query가 Inactive 상태가 됨
                ↓
        gcTime 5분 계산 시작
                ↓
        5분 동안 다시 사용되지 않음
                ↓
        캐시에서 삭제
        ```
        
        TanStack Query의 기본 `gcTime`은 브라우저 환경에서 5분이다.
        
        이번 미션에서는 `gcTime`을 별도로 설정하지 않았으므로 기본값을 사용했다.
        
        ### staleTime과 gcTime의 차이
        
        두 옵션 모두 캐시와 관련된 시간을 설정하지만 역할이 다르다.
        
        | 구분 | `staleTime` | `gcTime` |
        | --- | --- | --- |
        | 역할 | 데이터를 최신 상태로 취급하는 시간 | 사용하지 않는 캐시를 보관하는 시간 |
        | 계산 시작 | 데이터를 성공적으로 받아온 시점 | Query가 사용되지 않는 상태가 된 시점 |
        | 시간이 지나면 | `Stale` 상태로 변경 | 사용하지 않는 캐시가 삭제됨 |
        | 기본값 | 0초 | 5분 (브라우저 환경) |
        | 데이터 삭제 여부 | 삭제되지 않음 | 삭제될 수 있음 |
        
        예를 들어 `staleTime`이 1분이고 `gcTime`이 5분인 경우를 생각해 볼 수 있다.
        
        시간에 따른 캐시 상태 예시
        
        1. 0초 - API 요청 성공
            
            데이터를 받아와 캐시에 저장하고 `Fresh` 상태가 된다.
            
        2. 1분 후 - Stale
            
            데이터를 최신 상태로 취급하는 시간이 지났지만 캐시에는 그대로 남아 있다.
            
        3. 2분 후 - Inactive
            
            해당 데이터를 사용하는 컴포넌트가 사라졌다고 가정하면, 이때부터 `gcTime`이 계산된다.
            
        4. 7분 후 - 캐시 삭제
            
            이후 5분 동안 다시 사용되지 않았다면 캐시가 삭제된다.
            
        
        재조회나 캐시 재사용이 없는 상황을 가정한 예시이다.
        
        이번 미션에서도 영화 목록의 1페이지에서 3페이지로 이동한 뒤 다시 1페이지로 돌아왔을 때, 이전에 받아온 데이터를 재사용하는 것을 확인했다.
        
        이를 통해 `staleTime`은 데이터가 최신 상태로 취급되는 시간을 관리하고, `gcTime`은 사용하지 않는 데이터를 얼마나 오래 보관할지 관리한다는 점을 알 수 있었다.
        
        즉, **`staleTime`은 데이터의 신선도를 결정하고, `gcTime`은 캐시의 삭제 시점을 결정한다.**
        
    - 전역 기본값과 개별 `useQuery`의 `staleTime`은 어떤 기준으로 정하면 좋을까요?
        
        ### 전역 기본값과 개별 useQuery의 staleTime이란?
        
        TanStack Query에서는 `staleTime`을 전역으로 설정하거나 각각의 `useQuery`에서 따로 설정할 수 있다.
        
        전역 기본값은 별도로 `staleTime`을 지정하지 않은 모든 Query에 공통으로 적용되는 값이다.
        
        반면 개별 `useQuery`의 `staleTime`은 특정 데이터에만 적용되는 값으로, 전역 기본값보다 우선하여 적용된다.
        
        이번 UMCine 미션에서는 전체 Query의 기본 `staleTime`을 1분으로 설정했다.
        
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
        
        영화 목록과 검색 화면에서는 별도의 `staleTime`을 설정하지 않았으므로 전역 기본값인 1분이 적용된다.
        
        반면 영화 상세 화면에서는 다음과 같이 30초로 별도 설정했다.
        
        ```tsx
        const movieDetailQuery = useQuery({
          queryKey: ["movies", "detail", movieId],
          queryFn: () => getMovieDetail(movieId),
          enabled: isValidMovieId,
          staleTime: 30 * 1000,
        });
        ```
        
        따라서 영화 상세 데이터는 30초 동안 `Fresh` 상태로 유지되고, 이후 `Stale` 상태가 된다.
        
        ### staleTime은 어떤 기준으로 정하면 좋을까?
        
        `staleTime`은 데이터가 얼마나 자주 변경되는지, 그리고 최신 데이터가 얼마나 중요한지를 기준으로 정하는 것이 좋다.
        
        자주 변경되지 않는 데이터는 `staleTime`을 길게 설정하여 불필요한 API 요청을 줄일 수 있다.
        
        반대로 자주 변경되거나 최신 정보가 중요한 데이터는 `staleTime`을 짧게 설정하여 새로운 데이터를 확인할 기회를 늘릴 수 있다.
        
        예를 들어 다음과 같이 구분할 수 있다.
        
        | 데이터 종류 | staleTime 설정 | 이유 |
        | --- | --- | --- |
        | 영화 장르 목록 | 길게 설정 | 자주 변경되지 않음 |
        | 인기 영화 목록 | 적당하게 설정 | 인기 순위가 변경될 수 있음 |
        | 영화 평점 및 인기 지표 | 비교적 짧게 설정 | 시간이 지나면서 값이 달라질 수 있음 |
        | 실시간 주식 가격 | 매우 짧게 설정 | 최신 정보가 중요함 |
        
        단, `staleTime`을 짧게 설정한다고 해서 일정 시간마다 자동으로 API 요청을 보내는 것은 아니다. 데이터가 `Stale` 상태가 된 후 재조회 조건이 발생했을 때 새로운 요청이 실행될 수 있다.
        
        ### 전역 기본값과 개별 설정은 어떻게 구분할까?
        
        전역 기본값은 프로젝트에서 사용하는 대부분의 데이터에 공통으로 적용하기 적절한 시간을 설정하는 것이 좋다.
        
        그리고 특정 데이터가 다른 데이터보다 자주 변경되거나 최신 정보가 더 중요하다면 개별 `useQuery`에서 `staleTime`을 따로 설정하면 된다.
        
        이번 미션에서는 전체 Query에 1분을 적용하고, 영화 상세 조회에는 30초를 적용했다.
        
        영화 상세 조회의 30초 설정은 전역 기본값과 개별 설정의 차이를 확인하기 위한 실습이었다. 실제 서비스에서는 영화 상세 정보가 자주 변경되지 않는다면 오히려 더 긴 시간을 설정할 수도 있다.
        
        즉, **전역 기본값은 대부분의 데이터에 공통으로 사용할 시간을 정하고, 개별 `staleTime`은 데이터의 특성에 따라 다르게 설정하는 것이 좋다.**
