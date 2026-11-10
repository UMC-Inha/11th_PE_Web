- Bean Validation과 @Valid
    
    ### Bean Validation이란?
    
    Bean Validation은 객체의 필드에 제약 조건을 선언하여 값이 올바른지 검사하는 Java 표준 검증 방식이다. Spring Boot에서는 일반적으로 Hibernate Validator가 Bean Validation의 구현체로 동작한다.
    
    ```java
    public record CreateMemberRequest(
    
        @NotBlank(message = "이름은 필수입니다.")
        String name,
    
        @Email(message = "이메일 형식이 올바르지 않습니다.")
        String email,
    
        @Min(value = 14, message = "나이는 14세 이상이어야 합니다.")
        int age
    
    ) {}
    ```
    
    대표적인 검증 어노테이션은 다음과 같다.
    
    | 어노테이션 | 검증 내용 |
    | --- | --- |
    | `@NotNull` | `null`을 허용하지 않음 |
    | `@NotEmpty` | `null`과 빈 문자열·컬렉션을 허용하지 않음 |
    | `@NotBlank` | `null`, 빈 문자열, 공백 문자열을 허용하지 않음 |
    | `@Size` | 문자열이나 컬렉션의 크기 제한 |
    | `@Min`, `@Max` | 숫자의 최솟값·최댓값 제한 |
    | `@Positive` | 양수인지 검사 |
    | `@Email` | 이메일 형식 검사 |
    | `@Pattern` | 정규식 형식 검사 |
    
    Bean Validation은 검증 규칙을 DTO에 선언할 수 있어 Controller에서 직접 `if`문을 반복해서 작성하지 않아도 된다. docs.spring.io
    
    ---
    
    ### `@Valid`의 역할
    
    DTO 필드에 검증 어노테이션을 작성하는 것만으로는 검증이 실행되지 않는다. Controller의 요청 객체에 `@Valid`를 붙이면 Spring이 요청 데이터를 DTO로 변환한 뒤 Bean Validation을 실행한다.
    
    ```java
    @PostMapping("/members")
    public ResponseEntity<Void> createMember(
            @Valid @RequestBody CreateMemberRequest request
    ) {
        memberService.create(request);
        return ResponseEntity.ok().build();
    }
    ```
    
    처리 과정은 다음과 같다.
    
    ```
    HTTP 요청
    → JSON을 DTO로 변환
    → @Valid가 DTO 검증 실행
    → 검증 성공 시 Controller 실행
    → 검증 실패 시 예외 발생
    ```
    
    Spring MVC에서는 `@RequestBody`와 `@Valid`를 함께 사용하면 요청 객체에 표준 Bean Validation이 적용된다. docs.spring.io
    
    검증에 실패하면 일반적인 `@RequestBody` 검증에서는 `MethodArgumentNotValidException`이 발생한다. `@RestControllerAdvice`에서 이를 처리하여 일관된 오류 응답을 만들 수 있다.
    
    ```java
    @RestControllerAdvice
    public class GlobalExceptionHandler {
    
        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<String> handleValidation(
                MethodArgumentNotValidException exception
        ) {
            String message = exception.getBindingResult()
                    .getFieldErrors()
                    .get(0)
                    .getDefaultMessage();
    
            return ResponseEntity.badRequest().body(message);
        }
    }
    ```
    
    ---
    
    ### 중첩 객체 검증
    
    `@Valid`는 객체 내부에 포함된 다른 객체까지 연쇄적으로 검증할 때도 사용한다.
    
    ```java
    public record CreateOrderRequest(
    
        @NotNull
        @Valid
        AddressRequest address
    
    ) {}
    ```
    
    ```java
    public record AddressRequest(
    
        @NotBlank
        String city,
    
        @NotBlank
        String detailAddress
    
    ) {}
    ```
    
    `address`에 `@Valid`가 없다면 `AddressRequest` 내부의 `@NotBlank` 검증이 실행되지 않을 수 있다. `@Valid`는 연결된 객체의 내부까지 검증하는 **중첩 검증 또는 연쇄 검증**을 의미한다. jakarta.ee
    
    ---
    
    ### `@Valid`와 `@Validated`의 차이
    
    | 구분 | `@Valid` | `@Validated` |
    | --- | --- | --- |
    | 소속 | Jakarta Validation | Spring |
    | 기본 DTO 검증 | 가능 | 가능 |
    | 중첩 객체 검증 | 가능 | 가능 |
    | 검증 그룹 지정 | 직접 지원하지 않음 | 지원 |
    | 주요 사용 위치 | Controller 요청 DTO, 중첩 필드 | 클래스·메서드 검증, 검증 그룹 |
    
    일반적인 요청 DTO 검증에는 `@Valid`를 사용하면 된다. 등록과 수정처럼 상황에 따라 서로 다른 검증 규칙을 적용해야 한다면 `@Validated`의 검증 그룹을 사용할 수 있다.
    
    > Bean Validation은 DTO에 검증 규칙을 선언하는 표준이고, `@Valid`는 Spring이 해당 객체의 검증을 실제로 실행하도록 하는 역할을 한다.
    > 
- class-validator와 ValidationPipe
    
    ### `class-validator`란?
    
    `class-validator`는 NestJS DTO의 필드에 데코레이터를 붙여 값의 검증 규칙을 선언하는 라이브러리다.
    
    ```jsx
    import {
      IsEmail,
      IsInt,
      IsNotEmpty,
      IsString,
      Min,
      MinLength,
    } from "class-validator";
    
    export class CreateMemberDto {
      @IsString()
      @IsNotEmpty()
      name: string;
    
      @IsEmail()
      email: string;
    
      @IsString()
      @MinLength(8)
      password: string;
    
      @IsInt()
      @Min(14)
      age: number;
    }
    ```
    
    대표적인 검증 데코레이터는 다음과 같다.
    
    | 데코레이터 | 검증 내용 |
    | --- | --- |
    | `@IsString()` | 문자열인지 검사 |
    | `@IsInt()` | 정수인지 검사 |
    | `@IsEmail()` | 이메일 형식인지 검사 |
    | `@IsNotEmpty()` | 빈 값인지 검사 |
    | `@Min()`, `@Max()` | 숫자의 최솟값·최댓값 검사 |
    | `@MinLength()`, `@MaxLength()` | 문자열 길이 검사 |
    | `@IsOptional()` | 값이 없는 경우 다른 검증 생략 |
    | `@IsEnum()` | 지정한 enum 값인지 검사 |
    | `@IsArray()` | 배열인지 검사 |
    | `@ValidateNested()` | 중첩 객체 내부까지 검사 |
    
    `class-validator`는 **어떤 값이 올바른지 규칙을 선언하는 역할**을 한다. DTO에 데코레이터를 작성했다고 해서 NestJS의 모든 요청이 자동으로 검증되는 것은 아니다.
    
    ---
    
    ### `ValidationPipe`란?
    
    `ValidationPipe`는 Controller로 들어오는 요청 데이터를 DTO로 변환하고, DTO에 작성된 `class-validator` 규칙을 실제로 실행하는 NestJS의 파이프다.
    
    ```jsx
    @Post()
    create(@Body() request: CreateMemberDto) {
      return this.memberService.create(request);
    }
    ```
    
    `ValidationPipe`가 설정되어 있으면 요청 처리 과정은 다음과 같다.
    
    ```
    HTTP 요청
    → ValidationPipe 실행
    → 요청 데이터를 DTO 기준으로 변환
    → class-validator의 검증 규칙 실행
    → 성공하면 Controller에 전달
    → 실패하면 400 Bad Request 응답
    ```
    
    NestJS의 `ValidationPipe`는 `class-validator`에 선언된 검증 규칙을 이용해 요청을 검사한다. NestJS - A progressive Node.js framework
    
    ---
    
    ## 전역 `ValidationPipe` 설정
    
    일반적으로 `main.ts`에서 전역으로 설정한다.
    
    ```tsx
    import { ValidationPipe } from "@nestjs/common";
    import { NestFactory } from "@nestjs/core";
    import { AppModule } from "./app.module";
    
    async function bootstrap() {
      const app = await NestFactory.create(AppModule);
    
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );
    
      await app.listen(3000);
    }
    
    bootstrap();
    ```
    
    전역으로 설정하면 모든 Controller 요청에 같은 검증 설정이 적용된다.
    
    ### 주요 옵션
    
    | 옵션 | 역할 |
    | --- | --- |
    | `whitelist: true` | DTO에 검증 데코레이터가 없는 필드를 요청 객체에서 제거 |
    | `forbidNonWhitelisted: true` | DTO에 정의되지 않은 필드가 들어오면 제거하지 않고 오류 반환 |
    | `transform: true` | 요청 데이터를 DTO 클래스 또는 지정된 타입으로 변환 |
    | `disableErrorMessages: true` | 검증 오류의 상세 메시지를 응답에서 숨김 |
    | `stopAtFirstError: true` | 한 필드에서 첫 번째 오류가 발생하면 추가 검증 중단 |
    
    ---
    
    ### `whitelist`
    
    ```tsx
    export class CreateMemberDto {
      @IsString()
      name: string;
    }
    ```
    
    다음 요청이 들어왔다고 가정한다.
    
    ```json
    {
      "name": "이지은",
      "isAdmin": true
    }
    ```
    
    `whitelist: true`이면 DTO에 검증 데코레이터가 없는 `isAdmin`이 제거된다.
    
    ```json
    {
      "name": "이지은"
    }
    ```
    
    클라이언트가 DTO에 없는 값을 임의로 전달하는 것을 막는 데 도움이 된다.
    
    ### `forbidNonWhitelisted`
    
    ```tsx
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    ```
    
    `forbidNonWhitelisted: true`까지 설정하면 `isAdmin`을 단순히 제거하지 않고 잘못된 요청으로 판단하여 `400 Bad Request`를 반환한다. NestJS 공식 문서에서도 두 옵션을 함께 설정하면 허용되지 않은 필드가 들어온 요청을 거부한다고 설명한다. NestJS - A progressive Node.js framework
    
    ### `transform`
    
    HTTP의 path parameter와 query parameter는 기본적으로 문자열로 전달된다.
    
    ```tsx
    @Get(":id")
    findOne(@Param("id") id: number) {
      console.log(typeof id);
    }
    ```
    
    ```tsx
    new ValidationPipe({
      transform: true,
    });
    ```
    
    `transform: true`를 설정하면 `"1"`을 `1`과 같은 숫자로 변환할 수 있다.
    
    ```
    요청값 "1"
    → ValidationPipe
    → 숫자 1
    ```
    
    또한 요청 본문의 일반 JavaScript 객체를 DTO 클래스의 인스턴스로 변환한다. NestJS - A progressive Node.js framework
    
    단, 변환에 실패할 가능성이 있거나 엄격한 숫자 검증이 필요하면 `ParseIntPipe`나 `@Type(() => Number)`를 명시적으로 사용하는 편이 안전하다.
    
    ---
    
    ## 중첩 객체 검증
    
    DTO 안에 다른 DTO가 들어 있다면 `@ValidateNested()`와 `@Type()`을 함께 사용한다.
    
    ```tsx
    import { Type } from "class-transformer";
    import { IsNotEmpty, IsString, ValidateNested } from "class-validator";
    
    export class AddressDto {
      @IsString()
      @IsNotEmpty()
      city: string;
    
      @IsString()
      @IsNotEmpty()
      detailAddress: string;
    }
    
    export class CreateMemberDto {
      @ValidateNested()
      @Type(() => AddressDto)
      address: AddressDto;
    }
    ```
    
    각 데코레이터의 역할은 다음과 같다.
    
    - `@ValidateNested()`: `address` 객체 내부의 검증 규칙도 실행한다.
    - `@Type(() => AddressDto)`: 일반 객체를 `AddressDto` 클래스 인스턴스로 변환한다.
    
    `class-validator`의 중첩 검증은 대상이 클래스 인스턴스여야 하므로, 요청으로 들어온 일반 객체를 변환하기 위해 `@Type()`이 필요하다. GitHub
    
    ---
    
    ## DTO를 `interface`가 아니라 `class`로 만드는 이유
    
    TypeScript의 `interface`는 컴파일 후 JavaScript에서 사라진다. 따라서 실행 중에는 어떤 DTO인지 확인하거나 검증 데코레이터 정보를 사용할 수 없다.
    
    ```tsx
    // 실행 시 사라지므로 DTO 검증에 적합하지 않음
    interface CreateMemberDto {
      name: string;
    }
    ```
    
    반면 `class`는 JavaScript로 컴파일된 뒤에도 남으므로 `ValidationPipe`가 해당 클래스와 데코레이터 정보를 이용할 수 있다.
    
    ```tsx
    export class CreateMemberDto {
      @IsString()
      name: string;
    }
    ```
    
    ---
    
    ## 두 도구의 역할 차이
    
    | 구분 | `class-validator` | `ValidationPipe` |
    | --- | --- | --- |
    | 소속 | 별도 검증 라이브러리 | NestJS |
    | 역할 | DTO의 검증 규칙 선언 | 요청 검증 실행 |
    | 사용 위치 | DTO 필드 | 전역 설정, Controller, 메서드 또는 파라미터 |
    | 예시 | `@IsString()`, `@IsEmail()` | `new ValidationPipe()` |
    | 검증 실패 시 | 검증 오류 정보 생성 | 일반적으로 400 응답으로 변환 |
    
    > `class-validator`는 DTO의 검증 규칙을 정의하고, `ValidationPipe`는 요청이 Controller에 도달하기 전에 그 규칙을 실행한다.
    > 
- bcrypt와 salt round
    
    ## `bcrypt`란?
    
    `bcrypt`는 비밀번호를 안전하게 저장하기 위한 단방향 해시 알고리즘이다. 암호화와 달리 해시값에서 원래 비밀번호를 복원할 수 없다.
    
    Spring Boot에서는 일반적으로 `BCryptPasswordEncoder`를 사용한다.
    
    ```java
    BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder(10);
    
    String password = "password123!";
    String encodedPassword =
            passwordEncoder.encode(password);
    ```
    
    ```
    평문 비밀번호
    → BCryptPasswordEncoder로 해싱
    → 해시값을 DB에 저장
    ```
    
    로그인할 때는 저장된 해시를 복호화하지 않는다. 사용자가 입력한 비밀번호와 DB에 저장된 해시를 `matches()`로 비교한다.
    
    ```java
    boolean isPasswordValid = passwordEncoder.matches(
            inputPassword,
            member.getPassword()
    );
    ```
    
    ```
    입력한 평문 비밀번호 + DB의 해시값
    → passwordEncoder.matches()
    → 일치하면 true
    → 일치하지 않으면 false
    ```
    
    ---
    
    ## Salt란?
    
    Salt는 비밀번호를 해싱할 때 함께 사용하는 무작위 값이다.
    
    Salt가 없다면 같은 비밀번호는 항상 같은 해시값을 만들게 된다.
    
    ```
    "password123" → ABC123
    "password123" → ABC123
    ```
    
    Salt를 사용하면 같은 비밀번호도 서로 다른 해시값을 만든다.
    
    ```
    "password123" + Salt A → X7K92A
    "password123" + Salt B → Q3M81B
    ```
    
    따라서 공격자가 미리 계산해 둔 해시 목록인 레인보우 테이블을 사용하기 어려워진다. 해시값만 보고 여러 사용자가 같은 비밀번호를 사용하는지도 쉽게 알 수 없다.
    
    Spring의 `BCryptPasswordEncoder`는 `encode()`를 호출할 때마다 무작위 16바이트 Salt를 자동으로 생성한다. docs.spring.io
    
    ```java
    String first =
            passwordEncoder.encode("password123!");
    
    String second =
            passwordEncoder.encode("password123!");
    
    System.out.println(first.equals(second)); // false
    ```
    
    같은 비밀번호를 해싱했는데 결과가 다른 것은 정상이다.
    
    ---
    
    ## bcrypt 해시의 구조
    
    bcrypt 해시값에는 알고리즘 버전, Strength, Salt와 해시 결과가 함께 저장된다.
    
    ```
    $2a$10$nOUIs5kJ7naTuTFkBy1veuK0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa
    ```
    
    | 부분 | 의미 |
    | --- | --- |
    | `$2a$` | bcrypt 알고리즘 버전 |
    | `10` | Strength 또는 Cost Factor |
    | 다음 22글자 | Salt |
    | 나머지 부분 | 비밀번호 해시 결과 |
    
    Salt는 비밀번호처럼 숨겨야 하는 값이 아니다. 이미 bcrypt 해시 문자열에 포함되므로 데이터베이스에 별도의 Salt 컬럼을 만들 필요가 없다.
    
    ```
    member
    ├── member_id
    ├── email
    └── password   ← bcrypt 해시 전체를 저장
    ```
    
    ---
    
    ## Salt Round란?
    
    Spring Security에서는 보통 Salt Round보다 **Strength** 또는 **Log Round**라는 표현을 사용한다.
    
    Strength는 bcrypt 해시 계산을 얼마나 어렵고 느리게 수행할지 결정하는 값이다. 정확히는 Salt를 몇 번 넣는다는 뜻이 아니라 bcrypt의 연산 비용을 의미한다.
    
    ```java
    PasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder(10);
    ```
    
    Strength가 `10`이면 10번만 연산하는 것이 아니라 약 \(2^{10}\)에 해당하는 연산 비용을 사용한다.
    
    ```
    Strength 10 → 2¹⁰
    Strength 11 → 2¹¹
    Strength 12 → 2¹²
    ```
    
    Strength가 1 증가하면 필요한 연산량은 대략 2배가 된다.
    
    | Strength | 상대적인 연산 비용 |
    | --- | --- |
    | 10 | 기준 |
    | 11 | 약 2배 |
    | 12 | 약 4배 |
    | 13 | 약 8배 |
    
    Strength가 높을수록 무차별 대입 공격은 어려워진다. 하지만 회원가입과 로그인에 필요한 서버 연산 시간도 함께 증가한다.
    
    `BCryptPasswordEncoder`의 기본 Strength는 `10`이며, 설정할 수 있는 범위는 4에서 31까지다. Spring Security는 실제 서버 환경에서 비밀번호 검증 시간이 약 1초 정도 걸리도록 테스트하고 조정할 것을 권장한다. docs.spring.io
    
    ```java
    // 기본 Strength 10
    new BCryptPasswordEncoder();
    
    // Strength 직접 설정
    new BCryptPasswordEncoder(12);
    ```
    
    Strength 값을 변경해도 이전에 저장한 비밀번호를 계속 검증할 수 있다. 각 bcrypt 해시 안에 자신이 사용한 Strength가 함께 저장되기 때문이다.
    
    ---
    
    ## Spring Boot 설정
    
    `BCryptPasswordEncoder`를 여러 클래스에서 공통으로 사용하려면 `PasswordEncoder`를 Bean으로 등록한다.
    
    ```java
    import org.springframework.context.annotation.Bean;
    import org.springframework.context.annotation.Configuration;
    import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
    import org.springframework.security.crypto.password.PasswordEncoder;
    
    @Configuration
    public class PasswordConfig {
    
        @Bean
        public PasswordEncoder passwordEncoder() {
            return new BCryptPasswordEncoder(10);
        }
    }
    ```
    
    이후 필요한 Service에서 생성자 주입으로 사용한다.
    
    ---
    
    ## 회원가입 적용 예시
    
    ```java
    import lombok.RequiredArgsConstructor;
    import org.springframework.security.crypto.password.PasswordEncoder;
    import org.springframework.stereotype.Service;
    
    @Service
    @RequiredArgsConstructor
    public class AuthService {
    
        private final MemberRepository memberRepository;
        private final PasswordEncoder passwordEncoder;
    
        public Long signUp(SignUpRequest request) {
            String encodedPassword =
                    passwordEncoder.encode(request.password());
    
            Member member = new Member(
                    request.email(),
                    encodedPassword
            );
    
            Member savedMember =
                    memberRepository.save(member);
    
            return savedMember.getMemberId();
        }
    }
    ```
    
    회원가입 시에는 요청으로 받은 평문 비밀번호를 `encode()`한 후 해시값만 데이터베이스에 저장한다.
    
    ```java
    public record SignUpRequest(
            String email,
            String password
    ) {
    }
    ```
    
    ```
    회원가입 요청
    → 평문 비밀번호 수신
    → passwordEncoder.encode()
    → bcrypt 해시 생성
    → 해시값만 DB에 저장
    ```
    
    ---
    
    ## 로그인 적용 예시
    
    ```java
    import lombok.RequiredArgsConstructor;
    import org.springframework.security.authentication.BadCredentialsException;
    import org.springframework.security.crypto.password.PasswordEncoder;
    import org.springframework.stereotype.Service;
    
    @Service
    @RequiredArgsConstructor
    public class AuthService {
    
        private final MemberRepository memberRepository;
        private final PasswordEncoder passwordEncoder;
    
        public void login(LoginRequest request) {
            Member member = memberRepository
                    .findByEmail(request.email())
                    .orElseThrow(() ->
                            new BadCredentialsException(
                                    "이메일 또는 비밀번호가 올바르지 않습니다."
                            )
                    );
    
            boolean matches = passwordEncoder.matches(
                    request.password(),
                    member.getPassword()
            );
    
            if (!matches) {
                throw new BadCredentialsException(
                        "이메일 또는 비밀번호가 올바르지 않습니다."
                );
            }
        }
    }
    ```
    
    ```java
    public record LoginRequest(
            String email,
            String password
    ) {
    }
    ```
    
    이메일이 존재하지 않는 경우와 비밀번호가 틀린 경우에 동일한 메시지를 사용하는 것이 좋다. 두 상황을 구분해서 알려주면 공격자가 가입된 이메일을 확인할 수 있기 때문이다.
    
    ---
    
    ## Salt를 직접 생성해야 할까요?
    
    Spring Boot에서는 일반적으로 Salt를 직접 생성하지 않는다.
    
    ```java
    String encodedPassword =
            passwordEncoder.encode(rawPassword);
    ```
    
    `encode()`가 호출될 때 `BCryptPasswordEncoder`가 다음 작업을 모두 수행한다.
    
    ```
    무작위 Salt 생성
    → 지정된 Strength로 bcrypt 연산
    → 알고리즘 버전, Strength, Salt, 해시를 하나의 문자열로 생성
    ```
    
    따라서 다음과 같은 별도의 작업은 필요하지 않다.
    
    ```
    Salt를 직접 생성
    Salt를 별도 DB 컬럼에 저장
    로그인할 때 Salt를 직접 조회
    ```
    
    ---
    
    ## 주의할 점
    
    - 평문 비밀번호를 데이터베이스에 저장하면 안 된다.
    - Salt를 별도 컬럼으로 나눠 저장할 필요가 없다.
    - 같은 비밀번호도 Salt가 달라 매번 다른 해시가 생성되는 것이 정상이다.
    - 로그인할 때 `encode()`를 다시 호출하고 해시 문자열끼리 비교하면 안 된다.
    - 로그인 검증에는 반드시 `matches(평문, 저장된 해시)`를 사용한다.
    - Strength가 높을수록 안전하지만 로그인 처리 시간과 서버 부하도 증가한다.
    - Strength는 실제 운영 서버에서 성능을 측정하여 결정해야 한다.
    - bcrypt는 비밀번호의 앞부분 72바이트까지만 처리하는 특성이 있으므로 매우 긴 비밀번호와 UTF-8 문자를 사용할 때 주의해야 한다.
    
    ```java
    // 잘못된 비교
    String newHash = passwordEncoder.encode(inputPassword);
    boolean result = newHash.equals(savedHash);
    ```
    
    새로운 Salt가 생성되므로 같은 비밀번호라도 해시 문자열은 달라진다.
    
    ```java
    // 올바른 비교
    boolean result = passwordEncoder.matches(
            inputPassword,
            savedHash
    );
    ```
    
    > Spring Boot에서는 `BCryptPasswordEncoder`의 `encode()`로 비밀번호를 저장하고, `matches()`로 로그인 비밀번호를 검증한다. Salt는 자동으로 생성되며, Strength는 bcrypt의 연산 비용을 조절한다.
    > 
- HTTP 201 Created / 204 No Content / 409 Conflict
    
    ## 1. `201 Created`
    
    요청이 성공했고, 그 결과 새로운 리소스가 생성되었음을 의미한다. 주로 회원, 게시글, 주문 등을 생성하는 `POST` 요청에 사용한다.
    
    ```
    POST /members
    ```
    
    ```
    HTTP/1.1 201 Created
    Location: /members/10
    Content-Type: application/json
    
    {
      "memberId": 10,
      "name": "이지은"
    }
    ```
    
    응답 본문에는 생성된 리소스나 ID를 포함할 수 있다. `Location` 헤더에는 생성된 리소스를 조회할 수 있는 URI를 전달할 수 있다.
    
    ### Spring Boot 예시
    
    ```java
    @RestController
    @RequiredArgsConstructor
    @RequestMapping("/members")
    public class MemberController {
    
        private final MemberService memberService;
    
        @PostMapping
        public ResponseEntity<MemberResponse> create(
                @Valid @RequestBody CreateMemberRequest request
        ) {
            MemberResponse response =
                    memberService.create(request);
    
            URI location = URI.create(
                    "/members/" + response.memberId()
            );
    
            return ResponseEntity
                    .created(location)
                    .body(response);
        }
    }
    ```
    
    ```java
    public record MemberResponse(
            Long memberId,
            String name
    ) {
    }
    ```
    
    `ResponseEntity.created(location)`은 다음 내용을 설정한다.
    
    ```
    HTTP 상태 코드: 201 Created
    Location 헤더: 생성된 리소스의 URI
    ```
    
    `Location` 헤더가 필요 없다면 다음처럼 작성할 수도 있다.
    
    ```java
    @PostMapping
    public ResponseEntity<MemberResponse> create(
            @Valid @RequestBody CreateMemberRequest request
    ) {
        MemberResponse response =
                memberService.create(request);
    
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
    ```
    
    응답 본문 없이 생성 성공만 전달한다면 `@ResponseStatus`를 사용할 수도 있다.
    
    ```java
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void create(
            @Valid @RequestBody CreateMemberRequest request
    ) {
        memberService.create(request);
    }
    ```
    
    ### 사용 예시
    
    - 회원가입 성공
    - 게시글 생성 성공
    - 주문 생성 성공
    - 새로운 파일이나 리소스 생성 성공
    
    > `201 Created`는 단순히 요청이 성공한 것이 아니라, 요청 결과 새로운 리소스가 생성되었다는 의미다.
    > 
    
    ---
    
    ## 2. `204 No Content`
    
    요청은 성공했지만 클라이언트에 반환할 응답 본문이 없다는 의미다.
    
    ```
    DELETE /members/10
    ```
    
    ```
    HTTP/1.1 204 No Content
    ```
    
    `204` 응답에는 응답 본문을 포함하면 안 된다. 성공 결과로 데이터를 반환할 필요가 없는 수정이나 삭제 API에서 주로 사용한다.
    
    ### Spring Boot 삭제 예시
    
    ```java
    @DeleteMapping("/{memberId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long memberId
    ) {
        memberService.delete(memberId);
    
        return ResponseEntity.noContent().build();
    }
    ```
    
    `ResponseEntity.noContent()`는 `204 No Content` 상태를 설정하고, `build()`는 응답 본문 없이 응답을 완성한다.
    
    ### Spring Boot 수정 예시
    
    수정 후 별도의 데이터를 반환하지 않는다면 `204`를 사용할 수 있다.
    
    ```java
    @PatchMapping("/{memberId}")
    public ResponseEntity<Void> update(
            @PathVariable Long memberId,
            @Valid @RequestBody UpdateMemberRequest request
    ) {
        memberService.update(memberId, request);
    
        return ResponseEntity.noContent().build();
    }
    ```
    
    `@ResponseStatus`로도 작성할 수 있다.
    
    ```java
    @DeleteMapping("/{memberId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long memberId
    ) {
        memberService.delete(memberId);
    }
    ```
    
    ### 수정 결과를 반환하는 경우
    
    수정된 객체를 응답 본문으로 반환한다면 `204`가 아니라 `200 OK`를 사용한다.
    
    ```java
    @PatchMapping("/{memberId}")
    public ResponseEntity<MemberResponse> update(
            @PathVariable Long memberId,
            @Valid @RequestBody UpdateMemberRequest request
    ) {
        MemberResponse response =
                memberService.update(memberId, request);
    
        return ResponseEntity.ok(response);
    }
    ```
    
    ### 사용 예시
    
    - 회원 삭제 성공
    - 게시글 삭제 성공
    - 비밀번호 변경 성공 후 반환할 데이터가 없는 경우
    - 리소스 수정 성공 후 반환할 데이터가 없는 경우
    
    > `204 No Content`는 요청이 성공했지만 응답 본문이 없다는 의미다. 리소스를 찾지 못했다는 의미가 아니다.
    > 
    
    ---
    
    ## 3. `409 Conflict`
    
    요청 형식은 올바르지만 현재 서버의 데이터나 리소스 상태와 충돌하여 요청을 처리할 수 없다는 의미다.
    
    예를 들어 이미 가입된 이메일로 회원가입을 요청하면 기존 회원 데이터와 충돌한다.
    
    ```
    POST /members
    
    {
      "email": "user@example.com"
    }
    ```
    
    ```
    HTTP/1.1 409 Conflict
    Content-Type: application/json
    
    {
      "status": 409,
      "message": "이미 사용 중인 이메일입니다."
    }
    ```
    
    ### Spring Boot 예외 클래스
    
    ```java
    public class DuplicateEmailException
            extends RuntimeException {
    
        public DuplicateEmailException(String message) {
            super(message);
        }
    }
    ```
    
    ### Service에서 예외 발생
    
    ```java
    @Service
    @RequiredArgsConstructor
    public class MemberService {
    
        private final MemberRepository memberRepository;
        private final PasswordEncoder passwordEncoder;
    
        public MemberResponse create(
                CreateMemberRequest request
        ) {
            if (memberRepository.existsByEmail(
                    request.email()
            )) {
                throw new DuplicateEmailException(
                        "이미 사용 중인 이메일입니다."
                );
            }
    
            String encodedPassword =
                    passwordEncoder.encode(
                            request.password()
                    );
    
            Member member = new Member(
                    request.email(),
                    encodedPassword,
                    request.name()
            );
    
            Member savedMember =
                    memberRepository.save(member);
    
            return new MemberResponse(
                    savedMember.getMemberId(),
                    savedMember.getName()
            );
        }
    }
    ```
    
    ### `@RestControllerAdvice`에서 `409`로 변환
    
    ```java
    @RestControllerAdvice
    public class GlobalExceptionHandler {
    
        @ExceptionHandler(DuplicateEmailException.class)
        public ResponseEntity<ErrorResponse> handleDuplicateEmail(
                DuplicateEmailException exception
        ) {
            ErrorResponse response = new ErrorResponse(
                    409,
                    exception.getMessage()
            );
    
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(response);
        }
    }
    ```
    
    ```java
    public record ErrorResponse(
            int status,
            String message
    ) {
    }
    ```
    
    처리 과정은 다음과 같다.
    
    ```
    이미 존재하는 이메일 확인
    → DuplicateEmailException 발생
    → @RestControllerAdvice에서 예외 처리
    → 409 Conflict 응답
    ```
    
    이메일에는 데이터베이스의 `UNIQUE` 제약 조건도 함께 설정해야 한다. 사전 중복 조회만으로는 동시에 들어온 요청을 완전히 막을 수 없기 때문이다.
    
    ### 사용 예시
    
    - 이미 사용 중인 이메일이나 닉네임
    - 같은 사용자가 같은 게시글에 좋아요를 중복 등록
    - 이미 취소된 주문을 다시 취소
    - 이미 대여 중인 책을 다시 대여
    - 다른 사용자의 수정으로 데이터 버전이 충돌
    - 현재 상태에서는 허용되지 않는 상태 변경
    
    ### `400 Bad Request`와 차이
    
    | 상태 코드 | 의미 | 예시 |
    | --- | --- | --- |
    | `400 Bad Request` | 요청값의 형식이나 내용이 잘못됨 | 이메일 형식 오류, 필수값 누락 |
    | `409 Conflict` | 요청은 올바르지만 현재 데이터나 상태와 충돌 | 이미 가입된 이메일, 중복 좋아요 |
    
    ```
    이메일 형식이 올바르지 않음
    → 400 Bad Request
    
    이메일 형식은 올바르지만 이미 가입된 이메일임
    → 409 Conflict
    ```
    
    ---
    
    ## 핵심 비교
    
    | 상태 코드 | 의미 | 대표 상황 | Spring Boot 표현 |
    | --- | --- | --- | --- |
    | `201 Created` | 새로운 리소스 생성 성공 | 회원가입, 게시글 생성 | `ResponseEntity.created()` |
    | `204 No Content` | 요청 성공, 반환할 내용 없음 | 삭제, 응답 없는 수정 | `ResponseEntity.noContent()` |
    | `409 Conflict` | 현재 데이터 또는 상태와 충돌 | 중복 이메일, 중복 요청 | `HttpStatus.CONFLICT` |
    
    > 새로운 리소스를 생성했으면 `201`, 성공했지만 반환할 데이터가 없으면 `204`, 기존 데이터나 현재 상태와 충돌하면 `409`를 사용한다.
    > 
- UNIQUE 제약 조건과 동시성
    
    `UNIQUE` 제약 조건은 특정 컬럼이나 여러 컬럼의 조합에 중복된 값이 저장되지 않도록 데이터베이스가 보장하는 규칙이다.
    
    ```sql
    CREATE TABLE member (
        member_id BIGINT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL UNIQUE
    );
    ```
    
    위 테이블에는 같은 이메일을 가진 회원을 두 명 이상 저장할 수 없다.
    
    ---
    
    ### 애플리케이션의 중복 검사만으로 부족한 이유
    
    회원가입 전에 다음과 같이 이메일 중복 여부를 조회할 수 있다.
    
    ```
    1. 이메일이 이미 존재하는지 조회
    2. 존재하지 않으면 회원 데이터 저장
    ```
    
    하지만 같은 이메일로 두 요청이 동시에 들어오면 경쟁 상태가 발생할 수 있다.
    
    ```
    요청 A: 중복 조회 → 없음
    요청 B: 중복 조회 → 없음
    
    요청 A: INSERT → 성공
    요청 B: INSERT → 성공
    ```
    
    두 요청 모두 저장 전에 수행한 조회에서는 중복 데이터를 찾지 못한다. `SELECT`와 `INSERT` 사이에 다른 요청이 들어올 수 있기 때문이다.
    
    ---
    
    ### `UNIQUE` 제약 조건이 있는 경우
    
    이메일에 `UNIQUE` 제약이 설정되어 있으면 데이터베이스가 최종적으로 중복을 막는다.
    
    ```
    요청 A: 중복 조회 → 없음
    요청 B: 중복 조회 → 없음
    
    요청 A: INSERT → 성공
    요청 B: INSERT → UNIQUE 제약 위반
    ```
    
    따라서 동시에 같은 값이 들어오더라도 하나의 요청만 성공하며, 중복 데이터는 저장되지 않는다.
    
    ---
    
    ### 중복 조회와 `UNIQUE` 제약의 역할
    
    | 구분 | 애플리케이션 중복 조회 | DB `UNIQUE` 제약 |
    | --- | --- | --- |
    | 목적 | 사용자에게 오류를 미리 안내 | 중복 데이터 최종 차단 |
    | 동시 요청 대응 | 완전히 보장하지 못함 | 데이터베이스 수준에서 보장 |
    | 역할 | 사전 검사 | 최종 안전장치 |
    
    두 방법을 함께 사용하는 것이 좋다.
    
    ```
    애플리케이션에서 중복 여부 확인
    → 중복이면 오류 응답
    → 저장 시 DB의 UNIQUE 제약으로 다시 검증
    → 동시 요청에 의한 UNIQUE 위반도 오류로 처리
    ```
    
    ---
    
    ### 복합 `UNIQUE`
    
    여러 컬럼의 조합이 중복되지 않도록 설정할 수도 있다.
    
    ```sql
    CREATE TABLE book_like (
        member_id BIGINT NOT NULL,
        book_id BIGINT NOT NULL,
    
        UNIQUE (member_id, book_id)
    );
    ```
    
    각 사용자는 여러 책에 좋아요를 누를 수 있고, 하나의 책도 여러 사용자에게 좋아요를 받을 수 있다. 하지만 같은 사용자가 같은 책에 좋아요를 두 번 누르는 것은 허용되지 않는다.
    
    | `member_id` | `book_id` | 결과 |
    | --- | --- | --- |
    | 1 | 10 | 저장 가능 |
    | 1 | 20 | 저장 가능 |
    | 2 | 10 | 저장 가능 |
    | 1 | 10 | 중복으로 저장 불가 |
    
    > 애플리케이션의 중복 조회만으로는 동시 요청을 완전히 처리할 수 없다. 중복 불가 규칙은 반드시 데이터베이스의 `UNIQUE` 제약 조건으로 보장해야 한다.
    > 
- @RestControllerAdvice / Exception Filter
    
    두 기능은 사용하는 프레임워크는 다르지만 역할은 비슷하다. 애플리케이션에서 발생한 예외를 한곳에서 처리하고, 일정한 형식의 HTTP 오류 응답으로 변환한다.
    
    ---
    
    ## 1. Spring의 `@RestControllerAdvice`
    
    `@RestControllerAdvice`는 여러 Controller에서 발생한 예외를 전역적으로 처리하는 Spring 기능이다.
    
    ```java
    @RestControllerAdvice
    public class GlobalExceptionHandler {
    
        @ExceptionHandler(MemberNotFoundException.class)
        public ResponseEntity<ErrorResponse> handleMemberNotFound(
                MemberNotFoundException exception
        ) {
            ErrorResponse response = new ErrorResponse(
                    404,
                    exception.getMessage()
            );
    
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(response);
        }
    }
    ```
    
    `@ExceptionHandler`에는 처리할 예외 클래스를 지정한다.
    
    ```java
    throw new MemberNotFoundException("회원을 찾을 수 없습니다.");
    ```
    
    처리 과정은 다음과 같다.
    
    ```
    Controller 또는 Service에서 예외 발생
    → @RestControllerAdvice가 예외 확인
    → 일치하는 @ExceptionHandler 실행
    → HTTP 상태 코드와 오류 본문 반환
    ```
    
    `@RestControllerAdvice`는 `@ControllerAdvice`와 `@ResponseBody`를 결합한 것으로, 처리 결과를 JSON과 같은 응답 본문으로 반환한다. docs.spring.io
    
    ### 공통 응답 객체
    
    ```java
    public record ErrorResponse(
            int status,
            String message
    ) {
    }
    ```
    
    다양한 예외를 같은 구조로 응답할 수 있다.
    
    ```java
    @RestControllerAdvice
    public class GlobalExceptionHandler {
    
        @ExceptionHandler(MemberNotFoundException.class)
        public ResponseEntity<ErrorResponse> handleNotFound(
                MemberNotFoundException exception
        ) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(
                            404,
                            exception.getMessage()
                    ));
        }
    
        @ExceptionHandler(DuplicateEmailException.class)
        public ResponseEntity<ErrorResponse> handleConflict(
                DuplicateEmailException exception
        ) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse(
                            409,
                            exception.getMessage()
                    ));
        }
    }
    ```
    
    ---
    
    ## 2. NestJS의 Exception Filter
    
    Exception Filter는 NestJS에서 발생한 예외를 가로채 HTTP 응답으로 변환하는 기능이다.
    
    ```tsx
    import {
      ArgumentsHost,
      Catch,
      ExceptionFilter,
      HttpException,
    } from "@nestjs/common";
    import { Request, Response } from "express";
    
    @Catch(HttpException)
    export class HttpExceptionFilter
      implements ExceptionFilter
    {
      catch(
        exception: HttpException,
        host: ArgumentsHost,
      ): void {
        const context = host.switchToHttp();
        const response = context.getResponse<Response>();
        const request = context.getRequest<Request>();
    
        const status = exception.getStatus();
    
        response.status(status).json({
          statusCode: status,
          message: exception.message,
          path: request.url,
          timestamp: new Date().toISOString(),
        });
      }
    }
    ```
    
    각 요소의 역할은 다음과 같다.
    
    - `@Catch(HttpException)`: 처리할 예외 종류를 지정한다.
    - `ExceptionFilter`: Exception Filter가 구현해야 하는 인터페이스다.
    - `catch()`: 예외가 발생했을 때 실행된다.
    - `ArgumentsHost`: 요청과 응답 객체에 접근할 수 있게 한다.
    
    `@Catch()`에 예외를 지정하지 않으면 처리되지 않은 모든 예외를 잡는 전역 필터로 사용할 수 있다. NestJS - A progressive Node.js framework
    
    ---
    
    ## 공통 목적
    
    | 구분 | Spring | NestJS |
    | --- | --- | --- |
    | 전역 예외 처리 | `@RestControllerAdvice` | Exception Filter |
    | 처리할 예외 지정 | `@ExceptionHandler` | `@Catch` |
    | 실제 처리 메서드 | 어노테이션이 붙은 메서드 | `catch()` |
    | 주요 목적 | 예외를 HTTP 응답으로 변환 | 예외를 HTTP 응답으로 변환 |
    | 응답 형식 통일 | 가능 | 가능 |
    
    두 기능을 사용하면 각 Controller에서 반복적으로 `try-catch`를 작성하지 않아도 된다.
    
    ```
    비즈니스 로직
    → 필요한 예외를 발생시킴
    
    전역 예외 처리기
    → 예외 종류에 맞는 상태 코드 결정
    → 공통 오류 응답 생성
    ```
    
    예상하지 못한 내부 오류는 보통 `500 Internal Server Error`로 처리하고, 스택 트레이스나 DB 오류처럼 서버 내부 정보는 클라이언트 응답에 그대로 노출하지 않아야 한다.
    
    > Spring에서는 `@RestControllerAdvice`와 `@ExceptionHandler`를 사용하고, NestJS에서는 Exception Filter와 `@Catch`를 사용하여 예외 응답을 한곳에서 관리한다.
    >