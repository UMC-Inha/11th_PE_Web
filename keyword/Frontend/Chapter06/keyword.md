- query key와 요청 상태
    - 목록, 검색과 상세에 같은 query key를 쓰면 어떤 문제가 생길까요? 페이지 번호, 검색어와 영화 ID를 포함하는 이유도 함께 생각해 보세요.
    
    queryKey는 캐시에 저장된 데이터를 구분하는 기준이다. 같은 QueryClient 안에서 같은 queryKey를 사용한다는 것은 **같은 데이터를 공유하겠다는 의미**다. 요청 함수가 다르더라도 queryKey가 같으면 별도의 데이터로 구분되지 않는다. 
    
    UMCine의 목록 응답에는 results 배열이 있고, 상세 응답에는 title·genres·runtime 같은 영화 한 편의 정보가 있다. 이 둘에 같은 키를 사용하면 목록 화면이 상세 데이터를 받거나, 상세 화면이 목록 데이터를 읽는 문제가 생길 수 있다. 단순히 다른 영화가 표시되는 것뿐 아니라, 필요한 필드가 없어 화면 오류로 이어질 수도 있다.
    
    **요청 결과를 바꾸는 조건은 queryKey에도 포함해야 한다.** 다음 코드는 page가 달라져도 캐시 이름이 그대로라는 문제가 있다.
    
    ```tsx
    const moviesQuery = useQuery({
      queryKey: ["movies", "list"],
      queryFn: () => getMovies({ page }),
    });
    ```
    
    queryFn 안에서 page를 사용한다고 해서 TanStack Query가 그 변수의 변화를 자동으로 추적하는 것은 아니다. 다음처럼 page를 키에 포함해야 페이지별 데이터를 구분하고, 페이지 변경 시 해당 캐시를 확인할 수 있다. 
    
    ```tsx
    const moviesQuery = useQuery({
      queryKey: ["movies", "list", { page }],
      queryFn: () => getMovies({ page }),
    });
    ```
    
    이 기준은 페이지 번호뿐 아니라 검색어, 정렬 방식, 언어에도 적용된다. 예를 들어 한국어와 영어로 영화 정보를 조회하도록 기능을 확장한다면, language도 키에 포함해야 두 언어의 응답이 섞이지 않는다.
    
    queryKey를 비교할 때는 다음 차이도 알아두면 좋다.
    
    | 비교 대상 | 같은 키인가? |
    | --- | --- |
    | 객체의 속성 순서만 다름: `{ page: 1, language: "ko-KR" }`와 `{ language: "ko-KR", page: 1 }` | 같음 |
    | 배열 요소 순서가 다름: `["movies", "detail", 550]`과 `["movies", 550, "detail"]` | 다름 |
    | 값의 자료형이 다름: `["movies", "detail", 550]`과 `["movies", "detail", "550"]` | 다름 |
    
    객체는 내용이 같으면 속성 순서가 달라도 같은 키로 처리하지만, 배열 요소의 순서와 값의 자료형은 구분한다. 따라서 영화 ID를 어떤 화면에서는 숫자로, 다른 화면에서는 문자열로 사용하면 같은 영화를 중복으로 캐시할 수 있다. 
    
    UMCine에서 URL의 movieId를 Number로 변환하고, 검색어를 trim으로 정리하는 것은 이런 차이를 줄이는 데도 도움이 된다. **실제 요청에 사용하는 값과 queryKey에 사용하는 값을 일치시키는 것**이 핵심이다.
    
    - `enabled: false`인데도 `isPending`이 참일 수 있는 이유는 무엇이며, 이때 `isLoading`은 어떤 값일까요?
    
    TanStack Query는 **데이터의 상태와 요청의 진행 상태를 따로 관리한다.**
    
    status는 pending·success·error로 조회 결과의 상태를 나타내고, fetchStatus는 fetching·paused·idle로 요청이 진행 중인지 나타낸다. 따라서 아직 데이터가 없지만 요청도 보내지 않은 상태를 표현할 수 있다. 
    
    처음 사용하는 queryKey에 캐시가 없고 enabled가 false라면 다음과 같다.
    
    - status는 pending이다.
    - fetchStatus는 idle이다.
    - isPending은 true다.
    - isFetching은 false다.
    - isLoading은 false다.
    
    isLoading은 **isPending과 isFetching이 모두 true일 때만 true**이기 때문이다. 즉, 첫 데이터를 기다리는 상태이면서 실제 요청도 진행 중이어야 한다. 
    
    | 상황 | status | fetchStatus | isPending | isLoading |
    | --- | --- | --- | --- | --- |
    | 캐시가 없고 enabled가 false | pending | idle | true | false |
    | 캐시 없이 첫 요청을 진행 중 | pending | fetching | true | true |
    | 캐시 없이 요청하려는데 오프라인으로 일시 중지됨 | pending | paused | true | false |
    | 조회에 성공했고 요청 중이 아님 | success | idle | false | false |
    | 기존 데이터를 보여주면서 다시 조회 중 | success | fetching | false | false |
    | 성공한 캐시가 있는 상태에서 enabled가 false로 초기화됨 | success | idle | false | false |
    
    따라서 **isLoading이 false라고 해서 데이터가 준비됐다고 판단하면 안 된다.** 요청 자체를 시작하지 않았거나, 네트워크 때문에 잠시 멈춘 경우에도 false일 수 있다.
    
    UMCine 검색 화면에서 검색어가 비어 있으면 요청하지 않도록 설정했다. 이때 isPending만 보고 로딩 문구를 표시하면 사용자가 아무것도 검색하지 않았는데 “검색 중”이라고 안내할 수 있다. 그래서 검색어 유무를 먼저 확인한다.
    
    ```tsx
    if (!normalizedQuery) {
      return <p>어떤 영화를 찾고 있나요?</p>;
    }
    
    if (searchQuery.isLoading) {
      return <p>검색 결과를 불러오는 중이에요.</p>;
    }
    ```
    
    반대로 **기존 데이터가 있는 상태에서 재조회할 때는 isLoading이 false여도 isFetching은 true**가 될 수 있다. 이때 전체 화면을 로딩 화면으로 바꾸기보다 기존 영화 목록을 유지하고 작은 갱신 안내만 표시하면 사용자가 보던 내용을 계속 확인할 수 있다. 
    
    ```tsx
    {moviesQuery.isFetching && !moviesQuery.isPending && (
      <p>최신 영화 정보를 확인하는 중이에요.</p>
    )}
    ```
    
    또한 enabled가 false라는 것은 **자동 실행을 막는 설정**이지, 캐시를 삭제하는 명령은 아니다. 기존 캐시는 남을 수 있고, 일반적인 queryFn을 사용한다면 useQuery가 반환한 refetch로 수동 요청을 실행할 수도 있다.  
    
- 캐시 수명과 재조회
    - `staleTime`과 `gcTime`은 각각 언제부터 계산하며, 시간이 지난 뒤 캐시에 어떤 차이가 생길까요?
    
    staleTime은 일반적인 API 조회에서 **마지막으로 데이터를 성공적으로 받아 캐시를 갱신한 시점**을 기준으로 계산한다. 이 시간이 지나면 데이터를 stale로 취급하지만, 캐시 자체를 삭제하지는 않는다.
    
    gcTime은 **해당 쿼리를 사용하는 마지막 컴포넌트가 사라져 더 이상 구독하지 않게 된 시점**부터 캐시를 얼마나 더 보관할지 정한다. 화면을 떠났더라도 다른 컴포넌트가 같은 쿼리를 계속 사용하고 있다면, 마지막 사용이 끝난 상황이 아니다. 
    
    예를 들어 다음과 같이 설정했다고 가정한다.
    
    ```tsx
    const moviesQuery = useQuery({
      queryKey: ["movies", "list", { page }],
      queryFn: () => getMovies({ page }),
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    });
    ```
    
    0초에 응답을 받았고, 20초에 목록 화면을 떠난 뒤 다시 방문하지 않았다면 흐름은 다음과 같다. 다른 컴포넌트에서도 이 쿼리를 사용하지 않고, 별도의 갱신도 없다고 가정한다.
    
    | 시점 | 상태 |
    | --- | --- |
    | 0초 | 응답을 받아 캐시에 저장한다. fresh 상태가 된다. |
    | 20초 | 마지막 사용이 끝난다. 이때부터 gcTime의 5분을 계산한다. |
    | 60초 | staleTime이 지나 stale이 된다. 캐시는 남아 있다. |
    | 320초 | 사용이 끝난 뒤 5분이 지나 캐시가 삭제된다. |
    
    **gcTime이 staleTime이 끝난 다음부터 시작하는 것은 아니다.** 두 시간은 시작 조건이 다르며 독립적으로 계산된다.
    
    위 상황에서 다시 방문한다면 시점에 따라 동작도 달라진다.
    
    - **40초에 돌아오면:** 캐시가 남아 있고 fresh이므로 기본 설정에서는 추가 요청 없이 사용한다.
    - **80초에 돌아오면:** 캐시가 남아 있지만 stale이므로 기존 데이터를 즉시 보여주면서 백그라운드에서 재조회한다.
    - **330초에 돌아오면:** 캐시가 이미 삭제됐으므로 다시 데이터를 받아야 한다.
    
    캐시를 읽어서 화면에 보여주기만 한 것으로 staleTime이 다시 시작되지는 않는다. 재조회가 성공해 데이터가 갱신되면 그 시점을 기준으로 다시 계산한다. 
    
    또한 **staleTime은 자동 요청을 실행하는 타이머가 아니다.** 30초가 지났다고 정확히 그 순간 API를 호출하지는 않는다. 기본 설정에서는 stale 상태에서 화면을 다시 열거나, 다른 탭에 갔다가 돌아오거나, 네트워크가 다시 연결되는 등의 계기가 있을 때 재조회할 수 있다. 
    
    두 시간을 따로 설정할 때 생길 수 있는 상황도 있다. staleTime을 10분, gcTime을 1분으로 설정했다면, 화면을 떠난 뒤 1분 동안 사용하지 않은 캐시는 **아직 fresh로 취급할 수 있는 데이터여도 삭제될 수 있다.** 최신으로 취급하는 기간과 실제로 보관하는 기간이 다르기 때문이다.
    
    - 전역 기본값과 개별 `useQuery`의 `staleTime`은 어떤 기준으로 정하면 좋을까요?
    
    전역 기본값은 여러 화면에 공통으로 적용할 기준을 정하고, 개별 설정은 데이터 성격이 다른 경우에 사용한다. 판단할 때는 **데이터가 바뀌는 빈도와 사용자가 오래된 정보를 봤을 때의 영향**을 함께 고려해야 한다.
    
    자주 바뀌는 데이터라도 잠깐 이전 값을 보여주는 것이 큰 문제가 아닐 수 있다. 반대로 자주 바뀌지 않더라도 정확한 최신 값이 중요한 데이터라면 오래 재사용하기 어렵다. 요청 비용, 응답 속도, 같은 화면을 다시 방문하는 빈도도 함께 고려할 수 있다.
    
    다음 시간은 고정된 정답이 아니라 설정 방향을 설명하기 위한 예시다.
    
    | 데이터 | 설정 방향 | 판단 이유 |
    | --- | --- | --- |
    | 영화 장르 목록 | 비교적 길게 설정 | 짧은 시간 안에 자주 바뀌지 않는다. |
    | 인기 영화 목록 | 적당한 시간 동안 재사용 | 반복 방문 시 요청을 줄이면서 목록 갱신도 필요하다. |
    | 영화 제목·줄거리 | 비교적 길게 설정 가능 | 보통 짧은 시간 안에 계속 바뀌는 정보는 아니다. |
    | 댓글 목록 | 짧게 설정하거나 작성 후 갱신 | 사용자가 새 댓글을 바로 확인하기를 기대한다. |
    | 주문 진행 상태 | 짧은 설정과 별도의 갱신 방식 검토 | 화면을 계속 보고 있는 동안에도 상태가 바뀔 수 있다. |
    
    **상세 화면이라고 반드시 목록보다 staleTime이 짧아야 하는 것은 아니다.** UMCine의 공통 1분·상세 30초는 개별 설정이 전역 기본값을 덮어쓰는 동작을 확인하기 위한 실습 값이다. 실제 서비스에서는 상세 데이터가 거의 바뀌지 않는다면 목록보다 더 길게 설정할 수도 있다.
    
    예를 들어 전역 설정이 다음과 같다면,
    
    ```tsx
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          gcTime: 5 * 60 * 1000,
        },
      },
    });
    ```
    
    상세 쿼리에서는 staleTime만 다르게 지정할 수 있다.
    
    ```tsx
    const movieDetailQuery = useQuery({
      queryKey: ["movies", "detail", movieId],
      queryFn: () => getMovieDetail(movieId),
      enabled: isValidMovieId,
      staleTime: 30 * 1000,
    });
    ```
    
    이 경우 상세 쿼리는 staleTime 30초를 사용하고, 별도로 지정하지 않은 gcTime은 공통 설정인 5분을 사용한다. 전역 기본값과 개별 설정을 함께 사용하면 반복 설정을 줄이면서 필요한 차이를 줄 수 있다.
    
    다만 시간을 조절하는 것만으로 모든 갱신 문제를 해결할 수는 없다. 예를 들어 사용자가 서버에 댓글을 작성했다면 기존 댓글 목록이 바뀌었다는 사실을 이미 알고 있다. 이 경우에는 staleTime이 끝나기를 기다리는 것보다 **관련 캐시를 무효화해 다시 확인하도록 만드는 방식**이 적절하다.
    
    TanStack Query에서는 invalidateQueries를 사용할 수 있다. 아래는 영화 목록을 사용자가 직접 갱신하는 상황의 예시다.
    
    ```tsx
    const queryClient = useQueryClient();
    
    async function handleRefreshMovieLists() {
      await queryClient.invalidateQueries({
        queryKey: ["movies", "list"],
      });
    }
    ```
    
    이 코드는 키가 `["movies", "list"]`로 시작하는 목록 캐시들을 대상으로 한다. 숫자로 설정한 staleTime이 아직 남아 있어도 stale로 표시하며, **현재 화면에서 사용 중이고 요청이 활성화된 쿼리는 기본적으로 백그라운드 재조회**한다. 사용하지 않는 목록 캐시까지 모두 즉시 요청하는 것은 아니다. 
    
    한편 화면을 계속 켜 놓은 상태에서 주기적으로 최신 데이터를 받아야 한다면 refetchInterval 같은 별도의 갱신 설정을 검토해야 한다. **staleTime을 5초로 지정하는 것만으로 5초마다 자동 요청이 실행되지는 않는다.**
    
