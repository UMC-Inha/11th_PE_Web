- query key와 요청 상태
    - 목록, 검색과 상세에 같은 query key를 쓰면 어떤 문제가 생길까요? 페이지 번호, 검색어와 영화 ID를 포함하는 이유도 함께 생각해 보세요.

      #### **1. query key의 역할**

        - query key는 TanStack Query가 캐시에서 데이터를 찾을 때 쓰는 이름표이다.
        - 같은 key면 같은 데이터로 보고 캐시를 같이 쓰고, key가 다르면 캐시를 따로 저장한다.
        - 사물함에 비유하면 query key는 사물함 번호이다. 번호가 같으면 같은 칸을 연다.

      | **화면** | **queryKey** |
              | --- | --- |
      | 목록 | ["movies", "list", { page }] |
      | 검색 | ["movies", "search", { query: normalizedQuery }] |
      | 상세 | ["movies", "detail", parsedMovieId] |

      #### **2. 같은 key를 쓰면 생기는 문제**

        - 목록, 검색, 상세에 모두 ["movies"]를 쓰면 세 화면이 한 칸을 같이 쓴다. 목록을 본 뒤 검색 화면에 가면 검색 결과 대신 인기 영화 목록이 보인다.
        - 화면 종류는 나눴어도 페이지, 검색어, 영화 번호를 빼면 같은 화면 안에서 같은 문제가 생긴다.

      | **빼먹은 값** | **잘못된 key** | **생기는 문제** |
              | --- | --- | --- |
      | 페이지 번호 | ["movies", "list"] | 2페이지를 눌러도 1페이지 캐시가 계속 보인다. |
      | 검색어 | ["movies", "search"] | "아이언맨"을 검색해도 이전 "스파이더맨" 결과가 보인다. |
      | 영화 번호 | ["movies", "detail"] | 다른 영화를 눌러도 먼저 본 영화의 상세가 보인다. |
    - `enabled: false`인데도 `isPending`이 참일 수 있는 이유는 무엇이며, 이때 `isLoading`은 어떤 값일까요?

      #### **1. isPending과 isLoading**

      | **값** | **뜻** | **계산** |
              | --- | --- | --- |
      | isPending | 데이터가 아직 없다. | status === "pending" |
      | isFetching | 지금 요청 중이다. | fetchStatus === "fetching" |
      | isLoading | 데이터가 없고, 지금 처음 요청 중이다. | isPending && isFetching |

      #### **2. enabled: false인데 isPending이 참인 이유**

        - enabled: false는 "자동으로 요청하지 마"라는 뜻이다. 요청을 안 하니 데이터도 들어오지 않는다.
        - isPending은 요청 여부와 상관없이 데이터가 없으면 참이다. 그래서 요청을 안 해도 true로 남는다.
        - 요청은 하지 않으므로 isFetching이 false이고, isLoading도 false이다.

      | **상황** | **isPending** | **isFetching** | **isLoading** |
              | --- | --- | --- | --- |
      | enabled: false, 캐시 없음 | true | false | false |
      | enabled: true, 첫 요청 중 | true | true | true |
      | 요청 성공 | false | false | false |

      #### **3. 우리 코드에서**

        ```tsx
        const searchQuery = useQuery({
          queryKey: ["movies", "search", { query: normalizedQuery }],
          queryFn: () => searchMovies({ query: normalizedQuery }),
          enabled: normalizedQuery.length > 0,
        });
        ```

        - 검색은 검색어가 없으면 요청하지 않으므로 로딩을 isLoading으로 판단했다. isPending으로 판단하면 요청도 안 했는데 "불러오는 중"이 보일 수 있다.
        - 상세는 /movies/abc처럼 번호가 잘못되면 요청하지 않는데 isPending은 true이다. 그래서 잘못된 번호 검사를 isPending보다 먼저 둔다.
- 캐시 수명과 재조회
    - `staleTime`과 `gcTime`은 각각 언제부터 계산하며, 시간이 지난 뒤 캐시에 어떤 차이가 생길까요?

      #### **1. 두 시간의 차이**

      | **구분** | **staleTime** | **gcTime** |
              | --- | --- | --- |
      | 뜻 | 데이터를 최신(fresh)으로 믿는 시간 | 안 쓰는 캐시를 남겨 두는 시간 |
      | 계산 시작 | 데이터를 받은 순간 | 그 데이터를 쓰는 화면이 모두 사라진 순간 |
      | 기본값 | 0 (받자마자 stale) | 5분 |
      | 시간이 지나면 | stale이 된다. 캐시는 남는다. | 캐시가 삭제된다. |
        - 우유에 비유하면 staleTime은 유통기한이고 gcTime은 냉장고에서 버리기까지의 기간이다. 유통기한이 지나도 냉장고에는 남아 있다.

      | **상태** | **뜻** |
              | --- | --- |
      | fresh | staleTime이 안 지났다. 다시 와도 요청하지 않는다. |
      | stale | staleTime이 지났다. 화면을 다시 열거나 창에 다시 들어오면 요청한다. |
      | inactive | 이 데이터를 쓰는 화면이 없다. 이때부터 gcTime이 흐른다. |

      #### **2. 시간이 지난 뒤 다시 열면**

      | **다시 열었을 때** | **화면** | **요청** |
              | --- | --- | --- |
      | staleTime 안 | 캐시를 바로 보여 준다. | 안 한다. |
      | staleTime 지남, gcTime 안 | 캐시를 바로 보여 준다. | 뒤에서 다시 요청해 바꿔 끼운다. |
      | gcTime 지남 | 로딩 문구를 보여 준다. | 처음부터 요청한다. |

      #### **3. 우리 코드에서**

        ```tsx
        const ONE_MINUTE =60 *1000;
        const queryClient =new QueryClient({
          defaultOptions: { queries: { staleTime: ONE_MINUTE} },
        });
        ```

        - 기본값 0일 때는 1 → 2 → 1페이지로 돌아오면 1페이지 요청이 다시 생겼다.
        - 1분으로 바꾼 뒤에는 1분 안에 돌아와도 Network 탭에 요청이 새로 생기지 않았다.
    - 전역 기본값과 개별 `useQuery`의 `staleTime`은 어떤 기준으로 정하면 좋을까요?

      #### **1. 두 곳에서 정할 수 있다**

      | **위치** | **적용 범위** | **우리 코드** |
              | --- | --- | --- |
      | new QueryClient({ defaultOptions }) | 앱의 모든 useQuery | 1분 |
      | useQuery({ staleTime }) | 그 query 하나 | 상세만 30초 |
        - 개별 useQuery에 쓴 값이 전역 기본값보다 우선한다. 그래서 목록과 검색은 1분, 상세는 30초가 적용된다.

      #### **2. 정하는 기준**

        - 전역 기본값은 앱 대부분의 데이터에 맞는 무난한 값으로 두고, 성격이 다른 데이터만 개별로 정한다.

      | **질문** | **그렇다면** | **예시** |
              | --- | --- | --- |
      | 자주 바뀌나? | 짧게 | 실시간 순위, 남은 좌석 수 |
      | 거의 안 바뀌나? | 길게 | 장르 목록, 영화 상세 정보 |
      | 예전 값을 보여 주면 문제가 되나? | 짧게 | 결제 금액, 재고 |
      | 요청이 오래 걸리거나 비싼가? | 길게 | 호출 횟수 제한이 있는 API |
        - 정답이 정해진 값은 없다. 데이터가 얼마나 자주 바뀌는지, 예전 값을 보여 줘도 괜찮은지를 기준으로 정한다.