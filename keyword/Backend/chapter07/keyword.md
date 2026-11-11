- 인증(Authentication)과 인가(Authorization)

  ## 인증(Authentication)

  접근을 원하는 대상을 식별하는 행위
  접근자가 주장하는 신원이 진짜인지 확인

  - 어떠한 작업을 하고자 할 때 ‘로그인이 필요합니다’ 같은 문구가 뜬다면 인증이 필요한 상태
  - 비밀번호, Google·Kakao 로그인, 전화번호 인증, 생체 인식, OTP 등을 활용할 수 있음
  - 방식
    - JWT
      - 인증 성공 시 서버가 발급해주는 토큰
      - 인증 성공 시 서버에서 JWT를 발급할 수 있음
      - 클라이언트는 해당 토큰을 받고 요청을 보낼 때 헤더에 담아서 보내서 인증
    - OAuth
      - 사용자의 비밀번호를 직접 공유하지 않고 제3자 서비스의 자원에 접근할 권한을 위임하는 방식
      - Google, Kakao 로그인 등에 활용
      - 외부 서비스에서 인증 후 외부 서비스를 통해서 인증 토큰과 사용자 정보를 받는 방식
    - SSO
      - 한 번의 로그인으로 여러 서비스에 접근할 수 있도록 하는 인증 방식
      - ex) 구글 계정으로 Gmail에 로그인하면 YouTube, Google Drive 등에서도 별도 로그인 없이 이용

  ## 인가(Authorization)

  접근을 원하는 대상이 접근을 할 권한을 허용/거부하는 행위
  사용자가 어떤 기능이나 데이터에 접근할 권한이 있는지 판단

  - 로그인을 하고 작업을 하려고 했으니 ‘권한이 없습니다’ 같은 문구가 뜬다면 인가가 필요한 상태
  - 인증은 되어 있어도 인가가 안되어 있을 수도 있음
    - 게시판 글 읽기는 누구나 가능하지만, 삭제나 수정은 작성자만 가능
  - 방식
    - **RBAC (Role-Based Access Control)**
      - 역할을 부여하고 역할에 따라 접근 권한을 부여하는 방식
      - ex) 일반 사용자는 게시글 작성만 가능하지만, 관리자는 모든 게시글 삭제 가능
    - **ABAC (Attribute-Based Access Control)**
      - 사용자의 속성을 기반으로 접근 권한을 결정하는 방식
      - ex) 특정 부서 직원만 업무 시간에 해당 문서에 접근 가능
    - **ACL (Access Control List)**
      - 각 자원에 접근할 수 있는 사용자와 권한을 목록으로 관리하는 방식
      - 자원별 접근 권한 목록을 저장하고, 요청한 사용자가 목록에 있는지 확인
- 해시와 salt, bcrypt

  ## 해시

  임의의 길이를 가진 데이터를 고정된 길이의 값으로 변환하는 것
  이 때 변환에 사용하는 함수를 해시 함수라고 하고 그 결과로 나온 값을 해시 값이라고 함
  밑에 있는 특징 덕분에 비밀번호 저장 등에 사용 됨

  - 특징
    - 단방향성
      - 원본 → 해시 값으로 암호화하는 건 쉽지만 반대 방향으로 복호화는 어렵
    - 고정된 길이
    - 결정성
      - 일반적인 해시는 동일한 입력 값에 동일한 해시 값을 도출함
    - 충돌 가능성
      - 서로 다른 입력값에서 동일한 해시 값이 나올 수 있음 → 해시 충돌

  ## Salt

  비밀번호를 암호화 할 때 사용되는 무작위 데이터

  - 특징
    - 각 입력값마다 서로 다른 무작위 Salt를 생성
    - 미리 계산된 해시값을 이용하는 공격을 어렵게 함
    - 로그인 시 저장된 Salt를 사용해 입력 비밀번호를 검증함
  - 비밀번호 검증 과정
    - 회원가입
      - 무작위 Salt를 생성함
      - 비밀번호와 Salt를 사용해 해시값을 생성함
      - 해시값과 Salt를 DB에 저장함
    - 로그인
      - DB에서 해당 사용자의 Salt와 해시값을 조회함
      - 입력받은 비밀번호와 저장된 Salt를 사용해 해시값을 계산함
      - DB의 해시값과 비교하여 인증함

  ## bcrypt

  - bcrypt란?
    - 사용자의 비밀번호를 안전하게 저장하기 위해 비밀번호와 무작위 값(salt)을 이용한 해시 알고리즘
    - 비밀번호를 원래 값으로 되돌릴 수 없는 해시값으로 변환
    - 비밀번호마다 무작위 값인 Salt를 추가하여 서로 다른 해시값 생성
    - 해시 계산 속도를 의도적으로 느리게 만들어 비밀번호 추측 공격을 어렵게 함
  - 특징
    - salt 자동 생성
    - 단방향 해싱
    - bcrypt 해시 문자열 안에는 알고리즘 버전, Cost, Salt 및 해시 결과가 포함
      - Salt를 별도의 DB 컬럼에 저장할 필요가 없음
    - salt round를 설정하여 반복 계산 횟수 설정 가능
      - 브루트포스 공격에 어렵게 만듦
  - 사용
    - Spring Security의 BCryptPasswordEncoder 사용

      ```java
      import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
      
      BCryptPasswordEncoder passwordEncoder =
              new BCryptPasswordEncoder(12);
      
      // 회원가입
      String hashedPassword = passwordEncoder.encode("password123");
      
      // 로그인
      boolean isMatch = passwordEncoder.matches(
              "password123",
              hashedPassword
      );
      ```


- JWT (Header / Payload / Signature, Claim)

  ## JWT(Json Web Token)

  - jwt란
    - 하나의 거대한 JSON 문자열
    - JWT는 사용자 인증 정보를 담아 전달하는 토큰 형식
    - 헤더 부분, 페이로드 부분, 시그니처 부분으로 이루어져있으며 각 파트는 온점(.)으로 구분됨
  - 구조
    - Header
      - jwt 토큰 타입과 Signature 알고리즘 정보
    - Payload
      - 사용자 식별자, 권한, 발급 시간, 만료 시간 등 (민감한 정보는 넣지 않음)
      - claim: payload 안에 들어가는 정보
        - Registered Claim (등록된 클레임)
          - JWT 표준에 미리 정의된 클레임
          - sub: 토큰의 주체(사용자 ID 등)
          - iss: 토큰 발급자
          - aud: 토큰 대상자
          - iat: 토큰 발급 시간
          - exp: 토큰 만료 시간
          - nbf: 토큰 사용 가능 시작 시간
          - 모두 필수인 것은 아님
        - Public Claim (공개 클레임)
          - 사용자 정의 클레임 중 공개적으로 등록되거나 충돌을 피할 수 있는 이름을 사용하는 클레임
        - Private Claim (비공개 클레임)
          - 서버와 클라이언트 간 약속해서 사용하는 사용자 정의 클레임
    - Signature
      - 서버의 비밀키 또는 개인키로 생성한 서명
      - 토큰의 위조 및 변조 여부를 검증하는 데 사용
  - 프로세스
![image.png](image/image.png)

  - Access Token과 Refresh Token
    - JWT는 인증 정보를 전달하기 위한 형식
    - Access Token과 Refresh Token으로 토큰의 역할을 구분
    - **Access Token**
      - 목적: API 요청 시 사용자 인증
      - 유효기간: 비교적 짧음
      - 사용 시점: 인증이 필요한 API 요청
    - **Refresh Token**
      - 목적: Access Token 재발급
      - 유효기간: 비교적 김
      - 사용 시점: Access Token 만료 시
      - JWT 사용: JWT 또는 무작위 문자열
- Bearer 인증과 Authorization 헤더

  ## Bearer 인증

  - Bearer 인증이란?
    - 토큰을 가진 사용자가 해당 토큰을 제시하여 인증받는 방식
    - 주로 JWT 형식의 Access Token을 사용하지만 JWT만 사용할 수 있는 것은 아님
    - 서버는 전달받은 토큰을 검증하여 사용자를 식별하고 요청을 처리
    - 토큰 자체가 인증 수단이므로 별도로 아이디와 비밀번호를 매번 전송할 필요가 없음
  - 특징
    - 토큰을 소유한 사람은 누구나 해당 토큰으로 인증을 시도할 수 있음
    - 따라서 토큰이 탈취되면 공격자가 사용자처럼 API에 접근할 수 있음
    - 토큰의 유효기간을 설정하고 HTTPS를 사용하여 탈취 위험을 줄여야 함

  ## Authorization 헤더

  - Authorization 헤더란?
    - 클라이언트가 서버에 인증 정보를 전달하기 위해 사용하는 HTTP 요청 헤더
    - Bearer 인증에서는 Bearer라는 인증 스킴 뒤에 Access Token을 담아 전송
    - Bearer는 인증 방식이고, JWT는 전달되는 토큰의 형식, 헤더는 해당 인증이 담길 장소
  - 요청 예시

      ```java
      GET /api/users/me HTTP/1.1
      Host: example.com
      Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
      ```

    - Authorization: 인증 정보를 전달하는 HTTP 헤더
    - Bearer: 토큰 기반 인증 방식을 나타내는 키워드
    - eyJhbGci...: 서버가 발급한 Access Token

  ### Bearer 인증 과정

  - 로그인
    - 사용자가 아이디와 비밀번호로 로그인
    - 서버가 인증에 성공하면 Access Token을 발급
  - API 요청
    - 클라이언트가 Authorization 헤더에 Access Token을 담아 요청
  - 토큰 검증
    - 서버가 토큰의 서명, 만료 시간, 발급자 등을 필요한 기준에 따라 검증
    - JWT의 Payload에 포함된 사용자 식별자 등의 Claim을 활용하여 사용자를 식별
  - 요청 처리
    - 토큰이 유효하면 사용자 권한을 확인한 뒤 요청을 처리
    - 토큰이 없거나 유효하지 않으면 일반적으로 401 Unauthorized 반환
    - 인증은 되었지만 해당 리소스에 접근할 권한이 없으면 403 Forbidden 반환
- HandlerInterceptor / Guard

  ## HandlerInterceptor(spring)

  - 정의
    - 컨트롤러가 실행되기 전후에 요청을 가로채 공통 로직을 처리하는 기능
  - 특징
    - 여러 컨트롤러에 공통으로 적용할 로직을 분리할 수 있음
    - 특정 URL 경로에만 적용하거나 제외할 수 있음
    - Spring Security를 사용하는 경우 JWT 인증은 일반적으로 Security Filter에서 처리
  - interceptor 등록

      ```java
      @Component
      @RequiredArgsConstructor
      public class AuthInterceptor implements HandlerInterceptor {
      
          private final JwtUtil jwtUtil;
      
          @Override
          public boolean preHandle(
                  HttpServletRequest request,
                  HttpServletResponse response,
                  Object handler
          ) {
              String header = request.getHeader("Authorization");
      
              if (header == null || !header.startsWith("Bearer ")) {
                  throw new ApiException(
                      HttpStatus.UNAUTHORIZED,
                      "AUTH401_2",
                      "로그인이 필요한 요청입니다."
                  );
              }
      
              Long memberId = jwtUtil.getMemberId(header.substring(7));
      
              request.setAttribute("memberId", memberId);
      
              return true;
          }
      }
      ```

    - preHandle()에서 컨트롤러 실행 전 JWT를 확인
    - jwtUtil.getMemberId()에서 서명과 만료 시간을 검증하고 사용자 ID 추출
    - request.setAttribute()로 사용자 ID를 요청에 저장
    - true를 반환하면 컨트롤러 실행
  - 컨트롤러 사용

      ```java
      @GetMapping("/me")
      public ResponseEntity<?> getMyInfo(
          @RequestAttribute("memberId") Long memberId
      ) {
          return ResponseEntity.ok(memberService.getMyInfo(memberId));
      }
      ```

    - @RequestAttribute로 Interceptor에서 저장한 memberId를 가져옴
    - 컨트롤러에서 JWT를 직접 검증할 필요가 없음

  ## Guard(NextJS)

  - 정의
    - 요청이 컨트롤러의 핸들러에 접근할 수 있는지 판단하는 기능
  - 특징
    - @UseGuards() 데코레이터를 사용해 적용
    - 컨트롤러나 개별 API에 적용할 수 있으며 전역 적용도 가능
    - JWT 검증이나 역할(Role)에 따른 접근 제어에 활용
- 401 Unauthorized와 403 Forbidden의 차이

  ## 401 Unauthorized

  - 정의
    - 인증되지 않은 사용자가 인증이 필요한 리소스에 접근할 때 반환하는 HTTP 상태 코드
  - 발생 상황
    - Access Token이 없는 경우
    - JWT가 만료되었거나 유효하지 않은 경우
    - 로그인 정보가 올바르지 않은 경우
  - 해결 방법
    - 로그인하거나 유효한 토큰으로 다시 요청

  ## 403 Forbidden

  - 정의
    - 서버가 요청을 이해했지만 해당 리소스에 대한 접근 권한이 없어 요청을 거부할 때 반환하는 HTTP 상태 코드
  - 발생 상황
    - 일반 사용자가 관리자 전용 API에 접근하는 경우
    - 다른 사용자가 작성한 게시글을 수정하거나 삭제하려는 경우
    - 인증은 성공했지만 해당 작업을 수행할 권한이 없는 경우
  - 해결 방법
    - 필요한 권한을 부여받거나 접근 가능한 리소스로 요청