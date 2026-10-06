- Web Storage
    - localStorage와 sessionStorage는 저장값의 수명과 공유 범위가 어떻게 다른가요?

  **localStorage는 브라우저를 껐다 켜도 남고 같은 사이트의 모든 탭이 같이 쓴다. sessionStorage는 그 탭이 열려 있는 동안만 남고 탭마다 따로 쓴다.**

  |  | localStorage | sessionStorage |
      | --- | --- | --- |
  | 수명 | 직접 지우기 전까지 계속 남음. 
    브라우저를 껐다 켜도 남음 | 그 탭을 닫으면 사라짐. 
    새로고침은 괜찮음 |
  | 공유 범위 | 같은 origin이면 모든 탭과 창이 같은 값을 봄 | 탭마다 따로. 같은 사이트를 새 탭으로 열면 빈 상태 |
  | 예 | 다음 방문에도 남아야 하는 북마크 | 탭을 닫으면 지워져도 되는 임시 값 |

  **코드 예시 (Console)**

    ```jsx
    localStorage.setItem("umcine-bookmarks", "[2, 7]");
    localStorage.getItem("umcine-bookmarks");
    localStorage.removeItem("umcine-bookmarks");
    ```

    - setItem은 저장, getItem은 꺼내기(없으면 null)다.
    - sessionStorage도 이름만 바꾸면 똑같이 쓴다.
    - removeItem은 이름(key)을 지정한 값 하나만 지운다. 같은 사이트에 저장된 다른 key의 값은 그대로 남는다.
    - clear()는 그 사이트에 저장된 값을 key와 상관없이 **전부** 지운다. 북마크만 지우려다 다른 기능의 값까지 사라지므로 쓰지 않는다.

    - 객체나 배열을 저장할 때 JSON 문자열로 바꿔야 하는 이유는 무엇일까요?

  **Web Storage는 글자(문자열)만 저장할 수 있어서, 배열을 그대로 넣으면 모양이 망가지고 꺼낼 때도 배열로 돌아오지 않기 때문이다.**

  **바꾸지 않고 그냥 넣으면**

    ```jsx
    localStorage.setItem("ids", [2, 7]);
    localStorage.getItem("ids");        // "2,7"  ← 대괄호가 사라진 글자
    
    localStorage.setItem("movie", { id: 1 });
    localStorage.getItem("movie");      // "[object Object]"  ← 내용이 다 사라짐
    ```

    - 배열은 "2,7"처럼 대괄호가 빠진 글자가 되고, 객체는 "[object Object]"가 되어 원래 값을 알 수 없다.

  **JSON으로 바꿔서 넣으면**

  | JSON.stringify | 배열·객체 → JSON 글자로 바꿈 |
      | --- | --- |
  | JSON.parse | JSON 글자 → 배열·객체로 되돌림 |

    ```jsx
    localStorage.setItem("ids", JSON.stringify([2, 7]));   // "[2,7]" 저장
    JSON.parse(localStorage.getItem("ids"));  
    ```

    ```
    저장: 배열 [2, 7] → JSON.stringify → 글자 "[2,7]" → localStorage
    읽기: localStorage → 글자 "[2,7]" → JSON.parse → 배열 [2, 7]
    ```

  **주의: 읽을 때는 검사가 필요하다**

    - 사용자가 개발자 도구에서 값을 "abc"처럼 바꾸면 JSON.parse가 에러를 낸다.
    - 그래서 실습의 readBookmarkIds 함수는 try/catch로 에러를 잡고, 배열인지, 안에 양의 정수만 있는지 확인한 뒤 잘못되면 빈 배열을 돌려준다.

    - Web Storage에는 어떤 데이터를 저장하는 것이 적절할까요?

  **작고, 사용자가 보거나 바꿔도 문제없고, 잃어버려도 다시 만들 수 있는 화면용 데이터가 적절하다.**

  | 저장해도 되는 것 | 저장하면 안 되는 것 |
      | --- | --- |
  | 북마크한 영화 ID 목록 | 로그인 토큰, 비밀번호 |
  | 다크 모드, 카드 크기 같은 화면 설정 | 이름, 전화번호 같은 개인정보 |
  | 최근 검색어 | 크기가 큰 데이터 |

  **이유**

    - 개발자 도구 Application 탭에서 값을 직접 보고, 고치고, 지울 수 있다.
      그래서 비밀 정보는 넣으면 안 되고, 읽을 때 값이 올바른지 검사해야 한다.
    - 저장하고 읽는 동안 다른 JavaScript 코드가 기다린다.
      큰 데이터를 자주 저장하면 화면이 느려진다.
    - 사용자가 지울 수도 있어서, 사라져도 큰 문제가 없는 데이터여야 한다.

- 클라이언트 상태와 전역 상태 관리
    - 컴포넌트 상태와 전역 상태는 사용하는 범위가 어떻게 다른가요?

  **컴포넌트 상태(useState)는 그 컴포넌트와 props로 받은 자식만 쓸 수 있고, 전역 상태(store)는 앱의 어느 컴포넌트에서든 바로 꺼내 쓸 수 있다.**

    ```
    컴포넌트 상태
      MovieListPage (useState 북마크)  ── props ──▶ MovieGrid ── props ──▶ MovieCard
      SearchPage                         ✕ 북마크를 모름
      MovieDetailPage                    ✕ 북마크를 모름
    
    전역 상태
      bookmark-store (Zustand)
         ├──▶ MovieCard (목록)
         ├──▶ 검색 결과
         └──▶ 상세 화면       ← 어디서든 useBookmarkStore로 바로 꺼냄
    ```

  |  | 컴포넌트 상태 | 전역 상태 |
      | --- | --- | --- |
  | 쓸 수 있는 곳 | 그 컴포넌트 + props로 받은 자식 | 앱의 모든 컴포넌트 |
  | 우리 프로젝트 예 | 검색창 입력값 (search-page의 searchText) | 북마크한 영화 ID 목록 |
    - 검색창 입력값은 검색 화면에서만 쓰니까 컴포넌트 상태로 충분하다.
    - 북마크는 목록, 검색, 상세 세 화면이 다 써야 해서 전역 상태가 맞다.

    - 여러 화면에서 사용하는 북마크 상태를 전역으로 관리하면 어떤 장점과 비용이 생길까요?

  **어느 화면에서 바꿔도 모든 화면에 같은 결과가 보이고 props를 여러 단계 넘길 필요가 없다.
  대신 라이브러리가 하나 늘고, 어디서든 값을 바꿀 수 있어서 변경을 추적하기 어려워질 수 있다.**

  **코드 예시 (워크북 bookmark-store.ts)**

    ```tsx
    export const useBookmarkStore = create<BookmarkStore>((set) => ({
      bookmarkedMovieIds: [],
      toggleBookmark: (movieId) =>
        set((state) => ({
          bookmarkedMovieIds: state.bookmarkedMovieIds.includes(movieId)
            ? state.bookmarkedMovieIds.filter((id) => id !== movieId)
            : [...state.bookmarkedMovieIds, movieId],
        })),
    }));
    ```

    ```tsx
    const isBookmarked = useBookmarkStore((state) => state.bookmarkedMovieIds.includes(movieId));
    ```

    - store 안에 북마크 ID 배열과, 그 배열을 바꾸는 함수(action)를 같이 둔다.
    - 컴포넌트는 useBookmarkStore로 필요한 값만 골라서 꺼낸다. 이렇게 고르는 함수를 selector라고 한다.

  **장점**

  | 장점 | 설명 |
      | --- | --- |
  | 모든 화면이 같은 값 | 상세 화면에서 북마크하면 목록, 검색 화면에도 바로 반영된다 |
  | props 전달이 줄어든다 | MovieListPage → MovieGrid → MovieCard로 onToggleBookmark를 넘기지 않아도, 버튼에서 store를 바로 쓴다 |

  **비용**

  | 비용 | 설명 |
      | --- | --- |
  | 라이브러리 추가 | Zustand를 설치하고 사용법을 익혀야 한다 |
  | 변경 추적이 어려움 | 어느 컴포넌트에서든 바꿀 수 있어서, 값이 이상할 때 누가 바꿨는지 찾기 어렵다 |
  | 남용하기 쉬움 | 한 곳에서만 쓰는 값까지 store에 넣으면 오히려 코드가 복잡해진다 |
  | 불필요한 다시 그리기 | store 전체를 꺼내 쓰면 상관없는 값이 바뀔 때도 컴포넌트가 다시 그려진다. 그래서 selector로 필요한 값만 꺼낸다 |
    - Zustand와 Web Storage는 북마크 상태를 관리할 때 각각 어떤 역할을 할까요?

  **Zustand는 여러 컴포넌트가 같은 북마크 상태를 쓰게 해 주고, Web Storage는 그 상태를 브라우저에 저장해 새로고침 뒤에도 남게 한다. persist가 둘을 연결한다.**

  |  | Zustand | Web Storage |
      | --- | --- | --- |
  | 하는 일 | 앱이 실행되는 동안 여러 컴포넌트가 같은 상태를 공유 | 브라우저에 값을 저장 |
  | 새로고침하면 | 사라짐 (메모리에만 있어서) | 남음 (localStorage) |
  | 혼자 쓸 때 문제 | 새로고침하면 북마크가 다 풀림 | 여러 화면이 값이 바뀐 걸 바로 알지 못함 |

  둘은 서로 대신하는 도구가 아니라, 하나씩 부족한 부분을 채운다.

  **persist로 연결하기 (워크북 코드)**

    ```tsx
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
          partialize: (state) => ({ bookmarkedMovieIds: state.bookmarkedMovieIds }),
        },
      ),
    );
    ```

  | 옵션 | 뜻 |
      | --- | --- |
  | name | localStorage에 저장할 때 쓰는 key 이름 |
  | storage | 어느 저장소에 넣을지. sessionStorage로 바꿀 수도 있다 |
  | partialize | store 중 저장할 값만 고른다. 함수(toggleBookmark)는 빼고 ID 배열만 저장 |
  | createJSONStorage | JSON.stringify, JSON.parse를 대신 해 준다 |

  **흐름**

    ```
    북마크 클릭 → toggleBookmark → Zustand 상태 변경 → 모든 화면에 반영
                                            └→ persist가 localStorage에 자동 저장
    새로고침 → persist가 localStorage에서 읽어 Zustand 상태를 복원
    ```