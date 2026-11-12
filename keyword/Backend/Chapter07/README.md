# Backend Chapter07

## 키워드 정리

### 인증(Authentication)과 인가(Authorization)

**인증(Authentication)**

- 인증은 요청한 사용자가 누구인지 확인하는 과정
- 로그인 시 이메일과 비밀번호를 확인하거나, 이후 요청에서 토큰을 검증해 사용자를 식별하는 과정이 해당한다.

**인가(Authorization)**

- 인가는 해당 사용자가 특정 기능이나 데이터에 접근할 권한이 있는지 확인하는 과정이다.
- 관리자 권한이 있는지, 수정하려는 게시글의 작성자인지 등을 확인한다.

일반적으로 사용자를 인증한 뒤, 요청한 작업을 수행할 수 있는지 판단한다.

### 해시와 salt, bcrypt

**bcrypt란?**

- bcrypt는 비밀번호 저장을 위해 사용하는 해시 알고리즘이다. 비밀번호 원문 대신 해시를 저장하며, 로그인 시 입력한 비밀번호가 저장된 해시와 일치하는지 검사한다.
- 암호화와 달리 해시를 복호화하여 원래 비밀번호로 되돌리는 방식이 아니다.

**salt란?**

- salt는 비밀번호 해싱에 사용하는 무작위 값이다. 같은 비밀번호라도 서로 다른 salt를 사용하면 다른 해시가 생성된다.
- bcrypt의 결과 문자열에는 salt와 연산 비용 정보가 포함되므로, 일반적으로 salt를 별도 컬럼에 저장할 필요는 없다.

**salt rounds란?**

- 흔히 salt rounds라고 부르는 값은 bcrypt의 연산 비용을 결정하는 cost factor다. Spring의 BCryptPasswordEncoder에서는 이를 strength로 지정한다.
- 값이 1 증가하면 주요 계산 비용은 대략 2배가 된다. 값이 높을수록 비밀번호 추측 공격의 비용이 커지지만, 정상적인 로그인 처리도 느려진다.

```tsx
PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);

// 회원가입: 해시 생성
String encodedPassword = passwordEncoder.encode(rawPassword);

// 로그인: 일치 여부 확인
boolean matches =
    passwordEncoder.matches(inputPassword, encodedPassword);
    
//매번 salt가 달라질 수 있으므로 새로 생성한 해시를 문자열로 비교하지 않는다.
//검증에는 matches()를 사용한다.
```

### JWT (Header / Payload / Signature, Claim)

**header, payload, signature**

일반적으로 사용하는 서명된 JWT는 다음 세 부분으로 구성되며, 각 부분은 점(.)으로 구분된다.

```tsx
Header.Payload.Signature
```

**Header: 토큰과 서명 방식에 대한 정보**

```tsx
{
	"alg": "HS256", //서명 알고리즘
	"typ": "JWT"    //토큰의 종류
}
```

- Header에는 서명 알고리즘 등 토큰을 처리하는 데 필요한 정보가 들어간다.
- 서버는 토큰에 적힌 알고리즘을 무조건 따르는 것이 아니라, 서버에서 허용한 알고리즘과 키를 기준으로 검증해야 한다.

**Payload: 전달할 정보**

```tsx
{
	"sub": "123",      //토큰의 대상 식별자
	"role": "USER",    //서비스에서 정의한 권한 정보의 예시
	"exp": 1839456000  //만료 시각
}
```

- **Claim 종류**

    | Claim | 의미 |
    | --- | --- |
    | sub | 토큰의 대상 식별자. 사용자 ID 등으로 사용 |
    | exp | 만료 시각 |
    | iat | 발급 시각 |
    | iss | 발급자 |
    | add | 토큰을 사용할 대상 |
    | role | 서비스에서 정의한 권한 정보의 예시 |

- Payload에는 사용자 식별자, 만료 시각 등의 정보가 들어간다. 이 안의 개별 정보 항목을 Claim(클레임)이라고 한다.
- Payload는 일반적인 서명 JWT에서 암호화되지 않으므로 내용을 읽을 수 있다.

### Bearer 인증과 Authorization 헤더

**Authorization 헤더**

Authorization은 HTTP 요청에 인증 정보를 담아 보내는 헤더다.

JWT를 사용하는 경우 일반적으로 다음과 같이 전송한다.

```tsx
Authorization: Bearer <JWT>
```

**Bearer 인증**

Bearer는 토큰이 보유한 사람이 그 토큰을 제시하여 사용하는 인증 방식이다.

따라서 토큰이 유출되면 다른 사람도 사용할 수 있으므로, 비밀번호와 별개로 토큰 자체도 보호해야 한다.

| 구분 | 의미 |
| --- | --- |
| JWT | 전달하는 토큰의 형식 |
| Bearer | 토큰을 사용하는 인증 방식 |
| Authorization | 인증 정보를 담는 HTTP 헤더 |

**Spring에서의 처리**

학습용으로 직접 처리한다면 요청 헤더를 다음처럼 읽을 수 있다.

```tsx
String authorization = request.getHeader("Authorization");
```

이후 Bearer 접두어를 확인하고 토큰을 추출한 뒤 검증한다.

Spring Security의 JWT 인증 기능을 구성한 경우에는 관련 필터가 토큰 추출과 인증 처리를 담당할 수 있다.

### HandlerInterceptor / Guard

HandlerInterceptor는 Spring MVC에서 컨트롤러 실행 전후에 공통 처리를 수행하는 기능이다.

주요 메서드는 다음과 같다.

| 메서드 | 실행 시점 |
| --- | --- |
| preHandle() | 컨트롤러 실행 전 |
| postHandle() | 컨트롤러 실행 후, 뷰 렌더링 전 |
| afterCompletion() | 요청 처리 완료 후 |

학습용 인증 구현에는 preHandle()에서 토큰을 검증하고, 유효하지 않으면 컨트롤러 실행을 막을 수 있다.

- true 반환: 다음 단계로 진행
- false 반환: 진행 중단. 필요한 응답 처리도 해야 함

검증된 사용자 정보를 요청 속성에 넣고, 컨트롤러나 별도 인자 해석기에서 꺼내 쓰는 방식도 가능하다.

**Spring Security와의 차이**

Interceptor는 인증·인가 전용 기능이 아니다.

실제 Spring 애플리케이션에서는 일반적으로 Spring Security의 필터 체인을 통해 인증·인가를 처리한다.

```tsx
요청
→ Spring Security 필터 체인
→ Spring MVC Interceptor
→ 컨트롤러
→ 서비스
```

**NestJS의 Guard**

Guard는 NextJS에서 요청을 허용할지 판단하는 기능이다. 인증 여부나 접근 권한 검사에 사용한다.

컨트롤러 실행 전에 검사할 수 있다는 점은 비슷하지만, Spring의 HandlerInterceptor와 정확히 같은 기능은 아니다.

### 401 Unauthorized와 403 Forbidden의 차이

**401 Unauthorized: 유효한 인증 정보가 없음**

인증이 필요한 요청에서 사용자를 유효하게 인증하지 못한 경우다.

- 토큰이 없음
- 토큰이 만료됨
- 토큰의 서명이 유효하지 않음

이 경우에는 보통 로그인하거나, 유효한 토큰을 다시 전달해야 한다.

**403 Forbidden: 요청을 수행할 권한이 없음**

인증은 되었지만 해당 작업이 허용되지 않는 경우가 대표적이다.

| 요청 상황 | 일반적인 응답 |
| --- | --- |
| 토큰 없이 게시글 수정 요청 | 401 |
| 만료된 토큰으로 게시글 수정 요청 | 401 |
| 유효한 토큰이지만 다른 사람의 게시글 수정 요청 | 403 |

**Spring Security에서의 처리**

Spring Security에서는 일반적으로 다음 역할을 구분한다.

- AuthenticationEntryPoint: 인증이 필요한 상황의 응답 처리
- AccessDeniedHandler: 접근 권한이 부족한 상황의 응답 처리

API에서는 이들을 구성해 각각 401, 403과 JSON 오류 본문을 반환할 수 있다. 기본 동작은 로그인 방식과 보안 설정에 따라 달라질 수 있다

서비스에서 직접 발생시킨 작성자 불일치 예외는 별도의 공통 예외 처리기로 403에 매핑할 수도 있다.
