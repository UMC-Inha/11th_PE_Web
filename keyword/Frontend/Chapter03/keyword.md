- URL과 라우팅
    - URI, URL, path와 route는 각각 무엇이며 어떤 차이가 있을까요?
        - **URI**: 리소스를 식별하는 문자열의 큰 범주. **URL**: 그중 위치와 접근 방법을 나타내는 주소 → URL은 URI의 한 종류.
        - **path**: URL에서 호스트 뒤, `?`·`#` 앞의 경로. `https://umcine.example/movies/10?from=search`의 path는 `/movies/10`.
        - **route**: 앱이 path와 화면을 연결하기 위해 정의한 규칙. `/movies/$movieId`는 route 패턴, `/movies/10`은 실제 path. URL의 구성 요소인 path와 앱의 설정인 route는 구분 필요.
    - path param과 search param은 각각 어떤 값을 표현할 때 사용하는 것이 좋을까요?
        - **path param**: 어떤 리소스·상세 화면인지 식별하는 값. `/movies/10`의 `10`이 영화 ID이며, 워크북에서는 `movies.$movieId.tsx`가 이 경로와 연결.
        - **search param**: 같은 화면 안의 검색·필터·정렬·페이지처럼 선택 가능한 조회 조건. `/search?query=오디세이`에서 `query`가 검색어. 값이 빠져도 기본 화면을 보여줄 수 있는 경우가 많음.
        - 절대적인 문법 규칙이라기보다 URL 설계 기준. 영화 자체를 가리키는 ID는 path, 그 영화를 어떤 조건으로 찾아 보여줄지는 search가 자연스러움.
    - 검색어, 필터나 현재 화면의 상태를 URL에 포함하면 공유와 새로고침에 어떤 장점이 있을까요?
        - `/search?query=오디세이&page=2`를 공유하면 상대방도 같은 검색 조건·페이지를 재현 가능. 새로고침·북마크·뒤로 가기 후에도 URL에서 화면 상태를 다시 읽을 수 있음.
        - React의 일시적인 로컬 state에만 저장한 검색어는 새로고침 시 초기화. 다만 입력 중인 임시 텍스트까지 매번 URL에 넣을 필요는 없고, 제출된 검색어처럼 **공유할 가치가 있는 상태**를 URL에 반영.
        - URL에는 누구나 볼 수 있는 값만 사용. 비밀번호·토큰 같은 민감 정보 저장 X.

  **추가 핵심 정리**

    - **URL 구조**: `scheme://host:port/path?search#fragment`. `origin`은 scheme + host + port(해당 시), `pathname`은 path, `searchParams`는 `?` 뒤의 값, `hash`는 `#` 뒤의 값.
    - **라우팅 흐름**: 현재 URL 읽기 → route 패턴과 대조 → path/search 값 추출 → 해당 컴포넌트 렌더링. 워크북에서는 `/` → 목록, `/search` → 검색, `/movies/$movieId` → 상세 화면.
    - **파일 기반 라우팅**: `src/routes/index.tsx`, `search.tsx`, `movies.$movieId.tsx`의 파일 구조가 route를 만듦. `routeTree.gen.ts`는 플러그인의 생성 결과이므로 직접 수정 X.
    - **값의 타입**: URL에서 읽은 path param은 문자열. 영화 데이터의 숫자 ID와 비교할 때 `Number(movieId)` 같은 변환 필요. search param은 외부에서 변경 가능한 입력 → `validateSearch`로 타입과 기본값 확인.
    - **이동 시 조립**: TanStack Router에서는 URL 문자열을 직접 이어 붙이기보다 `Link`의 `to`, `params`, `search`를 분리해서 전달. 예: `to="/movies/$movieId"`, `params={{ movieId: String(movie.id) }}`. 타입 검사와 인코딩 처리에 유리.
    - **search 갱신**: 페이지 번호만 바꿀 때 다른 필터를 유지할지 결정 필요. `search={(prev) => ({ ...prev, page: 2 })}`처럼 기존 값을 펼치면 유지, 새 객체만 넘기면 교체.

  **참고자료**

    - TanStack Router - Path Params
    - TanStack Router - Search Params
- SPA와 MPA
    - SPA와 MPA는 각각 무엇이며 화면을 이동하는 방식에 어떤 차이가 있을까요?
        - **SPA(Single Page Application)**: 처음 받은 HTML 문서를 유지하면서 JavaScript가 현재 URL에 맞는 부분을 갱신하는 방식. `/`에서 `/movies/1`로 이동해도 앱의 공통 틀은 유지되고 영화 상세 컴포넌트가 표시.
        - **MPA(Multi Page Application)**: URL 이동마다 서버가 해당 페이지의 새 HTML 문서를 제공하는 방식. 브라우저가 새 문서를 로드하므로 문서 전체의 실행 상태가 다시 시작.
        - 기준은 화면 수가 아니라 **문서 이동 방식**. SPA에도 목록·검색·상세처럼 여러 화면과 URL이 존재.
    - SPA의 클라이언트 내비게이션은 새로운 HTML 문서를 받는 일반적인 페이지 이동과 어떻게 다를까요?
        - TanStack Router의 `Link`로 앱 내부를 이동하면 브라우저 기록과 URL을 바꾸고 일치하는 route 컴포넌트를 렌더링. 보통 새 HTML 문서 요청 없이 전환되지만, 필요한 JS 청크나 데이터 요청은 발생 가능.
        - 일반 `<a href>`로 다른 문서에 이동하면 브라우저가 서버에 새 문서를 요청하고 기존 문서를 교체. 단, 외부 사이트 이동이나 새로고침에서는 SPA도 문서 요청이 발생.
        - 뒤로 가기·앞으로 가기를 자연스럽게 쓰려면 URL 변경과 화면 상태를 함께 관리해야 함. 라우터가 이런 브라우저 기록 연동을 담당.
    - SPA와 MPA는 각각 어떤 서비스나 화면에 적합할까요?
        - **SPA**: 검색 조건을 바꾸거나 카드 상세를 오가는 등 상호작용이 잦고 공통 UI를 유지할 때 편리. 이번 UMCine의 목록·검색·상세 이동이 예시.
        - **MPA**: URL마다 독립된 문서와 서버 렌더링 흐름이 자연스러운 콘텐츠 중심 사이트 등에 적합. 초기 로딩, SEO, 접근성은 SPA/MPA라는 이름만으로 결정되지 않고 렌더링·캐싱·메타데이터 설계에 좌우.
        - 두 방식의 우열보다 데이터 갱신 빈도, 상호작용, 초기 표시 속도, 운영 환경을 기준으로 선택. 한 서비스에서 서버 렌더링과 클라이언트 이동을 함께 쓰는 방식도 가능.

  **추가 핵심 정리**

    - **클라이언트 라우팅의 역할**: URL → 컴포넌트 매핑. 워크북의 `__root.tsx`에서 `Header`는 공통으로 유지, `Outlet`에는 현재 route의 화면이 렌더링.
    - **초기 접속 vs 내부 이동**: 주소창에 `/movies/1` 직접 입력하거나 새로고침하면 서버에 해당 URL 요청. 앱이 뜬 뒤 내부 `Link`를 누르면 라우터가 클라이언트에서 이동. 같은 URL이어도 진입 경로에 따라 처리 시작점이 다름.
    - **배포 설정**: History 기반 SPA는 서버가 `/movies/1` 요청에도 앱의 HTML을 제공해야 직접 접속·새로고침 가능. 개발 서버에서는 되는데 배포 후 404라면 서버의 SPA fallback 설정 확인.
    - **데이터와 상태**: 같은 문서를 유지한다고 모든 데이터가 자동 유지되는 것은 X. 컴포넌트가 다시 렌더링·마운트될 수 있으며, 새로고침하면 메모리 state는 초기화. 유지할 값은 URL, 저장소 또는 서버 데이터에 반영.
    - **성능 관점**: SPA는 문서 재로드를 줄일 수 있지만 초기 JS가 크면 첫 화면이 늦어질 수 있음. route별 코드 분할, 이미지 최적화, 데이터 로딩 전략이 중요. MPA도 캐싱·부분 갱신 등으로 충분히 빠를 수 있음.
    - **확인 방법**: 개발자 도구 Network에서 내부 이동 시 새 `document` 요청 여부 확인 → 주소창 직접 입력·새로고침 때의 요청과 비교.

  **참고자료**

    - MDN - SPA
- Tailwind CSS
    - CSS 규칙을 직접 작성하는 방식과 비교했을 때 Tailwind CSS의 특징은 무엇일까요?
        - 직접 작성: `.movie-card { border-radius: 10px; background: white; }`처럼 선택자와 선언을 CSS 파일에 정의하고 JSX에서 class 이름을 연결.
        - Tailwind: `className="rounded-[10px] bg-white"`처럼 작은 목적별 utility를 요소에 조합. 스타일이 쓰이는 위치에서 의도를 확인하기 쉽고, 동일한 간격·색상 체계를 재사용 가능.
        - CSS 자체를 없애는 도구 X. 생성된 utility도 CSS 규칙이며, 복잡한 재사용 스타일이나 전역 규칙에는 일반 CSS를 함께 사용 가능.
    - styled-components와 Tailwind CSS는 스타일을 작성하고 생성하는 방식이 어떻게 다를까요?
        - **styled-components**: JavaScript/TypeScript의 tagged template literal에 CSS를 작성하고 스타일이 연결된 React 컴포넌트를 생성. props를 이용한 동적 스타일링 가능.
        - **Tailwind CSS**: TSX의 `className`에 utility 이름을 작성. 빌드 도구가 소스에서 발견한 완성된 class를 바탕으로 CSS를 생성하며, 요소는 일반 React/HTML 요소로 유지.
        - 차이는 단순히 파일 위치가 아니라 스타일의 단위와 생성 시점. styled-components는 컴포넌트 중심 CSS-in-JS, Tailwind는 utility 중심의 소스 탐지·빌드 방식. 둘 다 상황에 따라 선택 가능.
    - Tailwind CSS에서 `bg-${color}-500`처럼 class 이름을 동적으로 조합하면 스타일이 생성되지 않을 수 있는 이유는 무엇일까요?
        - Tailwind는 소스 파일을 텍스트로 살피며 **완성된 class 이름**을 탐지. `bg-${color}-500`에는 `bg-red-500`이라는 문자열이 그대로 존재하지 않아 필요한 CSS를 만들지 못할 수 있음.
        - React가 실행될 때 class 문자열을 완성해도 CSS 생성은 이미 끝난 상태 → DOM에 class가 붙었는데 배경색은 적용되지 않는 상황.
    - 상태에 따라 달라지는 스타일은 완성된 class 이름의 매핑이나 CSS 변수를 이용해 어떻게 표현할 수 있을까요?
        - 선택지가 정해져 있으면 `{ active: "bg-blue-600", idle: "bg-black/60" }`처럼 **완성된 class**를 매핑하거나 `movie.isBookmarked ? "bg-blue-600" : "bg-black/60"`처럼 조건부 선택.
        - 워크북의 `cn`은 `clsx`로 조건부 class를 모으고 `tailwind-merge`로 충돌하는 Tailwind utility를 정리하는 프로젝트 유틸. Tailwind 내장 함수 X.
        - API에서 받은 임의의 색상처럼 값의 종류가 고정되지 않으면 CSS 변수 값을 `style`로 전달하고, 소스에는 `bg-(--card-color)` 같은 **고정된 utility 문자열**을 작성. 외부 값은 색상 형식 검증 필요.

  **추가 핵심 정리**

    - **utility 조합**: `p-4`, `rounded-lg`, `bg-white`, `grid`처럼 한 class가 작은 스타일 역할을 담당. 특정 영화 카드에서만 쓰는 규칙을 찾으려고 CSS 파일 전체를 왕복할 필요 감소.
    - **상태 variant**: `hover:bg-blue-700`, `focus-visible:ring-2`, `disabled:opacity-50`처럼 조건을 prefix로 표현. 북마크의 React state 조건과 CSS의 hover/focus 조건은 서로 다른 종류.
    - **반응형**: 기본 class가 모바일에도 적용되고 `sm:`, `lg:` 등은 지정한 breakpoint 이상에서 적용. 워크북의 `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`은 화면이 넓어질수록 열 수 증가.
    - **디자인 토큰과 임의값**: 반복되는 색상·간격은 Tailwind v4의 `@theme`로 이름을 부여해 재사용. Figma의 일회성 정확한 값은 `rounded-[10px]`처럼 대괄호 문법 사용 가능. 임의값 남발보다 반복 값의 일관성 우선.
    - **충돌과 우선순위**: 같은 요소에 `p-2`와 `p-4`를 함께 넣으면 의도 파악이 어려움. 조건부 조합 시 `cn`이 충돌 정리를 도울 수 있지만, 상태 설계를 명확히 하는 것이 먼저.
    - **트레이드오프**: 빠른 화면 조합과 디자인 규칙 재사용이 장점. 반대로 `className`이 길어지거나 비슷한 class 묶음이 반복되면 읽기 어려움 → 컴포넌트 분리, 공통 토큰 정리, 필요한 경우 CSS 규칙 사용.

  **참고자료**

    - Tailwind CSS - Styling with utility classes
    - Tailwind CSS - Detecting classes in source files