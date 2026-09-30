- URL과 라우팅
    - URI, URL, path와 route는 각각 무엇이며 어떤 차이가 있을까요?

  **URI** - 인터넷에 있는 무언가(리소스)를 가리키는 문자열을 통틀어 부르는 말

  **URL** - URI 중에서 "어디에 있고, 어떻게 접근하는지"까지 알려 주는 주소. 브라우저 주소창에 입력하는 것이 URL이다 (URL은 URI에 포함된다)

  워크북 예시 주소를 부분별로 나눠 보면 다음과 같다

    ```
    https://umcine.example/movies/10?from=search#reviews
    ```

  | 부분 | 값 | 뜻 |
      | --- | --- | --- |
  | scheme | https | 어떤 방식으로 통신할지 |
  | origin | https://umcine.example | 어느 사이트인지 |
  | path | /movies/10 | 사이트 안에서 어느 화면인지 |
  | search param | from=search | ? 뒤에 붙는 추가 조건 |
  | fragment (hash) | reviews | # 뒤, 화면 안의 특정 위치 |

  **route** - 주소에 들어 있는 값이 아니라, 앱을 만든 사람이 정한 규칙이다. "이런 모양의 path가 들어오면 이 화면을 보여 준다"고 연결해 둔 것이다

    ```tsx
    // "/movies/$movieId" 라는 규칙 하나로
    // /movies/1, /movies/2, /movies/10 을 모두 영화 상세 화면에 연결한다
    export const Route = createFileRoute("/movies/$movieId")({
      component: MovieDetailPage,
    });
    ```

  정리하면 path는 주소창에 실제로 적힌 값(/movies/10)이고, route는 그 path를 어떤 화면에 연결할지 정한 규칙(/movies/$movieId → 상세 화면)이다.

    - path param과 search param은 각각 어떤 값을 표현할 때 사용하는 것이 좋을까요?

  **path param** - path 안에서 바뀌는 값. 무엇을 볼지(대상)를 정한다

    ```
    /movies/1   →  1번 영화 상세
    /movies/2   →  2번 영화 상세
    ```

    - 1, 2는 어떤 영화인지를 정하는 값이다
    - 이 값이 빠지면(/movies/) 누구의 상세 화면인지 알 수 없어서 화면이 성립하지 않는다
    - 영화 ID, 사용자 ID, 게시글 번호처럼 대상 하나를 정하는 값에 쓴

  **search param** - ? 뒤에 붙는 값. 같은 화면 안에서 **결과를 거르거나 정렬하는 조건**을 정한다

    ```
    /search                   →  "검색어를 입력해 주세요."
    /search?query=스파이더맨   →  스파이더맨 영화 2편
    /search?query=오디세이     →  오디세이 1편
    ```

    - 세 주소 모두 path는 /search로 같아서, 같은 검색 화면(검색창 + 결과 목록)이 열린다
    - 달라지는 것은 query 값에 따라 바뀌는 결과 목록뿐이다
    - 값이 없어도 조건 없는 기본 화면이 열린다
    - 검색어, 필터, 정렬, 페이지 번호처럼 붙였다 뗐다 할 수 있는 조건에 쓴다

  | 구분 | path param | search param |
      | --- | --- | --- |
  | 위치 | path 안 (/movies/2) | ? 뒤 (?query=오디세이) |
  | 정하는 것 | 무엇을 볼지 (대상) | 그 화면에 어떤 조건을 걸지 |
  | 빠지면 | 화면이 성립하지 않음 | 조건 없는 기본 화면이 나옴 |
  | 예시 | 영화 ID, 사용자 ID | 검색어, 필터, 정렬, 페이지 |
    - 검색어, 필터나 현재 화면의 상태를 URL에 포함하면 공유와 새로고침에 어떤 장점이 있을까요?

  검색어를 useState에만 저장하면 그 값은 지금 열린 브라우저 화면 안에만 있다.
  새로고침하면 사라지고, 링크를 보내도 받은 사람에게는 전달되지 않는다.
  URL에 넣으면 주소 자체에 화면 상태가 담긴다.

  **검색어를 useState에만 저장한 경우**

    ```tsx
    const [query, setQuery] = useState("");
    // 스파이더맨을 검색해도 주소창은 계속 /search
    ```

    - 스파이더맨을 검색해서 결과가 나와도 주소창은 /search 그대로다
    - 검색어는 React가 메모리에 잠깐 들고 있는 값이라, 페이지가 다시 로딩되면 useState("")의 처음 값으로 돌아간다

  **검색어를 URL에 넣은 경우**

    ```tsx
    navigate({ search: { query: "스파이더맨" } });
    // 주소창이 /search?query=스파이더맨 으로 바뀐다
    
    const { query } = useSearch({ from: "/search" });
    // 화면은 URL에서 검색어를 읽어서 결과를 보여 준다
    ```

    - 검색하면 주소창이 /search?query=스파이더맨으로 바뀐다
    - 화면은 useState가 아니라 URL에서 검색어를 읽어 결과를 만든다. 그래서 URL만 같으면 언제 열어도 같은 결과가 나온다

  **공유** - /search?query=스파이더맨 링크를 보내면 받은 사람도 같은 검색 결과를 본다

    - useState만 쓰면 링크가 /search라서, 받은 사람은 빈 검색 화면을 보고 다시 검색해야 한다
    - URL에 검색어가 있으면 받은 사람의 브라우저도 주소에서 query를 읽어 바로 같은 결과를 보여 준다
    - "이 영화 찾아봐" 대신 검색 결과 링크 하나만 보내면 된다

  **새로고침** - URL이 그대로 남아 있으니 새로고침해도 같은 결과가 다시 나온다

    - 새로고침하면 페이지가 처음부터 다시 로딩되어 useState 값은 모두 초기화된다
    - 하지만 주소창의 URL은 새로고침해도 바뀌지 않는다
    - 다시 로딩된 화면이 URL에서 query를 읽어 같은 검색 결과를 다시 만든다
    - 필터를 여러 개 걸어 둔 상태에서 새로고침해도 처음부터 다시 설정할 필요가 없다

- SPA와 MPA
    - SPA와 MPA는 각각 무엇이며 화면을 이동하는 방식에 어떤 차이가 있을까요?

  **SPA (Single Page Application)** - 처음 받은 HTML 문서 하나를 계속 쓰면서, JavaScript가 URL과 화면 내용만 바꾸는 방식

  **MPA (Multi Page Application)** - 다른 주소로 이동할 때마다 서버에서 새로운 HTML 문서를 받아 오는 방식

  | 구분 | SPA | MPA |
      | --- | --- | --- |
  | HTML 문서 | 처음 한 번만 받음 | 이동할 때마다 새로 받음 |
  | 화면 전환 | 바뀌는 부분만 교체 | 페이지 전체를 새로 그림 |
  | 헤더 같은 공통 부분 | 그대로 남아 있음 | 매번 다시 그려짐 |
  | 이동 속도 | 첫 로딩 후에는 빠름 | 이동할 때마다 서버 응답을 기다림 |
  | 첫 로딩 | JavaScript를 먼저 받아야 해서 느릴 수 있음 | 빠른 편 |

    - SPA의 클라이언트 내비게이션은 새로운 HTML 문서를 받는 일반적인 페이지 이동과 어떻게 다를까요?

  **a 태그로 이동할 때 (일반적인 페이지 이동)**

    1. 브라우저가 서버에 새 HTML 문서를 요청한다
    2. 지금 화면을 전부 버리고 새 문서를 처음부터 다시 그린다
    3. useState에 있던 값들도 전부 초기화된다

  **Link로 이동할 때 (클라이언트 내비게이션)**

    1. 서버에 새 HTML을 요청하지 않는다
    2. 주소창의 URL과 방문 기록만 바꾼다
    3. 바뀐 URL에 맞는 화면을 찾아 Outlet 자리만 바꿔 끼운다
    4. Header는 그대로 남아 있다

    - SPA와 MPA는 각각 어떤 서비스나 화면에 적합할까요?

  **SPA가 적합한 경우** - 화면을 자주 오가고, 클릭이나 입력 같은 조작이 많은 서비스

    - 목록, 검색, 상세를 오가며 북마크를 누르는 워크북 영화 프로젝트
    - 메일, 관리자 대시보드처럼 한 번 접속해서 오래 쓰는 서비스

  **MPA가 적합한 경우** - 페이지마다 내용이 따로 있고, 첫 화면이 빨리 떠야 하는 서비스

    - 블로그, 뉴스, 회사 홈페이지처럼 읽기 위주인 사이트
    - 검색 엔진에 잘 노출되어야 하는 사이트 (서버가 내용이 채워진 HTML을 보내 주기 때문에 검색 엔진이 내용을 읽기 쉽다)

- Tailwind CSS
    - CSS 규칙을 직접 작성하는 방식과 비교했을 때 Tailwind CSS의 특징은 무엇일까요?

  Tailwind CSS는 "모서리 둥글게", "배경 흰색"처럼 한 가지 일만 하는 작은 class가 미리 만들어져 있고, 이것들을 className에 조합해서 스타일을 입히는 도구다.

    ```css
    /* 기존 CSS: class 이름을 만들고 CSS 파일에 따로 작성 */
    .movie-card {
      border-radius: 10px;
      overflow: hidden;
      background: white;
    }
    ```

    ```tsx
    // Tailwind CSS: className에 바로 조합
    <article className="overflow-hidden rounded-[10px] bg-white">
    ```

  | 구분 | CSS 직접 작성 | Tailwind CSS |
      | --- | --- | --- |
  | 작성 위치 | 별도 CSS 파일 | TSX의 className |
  | class 이름 | 직접 지어야 함 | 정해진 이름을 조합해서 이름 고민이 없음 |
  | 수정할 때 | TSX와 CSS 파일을 오가야 함 | 해당 태그의 className만 보면 됨 |
  | 안 쓰는 스타일 | 직접 찾아서 지워야 함 | 코드에 적힌 class만 CSS로 만들어져서 자동으로 빠짐 |

  **장점** - 이름 짓기가 필요 없고, 정해진 간격과 색상 단계를 써서 디자인이 일관되고, 태그만 보면 스타일을 알 수 있다

  **단점** - className이 길어져 읽기 어려울 수 있고, class 이름을 익히는 데 시간이 걸린다

    - styled-components와 Tailwind CSS는 스타일을 작성하고 생성하는 방식이 어떻게 다를까요?

  **styled-components** - JavaScript 파일 안에 CSS를 그대로 적어서, 스타일이 들어간 컴포넌트를 새로 만드는 방식

    ```tsx
    const Card = styled.article`
      border-radius: 10px;
      overflow: hidden;
      background: ${(props) => (props.active ? "blue" : "white")};
    `;
    ```

  **Tailwind CSS** - 미리 만들어진 class 이름을 className에 조합하는 방식

    ```tsx
    <article className="overflow-hidden rounded-[10px] bg-white">
    ```

  가장 큰 차이는 **CSS가 만들어지는 시점**이다.

    - styled-components는 **앱이 실행될 때** 브라우저에서 CSS를 만들어 페이지에 넣는다. 그래서 props 값을 CSS에 바로 넣을 수 있다
    - Tailwind CSS는 **빌드할 때** 코드에 적힌 class 이름을 찾아서 CSS 파일을 미리 만들어 둔다. 실행 중에는 만들어진 CSS 파일만 사용한다

    - Tailwind CSS에서 `bg-${color}-500`처럼 class 이름을 동적으로 조합하면 스타일이 생성되지 않을 수 있는 이유는 무엇일까요?

  Tailwind는 **빌드할 때** 코드를 글자 그대로 읽으면서 bg-red-500 같은 완성된 class 이름을 찾고, 찾은 것만 CSS로 만든다. 코드를 실행해서 변수에 무엇이 들어갈지 계산하지는 않는다.

    ```tsx
    <div className={`bg-${color}-500`} />
    ```

    1. 빌드할 때 코드에 적힌 글자는 "bg-${color}-500"뿐이다. bg-red-500이라는 글자는 어디에도 없다
    2. 그래서 Tailwind는 bg-red-500의 CSS를 만들지 않는다
    3. 앱이 실행되면 className이 bg-red-500으로 조립되지만, 그 class에 해당하는 CSS가 없으니 아무 스타일도 적용되지 않는다

  그래서 class 이름은 항상 완성된 형태로 코드에 적혀 있어야 한다.

    - 상태에 따라 달라지는 스타일은 완성된 class 이름의 매핑이나 CSS 변수를 이용해 어떻게 표현할 수 있을까요?

  **1. 완성된 class 이름의 매핑**

  상태별로 쓸 class를 완성된 이름으로 미리 적어 두고, 상태에 맞는 것을 골라 쓴다.

    ```tsx
    const colorClass = {
      red: "bg-red-500",
      blue: "bg-blue-500",
      green: "bg-green-500",
    };
    
    <div className={colorClass[color]} />
    ```

    - bg-red-500 같은 완성된 이름이 코드에 적혀 있으니 빌드할 때 CSS가 만들어진다
    - color가 "red"면 bg-red-500, "blue"면 bg-blue-500이 적용된다

  상태가 두 가지뿐이라면 워크북 북마크 버튼처럼 조건식으로 바로 골라도 된다. 이것도 두 상태를 완성된 class에 하나씩 연결한 매핑이다.

    ```tsx
    <button
      className={cn(
        "absolute right-2 top-2 rounded-full p-2 text-white",
        movie.isBookmarked ? "bg-blue-600" : "bg-black/60",
      )}
    >
    ```

    - 북마크 됨 → bg-blue-600, 북마크 안 됨 → bg-black/60

  **2. CSS 변수**

  진행률(0~100%)처럼 값이 너무 다양해서 매핑으로 미리 다 적을 수 없을 때 쓴다. 바뀌는 값은 style로 CSS 변수에 넣고, class는 그 변수를 가리키기만 한다.

    ```tsx
    <div
      style={{ "--progress": `${percent}%` } as React.CSSProperties}
      className="h-2 bg-blue-600 w-[var(--progress)]"
    />
    ```

    - class 이름 w-[var(--progress)]는 항상 같은 글자라서 빌드할 때 CSS가 만들어진다
    - 실제 너비 값은 실행 중에 --progress가 바뀌면서 적용된다