- 필수 미션
    
    ## 1.정리
    
    - 기존 폴더(`umcine`)를 그 자리에서 직접 수정했다. 새 프로젝트로 옮기지 않았다.
    - `nextjs-example`의 설정(`next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `pnpm-workspace.yaml`)을 가져와 사용했다.
    
    ## 2. 프로젝트 설정 변경
    
    - Vite, `@tanstack/react-router`, `@tanstack/router-plugin`, `@vitejs/plugin-react`, `@tailwindcss/vite` 등을 제거했다.
    - `next`, `eslint-config-next`, `@tailwindcss/turbopack`을 `nextjs-example`과 같은 버전으로 추가했다.
    - `vite.config.ts`, `index.html`, `main.tsx`, `routeTree.gen.ts`, `tsconfig.app.json`, `tsconfig.node.json`은 삭제했다.
    - `index.html`의 `<html lang>`, 제목, 파비콘은 `app/layout.tsx`의 `metadata`로 옮겼다.
    
    ```tsx
    // next.config.ts
    import type { NextConfig } from "next";
    
    const nextConfig: NextConfig = {
      cacheComponents: true,
      partialPrefetching: true,
      turbopack: {
        rules: {
          "*.css": {
            loaders: ["@tailwindcss/turbopack"],
            as: "*.css",
          },
        },
      },
    };
    
    export default nextConfig;
    ```
    
    ## 3. 라우트 구조
    
    `src/app`의 파일 기반 라우팅으로 옮겼다. 각 `page.tsx`는 서버 컴포넌트이고, 기존 화면 컴포넌트를 불러와 렌더링한다.
    
    | 경로 | TanStack Router | Next.js |
    | --- | --- | --- |
    | 루트 레이아웃 | `routes/__root.tsx` | `app/layout.tsx` |
    | 404 | `notFoundComponent` | `app/not-found.tsx` |
    | `/` | `routes/index.tsx` | `app/page.tsx` |
    | `/login` | `routes/login.tsx` | `app/login/page.tsx` |
    | `/signup` | `routes/signup.tsx` | `app/signup/page.tsx` |
    | `/search` | `routes/search.tsx` | `app/search/page.tsx` |
    | `/movies/:movieId` | `routes/movies.$movieId.tsx` | `app/movies/[movieId]/page.tsx` |
    | `/mypage`, `/mypage/edit` | `(protected)/_authenticated/...` | `app/(protected)/mypage/...` |
    
    `src/pages`는 Next.js가 Pages Router로 인식하므로 `src/views`로 이름을 바꿨다(`git mv`).
    
    ```tsx
    // app/layout.tsx
    import type { Metadata } from "next";
    import Footer from "../components/layout/footer";
    import Header from "../components/layout/header";
    import "./globals.css";
    import { Providers } from "./providers";
    
    export const metadata: Metadata = {
      title: "umcine",
      icons: { icon: "/favicon.svg" },
    };
    
    export default function RootLayout({ children }: LayoutProps<"/">) {
      return (
        <html lang="ko">
          <body>
            <Providers>
              <div className="flex min-h-svh flex-col">
                <Header />
                {children}
                <Footer />
              </div>
            </Providers>
          </body>
        </html>
      );
    }
    ```
    
    ## 4. TanStack Router API를 Next.js API로 교체
    
    | 기존 | 변경 |
    | --- | --- |
    | `Link to="/x"` | `next/link`의 `Link href="/x"` |
    | `to="/movies/$movieId" params={...}` | `href={`/movies/${movie.id}`}` |
    | `useNavigate()` / `navigate({ to })` | `useRouter()` / `router.push()` |
    | `useParams({ from })` | 서버 `page.tsx`에서 `await params` 후 prop으로 전달 |
    | `useSearch`  • `validateSearch` | `useSearchParams().get("query")` |
    | `Link`의 `activeOptions`, `isActive` | `usePathname()`으로 직접 판단 |
    | `beforeLoad`  • `redirect` | `AuthGuard` 컴포넌트 (5번 참고) |
    | `declare module Register` | 불필요하여 삭제 |
    
    ### 영화 상세 페이지의 params
    
    ```tsx
    // app/movies/[movieId]/page.tsx
    import { MovieDetailPage } from "../../../views/movies/movie-detail-page";
    
    export default async function Page({ params }: PageProps<"/movies/[movieId]">) {
      const { movieId } = await params;
    
      return <MovieDetailPage movieId={movieId} />;
    }
    ```
    
    `cacheComponents` 환경에서 요청 시점에 알 수 있는 `params`를 읽으므로 `loading.tsx`를 함께 두었다. 빌드 결과도 `◐ /movies/[movieId]`(부분 사전 렌더링)로 나온다.
    
    ### 검색 페이지
    
    `useSearchParams`는 요청 시점 값이라 정적 셸을 막지 않도록 `Suspense`로 감쌌다.
    
    ```tsx
    // app/search/page.tsx
    import { Suspense } from "react";
    import { SearchPage } from "../../views/movies/search-page";
    
    export default function Page() {
      return (
        <Suspense>
          <SearchPage />
        </Suspense>
      );
    }
    ```
    
    ```tsx
    // views/movies/search-page.tsx (일부)
    const query = useSearchParams().get("query") ?? undefined;
    const router = useRouter();
    
    function handleSubmit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
      const nextQuery = searchText.trim();
      router.push(
        nextQuery ? `/search?query=${encodeURIComponent(nextQuery)}` : "/search",
      );
    }
    ```
    
    ### 헤더의 활성 링크
    
    ```tsx
    function NavLink({ to, exact, children }: { to: "/" | "/search" | "/mypage"; exact?: boolean; children: string }) {
      const pathname = usePathname();
      const isActive = exact
        ? pathname === to
        : pathname === to || pathname.startsWith(`${to}/`);
    
      return (
        <Link href={to} className="no-underline">
          <span className={cn("text-[15px] font-medium", isActive ? "font-bold text-gray-900 underline underline-offset-8" : "text-gray-400")}>
            {children}
          </span>
        </Link>
      );
    }
    ```
    
    `usePathname`도 요청 시점 값이므로 헤더의 `nav`를 `Suspense`로 감쌌다. 감싸지 않으면 빌드 중 `blocking-prerender-client-hook` 에러가 난다.
    
    ## 5. 서버 컴포넌트와 클라이언트 컴포넌트의 경계
    
    - 라우트 파일(`layout.tsx`, `page.tsx`, `loading.tsx`, `not-found.tsx`)은 서버 컴포넌트다.
    - 데이터를 `useQuery`로 불러오고 이벤트를 처리하는 `views`, `Header`, `Providers`, `AuthGuard`, `Pagination`, `BookmarkButton` 등은 `"use client"`를 붙인 클라이언트 컴포넌트다.
    - 화면 데이터를 서버에서 불러오는 구조로 바꾸지는 않았다. 기존 React Query 구조를 유지했다.
    
    ### Providers (QueryClient)
    
    요청마다 새 인스턴스가 만들어지지 않도록 `useState`로 한 번만 만든다.
    
    ```tsx
    "use client";
    
    export function Providers({ children }: { children: ReactNode }) {
      const [queryClient] = useState(
        () => new QueryClient({ defaultOptions: { queries: { staleTime: 1000 * 60, retry: 1 } } }),
      );
    
      // localStorage의 토큰은 브라우저에서만 복원할 수 있다.
      useEffect(() => {
        useAuthStore.persist.rehydrate();
      }, []);
    
      return (
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      );
    }
    ```
    
    ### 브라우저 API 처리
    
    - `localStorage`는 `auth-store.ts`에서만 사용한다. 서버에서는 읽지 않도록 `skipHydration: true`로 자동 복원을 끄고, 마운트된 뒤 `rehydrate()`를 호출한다.
    - `alert`는 모두 mutation 콜백이나 이벤트 핸들러 안에 있어 서버 렌더링 중에는 실행되지 않는다.
    - `atob`(JWT 해석)은 Node.js에도 있어 그대로 두었다.
    
    ```tsx
    // stores/auth-store.ts
    export const useAuthStore = create<AuthStore>()(
      persist(
        (set) => ({
          accessToken: null,
          setAccessToken: (accessToken) => set({ accessToken }),
        }),
        {
          name: "umcine-auth-store",
          storage: createJSONStorage(() => localStorage),
          partialize: (state) => ({ accessToken: state.accessToken }),
          skipHydration: true, // 서버 HTML과 첫 렌더링 결과를 맞춘다 (hydration mismatch 방지)
        },
      ),
    );
    
    // 복원이 끝났는지 여부 (서버에서는 항상 false)
    export function useAuthHydrated() {
      return useSyncExternalStore(
        (onStoreChange) => useAuthStore.persist.onFinishHydration(onStoreChange),
        () => useAuthStore.persist.hasHydrated(),
        () => false,
      );
    }
    ```
    
    ## 6. 로그인 가드
    
    기존에는 `beforeLoad`에서 토큰이 없으면 `redirect`했다. 토큰이 `localStorage`에 있어 서버가 알 수 없으므로, 브라우저에서 복원한 뒤 `AuthGuard`가 확인하도록 바꿨다.
    
    ```tsx
    "use client";
    
    export function AuthGuard({ requireAuth, children }: AuthGuardProps) {
      const router = useRouter();
      const hydrated = useAuthHydrated();
      const hasToken = useAuthStore((state) => state.accessToken !== null);
      const isAllowed = hasToken === requireAuth;
    
      useEffect(() => {
        if (hydrated && !isAllowed) {
          router.replace(requireAuth ? "/login" : "/");
        }
      }, [hydrated, isAllowed, requireAuth, router]);
    
      if (!hydrated || !isAllowed) return null;
    
      return children;
    }
    ```
    
    - `(protected)/layout.tsx`가 `<AuthGuard requireAuth>`로 하위 페이지(`/mypage`, `/mypage/edit`)를 감싼다. 기존 `_authenticated` 레이아웃 라우트의 역할이다.
    - `login/page.tsx`는 `<AuthGuard requireAuth={false}>`로 감싸 이미 로그인한 사용자를 홈으로 보낸다.
    - 복원이 끝나기 전에는 아무것도 그리지 않으므로, 새로고침하면 해당 화면이 잠깐 비어 있다가 나타난다.
    
    ## 7. 환경 변수
    
    `import.meta.env.VITE_*`를 `process.env.NEXT_PUBLIC_*`로 바꿨다. Next.js는 빌드 시점에 정적으로 치환하므로 `process.env.NEXT_PUBLIC_XXX` 형태로 직접 읽어야 한다.
    
    ```tsx
    // config/env.ts
    const tmdbApiBaseUrl = process.env.NEXT_PUBLIC_TMDB_API_BASE_URL;
    const tmdbAccessToken = process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN;
    
    if (!tmdbApiBaseUrl || !tmdbAccessToken) {
      throw new Error("TMDB 환경 변수가 필요하다.");
    }
    
    export const env = {
      tmdbApiBaseUrl,
      tmdbAccessToken,
      apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "",
    };
    ```
    
    `NEXT_PUBLIC_` 변수는 브라우저 번들에 포함된다. TMDB 토큰도 Vite 때부터 브라우저에 노출되던 값이라 동작은 같다.
    
    ## 8. 빌드 결과
    
    ```
    Route (app)
    ┌ ○ /
    ├ ○ /_not-found
    ├ ○ /login
    ├   /movies/[movieId]
    │ └ ◐ /movies/[movieId]
    ├ ○ /mypage
    ├ ○ /mypage/edit
    ├ ○ /search
    └ ○ /signup
    ```
    
    - `○` 정적 페이지는 빌드 때 미리 만들어진다.
    - `◐` 부분 사전 렌더링은 정적 셸을 미리 만들고, `params`를 읽는 부분은 요청 시 준비한다.