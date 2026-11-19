- 인증(Authentication)과 인가(Authorization)
    
    ### 인증
    
    인증은 **요청을 보낸 사용자가 누구인지 확인하는 과정**이다.
    
    ```
    이메일·비밀번호 확인
    JWT 서명과 만료 시간 검증
    세션 정보 확인
    ```
    
    로그인에 성공하거나 유효한 JWT를 전달하면 서버는 현재 사용자의 신원을 확인할 수 있다.
    
    ### 인가
    
    인가는 **인증된 사용자가 특정 기능이나 리소스를 사용할 권한이 있는지 확인하는 과정**이다.
    
    ```
    현재 사용자가 관리자인가?
    게시글 작성자 본인인가?
    회원 삭제 권한이 있는가?
    ```
    
    ```java
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/members/{memberId}")
    public ResponseEntity<Void> deleteMember(
            @PathVariable Long memberId
    ) {
        memberService.delete(memberId);
        return ResponseEntity.noContent().build();
    }
    ```
    
    | 구분 | 인증 | 인가 |
    | --- | --- | --- |
    | 확인 내용 | 사용자가 누구인가 | 무엇을 할 수 있는가 |
    | 대표 예시 | 로그인, JWT 검증 | 역할, 권한, 소유권 확인 |
    | 처리 순서 | 먼저 수행 | 인증 이후 수행 |
    | 실패 상태 | 주로 `401` | 주로 `403` |
- 해시와 salt, bcrypt
    
    ### 해시
    
    해시는 입력값을 일정한 길이의 값으로 변환하는 단방향 연산이다. 해시값에서 원래 비밀번호를 복원할 수 없어야 한다.
    
    ```
    평문 비밀번호
    → 해시 함수
    → 해시값
    ```
    
    비밀번호는 암호화하여 복호화하는 방식보다 해시값을 저장하고 입력값과 비교하는 방식으로 관리한다.
    
    ### Salt
    
    Salt는 비밀번호를 해싱할 때 추가하는 무작위 값이다.
    
    ```
    같은 비밀번호 + 서로 다른 Salt
    → 서로 다른 해시값
    ```
    
    Salt를 사용하면 같은 비밀번호를 사용하는 회원도 서로 다른 해시값을 가지며, 미리 계산된 해시 목록을 이용한 공격을 어렵게 만든다.
    
    ### bcrypt
    
    bcrypt는 Salt 생성과 반복 연산을 포함한 비밀번호 해시 알고리즘이다. Spring Boot에서는 `BCryptPasswordEncoder`를 사용한다.
    
    ```java
    PasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder(10);
    
    String encodedPassword =
            passwordEncoder.encode(rawPassword);
    ```
    
    로그인할 때는 평문 비밀번호를 다시 `encode()`하여 문자열끼리 비교하면 안 된다. 새로운 Salt가 생성되기 때문이다.
    
    ```java
    boolean matches = passwordEncoder.matches(
            inputPassword,
            savedPassword
    );
    ```
    
    `10`은 Strength 또는 Cost Factor다. 연산 비용은 대략 \(2^{10}\)이며, 값이 1 증가하면 연산량이 약 2배가 된다.
    
    ```
    Strength 10 → 2¹⁰
    Strength 11 → 2¹¹
    Strength 12 → 2¹²
    ```
    
    bcrypt 해시에는 알고리즘 버전, Strength, Salt와 해시 결과가 함께 저장되므로 Salt를 별도 컬럼에 저장할 필요가 없다.
    
- JWT (Header / Payload / Signature, Claim)
    
    JWT는 사용자 인증 정보를 서버와 클라이언트 사이에서 전달할 때 사용하는 토큰 형식이다.
    
    ```
    Header.Payload.Signature
    ```
    
    ### Header
    
    JWT의 종류와 서명 알고리즘을 나타낸다.
    
    ```json
    {
      "typ": "JWT",
      "alg": "HS256"
    }
    ```
    
    ### Payload
    
    사용자 정보와 토큰의 유효 기간 등을 Claim으로 저장한다.
    
    ```json
    {
      "sub": "10",
      "role": "USER",
      "iat": 1794297600,
      "exp": 1794301200
    }
    ```
    
    Payload는 암호화되지 않고 인코딩만 되어 있으므로 누구나 읽을 수 있다. 따라서 비밀번호나 개인정보를 넣으면 안 된다.
    
    ### Signature
    
    Header와 Payload가 발급 후 변경되지 않았는지 검증하기 위한 서명이다.
    
    ```
    서명 유효
    → 신뢰하는 서버가 발급함
    → Header와 Payload가 변경되지 않음
    
    서명 불일치
    → 위조되거나 변조된 토큰
    ```
    
    Signature는 내용을 숨기는 것이 아니라 토큰의 무결성을 확인한다.
    
    ### Claim
    
    Claim은 JWT Payload에 저장되는 각각의 정보를 의미한다.
    
    | Claim | 의미 |
    | --- | --- |
    | `sub` | 토큰의 주체, 일반적으로 사용자 ID |
    | `iss` | 토큰 발급자 |
    | `aud` | 토큰 사용 대상 |
    | `iat` | 발급 시간 |
    | `exp` | 만료 시간 |
    | `nbf` | 토큰 사용이 가능한 시작 시간 |
    | `role` | 사용자 역할 또는 권한 |
    
    JWT를 인증에 사용할 때는 서명뿐만 아니라 `exp`, `iss`, `aud`와 같은 Claim도 함께 검증해야 한다.
    
- Bearer 인증과 Authorization 헤더
    
    Bearer 인증은 클라이언트가 Access Token을 HTTP `Authorization` 헤더에 담아 전달하는 방식이다.
    
    ```
    GET /api/members/me
    Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
    ```
    
    형식은 다음과 같다.
    
    ```json
    Authorization: Bearer {Access Token}
    ```
    
    | 부분 | 의미 |
    | --- | --- |
    | `Authorization` | 인증 정보를 전달하는 HTTP 헤더 |
    | `Bearer` | 인증 방식 |
    | Access Token | 서버가 검증할 토큰 |
    
    Bearer는 토큰을 가지고 있는 사람이 해당 토큰의 권한을 사용할 수 있다는 의미다. 따라서 토큰이 탈취되면 공격자가 사용자처럼 요청할 수 있다.
    
    이를 막기 위해 다음 사항이 필요하다.
    
    - HTTPS 사용
    - 짧은 Access Token 유효기간
    - 토큰을 로그에 출력하지 않기
    - 안전한 저장 위치 사용
    - Refresh Token의 별도 관리
    - 토큰 만료와 서명 검증
    
    ### 요청 처리 과정
    
    ```
    클라이언트가 Authorization 헤더 전송
    → 서버가 Bearer Token 추출
    → JWT 서명과 만료 시간 검증
    → 사용자 정보 확인
    → 권한 확인
    → Controller 실행
    ```
    
- HandlerInterceptor / Guard
    
    ### `HandlerInterceptor`
    
    `HandlerInterceptor`는 Spring MVC에서 Controller 실행 전후에 공통 로직을 처리하는 기능이다.
    
    ```java
    public class AuthInterceptor
            implements HandlerInterceptor {
    
        @Override
        public boolean preHandle(
                HttpServletRequest request,
                HttpServletResponse response,
                Object handler
        ) {
            // Controller 실행 전 처리
            return true;
        }
    }
    ```
    
    | 메서드 | 실행 시점 |
    | --- | --- |
    | `preHandle()` | Controller 실행 전 |
    | `postHandle()` | Controller 실행 후, 응답 완성 전 |
    | `afterCompletion()` | 요청 처리가 모두 끝난 후 |
    
    다음과 같은 공통 처리에 사용할 수 있다.
    
    - 요청 로그 기록
    - 실행 시간 측정
    - 특정 요청 정보 검사
    - Controller의 어노테이션 확인
    
    다만 Spring Boot에서 JWT 인증과 권한 검사는 일반적으로 `HandlerInterceptor`보다 Spring Security의 Filter와 `SecurityFilterChain`을 사용하는 것이 적절하다.
    
    ```
    HTTP 요청
    → Security Filter
    → DispatcherServlet
    → HandlerInterceptor
    → Controller
    ```
    
    Filter가 `HandlerInterceptor`보다 먼저 실행되기 때문에 Controller에 도달하기 전 인증 정보를 구성할 수 있다.
    
    ### Guard
    
    Guard는 NestJS에서 현재 요청을 Controller가 처리하도록 허용할지 결정하는 기능이다.
    
    ```
    요청
    → Guard에서 인증·권한 확인
    → true이면 Controller 실행
    → false이면 접근 거부
    ```
    
    Spring의 `HandlerInterceptor`와 NestJS의 Guard는 모두 Controller 실행 전에 동작할 수 있지만 역할이 완전히 같지는 않다.
    
    | 구분 | Spring `HandlerInterceptor` | NestJS Guard |
    | --- | --- | --- |
    | 기본 목적 | Controller 전후 공통 처리 | 요청의 접근 허용 여부 결정 |
    | 반환값 | `preHandle()`의 `boolean` | `canActivate()`의 `boolean` |
    | 인증·인가 권장 방식 | Spring Security | Guard |
    | 실행 위치 | Spring MVC 처리 과정 | NestJS 실행 과정 |
    
    > NestJS의 Guard와 가장 가까운 Spring 기능은 단순한 `HandlerInterceptor`보다 Spring Security의 인증·인가 처리 및 `@PreAuthorize`다.
    > 
- 401 Unauthorized와 403 Forbidden의 차이
    
    ### `401 Unauthorized`
    
    인증 정보가 없거나 올바르지 않아 사용자가 누구인지 확인할 수 없는 경우다.
    
    ```
    Authorization 헤더가 없음
    JWT가 만료됨
    JWT 서명이 올바르지 않음
    로그인 정보가 틀림
    ```
    
    ```
    HTTP/1.1 401 Unauthorized
    WWW-Authenticate: Bearer
    ```
    
    이름은 `Unauthorized`지만 실제 의미는 인가보다 **인증 실패**에 가깝다.
    
    ### `403 Forbidden`
    
    사용자가 누구인지는 확인했지만 해당 기능을 사용할 권한이 없는 경우다.
    
    ```
    일반 사용자가 관리자 API 요청
    다른 사용자의 게시글 수정 요청
    필요한 역할이나 권한이 없음
    ```
    
    ```
    HTTP/1.1 403 Forbidden
    ```
    
    ### 차이 정리
    
    | 구분 | `401 Unauthorized` | `403 Forbidden` |
    | --- | --- | --- |
    | 인증 여부 | 인증되지 않음 | 인증됨 |
    | 실패 이유 | 사용자 확인 불가 | 접근 권한 부족 |
    | 해결 방법 | 로그인하거나 유효한 토큰 제출 | 필요한 권한을 부여받아야 함 |
    | 예시 | 만료된 JWT | 일반 사용자의 관리자 API 요청 |
    
    ```
    토큰이 없거나 유효하지 않음
    → 401 Unauthorized
    
    토큰은 유효하지만 권한이 없음
    → 403 Forbidden
    ```
    
    > `401`은 “누구인지 확인할 수 없음”, `403`은 “누구인지는 알지만 이 기능은 사용할 수 없음”을 의미한다.
    >