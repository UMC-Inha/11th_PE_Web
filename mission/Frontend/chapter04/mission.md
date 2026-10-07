- 북마크 상태는 `stores/bookmark-store.ts`의 `useBookmarkStore` 하나에만 둔다.
- 목록은 `movie-card.tsx`, 검색은 `bookmark-button.tsx`, 상세는 `movie-detail-page.tsx`가 각자 스토어를 직접 구독한다.
- 페이지마다 따로 있던 `useState`와 `Movie.isBookmarked` 필드, 목록에서 카드까지 내려주던 props를 없애 상태 출처를 하나로 만들었다.
- 각 컴포넌트는 `state.bookmarkedMovieIds.includes(movie.id)`로 자기 영화의 북마크 여부(boolean)만 구독하므로, 다른 영화가 바뀌어도 다시 렌더링되지 않는다.

![영화검색북마크].\images\image (4).png
![영화목록북마크].\images\image (5).png
![Aplication].\images\image (6).png
