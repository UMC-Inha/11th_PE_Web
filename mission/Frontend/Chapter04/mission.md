- 필수 미션

  **1. Zustand store와 북마크 저장**

    ```tsx
    import { create } from "zustand";
    import { createJSONStorage, persist } from "zustand/middleware";
    
    interface BookmarkStore {
      bookmarkedMovieIds: number[];
      toggleBookmark: (movieId: number) => void;
    }
    
    export const useBookmarkStore = create<BookmarkStore>()(
      persist(
        (set) => ({
          bookmarkedMovieIds: [],
          toggleBookmark: (movieId) =>
            set((state) => ({
              bookmarkedMovieIds: state.bookmarkedMovieIds.includes(movieId)
                ? state.bookmarkedMovieIds.filter((id) => id !== movieId)
                : [...state.bookmarkedMovieIds, movieId],
            })),
        }),
        {
          name: "umcine-bookmark-store",
          storage: createJSONStorage(() => localStorage),
          partialize: (state) => ({
            bookmarkedMovieIds: state.bookmarkedMovieIds,
          }),
        },
      ),
    );
    ```

    - `bookmarkedMovieIds`를 공통 상태로 관리. 이미 포함된 ID는 `filter`로 제거, 없는 ID는 새 배열에 추가 → 같은 action으로 북마크 추가·해제 처리.
    - `persist`와 `createJSONStorage`로 localStorage에 저장하고 앱 시작 시 복원. 저장 key는 `umcine-bookmark-store`, `partialize`로 영화 ID 배열만 저장 대상으로 선택.

  **2. 목록 카드에서 공통 상태 사용**

    ```tsx
    const isBookmarked = useBookmarkStore((state) =>
      state.bookmarkedMovieIds.includes(movieId),
    );
    const toggleBookmark = useBookmarkStore(
      (state) => state.toggleBookmark,
    );
    
    return (
      <button
        type="button"
        className="absolute right-2 top-2 rounded-sm bg-black/60 px-2 py-1 text-xs text-white"
        onClick={() => toggleBookmark(movieId)}
      >
        {isBookmarked ? "북마크 해제" : "북마크 추가"}
      </button>
    );
    ```

    ```tsx
    <BookmarkButton movieId={movie.id} />
    ```

    - `movie-card.tsx`에서 영화 ID를 `BookmarkButton`에 전달. selector로 해당 영화의 북마크 여부와 action만 선택하고, 상태에 따라 버튼 문구 변경.

  **3. 상세 화면의 즐겨찾기 연결**

    ```tsx
    const isBookmarked = useBookmarkStore((state) =>
      state.bookmarkedMovieIds.includes(Number(movieId)),
    );
    
    const toggleBookmark = useBookmarkStore(
      (state) => state.toggleBookmark,
    );
    ```

    ```tsx
    <button
      type="button"
      className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-white"
      aria-pressed={isBookmarked}
      onClick={() => toggleBookmark(movie.id)}
    >
      <img
        src={
          isBookmarked
            ? "/icons/bookmark.svg"
            : "/icons/bookmark-outline.svg"
        }
        alt=""
        className="size-5 invert"
      />
      {isBookmarked ? "즐겨찾기 해제" : "즐겨찾기"}
    </button>
    ```

    - URL의 `movieId`를 숫자로 변환해 같은 store에서 북마크 여부 조회. Hook은 영화가 없을 때 반환하는 조건문 위에 배치해 호출 순서 유지.
    - 기존 즐겨찾기 영역을 `button`으로 변경하고 `toggleBookmark(movie.id)` 연결. 상태에 따라 문구·아이콘·`aria-pressed`를 함께 변경 → 목록과 상세가 같은 ID 배열을 기준으로 표시.

  **확인 결과**

    - 목록에서 북마크 추가 후 같은 영화의 상세 화면에 반영, 상세에서 해제 후 목록에도 반영되는 동작 확인.
    - 새로고침 뒤에도 북마크 상태 유지 확인.
    - `pnpm build` 성공. TypeScript 검사와 Vite 프로덕션 빌드 통과.