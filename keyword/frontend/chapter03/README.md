# chapter03

- URL과 라우팅
    - URI, URL, path와 route는 각각 무엇이며 어떤 차이가 있을까요?
        
        ## URI, URL, Path와 Route의 차이
        
        - URI(Uniform Resource Identifier)**는 인터넷에서 특정 자원을 **식별하기 위한 정보**를 의미한다.
        - URL(Uniform Resource Locator)**은 URI의 한 종류로, 특정 자원이 **어디에 있는지 위치까지 나타내는 주소**이다.
        
        예를 들어 다음과 같은 URL이 있다고 해보자.
        
        ```
        https://example.com/movies/1
        ```
        
        여기서 전체 주소는 URL이고,
        
        ```
        /movies/1
        ```
        
        부분은 **Path**이다.
        
        Path는 URL에서 **어떤 페이지나 자원에 접근할 것인지를 나타내는 경로**이다.
        
        **Route**는 이러한 Path와 실제로 보여줄 화면을 **연결해 놓은 규칙**이다.
        
        이번 영화 프로젝트에서는 TanStack Router를 이용해 다음과 같이 연결했다.
        
        ```
        /                 → 영화 목록 화면
        /search           → 영화 검색 화면
        /movies/$movieId  → 영화 상세 화면
        ```
        
        예를 들어 사용자가 `/search`에 접근하면 해당 경로와 연결된 `SearchPage`가 화면에 표시된다.
        
        따라서 **URI는 자원을 식별하는 전체적인 개념이고, URL은 자원의 위치를 나타내는 주소, Path는 URL 안에서 자원의 경로를 나타내는 부분, Route는 Path와 실제 화면을 연결하는 규칙**이라고 볼 수 있다.
        
    - path param과 search param은 각각 어떤 값을 표현할 때 사용하는 것이 좋을까요?
        
        ## Path Param과 Search Param의 차이
        
        **Path Param**은 특정 자원을 구분하기 위한 값을 URL의 Path 안에 포함하는 방식이다.
        
        이번 프로젝트의 영화 상세 화면이 예시이다.
        
        ```
        /movies/1
        /movies/2
        /movies/3
        ```
        
        여기서 `1`, `2`, `3`은 각각 어떤 영화를 보여줄 것인지 구분하는 영화 ID이다.
        
        TanStack Router에서는 다음과 같이 표현했다.
        
        ```
        /movies/$movieId
        ```
        
        예를 들어 `/movies/1`에 접근하면 `movieId` 값으로 `1`을 받아 ID가 1인 영화 데이터를 찾아 화면에 표시할 수 있다.
        
        따라서 Path Param은 **영화 ID, 사용자 ID, 게시글 ID처럼 특정 대상을 구분하는 값**을 표현할 때 사용하기 좋다.
        
        반면 **Search Param**은 URL의 `?` 뒤에 `key=value` 형태로 값을 추가하는 방식이다.
        
        이번 프로젝트에서는 검색어를 다음과 같이 URL에 포함했다.
        
        ```
        /search?query=스파이더맨
        ```
        
        여기서
        
        ```
        query=스파이더맨
        ```
        
        이 Search Param이다.
        
        여러 조건을 함께 사용한다면 `&`로 연결할 수도 있다.
        
        ```
        /movies?genre=action&sort=latest
        ```
        
        Search Param은 **검색어, 필터, 정렬, 페이지 번호처럼 어떤 결과를 보여줄지 결정하는 조건**을 표현할 때 사용하기 좋다.
        
        ```
        Path Param
        /movies/1
        → 어떤 영화를 볼 것인지 표현
        
        Search Param
        /search?query=스파이더맨
        → 어떤 검색 조건으로 결과를 볼 것인지 표현
        ```
        
    - 검색어, 필터나 현재 화면의 상태를 URL에 포함하면 공유와 새로고침에 어떤 장점이 있을까요?
        
        ## 검색어나 화면 상태를 URL에 포함하는 이유
        
        검색어, 필터, 정렬과 같은 화면의 상태를 URL에 포함하면 **현재 보고 있는 화면을 URL 자체로 표현할 수 있다.**
        
        예를 들어 사용자가 `스파이더맨`을 검색했는데 URL이 단순히 다음과 같다면,
        
        ```
        /search
        ```
        
        URL만 보고는 어떤 검색 결과를 보고 있는지 알기 어렵다.
        
        반면 검색어를 Search Param으로 포함하면,
        
        ```
        /search?query=스파이더맨
        ```
        
        현재 `스파이더맨`을 검색한 상태라는 것을 URL만으로도 알 수 있다.
        
        이렇게 화면의 상태를 URL에 포함하면 **공유하기 쉽다는 장점**이 있다. 위 URL을 다른 사람에게 전달하면 상대방도 URL의 `query` 값을 이용해 동일한 검색 결과를 볼 수 있다.
        
        또한 **새로고침을 해도 상태를 복원하기 쉽다.**
        
        ```
        스파이더맨 검색
                ↓
        /search?query=스파이더맨
                ↓
        새로고침
                ↓
        URL에서 query 값을 다시 읽음
                ↓
        스파이더맨 검색 결과 다시 표시
        ```
        
        검색어를 React의 내부 상태에만 저장했다면 새로고침하면서 상태가 사라질 수 있지만, URL에 저장해 두면 애플리케이션이 URL의 값을 다시 읽어 같은 화면을 구성할 수 있다.
        
        이번 영화 프로젝트에서도 검색어를 `query`에 포함했기 때문에 `/search?query=스파이더맨`과 같은 주소로 **검색 상태를 표현하고, URL에 직접 접근하거나 새로고침해도 해당 검색 결과를 다시 보여줄 수 있도록 구현했다.**
        
- SPA와 MPA
    - SPA와 MPA는 각각 무엇이며 화면을 이동하는 방식에 어떤 차이가 있을까요?
        
        ## SPA와 MPA란?
        
        - *SPA(Single Page Application)**는 처음 웹 사이트에 접속할 때 하나의 HTML 문서를 받아온 뒤, 이후에는 새로운 HTML 문서를 계속 받아오는 대신 **필요한 화면만 변경해서 보여주는 방식**이다.
        
        React로 만든 웹 애플리케이션에서 많이 사용하는 방식이며, 이번 영화 프로젝트도 SPA 방식으로 구현했다.
        
        예를 들어 이번 프로젝트에는 다음과 같은 화면이 있다.
        
        ```
        /                 → 영화 목록
        /search           → 영화 검색
        /movies/1         → 영화 상세
        ```
        
        각각 URL은 다르지만 화면을 이동할 때마다 새로운 HTML 문서를 서버에서 받아오는 것은 아니다. TanStack Router가 URL을 확인하고 해당 URL에 연결된 React 컴포넌트를 화면에 보여준다.
        
        ```
        영화 목록
           ↓ 영화 클릭
        /movies/1
           ↓
        TanStack Router가 URL 확인
           ↓
        MovieDetailPage 표시
        ```
        
        반면 **MPA(Multi Page Application)**는 여러 개의 HTML 페이지로 구성되며, 다른 페이지로 이동할 때 **서버에 새로운 페이지를 요청하고 새로운 HTML 문서를 받아오는 방식**이다.
        
        ```
        영화 목록 페이지
           ↓ 영화 클릭
        서버에 새로운 페이지 요청
           ↓
        새로운 HTML 문서 응답
           ↓
        영화 상세 페이지 표시
        ```
        
        따라서 SPA는 **현재 웹 애플리케이션을 유지하면서 필요한 화면을 변경**하고, MPA는 일반적으로 **페이지를 이동할 때 새로운 HTML 문서를 받아 화면을 표시한다**는 차이가 있다.
        
    - SPA의 클라이언트 내비게이션은 새로운 HTML 문서를 받는 일반적인 페이지 이동과 어떻게 다를까요?
        
        ## SPA의 클라이언트 내비게이션이란?
        
        - *클라이언트 내비게이션(Client Navigation)**은 서버에서 새로운 HTML 문서를 받아오지 않고 **브라우저에서 URL을 변경하고 그에 맞는 화면을 보여주는 방식**이다.
        
        이번 프로젝트에서는 TanStack Router의 `Link`를 이용해 클라이언트 내비게이션을 구현했다.
        
        ```tsx
        <Link
          to="/movies/$movieId"
          params={{ movieId: String(movie.id) }}
        >
          상세 보기
        </Link>
        ```
        
        검색 결과에서 `상세 보기`를 누르면 다음과 같이 URL이 변경된다.
        
        ```
        /search?query=스파이더맨
                ↓
        /movies/1
        ```
        
        이때 서버에서 새로운 HTML 문서 전체를 다시 받아오는 것이 아니다.
        
        ```
        Link 클릭
           ↓
        URL 변경
           ↓
        TanStack Router가 URL 확인
           ↓
        해당 Route 확인
           ↓
        MovieDetailPage 렌더링
        ```
        
        반면 새로운 HTML 문서를 받는 일반적인 페이지 이동은 다음과 같이 동작한다.
        
        ```
        링크 클릭
           ↓
        서버에 새로운 페이지 요청
           ↓
        새로운 HTML 문서 응답
           ↓
        브라우저가 새로운 문서 표시
        ```
        
        따라서 SPA의 클라이언트 내비게이션은 **현재 애플리케이션을 유지하면서 필요한 화면만 변경한다는 점**에서 새로운 HTML 문서를 받아오는 일반적인 페이지 이동과 차이가 있다.
        
    - SPA와 MPA는 각각 어떤 서비스나 화면에 적합할까요?
        
        ## SPA와 MPA는 각각 어디에 적합할까?
        
        **SPA**는 사용자가 여러 화면을 자주 이동하거나 화면의 내용이 계속 변경되는 등 **상호작용이 많은 웹 애플리케이션**에 적합하다.
        
        예를 들어 관리자 대시보드, 웹 메일, 채팅 서비스, 프로젝트 관리 서비스처럼 사용자가 버튼이나 메뉴를 자주 사용하면서 여러 화면을 이동하는 서비스에서 활용하기 좋다.
        
        이번 영화 프로젝트 역시 영화 목록, 검색, 검색 결과, 영화 상세 화면을 자주 이동하기 때문에 SPA 방식으로 구현할 수 있다.
        
        반면 **MPA**는 각각의 페이지가 비교적 독립적인 콘텐츠를 제공하는 서비스에 활용하기 좋다. 뉴스나 기사 중심의 사이트, 문서 중심의 사이트, 회사 소개 사이트처럼 각 페이지의 콘텐츠가 명확하게 구분되는 경우가 예시가 될 수 있다.
        
        다만 실제 웹 서비스에서는 SPA와 MPA를 반드시 둘 중 하나의 형태로만 구현하는 것은 아니며, **서비스의 구조와 사용하는 기술에 따라 여러 방식을 함께 활용할 수도 있다.**
        
- Tailwind CSS
    - CSS 규칙을 직접 작성하는 방식과 비교했을 때 Tailwind CSS의 특징은 무엇일까요?
        
        ## 직접 CSS를 작성하는 방식과 Tailwind CSS의 차이
        
        일반적인 CSS 방식에서는 HTML이나 JSX에 `class` 이름을 지정하고, 별도의 CSS 파일에서 해당 class의 스타일을 직접 작성한다.
        
        예를 들어 검색 버튼을 만든다면 다음과 같이 작성할 수 있다.
        
        ```
        <button className="search-button">검색</button>
        ```
        
        ```
        .search-button {
          height: 42px;
          padding: 0 17px;
          border-radius: 8px;
          background-color: #17191e;
          color: white;
          font-weight: 700;
        }
        ```
        
        반면 **Tailwind CSS**는 `bg`, `px`, `rounded`처럼 미리 정의된 작은 단위의 **Utility Class**를 조합하여 JSX에서 바로 스타일을 적용한다.
        
        이번 영화 프로젝트의 검색 버튼도 다음과 같이 작성했다.
        
        ```
        <button
          type="submit"
          className="h-[42px] rounded-lg bg-[#17191e] px-[17px] text-sm font-bold text-white"
        >
          검색
        </button>
        ```
        
        따라서 별도의 CSS class 이름을 만들고 CSS 파일을 작성하는 대신, **요소에 필요한 스타일을 Utility Class로 직접 조합할 수 있다는 것**이 Tailwind CSS의 특징이다.
        
        이번 프로젝트에서도 기존 `App.css`의 스타일을 Tailwind CSS로 옮기면서 화면의 크기, 간격, 배경색, 글자 크기 등을 JSX의 class로 표현했다.
        
    - styled-components와 Tailwind CSS는 스타일을 작성하고 생성하는 방식이 어떻게 다를까요?
        
        ## styled-components와 Tailwind CSS의 차이
        
        **styled-components**는 JavaScript 또는 TypeScript 코드 안에서 CSS 문법을 작성하여 스타일이 적용된 컴포넌트를 만드는 방식이다.
        
        예를 들어 버튼을 만든다면 다음과 같이 표현할 수 있다.
        
        ```
        const SearchButton = styled.button`
          height: 42px;
          padding: 0 17px;
          border-radius: 8px;
          background-color: #17191e;
          color: white;
        `;
        ```
        
        그리고 만들어진 컴포넌트를 사용한다.
        
        ```
        <SearchButton>검색</SearchButton>
        ```
        
        반면 Tailwind CSS에서는 별도의 스타일 컴포넌트를 만드는 대신 **미리 정의된 Utility Class를 요소의 `className`에 작성**한다.
        
        ```
        <button className="h-[42px] rounded-lg bg-[#17191e] px-[17px] text-white">
          검색
        </button>
        ```
        
        즉, styled-components는 **CSS 문법을 이용해 스타일이 적용된 컴포넌트를 만들어 사용하는 방식**이고, Tailwind CSS는 **Utility Class를 조합하여 요소에 스타일을 적용하는 방식**이라는 차이가 있다.
        
    - Tailwind CSS에서 `bg-${color}-500`처럼 class 이름을 동적으로 조합하면 스타일이 생성되지 않을 수 있는 이유는 무엇일까요?
        
        ## Tailwind CSS에서 class 이름을 동적으로 만들면 안 되는 이유
        
        Tailwind CSS에서는 다음처럼 class 이름의 일부를 변수로 만들어 사용하는 것을 피해야 한다.
        
        ```tsx
        const color = "blue";
        
        <div className={`bg-${color}-500`}>
          내용
        </div>
        ```
        
        코드를 실행하면 최종적으로 `bg-blue-500`이 만들어질 것 같지만, Tailwind CSS는 일반적으로 소스 코드에서 사용된 class 이름을 확인하여 필요한 CSS를 생성한다.
        
        그런데 위 코드에는 완성된 `bg-blue-500`이라는 문자열이 직접 작성되어 있지 않고,
        
        ```
        bg-${color}-500
        ```
        
        처럼 나누어져 있다.
        
        따라서 Tailwind가 `bg-blue-500`이 필요하다는 것을 알아내지 못해 **해당 스타일이 생성되지 않을 수 있다.**
        
        그래서 Tailwind에서는 가능하면 다음과 같이 **완성된 class 이름이 코드에 존재하도록 작성하는 것**이 좋다.
        
        ```tsx
        const colorClass = {
          blue: "bg-blue-500",
          red: "bg-red-500",
        };
        ```
        
        이 경우 `bg-blue-500`, `bg-red-500`이라는 완성된 class 이름이 코드에 존재하기 때문에 Tailwind가 필요한 스타일을 확인할 수 있다.
        
    - 상태에 따라 달라지는 스타일은 완성된 class 이름의 매핑이나 CSS 변수를 이용해 어떻게 표현할 수 있을까요?
        
        ## 상태에 따라 달라지는 스타일을 표현하는 방법
        
        버튼의 선택 여부처럼 **상태에 따라 스타일이 달라져야 하는 경우**에는 완성된 Tailwind class 이름을 조건에 따라 선택하도록 만들 수 있다.
        
        예를 들어 페이지네이션에서 현재 페이지인지에 따라 배경색을 변경한다고 해보자.
        
        ```tsx
        className={
          isActive
            ? "bg-[#2563eb] text-white"
            : "bg-transparent text-[#606774]"
        }
        ```
        
        이 경우 두 경우 모두 `bg-[#2563eb]`, `bg-transparent`처럼 **완성된 class 이름을 코드에 작성**하고 상태에 따라 하나를 선택한다.
        
        이번 영화 프로젝트에서는 이러한 조건부 class를 더 깔끔하게 작성하기 위해 `cn` 함수를 사용했다.
        
        ```tsx
        <button
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            isActive
              ? "bg-[#2563eb] text-white"
              : "bg-transparent text-[#606774]",
          )}
        >
          1
        </button>
        ```
        
        색상처럼 값 자체가 매우 동적으로 변해야 하는 경우에는 **CSS 변수**를 이용할 수도 있다.
        
        ```tsx
        <div
          style={{ "--button-color": color } as React.CSSProperties}
          className="bg-[var(--button-color)]"
        >
          내용
        </div>
        ```
        
        여기서는 Tailwind class 자체인 `bg-[var(--button-color)]`는 항상 동일하고, 실제 색상 값만 CSS 변수인 `--button-color`를 통해 변경된다.
        
        따라서 상태에 따라 스타일을 변경해야 한다면 `bg-${color}-500`처럼 class 이름의 일부를 동적으로 만드는 것보다 **완성된 class 이름을 조건에 따라 선택하거나, 필요한 경우 CSS 변수의 값을 변경하는 방식**으로 표현하는 것이 적절하다.
