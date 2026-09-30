# Chapter02

- React 컴포넌트와 JSX
    - JSX는 HTML과 어떤 점이 다르며 React 컴포넌트 안에서 어떤 역할을 하나요?
        
        ## JSX란?
        
        JSX는 **JavaScript 코드 안에서 HTML과 비슷한 형태로 UI를 작성할 수 있게 해주는 문법**이다.
        
        React 컴포넌트는 JavaScript 함수로 만들 수 있고, JSX를 반환하여 브라우저에 어떤 UI를 보여줄지 표현한다.
        
        예를 들어 이번 UMCine 미션에서 `MovieCard`는 다음과 같이 JSX를 반환한다.
        
        ```tsx
        export default function MovieCard({ movie }: MovieCardProps) {
          return (
            <article className="movie-card">
              <img
                className="movie-poster"
                src={movie.posterPath}
                alt={`${movie.title} 포스터`}
              />
        
              <h2>{movie.title}</h2>
              <p>{movie.releaseDate}</p>
            </article>
          );
        }
        ```
        
        여기서 `<article>`, `<img>`, `<h2>` 등은 HTML과 비슷하게 생겼지만 React 컴포넌트 안에서 작성된 **JSX**이다.
        
        또한 `{movie.title}`, `{movie.releaseDate}`처럼 `{ }` 안에 JavaScript 값을 넣어 데이터에 따라 화면의 내용을 다르게 표시할 수 있다.
        
        ### JSX와 HTML의 차이
        
        JSX는 HTML과 생김새는 비슷하지만 완전히 같은 문법은 아니다.
        
        대표적인 차이점은 다음과 같다.
        
        - HTML의 `class` 대신 JSX에서는 `className`을 사용한다.
        - `<img />`처럼 태그를 반드시 닫아야 한다.
        - 여러 요소를 반환하려면 하나의 부모 요소 또는 Fragment(`<> </>`)로 감싸야 한다.
        - `{ }`를 사용하여 JavaScript 변수나 표현식을 UI에 넣을 수 있다.
        
        예를 들어 HTML에서는 다음과 같이 작성한다.
        
        ```html
        <div class="movie-card">
          <img src="poster.jpg">
        </div>
        ```
        
        JSX에서는 다음과 같이 작성한다.
        
        ```tsx
        <div className="movie-card">
          <img src={movie.posterPath} />
        </div>
        ```
        
        따라서 JSX는 단순히 HTML을 React에서 사용하는 것이 아니라, **UI 구조와 JavaScript 로직을 함께 작성할 수 있도록 만든 문법**이라고 이해할 수 있다.
        
    - 하나의 화면을 여러 컴포넌트로 나누면 어떤 장점이 있으며, 분리 기준은 어떻게 정할 수 있을까요?
        
        ## React 컴포넌트란?
        
        React 컴포넌트는 **화면을 구성하는 독립적인 UI 단위**이다.
        
        버튼처럼 작은 부분도 하나의 컴포넌트가 될 수 있고, 페이지 전체처럼 큰 부분도 컴포넌트가 될 수 있다. 여러 컴포넌트를 조합하여 하나의 화면을 구성한다.
        
        이번 UMCine 미션에서는 영화 목록 화면을 다음과 같이 나누었다.
        
        ```
        App
        ├─ Header
        ├─ MovieGrid
        │  ├─ MovieCard
        │  ├─ MovieCard
        │  ├─ MovieCard
        │  └─ ...
        └─ Pagination
        ```
        
        하나의 `App.tsx`에 모든 화면을 작성하지 않고,
        
        - `Header` → 상단 영역
        - `MovieGrid` → 영화 목록
        - `MovieCard` → 개별 영화
        - `Pagination` → 페이지 이동 영역
        
        으로 역할을 나누었다.
        
        ### 컴포넌트를 나누는 이유
        
        컴포넌트를 적절하게 분리하면 **코드의 역할을 구분하기 쉽고 재사용하기도 편해진다.**
        
        이번 미션에서는 영화가 10개 있다고 해서 영화 카드 JSX를 10번 직접 작성하지 않고, 하나의 `MovieCard` 컴포넌트를 만들어 여러 번 사용했다.
        
        ```tsx
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onToggleBookmark={onToggleBookmark}
          />
        ))}
        ```
        
        따라서 영화 카드의 디자인을 수정해야 한다면 `MovieCard` 하나만 수정하면 모든 영화 카드에 동일하게 적용할 수 있다.
        
        컴포넌트를 나눌 때는 무조건 작게 만드는 것보다는 **화면에서 독립적인 역할을 하는 부분인지, 반복해서 사용되는 부분인지, 별도의 로직을 가지고 있는지** 등을 기준으로 나눌 수 있다.
        
    - 조건부 렌더링과 목록 렌더링은 데이터에 따라 보여 줄 컴포넌트를 어떻게 결정하나요?
        
        ## 조건부 렌더링
        
        조건부 렌더링은 **조건에 따라 서로 다른 UI를 보여주는 방법**이다.
        
        React에서는 별도의 조건문 문법이 있는 것이 아니라 JavaScript의 `if`, 삼항 연산자(`? :`), `&&` 등을 이용하여 어떤 JSX를 보여줄지 결정한다.
        
        이번 UMCine 미션에서는 영화의 북마크 상태에 따라 서로 다른 아이콘을 보여줄 때 사용했다.
        
        ```tsx
        <img
          src={
            movie.isBookmarked
              ? "/icons/bookmark.svg"
              : "/icons/bookmark-outline.svg"
          }
          alt=""
        />
        ```
        
        여기서는 삼항 연산자를 사용했다.
        
        ```
        movie.isBookmarked가 true
        → bookmark.svg
        
        movie.isBookmarked가 false
        → bookmark-outline.svg
        ```
        
        즉, 같은 `MovieCard`라도 가지고 있는 데이터의 상태에 따라 다른 UI를 보여줄 수 있다.
        
        ---
        
        ## 목록 렌더링
        
        목록 렌더링은 **배열에 들어 있는 데이터를 이용하여 여러 개의 컴포넌트를 반복해서 화면에 표시하는 것**이다.
        
        React에서는 JavaScript 배열의 `map()`을 이용하는 방법이 많이 사용된다. 목록의 각 요소에는 React가 항목을 구분할 수 있도록 고유한 `key`도 지정한다.
        
        이번 미션에서는 `movies` 배열에 10개의 영화 정보가 들어 있고, `map()`을 이용하여 각각을 `MovieCard`로 변환했다.
        
        ```tsx
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onToggleBookmark={onToggleBookmark}
          />
        ))}
        ```
        
        예를 들어 `movies` 배열에 영화 데이터가 10개 있다면 `map()`이 각 데이터를 하나씩 확인하면서 `MovieCard`를 만들어 **총 10개의 영화 카드가 화면에 표시**된다.
        
        또한 각 영화의 고유한 `id`를 다음과 같이 `key`로 사용했다.
        
        ```tsx
        key={movie.id}
        ```
        
        `key`는 목록의 항목이 추가되거나 삭제되거나 순서가 변경될 때 React가 각 항목을 구분하는 데 사용한다.
        
- props와 단방향 데이터 흐름
    - 부모와 자식 컴포넌트 사이에서 props는 어떤 역할을 하나요?
        
        ## props란?
        
        `props`는 **부모 컴포넌트가 자식 컴포넌트에게 데이터나 함수를 전달할 때 사용하는 값**이다.
        
        React에서는 컴포넌트마다 필요한 데이터를 직접 가지고 있을 필요 없이, 부모가 가지고 있는 값을 props를 통해 자식에게 전달할 수 있다.
        
        이번 UMCine에서는 `MovieGrid`에서 `MovieCard`를 렌더링하면서 영화 정보와 북마크 함수를 props로 전달했다.
        
        ```tsx
        <MovieCard
          key={movie.id}
          movie={movie}
          onToggleBookmark={onToggleBookmark}
        />
        ```
        
        여기서 전달하는 props는 다음과 같다.
        
        - `movie` : 영화의 포스터, 제목, 개봉일, 북마크 상태 등의 데이터
        - `onToggleBookmark` : 북마크 상태를 변경하기 위한 함수
        
        자식인 `MovieCard`에서는 전달받은 props를 다음과 같이 사용한다.
        
        ```tsx
        export default function MovieCard({
          movie,
          onToggleBookmark,
        }: MovieCardProps) {
          // ...
        }
        ```
        
        따라서 props를 이용하면 **부모가 가지고 있는 데이터나 기능을 필요한 자식 컴포넌트에서 사용할 수 있다.**
        
    - 데이터가 부모에서 자식으로만 흐르면 화면의 변화를 추적하는 데 어떤 도움이 되나요?
        
        ## 단방향 데이터 흐름
        
        React의 데이터는 기본적으로 **부모 컴포넌트에서 자식 컴포넌트 방향으로 전달**된다. 이를 단방향 데이터 흐름이라고 한다.
        
        이번 UMCine에서는 영화 목록과 북마크 상태를 `App`에서 관리한다.
        
        ```tsx
        const [movies, setMovies] = useState(initialMovies);
        ```
        
        그리고 이 데이터를 props를 이용해 아래 방향으로 전달한다.
        
        ```
        App
         ↓ movies
        MovieGrid
         ↓ movie
        MovieCard
        ```
        
        `MovieCard`에서 북마크 버튼을 클릭하더라도 `MovieCard`가 `App`의 state를 직접 변경하는 것은 아니다.
        
        ```tsx
        onClick={() => onToggleBookmark(movie.id)}
        ```
        
        부모에게서 전달받은 함수를 호출하고, 실제 영화 목록의 상태는 `App`에서 변경한다.
        
        따라서 전체적인 흐름은 다음과 같다.
        
        ```
        App에서 state 관리
                ↓
        props로 데이터 전달
                ↓
        MovieCard에서 화면 표시
                ↓
        북마크 버튼 클릭
                ↓
        전달받은 함수 호출
                ↓
        App의 state 변경
                ↓
        변경된 데이터가 다시 자식에게 전달
        ```
        
        데이터가 일정한 방향으로 흐르기 때문에 **어떤 컴포넌트가 데이터를 가지고 있고 어디에서 변경되는지 파악하기 쉽다.**
        
        화면에 예상하지 못한 값이 표시되더라도 데이터가 전달되는 방향을 따라가면서 문제를 확인할 수 있다는 장점이 있다.
        
    - props에 TypeScript 타입을 붙이면 컴포넌트를 잘못 사용하는 실수를 어떻게 찾을 수 있나요?
        
        ## props와 TypeScript
        
        TypeScript를 사용하면 컴포넌트가 **어떤 props를 받아야 하는지와 각 props의 타입이 무엇인지 미리 정의**할 수 있다.
        
        이번 미션에서는 `MovieCard`의 props를 다음과 같이 정의했다.
        
        ```tsx
        interface MovieCardProps {
          movie: Movie;
          onToggleBookmark: (movieId: number) => void;
        }
        ```
        
        이를 통해 `MovieCard`는
        
        - `movie`에는 `Movie` 타입의 객체
        - `onToggleBookmark`에는 `number` 타입의 ID를 전달받는 함수
        
        가 필요하다는 것을 알 수 있다.
        
        예를 들어 다음과 같이 `movie`에 문자열을 전달하면 잘못된 사용이다.
        
        ```tsx
        <MovieCard
          movie="스파이더맨"
          onToggleBookmark={handleToggleBookmark}
        />
        ```
        
        `movie`에는 `Movie` 타입의 객체가 들어와야 하는데 `string`을 전달했기 때문에 TypeScript가 타입 오류를 알려준다.
        
        또한 필요한 props를 빼먹거나 잘못된 형태의 함수를 전달하는 경우에도 타입 검사를 통해 확인할 수 있다.
        
        따라서 props에 타입을 지정하면 **컴포넌트가 필요로 하는 데이터의 형태가 명확해지고, 컴포넌트를 잘못 사용하는 실수를 코드를 실행하기 전에 발견하는 데 도움이 된다.**
        
- 상태와 리렌더링
    - 일반 변수와 state(상태)는 값이 바뀐 뒤 화면을 다시 보여 주는 방식이 어떻게 다른가요?
        
        ## 일반 변수와 state
        
        일반 변수와 state는 모두 값을 저장할 수 있지만, **값이 변경되었을 때 React 화면에 반영되는 방식에 차이**가 있다.
        
        일반 변수는 값을 변경해도 React에게 값이 변경되었다는 사실을 알려주지 않기 때문에 컴포넌트가 다시 렌더링되지 않는다.
        
        ```tsx
        let count = 0;
        
        function handleClick() {
          count = count + 1;
        }
        ```
        
        위 코드에서 `count`의 값 자체는 변경되지만, React는 이 변경을 감지하여 화면을 다시 렌더링하지 않는다.
        
        반면 state는 `useState`를 사용하여 만들고, state를 변경하는 함수를 호출하면 React가 상태 변경을 처리하고 컴포넌트를 다시 렌더링한다.
        
        ```tsx
        const [count, setCount] = useState(0);
        
        function handleClick() {
          setCount(count + 1);
        }
        ```
        
        따라서 **화면에 표시되고 값의 변화가 화면에도 반영되어야 하는 데이터는 state로 관리**해야 한다.
        
        이번 UMCine에서는 영화의 북마크 상태가 버튼을 클릭할 때마다 화면에 반영되어야 하기 때문에 영화 목록을 state로 관리했다.
        
        ```tsx
        const [movies, setMovies] = useState(initialMovies);
        ```
        
        북마크 상태가 변경되면 React가 컴포넌트를 다시 렌더링하고, 변경된 상태에 맞는 북마크 아이콘을 화면에 표시한다.
        
    - React에서 원본 상태를 직접 수정하지 않고 새로운 값으로 업데이트해야 하는 이유는 무엇일까요?
        
        ## state와 불변성
        
        React에서 객체나 배열 형태의 state를 변경할 때는 **기존 state를 직접 수정하지 않고 새로운 객체나 배열을 만들어 업데이트**하는 것이 중요하다.
        
        예를 들어 다음과 같이 기존 영화 객체의 값을 직접 변경하는 방식은 사용하지 않는 것이 좋다.
        
        ```tsx
        movie.isBookmarked = !movie.isBookmarked;
        ```
        
        대신 이번 미션에서는 `map()`과 전개 연산자(`...`)를 이용해 새로운 배열과 새로운 영화 객체를 만들었다.
        
        ```tsx
        setMovies((currentMovies) =>
          currentMovies.map((movie) =>
            movie.id === movieId
              ? { ...movie, isBookmarked: !movie.isBookmarked }
              : movie,
          ),
        );
        ```
        
        `map()`은 새로운 배열을 만들고,
        
        ```tsx
        { ...movie, isBookmarked: !movie.isBookmarked }
        ```
        
        는 기존 영화의 정보를 복사한 뒤 `isBookmarked`만 변경한 **새로운 객체**를 만든다.
        
        즉, 기존 상태를 직접 수정하는 것이 아니라 다음과 같이 새로운 상태를 만들어 교체하는 방식이다.
        
        ```
        기존 movies
             ↓
        map()으로 새로운 배열 생성
             ↓
        선택한 영화는 새로운 객체로 생성
             ↓
        setMovies()로 새로운 상태 저장
        ```
        
        React는 state의 변경을 기준으로 화면을 다시 렌더링하기 때문에 기존 값을 직접 수정하기보다 **새로운 값으로 업데이트하면 상태 변화를 예측하고 추적하기 쉬워진다.**
        
    - 이전 상태로 다음 상태를 계산할 때 업데이터 함수를 사용하는 이유는 무엇일까요?
        
        ## 업데이터 함수
        
        다음 상태가 **이전 상태를 기준으로 결정되는 경우**에는 업데이터 함수를 사용할 수 있다.
        
        이번 미션에서 사용한 코드도 업데이터 함수 형태이다.
        
        ```tsx
        setMovies((currentMovies) =>
          currentMovies.map((movie) =>
            movie.id === movieId
              ? { ...movie, isBookmarked: !movie.isBookmarked }
              : movie,
          ),
        );
        ```
        
        여기서
        
        ```tsx
        (currentMovies) => ...
        ```
        
        부분이 업데이터 함수이다.
        
        React가 현재의 state를 `currentMovies`로 전달해 주고, 이 값을 이용해 다음 state를 만들어 반환한다.
        
        북마크 기능은 현재 값이 `true`인지 `false`인지에 따라 다음 값이 결정된다.
        
        ```tsx
        isBookmarked: !movie.isBookmarked
        ```
        
        즉,
        
        ```
        false → true
        true  → false
        ```
        
        처럼 **이전 상태를 알아야 다음 상태를 계산할 수 있는 경우**이다.
        
        state 업데이트는 바로 처리되는 것처럼 보여도 React가 업데이트를 모아서 처리할 수 있기 때문에, 이전 state를 이용해 다음 state를 계산해야 한다면 현재 변수를 직접 참조하는 것보다 업데이터 함수를 사용하는 것이 안전하다.
        
        예를 들어 숫자를 증가시키는 경우에도 다음과 같이 사용할 수 있다.
        
        ```tsx
        setCount((prevCount) => prevCount + 1);
        ```
        
        따라서 업데이터 함수는 **이전 상태를 기반으로 다음 상태를 계산해야 할 때 최신 상태를 전달받아 안전하게 업데이트하기 위해 사용한다.**
        
- 상태 공유와 Context
    - 여러 컴포넌트가 같은 상태를 사용해야 할 때 상태를 어느 컴포넌트에 두는 것이 좋을까요?
        
        ## 상태 공유
        
        여러 컴포넌트가 같은 상태를 사용해야 한다면 **그 컴포넌트들의 가장 가까운 공통 부모 컴포넌트에서 상태를 관리**하는 것이 좋다.
        
        예를 들어 두 개의 자식 컴포넌트가 각각 같은 상태를 따로 가지고 있으면 한쪽에서 상태가 변경되어도 다른 쪽의 상태에는 반영되지 않을 수 있다.
        
        ```
        Parent
        ├─ ComponentA
        └─ ComponentB
        ```
        
        `ComponentA`와 `ComponentB`가 같은 상태를 사용해야 한다면 각각 상태를 만드는 것이 아니라 `Parent`에서 상태를 관리하고 두 컴포넌트에 전달할 수 있다.
        
        ```tsx
        function Parent() {
          const [count, setCount] = useState(0);
        
          return (
            <>
              <ComponentA count={count} />
              <ComponentB count={count} />
            </>
          );
        }
        ```
        
        이번 UMCine에서도 영화 목록과 북마크 상태를 `MovieCard`마다 따로 관리하지 않고 상위 컴포넌트인 `App`에서 관리했다.
        
        ```tsx
        const [movies, setMovies] = useState(initialMovies);
        ```
        
        그리고 필요한 컴포넌트에 props로 상태와 함수를 전달했다.
        
        ```
        App
         ↓
        MovieGrid
         ↓
        MovieCard
        ```
        
        이렇게 하면 영화 목록의 상태를 한 곳에서 관리할 수 있고, 여러 컴포넌트가 동일한 상태를 기준으로 화면을 표시할 수 있다.
        
    - props 전달, 상태 끌어올리기와 Context는 각각 어떤 상황에 알맞을까요?
        
        ## 상태 끌어올리기
        
        서로 다른 컴포넌트가 같은 상태를 사용해야 할 때 **각 컴포넌트가 가지고 있던 상태를 가장 가까운 공통 부모로 이동시키는 것**을 상태 끌어올리기라고 한다.
        
        예를 들어 `MovieCard`마다 영화 데이터를 따로 관리하는 대신 `App`에서 전체 영화 목록을 관리하고 필요한 데이터를 아래로 전달하는 방식이다.
        
        ```tsx
        const [movies, setMovies] = useState(initialMovies);
        
        <MovieGrid
          movies={movies}
          onToggleBookmark={handleToggleBookmark}
        />
        ```
        
        상태를 변경하는 함수도 함께 전달할 수 있다.
        
        ```tsx
        <MovieCard
          movie={movie}
          onToggleBookmark={onToggleBookmark}
        />
        ```
        
        따라서 여러 컴포넌트가 같은 데이터를 사용해야 한다면 **공통 부모로 상태를 끌어올린 뒤 props로 전달**하여 하나의 상태를 공유할 수 있다.
        
        ---
        
        ## props 전달과 Context
        
        컴포넌트 사이에서 데이터를 공유하는 대표적인 방법으로 **props와 Context**가 있다.
        
        props는 부모와 자식 사이에서 데이터를 전달하는 기본적인 방법이다.
        
        ```
        App
         ↓ props
        MovieGrid
         ↓ props
        MovieCard
        ```
        
        이번 UMCine처럼 컴포넌트 구조가 깊지 않고 전달 과정이 단순하다면 props를 사용하는 것이 이해하기 쉽고 데이터의 흐름도 명확하다.
        
        하지만 컴포넌트 구조가 깊어지면 실제로 해당 데이터를 사용하지 않는 중간 컴포넌트도 계속 props를 전달해야 하는 상황이 생길 수 있다.
        
        ```
        App
         ↓ user
        Layout
         ↓ user
        Header
         ↓ user
        Profile
        ```
        
        `Layout`과 `Header`에서는 `user`가 필요하지 않은데 `Profile`에 전달하기 위해 계속 props를 넘겨야 할 수 있다. 이러한 상황을 흔히 **props drilling**이라고 한다.
        
        이처럼 많은 컴포넌트가 공통으로 사용하거나 여러 단계 아래의 컴포넌트에서 필요한 데이터는 Context를 사용할 수 있다.
        
        Context를 사용하면 중간 컴포넌트를 하나씩 거치지 않고 필요한 하위 컴포넌트에서 값을 읽을 수 있다.
        
        예를 들어 로그인한 사용자 정보나 테마처럼 앱의 여러 영역에서 공통으로 사용하는 값에 활용할 수 있다.
        
        따라서 상황에 따라 다음과 같이 생각할 수 있다.
        
        - 가까운 부모와 자식 사이의 데이터 전달 → **props**
        - 여러 컴포넌트가 같은 상태를 사용 → **공통 부모로 상태 끌어올리기**
        - 많은 컴포넌트나 깊은 위치에서 공통 데이터 사용 → **Context**
    - 모든 값을 Context로 전달하면 어떤 문제가 생길 수 있을까요?
        
        ## Context 사용 시 주의점
        
        Context를 사용하면 props를 여러 단계로 전달하지 않아도 된다는 장점이 있지만, **모든 데이터를 Context로 관리하는 것은 좋지 않다.**
        
        Context를 너무 많이 사용하면 어떤 컴포넌트가 어떤 데이터를 사용하는지 코드만 보고 파악하기 어려워질 수 있다.
        
        또한 Context의 값이 변경되면 해당 Context를 사용하는 컴포넌트들이 다시 렌더링될 수 있기 때문에, 자주 변경되는 많은 값을 하나의 Context에 모두 넣으면 불필요한 리렌더링이 발생할 수도 있다.
        
        예를 들어 특정 `MovieCard`에서만 필요한 값까지 전역 Context에 넣는다면 다른 컴포넌트에서도 접근할 수 있게 되어 상태의 사용 범위가 필요 이상으로 넓어진다.
        
        따라서 Context는 단순히 **“props를 쓰기 귀찮아서 사용하는 것”**보다는 여러 위치에서 실제로 공유해야 하는 데이터인지 확인하고 사용하는 것이 좋다.
        
        이번 UMCine처럼 `App → MovieGrid → MovieCard` 정도의 단순한 구조에서는 props를 사용해도 데이터의 흐름을 쉽게 파악할 수 있기 때문에 Context를 반드시 사용할 필요는 없다.
