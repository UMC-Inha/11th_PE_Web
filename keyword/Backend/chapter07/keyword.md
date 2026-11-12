- 인증(Authentication)과 인가(Authorization)

  #### 1. 정의

  | 구분 | 인증 (Authentication) | 인가 (Authorization) |
      | --- | --- | --- |
  | 질문 | 너 누구야? | 너 이거 해도 돼? |
  | 의미 | 요청자가 주장하는 신원이 맞는지 확인하는 과정 | 확인된 사용자가 특정 자원이나 행동에 접근할 권한이 있는지 판단하는 과정 |
  | 순서 | 먼저 | 인증 다음 |
  | 수단 | 이메일 + 비밀번호, 토큰 | 토큰에서 꺼낸 신원 + 서버의 권한·소유권 검사 |
  | 실패 응답 | 401 Unauthorized | 403 Forbidden |
    - 인가는 접근 제어(access control)라고도 부른다. OWASP는 이를 웹 애플리케이션이 어떤 사용자에게는 콘텐츠와 기능 접근을 허용하고 다른 사용자에게는 허용하지 않는 방식으로 설명한다.
    - 비유하면 인증은 건물 출입문의 게이트이고, 인가는 방마다 달린 잠금장치다.

  #### 2. 401과 403의 구분

    - **401**: MDN 정의상 요청한 자원에 대한 유효한 인증 자격 증명이 없어서 요청이 실패했음을 뜻한다. 이름은 Unauthorized지만 MDN도 의미상으로는 ‘unauthenticated’(인증되지 않음)라고 밝힌다.
    - **403**: 요청에 유효한 자격 증명이 있는데도 클라이언트에게 해당 동작을 할 권한이 없을 때 돌려준다
    - 정리하면 401은 "네가 누군지 모르겠다"이고 403은 "누군지는 알지만 그건 네 것이 아니다"이다.
    - 프론트 대응도 다르다. 401이면 로그인 화면으로 보내고, 403이면 "권한이 없습니다" 안내를 띄운다.

  #### 3. 인증만 하고 인가를 빠뜨리면

    - 로그인한 사용자가 URL이나 요청에 들어 있는 ID만 바꿔서 남의 데이터를 조회하거나 수정하는 취약점을 IDOR라고 한다.
    - 대응 원칙은 사용자가 접근하려는 객체마다 접근 제어 검사를 하는 것이다. 로그인했다고 해서 모든 데이터를 건드릴 수 있다고 가정하면 안 된다.

  #### 4. 워크북 예제 (영화 평점 서비스)

  **6주차의 문제**

    - `PATCH /members/{memberId}/ratings/{ratingId}`처럼 memberId를 요청으로 받았다.
    - 1번 회원이 URL의 memberId를 2로 바꾸면 2번 회원의 평점이 수정됐다.
    - 서버가 "당신이 2번이 맞냐"를 확인하지 않았기 때문이다. 인증이 없는 상태였다.

  **7주차의 해결**

  | 단계 | 담당 | 하는 일 | 실패 시 |
      | --- | --- | --- | --- |
  | 로그인 | AuthService | 이메일로 회원을 찾고 bcrypt로 비밀번호를 비교한 뒤 JWT 발급 | 401 `AUTH401_1` |
  | 인증 | AuthInterceptor | Authorization 헤더의 토큰을 검증하고 memberId를 요청에 담음 | 401 `AUTH401_2~4` |
  | 인가 | RatingService.findOwnedRating | 평점 작성자와 요청자가 같은지 비교 | 403 `RATING403_1` |

    ```java
    // 인가: 존재는 하지만 내 것이 아니면 403
    private Rating findOwnedRating(Long memberId, Long ratingId) {
        Rating rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "RATING404_1",
                        "해당 평점을 찾을 수 없습니다."));
    
        if (!rating.getMember().getMemberId().equals(memberId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "RATING403_1",
                    "본인이 작성한 평점만 수정하거나 삭제할 수 있습니다.");
        }
        return rating;
    }
    ```

  **Postman으로 확인하는 상황별 결과**

  | 상황 | 결과 | 걸린 단계 |
      | --- | --- | --- |
  | Authorization 헤더 없이 `PATCH /ratings/1` | 401 `AUTH401_2` | 인증 |
  | 토큰 payload 한 글자를 바꿔서 요청 | 401 `AUTH401_3` | 인증 |
  | 토큰 A로 A의 평점 수정 | 200 | 통과 |
  | 토큰 B로 A의 평점 수정 | 403 `RATING403_1` | 인가 |
    - 토큰 B는 멀쩡한데도 막힌다. 인증을 통과해도 인가에서 막힐 수 있다는 게 둘이 다른 일이라는 증거다.
- 해시와 salt, bcrypt

  #### 1. 해시 (Hash)

    - 입력값을 정해진 길이의 문자열로 바꾸는 **단방향** 함수다.
    - 결과값만 보고 원래 값을 알아낼 방법이 없다. 고기를 갈아 만든 다짐육을 다시 덩어리로 되돌릴 수 없는 것과 같다.
    - 같은 입력을 넣으면 항상 같은 결과가 나온다.

  | 구분 | 암호화 | 해시 |
      | --- | --- | --- |
  | 방향 | 양방향 (키가 있으면 복호화 가능) | 단방향 (되돌릴 수 없음) |
  | 목적 | 나중에 원문을 다시 꺼내 써야 할 때 | 원문은 필요 없고 일치 여부만 확인할 때 |
  | 예 | 주민번호 저장, 통신 내용 | **비밀번호 저장** |
    - 비밀번호는 서버도 원문을 알 필요가 없다. 그래서 암호화가 아니라 해시로 저장한다.
    - 로그인할 때는 입력값을 똑같이 해시한 뒤 결과끼리 비교한다.

  #### 2. salt

    - OWASP 정의상 salt는 해싱 과정에서 비밀번호마다 덧붙이는, 고유하게 무작위로 생성한 문자열이다.
    - salt가 없으면 생기는 문제
        - 같은 비밀번호는 해시값도 같아서, DB만 보고 누가 같은 비밀번호를 쓰는지 알 수 있다.
        - 자주 쓰는 비밀번호의 해시를 미리 계산해 둔 표(레인보우 테이블)로 한 번에 뚫을 수 있다.
    - salt를 쓰면 같은 `Umc1234!`라도 사람마다 해시값이 달라져서 두 문제가 모두 막힌다.

  #### 3. bcrypt

    - 비밀번호 저장용으로 만든 해시 알고리즘이다.
    - Spring 공식 문서는 bcrypt가 무작위 16바이트 salt를 쓰고, 비밀번호 크래킹을 방해하려고 일부러 느리게 설계된 알고리즘이라고 설명한다.

  | 특징 | 설명 |
      | --- | --- |
  | salt 자동 생성 | 해시할 때마다 새 salt를 만들어 결과 문자열 안에 함께 저장한다 |
  | 의도적으로 느림 | 한 번 계산이 느리면 무차별 대입 공격도 그만큼 느려진다 |
  | 비용(cost) 조절 | Spring의 strength 값은 4~31 사이이고, 높을수록 해시 계산에 드는 작업량이 커지며 기본값은 10이다 |
  | 길이 제한 | OWASP는 bcrypt를 쓸 경우 work factor 10 이상, 비밀번호 길이 제한 72바이트를 권장한다 springsourceowasp |
    - cost 값도 해시 문자열 안에 저장된다. 그래서 Spring 문서 말처럼 이미 운영 중인 시스템에서 이 값을 바꿔도 기존 비밀번호에는 영향이 없다.

  #### 4. bcrypt 해시 문자열 구조

  워크북 예시는 `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`이다.

  | 조각 | 값 | 의미 |
      | --- | --- | --- |
  | 알고리즘 버전 | `$2a$` | bcrypt |
  | cost | `10$` | 2^10번 반복 |
  | salt (22자) | `N9qo8uLOickgx2ZMRZoMye` | 무작위 salt |
  | 해시 결과 (31자) | `IjZAgcfl7p92ldGxad68LJZdL17lhWy` | 실제 해시값 |
    - salt가 문자열 안에 들어 있기 때문에 salt를 따로 저장할 컬럼이 필요 없다.

  #### 5. 워크북 예제 (로그인 API)

  **회원가입 (6주차)**: 비밀번호를 해시해서 저장한다.

    ```java
    String encoded = passwordEncoder.encode(request.password());
    // 같은 "Umc1234!"를 넣어도 호출할 때마다 결과가 다르다 (salt가 매번 달라서)
    ```

  **로그인 (7주차)**: 입력값과 저장된 해시를 비교한다.

    ```java
    // matches()는 저장된 해시에서 salt와 cost를 꺼내
    // 입력값을 같은 방식으로 해시한 뒤 결과를 비교한다
    if (!passwordEncoder.matches(request.password(), member.getPassword())) {
        throw new ApiException(HttpStatus.UNAUTHORIZED, "AUTH401_1",
                "이메일 또는 비밀번호가 올바르지 않습니다.");
    }
    ```

- JWT (Header / Payload / Signature, Claim)

  #### 1. JWT란

    - JSON Web Token의 약자로, 두 당사자 사이에서 클레임(claim)을 안전하게 표현하기 위한 개방형 업계 표준(RFC 7519)이다.
    - 로그인에 성공하면 서버가 발급하고, 클라이언트는 이후 요청마다 `Authorization: Bearer {token}` 헤더에 실어 보낸다.
    - 서버는 상태를 저장하지 않고 토큰만 검증하면 된다. 콘서트장 팔찌처럼 필요한 정보가 토큰 자체에 들어 있기 때문이다.

  #### 2. 구조

  JWT는 점(.)으로 구분된 세 부분, Header·Payload·Signature로 이루어진다. 형태는 `xxxxx.yyyyy.zzzzz`이다. jwt

  | 부분 | 담는 내용 | 예시 |
      | --- | --- | --- |
  | Header | 사용한 해싱 알고리즘(예: HMAC SHA256, RSA)과 토큰 타입 | `{"alg":"HS384"}` |
  | Payload | 전달할 정보인 클레임 | `{"sub":"1","email":"movie@umc.com","iat":...,"exp":...}` |
  | Signature | Header와 Payload를 비밀키로 서명한 값 | 위조 여부를 판별 auth0 |
    - Header와 Payload는 각각 Base64Url로 인코딩된다.

  #### 3. Payload는 암호화가 아니다

    - Base64Url은 **인코딩**이지 **암호화**가 아니다. 그래서 토큰을 가진 사람이면 누구나 클레임을 읽을 수 있다. wal
    - jwt.io에 토큰을 붙여넣기만 해도 내용이 그대로 보인다.
    - 따라서 비밀번호나 주민번호처럼 남이 보면 안 되는 값은 payload에 절대 넣지 않는다.

  | 서명이 지켜주는 것 | 서명이 지켜주지 않는 것 |
      | --- | --- |
  | 무결성 (내용을 몰래 바꿀 수 없음) | 기밀성 (내용을 못 보게 하는 것) |

  #### 4. Signature와 위조 방지

    - 서명은 Base64로 인코딩한 header와 payload에 비밀키를 더해, header에 지정된 알고리즘으로 서명해서 만든다. auth0
    - 서명이 header와 payload로 계산되기 때문에, 내용이 변조되지 않았는지도 검증할 수 있다. jwt

  **검증 흐름**

    1. 서버가 받은 토큰의 header와 payload를 자기 비밀키로 다시 서명한다.
    2. 그 결과를 토큰에 실려 온 signature와 비교한다.
    3. 다르면 즉시 거절한다 → 401 `AUTH401_3`.
    - 누군가 payload의 `"sub":"1"`을 `"2"`로 바꾸면 서명이 맞지 않게 된다.
    - 비밀키를 모르면 맞는 서명을 새로 만들 수 없다. 반대로 비밀키가 유출되면 누구나 토큰을 위조할 수 있다. 그래서 `JWT_SECRET`은 환경변수로 관리하고 깃허브에 올리지 않는다.

  #### 5. Claim

    - Payload에 담기는 key/value 한 쌍 하나하나를 클레임이라고 한다. 클레임은 보통 사용자인 어떤 주체에 대한 진술과 부가 메타데이터이다.
    - RFC 7519는 클레임 이름을 Registered, Public, Private 세 종류로 나눈다.

  | 종류 | 설명 | 예 |
      | --- | --- | --- |
  | Registered | 표준에 미리 정해진 이름 | `sub`, `exp`, `iat`, `iss`, `aud`, `nbf`, `jti` |
  | Public | IANA에 등록했거나 충돌하지 않게 지은 이름 | URI 형태 이름 |
  | Private | 서비스끼리 약속해서 쓰는 이름 | `email`, `role` |

  **자주 쓰는 Registered Claim**

  | 클레임 | 의미 | 우리 코드 |
      | --- | --- | --- |
  | `sub` | 토큰의 주인 (subject) | memberId |
  | `iat` | 발급 시각 (issued at) | `.issuedAt(now)` |
  | `exp` | 만료 시각 (expiration) | 발급 시각 + 3600초 |
  | `iss` | 발급자 (issuer) | 사용 안 함 |
    - 표준 클레임 이름이 짧은 이유는 JWT의 핵심 목표 중 하나가 표현을 간결하게(compact) 만드는 것이기 때문이다.
    - RFC 기준으로 모든 registered claim은 선택 사항이다. 그래도 `exp`가 없으면 영원히 유효한 토큰이 되니 반드시 넣는다.

  #### 6. 워크북 예제

  **토큰 발급 (JwtUtil)**

    ```java
    return Jwts.builder()
            .subject(String.valueOf(memberId))   // sub: Registered Claim
            .claim("email", email)               // email: Private Claim
            .issuedAt(Date.from(now))            // iat
            .expiration(Date.from(now.plus(accessExpiration))) // exp
            .signWith(secretKey)                 // Signature 생성
            .compact();
    ```

  **jwt.io에서 디코딩한 결과**

    ```json
    // Header
    { "alg": "HS384" }
    
    // Payload
    { "sub": "1", "email": "movie@umc.com", "iat": 1794416400, "exp": 1794420000 }
    ```

    - 알고리즘이 HS256이 아니라 HS384로 나오는 이유: jjwt는 키 길이를 보고 알고리즘을 고른다. 예시 키가 48자를 넘어서 HS384가 선택됐다.

  **토큰 검증 (JwtUtil.getMemberId)**

  | 상황 | 잡히는 예외 | 응답 |
      | --- | --- | --- |
  | 정상 토큰 | - | `sub`에서 memberId를 꺼냄 |
  | payload 한 글자 변조 | `JwtException` (서명 불일치) | 401 `AUTH401_3` |
  | `exp`가 지난 토큰 | `ExpiredJwtException` | 401 `AUTH401_4` |
- Bearer 인증과 Authorization 헤더

  #### 1. Authorization 헤더

    - MDN 설명으로 Authorization 요청 헤더는 서버에 사용자 에이전트를 인증할 자격 증명을 보내서, 보호된 자원에 접근할 수 있게 해 주는 헤더다.
    - 형식은 `Authorization: <auth-scheme> <authorization-parameters>`이다. 앞에 어떤 방식인지(scheme)를 밝히고, 뒤에 **값**을 적는다.
    - 이 헤더는 일반 HTTP 인증 프레임워크의 일부이고 여러 인증 방식(scheme)과 함께 쓸 수 있다.

  | scheme | 값 | 특징 |
      | --- | --- | --- |
  | Basic | `아이디:비밀번호`를 Base64로 인코딩 | 매 요청마다 비밀번호가 오간다 |
  | Digest | 해시한 자격 증명 | 거의 쓰지 않는다 |
  | **Bearer** | 토큰 (우리는 JWT) | 로그인할 때 한 번 발급받아 계속 사용 |

  #### 2. Bearer 인증

    - Bearer는 "지참한 사람, 소지자"라는 뜻이다.
    - RFC 6750은 Bearer Token을 토큰을 가진 사람(bearer)이면 누구든, 다른 소지자와 똑같은 방식으로 그 토큰을 쓸 수 있는 성질을 가진 보안 토큰으로 정의한다.
    - 즉 서버는 "이 토큰을 들고 온 사람 = 토큰 주인"으로 본다. 그래서 RFC도 오용을 막으려면 bearer 토큰이 저장 중에도 전송 중에도 노출되지 않게 보호해야 한다고 강조한다.
    - 콘서트장 팔찌와 같다. 직원은 팔찌만 보고 들여보내므로 팔찌를 뺏기면 그대로 뚫린다.

  **형식**

    ```
    Authorization: Bearer eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiIxIn0.xxxxx
    ```

    - RFC 6750의 문법은 `credentials = "Bearer" 1*SP b64token`이다. `Bearer` 뒤에 공백이 최소 한 칸 있고 그다음이 토큰이다.
    - 서버는 토큰을 꺼낼 때 앞의 `"Bearer "`(공백 포함 7글자)를 잘라내야 한다.

  #### 3. 왜 바디가 아니라 헤더에 싣나

  | 이유 | 설명 |
      | --- | --- |
  | 정보의 성격 | 토큰은 "무엇을 하려는가"가 아니라 "누가 하려는가"이다. 편지 내용이 아니라 봉투에 적을 정보다 |
  | 메서드 제약 | GET과 DELETE는 관례상 바디를 쓰지 않는다. 바디에 토큰을 넣으면 조회·삭제 API에서 보낼 곳이 없다 |
  | 표준 | RFC 6750도 클라이언트는 bearer 토큰을 Authorization 요청 헤더에 Bearer 방식으로 실어 보내야(SHOULD) 하고, 자원 서버는 이 방식을 반드시(MUST) 지원해야 한다고 정한다 ietf |

  #### 4. 401과 WWW-Authenticate

    - 표준 흐름에서는 서버가 401 응답과 함께 인증 방법을 알려 주는 WWW-Authenticate 응답 헤더를 보내고, 클라이언트는 자격 증명을 담은 Authorization 요청 헤더로 다시 요청한다. w3cub
    - 우리 실습은 이 헤더를 따로 보내지 않는다. 대신 응답 바디의 `code`(`AUTH401_2` 등)로 실패 이유를 알려 준다.

  #### 5. 워크북 예제

  **토큰 꺼내기 (AuthInterceptor)**

    ```java
    private static final String BEARER_PREFIX = "Bearer "; // 공백 포함
    
    String header = request.getHeader(HttpHeaders.AUTHORIZATION);
    
    // 헤더가 없거나 "Bearer "로 시작하지 않으면 토큰을 안 보낸 것으로 본다
    if (header == null || !header.startsWith(BEARER_PREFIX)) {
        throw new ApiException(HttpStatus.UNAUTHORIZED, "AUTH401_2",
                "로그인이 필요한 요청입니다.");
    }
    
    // "Bearer "를 잘라내고 순수 토큰만 검증한다
    Long memberId = jwtUtil.getMemberId(header.substring(BEARER_PREFIX.length()));
    request.setAttribute(MEMBER_ID, memberId);
    ```

  **Postman에서 보내기**

    - Authorization 탭에서 Type을 **Bearer Token**으로 고르고 토큰만 붙여넣는다.
    - Postman이 `Authorization: Bearer {토큰}`을 자동으로 만들어 준다.

  **상황별 결과**

  | 보낸 헤더 | 결과 | 이유 |
      | --- | --- | --- |
  | 헤더 없음 | 401 `AUTH401_2` | null |
  | `Authorization: eyJ...` (Bearer 빠짐) | 401 `AUTH401_2` | “Bearer "로 시작하지 않음 |
  | `Authorization: Bearereyj...` (공백 빠짐) | 401 `AUTH401_2` | “Bearer "로 시작하지 않음 |
  | `Authorization: Bearer {변조된 토큰}` | 401 `AUTH401_3` | 서명 검증 실패 |
  | `Authorization: Bearer {정상 토큰}` | 200 | 통과 |
    - 브라우저의 CORS preflight(OPTIONS) 요청에는 Authorization 헤더가 붙지 않는다. 그래서 인터셉터에서 OPTIONS는 그냥 통과시킨다.
- HandlerInterceptor / Guard

  #### 1. 왜 필요한가

    - 토큰 검사 코드를 컨트롤러마다 넣으면 API가 20개일 때 같은 코드를 20번 복사해야 하고, 하나만 빠뜨려도 그 API가 무방비로 열린다.
    - 그래서 **컨트롤러에 도달하기 전에 모든 요청이 지나가는 길목**에 검사대를 하나 세운다. 사무실 문마다 경비를 두는 대신 로비 출입 게이트 하나로 거르는 것과 같다.
    - Spring은 이 역할을 **HandlerInterceptor**가, NestJS는 **Guard**가 맡는다.

  #### 2. HandlerInterceptor (Spring)

    - Spring 공식 문서는 인터셉터를 각 핸들러 구현을 고치지 않고도 공통 전처리 동작을 추가할 수 있게 하는 장치로 소개하고, 주요 목적을 반복되는 핸들러 코드를 밖으로 빼내는 것이라고 설명한다. springspring
    - 문서에서도 인가 검사 같은 핸들러 관련 세밀한 전처리 작업이 HandlerInterceptor로 구현하기 좋은 대상이라고 한다. spring

  **요청 흐름**

    ```
    요청 → Filter → DispatcherServlet → Interceptor(preHandle) → Controller → Service
    ```

  **메서드 3개**

  | 메서드 | 호출 시점 | 용도 |
      | --- | --- | --- |
  | `preHandle` | HandlerMapping이 핸들러를 정한 뒤, HandlerAdapter가 핸들러를 실행하기 전 | **인증 검사** (우리가 쓰는 것) |
  | `postHandle` | 핸들러 실행이 끝난 뒤, 뷰를 렌더링하기 전 | 응답 후처리 |
  | `afterCompletion` | 요청 처리가 모두 끝난 뒤 호출되며, 결과가 어떻든 실행되므로 자원 정리에 쓴다 | 로깅, 정리 docs.spring.io +2 |
    - `preHandle`이 true를 반환하면 다음 인터셉터나 핸들러로 실행이 이어진다. 예외를 던지면 거기서 멈추고 전역 예외 처리기로 넘어간다.

  #### 3. Guard (NestJS)

    - NestJS 공식 문서 정의는 @Injectable() 데코레이터가 붙고 CanActivate 인터페이스를 구현하는 클래스이다. Guard는 요청을 들여보낼지 말지 결정하는 한 가지 일만 한다.
    - 실행 순서는 모든 미들웨어 다음, 그리고 인터셉터나 파이프보다는 앞이다.

    ```
    요청 → Middleware → Guard(canActivate) → Interceptor → Pipe → Controller
    ```

    - 미들웨어와 다른 점: 미들웨어는 next()를 호출한 뒤 어떤 핸들러가 실행될지 모른다. 반면 Guard는 ExecutionContext에 접근할 수 있어서 다음에 무엇이 실행될지 정확히 안다.
    - 적용 범위는 파이프나 예외 필터처럼 컨트롤러 단위, 메서드 단위, 전역 단위 중에서 고를 수 있고, `@UseGuards()`로 붙인다.

  #### 4. 비교

  | 구분 | HandlerInterceptor (Spring) | Guard (NestJS) |
      | --- | --- | --- |
  | 구현 | `HandlerInterceptor`의 `preHandle` | `CanActivate`의 `canActivate` |
  | 통과 | `return true` | `return true` |
  | 차단 | 예외 던지기 (`ApiException`) | 예외 던지기 (`ApiException`) |
  | 적용 방식 | `WebConfig`에서 경로 패턴으로 등록 | `@UseGuards(AuthGuard)`를 붙인 곳에만 |
  | 기본 전략 | **전부 잠그고 예외만 열기** | **필요한 곳에 하나씩 붙이기** |
  | 값 전달 | `request.setAttribute("memberId", ...)` | `request['memberId'] = ...` |
  | 컨트롤러에서 꺼내기 | `@RequestAttribute` | `@Req()` |

  #### 5. 워크북 예제

  **Spring – 등록 (WebConfig)**

    ```java
    registry.addInterceptor(authInterceptor)
            .addPathPatterns("/**")              // 일단 전부 잠그고
            .excludePathPatterns(                // 로그인 없이 써야 하는 것만 연다
                    "/auth/**", "/members", "/members/nickname/**",
                    "/members/email/**", "/members/*/ratings", "/error");
    ```

    - "잠글 경로를 나열"하지 않고 "전부 잠그고 열 경로만 나열"한 이유: 새 API를 만들고 목록에 추가하는 걸 깜빡해도 잠긴 채로 남는다. 실수했을 때 안전한 쪽으로 기울도록 설계한 것이다.

  **NestJS – 적용**

    ```tsx
    @Patch('ratings/:ratingId')
    @UseGuards(AuthGuard) // 이 줄이 없으면 토큰 없이도 호출된다
    async update(@Req() request: Request, ...) {
      const memberId = request['memberId'] as number;
      ...
    }
    ```

  **관문이 하는 일 (공통)**

    1. Authorization 헤더에서 `Bearer`  뒤의 토큰을 꺼낸다.
    2. 토큰을 검증하고 memberId를 알아낸다. 실패하면 401이다.
    3. memberId를 요청 객체에 담아서 컨트롤러가 꺼내 쓰게 한다.

  → 컨트롤러는 토큰이 뭔지 몰라도 memberId만 받아 쓰면 된다.

- 401 Unauthorized와 403 Forbidden의 차이

  #### 1. 정의

  | 구분 | 401 Unauthorized | 403 Forbidden |
      | --- | --- | --- |
  | 뜻 | 네가 누군지 모르겠다 | 누군지는 알지만 허용할 수 없다 |
  | 실패한 단계 | 인증 (Authentication) | 인가 (Authorization) |
  | 원인 | 토큰이 없거나, 위조됐거나, 만료됨 | 권한이 없거나, 남의 데이터임 |
  | 다시 로그인하면 | 해결될 수 있다 | 해결되지 않는다 |
  | 프론트 대응 | 로그인 화면으로 이동 | "권한이 없습니다" 안내 |
    - **401**: MDN 정의는 요청한 자원에 대한 유효한 인증 자격 증명이 없어서 요청이 실패했음이다.
    - **403**: 요청에 유효한 자격 증명이 있는데도 클라이언트에게 그 동작을 할 권한이 없을 때 쓴다. 이때는 서버가 요청자를 이미 알고 있고 이건 정책상 결정이라서, 다시 인증해도 소용이 없다.

  #### 2. 이름이 헷갈리는 이유

    - 401의 이름은 “Unauthorized(인가되지 않음)”지만 실제 뜻은 인증 실패다. MDN도 HTTP 표준에는 ‘unauthorized’라고 적혀 있지만 의미상으로는 ‘unauthenticated’라고 밝힌다.
    - 그래서 이름만 보고 인가 실패에 401을 쓰면 안 된다. HTTP 명세상 401은 인증용이고, "로그인은 했지만 허용되지 않음"에는 403을 쓴다.

  | 헷갈리는 이름 | 실제 의미 |
      | --- | --- |
  | 401 Unauthorized | **인증** 실패 |
  | 403 Forbidden | **인가** 실패 |

  #### 3. 자주 하는 실수

  | 상황 | 잘못된 응답 | 올바른 응답 |
      | --- | --- | --- |
  | Authorization 헤더 없이 내 정보 조회 | 403 | **401** (누군지 모른다) |
  | 로그인한 B가 A의 평점 수정 | 401 | **403** (누군지는 안다) |
  | Authorization 헤더 형식이 깨짐 | 500 | **401** |
    - 403을 받은 프론트가 로그인 화면으로 보내면, 사용자는 다시 로그인해도 또 막힌다. 반대로 401에 "권한 없음"을 띄우면 사용자는 로그인하면 된다는 걸 모른다. 그래서 두 코드는 반드시 구분해야 한다.

  #### 4. 403 대신 404를 쓰는 경우

    - 403 응답은 뒤집어 보면 "그 번호의 자원이 존재한다"는 사실을 알려 주는 셈이다.
    - 그래서 서비스에 따라서는 존재 사실을 숨기려고 403 대신 404를 돌려주기도 한다.
    - 워크북은 학습 목적상 401과 403의 차이를 직접 보는 게 중요해서 403을 쓴다.

  #### 5. 워크북 예제

  **실패 코드 설계**

  | 상황 | 상태 | code | 발생 위치 |
      | --- | --- | --- | --- |
  | 로그인 정보 틀림 | 401 | `AUTH401_1` | AuthService |
  | 토큰 없음 | 401 | `AUTH401_2` | AuthInterceptor |
  | 토큰 위조 | 401 | `AUTH401_3` | JwtUtil |
  | 토큰 만료 | 401 | `AUTH401_4` | JwtUtil |
  | 남의 평점 수정·삭제 | 403 | `RATING403_1` | RatingService |
    - 401은 네 가지인데 상태 코드가 같다. 그래서 `code`로 이유를 나눈다. 만료(`AUTH401_4`)는 다시 로그인하면 해결되니 프론트가 따로 처리할 수 있다.

  **판단 순서 (findOwnedRating)**

    ```java
    // 1. 없으면 404
    Rating rating = ratingRepository.findById(ratingId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "RATING404_1", ...));
    
    // 2. 있는데 내 것이 아니면 403
    if (!rating.getMember().getMemberId().equals(memberId)) {
        throw new ApiException(HttpStatus.FORBIDDEN, "RATING403_1", ...);
    }
    ```

    - 401 → 404 → 403 순서로 판단한다. 인증이 안 됐으면 관문에서 먼저 401로 끝난다. 통과하면 서비스에서 자원이 있는지(404), 내 것인지(403)를 차례로 본다.
    - 순서를 바꾸면 존재하지도 않는 평점에 "권한이 없습니다"라고 답하게 돼서 앞뒤가 맞지 않는다.

  **Postman 시나리오**

  | 요청 | 결과 |
      | --- | --- |
  | 토큰 A로 A의 평점 수정 | 200 |
  | **토큰 B로** 같은 요청 | **403** `RATING403_1` |
  | **헤더를 지우고** 같은 요청 | **401** `AUTH401_2` |
  | 토큰 A로 `DELETE /ratings/99999` | 404 `RATING404_1` |
    - 토큰 B는 멀쩡한데도 막힌다. 인증은 통과했지만 인가에서 걸린 것이고, 이게 401과 403이 다르다는 가장 확실한 증거다.