# Backend Chapter05

## 키워드 정리

### SOP와 CORS — 브라우저는 왜 다른 출처의 요청을 막고, 서버는 어떻게 이를 허용하는가?

**SOP (Same-Origin Policy, 동일 출처 정책)**

- 웹 브라우저가 기본으로 제공하는 보안 정책임
- 한 출처(Origin)에서 불러온 문서/스크립트가 다른 출처의 리소스와 직접 상호작용하는 것을 기본적으로 차단함
- 악의적인 사이트가 사용자의 쿠키/세션을 도용해 타 사이트 API를 무단 호출하는 XSS·CSRF 공격을 막는 게 목적임

**CORS (Cross-Origin Resource Sharing, 교차 출처 리소스 공유)**

- SOP 때문에 차단되는 Cross-Origin 요청을, 백엔드 서버가 허락해서 브라우저가 통과시키도록 만든 메커니즘임
- 백엔드 응답 헤더에 `Access-Control-Allow-Origin: https://myfront.com`을 명시해서 보내면, 브라우저가 이를 확인하고 프론트엔드 코드에 응답 데이터를 전달함

### Same-Origin과 Same-Site의 차이 — 두 판단 기준은 어떻게 다른가?

기준 URL: `https://app.example.com:8080`

**Same-Origin (엄격)**

- 판단 기준: Scheme(프로토콜) + Host(도메인) + Port, 3가지가 모두 정확히 일치해야 함
- `https://app.example.com:8080/user` → Same-Origin
- `http://app.example.com:8080` → Cross-Origin (프로토콜이 다름)
- `https://api.example.com:8080` → Cross-Origin (도메인이 다름)

**Same-Site (느슨)**

- 판단 기준: eTLD+1(최상위 도메인 + 바로 앞 도메인)만 일치하면 됨. 서브도메인과 포트는 무시함
- `https://api.example.com` → Same-Site (`example.com` 동일)
- `https://sub.app.example.com:9090` → Same-Site (`example.com` 동일)

### 쿠키의 SameSite 속성 — 다른 사이트로의 요청에 쿠키를 실어 보낼지 어떻게 결정하는가?

다른 사이트에서 내 사이트로 요청(Cross-Site Request)을 보낼 때 쿠키를 함께 실어 보낼지 결정하는 보안 설정임 (CSRF 방어의 핵심).

- **`SameSite=Strict`**: 무조건 Same-Site 요청일 때만 쿠키를 전송함. 가장 안전하지만, 타 사이트에서 링크를 클릭해 접속하는 단순 GET 이동 시에도 쿠키가 안 넘어가 로그아웃된 것처럼 보일 수 있음
- **`SameSite=Lax`** (최신 브라우저 기본값): 기본적으로 Cross-Site 요청 시 쿠키 전송을 차단하지만, 사용자가 직접 링크를 클릭해 이동하는 Top-Level Navigation(GET 요청)에는 쿠키 전송을 허용함
- **`SameSite=None`**: Cross-Site API 요청 시에도 제한 없이 항상 쿠키를 전송함. 단 반드시 `Secure` 속성(HTTPS)을 함께 명시해야만 브라우저가 수락함

### 복합 UNIQUE 제약을 사용하는 이유는?

DB에서 2개 이상의 컬럼 조합에 대해 중복을 방지하기 위해 사용함 (예: `book_like` 테이블의 `(user_id, book_id)` 조합).

```sql
ALTER TABLE book_like ADD CONSTRAINT uq_user_book UNIQUE (user_id, book_id);
```

- **무결성 보장:** `user_id` 단독, `book_id` 단독은 중복을 허용하되, `(user_id, book_id)` 한 쌍은 유일함을 강제함
- **동시성 이슈(Race Condition) 방지:** 애플리케이션 조건문(`if (!exists)`)을 뚫고 동시에 들어오는 중복 INSERT를, DB 레벨에서 확실히 차단함
- **복합 인덱스 자동 생성:** 지정된 컬럼들을 묶은 Composite Index가 자동 생성되어 조인 및 검색 성능이 향상됨

### 외부 Open API 연동 시 API Key를 프론트/백엔드 중 어디에 두어야 안전한가?

API Key는 무조건 백엔드 서버의 환경변수/설정 파일에 은닉해야 함.

**프론트엔드에 두면 안 되는 이유**

- React/Vue 등 프론트엔드 코드나 `.env`에 넣은 API Key는 빌드 후 클라이언트(브라우저) 개발자 도구 및 소스코드에 그대로 노출됨
- 누구나 탈취해 무단 사용(과금 폭탄, 인증 도용)할 위험이 있음

**올바른 백엔드 프록시(Proxy) 구조**

1. 프론트엔드 → 내 백엔드 API 호출 (`GET /api/v1/search`)
2. 백엔드 → 내부 환경변수에서 API Key를 읽어 외부 Open API 호출
3. 백엔드 → 결과를 정제하여 프론트엔드에 응답
