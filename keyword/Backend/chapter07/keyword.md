- 인증(Authentication)과 인가(Authorization)
    
    > 인증은 요청자가 누구인지 확인하는 과정이고, 인가는 그 요청자가 특정 기능이나 데이터에 접근할 수 있는지 판단하는 과정이다.
    > 
    
    영화 서비스에서 로그인한 회원이 리뷰를 삭제하는 상황을 생각해 보자. 서버는 먼저 액세스 토큰을 확인해 요청한 회원을 식별한다. 그다음 삭제하려는 리뷰를 조회해 해당 회원이 작성자이거나 삭제 권한을 가진 관리자인지 확인한다.
    
    ```
    DELETE /reviews/42
            ↓
    인증 → 요청자가 7번 회원임을 확인
            ↓
    인가 → 7번 회원이 42번 리뷰를 삭제할 수 있는지 확인
            ↓
    리뷰 삭제
    ```
    
    ## 인증은 언제 이루어질까?
    
    인증은 로그인할 때와 로그인 이후 보호된 API를 호출할 때 모두 이루어질 수 있다. 두 시점에서 확인하는 정보가 다르다.
    
    | 시점 | 서버가 확인하는 정보 | 처리 결과 |
    | --- | --- | --- |
    | 로그인 요청 | 입력한 이메일과 비밀번호가 등록된 계정 정보와 일치하는지 | 세션을 생성하거나 액세스 토큰을 발급 |
    | 로그인 이후 API 요청 | 요청에 포함된 세션 쿠키나 액세스 토큰이 유효한지 | 현재 요청을 보낸 사용자를 식별 |
    
    예를 들어 JWT를 사용하는 서비스라면 로그인할 때 비밀번호를 확인한 뒤 토큰을 발급한다. 이후 `/bookmarks` 요청에서는 액세스 토큰의 서명과 만료 시각 등을 검증하고, 토큰의 `sub`를 이용해 어느 회원의 요청인지 식별할 수 있다.
    
    ## 인가는 어떤 기준으로 판단할까?
    
    | 기준 | 확인하는 내용 | 예시 |
    | --- | --- | --- |
    | 역할 | 사용자에게 어떤 역할이 부여되어 있는가? | 관리자만 영화 정보를 등록할 수 있음 |
    | 소유권 | 요청한 자원이 해당 사용자의 것인가? | 작성자가 자신의 리뷰를 수정할 수 있음 |
    | 소속 | 요청자가 해당 조직이나 그룹의 구성원인가? | 영화 동아리 구성원만 비공개 목록을 열람할 수 있음 |
    | 권한 범위 | 허용된 동작이 어디까지인가? | 영화 정보를 조회할 수 있지만 수정은 할 수 없음 |
    
    역할을 기준으로 권한을 관리하는 방식을 RBAC라고 한다. 예를 들어 `ADMIN` 역할은 관리자용 메뉴를 이용할 수 있고, `USER` 역할은 일반 회원용 기능을 이용할 수 있다. 그러나 같은 `USER` 역할이라도 수정할 수 있는 리뷰는 다르다. 이 경우 역할과 함께 각 리뷰의 소유권을 확인해야 한다.
    
    ---
    
    ## 소유권 확인
    
    ```tsx
    type AuthenticatedUser = {
      id: string;
      role: "USER" | "ADMIN";
    };
    
    type Review = {
      id: string;
      authorId: string;
    };
    
    function canDeleteReview(
      user: AuthenticatedUser,
      review: Review,
    ): boolean {
      return user.role === "ADMIN" || user.id === review.authorId;
    }
    ```
    
    이 예시에서 `user.id`는 서버가 검증한 인증 정보에서 얻고, `review.authorId`는 DB에서 조회한다. 요청 본문으로 받은 `userId`나 `role`은 클라이언트가 정할 수 있는 입력값이므로 권한을 증명하는 데 사용할 수 없다.
    
    프론트엔드에서 삭제 버튼을 숨기면 사용자가 해당 기능을 이용할 수 없다는 점을 화면에 표현할 수 있다. 실제 삭제 허용 여부는 API 요청을 받은 서버가 판단한다. 프론트엔드를 거치지 않고 API를 직접 호출하는 경우에도 같은 권한 규칙이 적용되어야 하기 때문이다.
    
- 해시와 salt, bcrypt
    
    ## 해시를 사용해 비밀번호 저장하기
    
    > 비밀번호 해시는 로그인 시 입력한 비밀번호가 맞는지 확인하기 위해 저장하는 값이다.
    > 
    
    회원가입 시 서버는 입력한 비밀번호로 해시를 생성해 DB에 저장한다. 로그인할 때는 저장된 해시와 사용자가 새로 입력한 비밀번호를 검증 함수에 전달한다. 서버가 확인하려는 결과는 입력한 비밀번호가 일치하는지 여부이다.
    
    ```
    회원가입
    비밀번호 입력 → 해시 생성 → DB에 해시 저장
    
    로그인
    비밀번호 입력 → DB의 해시 조회 → 일치 여부 검증
    ```
    
    SHA-256처럼 계산이 빠른 범용 해시를 단독으로 사용하면 공격자도 비밀번호 후보를 빠르게 시험할 수 있다. bcrypt는 후보 하나를 확인할 때 필요한 계산 비용을 높여, 해시가 유출되었을 때 많은 후보를 시험하는 데 걸리는 시간을 늘린다.
    
    ## salt는 왜 사용할까?
    
    > salt는 비밀번호 해시를 생성할 때 함께 사용하는 무작위 값이다.
    > 
    
    두 회원이 같은 비밀번호를 선택하더라도, 각 해시에 서로 다른 salt를 사용하면 저장 결과가 달라진다.
    
    ```
    회원 A → 같은 비밀번호 + salt A → 해시 A
    회원 B → 같은 비밀번호 + salt B → 해시 B
    ```
    
    이렇게 하면 해시 문자열만 보고 두 회원이 같은 비밀번호를 쓴다고 알아내기 어렵다. 또한 한 계정을 대상으로 계산한 후보의 해시를 다른 salt를 쓰는 계정에 그대로 적용하기 어렵다.
    
    salt는 검증할 때도 필요하다. bcrypt가 반환하는 문자열에는 비용 설정, salt, 해시 결과가 함께 들어 있으므로 보통 반환값 전체를 DB에 저장한다. `compare()`는 이 문자열에서 필요한 정보를 읽어 입력 비밀번호를 검사한다.
    
    ## `saltRounds`가 의미하는 것
    
    Node.js의 `bcrypt` 패키지에서 `hash()`의 두 번째 인자에 숫자를 넘기면 해당 숫자를 비용 값으로 사용하고, 라이브러리가 무작위 salt를 생성한다.
    
    ```tsx
    import * as bcrypt from "bcrypt";
    
    const saltRounds = 12;
    
    // 회원가입 시 생성한 값을 DB에 저장한다.
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // 로그인 시 DB에서 조회한 해시로 입력값을 확인한다.
    const matches = await bcrypt.compare(
      inputPassword,
      storedPasswordHash,
    );
    ```
    
    `saltRounds = 12`는 salt를 12개 만든다는 뜻이 아니다. bcrypt의 비용 값은 로그 스케일이어서, 값이 1 커질 때 핵심 계산량은 대략 두 배가 된다.
    
    | 비용 변화 | 핵심 계산량 변화 |
    | --- | --- |
    | `10 → 11` | 약 2배 |
    | `10 → 12` | 약 4배 |
    
    `12`는 예시 값이다. 실제 비용은 배포 환경에서 로그인 응답 시간과 동시 요청 처리량을 측정해 정한다. Node.js 서버에서는 동기식 해시 계산으로 이벤트 루프를 오래 점유하지 않도록 일반적으로 `await bcrypt.hash()`와 `await bcrypt.compare()`를 사용한다.
    
    ## 구현할 때 헷갈리기 쉬운 부분
    
    - 로그인할 때 `hash()`를 새로 호출하면 새 salt가 생성될 수 있다. 같은 비밀번호라도 저장된 문자열과 달라질 수 있으므로 `compare()`로 확인한다.
    - bcrypt는 비밀번호 입력의 처음 72바이트를 사용한다. 한글이나 이모지는 한 문자에 여러 바이트가 필요할 수 있으므로 길이 정책을 정할 때는 `Buffer.byteLength(password, "utf8")`로 바이트 수를 확인할 수 있다.
    - DTO에서 비밀번호의 길이나 형식을 검증하는 일은 회원가입 입력 정책에 해당한다. 로그인에서 입력한 비밀번호가 해당 회원의 것인지 확인하는 일은 `compare()`가 담당한다.
- JWT (Header / Payload / Signature, Claim)
    
    > JWT는 사용자 식별자, 발급자, 만료 시각 등의 정보를 클레임으로 담아 전달하는 토큰 형식이다.
    > 
    
    아래는 Node.js 인증에서 흔히 사용하는 서명형 JWT를 기준으로 한 설명이다. 이 형태의 토큰은 점으로 구분된 세 부분으로 이루어진다.
    
    ```
    header.payload.signature
    ```
    
    | 부분 | 역할 | 예시 |
    | --- | --- | --- |
    | Header | 토큰을 처리하는 데 필요한 메타데이터 | `alg`, `typ` |
    | Payload | 발급자가 전달하는 클레임 | `sub`, `exp`, `role` |
    | Signature | 검증 키를 사용해 토큰 내용과 서명이 일치하는지 확인하는 데 사용 | HMAC으로 생성한 메시지 인증 코드, 개인 키로 생성한 디지털 서명 등 |
    
    ## Header
    
    Header에는 서명 알고리즘 등의 정보가 들어간다.
    
    ```json
    {
      "alg": "HS256",
      "typ": "JWT"
    }
    ```
    
    `HS256`은 공유 비밀 키를 사용하는 HMAC-SHA256 방식이다. 서버는 토큰의 `alg` 값을 읽되, 실제 검증에는 서버 설정에서 허용한 알고리즘과 키를 사용한다. 예를 들어 액세스 토큰을 HS256으로만 발급하는 서비스라면 검증에서도 그 정책을 적용한다.
    
    ## Payload와 Claim
    
    Claim은 토큰이 전달하는 개별 정보이다. 예를 들어 다음 Payload는 `movie-auth`가 `movie-api`에 사용할 토큰을 발급했으며, 토큰의 주체가 `7`이라는 정보를 담고 있다.
    
    ```json
    {
      "sub": "7",
      "iss": "movie-auth",
      "aud": "movie-api",
      "role": "USER",
      "iat": 1700000000,
      "exp": 1700003600
    }
    ```
    
    | 클레임 | 의미 |
    | --- | --- |
    | `sub` | 토큰의 주체. 서비스에서 사용자 식별자로 사용할 수 있음 |
    | `iss` | 토큰을 발급한 주체 |
    | `aud` | 이 토큰을 받아 사용하도록 지정된 대상 |
    | `iat` | 토큰을 발급한 시각 |
    | `exp` | 토큰의 만료 시각 |
    | `nbf` | 토큰 사용이 허용되는 시작 시각 |
    | `role` | 위 예시에서 서비스가 직접 정의한 역할 정보 |
    
    `iat`, `exp`, `nbf`의 시간값은 Unix epoch 기준 초 단위로 표현한다. JavaScript의 `Date.now()`는 밀리초 단위이므로 값을 직접 작성한다면 단위를 맞춰야 한다.
    
    JWT에 들어 있는 `role`은 발급 시점의 역할일 수 있다. 예를 들어 토큰 발급 이후 관리자 권한이 회수되어도 기존 토큰에는 `ADMIN`이 남아 있을 수 있다. 권한 변경을 즉시 반영해야 하는 기능이라면 서버에서 현재 권한을 추가로 확인하는 방식이 필요하다.
    
    ## Signature와 토큰 검증
    
    Signature는 인코딩된 Header와 Payload를 대상으로 생성한다. 예를 들어 Payload에서 `sub`나 `role` 값이 바뀌면, 기존 Signature는 변경된 내용과 일치하지 않는다. 서버는 이 관계를 검사해 토큰 변조를 발견할 수 있다.
    
    | 처리 | 확인할 수 있는 내용 |
    | --- | --- |
    | 디코딩 | Header와 Payload에 어떤 값이 들어 있는지 |
    | 서명 검증 | 신뢰하는 키로 보호된 토큰인지, 내용이 바뀌었는지 |
    | 클레임 검증 | 토큰이 만료되었는지, 올바른 발급자와 대상을 갖는지 |
    
    서명이 유효한 토큰도 이미 만료되었거나 다른 API에서 사용할 목적으로 발급되었을 수 있다. 따라서 보호된 API에서는 서명과 함께 만료 시각, 발급자, 대상 등 서비스가 요구하는 클레임을 검사한다.
    
    ## Payload에 비밀번호를 담으면 안 되는 이유
    
    서명형 JWT에서 Header와 Payload는 Base64url로 인코딩된다. 토큰을 가진 사람은 비밀 키 없이도 Payload를 디코딩할 수 있다. 따라서 토큰이 로그나 오류 수집 도구 등에 남으면 안에 넣은 비밀번호나 비밀번호 해시까지 노출될 수 있다.
    
    비밀번호는 로그인 요청에서 검증하고, 발급하는 토큰에는 사용자 식별자와 유효기간처럼 이후 요청을 처리하는 데 필요한 정보만 담는다.
    
- Bearer 인증과 Authorization 헤더
    
    > Bearer 인증은 클라이언트가 토큰을 제시하고, 서버가 그 토큰을 검증해 요청을 처리하는 방식이다.
    > 
    
    로그인 응답으로 받은 액세스 토큰을 이후 HTTP 요청의 `Authorization` 헤더에 담을 수 있다.
    
    ```
    GET /api/bookmarks HTTP/1.1
    Host: api.example.com
    Authorization: Bearer <access-token>
    ```
    
    | 구성 | 역할 |
    | --- | --- |
    | `Authorization` | 요청에 인증 자격 증명을 전달하는 HTTP 헤더 |
    | `Bearer` | 토큰을 제시하는 인증 방식 |
    | `<access-token>` | 서버가 확인할 실제 토큰 값 |
    
    ## JWT와 Bearer는 어떤 관계일까?
    
    JWT는 토큰 내부의 형식을 설명한다. Bearer는 그 토큰을 제시해 접근 권한을 얻는 방식을 설명한다. 따라서 JWT를 Bearer 방식으로 보낼 수도 있고, 내부 정보를 읽을 수 없어 서버에서 조회해야 하는 불투명 토큰을 Bearer 방식으로 보낼 수도 있다.
    
    ```
    JWT           → 토큰이 어떤 구조로 만들어졌는가?
    Bearer        → 토큰을 어떻게 제시하고 사용하는가?
    Authorization → HTTP 요청의 어디에 인증 정보를 전달하는가?
    ```
    
    ## TypeScript 요청 예시
    
    ```tsx
    async function getBookmarks(accessToken: string): Promise<Response> {
      return fetch("https://api.example.com/bookmarks", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }
    ```
    
    Node.js HTTP 요청 객체에서 헤더 이름은 일반적으로 소문자로 접근하므로, Express 기반 NestJS 서버에서는 `request.headers.authorization`으로 값을 확인할 수 있다. 인증 Guard나 인증 전략은 이 값에서 Bearer 토큰을 추출한 후 검증한다.
    
    ```
    헤더 읽기 → Bearer 토큰 추출 → 토큰 검증 → 사용자 식별
    ```
    
    `Authorization`이라는 헤더 이름이 붙어 있더라도, 이 단계에서 확인한 것은 요청에 제시된 인증 정보이다. 사용자가 실제로 어떤 자원을 조회하거나 수정할 수 있는지는 서버의 인가 정책이 결정한다.
    
    Bearer 토큰은 유효한 값을 가진 사람이 제시할 수 있다. 토큰이 유출되면 다른 사람이 그대로 사용할 수 있으므로 HTTPS로 전송하고, 서버 로그에 헤더 전체가 남지 않도록 관리한다.
    
- HandlerInterceptor / Guard
    
    > Spring MVC의 `HandlerInterceptor`는 핸들러 실행 전후에 공통 처리를 연결하는 기능이다. Node.js의 NestJS에서는 요청을 허용하거나 거절하는 판단을 Guard로 표현할 수 있다.
    > 
    
    ## Spring MVC의 `HandlerInterceptor`
    
    Spring MVC는 요청을 처리할 핸들러를 찾은 뒤 Interceptor를 호출할 수 있다.
    
    | 메서드 | 호출 시점과 역할 |
    | --- | --- |
    | `preHandle()` | 핸들러 실행 전. `false`를 반환하면 실행을 중단할 수 있음 |
    | `postHandle()` | 핸들러가 정상적으로 실행된 뒤 후처리 |
    | `afterCompletion()` | 요청 처리가 끝난 뒤 정리 작업 등에 사용 |
    
    `preHandle()`에서 실행을 중단할 수 있다는 점은 NestJS Guard와 비슷하다. 다만 Spring에서 애플리케이션 전체의 인증·인가를 구성할 때는 보통 Spring Security의 필터 체인을 사용한다.
    
    ## NestJS의 Guard
    
    Guard는 `canActivate()`에서 요청이 특정 핸들러를 실행할 수 있는지 판단한다. 개별 라우트, Controller 전체 또는 애플리케이션 전역에 적용할 수 있다.
    
    | `canActivate()`의 결과 | NestJS의 처리 |
    | --- | --- |
    | `true` | 요청 처리를 이어감 |
    | `false` | 기본적으로 `403 Forbidden` 응답 |
    | `UnauthorizedException` 발생 | `401 Unauthorized` 응답 |
    | `ForbiddenException` 발생 | `403 Forbidden` 응답 |
    
    인증과 인가를 별도 Guard로 구성하면 각 단계가 어떤 정보를 확인하는지 드러난다.
    
    ```
    JwtAuthGuard
    → Bearer 토큰 검증
    → 확인된 사용자 정보를 request.user에 설정
    
    AdminGuard
    → request.user에 있는 사용자 역할 확인
    → 관리자일 때 요청 통과
    ```
    
    ## TypeScript로 관리자 Guard 작성하기
    
    다음 예시는 앞선 `JwtAuthGuard`가 토큰을 검증하고 `request.user`를 설정한다고 가정한다.
    
    ```tsx
    import {
      CanActivate,
      ExecutionContext,
      ForbiddenException,
      Injectable,
      UnauthorizedException,
    } from "@nestjs/common";
    
    type RequestWithUser = {
      user?: {
        id: string;
        role: "USER" | "ADMIN";
      };
    };
    
    @Injectable()
    export class AdminGuard implements CanActivate {
      canActivate(context: ExecutionContext): boolean {
        const request = context
          .switchToHttp()
          .getRequest<RequestWithUser>();
    
        if (!request.user) {
          throw new UnauthorizedException("인증이 필요합니다.");
        }
    
        if (request.user.role !== "ADMIN") {
          throw new ForbiddenException(
            "관리자 권한이 필요한 기능입니다.",
          );
        }
    
        return true;
      }
    }
    ```
    
    관리자 전용 라우트에 두 Guard를 순서대로 적용할 수 있다.
    
    ```tsx
    @Post("movies")
    @UseGuards(JwtAuthGuard, AdminGuard)
    createMovie(@Body() dto: CreateMovieDto) {
      return this.moviesService.create(dto);
    }
    ```
    
    토큰이 유효하지 않으면 인증 단계에서 요청이 중단된다. 토큰이 유효한 일반 회원은 인증을 통과하지만, `AdminGuard`에서 거절된다. 관리자는 두 Guard를 통과해 Controller의 영화 등록 처리를 실행할 수 있다.
    
    ## Guard, Interceptor, Pipe를 구분하는 기준
    
    | 기능 | 확인하거나 처리하는 내용 | 예시 |
    | --- | --- | --- |
    | Guard | 이 요청이 핸들러를 실행할 수 있는가? | 로그인 여부, 관리자 권한 |
    | Interceptor | 핸들러 실행을 감싸 어떤 공통 처리를 할 것인가? | 처리 시간 측정, 응답 형식 변환 |
    | Pipe | 핸들러에 전달할 입력값이 올바른가? | DTO 검증, 경로 파라미터 변환 |
    
    관리자 여부처럼 라우트 단위에서 결정할 수 있는 규칙은 Guard에 두기 좋다. 리뷰 작성자인지 확인하는 규칙처럼 대상 데이터를 조회해야 하는 경우에는, 리뷰를 조회한 Service에서 삭제 권한을 함께 확인할 수 있다. 예를 들어 Guard에서 로그인 여부를 확인하고, Service에서 리뷰의 `authorId`와 인증된 사용자 ID를 비교하는 구조이다.
    
- 401 Unauthorized와 403 Forbidden의 차이
    
    > 보호된 API에서 `401`은 유효한 인증 자격 증명이 필요하다는 응답이고, `403`은 서버가 요청을 이해했지만 수행을 허용하지 않는다는 응답이다.
    > 
    
    | 상황 | 일반적인 응답 | 판단 기준 |
    | --- | --- | --- |
    | 액세스 토큰 없이 내 북마크 조회 | `401` | 사용자를 확인할 인증 정보가 없음 |
    | 만료된 액세스 토큰으로 내 북마크 조회 | `401` | 현재 요청에 사용할 수 있는 인증 정보가 아님 |
    | 서명 검증에 실패한 토큰으로 요청 | `401` | 토큰을 유효한 인증 정보로 받아들일 수 없음 |
    | 일반 회원이 관리자 전용 API 호출 | `403` | 사용자는 확인되었으나 관리자 권한이 없음 |
    | 회원이 다른 사람의 리뷰 삭제 요청 | `403` | 대상 리뷰에 대한 삭제 권한이 없음 |
    
    ## `401 Unauthorized`
    
    코드 이름에 `Unauthorized`가 들어가지만, 보호된 API에서는 인증 정보를 받지 못했거나 받은 정보를 유효하게 검증할 수 없을 때 사용한다.
    
    ```json
    HTTP/1.1 401 Unauthorized
    WWW-Authenticate: Bearer
    Content-Type: application/json
    
    {
      "code": "AUTHENTICATION_REQUIRED",
      "message": "로그인이 필요합니다."
    }
    ```
    
    HTTP의 `401` 응답은 `WWW-Authenticate` 헤더로 사용할 수 있는 인증 방식을 알려준다. 위 예시에서는 `Bearer`를 사용한다는 정보를 전달한다. NestJS의 `UnauthorizedException`은 상태와 응답 본문을 표현할 수 있으며, 인증 헤더는 사용하는 인증 전략이나 HTTP 응답 처리에서 설정한다.
    
    프론트엔드는 서비스 정책에 따라 로그인을 안내하거나 액세스 토큰을 갱신할 수 있다. 예를 들어 세션이 유효해 새 토큰을 받을 수 있다면 원래 요청을 다시 보낼 수 있다. 갱신할 수 없다면 로그인 화면으로 안내한다.
    
    ## `403 Forbidden`
    
    서버가 요청을 이해했지만 정책상 허용하지 않을 때 사용한다. 예를 들어 일반 회원의 JWT가 정상적으로 검증되어도, 해당 회원에게 영화 등록 권한이 없다면 `403`을 반환할 수 있다.
    
    ```json
    HTTP/1.1 403 Forbidden
    Content-Type: application/json
    
    {
      "code": "ADMIN_REQUIRED",
      "message": "관리자 권한이 필요한 기능입니다."
    }
    ```
    
    NestJS에서는 다음과 같이 표현할 수 있다.
    
    ```tsx
    throw new ForbiddenException({
      code: "ADMIN_REQUIRED",
      message: "관리자 권한이 필요한 기능입니다.",
    });
    ```
    
    `403`은 인증된 사용자의 권한 부족을 설명할 때 자주 사용된다. HTTP에서의 의미는 더 넓어서, 서버가 요청을 거부하는 다른 정책에도 사용할 수 있다. 또한 비공개 자원의 존재 자체를 숨기는 정책이라면 서버가 `403` 대신 `404`를 반환할 수도 있다.
    
    ## 같은 API에 적용해 보기
    
    `DELETE /reviews/42`를 호출할 때, 토큰이 없거나 만료되었다면 인증 Guard에서 `401`을 반환할 수 있다. 유효한 토큰을 제출했지만 리뷰 작성자도 관리자도 아니라면 권한 검사에서 `403`을 반환한다. 권한 검사까지 통과해 리뷰를 삭제했고 응답 본문을 보낼 필요가 없다면 `204 No Content`로 응답할 수 있다.