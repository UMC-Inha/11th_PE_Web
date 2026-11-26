- 프레임워크의 역할
    - Next.js는 TanStack Router에 더해 어떤 기능을 제공하나요?
        - TanStack Router는 경로에 맞는 화면 연결과 이동이 중심. Next.js는 여기에 서버 렌더링·정적 생성, Server Component, 이미지·폰트 최적화, 메타데이터 등을 통합한 React 프레임워크.
        - 예: 영화 상세 페이지를 서버에서 준비하고, `next/image`로 포스터 최적화, `metadata`로 제목·공유 이미지 설정.
    - 고객 대상 서비스와 사내 서비스 등 상황이 달라져도 Next.js가 항상 가장 좋은 선택일까요?
        - 항상 최선인 것은 X. 검색 노출·링크 공유·빠른 첫 화면이 중요하면 Next.js의 기능이 유용.
        - 로그인 후 사용하는 내부 도구처럼 검색 노출의 비중이 낮고 기존 SPA가 잘 동작한다면 React·Vite 구성도 선택 가능. 필요한 기능, 팀의 숙련도, 배포·캐시 운영 부담을 함께 비교.

  **추가 핵심 정리**

    - **규칙과 자유도**: 파일 기반 라우팅 등 기본 규칙 덕분에 구성이 쉬워지는 대신, 프레임워크의 실행 방식과 제약도 학습 필요.
    - **기존 백엔드 유지**: Next.js로 프론트를 옮겨도 Spring API를 계속 호출 가능. 풀스택 기능 제공이 기존 백엔드를 반드시 교체한다는 뜻은 X.

  **참고 자료**

    - Next.js — 소개
    - Next.js — Server and Client Components
- Server Component와 Client Component
    - 어떤 기준으로 Server Component와 Client Component를 나누면 좋을까요?
        - **Server Component**: App Router의 페이지·레이아웃 기본값. 서버에서 데이터 조회·화면 구성, 해당 컴포넌트의 실행 코드를 브라우저에 보내지 않아 JavaScript 전송량 감소.
        - **Client Component**: `useState`, `useEffect`, 클릭 이벤트, 브라우저 API가 필요한 부분. 예: 영화 소개는 서버에서 준비하고 북마크 버튼·평점 입력 폼은 클라이언트로 분리.
    - `"use client";` 지시어를 `page.tsx` 최상단에 선언해도 될까요?
        - 가능. import보다 위에 작성하면 그 파일이 클라이언트 코드의 진입점으로 지정.
        - 다만 import하는 의존 코드까지 클라이언트 범위가 커질 수 있고, 같은 파일에서 `metadata`·`generateMetadata` export는 불가. 페이지 전체보다 상호작용이 필요한 작은 부분부터 분리.

  **추가 핵심 정리**

    - **경계의 기준**: 단순히 화면에 포함된 모든 자식이 클라이언트가 되는 것은 X. 서버에서 만든 UI를 Client Component의 `children`으로 전달하는 조합도 가능.
    - **props 전달**: 서버 → 클라이언트 경계를 넘는 값은 React가 직렬화할 수 있는 형태로 전달. 일반 이벤트 함수는 서버에서 넘기기보다 Client Component 안에서 정의.

  **참고 자료**

    - Next.js — Server and Client Components
    - Next.js — use client
- 렌더링 방식
    - `"use client";` 지시어가 붙은 Client Component는 브라우저에서만 렌더링될까요?
        - 브라우저에서만 렌더링되는 것은 X. 첫 접속에는 Client Component의 HTML도 서버에서 미리 준비할 수 있고, 브라우저에서 하이드레이션으로 이벤트·상태 동작 연결.
        - 따라서 렌더링 중 `window`·`localStorage`에 바로 접근하면 서버에서 오류 가능. 클릭 핸들러나 `useEffect`처럼 브라우저에서 실행되는 시점에 사용.
    - SSR과 SSG를 더 정리해 보고, ISR과 ISSG가 각각 어떤 의미로 쓰이는지 조사해 보세요. 페이지 생성 시점과 렌더링 방식을 기준으로 서로 어떤 관계가 있는지도 살펴보세요.
        - **SSR — Server-Side Rendering**: 요청 시 서버에서 HTML 생성. 개인별 화면·최신 데이터에 적합하지만 요청마다 서버 작업과 응답 대기 발생.
        - **SSG — Static Site Generation**: 빌드 시 HTML을 미리 생성해 재사용. 소개·문서처럼 공통 내용에 적합하고 응답이 빠르지만, 기본적으로 배포 이후의 변경을 반영할 방법이 별도로 필요.
        - **ISR — Incremental Static Regeneration**: 배포 후에도 전체 재빌드 없이 정적 결과를 생성·갱신. 예: 영화 소개를 캐시해 제공하고, 재검증 조건에 따라 새 결과로 교체. 요청마다 새로 만드는 SSR과 달리 결과 재사용이 핵심이며 최신 값 반영까지 지연 가능.
        - **ISSG**: 자료에서 *Incremental Static Site Generation*으로 쓰는 경우, 필요한 경로를 빌드 이후에도 추가 생성해 재사용하는 의미. 초기 Next.js 자료의 *Incremental Static Generation* 설명과 연결되는 개념. 현재 공식 문서는 신규 생성·기존 갱신을 ISR에서 함께 다루므로, 서로 완전히 독립된 표준 모드로 암기하는 것은 X. 자료의 용어 정의 확인 필요.

  **추가 핵심 정리**

    - **서로 다른 구분 축**: Server/Client는 실행 코드와 역할의 경계, SSR/SSG는 HTML 준비 시점의 구분. Server Component라고 항상 요청마다 실행되는 것은 X.
    - **부분 사전 렌더링(PPR)**: 한 페이지에서도 정적 부분과 요청 시 준비할 부분을 혼합 가능. 워크북의 `◐ /[id]`는 공통 화면·로딩 UI를 미리 준비하고 동적 내용을 서버에서 스트리밍하는 예시. 페이지 전체를 매 요청 다시 만든다는 뜻은 X.

  **참고 자료**

    - Next.js — Server and Client Components
    - Next.js — Incremental Static Regeneration