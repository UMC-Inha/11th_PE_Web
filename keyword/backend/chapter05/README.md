# chapter05

- SOP와 CORS
    
    ## 1. SOP(Same-Origin Policy)란?
    
    **SOP(동일 출처 정책)**는 웹 브라우저가 사용자의 정보를 보호하기 위해 적용하는 보안 정책이다.
    
    쉽게 말하면, **서로 다른 출처에서 가져온 데이터에 웹페이지가 마음대로 접근하지 못하도록 제한하는 규칙**이다.
    
    예를 들어 사용자가 인터넷 뱅킹 사이트에 로그인한 상태에서 악성 사이트에 접속했다고 가정해 보자.
    
    만약 아무런 보안 제한이 없다면 악성 사이트가 브라우저를 이용해 은행 서버에 요청을 보내고, 사용자의 계좌 정보가 담긴 응답을 읽어 갈 수도 있다.
    
    SOP는 이러한 상황을 방지하기 위해 서로 다른 출처 간의 데이터 접근을 제한한다.
    
    ### 출처(Origin)란?
    
    출처는 다음 세 가지 요소로 결정된다.
    
    - **프로토콜(Protocol)**: `http`, `https`
    - **호스트(Host)**: `localhost`, `example.com`
    - **포트(Port)**: `3000`, `8080` 등
    
    이 세 가지가 모두 같아야 동일 출처(Same-Origin)라고 판단한다.
    
    예를 들어 현재 웹페이지의 주소가 `http://localhost:5500`이라면 다음과 같이 구분된다.
    
    | 비교 대상 | 동일 출처 여부 | 이유 |
    | --- | --- | --- |
    | `http://localhost:5500/home` | O | 프로토콜, 호스트, 포트 동일 |
    | `http://localhost:8080` | X | 포트가 다름 |
    | `https://localhost:5500` | X | 프로토콜이 다름 |
    | `http://example.com:5500` | X | 호스트가 다름 |
    
    즉, 같은 컴퓨터에서 실행 중인 서버라도 포트가 다르면 서로 다른 출처로 판단한다.
    
    ### SOP가 적용되면 어떻게 될까?
    
    프론트엔드가 `http://localhost:5500`에서 실행되고, 백엔드가 `http://localhost:8080`에서 실행된다고 가정해 보자.
    
    프론트엔드에서 다음과 같이 API를 호출할 수 있다.
    
    ```jsx
    fetch("http://localhost:8080/members/nickname/수현");
    ```
    
    하지만 두 서버는 포트가 다르기 때문에 서로 다른 출처이다.
    
    브라우저는 요청을 보낼 수 있지만, 백엔드가 해당 출처의 접근을 허용하지 않으면 JavaScript가 응답 데이터를 읽지 못하도록 차단한다.
    
    따라서 서버가 정상적으로 실행 중이어도 브라우저에서는 CORS 오류가 발생할 수 있다.
    
    ## 2. CORS(Cross-Origin Resource Sharing)란?
    
    **CORS(교차 출처 리소스 공유)**는 서로 다른 출처 사이에서도 서버가 허용한 경우 웹페이지가 응답 데이터를 읽을 수 있도록 하는 방식이다.
    
    SOP가 기본적으로 다른 출처의 데이터 접근을 제한하는 규칙이라면, CORS는 **서버의 허가를 받아 그 제한을 일부 해제하는 방법**이라고 이해하면 된다.
    
    예를 들어 프론트엔드와 백엔드가 서로 다른 포트에서 실행되더라도, 백엔드가 프론트엔드의 출처를 허용하면 정상적으로 API 응답을 사용할 수 있다.
    
    ### CORS는 어떻게 동작할까?
    
    프론트엔드에서 백엔드로 API 요청을 보내는 상황을 생각해 보자.
    
    1. 브라우저가 백엔드에 요청을 보내면서 자신의 출처를 `Origin` 헤더에 담는다.
    2. 백엔드는 해당 출처를 허용하는지 확인한다.
    3. 허용된 출처라면 응답에 `Access-Control-Allow-Origin` 헤더를 포함한다.
    4. 브라우저는 응답 헤더를 확인하고 JavaScript가 응답 데이터에 접근할 수 있도록 허용한다.
    
    예를 들어 백엔드가 다음 헤더를 반환할 수 있다.
    
    ```
    Access-Control-Allow-Origin: http://localhost:5500
    ```
    
    이는 `http://localhost:5500`에서 실행되는 웹페이지가 해당 응답을 읽을 수 있도록 허용한다는 의미이다.
    
    반대로 적절한 CORS 허용 헤더가 없다면 브라우저는 응답을 JavaScript에 전달하지 않는다.
    
    ### Preflight 요청이란?
    
    모든 CORS 요청이 바로 본 요청만 보내는 것은 아니다.
    
    특정 조건에서는 브라우저가 실제 요청 전에 **OPTIONS 메서드로 사전 요청(Preflight Request)**을 보낸다.
    
    이는 서버가 해당 HTTP 메서드나 요청 헤더를 허용하는지 미리 확인하는 과정이다.
    
    예를 들어 JSON 데이터를 전송하는 `POST` 요청에서는 사전 요청이 발생할 수 있다.
    
    다만 단순한 GET 요청 등 일부 요청은 사전 요청 없이 바로 전송된다.
    
    ## 3. SOP와 CORS의 차이
    
    | 구분 | SOP | CORS |
    | --- | --- | --- |
    | 의미 | 동일 출처 정책 | 교차 출처 리소스 공유 |
    | 목적 | 다른 출처의 데이터 접근 제한 | 허용된 출처의 데이터 접근 허용 |
    | 적용 주체 | 웹 브라우저 | 서버의 허용 응답을 브라우저가 확인 |
    | 핵심 역할 | 기본적인 보안 제한 | 필요한 교차 출처 통신 허용 |
    
    두 개념은 서로 반대되는 것이 아니라 함께 동작한다.
    
    **SOP가 기본적으로 접근을 제한하고, CORS는 서버가 허용한 경우에만 교차 출처 응답을 사용할 수 있도록 한다.**
    
    ## 4. Spring Boot에서 CORS 설정하기
    
    5주차 실습에서는 프론트엔드가 `http://localhost:5500`, 백엔드가 `http://localhost:8080`에서 실행되었다.
    
    두 서버의 포트가 달라 서로 다른 출처로 판단되었으며, CORS 설정이 없는 상태에서는 브라우저에서 API 응답을 읽지 못하는 오류가 발생하였다.
    
    이를 해결하기 위해 Spring Boot의 `WebConfig.java`에 다음 설정을 추가하였다.
    
    ```java
    @Configuration
    public class WebConfig implements WebMvcConfigurer {
    
        @Override
        public void addCorsMappings(CorsRegistry registry) {
            registry.addMapping("/**")
                    .allowedOrigins("http://localhost:5500")
                    .allowedMethods("GET", "POST", "PATCH", "DELETE")
                    .allowedHeaders("*");
        }
    }
    ```
    
    각 설정의 의미는 다음과 같다.
    
    - `addMapping("/**")`: 모든 URL 경로에 CORS 설정 적용
    - `allowedOrigins("http://localhost:5500")`: 해당 프론트엔드 출처 허용
    - `allowedMethods(...)`: 허용할 HTTP 메서드 지정
    - `allowedHeaders("*")`: 모든 요청 헤더 허용
    
    설정 후 Spring Boot를 재실행하자 프론트엔드에서 닉네임 중복 확인, 이메일 중복 확인, 회원별 평점 조회 API를 정상적으로 호출할 수 있었다.
    
    ## 5. 정리
    
    - **SOP**는 서로 다른 출처의 웹페이지가 응답 데이터에 마음대로 접근하지 못하도록 제한하는 브라우저 보안 정책이다.
    - **CORS**는 서버가 허용한 다른 출처의 웹페이지에서도 응답 데이터를 사용할 수 있도록 하는 방식이다.
    - 출처는 프로토콜, 호스트, 포트로 결정되며, 하나라도 다르면 서로 다른 출처이다.
    - CORS 오류는 백엔드 서버가 실행되지 않아서 발생하는 오류와 다르다. 서버가 정상적으로 응답하더라도 브라우저가 해당 응답에 대한 JavaScript의 접근을 차단할 수 있다.
    - Spring Boot에서는 `WebMvcConfigurer`를 통해 허용할 출처, HTTP 메서드, 요청 헤더 등을 설정할 수 있다.
- Same-Origin과 Same-Site의 차이
    
    ## 1. Same-Origin(동일 출처)이란?
    
    **Same-Origin은 두 URL의 출처(Origin)가 동일하다는 의미**이다.
    
    출처는 다음 세 가지 요소로 결정된다.
    
    - **프로토콜(Scheme)**: `http`, `https`
    - **호스트(Host)**: `example.com`, `localhost`
    - **포트(Port)**: `3000`, `8080` 등
    
    세 가지가 모두 같아야 Same-Origin으로 판단한다.
    
    예를 들어 현재 웹페이지 주소가 `https://example.com:443`이라고 가정해 보자.
    
    | 비교 대상 | Same-Origin | 이유 |
    | --- | --- | --- |
    | `https://example.com/about` | O | 출처가 동일함 |
    | `https://example.com:443/api` | O | 기본 HTTPS 포트인 443 사용 |
    | `https://api.example.com` | X | 호스트가 다름 |
    | `https://example.com:8080` | X | 포트가 다름 |
    | `http://example.com` | X | 프로토콜이 다름 |
    
    즉, 같은 도메인을 사용하더라도 서브도메인이나 포트가 다르면 서로 다른 출처가 될 수 있다.
    
    브라우저의 SOP(Same-Origin Policy)는 이러한 출처를 기준으로 다른 출처의 응답 데이터에 대한 접근을 제한한다.
    
    ## 2. Same-Site(동일 사이트)란?
    
    **Same-Site는 두 URL이 같은 사이트에 속하는지를 판단하는 개념**이다.
    
    현대 브라우저에서 사용하는 Schemeful Same-Site 기준으로는 일반적으로 다음 두 요소를 비교한다.
    
    - **프로토콜(Scheme)**: `http`, `https`
    - **등록 가능한 도메인(Registrable Domain)**: `example.com` 등
    
    Same-Origin과 달리 **포트는 비교하지 않으며, 서브도메인이 달라도 같은 사이트로 판단할 수 있다.**
    
    예를 들어 현재 웹페이지 주소가 `https://www.example.com`이라고 가정해 보자.
    
    | 비교 대상 | Same-Site | 이유 |
    | --- | --- | --- |
    | `https://www.example.com` | O | 같은 사이트 |
    | `https://api.example.com` | O | 등록 가능한 도메인이 같음 |
    | `https://shop.example.com:8080` | O | 등록 가능한 도메인과 프로토콜이 같음 |
    | `http://www.example.com` | X | 프로토콜이 다름 |
    | `https://other.com` | X | 등록 가능한 도메인이 다름 |
    
    예를 들어 `www.example.com`과 `api.example.com`은 호스트가 다르므로 Same-Origin은 아니지만, 같은 `example.com` 사이트에 속하므로 Same-Site이다.
    
    참고로 `localhost`처럼 일반적인 등록 가능 도메인이 없는 호스트는 별도의 기준으로 처리된다. 같은 `localhost`에서 포트만 다른 경우에는 일반적으로 Same-Site로 판단한다.
    
    ## 3. Same-Origin과 Same-Site 비교
    
    | 구분 | Same-Origin | Same-Site |
    | --- | --- | --- |
    | 의미 | 동일한 출처 | 동일한 사이트 |
    | 프로토콜 비교 | O | O |
    | 호스트 비교 | 전체 호스트 비교 | 등록 가능한 도메인 중심 |
    | 포트 비교 | O | X |
    | 주요 활용 | SOP, CORS | 쿠키의 SameSite 속성 |
    
    핵심적인 차이는 **Same-Origin이 Same-Site보다 더 엄격한 기준**이라는 점이다.
    
    예를 들어 다음 두 주소를 비교해 보자.
    
    - 프론트엔드: `http://localhost:5500`
    - 백엔드: `http://localhost:8080`
    
    두 주소는 프로토콜과 호스트가 같지만 포트가 다르다.
    
    따라서 다음과 같이 판단된다.
    
    - **Same-Origin: X** — 포트가 다르기 때문
    - **Same-Site: O** — 동일한 `localhost` 사이트이며 프로토콜도 같기 때문
    
    즉, **Same-Site라고 해서 반드시 Same-Origin인 것은 아니다.**
    
    ## 4. Same-Origin과 Same-Site는 어디에 사용될까?
    
    ### Same-Origin: SOP와 CORS
    
    브라우저는 SOP를 통해 다른 출처의 응답 데이터에 대한 JavaScript의 접근을 제한한다.
    
    따라서 프론트엔드와 백엔드의 포트가 다르면 Same-Site 관계이더라도 서로 다른 출처이므로 CORS 설정이 필요할 수 있다.
    
    이번 5주차 실습에서도 `localhost:5500`과 `localhost:8080`은 Same-Site이지만 Same-Origin은 아니기 때문에 CORS 설정이 필요했다.
    
    ### Same-Site: 쿠키의 SameSite 속성
    
    쿠키에는 `SameSite`라는 속성이 있다.
    
    이 속성은 요청이 같은 사이트에서 발생했는지, 다른 사이트에서 발생했는지를 기준으로 쿠키 전송을 제한하는 데 사용된다.
    
    대표적으로 다음 세 가지 값이 있다.
    
    - `Strict`: 같은 사이트에서 발생한 요청에만 쿠키를 전송한다.
    - `Lax`: 같은 사이트 요청에 쿠키를 전송하며, 다른 사이트에서의 일부 최상위 페이지 이동에도 쿠키를 전송한다.
    - `None`: 다른 사이트에서 발생한 요청에도 쿠키를 전송할 수 있도록 한다. 일반적으로 `Secure` 속성이 함께 필요하다.
    
    즉, Same-Origin은 주로 **브라우저가 다른 출처의 응답을 읽을 수 있는지**와 관련이 있고, Same-Site는 주로 **쿠키를 어떤 요청에 함께 전송할지**를 판단하는 데 활용된다.
    
    ## 5. 정리
    
    - **Same-Origin**은 프로토콜, 호스트, 포트가 모두 같은 경우이다.
    - **Same-Site**는 일반적으로 프로토콜과 등록 가능한 도메인이 같은 경우이다.
    - Same-Origin은 포트까지 비교하지만 Same-Site는 포트를 비교하지 않는다.
    - Same-Site이더라도 Same-Origin이 아닐 수 있다.
    - SOP와 CORS는 Origin을 기준으로 동작하고, 쿠키의 `SameSite` 속성은 Site를 기준으로 동작한다.
- 쿠키의 SameSite 속성
    
    ## 1. 쿠키(Cookie)란?
    
    **쿠키는 웹사이트가 브라우저에 저장하도록 요청하는 작은 데이터**이다.
    
    HTTP는 기본적으로 각각의 요청을 독립적으로 처리하기 때문에, 서버는 별도의 장치가 없다면 이전 요청의 사용자를 자동으로 기억하지 못한다.
    
    쿠키는 이러한 문제를 해결하는 데 활용된다.
    
    예를 들어 사용자가 웹사이트에 로그인하면 서버는 로그인 상태를 식별하기 위한 세션 ID를 쿠키로 전달할 수 있다.
    
    브라우저는 해당 쿠키를 저장하고, 이후 조건에 맞는 요청을 보낼 때 쿠키를 함께 전송한다.
    
    ```
    Cookie: sessionId=abc123
    ```
    
    서버는 전달받은 세션 ID를 이용하여 어떤 사용자의 요청인지 확인할 수 있다.
    
    단, 쿠키에는 로그인 정보뿐 아니라 사용자 설정 등 다양한 데이터가 저장될 수 있다.
    
    ## 2. SameSite 속성이란?
    
    **SameSite는 쿠키가 같은 사이트(Same-Site) 요청과 다른 사이트(Cross-Site) 요청 중 어떤 상황에서 전송될 수 있는지 제한하는 속성**이다.
    
    쉽게 말하면, 브라우저가 쿠키를 보낼 때 **이 요청이 같은 사이트에서 시작된 것인지**를 확인하는 규칙이다.
    
    예를 들어 사용자가 `bank.com`에 로그인하여 세션 쿠키를 가지고 있다고 가정해 보자.
    
    이때 악성 사이트인 `evil.com`에 접속했는데, 악성 사이트가 브라우저를 이용해 `bank.com`으로 송금 요청을 보낼 수 있다면 문제가 발생할 수 있다.
    
    브라우저가 은행의 로그인 쿠키까지 자동으로 전송하면 서버는 로그인한 사용자의 요청으로 인식할 가능성이 있기 때문이다.
    
    이러한 공격을 **CSRF(Cross-Site Request Forgery, 사이트 간 요청 위조)**라고 한다.
    
    SameSite는 다른 사이트에서 시작된 요청에 쿠키가 자동으로 첨부되는 것을 제한하여 CSRF 위험을 줄이는 데 도움을 준다.
    
    ## 3. SameSite의 세 가지 설정
    
    SameSite에는 `Strict`, `Lax`, `None`이라는 세 가지 주요 값이 있다.
    
    ### 3-1. SameSite=Strict
    
    **Strict는 같은 사이트에서 시작된 요청에만 쿠키를 전송하도록 제한하는 가장 엄격한 설정**이다.
    
    예를 들어 사용자가 `bank.com`에서 다른 페이지로 이동하거나 같은 사이트의 API를 호출하면 쿠키를 전송할 수 있다.
    
    하지만 `google.com`에서 `bank.com`으로 연결되는 링크를 클릭하면 다른 사이트에서 시작된 이동이므로 Strict 쿠키가 전송되지 않는다.
    
    ```
    Set-Cookie: sessionId=abc123; SameSite=Strict; Secure; HttpOnly
    ```
    
    **특징**
    
    - 다른 사이트에서 시작된 요청에 쿠키를 전송하지 않는다.
    - CSRF 위험을 줄이는 데 유리하다.
    - 외부 링크를 통해 사이트에 처음 진입할 때 로그인 상태가 바로 반영되지 않는 등 사용자 경험에 영향을 줄 수 있다.
    
    ### 3-2. SameSite=Lax
    
    **Lax는 같은 사이트 요청에는 쿠키를 전송하고, 다른 사이트에서 시작된 일부 페이지 이동에도 쿠키 전송을 허용하는 설정**이다.
    
    예를 들어 사용자가 `google.com`에서 `bank.com`으로 연결되는 링크를 클릭하는 경우, 일반적인 최상위 페이지 이동인 GET 요청에는 Lax 쿠키가 전송될 수 있다.
    
    반면 다른 사이트에서 시작된 `fetch()` 요청이나 일반적인 POST 폼 제출에는 원칙적으로 Lax 쿠키가 전송되지 않는다.
    
    ```
    Set-Cookie: sessionId=abc123; SameSite=Lax; Secure; HttpOnly
    ```
    
    **특징**
    
    - 같은 사이트 요청에서는 쿠키를 사용할 수 있다.
    - 다른 사이트에서 링크를 클릭해 이동하는 일반적인 상황에서도 쿠키를 사용할 수 있다.
    - 다른 사이트에서 발생하는 많은 요청에 쿠키가 자동으로 첨부되는 것을 방지한다.
    - 보안과 사용자 편의성 사이에서 균형을 제공한다.
    
    참고로 일부 브라우저에서는 SameSite 속성을 생략한 쿠키에 대해 최근 설정된 쿠키의 POST 요청을 예외적으로 허용하는 동작이 있을 수 있다. 이는 명시적으로 `SameSite=Lax`를 지정한 경우와 구별해야 한다.
    
    ### 3-3. SameSite=None
    
    **None은 다른 사이트에서 시작된 요청에도 쿠키를 전송할 수 있도록 허용하는 설정**이다.
    
    예를 들어 서로 다른 사이트에 있는 프론트엔드와 백엔드가 쿠키를 이용해 인증 정보를 주고받아야 하는 상황에서 사용할 수 있다.
    
    ```
    Set-Cookie: sessionId=abc123; SameSite=None; Secure; HttpOnly
    ```
    
    **특징**
    
    - Cross-Site 요청에서도 쿠키를 전송할 수 있다.
    - 일반적으로 `Secure` 속성을 함께 지정해야 한다.
    - 브라우저의 서드파티 쿠키 차단 정책에 따라 실제 전송이 제한될 수 있다.
    - CSRF 공격에 대한 별도의 보호 대책이 중요하다.
    
    여기서 `Secure`는 원칙적으로 HTTPS 연결에서만 쿠키를 전송하도록 하는 속성이고, `HttpOnly`는 JavaScript에서 해당 쿠키에 직접 접근하지 못하도록 제한하는 속성이다.
    
    ## 4. Strict, Lax, None 비교
    
    | 상황 | Strict | Lax | None |
    | --- | --- | --- | --- |
    | 같은 사이트에서 API 호출 | O | O | O |
    | 다른 사이트에서 링크 클릭 후 GET 페이지 이동 | X | O | O |
    | 다른 사이트에서 일반적인 POST 폼 제출 | X | X | O |
    | 다른 사이트에서 `fetch()`로 API 호출 | X | X | O |
    | CSRF 방어에 도움 | 강함 | 강함(일부 예외) | 별도 대책 필요 |
    
    ※ 위 표는 SameSite 속성에 따른 기본적인 쿠키 전송 허용 여부를 나타낸다. 실제 쿠키 전송은 도메인, 경로, Secure, 브라우저 정책, fetch의 credentials 설정 등의 조건도 충족해야 한다.
    
    ## 5. SameSite와 CORS의 차이
    
    SameSite와 CORS는 모두 웹 보안과 관련되어 있지만, 제한하는 대상이 다르다.
    
    | 구분 | SameSite | CORS |
    | --- | --- | --- |
    | 판단 기준 | Same-Site / Cross-Site | Same-Origin / Cross-Origin |
    | 주요 목적 | 요청에 쿠키를 첨부할지 제한 | JavaScript가 다른 출처의 응답을 읽을 수 있는지 제어 |
    | 설정 위치 | 쿠키의 `SameSite` 속성 | 서버의 CORS 응답 헤더 |
    | 관련 보안 문제 | CSRF | 다른 출처의 응답 데이터 접근 제한 |
    
    특히 **SameSite와 CORS는 서로 독립적으로 적용될 수 있다.**
    
    예를 들어 다음 두 주소를 살펴보자.
    
    - 프론트엔드: `http://localhost:5500`
    - 백엔드: `http://localhost:8080`
    
    두 주소는 포트가 다르므로 Cross-Origin이지만, 같은 `localhost`와 프로토콜을 사용하므로 Same-Site이다.
    
    따라서 브라우저에서 API 응답을 읽기 위해 CORS 설정이 필요할 수 있지만, 쿠키의 SameSite 관점에서는 같은 사이트 요청으로 판단된다.
    
    또한 `fetch()`를 사용한 교차 출처 요청에서 쿠키를 보내려면 `credentials` 설정과 서버의 자격 증명 허용 CORS 설정 등이 추가로 필요할 수 있다.
    
    ## 6. 정리
    
    - **쿠키**는 브라우저가 저장하고 조건에 맞는 HTTP 요청에 함께 전송할 수 있는 데이터이다.
    - **SameSite**는 요청이 같은 사이트에서 시작되었는지에 따라 쿠키 전송을 제한하는 속성이다.
    - **Strict**는 같은 사이트 요청에만 쿠키를 전송한다.
    - **Lax**는 같은 사이트 요청과 다른 사이트에서 시작된 일부 최상위 페이지 이동에 쿠키를 전송한다.
    - **None**은 다른 사이트 요청에도 쿠키를 허용하지만, 일반적으로 `Secure` 설정이 필요하고 브라우저 정책의 영향을 받는다.
    - SameSite는 CSRF 위험을 줄이는 데 도움을 주지만, 모든 CSRF 공격을 막는 완전한 방어 수단은 아니다.
    - **CORS는 응답 접근을 제어하고, SameSite는 쿠키 전송을 제어한다.**
- 복합 UNIQUE 제약을 사용하는 이유는?
    
    ## 1. UNIQUE 제약이란?
    
    **UNIQUE 제약 조건**은 데이터베이스 테이블에서 특정 컬럼에 중복된 값이 저장되지 않도록 제한하는 기능이다.
    
    예를 들어 회원 테이블에 이메일이 저장되어 있다고 가정해 보자.
    
    | member_id | email |
    | --- | --- |
    | 1 | aaa@gmail.com |
    | 2 | bbb@gmail.com |
    | 3 | aaa@gmail.com |
    
    만약 `email` 컬럼에 UNIQUE 제약이 없다면 서로 다른 회원이 같은 이메일을 등록할 수 있다.
    
    하지만 이메일에 UNIQUE 제약을 설정하면 동일한 이메일이 중복 저장되는 것을 방지할 수 있다.
    
    ```sql
    ALTER TABLE member
    ADD CONSTRAINT uk_member_email UNIQUE (email);
    ```
    
    이렇게 설정하면 이미 존재하는 이메일을 다시 저장하려고 할 때 데이터베이스에서 오류가 발생한다.
    
    ## 2. 복합 UNIQUE 제약이란?
    
    **복합 UNIQUE 제약(Composite UNIQUE Constraint)**은 하나의 컬럼이 아니라 두 개 이상의 컬럼을 조합하여 중복 여부를 검사하는 기능이다.
    
    중요한 점은 **각 컬럼의 값이 개별적으로 중복되는 것은 허용하지만, 컬럼들의 조합이 완전히 같은 경우는 허용하지 않는다**는 것이다.
    
    예를 들어 영화 평점 서비스의 `rating` 테이블을 살펴보자.
    
    | rating_id | member_id | movie_id | score |
    | --- | --- | --- | --- |
    | 1 | 1 | 100 | 5 |
    | 2 | 1 | 200 | 4 |
    | 3 | 2 | 100 | 3 |
    | 4 | 1 | 100 | 2 |
    
    여기서 다음과 같은 상황을 생각할 수 있다.
    
    - 회원 1이 영화 100에 평점을 등록하는 것은 가능하다.
    - 회원 1이 영화 200에 평점을 등록하는 것도 가능하다.
    - 회원 2가 영화 100에 평점을 등록하는 것도 가능하다.
    - 하지만 회원 1이 영화 100에 평점을 다시 등록하는 것은 중복이다.
    
    따라서 `member_id`와 `movie_id`를 조합하여 UNIQUE 제약을 설정하면 마지막 행과 같은 중복 데이터를 방지할 수 있다.
    
    ## 3. 복합 UNIQUE 제약을 사용하는 이유
    
    ### 3-1. 데이터의 중복 방지
    
    영화 평점 서비스에서는 일반적으로 **한 회원이 하나의 영화에 하나의 평점만 등록하도록 제한**할 수 있다.
    
    복합 UNIQUE 제약을 사용하면 동일한 회원이 같은 영화에 여러 개의 평점을 등록하는 것을 방지할 수 있다.
    
    ### 3-2. 데이터 무결성 유지
    
    데이터 무결성이란 데이터가 정해진 규칙에 맞게 올바른 상태로 유지되는 것을 의미한다.
    
    예를 들어 한 회원이 같은 영화에 평점을 여러 번 등록하면 평균 평점 계산이나 평점 목록 조회에서 의도하지 않은 결과가 발생할 수 있다.
    
    복합 UNIQUE 제약을 설정하면 이러한 중복 데이터가 저장되지 않도록 데이터베이스 수준에서 보장할 수 있다.
    
    ### 3-3. 동시 요청 상황에서도 중복 방지
    
    애플리케이션에서 평점 등록 전에 중복 여부를 확인하는 로직을 작성할 수도 있다.
    
    하지만 두 요청이 거의 동시에 발생하면 두 요청 모두 중복 데이터가 없다고 판단한 뒤 저장을 시도할 수 있다.
    
    이때 데이터베이스에 복합 UNIQUE 제약이 설정되어 있다면, 두 요청 중 하나가 먼저 저장된 후 동일한 조합을 저장하려는 다른 요청은 제약 조건 위반으로 실패한다.
    
    즉, 애플리케이션의 중복 확인 로직만 사용하는 것보다 데이터베이스 수준에서 중복을 방지하는 것이 안전하다.
    
    ## 4. JPA에서 복합 UNIQUE 제약 설정하기
    
    5주차 영화 평점 서비스에서는 `Rating` Entity에 `@Table`의 `uniqueConstraints` 속성을 사용하여 복합 UNIQUE 제약을 설정할 수 있다.
    
    ```java
    @Entity
    @Table(
        name = "rating",
        uniqueConstraints = {
            @UniqueConstraint(
                name = "uk_rating_member_movie",
                columnNames = {"member_id", "movie_id"}
            )
        }
    )
    public class Rating {
    
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long ratingId;
    
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "member_id", nullable = false)
        private Member member;
    
        @Column(name = "movie_id", nullable = false)
        private Long movieId;
    }
    ```
    
    위 코드에서 핵심은 다음 부분이다.
    
    ```java
    @UniqueConstraint(
        name = "uk_rating_member_movie",
        columnNames = {"member_id", "movie_id"}
    )
    ```
    
    - `name`: UNIQUE 제약 조건의 이름
    - `columnNames`: 중복 여부를 검사할 컬럼들의 조합
    
    이를 SQL로 표현하면 다음과 같다.
    
    ```sql
    ALTER TABLE rating
    ADD CONSTRAINT uk_rating_member_movie
    UNIQUE (member_id, movie_id);
    ```
    
    이렇게 설정하면 동일한 `(member_id, movie_id)` 조합이 중복 저장되지 않는다.
    
    참고로 JPA의 `@UniqueConstraint`는 테이블 스키마 생성 시 제약 조건을 정의하는 데 사용된다. 이미 생성된 테이블에서 `ddl-auto: validate`를 사용한다면 이 어노테이션만 추가한다고 기존 데이터베이스에 제약 조건이 자동으로 생성되지는 않으므로 실제 DB에도 해당 제약이 설정되어 있어야 한다.
    
    ## 5. 일반 UNIQUE와 복합 UNIQUE의 차이
    
    | 구분 | 일반 UNIQUE | 복합 UNIQUE |
    | --- | --- | --- |
    | 검사 대상 | 하나의 컬럼 | 두 개 이상의 컬럼 조합 |
    | 중복 판단 기준 | 해당 컬럼의 값 | 지정한 컬럼들의 조합 |
    | 사용 예시 | 회원 이메일 중복 방지 | 회원별 동일 영화 평점 중복 방지 |
    | SQL 예시 | `UNIQUE(email)` | `UNIQUE(member_id, movie_id)` |
    
    복합 UNIQUE 제약에서 `member_id`와 `movie_id`에 각각 UNIQUE 제약을 설정하면 안 된다.
    
    그렇게 하면 한 회원이 여러 영화에 평점을 등록하거나 여러 회원이 같은 영화에 평점을 등록하는 것까지 제한되기 때문이다.
    
    따라서 두 컬럼을 개별적으로 제한하는 것이 아니라 **두 컬럼의 조합을 하나의 UNIQUE 제약으로 설정**해야 한다.
    
    ## 6. 정리
    
    - **UNIQUE 제약**은 특정 컬럼의 중복 데이터를 방지한다.
    - **복합 UNIQUE 제약**은 여러 컬럼의 조합이 중복되는 것을 방지한다.
    - 개별 컬럼의 값은 중복될 수 있지만, 지정된 컬럼 조합이 완전히 같으면 저장할 수 없다.
    - 데이터의 중복을 방지하고 무결성을 유지하는 데 사용한다.
    - 애플리케이션에서 중복 여부를 확인하는 것만으로는 방지하기 어려운 동시 요청 상황에서도 데이터베이스 수준에서 중복을 막을 수 있다.
    - 영화 평점 서비스에서는 `UNIQUE(member_id, movie_id)`를 통해 한 회원이 같은 영화에 평점을 중복 등록하지 못하도록 제한한다.
- 외부 Open API 연동 시 API Key를 프론트/백엔드 중 어디에 두어야 안전한가?
    
    ## 1. API Key란?
    
    **API Key는 외부 API 서비스를 이용할 때 요청을 보내는 애플리케이션을 식별하거나 인증하기 위해 사용하는 문자열**이다.
    
    예를 들어 날씨 API, 지도 API, 영화 정보 API 등의 외부 서비스를 이용하려면 서비스 제공자로부터 API Key를 발급받아야 하는 경우가 있다.
    
    외부 API 서버는 전달받은 API Key를 확인하여 요청을 처리하거나 사용량을 관리한다.
    
    ```
    GET /weather?city=Seoul&apiKey=abc123
    ```
    
    위 예시에서 `abc123`이 API Key에 해당한다.
    
    API Key가 외부에 노출되면 다른 사람이 해당 키를 이용해 API를 호출할 수 있으며, 서비스에 따라 요청 한도 초과나 예상하지 못한 비용이 발생할 수 있다.
    
    따라서 **비밀로 관리해야 하는 API Key는 외부에 노출되지 않도록 보호해야 한다.**
    
    ## 2. 프론트엔드에 API Key를 저장하면 위험한 이유
    
    프론트엔드는 사용자의 브라우저에서 실행되는 영역이다.
    
    HTML, CSS, JavaScript 등의 코드는 브라우저에 전달되므로 사용자가 개발자 도구 등을 통해 확인할 수 있다.
    
    예를 들어 JavaScript 코드에 API Key를 직접 작성했다고 가정해 보자.
    
    ```jsx
    const API_KEY = "abc123";
    
    fetch(`https://api.example.com/data?apiKey=${API_KEY}`);
    ```
    
    이 경우 API Key는 브라우저에 전달되기 때문에 다른 사람이 개발자 도구의 Sources 또는 Network 탭 등을 통해 확인할 수 있다.
    
    또한 프론트엔드 프로젝트의 `.env` 파일에 API Key를 저장하더라도, 빌드 과정에서 해당 값이 브라우저용 JavaScript에 포함된다면 외부에 노출될 수 있다.
    
    즉, **프론트엔드의 환경 변수에 저장했다고 해서 비밀 정보가 안전하게 보호되는 것은 아니다.**
    
    ## 3. 백엔드에 API Key를 저장하는 것이 안전한 이유
    
    백엔드는 서버에서 실행되며, 일반 사용자에게 서버의 소스 코드나 환경 변수가 직접 전달되지 않는다.
    
    따라서 비밀 API Key는 프론트엔드가 아니라 백엔드에서 관리하는 것이 안전하다.
    
    외부 API를 호출할 때는 다음과 같은 구조를 사용하는 것이 좋다.
    
    1. 사용자가 프론트엔드에서 데이터를 요청한다.
    2. 프론트엔드가 자신의 백엔드 서버에 요청을 보낸다.
    3. 백엔드가 서버에 저장된 API Key를 사용하여 외부 Open API를 호출한다.
    4. 외부 API 서버가 백엔드에 응답한다.
    5. 백엔드가 필요한 데이터만 프론트엔드에 반환한다.
    
    이렇게 하면 프론트엔드는 API Key를 알 필요가 없으며, 외부 API를 호출할 때 필요한 비밀 정보를 백엔드에서 관리할 수 있다.
    
    단, 백엔드에 저장하더라도 API Key를 로그나 응답 데이터에 포함하지 않도록 주의해야 한다.
    
    ## 4. Spring Boot에서 API Key를 안전하게 관리하는 방법
    
    Spring Boot에서는 API Key를 소스 코드에 직접 작성하기보다 **환경 변수(Environment Variable)** 또는 별도의 비밀 정보 관리 시스템을 사용하는 것이 좋다.
    
    예를 들어 외부 영화 정보 API를 호출한다고 가정해 보자.
    
    ### 4-1. 환경 변수 설정
    
    서버 실행 환경에 다음과 같이 API Key를 등록한다.
    
    ```
    MOVIE_API_KEY=발급받은_API_KEY
    ```
    
    ### 4-2. application.yaml에서 환경 변수 참조
    
    ```yaml
    external:
      movie:
        api-key: ${MOVIE_API_KEY}
    ```
    
    `${MOVIE_API_KEY}`는 실행 환경에 등록된 환경 변수의 값을 가져온다는 의미이다.
    
    따라서 `application.yaml` 파일에 실제 API Key를 직접 작성하지 않아도 된다.
    
    ### 4-3. Spring Boot 코드에서 API Key 사용
    
    ```java
    @Service
    public class MovieApiService {
    
        @Value("${external.movie.api-key}")
        private String apiKey;
    
        // 외부 API 호출 시 apiKey 사용
    }
    ```
    
    위와 같이 작성하면 Spring Boot가 환경 변수에서 가져온 값을 주입하여 외부 API 호출에 사용할 수 있다.
    
    이때 API Key를 프론트엔드 응답에 포함하거나 로그에 출력하지 않도록 주의해야 한다.
    
    ## 5. API Key 관리 시 주의할 점
    
    ### 5-1. GitHub에 API Key를 올리지 않기
    
    API Key를 코드에 직접 작성한 상태로 GitHub에 Push하면 다른 사람이 키를 확인할 수 있다.
    
    따라서 실제 API Key는 소스 코드와 분리하여 관리해야 한다.
    
    이미 GitHub에 노출된 경우에는 파일에서 삭제하는 것만으로 충분하지 않으며, 해당 키를 폐기하거나 재발급받는 것이 안전하다.
    
    ### 5-2. .env 파일 관리하기
    
    로컬 개발 환경에서 `.env` 파일을 사용하는 경우, 실제 API Key가 들어 있는 파일이 Git에 올라가지 않도록 `.gitignore`에 등록해야 한다.
    
    ```
    .env
    .env.local
    ```
    
    단, `.gitignore`는 아직 Git이 추적하지 않는 파일을 제외하는 기능이므로 이미 커밋된 비밀 정보까지 보호해 주지는 않는다.
    
    ### 5-3. API Key의 권한 제한하기
    
    API 제공자가 지원한다면 API Key에 필요한 최소 권한만 부여하고, 사용량 제한이나 호출 가능한 IP 주소 등의 제한을 설정하는 것이 좋다.
    
    ### 5-4. 공개용 API Key와 비밀 API Key 구분하기
    
    모든 API Key가 반드시 비밀 정보인 것은 아니다.
    
    일부 지도 SDK 등은 브라우저에서 사용하도록 설계된 공개용 키를 제공한다.
    
    이러한 키는 프론트엔드에서 사용할 수 있지만, 제공자가 지원하는 도메인 제한이나 사용량 제한 등을 적용해야 한다.
    
    반면 비밀 API Key나 관리자 권한을 가진 키는 프론트엔드에 노출해서는 안 된다.
    
    ## 6. 프론트엔드와 백엔드 비교
    
    | 구분 | 프론트엔드 | 백엔드 |
    | --- | --- | --- |
    | 실행 위치 | 사용자 브라우저 | 서버 |
    | 코드 노출 | 사용자가 확인 가능 | 일반 사용자에게 직접 전달되지 않음 |
    | 비밀 API Key 저장 | 부적절 | 권장 |
    | 환경 변수의 비밀 유지 | 브라우저에 포함되면 노출됨 | 서버에서 관리 가능 |
    | 외부 API 호출 | 공개용 키를 사용하는 경우 등에 적합 | 비밀 키가 필요한 API에 적합 |
    
    ## 7. 정리
    
    - API Key는 외부 API 서비스를 이용할 때 사용하는 식별 또는 인증 정보이다.
    - 비밀 API Key를 프론트엔드 코드에 작성하면 브라우저 개발자 도구 등을 통해 노출될 수 있다.
    - **비밀 API Key는 백엔드에서 관리하고, 프론트엔드는 백엔드를 통해 외부 API 데이터를 요청하는 방식이 안전하다.**
    - Spring Boot에서는 API Key를 환경 변수로 관리하고 `application.yaml`에서 참조할 수 있다.
    - 실제 API Key를 GitHub에 업로드하지 않도록 주의해야 한다.
    - 브라우저 사용을 전제로 제공되는 공개용 API Key는 예외적으로 프론트엔드에서 사용할 수 있지만, 제공자가 지원하는 사용 제한을 적용해야 한다.
