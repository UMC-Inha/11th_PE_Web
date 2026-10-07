- 북마크 상태를 Zustand로 공유하기
    
    ### 1. 북마크 상태를 Zustand store로 통합
    
    `src/stores/bookmark-store.ts`에서 북마크한 영화의 ID 배열과 북마크를 추가·제거하는 함수를 관리하도록 했다.
    
    ```tsx
    interface BookmarkStore {
      bookmarkedMovieIds: number[];
      toggleBookmark: (movieId: number) => void;
    }
    ```
    
    `toggleBookmark`는 이미 저장된 영화라면 ID를 제거하고, 저장되지 않은 영화라면 ID를 추가하도록 작성했다.
    
    ```tsx
    toggleBookmark: (movieId) => {
      if (!Number.isInteger(movieId) || movieId <= 0) return;
    
      set((state) => ({
        bookmarkedMovieIds: state.bookmarkedMovieIds.includes(movieId)
          ? state.bookmarkedMovieIds.filter((id) => id !== movieId)
          : [...state.bookmarkedMovieIds, movieId],
      }));
    },
    ```
    
    `persist`를 사용해 북마크 ID를 `umcine-bookmark-store`라는 이름으로 저장하도록 했다. 새로고침해도 저장된 북마크가 복원되게 했다.
    
    ```tsx
    name: "umcine-bookmark-store",
    partialize: (state) => ({
      bookmarkedMovieIds: state.bookmarkedMovieIds,
    }),
    ```
    
    기존 실습에서 저장한 북마크도 사용할 수 있도록 초기값에서 `readBookmarkIds()`를 호출했다. 새로운 Zustand 저장값이 있으면 그 값을 우선 복원하도록 했다.
    
    ```tsx
    bookmarkedMovieIds: readBookmarkIds(),
    ```
    
    ### 2. 공통 북마크 버튼 수정
    
    `src/components/bookmark-button.tsx`에서 영화 ID를 받아 Zustand store의 북마크 상태를 확인하도록 했다.
    
    ```tsx
    const isBookmarked = useBookmarkStore((state) =>
      state.bookmarkedMovieIds.includes(movieId),
    );
    
    const toggleBookmark = useBookmarkStore(
      (state) => state.toggleBookmark,
    );
    ```
    
    버튼을 클릭하면 공통 store의 상태가 바뀌고, 활성 여부에 따라 버튼 색상·아이콘·문구가 바뀌도록 했다.
    
    ```tsx
    <button
      type="button"
      aria-label={isBookmarked ? "북마크 해제" : "북마크 추가"}
      aria-pressed={isBookmarked}
      onClick={() => toggleBookmark(movieId)}
      className={cn(
        "flex items-center justify-center rounded-md text-white",
        variant === "icon"
          ? "h-8 w-8 border border-white p-0"
          : "gap-2 px-4 py-3 text-sm font-bold",
        isBookmarked ? "bg-[#2864fa]" : "bg-black/55",
        className,
      )}
    >
      <img
        src={
          isBookmarked
            ? "/movie-icons/bookmark.svg"
            : "/movie-icons/bookmark-outline.svg"
        }
        alt=""
        className={cn(
          "brightness-0 invert",
          variant === "icon" ? "h-5 w-5" : "h-4 w-4",
        )}
      />
      {variant === "text" &&
        (isBookmarked ? "북마크 해제" : "북마크 추가")}
    </button>
    ```
    
    `variant`를 추가해 목록에서는 아이콘 버튼으로, 검색·상세에서는 문구가 있는 버튼으로 사용할 수 있게 했다.
    
    ### 3. 영화 목록의 개별 북마크 상태 제거
    
    `src/pages/movies/movie-list-page.tsx`에서 북마크를 관리하던 `useState`, 저장용 `useEffect`, 북마크 변경 함수를 제거했다.
    
    목록 페이지에서는 영화 데이터만 `MovieGrid`에 전달하도록 변경했다.
    
    ```tsx
    import { movies } from "../../data/movies";
    
    <MovieGrid movies={movies} />
    ```
    
    `src/components/movies/movie-grid.tsx`에서도 `onToggleBookmark`를 받거나 카드에 전달하던 코드를 제거했다.
    
    ```tsx
    interface MovieGridProps {
      movies: Movie[];
    }
    
    export default function MovieGrid({ movies }: MovieGridProps) {
      return (
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </section>
      );
    }
    ```
    
    ### 4. 영화 카드에 공통 북마크 버튼 연결
    
    `src/components/movies/movie-card.tsx`에서 기존 북마크 버튼을 `BookmarkButton`으로 교체했다.
    
    ```tsx
    <BookmarkButton
      movieId={movie.id}
      variant="icon"
      className="absolute right-2.25 top-2.25"
    />
    ```
    
    카드가 `movie.isBookmarked`를 사용하는 대신, 공통 버튼이 Zustand store에서 해당 영화의 활성 상태를 직접 읽도록 했다.
    
    ### 5. 검색 결과에 북마크 버튼을 추가
    
    `src/pages/movies/search-page.tsx`에서 각 검색 결과의 줄거리 아래에 공통 버튼을 추가했다.
    
    ```tsx
    <p className="mt-2 text-xs leading-5 text-[#677080]">
      {movie.overview}
    </p>
    
    <BookmarkButton
      movieId={movie.id}
      className="mt-3 self-start px-3 py-2 text-xs"
    />
    ```
    
    검색 결과에서도 북마크를 추가하거나 제거할 수 있고, 목록에서 변경한 북마크 상태가 그대로 표시되도록 했다.
    
    ### 6. 상세 화면의 북마크도 같은 store에 연결
    
    `src/pages/movies/movie-detail-page.tsx`에서 별도로 관리하던 북마크 상태를 제거했다.
    
    ```tsx
    // 제거한 코드
    const [bookmarked, setBookmarked] = useState(movie.isBookmarked);
    ```
    
    기존 즐겨찾기 버튼을 공통 컴포넌트로 교체했다.
    
    ```tsx
    <BookmarkButton movieId={movie.id} className="mt-4" />
    ```
    
    이렇게 목록·검색·상세 화면이 같은 영화 ID를 기준으로 하나의 북마크 상태를 사용하도록 했다. 한 화면에서 북마크를 변경하면 다른 화면에서도 같은 상태가 표시되게 만들었다.
    
- 북마크 상태를 Web Storage에 유지하기
    
    ### 1. Zustand의 persist로 북마크 저장
    
    `src/stores/bookmark-store.ts`에서 `persist`를 사용해 북마크 상태를 Web Storage에 저장하도록 했다.
    
    저장 키는 `umcine-bookmark-store`로 지정하고, `partialize`로 영화 ID 배열만 저장하도록 했다.
    
    ```tsx
    name: "umcine-bookmark-store",
    
    partialize: (state) => ({
      bookmarkedMovieIds: state.bookmarkedMovieIds,
    }),
    ```
    
    예를 들어 2번과 7번 영화를 북마크하면 다음 형태로 저장된다.
    
    ```tsx
    {
      "state": {
        "bookmarkedMovieIds": [2, 7]
      },
      "version": 0
    }
    ```
    
    ### 2. 브라우저를 다시 열어도 복원
    
    `createJSONStorage`에 `localStorage`를 연결했다. 북마크 상태가 변경되면 저장하고, 앱이 시작되면 저장된 값을 읽어 복원하도록 했다.
    
    저장소를 읽고 쓰는 부분은 다음과 같이 구성했다.
    
    ```tsx
    const value = localStorage.getItem(name);
    ```
    
    ```tsx
    setItem: (name, value) => {
      try {
        localStorage.setItem(name, value);
      } catch {
        console.warn("북마크를 브라우저에 저장하지 못했어요.");
      }
    },
    ```
    
    따라서 같은 주소에서 앱을 다시 열면 저장된 영화 ID를 기준으로 목록·검색·상세 화면의 북마크 상태가 표시되도록 했다.
    
    ### 3. 저장값을 삭제하면 빈 상태로 시작하도록 수정
    
    기존에는 초기값에서 이전 실습의 `umcine-bookmarks`를 읽고 있었다. 이 때문에 새로운 저장값을 삭제해도 예전 북마크가 다시 나타날 수 있었다.
    
    ```tsx
    // 변경 전
    bookmarkedMovieIds: readBookmarkIds(),
    ```
    
    초기값을 빈 배열로 변경하고, 이전 저장소를 읽는 import를 제거했다.
    
    ```tsx
    // 변경 후
    bookmarkedMovieIds: [],
    ```
    
    이제 `umcine-bookmark-store`를 삭제한 뒤 새로고침하면 북마크가 없는 상태로 시작하도록 했다.
    
    ### 4. 잘못된 저장값을 빈 배열로 처리
    
    저장된 값이 숫자 ID 배열인지 검사하고, 올바르지 않으면 빈 배열을 반환하도록 했다. 중복된 ID는 제거했다.
    
    ```tsx
    function validIds(value: unknown): number[] {
      return Array.isArray(value) &&
        value.every(
          (id) =>
            typeof id === "number" &&
            Number.isInteger(id) &&
            id > 0,
        )
        ? [...new Set<number>(value)]
        : [];
    }
    ```
    
    복원할 때도 검증된 ID 배열만 Zustand 상태에 반영하도록 했다.
    
    ```tsx
    merge: (persisted, current) => ({
      ...current,
      bookmarkedMovieIds: validIds(
        persisted &&
          typeof persisted === "object" &&
          "bookmarkedMovieIds" in persisted
          ? persisted.bookmarkedMovieIds
          : undefined,
      ),
    }),
    ```
    
    JSON 문법이 잘못된 문자열도 읽기 과정에서 처리해 화면이 오류 없이 빈 북마크 상태로 시작하도록 했다.


<img width="835" height="530" alt="image" src="https://github.com/user-attachments/assets/555faaf3-2fd4-4a59-bb44-d77c0c566a7c" />

<img width="882" height="521" alt="image" src="https://github.com/user-attachments/assets/8c9bace1-05bc-412e-be6a-f0b6edf666aa" />

<img width="861" height="366" alt="image" src="https://github.com/user-attachments/assets/1f7e482d-8e9b-4028-b64e-27098ffbd68f" />