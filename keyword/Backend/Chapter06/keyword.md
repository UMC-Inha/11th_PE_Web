- query key와 요청 상태
    - 목록, 검색과 상세에 같은 query key를 쓰면 어떤 문제가 생길까요? 페이지 번호, 검색어와 영화 ID를 포함하는 이유도 함께 생각해 보세요.
        - **query key**: 캐시에서 데이터를 구분하는 이름. 같은 key를 쓰면 캐시를 공유하므로 목록·검색·상세에 잘못된 결과가 표시될 수 있음.
        - 요청 종류와 결과를 바꾸는 `page`·검색어·영화 ID를 배열에 포함. `queryFn`만 다르게 작성해도 캐시가 나뉘는 것은 X.

        ```tsx
        ["movies", "list", { page: 1 }];
        ["movies", "search", { query: "스파이더맨" }];
        ["movies", "detail", 550];
        ```

        - key 변경 → 해당 캐시 확인 → 최신 여부와 `enabled`에 따라 요청 또는 재사용.
    - `enabled: false`인데도 `isPending`이 참일 수 있는 이유는 무엇이며, 이때 `isLoading`은 어떤 값일까요?
        - `enabled: false`는 자동 요청을 막는 설정. 캐시가 없다면 아직 결과를 받지 못한 `pending`이지만 요청은 하지 않는 `idle` 상태.
        - 따라서 `isPending: true`, `isFetching: false`, `isLoading: false`. **`isLoading = isPending && isFetching`**.
        - 이미 성공한 캐시가 있으면 `success`로 시작 가능. 검색어 없음·잘못된 ID 안내는 로딩보다 먼저 처리.

      | 상황 | isPending | isFetching | isLoading |
              | --- | --- | --- | --- |
      | 캐시 없이 요청 대기 | true | false | false |
      | 첫 요청 진행 중 | true | true | true |
      | 성공 후 요청 없음 | false | false | false |
      | 성공 데이터를 둔 채 재조회 | false | true | false |

  **추가 핵심 정리**

    - `queryFn`은 데이터를 반환하는 Promise와 연결. 오류는 예외·rejection으로 전달해야 Query가 실패로 인식.
    - `data?.results ?? []`만으로 미조회와 빈 결과를 구분할 수는 없음 → 로딩·오류·성공 상태를 함께 확인. 백그라운드 재조회는 기존 데이터를 유지하며 `isFetching`으로 안내 가능.

  **참고 자료**

    - TanStack Query — Query Keys
- 캐시 수명과 재조회
    - `staleTime`과 `gcTime`은 각각 언제부터 계산하며, 시간이 지난 뒤 캐시에 어떤 차이가 생길까요?


        | 옵션 | 계산 시작 | 시간이 지나면 |
        | --- | --- | --- |
        | staleTime | 데이터가 성공적으로 갱신된 시점 | fresh → stale, 캐시 유지 |
        | gcTime | 해당 query의 마지막 구독이 사라진 시점 | 계속 미사용이면 캐시 삭제 |
        - 브라우저 기본값은 `staleTime: 0`, `gcTime: 5분`. stale은 재확인이 필요한 상태이며, 서버 값이 실제로 바뀌었다는 판정은 X.
        - 예: `staleTime` 1분·`gcTime` 5분에서 0초에 조회 성공, 20초에 마지막 화면 이탈 → 재조회 없이 계속 미사용이면 60초에 stale, 320초에 캐시 삭제.
        - stale이 되는 순간 요청하는 것은 X. 기본 설정에서는 화면 재진입·창 재활성화·네트워크 재연결 시 stale 데이터를 재조회 가능.
    - 전역 기본값과 개별 `useQuery`의 `staleTime`은 어떤 기준으로 정하면 좋을까요?
        - **전역**: 앱의 공통 기준. 이전 데이터를 얼마나 오래 보여줘도 되는지, 데이터 변경 빈도와 요청 비용을 고려.
        - **개별**: 공통 기준과 다른 조회에 지정. 현재 프로젝트는 전역 1분, 상세 30초 → 상세에 개별 30초 적용.
        - 길게 설정하면 요청 감소·변경 반영 지연 가능, 짧게 설정하면 최신성 확인과 요청 증가. `gcTime`은 재방문 가능성과 메모리 사용량을 기준으로 조절.
    
    **추가 핵심 정리**
    
    - 최신 여부와 사용 여부는 별개. fresh 캐시도 미사용이면 삭제 대상, stale 캐시도 사용 중이면 유지.
    - 기본 캐시는 메모리 저장. 새로고침을 넘는 보존은 별도 설정 필요. 렌더링마다 QueryClient를 새로 만들지 않고 같은 인스턴스 유지.
    - 캐시 확인은 Query Devtools와 Network를 함께 사용. 1 → 2 → 1페이지로 이동하며 저장된 데이터와 추가 요청 여부 비교.
    
    **참고 자료**
    
    - TanStack Query — Caching Examples
    - TanStack Query — Stable Query Client