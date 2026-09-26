- React 컴포넌트와 JSX
    - JSX는 HTML과 어떤 점이 다르며 React 컴포넌트 안에서 어떤 역할을 하나요?
        
        ## JSX란?
        
        JSX는 JavaScript 안에서 HTML과 비슷한 문법으로 화면 구조를 작성할 수 있도록 만든 문법이다. 브라우저가 JSX를 직접 실행하는 것은 아니며, 빌드 과정에서 일반 JavaScript 코드로 변환된다.
        
        ```jsx
        functionProfile() {
        	constname = "지은";
        	
        	return <h1>{name}님의 프로필</h1>;
        }
        ```
        
        ## JSX와 HTML의 차이
        
        | 구분 | HTML | JSX |
        | --- | --- | --- |
        | 클래스 지정 | `class` | `className` |
        | JavaScript 사용 | 직접 사용하기 어려움 | `{}` 안에서 사용 |
        | 이벤트 이름 | `onclick` | `onClick` |
        | 스타일 속성 | 문자열 | 객체 |
        | 태그 작성 | 일부 닫는 태그 생략 가능 | 모든 태그를 닫아야 함 |
        | 속성 이름 | 소문자 중심 | `camelCase` 사용 |
        
        ```jsx
        const isLogin = true;
        
        <button
          className="login-button"
          onClick={handleLogin}
          style={{ backgroundColor: "blue" }}
        >
          {isLogin ? "로그아웃" : "로그인"}
        </button>
        ```
        
        JSX에서는 다음과 같이 JavaScript 표현식을 `{}` 안에 작성할 수 있다.
        
        ```jsx
        <p>{user.name}</p>
        <p>{price * quantity}원</p>
        <p>{isLogin ? "로그인 상태" : "로그아웃 상태"}</p>
        ```
        
        또한 내용이 없는 태그도 반드시 닫아야 한다.
        
        ```jsx
        <img src={imageUrl} alt="프로필" />
        ```
        
        ## React 컴포넌트에서의 역할
        
        JSX는 React 컴포넌트가 화면에 어떤 UI를 보여줄지 표현하는 역할을 한다. 컴포넌트의 데이터인 `props`와 `state`를 JSX에 반영하면 데이터가 변경될 때 React가 화면을 다시 렌더링한다.
        
        ```jsx
        function Welcome({ name }) {
          return (
            <div>
              <h1>안녕하세요, {name}님!</h1>
              <p>React 학습을 시작합니다.</p>
            </div>
          );
        }
        ```
        
        즉, JSX는 HTML처럼 화면 구조를 표현하면서 JavaScript의 변수, 조건식, 함수 등을 함께 사용할 수 있게 해주는 React의 UI 작성 문법이다.
        
    - 하나의 화면을 여러 컴포넌트로 나누면 어떤 장점이 있으며, 분리 기준은 어떻게 정할 수 있을까요?
        
        ## 화면을 여러 컴포넌트로 나누는 이유
        
        하나의 화면을 여러 컴포넌트로 나누면 각 컴포넌트가 특정 UI와 기능만 담당하게 된다. 이를 통해 코드의 재사용성, 가독성, 유지보수성을 높일 수 있다.
        
        ### 주요 장점
        
        - **재사용성**: 버튼이나 카드처럼 반복되는 UI를 여러 화면에서 사용할 수 있다.
        - **가독성**: 하나의 파일에 모든 코드를 작성하지 않아 화면 구조를 쉽게 파악할 수 있다.
        - **유지보수성**: 특정 UI를 수정할 때 관련 컴포넌트만 변경할 수 있다.
        - **테스트 용이성**: 컴포넌트별로 기능을 나누어 테스트할 수 있다.
        - **협업 편의성**: 팀원이 서로 다른 컴포넌트를 나누어 작업하기 쉽다.
        
        ```jsx
        function ProductPage() {
          return (
            <>
              <Header />
              <ProductInfo />
              <ReviewList />
              <Footer />
            </>
          );
        }
        ```
        
        ## 컴포넌트 분리 기준
        
        ### 1. 반복해서 사용되는 UI
        
        버튼, 입력창, 카드처럼 여러 위치에서 반복되는 요소는 별도 컴포넌트로 분리한다.
        
        ```jsx
        <Button>구매하기</Button>
        <Button>장바구니</Button>
        ```
        
        ### 2. 독립적인 역할을 가진 영역
        
        헤더, 사이드바, 상품 정보, 리뷰 목록처럼 하나의 명확한 역할을 가진 영역을 분리한다.
        
        ### 3. 별도의 상태나 이벤트를 관리하는 영역
        
        다른 영역과 독립적으로 상태가 변경되거나 이벤트를 처리한다면 컴포넌트로 분리할 수 있다.
        
        ```jsx
        function LikeButton() {
          const [liked, setLiked] = useState(false);
        
          return (
            <button onClick={() => setLiked(!liked)}>
              {liked ? "좋아요 취소" : "좋아요"}
            </button>
          );
        }
        ```
        
        ### 4. 코드가 지나치게 길고 복잡한 영역
        
        하나의 컴포넌트가 너무 많은 UI와 로직을 담당한다면 역할별로 나눈다. 다만 단순한 태그 하나까지 무조건 컴포넌트로 만들면 파일이 불필요하게 많아질 수 있다.
        
        ## 정리
        
        컴포넌트는 다음 질문을 기준으로 분리할 수 있다.
        
        - 다른 화면에서도 다시 사용할 수 있는가?
        - 하나의 독립적인 역할을 담당하는가?
        - 별도의 상태나 이벤트를 관리하는가?
        - 분리했을 때 코드의 의미가 더 명확해지는가?
        
        컴포넌트는 작게 나누는 것 자체가 목적이 아니라, 각 부분의 역할을 명확하게 하고 관리하기 쉽게 만드는 것을 기준으로 분리해야 한다.
        
    - 조건부 렌더링과 목록 렌더링은 데이터에 따라 보여 줄 컴포넌트를 어떻게 결정하나요?
        
        ## 조건부 렌더링
        
        조건부 렌더링은 데이터의 상태에 따라 서로 다른 컴포넌트나 UI를 보여주는 방식이다. JavaScript의 `if`, 삼항 연산자, `&&` 연산자 등을 사용할 수 있다.
        
        ### if문
        
        조건에 따라 반환할 컴포넌트를 결정한다.
        
        ```jsx
        function LoginStatus({ isLogin }) {
          if (isLogin) {
            return <UserProfile />;
          }
        
          return <LoginButton />;
        }
        ```
        
        `isLogin`이 `true`이면 `UserProfile`을, `false`이면 `LoginButton`을 보여준다.
        
        ### 삼항 연산자
        
        두 가지 UI 중 하나를 선택할 때 사용한다.
        
        ```jsx
        {isLogin ? <UserProfile /> : <LoginButton />}
        ```
        
        ### && 연산자
        
        조건이 참일 때만 특정 컴포넌트를 보여줄 때 사용한다.
        
        ```jsx
        {hasNotification && <Notification />}
        ```
        
        `hasNotification`이 `true`일 때만 `Notification` 컴포넌트가 렌더링된다.
        
        ## 목록 렌더링
        
        목록 렌더링은 배열의 각 데이터를 컴포넌트로 변환하여 반복해서 보여주는 방식이다. 일반적으로 배열의 `map()` 메서드를 사용한다.
        
        ```jsx
        const books = [
          { id: 1, title: "데미안" },
          { id: 2, title: "어린 왕자" },
        ];
        
        function BookList() {
          return (
            <ul>
              {books.map((book) => (
                <BookItem key={book.id} book={book} />
              ))}
            </ul>
          );
        }
        ```
        
        `map()`은 `books` 배열의 각 원소를 `BookItem` 컴포넌트로 변환한다. 따라서 배열에 데이터가 2개 있다면 `BookItem`도 2개 렌더링된다.
        
        ## key가 필요한 이유
        
        목록을 렌더링할 때는 각 요소에 고유한 `key`를 지정해야 한다.
        
        ```jsx
        <BookItem key={book.id} book={book} />
        ```
        
        React는 `key`를 사용해 어떤 항목이 추가, 수정 또는 삭제되었는지 구분한다. `key`에는 배열의 순서인 `index`보다 데이터의 고유 ID를 사용하는 것이 좋다.
        
        ## 조건부 렌더링과 목록 렌더링 함께 사용하기
        
        배열의 상태에 따라 목록 또는 안내 문구를 보여줄 수 있다.
        
        ```jsx
        function BookList({ books }) {
          return (
            <div>
              {books.length > 0 ? (
                books.map((book) => (
                  <BookItem key={book.id} book={book} />
                ))
              ) : (
                <p>등록된 책이 없습니다.</p>
              )}
            </div>
          );
        }
        ```
        
        - `books.length > 0`: 책 목록을 렌더링
        - `books.length === 0`: 빈 목록 안내 문구를 렌더링
        
        즉, 조건부 렌더링은 조건값에 따라 보여줄 UI를 선택하고, 목록 렌더링은 배열의 각 데이터를 반복되는 컴포넌트로 변환한다.
        
- props와 단방향 데이터 흐름
    - 부모와 자식 컴포넌트 사이에서 props는 어떤 역할을 하나요?
        
        ## Props란?
        
        `props`는 부모 컴포넌트가 자식 컴포넌트에 데이터를 전달할 때 사용하는 값이다. 부모는 HTML 속성을 작성하는 것처럼 값을 전달하고, 자식은 전달받은 값을 이용해 화면을 구성한다.
        
        ```jsx
        function Parent() {
          return <Profile name="지은" age={24} />;
        }
        
        function Profile(props) {
          return (
            <p>
              {props.name}님의 나이는 {props.age}세입니다.
            </p>
          );
        }
        ```
        
        위 코드에서 `name`과 `age`가 부모가 자식에게 전달한 `props`이다.
        
        ## 구조 분해 할당
        
        일반적으로 필요한 `props`를 구조 분해 할당으로 꺼내서 사용한다.
        
        ```jsx
        function Profile({ name, age }) {
          return (
            <p>
              {name}님의 나이는 {age}세입니다.
            </p>
          );
        }
        ```
        
        ## 함수를 Props로 전달하기
        
        `props`에는 문자열이나 숫자뿐만 아니라 배열, 객체, 함수도 전달할 수 있다. 부모가 함수를 전달하면 자식에서 발생한 이벤트를 부모가 처리할 수 있다.
        
        ```jsx
        function Parent() {
          const handleClick = () => {
            alert("버튼이 클릭되었습니다.");
          };
        
          return <Button onClick={handleClick} />;
        }
        
        function Button({ onClick }) {
          return <button onClick={onClick}>확인</button>;
        }
        ```
        
        데이터는 부모에서 자식으로 내려가고, 자식은 전달받은 함수를 호출하여 부모에게 이벤트 발생을 알린다.
        
        ## Props의 특징
        
        - 부모 컴포넌트에서 자식 컴포넌트로 전달된다.
        - 문자열, 숫자, 배열, 객체, 함수 등을 전달할 수 있다.
        - 자식 컴포넌트에서는 전달받은 `props`를 직접 수정하면 안 된다.
        - 같은 컴포넌트라도 전달받은 `props`에 따라 다른 내용을 보여줄 수 있다.
        
        ```jsx
        <Profile name="지은" />
        <Profile name="유리" />
        ```
        
        즉, `props`는 부모와 자식 컴포넌트를 연결하고, 자식 컴포넌트를 다양한 데이터로 재사용할 수 있게 해주는 전달 수단이다.
        
    - 데이터가 부모에서 자식으로만 흐르면 화면의 변화를 추적하는 데 어떤 도움이 되나요?
        
        ## 단방향 데이터 흐름
        
        React의 데이터는 기본적으로 부모 컴포넌트에서 자식 컴포넌트로 흐른다. 부모가 `props`를 통해 데이터를 전달하고, 자식은 전달받은 데이터를 화면에 표시한다.
        
        ```jsx
        function Parent() {
          const [count, setCount] = useState(0);
        
          return <Child count={count} />;
        }
        
        function Child({ count }) {
          return <p>현재 값: {count}</p>;
        }
        ```
        
        `count`의 원본은 부모가 관리하고, 자식은 전달받은 값을 보여준다.
        
        ## 화면 변화 추적에 도움이 되는 이유
        
        데이터가 한 방향으로만 흐르면 어떤 값이 어디에서 시작되어 어떤 컴포넌트에 전달됐는지 쉽게 확인할 수 있다.
        
        ```
        부모의 state 변경 → 새로운 props 전달 → 자식 컴포넌트 다시 렌더링
        ```
        
        화면에 문제가 발생했을 때 다음 순서로 원인을 찾을 수 있다.
        
        1. 부모의 `state`가 올바르게 변경됐는지 확인한다.
        2. 변경된 값이 자식에게 `props`로 전달됐는지 확인한다.
        3. 자식이 전달받은 값을 올바르게 렌더링했는지 확인한다.
        
        자식이 부모의 데이터를 직접 변경할 수 있다면 여러 컴포넌트가 동시에 값을 수정할 수 있어 변경 원인을 파악하기 어려워진다. 단방향 데이터 흐름에서는 데이터를 변경하는 위치가 명확하므로 화면의 변화를 예측하고 디버깅하기 쉽다.
        
        ## 자식에서 부모의 데이터를 변경하는 방법
        
        자식이 부모의 값을 직접 수정하는 대신, 부모가 변경 함수를 `props`로 전달한다.
        
        ```jsx
        function Parent() {
          const [count, setCount] = useState(0);
        
          return (
            <Child
              count={count}
              onIncrease={() => setCount(count + 1)}
            />
          );
        }
        
        function Child({ count, onIncrease }) {
          return (
            <>
              <p>현재 값: {count}</p>
              <button onClick={onIncrease}>증가</button>
            </>
          );
        }
        ```
        
        버튼은 자식에 있지만 실제 `count` 변경은 부모에서 관리한다. 따라서 상태가 변경되는 위치와 화면이 다시 렌더링되는 과정을 명확하게 추적할 수 있다.
        
        즉, 단방향 데이터 흐름은 데이터의 출처와 변경 위치를 명확하게 만들어 화면의 변화를 예측하고 오류의 원인을 찾기 쉽게 해준다.
        
    - props에 TypeScript 타입을 붙이면 컴포넌트를 잘못 사용하는 실수를 어떻게 찾을 수 있나요?
        
        ## Props에 TypeScript 타입을 지정하는 이유
        
        Props에 TypeScript 타입을 지정하면 컴포넌트가 어떤 값을 받아야 하는지 명확하게 정의할 수 있다. 잘못된 자료형을 전달하거나 필수 값을 빠뜨리면 실행 전에 컴파일 단계에서 오류를 확인할 수 있다.
        
        ```tsx
        interface ProfileProps {
          name: string;
          age: number;
        }
        
        function Profile({ name, age }: ProfileProps) {
          return (
            <p>
              {name}님의 나이는 {age}세입니다.
            </p>
          );
        }
        ```
        
        ## 잘못된 타입 전달 확인
        
        `age`는 숫자여야 하므로 문자열을 전달하면 오류가 발생한다.
        
        ```tsx
        <Profile name="지은" age="24" />
        ```
        
        ```
        Type 'string' is not assignable to type 'number'.
        ```
        
        올바른 사용법은 다음과 같다.
        
        ```tsx
        <Profile name="지은" age={24} />
        ```
        
        ## 필수 Props 누락 확인
        
        `name`과 `age`는 필수이므로 하나라도 생략하면 오류가 발생한다.
        
        ```tsx
        <Profile name="지은" />
        ```
        
        ```
        Property 'age' is missing.
        ```
        
        필수가 아닌 값은 `?`를 사용해 선택적 Props로 지정할 수 있다.
        
        ```tsx
        interface ProfileProps {
          name: string;
          age?: number;
        }
        ```
        
        ## 허용할 값 제한
        
        유니언 타입을 사용하면 정해진 값만 전달하도록 제한할 수 있다.
        
        ```tsx
        interface ButtonProps {
          color: "blue" | "red";
        }
        
        function Button({ color }: ButtonProps) {
          return <button className={color}>버튼</button>;
        }
        ```
        
        ```tsx
        <Button color="green" /> // 타입 오류
        <Button color="blue" />  // 정상
        ```
        
        ## 함수 Props 확인
        
        함수가 받아야 하는 매개변수와 반환 타입도 검사할 수 있다.
        
        ```tsx
        interface ButtonProps {
          onClick: (id: number) => void;
        }
        
        function Button({ onClick }: ButtonProps) {
          return <button onClick={() => onClick(1)}>선택</button>;
        }
        ```
        
        ```tsx
        <Button onClick={(id: string) => console.log(id)} />
        // 매개변수 타입이 달라서 오류 발생
        ```
        
        ## 장점
        
        - 필수 Props 누락 확인
        - 잘못된 자료형 전달 방지
        - 허용되지 않은 값 사용 방지
        - 함수의 매개변수와 반환 타입 확인
        - 자동 완성을 통한 컴포넌트 사용법 확인
        - 컴포넌트 수정 시 영향을 받는 코드 확인
        
        즉, Props 타입은 컴포넌트의 사용 규칙 역할을 하며, 잘못된 사용을 실행 전에 발견할 수 있게 해준다.
        
- 상태와 리렌더링
    - 일반 변수와 state(상태)는 값이 바뀐 뒤 화면을 다시 보여 주는 방식이 어떻게 다른가요?
        
        ## 일반 변수와 State의 차이
        
        일반 변수와 `state`는 모두 값을 저장할 수 있지만, 값이 변경된 후 React가 화면을 다시 렌더링하는지에서 차이가 있다.
        
        ### 일반 변수
        
        일반 변수의 값을 변경해도 React는 값의 변경을 감지하지 못한다. 따라서 값은 바뀌더라도 화면은 자동으로 다시 렌더링되지 않는다.
        
        ```tsx
        function Counter() {
          let count = 0;
        
          const increase = () => {
            count += 1;
            console.log(count);
          };
        
          return (
            <div>
              <p>{count}</p>
              <button onClick={increase}>증가</button>
            </div>
          );
        }
        ```
        
        버튼을 누르면 `count` 값은 변경되지만 `<p>`에 표시된 값은 바뀌지 않는다. React에 화면을 다시 그려야 한다는 사실을 알리지 않았기 때문이다.
        
        또한 다른 이유로 컴포넌트가 다시 렌더링되면 함수가 다시 실행되면서 `count`가 다시 `0`으로 초기화된다.
        
        ### State
        
        `state`는 React가 관리하는 데이터이다. 상태 변경 함수를 호출하면 React가 값의 변경을 확인하고 컴포넌트를 다시 렌더링한다.
        
        ```tsx
        import { useState } from "react";
        
        function Counter() {
          const [count, setCount] = useState(0);
        
          const increase = () => {
            setCount(count + 1);
          };
        
          return (
            <div>
              <p>{count}</p>
              <button onClick={increase}>증가</button>
            </div>
          );
        }
        ```
        
        `setCount()`를 호출하면 다음 과정이 진행된다.
        
        ```
        상태 변경 요청 → React가 변경 확인 → 컴포넌트 재실행 → 변경된 화면 표시
        ```
        
        컴포넌트가 다시 렌더링되어도 React가 `count`의 상태값을 보존하기 때문에 다시 `0`으로 초기화되지 않는다.
        
        ## 차이점
        
        | 구분 | 일반 변수 | State |
        | --- | --- | --- |
        | 값 변경 | 직접 변경 | 상태 변경 함수 사용 |
        | 화면 재렌더링 | 발생하지 않음 | 발생함 |
        | 렌더링 간 값 유지 | 보장되지 않음 | 유지됨 |
        | 주요 용도 | 임시 계산값 | 화면에 영향을 주는 값 |
        
        따라서 버튼 클릭, 입력값, 선택 상태처럼 **값이 변경되었을 때 화면도 함께 바뀌어야 하는 데이터는 `state`로 관리해야 한다.**
        
    - React에서 원본 상태를 직접 수정하지 않고 새로운 값으로 업데이트해야 하는 이유는 무엇일까요?
        
        ## 상태를 직접 수정하면 안 되는 이유
        
        React에서는 기존 상태를 직접 변경하지 않고, 상태 변경 함수를 통해 새로운 값으로 업데이트해야 한다.
        
        ```tsx
        const [user, setUser] = useState({
          name: "지은",
          age: 24,
        });
        ```
        
        다음과 같이 원본 객체를 직접 변경하면 안 된다.
        
        ```tsx
        user.age = 25;
        ```
        
        이 코드는 객체 내부의 값만 변경할 뿐, `setUser()`를 호출하지 않는다. React는 상태가 변경되었다는 사실을 알 수 없기 때문에 화면을 다시 렌더링하지 않을 수 있다.
        
        ## 새로운 값을 만들어야 하는 이유
        
        React는 이전 상태와 새로운 상태를 비교하여 화면을 다시 렌더링할지 판단한다. 객체나 배열은 주로 참조값을 기준으로 비교하므로, 새로운 객체나 배열을 만들어 전달해야 변경을 명확하게 감지할 수 있다.
        
        ```tsx
        setUser({
          ...user,
          age: 25,
        });
        ```
        
        `...user`로 기존 값을 복사한 뒤 `age`만 변경한 새로운 객체를 만든다.
        
        ```
        기존 객체 참조 !== 새로운 객체 참조
        ```
        
        참조값이 달라졌으므로 React가 상태 변경을 인식하고 화면을 다시 렌더링한다.
        
        ## 배열 상태 변경
        
        배열에도 `push()`, `pop()`, `splice()`처럼 원본 배열을 변경하는 메서드를 직접 사용하면 안 된다.
        
        ```tsx
        // 잘못된 방법
        items.push(newItem);
        setItems(items);
        ```
        
        `items`와 `setItems()`에 전달한 값이 같은 배열을 가리키므로 React가 변경을 인식하지 못할 수 있다.
        
        새로운 배열을 만들어 전달해야 한다.
        
        ```tsx
        // 새로운 항목 추가
        setItems([...items, newItem]);
        
        // 항목 삭제
        setItems(items.filter((item) => item.id !== targetId));
        
        // 항목 수정
        setItems(
          items.map((item) =>
            item.id === targetId
              ? { ...item, completed: true }
              : item
          )
        );
        ```
        
        ## 이전 상태를 이용하는 경우
        
        새로운 상태가 이전 상태를 기준으로 계산된다면 함수 형태로 업데이트하는 것이 안전하다.
        
        ```tsx
        setCount((previousCount) => previousCount + 1);
        ```
        
        React의 상태 업데이트는 즉시 반영되지 않고 여러 업데이트가 함께 처리될 수 있다. 따라서 이전 상태를 직접 참조하는 것보다 함수의 매개변수로 전달받아 계산하는 것이 정확하다.
        
        ## 장점
        
        - React가 상태 변경을 정확하게 감지할 수 있다.
        - 필요한 컴포넌트가 정상적으로 다시 렌더링된다.
        - 이전 상태가 의도치 않게 변경되는 것을 방지한다.
        - 상태 변화 과정을 예측하고 디버깅하기 쉬워진다.
        - `React.memo` 등의 최적화 기능이 참조값을 올바르게 비교할 수 있다.
        
        즉, 원본 상태를 직접 수정하지 않고 새로운 값으로 업데이트하는 것은 React가 변경을 정확하게 감지하고 화면을 올바르게 갱신하도록 하기 위해 필요하다.
        
    - 이전 상태로 다음 상태를 계산할 때 업데이터 함수를 사용하는 이유는 무엇일까요?
        
        ## 업데이터 함수란?
        
        업데이터 함수는 상태 변경 함수에 새로운 값을 직접 전달하는 대신, 이전 상태를 받아 다음 상태를 반환하는 함수이다.
        
        ```tsx
        setCount((previousCount) => previousCount + 1);
        ```
        
        - `previousCount`: React가 전달하는 최신 이전 상태
        - `previousCount + 1`: 새롭게 저장할 다음 상태
        
        ## 업데이터 함수를 사용하는 이유
        
        React의 상태 변경은 즉시 처리되지 않을 수 있으며, 성능을 위해 여러 상태 변경을 모아서 처리하기도 한다. 따라서 현재 렌더링에서 참조한 상태값으로 다음 상태를 계산하면 오래된 값을 사용할 수 있다.
        
        ```tsx
        const [count, setCount] = useState(0);
        
        const increaseThreeTimes = () => {
          setCount(count + 1);
          setCount(count + 1);
          setCount(count + 1);
        };
        ```
        
        세 코드 모두 현재 렌더링의 `count` 값인 `0`을 참조한다.
        
        ```
        setCount(0 + 1)
        setCount(0 + 1)
        setCount(0 + 1)
        ```
        
        따라서 예상과 달리 최종 결과가 `1`이 될 수 있다.
        
        ## 업데이터 함수를 사용한 경우
        
        ```tsx
        const increaseThreeTimes = () => {
          setCount((previousCount) => previousCount + 1);
          setCount((previousCount) => previousCount + 1);
          setCount((previousCount) => previousCount + 1);
        };
        ```
        
        React는 각 업데이터 함수에 바로 이전 계산 결과를 전달한다.
        
        ```
        0 → 1 → 2 → 3
        ```
        
        따라서 최종 결과는 `3`이 된다.
        
        ## 객체 상태 업데이트
        
        이전 객체 상태를 기준으로 일부 값만 변경할 때도 업데이터 함수를 사용할 수 있다.
        
        ```tsx
        setUser((previousUser) => ({
          ...previousUser,
          age: previousUser.age + 1,
        }));
        ```
        
        이 방식은 React가 관리하는 최신 `user` 상태를 기준으로 새로운 객체를 만든다.
        
        ## 언제 사용해야 하는가?
        
        다음 상태가 이전 상태와 관계없이 정해져 있다면 값을 직접 전달해도 된다.
        
        ```tsx
        setStatus("COMPLETED");
        ```
        
        다음 상태가 이전 상태를 이용해 계산된다면 업데이터 함수를 사용하는 것이 안전하다.
        
        ```tsx
        setCount((previousCount) => previousCount + 1);
        setIsOpen((previousIsOpen) => !previousIsOpen);
        ```
        
        즉, 업데이터 함수는 React의 일괄 처리 과정에서도 가장 최신 상태를 전달받아 다음 상태를 정확하게 계산하기 위해 사용한다.
        
- 상태 공유와 Context
    - 여러 컴포넌트가 같은 상태를 사용해야 할 때 상태를 어느 컴포넌트에 두는 것이 좋을까요?
        
        ## 상태 끌어올리기
        
        여러 컴포넌트가 같은 상태를 사용해야 한다면 해당 컴포넌트들의 **가장 가까운 공통 부모 컴포넌트**에 상태를 두는 것이 좋다. 이를 상태 끌어올리기(Lifting State Up)라고 한다.
        
        ```tsx
        function Parent() {
          const [count, setCount] = useState(0);
        
          return (
            <>
              <CountDisplay count={count} />
              <CountButton onIncrease={() => setCount((prev) => prev + 1)} />
            </>
          );
        }
        ```
        
        ```tsx
        function CountDisplay({ count }: { count: number }) {
          return <p>현재 값: {count}</p>;
        }
        
        function CountButton({ onIncrease }: { onIncrease: () => void }) {
          return <button onClick={onIncrease}>증가</button>;
        }
        ```
        
        `CountDisplay`와 `CountButton`이 같은 `count` 상태를 사용하므로, 두 컴포넌트의 공통 부모인 `Parent`가 상태를 관리한다.
        
        ## 데이터 전달 방법
        
        공통 부모는 상태와 상태 변경 함수를 자식에게 `props`로 전달한다.
        
        ```
        공통 부모의 state
        ├── 자식 A: 상태값을 props로 전달받음
        └── 자식 B: 상태 변경 함수를 props로 전달받음
        ```
        
        - 상태값은 부모에서 자식으로 전달한다.
        - 자식의 이벤트는 부모가 전달한 함수를 호출하여 처리한다.
        - 실제 상태 변경은 공통 부모에서 발생한다.
        
        ## 공통 부모에 상태를 두는 이유
        
        각 자식 컴포넌트가 같은 의미의 상태를 따로 관리하면 값이 서로 달라질 수 있다.
        
        ```tsx
        function ComponentA() {
          const [count, setCount] = useState(0);
        }
        
        function ComponentB() {
          const [count, setCount] = useState(0);
        }
        ```
        
        위의 두 `count`는 이름만 같을 뿐 서로 독립적인 상태다. 한쪽의 값을 변경해도 다른 쪽에는 반영되지 않는다.
        
        공통 부모가 하나의 상태를 관리하면 모든 자식이 같은 값을 사용하므로 데이터의 일관성을 유지할 수 있다.
        
        ## 상태를 너무 높은 곳에 두면 안 되는 이유
        
        상태를 항상 최상위 컴포넌트에 둘 필요는 없다. 상태와 관계없는 컴포넌트까지 영향을 받아 구조가 복잡해지고 불필요한 리렌더링이 발생할 수 있다.
        
        따라서 상태는 다음 기준으로 배치한다.
        
        - 하나의 컴포넌트만 사용한다면 해당 컴포넌트에 둔다.
        - 형제 컴포넌트가 함께 사용한다면 가장 가까운 공통 부모에 둔다.
        - 화면 전체의 여러 컴포넌트가 사용한다면 `Context` 등을 고려한다.
        - 애플리케이션 전반의 복잡한 상태라면 전역 상태 관리 도구를 고려한다.
        
        즉, 상태는 필요한 컴포넌트들이 공유할 수 있는 범위 안에서 가능한 한 가까운 공통 부모에 두는 것이 좋다.
        
    - props 전달, 상태 끌어올리기와 Context는 각각 어떤 상황에 알맞을까요?
        
        ## Props 전달, 상태 끌어올리기, Context 비교
        
        React에서 상태를 공유하는 방법은 데이터가 필요한 컴포넌트의 범위와 관계에 따라 선택한다.
        
        | 방법 | 적합한 상황 | 특징 |
        | --- | --- | --- |
        | Props 전달 | 부모가 가까운 자식에게 데이터를 전달할 때 | 구조가 단순하고 데이터 흐름이 명확함 |
        | 상태 끌어올리기 | 여러 자식 컴포넌트가 같은 상태를 사용할 때 | 가장 가까운 공통 부모가 상태를 관리함 |
        | Context | 여러 단계 아래의 컴포넌트들이 같은 데이터를 사용할 때 | 중간 컴포넌트의 Props 전달을 생략할 수 있음 |
        
        ## 1. Props 전달
        
        부모와 자식의 거리가 가깝고 소수의 컴포넌트만 데이터를 사용한다면 `props`가 적합하다.
        
        ```tsx
        function Parent() {
          const userName = "지은";
        
          return <Profile name={userName} />;
        }
        
        function Profile({ name }: { name: string }) {
          return <p>{name}님의 프로필</p>;
        }
        ```
        
        데이터의 출처와 전달 경로가 명확하다는 장점이 있다. 하지만 컴포넌트 단계가 깊어지면 실제로 데이터를 사용하지 않는 중간 컴포넌트도 계속 `props`를 전달해야 한다.
        
        ## 2. 상태 끌어올리기
        
        형제 컴포넌트처럼 여러 컴포넌트가 같은 상태를 사용하거나 변경해야 한다면 가장 가까운 공통 부모에 상태를 둔다.
        
        ```tsx
        function Parent() {
          const [count, setCount] = useState(0);
        
          return (
            <>
              <CountDisplay count={count} />
              <CountButton onIncrease={() => setCount((prev) => prev + 1)} />
            </>
          );
        }
        ```
        
        - `CountDisplay`는 상태값을 사용한다.
        - `CountButton`은 상태를 변경한다.
        - 실제 상태는 두 컴포넌트의 공통 부모가 관리한다.
        
        같은 의미의 상태를 각 컴포넌트에서 따로 관리하여 값이 불일치하는 문제를 막을 수 있다.
        
        ## 3. Context
        
        로그인 사용자, 테마, 언어처럼 많은 컴포넌트가 공통으로 사용하고 컴포넌트 단계가 깊다면 `Context`가 적합하다.
        
        ```tsx
        const ThemeContext = createContext("light");
        
        function App() {
          return (
            <ThemeContext.Provider value="dark">
              <Header />
              <Main />
            </ThemeContext.Provider>
          );
        }
        
        function Header() {
          const theme = useContext(ThemeContext);
        
          return <p>현재 테마: {theme}</p>;
        }
        ```
        
        `Header`까지 중간 컴포넌트를 거쳐 `theme`을 전달하지 않아도 직접 값을 사용할 수 있다.
        
        다만 `Context`를 너무 많이 사용하면 데이터가 어디에서 전달되는지 파악하기 어려워질 수 있다. 값이 자주 변경되면 해당 Context를 사용하는 여러 컴포넌트가 함께 다시 렌더링될 수도 있다.
        
        ## 선택 기준
        
        - 부모와 가까운 자식에게 전달한다면 `props`
        - 여러 형제 컴포넌트가 같은 상태를 공유한다면 상태 끌어올리기
        - 멀리 떨어진 여러 컴포넌트가 공통 데이터를 사용한다면 `Context`
        
        먼저 `props`와 상태 끌어올리기로 해결하고, 전달 단계가 지나치게 깊어지는 경우 `Context`를 고려하는 것이 좋다.
        
    - 모든 값을 Context로 전달하면 어떤 문제가 생길 수 있을까요?
        
        ## 모든 값을 Context로 전달할 때의 문제
        
        `Context`를 사용하면 여러 단계의 컴포넌트를 거치지 않고 데이터를 전달할 수 있다. 하지만 모든 상태를 Context에 넣으면 코드의 구조와 성능에 문제가 생길 수 있다.
        
        ### 1. 불필요한 리렌더링
        
        Context의 `value`가 변경되면 해당 Context를 사용하는 컴포넌트들이 다시 렌더링된다.
        
        ```tsx
        <AppContext.Provider value={{ user, theme, count }}>
          <App />
        </AppContext.Provider>
        ```
        
        `count`만 변경되어도 `user`나 `theme`만 사용하는 컴포넌트까지 다시 렌더링될 수 있다. 특히 `value`에 새로운 객체를 매번 생성하면 Provider가 렌더링될 때마다 참조값이 달라진다.
        
        ### 2. 데이터 출처를 파악하기 어려움
        
        Props는 부모에서 전달된 값을 코드만 보고 확인할 수 있다.
        
        ```tsx
        <Profile user={user} />
        ```
        
        반면 Context를 사용하면 값이 어떤 Provider에서 전달되는지 컴포넌트 파일만 보고 파악하기 어려울 수 있다.
        
        ```tsx
        const user = useContext(AppContext);
        ```
        
        Context가 많아질수록 상태가 생성되고 변경되는 위치를 추적하기 어려워진다.
        
        ### 3. 컴포넌트 재사용이 어려워짐
        
        특정 Context에 의존하는 컴포넌트는 해당 Provider 밖에서 단독으로 사용하기 어렵다.
        
        ```tsx
        function Profile() {
          const user = useContext(UserContext);
        
          return <p>{user.name}</p>;
        }
        ```
        
        이 컴포넌트를 다른 화면이나 테스트에서 사용하려면 반드시 `UserContext.Provider`로 감싸야 한다.
        
        ### 4. Provider 구조가 복잡해짐
        
        기능마다 Context를 만들면 여러 Provider가 중첩될 수 있다.
        
        ```tsx
        <UserProvider>
          <ThemeProvider>
            <LanguageProvider>
              <NotificationProvider>
                <App />
              </NotificationProvider>
            </LanguageProvider>
          </ThemeProvider>
        </UserProvider>
        ```
        
        Provider가 많아질수록 애플리케이션의 초기 구조와 상태 관리 흐름이 복잡해진다.
        
        ### 5. 관련 없는 상태가 하나로 묶임
        
        모든 상태를 하나의 Context에 넣으면 로그인 정보, 테마, 알림, 입력값처럼 서로 관계없는 데이터가 하나의 거대한 객체로 관리된다. 상태 변경의 영향 범위가 커지고 유지보수가 어려워진다.
        
        ## 적절한 사용 방법
        
        - 특정 컴포넌트 내부에서만 사용하는 값은 해당 컴포넌트의 `state`로 관리한다.
        - 가까운 부모와 자식은 `props`로 전달한다.
        - 형제 컴포넌트가 공유하는 상태는 공통 부모로 끌어올린다.
        - 로그인 사용자, 테마, 언어처럼 넓은 범위에서 공통으로 사용하는 값에 Context를 사용한다.
        - 목적이 다른 데이터는 Context를 분리한다.
        
        ```tsx
        <UserContext.Provider value={user}>
          <ThemeContext.Provider value={theme}>
            <App />
          </ThemeContext.Provider>
        </UserContext.Provider>
        ```
        
        즉, Context는 모든 상태를 저장하는 공간이 아니라 여러 단계에 걸쳐 공통으로 필요한 데이터를 전달할 때 선택적으로 사용해야 한다.