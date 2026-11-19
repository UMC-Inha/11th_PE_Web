# 워크북 프론트엔드 키워드 정리 — 상태 관리와 캐시

## 목차

- [클라이언트 상태와 서버 상태](#클라이언트-상태와-서버-상태)
  - 입력값, 로그인 토큰과 회원 정보는 각각 어디에서 관리하는 것이 적절할까요?
  - 같은 회원 정보를 전역 store와 query 캐시에 각각 저장하면 어떤 문제가 생길 수 있을까요?
- [캐시 일관성](#캐시-일관성)
  - 서버에서 데이터를 수정했는데 다른 화면에는 이전 값이 보이는 이유는 무엇인가요?
  - 변경한 데이터를 다시 조회하는 방식과 캐시를 직접 수정하는 방식은 각각 어떤 상황에 적절할까요?

---

## 클라이언트 상태와 서버 상태

### Q. 입력값, 로그인 토큰과 회원 정보는 각각 어디에서 관리하는 것이 적절할까요? 각 상태의 원본이 어디에 있는지도 함께 생각해 보세요.

#### 클라이언트 상태 (Client State)

- 원본이 브라우저(프론트엔드)에 있는 상태
- 예: 입력 중인 값, 모달 열림 여부, 선택한 탭, 다크 모드 설정
- 프론트가 직접 만들고 바꾸므로 항상 최신

#### 서버 상태 (Server State)

- 원본이 서버(DB)에 있고, 프론트는 그 복사본을 받아서 보여주는 상태
- 예: 회원 정보, 게시글 목록, 알림 개수
- 다른 기기·다른 사용자가 바꿀 수 있어서, 프론트가 가진 값은 언제든 오래된 값(stale)이 될 수 있음
- 그래서 캐싱, 재요청, 갱신(invalidate) 같은 관리가 필요함

#### 상태 관리 위치의 종류

| 위치 | 의미 | 도구 예시 |
| --- | --- | --- |
| 지역 상태 | 한 컴포넌트(또는 가까운 몇 개) 안에서만 쓰는 상태 | `useState`, `useReducer`, React Hook Form |
| 전역 store | 여러 화면에서 공유하는 클라이언트 상태 | Zustand, Redux, Context API |
| query 캐시 | 서버에서 받은 데이터를 요청 단위로 캐싱하는 저장소 | TanStack Query, SWR |
| URL | 주소에 담겨 공유·새로고침해도 유지되어야 하는 상태 | 경로 파라미터, 쿼리 스트링 (`?page=2&sort=latest`) |
| 브라우저 저장소 | 새로고침·재방문 후에도 남아야 하는 값 | 쿠키, `localStorage`, `sessionStorage` |

#### 각 데이터의 원본과 관리 위치

| 데이터 | 원본 | 종류 | 적절한 관리 위치 |
| --- | --- | --- | --- |
| 입력값 | 사용자가 입력 중인 해당 컴포넌트 | 클라이언트 상태 | 지역 상태 (`useState`, React Hook Form) |
| 로그인 토큰 | 서버가 발급, 이후 브라우저가 보관 | 인증 정보 | httpOnly 쿠키 또는 메모리(전역 store) + Refresh Token 쿠키 |
| 회원 정보 | 서버 DB | 서버 상태 | query 캐시 (TanStack Query) |

#### 1) 입력값 → 지역 상태

##### 원본

- 사용자가 입력하고 있는 그 폼 컴포넌트
- 제출하기 전까지는 서버에도, 다른 화면에도 필요 없는 값

##### 지역 상태로 관리하는 이유

- 입력은 글자 하나마다 상태가 바뀜 → 전역 store에 두면 store를 구독하는 다른 컴포넌트까지 불필요하게 리렌더링될 수 있음
- 폼을 벗어나면 필요 없는 값이라 컴포넌트가 사라질 때 같이 사라지는 것이 자연스러움
- 검증·에러 메시지·제출 상태도 폼 안에서만 쓰임

```tsx
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
    </form>
  );
}
```

- 입력 항목이 많거나 검증이 복잡하면 React Hook Form 같은 폼 라이브러리 사용
- 예외: 여러 단계로 나뉜 회원가입처럼 여러 화면에 걸쳐 입력값을 유지해야 하면 해당 흐름 범위의 store나 Context에 둠
- 검색어·필터처럼 공유하거나 새로고침 후에도 유지되어야 하는 입력은 URL 쿼리 스트링에 둠

#### 2) 로그인 토큰 → httpOnly 쿠키 또는 메모리

##### 원본

- 토큰은 서버가 발급하고, 유효한지는 서버가 서명을 검증해서 판단함
- 프론트는 토큰을 보관했다가 요청에 실어 보내는 역할만 함 → 내용을 바꾸거나 직접 판단하지 않음

##### 저장 위치별 비교

| 저장 위치 | 새로고침 후 유지 | XSS 공격 시 | 특징 |
| --- | --- | --- | --- |
| httpOnly 쿠키 | ⭕ | JS로 읽을 수 없어 탈취 어려움 | 서버가 `Set-Cookie`로 설정, 브라우저가 자동 전송. CSRF 대비(SameSite) 필요 |
| 메모리 (변수, 전역 store) | ❌ (새로고침 시 사라짐) | 비교적 안전 | Refresh Token 쿠키로 새로고침 시 재발급받아 복구 |
| `localStorage` | ⭕ | JS로 읽을 수 있어 탈취 위험 | 구현은 쉽지만 보안상 권장되지 않음 |

##### 많이 쓰는 구성

- Access Token: 짧은 만료 시간, 메모리(전역 store)에 보관 → API 요청 시 `Authorization: Bearer` 헤더로 전송
- Refresh Token: 긴 만료 시간, httpOnly 쿠키에 보관 → Access Token 만료·새로고침 시 재발급 요청

```ts
// authStore.ts (Zustand) — 토큰만 보관
interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token }),
}));
```

##### 로그인 여부는 따로 저장하지 않고 계산

- `isLoggedIn` 같은 값을 따로 상태로 두면 토큰과 어긋날 수 있음
- 토큰이 있는지, 회원 정보 조회가 성공했는지로 계산해서 사용

#### 3) 회원 정보 → query 캐시

##### 원본

- 서버 DB에 있음
- 다른 기기에서 닉네임을 바꾸거나, 관리자가 권한을 바꾸면 서버 값이 먼저 바뀜
- 프론트가 가진 회원 정보는 언제나 서버 데이터의 복사본

##### query 캐시로 관리하는 이유

- 서버 상태에 필요한 기능을 기본으로 제공
  - 로딩·에러 상태 관리
  - 같은 데이터를 여러 컴포넌트가 요청해도 한 번만 요청하고 캐시 공유
  - 일정 시간이 지나거나 창에 다시 포커스할 때 자동 재요청
  - 수정 후 `invalidateQueries`로 최신 값 다시 가져오기

```ts
// useMe.ts — 회원 정보는 이 훅으로만 조회
export function useMe() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ['me'],
    queryFn: getMe,                 // GET /users/me
    enabled: !!accessToken,         // 토큰이 있을 때만 요청
    staleTime: 1000 * 60 * 5,       // 5분 동안은 캐시를 최신으로 간주
  });
}
```

```tsx
// 어느 컴포넌트에서든 같은 캐시를 사용
function Header() {
  const { data: me } = useMe();
  return <span>{me?.nickname}님</span>;
}
```

---

### Q. 같은 회원 정보를 전역 store와 query 캐시에 각각 저장하면 어떤 문제가 생길 수 있을까요?

#### 전역 store

- Zustand, Redux처럼 여러 컴포넌트가 함께 읽고 쓰는 클라이언트 상태 저장소
- 값을 바꾸려면 개발자가 직접 `set`, `dispatch`를 호출해야 함

#### query 캐시

- TanStack Query 같은 라이브러리가 서버 응답을 queryKey별로 저장해두는 공간
- 재요청, 만료(stale) 판단, 무효화(invalidate)를 라이브러리가 관리함

#### 생길 수 있는 문제

##### 문제 1. 원본이 두 개처럼 동작해서 값이 어긋난다

- 한쪽만 갱신되면 같은 사용자 정보인데 화면마다 다른 값이 보임

```
① 마이페이지에서 닉네임 변경 → invalidateQueries(['me'])
② query 캐시: 새 닉네임 "우즈"  ✅
③ 전역 store: 이전 닉네임 "woods" 그대로  ❌
④ 헤더(store 사용)는 "woods", 마이페이지(query 사용)는 "우즈" 표시
```

##### 문제 2. query의 자동 갱신 기능이 store에는 적용되지 않는다

- query 캐시는 창 포커스 시 재요청, staleTime 만료, invalidate 등으로 최신 상태를 유지함
- store는 이런 기능이 없어서 처음 복사한 값에 머물러 있음
- 결국 store 쪽을 읽는 화면은 오래된 정보(stale data)를 계속 보여줌

##### 문제 3. 동기화 코드를 계속 직접 작성해야 한다

- 회원 정보를 바꾸는 곳마다 두 곳을 모두 갱신해야 함
  - 닉네임 수정, 프로필 이미지 변경, 권한 변경, 재로그인 …
- 한 곳이라도 빠뜨리면 바로 문제 1이 발생
- `useEffect`로 복사하는 방식은 한 번 더 렌더링이 일어나고, 복사 전 순간에는 store 값이 비어 있어 화면이 깜빡이거나 잘못된 값이 잠깐 보일 수 있음

##### 문제 4. 로딩·에러 상태가 store에는 없다

- query는 `isPending`, `isError`를 제공하지만, store에는 값만 복사됨
- store를 읽는 컴포넌트는 `user === null`일 때 로딩 중인지, 실패했는지, 로그아웃 상태인지 구분할 수 없음

##### 문제 5. 로그아웃·계정 전환 시 이전 정보가 남는다

- 로그아웃할 때 store만 비우고 query 캐시를 지우지 않으면(또는 반대), 이전 사용자의 정보가 남아서
  - 다른 계정으로 로그인했을 때 잠깐 이전 사용자 정보가 보이거나
  - 공용 PC에서 개인정보가 노출될 수 있음
- store를 `localStorage`에 저장(persist)하고 있다면, 브라우저를 닫아도 오래된 회원 정보가 계속 남음

##### 문제 6. 어느 쪽을 써야 하는지 팀원마다 달라진다

- 같은 데이터에 접근하는 방법이 두 가지라서 컴포넌트마다 store를 쓰는 곳, query를 쓰는 곳이 섞임
- 버그가 났을 때 어디서 값이 바뀌었는지 추적하기 어려움

#### 해결: 원본별로 저장 위치를 하나로 정한다

| 데이터 | 저장 위치 (한 곳만) |
| --- | --- |
| 회원 정보 (서버 상태) | query 캐시 |
| Access Token, UI 상태 (클라이언트 상태) | 전역 store |

- 서버에서 온 데이터는 query 캐시만 원본처럼 사용하고, 전역 store에는 복사하지 않음
- store에는 서버에 원본이 없는 클라이언트 상태만 둠

---

## 캐시 일관성

### Q. 서버에서 데이터를 수정했는데 다른 화면에는 이전 값이 보이는 이유는 무엇인가요?

#### 캐시 (Cache)

- 한 번 받아온 데이터를 **다시 요청하지 않고 재사용하기 위해 저장해 둔 복사본**
- 빠르게 화면을 보여줄 수 있지만, 원본(서버)이 바뀌면 **복사본은 자동으로 바뀌지 않음**

#### Stale 데이터 (오래된 데이터)

- 캐시에 있지만 **서버의 최신 값과 다를 수 있는 데이터**
- 서버 상태는 다른 화면·기기·사용자에 의해 바뀔 수 있어서, 프론트가 가진 값은 시간이 지나면 stale이 됨

#### 원인

- 수정 요청(mutation)은 서버의 원본만 바꿈
- 다른 화면은 서버가 아니라 프론트에 남아 있는 캐시(복사본)를 보고 그리기 때문에, 복사본을 갱신하지 않으면 이전 값이 그대로 보임

```
[게시글 상세 화면]  PATCH /posts/10  { title: "새 제목" }
        │
        ▼
[서버 DB] title = "새 제목"  ✅ 바뀜

[query 캐시]
  ['posts', 10] → "이전 제목"   ❌ 그대로
  ['posts']     → 목록 안의 10번 글 "이전 제목"  ❌ 그대로

[게시글 목록 화면] → 캐시를 보고 "이전 제목" 표시
```

##### 원인 1. 수정 후 관련 캐시를 무효화하지 않았다

- mutation 성공 후 `invalidateQueries`나 `setQueryData`로 캐시를 갱신하지 않으면, 캐시는 이전 응답 그대로 남음

##### 원인 2. 같은 데이터가 여러 queryKey에 나뉘어 저장되어 있다

- 10번 게시글은 상세 캐시 `['posts', 10]`와 목록 캐시 `['posts']`, 검색 결과 `['posts', { keyword }]` 등 여러 곳에 들어 있을 수 있음
- 상세 캐시만 갱신하면 목록·검색 화면은 여전히 이전 값

##### 원인 3. staleTime 동안은 다시 요청하지 않는다

- `staleTime`을 길게 설정하면 그 시간 동안 데이터를 fresh로 간주해서, 화면을 다시 열어도 서버에 요청하지 않고 캐시를 그대로 사용함

##### 원인 4. 같은 데이터를 전역 store나 지역 상태에 복사해 두었다

- query 캐시를 갱신해도, store나 `useState`에 복사한 값은 따로 남아 있음

---

### Q. 변경한 데이터를 다시 조회하는 방식과 캐시를 직접 수정하는 방식은 각각 어떤 상황에 적절할까요?

#### Mutation

- 서버 데이터를 생성·수정·삭제하는 요청 (`POST`, `PUT`, `PATCH`, `DELETE`)
- TanStack Query에서는 `useMutation`으로 처리
- mutation이 성공해도 query 캐시는 자동으로 바뀌지 않음 → 둘 중 한 가지 방식으로 갱신해야 함

#### 다시 조회하는 방식 (Invalidate & Refetch)

- 캐시를 무효화해서, 그 데이터를 사용하는 화면이 서버에 다시 요청하게 만드는 방식
- TanStack Query: `queryClient.invalidateQueries()`

#### 캐시를 직접 수정하는 방식 (Manual Cache Update)

- 서버에 다시 요청하지 않고, 프론트에서 캐시 데이터를 직접 바꾸는 방식
- TanStack Query: `queryClient.setQueryData()`
- 언제 수정하느냐에 따라 두 가지로 나뉨
  - 응답 기반 업데이트: mutation 응답(서버가 돌려준 최신 데이터)으로 캐시를 교체
  - 낙관적 업데이트 (Optimistic Update): 서버 응답을 기다리기 전에 성공할 것이라 가정하고 캐시를 먼저 바꾸고, 실패하면 되돌림

#### 두 방식 비교

| 구분 | 다시 조회 (invalidate) | 캐시 직접 수정 (setQueryData) |
| --- | --- | --- |
| 정확성 | 서버의 최신 값을 그대로 받아서 항상 정확 | 프론트가 계산한 값이라 서버와 어긋날 수 있음 |
| 추가 요청 | 있음 (조회 요청 1회 이상) | 없음 |
| 화면 반영 속도 | 재요청이 끝난 뒤 반영 | 즉시 반영 |
| 구현 난이도 | 쉬움 (키만 지정) | 어려움 (캐시 구조를 알고 정확히 바꿔야 함) |
| 영향받는 캐시가 많을 때 | 상위 키로 한 번에 처리 | 캐시마다 각각 수정해야 함 |
| 서버가 계산하는 값 | 자동 반영 | 직접 계산해야 하거나 반영 불가 |

#### 다시 조회하는 방식이 적절한 상황

##### 상황 1. 서버가 추가로 계산·변경하는 값이 있을 때

- 수정 결과로 서버에서 바뀌는 값이 있으면 프론트가 정확히 예측하기 어려움
- 예: `updatedAt`, 정렬 순서, 순위, 총 개수, 평균 별점, 서버에서 생성한 id

##### 상황 2. 하나의 변경이 여러 데이터에 영향을 줄 때

- 예: 게시글 삭제 → 목록, 내 게시글 수, 페이지네이션, 검색 결과가 모두 바뀜
- 각 캐시를 직접 고치기보다 관련 키를 무효화하는 것이 간단하고 안전함

##### 상황 3. 목록에 필터·정렬·페이지가 있을 때

- 새 글이 몇 페이지 어느 위치에 들어가야 하는지, 현재 필터 조건에 맞는지 프론트가 판단하기 어려움

##### 상황 4. 정확성이 중요하고 약간의 지연은 괜찮을 때

- 예: 결제·주문 상태, 포인트 잔액, 재고 수량, 권한 변경

##### 상황 5. 응답이 작고 요청 비용이 크지 않을 때

- 다시 조회해도 부담이 적다면 **단순하고 정확한 방식**을 우선 선택

```ts
const queryClient = useQueryClient();

const { mutate: deletePost } = useMutation({
  mutationFn: (postId: number) => api.delete(`posts/${postId}`),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['posts'] });       // 목록·상세 등 전부
    queryClient.invalidateQueries({ queryKey: ['users', 'me'] }); // 내 게시글 수
  },
});
```

#### 캐시를 직접 수정하는 방식이 적절한 상황

##### 상황 1. mutation 응답에 수정된 전체 데이터가 들어 있을 때 (응답 기반 업데이트)

- 서버가 수정된 리소스를 응답으로 돌려주면, 그 값으로 캐시를 교체하면 정확하면서도 추가 요청이 없음
- 예: 프로필 수정 후 응답으로 최신 회원 정보를 받는 경우

```ts
const { mutate: updateProfile } = useMutation({
  mutationFn: patchProfile,                       // 응답: 수정된 회원 정보 전체
  onSuccess: (updatedUser) => {
    queryClient.setQueryData(['users', 'me'], updatedUser);
  },
});
```

##### 상황 2. 즉각적인 반응이 중요한 작은 상호작용일 때 (낙관적 업데이트)

- 좋아요, 북마크, 체크박스 토글, 할 일 완료 표시처럼 사용자가 자주 누르고 결과가 단순한 동작
- 서버 응답을 기다리면 클릭 후 반응이 늦게 느껴짐
- 실패 가능성이 낮고, 실패해도 되돌리기 쉬운 경우에 적합

```ts
const { mutate: toggleLike } = useMutation({
  mutationFn: (postId: number) => api.post(`posts/${postId}/like`),

  onMutate: async (postId) => {
    // ① 진행 중인 조회가 응답으로 덮어쓰지 않도록 취소
    await queryClient.cancelQueries({ queryKey: ['posts', 'detail', postId] });

    // ② 실패 시 되돌릴 이전 값 저장
    const previous = queryClient.getQueryData<Post>(['posts', 'detail', postId]);

    // ③ 캐시를 먼저 수정 → 화면 즉시 반영
    queryClient.setQueryData<Post>(['posts', 'detail', postId], (old) =>
      old && {
        ...old,
        isLiked: !old.isLiked,
        likeCount: old.likeCount + (old.isLiked ? -1 : 1),
      },
    );

    return { previous };
  },

  onError: (_error, postId, context) => {
    // ④ 실패하면 이전 값으로 되돌림
    queryClient.setQueryData(['posts', 'detail', postId], context?.previous);
  },

  onSettled: (_data, _error, postId) => {
    // ⑤ 성공·실패와 관계없이 서버 값과 최종 동기화
    queryClient.invalidateQueries({ queryKey: ['posts', 'detail', postId] });
  },
});
```

##### 상황 3. 다시 조회하는 비용이 클 때

- 수천 개 항목이 있는 목록, 무한 스크롤로 여러 페이지를 불러온 상태처럼 다시 받으면 무겁거나 스크롤 위치가 흔들리는 경우
- 바뀐 항목 하나만 캐시에서 찾아 수정

```ts
// 목록 캐시에서 수정된 항목만 교체
queryClient.setQueryData<Post[]>(['posts'], (old) =>
  old?.map((post) => (post.id === updated.id ? updated : post)),
);
```

##### 상황 4. 서버 응답 없이도 결과를 정확히 알 수 있을 때

- 예: 내가 입력한 메모 내용 수정, 알림 읽음 처리처럼 바뀌는 값이 프론트가 보낸 값 그대로인 경우

#### 두 방식 함께 사용하기

| 단계 | 방식 | 목적 |
| --- | --- | --- |
| 요청 직후 | 캐시 직접 수정 (낙관적 업데이트) | 빠른 화면 반응 |
| 응답 후 | 응답 데이터로 해당 캐시 교체 | 정확한 값으로 맞춤 |
| 마지막 | 관련된 다른 캐시 무효화 | 목록·개수 등 연관 데이터까지 최신화 |

```ts
onSuccess: (updatedPost) => {
  queryClient.setQueryData(['posts', 'detail', updatedPost.id], updatedPost);  // 상세: 직접 교체
  queryClient.invalidateQueries({ queryKey: ['posts', 'list'] });               // 목록: 다시 조회
},
```

#### 선택 기준

| 질문 | 예 → | 아니오 → |
| --- | --- | --- |
| 서버가 추가로 계산하는 값이 있는가? | 다시 조회 | 직접 수정 가능 |
| 영향받는 캐시가 여러 개인가? | 다시 조회 | 직접 수정 가능 |
| mutation 응답에 최신 데이터 전체가 있는가? | 응답으로 직접 수정 | 다시 조회 |
| 즉각적인 반응이 중요하고 실패 시 되돌리기 쉬운가? | 낙관적 업데이트 | 다시 조회 |
| 다시 조회하는 비용이 큰가? | 직접 수정 | 다시 조회 |

- 판단이 어려우면 **다시 조회(invalidate)를 기본**으로 사용하고, 반응 속도나 요청 비용이 문제가 되는 곳에만 직접 수정을 적용