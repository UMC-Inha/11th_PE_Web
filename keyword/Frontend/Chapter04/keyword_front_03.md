- Web Storage
    - localStorage와 sessionStorage는 저장값의 수명과 공유 범위가 어떻게 다른가요?
    - A.
        
        #### 1. localStorage란?
        
        브라우저에 **키-값 쌍을 영구적으로 저장**하는 Web Storage입니다.
        
        - **수명**: 만료 시간이 없습니다. 코드로 지우거나(`removeItem`, `clear`) 사용자가 브라우저 데이터를 삭제하기 전까지 유지됩니다. 새로고침, 탭 닫기, 브라우저 재시작 후에도 남아 있습니다.
        - **공유 범위**: 같은 출처(origin)라면 **모든 탭과 창이 같은 저장소를 공유**합니다. 한 탭에서 값을 바꾸면 다른 탭에서도 바뀐 값이 보이고, 다른 탭에서는 `storage` 이벤트가 발생합니다.
        
        ```tsx
        localStorage.setItem("theme", "dark");
        localStorage.getItem("theme"); // "dark" — 브라우저를 껐다 켜도 유지
        ```
        
        #### 2. sessionStorage란?
        
        브라우저에 **키-값 쌍을 세션(탭) 동안만 저장**하는 Web Storage입니다.
        
        - **수명**: 탭이나 창이 열려 있는 동안만 유지됩니다. 새로고침해도 남아 있지만, **탭을 닫으면 삭제**됩니다.
        - **공유 범위**: 같은 출처이면서 **같은 탭 안에서만** 사용됩니다. 같은 URL을 새 탭으로 열면 빈 저장소에서 시작합니다. 탭을 복제하면 그 시점의 값이 복사되지만, 이후에는 각자 따로 관리됩니다.
        
        ```tsx
        sessionStorage.setItem("step", "2");
        sessionStorage.getItem("step"); // "2" — 이 탭을 닫으면 사라짐
        ```
        
        #### 3. 비교
        
        | 구분 | localStorage | sessionStorage |
        | --- | --- | --- |
        | 수명 | 직접 지울 때까지 유지 | 탭·창을 닫으면 삭제 |
        | 새로고침 | 유지 | 유지 |
        | 브라우저 재시작 | 유지 | 삭제 (세션 복원 기능으로 예외적으로 복구될 수 있음) |
        | 공유 범위 | 같은 출처의 모든 탭·창 | 같은 출처 + 같은 탭 |
        | 같은 URL을 새 탭으로 열기 | 같은 데이터를 봄 | 빈 저장소로 시작 |
        | 탭 복제 | 같은 데이터를 공유 | 복제 시점 값이 복사된 뒤 따로 관리 |
        | `storage` 이벤트 | 다른 탭의 변경을 감지 → 탭 간 동기화 가능 | 탭 간 공유가 없어 동기화에 쓸 수 없음 |
    - 객체나 배열을 저장할 때 JSON 문자열로 바꿔야 하는 이유는 무엇일까요?
    - A.
        
        Web Storage(localStorage, sessionStorage)는 값을 문자열로만 저장
        
        ⇒  문자열이 아닌 값을 넣으면 브라우저가 `String()`으로 자동 변환
        
        ⇒ 이 과정에서 객체와 배열의 구조가 사라짐
        
        ```tsx
        // 객체
        localStorage.setItem("user", { name: "지후", age: 25 });
        localStorage.getItem("user"); // "[object Object]"  → 데이터가 전부 사라짐
        
        // 배열
        localStorage.setItem("todos", ["공부", "운동"]);
        localStorage.getItem("todos"); // "공부,운동"  → 배열이 아니라 쉼표로 이어진 문자열
        
        // 숫자·불리언도 문자열이 됨
        localStorage.setItem("count", 3);
        localStorage.getItem("count"); // "3"  (숫자 아님)
        localStorage.setItem("isDark", false);
        localStorage.getItem("isDark"); // "false"  → if문에서 true로 판단됨
        ```
        
        #### JSON으로 해결하기
        
        `JSON.stringify`는 구조와 타입 정보를 담은 문자열로 바꿔 주고, `JSON.parse`는 그 문자열을 원래 형태로 되돌려 줍니다.
        
        ```tsx
        // 저장
        const user = { name: "지후", tags: ["react", "js"], isDark: false };
        localStorage.setItem("user", JSON.stringify(user));
        // 실제 저장값: '{"name":"지후","tags":["react","js"],"isDark":false}'
        
        // 불러오기
        const saved = JSON.parse(localStorage.getItem("user"));
        saved.tags[0];  // "react"
        saved.isDark;   // false (불리언으로 복원)
        ```
        
        #### 주의할 점
        
        JSON이 표현하지 못하는 값은 저장 과정에서 바뀌거나 빠집니다.
        
        | 값 | `JSON.stringify` 결과 |
        | --- | --- |
        | `Date` 객체 | 날짜 문자열 → 불러온 뒤 `new Date()`로 다시 만들어야 함 |
        | `undefined`, 함수 | 객체 속성에서는 빠지고, 배열 안에서는 `null`로 바뀜 |
        | `Map`, `Set` | `{}` (빈 객체) |
        | 순환 참조 객체 | 에러 발생 |
        
        또한 저장된 값이 올바른 JSON이 아니면 `JSON.parse`에서 에러가 나므로 `try...catch`로 감싸는 것이 안전합니다.
        
    - Web Storage에는 어떤 데이터를 저장하는 것이 적절할까요?
    - A.
        
        #### Web Storage의 특성
        
        - JavaScript로 누구나 읽고 쓸 수 있음 ⇒ 노출되어도 문제없는 데이터
        - 용량이 작고 동기 방식으로 동작함 ⇒ **크기가 작은** 데이터
        - 언제든 지워질 수 있음 ⇒ 사라져도 **다시 만들 수 있는** 데이터
        - 그 브라우저 안에만 저장됨 ⇒ **그 브라우저에서만** 필요한 데이터
        
        #### 예시
        
        | 데이터 | 추천 저장소 | 이유 |
        | --- | --- | --- |
        | 다크 모드, 언어, 글자 크기 설정 | localStorage | 다음 방문 때도 유지되어야 하는 UI 설정 |
        | 사이드바 접힘 여부, 마지막으로 연 탭 | localStorage | 사용 편의를 위한 작은 상태값 |
        | 최근 검색어, 최근 본 상품 목록 | localStorage | 민감하지 않고 작은 목록 |
        | "오늘 하루 보지 않기" 팝업 여부 | localStorage | 날짜와 함께 저장해 만료를 직접 관리 |
        | 비로그인 장바구니 | localStorage | 로그인 전 임시 데이터 (로그인 후 서버로 이전) |
        | 작성 중인 글·폼 임시 저장 | sessionStorage / localStorage | 실수로 새로고침해도 입력값 보존 |
        | 회원가입·결제 단계 진행 상태 | sessionStorage | 해당 탭에서만 잠깐 필요한 값 |
        | 목록 페이지의 스크롤 위치, 필터 상태 | sessionStorage | 뒤로 가기 시 화면 복원용 |
        
        오래 유지할 설정은 **localStorage**, 탭 안에서만 잠깐 쓸 상태는 **sessionStorage**
        
        #### 저장하면 안 되는 데이터
        
        | 데이터 | 이유 | 대안 |
        | --- | --- | --- |
        | 비밀번호, 카드 번호, 주민등록번호 등 개인정보 | XSS 공격 시 스크립트로 바로 탈취 가능 | 저장하지 않음 |
        | 액세스 토큰·리프레시 토큰 | 같은 이유로 탈취 위험 | `HttpOnly` + `Secure` 쿠키, 메모리(상태) 보관 |
        | 권한·가격·결제 금액 등 서버가 판단해야 하는 값 | 사용자가 개발자 도구로 쉽게 수정 가능 | 항상 서버에서 검증 |
        | 대용량 데이터 (이미지, 큰 JSON 목록) | 용량 제한, 동기 API라 읽고 쓸 때 화면이 멈출 수 있음 | IndexedDB |
        | 여러 기기에서 동일해야 하는 데이터 | 브라우저마다 따로 저장됨 | 서버 DB |
        | 요청마다 서버에 보내야 하는 값 | 자동 전송되지 않음 | 쿠키 |
- 클라이언트 상태와 전역 상태 관리
    - 컴포넌트 상태와 전역 상태는 사용하는 범위가 어떻게 다른가요?
    - A.
        
        #### 컴포넌트 상태(Local State)란?
        
        특정 컴포넌트 안에서 선언하고 관리하는 상태입니다. 
        
        React에서는 `useState`, `useReducer`로 만듭니다.
        
        - **사용 범위**: 상태를 선언한 그 컴포넌트 안에서만 직접 읽고 바꿀 수 있습니다. 자식 컴포넌트가 사용하려면 props로 전달받아야 하고, 부모나 형제 컴포넌트는 접근할 수 없습니다.
        - **수명**: 컴포넌트가 화면에 나타날 때(마운트) 만들어지고, 사라질 때(언마운트) 함께 사라집니다.
        - **독립성**: 같은 컴포넌트를 여러 번 사용하면 각각 별도의 상태를 가집니다.
        
        ```tsx
        function Counter() {
          const [count, setCount] = useState(0);
        
          return (
            <button onClick={() => setCount(count + 1)}>
              클릭 수: {count}
            </button>
          );
        }
        ```
        
        #### 전역 상태(Global State)란?
        
        컴포넌트 트리 바깥(또는 최상단)에서 관리하여 여러 컴포넌트가 함께 사용하는 상태입니다. 
        
        Context API, Redux, Zustand, Recoil 등으로 만듭니다.
        
        - **사용 범위**: Provider로 감싼 범위(또는 앱 전체) 안이라면 어느 컴포넌트에서든 props 전달 없이 바로 읽고 바꿀 수 있습니다.
        - **수명**: 특정 컴포넌트와 상관없이 앱이 실행되는 동안 유지됩니다. 다만 메모리에 있으므로 새로고침하면 초기화됩니다. (유지하려면 Web Storage에 함께 저장)
        - **공유성**: 모든 컴포넌트가 하나의 같은 상태를 바라봅니다. 한 곳에서 바꾸면 이 상태를 사용하는 모든 컴포넌트가 다시 렌더링됩니다.
        
        ```tsx
        // Context API로 만든 전역 상태
        const ThemeContext = createContext();
        
        function App() {
          const [theme, setTheme] = useState("light");
        
          return (
            <ThemeContext.Provider value={{ theme, setTheme }}>
              <Header />
              <Main />
            </ThemeContext.Provider>
          );
        }
        
        function ThemeButton() {
          const { theme, setTheme } = useContext(ThemeContext);
        
          return (
            <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
              현재 테마: {theme}
            </button>
          );
        }
        ```
        
        #### 정리
        
        - **컴포넌트 상태**: 한 컴포넌트(와 가까운 자식)에서만 쓰는 값
            
            ⇒ 범위가 좁고 컴포넌트와 함께 생겼다 사라짐
            
        - **전역 상태**: 멀리 떨어진 여러 컴포넌트가 함께 쓰는 값
            
            ⇒ 어디서든 접근 가능하고 앱이 실행되는 동안 유지
            
        - 기본은 컴포넌트 상태로 시작하고, 여러 곳에서 공유해야 하거나 props drilling이 심해질 때 전역 상태로 올리는 것이 일반적
    - 여러 화면에서 사용하는 북마크 상태를 전역으로 관리하면 어떤 장점과 비용이 생길까요?
    - A.
        
        #### 장점
        
        - **상태 일관성**: 북마크 정보가 한 곳에만 있어, 상세 화면에서 해제하면 목록·헤더·모아보기 화면에도 즉시 반영됩니다.
        - **props drilling 제거**: 멀리 떨어진 컴포넌트도 props 전달 없이 바로 접근할 수 있습니다.
        - **화면 이동 후에도 유지**: 페이지를 떠나 컴포넌트가 언마운트되어도 북마크 상태가 사라지지 않습니다.
        - **로직 일원화**: 추가/해제 규칙이 한 곳에 있어 수정하거나 API를 연동할 때 한 곳만 고치면 됩니다.
        - **저장소 연동이 쉬움**: 한 곳에서만 localStorage와 동기화하면 새로고침 후에도 복원할 수 있습니다.
        
        **⇒ 비용 증가**
        
        | 비용 | 증가하는 이유 |
        | --- | --- |
        | 불필요한 리렌더링 | Context는 값이 바뀌면 이를 사용하는 **모든 컴포넌트**를 다시 렌더링합니다. 카드 하나만 북마크해도 전체 카드가 리렌더링됩니다. |
        | 구조 복잡도 | Provider, Context, 라이브러리 설정 등 코드와 학습 비용이 늘어납니다. |
        | 변경 추적 어려움 | 어느 컴포넌트에서든 상태를 바꿀 수 있어 버그 원인을 찾기 어렵습니다. |
        | 재사용·테스트 비용 | 컴포넌트가 전역 상태에 의존해 항상 Provider가 필요합니다. |
        | 새로고침·기기 간 동기화 | 전역 상태도 메모리에 있어 새로고침하면 사라지고, 다른 기기와 공유되지 않습니다. |
        
        #### 해결 방법
        
        - **불필요한 리렌더링**: Zustand 등의 selector로 필요한 값만 구독합니다.
        - **구조 복잡도**: 여러 화면에서 공유할 때만 전역으로 올리고, 나머지는 컴포넌트 상태로 둡니다.
        - **변경 추적 어려움**: 변경은 `toggleBookmark` 같은 정해진 함수로만 하게 하고, Redux DevTools 등으로 변경 이력을 확인합니다.
        - **재사용·테스트 비용**: 표시용 컴포넌트는 `isBookmarked`, `onToggle`을 props로 받게 분리하고, 전역 상태는 상위에서만 연결합니다.
        - **새로고침·기기 간 동기화**: 새로고침 대비는 localStorage 연동, 기기 간 공유는 서버 저장 + React Query 등으로 동기화합니다.
    - Zustand와 Web Storage는 북마크 상태를 관리할 때 각각 어떤 역할을 할까요?
    - A.
        
        #### Zustand의 역할
        
        Zustand는 메모리에서 동작하는 전역 상태 관리 라이브러리입니다. 북마크 관리에서는 현재 화면에서 쓰는 북마크 상태를 담당합니다.
        
        - **상태 공유**: 목록, 상세, 헤더 등 여러 화면이 같은 북마크 상태를 바라봅니다.
        - **화면 갱신**: 상태가 바뀌면 이를 구독한 컴포넌트를 자동으로 다시 렌더링합니다.
        - **변경 로직 관리**: `toggleBookmark` 같은 액션을 store 안에 두어 변경 경로를 한 곳으로 모읍니다.
        - **필요한 값만 구독**: selector로 각 컴포넌트가 필요한 값만 구독해 불필요한 리렌더링을 줄입니다.
        - **한계**: 메모리에 있으므로 새로고침하거나 탭을 닫으면 사라집니다.
        
        #### Web Storage의 역할
        
        Web Storage(localStorage)는 브라우저에 데이터를 남겨 두는 저장소입니다. 북마크 관리에서는 북마크 상태를 보관했다가 복원하는 역할을 담당합니다.
        
        - **데이터 보존**: 새로고침하거나 브라우저를 다시 열어도 북마크 데이터가 남아 있습니다.
        - **초기값 제공**: 앱이 시작될 때 저장된 북마크를 읽어 전역 상태의 초기값으로 사용합니다.
        - **한계**: 값이 바뀌어도 React가 알지 못해 화면이 자동으로 갱신되지 않습니다. 또한 문자열만 저장하므로 JSON 변환이 필요합니다.
        
        #### 함께 사용 가능?
        
        ⇒ Zustand의 `persist` 미들웨어를 사용하면 store의 상태를 localStorage에 자동으로 저장하고 복원할 수 있습니다.
        
        ```tsx
        import { create } from "zustand";
        import { persist, createJSONStorage } from "zustand/middleware";
        
        const useBookmarkStore = create(
          persist(
            (set) => ({
              bookmarks: [], // 북마크한 게시글 id 목록
        
              toggleBookmark: (id) =>
                set((state) => ({
                  bookmarks: state.bookmarks.includes(id)
                    ? state.bookmarks.filter((b) => b !== id)
                    : [...state.bookmarks, id],
                })),
            }),
            {
              name: "bookmarks", // localStorage에 저장될 키 이름
              storage: createJSONStorage(() => localStorage),
            }
          )
        );
        
        // 사용하는 컴포넌트
        function PostCard({ post }) {
          const isBookmarked = useBookmarkStore((state) =>
            state.bookmarks.includes(post.id)
          );
          const toggleBookmark = useBookmarkStore((state) => state.toggleBookmark);
        
          return (
            <button onClick={() => toggleBookmark(post.id)}>
              {isBookmarked ? "★" : "☆"}
            </button>
          );
        }
        ```
        
        다른 기기와 북마크를 공유해야 한다면 Web Storage만으로는 부족 → 서버에 저장