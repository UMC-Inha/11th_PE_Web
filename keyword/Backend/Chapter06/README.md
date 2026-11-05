# Backend Chapter06

## 키워드 정리

### Bean Validation과 @Valid

**Bean Validation**은 객체의 데이터가 정해진 조건을 만족하는지 검사하는 Java 표준이다. 현재는 Jakarta Validation이라는 이름을 사용하며, Hibernate Validator가 대표적인 구현체이다.

DTO의 필드에 어노테이션으로 검증 조건을 선언한다.

- `@NotNull`: null이 아닌지
- `@NotBlank`: 문자열이 null이거나 비어있거나 공백만으로 이루어져있지 않은지
- `@Email`: 이메일 형식인지
- `@Size`: 문자열 길이나 컬렉션 크기가 지정된 범위인지

**`@Valid`의 역할**

`@Valid`는 대상 객체에 선언된 검증 조건을 검사하도록 연결하는 어노테이션이다. Spring MVC에서는 요청 DTO에 붙여 입력값을 검증할 수 있다.

```java
public record SignUpRequest(
	@NotBlank
	@Email
	String Email,

	@NotBlank
	@Size(min = 8)
	String password
) {}

@PostMapping("/users")
public ResponsEntity<void> signup(
	@Valid @RequestBody SignupRequest request
) {
	userService.signup(request);
	return ResponseEntity.status(HttpStatus.CREATED).build();
}

// 일반적인 @Valid @RequestBody 검증 실패는 MethodArgumentNotValidException으로 전달되고, 400 Bad Request로 처리된다.
```

- 제약 어노테이션: 검사할 조건을 선언한다.
- `@Valid`: 해당 객체의 검증을 수행하도록 연결한다.
- 서비스·DB 검증: 이메일 중복 등 업무 규칙과 데이터 무결성을 확인한다.

### class-validator와 ValidationPipe

NextJS에서는 class-validator로 DTO의 검증 규칙을 선언하고, ValidationPipe로 요청 처리 과정에 검증을 적용한다.

- class-validator: `@IsEmail()`, `@MinLength()` 등의 데코레이터로 검증 조건 선언
- ValidationPipe: 컨트롤러가 요청을 처리하기 전에 검증 실행

TypeScript의 타입은 실행 시 사라지므로, 타입 선언만으로 외부 요청을 검증할 수는 없다.

**Spring 방식과의 비교**

| 역할 | Spring | NextJS |
| --- | --- | --- |
| 검증 규칙 선언 | `@Email`, `@Size` 등 | `@IsEmail()`, `@MinLength()` 등 |
| 요청 검증 적용 | Spring MVC에서 `@Valid` 사용 | ValidationPipe 적용 |
| 추가 기능 | 검증 외 기능은 별도 설정 | 허용하지 않은 속성 제거·차단, DTO 변환 등 설정 가능 |

### bcrypt와 salt round

**bcrypt란?**

- bcrypt는 비밀번호 저장을 위해 사용하는 해시 알고리즘이다. 비밀번호 원문 대신 해시를 저장하며, 로그인 시 입력한 비밀번호가 저장된 해시와 일치하는지 검사한다.
- 암호화와 달리 해시를 복호화하여 원래 비밀번호로 되돌리는 방식이 아니다.

**salt란?**

- salt는 비밀번호 해싱에 사용하는 무작위 값이다. 같은 비밀번호라도 서로 다른 salt를 사용하면 다른 해시가 생성된다.
- bcrypt의 결과 문자열에는 salt와 연산 비용 정보가 포함되므로, 일반적으로 salt를 별도 컬럼에 저장할 필요는 없다.

**salt rounds란?**

- 흔히 salt rounds라고 부르는 값은 bcrypt의 연산 비용을 결정하는 cost factor다. Spring의 `BCryptPasswordEncoder`에서는 이를 strength로 지정한다.
- 값이 1 증가하면 주요 계산 비용은 대략 2배가 된다. 값이 높을수록 비밀번호 추측 공격의 비용이 커지지만, 정상적인 로그인 처리도 느려진다.

```java
PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);

// 회원가입: 해시 생성
String encodedPassword = passwordEncoder.encode(rawPassword);

// 로그인: 일치 여부 확인
boolean matches =
    passwordEncoder.matches(inputPassword, encodedPassword);

// 매번 salt가 달라질 수 있으므로 새로 생성한 해시를 문자열로 비교하지 않는다.
// 검증에는 matches()를 사용한다.
```

### HTTP 201 Created / 204 No Content / 409 Conflict

**201 Created**

- 요청이 성공하여 새로운 리소스가 생성되었음을 의미한다.
- 회원가입이나 게시글 생성 등에 사용하며, 응답 본문을 포함할 수 있다. `Location` 헤더로 생성된 리소스의 위치를 안내할 수도 있다.

```java
return ResponseEntity.created(URI.create("/users/" + userId))
    .body(response);
```

**204 No Content**

- 요청은 성공했지만 응답 본문이 없음을 의미한다.
- 삭제나 응답 데이터가 필요 없는 수정 작업 등에 사용한다.

```java
return ResponseEntity.noContent().build();

// 204에는 JSON이나 성공 메시지 등의 응답 본문을 넣지 않음
```

**409 Conflict**

- 요청이 리소스의 현재 상태와 충돌하여 처리할 수 없음을 의미한다.
- 이미 가입된 이메일로 회원가입을 요청한 경우가 대표적이다.

```java
return ResponseEntity.status(HttpStatus.CONFLICT)
    .body(errorResponse);
```

### UNIQUE 제약 조건과 동시성

**UNIQUE 제약 조건이란**

- UNIQUE 제약 조건은 컬럼 또는 컬럼 조합에 중복 값이 저장되지 않도록 DB가 보장하는 규칙이다.
- 회원 이메일처럼 중복되면 안 되는 값에 설정한다.

**동시성 문제와의 관계**

- 저장 전에 중복 여부를 조회하더라도, 두 요청이 동시에 실행되면 모두 "중복 없음"을 확인할 수 있다.

```
요청 A: 이메일 조회 → 없음
요청 B: 이메일 조회 → 없음
요청 A: 저장
요청 B: 저장 시도
```

- DB에 UNIQUE 제약 조건이 있으면 두 요청이 모두 중복 저장되는 것을 막을 수 있다.
    - 서비스의 사전 조회: 중복을 미리 확인하고 안내
    - DB의 UNIQUE 제약 조건: 동시 요청에도 중복 저장 방지
    - 예외 처리: 제약 조건 위반을 적절한 오류 응답으로 변환

**Spring에서의 처리**

- Spring에서는 데이터 무결성 위반이 `DataIntegrityViolationException` 등으로 전달될 수 있다. 이때 실제로 이메일 UNIQUE 제약 조건을 위반했는지 확인한 뒤 중복 오류로 처리해야한다.
- `@Transactional`만 붙인다고 중복 문제가 항상 해결되는 것은 아니다. 중복 금지 규칙은 DB의 UNIQUE 제약 조건으로 보장하는 것이 기본이다.

### @RestControllerAdvice / Exception Filter

**Spring의 `@RestControllerAdvice`**

- `@RestControllerAdvice`는 여러 컨트롤러에 공통으로 적용할 예외 처리 등을 정의하는 어노테이션이다.
- `@ExceptionHandler`와 함께 사용하면 예외 종류에 따라 HTTP 상태 코드와 응답 본문을 일관되게 만들 수 있다.

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleEmailConflict(
        EmailAlreadyExistsException exception // 사용자 정의 예외가 별도로 선언되어 있다
    ) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(Map.of(
                "code", "EMAIL_ALREADY_EXISTS",
                "message", "이미 사용 중인 이메일입니다."
            ));
    }
}
```

- 서비스는 업무상 실패를 예외로 전달하고, 공통 예외 처리기는 이를 클라이언트가 이해할 수 있는 응답으로 변환한다.

**NextJS의 Exception Filter**

- Exception Filter도 예외를 받아 HTTP 응답으로 변환하는 역할을 한다.
- Spring의 `@RestControllerAdvice`와 목적이 비슷하며, 특정 라우트·컨트롤러·전역 범위에 적용할 수 있다. NextJS에는 기본 예외 처리 기능도 있으므로, 응답 형식 통일 등 추가 정책이 필요할 때 사용자 정의 필터를 사용한다.

# 📢 학습 후기

---

- 이번 주차 워크북을 해결해보면서 어땠는지 회고해봅시다.
- 핵심 키워드에 대해 완벽하게 이해했는지? 혹시 이해가 안 되는 부분은 뭐였는지?

<aside>
💡 이번 주는 성공하는 경우보다 실패했을 때 어떻게 알려줄지가 더 중요하다는걸 느꼈다. 40x를 구분하여 사용하고 전역 예외처리로 응답 형식을 통일하니 프론트가 읽기 쉬운 API가 됐다.

</aside>

# ✅ 실습 체크리스트
