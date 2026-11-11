# 프론트엔드 핵심 키워드 — TanStack Query

## query key와 요청 상태

### 목록, 검색과 상세에 같은 query key를 쓰면 어떤 문제가 생길까요?

<details>
<summary>Answer</summary>

**query key란?**

TanStack Query가 캐시에서 데이터를 구분하는 이름표다. 배열 형태로 작성하며, 이 배열의 내용이 같으면 같은 데이터로 취급한다.

```tsx
queryKey: ["movies", "list", { page }]
```

**같은 key를 쓰면 생기는 문제**

캐시는 key를 기준으로 저장되고 조회된다. 서로 다른 요청에 같은 key를 쓰면 TanStack Query는 이를 **같은 데이터**로 보고 먼저 저장된 캐시를 그대로 돌려준다.

| 상황 | 결과 |
| --- | --- |
| 목록·검색·상세가 모두 `["movies"]` | 상세 화면에 목록 데이터가, 검색 화면에 상세 데이터가 들어간다 |
| 응답 구조가 다름 | 목록은 `{ results: [...] }`, 상세는 `{ title, genres }` → 화면에서 `undefined` 오류 발생 |
| 캐시 무효화 | 하나를 갱신하면 관련 없는 화면까지 함께 다시 요청된다 |

**page, query, movieId를 포함하는 이유**

이 값들은 **query function의 결과를 바꾸는 값**이기 때문이다. `getMovies({ page: 1 })`과 `getMovies({ page: 2 })`는 서로 다른 데이터를 반환하므로, key도 달라야 각각 따로 저장된다.

```tsx
["movies", "list", { page: 1 }]        // 1페이지 캐시
["movies", "list", { page: 2 }]        // 2페이지 캐시
["movies", "search", { query: "스파이더맨" }]
["movies", "detail", 550]
```

key가 달라지면 TanStack Query는 해당 캐시가 있는지 확인하고, 없으면 새로 요청한다. 1 → 2 → 1페이지로 이동할 때 1페이지를 다시 요청하지 않는 것도 key로 캐시를 찾아내기 때문이다.

반대로 `page`를 key에서 빼면 페이지를 바꿔도 같은 캐시를 보게 되어 화면이 갱신되지 않는다.

**원칙**: query function 안에서 사용하는 값은 모두 query key에 포함한다.

</details>

### `enabled: false`인데도 `isPending`이 참일 수 있는 이유는 무엇이며, 이때 `isLoading`은 어떤 값일까요?

<details>
<summary>Answer</summary>

**isPending과 isLoading의 차이**

| 상태 | 의미 |
| --- | --- |
| `isPending` | 아직 성공도 실패도 하지 않은 상태. 데이터가 없다는 뜻 |
| `isFetching` | 실제로 요청이 진행 중인 상태 |
| `isLoading` | `isPending && isFetching` — 첫 요청이 진행 중인 상태 |

**`enabled: false`일 때**

`enabled: false`는 자동 요청을 막는 옵션이다. 요청을 보내지 않으므로 데이터도 없고, 성공도 실패도 하지 않는다. 즉 **`isPending`은 참**이다.

하지만 요청 자체가 나가지 않으므로 `isFetching`은 거짓이고, 따라서 **`isLoading`도 거짓**이다.

```tsx
// 검색어가 없을 때
enabled: normalizedQuery.length > 0   // false

isPending  → true   (데이터 없음)
isFetching → false  (요청 안 함)
isLoading  → false
```

**그래서 화면에서 어떻게 쓰는가**

목록이나 상세처럼 **항상 요청하는 화면**은 `isPending`으로 첫 데이터를 기다린다.

검색처럼 **조건부로 요청하는 화면**에서 `isPending`을 쓰면, 검색어를 입력하기 전에도 "불러오는 중"이 계속 표시된다. 요청하지 않았는데 로딩 화면이 뜨는 셈이다. 그래서 `isLoading`을 써서 실제로 요청이 진행 중일 때만 로딩을 보여준다.

</details>

## 캐시 수명과 재조회

### `staleTime`과 `gcTime`은 각각 언제부터 계산하며, 시간이 지난 뒤 캐시에 어떤 차이가 생길까요?

<details>
<summary>Answer</summary>

**staleTime — 데이터를 최신으로 믿는 시간**

- **언제부터**: 데이터를 성공적으로 받아온 시점부터
- **기본값**: `0` (받자마자 오래된 데이터로 취급)
- **지나면**: `fresh` → `stale`로 바뀐다. **캐시는 그대로 남아 있다.**

`stale`이 되었다고 즉시 재요청하지는 않는다. 다음 조건에서 다시 조회한다.

- 해당 화면을 다시 열 때 (컴포넌트 마운트)
- 창에 포커스가 돌아올 때
- 네트워크가 다시 연결될 때

**gcTime — 캐시를 메모리에 보관하는 시간**

- **언제부터**: 그 query를 사용하는 컴포넌트가 모두 사라진 시점부터 (`inactive` 상태)
- **기본값**: 5분
- **지나면**: 캐시가 메모리에서 **삭제된다**

**두 시간이 지난 뒤의 차이**

| 구분 | staleTime 경과 | gcTime 경과 |
| --- | --- | --- |
| 캐시 | 남아 있음 | 삭제됨 |
| 화면을 다시 열면 | 캐시를 먼저 보여주고 뒤에서 갱신 | 데이터가 없어 처음부터 로딩 |
| 사용자 체감 | 화면이 즉시 뜸 | 로딩 화면을 봄 |

**staleTime이 데이터의 신선도**, **gcTime이 캐시의 수명**이라고 구분하면 이해하기 쉽다.

1 → 2 → 1페이지로 이동했을 때 1페이지가 다시 요청되지 않는 것은 `staleTime` 안에 있기 때문이다. `staleTime`이 기본값 `0`이면 캐시는 있지만 이미 `stale`이라 다시 요청한다.

</details>

### 전역 기본값과 개별 `useQuery`의 `staleTime`은 어떤 기준으로 정하면 좋을까요?

<details>
<summary>Answer</summary>

**판단 기준은 "이 데이터가 얼마나 자주 바뀌는가"**

| 데이터 성격 | staleTime | 예시 |
| --- | --- | --- |
| 거의 바뀌지 않음 | 길게 (수십 분~무한) | 장르 목록, 국가 코드 |
| 가끔 바뀜 | 중간 (수 분) | 영화 상세 정보, 인기 영화 목록 |
| 자주 바뀜 | 짧게 또는 0 | 실시간 알림, 재고 수량 |

**전역 기본값**

대부분의 요청에 무난한 값을 둔다. UMCine처럼 TMDB 데이터를 다루는 경우 영화 정보가 분 단위로 바뀌지 않으므로 1분 정도가 적절하다.

```tsx
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60 * 1000 } },
});
```

기본값을 `0`으로 두면 화면을 옮길 때마다 재요청이 발생해 캐시의 이점을 거의 얻지 못한다.

**개별 설정**

전역 기본값과 성격이 다른 요청에만 따로 지정한다. 모든 `useQuery`에 일일이 적으면 전역 기본값을 둔 의미가 사라진다.

```tsx
const movieDetailQuery = useQuery({
  queryKey: ["movies", "detail", movieId],
  queryFn: () => getMovieDetail(movieId),
  staleTime: 30 * 1000,   // 전역 1분 대신 30초
});
```

**추가로 고려할 점**

- 최신성이 중요한 데이터를 오래 캐시하면 사용자가 **낡은 정보를 보게 된다**
- 반대로 자주 재요청하면 응답 대기 시간이 늘고 **API 호출 한도**에 부담이 된다
- 서버가 데이터를 바꾼 뒤 즉시 반영해야 한다면 `staleTime`을 늘리는 대신 `invalidateQueries`로 명시적으로 무효화하는 편이 정확하다

</details>

---