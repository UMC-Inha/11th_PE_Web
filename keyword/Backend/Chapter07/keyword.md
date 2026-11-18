- 인증(Authentication)과 인가(Authorization)

  **인증(Authentication)**

  요청자가 누구인지 확인하는 과정. 로그인에서는 이메일·비밀번호를 확인하고, 이후 보호된 요청에서는 토큰을 검증해 요청자 식별.

  **인가(Authorization)**

  확인된 요청자가 해당 자원에 접근하거나 동작을 수행할 수 있는지 판단하는 과정. 이번 워크북에서는 “이 평점을 작성한 회원이 맞는가?”를 검사.

  | 구분 | 인증 | 인가 |
      | --- | --- | --- |
  | 확인 대상 | 요청자의 신원 | 요청한 행동의 권한 |
  | 이번 실습 | 비밀번호 확인, JWT 검증 | 평점 작성자와 로그인 회원 비교 |
  | 처리 위치 | 로그인 Service·인증 인터셉터 | 평점 Service |
  | 대표 실패 | 토큰 없음·위조·만료 → 401 | 남의 평점 수정·삭제 → 403 |

  ⇒ 로그인 성공 = 모든 데이터에 접근 가능 X. 정상 토큰이어도 남의 평점은 수정 불가.

    ```java
    
    if (!rating.getMember().getMemberId().equals(memberId)) {
        throw new ApiException(HttpStatus.FORBIDDEN, "RATING403_1",
                "본인이 작성한 평점만 수정하거나 삭제할 수 있습니다.");
    }
    ```

  memberId는 클라이언트가 적은 값이 아니라, 서버가 검증한 토큰에서 꺼낸 값 사용.

  **추가 핵심 정리**

    - 인증은 로그인할 때만 한 번 수행하는 작업 X. 이후 API에서도 현재 요청의 인증 정보가 유효한지 확인.
    - 역할 기반 인가: USER·ADMIN 등 역할로 판단. 소유권 기반 인가: 같은 USER라도 본인 데이터인지 판단. 둘은 별도 기준.
    - URL의 memberId나 ratingId를 바꿀 수 있다는 이유로 권한까지 생기는 것은 X. 대상 조회와 별개로 서버의 접근 권한 검사 필요.
    - 프론트에서 수정 버튼을 숨기는 것은 UI 처리. 직접 API를 호출하는 경우도 있으므로 서버에서 인가 검사 유지.
    - Spring Security를 사용하는 구조에서는 인증 정보를 `Authentication`·`SecurityContext`로 관리. 이번 워크북은 인터셉터와 요청 속성으로 흐름을 먼저 구현.

  Spring Security — 인증 구조
  Spring Security — 인가 구조

- 해시와 salt, bcrypt

  **해시(Hash)**

  입력값을 일정한 규칙으로 변환한 값. 같은 알고리즘·같은 입력이면 같은 결과지만, 결과에서 원문을 복호화하는 기능은 없음.

    - 인코딩: 표현 방식 변경, 디코딩 가능. Ex) Base64URL
    - 암호화: 키로 내용을 보호, 복호화 가능
    - 해시: 원문을 복원하기 위한 방식 X. 비밀번호는 후보 입력값이 일치하는지 검증

  해시라고 무조건 비밀번호 저장에 적합한 것은 X. SHA-256처럼 빠른 해시만 사용하면 공격자도 많은 후보를 빠르게 계산 가능.

  **salt**

  비밀번호마다 함께 사용하는 무작위 값. 같은 비밀번호라도 salt가 다르면 저장된 해시가 달라짐 → 미리 계산한 해시 표를 그대로 재사용하기 어려움.

  bcrypt는 salt를 자동 생성하고, 알고리즘·cost·salt·해시 결과를 하나의 문자열에 포함. salt 자체는 비밀키가 아니므로 해시와 함께 저장 가능.

  **bcrypt**

  비밀번호 저장용으로 계산 비용을 조절할 수 있는 단방향 해시 방식.

    - cost 10과 11의 차이는 반복 횟수 1회 차이 X
    - cost가 1 증가하면 계산 비용은 대략 2배
    - cost↑ → 대입 공격 비용↑, 서버의 로그인 처리 시간도↑

  **Spring에서 확인하는 방법**

    ```java
    String hash = passwordEncoder.encode(request.password()); // 가입 시 저장
    
    boolean matched = passwordEncoder.matches(
            request.password(),
            member.getPassword()
    ); // 로그인 시 비교
    ```

  `matches(입력 비밀번호, 저장된 해시)` 순서. 저장된 값 안의 salt·cost를 사용하므로 원문 복원 없이 일치 여부 확인.

  매번 salt가 달라지기 때문에 `encode(입력값).equals(저장된 해시)`로 비교하면 X.

  **추가 핵심 정리**

    - 비밀번호 해시가 유출되어도 후보를 대입하는 공격은 가능. “단방향이므로 유출돼도 안전”이라고 단정하면 X.
    - bcrypt 입력은 72바이트 경계에 주의. 글자 수와 바이트 수는 다르며, 초과 입력의 처리 방식은 구현별 확인 필요.
    - 평문 비밀번호와 해시는 응답 DTO에서 제외하고 로그에도 남기지 않도록 처리.
    - JWT 서명용 비밀키와 salt는 다른 개념. 비밀키는 토큰 위조 방지를 위한 비밀값, salt는 비밀번호별 해시를 다르게 만드는 값.

  Spring Security — Password Storage

- JWT (Header / Payload / Signature, Claim)

  **JWT(JSON Web Token)**

  클레임을 JSON으로 표현해 전달하는 토큰 형식. 이번 워크북은 서명된 JWT(JWS)를 Access Token으로 사용.

    ```
    Base64URL(Header).Base64URL(Payload).Signature
    ```

  | 구성 | 내용 | 예시 |
      | --- | --- | --- |
  | Header | 서명 알고리즘·토큰 타입 등 | alg: HS256, typ: JWT |
  | Payload | 토큰에 담긴 클레임 | sub, email, iat, exp |
  | Signature | 헤더·페이로드의 변경 여부를 검증하는 값 | HMAC 서명 |

  클레임(Claim): 토큰에 담는 이름·값 쌍. JWT는 인증 정보만을 위한 형식은 아니지만, 이번에는 회원 식별과 만료 정보를 담는 데 사용.

  **자주 보는 클레임**

    - `sub`(subject): 토큰이 가리키는 주체. 워크북에서는 memberId
    - `iat`(issued at): 발급 시각
    - `exp`(expiration): 만료 시각
    - `nbf`(not before): 사용 가능해지는 시각
    - `iss`(issuer): 발급자
    - `aud`(audience): 토큰을 사용할 대상
    - `email`: 워크북에서 추가한 사용자 정의 클레임

  시각 클레임은 보통 Unix epoch 기준 초 단위의 NumericDate 사용. 모든 클레임이 항상 필수인 것은 아니므로, 서비스가 요구하는 항목과 검증 조건을 정해야 함.

  **서명과 암호화의 차이**

  이 워크북의 Header·Payload는 Base64URL 인코딩 → 비밀키 없이도 읽을 수 있음. Signature는 내용을 숨기는 것이 아니라 위조·변경을 검출하는 역할.

  ⇒ Payload 디코딩 성공 ≠ 유효한 토큰. 서명·만료 검증을 통과한 뒤에만 회원 정보로 사용.

  **워크북의 JJWT 검증 코드 일부**

    ```java
    return Jwts.parser()
            .verifyWith(secretKey)
            .clockSkewSeconds(60)
            .build()
            .parseSignedClaims(token);
    ```

  검증 후 `getPayload().getSubject()`에서 memberId 추출. 만료는 `ExpiredJwtException`, 서명·형식 오류 등은 `JwtException` 계열로 구분해 실패 응답 구성.

  **추가 핵심 정리**

    - HS256은 최소 256비트(32바이트) 키 필요. 글자 수와 바이트 수는 별개이며, 길이뿐 아니라 충분히 무작위인 키 사용이 중요.
    - HMAC은 발급·검증에 같은 비밀키 사용. 서명 알고리즘에는 공개키·개인키를 사용하는 방식도 존재.
    - 토큰의 alg 값을 무조건 신뢰하는 것은 X. 서버가 허용한 알고리즘·키와 발급자·대상 등 서비스 정책에 맞게 검증.
    - JWT를 사용해도 회원 상태·권한·소유권 DB 조회가 사라지는 것은 X. 토큰 발급 후 회원 탈퇴·권한 변경을 어떻게 반영할지도 별도 설계.
    - 짧은 유효시간은 탈취 토큰의 사용 가능 시간을 제한. 브라우저에서 토큰만 지워도 이미 유출된 토큰이 즉시 무효화되는 것은 X.
    - 워크북은 `clockSkewSeconds(60)`으로 시간 오차 60초 허용. 만료를 60초로 설정해도 발급 1분 직후에는 허용될 수 있음 → 만료 시각 + 허용 오차 이후에 테스트하거나, 실험 시 오차 설정도 함께 확인.

  RFC 7519 — JWT와 Claims
  JJWT 0.12.6 — 생성·검증·시간 오차
  RFC 8725 — JWT 검증 시 주의점

- Bearer 인증과 Authorization 헤더

  **Authorization 헤더**

  요청의 인증 정보를 전달하는 HTTP 헤더. 이름은 Authorization이지만, 이 헤더가 있다는 것만으로 인가까지 완료되는 것은 X.

  **Bearer 인증**

  토큰을 소지한 사람이 그 토큰을 제시해 접근하는 방식. 별도의 소유 증명 없이 토큰 자체가 자격 증명 역할 → 탈취되면 만료 전까지 악용될 수 있음.

    ```
    GET /members/me HTTP/1.1
    Host: localhost:8080
    Authorization: Bearer <accessToken>
    ```

  `Bearer`는 인증 방식, 그 뒤가 토큰. 꺾쇠괄호는 설명용 표기이며 실제 요청에는 토큰 문자열만 입력.

    - JWT: 토큰의 형식
    - Bearer: 토큰을 제시하는 인증 방식
    - Authorization: 그 인증 정보를 싣는 헤더

  ⇒ JWT와 Bearer는 같은 말 X. Bearer 토큰이 반드시 JWT일 필요도 없음.

    ```java
    String header = request.getHeader(HttpHeaders.AUTHORIZATION);
    Long memberId = jwtUtil.getMemberId(
            header.substring(BEARER_PREFIX.length())
    );
    ```

  워크북 코드 일부. 실제 순서는 헤더 존재·Bearer 접두사 확인 → 접두사 제거 → JWT 검증 → memberId 사용. 검증 전에 내용을 읽고 신뢰하면 X.

  Postman에서는 Authorization 탭 → Bearer Token 선택 → Token 칸에 토큰만 입력

  **추가 핵심 정리**

    - 서버가 토큰을 발급했다고 이후 요청에 자동 첨부되는 것은 X. 클라이언트가 보호된 요청마다 전송.
    - URL 쿼리로 토큰을 보내면 방문 기록·로그 등에 남을 수 있음 → 헤더 사용.
    - 운영 환경에서는 HTTPS로 전송 구간 보호. JWT 서명만으로 네트워크의 도청까지 막는 것은 X.
    - 헤더로 토큰을 보내더라도 CORS 규칙은 그대로 적용. 브라우저의 교차 출처 요청에서 Authorization 헤더는 preflight를 유발할 수 있음.
    - 토큰 원문은 비밀번호처럼 자격 증명에 해당하므로 로그·공개 저장소 등에 노출되지 않도록 관리.

  RFC 6750 — Bearer Token Usage
  MDN — Authorization
  MDN — CORS와 Authorization

- HandlerInterceptor / Guard

  **HandlerInterceptor**

  Spring MVC에서 컨트롤러 실행 전후에 공통 처리를 넣는 인터페이스. 인증 검사·요청 로그 등 여러 컨트롤러에서 반복되는 처리에 활용.

  Servlet Filter가 DispatcherServlet 바깥에서 요청을 처리한다면, Interceptor는 Spring MVC가 선택한 핸들러의 실행 과정에 참여.

  | 메서드 | 실행 시점 | 용도 |
      | --- | --- | --- |
  | preHandle | 컨트롤러 실행 전 | 토큰 검사, 통과·거절 판단 |
  | postHandle | 컨트롤러 정상 실행 후 | 후처리 |
  | afterCompletion | 요청 처리 완료 후 | 자원 정리·로그 등 |

  `preHandle`에서 true 반환 → 다음 처리로 진행. false 반환 → 이후 실행 중단. 예외를 던져 실패 응답으로 전환하는 방식도 가능.

  **워크북의 인증 흐름**

  요청 → AuthInterceptor.preHandle → Bearer 토큰 추출 → JwtUtil 검증 → 요청 속성에 memberId 저장 → Controller → Service의 소유권 검사

    ```java
    Long memberId = jwtUtil.getMemberId(
            header.substring(BEARER_PREFIX.length())
    );
    request.setAttribute(MEMBER_ID, memberId);
    return true;
    ```

  컨트롤러에서는 다음 파라미터로 값을 전달받는 구조.

    ```java
    @RequestAttribute(AuthInterceptor.MEMBER_ID) Long memberId
    ```

  `@RequestAttribute`는 클라이언트가 보낸 쿼리 파라미터가 아니라, 서버 내부에서 요청에 저장한 속성을 읽음.

  **등록과 적용 범위**

    - `WebMvcConfigurer.addInterceptors`에서 등록해야 요청에 적용.
    - `addPathPatterns`: 적용할 경로
    - `excludePathPatterns`: 로그인·회원가입 등 공개 경로 제외
    - 경로 제외만 지정하면 같은 경로의 다른 HTTP 메서드에도 영향을 줄 수 있음 → 공개 범위를 좁게 설정.
    - CORS preflight의 OPTIONS는 토큰 없이 들어올 수 있으므로, 실제 API의 인증 검사와 구분.

  **추가 핵심 정리**

    - 인증 인터셉터를 통과해도 남의 평점 수정 권한까지 생기는 것은 X. 데이터 소유권은 Service에서 검사.
    - 요청 속성은 그 요청 안에서만 전달되는 값. 서버 전체에 로그인 상태를 보관하는 저장소는 X.
    - 선택 미션의 `@LoginMember`는 ArgumentResolver로 요청 속성을 컨트롤러 파라미터에 전달하는 코드 정리. 토큰 검증 자체를 대신하지 않음.
    - 실서비스의 보안 계층은 Spring Security의 Filter Chain 등으로 구성하는 것이 Spring 공식 권장 방향. 이번 실습에서는 Interceptor로 공통 인증 흐름을 학습.

  Spring MVC — Interceptor 등록과 보안 계층 주의점
  Spring — HandlerIntercept

- 401 Unauthorized와 403 Forbidden의 차이

  **401 Unauthorized**

  대상 API에 필요한 유효한 인증 정보가 없는 상태. 이름의 Unauthorized 때문에 인가 실패로 혼동하기 쉽지만, 이번 토큰 인증에서는 요청자의 신원을 확인할 수 없는 경우.

  **403 Forbidden**

  요청은 이해했지만 수행을 거절하는 상태. 이번 실습에서는 인증은 통과했으나 평점 소유권이 없는 경우.

  | 상황 | HTTP 상태 | 워크북 code |
      | --- | --- | --- |
  | 로그인 정보 불일치 | 401 | AUTH401_1 |
  | 토큰 없음 | 401 | AUTH401_2 |
  | 토큰 위조·형식 오류 | 401 | AUTH401_3 |
  | 토큰 만료 | 401 | AUTH401_4 |
  | 다른 회원의 평점 수정·삭제 | 403 | RATING403_1 |
  | 대상 평점 없음 | 404 | RATING404_1 |

  ⇒ 토큰이 없어서 거절되는 것과, 정상 토큰이지만 남의 데이터라 거절되는 것은 다른 문제.

    ```java
    // 인증된 요청이지만 해당 평점의 작성자가 아닌 경우
    throw new ApiException(HttpStatus.FORBIDDEN, "RATING403_1",
            "본인이 작성한 평점만 수정하거나 삭제할 수 있습니다.");
    ```

  여기서 `ApiException`은 워크북의 사용자 정의 예외 이름. `ProjectException` + 에러 코드 enum 구조도 상태·code·message를 전달하는 같은 역할로 활용 가능.

  HTTP 상태는 실패의 큰 종류, JSON의 code는 같은 상태 안에서 구체적인 사유 구분. 토큰 없음과 만료는 둘 다 401이지만 code·message는 다르게 반환.

  **추가 핵심 정리**

    - 401이면 재로그인 등 인증 정보 갱신을 검토. 403은 같은 계정으로 다시 로그인하는 것만으로 소유권이 생기지 않음.
    - 로그인 실패에서 “이메일 없음”과 “비밀번호 틀림”을 같은 메시지로 처리 → 계정 존재 여부가 응답으로 드러나는 것을 줄이는 설계.
    - 대상이 없는 404와 권한이 없는 403은 구분. 존재 여부를 숨기려는 서비스에서는 남의 데이터에도 404를 반환하는 선택 가능.
    - 일반 HTTP의 403이 항상 “로그인한 사용자”에게만 발생하는 것은 X. 여기서는 인증·소유권 실패의 차이를 학습하기 위한 구분.
    - HTTP 표준상 401에는 `WWW-Authenticate` 인증 챌린지 헤더 사용. 워크북의 JSON code·message는 별도의 애플리케이션 응답 규칙.

  RFC 9110 — 401
  RFC 9110 — 403
  RFC 6750 — Bearer 인증 오류