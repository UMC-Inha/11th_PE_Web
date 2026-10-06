# Frontend Chapter03

## 키워드 정리

### URL과 라우팅

#### URI, URL, path와 route는 각각 무엇이며 어떤 차이가 있을까요?

- **URI(Uniform Resource Identifier)**는 리소스를 식별하는 문자열을 넓게 부르는 말이에요.
- **URL(Uniform Resource Locator)**은 그중 리소스에 접근할 방법과 위치를 나타내는 주소예요.
- **route(라우트)**는 URL의 구성 요소가 아니라 앱이 정한 규칙이에요. 예를 들어 `/movies/$movieId`라는 route는 `/movies/10`처럼 같은 모양의 path와 영화 상세 컴포넌트를 연결해요.

```tsx
const movieUrl = new URL(
  "https://umcine.example/movies/10?from=search#reviews",
);

console.log(movieUrl.origin); // https://umcine.example
console.log(movieUrl.pathname); // /movies/10 = path
console.log(movieUrl.searchParams.get("from")); // search
console.log(movieUrl.hash); // #reviews
```

#### path param과 search param은 각각 어떤 값을 표현할 때 사용하는 것이 좋을까요?

- **Path Param**: "그 자리에 반드시 있어야 하는 고유한 리소스"를 나타낼 때 사용합니다. 없으면 404가 뜨거나 전혀 다른 페이지가 열려야 마땅한 단일 대상을 가리킵니다.
- **Search Param**: "같은 리소스 집합을 어떤 방식으로 가공해서 볼 것인가"를 제어할 때 사용합니다. 옵션이 전혀 없어도 기본 목록을 노출할 수 있는 보조 조건에 적합합니다.

| **구분** | **Path Param (경로 변수)** | **Search Param (쿼리 스트링)** |
| --- | --- | --- |
| **URL 형태** | `/movies/:id` (`/movies/123`) | `/movies?genre=action&page=2` |
| **주요 목적** | 특정 리소스의 **고유 식별자(ID)** 지정 | 목록의 **필터, 검색어, 정렬, 페이징** 등 부가 옵션 |
| **필수 여부** | **필수(Required)**: 빠지면 다른 경로로 인식 | **선택(Optional)**: 없어도 기본 화면 조회 가능 |
| **적합한 사용처** | • 특정 영화 상세 페이지 (`/movies/123`)<br>• 특정 사용자 프로필 (`/users/umc`) | • 검색 키워드 (`?q=오디세이`)<br>• 장르 필터 (`?genre=animation`)<br>• 페이지 번호 (`?page=3`) |

#### 검색어, 필터나 현재 화면의 상태를 URL에 포함하면 공유와 새로고침에 어떤 장점이 있을까요?

React 내부 상태(`useState`)로만 화면 조건을 관리하면 브라우저 메모리에만 데이터가 머물기 때문에, 페이지를 벗어나거나 새로고침하면 모든 선택 조건이 초기화됩니다. 이 상태를 URL(Search Param)에 동기화하면 다음과 같은 핵심 장점이 생깁니다.

1. **URL 공유(Deep Linking) 시 화면 일치성 확보**
    - 친구나 동료에게 `https://.../movies?search=토이&page=2` 형태의 링크를 복사해 보내면, 상대방이 링크를 클릭하자마자 '검색어: 토이', '2페이지'가 적용된 **정확히 동일한 화면**을 바로 보게 됩니다.
    - 상태가 URL에 없다면 링크를 받은 사람은 항상 빈 초기 페이지만 보게 됩니다.
2. **새로고침(F5) 시 상태 유실 방지 (영속성)**
    - 사용자가 영화 목록을 5페이지까지 넘기고 필터를 걸어둔 상태에서 실수로 브라우저를 새로고침하더라도, URL에 `?page=5`가 남아있으면 브라우저는 URL을 파싱해 이전 작업 흐름을 그대로 유지합니다.
3. **브라우저 히스토리(뒤로 가기 / 앞으로 가기) 지원**
    - URL이 변경될 때마다 브라우저 세션 기록에 히스토리가 쌓이므로, 검색어를 바꾸거나 페이지를 넘긴 후 브라우저의 '뒤로 가기' 버튼을 눌렀을 때 사용자의 직전 탐색 단계로 자연스럽게 되돌아갈 수 있습니다.
4. **북마크(즐겨찾기) 지원**
    - 사용자가 자주 확인하는 특정 조건(예: `?genre=action&sort=latest`)의 화면을 브라우저 북마크에 추가해 두고 언제든 한 번의 클릭으로 해당 조건의 목록을 재방문할 수 있습니다.

---

### SPA와 MPA

#### SPA와 MPA는 각각 무엇이며 화면을 이동하는 방식에 어떤 차이가 있을까요?

- **SPA (Single Page Application)**
    - **개념**: 단 하나의 HTML 문서를 기반으로, 자바스크립트가 화면의 내용만 동적으로 교체하는 애플리케이션입니다.
    - **화면 이동 방식**: 서버에 새로운 HTML을 요청하지 않고, 브라우저의 History API를 이용해 주소창의 URL만 바꾼 뒤 변경된 컴포넌트만 갈아 끼웁니다. 깜빡임 없이 즉각적으로 화면이 전환됩니다.
- **MPA (Multi Page Application)**
    - **개념**: 링크를 이동할 때마다 서버로부터 새로운 HTML 문서를 받아와 화면을 구성하는 전통적인 웹 애플리케이션입니다.
    - **화면 이동 방식**: 사용자가 링크를 누르면 브라우저가 새 URL로 전체 HTTP GET 요청을 보내고, 서버가 렌더링한 새 HTML을 받아와 페이지 전체를 새로고침(Flicker 현상 발생)합니다.

#### SPA의 클라이언트 내비게이션은 새로운 HTML 문서를 받는 일반적인 페이지 이동과 어떻게 다를까요?

- **일반 페이지 이동 (`<a>` 태그)**: 브라우저 메모리(DOM, 상태)를 완전히 파괴하고 서버에서 리소스를 다시 받아오므로 `useState` 등의 상태가 전부 초기화됩니다.
- **SPA 내비게이션 (`<Link>`)**: `event.preventDefault()`로 기본 동작을 막고, History API로 URL만 바꾼 뒤 공통 레이아웃은 유지한 채 변경된 부분만 렌더링하므로 **기존 상태가 안전하게 보존**됩니다.

#### SPA와 MPA는 각각 어떤 서비스나 화면에 적합할까요?

- **SPA가 적합한 서비스**
    - **특징**: 빠른 인터랙션, 부드러운 화면 전환, 복잡한 실시간 상태 관리가 중요할 때
    - **적합한 예시**: 대시보드/어드민, SaaS 협업 툴(노션, 피그마), 실시간 채팅 및 소셜 미디어 피드, 스트리밍 서비스
- **MPA가 적합한 서비스**
    - **특징**: 빠른 초기 로딩 속도와 검색 엔진 최적화(SEO), 정적 콘텐츠 소비가 중요할 때
    - **적합한 예시**: 뉴스 및 블로그 플랫폼, 이커머스 상품 상세 페이지, 기업 소개 및 랜딩 페이지

---

### Tailwind CSS

#### CSS 규칙을 직접 작성하는 방식과 비교했을 때 Tailwind CSS의 특징은 무엇일까요?

일반 CSS는 별도의 `.css` 파일에 클래스 선택자를 정의하고 스타일 속성을 작성하지만, Tailwind CSS는 미리 정의된 작은 유틸리티 클래스들을 HTML/JSX의 `className`에 직접 조립하여 스타일을 구성합니다.

| **비교 항목** | **전통적인 CSS 직접 작성** | **Tailwind CSS (유틸리티 퍼스트)** |
| --- | --- | --- |
| **작성 위치** | 별도 CSS 파일 (`App.css`, `*.module.css`) | 마크업 내부 (`className="flex p-4..."`) |
| **클래스 작명** | `.movie-card-btn-active` 등 매번 작명 고민 필요 | `px-4 py-2 bg-red-500` 등 정해진 유틸리티 사용 |
| **컨텍스트 스위칭** | HTML 파일과 CSS 파일을 계속 오가며 수정 | 마크업 안에서 스타일과 구조를 한 번에 확인 및 수정 |
| **CSS 파일 크기** | 프로젝트가 커질수록 CSS 파일 크기가 비례해서 증가 | 실제로 사용된 유틸리티만 최종 번들에 포함되어 크기가 일정 수준 수렴 |
| **디자인 일관성** | 개발자마다 임의의 수치(`padding: 13px`)를 쓸 위험 | 정의된 디자인 토큰 시스템(`p-4 = 16px`, 팔레트 등)에 의해 일관성 유지 |

#### styled-components와 Tailwind CSS는 스타일을 작성하고 생성하는 방식이 어떻게 다를까요?

- **styled-components (CSS-in-JS, 런타임 생성)**:
    - **방식**: JavaScript 템플릿 리터럴 문법을 사용해 스타일이 결합된 독립적인 React 컴포넌트를 선언합니다.
    - **생성 시점**: 브라우저에서 JavaScript 코드가 실행되는 런타임(Runtime)에 스타일 태그(`<style>`)가 생성되고 해시된 고유 클래스명이 DOM에 동적으로 주입됩니다.
    - **특징**: Props 기반의 동적 연산(`color: ${(props) => props.primary ? 'blue' : 'gray'}`)이 직관적이지만, 런타임에 스타일을 계산하고 주입하므로 추가적인 자바스크립트 실행 비용(오버헤드)이 발생합니다.
- **Tailwind CSS (Utility-First, 빌드 타임 정적 생성)**:
    - **방식**: 기존 컴포넌트 마크업의 `className`에 유틸리티 클래스를 문자열로 나열합니다.
    - **생성 시점**: Vite 등의 번들러가 실행되는 빌드 타임(Build Time)에 코드를 스캔하여, 사용된 클래스만 추려 순수 정적 CSS 파일로 번들링합니다.
    - **특징**: 런타임 계산 비용이 전혀 없어 브라우저 렌더링 성능이 순수 CSS 수준으로 빠르며, 번들 크기가 매우 작습니다.

#### Tailwind CSS에서 `bg-${color}-500`처럼 class 이름을 동적으로 조합하면 스타일이 생성되지 않을 수 있는 이유는 무엇일까요?

Tailwind CSS의 컴파일러가 코드를 읽는 **정적 분석(Static Analysis) 방식** 때문입니다.

- **원리**: Tailwind는 소스 코드(`src/**/*.tsx`)를 스캔할 때 자바스크립트 엔진을 실행해 런타임 변수(`color`)의 값을 계산하지 않습니다. 단순히 텍스트 파일 전체를 정규식으로 훑으면서 "완전한 형태의 클래스 문자열"이 존재하는지만 탐색합니다.
- **문제 발생**:
    - 소스 코드에 `bg-${color}-500`이라고 적혀 있으면, 정규식 스캐너는 `bg-${color}-500`이라는 문자열 자체를 하나의 단어로 취급합니다.
    - `bg-red-500`이나 `bg-blue-500`이라는 완성된 클래스명을 소스 코드 어디에서도 찾지 못하므로, Tailwind는 해당 클래스를 "사용되지 않는 스타일"로 판단하고 **최종 CSS 번들에서 완전히 누락**시킵니다.
- **규칙**: Tailwind 클래스는 항상 소스 코드에 완전한 전체 이름(Unbroken Complete Class Name)으로 존재해야 합니다.

#### 상태에 따라 달라지는 스타일은 완성된 class 이름의 매핑이나 CSS 변수를 이용해 어떻게 표현할 수 있을까요?

테마 색상이나 사용자가 동적으로 입력한 임의의 RGB/HEX 컬러 코드처럼 경우의 수가 무한할 때는 인라인 `style`로 CSS 변수를 주입하고, Tailwind의 임의 값 문법(`bg-[var(--custom-color)]`)을 활용합니다.

```tsx
interface ColorCardProps {
  colorCode: string; // 예: "#3b82f6" 또는 "rgb(255, 0, 100)"
  title: string;
}

export function ColorCard({ colorCode, title }: ColorCardProps) {
  return (
    <div
      // 1. 런타임에 동적으로 바뀌는 값은 CSS 변수에 주입
      style={{ "--badge-color": colorCode } as React.CSSProperties}
      // 2. Tailwind 클래스는 CSS 변수를 참조하는 고정된 완전한 문자열로 유지
      className="p-4 rounded-lg bg-[var(--badge-color)] text-white shadow-md"
    >
      <h4>{title}</h4>
    </div>
  );
}
```

- 클래스명인 `bg-[var(--badge-color)]`는 변함없는 고정 문자열이므로 Tailwind 스캐너가 빌드 타임에 정확하게 정적 CSS를 생성할 수 있습니다.
- 실제 색상 값은 런타임에 CSS 변수를 통해 안전하고 동적으로 반영됩니다.
