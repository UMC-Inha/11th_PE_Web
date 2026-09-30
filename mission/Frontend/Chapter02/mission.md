- 필수 미션

  **UMCine 영화 목록 화면**

    - Figma의 `영화 목록` 데스크톱 프레임 기준으로 구현
    - 흰색 헤더, 5열 × 2행 영화 카드, 포스터 위 북마크 버튼, TMDB 안내 푸터 구성
    - 제공된 포스터·아이콘, `src/data/movies.ts` 더미 데이터 사용 → 영화 10편 목록 렌더링

  **컴포넌트 분리**

    - `src/components/header.tsx`
        - 헤더, 메뉴
    - `src/components/movie-grid.tsx`
        - 영화 목록 순회, 카드 배치
    - `src/components/movie-card.tsx`
        - 포스터, 제목, 개별 북마크 버튼
    - `src/components/pagination.tsx`
        - 페이지네이션 UI
    - `src/types/movie.ts`, `src/data/movies.ts`
        - 영화 타입, 더미 데이터

  **북마크 상태 관리**

    - `App`에서 영화 배열을 state로 관리하고, `MovieGrid` → `MovieCard` 순서로 props 전달
    - 북마크 클릭 시 `map`으로 새 배열 생성
    - 클릭한 영화의 `isBookmarked`만 반전 → 선택한 카드의 아이콘만 변경

    ```tsx
    const [movieList, setMovieList] = useState<Movie[]>(movies);
    
    function handleBookmarkToggle(movieId: number) {
      setMovieList((currentMovies) =>
        currentMovies.map((movie) =>
          movie.id === movieId
            ? { ...movie, isBookmarked: !movie.isBookmarked }
            : movie,
        ),
      );
    }
    ```

  ⇒ 배열이나 영화 객체를 직접 수정하지 않고, 새 객체를 만들어 state 업데이트

  **최종 확인**

    - 첫 번째 영화 북마크 클릭
        - `추가 → 해제`로 상태, 아이콘 변경 확인
    - Figma와 비교
        - 헤더, 5열 영화 그리드, 북마크 위치, 하단 TMDB 표기 확인
    - Console 오류 0건
    - `pnpm lint`, `pnpm build` 성공