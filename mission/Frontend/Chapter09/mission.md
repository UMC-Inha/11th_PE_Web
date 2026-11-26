- 필수 미션

  **기존 UMCine에 Next.js 적용**

    - Next.js 16.4.6 설치 후 `next.config.ts`와 TypeScript 설정 연결. Tailwind는 Turbopack loader로 처리.
    - 개발·운영 서버 포트를 기존 백엔드 허용 주소와 같은 5173으로 유지.

    ```json
    "scripts": {
      "dev": "next dev -p 5173",
      "build": "next build",
      "start": "next start -p 5173",
      "lint": "eslint ."
    }
    ```

    - 기존 화면 컴포넌트는 `src/screens`로 이동하고, `src/app`에서 Next.js 경로에 연결. Next.js가 특별하게 인식하는 `pages` 폴더와 역할 분리.
    - 영화 목록·검색·상세·로그인·회원가입·내 정보·수정 경로 구성. 상세는 `movies/[movieId]/page.tsx`, 로그인 전용 화면은 `(authenticated)` 그룹 아래 배치.

  **화면 재사용과 Next.js 라우팅 연결**

    - 경로 파일과 루트 레이아웃은 Server Component로 두고, 상태·이벤트·조회 훅을 사용하는 화면은 `"use client";`로 지정.
    - 헤더·푸터를 공통 레이아웃에 연결하고, QueryClientProvider는 별도 Client Component로 분리. 기존 영화·즐겨찾기·평점 API와 캐시 로직 재사용.
    - 링크는 `next/link`의 `href`로 교체. 동적 영화 ID는 `useParams`, 검색어는 `useSearchParams`로 읽고 `router.push`로 URL 변경.

    ```tsx
    const { movieId } = useParams<{ movieId: string }>();
    const parsedMovieId = Number(movieId);
    ```

    ```tsx
    function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
      event.preventDefault();
    
      const nextQuery = searchText.trim();
    
      router.push(
        nextQuery ? `/search?query=${encodeURIComponent(nextQuery)}` : "/search",
      );
    }
    ```

    - 검색어 인코딩, 뒤로 가기 시 입력값 동기화, 로그인·회원가입 성공 후 `router.replace` 이동 연결.
    - 상세·검색 페이지는 `loading.tsx`로 Suspense 경계 제공. 경로를 읽는 공통 헤더도 Suspense로 감싸 구성.
    - 환경변수는 `import.meta.env`에서 `process.env.NEXT_PUBLIC_...`로 변경하고 기존 요청 함수에 연결.

  **토큰 복원 후 로그인 전용 화면 표시**

    - Zustand persist의 `skipHydration: true` 설정 후, Provider의 `useEffect`에서 저장된 토큰 복원.

    ```tsx
    useEffect(() => {
      void useAuthStore.persist.rehydrate();
    }, []);
    ```

    - 공통 로그인 레이아웃에서 복원 상태를 구독. 처음 토큰이 `null`인 것과 복원 후 토큰이 없는 상태를 구분하고, 복원이 끝난 뒤에만 리다이렉트 판단.

    ```tsx
    const hasHydrated = useSyncExternalStore(
      subscribeToHydration,
      () => useAuthStore.persist.hasHydrated(),
      () => false,
    );
    
    useEffect(() => {
      if (hasHydrated && !accessToken) {
        router.replace("/login");
      }
    }, [hasHydrated, accessToken, router]);
    ```

    - 복원 중에는 확인 문구, 토큰이 있으면 하위 화면 표시. 실제 API 인증은 기존 백엔드에서 처리.

  **확인 결과**

    - 영화 목록·상세·검색·로그인·회원가입의 브라우저 동작 확인.
    - 마이페이지·수정 경로, 로그인 검사와 즐겨찾기 카드의 상세 링크를 코드로 확인.
    - TypeScript 검사와 `pnpm build` 성공. 빌드 결과에서 주요 7개 경로 확인.
    - 상세 경로는 `◐ /movies/[movieId]`로 부분 사전 렌더링, 나머지 주요 경로는 `○`로 정적 사전 렌더링 표시.