- Web Storage
    - localStorage와 sessionStorage는 저장값의 수명과 공유 범위가 어떻게 다른가요?
        - **Web Storage**: 브라우저에 작은 데이터를 key–value 형태로 보관하는 API. `localStorage`와 `sessionStorage`로 구분하고, 서버 DB와 별개의 브라우저 저장 공간.
        - **localStorage**: 같은 origin의 탭·창에서 같은 저장 공간 사용. 새로고침·브라우저 재실행 뒤에도 유지되지만 영구 보존 보장은 X. 사용자의 삭제, 브라우저 정책, 시크릿 모드 등에 따라 제거 가능.
        - **sessionStorage**: origin과 탭을 함께 기준으로 분리. 같은 탭의 새로고침에는 유지, 탭·창을 닫아 페이지 세션이 끝나면 삭제. 일반적인 새 탭과 기존 탭이 하나의 저장 공간을 계속 공유하는 방식은 X.
        - **origin**은 scheme·host·port의 조합. 예: `http://localhost:5173`와 `http://localhost:5174`는 서로 다른 저장 공간. 같은 origin의 `/`와 `/search`는 path만 달라 같은 localStorage에 접근.
    - 객체나 배열을 저장할 때 JSON 문자열로 바꿔야 하는 이유는 무엇일까요?
        - Storage의 key와 value는 문자열. 배열을 그대로 `setItem`에 전달하면 문자열로 변환되어 배열 구조를 잃을 수 있으므로 **JSON.stringify → 저장 → JSON.parse** 순서로 처리.
        - 예: 숫자 배열 `[2, 7]`을 문자열 `"[2,7]"`로 저장하고, 읽을 때 다시 JavaScript 배열로 복원. JSON 문자열 자체와 복원한 배열은 서로 다른 값.

        ```tsx
        const key = "umcine-bookmarks";
        localStorage.setItem(key, JSON.stringify([2, 7]));
        
        const storedValue = localStorage.getItem(key);
        const parsedValue: unknown =
          storedValue === null ? [] : JSON.parse(storedValue);
        ```

        - 위 코드는 정상값의 변환 예시. 실제 읽기는 `try...catch`로 잘못된 JSON을 처리하고, `Array.isArray`와 원소 검사까지 필요. `JSON.parse` 성공만으로 숫자 배열이라는 보장은 X. `["2", -1, 3]`도 유효한 JSON.
        - TypeScript의 `number[]` 선언이나 타입 단언은 실행 중 저장값을 검사하지 않음 → 읽은 값을 `unknown`으로 받아 양의 정수 ID만 남기는 방식으로 검증.
    - Web Storage에는 어떤 데이터를 저장하는 것이 적절할까요?
        - **적절한 값**: 북마크 영화 ID, 테마, 카드 정렬 방식처럼 작고 단순한 사용자 설정. 북마크 전체 영화 객체보다 ID 배열을 저장하면 용량·중복 감소, 제목이나 포스터 정보는 영화 데이터에서 조회.
        - 오래 유지할 화면 설정은 localStorage, 해당 탭에서만 필요한 입력 초안·임시 설정은 sessionStorage를 선택. 두 저장소 모두 새로고침 유지가 가능하므로 탭 종료 뒤에도 필요한지를 기준으로 판단.
        - 같은 origin의 JavaScript가 읽을 수 있고 사용자가 값을 수정할 수도 있음 → 비밀번호·인증 비밀·민감한 개인정보 보관은 피하고, 권한이나 결제 여부의 최종 판단 근거로 사용 X.
        - 저장값은 해당 브라우저 환경의 데이터. 다른 기기·브라우저와 자동 동기화 X. 계정별 북마크를 여러 기기에서 공유하려면 서버 저장과 동기화 설계가 별도로 필요.

  **추가 핵심 정리**

    - **기본 메서드**: `setItem(key, value)` 저장·덮어쓰기, `getItem(key)` 조회, `removeItem(key)` 한 항목 삭제, `clear()` 해당 저장 공간 전체 삭제. 없는 key를 조회하면 `null`. 특정 기능 초기화에는 전체 설정까지 지우는 `clear()`보다 해당 key 삭제가 적절.
    - **장점과 한계**: API가 단순하고 서버 요청 없이 읽기 가능. 읽기·쓰기는 동기 작업이므로 큰 JSON을 자주 저장하면 UI 실행을 막을 수 있음. 저장 용량 초과나 접근 제한으로 읽기·쓰기가 실패할 수 있어 예외 처리 필요. 큰 데이터·복잡한 검색에는 IndexedDB 등을 검토.
    - **JSON 변환의 한계**: 함수는 복원할 수 없고 Date는 기본적으로 문자열로 저장. 객체의 `undefined` 속성은 생략되고 순환 참조는 오류 → 필요한 데이터만 평범한 객체·배열로 구성.
    - **다른 탭과 화면 갱신**: 같은 origin의 다른 탭에서 localStorage가 바뀌면 `storage` 이벤트로 변경 감지 가능. 변경을 일으킨 창에는 이 이벤트가 발생하지 않으며, 저장만 해도 React state가 자동으로 바뀌는 것은 X. 이벤트를 읽어 state/store에 반영하는 연결이 필요.
    - **sessionStorage 예외**: opener가 있는 새 창은 기존 값이 처음 복사될 수 있지만 이후 저장 공간은 독립. “모든 새 탭은 무조건 빈 값”으로 외우기보다 같은 탭의 세션인지와 생성 방식 확인.
    - **확인 방법**: Application → Storage에서 현재 origin의 key/value 확인. 값을 직접 바꾼 뒤 앱이 저장값을 다시 읽는 시점에 검증. 초기값 함수에서 읽는 실습이라면 새로고침으로 재확인.

  **참고 자료**

    - MDN — Web Storage API
    - MDN — localStorage · sessionStorage
- 클라이언트 상태와 전역 상태 관리
    - 컴포넌트 상태와 전역 상태는 사용하는 범위가 어떻게 다른가요?
        - **클라이언트 상태**: 브라우저에서 사용자 조작과 UI 동작을 위해 관리하는 값. 검색 입력, 모달 열림 여부, 북마크 선택 등이 예시. **로컬/전역**은 그 값의 공유 범위를 구분하는 기준.
        - **컴포넌트 상태**: `useState` 등으로 특정 컴포넌트가 관리. 그 컴포넌트와 props를 받는 하위 컴포넌트에서 사용. 컴포넌트의 렌더 위치·수명이 유지되면 state도 유지되지만 언마운트 뒤 새로 마운트하면 초기값으로 시작.
        - **전역 상태**: 여러 컴포넌트·라우트가 같은 store의 값을 구독하여 사용. “프로젝트의 모든 값을 한곳에 저장”이라는 뜻은 X. 가까운 두 컴포넌트만 공유하면 공통 부모로 상태 끌어올리기부터 고려.
        - 예: 검색창에 입력 중인 `searchText`는 검색 페이지의 로컬 상태, 목록·검색·상세에서 함께 바꿀 북마크 ID는 전역 상태 후보. 공유·새로고침으로 유지할 검색 조건은 URL의 `query`로 표현하는 선택도 가능.
    - 여러 화면에서 사용하는 북마크 상태를 전역으로 관리하면 어떤 장점과 비용이 생길까요?
        - **장점**: 북마크 ID의 기준 값을 한 store에서 관리 → 목록에서 추가한 영화를 검색·상세에서도 같은 기준으로 표시. 페이지마다 북마크 배열을 복사하고 맞추는 코드 감소, 깊은 props 전달도 줄일 수 있음.
        - 상태 변경을 `toggleBookmark(movieId)` 같은 **action**으로 모으면 추가·삭제 규칙을 재사용하고 변경 경로 추적이 쉬워짐. 클릭한 버튼 → action → store 변경 → 구독 중인 UI 갱신 순서.
        - **비용**: 여러 화면이 store 구조와 action에 의존하므로 상태 변경의 영향 범위가 넓어짐. 로컬 입력까지 모두 전역으로 옮기면 화면별 초기화·수명 관리가 복잡. 무엇을 공유하고 언제 초기화할지 결정 필요.
        - 필요한 값을 selector로 골라 구독하면 관련 없는 변경의 영향을 줄일 수 있음. 다만 전역 상태를 사용한다고 렌더링 최적화가 자동으로 완성되는 것은 X. 전체 store를 구독하거나 매번 새 객체를 반환하면 불필요한 갱신이 생길 수 있음.
    - Zustand와 Web Storage는 북마크 상태를 관리할 때 각각 어떤 역할을 할까요?
        - **Zustand**: 실행 중인 앱의 메모리에서 상태·action을 관리하고, 구독한 컴포넌트에 변경을 전달. 같은 store 인스턴스를 유지하면 라우트 이동 중에도 공유 가능하지만, 새로고침 뒤 저장값 복원까지 자동 보장은 X.
        - **Web Storage**: 브라우저에 직렬화한 데이터 보관. 상태 변경 알림이나 컴포넌트 렌더링을 직접 담당하지 않음. Zustand 없이도 사용할 수 있고, Zustand도 저장소 없이 사용할 수 있음.
        - **persist**: Zustand 상태를 저장소에 기록하고 시작할 때 저장값을 store로 복원하는 미들웨어. localStorage와 연결하면 브라우저 재실행 뒤에도 복원 가능, sessionStorage와 연결하면 해당 탭의 세션 수명에 따라 유지.
        - 연결 흐름: 버튼 클릭 → `toggleBookmark` → ID 배열 변경 → 구독 UI 갱신·persist 저장 → 새로고침 → 저장값을 store로 복원 → 같은 ID 기준으로 UI 표시.
        - 워크북의 수동 저장 key `umcine-bookmarks`는 ID 배열, persist의 `umcine-bookmark-store`는 state·version을 담는 JSON 형식. key와 구조가 다르므로 기존 값이 자동으로 옮겨지는 것은 X.

  **추가 핵심 정리**

    - **selector 예시**: 카드 하나에 필요한 북마크 여부와 action만 구독. 첫 selector의 결과는 배열 전체가 아니라 boolean.

        ```tsx
        const isBookmarked = useBookmarkStore((state) =>
          state.bookmarkedMovieIds.includes(movieId),
        );
        
        const toggleBookmark = useBookmarkStore(
          (state) => state.toggleBookmark,
        );
        ```

        - 다른 영화의 북마크만 바뀌어 boolean 결과가 같다면 이 구독 때문에 다시 렌더링할 필요는 없음. 부모 렌더링 등 다른 원인으로는 갱신 가능. 여러 값을 새 객체·배열로 묶어 반환할 때는 개별 elector나 `useShallow` 검토.
    - **set과 불변성**: `set`은 기본적으로 최상위 속성을 얕게 병합. ID 추가는 `[...ids, movieId]`, 삭제는 `ids.filter(...)`로 새 배열 생성. `push`나 `splice`로 기존 배열을 직접 수정하는 방식은 피하고, 중첩 객체는 바뀌는 단계까지 직접 복사.
    - **파생값 중복 저장 줄이기**: ID 배열이 기준이면 `isBookmarked`와 북마크 개수는 `includes`·`length`로 계산. 같은 사실을 영화 객체의 boolean과 store의 ID 배열 양쪽에서 독립적으로 수정하면 서로 다른 결과가 생길 수 있음 → 기준 상태 하나를 선택.
    - **persist 설정**: `name`은 저장 key, `storage`는 사용할 저장소, `partialize`는 저장할 필드 선택. 영화 데이터나 action 전체보다 복원에 필요한 ID 배열만 저장. 저장 구조를 바꾸면 `version`·`migrate`로 기존 값 처리 계획 작성.
    - **hydration과 검증**: hydration은 저장 데이터를 메모리 상태로 복원하는 과정. 비동기 저장소에서는 복원 전에 초기 UI가 표시될 수 있어 준비 상태 고려. `createJSONStorage`의 JSON 변환이나 TypeScript 타입은 저장값의 형태를 자동 검증하지 않으므로, 손상·변조·오래된 값은 별도 검증과 오류 처리 필요.
    - **초기화 범위**: 저장값 삭제와 실행 중 store 초기화는 별개. `persist.clearStorage()`는 저장된 항목 삭제이며 현재 화면의 메모리 상태를 바로 비우는 action은 X. 즉시 초기화가 필요하면 store 상태도 함께 갱신.
    - **서버 상태와 구분**: API에서 받은 영화 목록은 서버 데이터의 복사본, 화면 설정·사용자 선택은 클라이언트 상태. 서버 데이터는 조회·캐시·재검증 전략까지 필요. 전역 store나 localStorage만 추가한다고 계정 간·기기 간 동기화가 생기는 것은 X.

  **참고 자료**

    - Zustand — selector와 useShallow
    - Zustand — persist