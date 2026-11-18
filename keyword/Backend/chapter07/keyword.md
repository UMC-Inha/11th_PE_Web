- 인증(Authentication)과 인가(Authorization)

  #### **1. 두 과정의 차이**

    - 인증은 요청한 사람이 누구인지 확인하는 과정이다. 우리 서버에서는 로그인할 때 비밀번호를 비교하는 것과, 요청마다 토큰을 검증하는 것이 인증이다.
    - 인가는 확인된 사람이 이 데이터를 다뤄도 되는지 판단하는 과정이다. 평점을 수정하기 전에 작성자가 요청자와 같은지 비교하는 것이 인가이다.

  | **구분** | **인증** | **인가** |
      | --- | --- | --- |
  | 묻는 것 | 너 누구야? | 너 이거 해도 돼? |
  | 우리 코드에서 하는 곳 | AuthService(로그인), AuthInterceptor(토큰 검증) | RatingService의 findOwnedRating |
  | 실패하면 | 401, AUTH401_1~4 | 403, RATING403_1 |

  #### **2. 인증은 관문에서, 인가는 서비스에서**

    - 인터셉터는 모든 요청에 똑같이 적용되므로 "누구인지"까지만 확인할 수 있다.
    - "이 평점이 내 것인지"는 DB에서 평점을 꺼내 작성자를 봐야 알 수 있는 기능별 규칙이라서 서비스에서 확인한다.

    ```java
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

    - 회원 B의 토큰으로 회원 A의 평점(6번)을 수정했을 때, 토큰 검증은 통과했지만 위 if문에서 403이 났다. 인증과 인가가 서로 다른 일이라는 증거이다.

- 해시와 salt, bcrypt

  #### **1. 비밀번호를 해시로 저장하는 이유**

    - 해시는 값을 되돌릴 수 없는 한 방향 변환이다. DB가 유출돼도 원래 비밀번호를 바로 알 수 없다.
    - 같은 입력은 항상 같은 해시가 나온다. 그래서 해시만 쓰면 자주 쓰는 비밀번호의 해시를 미리 계산해 둔 표(레인보우 테이블)로 비밀번호를 알아낼 수 있다.

  | **구분** | **해시** | **암호화** |
      | --- | --- | --- |
  | 되돌리기 | 불가능 | 키가 있으면 가능 |
  | 비밀번호 저장에 | 사용한다 | 사용하지 않는다 |

  #### **2. salt와 bcrypt**

    - salt는 해시하기 전에 비밀번호에 섞는 무작위 값이다. 회원마다 salt가 달라서 같은 비밀번호라도 해시가 달라진다.
    - bcrypt는 salt를 자동으로 만들어 섞고, 결과 문자열 안에 salt까지 넣어 주는 해시 방식이다. 일부러 느리게(cost 10이면 2의 10제곱 번 반복) 계산해서 하나씩 대입해 보는 공격을 어렵게 한다.

  | **회원** | **입력한 비밀번호** | **DB에 저장된 값** |
      | --- | --- | --- |
  | A (umc@example.com) | Umc!1234 | $2a$10$ + salt 22자 + 해시 31자 |
  | B (umc2@example.com) | Umc!1234 | 위와 완전히 다른 60자 |

  #### **3. 로그인할 때 비교하는 방법**

    ```java
    if (!passwordEncoder.matches(request.password(), member.getPassword())) {
        throw new ApiException(HttpStatus.UNAUTHORIZED, "AUTH401_1",
                "이메일 또는 비밀번호가 올바르지 않습니다.");
    }
    ```

    - 해시를 되돌려서 비교하는 것이 아니다. matches가 저장된 값에서 salt를 꺼내, 입력한 비밀번호를 같은 salt로 해시한 뒤 결과끼리 비교한다.
    - 이메일이 없을 때와 비밀번호가 틀릴 때 모두 같은 AUTH401_1을 돌려준다. 나눠서 알려 주면 어떤 이메일이 가입되어 있는지 알아낼 수 있기 때문이다.

- JWT (Header / Payload / Signature, Claim)

  #### **1. 우리 서버가 발급한 토큰**

    - 로그인에 성공하면 서버가 JWT를 만들어 accessToken으로 돌려준다. 점(.)으로 나뉜 header, payload, signature 세 부분이다.
    - 회원 A로 로그인해서 받은 토큰을 jwt.io에서 디코딩하면 아래 값이 보인다.

  | **부분** | **역할** | **우리 토큰에 들어 있던 것** |
      | --- | --- | --- |
  | header | signature를 만든 알고리즘 | {"alg": "HS384"} |
  | payload | 전달할 정보(claim) | {"sub": "3", "email": "umc@example.com", "iat": ..., "exp": ...} |
  | signature | 위조 여부 검증 | header와 payload를 JWT_SECRET으로 계산한 값 |

  #### **2. Claim**

    - payload에 담긴 정보 하나하나를 claim이라고 한다.

  | **claim** | **뜻** | **우리 값** |
      | --- | --- | --- |
  | sub | 토큰의 주인 | memberId 3 |
  | email | 참고용 부가 정보 | umc@example.com |
  | iat | 발급 시각 | 로그인한 시각 |
  | exp | 만료 시각 | 발급 1시간 뒤 (JWT_ACCESS_EXPIRATION 3600초) |
    - payload는 인코딩만 되어 있어 누구나 읽을 수 있다. 그래서 비밀번호는 넣지 않고 memberId, email만 넣었다.

  #### **3. 발급과 검증 (JwtUtil)**

    ```java
    public String createAccessToken(Long memberId, String email) {
        Instant now = Instant.now();
    
        return Jwts.builder()
                .subject(String.valueOf(memberId))
                .claim("email", email)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(accessExpiration)))
                .signWith(secretKey)
                .compact();
    }
    
    private Jws<Claims>getClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .clockSkewSeconds(60)
                .build()
                .parseSignedClaims(token);
    }
    ```

    - 발급할 때 signWith가 비밀키로 signature를 붙이고, 검증할 때 verifyWith가 같은 비밀키로 signature를 다시 계산해 비교한다.
    - signature가 다르면 AUTH401_3, exp가 지났으면 AUTH401_4를 던진다. payload 글자 하나만 바꿔도 signature가 맞지 않아 401이 난다.
    - 비밀키는 코드에 적지 않고 application.yaml에서 환경 변수 JWT_SECRET으로 읽는다. 키가 GitHub에 올라가면 누구나 진짜 토큰을 만들 수 있기 때문이다.

- Bearer 인증과 Authorization 헤더

  #### **1. Authorization 헤더와 Bearer**

    - Authorization 헤더는 요청에 "나는 누구다"를 증명하는 값을 담는 HTTP 표준 헤더이다. "타입 값" 형식으로 쓴다.
    - Bearer는 "이 토큰을 가진(bearer) 사람에게 권한을 준다"는 방식이다. 토큰만 있으면 그 사람으로 인정되므로 토큰이 새지 않게 조심하고, 만료 시간을 꼭 둔다.

    ```
    Authorization: Bearer eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiIzIi...
    ```

  | **Postman 설정** | **서버가 받는 것** | **결과** |
      | --- | --- | --- |
  | Auth Type: Bearer Token, 토큰 입력 | 위 형식의 Authorization 헤더 | 통과 |
  | Auth Type: No Auth | Authorization 헤더 없음 | 401, AUTH401_2 |

  #### **2. 우리 코드에서 토큰 꺼내기**

    ```java
    String header = request.getHeader(HttpHeaders.AUTHORIZATION);
    
    if (header ==null || !header.startsWith(BEARER_PREFIX)) {
        throw new ApiException(HttpStatus.UNAUTHORIZED, "AUTH401_2",
                "로그인이 필요한 요청입니다.");
    }
    
    Long memberId = jwtUtil.getMemberId(header.substring(BEARER_PREFIX.length()));
    ```

    - 헤더가 없거나 "Bearer "로 시작하지 않으면 토큰을 안 보낸 것으로 보고 AUTH401_2를 던진다.
    - "Bearer "(공백 포함 7글자) 뒤를 잘라 토큰만 JwtUtil에 넘긴다.

- HandlerInterceptor / Guard

  #### **1. 컨트롤러 앞의 관문**

    - 모든 요청이 컨트롤러에 가기 전에 지나가는 검사대이다. 사무실 문마다 경비를 세우는 대신 건물 로비 출입 게이트 하나로 거르는 것과 같다.
    - 컨트롤러마다 토큰 검사 코드를 넣으면 API가 늘 때마다 복사해야 하고, 하나만 빠뜨려도 그 API가 열린다.
    - 관문이 확인한 memberId를 요청에 붙여 두기 때문에 컨트롤러는 토큰을 몰라도 memberId만 받아 쓰면 된다.

  | **구분** | **Spring Boot** | **NestJS** |
      | --- | --- | --- |
  | 이름 | HandlerInterceptor | Guard |
  | 검사하는 메서드 | preHandle (true면 통과) | canActivate |
  | 적용 방식 | WebConfig에서 경로로 등록 | @UseGuards를 붙인 곳에만 |
  | memberId 전달 | request.setAttribute → @RequestAttribute | request['memberId'] → @Req() |

  #### **2. 우리 코드에서 등록**

    ```java
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/auth/**",
                        "/members",
                        "/members/nickname/**",
                        "/members/email/**",
                        "/members/*/ratings",
                        "/error"
                );
    }
    ```

    - 전부 잠그고(/**) 로그인 없이 써야 하는 경로만 열었다. 새 API를 만들고 목록에 넣는 걸 깜빡해도 잠긴 채로 남아서 안전하다.
    - 인터셉터는 경로만 보고 HTTP 메서드는 구분하지 못한다. /members를 연 건 회원가입 때문이지만, 나중에 GET /members를 만들면 그것도 열린다.
    - 브라우저가 먼저 보내는 OPTIONS 요청(preflight)에는 토큰이 없어서 preHandle에서 그냥 통과시킨다.

- 401 Unauthorized와 403 Forbidden의 차이

  #### **1. 두 상태 코드의 차이**

    - 401은 서버가 요청자가 누구인지 모르는 것(인증 실패), 403은 누군지는 알지만 권한이 없는 것(인가 실패)이다.
    - 이름이 Unauthorized라 헷갈리지만 실제 뜻은 "인증되지 않음"이다.

  | **구분** | **401 Unauthorized** | **403 Forbidden** |
      | --- | --- | --- |
  | 서버 입장 | 너 누구야? | 누군지 아는데 안 돼 |
  | 우리 결과 | 토큰 없이 GET /members/me → AUTH401_2 | 토큰 B로 PATCH /ratings/6 → RATING403_1 |
  | 다시 로그인하면 | 해결된다 | 해결되지 않는다 |
  | 프론트 처리 | 로그인 화면으로 보낸다 | "권한이 없습니다" 안내를 띄운다 |

  #### **2. 우리 서버의 실패 코드**

  | **code** | **상태** | **상황** |
      | --- | --- | --- |
  | AUTH401_1 | 401 | 이메일 또는 비밀번호가 틀림 |
  | AUTH401_2 | 401 | 토큰이 아예 없음 |
  | AUTH401_3 | 401 | 토큰이 위조됨 |
  | AUTH401_4 | 401 | 토큰이 만료됨 |
  | RATING403_1 | 403 | 남의 평점을 수정, 삭제하려 함 |
  | RATING404_1 | 404 | 평점이 없음 |
    - 401만 네 종류라 {도메인}{상태 코드}_{번호} 형태로 code를 나눴다. 상태 코드가 같아도 code를 보면 이유를 알 수 있다.

  #### **3. 404를 403보다 먼저 보는 이유**

    - findOwnedRating은 평점을 먼저 찾고(없으면 404), 찾은 뒤에 작성자를 본다(내 것이 아니면 403).
    - 순서를 바꾸면 없는 평점(99999번)에도 "권한이 없습니다"라고 답하게 되어 앞뒤가 맞지 않는다.
    - 403은 "그 평점이 있긴 하다"는 사실을 알려 주는 셈이라, 남의 것에도 404를 줘서 존재를 숨기는 서비스도 있다. 우리는 401과 403의 차이를 보는 것이 목적이라 403을 썼다.