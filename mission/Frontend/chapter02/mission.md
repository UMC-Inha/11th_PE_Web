isBookmarked props 를 사용해 사용자가 북마크를 클릭했을 때 북마크 상태 변경 함수를 실행하는 이벤트 핸들러. 선택한 영화의 북마크 상태와 아이콘 변경됨을 확인.

pnpm bulid 성공.

파일간 연결 구조

main.tsx
└─ App.tsx
├─ header.tsx
├─ movie-grid.tsx
│  └─ movie-card.tsx
│     └─ movie.ts
├─ movie-data.ts
│  └─ movie.ts

현재 영화 목록은 movie-data.ts에 배열로 저장되고 movie-grid.tsx에서 렌더링된다. App.tsx가 movie-data.ts에서 원본 데이터를 가져와 movie-grid.tsx에 props로 전달한다.