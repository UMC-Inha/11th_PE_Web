- 프레임워크의 역할
    - Next.js는 TanStack Router에 더해 어떤 기능을 제공하나요?
        
        > Next.js는 라우팅과 함께 서버 렌더링, 서버 코드 실행, 캐시 관리, 이미지 최적화 등을 통합해서 제공하는 React 프레임워크이다.
        > 
        
        영화 서비스를 만들 때는 URL에 맞는 화면을 보여주는 것 외에도 여러 기능이 필요하다.
        
        ```
        /movies       → 영화 목록 표시
        /movies/42    → 42번 영화 상세 표시
        
        추가로 필요한 작업
        ├─ 영화 데이터를 어디에서 조회할 것인가?
        ├─ 최초 HTML을 언제 만들 것인가?
        ├─ 포스터 이미지를 어떻게 제공할 것인가?
        ├─ 검색 결과와 공유 카드에 어떤 정보를 표시할 것인가?
        └─ 외부 API의 비밀 키를 어디에서 사용할 것인가?
        ```
        
        ### TanStack Router가 제공하는 기능
        
        TanStack Router는 경로와 화면을 연결하는 기능을 중심으로, URL에 관련된 여러 기능을 제공한다.
        
        | 기능 | 영화 서비스 예시 |
        | --- | --- |
        | 경로 매칭 | `/movies/42`에 영화 상세 화면 연결 |
        | 경로 파라미터 | `movieId` 읽기 |
        | 검색 파라미터 관리 | 검색어, 장르, 페이지 번호 처리 |
        | 중첩 라우트 | 관리자 레이아웃 안에 영화 관리 화면 배치 |
        | 데이터 로더 | 화면 진입에 필요한 데이터 로딩 |
        | 내비게이션 | 문서 전체를 교체하지 않고 내부 화면 이동 |
        | 타입 안전성 | 경로와 파라미터 사용을 TypeScript로 확인 |
        
        TanStack Router는 SSR도 지원한다. 서버 렌더링까지 포함한 애플리케이션 구성을 제공하는 관련 프레임워크로는 TanStack Start가 있다. 따라서 비교할 때는 TanStack Router라는 라우팅 라이브러리와, 라우팅을 포함한 Next.js라는 프레임워크의 범위를 구분해야 한다.
        
        ### Next.js가 통합해서 제공하는 기능
        
        | 영역 | 기능 | 영화 서비스 예시 |
        | --- | --- | --- |
        | 라우팅 | 파일 기반 경로, 중첩 레이아웃 | 영화 상세와 관리자 화면 구성 |
        | 렌더링 | 서버 렌더링, 정적 생성, 스트리밍 | 영화 소개 내용을 HTML에 포함 |
        | 컴포넌트 실행 | Server Component와 Client Component | 서버 데이터 조회와 북마크 버튼 결합 |
        | 서버 처리 | Route Handler, Server Function | 외부 영화 API 호출, 데이터 수정 처리 |
        | 캐시 | 서버 데이터·렌더링 결과 재사용과 재검증 | 영화 소개를 재사용하다가 변경 시 갱신 |
        | 이미지 | `next/image` | 포스터 크기와 로딩 방식 최적화 |
        | 메타데이터 | 제목, 설명, Open Graph 정보 | 영화별 검색 결과와 공유 카드 구성 |
        | UI 흐름 | 로딩·오류 화면을 위한 파일 규칙 | 상세 조회 중 로딩 화면 표시 |
        
        App Router에서는 다음처럼 파일을 배치할 수 있다.
        
        ```
        app/
        ├─ layout.tsx
        ├─ movies/
        │  ├─ page.tsx
        │  ├─ loading.tsx
        │  └─ [movieId]/
        │     └─ page.tsx
        └─ api/
           └─ movies/
              └─ route.ts
        ```
        
        | 파일 | 역할 |
        | --- | --- |
        | `layout.tsx` | 공통 레이아웃 |
        | `movies/page.tsx` | 영화 목록 페이지 |
        | `movies/loading.tsx` | 해당 구간의 로딩 UI |
        | `movies/[movieId]/page.tsx` | 영화 상세 페이지 |
        | `api/movies/route.ts` | HTTP 요청을 처리하는 Route Handler |
        
        외부 영화 API를 호출하는 Route Handler에서는 서버 환경변수를 사용할 수 있다. 프론트엔드는 필요한 검색 조건만 보내고, 서버가 비밀 키를 추가해 외부 API를 호출하는 구조를 구성할 수 있다.
        
        또한 Next.js와 별도의 Node.js 백엔드를 함께 사용할 수도 있다.
        
        ```
        브라우저
           ↓
        Next.js
        ├─ 화면 렌더링
        └─ 프론트엔드에 필요한 서버 처리
           ↓
        NestJS 등 별도 백엔드
        ├─ 회원·예매 업무 규칙
        └─ DB 접근
        ```
        
        Next.js가 제공하는 서버 기능을 어느 범위까지 사용할지는 기존 백엔드의 역할과 배포 구조에 따라 정한다.
        
    - 고객 대상 서비스와 사내 서비스 등 상황이 달라져도 Next.js가 항상 가장 좋은 선택일까요?
        
        > 선택 기준은 사용 대상뿐 아니라 검색 노출, 최초 화면, 상호작용, 서버 기능, 배포 환경에 대한 요구사항이다.
        > 
        
        고객 대상 서비스라도 로그인한 사용자만 사용하는 편집 도구일 수 있다. 사내 서비스라도 서버에서 데이터를 조합하고 보안이 필요한 자격 증명을 다뤄야 할 수 있다.
        
        따라서 “고객 대상이면 Next.js”, “사내 서비스면 SPA”처럼 서비스 이름만으로 결정하기보다는 실제 화면과 운영 요구를 살펴봐야 한다.
        
        ### 고객 대상 영화 서비스
        
        공개 영화 상세 페이지에서는 다음이 중요할 수 있다.
        
        - 검색 엔진이 영화 제목과 줄거리를 읽을 수 있어야 한다.
        - 링크를 공유했을 때 영화별 제목과 포스터가 표시되어야 한다.
        - 사용자가 처음 접속했을 때 주요 내용을 빠르게 볼 수 있어야 한다.
        - 자주 변하지 않는 영화 소개는 여러 요청에서 재사용할 수 있어야 한다.
        
        이런 경우 Next.js의 서버 렌더링, 정적 생성, 메타데이터 관리 등을 활용할 수 있다.
        
        ### 사내 영화 운영 도구
        
        운영자가 로그인한 뒤 사용하는 영화 관리 화면에서는 다른 요구가 우선할 수 있다.
        
        ```
        검색 조건 변경
            ↓
        관리 목록 조회
            ↓
        여러 항목 선택
            ↓
        내용 수정
            ↓
        결과 확인
        ```
        
        이미 별도의 API 서버가 있고, 검색 노출이 필요하지 않으며, 사용자 조작과 클라이언트 상태가 많다면 Vite·React·TanStack Router 같은 구성이 요구에 잘 맞을 수 있다.
        
        반면 사내 서비스에서도 Next.js가 제공하는 서버 기능이나 팀의 기존 개발 환경을 활용할 수 있다면 Next.js를 선택할 이유가 있다.
        
        ### 선택할 때 비교할 항목
        
        | 판단 항목 | 확인할 질문 |
        | --- | --- |
        | 공개 콘텐츠 | 로그인하지 않은 사용자가 읽는 페이지가 많은가? |
        | 검색·공유 | 검색 결과와 공유 카드에 콘텐츠가 잘 나타나야 하는가? |
        | 상호작용 | 편집기, 복잡한 폼, 실시간 필터처럼 브라우저 동작이 많은가? |
        | 기존 백엔드 | 이미 화면에 필요한 API가 충분히 제공되는가? |
        | 서버 실행 환경 | Node.js 서버나 지원되는 배포 환경을 운영할 수 있는가? |
        | 캐시 | 어떤 데이터를 누구에게 얼마 동안 재사용할 것인가? |
        | 개발·운영 비용 | 팀이 해당 구조를 이해하고 유지할 수 있는가? |
        
        Next.js를 도입하면 라우팅과 렌더링 등의 기능을 통합할 수 있지만, Server·Client 경계와 캐시 정책을 이해해야 한다. 서버 실행이 필요한 기능을 선택하면 그 실행 환경도 운영해야 한다.
        
        정적 내보내기로 배포하는 방식도 가능하다. 다만 이 경우 사용할 수 있는 기능은 정적 호스팅 환경에 맞춰 제한된다. 예를 들어 요청 시 실행되는 서버 처리나 ISR에는 그에 맞는 실행 환경이 필요하다.
        
        영화 서비스 안에서도 공개 상세 페이지와 관리자 편집 화면의 요구는 다를 수 있다. 프로젝트 전체의 기술 선택을 정한 뒤에도, 각 화면에는 서로 다른 렌더링과 데이터 조회 전략을 적용할 수 있다.
        
- Server Component와 Client Component
    - 어떤 기준으로 Server Component와 Client Component를 나누면 좋을까요?
        
        > 서버 데이터와 서버 전용 기능을 사용하는 부분은 Server Component로, 상태·이벤트·브라우저 기능이 필요한 부분은 Client Component로 구성한다.
        > 
        
        App Router에서 `page.tsx`와 `layout.tsx`는 기본적으로 Server Component이다. 상호작용이 필요한 컴포넌트에 `"use client"`를 선언해 클라이언트 코드의 진입점을 만들 수 있다.
        
        ### 기능별 판단 기준
        
        | 필요한 기능 | 구성 방향 |
        | --- | --- |
        | 서버에서 영화 정보 조회 | Server Component |
        | 서버 전용 API Key 사용 | 서버 전용 코드와 Server Component 등 |
        | 영화 제목과 줄거리 표시 | 서버에서 구성 가능 |
        | 클릭으로 북마크 상태 변경 | Client Component |
        | `useState`, `useEffect` 사용 | Client Component |
        | 입력값 변경에 따른 화면 갱신 | Client Component |
        | `localStorage`, 브라우저 위치 정보 접근 | 브라우저에서 실행되는 Client Component 코드 |
        | Zustand·TanStack Query 훅 사용 | 해당 훅을 사용하는 Client Component |
        
        “데이터를 조회하니까 무조건 Server Component”로 정할 필요는 없다. 검색 조건이 자주 바뀌거나 클라이언트 캐시를 활용하는 화면은 Client Component에서 TanStack Query로 데이터를 조회할 수도 있다.
        
        ### 영화 상세 페이지 나누기
        
        영화 상세 화면에는 서버에서 조회한 소개 정보와 사용자 조작이 필요한 버튼을 함께 배치할 수 있다.
        
        ```
        MoviePage
        ├─ 영화 제목
        ├─ 줄거리
        ├─ 개봉일
        └─ BookmarkToggle
           ├─ 북마크 상태
           └─ 클릭 이벤트
        ```
        
        `MoviePage`는 Server Component로 두고, 북마크 조작 부분에 Client Component를 사용할 수 있다.
        
        ```tsx
        // app/movies/[movieId]/page.tsx
        
        import BookmarkToggle from "@/components/BookmarkToggle";
        import { getMovie } from "@/lib/movies";
        
        type MoviePageProps = {
          params: Promise<{
            movieId: string;
          }>;
        };
        
        export default async function MoviePage({
          params,
        }: MoviePageProps) {
          const { movieId } = await params;
          const movie = await getMovie(movieId);
        
          return (
            <main>
              <h1>{movie.title}</h1>
              <p>{movie.synopsis}</p>
        
              <BookmarkToggle movieId={movie.id} />
            </main>
          );
        }
        ```
        
        `getMovie()`는 프로젝트에서 구현한 서버용 영화 조회 함수라고 가정한다.
        
        ```tsx
        // components/BookmarkToggle.tsx
        "use client";
        
        import { useState } from "react";
        
        type BookmarkToggleProps = {
          movieId: string;
        };
        
        export default function BookmarkToggle({
          movieId,
        }: BookmarkToggleProps) {
          const [isBookmarked, setIsBookmarked] =
            useState(false);
        
          return (
            <button
              type="button"
              aria-pressed={isBookmarked}
              onClick={() => {
                setIsBookmarked((previous) => !previous);
              }}
            >
              {isBookmarked
                ? `${movieId}번 영화 북마크 해제`
                : `${movieId}번 영화 북마크`}
            </button>
          );
        }
        ```
        
        위 버튼은 경계를 설명하기 위한 로컬 상태 예시다. 서버 북마크 저장과 최초 북마크 여부 조회는 별도 구현이 필요하다.
        
        ### Server에서 Client로 전달하는 값
        
        Server Component에서 Client Component로 전달하는 props는 React가 직렬화할 수 있어야 한다.
        
        문자열, 숫자, 배열, 일반 객체 등 필요한 데이터를 선택해 전달할 수 있다. DB 연결 객체나 일반적인 이벤트 콜백을 그대로 넘기는 방식은 이 경계에 맞지 않는다.
        
        서버에서 읽은 값도 props에 포함하면 브라우저로 전달된다. 따라서 비밀 API Key를 서버에서 읽더라도 Client Component의 props로 넘겨서는 안 된다.
        
        분리할 때는 영화 소개 전체를 Client Component로 옮기기보다, 입력창·버튼·모달처럼 실제로 클라이언트 기능이 필요한 범위를 살펴보면 된다.
        
    - `"use client";` 지시어를 `page.tsx` 최상단에 선언해도 될까요?
        
        > 선언할 수 있다. 이 경우 해당 페이지 모듈이 클라이언트 코드의 진입점이 된다.
        > 
        
        예를 들어 영화 필터 화면에서 페이지 자체가 `useState`와 이벤트를 사용한다면 다음과 같이 작성할 수 있다.
        
        ```tsx
        // app/movie-filter/page.tsx
        "use client";
        
        import { useState } from "react";
        
        export default function MovieFilterPage() {
          const [genre, setGenre] = useState("all");
        
          return (
            <main>
              <h1>영화 필터</h1>
        
              <select
                value={genre}
                onChange={(event) => {
                  setGenre(event.target.value);
                }}
              >
                <option value="all">전체</option>
                <option value="action">액션</option>
                <option value="drama">드라마</option>
              </select>
        
              <p>선택한 장르: {genre}</p>
            </main>
          );
        }
        ```
        
        지시어는 imports보다 앞에 작성한다. 컴포넌트 함수 내부가 아닌 파일의 최상단에 선언한다.
        
        ### 페이지에 선언하면 무엇이 달라질까?
        
        `"use client"`는 해당 모듈과 그 모듈이 가져오는 의존성에 클라이언트 경계를 만든다.
        
        ```
        page.tsx에 "use client"
                ↓
        page가 import하는 컴포넌트와 모듈도
        클라이언트 코드 그래프에 포함될 수 있음
        ```
        
        페이지에서 큰 UI 라이브러리나 여러 컴포넌트를 가져오면 브라우저에 전달하는 JavaScript 범위가 커질 수 있다. 또한 클라이언트 코드에서 사용할 수 없는 서버 전용 모듈을 가져오면 경계 문제가 발생한다.
        
        페이지를 Client Component로 만들면 다음 기능 배치도 고려해야 한다.
        
        - 일반적인 Client Component는 `async` 컴포넌트로 작성할 수 없다.
        - 서버 전용 DB 접근이나 비밀 키 처리는 서버 코드에 둔다.
        - `metadata`, `generateMetadata`는 Server Component에서 지원하므로 같은 Client 페이지 파일에서 내보낼 수 없다.
        
        영화 페이지의 주요 내용은 서버에서 구성하고 일부 버튼만 조작이 필요하다면 다음과 같이 배치할 수 있다.
        
        ```
        app/movies/[movieId]/page.tsx
        → Server Component
        → 영화 정보 조회와 제목·줄거리 표시
        
        components/BookmarkButton.tsx
        → Client Component
        → 클릭과 요청 상태 처리
        ```
        
        ### 자식 전체가 Client Component로 바뀔까?
        
        어떤 모듈이 어느 모듈을 import하는지에 따라 판단해야 한다.
        
        Server Component가 클라이언트 모달에 서버에서 구성한 내용을 `children`으로 전달하는 구조는 가능하다.
        
        ```tsx
        // Server Component
        export default function Page() {
          return (
            <ClientModal>
              <MovieInformation />
            </ClientModal>
          );
        }
        ```
        
        이 구조에서 `MovieInformation`은 서버 부모가 구성해 전달한다. 클라이언트 모달 안에 표시된다는 이유만으로 해당 서버 컴포넌트의 구현이 클라이언트 코드가 되지는 않는다.
        
        페이지 대부분이 상호작용 중심이라면 `page.tsx` 자체를 Client Component로 작성할 수 있다. 서버에서 처리할 부분이 많다면 페이지를 서버에 두고 상호작용 컴포넌트를 가져오는 방식이 적절하다.
        
- 렌더링 방식
    - `"use client";` 지시어가 붙은 Client Component는 브라우저에서만 렌더링될까요?
        
        > Next.js의 일반적인 최초 페이지 로드에서는 Client Component도 서버의 HTML 사전 렌더링에 참여할 수 있다.
        > 
        
        Client Component라는 이름은 브라우저에서 상태와 이벤트를 사용할 수 있는 컴포넌트라는 점과 관련이 있다. 최초 접속 때는 Next.js가 Client Component의 초기 화면도 HTML에 포함해 제공할 수 있다.
        
        ### 최초 접속의 흐름
        
        ```
        사용자가 영화 상세 주소로 접속
                      ↓
        Next.js가 초기 화면의 HTML 준비
                      ↓
        브라우저가 HTML을 표시
                      ↓
        Client Component의 JavaScript 로드
                      ↓
        Hydration
                      ↓
        클릭·입력 등의 상호작용 가능
        ```
        
        Hydration은 서버에서 받은 HTML에 React의 동작을 연결하는 과정이다.
        
        예를 들어 북마크 버튼의 초기 HTML이 먼저 표시되고, 필요한 JavaScript가 준비된 후 클릭 이벤트가 연결될 수 있다.
        
        HTML을 서버에서 준비하는 시점은 설정에 따라 빌드 시점 또는 요청 시점 등이 될 수 있다.
        
        ### 이후 내부 화면 이동
        
        최초 문서 로드 이후 Next.js의 클라이언트 내비게이션에서는 필요한 RSC Payload와 코드를 이용해 화면을 갱신한다. 이때 Client Component는 브라우저에서 렌더링된다.
        
        | 상황 | Client Component의 처리 |
        | --- | --- |
        | 주소 직접 입력·새로고침 | 초기 HTML 사전 렌더링에 참여하고 브라우저에서 hydration |
        | 앱 내부 클라이언트 내비게이션 | 브라우저에서 렌더링 |
        | `useEffect` | 브라우저에서 실행 |
        
        RSC Payload에는 서버 컴포넌트의 렌더링 결과와 클라이언트 컴포넌트 참조·props 등이 담긴다. 브라우저는 이를 이용해 서버와 클라이언트 부분을 결합한다.
        
        ### `localStorage`에 접근할 때 주의할 점
        
        다음 코드는 렌더링 중 브라우저 전용 저장소를 읽는다.
        
        ```tsx
        "use client";
        
        export default function MoviePage() {
          const layout = localStorage.getItem("movie-layout");
        
          return <p>{layout}</p>;
        }
        ```
        
        서버에서 초기 렌더링이 실행되면 `localStorage`를 사용할 수 없어 오류가 발생할 수 있다.
        
        브라우저 전용 값을 최초 렌더링 후 읽도록 작성할 수 있다.
        
        ```tsx
        "use client";
        
        import { useEffect, useState } from "react";
        
        type MovieLayout = "grid" | "list";
        
        export default function MovieLayoutSetting() {
          const [layout, setLayout] =
            useState<MovieLayout>("grid");
        
          useEffect(() => {
            try {
              const saved =
                localStorage.getItem("movie-layout");
        
              if (saved === "grid" || saved === "list") {
                setLayout(saved);
              }
            } catch {
              // 저장소에 접근할 수 없으면 기본값을 유지한다.
            }
          }, []);
        
          return <p>목록 표시 방식: {layout}</p>;
        }
        ```
        
        서버와 브라우저의 첫 렌더링은 `"grid"`를 사용한다. 이후 effect에서 저장값을 읽고 필요하면 화면을 갱신한다.
        
        영화 지도나 브라우저 전용 플레이어처럼 초기 서버 렌더링을 지원하지 않는 라이브러리는 별도의 클라이언트 전용 로딩 전략이 필요할 수 있다.
        
    - SSR과 SSG를 더 정리해 보고, ISR과 ISSG가 각각 어떤 의미로 쓰이는지 조사해 보세요. 페이지 생성 시점과 렌더링 방식을 기준으로 서로 어떤 관계가 있는지도 살펴보세요.
        
        > SSR과 SSG는 주로 HTML을 생성하는 시점을 구분하고, ISR은 정적으로 생성한 결과를 배포 이후 갱신하는 전략을 설명한다.
        > 
        
        영화 상세 페이지에 다음 내용이 있다고 하자.
        
        ```
        영화 제목
        줄거리
        포스터
        개봉일
        현재 평점
        북마크 버튼
        ```
        
        페이지를 구성하는 코드는 같아도, 언제 데이터를 읽고 HTML을 만드는지에 따라 제공 방식이 달라진다.
        
        ### SSR — Server-Side Rendering
        
        > 요청 시점에 서버에서 화면을 렌더링해 제공하는 방식
        > 
        
        ```
        사용자 요청
            ↓
        서버에서 필요한 데이터 조회
            ↓
        HTML 생성·전송
            ↓
        브라우저에서 화면 표시
        ```
        
        요청자의 로그인 정보나 요청 시점의 데이터에 맞춰 페이지를 구성할 때 활용할 수 있다.
        
        | 특성 | 영화 서비스 예시 |
        | --- | --- |
        | 요청 정보에 맞춘 화면 생성 | 로그인한 회원의 예매 내역 |
        | 요청 시점의 데이터 반영 | 현재 상영 일정이나 개인별 혜택 |
        | 서버의 처리 시간 발생 | API·DB 응답 시간이 화면 응답에 영향 |
        
        SSR에서도 데이터 캐시를 사용할 수 있다. 따라서 요청마다 HTML을 만든다는 사실만으로 모든 값이 항상 최신이라고 판단할 수는 없다. 최신성은 데이터 조회와 캐시 정책까지 함께 봐야 한다.
        
        ### SSG — Static Site Generation
        
        > 빌드 시점에 페이지를 미리 생성해 여러 요청에 재사용하는 방식
        > 
        
        ```
        빌드 실행
            ↓
        영화 데이터 조회
            ↓
        영화별 HTML 미리 생성
            ↓
        배포
            ↓
        사용자 요청에 생성된 결과 제공
        ```
        
        자주 바뀌지 않고 여러 사용자에게 같은 내용을 보여주는 페이지에 활용할 수 있다.
        
        ```
        영화제 소개
        서비스 이용 안내
        영화의 기본 제목·줄거리·개봉일
        ```
        
        요청마다 같은 내용을 다시 만들 필요가 줄어든다. 반면 미리 생성한 내용에 변경을 반영하려면 재빌드나 별도의 재생성 전략이 필요하다. 영화 수가 많아 모든 상세 페이지를 빌드한다면 빌드 시간도 고려해야 한다.
        
        ### ISR — Incremental Static Regeneration
        
        > 정적으로 생성한 페이지를 제공하면서, 배포 이후 필요한 페이지를 다시 생성해 갱신하는 방식
        > 
        
        영화 상세 페이지를 정적으로 제공하되, 평점이나 소개 변경을 일정한 주기로 반영하고 싶을 때 사용할 수 있다.
        
        시간 기반 재검증의 대표적인 흐름은 다음과 같다.
        
        ```
        영화 상세 페이지 생성·캐시
                    ↓
        재검증 시간이 지나기 전
        → 캐시된 결과 제공
                    ↓
        시간이 지난 뒤 요청 도착
        → 기존 결과를 제공하면서 재생성 시작
                    ↓
        재생성 성공
        → 새로운 결과를 캐시에 반영
                    ↓
        이후 요청에서 갱신된 페이지 제공
        ```
        
        예를 들어 재검증 기준을 60초로 설정해도 요청이 없는 동안 정확히 60초마다 모든 페이지를 만드는 타이머처럼 동작하지는 않는다. 시간 경과 뒤 들어오는 요청이 재생성 계기가 될 수 있다.
        
        관리자가 영화 정보를 수정한 뒤 관련 경로나 데이터 캐시를 무효화하는 이벤트 기반 재검증도 가능하다. 구체적으로 즉시 만료시키는지, 다음 요청에서 재검증하는지는 사용하는 API와 설정에 따라 달라진다.
        
        Next.js의 ISR 구현 방식은 App Router·Pages Router, Cache Components 사용 여부에 따라 달라진다. 코드에서는 프로젝트의 설정에 맞는 캐시·재검증 API를 선택해야 한다. Next.js ISR 설명
        
        ### ISSG — Incremental Static Site Generation
        
        > 정적 페이지를 한 번에 모두 생성하지 않고, 필요한 페이지를 점진적으로 생성한다는 의미로 사용되는 용어
        > 
        
        ISSG 또는 iSSG는 자료에 따라 `Incremental Static Site Generation`, `Incremental Static Generation`이라는 표현으로 등장한다.
        
        예를 들어 영화가 10만 편이면 모든 상세 페이지를 빌드하는 데 시간이 오래 걸릴 수 있다.
        
        ```
        빌드 시점
        → 많이 조회되는 영화 일부를 미리 생성
        
        배포 이후
        → 미리 만들지 않은 영화에 요청 도착
        → 해당 페이지 생성
        → 생성 결과를 이후 요청에 재사용
        ```
        
        일부 설명에서는 다음과 같이 구분한다.
        
        | 표현 | 강조하는 의미 |
        | --- | --- |
        | ISSG | 아직 없는 정적 페이지를 필요에 따라 생성 |
        | ISR | 기존 정적 페이지를 다시 생성해 갱신 |
        
        다만 이 구분은 모든 자료가 공유하는 공식 표준은 아니다. Next.js의 현재 ISR 설명은 배포 이후 페이지의 생성과 갱신을 폭넓게 다루며, 과거 문서와 논의에서도 점진적 정적 생성과 재생성이라는 표현이 함께 사용되었다.
        
        따라서 워크북에는 ISSG를 “필요한 정적 페이지를 점진적으로 생성하는 의미로 사용되는 표현”이라고 정리하고, ISR과 밀접하게 겹치는 용어라는 점을 함께 적는 것이 정확하다.
        
        ### 생성 시점과 재사용 방식 비교
        
        | 구분 | 주요 생성 시점 | 생성 결과 재사용 | 변경 반영 |
        | --- | --- | --- | --- |
        | SSR | 사용자 요청 시점 | 응답·데이터 캐시 정책에 따라 달라짐 | 다음 렌더링의 데이터 조회 정책에 따름 |
        | SSG | 빌드 시점 | 미리 생성한 결과 재사용 | 재빌드 등으로 새 결과 생성 |
        | ISR | 빌드 이후에도 생성·재생성 | 정적 결과를 재사용 | 시간·이벤트 기반 재검증 |
        | ISSG라는 표현 | 필요한 페이지를 배포 이후 점진적으로 생성하는 시점을 강조 | 생성 결과 재사용 | 문맥에 따라 ISR과 함께 설명 |
        
        ### Server·Client Component와의 관계
        
        컴포넌트 구분과 페이지 생성 시점은 서로 다른 판단 기준이다.
        
        | 질문 | 관련 개념 |
        | --- | --- |
        | 어떤 코드가 서버와 브라우저에서 실행되는가? | Server Component / Client Component |
        | 최초 HTML을 언제 만드는가? | SSR / SSG |
        | 만들어 둔 결과를 언제 갱신하는가? | ISR·재검증 |
        | 브라우저에서 이후 화면을 어떻게 바꾸는가? | 클라이언트 내비게이션·클라이언트 렌더링 |
        
        Server Component는 빌드 중 실행되어 정적 결과를 만들 수도 있고, 요청 시 실행되어 사용자별 결과를 만들 수도 있다.
        
        Client Component도 정적 생성된 페이지나 요청 시 렌더링되는 페이지에 포함될 수 있다. 이후 브라우저에서 hydration을 거쳐 입력과 클릭을 처리한다.
        
        영화 상세 화면이라면 제목과 줄거리는 재사용 가능한 결과로 제공하고, 북마크 버튼은 Client Component로 동작하게 하며, 남은 좌석은 더 자주 조회하도록 구성할 수 있다. App Router의 캐시와 스트리밍을 활용하면 한 페이지 안에서도 데이터와 영역의 성격에 맞는 전략을 적용할 수 있다.