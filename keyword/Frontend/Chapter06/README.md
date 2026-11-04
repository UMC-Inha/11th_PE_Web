# Frontend Chapter06

## 키워드 정리

### query key와 요청 상태

#### 목록, 검색과 상세에 같은 query key를 쓰면 어떤 문제가 생길까요? 페이지 번호, 검색어와 영화 ID를 포함하는 이유도 함께 생각해 보세요.

- TanStack Query는 query key를 기준으로 데이터를 캐싱합니다.
- query key는 가져오는 데이터를 고유하게 설명해야 합니다.
- `queryFn`에서 사용하며 값이 바뀌는 변수는 query key에 포함해야 합니다.
- 목록, 검색, 상세가 같은 key를 쓰면 하나의 캐시 항목을 공유하게 되어 서로 다른 데이터가 같은 항목에 저장됩니다.
- 페이지 번호, 검색어, 영화 ID는 `queryFn`의 인자이므로 key에 포함합니다. 값이 바뀌면 key가 달라져 별도의 캐시 항목으로 관리됩니다.

#### `enabled: false`인데도 `isPending`이 참일 수 있는 이유는 무엇이며, 이때 `isLoading`은 어떤 값일까요?

- `status`는 데이터의 유무를 나타냅니다.
    - **pending:** 캐시된 데이터가 없고, 아직 쿼리 시도가 끝나지 않은 상태
- `fetchStatus`는 `queryFn`의 실행 여부를 나타냅니다.
    - **idle:** 쿼리가 현재 아무 작업도 하지 않는 상태
- `enabled: false`이고 캐시된 데이터가 없으면 쿼리는 `status`가 `pending`, `fetchStatus`가 `idle`인 상태로 시작합니다. 그래서 `isPending`은 `true`입니다.
- `isLoading`은 `isFetching && isPending`으로 계산되는 파생 값입니다. `fetchStatus`가 `idle`이면 `isFetching`이 `false`이므로 `isLoading`은 `false`입니다.
- **정리:** `isPending`은 데이터 유무, `isLoading`은 데이터가 없는 상태에서 실제로 fetch 중인지를 나타냅니다.

---

### 캐시 수명과 재조회

#### `staleTime`과 `gcTime`은 각각 언제부터 계산하며, 시간이 지난 뒤 캐시에 어떤 차이가 생길까요?

- **`staleTime`**
    - 쿼리가 fresh에서 stale로 전환되기까지의 시간
    - 기본값은 0이며, 기본적으로 캐시된 데이터를 stale로 간주합니다.
    - fresh인 동안에는 네트워크 요청 없이 캐시에서만 데이터를 읽습니다.
    - stale이면 캐시 데이터는 그대로 반환하되, 아래 조건에서 백그라운드 refetch가 발생합니다.
        - 쿼리의 새 인스턴스가 마운트될 때
        - 창이 다시 포커스될 때
        - 네트워크가 다시 연결될 때
- **`gcTime`**
    - 사용되지 않는(inactive) 캐시 데이터가 메모리에 남아 있는 시간
    - 기본값은 5분이며, 활성 observer가 없어진 시점부터 계산합니다.
    - 이 시간이 지나면 해당 캐시 데이터는 garbage collection됩니다.
- **차이:** stale은 데이터가 캐시에 남아 있고 재검증 대상이 되는 상태, gc는 캐시 항목이 제거된 상태입니다.

#### 전역 기본값과 개별 `useQuery`의 `staleTime`은 어떤 기준으로 정하면 좋을까요?

- 기본값은 `QueryClient`의 `defaultOptions.queries`에서 전역으로 설정하고, 개별 `useQuery` 옵션에서 덮어쓸 수 있습니다.
- 기준은 데이터가 변경되는 빈도와 오래된 데이터 노출을 허용할 수 있는 범위입니다.
    - 자주 바뀌지 않는 데이터: `staleTime`을 길게 설정
    - 항상 최신이어야 하는 데이터: 기본값 0 유지
- 변경 이후 최신 상태가 필요한 데이터는 `invalidateQueries`로 해당 쿼리를 stale로 표시하고 refetch합니다.
