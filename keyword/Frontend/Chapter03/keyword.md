- URL과 라우팅
    - URI, URL, path와 route는 각각 무엇이며 어떤 차이가 있을까요?
        
        ### URI(Uniform Resource Identifier)
        
        인터넷에서 특정 자원을 식별하기 위한 문자열이다. URL을 포함하는 더 넓은 개념이다.
        
        ```
        https://example.com/books/10
        ```
        
        ### URL(Uniform Resource Locator)
        
        자원의 위치와 접근 방법을 나타내는 URI이다. 프로토콜, 도메인, 경로, 쿼리 문자열 등으로 구성된다.
        
        ```
        https://example.com/books/10?tab=review
        ```
        
        - `https`: 프로토콜
        - `example.com`: 도메인
        - `/books/10`: path
        - `?tab=review`: search param
        
        ### Path
        
        도메인 뒤에서 특정 자원의 위치나 계층을 나타내는 부분이다.
        
        ```
        /books/10
        ```
        
        ### Route
        
        특정 path에 어떤 화면이나 로직을 연결할지 정의한 규칙이다. **TanStack Router에서는 URL과 일치하는 route를 찾아 해당 컴포넌트를 렌더링한다.**
        
        예를 들어 `/books/$bookId` route에 `BookDetail` 컴포넌트를 연결하면 `/books/1`로 접근했을 때 해당 도서의 상세 화면이 렌더링된다.
        
        ```tsx
        export const Route = createFileRoute("/books/$bookId")({
          component: BookDetail,
        });
        ```
        
        | 용어 | 의미 |
        | --- | --- |
        | URI | 자원을 식별하는 문자열 |
        | URL | 자원의 위치와 접근 방법을 나타내는 URI |
        | Path | URL에서 자원의 위치를 나타내는 경로 |
        | Route | Path와 화면 또는 처리 로직을 연결하는 규칙 |
    - path param과 search param은 각각 어떤 값을 표현할 때 사용하는 것이 좋을까요?
        
        ### Path Param
        
        특정 자원을 식별하는 필수 값에 사용한다.
        
        ```
        /books/10
        /users/3
        ```
        
        ```tsx
        export const Route = createFileRoute("/books/$bookId")({
          component: BookDetail,
        });
        ```
        
        여기서 `10`은 조회할 책을 식별하는 `bookId`이다. 해당 값이 없으면 어떤 책의 상세 화면인지 결정할 수 없다.
        
        ### Search Param
        
        검색, 필터, 정렬, 페이지 번호처럼 선택적인 조회 조건이나 화면 상태를 표현할 때 사용한다.
        
        ```
        /books?keyword=react&category=programming&page=2
        ```
        
        - `keyword=react`: 검색어
        - `category=programming`: 필터
        - `page=2`: 현재 페이지
        
        | 구분 | Path Param | Search Param |
        | --- | --- | --- |
        | 목적 | 특정 자원 식별 | 검색·필터·정렬 등 조건 표현 |
        | 예시 | `/books/10` | `/books?category=novel` |
        | 필수 여부 | 대체로 필수 | 대체로 선택 |
        | 값이 바뀌면 | 다른 자원을 의미 | 같은 목록을 다른 조건으로 조회 |
    - 검색어, 필터나 현재 화면의 상태를 URL에 포함하면 공유와 새로고침에 어떤 장점이 있을까요?
        
        ## 화면 상태를 URL에 포함하는 장점
        
        검색어나 필터 등의 상태를 URL에 포함하면 현재 화면을 URL만으로 다시 만들 수 있다.
        
        ```
        /books?keyword=react&category=programming&page=2
        ```
        
        ### 공유 가능
        
        URL을 다른 사람에게 보내면 같은 검색어와 필터가 적용된 화면을 바로 보여줄 수 있다.
        
        ### 새로고침 후 상태 유지
        
        상태가 컴포넌트의 `state`에만 있으면 새로고침할 때 초기화될 수 있다. URL에 포함하면 새로고침 후에도 같은 조건으로 화면을 복원할 수 있다.
        
        ### 북마크 가능
        
        특정 검색 결과나 필터가 적용된 화면을 북마크하여 나중에 다시 열 수 있다.
        
        ### 뒤로 가기와 앞으로 가기 지원
        
        필터나 페이지 이동을 URL에 기록하면 브라우저의 뒤로 가기와 앞으로 가기로 이전 화면 상태를 다시 확인할 수 있다.
        
        즉, 공유하거나 다시 복원해야 하는 검색어, 필터, 정렬 방식, 페이지 번호 등은 URL의 Search Param으로 관리하는 것이 좋다. 반면 모달의 간단한 열림 여부처럼 공유하거나 복원할 필요가 없는 일시적인 값은 컴포넌트의 `state`로 관리할 수 있다.
        
- SPA와 MPA
    - SPA와 MPA는 각각 무엇이며 화면을 이동하는 방식에 어떤 차이가 있을까요?
        
        ### SPA(Single Page Application)
        
        SPA는 처음에 하나의 HTML 문서를 받은 뒤, JavaScript가 필요한 데이터와 컴포넌트를 변경하여 화면을 전환하는 방식이다.
        
        React로 만든 애플리케이션이 대표적인 SPA 구조이다.
        
        ```
        최초 접속 → HTML·JavaScript 로딩
        화면 이동 → 필요한 컴포넌트와 데이터만 변경
        ```
        
        화면을 이동할 때마다 전체 HTML 문서를 다시 받지 않으므로 자연스럽고 빠른 사용자 경험을 제공할 수 있다.
        
        ### MPA(Multi Page Application)
        
        MPA는 화면을 이동할 때마다 서버에 새로운 HTML 문서를 요청하는 방식이다.
        
        ```
        페이지 링크 클릭
        → 서버에 요청
        → 새로운 HTML 문서 수신
        → 브라우저가 전체 페이지 렌더링
        ```
        
        전통적인 웹사이트나 서버에서 HTML을 생성하는 서비스가 대표적인 MPA 구조이다.
        
        ## 화면 이동 방식의 차이
        
        | 구분 | SPA | MPA |
        | --- | --- | --- |
        | 최초 로딩 | HTML과 JavaScript를 한 번에 로딩 | 현재 페이지의 HTML을 로딩 |
        | 화면 이동 | JavaScript가 컴포넌트를 교체 | 서버에서 새로운 HTML을 받음 |
        | 전체 새로고침 | 일반적으로 발생하지 않음 | 페이지 이동마다 발생 |
        | 화면 전환 | 자연스럽고 빠름 | 새 문서를 받기 때문에 끊김이 생길 수 있음 |
        | 라우팅 처리 | 주로 클라이언트 | 주로 서버 |
    - SPA의 클라이언트 내비게이션은 새로운 HTML 문서를 받는 일반적인 페이지 이동과 어떻게 다를까요?
        
        ## SPA의 클라이언트 내비게이션
        
        SPA에서는 **TanStack Router**와 같은 도구가 URL을 변경하고, 해당 URL과 연결된 컴포넌트를 렌더링한다.
        
        ```
        import { Link } from "@tanstack/react-router";
        
        <Link to="/books">도서 목록</Link>
        ```
        
        `Link`를 클릭하면 다음 과정이 진행된다.
        
        ```
        URL 변경
        → TanStack Router가 URL 확인
        → 해당 route의 컴포넌트 렌더링
        ```
        
        새로운 HTML 문서를 서버에서 다시 받지 않고 현재 실행 중인 React 애플리케이션 안에서 필요한 화면만 변경한다.
        
        반면 일반적인 링크 이동은 서버에 새로운 HTML 문서를 요청할 수 있다.
        
        ```
        <a href="/books">도서 목록</a>
        ```
        
        ```
        서버에 요청
        → 새로운 HTML 문서 응답
        → 기존 페이지 제거
        → 새로운 페이지 전체 렌더링
        ```
        
        TanStack Router의 `Link`는 실제로 `<a>` 요소를 렌더링하지만, 클릭 시 브라우저의 기본 페이지 이동을 제어한다. 이후 History API로 URL을 변경하고, 변경된 URL에 해당하는 route의 컴포넌트를 렌더링한다.
        
    - SPA와 MPA는 각각 어떤 서비스나 화면에 적합할까요?
        
        ## SPA가 적합한 경우
        
        사용자의 조작과 화면 상태 변경이 많고 빠른 화면 전환이 필요한 서비스에 적합하다.
        
        - 관리자 대시보드
        - 메신저
        - 이메일 서비스
        - 협업 도구
        - 예약·주문 시스템
        - 소셜 네트워크
        - 웹 기반 편집 도구
        
        이러한 서비스는 로그인 이후 여러 기능을 계속 사용하므로 전체 페이지를 반복해서 불러오는 것보다 필요한 부분만 변경하는 SPA 방식이 적합하다.
        
        ## MPA가 적합한 경우
        
        페이지별 콘텐츠가 독립적이고 검색 엔진 노출이나 초기 로딩이 중요한 서비스에 적합하다.
        
        - 뉴스 사이트
        - 회사 소개 사이트
        - 공공기관 홈페이지
        - 블로그
        - 문서 사이트
        - 콘텐츠 중심 서비스
        
        각 URL에 해당하는 완성된 HTML을 서버에서 제공할 수 있어 페이지별 콘텐츠 관리와 검색 엔진 노출에 유리하다.
        
        ## 정리
        
        SPA는 하나의 HTML 문서 안에서 컴포넌트를 변경하므로 화면 전환과 상호작용이 많은 서비스에 적합하다. MPA는 페이지를 이동할 때 새로운 HTML 문서를 받으므로 각 페이지의 콘텐츠가 독립적인 서비스에 적합하다.
        
        다만 최근에는 SPA와 MPA의 특징을 결합한 Next.js 같은 프레임워크도 많이 사용한다. 화면의 목적에 따라 서버 렌더링과 클라이언트 내비게이션을 함께 적용할 수 있다.
        
- Tailwind CSS
    - CSS 규칙을 직접 작성하는 방식과 비교했을 때 Tailwind CSS의 특징은 무엇일까요?
        
        ## CSS 직접 작성 방식과 Tailwind CSS
        
        일반 CSS는 개발자가 클래스 이름을 만들고, 해당 클래스에 필요한 스타일 규칙을 직접 작성한다.
        
        ```css
        .primary-button {
          padding: 8px 16px;
          background-color: blue;
          color: white;
          border-radius: 8px;
        }
        ```
        
        ```tsx
        <button className="primary-button">확인</button>
        ```
        
        Tailwind CSS는 하나의 스타일 속성에 가까운 작은 유틸리티 클래스를 조합하여 스타일을 만든다.
        
        ```tsx
        <button className="rounded-lg bg-blue-500 px-4 py-2 text-white">
          확인
        </button>
        ```
        
        | 구분 | 일반 CSS | Tailwind CSS |
        | --- | --- | --- |
        | 스타일 작성 | CSS 규칙 직접 작성 | 유틸리티 클래스 조합 |
        | 클래스 이름 | 직접 정해야 함 | 미리 정의된 이름 사용 |
        | 작성 위치 | 주로 별도의 CSS 파일 | 주로 JSX의 `className` |
        | 상태 스타일 | 직접 선택자 작성 | `hover:`, `focus:` 등의 변형 사용 |
        | CSS 생성 | 작성한 CSS가 포함됨 | 사용이 감지된 클래스의 CSS 생성 |
        
        Tailwind는 소스 파일을 검사하여 실제로 사용된 클래스에 해당하는 CSS를 정적 스타일시트로 생성한다. 
        
    - styled-components와 Tailwind CSS는 스타일을 작성하고 생성하는 방식이 어떻게 다를까요?
        
        ## styled-components와 Tailwind CSS
        
        ### styled-components
        
        styled-components는 JavaScript의 템플릿 리터럴 안에 실제 CSS 문법을 작성하여 스타일이 포함된 React 컴포넌트를 만든다.
        
        ```tsx
        import styled from "styled-components";
        
        const Button = styled.button`
          padding: 8px 16px;
          background-color: blue;
          color: white;
          border-radius: 8px;
        `;
        ```
        
        ```tsx
        <Button>확인</Button>
        ```
        
        Props에 따라 스타일을 계산할 수도 있다.
        
        ```tsx
        const Button = styled.button<{ $active: boolean }>`
          background-color: ${(props) =>
            props.$active ? "blue" : "gray"};
        `;
        ```
        
        styled-components는 컴포넌트에 고유한 클래스 이름을 생성하고 필요한 스타일을 삽입한다. Props 보간 결과가 달라지면 서로 다른 동적 클래스가 만들어질 수 있다. styled-components
        
        ### Tailwind CSS
        
        Tailwind는 이미 완성된 유틸리티 클래스 이름을 JSX에 지정한다.
        
        ```tsx
        <button
          className={
            active
              ? "rounded-lg bg-blue-500 px-4 py-2 text-white"
              : "rounded-lg bg-gray-300 px-4 py-2 text-gray-600"
          }
        >
          확인
        </button>
        ```
        
        즉, styled-components는 CSS를 JavaScript 안에서 작성하고 Props에 따라 스타일을 계산할 수 있다. Tailwind는 빌드 과정에서 클래스 이름을 찾아 필요한 CSS를 미리 생성하고, 실행 중에는 그중 사용할 클래스를 선택한다.
        
    - Tailwind CSS에서 `bg-${color}-500`처럼 class 이름을 동적으로 조합하면 스타일이 생성되지 않을 수 있는 이유는 무엇일까요?
        
        ## 동적으로 조합한 클래스가 생성되지 않는 이유
        
        다음과 같이 클래스 이름의 일부분만 작성하면 Tailwind가 완성된 클래스 이름을 찾지 못할 수 있다.
        
        ```tsx
        const color = "blue";
        
        <div className={`bg-${color}-500`} />
        ```
        
        소스 코드에는 `bg-blue-500`이라는 완성된 문자열이 존재하지 않고 다음 조각만 존재한다.
        
        ```
        bg-
        color
        -500
        ```
        
        Tailwind의 소스 검사는 JavaScript 코드를 실행하여 `color`의 값을 계산하는 방식이 아니다. 소스에 클래스처럼 보이는 완성된 문자열을 찾아 CSS를 생성하기 때문에 `bg-${color}-500`만으로는 `bg-blue-500`을 생성하지 못할 수 있다. 
        
    - 상태에 따라 달라지는 스타일은 완성된 class 이름의 매핑이나 CSS 변수를 이용해 어떻게 표현할 수 있을까요?
        
        ## 완성된 클래스 이름 매핑
        
        가능한 상태나 색상이 정해져 있다면 완성된 클래스 이름을 객체에 저장한다.
        
        ```tsx
        const colorClasses = {
          blue: "bg-blue-500 hover:bg-blue-600",
          red: "bg-red-500 hover:bg-red-600",
          green: "bg-green-500 hover:bg-green-600",
        };
        
        type Color = keyof typeof colorClasses;
        
        function Button({ color }: { color: Color }) {
          return (
            <button className={`${colorClasses[color]} px-4 py-2 text-white`}>
              확인
            </button>
          );
        }
        ```
        
        소스에 `bg-blue-500`, `bg-red-500`, `bg-green-500`이라는 완성된 문자열이 있으므로 Tailwind가 모든 클래스를 감지할 수 있다.
        
        상태별로도 같은 방식을 사용할 수 있다.
        
        ```tsx
        const statusClasses = {
          active: "bg-green-500 text-white",
          pending: "bg-yellow-300 text-black",
          disabled: "bg-gray-300 text-gray-500",
        };
        
        <button className={statusClasses[status]}>
          상태 변경
        </button>
        ```
        
        ## CSS 변수를 이용한 동적 스타일
        
        색상 값이 API나 데이터베이스에서 전달되어 미리 알 수 없다면 CSS 변수에 값을 넣고, Tailwind 클래스에서는 그 변수를 참조할 수 있다.
        
        ```tsx
        function Button({ color }: { color: string }) {
          const buttonStyle = {
            "--button-bg": color,
          } as React.CSSProperties;
        
          return (
            <button
              style={buttonStyle}
              className="bg-(--button-bg) rounded-lg px-4 py-2 text-white"
            >
              확인
            </button>
          );
        }
        ```
        
        이 경우 `bg-(--button-bg)`는 완성된 클래스이므로 Tailwind가 CSS를 생성할 수 있고, 실제 색상값만 CSS 변수로 전달된다. 공식 문서도 데이터베이스나 API처럼 실행 중 결정되는 값에는 인라인 스타일 또는 CSS 변수를 사용하는 방식을 안내한다. 
        
        정리하면, 상태의 종류가 정해져 있으면 **완성된 클래스 이름 매핑**, 값이 실행 중 자유롭게 결정되면 **CSS 변수**를 사용하는 것이 적절하다.