- SOP와 CORS

  # SOP(Same Origin Policy)


  URL 구성 요소 중 프로토콜, 호스트, 포트 번호를 **Origin**이라고함

  ## SOP 정책

  **브라우저**의 기본 보안 정책 중 하나로, 서로 다른 출처(origin) 간의 리소스를 공유를 제한하는 정책

    - 다른 Origin으로 요청을 보내는 것은 가능함
    - 하지만 다른 Origin에서 받은 응답을 JavaScript가 읽는 것은 기본적으로 제한됨
    - 서버가 CORS를 통해 접근을 허용하면 응답을 읽을 수 있음

  **ex)**

    1. `evil.com`에서 `bank.com`으로 요청을 보냄 → 가능
    2. `bank.com` 서버가 요청을 처리하고 응답을 보냄 → 가능
    3. `evil.com`의 JavaScript가 응답 데이터를 읽으려고 함 → SOP에 의해 차단

  ## SOP가 필요한 이유

  악의적인 웹사이트가 사용자의 인증 정보나 개인정보를 무단으로 읽는 것을 방지하기 위해서이다

  아무런 제약이 없다면 악의적인 사용자가 CSRF 혹은 XSS 등의 공격을 통해 다른 사용자의 민감한 정보를 손쉽게 탈취할 수 있게됨

  # CORS (Cross-Origin Resource Sharing)

  위에 언급한 SOP 정책이 자바스크립트에서 다른 서버의 데이터를 가지고 오는 것을 막는 데,
  이를 가능하게 하는 방식이 **CORS 정책을 통해서 서버에 접근이 가능한 다른 서버를 명시해주는 것**

  ## 동작 방식

    - 예비 요청: 브라우저가 서버에 `OPTIONS` 요청을 보내 해당 Origin의 요청이 허용되는지 확인한다
    - 서버 응답: 서버는 `Access-Control-Allow-Origin` 등의 응답 헤더를 통해 허용된 출처와 요청 조건을 알려준다
    - 허용 여부 확인: 브라우저가 응답 헤더를 확인하여 요청이 허용되면 실제 요청을 보내고, 허용되지 않으면 CORS 에러를 발생시킨다

  ## CORS 에러 해결 방법

  서버에서 CORS 허용 설정하기

    - 서버의 응답 헤더에 `Access-Control-Allow-Origin`을 설정하여 접근을 허용할 Origin을 지정
    - 브라우저는 요청한 Origin과 서버가 허용한 Origin을 비교하여 응답 접근 여부를 결정
    - 보안을 위해 `*`(모든 출처 허용)보다는 특정 Origin을 명시하는 것이 좋음

    ```java
    @CrossOrigin(origins = "http://localhost:5173")
    @RestController
    public class MovieController {
        // ...
    }
    ```

  이러면 자동으로

    ```java
    Access-Control-Allow-Origin: http://localhost:5173
    ```

  설정이됨

- Same-Origin과 Same-Site의 차이

  # Same-Origin (동일 출처)


  두 URL의 **프로토콜(Protocol), 호스트(Host), 포트(Port)**가 모두 같으면 Same-Origin이라고 함

    - 하나라도 다르면 Cross-Origin(교차 출처)
    - 주로 SOP와 CORS 정책에서 사용되는 기준

  # Same-Site (동일 사이트)

  두 URL의 프로토콜과 등록 가능한 도메인(Registrable Domain)이 같으면 Same-Site라고 함

    - 서브도메인이 달라도 같은 사이트로 판단할 수 있음
    - 포트 번호는 비교하지 않음
    - 최신 브라우저에서는 프로토콜도 비교함 (Schemeful Same-Site)
    - 주로 **쿠키의 SameSite 속성에서 사용되는 기준**

  ex) 기준 URL: `https://example.com`

  | 비교 URL | Same-Site | 이유 |
        | --- | --- | --- |
  | `https://example.com` | O | 동일 사이트 |
  | `https://api.example.com` | O | 등록 가능한 도메인이 같음 |
  | `https://example.com:8080` | O | 포트는 비교하지 않음 |
  | `http://example.com` | X | 프로토콜이 다름 |
  | `https://other.com` | X | 도메인이 다름 |
- 쿠키의 SameSite 속성

  ## SameSite 속성이란?

  브라우저가 **서로 다른 사이트(Cross-Site) 간 요청에서 쿠키를 전송할지 결정하는 속성**

    - 쿠키는 서버가 브라우저에 저장하도록 설정한 데이터로, 로그인 세션 유지 등에 사용됨
    - SameSite 속성을 통해 다른 사이트에서 요청할 때 쿠키 전송 여부를 제한할 수 있음
    - 주로 CSRF(Cross-Site Request Forgery) 공격을 방지하기 위해 사용됨
        - CSRF: 사용자가 **로그인된 상태에서** 공격자가 강제 요청을 보내 사용자 대신 특정 작업을 수행하게 하는 공격

  ## SameSite 속성의 종류

  SameSite에는 Strict, Lax, None 세 가지 값이 존재함

  ### 1. Strict

  동일 사이트(Same-Site) 요청에서만 쿠키를 전송함

    - 다른 사이트에서 요청하면 쿠키를 전송하지 않음
    - 외부 사이트의 링크를 클릭하여 이동하더라도 쿠키가 전송되지 않음
    - 보안 수준이 가장 엄격함

  ### 2. Lax

  동일 사이트 요청에서는 쿠키를 전송하고, 일부 Cross-Site 요청에서도 쿠키를 전송함

    - 다른 사이트에서 링크를 클릭하여 이동하는 경우 GET 요청에 쿠키 전송 가능
    - 다른 사이트에서 fetch() 등의 API 요청을 보내는 경우 쿠키를 전송하지 않음
    - 많은 브라우저에서 SameSite를 지정하지 않았을 때 기본적으로 적용되는 값

  ### 3. None

  Same-Site와 Cross-Site 요청 모두 쿠키 전송을 허용함

    - 다른 사이트에서 요청하더라도 쿠키를 전송할 수 있음
    - 반드시 Secure 속성과 함께 설정해야 함
        - HTTPS에서만 쿠키 전송 허용 (localhost 예외)
    - 브라우저의 서드파티 쿠키 차단 정책에 따라 실제 전송이 제한될 수 있음

  ## 예시

  bank.com에 로그인한 사용자가 evil.com에 접속했다고 가정함

    1. 사용자가 bank.com에 로그인하여 세션 쿠키를 발급받음
    2. evil.com에서 사용자의 브라우저를 통해 bank.com으로 POST 요청을 보냄
    3. SameSite=Strict 또는 SameSite=Lax로 설정된 쿠키는 해당 Cross-Site POST 요청에 포함되지 않음
    4. 따라서 세션 쿠키를 이용한 일부 CSRF 공격을 방지할 수 있음

  ## 설정 방법

  spring boot에서는 application.properties 파일에 추가하면 설정 가능

    ```java
    server.servlet.session.cookie.same-site=lax
    ```

- 복합 UNIQUE 제약을 사용하는 이유는?

  # 복합 UNIQUE 제약을 사용하는 이유

  ## UNIQUE 제약이란?

  데이터베이스에서 특정 컬럼에 중복된 값이 저장되지 않도록 제한하는 제약 조건

    - 데이터의 중복을 방지하고 무결성을 유지하기 위해 사용됨
    - UNIQUE 제약이 설정된 컬럼에는 중복된 값을 저장할 수 없음

  ## 복합 UNIQUE 제약이란?

  두 개 이상의 컬럼을 조합하여 중복을 방지하는 제약 조건

    - 각 컬럼의 값은 중복될 수 있음
    - 하지만 지정된 컬럼들의 값이 모두 같은 조합은 중복될 수 없음
    - 여러 컬럼의 조합이 유일해야 하는 경우 사용함

  ## 복합 UNIQUE 제약을 사용하는 이유

  각 컬럼의 중복은 허용하면서, 특정 컬럼들의 조합이 중복되는 것을 방지하기 위해 사용

  예를 들어 학생의 수강 신청 정보를 저장한다고 가정함.

  | 학생 ID | 과목 ID | 수강 신청 |
        | --- | --- | --- |
  | 1 | 101 | O |
  | 1 | 102 | O |
  | 2 | 101 | O |
  | 1 | 101 | X (중복) |
    - 한 학생은 여러 과목을 수강할 수 있음
    - 하나의 과목에는 여러 학생이 수강할 수 있음
    - 하지만 동일한 학생이 동일한 과목을 중복 신청하는 것은 방지해야 함

  따라서 (학생 ID, 과목 ID) 조합에 복합 UNIQUE 제약을 설정

  ## 설정 방법

    ```sql
    CREATE TABLE enrollment (
        id BIGINT PRIMARY KEY,
        student_id BIGINT NOT NULL,
        course_id BIGINT NOT NULL,
        **UNIQUE (student_id, course_id)**
    );
    ```

- 외부 Open API 연동 시 API Key를 프론트/백엔드 중 어디에 두어야 안전한가?

  **일반적으로 API Key는 백엔드 서버에 보관하는 것이 안전하다**

  ### 이유

    - 프론트엔드에서 보관하는 경우
        - JavaScript 코드는 브라우저에서 실행되므로 API Key가 노출될 수 있음
        - 개발자 도구의 Network 탭이나 배포된 JS 파일을 통해 확인 가능
        - .env 파일에 저장하더라도 프론트엔드 빌드에 포함되면 노출됨
    - 백엔드에 보관하는 경우
        - API Key를 서버에서 관리하므로 클라이언트에 노출되지 않음
        - 프론트엔드는 백엔드에 요청하고, 백엔드가 API Key를 사용하여 외부 API를 호출함
        - API Key는 환경 변수 등을 통해 관리하는 것이 안전