# Frontend Chapter09

## 필수 미션

### 1. 라우트 매핑

- `__root.tsx` → `app/layout.tsx`, `providers.tsx`, `not-found.tsx`
- `index.tsx` → `app/page.tsx`
- `login.tsx`, `signup.tsx` → `app/login/page.tsx`, `app/signup/page.tsx`
- `search.tsx` → `app/search/page.tsx`
- `movies.$movieId.tsx` → `app/movies/[movieId]/page.tsx`
- `_auth.tsx` + `_auth/me.*` → `app/(auth)/me/layout.tsx`, `page.tsx`, `edit/`, `ratings/`
- `main.tsx`, `routeTree.gen.ts`, `RouterProvider` → 가져오지 않음 (`app/` 폴더 구조가 라우터 역할)

### 2. API 변경

- `Link to / params` → `next/link`의 `Link href` (``/movies/${id}``)
- `activeProps` (Header 탭) → `usePathname()`으로 현재 경로와 비교
- `useNavigate` → `useRouter()`의 `push`
- `useParams` → 서버 `page.tsx`에서 `await params` 후 prop으로 전달
- `useSearch` + `validateSearch` → `useSearchParams()` + `<Suspense>`
- `beforeLoad`의 `redirect` → `AuthGuard`, `GuestGuard` (클라이언트에서 `router.replace`)
- `notFoundComponent` → `app/not-found.tsx`

### 3. 서버/클라이언트 구분

기본은 Server Component로 두고, 클릭이나 상태처럼 상호작용이 필요한 부분만 `"use client"`를 붙였음. `page.tsx`는 서버에 두고 클라이언트 부분은 `app/components/`로 뺌.

```
app/
├─ layout.tsx, page.tsx, login/, signup/, search/, movies/[movieId]/, (auth)/me/…  ← Server
├─ providers.tsx                         ← Client (QueryClient, 스토어 복원, Devtools)
└─ components/
   ├─ auth/    login-form, signup-form, auth-guard, guest-guard
   ├─ movies/  movie-list, movie-search, movie-detail, movie-card, movie-grid, pagination, movie-rating-section
   ├─ me/      my-info-content, my-info-edit, my-ratings, profile-avatar
   ├─ layout/  header, footer
   └─ bookmark-button
```

- `/login`, `/signup`, `/me`: 제목, 링크 같은 정적인 부분은 서버, 폼과 데이터 부분만 클라이언트
- 홈, 검색, 상세, 내 평점, 정보 수정: 화면 전체가 `useQuery`와 상태를 쓰기 때문에 통째로 클라이언트
- 처음에 `pages/` 폴더에 두었던 코드는 위 구조로 합쳐서 `views/` 폴더 없이 정리

### 4. 브라우저 API 처리

- `localStorage` (zustand persist 스토어 3개)
    - 서버에는 `localStorage`가 없어서 `skipHydration: true`로 자동 복원을 끔
    - 화면이 뜬 뒤 `useEffect`에서 `rehydrate()`로 값을 복원
    - 첫 렌더가 서버 HTML과 같아져서 hydration 오류가 없음
- 인증 가드
    - 복원 전에는 토큰이 항상 `null`이라 로그인 상태여도 `/login`으로 튕김
    - `useAuthHydrated()`로 복원이 끝난 뒤에만 판단
- `QueryClient`
    - 모듈 전역이 아니라 `useState`로 생성
    - 서버에서 요청 간에 캐시가 공유되는 것을 방지
- `window.confirm`, `canvas`
    - 이벤트 핸들러 안에서만 호출되므로 서버에서 실행되지 않음
    - 코드 변경 없이 그대로 사용

### 고친 것

- TanStack Router만 제거했고, TanStack Query는 라우팅과 무관해서 그대로 사용
- `import.meta.env.VITE_*`는 Next에서 동작하지 않아서 `process.env.NEXT_PUBLIC_*`로 변경 (`.env.local`은 변수명만 변경, 값은 그대로)
- `usePathname()`(Header), `await params`(상세), `useSearchParams()`(검색)가 Cache Components에서 prerender 에러가 나서 각각 `<Suspense>` 안으로 이동
- import 경로를 `@/` 별칭으로 정리

### 남은 것

- 백엔드를 켠 상태에서 로그인, 찜, 평점, 프로필 수정 확인
- 이미지는 `<img>` 유지 (`next/image` 미적용)
- `next/font` 미적용
