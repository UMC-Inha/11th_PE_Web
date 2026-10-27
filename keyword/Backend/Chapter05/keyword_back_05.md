# 워크북 백엔드 키워드 정리

## 목차

- [SOP와 CORS](#sop와-cors)
- [Same-Origin과 Same-Site의 차이](#same-origin과-same-site의-차이)
- [쿠키의 SameSite 속성](#쿠키의-samesite-속성)
- [복합 UNIQUE 제약을 사용하는 이유는?](#복합-unique-제약을-사용하는-이유는)
- [외부 Open API 연동 시 API Key를 프론트/백엔드 중 어디에 두어야 안전한가?](#외부-open-api-연동-시-api-key를-프론트백엔드-중-어디에-두어야-안전한가)

---

## SOP와 CORS

### 1. SOP (Same-Origin Policy, 동일 출처 정책)

#### Origin

- **프로토콜(scheme) + 호스트(host) + 포트(port)** 를 합친 것
- 셋 중 하나라도 다르면 다른 Origin

| 요청 페이지 | API 서버 | 같은 Origin? |
| --- | --- | --- |
| `http://localhost:5173` | `http://localhost:3000` | ❌ 포트 다름 |
| `https://woods.com` | `https://api.woods.com` | ❌ 호스트 다름 (서브도메인도 다른 호스트) |
| `http://woods.com` | `https://woods.com` | ❌ 프로토콜 다름 |
| `https://woods.com/login` | `https://woods.com/api/users` | ⭕ 경로는 상관없음 |

#### SOP란?

- **브라우저**가 지키는 보안 정책으로, 한 Origin에서 실행된 스크립트가 **다른 Origin의 리소스(응답)를 읽지 못하게** 제한하는 것
- 만든 이유: 사용자가 은행 사이트에 로그인한 상태로 악성 사이트에 접속했을 때, 악성 사이트의 JS가 사용자 쿠키가 실린 요청을 은행 서버에 보내고 **그 응답(계좌 정보 등)을 읽어가는 것**을 막기 위해

#### SOP가 막는 것과 막지 않는 것

| 구분 | 예시 | SOP 적용 |
| --- | --- | --- |
| JS로 다른 Origin 응답 읽기 | `fetch`, `XMLHttpRequest`로 다른 서버 API 호출 후 응답 사용 | ❌ 기본 차단 |
| 리소스 삽입(embed) | `<img src>`, `<script src>`, `<link href>` (CSS), `<video>` | ⭕ 허용 |
| 다른 Origin으로 요청 보내기 | `<form action>` 제출, 링크 이동 | ⭕ 허용 (응답을 JS로 읽지 못할 뿐) |

- 핵심: SOP는 **요청을 보내는 것 자체보다, 다른 Origin의 응답을 JS가 읽는 것**을 막는 정책
- 그래서 CDN 이미지나 외부 스크립트는 그냥 불러올 수 있지만, 다른 서버 API의 JSON 응답은 읽을 수 없음

### 2. CORS (Cross-Origin Resource Sharing, 교차 출처 리소스 공유)

#### CORS란?

- SOP로 막히는 다른 Origin 요청을 **서버가 "이 Origin은 허용"이라고 응답 헤더로 알려주면** 브라우저가 응답 읽기를 허용해주는 규칙
- 역할 분담
  - **서버(백엔드)**: 어떤 Origin, 메서드, 헤더를 허용할지 **응답 헤더로 선언**
  - **브라우저**: 요청에 `Origin` 헤더를 자동으로 붙이고, 응답 헤더를 보고 **허용 여부를 검사·차단**
- 즉, CORS 설정은 **백엔드가 해야 하는 일**이고, 프론트 코드로는 해결할 수 없음

#### 요청 헤더 (브라우저가 자동으로 붙임)

| 헤더 | 의미 |
| --- | --- |
| `Origin` | 요청을 보낸 페이지의 Origin |
| `Access-Control-Request-Method` | (Preflight) 실제로 보낼 메서드 |
| `Access-Control-Request-Headers` | (Preflight) 실제로 보낼 커스텀 헤더 |

#### 응답 헤더 (서버가 설정)

| 헤더 | 의미 |
| --- | --- |
| `Access-Control-Allow-Origin` | 허용할 Origin (하나의 Origin 또는 `*`) |
| `Access-Control-Allow-Methods` | 허용할 HTTP 메서드 |
| `Access-Control-Allow-Headers` | 허용할 요청 헤더 (`Content-Type`, `Authorization` 등) |
| `Access-Control-Allow-Credentials` | 쿠키 등 인증 정보 포함 요청 허용 여부 |
| `Access-Control-Expose-Headers` | 프론트 JS에서 읽을 수 있게 노출할 응답 헤더 (기본으로는 일부 헤더만 읽을 수 있음) |
| `Access-Control-Max-Age` | Preflight 결과를 캐시할 시간(초) → 매번 OPTIONS 요청이 가지 않게 함 |

### 3. CORS 요청 종류와 서버가 처리할 일

#### (1) 단순 요청 (Simple Request)

- 조건: `GET`, `HEAD`, `POST` 중 하나 + `Content-Type`이 `text/plain`, `application/x-www-form-urlencoded`, `multipart/form-data` 중 하나 + 커스텀 헤더 없음
- 브라우저가 바로 본 요청을 보냄 → 서버는 **실제 응답에 `Access-Control-Allow-Origin`** 을 포함해야 함

#### (2) 예비 요청 (Preflight Request)

- 조건: `PUT`, `PATCH`, `DELETE` 메서드 / `Content-Type: application/json` / `Authorization` 같은 커스텀 헤더 사용 시
- 브라우저가 본 요청 전에 **OPTIONS 요청**을 먼저 보냄 → 서버는 OPTIONS 요청에 **허용 헤더를 담아 2xx로 응답**해야 함
- 실제 프로젝트의 JSON API는 대부분 Preflight 대상

```
[Preflight 요청]
OPTIONS /posts/1
Origin: http://localhost:5173
Access-Control-Request-Method: PATCH
Access-Control-Request-Headers: content-type, authorization

[서버 응답]
204 No Content
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 3600

→ 통과하면 실제 PATCH /posts/1 요청 전송
```

- 서버 쪽 주의: 인증 미들웨어(Guard)가 OPTIONS 요청까지 막아서 401을 응답하면 **Preflight가 실패**함 → OPTIONS는 인증 없이 통과되도록 CORS 처리가 인증보다 먼저 실행되어야 함

#### (3) 인증 정보 포함 요청 (Credentialed Request)

- 쿠키·세션 기반 로그인처럼 요청에 인증 정보를 같이 보내는 경우
- 프론트: `credentials: 'include'` (fetch) / `withCredentials: true` (axios)
- 서버 조건
  - `Access-Control-Allow-Credentials: true`
  - `Access-Control-Allow-Origin`에 **`*` 사용 불가** → 정확한 Origin을 명시해야 함
  - 쿠키를 다른 사이트 요청에 실어 보내려면 쿠키 속성도 `SameSite=None; Secure` 필요 (HTTPS 환경)

### 4. NestJS에서 CORS 설정하기

#### 기본 설정

```ts
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:5173', 'https://woods.com'], // 허용할 Origin 목록
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,   // 쿠키 허용 → origin에 '*' 사용 불가
    maxAge: 3600,        // Preflight 캐시 시간(초)
  });

  await app.listen(3000);
}
bootstrap();
```

#### 환경별로 허용 Origin 관리하기

```ts
// .env
// CORS_ORIGINS=http://localhost:5173,https://woods.com

app.enableCors({
  origin: process.env.CORS_ORIGINS?.split(',') ?? [],
  credentials: true,
});
```

- 개발/배포 환경마다 프론트 주소가 다르기 때문에, 코드에 직접 쓰기보다 **환경 변수로 관리**하는 것이 일반적

---

## Same-Origin과 Same-Site의 차이

### 1. 기준이 다르다

| 구분 | Same-Origin | Same-Site |
| --- | --- | --- |
| 비교 기준 | **scheme + host + port** 가 모두 같아야 함 | **scheme + 등록 가능한 도메인(eTLD+1)** 이 같으면 됨 |
| 포트 | 다르면 다른 Origin | 상관없음 |
| 서브도메인 | 다르면 다른 Origin (`api.woods.com` ≠ `woods.com`) | 상관없음 (`api.woods.com` = `woods.com`) |
| 범위 | 좁고 엄격함 | 넓고 느슨함 |

- **Same-Origin이면 항상 Same-Site**지만, Same-Site라고 해서 Same-Origin은 아님

### 2. Site를 결정하는 eTLD+1

#### eTLD (effective Top-Level Domain)

- `.com`, `.kr`처럼 일반 최상위 도메인뿐 아니라, `.co.kr`, `.github.io`처럼 **누구나 그 아래에 도메인을 등록할 수 있는 공용 접미사**까지 포함한 개념
- 브라우저는 **Public Suffix List(공용 접미사 목록)** 를 기준으로 판단

#### eTLD+1

- eTLD 바로 앞의 한 단계까지 포함한 도메인 = **실제로 소유·등록하는 도메인**

| URL | eTLD | eTLD+1 (Site) |
| --- | --- | --- |
| `https://api.woods.com` | `.com` | `woods.com` |
| `https://shop.naver.co.kr` | `.co.kr` | `naver.co.kr` |
| `https://woods.github.io` | `.github.io` | `woods.github.io` |

- `.github.io`는 eTLD라서 `woods.github.io`와 `other.github.io`는 **서로 다른 Site** (다른 사람 소유이므로)

#### Schemeful Same-Site

- 현재 브라우저들은 Site를 비교할 때 **scheme(http/https)도 함께 비교**함
- 그래서 `http://woods.com`과 `https://woods.com`은 Same-Site가 아님

### 3. 비교 예시

> 기준: `https://www.woods.com`

| 비교 대상 | Same-Origin? | Same-Site? | 이유 |
| --- | --- | --- | --- |
| `https://www.woods.com/posts` | ⭕ | ⭕ | 경로만 다름 |
| `https://api.woods.com` | ❌ | ⭕ | 호스트(서브도메인)가 다르지만 eTLD+1은 같음 |
| `https://www.woods.com:8443` | ❌ | ⭕ | 포트는 Site 비교에 포함 안 됨 |
| `http://www.woods.com` | ❌ | ❌ | scheme이 다름 |
| `https://www.other.com` | ❌ | ❌ | eTLD+1이 다름 |

> 기준: `http://localhost:3000`

| 비교 대상 | Same-Origin? | Same-Site? |
| --- | --- | --- |
| `http://localhost:5173` | ❌ (포트 다름) | ⭕ |

### 4. 각각 어디에 쓰이나

| 개념 | 사용되는 곳 |
| --- | --- |
| **Same-Origin** | SOP, CORS, `localStorage`/`sessionStorage` 접근 범위, iframe 간 DOM 접근 |
| **Same-Site** | 쿠키의 `SameSite` 속성, CSRF 방어, `Sec-Fetch-Site` 요청 헤더 |

#### (1) Same-Origin → 응답 읽기 제한 (SOP / CORS)

- 다른 **Origin**의 응답을 JS로 읽으려면 CORS 허용이 필요
- `https://woods.com` 페이지에서 `https://api.woods.com`을 호출하면 **Same-Site여도 Cross-Origin이라 CORS 설정이 필요**함

#### (2) Same-Site → 쿠키 전송 제한 (SameSite 쿠키 속성)

- 쿠키를 **다른 Site에서 시작된 요청**에도 실어 보낼지 결정하는 속성

| 값 | Same-Site 요청 | Cross-Site 요청 |
| --- | --- | --- |
| `Strict` | 쿠키 전송 | 전송 안 함 (다른 사이트 링크를 눌러 들어와도 안 보냄) |
| `Lax` (기본값) | 쿠키 전송 | 링크 클릭 같은 **최상위 GET 이동만** 전송, fetch·form POST·iframe은 안 보냄 |
| `None` | 쿠키 전송 | 전송 (단, **`Secure` 필수** → HTTPS에서만) |

- Cross-Site 요청에 쿠키가 실리지 않으면, 다른 사이트에서 사용자 몰래 요청을 보내는 **CSRF 공격**을 막을 수 있음

```ts
// NestJS (Express) 예시: 쿠키 설정
res.cookie('refreshToken', token, {
  httpOnly: true,
  secure: true,       // HTTPS에서만 전송
  sameSite: 'lax',    // Same-Site 요청에만 전송 (기본)
  // sameSite: 'none', // Cross-Site 요청에도 전송해야 할 때 (secure: true 필수)
});
```

#### (3) Sec-Fetch-Site 요청 헤더

- 브라우저가 요청이 어디서 시작됐는지 자동으로 알려주는 헤더
- 값: `same-origin` / `same-site` / `cross-site` / `none`(주소창 직접 입력 등)
- 서버는 이 값을 보고 `cross-site` 요청을 거부하는 식으로 추가 방어를 할 수 있음

---

## 쿠키의 SameSite 속성

### 1. 용어 정의

#### 쿠키 (Cookie)

- 서버가 `Set-Cookie` 응답 헤더로 브라우저에 저장시키는 작은 데이터
- 브라우저는 이후 해당 서버로 요청을 보낼 때 조건에 맞는 쿠키를 `Cookie` 요청 헤더에 **자동으로** 실어 보냄
- 로그인 세션 ID, 리프레시 토큰 등 인증 정보 저장에 주로 사용

```
[응답]
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Lax; Path=/

[이후 요청]
Cookie: sessionId=abc123
```

#### Site

- **scheme + eTLD+1(등록 가능한 도메인)**
- 예: `https://api.woods.com`의 Site는 `https://woods.com`

#### Same-Site 요청 / Cross-Site 요청

- **Same-Site 요청**: 요청을 시작한 페이지의 Site와 요청 대상의 Site가 같은 요청
  - 예: `https://woods.com` 페이지 → `https://api.woods.com`
- **Cross-Site 요청**: 두 Site가 다른 요청
  - 예: `https://evil.com` 페이지 → `https://api.woods.com`

#### SameSite 속성

- 쿠키를 **Cross-Site 요청에도 실어 보낼지**를 정하는 쿠키 속성
- 값: `Strict`, `Lax`, `None`
- 목적: 다른 사이트에서 시작된 요청에 사용자의 인증 쿠키가 자동으로 실리는 것을 막아 **CSRF 공격을 방어**

#### CSRF (Cross-Site Request Forgery, 사이트 간 요청 위조)

- 사용자가 로그인한 상태에서 악성 사이트에 접속하면, 악성 사이트가 사용자 모르게 대상 서버로 요청을 보내는 공격
- 브라우저가 쿠키를 자동으로 실어 보내기 때문에, 서버는 사용자가 직접 보낸 요청으로 착각하고 처리함 (송금, 비밀번호 변경 등)

```html
<!-- evil.com에 숨겨진 폼 -->
<form action="https://bank.com/transfer" method="POST">
  <input type="hidden" name="to" value="attacker" />
  <input type="hidden" name="amount" value="1000000" />
</form>
<script>document.forms[0].submit();</script>
```

### 2. SameSite 값별 동작

| 값 | Same-Site 요청 | Cross-Site 요청 | 특징 |
| --- | --- | --- | --- |
| `Strict` | 전송 | **전송 안 함** | 가장 엄격함 |
| `Lax` | 전송 | **최상위 탐색 + 안전한 메서드(GET 등)만** 전송 | 브라우저 기본값 |
| `None` | 전송 | 전송 | **`Secure` 속성 필수** |

#### Strict

- 다른 사이트에서 시작된 요청에는 **어떤 경우에도** 쿠키를 보내지 않음
- 외부 사이트(메일, 메신저, 검색 결과)의 링크를 눌러 들어와도 첫 요청에는 쿠키가 없음 → **로그인이 풀린 것처럼 보일 수 있음**
- 송금, 계정 설정처럼 보안이 매우 중요한 기능의 쿠키에 적합

#### Lax

- Cross-Site 요청 중 **주소창의 페이지가 바뀌는 최상위 탐색(top-level navigation)** 이면서 **GET 같은 안전한 메서드**일 때만 쿠키 전송
- 외부 링크로 들어와도 로그인 상태는 유지되고, 다른 사이트에서 몰래 보내는 POST 요청에는 쿠키가 실리지 않음
- `SameSite`를 지정하지 않은 쿠키는 현재 주요 브라우저에서 **Lax로 취급**함 (Lax by default)
- 단, 이 기본값을 신뢰하기보다 **명시적으로 설정**하는 것이 안전함 (브라우저마다 처리 방식에 차이가 있음)

#### None

- Cross-Site 요청에도 쿠키를 항상 전송
- **반드시 `Secure`와 함께** 설정해야 함 → 없으면 브라우저가 쿠키를 거부
- 서비스 구조상 다른 Site에서 쿠키 기반 인증 요청이 필요한 경우에만 사용
- 서드파티 쿠키 차단 정책을 적용하는 브라우저(Safari, Firefox 등)에서는 `None`이어도 Cross-Site 맥락에서 쿠키가 제한될 수 있음

### 3. Cross-Site 요청 종류별 쿠키 전송 여부

| 요청 방식 (Cross-Site) | Strict | Lax | None |
| --- | --- | --- | --- |
| 링크 클릭 `<a href>` | ❌ | ⭕ | ⭕ |
| `<form method="GET">` 제출 | ❌ | ⭕ | ⭕ |
| `<form method="POST">` 제출 | ❌ | ❌ | ⭕ |
| `fetch` / `XMLHttpRequest` | ❌ | ❌ | ⭕ |
| `<iframe>` 안의 요청 | ❌ | ❌ | ⭕ |
| `<img>`, `<script>` 리소스 요청 | ❌ | ❌ | ⭕ |

- Same-Site 요청은 세 값 모두 쿠키 전송

### 4. 다른 쿠키 속성과의 관계

| 속성 | 의미 | SameSite와의 관계 |
| --- | --- | --- |
| `Secure` | HTTPS 요청에서만 쿠키 전송 | `SameSite=None`이면 **필수** |
| `HttpOnly` | JS(`document.cookie`)로 쿠키 접근 불가 | 별개 속성. XSS로 쿠키를 탈취하는 것을 방지 |
| `Domain` | 쿠키를 보낼 도메인 범위 (지정 시 서브도메인 포함) | Domain은 "어느 서버로 보낼지", SameSite는 "어디서 시작된 요청에 보낼지" |
| `Path` | 쿠키를 보낼 경로 범위 | 별개 속성 |
| `Max-Age` / `Expires` | 쿠키 만료 시간 | 별개 속성 |

- 인증용 쿠키는 보통 `HttpOnly; Secure; SameSite=Lax` (또는 `Strict`) 조합을 기본으로 사용

### 5. SameSite만으로 CSRF를 완전히 막을 수 없는 경우

- **Same-Site 공격**: SameSite는 Site 단위로 판단하므로, 같은 eTLD+1 아래의 다른 서브도메인(예: 관리가 허술한 `blog.woods.com`)이 공격당하면 그곳에서 보낸 요청은 Same-Site로 취급되어 쿠키가 전송됨
- **GET 요청으로 상태를 변경하는 API**: Lax는 최상위 GET 이동에 쿠키를 보내므로, `GET /posts/1/delete` 같은 API가 있으면 링크 클릭만으로 공격 가능 → 상태 변경은 POST, PATCH, DELETE로 처리해야 함
- **`SameSite=None`을 쓰는 경우**: 쿠키가 Cross-Site 요청에도 실리므로 SameSite 방어 효과가 없음
- 따라서 중요한 기능에는 **CSRF 토큰, `Origin`/`Sec-Fetch-Site` 헤더 검증** 등을 함께 사용

### 6. NestJS에서 설정하기

#### 쿠키 발급

```ts
import { Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  @Post('login')
  login(@Res({ passthrough: true }) res: Response) {
    const refreshToken = '...';

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,                    // JS 접근 차단
      secure: true,                      // HTTPS에서만 전송
      sameSite: 'lax',                   // 'strict' | 'lax' | 'none'
      path: '/auth',                     // /auth 경로 요청에만 전송
      maxAge: 1000 * 60 * 60 * 24 * 14,  // 14일 (ms 단위)
    });

    return { message: '로그인 성공' };
  }
}
```

#### Cross-Site 요청에도 쿠키가 필요한 경우

```ts
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: true,       // None이면 반드시 true
  sameSite: 'none',
});
```

- 이 경우 CORS 설정에서도 `credentials: true`와 정확한 `origin` 지정이 함께 필요함

#### 쿠키 삭제

```ts
res.clearCookie('refreshToken', {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/auth',
});
```

- 발급할 때와 **같은 `path`, `domain` 옵션**을 줘야 해당 쿠키가 정상적으로 삭제됨

---

## 복합 UNIQUE 제약을 사용하는 이유는?

### 1. 용어 정의

#### 제약 조건 (Constraint)

- 테이블에 저장되는 데이터가 지켜야 할 규칙을 **DB 차원에서 강제**하는 것
- 규칙을 어기는 INSERT/UPDATE는 DB가 에러를 내고 거부함
- 종류: `PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE`, `NOT NULL`, `CHECK` 등

#### UNIQUE 제약

- 지정한 컬럼의 값이 테이블 안에서 **중복되지 않도록** 보장하는 제약
- 예: `email` 컬럼에 UNIQUE → 같은 이메일로 두 번 가입 불가

#### 복합 UNIQUE 제약 (Composite UNIQUE Constraint)

- **두 개 이상의 컬럼을 묶어서**, 그 **값의 조합**이 중복되지 않도록 보장하는 제약
- 각 컬럼의 값은 따로 보면 중복될 수 있지만, **조합이 같은 행은 하나만** 존재할 수 있음

```sql
CREATE TABLE post_like (
  id      BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  post_id BIGINT NOT NULL,
  CONSTRAINT uq_post_like_user_post UNIQUE (user_id, post_id)
);
```

| user_id | post_id | 저장 가능? |
| --- | --- | --- |
| 1 | 10 | ⭕ |
| 1 | 20 | ⭕ (user_id 중복이지만 조합은 다름) |
| 2 | 10 | ⭕ (post_id 중복이지만 조합은 다름) |
| 1 | 10 | ❌ (조합 (1, 10)이 이미 존재) |

### 2. 개별 UNIQUE와의 차이

| 구분 | 개별 UNIQUE `UNIQUE(user_id)`, `UNIQUE(post_id)` | 복합 UNIQUE `UNIQUE(user_id, post_id)` |
| --- | --- | --- |
| 중복 판단 기준 | 각 컬럼 값 하나하나 | 컬럼 값의 **조합** |
| 의미 | 한 사용자는 좋아요를 1개만, 한 게시글은 좋아요를 1개만 받을 수 있음 | **한 사용자는 같은 게시글에 좋아요를 1번만** 누를 수 있음 |
| 결과 | 비즈니스 규칙과 맞지 않음 | 원하는 규칙을 정확히 표현 |

### 3. 사용하는 이유

#### 이유 1. "조합" 단위의 비즈니스 규칙을 표현할 수 있다

- 실제 서비스의 규칙은 컬럼 하나가 아니라 **여러 값의 관계**로 정의되는 경우가 많음

| 테이블 | 복합 UNIQUE | 표현하는 규칙 |
| --- | --- | --- |
| 좋아요 | `(user_id, post_id)` | 한 사용자는 같은 게시글에 좋아요 1번만 |
| 팔로우 | `(follower_id, following_id)` | 같은 사람을 중복 팔로우할 수 없음 |
| 수강 신청 | `(student_id, course_id)` | 같은 강의를 두 번 신청할 수 없음 |
| 리뷰 | `(user_id, store_id)` | 한 가게에 리뷰는 1개만 |
| 장바구니 | `(cart_id, product_id)` | 같은 상품은 한 줄로 관리하고 수량만 변경 |
| 소셜 로그인 | `(provider, provider_id)` | 같은 소셜 계정은 하나만 연결 |
| 예약 | `(room_id, reserved_date)` | 같은 날 같은 방은 한 번만 예약 |

#### 이유 2. 애플리케이션 코드의 중복 검사만으로는 동시 요청을 막을 수 없다

- 보통 "이미 있는지 조회 → 없으면 저장" 순서로 중복을 검사함
- 하지만 같은 요청이 **거의 동시에 두 번** 들어오면(따닥 클릭, 네트워크 재시도) 두 요청 모두 조회 시점에는 데이터가 없어서 **둘 다 저장**되는 **경쟁 상태(Race Condition)** 가 생김

```
요청 A: SELECT → 없음 ─────────▶ INSERT (1, 10) 성공
요청 B:    SELECT → 없음 ─────────▶ INSERT (1, 10) 성공  ← 중복 발생!
```

- 복합 UNIQUE 제약이 있으면 **DB가 최종적으로 중복을 거부**하므로, 코드에서 놓친 경우에도 데이터 무결성이 지켜짐

```
요청 A: INSERT (1, 10) 성공
요청 B: INSERT (1, 10) → Duplicate entry 에러로 거부
```

#### 이유 3. 데이터 무결성을 DB가 보장한다

- 애플리케이션 코드는 여러 곳(API, 배치 작업, 관리자 도구, 직접 실행한 SQL)에서 DB에 접근할 수 있음
- 규칙을 코드에만 두면 한 곳이라도 검사를 빠뜨리면 잘못된 데이터가 들어감
- 제약을 DB에 두면 **어떤 경로로 들어오든 같은 규칙이 적용**됨
- 중복 데이터가 생기면 좋아요 수가 실제보다 많게 집계되는 등 **잘못된 통계·버그**로 이어짐

#### 이유 4. 인덱스가 함께 생성되어 조회가 빨라진다

- 대부분의 DB(MySQL, PostgreSQL 등)는 UNIQUE 제약을 만들면 **해당 컬럼 조합으로 인덱스를 자동 생성**함
- 그래서 "이 사용자가 이 게시글에 좋아요를 눌렀는지" 같은 조회가 빠름

```sql
-- 복합 인덱스 (user_id, post_id)를 사용
SELECT * FROM post_like WHERE user_id = 1 AND post_id = 10;
```

- 복합 인덱스는 **왼쪽 컬럼부터 순서대로** 사용됨 (Leftmost Prefix 규칙)

| 조회 조건 | 인덱스 사용 |
| --- | --- |
| `WHERE user_id = ? AND post_id = ?` | ⭕ |
| `WHERE user_id = ?` | ⭕ (첫 번째 컬럼) |
| `WHERE post_id = ?` | ❌ (첫 번째 컬럼 없이 두 번째만 사용) |

- 따라서 **자주 단독으로 조회하는 컬럼을 앞에** 두는 것이 좋음
- 반대 방향 조회(`post_id`만으로 조회)가 많다면 `post_id`에 별도 인덱스를 추가

### 4. 복합 UNIQUE vs 복합 기본키

| 구분 | 복합 UNIQUE + 별도 id | 복합 기본키 `PRIMARY KEY(user_id, post_id)` |
| --- | --- | --- |
| 행 식별 | `id` 하나로 식별 | 두 컬럼 조합으로 식별 |
| NULL 허용 | 컬럼에 `NOT NULL`을 따로 지정해야 함 | 기본키라 NULL 불가 |
| 다른 테이블에서 참조 | `id` 하나만 외래키로 사용 | 외래키도 두 컬럼 모두 필요 |
| ORM 사용 | 편함 (대부분 단일 id 기준) | 설정이 복잡해질 수 있음 |

- 실무에서는 **단일 `id` 기본키 + 복합 UNIQUE** 조합을 많이 사용함

### 5. NULL 값 처리

- 대부분의 DB(MySQL, PostgreSQL 등)는 UNIQUE 비교에서 **NULL을 서로 다른 값으로 취급**함
- 그래서 조합에 NULL이 포함되면 같은 조합이 **여러 번 저장될 수 있음**

| user_id | post_id | 저장 가능? |
| --- | --- | --- |
| 1 | NULL | ⭕ |
| 1 | NULL | ⭕ (NULL끼리는 같다고 보지 않음) |

- 복합 UNIQUE에 쓰는 컬럼은 보통 **`NOT NULL`을 함께 지정**함
- PostgreSQL 15 이상은 `UNIQUE NULLS NOT DISTINCT`로 NULL도 같은 값으로 취급하게 설정할 수 있음

### 6. 중복 위반 시 에러 처리

- 제약을 위반하면 DB가 에러를 반환하므로, 서버에서 이를 잡아 **적절한 응답(보통 409 Conflict)** 으로 바꿔줘야 함

| DB / ORM | 중복 위반 에러 |
| --- | --- |
| MySQL | 에러 코드 `1062` (`ER_DUP_ENTRY`) |
| PostgreSQL | SQLSTATE `23505` (`unique_violation`) |
| Prisma | `P2002` |

```ts
// NestJS + Prisma 예시
import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class LikeService {
  constructor(private readonly prisma: PrismaService) {}

  async like(userId: number, postId: number) {
    try {
      return await this.prisma.postLike.create({
        data: { userId, postId },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('이미 좋아요를 누른 게시글입니다.');
      }
      throw e;
    }
  }
}
```

### 7. ORM에서 선언하기

#### Prisma

```prisma
model PostLike {
  id     Int  @id @default(autoincrement())
  userId Int
  postId Int

  @@unique([userId, postId])
}
```

- `@@unique`를 선언하면 복합 키로 바로 조회 가능

```ts
await prisma.postLike.findUnique({
  where: { userId_postId: { userId: 1, postId: 10 } },
});
```

#### TypeORM

```ts
import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity()
@Unique('uq_post_like_user_post', ['userId', 'postId'])
export class PostLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  postId: number;
}
```

---

## 외부 Open API 연동 시 API Key를 프론트/백엔드 중 어디에 두어야 안전한가?

### 1. 용어 정의

#### Open API

- 외부 서비스가 다른 개발자도 사용할 수 있도록 공개한 API
- 예: 공공데이터포털, 카카오 지도·로그인, 네이버 검색, OpenWeather, OpenAI 등

#### API Key

- Open API 제공자가 **"누가 요청했는지" 식별하고 사용량을 관리**하기 위해 발급하는 문자열
- 요청 시 쿼리 스트링이나 헤더에 담아 보냄

```
GET https://api.example.com/weather?city=Incheon&appKey=abcd1234
Authorization: Bearer sk-xxxxxxxx
```

- API Key로 하는 일
  - 요청자 식별 (어떤 서비스·계정의 요청인지)
  - 사용량 제한 (하루 호출 수, 요금 부과)
  - 권한 범위 제한 (어떤 기능을 쓸 수 있는지)

#### 비밀 키 (Secret Key)와 공개 키 (Publishable / Client Key)

- **비밀 키**: 서버에서만 사용해야 하는 키. 노출되면 누구나 내 계정으로 API를 호출할 수 있음
  - 예: OpenAI API Key, 카카오 REST API 키·Admin 키, 결제 서비스 Secret Key, 공공데이터포털 서비스키
- **공개 키**: 처음부터 **브라우저에 노출되는 것을 전제로** 발급되는 키. 대신 등록한 도메인에서만 동작하는 등 제한이 걸려 있음
  - 예: 카카오 JavaScript 키, Google Maps JavaScript API 키(HTTP referrer 제한), 결제 서비스 Publishable Key

### 2. 비밀 키는 반드시 백엔드에 둔다

#### 프론트엔드에 두면 안 되는 이유

- 프론트엔드 코드는 **사용자의 브라우저로 그대로 전달되어 실행**됨
- 환경 변수에 넣어도 빌드할 때 **JS 번들 안에 문자열로 그대로 삽입**됨
  - `VITE_`, `NEXT_PUBLIC_`, `REACT_APP_` 접두사가 붙은 환경 변수는 **공개용**이라는 의미
- 누구나 아래 방법으로 키를 확인할 수 있음
  - 개발자 도구 **Network 탭**에서 요청 URL·헤더 확인
  - **Sources 탭**에서 번들된 JS 파일 검색
- 즉, 브라우저에서 사용하는 값은 **어떤 방법으로 숨겨도 결국 사용자에게 보임**

#### 키가 노출되면 생기는 문제

| 문제 | 내용 |
| --- | --- |
| 사용량 도용 | 다른 사람이 내 키로 API를 호출해서 **일일 호출 한도가 소진** → 내 서비스가 동작하지 않음 |
| 요금 폭탄 | 유료 API(OpenAI, 클라우드 등)는 사용량만큼 **내 계정에 비용 청구** |
| 권한 악용 | Admin 키·결제 Secret Key 같은 경우 데이터 조회·변경, 결제 취소까지 가능 |
| 계정 정지 | 키가 악용되어 약관 위반 요청이 발생하면 **제공자가 계정을 정지**할 수 있음 |

### 3. 백엔드에 두는 방법: 프록시(Proxy) 구조

#### 구조

```
[브라우저] ──(키 없이 요청)──▶ [우리 백엔드] ──(API Key 추가)──▶ [외부 Open API]
          ◀──(필요한 데이터만)── [우리 백엔드] ◀──────(응답)────── [외부 Open API]
```

- 브라우저는 **우리 서버의 API만** 호출하고, 외부 API Key는 **서버 안에서만** 사용됨
- 이렇게 클라이언트 대신 외부 API를 호출해주는 서버 계층을 **프록시** 또는 **BFF(Backend For Frontend)** 라고 부름

#### 백엔드에 두었을 때 추가로 얻는 이점

| 이점 | 내용 |
| --- | --- |
| 키 보호 | 키가 서버 밖으로 나가지 않음 |
| 접근 제어 | 로그인한 사용자만 호출 가능하게 하는 등 **우리 서버의 인증을 적용**할 수 있음 |
| 사용량 제한 | 사용자별·IP별 **Rate Limit**을 걸어 한도 소진을 방지 |
| 캐싱 | 같은 요청(날씨, 공공데이터 등)은 결과를 캐시해 **외부 호출 횟수와 비용 절감** |
| 응답 가공 | 외부 응답에서 필요한 필드만 골라 반환, 형식 통일 |
| 키 교체 용이 | 키를 바꿔도 **서버 환경 변수만 수정**하면 됨 (클라이언트 재배포 불필요) |
| CORS 회피 | 외부 API가 브라우저 요청(CORS)을 허용하지 않아도 **서버 간 통신은 CORS 제약이 없음** |

### 4. NestJS에서 구현하기

#### (1) 환경 변수로 키 관리

```bash
# .env
WEATHER_API_KEY=abcd1234
```

```bash
# .gitignore
.env
```

- 키를 **코드에 직접 쓰지 않고**, `.env` 파일은 **Git에 올리지 않음**
- 팀원 공유용으로는 값이 비어 있는 `.env.example`만 커밋
- 배포 환경에서는 서버·호스팅 서비스의 환경 변수 설정이나 시크릿 매니저(AWS Secrets Manager 등)에 저장

#### (2) ConfigModule 설정

```ts
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
})
export class AppModule {}
```

#### (3) 프록시 API 구현

```ts
// weather.service.ts
import { Injectable, BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WeatherService {
  constructor(private readonly config: ConfigService) {}

  async getWeather(city: string) {
    const apiKey = this.config.getOrThrow<string>('WEATHER_API_KEY');
    const url = new URL('https://api.example.com/weather');
    url.searchParams.set('city', city);
    url.searchParams.set('appKey', apiKey); // 키는 서버에서만 추가

    const res = await fetch(url);
    if (!res.ok) {
      throw new BadGatewayException('날씨 정보를 가져오지 못했습니다.');
    }

    const data = await res.json();
    // 필요한 값만 골라서 반환
    return {
      city,
      temperature: data.main.temp,
      description: data.weather[0].description,
    };
  }
}
```

```ts
// weather.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('weather')
@UseGuards(ThrottlerGuard) // 요청 횟수 제한 (ThrottlerModule 설정 필요)
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  getWeather(@Query('city') city: string) {
    return this.weatherService.getWeather(city);
  }
}
```

#### 프록시 구현 시 주의할 점

- **아무 URL이나 대신 호출해주는 범용 프록시로 만들지 않기**
  - 예: `GET /proxy?url=...`처럼 클라이언트가 대상 URL을 정하게 하면, 내 키로 아무 요청이나 보낼 수 있게 되고 서버 내부망 공격(SSRF)에도 악용될 수 있음
  - 호출할 외부 엔드포인트는 **서버 코드에서 고정**하고, 클라이언트에게는 필요한 파라미터만 받기
- 받은 파라미터는 **검증(DTO + ValidationPipe)** 후 사용
- 외부 API 에러 응답이나 키가 포함된 URL을 **로그나 응답에 그대로 노출하지 않기**

### 5. 공개 키(Client Key)는 프론트엔드에 두어도 되는 경우

- 카카오 지도 JavaScript SDK, Google Maps JavaScript API처럼 **브라우저에서 SDK를 직접 실행해야 하는 서비스**는 공개 키를 프론트엔드에 둠
- 이 경우 키 자체를 숨기는 대신 **제공자 콘솔에서 사용 범위를 제한**해서 보호함

| 보호 방법 | 내용 |
| --- | --- |
| 도메인 제한 | 등록한 도메인(예: `https://woods.com`)에서 온 요청만 허용 |
| API 범위 제한 | 해당 키로 지도 표시 등 **필요한 API만** 사용 가능하게 설정 |
| 사용량 상한 | 일일 호출 한도·예산 알림 설정 |

- 같은 서비스라도 키 종류에 따라 위치가 다름
  - 예: 카카오 **JavaScript 키**는 프론트엔드, **REST API 키·Admin 키**는 백엔드