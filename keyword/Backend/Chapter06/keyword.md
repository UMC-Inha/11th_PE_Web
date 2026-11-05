
- Bean Validation과 @Valid

Bean Validation은 객체의 값이 정해진 조건을 만족하는지 검사하는 Java의 검증 표준이다. 회원가입 요청 DTO에 @NotBlank, @Email, @Size 같은 어노테이션으로 조건을 선언하고, Controller에서 @Valid를 붙여 검증을 적용한다. 일반적인 Spring MVC의 @Valid @RequestBody 검증에서 조건을 위반하면 MethodArgumentNotValidException이 발생하며, 기본적으로 HTTP 400 응답으로 처리된다.

```java
public record NicknameRequest(
        @NotBlank(message = "닉네임을 입력해주세요.")
        @Size(min = 2, max = 12, message = "닉네임은 2자 이상 12자 이하로 입력해주세요.")
        String nickname
) {}
```

여기서 **조건을 선언하는 것과 실제로 검증하는 것은 구분해야 한다.** DTO에 어노테이션이 있다고 해서 객체를 생성할 때마다 자동으로 검증되는 것은 아니다. Controller의 @Valid처럼 검증을 실행하는 연결 지점이 필요하다.

또한 검증 어노테이션마다 검사하는 범위가 다르다. @Size는 길이를 검사하지만 null은 허용한다. @NotBlank는 null, 빈 문자열, 공백으로만 구성된 문자열을 허용하지 않는다. 따라서 필수 입력이면서 길이 제한도 있는 닉네임에는 두 조건을 함께 사용한다.

| 입력값 | @NotBlank | @Size(min = 2, max = 12) |
| --- | --- | --- |
| null | 실패 | 통과 |
| 빈 문자열 | 실패 | 실패 |
| 공백 세 개 | 실패 | 통과 |
| 서연 | 통과 | 통과 |

**입력 형식 검증과 비즈니스 규칙 검증도 구분해야 한다.** 이메일 형식이 올바른지는 DTO에서 확인하지만, 이미 가입된 이메일인지는 데이터베이스를 조회해야 알 수 있다. 이번 회원가입에서는 DTO에서 입력 조건을 검사하고, Service에서 이메일과 닉네임의 중복 여부를 확인하는 방식으로 역할을 나눈다.

프론트엔드에서 입력값을 검사했더라도 서버 검증은 필요하다. Postman처럼 프론트엔드 화면을 거치지 않고 API를 호출할 수 있기 때문이다.

- class-validator와 ValidationPipe

class-validator는 NestJS에서 DTO의 입력 조건을 선언할 때 사용하는 라이브러리이고, ValidationPipe는 들어온 요청에 그 검증을 적용하는 NestJS의 기능이다. Spring에서 DTO에 검증 어노테이션을 붙이고 @Valid로 검사하는 것과 비슷한 역할을 한다.

예를 들어 회원가입 DTO를 다음과 같이 작성할 수 있다.

```tsx
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from "class-validator";

export class SignUpDto {
  @IsNotEmpty({ message: "이메일을 입력해주세요." })
  @IsEmail({}, { message: "올바른 이메일 형식이 아닙니다." })
  email!: string;

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/, {
    message: "비밀번호는 대문자/소문자/숫자/특수문자를 포함한 8자 이상이어야 합니다.",
  })
  password!: string;

  @IsString()
  @Length(2, 12, {
    message: "닉네임은 2자 이상 12자 이하로 입력해주세요.",
  })
  @Matches(/\S/, {
    message: "닉네임은 공백만 입력할 수 없습니다.",
  })
  nickname!: string;
}
```

중요한 점은 **TypeScript의 타입 선언만으로 외부 요청을 검증할 수는 없다는 것**이다. email을 string으로 선언해도 실제 요청에서는 숫자나 null이 들어올 수 있다. TypeScript 타입은 실행 시점에 사라지므로, 요청 데이터에는 별도의 런타임 검증이 필요하다. DTO를 interface가 아닌 class로 작성하는 것도 실행 시점에 검증에 사용할 클래스 정보가 필요하기 때문이다.

DTO에 조건을 작성한 뒤에는 다음처럼 ValidationPipe를 연결한다.

```tsx
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

각 옵션은 서로 다른 역할을 한다.

| 옵션 | 역할 |
| --- | --- |
| whitelist | 검증 데코레이터가 없는 속성을 제거한다. |
| forbidNonWhitelisted | whitelist와 함께 사용하면 허용되지 않은 속성이 들어왔을 때 오류로 처리한다. |
| transform | 요청 데이터를 DTO 클래스의 인스턴스로 변환하도록 한다. |

예를 들어 회원가입 요청에 아래처럼 DTO에 없는 role을 추가했다고 가정할 수 있다.

```json
{
  "email": "umc@example.com",
  "password": "Umc!1234",
  "nickname": "moviefan",
  "role": "ADMIN"
}
```

whitelist만 설정했다면 role이 제거되고, forbidNonWhitelisted까지 설정했다면 요청이 거부된다. 다만 **이 옵션이 사용자 권한 검사까지 대신하는 것은 아니다.** 실제 관리자 권한이 있는지는 서버에서 별도로 확인해야 한다.

또한 transform을 켰다고 DTO 안의 모든 문자열이 원하는 숫자나 날짜로 자동 변환되는 것은 아니다. 숫자 문자열을 숫자로 바꾸려면 명시적인 변환 설정이나 전용 Pipe가 필요한 경우가 있다. **형식 변환과 유효성 검사는 별개의 과정**으로 이해하는 것이 좋다.

- bcrypt와 salt round

bcrypt는 비밀번호를 저장할 때 사용하는 단방향 해시 방식이다. 저장된 값을 복호화해서 원래 비밀번호를 꺼내는 것이 아니라, 사용자가 입력한 비밀번호가 저장된 해시와 일치하는지 검사하는 방식으로 사용한다.

bcrypt에는 무작위 값인 salt가 사용되므로 **같은 비밀번호를 처리해도 일반적으로 매번 다른 해시가 생성된다.** Spring의 BCryptPasswordEncoder는 salt 생성과 검증을 처리해준다. 

```java
PasswordEncoder encoder = new BCryptPasswordEncoder();

String firstHash = encoder.encode("Umc!1234");
String secondHash = encoder.encode("Umc!1234");

System.out.println(firstHash.equals(secondHash));
System.out.println(encoder.matches("Umc!1234", firstHash));
System.out.println(encoder.matches("wrongPassword", firstHash));
```

일반적인 실행 결과는 다음과 같다.

```
false
true
false
```

따라서 로그인할 때 입력 비밀번호를 다시 encode한 뒤 저장된 해시와 문자열로 비교하면 안 된다. 다음처럼 **입력한 원문 비밀번호와 저장된 해시를 matches에 전달**해야 한다.

```java
boolean matches = passwordEncoder.matches(
        request.password(),
        member.getPassword()
);
```

흔히 salt round라고 부르는 값은 bcrypt의 계산 비용을 조절하는 cost 또는 strength이다. salt의 길이를 의미하지는 않는다. Spring의 기본 strength는 10이며, 값을 높일수록 계산 작업량이 증가한다.

```java
PasswordEncoder encoder = new BCryptPasswordEncoder(10);
```

계산 비용은 대략 2의 strength 제곱에 비례하므로, strength를 10에서 11로 올리면 작업량이 약 두 배가 된다. 값을 무조건 크게 설정하면 회원가입과 로그인 응답이 느려질 수 있어 서버 성능을 고려해야 한다.

이번 실습에서는 회원가입 시 비밀번호를 해시 처리해서 저장하고, MemberResponse에는 회원 ID·이메일·닉네임만 넣는다. **해시된 비밀번호도 응답으로 반환할 필요가 없다.**

- HTTP 201 Created / 204 No Content / 409 Conflict

HTTP 상태 코드는 요청이 어떤 결과로 처리됐는지 나타낸다. 응답 JSON의 메시지와 별개로, 실제 HTTP 응답 상태를 정확하게 설정해야 한다.

| 상태 코드 | 의미 | 이번 실습의 예시 |
| --- | --- | --- |
| 201 Created | 새로운 리소스가 생성됨 | 회원가입, 평점 등록 |
| 204 No Content | 요청이 성공했고 응답 본문이 없음 | 평점 삭제 |
| 409 Conflict | 현재 리소스 상태와 충돌함 | 중복 이메일, 중복 평점 |

특히 **204 응답에는 JSON 본문을 넣지 않는다.** 공통 응답 형식을 사용하더라도 삭제 성공은 본문 없이 반환해야 한다. 

```java
return ResponseEntity.status(201)
        .body(ApiResponse.created("회원가입에 성공했습니다.", response));
```

```java
return ResponseEntity.noContent().build();
```

```java
return ResponseEntity.status(409)
        .body(ApiResponse.failure("COMMON4092", "이미 사용 중인 이메일입니다."));
```

예를 들어 다음 코드에서는 JSON에 COMMON201이 들어가더라도 **실제 HTTP 상태는 200**이다.

```java
return ResponseEntity.ok(
        ApiResponse.created("회원가입에 성공했습니다.", response)
);
```

따라서 Postman에서는 JSON 안의 code만 확인하지 않고, 응답 영역에 표시되는 실제 HTTP 상태도 함께 확인해야 한다.

입력 오류와 중복 오류도 구분하는 것이 좋다. 평점이 허용 범위인 1~5를 벗어난 경우는 400 Bad Request로, 같은 회원이 같은 영화에 평점을 다시 등록한 경우는 이번 API 설계에서 409 Conflict로 처리한다.

또한 생성 성공 시에는 Location 헤더로 생성된 리소스의 위치를 알려주는 방식도 사용할 수 있다.

- UNIQUE 제약 조건과 동시성

UNIQUE 제약은 데이터베이스에서 특정 값이나 값의 조합이 중복 저장되지 않도록 제한하는 장치이다. 회원 이메일에는 단일 컬럼 UNIQUE 제약을, 평점에는 회원 ID와 영화 ID를 묶은 복합 UNIQUE 제약을 적용할 수 있다.

```sql
ALTER TABLE rating
ADD CONSTRAINT uk_rating_member_movie
UNIQUE (member_id, movie_id);
```

위 제약은 한 회원이 같은 영화에 평점을 두 번 등록하는 것을 막는다.

| 회원 ID | 영화 ID | 저장 가능 여부 |
| --- | --- | --- |
| 1 | 550 | 최초 등록 가능 |
| 1 | 155 | 다른 영화이므로 가능 |
| 2 | 550 | 다른 회원이므로 가능 |
| 1 | 550 | 기존 조합과 중복되므로 불가능 |

Service에서 먼저 중복을 조회하더라도 UNIQUE 제약은 필요하다. **중복 확인과 저장 사이에 다른 요청이 들어올 수 있기 때문**이다.

예를 들어 동일한 이메일로 회원가입 요청 A와 B가 거의 동시에 들어오면 다음 상황이 발생할 수 있다.

1. 요청 A가 중복 조회를 수행하고 해당 이메일이 없음을 확인한다.
2. 요청 B도 A의 저장이 끝나기 전에 해당 이메일이 없음을 확인한다.
3. 요청 A가 회원을 저장한다.
4. 요청 B도 같은 이메일로 저장을 시도한다.

사전 조회만으로는 두 요청이 모두 검사를 통과할 수 있다. 이때 DB의 UNIQUE 제약이 중복 저장을 막는다. **사전 검사는 사용자에게 이해하기 쉬운 안내를 제공하고, DB 제약은 최종적으로 데이터의 일관성을 보장한다.**

@Transactional을 붙이는 것만으로 이러한 경쟁 상황이 자동으로 모두 해결되지는 않는다. 여러 작업을 하나의 트랜잭션으로 묶는 것과 중복 저장을 금지하는 것은 서로 다른 역할이다.

MySQL의 UNIQUE 인덱스는 NULL을 허용하는 컬럼에서 여러 NULL 값을 허용한다. 따라서 반드시 값이 있어야 하는 이메일, 회원 ID, 영화 ID에는 NOT NULL도 함께 적용해야 한다. 

또한 JPA 코드에 제약을 선언한 것과 실제 DB에 제약이 적용된 것은 확인을 통해 구분해야 한다. 다음 SQL로 테이블 정의를 확인할 수 있다.

```sql
SHOW CREATE TABLE member;
SHOW CREATE TABLE rating;
```

- @RestControllerAdvice / Exception Filter

Spring의 @RestControllerAdvice와 NestJS의 Exception Filter는 요청 처리 중 발생한 예외를 일관된 HTTP 응답으로 바꾸는 데 사용한다. Service가 예외를 발생시키면 공통 처리 부분에서 상태 코드와 오류 응답 형식을 결정하는 방식이다.

Spring에서는 @RestControllerAdvice가 붙은 클래스 안에 @ExceptionHandler 메서드를 작성한다. 처리 결과는 응답 본문으로 반환할 수 있다. 

```java
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<ApiResponse<Void>> handleValidation(
        MethodArgumentNotValidException exception
) {
    String message = exception.getBindingResult()
            .getFieldErrors()
            .stream()
            .findFirst()
            .map(error -> error.getDefaultMessage())
            .orElse("입력값을 확인해주세요.");

    return ResponseEntity.badRequest()
            .body(ApiResponse.failure("COMMON4001", message));
}
```

위 예시에서는 DTO 검증 오류가 발생하면 다음과 같은 공통 응답을 반환한다.

```json
{
  "isSuccess": false,
  "code": "COMMON4001",
  "message": "올바른 이메일 형식이 아닙니다.",
  "result": null
}
```

NestJS에서도 Exception Filter를 통해 예외에서 상태 코드와 메시지를 추출하고, 프로젝트의 공통 오류 구조로 응답할 수 있다. 예를 들어 ValidationPipe에서 발생한 입력 오류나 Service에서 발생시킨 ConflictException을 공통 형식으로 정리하는 데 사용할 수 있다.

| 구분 | Spring | NestJS |
| --- | --- | --- |
| 입력 조건 선언 | Bean Validation 어노테이션 | class-validator 데코레이터 |
| 입력 검증 적용 | @Valid 등 | ValidationPipe |
| 공통 예외 응답 처리 | @RestControllerAdvice, @ExceptionHandler | Exception Filter |

여기서 **검증과 예외 처리는 역할이 다르다.** 검증은 입력값이 올바른지 판단하는 과정이고, 예외 처리는 실패했을 때 클라이언트에 어떤 응답을 보낼지 결정하는 과정이다.

예외를 너무 넓은 범위로 묶는 것도 주의해야 한다. 워크북에서는 중복 이메일과 닉네임에 IllegalArgumentException을 사용하고 409로 처리한다. 다른 기능에서 단순히 잘못된 입력에도 같은 예외를 사용하면 그 오류까지 모두 409로 처리될 수 있다. 프로젝트가 커지면 중복, 잘못된 입력, 권한 부족을 구분하는 예외를 사용하는 것이 도움이 된다.

또한 **모든 예외를 성공 상태인 200으로 반환하거나, 예상하지 못한 서버 오류를 모두 사용자 입력 오류인 400으로 처리하면 안 된다.** 클라이언트가 오류의 종류를 구분할 수 있도록 실제 상황에 맞는 상태 코드와 공통 응답을 함께 제공해야 한다.
