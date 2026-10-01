- React 컴포넌트와 JSX
    - JSX는 HTML과 어떤 점이 다르며 React 컴포넌트 안에서 어떤 역할을 하나요?
    
    JSX는 **JavaScript 코드 안에서 HTML과 비슷한 문법으로 화면 구조를 작성하는 문법 확장**이다. HTML 문자열이 아니며, 빌드 도구가 JavaScript로 변환한 뒤 React가 사용한다.
    
    컴포넌트에서는 **현재 데이터에 따라 어떤 화면을 보여 줄지 표현하는 역할**을 한다. TypeScript와 JSX를 함께 사용하는 파일의 확장자는 `.tsx`이다.
    
    | 구분 | HTML | JSX |
    | --- | --- | --- |
    | CSS 클래스 지정 | `class="card"` | `className="card"` |
    | 내용이 없는 태그 | `<br>` | `<br />`처럼 닫아야 함 |
    | JavaScript 값 표시 | 별도의 JavaScript 처리 필요 | `{변수}`로 표현 |
    | 여러 요소를 나란히 반환 | JSX와 같은 반환 규칙 없음 | 부모 태그나 `<>...</>`로 묶음 |
    
    `<>...</>`는 **Fragment**로, 불필요한 HTML 요소를 추가하지 않고 여러 요소를 묶을 때 사용한다.
    
    **예시**
    
    > 변수에 저장된 영화 제목을 카드에 표시한다.
    > 
    
    ```
    export default function App() {
      const movieTitle = "오디세이";
    
      return (
        <article className="movie-card">
          <h2>{movieTitle}</h2>
          <p>영화 정보를 보여 주는 카드입니다.</p>
        </article>
      );
    }
    ```
    
    `App`은 컴포넌트이고, `return` 안의 내용이 JSX다. `{movieTitle}` 자리에는 변수에 저장된 `"오디세이"`가 표시된다.
    
    - 하나의 화면을 여러 컴포넌트로 나누면 어떤 장점이 있으며, 분리 기준은 어떻게 정할 수 있을까요?
    
    컴포넌트는 **화면을 구성하는 독립적인 UI 단위**다. 버튼, 영화 카드, 영화 목록처럼 역할에 따라 화면을 나눌 수 있다.
    
    컴포넌트를 나누면 같은 UI를 재사용하기 쉽고, 수정할 코드의 위치를 찾기 쉬워진다. 분리 기준은 단순한 코드 줄 수보다 **반복 여부와 역할의 구분**으로 잡는 것이 좋다.
    
    | 분리 기준 | 예시 | 장점 |
    | --- | --- | --- |
    | 반복해서 사용하는 UI | 영화 카드 | 같은 코드를 여러 번 작성하지 않음 |
    | 역할이 분명한 UI | 헤더, 페이지 이동 버튼 | 역할별로 수정하기 쉬움 |
    | 복잡해서 따로 읽고 싶은 부분 | 영화 목록 영역 | 전체 화면 구조를 파악하기 쉬움 |
    
    **예시**
    
    > 영화 목록 화면을 역할별로 나눈다.
    > 
    
    ```
    App
    ├── Header          → 상단 제목과 메뉴
    ├── MovieGrid       → 영화 목록 배치
    │   ├── MovieCard   → 영화 한 편의 정보
    │   ├── MovieCard
    │   └── MovieCard
    └── Pagination      → 페이지 이동
    ```
    
    영화 카드의 디자인을 바꾸려면 `MovieCard`를 수정하고, 페이지 이동 버튼을 바꾸려면 `Pagination`을 수정한다.
    
    **하나의 컴포넌트가 무엇을 담당하는지 한 문장으로 설명할 수 있으면 분리 기준을 잡기 쉽다.**
    
    - 조건부 렌더링과 목록 렌더링은 데이터에 따라 보여 줄 컴포넌트를 어떻게 결정하나요?
    
    **조건부 렌더링**은 조건에 따라 다른 UI를 보여 주는 것이다. `if`, 삼항 연산자 `조건 ? A : B`, `조건 && UI` 등을 사용한다.
    
    **목록 렌더링**은 배열의 데이터를 반복해서 화면 요소로 만드는 것이다. 주로 `map()`을 사용하며, 각 항목에는 React가 항목을 구분할 수 있도록 `key`를 지정한다.
    
    **예시**
    
    > 영화가 없으면 안내 문구를 보여 주고, 영화가 있으면 목록을 보여 준다.
    > 
    
    ```
    interface Movie {
      id: number;
      title: string;
    }
    
    const movies: Movie[] = [
      { id: 1, title: "오디세이" },
      { id: 2, title: "토이 스토리 5" },
    ];
    
    export default function App() {
      return (
        <main>
          {movies.length === 0 ? (
            <p>표시할 영화가 없어요.</p>
          ) : (
            <ul>
              {movies.map((movie) => (
                <li key={movie.id}>{movie.title}</li>
              ))}
            </ul>
          )}
        </main>
      );
    }
    
    ```
    
    `movies.length === 0`으로 **어떤 UI를 보여 줄지** 결정하고, `map()`으로 **영화마다 목록 항목을 하나씩** 만든다.
    
    `key`에는 `movie.id`처럼 안정적인 고유값을 사용한다. 추가·삭제·순서 변경이 가능한 목록에서는 배열 인덱스를 `key`로 사용하는 것을 피한다.
    
- props와 단방향 데이터 흐
    - 부모와 자식 컴포넌트 사이에서 props는 어떤 역할을 하나요?
    
    props는 **부모 컴포넌트가 자식 컴포넌트에 전달하는 입력값이**다. 일반 함수가 매개변수로 값을 받는 것과 비슷하다.
    
    같은 컴포넌트라도 서로 다른 props를 전달하면 다른 내용을 보여 줄 수 있다. 자식은 props를 읽어서 사용하며, 전달받은 값을 직접 수정하지 않는다.
    
    **예시**
    
    > 같은 영화 카드 컴포넌트에 서로 다른 제목을 전달한다.
    > 
    
    ```
    interface MovieCardProps {
      title: string;
    }
    
    function MovieCard({ title }: MovieCardProps) {
      return <h2>{title}</h2>;
    }
    
    export default function App() {
      return (
        <main>
          <MovieCard title="오디세이" />
          <MovieCard title="토이 스토리 5" />
        </main>
      );
    }
    ```
    
    `App`이 부모이고 `MovieCard`가 자식이다. 부모가 전달한 `title`에 따라 첫 번째 카드는 `"오디세이"`, 두 번째 카드는 `"토이 스토리 5"`를 보여 준다.
    
    > **컴포넌트는 재사용할 화면 구조이고, props는 그 구조에 넣을 내용이다.**
    > 
    - 데이터가 부모에서 자식으로만 흐르면 화면의 변화를 추적하는 데 어떤 도움이 되나요?
    
    단방향 데이터 흐름은 **데이터가 부모에서 자식으로 전달되는 구조**를 말한다. 화면에 잘못된 값이 보이면, 그 값을 전달한 부모를 따라가며 원인을 찾을 수 있다.
    
    자식이 부모의 상태를 바꾸고 싶을 때는 직접 수정하지 않고, **부모가 props로 전달한 함수를 호출해 변경을 요청**한다. 부모가 상태를 변경하면 새로운 값이 다시 자식에게 내려온다.
    
    **예시**
    
    > 영화 카드의 북마크 버튼을 누른다.
    > 
    
    ```
    ① App이 북마크 상태를 관리한다.
           ↓
    ② MovieCard에 현재 상태와 변경 함수를 전달한다.
           ↓
    ③ 사용자가 MovieCard의 북마크 버튼을 누른다.
           ↓
    ④ MovieCard가 전달받은 변경 함수를 호출한다.
           ↓
    ⑤ App이 상태를 변경한다.
           ↓
    ⑥ 새로운 북마크 상태가 MovieCard에 전달된다.
    ```
    
    북마크가 잘못 표시되면 **부모의 상태 → 전달한 props → 자식의 표시 코드** 순서로 확인할 수 있다.
    
    **단방향이라는 말은 자식이 부모에게 아무것도 알릴 수 없다는 뜻이 아니다.** 데이터는 아래로 전달하고, 자식은 함수 호출로 변경을 요청하는 구조다.
    
    - props에 TypeScript 타입을 붙이면 컴포넌트를 잘못 사용하는 실수를 어떻게 찾을 수 있나요?
    
    props 타입은 **컴포넌트에 어떤 이름과 종류의 값을 전달해야 하는지 정한 약속**이다.
    
    필수 props를 빠뜨리거나, 문자열 대신 숫자를 전달하는 등의 실수를 타입 검사 단계에서 발견할 수 있다. 동시에 컴포넌트를 사용하는 사람에게 필요한 입력값을 알려 주는 설명서 역할도 한다.
    
    **예시**
    
    > 영화 제목은 문자열, 북마크 여부는 불리언으로 받는다.
    > 
    
    ```
    interface MovieCardProps {
      title: string;
      isBookmarked: boolean;
    }
    
    function MovieCard({ title, isBookmarked }: MovieCardProps) {
      return (
        <p>
          {title}: {isBookmarked ? "북마크됨" : "북마크 안 됨"}
        </p>
      );
    }
    
    export default function App() {
      return <MovieCard title="오디세이" isBookmarked={true} />;
    ```
    
    다음과 같은 사용은 타입 오류로 발견할 수 있다.
    
    ```
    // 오류: title은 string인데 number를 전달함
    // <MovieCard title={123} isBookmarked={true} />
    
    // 오류: 필수 props인 isBookmarked를 빠뜨림
    // <MovieCard title="오디세이" />
    
    // 오류: boolean 대신 문자열 "true"를 전달함
    // <MovieCard title="오디세이" isBookmarked="true" />
    ```
    
    **`"true"`는 문자열이고, `{true}`는 불리언 값**이라는 차이가 중요하다.
    
- 상태와 리렌더링
    - 일반 변수와 state(상태)는 값이 바뀐 뒤 화면을 다시 보여 주는 방식이 어떻게 다른가요?
    
    컴포넌트 내부의 일반 변수는 값을 변경해도 **그 변경만으로 React에 화면 갱신을 요청하지 않는다.**
    
    반면 state는 React가 렌더링 사이에 기억하는 값이다. `useState`로 만들고, `setCount` 같은 **상태 설정 함수**로 업데이트를 요청한다.
    
    | 구분 | 컴포넌트 내부의 일반 변수 | state |
    | --- | --- | --- |
    | 값 유지 | 컴포넌트가 다시 실행되면 선언 코드도 다시 실행됨 | React가 렌더링 사이에 기억함 |
    | 값 변경 | 변수에 직접 대입 | 상태 설정 함수 사용 |
    | 화면 갱신 | 변수 변경 자체는 리렌더링을 요청하지 않음 | 상태 설정 함수가 리렌더링을 요청함 |
    
    **예시**
    
    > 버튼을 누를 때마다 화면의 숫자를 증가시킨다.
    > 
    
    ```
    import { useState } from "react";
    
    export default function App() {
      const [count, setCount] = useState(0);
    
      return (
        <main>
          <p>현재 값: {count}</p>
    
          <button onClick={() => setCount((current) => current + 1)}>
            +1
          </button>
        </main>
      );
    }
    ```
    
    버튼을 누르면 `setCount`가 다음 상태를 요청한다. React는 컴포넌트를 다시 실행해 새로운 JSX를 계산하고, 필요한 변경을 화면에 반영한다.
    
    **리렌더링은 브라우저 전체를 새로고침하는 것이 아니라, 컴포넌트의 화면 결과를 다시 계산하는 과정**이다.
    
    - React에서 원본 상태를 직접 수정하지 않고 새로운 값으로 업데이트해야 하는 이유는 무엇일까요?
    
    React의 상태는 **원본을 바꾸지 않는 방식으로 다뤄야 한다.** 이를 불변성을 지킨다고 표현한다.
    
    객체나 배열을 직접 수정하면 이전 상태 자체가 바뀌고, 그 수정만으로 리렌더링이 요청되지 않는다. 따라서 **변경할 내용을 반영한 새 객체나 배열을 만든 뒤 상태 설정 함수에 전달**한다.
    
    **예시**
    
    > 영화의 북마크 상태를 반대로 바꾼다.
    > 
    
    ```
    import { useState } from "react";
    
    export default function App() {
      const [movie, setMovie] = useState({
        title: "오디세이",
        isBookmarked: false,
      });
    
      function toggleBookmark() {
        setMovie((current) => ({
          ...current,
          isBookmarked: !current.isBookmarked,
        }));
      }
    
      return (
        <button onClick={toggleBookmark}>
          {movie.isBookmarked ? "북마크 해제" : "북마크 추가"}
        </button>
      );
    }
    ```
    
    `...current`는 기존 속성을 복사하고, `isBookmarked`만 바꾼 **새 객체**를 만든다.
    
    ```
    // 피해야 하는 방식: 기존 상태 객체를 직접 수정// movie.isBookmarked = true;
    ```
    
    배열도 같은 원리다. `push()`나 `splice()`로 원본을 바꾸는 대신 `map()`, `filter()`, 전개 문법을 사용한다. 배열 안의 객체를 수정할 때는 **수정 대상 객체도 새로 만들어야 한다.**
    
    - 이전 상태로 다음 상태를 계산할 때 업데이터 함수를 사용하는 이유는 무엇일까요?
    
    업데이터 함수는 **앞선 업데이트 결과를 받아 다음 상태를 계산하는 함수**다.
    
    ```
    setCount((current) =>current+1);
    ```
    
    React는 여러 상태 업데이트를 모아서 처리할 수 있다. 이때 이벤트 핸들러 안에서 읽는 `count`는 해당 렌더링의 값이므로, 상태 설정 함수를 호출했다고 그 변수의 값이 즉시 바뀌지는 않는다. 업데이터 함수를 사용하면 **대기 중인 업데이트를 순서대로 반영하여 계산**할 수 있다.
    
    **예시**
    
    > `count`가 0일 때, 한 번의 클릭 처리 안에서 숫자를 3 증가시키고 싶다.
    > 
    
    **현재 값을 직접 사용하는 경우**
    
    ```
    // 하나의 이벤트 핸들러 내부setCount(count+1);setCount(count+1);setCount(count+1);
    ```
    
    세 문장 모두 같은 `count`, 즉 0을 사용한다. 따라서 모두 “1로 바꿔 달라”는 요청이 되어 최종 결과는 **1**이다.
    
    **업데이터 함수를 사용하는 경우**
    
    ```
    // 위 코드와 비교하는 별도의 이벤트 핸들러 내부setCount((current) =>current+1);setCount((current) =>current+1);setCount((current) =>current+1);
    ```
    
    앞선 계산 결과를 다음 함수가 전달받아 `0 → 1 → 2 → 3`으로 처리되므로 최종 결과는 **3**이다.
    
    > **이전 값에 의존하는 증가·감소·토글에는 업데이터 함수를 사용한다.** `setCount(0)`처럼 특정 값으로 초기화할 때는 값을 직접 전달해도 된다.
    > 
- 상태 공유와 Context
    - 여러 컴포넌트가 같은 상태를 사용해야 할 때 상태를 어느 컴포넌트에 두는 것이 좋을까요?
    
    같은 상태를 여러 컴포넌트가 사용한다면, **그 컴포넌트들의 가장 가까운 공통 부모**가 상태를 관리하는 것이 좋다. 자식의 상태를 공통 부모로 옮기는 것을 **상태 끌어올리기**라고 한다.
    
    각 컴포넌트가 같은 데이터를 따로 저장하면 서로 다른 값을 보여 줄 수 있다. 기준 상태를 한 곳에 두면 여러 화면이 같은 데이터를 바탕으로 표시된다. 이를 **단일 진실 공급원, SSoT(Single Source of Truth)**라고 한다.
    
    **예시**
    
    > 영화 목록과 북마크 개수 표시가 같은 북마크 정보를 사용한다.
    > 
    
    ```
    App — movies 상태 관리
    ├── MovieGrid
    │   └── MovieCard — 북마크 상태 표시·변경 요청
    └── BookmarkSummary — 북마크된 영화 개수 표시
    ```
    
    `MovieCard`에서 북마크를 누르면 `App`이 `movies`를 변경한다. 영화 카드와 북마크 개수는 모두 이 상태를 기준으로 표시하므로 함께 바뀐다.
    
    이때 북마크 개수는 `movies`에서 계산할 수 있다.
    
    ```
    const bookmarkCount = movies.filter(
      (movie) => movie.isBookmarked
    ).length;
    ```
    
    **상태를 무조건 최상위 `App`에 둘 필요는 없다.** 필요한 컴포넌트들을 함께 포함하는 가장 가까운 부모를 찾으면 된다.
    
    - props 전달, 상태 끌어올리기와 Context는 각각 어떤 상황에 알맞을까요?
    
    세 가지는 완전히 대체 관계가 아니다.
    
    **상태 끌어올리기는 “상태를 어디에 둘지”에 관한 방법이고, props와 Context는 “값을 어떻게 전달할지”에 관한 방법**이다. 공통 부모에 상태를 둔 뒤 props나 Context로 전달할 수 있다.
    
    | 방법 | 적합한 상황 | 예시 |
    | --- | --- | --- |
    | **props** | 가까운 부모·자식 사이에 값 전달 | 영화 목록에서 카드에 제목 전달 |
    | **상태 끌어올리기** | 여러 컴포넌트가 같은 상태를 사용·변경 | 영화 목록과 북마크 개수 동기화 |
    | **Context** | 여러 단계 아래의 컴포넌트들이 같은 값 사용 | 테마, 로그인 사용자, 언어 |
    |  |  |  |
    
    Context를 사용하면 중간 컴포넌트가 사용하지 않는 값을 계속 props로 전달하는 **props drilling**을 줄일 수 있다. 하지만 가까운 관계에서는 데이터 흐름이 명확한 props부터 고려한다.
    
    **예시**
    
    > 중간 컴포넌트를 거치지 않고 현재 테마를 읽는다.
    > 
    
    워크북과 같은 **React 19의 Context 제공 문법**을 사용한 예시.
    
    ```
    import { createContext, useContext, useState } from "react";
    
    type Theme = "light" | "dark";
    
    const ThemeContext = createContext<Theme>("light");
    
    function ThemeStatus() {
      const theme = useContext(ThemeContext);
    
      return <p>현재 테마: {theme}</p>;
    }
    
    function Layout() {
      return <ThemeStatus />;
    }
    
    export default function App() {
      const [theme, setTheme] = useState<Theme>("light");
    
      return (
        <ThemeContext value={theme}>
          <Layout />
    
          <button
            onClick={() =>
              setTheme((current) => (current === "light" ? "dark" : "light"))
            }
          >
            테마 바꾸기
          </button>
        </ThemeContext>
      );
    }
    ```
    
    `Layout`은 `theme`를 props로 전달하지 않지만, 그 아래의 `ThemeStatus`는 Context에서 값을 읽는다.
    
    **상태를 기억하고 변경하는 것은 `useState`이고, Context는 그 값을 전달하는 역할**이다.
    
    - 모든 값을 Context로 전달하면 어떤 문제가 생길 수 있을까요?
    
    Context는 편리하지만, 모든 값을 넣으면 **필요 이상으로 넓은 범위에 값과 변경이 공유될 수 있다.**
    
    특히 Provider가 전달하는 값이 달라지면 **해당 Context를 읽는 컴포넌트들이 리렌더링**된다. 큰 객체 하나에 여러 값을 넣으면, 그중 일부만 필요한 컴포넌트도 다른 값의 변경에 영향을 받는다. 이는 앱의 모든 컴포넌트가 무조건 리렌더링된다는 뜻은 아니다.
    
    또한 props처럼 컴포넌트를 사용하는 코드에 입력값이 직접 드러나지 않아, 데이터 흐름을 확인하려면 Context와 값을 제공하는 위치까지 살펴봐야 한다. 공식 문서도 Context를 사용하기 전에 props 전달이나 컴포넌트 구성 변경을 먼저 고려하도록 안내한다.
    
    **예시**
    
    > 테마와 검색어를 하나의 `AppContext` 객체에 넣었다고 가정
    > 
    
    ```
    AppContext가 제공하는 값
    {
      theme: "light",
      searchText: ""
    }
    
    사용자가 검색어를 입력한다.
            ↓
    searchText를 반영한 새 Context 객체가 제공된다.
            ↓
    AppContext의 값이 변경된다.
            ↓
    theme만 읽던 컴포넌트도
    AppContext를 사용하므로 리렌더링된다.
    ```
    
    Context 객체에서 `theme`만 꺼내 썼더라도, `useContext`는 그 속성만 별도로 구독하는 방식이 아니기 때문이다.
    
    이런 상황에서는 다음처럼 범위를 나눠 볼 수 있다.
    
    | 값 | 관리·전달 위치 예시 |
    | --- | --- |
    | 검색창에서만 필요한 입력값 | 검색창 컴포넌트의 지역 state |
    | 영화 목록과 필터가 함께 쓰는 검색어 | 두 컴포넌트의 공통 부모 state |
    | 여러 화면에서 필요한 테마 | `ThemeContext` |
    
    **Context는 모든 상태를 넣는 보관함이 아니라, 여러 컴포넌트에 필요한 값을 전달하는 수단이다.** 먼저 상태가 필요한 범위를 정하고, 그 범위에 맞게 props와 Context를 선택하면 된다.