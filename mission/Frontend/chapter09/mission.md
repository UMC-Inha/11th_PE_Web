# UMCine: TanStack Router → Next.js 마이그레이션

Vite + TanStack Router로 만든 `umcine`을 Next.js 16 App Router 프로젝트 `umcine-next/umcine`으로 옮겼습니다.
원본은 수정하지 않고 새 프로젝트로 복사해 옮겼고, 라우터 교체가 끝난 뒤 기능 버그 수정과 평점 기능을 추가했습니다.

---

## 1. 마이그레이션 방식

### 1-1. 진행 순서

1. `nextjs-example`에서 만든 Next.js 설정(`package.json`, `tsconfig.json`, `next.config.ts`)을 가져와 새 프로젝트 생성
2. 기존 `src/`, `public/` 복사, Vite·TanStack 전용 파일 삭제
3. `src/routes/*` 파일 기반 라우트를 `src/app/**/page.tsx` 구조로 변경
4. TanStack Router 전용 API를 Next.js API로 교체
5. Next.js에서 오류가 나는 라이브러리 설정 수정 (env, QueryClient, zustand persist, Tailwind)
6. Server / Client Component 경계 분리, 브라우저 API가 서버에서 실행되지 않게 처리
7. `pnpm typecheck` → `pnpm build` → `pnpm start` 후 모든 경로 응답 확인

### 1-2. 가져온 설정 (`next.config.ts`)

예제의 `cacheComponents`, `partialPrefetching`, Tailwind turbopack 로더를 그대로 사용

```ts
const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "image.tmdb.org" }],
  },
};
```

- `tsconfig.json`: 예제 그대로 쓰고 `"@/*": ["./src/*"]`만 변경
- `.env.local`: 변수 이름 `VITE_*` → `NEXT_PUBLIC_*`

### 1-3. 폴더 구조

```
umcine-next/umcine/src/
├─ app/
│  ├─ layout.tsx            ← index.html + __root.tsx + main.tsx
│  ├─ providers.tsx         ← QueryClientProvider, 로그인 정보 rehydrate
│  ├─ not-found.tsx
│  ├─ page.tsx              → /
│  ├─ search/page.tsx       → /search?query=
│  ├─ movies/[movieId]/page.tsx → /movies/:id
│  ├─ login/page.tsx, signup/page.tsx
│  └─ (auth)/               ← routes/_auth.tsx (URL에 안 나타나는 그룹)
│     ├─ layout.tsx         ← 로그인 가드
│     └─ me/page.tsx, me/edit/page.tsx
├─ views/                   ← 기존 pages/ (Next가 src/pages를 Pages Router로 인식해서 이름 변경)
├─ components/  hooks/  api/  stores/  utils/  types/  config/
```

| 기존 (TanStack)                  | 변경 (Next.js)                                                       |
| -------------------------------- | -------------------------------------------------------------------- |
| `routes/__root.tsx` + `main.tsx` | `app/layout.tsx` + `app/providers.tsx`                               |
| `routes/movies.$movieId.tsx`     | `app/movies/[movieId]/page.tsx`                                      |
| `routes/_auth.tsx`               | `app/(auth)/layout.tsx`                                              |
| `routes/_auth/me_.edit.tsx`      | `app/(auth)/me/edit/page.tsx` (`me`에 layout이 없으면 중첩되지 않음) |

삭제한 파일: `routes/`, `routeTree.gen.ts`, `main.tsx`, `vite.config.ts`, `index.html`, `utils/auth/require-auth.ts`, Vite 템플릿 잔여물(`App.tsx`, `App.css`, `assets/`)

---

## 2. 주요 코드

### 2-1. 동적 경로: `params`를 Suspense 안에서 읽기

`cacheComponents`에서는 요청 시점에만 알 수 있는 값(`params`, `searchParams`)을 `<Suspense>` 안에서 읽어야 빌드가 됩니다.
서버에서 꺼낸 값을 Client Component에 props로 넘기는 방식으로 `useParams`를 대체했습니다.

```tsx
// app/movies/[movieId]/page.tsx (Server Component)
export default function Page({ params }: MovieDetailRouteProps) {
  return (
    <Suspense fallback={<main>영화 정보를 불러오는 중이에요.</main>}>
      <MovieDetailRoute params={params} />
    </Suspense>
  );
}

async function MovieDetailRoute({ params }: MovieDetailRouteProps) {
  const { movieId } = await params;
  return <MovieDetailPage movieId={Number(movieId)} />;
}
```

`/search`도 같은 방식으로 `searchParams`를 읽고, `validateSearch`가 하던 검사(문자열일 때만 사용)를 서버에서 처리합니다.

```tsx
async function SearchRoute({ searchParams }: SearchRouteProps) {
  const { query } = await searchParams;
  return <SearchPage query={typeof query === "string" ? query : undefined} />;
}
```

### 2-2. Header: Server / Client 분리

로고와 검색 버튼은 Server Component에 두고, 현재 주소가 필요한 메뉴와 로그인 상태가 필요한 메뉴만 Client Component로 분리했습니다.
`usePathname`도 동적 경로에서는 suspend되기 때문에 `<Suspense>`로 감쌌습니다.

```tsx
// components/layout/header.tsx (Server Component)
<Suspense fallback={<HeaderNavLinks pathname={null} />}>
  <HeaderNav />          {/* "use client": usePathname */}
</Suspense>
...
<HeaderAuthMenu />       {/* "use client": 로그인 상태, 로그아웃 */}
```

### 2-3. zustand persist와 hydration

서버에는 `localStorage`가 없어서 서버 HTML은 항상 로그아웃 상태로 그려집니다.
저장된 토큰을 바로 읽으면 첫 클라이언트 렌더링이 서버 결과와 달라져 hydration 오류가 나기 때문에, 마운트된 뒤에 직접 불러오도록 했습니다.

```ts
// stores/auth-store.ts
persist(..., {
  name: "umcine-auth-store",
  storage: createJSONStorage(() => localStorage),
  skipHydration: true,
  onRehydrateStorage: () => () => {
    useAuthStore.setState({ hasHydrated: true });
  },
})
```

```tsx
// app/providers.tsx ("use client")
const [queryClient] = useState(() => new QueryClient({ ... })); // 요청끼리 캐시 공유 방지

useEffect(() => {
  useAuthStore.persist.rehydrate(); // useEffect는 브라우저에서만 실행됨
}, []);
```

### 2-4. 로그인 가드 (`beforeLoad` 대체)

토큰이 `localStorage`에 있어서 서버(`proxy.ts`)에서는 로그인 여부를 알 수 없습니다. 그래서 클라이언트에서 확인합니다.
`hasHydrated`를 기다리지 않으면 로그인 상태에서 새로고침해도 로그인 페이지로 이동하는 문제가 생깁니다.

```tsx
// components/auth/require-auth.tsx ("use client")
useEffect(() => {
  if (!hasHydrated) return; // localStorage를 다 읽기 전에는 판단하지 않음
  if (accessToken) {
    wasLoggedIn.current = true;
    return;
  }
  if (hasRedirected.current) return; // StrictMode에서 alert 두 번 방지
  hasRedirected.current = true;

  if (wasLoggedIn.current) {
    router.replace("/");
    return;
  } // 로그아웃
  alert("로그인이 필요해요.");
  router.replace("/login");
}, [hasHydrated, accessToken, router]);
```

### 2-5. 환경 변수

```ts
// config/env.ts
tmdbApiBaseUrl: process.env.NEXT_PUBLIC_TMDB_API_BASE_URL, // 기존 import.meta.env.VITE_...
```

`NEXT_PUBLIC_` 값은 빌드할 때 문자열로 치환되기 때문에, `process.env.이름`을 하나씩 직접 써야 함

### 2-6. Server / Client Component 정리

| 구분   | 파일                                                                                                                                                                        |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Server | `app/layout.tsx`, `app/**/page.tsx`, `app/(auth)/layout.tsx`, `header.tsx`, `footer.tsx`, `movie-grid.tsx`                                                                  |
| Client | `providers.tsx`, `header-nav.tsx`, `header-auth-menu.tsx`, `require-auth.tsx`, `guest-only.tsx`, `movie-card.tsx`, `bookmark-button.tsx`, `favorite-rating.tsx`, `views/**` |

브라우저 API를 쓰는 코드는 모두 서버에서 실행되지 않는 위치로 옮겼습니다.

- `localStorage`: `useEffect` 안의 `rehydrate()`에서만 읽기
- `alert`, `confirm`: 이벤트 핸들러, mutation 콜백, `useEffect` 안에서만 호출
- `URL.createObjectURL`: 파일 선택 핸들러 안에서만 호출

---

## 3. 마이그레이션 중 수정한 오류

| 위치              | 문제                                                    | 수정                              |
| ----------------- | ------------------------------------------------------- | --------------------------------- |
| `config/env.ts`   | `import.meta.env`는 Vite 전용                           | `process.env.NEXT_PUBLIC_*`       |
| `api/auth-api.ts` | `setAccessToken(null)` 타입 오류, apiClient와 hook 중복 | `apiClient.extend({})`            |
| `signup-page.tsx` | 쓰지 않는 `useNavigate` import                          | 제거                              |
| `QueryClient`     | 모듈 최상단 생성 시 서버에서 요청끼리 캐시 공유         | `useState`로 컴포넌트 안에서 생성 |
| zustand persist   | 서버와 첫 렌더링 결과가 달라 hydration 오류             | `skipHydration` + `rehydrate()`   |
| Tailwind          | `@tailwindcss/vite`는 Next에서 동작 안 함               | `@tailwindcss/turbopack` 로더     |

---

## 4. 마이그레이션 이후 작업

### 4-1. 중복 확인이 항상 "이미 사용 중"으로 나오던 버그

백엔드는 `{ isSuccess, code, message, result: { available } }`로 응답하는데, 코드는 `response.available`을 바로 읽고 있었습니다.
그래서 값이 항상 `undefined`였고, 회원가입 버튼이 활성화되지 않았습니다.
다른 API처럼 `unwrapResponse`로 `result`를 꺼내도록 고쳤습니다.

```ts
// api/members/check-email-duplicate.ts (닉네임도 동일)
return apiClient
  .get(`members/email/${encodeURIComponent(email)}`)
  .json<CheckEmailDuplicateResponse | { result: CheckEmailDuplicateResponse }>()
  .then(unwrapResponse);
```

내 정보 수정 화면은 중복 확인 없이도 저장이 되고 있어서 저장 조건도 함께 고쳤습니다.

```ts
const canSubmit =
  isNicknameValid && isNicknameChanged && duplicateCheck.isAvailable;
```

### 4-2. 내 정보: 즐겨찾기 영화에 내 평점 표시, 등록·수정·삭제

- 즐겨찾기 카드마다 내 평점(별점, 한줄평)을 보여주고 수정·삭제 가능
- 평점이 없는 영화는 "평점 남기기"로 바로 등록 가능

평점 목록 API(`GET /members/{memberId}/ratings`)는 회원 id가 필요한데, 로그인·내 정보 응답에는 id가 없습니다.
id가 토큰(JWT)의 `sub`에만 들어 있어서 토큰에서 꺼내 사용했습니다.

```ts
// utils/auth/get-member-id-from-token.ts
export function getMemberIdFromToken(token: string | null): number | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const memberId = Number(JSON.parse(json).sub);
    return Number.isInteger(memberId) && memberId > 0 ? memberId : null;
  } catch {
    return null;
  }
}
```

```tsx
// views/members/my-page.tsx
const { memberId, ratingsQuery } = useMyRatingsQuery();
const ratingByMovieId = new Map(
  (ratingsQuery.data ?? []).map((rating) => [rating.movieId, rating]),
);

<MovieGrid movies={movies} renderExtra={renderMyRating} />;
```

- `MovieGrid`에 카드 아래 내용을 넣을 수 있는 `renderExtra` prop 추가 (영화 목록 화면은 영향 없음)
- 상세 페이지에서 평점을 등록하면 내 정보의 평점 목록도 바로 새로 불러오도록 캐시 무효화 추가

---

## 5. 검증

- `pnpm typecheck` (next typegen + tsc): 오류 없음
- `pnpm build`: 성공, 9개 경로 prerender (`/movies/[movieId]`, `/search`는 Partial Prerender)
- `pnpm start` 후 요청: `/`, `/search`, `/search?query=spider`, `/movies/550`, `/login`, `/signup`, `/me`, `/me/edit` → 200, 없는 주소 → 404
- 백엔드 API 직접 호출로 응답 형태 확인 (중복 확인, 평점 목록·등록·수정·삭제)
- 브라우저에서 화면을 직접 클릭하는 테스트는 따로 진행해야 함
