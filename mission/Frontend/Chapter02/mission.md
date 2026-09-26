- 필수 미션
    
    ## 컴포넌트 구조
    
    ```
    src/
    ├─ components/
    │   ├─ layout/
    │   │   ├─ header.tsx   // 로고, 네비게이션, 검색/로그인 버튼
    │   │   └─ footer.tsx   // TMDB 저작권 표기
    │   └─ movies/
    │       ├─ movie-card.tsx    // 포스터, 북마크 버튼, 제목/개봉일
    │       ├─ movie-grid.tsx    // MovieCard 목록 렌더링
    │       └─ pagination.tsx    // 페이지 이동 UI (분리만, 현재는 1페이지)
    ├─ data/movies.ts   // 영화 10편 더미 데이터
    ├─ types/movie.ts   // Movie 타입 정의
    ├─ utils/cn.ts       // className 조건부 결합 유틸
    └─ App.tsx           // movies state 보유, 하위로 props 전달
    ```
    
    ## 검증한 항목
    
    - Figma에서 공유받은 스크린샷과 브라우저 렌더링 결과를 비교해 헤더 · 타이틀 · 5열 그리드 · 북마크 배지 색상이 유사한지 확인
    - 서로 다른 카드의 북마크 버튼을 각각 클릭해 **선택한 카드만** 상태가 바뀌고 나머지는 그대로인지 확인
    - 브라우저 Console에 오류/경고 없음 확인
    - `pnpm build` 타입 오류 없이 통과 확인
    
    ## 결과 화면
    
    !image.png