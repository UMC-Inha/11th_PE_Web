- SOP와 CORS
    
    ## SOP(Same-Origin Policy)란?
    
    SOP는 **동일 출처 정책**으로, 브라우저가 서로 다른 출처의 데이터에 함부로 접근하지 못하게 제한하는 보안 정책이다.
    
    출처(origin)는 다음 세 요소로 결정된다.
    
    ```
    프로토콜 + 호스트 + 포트
    ```
    
    기준 주소가 `http://localhost:5173`이라면 다음과 같이 비교할 수 있다.
    
    | 주소 | 같은 Origin 여부 | 이유 |
    | --- | --- | --- |
    | `http://localhost:5173/books` | 같음 | 프로토콜·호스트·포트 동일 |
    | `http://localhost:8080/books` | 다름 | 포트가 다름 |
    | `https://localhost:5173/books` | 다름 | 프로토콜이 다름 |
    | `http://api.example.com/books` | 다름 | 호스트가 다름 |
    
    SOP가 없다면 악성 웹사이트가 사용자의 로그인 정보를 이용하여 다른 사이트의 개인정보나 금융정보를 읽을 수 있다. 따라서 브라우저는 기본적으로 다른 origin의 응답을 JavaScript가 읽지 못하게 제한한다.
    
    ```
    프론트엔드: http://localhost:5173
    API 서버:   http://localhost:8080
    
    → Origin이 다름
    → SOP에 의해 응답 접근 제한
    ```
    
    ---
    
    ## CORS(Cross-Origin Resource Sharing)란?
    
    CORS는 서버가 **다른 origin의 브라우저 요청을 선택적으로 허용하는 방법**이다.
    
    SOP가 교차 출처 접근을 기본적으로 제한한다면, CORS는 서버가 응답 헤더를 통해 예외적으로 접근을 허용하는 규칙이다.
    
    ```
    Access-Control-Allow-Origin: http://localhost:5173
    ```
    
    브라우저는 이 헤더를 확인한 후 프론트엔드 JavaScript가 응답을 읽을 수 있게 한다.
    
    ```
    1. 브라우저가 다른 origin의 API에 요청
    2. 서버가 CORS 허용 헤더를 응답
    3. 브라우저가 허용된 origin인지 확인
    4. 허용됐다면 JavaScript에 응답 전달
    ```
    
    Spring Boot에서는 다음과 같이 설정할 수 있다.
    
    ```java
    @CrossOrigin(origins = "http://localhost:5173")
    @RestController
    public class BookController {
    }
    ```
    
    전역 설정도 가능하다.
    
    ```java
    @Configuration
    public class WebConfig implements WebMvcConfigurer {
    
        @Override
        public void addCorsMappings(CorsRegistry registry) {
            registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods(
                    "GET",
                    "POST",
                    "PATCH",
                    "DELETE"
                );
        }
    }
    ```
    
    ---
    
    ## Preflight 요청이란?
    
    브라우저는 실제 요청을 보내기 전에 서버가 해당 교차 출처 요청을 허용하는지 `OPTIONS` 요청으로 확인할 수 있다. 이를 **Preflight 요청**이라고 한다.
    
    ```
    브라우저
    → OPTIONS 요청
    → 서버의 CORS 허용 정보 확인
    → 실제 POST·PATCH·DELETE 요청
    ```
    
    서버는 다음과 같은 헤더로 허용 범위를 알려준다.
    
    ```
    Access-Control-Allow-Origin: http://localhost:5173
    Access-Control-Allow-Methods: GET, POST, PATCH, DELETE
    Access-Control-Allow-Headers: Content-Type, Authorization
    ```
    
    모든 교차 출처 요청에서 Preflight가 발생하는 것은 아니다. 단순 요청 조건을 벗어나는 HTTP method나 header를 사용하면 먼저 확인 요청이 발생한다.
    
    ---
    
    ## SOP와 CORS의 관계
    
    | 구분 | SOP | CORS |
    | --- | --- | --- |
    | 의미 | 동일 출처 정책 | 교차 출처 자원 공유 |
    | 목적 | 다른 origin의 응답 접근 제한 | 허용된 origin에 접근 예외 제공 |
    | 적용 주체 | 브라우저 | 서버가 허용 범위를 설정하고 브라우저가 검사 |
    | 기본 방향 | 차단 | 선택적 허용 |
    | 적용 대상 | 브라우저의 JavaScript 요청 | 교차 출처 HTTP 요청 |
- Same-Origin과 Same-Site의 차이
    
    `Same-Origin`과 `Same-Site`는 웹 주소가 서로 같은 범위에 속하는지 판단하는 기준이다. **Same-Origin이 더 엄격하고, Same-Site가 더 넓은 범위**다.
    
    ## Origin이란?
    
    Origin은 다음 세 요소로 구성된다.
    
    ```
    프로토콜 + 호스트 + 포트
    ```
    
    기준 주소가 다음과 같다고 가정한다.
    
    ```
    https://www.example.com:443
    ```
    
    다음 세 요소가 모두 같아야 Same-Origin이다.
    
    | 비교 주소 | Same-Origin 여부 | 이유 |
    | --- | --- | --- |
    | `https://www.example.com/books` | O | 모두 같음 |
    | `http://www.example.com/books` | X | 프로토콜이 다름 |
    | `https://api.example.com/books` | X | 호스트가 다름 |
    | `https://www.example.com:8080/books` | X | 포트가 다름 |
    
    경로는 Origin을 판단하는 기준에 포함되지 않는다.
    
    ```
    https://www.example.com/books
    https://www.example.com/users
    
    → 경로는 다르지만 Same-Origin
    ```
    
    Same-Origin 여부는 브라우저의 SOP와 CORS에서 주로 사용된다.
    
    ---
    
    ## Site란?
    
    Site는 일반적으로 다음 요소를 기준으로 판단한다.
    
    ```
    프로토콜 + 등록 가능한 도메인
    ```
    
    등록 가능한 도메인은 보통 사용자가 직접 등록할 수 있는 도메인 부분을 의미한다.
    
    ```
    www.example.com
    api.example.com
    admin.example.com
    
    → 공통 Site: example.com
    ```
    
    따라서 서브도메인이 달라도 같은 Site가 될 수 있다.
    
    | 비교 주소 | Same-Site 여부 | 이유 |
    | --- | --- | --- |
    | `https://www.example.com` | O | 기준 주소 |
    | `https://api.example.com` | O | 공통 Site가 `example.com` |
    | `https://admin.example.com` | O | 공통 Site가 `example.com` |
    | `https://www.other.com` | X | 등록 가능한 도메인이 다름 |
    | `http://www.example.com` | X | 프로토콜이 다름 |
    
    현재 브라우저에서는 프로토콜까지 포함하는 **Schemeful Same-Site** 기준을 사용하므로 `http`와 `https`는 다른 Site로 판단한다.
    
    ---
    
    ## 핵심 차이
    
    기준 주소를 다음과 같이 두면,
    
    ```
    https://www.example.com
    ```
    
    API 주소가 다음과 같은 경우를 생각할 수 있다.
    
    ```
    https://api.example.com
    ```
    
    두 주소는 다음 관계다.
    
    ```
    호스트가 다름
    → Cross-Origin
    
    등록 가능한 도메인은 example.com으로 같음
    → Same-Site
    ```
    
    즉, **Same-Site이지만 Cross-Origin일 수 있다.**
    
    | 구분 | Same-Origin | Same-Site |
    | --- | --- | --- |
    | 판단 기준 | 프로토콜·호스트·포트 | 프로토콜·등록 가능한 도메인 |
    | 서브도메인 차이 | 다른 Origin | 같은 Site일 수 있음 |
    | 포트 차이 | 다른 Origin | Site 판단에는 일반적으로 영향 없음 |
    | 주요 용도 | SOP, CORS, DOM 접근 | Cookie, CSRF 방어 |
    | 범위 | 좁음 | 넓음 |
- 쿠키의 SameSite 속성
    
    `SameSite`는 **다른 사이트에서 시작된 요청에 쿠키를 포함할지 결정하는 속성**이다. 주로 인증 쿠키가 Cross-Site 요청에 자동으로 전송되는 것을 제한하여 CSRF 공격을 줄이는 데 사용한다.
    
    ```
    Set-Cookie: sessionId=abc123; SameSite=Lax
    ```
    
    ## 왜 필요한가?
    
    쿠키는 브라우저가 조건에 맞는 요청에 자동으로 포함한다.
    
    사용자가 `bank.com`에 로그인해서 인증 쿠키를 가지고 있을 때, 악성 사이트가 다음 요청을 보내게 할 수 있다.
    
    ```
    사용자 → evil.com 접속
    evil.com → bank.com/transfer로 요청
    브라우저 → bank.com의 인증 쿠키를 자동 첨부
    ```
    
    서버가 쿠키만 보고 사용자를 인증하면 사용자가 원하지 않은 요청이 실행될 수 있다. 이를 CSRF라고 한다.
    
    `SameSite`는 이런 Cross-Site 요청에 인증 쿠키가 포함되는 범위를 제한한다. 다만 완전한 CSRF 방어책은 아니므로 CSRF 토큰, Origin 검사 등과 함께 사용할 수 있다. MDN
    
    ---
    
    ## `SameSite=Strict`
    
    쿠키를 설정한 사이트와 **같은 Site에서 시작된 요청에만 쿠키를 전송**한다.
    
    ```
    Set-Cookie: sessionId=abc123; SameSite=Strict
    ```
    
    다른 사이트에서 링크를 클릭해 이동하는 경우에도 쿠키가 전송되지 않을 수 있다.
    
    ```
    google.com
    → 링크 클릭
    → example.com
    
    SameSite=Strict
    → 첫 요청에 쿠키 전송 안 함
    ```
    
    ### 장점
    
    - Cross-Site 요청에 쿠키를 보내지 않아 보안이 가장 엄격하다.
    - CSRF 방어에 유리하다.
    
    ### 단점
    
    - 외부 사이트에서 링크를 눌러 들어왔을 때 로그인 상태가 바로 적용되지 않는 등 사용자 경험이 불편할 수 있다.
    
    ---
    
    ## `SameSite=Lax`
    
    Same-Site 요청에는 쿠키를 전송하고, Cross-Site 요청에는 제한적으로 전송한다.
    
    ```
    Set-Cookie: sessionId=abc123; SameSite=Lax
    ```
    
    Cross-Site 요청이어도 사용자가 링크를 눌러 해당 사이트로 직접 이동하는 **최상위 탐색**이면서 `GET`과 같은 안전한 method라면 쿠키가 전송될 수 있다.
    
    | Cross-Site 요청 | 쿠키 전송 |
    | --- | --- |
    | 다른 사이트의 링크를 클릭해 `GET` 이동 | 가능 |
    | `fetch()`로 API 요청 | 일반적으로 불가능 |
    | `<iframe>` 내부 요청 | 일반적으로 불가능 |
    | `POST`, `PUT`, `DELETE` 요청 | 일반적으로 불가능 |
    
    ```
    google.com
    → example.com 링크 클릭
    → GET 방식의 최상위 페이지 이동
    → 쿠키 전송 가능
    ```
    
    보안과 사용자 경험의 균형이 좋아 일반적인 세션 쿠키에서 많이 사용한다. 일부 브라우저는 `SameSite`를 생략한 쿠키를 `Lax`로 처리하지만, 브라우저별 차이를 줄이려면 명시하는 편이 좋다. MDN
    
    ---
    
    ## `SameSite=None`
    
    Same-Site와 Cross-Site 요청 모두에 쿠키를 전송할 수 있도록 허용한다.
    
    ```
    Set-Cookie: sessionId=abc123; SameSite=None; Secure
    ```
    
    `SameSite=None`을 사용하려면 반드시 `Secure`도 함께 설정해야 한다. 따라서 쿠키는 원칙적으로 HTTPS 요청에서만 전송된다. MDN
    
    다음과 같은 상황에서 필요할 수 있다.
    
    - 서로 다른 Site 간 인증
    - 외부 사이트에 삽입된 `<iframe>`
    - Cross-Site 환경의 API 통신
    - 외부 인증 서비스 연동
    
    Cross-Site 요청에 인증 쿠키가 포함될 수 있으므로 CSRF 방어를 별도로 신경 써야 한다.
    
    ---
    
    ## 비교
    
    | 설정 | Same-Site 요청 | Cross-Site 링크 이동 | Cross-Site API 요청 | 보안 수준 |
    | --- | --- | --- | --- | --- |
    | `Strict` | 전송 | 전송하지 않음 | 전송하지 않음 | 가장 엄격 |
    | `Lax` | 전송 | 안전한 최상위 이동에는 전송 가능 | 일반적으로 전송하지 않음 | 중간 |
    | `None` | 전송 | 전송 | 전송 가능 | 별도 보안 필요 |
    
    ---
    
    ## Same-Origin이 아니라 Same-Site 기준
    
    `SameSite`는 이름 그대로 Origin이 아닌 Site를 기준으로 판단한다.
    
    ```
    프론트엔드: https://www.example.com
    API 서버:   https://api.example.com
    ```
    
    두 주소는 호스트가 다르므로 Cross-Origin이지만, 등록 가능한 도메인과 프로토콜이 같아서 Same-Site다.
    
    ```
    Cross-Origin
    Same-Site
    ```
    
    따라서 `SameSite=Lax` 또는 `Strict`라고 해서 서브도메인 간 요청에서 무조건 쿠키가 차단되는 것은 아니다.
    
    ---
    
    ## Cross-Origin 요청에서 쿠키를 사용할 때
    
    프론트엔드에서 `fetch`로 Cross-Origin 요청을 보낼 경우 쿠키를 포함하도록 설정해야 한다.
    
    ```
    fetch("https://api.example.com/books", {
      credentials: "include",
    });
    ```
    
    서버도 Credential 요청을 허용해야 한다.
    
    ```
    Access-Control-Allow-Origin: https://www.example.com
    Access-Control-Allow-Credentials: true
    ```
    
    이때 쿠키의 `Domain`, `Path`, `Secure`, `SameSite` 조건도 모두 충족해야 실제 요청에 포함된다.
    
    ---
    
    ## 다른 쿠키 속성과의 차이
    
    | 속성 | 역할 |
    | --- | --- |
    | `SameSite` | Cross-Site 요청에 쿠키를 보낼지 결정 |
    | `Secure` | HTTPS 요청에서만 쿠키 전송 |
    | `HttpOnly` | JavaScript에서 쿠키 접근 차단 |
    | `Domain` | 쿠키를 전송할 도메인 범위 지정 |
    | `Path` | 쿠키를 전송할 URL 경로 지정 |
    | `Max-Age`·`Expires` | 쿠키의 유효기간 지정 |
    
    인증 쿠키는 보통 다음과 같이 설정한다.
    
    ```
    Set-Cookie: sessionId=abc123;
                Path=/;
                HttpOnly;
                Secure;
                SameSite=Lax
    ```
    
    정리하면 `SameSite`는 **요청을 보낸 곳이 같은 Site인지에 따라 쿠키 전송 범위를 제한하는 속성**이며, `Strict`, `Lax`, `None` 순으로 Cross-Site 쿠키 전송 허용 범위가 넓어진다.
    
- 복합 UNIQUE 제약을 사용하는 이유는?
    
    복합 `UNIQUE` 제약은 **여러 컬럼의 값 조합이 중복되지 않도록 보장**할 때 사용한다. 각 컬럼은 개별적으로 중복될 수 있지만, 컬럼들을 합친 조합은 한 번만 존재하도록 제한한다.
    
    ```sql
    CREATE TABLE book_like (
        user_id BIGINT NOT NULL,
        book_id BIGINT NOT NULL,
    
        UNIQUE (user_id, book_id)
    );
    ```
    
    위 구조에서는 한 사용자가 여러 책에 좋아요를 누를 수 있고, 하나의 책도 여러 사용자에게 좋아요를 받을 수 있다. 하지만 같은 사용자가 같은 책에 좋아요를 두 번 누르는 것은 허용되지 않는다.
    
    | user_id | book_id | 저장 가능 여부 |
    | --- | --- | --- |
    | 1 | 10 | 가능 |
    | 1 | 20 | 가능 |
    | 2 | 10 | 가능 |
    | 1 | 10 | 불가능 — 조합 중복 |
    
    ### 단일 UNIQUE와의 차이
    
    ```sql
    UNIQUE (user_id)
    ```
    
    이렇게 설정하면 사용자 한 명당 행을 하나만 저장할 수 있어서, 사용자가 여러 책에 좋아요를 누르지 못한다.
    
    ```sql
    UNIQUE (book_id)
    ```
    
    이렇게 설정하면 책 하나당 사용자 한 명만 좋아요를 누를 수 있다.
    
    따라서 다대다 관계의 중간 테이블에서는 다음과 같이 두 컬럼의 **조합**에 제약을 설정해야 한다.
    
    ```sql
    UNIQUE (user_id, book_id)
    ```
    
    ### 복합 PK와의 차이
    
    중간 테이블에서는 복합 `UNIQUE` 대신 복합 기본 키를 사용할 수도 있다.
    
    ```sql
    PRIMARY KEY (user_id, book_id)
    ```
    
    둘 다 조합의 중복을 방지하지만 차이가 있다.
    
    - `PRIMARY KEY`: 행을 대표하는 식별자이며, `NULL`을 허용하지 않는다.
    - `UNIQUE`: 식별자가 아니라 특정 값의 조합이 중복되지 않도록 하는 규칙이다.
    - 테이블에 별도의 `id` 기본 키가 있다면 `(user_id, book_id)`에는 복합 `UNIQUE`를 설정하는 경우가 많다.
    
    ```sql
    CREATE TABLE book_like (
        book_like_id BIGINT PRIMARY KEY AUTO_INCREMENT,
        user_id BIGINT NOT NULL,
        book_id BIGINT NOT NULL,
    
        UNIQUE (user_id, book_id)
    );
    ```
    
    즉, 복합 `UNIQUE` 제약은 애플리케이션 코드의 중복 검사만 믿지 않고, **데이터베이스가 최종적으로 중복 데이터를 차단하게 만들기 위해 사용한다.** 동시에 여러 요청이 들어오는 상황에서도 데이터의 일관성을 지킬 수 있다.
    
- 외부 Open API 연동 시 API Key를 프론트/백엔드 중 어디에 두어야 안전한가?
    
    API Key는 원칙적으로 **백엔드 서버에 저장해야 한다.** 프론트엔드 코드에 API Key를 넣으면 브라우저에 전달되므로 사용자가 개발자 도구, 네트워크 요청 또는 빌드된 JavaScript 파일에서 값을 확인할 수 있다.
    
    ### 안전한 요청 구조
    
    ```
    프론트엔드
        ↓ 우리 백엔드에 요청
    백엔드
        ↓ API Key를 포함해 외부 API 호출
    외부 Open API
    ```
    
    프론트엔드는 API Key를 직접 사용하지 않고 백엔드 API만 호출한다. 백엔드는 서버에 저장된 API Key로 외부 API를 호출한 후 필요한 결과만 프론트엔드에 반환한다.
    
    ### 저장 위치
    
    Spring Boot에서는 API Key를 코드에 직접 작성하지 않고 환경 변수나 별도의 비밀 관리 서비스에 저장한다.
    
    ```yaml
    external-api:
      key: ${EXTERNAL_API_KEY}
    ```
    
    ```java
    @Value("${external-api.key}")
    private String apiKey;
    ```
    
    실제 키는 서버의 환경 변수로 설정한다.
    
    ```
    EXTERNAL_API_KEY=실제_API_Key
    ```
    
    AWS Secrets Manager, Parameter Store, GitHub Actions Secrets 같은 비밀 관리 기능을 사용할 수도 있다. `.env`나 로컬 설정 파일에 키를 저장했다면 Git에 올라가지 않도록 `.gitignore`에 추가해야 한다.
    
    ### 프론트엔드 환경 변수도 안전하지 않은 이유
    
    ```
    VITE_API_KEY=실제_API_Key
    ```
    
    Vite의 `VITE_` 환경 변수는 빌드 과정에서 프론트엔드 JavaScript에 포함된다. 환경 변수 형식으로 관리하더라도 브라우저에 전달되기 때문에 비밀값을 보호할 수 없다.
    
    ### 예외
    
    지도나 결제 SDK처럼 브라우저에서 사용하도록 설계된 **공개용 키**는 프론트엔드에 둘 수 있다. 이 경우에도 다음과 같은 제한을 설정해야 한다.
    
    - 허용 도메인 제한
    - 허용 API 제한
    - 사용량 및 요청 한도 설정
    - 공개용 키와 서버용 비밀 키 분리
    
    따라서 문서에서 `secret key`, `private key`라고 명시된 키는 반드시 백엔드에 저장하고, `publishable key`, `client key`처럼 공개를 전제로 한 키만 프론트엔드에서 사용해야 한다.