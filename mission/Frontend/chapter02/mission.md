우선 header.tsx, movie-card.tsx, movie-grid.tsx, pagination.tsx 를 만들고 movie-card.tsx 먼저 채웠습니다. props를 받아서 사진, 제목, 출시일, 북마크 버튼을 만들었습니다. 

후에 movie-grid를 채웠습니다. MovieGridProps를 조건부렌더링을 사용하여 목록화하여 표현했습니다. header.tsx와 movie-card.tsx도 구조만 채웠습니다.

pagination.tsx를 미션에 있어서 만들긴 했는데 아직 영화의 수가 부족해서인지 필요가 없어 보이고 피그마 페이지에도 없어 일단 그대로 두었습니다. 

이후에 각 요소별로 className을 넣고 App.css에서 css를 채웠습니다. 맨 처음으론 제공된 디자인 시스템의 색 코드를 css에 :root로 저장해 편하게 사용할 수 있게 하였고 각 className별로 css를 채웠습니다. 이미지를 넣어야 하는 곳은 일단 비워두거나 다른 기호로 대체하고 css를 다 채운 후에 이미지 경로를 설정하여 이미지를 넣었습니다.

위에서 실습 하나하나 해볼땐 props 전달을 어떤식으로 사용하고 진행되는지 크게 와닿지 않았는데 목록을 사용하는 화면을 만들어보니 어느정도 감이 잡힌 거 같습니다.