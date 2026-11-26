1. **라우팅을 Next.js App Router로 옮겼다.** 영화 목록·검색·상세와 로그인·회원가입·프로필을 `app/` 아래의 `page.tsx`로 연결했다. 기존 `Link`와 이동 함수는 `next/link`와 `useRouter()`로 바꾸고, 영화 상세의 ID는 서버 페이지에서 `params`로 읽어 화면에 전달했다. Next.js 공식 마이그레이션 가이드
    
    ```tsx
    async function Movie({ params }: { params: Promise<{ movieId: string }> }) {
      const { movieId } = await params;
      return <MovieDetailPage movieId={movieId} />;
    }
    ```
    
2. **라이브러리와 환경 변수 설정을 맞췄다.** Tailwind는 기존 Next.js 예제의 Turbopack 설정으로 연결했고, TanStack Query는 공통 `Providers`에 연결했다. 이전 예제 경로가 남은 자동 생성 타입을 정리해 빌드 오류를 해결했다. 영화 데이터 요청은 `/api/tmdb`를 거치도록 바꿔 TMDB 토큰을 서버에서만 사용하게 했다.
3. **Server Component와 Client Component의 경계를 나눴다.** 공통 레이아웃과 라우트 진입점은 서버에 두고, 폼·상태 관리·이벤트 처리가 필요한 화면은 Client Component로 분리했다. Zustand에 `skipHydration: true`를 설정하고, 브라우저에서 마운트된 뒤 로그인과 북마크 상태를 복원했다.
    
    ```tsx
    useEffect(() => {
      void useAuthStore.persist.rehydrate();
      void useBookmarkStore.persist.rehydrate();
    }, []);
    ```
    

`pnpm lint`와 `pnpm build`를 통과했고, 주요 URL에 직접 접속할 수 있는지와 TMDB 목록·검색·상세 API가 정상 응답하는지 확인했다.