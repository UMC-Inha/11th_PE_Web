# 워크북 프론트엔드 키워드 정리 — Next.js

## 목차

- [프레임워크의 역할](#프레임워크의-역할)
  - Next.js는 TanStack Router에 더해 어떤 기능을 제공하나요?
  - 고객 대상 서비스와 사내 서비스 등 상황이 달라져도 Next.js가 항상 가장 좋은 선택일까요?
- [Server Component와 Client Component](#server-component와-client-component)
  - 어떤 기준으로 Server Component와 Client Component를 나누면 좋을까요?
  - `"use client";` 지시어를 `page.tsx` 최상단에 선언해도 될까요?
- [렌더링 방식](#렌더링-방식)
  - `"use client";` 지시어가 붙은 Client Component는 브라우저에서만 렌더링될까요?
  - SSR과 SSG를 더 정리해 보고, ISR과 ISSG가 각각 어떤 의미로 쓰이는지 조사해 보세요.

---

## 프레임워크의 역할

### Q. Next.js는 TanStack Router에 더해 어떤 기능을 제공하나요?

#### 프레임워크 (Framework)

- 애플리케이션의 **구조와 실행 흐름을 정해두고**, 개발자는 그 규칙 안에서 코드를 채우는 도구
- 라우팅, 렌더링, 빌드, 서버 실행 등을 **프레임워크가 대신 관리**
- 예: Next.js, TanStack Start, React Router Framework Mode

#### 제어의 역전 (Inversion of Control)

- 라이브러리는 내 코드가 라이브러리를 호출, 프레임워크는 프레임워크가 내 코드를 호출함
- 예: Next.js는 `app/posts/page.tsx` 파일을 만들면 `/posts` 요청이 왔을 때 프레임워크가 그 컴포넌트를 찾아 실행함

#### TanStack Router

- React 애플리케이션의 클라이언트 라우팅 라이브러리
- URL에 따라 어떤 컴포넌트를 보여줄지 결정하고, 타입 안전한 경로·쿼리 파라미터, 데이터 로더(loader), 코드 분할을 제공
- 기본적으로 브라우저에서 동작하는 SPA(Single Page Application)를 만드는 데 사용
- 서버 렌더링이나 서버 기능이 필요하면 TanStack Router 위에 서버 기능을 더한 TanStack Start를 사용

#### Next.js

- React 기반 풀스택 웹 프레임워크
- 라우팅뿐 아니라 서버 렌더링, 서버 코드 실행, 빌드·최적화, 배포 구성까지 제공

### Next.js가 추가로 제공하는 기능

#### 1) 다양한 렌더링 방식

- SSR(요청마다 서버에서 HTML 생성), SSG(빌드 시 HTML 미리 생성), ISR(정적 페이지를 주기적으로 재생성), PPR(정적 부분과 동적 부분을 한 페이지에 섞기)
- 페이지마다 다른 렌더링 방식을 선택할 수 있음
- SPA는 처음에 빈 HTML을 받고 JS가 실행된 뒤 화면이 그려지지만, Next.js는 처음부터 내용이 채워진 HTML을 보낼 수 있음 → 첫 화면 표시가 빠르고 검색 엔진 최적화(SEO)에 유리

#### 2) React Server Components (RSC)

- 컴포넌트를 서버에서만 실행할 수 있음
- 컴포넌트 안에서 바로 DB 조회, 비밀 키를 사용한 API 호출 가능
- 서버 컴포넌트의 코드는 브라우저로 전송되지 않아 JS 번들 크기가 줄어듦

#### 3) 서버 기능 (백엔드 역할)

| 기능 | 설명 |
| --- | --- |
| **Route Handler** | `app/api/.../route.ts`로 API 엔드포인트 작성 |
| **Server Action** | `"use server"` 함수로 폼 제출·데이터 변경을 별도 API 없이 서버에서 처리 |
| **Proxy (구 Middleware)** | 요청이 페이지에 도달하기 전에 인증 확인, 리다이렉트, 헤더 설정 처리 |

#### 4) 서버 측 데이터 캐싱과 재검증

- 서버에서 가져온 데이터와 렌더링 결과를 서버 측에 캐싱 (TanStack Router의 loader 캐시는 브라우저 메모리에만 저장됨)
- 시간 기반 재검증, `revalidatePath`·`revalidateTag`로 필요할 때 캐시 갱신
- Next.js 16에서는 `cacheComponents` 설정과 `"use cache"` 지시어로 컴포넌트·함수 단위 캐싱 가능

#### 5) 이미지·폰트 최적화

| 기능 | 설명 |
| --- | --- |
| `next/image` | 이미지 크기 조정, WebP 등 최신 포맷 변환, 지연 로딩 |
| `next/font` | 폰트를 빌드 시 다운로드해 자체 호스팅, 레이아웃 흔들림 방지 |

#### 6) 빌드·개발 도구와 배포

- Turbopack 기반 빌드·개발 서버가 내장되어 별도 설정이 거의 필요 없음 (TanStack Router는 Vite 같은 빌드 도구를 따로 사용)
- `next build`, `next start`로 Node.js 서버 실행, Vercel 등 배포 플랫폼과의 통합

---

### Q. 고객 대상 서비스와 사내 서비스 등 상황이 달라져도 Next.js가 항상 가장 좋은 선택일까요?

#### 고객 대상 서비스 (B2C, 외부 서비스)

- 불특정 다수의 사용자가 접근하는 서비스
- 예: 쇼핑몰, 블로그, 랜딩 페이지, 커뮤니티
- 검색 노출(SEO), 첫 화면 속도, 공유 미리보기(Open Graph)가 중요

#### 사내 서비스 (내부 도구, 백오피스)

- 회사 직원만 로그인해서 사용하는 서비스
- 예: 관리자 페이지, 주문·재고 관리, 사내 대시보드
- 검색 노출이 필요 없고, 복잡한 화면 상호작용과 빠른 개발이 중요

#### 기술 선택의 기준

- 어떤 프레임워크가 "가장 좋은지"는 서비스의 요구사항, 팀의 경험, 운영 환경에 따라 달라짐
- 기능이 많은 도구는 그만큼 학습 비용, 서버 운영 비용, 복잡도도 함께 가져옴

### 결론: 항상 최선은 아니다

- Next.js의 강점(SSR, SEO, 서버 기능)은 그 기능이 필요한 서비스에서만 의미가 있음
- 필요 없는 기능을 위해 서버를 운영하고 Server/Client Component 경계를 신경 쓰는 것은 비용만 늘리는 선택이 될 수 있음

### 상황별 비교

| 상황 | Next.js가 적합 | SPA(Vite + TanStack Router 등)가 적합 |
| --- | --- | --- |
| 검색 노출이 중요한가 | ⭕ 서버 렌더링으로 SEO 유리 | 로그인 뒤에 있어 SEO가 필요 없음 |
| 첫 화면 속도가 매출·이탈에 영향을 주는가 | ⭕ 내용이 채워진 HTML을 바로 전송 | 사내 사용자는 매일 쓰므로 초기 로딩 영향이 적음 |
| 화면 상호작용이 매우 많은가 | 대부분 Client Component가 되어 이점이 줄어듦 | ⭕ 편집기, 대시보드, 복잡한 폼 |
| 별도 백엔드가 있는가 | 없다면 Route Handler·Server Action으로 간단한 서버 역할 가능 | ⭕ 이미 API 서버(NestJS 등)가 있음 |
| 배포 환경 | Node.js 서버나 지원 플랫폼 필요 | ⭕ 정적 파일만 올리면 됨 (사내망, S3, CDN) |
| 팀 경험 | Next.js·RSC 경험이 있음 | React SPA 경험이 많음 |
| 타입 안전한 URL 상태가 중요한가 | 파일 기반 라우팅 | ⭕ TanStack Router의 강점 |

### 상황별 예시

| 서비스 | 추천 방향 | 이유 |
| --- | --- | --- |
| 쇼핑몰 상품 페이지 | Next.js | SEO, 공유 미리보기, 첫 화면 속도 |
| 블로그·문서 사이트 | Next.js (SSG/ISR) 또는 정적 사이트 생성기 | 내용이 자주 바뀌지 않아 미리 생성하기 좋음 |
| 사내 관리자 페이지 | SPA | SEO 불필요, 별도 백엔드 존재, 정적 배포로 운영 단순 |
| 실시간 협업 편집기 | SPA 또는 Next.js + 대부분 Client Component | 상호작용 중심이라 서버 렌더링 이점이 적음 |
| 마케팅 페이지 + 로그인 후 대시보드 | Next.js | 공개 페이지는 서버 렌더링, 대시보드는 Client Component로 혼합 가능 |

---

## Server Component와 Client Component

### Q. 어떤 기준으로 Server Component와 Client Component를 나누면 좋을까요?

#### Server Component

- 서버에서만 실행되는 컴포넌트
- Next.js App Router에서는 아무 지시어도 없으면 기본적으로 Server Component
- 컴포넌트를 `async`로 만들어 바로 데이터를 조회할 수 있음
- 컴포넌트 코드가 브라우저로 전송되지 않음 → JS 번들에 포함되지 않음
- `useState`, `useEffect`, 이벤트 핸들러(`onClick`) 같은 브라우저 상호작용 기능은 사용할 수 없음

#### Client Component

- 파일 최상단에 `"use client";`를 선언한 컴포넌트
- 서버에서 초기 HTML을 만든 뒤, 브라우저에서 다시 실행(hydration)되어 상호작용이 가능해짐
- 상태, 이펙트, 이벤트 핸들러, 브라우저 API를 사용할 수 있음
- 컴포넌트 코드가 JS 번들에 포함되어 브라우저로 전송됨

#### 클라이언트 경계 (Client Boundary)

- `"use client";`가 선언된 파일은 Server와 Client의 경계가 됨
- 그 파일에서 import한 컴포넌트들도 모두 Client Component로 취급됨

#### 직렬화 (Serialization)

- 데이터를 네트워크로 보낼 수 있는 형태(문자열 등)로 바꾸는 것
- Server Component가 Client Component에 넘기는 props는 직렬화 가능한 값이어야 함 (문자열, 숫자, 배열, 일반 객체, Date 등)
- 일반 함수, 클래스 인스턴스는 props로 넘길 수 없음 (Server Action은 예외)

### 나누는 기준

| 필요한 것 | Server Component | Client Component |
| --- | --- | --- |
| DB·내부 API에서 데이터 조회 | ⭕ |  |
| API 키, 토큰 같은 비밀 값 사용 | ⭕ |  |
| 큰 라이브러리 사용 (마크다운 변환, 날짜 포맷 등) 후 결과만 표시 | ⭕ (번들에 포함 안 됨) |  |
| 정적인 내용 (제목, 본문, 목록) | ⭕ |  |
| SEO에 필요한 내용 | ⭕ |  |
| `useState`, `useReducer` (상태) |  | ⭕ |
| `useEffect` (마운트 후 동작) |  | ⭕ |
| `onClick`, `onChange` (이벤트) |  | ⭕ |
| `window`, `localStorage`, `IntersectionObserver` 등 브라우저 API |  | ⭕ |
| Context Provider, TanStack Query 같은 클라이언트 라이브러리 |  | ⭕ |

- 기본은 Server Component로 두고, 상호작용이 필요한 부분만 Client Component로 분리

---

### Q. `"use client";` 지시어를 `page.tsx` 최상단에 선언해도 될까요?

#### 결론

- 문법적으로는 가능하고 동작도 함
- 하지만 페이지 전체가 Client Component가 되므로 Server Component의 장점을 대부분 잃게 되어 권장되지 않음
- 상호작용이 필요한 부분만 별도의 Client Component로 분리하는 것이 좋음

#### page.tsx에 선언해도 괜찮은 경우

- 페이지 대부분이 **상호작용 중심**이고 서버에서 미리 가져올 데이터가 거의 없을 때 (예: 그림판, 실시간 편집기)
- 로그인 뒤에 있어 **SEO가 필요 없고**, 데이터를 브라우저에서 TanStack Query로 관리하는 구조일 때

---

## 렌더링 방식

### Q. `"use client";` 지시어가 붙은 Client Component는 브라우저에서만 렌더링될까요?

#### 렌더링 (Rendering)

- 컴포넌트 코드를 실행해서 화면에 표시할 결과(HTML, UI)를 만드는 과정

#### 프리렌더링 (Pre-rendering)

- 브라우저가 JS를 실행하기 전에, 서버(또는 빌드 시점)에서 미리 HTML을 만들어 두는 것

#### 하이드레이션 (Hydration)

- 서버에서 만든 정적인 HTML에 브라우저가 JS를 연결해서 상태·이벤트가 동작하는 화면으로 만드는 과정
- HTML은 이미 보이지만, 하이드레이션이 끝나야 버튼 클릭 등이 동작함

#### 결론: 브라우저에서만 렌더링되지 않는다

- Client Component도 처음 요청 시 서버에서 한 번 렌더링(프리렌더링)되어 HTML로 전달됨
- 그 후 브라우저에서 다시 실행되어 하이드레이션되고, 이후 상태 변경에 따른 리렌더링은 브라우저에서 일어남
- `"use client"`는 "브라우저에서만 실행"이 아니라 "브라우저에서도 실행되어 상호작용할 수 있는 컴포넌트"라는 의미

#### CSR (Client-Side Rendering)

- 일반적인 Next.js 렌더링은 서버(또는 빌드 시점)에서 프리렌더링됨
- 반면 CSR(Client-Side Rendering)은 서버가 거의 빈 HTML만 보내고, 브라우저가 JS를 실행해서 화면을 처음부터 그리는 방식
- Next.js에서도 CSR이 쓰일 수 있지만, 보통 페이지 전체가 아니라 일부 컴포넌트나 데이터에만 적용됨

### 렌더링 흐름

```
[서버]
 Server Component 실행 → 결과(RSC Payload) 생성
 Client Component도 서버에서 실행 → 초기 HTML 생성
        │
        ▼ HTML + RSC Payload + Client Component JS 전송
[브라우저]
 ① HTML을 바로 표시 (아직 클릭 등은 동작 X)
 ② Client Component JS 다운로드·실행
 ③ 하이드레이션 → 이벤트 연결, 상태 동작
 ④ 이후 상태가 바뀌면 브라우저에서 리렌더링
```

---

### Q. SSR과 SSG를 더 정리해 보고, ISR과 ISSG가 각각 어떤 의미로 쓰이는지 조사해 보세요. 페이지 생성 시점과 렌더링 방식을 기준으로 서로 어떤 관계가 있는지도 살펴보세요.

#### SSR (Server-Side Rendering, 서버 사이드 렌더링)

- 요청이 올 때마다 서버에서 HTML을 새로 만들어 응답하는 방식
- 항상 최신 데이터, 사용자별로 다른 내용(로그인 정보, 쿠키 기반 화면)을 보여줄 수 있음
- 요청마다 서버 작업이 필요해서 응답이 상대적으로 느리고 서버 부하가 큼

#### SSG (Static Site Generation, 정적 사이트 생성)

- 빌드할 때 HTML을 미리 만들어 두고, 요청이 오면 만들어둔 파일을 그대로 응답하는 방식
- CDN에 올려두고 바로 전달할 수 있어 가장 빠르고 서버 부하가 거의 없음
- 데이터가 바뀌면 다시 빌드·배포해야 반영됨

#### ISR (Incremental Static Regeneration, 증분 정적 재생성)

- SSG로 만든 정적 페이지를 배포 이후에도 일정 시간마다 또는 필요할 때 다시 생성하는 방식
- "Incremental"은 사이트 전체를 다시 빌드하지 않고 페이지 단위로 하나씩 갱신한다는 의미
- Stale-While-Revalidate 방식으로 동작
  1. 재검증 시간이 지난 뒤 첫 요청이 오면, 일단 기존(오래된) 페이지를 응답
  2. 동시에 백그라운드에서 새 페이지를 생성
  3. 생성이 끝나면 캐시를 교체하고, 다음 요청부터 새 페이지를 응답
- SSG의 속도를 유지하면서 다시 빌드하지 않고도 데이터를 갱신할 수 있음
- Next.js가 처음 만든 용어

#### ISSG (Incremental Static Site Generation)

- Next.js 공식 문서에서 쓰는 용어는 아니고, 블로그·강의 등에서 쓰이는 비공식 용어
- 크게 두 가지 의미로 쓰임

| 쓰임 | 의미 |
| --- | --- |
| ISR과 같은 의미 | "정적 사이트를 점진적으로 생성·갱신한다"는 뜻으로 ISR을 풀어 부르는 이름 |
| 빌드 이후 새 경로의 점진적 생성 | 빌드할 때 일부 페이지만 미리 만들고, 나머지 경로는 처음 요청이 왔을 때 생성해서 저장한 뒤 이후에는 정적 페이지처럼 제공하는 것 |

- 두 번째 의미를 기준으로 보면, ISR은 "이미 있는 페이지를 다시 생성(Regeneration)", ISSG는 "없던 페이지를 새로 생성(Generation)"에 초점이 있음
- Next.js에서는 두 동작 모두 ISR 기능 안에 포함되어 있음

#### 서로의 관계

- **SSG가 출발점**: 빌드 시 미리 만든 정적 페이지
- **ISR = SSG + 재생성**: 정적 페이지를 유지하되, 시간이 지나거나 데이터가 바뀌면 페이지 단위로 다시 생성
- **ISSG = SSG + 점진적 생성**: 빌드 시 모든 페이지를 만들지 않고, 요청이 온 경로부터 하나씩 생성
- **SSR은 반대편**: 저장해두지 않고 매 요청마다 생성
- ISR·ISSG는 SSG의 빠른 속도와 SSR의 최신성 사이에서 균형을 잡는 방식