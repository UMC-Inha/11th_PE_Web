- 필수 미션
    
    ![이미지](./images/chap9(1).png)
    
    기존 Vite 프로젝트인 umcine은 유지하고, 같은 위치에 umcine-next 폴더를 만들어 Next.js로 마이그레이션했다. 기존 컴포넌트, API 함수, hooks, stores를 재사용하고, 화면 컴포넌트는 src/screens에 배치했다. app 폴더에는 주소별 page.tsx와 공통 layout.tsx를 구성해 기존 화면을 연결했다.
    
    TanStack Router의 Link와 useNavigate는 Next.js의 Link와 useRouter로 변경했다. 링크 주소는 href로 지정하고, 로그인 성공 후에는 router.replace("/")로 이동하도록 수정했다. 영화 상세 페이지에서는 서버 컴포넌트가 주소의 movieId를 읽고 검증한 뒤 기존 상세 화면에 전달한다.
    
    **umcine-next/app/movies/[movieId]/page.tsx**
    
    ```tsx
    export default async function MovieRoute({ params }: MovieRouteProps) {
      const { movieId } = await params;
      const id = Number(movieId);
    
      if (!/^\d+$/.test(movieId) || !Number.isSafeInteger(id) || id < 1) {
        notFound();
      }
    
      return <MovieDetailPage movieId={id} />;
    }
    ```
    
    페이지의 라우팅과 공통 구조는 서버 컴포넌트로 구성하고, 상태 관리와 이벤트 처리가 필요한 화면에는 `"use client"`를 적용했다. localStorage는 서버에서 접근할 수 없으므로 window가 존재할 때만 사용하도록 처리했다.
    
    **umcine-next/src/stores/auth-store.ts의 persist 설정**
    
    ```tsx
    {
      name: "umcine-auth-store",
      storage:
        typeof window === "undefined"
          ? undefined
          : createJSONStorage(() => window.localStorage),
      partialize: (state) => ({ accessToken: state.accessToken }),
      skipHydration: true,
    }
    ```
    
    저장된 로그인 상태는 Providers의 useEffect에서 직접 복원하도록 구성했다. 복원이 끝나면 hasHydrated를 true로 변경하고, AuthGuard에서는 이 값과 accessToken을 함께 확인해 로그인 상태를 불러오기 전에 로그인 화면으로 이동하는 것을 방지했다.
    
    **umcine-next/app/providers.tsx의 useEffect** 
    
    ```tsx
    void Promise.resolve(useAuthStore.persist.rehydrate()).finally(() => {
      useAuthStore.getState().setHasHydrated(true);
    });
    ```
    
    TanStack Query와 Zustand는 그대로 사용했다. QueryClient는 Provider에서 useState로 생성해 재렌더링 시에도 같은 인스턴스를 유지하도록 했으며, 인증 토큰이 바뀌면 이전 사용자의 회원 정보·즐겨찾기·평점 캐시를 정리하도록 구성했다.
    
    환경 변수는 Vite의 import.meta.env 방식에서 Next.js의 process.env 방식으로 변경했다. 백엔드 요청은 /api 경로로 보내고, next.config.ts의 rewrites를 통해 백엔드 서버로 전달하도록 설정했다.
    
    **umcine-next/next.config.ts의 rewrites 설정**
    
    ```tsx
    async rewrites() {
      return [
        {
          source: "/api/:path*",
          destination: `${backendUrl}/:path*`,
        },
      ];
    }
    ```