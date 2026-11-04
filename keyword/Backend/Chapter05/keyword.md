- SOP와 CORS

  **SOP(Same-Origin Policy, 동일 출처 정책)**
  한 출처의 스크립트가 다른 출처의 데이터에 마음대로 접근하지 못하도록 제한하는 브라우저 보안 정책.
  악성 사이트에서 사용자가 로그인한 다른 사이트의 개인정보를 읽어가는 상황 등을 방지.

  **CORS(Cross-Origin Resource Sharing, 교차 출처 리소스 공유)**
  서버가 HTTP 응답 헤더로 허용 범위를 알려주면, 브라우저가 다른 출처의 응답도 JavaScript에서 읽을 수 있도록 허용하는 방식.
  ⇒ SOP를 없애는 것이 아니라, 필요한 출처에 한해 접근을 허용.

  **동작 방식**

    1. 프론트 `http://localhost:5173` → 백엔드 `http://localhost:8080`에 요청. 포트가 달라 교차 출처 요청에 해당.
    2. 서버는 CORS 설정에 따라 허용 출처 등의 응답 헤더를 구성.
    3. 브라우저는 응답 헤더를 확인, 조건을 만족하면 프론트 코드에 응답 전달. 만족하지 않으면 응답 읽기 차단.

    ```
    Origin: http://localhost:5173
    ```

  요청의 `Origin`: 요청을 시작한 페이지의 출처.

    ```
    Access-Control-Allow-Origin: http://localhost:5173
    ```

  응답의 `Access-Control-Allow-Origin`: 서버가 응답 읽기를 허용하는 출처

  **Spring 설정**

    ```java
    registry.addMapping("/**")
            .allowedOrigins(
    		        "http://localhost:5173",
    		        "http://127.0.0.1:5173"
    		    )
            .allowedMethods("GET", "POST", "PATCH", "DELETE")
            .allowedHeaders("*");
    ```

    - `addMapping`: CORS 설정을 적용할 서버 경로.
    - `allowedOrigins`: 허용할 프론트 출처. API의 전체 URL이나 화면 경로를 적는 것이 아니라 프로토콜·호스트·포트 지정.
    - `allowedMethods`, `allowedHeaders`: 허용할 실제 요청의 HTTP 메서드와 헤더.

  **추가로 알아두면 좋은 내용**

    - **인증·인가를 대신하지 않음**: Postman이나 서버 간 통신에는 브라우저의 SOP 제한이 없음. CORS 허용 출처를 좁혔다고 외부에서 API 호출 자체가 불가능해지는 것은 X.
    - **오류 확인**: Network에서 `OPTIONS`와 실제 요청을 나눠 확인 → 요청의 Origin, 서버 응답 헤더, 프록시·인증 오류 등을 점검. 서버 설정이 주된 원인이지만 요청 URL이나 credentials 설정도 확인 필요.

  **참고 자료**

    - MDN — 동일 출처 정책
    - MDN — CORS
- Same-Origin과 Same-Site의 차이

  **Same-Origin(동일 출처)**
  프로토콜(scheme) + 호스트 + 포트가 모두 같은 경우. SOP와 CORS에서 사용하는 기준.

  **Same-Site(동일 사이트)**
  쿠키의 SameSite 판단에서는 프로토콜 + 등록 가능 도메인이 같은 경우. 서브도메인과 포트는 달라도 가능.
  ⇒ 도메인만 같으면 되는 것은 X. `http`와 `https`도 구분하는 schemeful same-site 기준.

    - 등록 가능 도메인: `app.example.co.kr`에서 `example.co.kr`에 해당. 단순히 주소의 마지막 두 부분을 뜻하는 것은 X.
    - URL의 경로(`/members` 등)와 쿼리 파라미터는 Origin·Site를 구분하는 기준에 포함 X.

  **비교 예시**

  기: `https://app.example.com`

  | 비교 대상 | Same-Origin | Same-Site | 이유 |
      | --- | --- | --- | --- |
  | `https://app.example.com/members` | O | O | 경로만 다름 |
  | `https://api.example.com` | X | O | 호스트는 다르지만 프로토콜·등록 가능 도메인은 같음 |
  | `https://app.example.com:8443` | X | O | 포트만 다름 |
  | `http://app.example.com` | X | X | 프로토콜이 다름 |
  | `https://other.com` | X | X | 등록 가능 도메인이 다름 |

  기본 포트는 생략 가능. `https://app.example.com`과 `https://app.example.com:443`은 같은 Origin.

  **추가로 알아두면 좋은 내용**

    - Same-Origin이면 Same-Site지만, 반대는 성립 X.
    - **Same-Site ⇒ 쿠키 공유는 X**. 실제 쿠키 전송에는 쿠키의 `Domain`, `Path`, `Secure`, fetch의 credentials 설정 등도 함께 적용.
      ex) `api.example.com`이 Domain 없이 설정한 쿠키는 그 호스트에만 전송. 같은 Site인 `app.example.com`에 자동으로 공유되는 것은 X.
    - **목적**: CORS는 교차 출처 응답을 JS가 읽을 수 있는지, SameSite 속성은 요청의 사이트 관계에 따라 쿠키를 실을 수 있는지 판단.

  **참고 자료**

    - MDN — Site와 schemeful same-site
    - MDN — Origin 구분 기준
- 쿠키의 SameSite 속성

  **SameSite**
  요청을 시작한 사이트와 쿠키를 받을 사이트의 관계에 따라, 브라우저가 요청에 쿠키를 포함할 수 있는지 정하는 속성.
  서버가 `Set-Cookie` 응답 헤더로 지정. 다른 사이트를 이용해 사용자의 로그인 쿠키가 악용되는 상황을 줄이는 데 사용.

  **속성값**

    - **Strict**: Same-Site 요청에만 쿠키 전송. 다른 사이트에서 링크를 눌러 들어오는 첫 요청에도 해당 쿠키는 전송 X. 보호는 강하지만 로그인 상태가 처음에 안 보이는 등 사용성 영향 가능.
    - **Lax**: Same-Site 요청 + 다른 사이트에서의 최상위 페이지 이동 중 GET 같은 안전한 메서드 요청에 전송 가능. 외부 링크를 눌러 이동하는 경우는 가능하지만, cross-site fetch나 iframe 요청은 해당하지 않음.
    - **None**: cross-site 요청에도 쿠키 사용을 허용. `Secure`를 함께 지정해야 함. 다만 다른 쿠키 조건이나 브라우저 정책까지 무시한다는 뜻은 X.

  **설정 예시**

    ```
    Set-Cookie: sessionId=example; Path=/; HttpOnly; Secure; SameSite=Lax
    ```

    - `SameSite=Lax`: 사이트 관계에 따른 쿠키 전송 조건.
    - `Secure`: 원칙적으로 HTTPS 요청에서 전송. localhost에는 브라우저 예외가 있음.
    - `HttpOnly`: JavaScript의 직접적인 쿠키 읽기 제한. fetch 요청에 쿠키가 자동으로 실리는 것까지 막는 것은 X.

  **CORS와 함께 볼 때**

  다른 Origin으로 쿠키를 포함해 요청하려면 fetch의 credentials 설정도 필요.

    ```jsx
    fetch("https://api.example.com/members/1/ratings", {
      credentials: "include",
    });
    ```

    - fetch 기본값은 `same-origin`. 포트가 다른 localhost처럼 Same-Site여도 다른 Origin이면 `include` 설정 필요.
    - 서버도 특정 출처를 허용하고 `Access-Control-Allow-Credentials: true`로 응답해야 쿠키를 포함한 CORS 응답을 프론트에서 사용 가능.
    - Spring에서는 `allowedOrigins(실제 프론트 출처)` + `allowCredentials(true)`. credentials를 허용하면서 `Access-Control-Allow-Origin: *`를 사용하는 것은 불가.
    - `include`는 SameSite 규칙을 우회하지 않음. cross-site fetch에서 Lax·Strict 쿠키를 강제로 보내는 옵션은 X.

  **추가로 알아두면 좋은 내용**

    - **SameSite=None ⇒ 쿠키 전송 보장 X**. Domain·Path·만료 조건과 브라우저의 서드파티 쿠키 제한 등도 확인.
    - **CSRF 방어 보조 수단**: 다른 사이트에서 사용자의 의도와 무관한 요청을 보내는 공격을 줄임. 같은 Site의 악성 서브도메인 등은 별도 고려 필요 → CSRF 토큰·Origin 검증 등과 함께 설계.
    - SameSite를 생략했을 때의 기본 처리·예외는 브라우저별 차이가 있어 명시적으로 설정하는 편이 좋음.
    - **쿠키 속성과 토큰 형식은 별개**. JWT라도 쿠키에 저장하면 SameSite 적용 대상. JS가 `Authorization` 헤더에 직접 넣는 토큰에는 쿠키의 SameSite가 적용되는 것은 X.

  **참고 자료**

    - MDN — SameSite·Secure·HttpOnly
    - MDN — CSRF와 SameSite의 한계
- 복합 UNIQUE 제약을 사용하는 이유는?

  **복합 UNIQUE 제약**
  여러 컬럼의 값 조합이 중복되지 않도록 보장하는 DB 제약. 각 컬럼의 값이 아니라 **조합 전체의 유일성**을 검사.

  이번 워크북에서는 같은 사용자가 같은 영화를 중복으로 즐겨찾기에 등록하는 것을 방지.
  다른 영화를 여러 개 등록하거나, 여러 사용자가 같은 영화를 등록하는 것은 허용.

    ```sql
    UNIQUE KEY uk_favorite_member_movie (member_id, movie_id)
    ```

  | member_id | movie_id | 저장 여부 |
      | --- | --- | --- |
  | 1 | 550 | 가능 |
  | 1 | 155 | 가능 — 같은 사용자, 다른 영화 |
  | 2 | 550 | 가능 — 다른 사용자, 같은 영화 |
  | 1 | 550 | 불가 — 첫 번째 행과 조합 중복 |
    - `UNIQUE(member_id)`만 적용 → 한 사용자가 즐겨찾기를 하나밖에 등록하지 못함.
    - `UNIQUE(movie_id)`만 적용 → 한 영화는 한 사용자만 등록 가능.
    - `UNIQUE(member_id, movie_id)` 적용 → 두 기능을 막지 않고 동일 조합의 중복만 차단.
    - 워크북의 `rating`에도 같은 제약 존재. 사용자 한 명이 같은 영화에 남기는 평점은 하나라는 규칙을 표현.

  **PK·FK와의 차이**

    - **PK**: 각 행을 구별. PK가 다른 두 행에 같은 조합이 저장되는 것까지 막지는 못함.
    - **FK**: 참조하는 회원의 존재를 보장. 같은 회원을 여러 행에서 참조하는 것은 가능.

  **추가로 알아두면 좋은 내용**

    - **중복 조회만으로는 부족**: 두 요청이 동시에 존재 여부 확인 → 둘 다 없다고 판단할 수 있음. `existsBy...`는 사전 안내용, 최종 중복 방지는 DB의 UNIQUE 제약으로 보장.
    - 제약 위반을 그대로 서버 오류로 노출하기보다, 해당 중복 상황을 식별해 `409 Conflict` 등 API에서 정한 응답으로 변환하는 방식 고려.

  **참고 자료**

    - MySQL — UNIQUE 인덱스와 NULL
- 외부 Open API 연동 시 API Key를 프론트/백엔드 중 어디에 두어야 안전한가?

  **비밀로 유지해야 하는 API Key는 백엔드에 보관**.
  프론트는 우리 서버에 요청, 서버가 키를 붙여 외부 API 호출 → 필요한 결과만 프론트에 반환.
  다만 모든 API Key가 비밀 키인 것은 X. 제공자가 브라우저 공개용으로 발급한 키인지 먼저 확인.

  **API Key의 역할**

    - 외부 서비스가 어떤 애플리케이션의 호출인지 식별·인증하는 값.
    - 키에 따라 호출 한도, 허용 기능, 비용 등이 연결될 수 있음 → 유출되면 무단 사용 위험.
    - 우리 서비스의 사용자 로그인 토큰과는 목적이 다름. 외부 API Key가 있다고 우리 사용자 인증까지 되는 것은 X.

  **프론트에서 숨기기 어려운 이유**

    - 브라우저에 내려간 JS와 실제 네트워크 요청은 사용자가 확인 가능.
    - 코드 난독화나 환경 변수 사용만으로 키를 비밀로 유지할 수는 없음.
    - Vite의 `VITE_*` 값은 빌드 결과에 포함. `.env`를 Git에 올리지 않았어도 브라우저에서 사용하는 값은 노출 가능.
    - HTTPS는 전송 중 도청을 막는 수단. 요청을 보내는 사용자 자신의 개발자 도구에서 키를 감춰주는 것은 X.

  **키 종류별 판단**

    - **Secret Key·서버용 토큰**: 백엔드 환경 변수나 Secret Manager 등에 보관. 프론트 번들·응답·로그에 포함 X.
    - **Publishable Key·브라우저용 공개 키**: 제공자가 공개 사용을 전제로 만든 경우 프론트 사용 가능. 예를 들어 Stripe는 공개 키와 비밀 키를 별도로 구분.
    - 이름에 API Key가 붙었다고 일괄 판단하지 말고, 제공자의 문서에서 키 종류·권한·클라이언트 사용 정책 확인.

  **이번 워크북의 TMDB 연동**

    - 워크북은 영화 목록·상세·검색을 프론트가 TMDB에 직접 요청하는 구조. 이 경우 요청에 사용하는 키·토큰은 브라우저에서 확인 가능.
    - TMDB는 `api_key` 쿼리 파라미터 또는 Bearer 토큰으로 애플리케이션 인증 지원. 헤더에 넣었다고 브라우저에서 비밀이 되는 것은 X.
    - **키 비공개가 요구되는 서비스라면** 프론트 → 백엔드 → TMDB로 요청을 중계하는 방식으로 변경 필요. 워크북의 직접 호출 예시와 비밀 키 보호 설계는 구분.

  **추가로 알아두면 좋은 내용**

    - **서버에 두는 것으로 끝 X**: 키를 숨겼어도 중계 API가 무제한 호출되면 비용·쿼터 악용 가능. 필요한 인증·인가, 요청 횟수 제한, 캐싱 등을 함께 고려.
    - 외부 호출 대상과 기능을 서버에서 제한. 사용자가 준 임의의 URL에 비밀 키를 붙여 중계하는 구조는 피할 것.
    - **최소 권한**: 필요한 API와 권한만 부여, 제공자가 지원하면 IP·도메인·쿼터 제한 적용. 공개 사용 키의 제한과 비밀 키 보관은 다른 문제.
    - **유출 대응**: 노출된 키 폐기·재발급, 사용 이력 확인, 새 키로 교체. Git 이력·로그·공유 캡처에도 남지 않도록 관리.