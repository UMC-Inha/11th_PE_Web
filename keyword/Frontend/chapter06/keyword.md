- query key와 요청 상태
    - 목록, 검색과 상세에 같은 query key를 쓰면 어떤 문제가 생길까요? 페이지 번호, 검색어와 영화 ID를 포함하는 이유도 함께 생각해 보세요.
        
        > query key는 **캐시에 저장할 데이터를 구분하는 식별자**이다.
        > 
        
        TanStack Query는 요청 URL이나 함수 이름만 보고 데이터를 구분하지 않는다. 같은 QueryClient 안에서는 **같은 query key가 같은 캐시 항목을 가리킨다.**
        
        ### 서로 다른 요청에 같은 key를 사용하면?
        
        다음은 잘못된 예시이다.
        
        ```tsx
        // 영화 목록
        useQuery({
          queryKey: ["movies"],
          queryFn: () => getMovies(1),
        });
        
        // 영화 검색
        useQuery({
          queryKey: ["movies"],
          queryFn: () => searchMovies("인셉션", 1),
        });
        
        // 영화 상세
        useQuery({
          queryKey: ["movies"],
          queryFn: () => getMovie(10),
        });
        ```
        
        요청의 의미가 다르지만 같은 캐시 항목을 공유한다.
        
        ```
        ["movies"]
           ├─ 목록 데이터를 저장하려고 함
           ├─ 검색 결과를 저장하려고 함
           └─ 상세 데이터를 저장하려고 함
        ```
        
        그 결과 다른 화면의 데이터가 표시되거나, 배열을 기대하는 위치에 상세 객체가 들어오는 등 문제가 발생할 수 있다.
        
        **queryFn이 다르다고 자동으로 별도 캐시가 만들어지는 것은 아니다.**
        
        ### 요청 종류와 조건을 함께 표현하기
        
        ```tsx
        // 목록
        useQuery({
          queryKey: ["movies", "list", { page }],
          queryFn: () => getMovies(page),
        });
        
        // 검색
        useQuery({
          queryKey: ["movies", "search", { keyword, page }],
          queryFn: () => searchMovies(keyword, page),
        });
        
        // 상세
        useQuery({
          queryKey: ["movies", "detail", movieId],
          queryFn: () => getMovie(movieId),
        });
        ```
        
        | key에 포함한 값 | 필요한 이유 |
        | --- | --- |
        | `"list"`, `"search"`, `"detail"` | 서로 다른 종류의 데이터 구분 |
        | `page` | 페이지별 결과 구분 |
        | `keyword` | 검색어별 결과 구분 |
        | `movieId` | 영화별 상세 정보 구분 |
        
        ```tsx
        ["movies", "list", { page: 1 }]
        ["movies", "list", { page: 2 }]
        → 별도의 캐시
        
        ["movies", "detail", 10]
        ["movies", "detail", 20]
        → 별도의 캐시
        ```
        
        ### 요청 조건이 바뀌는 경우
        
        `page`가 key에 포함되어 있다면 페이지 변경 시 다른 쿼리를 관찰하게 된다. 해당 key의 캐시와 설정에 따라 기존 데이터를 사용하거나 조회한다.
        
        반대로 key에서 `page`를 빠뜨리면 **요청 함수가 참조하는 값이 바뀌었다는 이유만으로 새 페이지를 별도 데이터로 관리하지 않는다.**
        
        따라서 검색어, 정렬 기준, 언어 등 **응답을 달라지게 만드는 변수**는 key에 포함해야 한다.
        
        같은 데이터를 의도적으로 공유하는 컴포넌트들은 같은 key를 사용하는 것이 맞다. 기준은 화면 이름이 아니라 **같은 요청 조건의 같은 데이터인지**이다.
        
    - `enabled: false`인데도 `isPending`이 참일 수 있는 이유는 무엇이며, 이때 `isLoading`은 어떤 값일까요?
        
        > `isPending`은 **아직 성공한 데이터가 없는 초기 대기 상태**, `isLoading`은 **그 상태에서 실제로 요청 중인지**를 구분하기 때문이다.
        > 
        
        TanStack Query는 데이터 상태와 요청의 실행 상태를 나누어 관리한다.
        
        ### status와 fetchStatus
        
        | 구분 | 값 | 의미 |
        | --- | --- | --- |
        | `status` | `pending` | 아직 성공 데이터도 확정된 오류도 없는 상태 |
        | `status` | `success` | 성공한 데이터가 있는 상태 |
        | `status` | `error` | 오류 상태 |
        | `fetchStatus` | `fetching` | 요청을 실행 중 |
        | `fetchStatus` | `paused` | 실행하려는 요청이 일시 중단됨 |
        | `fetchStatus` | `idle` | 현재 요청을 실행하지 않음 |
        
        데이터가 없다고 반드시 네트워크 요청 중인 것은 아니다.
        
        ### enabled가 false인 최초 상태
        
        캐시나 초기 데이터가 없는 다음 쿼리를 생각해 보자.
        
        ```tsx
        const query = useQuery({
          queryKey: ["movies", "search", keyword],
          queryFn: () => searchMovies(keyword, 1),
          enabled: false,
        });
        ```
        
        자동 요청을 시작하지 않았으므로 상태는 다음과 같다.
        
        ```tsx
        status      = "pending"
        fetchStatus = "idle"
        ```
        
        ```tsx
        isPending  = true
        isFetching = false
        isLoading  = false
        ```
        
        v5의 `isLoading`은 다음 조건으로 계산된다.
        
        ```tsx
        isLoading = isPending && isFetching;
        ```
        
        따라서 **아직 데이터가 없지만 요청도 하지 않는 상태에서는 `isLoading`이 false**이다.
        
        ### 상황별 비교
        
        다음은 일반적인 상태를 단순화한 표이다.
        
        | 상황 | isPending | isFetching | isLoading |
        | --- | --- | --- | --- |
        | 데이터 없음 + 비활성화 + 요청 없음 | true | false | false |
        | 데이터 없음 + 최초 요청 진행 | true | true | true |
        | 조회 성공 + 요청 없음 | false | false | false |
        | 기존 데이터 있음 + 백그라운드 재조회 | false | true | false |
        
        같은 key에 캐시 데이터가 이미 있다면 `enabled: false`여도 `success` 상태로 시작할 수 있다.
        
        또한 `enabled: false`는 자동 실행을 막는 설정이지, 캐시를 삭제하거나 언제나 요청이 없음을 보장하는 설정은 아니다. 반환된 `refetch()`로 직접 요청할 수도 있다.
        
        ### 검색 화면에서는 어떻게 사용할까?
        
        ```tsx
        const normalizedKeyword = keyword.trim();
        
        const query = useQuery({
          queryKey: [
            "movies",
            "search",
            { keyword: normalizedKeyword },
          ],
          queryFn: () => searchMovies(normalizedKeyword, 1),
          enabled: normalizedKeyword.length > 0,
        });
        ```
        
        화면에서는 조건에 맞춰 안내한다.
        
        ```tsx
        if (normalizedKeyword.length === 0) {
          return <p>검색어를 입력해 주세요.</p>;
        }
        
        if (query.isLoading) {
          return <p>검색 중입니다.</p>;
        }
        
        if (query.isError) {
          return <p>검색 결과를 불러오지 못했습니다.</p>;
        }
        ```
        
        `isPending`만 보고 스피너를 표시하면, 검색어를 입력하지 않아 요청하지 않는 상태에서도 로딩 화면이 나타날 수 있다.
        
- 캐시 수명과 재조회
    - `staleTime`과 `gcTime`은 각각 언제부터 계산하며, 시간이 지난 뒤 캐시에 어떤 차이가 생길까요?
        
        > `staleTime`은 **데이터를 최신으로 취급하는 기간**, `gcTime`은 **사용하지 않는 캐시를 메모리에 유지하는 기간**이다.
        > 
        
        이 두 옵션은 시간을 설정한다는 공통점이 있지만, 시작 기준과 만료 결과가 다르다.
        
        ### staleTime
        
        > 데이터가 갱신된 시각을 기준으로 **얼마나 오래 fresh로 취급할지** 정한다.
        > 
        
        ```tsx
        useQuery({
          queryKey: ["movies", "detail", movieId],
          queryFn: () => getMovie(movieId),
          staleTime: 60 * 1000,
        });
        ```
        
        일반적인 조회 흐름에서는 데이터를 성공적으로 받은 시각부터 1분 동안 fresh로 판단한다.
        
        ```
        조회 성공
           ↓
        1분 동안 fresh
           ↓
        1분 경과
           ↓
        stale로 판단
        ```
        
        여기서 stale은 데이터가 실제로 틀렸다는 뜻이 아니다. **최신성을 다시 확인할 필요가 있다고 보는 상태**이다.
        
        또한 단순히 컴포넌트가 다시 렌더링되거나 같은 캐시를 읽었다고 시간이 새로 시작되는 것은 아니다.
        
        ### staleTime이 지나면?
        
        **캐시 데이터가 삭제되는 것은 아니다.**
        
        기존 데이터를 계속 보여줄 수 있으며, 기본 설정에서는 stale 상태에서 다음과 같은 계기가 생기면 백그라운드 재조회가 일어날 수 있다.
        
        - 해당 쿼리를 사용하는 컴포넌트가 새로 마운트됨
        - 사용자가 창으로 다시 돌아옴
        - 네트워크가 다시 연결됨
        
        `staleTime`이 지났다는 사실만으로 즉시 요청하는 주기 타이머는 아니다. 일정 간격의 조회는 `refetchInterval`과 별개의 기능이다. 
        
        ### gcTime
        
        > 쿼리를 사용하는 관찰자가 없어져 캐시가 사용되지 않을 때, **얼마나 더 보관할지** 정한다.
        > 
        
        ```tsx
        useQuery({
          queryKey: ["movies", "detail", movieId],
          queryFn: () => getMovie(movieId),
          gcTime: 5 * 60 * 1000,
        });
        ```
        
        일반적인 흐름에서는 해당 쿼리를 사용하던 **마지막 컴포넌트가 언마운트된 뒤** 보관 시간이 시작된다.
        
        ```
        쿼리를 사용하는 컴포넌트 존재
           ↓
        마지막 사용 컴포넌트가 사라짐
           ↓
        5분 동안 캐시 보관
           ↓
        계속 사용되지 않으면 캐시 제거
        ```
        
        다른 컴포넌트가 같은 key를 계속 관찰한다면 화면 하나를 떠났다는 이유만으로 제거 타이머가 시작되는 것은 아니다.
        
        `enabled: false`인 훅도 관찰자는 남아 있으므로, **비활성화와 언마운트를 같은 의미로 생각하면 안 된다.**
        
        ### 차이 비교
        
        | 구분 | staleTime | gcTime |
        | --- | --- | --- |
        | 목적 | 최신성 판단 | 사용하지 않는 캐시 정리 |
        | 일반적인 시작 기준 | 데이터가 성공적으로 갱신된 시각 | 마지막 관찰자가 사라진 시점 |
        | 시간 경과 후 | stale로 판단 | 제거 조건이 충족되면 캐시 삭제 |
        | 기존 데이터 삭제 | 하지 않음 | 함 |
        | 사용 중인 쿼리 | 최신성 판단에 적용 | 사용 중이라는 이유 없이 시간만으로 제거하지 않음 |
        
        브라우저 환경의 기본값은 일반적으로 `staleTime: 0`, `gcTime: 5분`이다.
        
        ### 시간 흐름 예시
        
        ```tsx
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        ```
        
        다음은 중간 재조회가 없다는 가정이다.
        
        | 시각 | 상황 |
        | --- | --- |
        | 12:00:00 | 조회 성공, fresh |
        | 12:00:30 | 마지막 사용 컴포넌트 언마운트, GC 대기 시작 |
        | 12:01:00 | 최신성 기준으로 stale, 캐시는 남음 |
        | 12:05:30 | 계속 미사용이고 제거 조건이 충족되면 캐시 삭제 |
        
        12:02에 다시 방문한다면 남아 있는 데이터를 먼저 사용할 수 있고, 기본 설정에서는 stale 데이터의 재조회를 진행할 수 있다.
        
        캐시가 제거된 뒤 돌아오면 기존 데이터 없이 새 조회를 시작한다.
        
        `gcTime`이 `staleTime`보다 짧으면 **아직 fresh로 취급할 수 있는 데이터도 미사용 상태에서 먼저 제거될 수 있다.** 두 옵션은 서로 다른 기준으로 동작하기 때문이다.
        
    - 전역 기본값과 개별 `useQuery`의 `staleTime`은 어떤 기준으로 정하면 좋을까요?
        
        > 전역에는 **대부분의 데이터에 적절한 기본 정책**을 두고, 개별 쿼리에는 **데이터 특성과 최신성 요구에 따른 예외**를 지정한다.
        > 
        
        ### 전역 기본값
        
        `QueryClient`에서 공통값을 설정할 수 있다.
        
        ```tsx
        import { QueryClient } from "@tanstack/react-query";
        
        export const queryClient = new QueryClient({
          defaultOptions: {
            queries: {
              staleTime: 60 * 1000,
              gcTime: 5 * 60 * 1000,
            },
          },
        });
        ```
        
        → 별도로 지정하지 않은 쿼리는 기본적으로 1분 동안 데이터를 fresh로 취급함
        
        위 숫자는 예시이며, 모든 서비스에 맞는 정답은 아니다. QueryClient는 일반적으로 렌더링마다 새로 생성하지 않고 안정적으로 유지해야 한다.
        
        ### 개별 쿼리 설정
        
        자주 바뀌지 않는 영화 상세 정보에는 더 긴 시간을 적용할 수 있다.
        
        ```tsx
        useQuery({
          queryKey: ["movies", "detail", movieId],
          queryFn: () => getMovie(movieId),
          staleTime: 10 * 60 * 1000,
        });
        ```
        
        더 짧은 최신성 기준이 필요한 목록에는 다른 값을 지정한다.
        
        ```tsx
        useQuery({
          queryKey: ["movies", "list", { page }],
          queryFn: () => getMovies(page),
          staleTime: 30 * 1000,
        });
        ```
        
        개별 옵션은 해당 `useQuery`의 전역 기본값을 덮어쓴다.
        
        다만 같은 key를 여러 곳에서 사용하면 데이터 캐시는 공유한다. `staleTime`은 관찰자별로 다를 수 있으므로, **한쪽에서 설정한 값이 같은 key의 모든 사용처에 일괄 적용되는 것은 아니다.**
        
        ### 기준 ① 데이터의 변경 빈도
        
        | 데이터 | 생각할 방향 |
        | --- | --- |
        | 영화 제목·줄거리 | 비교적 긴 시간 고려 |
        | 영화 장르 목록 | 더 긴 시간 고려 |
        | 인기 순위·평점 | 변경 주기에 맞춘 시간 고려 |
        | 좌석·재고 상태 | 짧은 시간과 별도 최신성 확인 고려 |
        
        하지만 변경 빈도만으로 결정하면 부족하다.
        
        ### 기준 ② 오래된 값을 보여줘도 되는 시간
        
        “데이터가 얼마나 자주 바뀌는가?”와 함께 다음을 판단해야 한다.
        
        ```
        사용자가 잠깐 오래된 값을 봐도 괜찮은가?
        잘못된 표시가 중요한 결정에 영향을 주는가?
        ```
        
        예를 들어 줄거리는 몇 분 전 데이터여도 문제가 적지만, 예약 가능 좌석은 오래된 값의 영향이 크다.
        
        그렇다고 `staleTime: 0`이 실시간 최신성을 보장하는 것은 아니다. 서버는 예약·결제 등 실제 작업 시점에 다시 검증해야 한다.
        
        ### 기준 ③ 호출 비용과 화면 이동 패턴
        
        외부 API의 호출 한도나 비용이 크고, 사용자가 목록과 상세를 자주 왕복한다면 적절한 `staleTime`으로 반복 요청을 줄일 수 있다.
        
        다만 다시 방문할 때 데이터를 재사용하려면 캐시가 남아 있어야 하므로 `gcTime`도 함께 고려한다.
        
        ### 데이터 변경을 알고 있다면 무효화하기
        
        사용자가 직접 데이터를 변경했다면 시간이 지날 때까지 기다리기보다 관련 쿼리를 무효화할 수 있다.
        
        ```tsx
        await queryClient.invalidateQueries({
          queryKey: ["movies", "detail", movieId],
        });
        ```
        
        일반적인 숫자 `staleTime` 설정에서는 무효화가 기존 fresh 판단을 덮어쓴다. 활성 쿼리는 기본적으로 재조회 대상이 된다.
        
        목록도 영향을 받았다면 함께 무효화한다.
        
        ```tsx
        await queryClient.invalidateQueries({
          queryKey: ["movies", "list"],
        });
        ```
        
        → 공통 접두사를 사용해 해당 목록 쿼리들을 선택할 수 있음.
        
        ### 설정을 정할 때의 관점
        
        ```
        전역 기본값
        → 대부분의 조회에 적절한 최신성 기준
        
        개별 staleTime
        → 특정 데이터의 변경 특성과 사용자 요구 반영
        
        invalidateQueries
        → 변경 사실을 알 때 명시적으로 갱신 유도
        
        gcTime
        → 다시 사용할 가능성과 메모리 보관 비용 고려
        ```
        
        `staleTime`은 **데이터를 언제 삭제할지나 몇 초마다 요청할지를 정하는 값이 아니라, 기존 데이터를 얼마나 오래 최신으로 취급할지 정하는 값**이다.