# chapter04

- Web Storage
    - localStorage와 sessionStorage는 저장값의 수명과 공유 범위가 어떻게 다른가요?
        
        ### localStorage
        
        `localStorage`는 웹 브라우저에서 데이터를 Key-Value 형태로 저장할 수 있는 Web Storage 중 하나이다.
        
        저장된 데이터는 직접 삭제하지 않는 이상 페이지를 새로고침하거나 브라우저를 종료한 뒤 다시 실행해도 유지된다.
        
        ```tsx
        localStorage.setItem("movieId", "1");
        
        const movieId = localStorage.getItem("movieId");
        ```
        
        위 코드에서는 `movieId`라는 Key에 `"1"`이라는 Value를 저장한다.
        
        Application 패널에서 확인하면 다음과 같은 형태로 저장된다.
        
        ```
        Key       Value
        movieId   1
        ```
        
        또한 `localStorage`는 같은 origin을 기준으로 저장 공간을 공유한다.
        
        origin은 일반적으로 다음 세 가지의 조합으로 구분된다.
        
        ```
        프로토콜 + 호스트 + 포트
        ```
        
        예를 들어 다음 두 주소는 포트 번호가 다르기 때문에 서로 다른 origin으로 취급된다.
        
        ```
        http://localhost:5173
        http://localhost:5174
        ```
        
        따라서 각각 별도의 Local Storage를 사용한다.
        
        ### sessionStorage
        
        `sessionStorage`도 브라우저에서 데이터를 Key-Value 형태로 저장하는 Web Storage이지만, `localStorage`와 달리 현재 탭의 세션 동안 데이터를 저장한다.
        
        ```tsx
        sessionStorage.setItem("searchQuery", "스파이더맨");
        ```
        
        같은 탭에서 페이지를 새로고침해도 데이터는 유지되지만, 해당 탭을 닫으면 저장된 데이터가 사라진다.
        
        또한 `sessionStorage`는 탭별로 저장 공간이 구분되기 때문에 같은 origin의 페이지를 여러 탭에서 열더라도 각 탭은 별도의 세션 저장 공간을 사용한다.
        
        따라서 **`localStorage`는 브라우저를 종료한 뒤에도 데이터를 유지해야 할 때 사용하고, `sessionStorage`는 현재 탭을 사용하는 동안에만 데이터를 유지해야 할 때 사용할 수 있다.**
        
        이번 미션에서는 사용자가 북마크한 영화가 **페이지를 새로고침하거나 브라우저를 다시 실행해도 유지되어야 했기 때문에 `localStorage`를 사용했다.**
        
    - 객체나 배열을 저장할 때 JSON 문자열로 바꿔야 하는 이유는 무엇일까요?
        
        ### Web Storage의 데이터 저장 방식
        
        Web Storage는 데이터를 **문자열 형태로 저장**한다.
        
        문자열 값은 다음과 같이 바로 저장할 수 있다.
        
        ```tsx
        localStorage.setItem("name", "에밀");
        ```
        
        하지만 배열이나 객체를 저장할 때는 배열이나 객체의 구조를 유지한 채 저장하기 위해 문자열 형태로 변환하는 과정이 필요하다.
        
        예를 들어 북마크한 영화의 ID가 다음과 같은 배열에 저장되어 있다고 해보자.
        
        ```tsx
        const bookmarkIds = [1, 3, 5];
        ```
        
        이 배열을 Web Storage에 저장하기 위해 `JSON.stringify()`를 사용하면 배열을 JSON 문자열로 변환할 수 있다.
        
        ```tsx
        localStorage.setItem(
          "bookmarks",
          JSON.stringify(bookmarkIds),
        );
        ```
        
        `JSON.stringify()`를 사용하면 다음과 같이 변환된다.
        
        ```
        [1, 3, 5]       // 배열
             ↓ JSON.stringify()
        "[1,3,5]"       // JSON 문자열
        ```
        
        이렇게 문자열로 변환하면 배열의 구조를 유지한 형태로 Web Storage에 저장할 수 있다.
        
        ### JSON 문자열을 다시 배열이나 객체로 변환하기
        
        Web Storage에서 `getItem()`으로 가져온 값 역시 문자열이기 때문에, 저장했던 배열이나 객체로 다시 사용하려면 `JSON.parse()`를 사용한다.
        
        ```tsx
        const storedValue = localStorage.getItem("bookmarks");
        
        const bookmarkIds = JSON.parse(storedValue);
        ```
        
        전체 과정을 정리하면 다음과 같다.
        
        ```
        배열 또는 객체
              ↓ JSON.stringify()
        JSON 문자열
              ↓
        Web Storage에 저장
              ↓
        Web Storage에서 문자열 가져오기
              ↓ JSON.parse()
        배열 또는 객체
        ```
        
        이번 미션에서는 이러한 변환을 직접 작성하지 않고 Zustand의 `persist`와 `createJSONStorage`를 사용했다.
        
        ```tsx
        storage: createJSONStorage(() => localStorage)
        ```
        
        `createJSONStorage`를 사용하면 Zustand의 상태를 JSON 형태로 저장하고, 저장된 데이터를 다시 불러올 때 복원할 수 있다.
        
        실제로 이번 미션에서 Local Storage의 `umcine-bookmark-store`에는 다음과 같이 `bookmarkedMovieIds`가 포함된 JSON 문자열이 Value로 저장된다.
        
        ```json
        {
          "state": {
            "bookmarkedMovieIds": [1]
          },
          "version": 0
        }
        ```
        
    - Web Storage에는 어떤 데이터를 저장하는 것이 적절할까요?
        
        ### Web Storage에 적합한 데이터
        
        Web Storage는 서버가 아닌 **사용자의 브라우저에 데이터를 저장하는 공간**이다. 따라서 서버에서 반드시 관리해야 하는 데이터보다는 브라우저에서 간단하게 유지할 필요가 있는 데이터를 저장하는 데 적합하다.
        
        예를 들어 다음과 같은 데이터를 저장할 수 있다.
        
        - 다크 모드와 같은 화면 설정
        - 북마크나 즐겨찾기 정보
        - 최근 검색어나 최근 본 항목
        - 사용자가 선택한 정렬 방식이나 필터
        - 페이지를 다시 열었을 때 복원할 간단한 설정값
        
        특히 `localStorage`는 브라우저를 종료했다가 다시 실행해도 값이 유지되기 때문에 **다음에 사이트를 방문했을 때도 유지할 필요가 있는 데이터**를 저장할 때 사용할 수 있다.
        
        이번 미션에서는 북마크한 영화의 모든 정보를 저장하는 대신 영화의 ID만 저장했다.
        
        ```tsx
        bookmarkedMovieIds: [1, 3]
        ```
        
        영화의 제목, 포스터, 개봉일 등의 정보는 이미 영화 데이터에 존재하기 때문에, 어떤 영화를 북마크했는지 구분하는 데 필요한 ID만 저장하면 된다.
        
        ### Web Storage에 적합하지 않은 데이터
        
        Web Storage에 저장된 데이터는 브라우저의 JavaScript에서 접근할 수 있으며, 사용자가 개발자 도구를 통해 직접 확인하거나 수정할 수도 있다.
        
        따라서 **비밀번호처럼 노출되면 안 되는 민감한 정보를 저장하는 용도로는 적합하지 않다.**
        
        또한 사용자가 Local Storage의 값을 직접 수정할 수도 있기 때문에 저장된 값을 무조건 신뢰해서는 안 된다.
        
        예를 들어 이번 미션에서 사용자가 개발자 도구를 통해 다음 값을
        
        ```
        [1, 3]
        ```
        
        임의로 다른 값으로 변경하는 것도 가능하다.
        
        따라서 Web Storage는 **보안상 중요한 데이터의 안전한 보관 장소라기보다는 브라우저에서 사용할 간단한 데이터를 유지하기 위한 저장 공간**으로 생각하는 것이 좋다.
        
        또한 Web Storage는 문자열 기반의 간단한 저장 방식이고 저장할 수 있는 용량에도 제한이 있기 때문에, 많은 양의 데이터나 복잡한 데이터를 저장하고 관리하는 용도로는 적합하지 않다.
        
        이번 미션의 `bookmarkedMovieIds`처럼 **크기가 작고, 브라우저에서 유지할 필요가 있으며, 사용자가 확인하거나 삭제해도 보안상 큰 문제가 없는 데이터**가 Web Storage에 저장하기 적절한 데이터라고 볼 수 있다.
        
- 클라이언트 상태와 전역 상태 관리
    - 컴포넌트 상태와 전역 상태는 사용하는 범위가 어떻게 다른가요?
        
        ### 컴포넌트 상태
        
        컴포넌트 상태는 **특정 컴포넌트에서 관리하고 사용하는 상태**이다. React에서는 주로 `useState`를 사용하여 컴포넌트 상태를 만들 수 있다.
        
        예를 들어 영화 상세 화면에서 사용자가 입력한 별점이 해당 화면에서만 필요하다고 하면 다음과 같이 관리할 수 있다.
        
        ```tsx
        const [rating, setRating] = useState(0);
        ```
        
        `rating`은 이 상태를 선언한 컴포넌트에서 관리된다.
        
        다른 컴포넌트에서도 이 값을 사용해야 한다면 상위 컴포넌트에서 상태를 관리하고 `props`를 통해 하위 컴포넌트로 전달할 수 있다.
        
        ```
        MovieListPage
              ↓ props
        MovieGrid
              ↓ props
        MovieCard
        ```
        
        하지만 여러 컴포넌트나 서로 다른 화면에서 같은 상태를 사용해야 한다면 계속 `props`로 전달해야 하거나, 각각 상태를 만들 경우 서로 다른 값을 가지게 될 수 있다.
        
        따라서 **특정 컴포넌트나 가까운 몇 개의 컴포넌트에서만 필요한 상태**라면 컴포넌트 상태로 관리하는 것이 적절하다.
        
        ### 전역 상태
        
        전역 상태는 **여러 컴포넌트나 화면에서 함께 사용할 수 있도록 컴포넌트 외부의 공통된 공간에서 관리하는 상태**이다.
        
        이번 미션의 북마크가 전역 상태가 필요한 경우에 해당한다.
        
        북마크는 영화 목록뿐만 아니라 검색 결과와 영화 상세 화면에서도 동일한 상태를 사용해야 한다.
        
        ```
                  Zustand Store
               bookmarkedMovieIds
                 ↙️     ⬇️     ↘️
               목록     검색     상세
        ```
        
        예를 들어 목록 화면에서 1번 영화를 북마크하여 다음과 같은 상태가 만들어졌다면,
        
        ```tsx
        bookmarkedMovieIds: [1]
        ```
        
        검색 결과나 상세 화면에서도 같은 Zustand store를 사용하기 때문에 1번 영화가 북마크되어 있다는 것을 확인할 수 있다.
        
        이번 미션에서는 Zustand를 사용하여 북마크 상태를 컴포넌트 외부의 store에서 관리했다.
        
        ```tsx
        const isBookmarked = useBookmarkStore((state) =>
          state.bookmarkedMovieIds.includes(movieId),
        );
        ```
        
        필요한 컴포넌트에서 `useBookmarkStore`를 사용하면 동일한 `bookmarkedMovieIds`에 접근할 수 있기 때문에, 화면마다 별도의 북마크 상태를 만들 필요가 없다.
        
        따라서 **컴포넌트 상태는 특정 컴포넌트를 중심으로 사용하는 상태이고, 전역 상태는 여러 컴포넌트나 화면에서 동일한 상태를 공유해야 할 때 사용하는 상태**라고 정리할 수 있다.
        
        이번 미션에서는 북마크가 목록, 검색, 상세 화면에서 모두 동일하게 유지되어야 했기 때문에 컴포넌트 상태가 아닌 **Zustand를 이용한 전역 상태로 관리했다.**
        
    - 여러 화면에서 사용하는 북마크 상태를 전역으로 관리하면 어떤 장점과 비용이 생길까요?
        
        ### 북마크 상태를 전역으로 관리할 때의 장점
        
        북마크 상태를 전역으로 관리하면 **여러 화면에서 하나의 동일한 상태를 공유할 수 있다.**
        
        이번 미션에서는 영화 목록, 검색 결과, 상세 화면에서 모두 북마크 상태를 사용한다.
        
        ```
                  Zustand Store
               bookmarkedMovieIds
                 ↙️     ⬇️     ↘️
               목록     검색     상세
        ```
        
        예를 들어 목록 화면에서 1번 영화를 북마크하면 Zustand store의 `bookmarkedMovieIds`가 변경된다.
        
        ```
        []
         ↓ 1번 영화 북마크
        [1]
        ```
        
        검색 결과와 상세 화면도 같은 store를 사용하기 때문에 별도로 값을 전달하거나 다시 설정하지 않아도 1번 영화가 북마크된 상태를 확인할 수 있다.
        
        또한 여러 단계의 컴포넌트를 거쳐 `props`를 계속 전달하는 것을 줄일 수 있다.
        
        이번 영화 목록의 구조를 예로 들면 다음과 같다.
        
        ```
        MovieListPage
             ↓
        MovieGrid
             ↓
        MovieCard
             ↓
        BookmarkButton
        ```
        
        북마크 상태를 상위 컴포넌트에서 관리한다면 중간 컴포넌트가 직접 사용하지 않더라도 하위 컴포넌트에 전달하기 위해 `props`를 계속 넘겨야 할 수 있다.
        
        반면 Zustand를 사용하면 `BookmarkButton`처럼 실제로 북마크 상태가 필요한 컴포넌트에서 store에 직접 접근할 수 있다.
        
        ```tsx
        const isBookmarked = useBookmarkStore((state) =>
          state.bookmarkedMovieIds.includes(movieId),
        );
        ```
        
        따라서 여러 화면에서 사용하는 상태를 한 곳에서 관리할 수 있고, 상태를 전달하는 과정도 단순하게 만들 수 있다.
        
        ### 전역 상태로 관리할 때의 비용
        
        전역 상태가 편리하다고 해서 모든 상태를 전역으로 관리하는 것이 좋은 것은 아니다.
        
        전역으로 관리하는 상태가 많아질수록 store에 저장되는 상태와 상태를 변경하는 함수도 많아진다. 그러면 **어떤 상태가 어디에서 사용되고 변경되는지 파악해야 할 범위가 넓어져 상태 관리가 복잡해질 수 있다.**
        
        예를 들어 특정 화면에서만 사용하는 값까지 모두 Zustand store에 넣으면, 다른 화면에서는 전혀 필요하지 않은 상태까지 전역 store에서 관리하게 된다.
        
        - 여러 화면에서 사용하는 북마크 → 전역 상태로 관리하기 적합
        - 특정 컴포넌트에서만 사용하는 값 → 컴포넌트 상태로 관리하는 것이 단순
        
        또한 Zustand와 같은 전역 상태 관리 도구를 사용하면 별도의 라이브러리를 설치하고 store의 구조와 상태 변경 방식을 추가로 관리해야 한다는 비용도 생긴다.
        
        이번 미션의 북마크는 **목록, 검색 결과, 상세 화면에서 동일한 상태를 공유해야 하기 때문에 전역 상태로 관리했을 때 얻는 장점이 크다.**
        
        따라서 여러 곳에서 공유해야 하는 상태는 전역으로 관리하되, 한 컴포넌트에서만 사용하는 상태까지 무조건 전역으로 만들기보다는 **상태가 실제로 사용되는 범위에 따라 컴포넌트 상태와 전역 상태를 구분해서 사용하는 것이 적절하다.**
        
    - Zustand와 Web Storage는 북마크 상태를 관리할 때 각각 어떤 역할을 할까요?
        
        ### Zustand의 역할
        
        Zustand는 애플리케이션에서 사용하는 **상태를 관리하는 역할**을 한다.
        
        이번 미션에서는 북마크한 영화의 ID를 `bookmarkedMovieIds`에 저장하고, `toggleBookmark`를 통해 북마크를 추가하거나 제거하도록 구현했다.
        
        ```tsx
        bookmarkedMovieIds: [],
        
        toggleBookmark: (movieId) =>
          set((state) => ({
            bookmarkedMovieIds: state.bookmarkedMovieIds.includes(movieId)
              ? state.bookmarkedMovieIds.filter((id) => id !== movieId)
              : [...state.bookmarkedMovieIds, movieId],
          })),
        ```
        
        목록, 검색, 상세 화면에서는 모두 같은 Zustand store의 북마크 상태를 사용하기 때문에 한 화면에서 북마크를 변경하면 다른 화면에서도 변경된 상태를 사용할 수 있다.
        
        하지만 Zustand에서 상태를 관리하는 것만으로는 해당 상태가 브라우저에 계속 저장되는 것은 아니다. 별도의 저장 공간에 저장하지 않는다면 페이지를 다시 불러왔을 때 초기 상태로 시작할 수 있다.
        
        ### Web Storage의 역할
        
        Web Storage는 데이터를 **브라우저에 저장하여 이후에도 다시 사용할 수 있도록 하는 역할**을 한다.
        
        이번 미션에서는 `localStorage`를 사용하여 Zustand에서 관리하는 북마크 상태를 브라우저에 저장했다.
        
        실제로 Local Storage에는 다음과 같이 저장된다.
        
        ```
        Key
        umcine-bookmark-store
        
        Value
        {"state":{"bookmarkedMovieIds":[1]},"version":0}
        ```
        
        따라서 페이지를 새로고침하거나 브라우저를 종료한 뒤 다시 실행하더라도 Local Storage에 저장된 값을 이용해 북마크 상태를 복원할 수 있다.
        
        ### Zustand와 Web Storage 연결
        
        이번 미션에서는 Zustand의 `persist` 미들웨어를 사용하여 Zustand와 Local Storage를 연결했다.
        
        ```tsx
        {
          name: "umcine-bookmark-store",
          storage: createJSONStorage(() => localStorage),
          partialize: (state) => ({
            bookmarkedMovieIds: state.bookmarkedMovieIds,
          }),
        }
        ```
        
        `name`은 Local Storage에서 사용할 Key를 지정하고, `storage`는 데이터를 저장할 공간으로 `localStorage`를 사용하도록 설정한다.
        
        `partialize`는 저장할 상태를 선택하며, 이번 미션에서는 북마크한 영화의 ID가 들어 있는 `bookmarkedMovieIds`가 저장되도록 설정했다.
        
        전체 동작 과정은 다음과 같다.
        
        ```
        북마크 버튼 클릭
        ↓
        Zustand의 북마크 상태 변경
        ↓
        Local Storage에 상태 저장
        ↓
        페이지 새로고침 또는 브라우저 재실행
        ↓
        Local Storage의 저장값 불러오기
        ↓
        Zustand의 북마크 상태 복원
        ```
        
        즉, **Zustand는 현재 북마크 상태를 관리하고 여러 화면에서 공유할 수 있도록 하는 역할을 하고, Web Storage는 해당 상태를 브라우저에 저장하여 나중에도 유지할 수 있도록 하는 역할**을 한다.
