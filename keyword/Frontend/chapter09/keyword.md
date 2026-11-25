- 프레임워크의 역할
    - Next.js는 TanStack Router에 더해 어떤 기능을 제공하나요?

      ### **1. 라이브러리와 프레임워크**

        - TanStack Router는 URL에 맞는 화면을 연결하고 페이지 이동을 관리하는 **라우팅 라이브러리**이다.
        - Next.js는 React 기반의 **풀스택 웹 프레임워크**로, 앱에 필요한 기능과 기본 구조, 개발 규칙을 함께 제공한다.
        - 라이브러리는 내가 필요한 부품을 골라 붙이는 방식이고, 프레임워크는 정해진 폴더 구조와 파일 규칙 위에 코드를 채우는 방식이다.
        - 그래서 지금까지 UMCine는 Vite(빌드) + TanStack Router(라우팅) + TanStack Query(서버 데이터)를 각각 붙여서 만들었고, Next.js는 이 중 빌드와 라우팅, 렌더링을 한 번에 맡는다.

      ### **2. 두 도구가 맡는 범위**

      | **기능** | **TanStack Router** | **Next.js** |
              | --- | --- | --- |
      | 파일 기반 라우팅 | O (`routes/` 폴더, `createFileRoute`) | O (`app/` 폴더, `page.tsx`) |
      | 공통 레이아웃 | O (`__root.tsx`의 `Outlet`) | O (`layout.tsx`의 `children`) |
      | 동적 경로 | O (`$movieId.tsx`) | O (`[id]/page.tsx`) |
      | 서버에서 HTML 미리 그리기 | X (브라우저에서 그림) | O (Server Component, SSR, SSG) |
      | 빌드 도구 | X (Vite가 따로 필요) | O (Next.js가 직접 빌드) |
      | 이미지 최적화 | X | O (`next/image`) |
      | 폰트 최적화 | X | O (`next/font`) |
      | 메타데이터(SEO, Open Graph) | X (`index.html`에 직접) | O (`export const metadata`) |
      | 서버 코드(요청 처리) | X | O (Route Handler, Server Function) |
        - TanStack Router 자체는 브라우저에서 동작하는 라우터이고, 서버 렌더링이 필요하면 같은 팀의 TanStack Start 같은 프레임워크를 따로 써야 한다.

      ### **3. Next.js가 더해 주는 기능**

      | **기능** | **하는 일** | **워크북에서 확인한 것** |
              | --- | --- | --- |
      | Server Component | 서버에서 데이터를 읽고 HTML을 만들어 보낸다. 컴포넌트 코드는 브라우저로 보내지 않는다. | `[id]/page.tsx`에서 `await fetch`로 할 일을 읽음 |
      | 정적 생성 / 요청 시 렌더링 | 빌드할 때 미리 만들거나, 요청이 오면 서버에서 만든다. | `pnpm build` 결과 `○ /new`, `◐ /[id]` |
      | 이미지 최적화 | 필요한 크기와 브라우저가 지원하는 형식으로 바꿔 보내고, 자리를 미리 잡고, 지연 로딩한다. | 원본 jpeg 약 1,101kB → webp 약 15.8kB |
      | 폰트 최적화 | 폰트를 앱에서 직접 불러오도록 구성한다. | `Geist({ subsets: ["latin"] })` |
      | 메타데이터 | 탭 제목, 검색 설명, 링크 공유 미리보기 태그를 만들어 준다. | `/new`의 브라우저 탭 제목이 바뀜 |

      ### **4. 코드 예시: 같은 일을 하는 두 방식**

        ```tsx
        // TanStack Router: 경로를 직접 선언하고 컴포넌트를 연결한다
        export const Route =createFileRoute("/new")({
          component: NewPage,
        });
        
        function NewPage() {
          return <div>This is New Page.</div>;
        }
        ```

        ```tsx
        // Next.js: app/new/page.tsx 위치가 곧 /new 경로이고, 메타데이터도 같은 파일에서 내보낸다
        import type { Metadata} from "next";
        
        export const metadata:Metadata ={
          title: "새 페이지 | Next.js",
          description: "테스트로 만들어 본 새 페이지예요.",
        };
        
        export default function NewPage() {
          return <div>This is New Page.</div>;
        }
        ```

        - TanStack Router는 `createFileRoute`로 이 파일이 어떤 경로인지 적어야 하고, 탭 제목은 따로 처리해야 한다.
        - Next.js는 폴더 위치가 경로를 정하고, 컴포넌트를 `export default` 하면 연결된다. 같은 파일에서 `metadata`까지 내보낼 수 있다.

      ### **5. 이번 미션과 연결**

        - UMCine 마이그레이션에서 `routes/` 폴더의 TanStack Router 파일은 `app/` 폴더의 `page.tsx`, `layout.tsx`로 바뀐다.
        - `__root.tsx`의 `Header`, `Outlet`, `Footer`는 `app/layout.tsx`의 `Header`, `children`, `Footer`가 된다.
        - `Link to`, `useNavigate` 같은 TanStack Router 전용 API는 `next/link`, `next/navigation`으로 바뀐다.
        - 영화 포스터는 `next/image`로 바꾸면 작은 카드에 맞는 크기로 받아 올 수 있다.

    - 고객 대상 서비스와 사내 서비스 등 상황이 달라져도 Next.js가 항상 가장 좋은 선택일까요?

      ### **1. 항상 최선은 아니다**

        - Next.js의 장점은 서버에서 HTML을 미리 만드는 데서 나온다. 첫 화면이 빨리 보이고, 검색 엔진과 링크 공유 미리보기가 페이지 내용을 읽을 수 있다.
        - 이 장점이 필요 없는 서비스라면, 서버를 운영하는 비용과 배워야 할 규칙만 늘어난다.
        - 그래서 서비스가 누구에게, 어떻게 보이는지에 따라 선택이 달라진다.

      ### **2. 렌더링 방식에 따른 차이**

      | **구분** | **Vite + React (SPA, CSR)** | **Next.js (SSR, SSG)** |
              | --- | --- | --- |
      | 처음 받는 HTML | 거의 비어 있고, JS가 받아진 뒤 화면을 그린다. | 내용이 들어 있는 HTML을 받는다. |
      | 검색 엔진 노출 | 불리하다. | 유리하다. |
      | 링크 공유 미리보기 | 페이지마다 다르게 만들기 어렵다. | 페이지마다 `metadata`로 설정한다. |
      | 배포 | 빌드된 정적 파일만 올리면 된다. | 서버 기능을 쓰면 Node.js 서버나 지원하는 호스팅이 필요하다. |
      | 신경 쓸 규칙 | 브라우저 코드만 생각하면 된다. | Server/Client 경계, 하이드레이션, 캐시 설정을 알아야 한다. |

      ### **3. 상황별로 보면**

      | **상황** | **더 맞는 선택** | **이유** |
              | --- | --- | --- |
      | 쇼핑몰, 블로그, 영화 정보처럼 고객이 검색해서 들어오는 서비스 | Next.js | 검색 노출, 첫 화면 속도, 공유 미리보기가 중요하다. |
      | 로그인한 직원만 쓰는 관리자 화면, 사내 대시보드 | Vite SPA로도 충분 | 검색에 노출될 필요가 없고, 대부분 로그인 뒤 데이터라 서버에서 미리 그릴 내용이 적다. |
      | 정적 파일만 올릴 수 있는 환경 | Vite SPA 또는 Next.js 정적 내보내기 | 서버를 띄울 수 없으면 서버 렌더링 기능을 쓸 수 없다. |
        - Next.js도 `output: "export"` 설정으로 정적 파일만 만들 수 있지만, 이때는 요청 시 서버 렌더링 같은 서버 기능을 쓸 수 없다.

      ### **4. 이번 미션과 연결**

        - UMCine는 누구나 영화 목록과 상세를 볼 수 있는 고객 대상 서비스라 검색 노출과 공유 미리보기가 의미 있다. 영화 상세마다 제목을 `metadata`로 다르게 줄 수 있다.
        - 반면 마이페이지, 내 정보 수정은 로그인한 사람만 보는 화면이고 토큰이 브라우저 localStorage에 있어서, 서버에서 미리 그릴 수 있는 내용이 거의 없다.
        - 한 서비스 안에서도 화면마다 Next.js의 장점이 크게 나는 곳과 아닌 곳이 나뉜다.

- Server Component와 Client Component
    - 어떤 기준으로 Server Component와 Client Component를 나누면 좋을까요?

      ### **1. 두 컴포넌트란**

        - App Router의 `page.tsx`, `layout.tsx`와 그 안의 컴포넌트는 **기본이 Server Component**이다.
        - Server Component는 서버에서 렌더링되고, 컴포넌트 코드는 브라우저로 보내지 않는다.
        - Client Component는 파일 맨 위에 `"use client";`를 적어 만들며, 브라우저에서 상태와 이벤트를 처리한다.

      ### **2. 공식 문서의 기준**

      | **이럴 때** | **사용할 컴포넌트** |
              | --- | --- |
      | `useState`, 이벤트 핸들러(`onClick`, `onChange`)가 필요하다 | Client Component |
      | `useEffect` 같은 생명주기 로직이 필요하다 | Client Component |
      | `localStorage`, `window`, `alert` 같은 브라우저 전용 API를 쓴다 | Client Component |
      | 위의 기능을 쓰는 커스텀 훅을 쓴다 | Client Component |
      | 서버의 DB나 API에서 데이터를 가져온다 | Server Component |
      | API 키나 토큰처럼 브라우저에 노출하면 안 되는 값을 쓴다 | Server Component |
      | 브라우저로 보내는 JavaScript 양을 줄이고 싶다 | Server Component |
      | 첫 화면 내용을 빨리 보여 주고 싶다 | Server Component |
        - 한 줄로 줄이면, **상호작용이나 브라우저 API가 필요하면 Client, 그 외에는 Server**이다.

      ### **3. 경계는 작게 나눈다**

        - `"use client"`는 서버 코드와 클라이언트 코드의 경계를 표시한다.
        - 이 지시어가 붙은 파일이 import하는 모듈과 그 안의 자식 컴포넌트는 모두 클라이언트 번들에 포함된다.
        - 그래서 페이지 전체가 아니라 **상호작용이 필요한 부분만** Client Component로 떼어 내는 것이 좋다.
        - Server Component에서 Client Component로 넘기는 props는 직렬화할 수 있는 값(문자열, 숫자, 일반 객체 등)이어야 한다.

      ### **4. 워크북 코드 예시**

        ```tsx
        // app/components/alert-button.tsx
        "use client";
        
        export default function AlertButton() {
          return <button onClick={() => alert("Hello, Next.js!")}>Click Me</button>;
        }
        ```

        ```tsx
        // app/page.tsx (Server Component 그대로)
        import AlertButtonfrom "./components/alert-button";
        
        export default function HomePage() {
          return (
            <div>
              <h1>This is Home Page.</h1>
              <AlertButton />
            </div>
          );
        }
        ```

        - 처음에 `page.tsx`의 버튼에 바로 `onClick`을 달았을 때 `Event handlers cannot be passed to Client Component props.` 오류가 났다.
        - 클릭이 필요한 버튼만 `alert-button.tsx`로 떼어 `"use client"`를 붙이자, 페이지는 Server Component로 남고 버튼만 브라우저에서 동작했다.

      ### **5. 나누는 방식 비교**

      | **구분** | **페이지 전체를 Client로** | **필요한 부분만 Client로** |
              | --- | --- | --- |
      | 브라우저로 보내는 JS | 페이지와 import한 모든 컴포넌트 | 버튼 같은 작은 컴포넌트만 |
      | 서버에서 데이터 읽기 | 컴포넌트 안에서 `await` 불가, 브라우저에서 다시 요청 | 페이지에서 `await fetch` 가능 |
      | `metadata` export | 같은 파일에서 불가 | 가능 |

      ### **6. 이번 미션과 연결**

        - UMCine에서 `useAuthStore`(Zustand persist, localStorage), `useQuery`·`useMutation`, `alert`, `onClick`을 쓰는 화면은 Client Component가 된다. 예: `Header`, `BookmarkButton`, `MyRatingPanel`, 로그인·회원가입 폼.
        - `QueryClientProvider`도 브라우저 상태를 다루므로 `"use client"`를 붙인 `providers.tsx`로 만들어 `layout.tsx`에서 감싼다.
        - `page.tsx`는 Server Component로 두고 `metadata`를 내보내며, 안쪽에서 Client Component인 화면 컴포넌트를 렌더링하는 구조로 나눌 수 있다.

    - `"use client";` 지시어를 `page.tsx` 최상단에 선언해도 될까요?

      ### **1. 선언할 수는 있다**

        - `page.tsx` 맨 위에 `"use client";`를 적으면 그 페이지는 Client Component가 되고, `onClick` 같은 이벤트 오류는 사라진다.
        - 하지만 공식 문서는 `"use client"`를 **필요한 컴포넌트에만** 붙여 클라이언트 번들을 작게 유지하라고 권한다.

      ### **2. 선언하면 생기는 일**

      | **항목** | **결과** |
              | --- | --- |
      | 클라이언트 번들 | `page.tsx`가 import하는 모든 컴포넌트가 클라이언트 코드에 포함된다. |
      | 데이터 읽기 | 컴포넌트를 `async`로 만들어 서버에서 `await` 할 수 없다. 데이터는 브라우저에서 다시 요청해야 한다. |
      | 메타데이터 | `metadata`, `generateMetadata`는 Server Component에서만 export할 수 있어서, 같은 파일에서 쓸 수 없다. |
      | 비밀 값 | 서버에서만 써야 할 API 키를 이 파일에서 쓰면 브라우저로 노출될 위험이 있다. |

      ### **3. 코드로 비교**

        ```tsx
        // 권장하지 않는 방식: 페이지 전체가 Client Component
        "use client";
        
        export default function HomePage() {
          return (
            <div>
              <h1>This is Home Page.</h1>
              <button onClick={() =>alert("Hello, Next.js!")}>Click Me</button>
            </div>
          );
        }
        ```

        - 버튼 하나 때문에 제목까지 포함한 페이지 전체가 브라우저 코드가 된다.
        - 이 파일에 `export const metadata = { ... }`를 추가하면 Next.js가 오류를 낸다.
        - 워크북처럼 버튼만 `AlertButton`으로 떼어 내면 같은 동작을 하면서 페이지는 Server Component로 남는다.

      ### **4. 그래도 page.tsx에 붙이게 되는 경우**

        - 화면 대부분이 상태와 브라우저 API로 움직이는 페이지라면, 화면 컴포넌트 전체가 Client Component가 되는 것은 자연스럽다.
        - 이때도 `page.tsx` 자체에 붙이기보다, 화면 컴포넌트 파일에 `"use client"`를 붙이고 `page.tsx`는 Server Component로 두는 편이 낫다. 그래야 `page.tsx`에서 `metadata`를 내보낼 수 있다.

      ### **5. 이번 미션과 연결**

        - UMCine 로그인 페이지는 폼 입력(`useState`), `useMutation`, 이동(`router.push`)을 모두 쓰므로 화면 전체가 Client Component다.
        - 그래서 기존 `pages/auth/login-page.tsx`에 `"use client"`를 붙이고, `app/login/page.tsx`는 이 컴포넌트를 렌더링하면서 `metadata`(예: 탭 제목 `로그인 | UMCine`)만 내보내는 구조로 옮길 수 있다.

- 렌더링 방식
    - `"use client";` 지시어가 붙은 Client Component는 브라우저에서만 렌더링될까요?

      ### **1. 아니다, 처음 HTML은 서버에서도 만든다**

        - Client Component도 **첫 페이지 로드 때 서버에서 미리 렌더링**되어 HTML로 보내진다.
        - 그래서 브라우저는 JavaScript가 다 받아지기 전에도 Client Component의 처음 모습을 볼 수 있다.
        - 이후 브라우저에서 JavaScript가 실행되며 이 HTML에 이벤트 핸들러와 상태를 연결한다. 이 과정을 **하이드레이션(hydration)** 이라고 한다.
        - 첫 로드가 아니라 페이지 안에서 이동할 때는 Client Component가 브라우저에서 렌더링된다.

      ### **2. 단계별 흐름**

      | **단계** | **어디서** | **하는 일** |
              | --- | --- | --- |
      | 1 | 서버 | Server Component를 렌더링한다. |
      | 2 | 서버 | Client Component도 처음 모습을 HTML로 미리 렌더링한다. |
      | 3 | 브라우저 | HTML을 받아 바로 화면에 보여 준다(아직 클릭은 안 됨). |
      | 4 | 브라우저 | JavaScript를 받아 하이드레이션하면, 버튼 클릭과 상태 변경이 동작한다. |

      ### **3. 그래서 생기는 주의점**

        ```tsx
        "use client";
        
        export default function TokenText() {
          const token = localStorage.getItem("token");
          return <p>{token}</p>;
        }
        ```

        - 이 컴포넌트는 서버에서 미리 렌더링될 때도 실행된다. 서버에는 `localStorage`가 없어서 `localStorage is not defined` 오류가 난다.
        - 브라우저 전용 API는 이벤트 핸들러나 `useEffect` 안처럼 **브라우저에서 실행되는 시점**에 써야 한다.
        - 서버에서 만든 HTML과 브라우저에서 처음 렌더링한 결과가 다르면 하이드레이션 불일치 경고가 난다. 예를 들어 서버는 로그아웃 상태로, 브라우저는 로그인 상태로 그리면 둘이 달라진다.

      ### **4. Server Component와 비교**

      | **구분** | **Server Component** | **Client Component** |
              | --- | --- | --- |
      | 첫 로드 때 서버에서 HTML로 렌더링 | O | O |
      | 브라우저로 컴포넌트 JS를 보냄 | X | O |
      | 하이드레이션 | X | O |
      | 페이지 이동 뒤 브라우저에서 다시 렌더링 | X | O |
    - SSR과 SSG를 더 정리해 보고, ISR과 ISSG가 각각 어떤 의미로 쓰이는지 조사해 보세요. 페이지 생성 시점과 렌더링 방식을 기준으로 서로 어떤 관계가 있는지도 살펴보세요.

      ### **1. 렌더링 방식이란**

        - 렌더링 방식은 **HTML을 언제, 어디서 만드느냐**로 나뉜다.
        - 언제는 빌드할 때인지, 요청이 올 때인지이다. 어디서는 서버인지, 브라우저인지이다.

      ### **2. 네 가지 방식**

      | **방식** | **이름** | **HTML을 만드는 시점** | **만드는 곳** |
              | --- | --- | --- | --- |
      | CSR | Client-Side Rendering | 페이지를 연 뒤, JavaScript가 실행될 때 | 브라우저 |
      | SSR | Server-Side Rendering | 요청이 올 때마다 | 서버 |
      | SSG | Static Site Generation | 빌드할 때 한 번 | 서버(빌드 과정) |
      | ISR | Incremental Static Regeneration | 빌드할 때 만들고, 정해진 시간이 지나면 다시 만든다 | 서버 |
        - Vite로 만든 지금의 UMCine는 CSR이다. 브라우저가 빈 HTML을 받고 JavaScript로 화면을 그린다.

      ### **3. ISR과 ISSG**

        - ISR은 정적 페이지를 **사이트 전체를 다시 빌드하지 않고** 페이지 단위로 갱신하는 방식이다.
        - 정한 시간(revalidate)이 지난 뒤 요청이 오면, 그 요청에는 기존 페이지를 먼저 보내고 백그라운드에서 페이지를 새로 만든다. 다음 요청부터 새 페이지를 보낸다.
        - ISSG(Incremental Static Site Generation)는 Next.js 공식 문서에 나오는 용어가 아니다. ISR을 "SSG를 점진적으로 갱신한다"는 관점에서 부르는 말로 쓰이며, 가리키는 동작은 ISR과 같다.

        ```tsx
        // ISR 예시: 60초마다 페이지를 다시 만들 수 있게 한다
        export const revalidate =60;
        
        export default async function MoviesPage() {
          const response =await fetch("https://api.example.com/movies");
          const movies:{ id:number; title:string }[] =await response.json();
          return (
            <ul>
              {movies.map((movie) =>(
                <li key={movie.id}>{movie.title}</li>
              ))}
            </ul>
          );
        }
        ```

        - 첫 빌드 때 페이지를 만들어 두고, 60초가 지난 뒤 들어온 요청을 계기로 서버가 페이지를 다시 만든다.
        - 워크북 프로젝트처럼 Cache Components를 켠 경우에는 `"use cache"` 지시어와 `cacheLife`로 캐시 유지 시간을 정하는 방식을 쓴다.

      ### **4. 서로의 관계**

      | **비교** | **SSG** | **ISR (ISSG)** | **SSR** |
              | --- | --- | --- | --- |
      | 처음 만드는 시점 | 빌드 | 빌드 | 요청 |
      | 내용이 바뀌는 시점 | 다시 빌드할 때만 | 정한 시간이 지난 뒤 요청이 올 때 | 요청마다 |
      | 응답 속도 | 가장 빠름 | 빠름 | 요청마다 만드는 시간만큼 느림 |
      | 데이터 신선도 | 빌드 때 값 그대로 | 정한 시간만큼 늦을 수 있음 | 항상 최신 |
      | 어울리는 페이지 | 소개, 약관 | 영화 목록, 블로그 글 | 로그인 사용자별 화면, 검색 결과 |
        - ISR은 SSG에 갱신 기능을 더한 것이다. SSG의 빠른 응답과 SSR의 최신 데이터 사이에서 균형을 맞춘다.
        - Next.js는 한 페이지 안에서도 섞어 쓸 수 있다. 정적인 껍데기는 미리 만들고 바뀌는 부분만 요청 때 채우는 것이 부분 사전 렌더링(Partial Prerendering)이다.

      ### **5. 워크북 빌드 결과와 연결**

      | **빌드 기호** | **경로** | **방식** |
              | --- | --- | --- |
      | `○` | `/new` | SSG. 항상 같은 글자라 빌드할 때 페이지 전체를 만든다. |
      | `◐` | `/[id]` | 부분 사전 렌더링. 헤더, 푸터, 로딩 화면은 미리 만들고, 할 일 내용은 요청을 받은 뒤 서버에서 만든다(이 부분이 SSR). |
        - 두 페이지 모두 Server Component지만, 요청이 와야 알 수 있는 값(주소의 id)을 읽는지에 따라 만드는 시점이 달라졌다.
        - UMCine로 옮기면 인기 영화 목록은 ISR이 어울리고, 로그인한 사람마다 다른 마이페이지는 브라우저에서 그리는 CSR에 가깝게 남는다.