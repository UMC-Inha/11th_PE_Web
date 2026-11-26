- 프레임워크의 역할
    - Next.js는 TanStack Router에 더해 어떤 기능을 제공하나요?
        
        TanStack Router는 URL에 맞는 화면을 연결하고 내비게이션을 관리하는 **라우팅 라이브러리**다. Next.js는 라우팅뿐 아니라 서버 실행, 렌더링, 캐싱과 빌드까지 통합하여 제공하는 **React 기반 풀스택 프레임워크**다.
        
        Next.js는 TanStack Router 위에 기능을 추가한 도구가 아니라, 자체 라우터를 포함하는 별도의 프레임워크다.
        
        | 기능 | Next.js에서 제공하는 내용 |
        | --- | --- |
        | 파일 기반 라우팅 | `page.tsx`, `layout.tsx`로 경로와 화면 구성 |
        | 서버 렌더링 | 요청 시 서버에서 HTML 생성 |
        | 정적 페이지 생성 | 미리 생성한 페이지를 재사용 |
        | Server Component | 서버에서 데이터 조회와 UI 구성 |
        | 서버 기능 | Route Handler, Server Function으로 서버 로직 실행 |
        | 캐싱·재검증 | 데이터와 렌더링 결과를 캐시하고 갱신 |
        | 최적화 | 이미지·폰트 최적화, 코드 분할 |
        | 메타데이터 | 페이지 제목, 설명, OG 이미지 등 관리 |
        
        예를 들어 Next.js에서는 `app/api/books/route.ts`에 HTTP 요청을 처리하는 서버 코드를 작성할 수 있다. 따라서 별도 API 서버 없이도 일부 백엔드 기능을 구현할 수 있다. Next.js
        
        다만 **TanStack Router로는 SSR이 불가능하다는 뜻은 아니다.** SSR 구성을 지원하며, 풀스택 기능까지 통합한 TanStack 계열 프레임워크는 TanStack Start다. TanStack Router Docs
        
        > TanStack Router는 라우팅을 중심으로 도구를 조합하는 방식이고, Next.js는 라우팅부터 서버 실행과 렌더링까지 통합된 구조를 제공한다.
        > 
    - 고객 대상 서비스와 사내 서비스 등 상황이 달라져도 Next.js가 항상 가장 좋은 선택일까요?
        
        항상 그렇지는 않다. **검색 노출, 화면의 상호작용, 서버 구조와 팀의 운영 역량**에 따라 선택해야 한다.
        
        | 서비스 상황 | 선택 시 고려할 점 |
        | --- | --- |
        | 쇼핑몰·뉴스·블로그 | 검색 노출과 초기 콘텐츠 표시가 중요하므로 Next.js의 사전 렌더링이 유용함 |
        | 사내 관리 도구 | 로그인 후 이용하고 검색 노출이 불필요하다면 SPA 구성이 더 단순할 수 있음 |
        | 상호작용이 많은 편집 도구 | 브라우저 상태와 이벤트 처리가 많으므로 클라이언트 중심 구성이 중요함 |
        | 기존 Spring Boot API가 있는 서비스 | React와 TanStack Router만으로도 충분할 수 있으며, SSR이 필요하면 Next.js를 함께 사용할 수 있음 |
        
        Next.js를 도입하면 서버와 클라이언트의 실행 경계, 캐싱, 하이드레이션과 배포 환경도 이해해야 한다. 필요하지 않은 기능까지 도입하면 개발·운영 복잡성이 커질 수 있다.
        
        반대로 사내 서비스라도 서버에서 API를 중계하거나 서버 렌더링을 활용할 이유가 있다면 Next.js가 적절할 수 있다.
        
        > 고객 대상인지 사내 서비스인지 하나만으로 결정하지 않고, 필요한 기능과 도입 비용을 비교해야 한다.
        > 
- Server Component와 Client Component
    - 어떤 기준으로 Server Component와 Client Component를 나누면 좋을까요?
        
        기준은 **사용자 상호작용과 브라우저 기능이 필요한가**이다. App Router의 페이지와 레이아웃은 기본적으로 Server Component다. Next.js
        
        ### Server Component가 적절한 경우
        
        - 서버에서 데이터를 조회하는 부분
        - API Key나 DB 접근처럼 서버에서만 실행해야 하는 로직
        - 사용자 이벤트 없이 데이터를 표시하는 화면
        - 브라우저로 전달할 JavaScript를 줄이고 싶은 부분
        
        ### Client Component가 필요한 경우
        
        - `useState`로 상태를 관리하는 부분
        - `onClick`, `onChange` 같은 이벤트 처리
        - `useEffect` 사용
        - `window`, `localStorage` 등 브라우저 API 사용
        - 브라우저에서 동작하는 라이브러리 사용
        
        예를 들어 상품 상세 정보는 Server Component로, 수량 선택 버튼은 Client Component로 나눌 수 있다.
        
        ```tsx
        // app/products/[id]/page.tsx
        // Server Component
        
        import QuantitySelector from "./quantity-selector";
        
        export default function ProductPage() {
          return (
            <main>
              <h1>상품 상세</h1>
              <p>상품 설명입니다.</p>
        
              <QuantitySelector />
            </main>
          );
        }
        ```
        
        ```tsx
        // quantity-selector.tsx
        "use client";
        
        import { useState } from "react";
        
        export default function QuantitySelector() {
          const [quantity, setQuantity] = useState(1);
        
          return (
            <button onClick={() => setQuantity(quantity + 1)}>
              수량: {quantity}
            </button>
          );
        }
        ```
        
        > 전체 화면을 Client Component로 만들기보다, 상호작용이 필요한 부분만 작게 분리하는 것이 기본적인 기준이다.
        > 
    - `"use client";` 지시어를 `page.tsx` 최상단에 선언해도 될까요?
        
        가능하다. import보다 위에 선언하면 해당 페이지가 Client Component가 된다.
        
        ```jsx
        "use client";
        
        import { useState } from "react";
        
        export default function Page() {
          const [count, setCount] = useState(0);
        
          return (
            <button onClick={() => setCount(count + 1)}>
              {count}
            </button>
          );
        }
        ```
        
        다만 `"use client"`는 **서버와 클라이언트의 경계**를 만든다. 해당 파일이 직접 import하는 컴포넌트와 모듈도 클라이언트 번들에 포함될 수 있으므로, 경계를 지나치게 높게 두면 브라우저가 받아야 하는 JavaScript가 늘어난다. Next.js
        
        또한 해당 페이지에서는 서버 전용 DB 접근이나 `generateMetadata` 같은 서버 전용 기능을 사용할 수 없다.
        
        따라서 페이지 전체에 상호작용이 필요하다면 선언해도 되지만, 일부 버튼이나 입력창만 필요하다면 그 부분을 별도 Client Component로 분리하는 편이 좋다.
        
        > `page.tsx`에 선언하는 것은 가능하지만, 필요한 최소 범위에 선언하는 것이 좋다.
        > 
- 렌더링 방식
    - `"use client";` 지시어가 붙은 Client Component는 브라우저에서만 렌더링될까요?
        
        아니다. **Client Component도 최초 페이지 요청에서는 서버에서 HTML로 사전 렌더링될 수 있다.**
        
        일반적인 최초 로딩 과정은 다음과 같다.
        
        1. 서버가 Server Component와 Client Component를 포함한 초기 HTML을 생성한다.
        2. 브라우저가 HTML을 받아 화면을 표시한다.
        3. Client Component의 JavaScript를 다운로드한다.
        4. 하이드레이션으로 클릭 이벤트와 상태 관리 기능을 연결한다.
        
        Next.js 공식 문서도 Client Component가 기본적으로 서버에서 사전 렌더링된다고 설명한다. Next.js
        
        따라서 `"use client"`는 “서버에서 실행하지 않는다”가 아니라 “브라우저에서 상태와 이벤트를 처리할 수 있는 컴포넌트 경계를 만든다”는 의미다.
        
        이 때문에 렌더링 중에 브라우저 전용 API를 바로 사용하면 문제가 생길 수 있다.
        
        ```jsx
        "use client";
        
        // 서버에는 localStorage가 없으므로 오류 가능
        const theme = localStorage.getItem("theme");
        ```
        
        브라우저에서만 실행해야 하는 코드는 `useEffect` 안에서 처리할 수 있다.
        
        ```jsx
        "use client";
        
        import { useEffect, useState } from "react";
        
        export default function ThemeLabel() {
          const [theme, setTheme] = useState("light");
        
          useEffect(() => {
            setTheme(localStorage.getItem("theme") ?? "light");
          }, []);
        
          return <p>현재 테마: {theme}</p>;
        }
        ```
        
        `useEffect`는 서버 렌더링 중에는 실행되지 않는다.
        
        > Client Component와 CSR은 같은 개념이 아니다. Client Component도 서버에서 초기 HTML을 생성한 뒤 브라우저에서 하이드레이션될 수 있다.
        > 
    - SSR과 SSG를 더 정리해 보고, ISR과 ISSG가 각각 어떤 의미로 쓰이는지 조사해 보세요. 페이지 생성 시점과 렌더링 방식을 기준으로 서로 어떤 관계가 있는지도 살펴보세요.
        
        ### SSR: Server-Side Rendering
        
        사용자의 **요청이 들어올 때 서버에서 HTML을 생성**하는 방식이다.
        
        ```
        요청 도착 → 서버에서 데이터 조회·HTML 생성 → 응답
        ```
        
        요청 시점의 데이터나 사용자별 정보를 반영하기 좋다. 다만 요청마다 서버 작업이 필요하므로 서버 부하와 응답 시간을 고려해야 한다.
        
        대표적인 활용 예시는 로그인 사용자의 개인화된 페이지다.
        
        ### SSG: Static Site Generation
        
        일반적으로 **빌드 시점에 HTML을 미리 생성**하고, 요청이 오면 이미 만들어진 결과를 전달하는 방식이다.
        
        ```
        빌드 시 HTML 생성 → 저장 → 여러 요청에 재사용
        ```
        
        빠르게 응답할 수 있고 서버 부하가 적다. 하지만 빌드 이후 변경된 콘텐츠를 반영하려면 다시 생성하는 과정이 필요하다.
        
        회사 소개, 문서, 변경 빈도가 낮은 콘텐츠에 적합하다.
        
        SSR과 SSG는 모두 브라우저에 도착하기 전에 HTML을 만드는 사전 렌더링 방식이지만, 생성 시점이 다르다. Next.js
        
        ### ISR: Incremental Static Regeneration
        
        정적으로 생성한 페이지를 **전체 사이트를 다시 빌드하지 않고 필요한 단위로 재생성**하는 방식이다.
        
        SSG의 빠른 응답을 유지하면서 콘텐츠도 갱신할 수 있다. Next.js에서는 시간 기반 재검증이나 명시적인 무효화로 갱신을 제어할 수 있다. Next.js
        
        시간 기반 ISR의 대표적인 동작은 다음과 같다.
        
        1. 생성해 둔 페이지를 요청에 반환한다.
        2. 설정한 유효 시간이 지난 뒤 요청이 들어온다.
        3. 기존 페이지를 반환하면서 백그라운드에서 재생성한다.
        4. 재생성이 성공하면 이후 요청에 새 페이지를 반환한다.
        
        **시간이 지났다고 정확히 그 순간 자동으로 재생성되는 것은 아니다.** 일반적으로 만료 후 들어오는 요청이 재생성을 유발한다.
        
        상품 소개나 블로그처럼 약간의 갱신 지연을 허용할 수 있는 콘텐츠에 적합하다.
        
        ### ISSG: Incremental Static Site Generation
        
        ISSG는 **정적 사이트를 필요한 페이지 단위로 점진적으로 생성·갱신한다**는 의미로 쓰인다.
        
        다만 Next.js 공식 문서에서는 일반적으로 **ISR**이라는 명칭을 사용한다. ISSG를 SSR·SSG·ISR과 완전히 별개의 표준 렌더링 방식으로 단정하면 안 된다.
        
        자료에 따라 ISR과 비슷한 의미로 쓰이거나, 변경된 페이지만 다시 생성·배포하는 증분 빌드 방식을 뜻할 수 있다. 실제로 Uniform은 변경된 페이지만 생성·배포하는 기능을 ISSG라고 부르며 Next.js의 ISR과 구분한다. Uniform for Sitecore Docs
        
        따라서 워크북에서 ISSG를 사용했다면 해당 자료가 어떤 의미로 정의했는지 확인해야 한다.
        
        ### 생성 시점 기준 비교
        
        | 구분 | 페이지 생성·갱신 시점 | 요청 처리 |
        | --- | --- | --- |
        | SSR | 요청 시점 | 서버에서 생성한 결과 반환 |
        | SSG | 일반적으로 빌드 시점 | 미리 생성한 결과 재사용 |
        | ISR | 최초 생성 후, 재검증 조건에 따라 | 캐시된 정적 결과를 재사용하며 갱신 |
        | ISSG | 사용하는 도구·자료의 정의에 따라 다름 | 필요한 페이지만 점진적으로 생성·갱신 |
        
        ### Server/Client Component와의 관계
        
        두 분류는 서로 다른 기준이다.
        
        | 분류 | 구분하는 기준 |
        | --- | --- |
        | Server / Client Component | 컴포넌트의 실행 환경과 클라이언트 기능 사용 여부 |
        | SSR / SSG / ISR | HTML을 언제 생성하고 어떻게 재사용·갱신하는지 |
        
        따라서 다음과 같은 조합이 가능하다.
        
        - Server Component를 빌드 시 실행하여 정적 페이지 생성
        - Server Component를 요청 시 실행하여 동적 페이지 생성
        - Client Component를 서버에서 사전 렌더링한 뒤 브라우저에서 하이드레이션
        
        > Server Component라고 항상 SSR인 것도 아니고, Client Component라고 항상 브라우저에서만 렌더링되는 것도 아니다. 컴포넌트의 종류와 페이지 생성 시점은 별도로 구분해야 한다.
        >