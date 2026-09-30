- URL과 라우팅
    - URI, URL, path와 route는 각각 무엇이며 어떤 차이가 있을까요?
    - path param과 search param은 각각 어떤 값을 표현할 때 사용하는 것이 좋을까요?
    - 검색어, 필터나 현재 화면의 상태를 URL에 포함하면 공유와 새로고침에 어떤 장점이 있을까요?
    
    # URL과 라우팅
    
    웹 서비스를 사용할 때는 주소를 통해 원하는 화면에 접근한다.
    
    도서 목록을 보거나 특정 책의 상세 화면으로 이동할 때, 애플리케이션은 **현재 주소가 어떤 화면을 의미하는지 판단**해야 한다.
    
    이때 사용하는 개념이 **URI, URL, path, route**이다.
    
    ---
    
    ## URI와 URL
    
    ### URI
    
    > 자원을 **식별하기 위한 식별자**
    > 
    
    URI는 **Uniform Resource Identifier**의 약자이다.
    
    여기서 자원은 웹페이지, 이미지, 문서 등 식별할 수 있는 대상을 의미한다.
    
    ### URL
    
    > 자원의 **위치와 접근 방법을 나타내는 주소**
    > 
    
    URL은 **Uniform Resource Locator**의 약자이다.
    
    일반적인 웹 주소는 URL에 해당한다.
    
    ```
    https://example.com/books/42
    ```
    
    위 주소는 HTTPS를 사용해 `example.com`의 `/books/42`에 접근한다는 의미이다.
    
    전통적인 URI 분류에서 **URL은 URI의 한 종류**이다.
    
    ```
    URI → 자원을 식별하는 더 넓은 개념
    URL → 위치와 접근 방법으로 자원을 식별하는 주소
    ```
    
    따라서 위 웹 주소는 URL이면서 URI이기도 하다. 실제 웹 개발에서는 두 용어를 혼용하기도 하지만, 개념을 구분할 때는 **식별과 위치**에 초점을 맞추면 된다. MDN URI 설명
    
    ---
    
    ## URL의 구성
    
    다음 주소를 나누어 살펴보자.
    
    ```
    https://example.com/books/42?tab=reviews&sort=latest#review-list
    ```
    
    | 구성 요소 | 예시 | 의미 |
    | --- | --- | --- |
    | Scheme | `https` | 접근에 사용하는 방식 |
    | Host | `example.com` | 요청을 보낼 호스트 |
    | Path | `/books/42` | 해당 호스트 안에서 접근할 경로 |
    | Query | `tab=reviews&sort=latest` | 경로와 함께 전달하는 추가 데이터 |
    | Fragment | `review-list` | 문서 내부 위치 등을 나타내는 부분 |
    
    쿼리는 `?` 뒤에, 프래그먼트는 `#` 뒤에 작성한다.
    
    프래그먼트는 일반적인 HTTP 요청에서 서버로 전달되지 않고 브라우저 측에서 처리된다. 예를 들어 특정 제목이나 영역으로 스크롤하는 데 사용할 수 있다.
    
    또한 **path가 실제 서버의 폴더나 파일 구조와 일치할 필요는 없다.** `/books/42`를 어떤 화면이나 처리와 연결할지는 애플리케이션이 결정한다. MDN URI 구성 설명
    
    ---
    
    ## Path
    
    > URL에서 **접근할 경로를 나타내는 부분**
    > 
    
    다음 주소의 path는 `/books/42`이다.
    
    ```
    https://example.com/books/42
                        └───────┘
                           path
    ```
    
    도서 서비스에서는 경로를 다음과 같이 설계할 수 있다.
    
    ```
    /books       → 도서 목록
    /books/42    → 42번 도서 상세
    /books/42/edit → 42번 도서 수정
    ```
    
    여기서 path는 **주소에 실제로 들어 있는 경로 값**이다.
    
    ---
    
    ## Route와 Routing
    
    ### Route
    
    > 특정 주소 패턴과 **화면 또는 처리 로직을 연결하는 규칙**
    > 
    
    예를 들어 다음과 같은 규칙을 정할 수 있다.
    
    ```
    /books         → 도서 목록 화면
    /books/:bookId → 도서 상세 화면
    ```
    
    `/books/:bookId`는 여러 도서 상세 주소를 처리하기 위한 패턴이다.
    
    ```
    /books/10 → bookId가 10인 도서 상세
    /books/42 → bookId가 42인 도서 상세
    ```
    
    여기서 `:bookId` 표기는 React Router 등에서 사용하는 방식이며, 프레임워크에 따라 표기법은 다를 수 있다.
    
    ### Routing
    
    > 현재 주소에 맞는 route를 찾아 **해당 화면이나 처리를 선택하는 과정**
    > 
    
    React Router에서는 다음처럼 표현할 수 있다.
    
    ```
    <Routes>
      <Route path="/books" element={<BookListPage />} />
      <Route path="/books/:bookId" element={<BookDetailPage />} />
    </Routes>
    ```
    
    → 현재 경로가 `/books/42`라면 도서 상세 화면을 선택함
    
    | 구분 | 의미 | 예시 |
    | --- | --- | --- |
    | Path | 실제 URL에 포함된 경로 | `/books/42` |
    | Route | 경로와 화면을 연결하는 규칙 | `/books/:bookId` → 상세 화면 |
    | Routing | 규칙을 적용해 화면을 선택하는 과정 | 42번 도서 상세 화면 표시 |
    
    즉, **path는 주소의 일부이고, route는 그 주소를 어떻게 처리할지 정한 규칙**이다. React Router 라우팅 설명
    
    ---
    
    ## Path Parameter
    
    > 경로의 일부를 변수처럼 사용하여 **특정 대상을 식별하는 값**
    > 
    
    다음 route가 있다고 하자.
    
    ```
    /books/:bookId
    ```
    
    사용자가 `/books/42`에 접근하면 `bookId`에 해당하는 값은 `42`이다.
    
    ```
    /books/42
           └─ bookId
    ```
    
    React Router에서는 다음처럼 읽을 수 있다.
    
    ```
    import { useParams } from "react-router";
    
    function BookDetailPage() {
      const { bookId } = useParams();
    
      return <h1>도서 번호: {bookId}</h1>;
    }
    ```
    
    Path parameter는 일반적으로 다음과 같은 값을 표현하기 좋다.
    
    | 값 | 예시 |
    | --- | --- |
    | 특정 도서의 ID | `/books/42` |
    | 특정 사용자의 ID | `/users/7` |
    | 특정 게시글의 slug | `/posts/react-routing` |
    
    라우터에서 읽은 값은 일반적으로 문자열이므로, 숫자가 필요한 경우 변환하고 유효성을 확인해야 한다. React Router 동적 경로 설명
    
    ---
    
    ## Search Parameter
    
    > URL의 쿼리 문자열에 포함된 **이름과 값 형태의 데이터**
    > 
    
    Search parameter는 흔히 **query parameter**라고도 부른다.
    
    ```
    /books?keyword=react&category=frontend&page=2
    ```
    
    | 이름 | 값 | 의미 |
    | --- | --- | --- |
    | `keyword` | `react` | 검색어 |
    | `category` | `frontend` | 카테고리 필터 |
    | `page` | `2` | 현재 페이지 |
    
    이 값들은 `URLSearchParams`로 읽을 수 있다.
    
    ```
    const params = new URLSearchParams(
      "?keyword=react&category=frontend&page=2"
    );
    
    const keyword = params.get("keyword");   // "react"
    const category = params.get("category"); // "frontend"
    const page = params.get("page");         // "2"
    ```
    
    `get()`은 값이 있으면 문자열을, 없으면 `null`을 반환한다.
    
    따라서 페이지 번호처럼 숫자로 사용할 값은 변환과 검증이 필요하다.
    
    ```
    const rawPage = Number(params.get("page") ?? "1");
    
    const page =
      Number.isInteger(rawPage) && rawPage >= 1
        ? rawPage
        : 1;
    ```
    
    → 페이지 번호가 없거나 올바르지 않으면 1페이지로 처리함. MDN URLSearchParams 설명
    
    ---
    
    ## Path Parameter와 Search Parameter의 차이
    
    | 구분 | Path parameter | Search parameter |
    | --- | --- | --- |
    | 위치 | 경로 안 | `?` 뒤의 쿼리 문자열 |
    | 주된 용도 | 특정 대상 식별 | 검색, 필터, 정렬, 페이지 등 |
    | 예시 | `/books/42` | `/books?category=fiction` |
    | 생각할 기준 | 어떤 대상을 보는가? | 어떤 조건으로 보는가? |
    
    예를 들어,
    
    ```
    /books/42?tab=reviews
    ```
    
    는 다음과 같이 해석할 수 있다.
    
    ```
    bookId = 42
    → 42번 도서를 본다.
    
    tab = reviews
    → 해당 도서의 리뷰 탭을 본다.
    ```
    
    다만 이것은 **일반적인 설계 기준이지 강제된 규칙은 아니다.**
    
    카테고리를 `/categories/fiction/books`처럼 경로에 표현할 수도 있다. 서비스에서 해당 값을 독립적인 탐색 대상으로 보는지, 목록의 필터 조건으로 보는지에 따라 선택할 수 있다.
    
    ---
    
    ## 화면 상태를 URL에 포함하는 이유
    
    검색어나 필터를 컴포넌트 내부 상태에만 저장하면, 다른 사람이 같은 주소를 열었을 때 같은 조건이 적용되지 않을 수 있다.
    
    ```
    주소: /books
    
    화면 내부 상태:
    검색어 = react
    카테고리 = frontend
    페이지 = 2
    ```
    
    반면 상태를 URL로 표현하면,
    
    ```
    /books?keyword=react&category=frontend&page=2
    ```
    
    주소만으로 어떤 조건의 화면인지 알 수 있다.
    
    ### 공유와 북마크
    
    상대방이 링크를 열었을 때 같은 검색 조건과 필터를 적용할 수 있다.
    
    북마크로 저장한 뒤 다시 방문할 때도 해당 조건을 복원할 수 있다.
    
    ### 새로고침
    
    새로고침하면 메모리에만 있던 상태는 사라질 수 있다.
    
    하지만 URL에서 검색어와 필터를 읽어 초기 상태를 구성하면 같은 조건으로 다시 조회할 수 있다.
    
    ```
    URL 읽기
       ↓
    검색어·필터·페이지 해석
       ↓
    해당 조건으로 데이터 조회
       ↓
    화면 표시
    ```
    
    단, **URL에 값을 넣는 것만으로 자동 복원되는 것은 아니다.** 애플리케이션이 그 값을 읽고 화면에 반영하도록 구현해야 한다.
    
    또한 같은 조건을 복원하더라도 그사이 데이터가 변경되었다면 조회 결과 자체는 달라질 수 있다.
    
    ---
    
    ## 뒤로 가기와 상태 변경
    
    검색 조건을 바꿀 때 방문 기록을 추가하면 뒤로 가기로 이전 조건으로 돌아갈 수 있다.
    
    | 방식 | 의미 |
    | --- | --- |
    | `push` | 새로운 방문 기록 추가 |
    | `replace` | 현재 방문 기록 변경 |
    
    예를 들어 검색창에서 글자를 입력할 때마다 기록을 추가하면 뒤로 가기를 지나치게 많이 눌러야 할 수 있다.
    
    따라서 서비스 동작에 따라 다음처럼 구분할 수 있다.
    
    ```
    검색 버튼을 눌러 검색 확정
    → 새 기록 추가
    
    입력 중인 검색어를 URL에 반영
    → 현재 기록 교체를 고려
    ```
    
    History API는 문서를 새로 불러오지 않고 주소와 방문 기록을 바꿀 수 있다. 다만 **주소를 바꾸는 것과 화면을 갱신하는 것은 별도의 작업**이며, 일반적으로 라우터가 이를 연결한다.
    
- SPA와 MPA
    - SPA와 MPA는 각각 무엇이며 화면을 이동하는 방식에 어떤 차이가 있을까요?
    - SPA의 클라이언트 내비게이션은 새로운 HTML 문서를 받는 일반적인 페이지 이동과 어떻게 다를까요?
    - SPA와 MPA는 각각 어떤 서비스나 화면에 적합할까요?
    
    # SPA와 MPA
    
    웹 애플리케이션에서 화면을 이동하는 방식은 크게 **MPA**와 **SPA**로 나누어 이해할 수 있다.
    
    핵심 차이는 **이동할 때 새로운 HTML 문서로 전환하는가, 현재 문서를 유지하면서 화면을 갱신하는가**이다.
    
    ---
    
    ## MPA
    
    > 여러 HTML 문서를 기반으로 구성되는 **Multi-Page Application**
    > 
    
    일반적인 MPA에서는 다른 페이지로 이동할 때 브라우저가 해당 주소의 문서를 요청한다.
    
    ```
    도서 목록 페이지
           ↓
    도서 상세 링크 클릭
           ↓
    서버에 상세 페이지 요청
           ↓
    새 HTML 문서 수신
           ↓
    상세 페이지 표시
    ```
    
    예를 들어 다음 링크를 클릭하면 일반적인 문서 내비게이션이 발생한다.
    
    ```
    <a href="/books/42">도서 상세 보기</a>
    ```
    
    새 페이지의 HTML은 서버에서 동적으로 생성될 수도 있고, 미리 만들어 둔 정적 파일일 수도 있다.
    
    따라서 **MPA라고 반드시 요청마다 서버가 HTML을 새로 생성하는 것은 아니다.**
    
    또한 CSS, JavaScript, 이미지 등의 자원은 캐시를 활용할 수 있으므로 페이지 이동 때마다 모든 파일을 반드시 다시 내려받는 것도 아니다.
    
    ---
    
    ## SPA
    
    > 하나의 웹 문서를 바탕으로, JavaScript를 사용해 필요한 화면을 갱신하는 **Single-Page Application**
    > 
    
    SPA에서는 최초 진입 후 내부 화면을 이동할 때 문서 전체를 교체하지 않고 필요한 내용을 변경할 수 있다.
    
    ```
    최초 접속
       ↓
    HTML과 JavaScript 로드
       ↓
    도서 목록 표시
       ↓
    도서 상세 링크 클릭
       ↓
    클라이언트 라우터가 이동 처리
       ↓
    필요한 데이터·코드 로드
       ↓
    현재 문서 안에서 상세 화면 표시
    ```
    
    SPA의 **Single Page**는 화면이 하나뿐이라는 뜻이 아니다.
    
    하나의 문서 안에서 목록, 상세, 수정 등 여러 화면을 표현할 수 있다.
    
    ---
    
    ## 클라이언트 내비게이션
    
    > 브라우저의 JavaScript가 주소 변경과 화면 전환을 처리하는 방식
    > 
    
    React Router를 사용한다면 다음처럼 내부 링크를 작성할 수 있다.
    
    ```
    import { Link } from "react-router";
    
    function BookItem() {
      return <Link to="/books/42">도서 상세 보기</Link>;
    }
    ```
    
    일반적인 같은 탭 클릭에서는 라우터가 문서 전체 이동을 대신 처리하여, 주소에 맞는 화면을 보여준다.
    
    ```
    링크 클릭
       ↓
    라우터가 목적지 확인
       ↓
    주소와 방문 기록 갱신
       ↓
    해당 화면 렌더링
    ```
    
    단, SPA에서도 새로운 데이터나 아직 로드하지 않은 JavaScript가 필요할 수 있다.
    
    즉, **클라이언트 내비게이션은 서버 요청이 전혀 없다는 뜻이 아니라, 새로운 HTML 문서로 전체 전환하지 않는다는 뜻**이다.
    
    ---
    
    ## SPA와 MPA의 화면 이동 비교
    
    | 구분 | MPA의 일반적인 이동 | SPA의 클라이언트 내비게이션 |
    | --- | --- | --- |
    | HTML 문서 | 새 문서로 전환 | 현재 문서 유지 |
    | 화면 변경 | 새 문서를 표시 | JavaScript로 화면 갱신 |
    | 주소 처리 | 브라우저의 문서 이동 | 클라이언트 라우터가 처리 |
    | 데이터 요청 | HTML에 포함하거나 추가 요청 | 필요할 때 별도로 요청 가능 |
    | 화면 상태 | 별도의 복원 처리가 필요할 수 있음 | 유지되는 컴포넌트의 상태를 보존하기 쉬움 |
    
    SPA라고 모든 상태가 자동으로 유지되는 것은 아니다.
    
    화면 이동 과정에서 컴포넌트가 제거되면 해당 컴포넌트의 내부 상태도 사라질 수 있다. 필요한 상태는 URL이나 적절한 상태 저장 위치에서 관리해야 한다.
    
    ---
    
    ## SPA에서 새로고침하면?
    
    SPA 내부에서 `/books/42`로 이동하는 것과, 해당 주소를 직접 입력하거나 새로고침하는 것은 다르다.
    
    ```
    SPA 내부 이동
    → 클라이언트 라우터가 처리
    
    주소 직접 입력·새로고침
    → 서버에 /books/42 문서 요청
    ```
    
    클라이언트 렌더링 중심의 SPA를 정적 서버에 배포했다면, 서버가 `/books/42`에 해당하는 파일을 찾지 못해 404를 반환할 수 있다.
    
    이 경우 애플리케이션 경로 요청에 SPA의 진입 HTML을 제공하도록 서버를 구성하는 방식이 흔히 사용된다.
    
    ```
    서버가 진입 HTML 제공
              ↓
    JavaScript 실행
              ↓
    라우터가 /books/42 확인
              ↓
    도서 상세 화면 표시
    ```
    
    다만 API나 정적 파일 요청까지 무조건 같은 HTML로 처리해서는 안 된다.
    
    SSR을 지원하는 프레임워크에서는 서버가 해당 경로를 직접 렌더링하는 등 다른 방식으로 처리할 수 있다.
    
    ---
    
    ## SPA와 MPA는 어디에 적합할까?
    
    기능의 성격을 기준으로 다음과 같이 생각할 수 있다.
    
    | 서비스·화면 특성 | 고려할 수 있는 방식 | 이유 |
    | --- | --- | --- |
    | 관리 대시보드 | SPA | 필터와 화면 상태가 자주 바뀜 |
    | 메일·협업 도구 | SPA | 연속적인 조작과 상태 유지가 중요함 |
    | 웹 편집기 | SPA | 풍부한 상호작용이 필요함 |
    | 블로그·문서 사이트 | MPA 또는 서버·정적 렌더링 중심 | 독립적인 콘텐츠 페이지가 중심임 |
    | 회사 소개·안내 페이지 | MPA 또는 정적 페이지 | 복잡한 클라이언트 상태가 적음 |
    | 쇼핑 서비스 | 혼합 방식 | 상품 콘텐츠와 장바구니 등 요구가 다름 |
    
    이는 절대적인 구분이 아니다.
    
    SPA는 초기 JavaScript의 다운로드와 실행 비용을 관리해야 하고, 클라이언트 라우팅에서는 접근성·포커스·스크롤 처리도 고려해야 한다.
    
    MPA에서도 JavaScript로 풍부한 상호작용을 구현할 수 있다. 화면의 복잡성에 비해 큰 프레임워크가 꼭 필요한지 판단하는 것이 중요하다.
    
    ---
    
    ## SPA와 CSR, MPA와 SSR은 같은 말일까?
    
    두 구분은 관련이 있지만 같은 개념은 아니다.
    
    | 구분 | 초점 |
    | --- | --- |
    | SPA / MPA | 화면 이동 시 문서를 어떻게 다루는가? |
    | CSR / SSR / SSG | 화면의 HTML을 어디서, 언제 만드는가? |
    
    ```
    CSR → 브라우저에서 JavaScript로 화면 구성
    SSR → 서버에서 요청에 맞춰 HTML 생성
    SSG → 빌드 시점 등에 HTML을 미리 생성
    ```
    
    최초 화면은 서버에서 만든 HTML로 제공하고, 이후 이동은 클라이언트 내비게이션으로 처리할 수도 있다.
    
    따라서 다음과 같은 단정은 피해야 한다.
    
    ```
    SPA는 무조건 검색 엔진에 노출되지 않는다.
    MPA는 무조건 빠르다.
    SPA는 서버에서 HTML을 만들 수 없다.
    ```
    
    실제 특성은 **렌더링 방식, JavaScript 크기, 캐시, 데이터 요청 구조** 등에 따라 달라진다.
    
- Tailwind CSS
    - CSS 규칙을 직접 작성하는 방식과 비교했을 때 Tailwind CSS의 특징은 무엇일까요?
    - styled-components와 Tailwind CSS는 스타일을 작성하고 생성하는 방식이 어떻게 다를까요?
    - Tailwind CSS에서 `bg-${color}-500`처럼 class 이름을 동적으로 조합하면 스타일이 생성되지 않을 수 있는 이유는 무엇일까요?
    - 상태에 따라 달라지는 스타일은 완성된 class 이름의 매핑이나 CSS 변수를 이용해 어떻게 표현할 수 있을까요?
    
    # Tailwind CSS
    
    ## Tailwind CSS란?
    
    > 작은 역할의 **유틸리티 클래스를 조합하여 스타일을 작성하는 CSS 프레임워크**
    > 
    
    일반적인 CSS에서는 클래스 이름을 정하고 해당 클래스에 여러 속성을 작성한다.
    
    ```
    .book-button {
      padding: 8px 16px;
      border-radius: 8px;
      background-color: #2563eb;
      color: white;
      font-weight: 600;
    }
    ```
    
    ```
    <button className="book-button">
      대여하기
    </button>
    ```
    
    Tailwind CSS에서는 개별 스타일에 대응하는 클래스를 조합한다.
    
    ```
    <button className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white">
      대여하기
    </button>
    ```
    
    | 클래스 | 역할 |
    | --- | --- |
    | `rounded-lg` | 모서리를 둥글게 처리 |
    | `bg-blue-600` | 배경색 지정 |
    | `px-4` | 좌우 패딩 지정 |
    | `py-2` | 상하 패딩 지정 |
    | `font-semibold` | 글자 굵기 지정 |
    | `text-white` | 글자색 지정 |
    
    세부 값은 테마 설정에 따라 달라질 수 있다.
    
    → Tailwind는 **CSS 속성을 몰라도 되는 도구가 아니라, CSS를 유틸리티 클래스 조합으로 표현하는 방식**이다.
    
    ---
    
    ## CSS를 직접 작성하는 방식과의 차이
    
    | 구분 | CSS 규칙 직접 작성 | Tailwind CSS |
    | --- | --- | --- |
    | 스타일 표현 | 선택자 아래에 CSS 속성 작성 | 요소에 유틸리티 클래스 조합 |
    | 클래스 이름 | 역할에 맞는 이름을 직접 정함 | 제공되는 유틸리티 이름 사용 |
    | 코드 위치 | 스타일시트와 마크업을 오갈 수 있음 | 마크업에서 스타일을 함께 확인 |
    | 일관성 | 공통 변수·규칙 등을 설계 | 테마의 색상·간격 등을 활용 |
    | 반복 처리 | 공통 클래스 등으로 재사용 | 공통 컴포넌트 등으로 재사용 |
    
    Tailwind는 스타일이 요소 가까이에 있어 수정할 위치를 찾기 쉽지만, 클래스가 많아지면 마크업이 길어질 수 있다.
    
    반복되는 버튼이나 카드가 많다면 공통 컴포넌트로 묶어 관리할 수 있다.
    
    ---
    
    ## 반응형과 상태 스타일
    
    Tailwind에서는 접두사를 사용해 스타일이 적용될 조건을 표현한다.
    
    ```
    <button
      className="
        bg-blue-600
        px-4
        py-2
        text-white
        hover:bg-blue-700
        disabled:opacity-50
        md:px-6
      "
    >
      대여하기
    </button>
    ```
    
    | 클래스 | 적용 조건 |
    | --- | --- |
    | `bg-blue-600` | 기본 배경색 |
    | `hover:bg-blue-700` | 마우스를 올린 상태 |
    | `disabled:opacity-50` | 비활성화된 상태 |
    | `md:px-6` | `md` 중단점 이상의 화면 너비 |
    
    `md:`는 특정 기기 이름이 아니라 **설정된 너비 조건**이다.
    
    또한 `disabled:opacity-50`은 비활성화 상태의 모양을 지정할 뿐이다. 버튼을 실제로 비활성화하려면 `disabled` 속성도 설정해야 한다.
    
    ```
    <button
      disabled={isSubmitting}
      className="bg-blue-600 text-white disabled:opacity-50"
    >
      저장하기
    </button>
    ```
    
    → 동작은 HTML·React 상태로 제어하고, Tailwind는 해당 상태의 스타일을 표현함
    
    ---
    
    ## styled-components란?
    
    > JavaScript 안에서 CSS를 작성하고, **스타일이 적용된 컴포넌트를 만드는 CSS-in-JS 라이브러리**
    > 
    
    ```
    import styled from "styled-components";
    
    const RentalButton = styled.button`
      padding: 8px 16px;
      border-radius: 8px;
      background-color: #2563eb;
      color: white;
    
      &:hover {
        background-color: #1d4ed8;
      }
    `;
    
    function BookPage() {
      return <RentalButton>대여하기</RentalButton>;
    }
    ```
    
    `styled.button`으로 스타일이 적용된 버튼 컴포넌트를 만든다.
    
    props를 이용한 스타일 변화도 표현할 수 있다.
    
    ```
    const RentalButton = styled.button`
      background-color: ${({ $available }) =>
        $available ? "#2563eb" : "#6b7280"};
    
      color: white;
    `;
    ```
    
    ```
    <RentalButton $available={true}>
      대여하기
    </RentalButton>
    ```
    
    $available처럼 `$` 접두사가 붙은 transient prop은 스타일 계산에 사용하면서 기본 HTML 요소의 속성으로 전달하지 않도록 할 수 있다.
    
    ---
    
    ## styled-components와 Tailwind CSS의 차이
    
    | 구분 | styled-components | Tailwind CSS |
    | --- | --- | --- |
    | 작성 방식 | JavaScript 안에서 CSS 작성 | 유틸리티 클래스 조합 |
    | 기본 사용 단위 | 스타일이 적용된 컴포넌트 | 개별 스타일 클래스 |
    | 상태 표현 | props를 이용한 CSS 계산 등 | 조건에 따른 클래스 선택 등 |
    | CSS 생성 | 일반적인 구성에서 런타임에 규칙 생성·관리 | 일반적인 빌드 구성에서 소스를 탐색해 생성 |
    | 동적 값 | props, CSS 변수 등 | CSS 변수, 인라인 스타일 등 |
    
    styled-components는 일반적으로 실행 중 스타일을 계산하고 클래스와 스타일시트를 관리한다. 서버 렌더링 시에는 서버에서 스타일을 수집해 HTML과 함께 제공할 수도 있다.
    
    Tailwind는 일반적인 빌드 방식에서 **소스에 등장하는 클래스에 필요한 CSS를 미리 생성**한다. 이후 브라우저에서는 생성된 CSS 규칙이 적용된다.
    
    → 두 방식의 차이는 **스타일을 어떤 형태로 작성하고, 필요한 CSS를 어떻게 준비하는가**에 있다.
    
    ---
    
    ## 동적으로 조합한 클래스가 적용되지 않는 이유
    
    다음과 같은 코드를 생각해 보자.
    
    ```
    function Badge({ color }) {
      return (
        <span className={`bg-${color}-500 text-white`}>
          대여 가능
        </span>
      );
    }
    ```
    
    `color`가 `"green"`이면 실행 결과는 다음과 같다.
    
    ```
    bg-green-500 text-white
    ```
    
    하지만 Tailwind가 소스를 읽을 때 보이는 문자열은 다음과 같다.
    
    ```
    bg-${color}-500
    ```
    
    Tailwind는 일반적으로 JavaScript를 실행해서 `color`에 들어갈 모든 값을 계산하지 않는다.
    
    따라서 소스에서 `bg-green-500`이라는 **완성된 클래스 이름을 찾지 못하면**, 해당 CSS가 생성되지 않을 수 있다.
    
    ```
    브라우저의 class에는 bg-green-500이 있음
                       ↓
    생성된 CSS에는 해당 규칙이 없음
                       ↓
    배경색이 적용되지 않음
    ```
    
    다른 파일에 같은 클래스가 완성된 형태로 존재한다면 우연히 동작할 수 있지만, 그 상태에 의존해서는 안 된다.
    
    ---
    
    ## 완성된 클래스 이름의 매핑
    
    > 상태별 스타일을 **완전한 문자열로 미리 정의하고 선택**하는 방식
    > 
    
    ```
    const statusClasses = {
      available: "bg-green-500 text-white",
      rented: "bg-gray-500 text-white",
      overdue: "bg-red-500 text-white",
    };
    
    function RentalBadge({ status, children }) {
      const colorClasses =
        statusClasses[status] ?? statusClasses.rented;
    
      return (
        <span
          className={`rounded px-2 py-1 text-sm ${colorClasses}`}
        >
          {children}
        </span>
      );
    }
    ```
    
    ```
    <RentalBadge status="available">
      대여 가능
    </RentalBadge>
    ```
    
    소스 안에 다음 클래스들이 완성된 형태로 존재한다.
    
    ```
    bg-green-500
    bg-gray-500
    bg-red-500
    ```
    
    따라서 해당 파일이 탐색 대상에 포함되어 있다면 Tailwind가 필요한 스타일을 생성할 수 있다.
    
    조건식으로 선택하는 것도 가능하다.
    
    ```
    <button
      className={
        isSelected
          ? "bg-blue-600 text-white"
          : "bg-gray-100 text-gray-700"
      }
    >
      문학
    </button>
    ```
    
    중요한 점은 **클래스 선택이 동적인가가 아니라, 생성에 필요한 클래스 이름이 완성된 형태로 존재하는가**이다.
    
    ---
    
    ## CSS 변수로 동적인 값 표현하기
    
    미리 정해진 상태가 몇 개라면 클래스 매핑이 적합하다.
    
    반면 사용자가 고른 색상처럼 가능한 값이 매우 많다면, 모든 색상의 클래스를 미리 작성하기 어렵다.
    
    이때 CSS 변수를 사용할 수 있다.
    
    ```
    function ColorBadge({ color, children }) {
      return (
        <span
          style={{ "--badge-color": color }}
          className="
            rounded
            bg-[var(--badge-color)]
            px-2
            py-1
            text-white
          "
        >
          {children}
        </span>
      );
    }
    ```
    
    ```
    <ColorBadge color="#7c3aed">
      사용자 지정 색상
    </ColorBadge>
    ```
    
    동작은 다음과 같다.
    
    ```
    Tailwind
    → bg-[var(--badge-color)]에 필요한 CSS 생성
    
    React
    → --badge-color에 실제 색상 설정
    
    브라우저
    → CSS 변수 값을 읽어 배경색 적용
    ```
    
    `bg-[var(--badge-color)]`라는 클래스 이름은 고정되어 있고, 실제 값만 실행 중 바뀐다.
    
    위 예제는 JSX 기준이다. TypeScript에서는 사용자 정의 CSS 속성을 허용하도록 `style` 객체의 타입을 보완해야 할 수 있다.
    
    ---
    
    ## 인라인 스타일과 함께 사용하기
    
    동적인 값 하나를 직접 적용하려면 인라인 스타일도 사용할 수 있다.
    
    ```
    function ColorBadge({ color, children }) {
      return (
        <span
          style={{ backgroundColor: color }}
          className="rounded px-2 py-1 text-white"
        >
          {children}
        </span>
      );
    }
    ```
    
    → 고정된 모양은 Tailwind로, 실행 중 결정되는 배경색은 인라인 스타일로 처리함
    
    CSS 변수는 같은 값을 여러 CSS 규칙에서 사용하거나 상태 스타일과 연결할 때 유용하다. 단일 속성에만 값을 적용한다면 인라인 스타일이 더 간단할 수 있다.
    
    ---
    
    ## 상태별 스타일을 선택하는 기준
    
    | 상황 | 적합한 표현 방식 |
    | --- | --- |
    | 선택됨 / 선택되지 않음 | 완성된 클래스 이름을 조건식으로 선택 |
    | 성공 / 실패 / 대기 | 상태별 클래스 매핑 |
    | hover / focus / disabled | Tailwind 상태 접두사 |
    | 사용자가 선택한 임의의 색상 | CSS 변수 또는 인라인 스타일 |
    | API에서 받은 연속적인 수치 | CSS 변수 또는 인라인 스타일 |
    
    예를 들어 대여 상태는 종류가 제한되어 있으므로 클래스 매핑이 적합하고, 사용자가 직접 지정한 색상은 CSS 변수로 표현하기 좋다.
    
    **정해진 스타일 중 하나를 고르는 경우에는 클래스 이름을 선택하고, 실행 중 새로운 값이 들어오는 경우에는 스타일 값 자체를 전달하는 방식**으로 구분하면 된다.