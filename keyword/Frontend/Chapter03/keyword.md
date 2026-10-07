- URL과 라우팅
    - URI, URL, path와 route는 각각 무엇이며 어떤 차이가 있을까요?
    
    **URI(Uniform Resource Identifier)**는 인터넷의 리소스를 식별하는 문자열을 넓게 부르는 개념이고, **URL(Uniform Resource Locator)**은 그중에서 리소스의 위치와 접근 방법을 나타내는 주소이다.
    
    예를 들어 다음 URL이 있다고 하자.
    
    ```
    https://umcine.example/movies/10?from=search#reviews
    ```
    
    여기서 `/movies/10`은 **path**로, URL 안에서 특정 위치를 나타내는 경로이다. 반면 **route**는 URL 자체의 일부가 아니라 애플리케이션이 정의한 화면 연결 규칙이다.
    
    예를 들어:
    
    ```
    실제 path: /movies/10
    route 규칙: /movies/$movieId
    ```
    
    $movieId 자리에 `10`, `20`처럼 서로 다른 값이 들어가더라도 하나의 영화 상세 화면으로 연결할 수 있다.
    
    - path param과 search param은 각각 어떤 값을 표현할 때 사용하는 것이 좋을까요?
    
    **path param**은 특정 대상을 식별할 때 사용한다.
    
    ```
    /movies/1
    /movies/7
    ```
    
    여기서 `1`, `7`은 어떤 영화를 보여 줄지 결정하는 `movieId`이다.
    
    ```
    /movies/$movieId
    ```
    
    반면 **search param**은 검색어나 필터처럼 화면에 적용할 조건을 표현할 때 사용한다.
    
    ```
    /search?query=스파이더맨
    ```
    
    여기서 `query=스파이더맨`이 search param이다.
    
    정리하면 **“어떤 대상인가?”는 path param**, **“어떤 조건으로 보여 줄 것인가?”는 search param**으로 생각하면 이해하기 쉽다.
    
    - 검색어, 필터나 현재 화면의 상태를 URL에 포함하면 공유와 새로고침에 어떤 장점이 있을까요?
    
    검색어나 필터를 URL에 넣으면 **현재 화면의 상태를 주소 자체로 표현할 수 있다.**
    
    예를 들어:
    
    ```
    /search?query=스파이더맨
    ```
    
    이라는 주소를 다른 사람에게 보내면 동일한 검색 조건으로 화면을 열 수 있고, 새로고침을 해도 URL에서 다시 검색어를 읽어 같은 결과를 표시할 수 있다.
    
    또한 브라우저의 **뒤로 가기와 앞으로 가기**를 사용할 때도 URL과 검색 결과가 함께 바뀌기 때문에 사용자가 이전 검색 상태로 돌아가기 쉽다.
    
- SPA와 MPA
    - SPA와 MPA는 각각 무엇이며 화면을 이동하는 방식에 어떤 차이가 있을까요?
    
    *SPA(Single Page Application)**는 처음 받은 HTML 문서를 유지한 상태에서 JavaScript가 URL과 화면 내용을 변경하는 방식이다.
    
    React와 TanStack Router를 사용하는 이번 프로젝트가 이에 해당한다.
    
    ```
    / → 영화 목록
    /search → 영화 검색
    /movies/1 → 영화 상세
    ```
    
    URL은 여러 개지만 새로운 HTML 문서를 매번 받아오는 것이 아니라 React가 필요한 컴포넌트를 바꿔서 보여 준다.
    
    반면 **MPA(Multi Page Application)**는 다른 URL로 이동할 때 서버에서 새로운 HTML 문서를 받아 화면을 변경한다.
    
    - SPA의 클라이언트 내비게이션은 새로운 HTML 문서를 받는 일반적인 페이지 이동과 어떻게 다를까요?
    
    SPA에서는 `Link` 등을 이용해 이동하면 브라우저가 새로운 HTML 문서를 처음부터 다시 받아오지 않는다. 대신 현재 React 앱 안에서 URL을 변경하고 해당 route에 연결된 컴포넌트를 화면에 표시한다.
    
    예를 들어:
    
    ```
    <Link
      to="/movies/$movieId"
      params={{ movieId: String(movie.id) }}
    >
      상세 보기
    </Link>
    ```
    
    를 누르면 `/movies/1` 같은 주소로 이동하면서 영화 상세 컴포넌트가 표시된다.
    
    이번 프로젝트에서는 `Header`처럼 공통으로 사용하는 부분은 유지되고, `Outlet` 위치의 화면만 URL에 따라 변경된다. 
    
    - SPA와 MPA는 각각 어떤 서비스나 화면에 적합할까요?
    
    SPA는 사용자가 화면을 자주 이동하거나 버튼·검색·필터 등과 많이 상호작용하는 서비스에 잘 어울린다. 예를 들어 관리자 페이지, 메일 서비스, 영화 검색 서비스처럼 **한 앱 안에서 여러 기능을 빠르게 오가는 경우**에 사용할 수 있다.
    
    MPA는 페이지마다 내용이 비교적 독립적이고, 각 URL에서 별도의 문서를 제공하는 구조에 잘 어울릴 수 있다.
    
    예를 들어 단순한 회사 소개 사이트나 문서 중심 사이트처럼 페이지 간 기능 연결이 많지 않다면 MPA 구조도 적합할 수 있다.
    
    중요한 것은 SPA가 무조건 더 좋거나 MPA가 무조건 더 좋은 것이 아니라 **서비스의 화면 구조와 사용자 상호작용 방식에 따라 선택하는 것**이다.
    
- Tailwind CSS
    - CSS 규칙을 직접 작성하는 방식과 비교했을 때 Tailwind CSS의 특징은 무엇일까요?
    
    일반 CSS에서는 클래스 이름을 만들고 스타일을 CSS 파일에 따로 작성한다.
    
    ```
    .movie-card {
      border-radius: 10px;
      background-color: white;
      overflow: hidden;
    }
    ```
    
    Tailwind CSS에서는 작은 역할을 가진 **utility class**들을 `className`에 직접 조합한다.
    
    ```
    <article className="overflow-hidden rounded-[10px] bg-white">
    ```
    
    따라서 JSX를 보면서 해당 요소에 어떤 스타일이 적용되는지 바로 확인하기 쉽다.
    
    또 `sm:`, `lg:`, `xl:` 같은 접두사를 사용하면 별도의 미디어 쿼리를 직접 작성하지 않고도 반응형 스타일을 적용할 수 있다.
    
    - styled-components와 Tailwind CSS는 스타일을 작성하고 생성하는 방식이 어떻게 다를까요?
    
    **styled-components**는 JavaScript 또는 TypeScript 파일 안에서 CSS 문법을 사용해 스타일이 적용된 컴포넌트를 만드는 CSS-in-JS 방식이다.
    
    예를 들면 개념적으로 다음과 같다.
    
    ```
    const Button = styled.button`
      background-color: blue;
      color: white;
    `;
    ```
    
    반면 **Tailwind CSS**는 이미 정의된 utility class를 JSX의 `className`에 조합한다.
    
    ```
    <button className="bg-blue-600 text-white">
      버튼
    </button>
    ```
    
    즉, styled-components는 **스타일이 적용된 컴포넌트를 만들어 사용하는 방식**, Tailwind CSS는 **작은 스타일 클래스를 조합해 요소를 꾸미는 방식**이라고 이해하면 된다.
    
    - Tailwind CSS에서 `bg-${color}-500`처럼 class 이름을 동적으로 조합하면 스타일이 생성되지 않을 수 있는 이유는 무엇일까요?
    
    Tailwind CSS는 빌드 과정에서 소스 코드에 작성된 **완성된 class 이름을 찾아 필요한 CSS를 생성**한다.
    
    따라서 다음처럼 class 이름의 일부를 변수로 조립하면:
    
    ```
    className={`bg-${color}-500`}
    ```
    
    실제 실행 전에는 `bg-blue-500`인지 `bg-red-500`인지 알 수 없기 때문에 Tailwind가 필요한 클래스를 찾지 못할 수 있다.
    
    그래서 다음처럼 **완성된 class 이름을 직접 작성하여 선택하는 방식**을 사용하는 것이 좋다.
    
    ```
    className={
      isBookmarked
        ? "bg-blue-600"
        : "bg-black/60"
    }
    ```
    
    워크북의 북마크 버튼도 같은 방식으로 상태에 따라 완성된 클래스를 선택한다.
    
    - 상태에 따라 달라지는 스타일은 완성된 class 이름의 매핑이나 CSS 변수를 이용해 어떻게 표현할 수 있을까요?
    
    상태에 따라 디자인이 달라질 때는 조건마다 **완성된 Tailwind class를 준비하고 선택**하는 방법을 사용할 수 있다.
    
    예를 들어 북마크 여부에 따라 버튼 색상을 바꾸려면:
    
    ```
    <button
      className={
        movie.isBookmarked
          ? "bg-blue-600"
          : "bg-black/60"
      }
    >
      북마크
    </button>
    ```
    
    처럼 작성할 수 있다.
    
    조건이 많아지면 객체에 class를 미리 저장해 둘 수도 있다.
    
    ```
    const bookmarkStyle = {
      active: "bg-blue-600 text-white",
      inactive: "bg-gray-200 text-black",
    };
    
    <button
      className={
        bookmarkStyle[
          movie.isBookmarked ? "active" : "inactive"
        ]
      }
    >
      북마크
    </button>
    ```
    
    여러 공통 클래스와 조건부 클래스를 함께 사용한다면 이번 프로젝트처럼 `cn()` 함수를 사용할 수 있다.
    
    ```
    className={cn(
      "rounded-lg p-2",
      movie.isBookmarked
        ? "bg-blue-600"
        : "bg-black/60",
    )}
    ```
    
    `cn()`은 `clsx`로 조건에 맞는 클래스를 합치고, `tailwind-merge`를 이용해 서로 충돌하는 Tailwind 클래스를 정리하기 위한 유틸 함수이다.