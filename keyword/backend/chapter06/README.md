# chapter06

- Bean Validation과 @Valid
    
    ### Bean Validation이란?
    
    Bean Validation은 Java에서 객체에 들어온 데이터가 정해진 조건을 만족하는지 검사하는 기능이다.
    
    쉽게 말하면, 사용자가 입력한 값이 올바른지 확인하는 규칙이다.
    
    예를 들어 영화 평점 서비스에서 사용자가 다음과 같이 평점을 등록한다고 가정해 보자.
    
    ```json
    {
      "movieId": 100,
      "score": 8,
      "comment": "재미있었습니다."
    }
    ```
    
    그런데 우리 서비스에서는 별점을 1점부터 5점까지만 입력할 수 있도록 정했다.
    
    따라서 `score`가 8이라면 잘못된 요청으로 처리해야 한다.
    
    이때 Bean Validation을 사용하면 직접 `if`문을 작성하지 않고도 입력값을 검증할 수 있다.
    
    ### Bean Validation에서 사용하는 어노테이션
    
    | 어노테이션 | 역할 | 예시 |
    | --- | --- | --- |
    | `@NotNull` | null 값 금지 | 별점 필수 입력 |
    | `@NotBlank` | null, 빈 문자열, 공백만 있는 문자열 금지 | 닉네임 필수 입력 |
    | `@Email` | 이메일 형식 검증 | 이메일 입력 |
    | `@Size` | 문자열 길이 등 크기 제한 | 후기 최대 500자 |
    | `@Min` | 최솟값 제한 | 별점 1점 이상 |
    | `@Max` | 최댓값 제한 | 별점 5점 이하 |
    | `@Positive` | 양수만 허용 | 영화 ID |
    
    예를 들어 이번 실습에서 작성한 `CreateRatingRequest`는 다음과 같다.
    
    ```java
    public record CreateRatingRequest(
            @NotNull(message = "영화 ID를 입력해주세요.")
            @Positive(message = "영화 ID는 양수여야 합니다.")
            Long movieId,
    
            @NotNull(message = "별점을 입력해주세요.")
            @Min(value = 1, message = "별점은 1점 이상이어야 합니다.")
            @Max(value = 5, message = "별점은 5점 이하여야 합니다.")
            Integer score,
    
            @Size(max = 500, message = "후기는 500자 이하로 입력해주세요.")
            String comment
    ) {}
    ```
    
    여기서 `score`에는 세 가지 검증 규칙이 적용되어 있다.
    
    - `@NotNull`: 별점을 반드시 입력해야 한다.
    - `@Min(1)`: 별점은 최소 1점이어야 한다.
    - `@Max(5)`: 별점은 최대 5점이어야 한다.
    
    따라서 별점을 입력하지 않거나 6점을 입력하면 검증에 실패한다.
    
    또한 `message`를 설정하면 검증에 실패했을 때 사용할 오류 메시지를 지정할 수 있다.
    
    ### @Valid란?
    
    그런데 DTO에 `@NotNull`, `@Min`, `@Max` 같은 어노테이션을 붙이기만 하면 자동으로 검증되는 걸까?
    
    그렇지는 않다.
    
    Bean Validation이 검증 규칙을 정의하는 역할이라면, `@Valid`는 해당 객체에 설정된 검증 규칙을 실행하도록 요청하는 역할이다.
    
    Spring Boot에서는 주로 Controller에서 `@Valid`를 사용한다.
    
    이번 실습에서 작성한 평점 등록 Controller를 살펴보자.
    
    ```java
    @PostMapping("/{memberId}/ratings")
    public ResponseEntity<ApiResponse<Long>> create(
            @PathVariable Long memberId,
            @Valid @RequestBody CreateRatingRequest request
    ) {
        Long ratingId = ratingService.create(memberId, request);
    
        return ResponseEntity.status(201)
                .body(ApiResponse.created("평점 등록에 성공했습니다.", ratingId));
    }
    ```
    
    여기서 중요한 부분은 다음 코드이다.
    
    ```java
    @Valid @RequestBody CreateRatingRequest request
    ```
    
    각 어노테이션의 역할은 다음과 같다.
    
    - `@RequestBody`: 클라이언트가 보낸 JSON 데이터를 Java 객체로 변환한다.
    - `@Valid`: 변환된 객체가 DTO에 정의된 검증 규칙을 만족하는지 확인한다.
    
    예를 들어 클라이언트가 `score`에 8을 입력했다면, `@Valid`를 통해 `@Max(5)` 조건을 위반했다는 사실을 확인할 수 있다.
    
    검증에 실패하면 일반적으로 Service의 평점 등록 로직을 실행하지 않고 오류 응답을 반환한다.
    
    ### Bean Validation과 @Valid의 동작 과정
    
    클라이언트가 다음과 같은 요청을 보냈다고 가정해 보자.
    
    ```
    POST /members/1/ratings
    Content-Type: application/json
    ```
    
    ```json
    {
      "movieId": 100,
      "score": 8,
      "comment": "재미있었습니다."
    }
    ```
    
    이 요청은 다음 순서로 처리된다.
    
    1. 클라이언트가 서버에 평점 등록 요청을 보낸다.
    2. `@RequestBody`가 JSON 데이터를 `CreateRatingRequest` 객체로 변환한다.
    3. `@Valid`가 DTO에 작성된 Bean Validation 규칙을 검사한다.
    4. `score`가 8이므로 `@Max(5)` 조건을 위반한다.
    5. 검증에 실패하여 `400 Bad Request` 응답을 반환한다.
    
    반대로 `score`가 5라면 검증을 통과하고, Controller에서 `RatingService`의 평점 등록 기능을 실행한다.
    
    ### 검증에 실패하면 어떻게 될까?
    
    Spring Boot에서 `@Valid`를 사용한 요청 본문 검증에 실패하면 일반적으로 `MethodArgumentNotValidException`이라는 예외가 발생한다.
    
    이 예외는 요청 데이터가 DTO에 정의된 검증 조건을 만족하지 못했다는 의미이다.
    
    예를 들어 별점에 8을 입력하면 다음과 같은 오류 메시지를 사용할 수 있다.
    
    ```json
    {
      "isSuccess": false,
      "code": "COMMON400",
      "message": "별점은 5점 이하여야 합니다.",
      "result": null
    }
    ```
    
    위 JSON은 이번 실습의 `ApiResponse` 구조를 이용한 예시이며, 실제 메시지와 오류 코드는 예외 처리 구현에 따라 달라질 수 있다.
    
    이번 실습에서는 `GlobalExceptionHandler`를 통해 이러한 검증 오류를 처리하고, 공통된 응답 형식으로 반환하도록 구현하였다.
    
    ### Bean Validation을 사용하는 이유
    
    Bean Validation을 사용하지 않는다면 입력값을 직접 검사하는 코드를 작성해야 한다.
    
    예를 들어 다음과 같다.
    
    ```java
    if (request.score() == null) {
        throw new IllegalArgumentException("별점을 입력해주세요.");
    }
    
    if (request.score() < 1 || request.score() > 5) {
        throw new IllegalArgumentException("별점은 1~5점 사이여야 합니다.");
    }
    ```
    
    하지만 Bean Validation을 사용하면 이러한 기본적인 입력값 검증을 DTO에 어노테이션으로 작성할 수 있다.
    
    따라서 Controller나 Service에 반복적인 검증 코드를 작성할 필요가 줄어들고, 입력값에 대한 규칙도 한곳에서 관리할 수 있다.
    
    다만 모든 검증을 Bean Validation으로 처리할 수 있는 것은 아니다.
    
    예를 들어 동일한 회원이 이미 해당 영화에 평점을 등록했는지 확인하려면 데이터베이스를 조회해야 한다.
    
    이러한 검증은 이번 실습처럼 Service에서 Repository를 이용해 처리하는 것이 적절하다.
    
    즉, Bean Validation은 이메일 형식이나 별점 범위처럼 입력값 자체의 조건을 검사할 때 주로 사용하고, 중복 등록이나 작성자 확인처럼 데이터베이스 조회가 필요한 검증은 Service에서 처리할 수 있다.
    
    정리하면, **Bean Validation은 입력값의 검증 규칙을 정의하는 기능이고, `@Valid`는 그 규칙을 실제 요청 데이터에 적용하도록 하는 어노테이션**이다.
    
- class-validator와 ValidationPipe
    
    ### class-validator란?
    
    class-validator는 TypeScript에서 객체에 들어온 데이터가 정해진 조건을 만족하는지 검사할 수 있도록 도와주는 라이브러리이다.
    
    쉽게 말하면, 사용자가 입력한 값이 올바른지 확인하기 위한 검증 규칙을 작성하는 도구이다.
    
    앞에서 배운 Bean Validation과 비슷한 역할을 하지만, 주로 NestJS와 같은 TypeScript 기반 백엔드에서 사용한다.
    
    예를 들어 회원가입 API에서 사용자가 다음과 같은 데이터를 보냈다고 가정해 보자.
    
    ```json
    {
      "email": "wrong-email",
      "nickname": "emil",
      "password": "1234"
    }
    ```
    
    그런데 회원가입 조건이 다음과 같다면 문제가 발생한다.
    
    - 이메일은 올바른 이메일 형식이어야 한다.
    - 닉네임은 비어 있으면 안 된다.
    - 비밀번호는 최소 8자 이상이어야 한다.
    
    위 요청에서는 이메일 형식이 잘못되었고, 비밀번호도 4자이므로 조건을 만족하지 못한다.
    
    이러한 입력값 검증을 `class-validator`를 이용해 구현할 수 있다.
    
    ### class-validator에서 사용하는 데코레이터
    
    NestJS에서는 Java의 어노테이션과 비슷한 **데코레이터(Decorator)**를 사용하여 검증 규칙을 작성한다.
    
    데코레이터는 `@` 기호로 시작하며, 클래스나 속성에 추가적인 기능 또는 규칙을 적용할 때 사용한다.
    
    | 데코레이터 | 역할 | 예시 |
    | --- | --- | --- |
    | `@IsNotEmpty()` | 빈 값 금지 | 닉네임 필수 입력 |
    | `@IsEmail()` | 이메일 형식 검증 | 회원가입 이메일 |
    | `@IsString()` | 문자열인지 확인 | 닉네임, 비밀번호 |
    | `@MinLength()` | 문자열 최소 길이 제한 | 비밀번호 8자 이상 |
    | `@MaxLength()` | 문자열 최대 길이 제한 | 닉네임 20자 이하 |
    | `@Min()` | 숫자 최솟값 제한 | 별점 1점 이상 |
    | `@Max()` | 숫자 최댓값 제한 | 별점 5점 이하 |
    | `@IsInt()` | 정수인지 확인 | 영화 ID |
    | `@IsOptional()` | 값이 없을 경우 다른 검증 생략 | 선택 입력 항목 |
    
    예를 들어 회원가입 DTO를 다음과 같이 작성할 수 있다.
    
    ```tsx
    import {
      IsEmail,
      IsNotEmpty,
      IsString,
      MinLength,
    } from 'class-validator';
    
    export class SignUpDto {
      @IsEmail()
      email: string;
    
      @IsString()
      @IsNotEmpty()
      nickname: string;
    
      @IsString()
      @MinLength(8)
      password: string;
    }
    ```
    
    여기서 각 검증 규칙은 다음과 같은 의미를 가진다.
    
    - `@IsEmail()`: 이메일 형식이 올바른지 확인한다.
    - `@IsString()`: 입력값이 문자열인지 확인한다.
    - `@IsNotEmpty()`: 값이 비어 있지 않은지 확인한다.
    - `@MinLength(8)`: 문자열의 길이가 최소 8자인지 확인한다.
    
    따라서 이메일 형식이 잘못되거나 비밀번호가 8자보다 짧다면 검증에 실패한다.
    
    ### ValidationPipe란?
    
    그런데 DTO에 `@IsEmail()`, `@MinLength()` 같은 데코레이터를 작성하기만 하면 자동으로 검증되는 걸까?
    
    그렇지는 않다.
    
    class-validator가 검증 규칙을 정의하는 역할이라면, ValidationPipe는 요청이 들어왔을 때 그 규칙을 실제로 검사하는 역할이다.
    
    여기서 Pipe는 NestJS에서 요청 데이터를 Controller에 전달하기 전에 처리하는 기능이다.
    
    Pipe는 주로 두 가지 역할을 수행한다.
    
    - 변환(Transformation): 요청 데이터를 필요한 자료형이나 객체로 변환한다.
    - 검증(Validation): 요청 데이터가 정해진 조건을 만족하는지 검사한다.
    
    `ValidationPipe`는 이 중 입력값 검증을 담당하며, 옵션에 따라 데이터 변환도 수행할 수 있다.
    
    ### ValidationPipe 사용 방법
    
    NestJS에서는 Controller에서 다음과 같이 사용할 수 있다.
    
    ```tsx
    import {
      Body,
      Controller,
      Post,
      ValidationPipe,
    } from '@nestjs/common';
    
    @Controller('members')
    export class MemberController {
      @Post()
      create(
        @Body(new ValidationPipe()) request: SignUpDto,
      ) {
        return this.memberService.create(request);
      }
    }
    ```
    
    여기서 중요한 부분은 다음 코드이다.
    
    ```tsx
    @Body(new ValidationPipe()) request: SignUpDto
    ```
    
    각 요소의 역할은 다음과 같다.
    
    - `@Body()`: 클라이언트가 보낸 HTTP 요청 본문을 가져온다.
    - `ValidationPipe`: 요청 데이터가 DTO의 검증 규칙을 만족하는지 검사한다.
    - `SignUpDto`: 회원가입 요청 데이터의 구조와 검증 규칙을 정의한 클래스이다.
    
    예를 들어 클라이언트가 잘못된 이메일을 입력했다면 `ValidationPipe`가 `@IsEmail()` 조건을 확인하고 검증 실패로 처리한다.
    
    검증에 실패하면 기본적으로 `400 Bad Request` 응답을 반환하며, Controller의 회원가입 로직은 실행되지 않는다.
    
    ### ValidationPipe를 전역으로 적용하는 방법
    
    앞의 예시에서는 특정 Controller 메서드에만 `ValidationPipe`를 적용하였다.
    
    하지만 API가 많아진다면 모든 메서드에 `ValidationPipe`를 작성하는 것은 번거로울 수 있다.
    
    이때 **전역 파이프(Global Pipe)**를 사용하면 애플리케이션 전체에 공통으로 적용할 수 있다.
    
    NestJS의 `main.ts`에서 다음과 같이 설정한다.
    
    ```tsx
    import { ValidationPipe } from '@nestjs/common';
    import { NestFactory } from '@nestjs/core';
    import { AppModule } from './app.module';
    
    async function bootstrap() {
      const app = await NestFactory.create(AppModule);
    
      app.useGlobalPipes(new ValidationPipe());
    
      await app.listen(3000);
    }
    
    bootstrap();
    ```
    
    여기서 중요한 부분은 다음 코드이다.
    
    ```tsx
    app.useGlobalPipes(new ValidationPipe());
    ```
    
    이 코드는 애플리케이션 전체에 `ValidationPipe`를 등록한다는 의미이다.
    
    따라서 Controller마다 직접 `ValidationPipe`를 작성하지 않아도, 검증 대상 DTO가 사용되는 요청에서 검증을 수행할 수 있다.
    
    ### ValidationPipe의 주요 옵션
    
    `ValidationPipe`에는 검증 방식을 설정하는 여러 옵션이 있다.
    
    대표적으로 `whitelist`, `forbidNonWhitelisted`, `transform`이 있다.
    
    ```tsx
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    ```
    
    | 옵션 | 역할 |
    | --- | --- |
    | `whitelist: true` | 검증 데코레이터가 없는 DTO 속성을 요청 데이터에서 제거 |
    | `forbidNonWhitelisted: true` | 허용되지 않은 속성이 들어오면 제거하는 대신 오류 반환 |
    | `transform: true` | 요청 데이터를 DTO 클래스 인스턴스 등 필요한 형태로 변환 |
    
    예를 들어 회원가입 DTO에는 `email`, `nickname`, `password`만 정의되어 있다고 가정해 보자.
    
    그런데 사용자가 다음과 같이 요청을 보냈다.
    
    ```json
    {
      "email": "test@example.com",
      "nickname": "emil",
      "password": "12345678",
      "role": "ADMIN"
    }
    ```
    
    여기서 `role`은 DTO에 정의되지 않은 속성이다.
    
    `whitelist: true`만 설정했다면 `role`이 제거되고, 나머지 데이터만 전달된다.
    
    반면 `forbidNonWhitelisted: true`도 함께 설정했다면 허용되지 않은 `role`이 포함되어 있다는 이유로 `400 Bad Request`가 반환된다.
    
    이러한 설정은 클라이언트가 서버에서 허용하지 않은 데이터를 임의로 전달하는 것을 제한하는 데 도움이 된다.
    
    다만 DTO 검증만으로 모든 보안 문제가 해결되는 것은 아니므로, 사용자 권한 확인과 같은 검증은 별도로 필요하다.
    
    ### class-validator와 ValidationPipe의 동작 과정
    
    클라이언트가 다음과 같이 회원가입 요청을 보냈다고 가정해 보자.
    
    ```
    POST /members
    Content-Type: application/json
    ```
    
    ```json
    {
      "email": "wrong-email",
      "nickname": "emil",
      "password": "1234"
    }
    ```
    
    이 요청은 다음 순서로 처리된다.
    
    1. 클라이언트가 NestJS 서버에 회원가입 요청을 보낸다.
    2. `@Body()`가 요청 본문의 데이터를 가져온다.
    3. `ValidationPipe`가 `SignUpDto`에 작성된 검증 규칙을 확인한다.
    4. `@IsEmail()`과 `@MinLength(8)` 조건을 만족하지 못한다.
    5. 검증에 실패하여 `400 Bad Request` 응답을 반환한다.
    
    기본 설정에서는 다음과 같은 형태의 오류 응답을 받을 수 있다.
    
    ```json
    {
      "message": [
        "email must be an email",
        "password must be longer than or equal to 8 characters"
      ],
      "error": "Bad Request",
      "statusCode": 400
    }
    ```
    
    실제 오류 메시지나 순서는 검증 규칙과 설정에 따라 달라질 수 있다.
    
    반대로 이메일과 비밀번호가 조건을 만족한다면 검증을 통과하고, Controller에서 회원가입 로직을 실행한다.
    
    ### Spring Boot의 Bean Validation과 비교
    
    Spring Boot와 NestJS는 사용하는 언어와 문법은 다르지만, 입력값을 검증하는 기본적인 구조는 비슷하다.
    
    | 구분 | Spring Boot | NestJS |
    | --- | --- | --- |
    | 사용 언어 | Java | TypeScript |
    | 검증 규칙 작성 | Bean Validation | class-validator |
    | 검증 실행 | `@Valid` | `ValidationPipe` |
    | 이메일 검증 | `@Email` | `@IsEmail()` |
    | 문자열 길이 검증 | `@Size` | `@MinLength()`, `@MaxLength()` |
    | 숫자 범위 검증 | `@Min`, `@Max` | `@Min()`, `@Max()` |
    | 검증 실패 시 | 일반적으로 400 | 기본적으로 400 |
    
    예를 들어 이메일 형식을 검증한다면 Spring Boot에서는 다음과 같이 작성한다.
    
    ```java
    @Email
    String email;
    ```
    
    NestJS에서는 다음과 같이 작성한다.
    
    ```tsx
    @IsEmail()
    email: string;
    ```
    
    두 코드 모두 이메일 형식을 검증하기 위한 규칙을 정의한다는 점에서 비슷하다.
    
    차이점은 Spring Boot에서는 주로 `@Valid`를 통해 검증을 실행하고, NestJS에서는 `ValidationPipe`를 통해 검증을 실행한다는 것이다.
    
    또한 NestJS의 `class-validator`는 런타임에 사용할 클래스의 데코레이터를 기반으로 동작하므로, 검증용 DTO를 일반적으로 `interface`가 아닌 `class`로 정의한다.
    
    ### class-validator와 ValidationPipe를 사용하는 이유
    
    입력값 검증을 사용하지 않는다면 Controller나 Service에서 이메일 형식, 문자열 길이, 숫자 범위 등을 직접 확인해야 한다.
    
    하지만 `class-validator`와 `ValidationPipe`를 사용하면 검증 규칙을 DTO에 모아서 작성하고, 요청이 들어왔을 때 자동으로 검사할 수 있다.
    
    이를 통해 반복적인 검증 코드를 줄이고, 잘못된 데이터가 실제 비즈니스 로직에 전달되는 것을 방지할 수 있다.
    
    다만 Spring Boot의 Bean Validation과 마찬가지로 모든 검증을 처리할 수 있는 것은 아니다.
    
    예를 들어 이미 가입한 이메일인지 확인하거나, 다른 회원의 평점을 수정하려는 요청인지 확인하려면 데이터베이스 조회와 권한 검사가 필요하다.
    
    이러한 작업은 일반적으로 Service에서 별도로 처리한다.
    
    정리하면, **class-validator는 입력값의 검증 규칙을 정의하는 라이브러리이고, ValidationPipe는 그 규칙을 실제 HTTP 요청에 적용하여 검증하는 NestJS의 기능**이다.
    
- bcrypt와 salt round
    
    ### bcrypt란?
    
    bcrypt는 사용자의 비밀번호를 안전하게 저장하기 위해 사용하는 비밀번호 해싱 알고리즘이다.
    
    쉽게 말하면, 사용자가 입력한 비밀번호를 원래 값을 알아보기 어려운 형태로 변환하는 방법이다.
    
    예를 들어 회원가입할 때 사용자가 다음과 같은 비밀번호를 입력했다고 가정해 보자.
    
    ```
    password1234
    ```
    
    만약 서버가 이 비밀번호를 데이터베이스에 그대로 저장한다면 다음과 같은 형태가 된다.
    
    | 회원 ID | 이메일 | 비밀번호 |
    | --- | --- | --- |
    | 1 | test@example.com | password1234 |
    
    이처럼 비밀번호를 원래 문자열 그대로 저장하는 것을 평문(Plaintext) 저장이라고 한다.
    
    평문으로 저장하면 데이터베이스가 유출되었을 때 사용자의 비밀번호가 그대로 노출될 수 있다.
    
    이를 방지하기 위해 bcrypt를 사용한다.
    
    bcrypt를 적용하면 비밀번호가 다음과 같은 형태로 저장된다.
    
    ```
    $2a$10$7EqJtq98hPqEX7fNZaFWoO...
    ```
    
    위 문자열은 bcrypt 해시의 형태를 보여 주기 위한 예시이다.
    
    이렇게 저장하면 데이터베이스를 조회하더라도 사용자의 실제 비밀번호를 바로 확인할 수 없다.
    
    ### 해싱(Hashing)이란?
    
    해싱은 입력한 데이터를 해시 함수를 이용하여 일정한 형식의 결과값으로 변환하는 과정이다.
    
    예를 들어 다음과 같이 생각할 수 있다.
    
    ```
    원본 비밀번호
    password1234
           ↓
        bcrypt
           ↓
    해시된 비밀번호
    $2a$10$...
    ```
    
    여기서 중요한 점은 해싱과 암호화는 서로 다르다는 것이다.
    
    | 구분 | 해싱(Hashing) | 암호화(Encryption) |
    | --- | --- | --- |
    | 목적 | 데이터 검증, 비밀번호 보호 등 | 데이터 기밀성 보호 |
    | 원래 값 복원 | 원칙적으로 복호화 불가능 | 올바른 키가 있으면 복호화 가능 |
    | 대표적인 예시 | bcrypt, SHA-256 | AES |
    | 비밀번호 저장 | bcrypt 같은 전용 해싱 방식 권장 | 일반적으로 복호화 가능한 형태로 저장하지 않음 |
    
    예를 들어 AES로 암호화한 데이터는 암호화 키를 이용해 다시 복호화할 수 있다.
    
    반면 bcrypt는 해시값을 원래 비밀번호로 되돌리는 복호화 기능이 없다.
    
    그렇다고 해시된 비밀번호가 절대 알아낼 수 없는 것은 아니다. 공격자가 여러 비밀번호를 추측하고 비교하는 방식으로 원래 비밀번호를 찾아낼 가능성은 있다.
    
    bcrypt는 이러한 추측 작업에 많은 계산 시간이 들도록 설계된 알고리즘이다.
    
    ### Salt란?
    
    그런데 단순히 비밀번호를 해싱하기만 하면 충분할까?
    
    일반적인 해시 함수에서는 같은 데이터를 입력하면 항상 같은 해시값이 나온다.
    
    예를 들어 두 사용자가 동일한 비밀번호를 사용한다고 가정해 보자.
    
    ```
    사용자 A: password1234
    사용자 B: password1234
    ```
    
    별도의 처리를 하지 않고 일반적인 해시 함수를 적용하면 두 사용자의 해시값도 같아진다.
    
    이렇게 되면 데이터베이스가 유출되었을 때 공격자가 서로 같은 비밀번호를 사용하는 계정을 알아낼 수 있다.
    
    이러한 문제를 방지하기 위해 사용하는 것이 Salt이다.
    
    Salt는 비밀번호를 해싱할 때 함께 사용하는 무작위 데이터이다.
    
    쉽게 말하면, 같은 비밀번호라도 서로 다른 해시값이 만들어지도록 추가하는 임의의 값이다.
    
    예를 들어 다음과 같다.
    
    ```
    사용자 A
    비밀번호: password1234
    Salt: abc123
           ↓
    서로 다른 해시값 A
    
    사용자 B
    비밀번호: password1234
    Salt: xyz789
           ↓
    서로 다른 해시값 B
    ```
    
    두 사용자가 동일한 비밀번호를 입력했더라도 서로 다른 Salt를 사용했기 때문에 해시값이 달라진다.
    
    bcrypt는 이러한 Salt를 자동으로 생성하고 사용한다.
    
    따라서 개발자가 별도로 무작위 문자열을 만들어 비밀번호에 붙일 필요가 없다.
    
    ### Salt round란?
    
    Salt round는 bcrypt가 비밀번호를 해싱할 때 사용하는 계산 비용을 결정하는 설정값이다.
    
    일반적으로 bcrypt에서는 이를 cost factor 또는 work factor라고 부른다.
    
    쉽게 말하면, 비밀번호를 해싱하는 데 얼마나 많은 계산을 수행할지 정하는 값이다.
    
    여기서 주의할 점은 Salt와 Salt round가 서로 다른 개념이라는 것이다.
    
    - Salt: 같은 비밀번호라도 서로 다른 해시값이 나오도록 사용하는 무작위 데이터
    - Salt round: bcrypt의 계산 비용을 조절하는 값
    
    bcrypt는 Salt round가 증가할수록 해싱에 필요한 계산량이 크게 증가하도록 설계되어 있다.
    
    계산 비용은 대략 2^cost에 비례하여 증가한다.
    
    | Salt round (Cost) | 상대적인 계산 비용 |
    | --- | --- |
    | 10 | 2¹⁰ = 1,024 |
    | 11 | 2¹¹ = 2,048 |
    | 12 | 2¹² = 4,096 |
    | 13 | 2¹³ = 8,192 |
    
    위 숫자는 실제 해싱 시간을 나타내는 것이 아니라 계산 비용의 상대적인 크기를 설명하기 위한 값이다.
    
    예를 들어 Salt round가 10에서 11로 증가하면 필요한 계산량이 대략 2배가 된다.
    
    12로 증가하면 10에 비해 대략 4배의 계산량이 필요하다.
    
    즉, Salt round가 1 증가할 때마다 해싱에 필요한 계산 비용이 약 2배로 증가한다.
    
    ### Salt round가 높을수록 무조건 좋을까?
    
    Salt round가 높으면 비밀번호를 추측하는 공격에도 더 많은 계산 시간이 필요하므로 보안에 도움이 된다.
    
    하지만 서버에서도 비밀번호를 해싱하거나 검증할 때 같은 계산 비용을 부담해야 한다.
    
    예를 들어 Salt round가 너무 높으면 회원가입이나 로그인 처리 시간이 길어질 수 있다.
    
    따라서 보안과 서버 성능을 함께 고려하여 적절한 값을 선택해야 한다.
    
    일반적으로 10~12와 같은 값을 예시로 많이 사용하지만, 실제 서비스에서는 서버 성능과 보안 요구사항에 따라 결정해야 한다.
    
    ### bcrypt로 비밀번호를 저장하는 방법
    
    이번 6주차 Spring Boot 실습에서는 `BCryptPasswordEncoder`를 사용하여 비밀번호를 해싱하였다.
    
    예를 들어 다음과 같이 사용할 수 있다.
    
    ```java
    BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();
    
    String encodedPassword =
            passwordEncoder.encode("password1234");
    ```
    
    각 코드의 의미는 다음과 같다.
    
    - `new BCryptPasswordEncoder()`: bcrypt를 이용하는 비밀번호 인코더 객체를 생성한다.
    - `encode()`: 입력한 비밀번호를 bcrypt로 해싱한다.
    - `encodedPassword`: 해싱된 비밀번호를 저장한다.
    
    `BCryptPasswordEncoder`는 별도로 설정하지 않으면 기본 strength 값인 10을 사용한다.
    
    Salt round를 직접 지정하려면 다음과 같이 작성할 수 있다.
    
    ```java
    BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder(12);
    ```
    
    여기서 `12`는 bcrypt의 계산 비용을 결정하는 값이다.
    
    이렇게 생성한 인코더로 비밀번호를 해싱하면 cost 12가 적용된다.
    
    ### bcrypt 해시값의 구조
    
    bcrypt로 해싱된 비밀번호는 다음과 같은 구조를 가진다.
    
    ```
    $2a$10$7EqJtq98hPqEX7fNZaFWoO...
    ```
    
    각 부분의 의미를 살펴보자.
    
    | 구성 요소 | 의미 |
    | --- | --- |
    | `$2a$` | bcrypt 알고리즘 버전 식별자 |
    | `10$` | 계산 비용(Cost factor) |
    | 나머지 문자열 | Salt와 해시 결과를 인코딩한 값 |
    
    즉, bcrypt 해시 문자열에는 알고리즘 버전, 계산 비용, Salt, 해시 결과가 함께 저장된다.
    
    따라서 비밀번호를 검증할 때 별도의 Salt 값을 데이터베이스 컬럼에 저장할 필요가 없다.
    
    참고로 bcrypt의 버전 식별자는 구현에 따라 `$2a$`, `$2b$` 등으로 나타날 수 있다.
    
    ### 로그인할 때 비밀번호는 어떻게 확인할까?
    
    그런데 bcrypt는 원래 비밀번호로 복호화할 수 없다고 했다.
    
    그렇다면 사용자가 로그인할 때 입력한 비밀번호가 올바른지는 어떻게 확인할까?
    
    이때 사용하는 것이 `matches()` 메서드이다.
    
    ```java
    boolean isMatched = passwordEncoder.matches(
            "password1234",
            encodedPassword
    );
    ```
    
    각 인자의 의미는 다음과 같다.
    
    - 첫 번째 인자: 사용자가 로그인할 때 입력한 평문 비밀번호
    - 두 번째 인자: 데이터베이스에 저장된 bcrypt 해시값
    
    `matches()`는 저장된 해시값에 포함된 Salt와 Cost 정보를 이용해 입력한 비밀번호를 검증한다.
    
    입력한 비밀번호가 올바르면 `true`, 다르면 `false`를 반환한다.
    
    중요한 점은 기존 해시값을 복호화해서 비교하는 것이 아니라, 입력한 비밀번호를 저장된 해시 정보로 검증한다는 것이다.
    
    로그인 과정은 다음과 같다.
    
    1. 사용자가 이메일과 비밀번호를 입력한다.
    2. 서버가 이메일을 기준으로 회원 정보를 조회한다.
    3. 데이터베이스에서 해당 회원의 bcrypt 해시값을 가져온다.
    4. `matches()`를 사용하여 입력한 비밀번호와 저장된 해시값을 비교한다.
    5. 비밀번호가 일치하면 인증을 진행하고, 일치하지 않으면 로그인에 실패한다.
    
    여기서 주의할 점은 `encode()`를 다시 호출한 결과를 기존 해시값과 문자열로 직접 비교하면 안 된다는 것이다.
    
    bcrypt는 해싱할 때마다 새로운 Salt를 생성하므로 같은 비밀번호를 입력하더라도 서로 다른 해시값이 나올 수 있기 때문이다.
    
    따라서 로그인에서는 `encode()`로 새 해시를 만든 뒤 비교하는 것이 아니라 `matches()`를 사용해야 한다.
    
    ### 이번 6주차 실습과의 연결
    
    이번 실습에서는 회원가입 API를 구현하면서 `BCryptPasswordEncoder`를 이용해 비밀번호를 해싱한 뒤 데이터베이스에 저장하도록 하였다.
    
    회원가입 요청에서 사용자가 입력한 비밀번호는 평문이지만, 데이터베이스에는 bcrypt 해시값이 저장된다.
    
    또한 회원가입 응답 DTO에는 비밀번호를 포함하지 않아 클라이언트에 비밀번호가 노출되지 않도록 구현하였다.
    
    실제로 MySQL에서 회원 정보를 조회했을 때 비밀번호가 `$2a$10$...` 형태로 저장된 것도 확인하였다.
    
    정리하면, **bcrypt는 비밀번호를 안전하게 저장하기 위한 해싱 알고리즘이고, Salt는 동일한 비밀번호에서도 서로 다른 해시값을 만들기 위한 무작위 데이터이며, Salt round는 해싱에 필요한 계산 비용을 결정하는 값**이다.
    
- HTTP 201 Created / 204 No Content / 409 Conflict
    
    ### HTTP 상태 코드란?
    
    HTTP 상태 코드(HTTP Status Code)는 클라이언트가 서버에 요청을 보냈을 때, 서버가 해당 요청을 어떻게 처리했는지 알려주는 숫자이다.
    
    쉽게 말하면, 클라이언트의 요청이 성공했는지, 실패했다면 어떤 문제가 있었는지 알려주는 응답 코드이다.
    
    예를 들어 영화 평점 서비스에서 사용자가 평점 등록 요청을 보냈다고 가정해 보자.
    
    ```
    POST /members/1/ratings
    ```
    
    서버는 요청을 처리한 뒤 결과에 따라 서로 다른 상태 코드를 반환할 수 있다.
    
    - 평점이 정상적으로 등록되었다면 `201 Created`
    - 이미 같은 영화에 평점을 등록했다면 `409 Conflict`
    - 별점을 8점으로 입력했다면 `400 Bad Request`
    
    이처럼 HTTP 상태 코드를 사용하면 클라이언트는 서버가 요청을 어떻게 처리했는지 구분할 수 있다.
    
    ### HTTP 상태 코드의 종류
    
    HTTP 상태 코드는 첫 번째 숫자를 기준으로 크게 다섯 가지로 구분된다.
    
    | 상태 코드 | 의미 | 설명 |
    | --- | --- | --- |
    | 1xx | Informational | 요청 처리 중 정보를 전달 |
    | 2xx | Success | 요청을 성공적으로 처리 |
    | 3xx | Redirection | 다른 위치로 이동하거나 추가 동작 필요 |
    | 4xx | Client Error | 클라이언트 요청에 문제가 있음 |
    | 5xx | Server Error | 서버에서 요청을 처리하는 중 문제가 발생 |
    
    예를 들어 `200 OK`와 `201 Created`는 모두 2xx에 해당하므로 성공 응답이다.
    
    반면 `400 Bad Request`와 `409 Conflict`는 4xx에 해당하므로 클라이언트 요청을 처리할 수 없는 상황을 나타낸다.
    
    이번 6주차 실습에서는 특히 `201`, `204`, `409`를 사용하였다.
    
    ### 201 Created란?
    
    201 Created는 클라이언트의 요청이 성공적으로 처리되었으며, 새로운 리소스가 생성되었음을 나타내는 상태 코드이다.
    
    쉽게 말하면, 서버에 새로운 데이터가 정상적으로 만들어졌다는 의미이다.
    
    주로 `POST` 요청으로 새로운 데이터를 생성했을 때 사용한다.
    
    예를 들어 사용자가 영화에 새로운 평점을 등록한다고 가정해 보자.
    
    ```
    POST /members/1/ratings
    Content-Type: application/json
    ```
    
    ```json
    {
      "movieId": 100,
      "score": 5,
      "comment": "정말 재미있는 영화였습니다."
    }
    ```
    
    서버가 이 요청을 정상적으로 처리하여 새로운 평점을 생성했다면 다음과 같이 응답할 수 있다.
    
    ```
    HTTP/1.1 201 Created
    Content-Type: application/json
    ```
    
    ```json
    {
      "isSuccess": true,
      "code": "COMMON201",
      "message": "평점 등록에 성공했습니다.",
      "result": 4
    }
    ```
    
    여기서 `result`의 4는 새롭게 생성된 평점의 ID를 의미한다.
    
    즉, 서버가 평점 등록 요청을 정상적으로 처리했고, 새로운 평점 데이터가 생성되었다는 뜻이다.
    
    ### 200 OK와 201 Created의 차이
    
    그런데 `200 OK`도 성공을 의미하는데, 굳이 `201 Created`를 사용하는 이유는 무엇일까?
    
    두 상태 코드는 모두 성공을 나타내지만 의미에 차이가 있다.
    
    | 상태 코드 | 의미 | 사용 예시 |
    | --- | --- | --- |
    | `200 OK` | 요청을 성공적으로 처리함 | 평점 조회, 평점 수정 |
    | `201 Created` | 요청을 처리하여 새로운 리소스를 생성함 | 회원가입, 평점 등록 |
    
    예를 들어 기존 평점을 수정하는 요청은 새로운 평점을 만드는 것이 아니므로 `200 OK`를 사용할 수 있다.
    
    반면 새로운 평점을 등록하는 요청은 새로운 리소스를 생성하므로 `201 Created`가 더 적절하다.
    
    다만 `POST` 요청이라고 해서 반드시 `201 Created`를 반환해야 하는 것은 아니다.
    
    HTTP 메서드만으로 상태 코드가 결정되는 것이 아니라, 실제 요청 처리 결과에 따라 적절한 상태 코드를 선택한다.
    
    ### 204 No Content란?
    
    204 No Content는 클라이언트의 요청을 성공적으로 처리했지만, 응답 본문에 전달할 데이터가 없다는 의미이다.
    
    쉽게 말하면, 요청은 성공했지만 추가로 반환할 내용은 없다는 뜻이다.
    
    주로 데이터 삭제 요청에서 사용한다.
    
    예를 들어 사용자가 자신이 작성한 평점을 삭제한다고 가정해 보자.
    
    ```
    DELETE /members/1/ratings/4
    ```
    
    서버가 평점 ID 4번을 정상적으로 삭제했다면 다음과 같이 응답할 수 있다.
    
    ```
    HTTP/1.1 204 No Content
    ```
    
    이때는 JSON 데이터와 같은 응답 본문을 반환하지 않는다.
    
    삭제가 정상적으로 처리되었다는 사실을 `204`라는 상태 코드만으로 전달할 수 있기 때문이다.
    
    ### 204 No Content는 반드시 삭제할 때만 사용할까?
    
    그렇지는 않다.
    
    `204 No Content`는 삭제 요청뿐 아니라, 요청이 성공했지만 응답 본문이 필요하지 않은 상황에서도 사용할 수 있다.
    
    예를 들어 기존 데이터의 수정이 성공했지만 별도의 결과를 반환할 필요가 없다면 `204 No Content`를 사용할 수도 있다.
    
    즉, 204는 삭제를 의미하는 코드가 아니라, 성공했지만 응답 본문이 없다는 의미이다.
    
    이번 실습에서는 평점 삭제 API에서 사용하였다.
    
    ```java
    @DeleteMapping("/{memberId}/ratings/{ratingId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long memberId,
            @PathVariable Long ratingId
    ) {
        ratingService.delete(ratingId, memberId);
        return ResponseEntity.noContent().build();
    }
    ```
    
    여기서 중요한 부분은 다음 코드이다.
    
    ```java
    return ResponseEntity.noContent().build();
    ```
    
    - `ResponseEntity`: HTTP 응답의 상태 코드, 헤더, 본문 등을 설정할 수 있는 객체이다.
    - `noContent()`: HTTP 상태 코드를 204로 설정한다.
    - `build()`: 응답 본문 없이 응답 객체를 생성한다.
    
    따라서 평점 삭제에 성공하면 `204 No Content`가 반환된다.
    
    ### 204 No Content와 200 OK의 차이
    
    두 상태 코드 모두 요청이 성공했다는 의미이다.
    
    하지만 응답 본문을 전달하는 방식에 차이가 있다.
    
    | 상태 코드 | 의미 | 응답 본문 |
    | --- | --- | --- |
    | `200 OK` | 요청을 성공적으로 처리 | 있을 수도 있고 없을 수도 있음 |
    | `204 No Content` | 요청을 성공적으로 처리했지만 반환할 본문이 없음 | 없음 |
    
    예를 들어 평점 수정 후 수정된 데이터를 반환하려면 `200 OK`를 사용할 수 있다.
    
    반면 평점 삭제 후 별도의 데이터를 반환하지 않는다면 `204 No Content`가 적절하다.
    
    주의할 점은 `204 No Content` 응답에는 JSON 본문을 포함하면 안 된다는 것이다.
    
    따라서 이번 실습에서 사용한 `ApiResponse` 객체도 삭제 성공 응답에는 포함하지 않았다.
    
    ### 409 Conflict란?
    
    409 Conflict는 클라이언트의 요청이 서버에 저장된 리소스의 현재 상태와 충돌하여 정상적으로 처리할 수 없다는 의미이다.
    
    쉽게 말하면, 요청 자체를 이해할 수는 있지만 현재 데이터 상태와 충돌해서 처리할 수 없다는 뜻이다.
    
    예를 들어 영화 평점 서비스에서 한 회원은 같은 영화에 평점을 하나만 등록할 수 있다고 가정해 보자.
    
    회원 ID가 1인 사용자가 영화 ID 100에 이미 평점을 등록한 상태이다.
    
    | 평점 ID | 회원 ID | 영화 ID | 별점 |
    | --- | --- | --- | --- |
    | 4 | 1 | 100 | 5 |
    
    그런데 같은 사용자가 다시 다음과 같은 요청을 보냈다.
    
    ```
    POST /members/1/ratings
    Content-Type: application/json
    ```
    
    ```json
    {
      "movieId": 100,
      "score": 3,
      "comment": "다시 보니 아쉬웠습니다."
    }
    ```
    
    이 요청의 JSON 형식이나 별점 범위에는 문제가 없다.
    
    하지만 이미 동일한 회원이 해당 영화에 평점을 등록했으므로 중복 등록이 발생할 수 있다.
    
    따라서 서버는 요청을 거부하고 `409 Conflict`를 반환할 수 있다.
    
    ```
    HTTP/1.1 409 Conflict
    Content-Type: application/json
    ```
    
    ```json
    {
      "isSuccess": false,
      "code": "COMMON409",
      "message": "이미 이 영화에 평점을 남기셨습니다.",
      "result": null
    }
    ```
    
    위 응답은 공통 응답 형식을 사용한 예시이며, 실제 오류 코드는 구현에 따라 달라질 수 있다.
    
    ### 409 Conflict는 어떻게 구현할까?
    
    이번 실습에서는 `RatingRepository`를 이용하여 이미 평점이 존재하는지 확인하였다.
    
    ```java
    if (ratingRepository.existsByMember_MemberIdAndMovieId(
            memberId, request.movieId())) {
        throw new IllegalArgumentException(
                "이미 이 영화에 평점을 남기셨습니다.");
    }
    ```
    
    여기서 `existsByMember_MemberIdAndMovieId()`는 해당 회원과 영화의 조합에 해당하는 평점이 이미 존재하는지 확인하는 메서드이다.
    
    - 기존 평점이 존재하면 `true`를 반환한다.
    - 기존 평점이 존재하지 않으면 `false`를 반환한다.
    
    기존 평점이 존재하면 예외를 발생시키고, `GlobalExceptionHandler`에서 이를 `409 Conflict` 응답으로 처리하도록 구현하였다.
    
    따라서 같은 영화에 평점을 중복 등록하려는 요청을 방지할 수 있다.
    
    참고로 `IllegalArgumentException`이 자동으로 409가 되는 것은 아니다. 이번 실습에서 예외 처리 로직을 통해 409로 변환하도록 구현한 것이다.
    
    ### 400 Bad Request와 409 Conflict의 차이
    
    두 상태 코드 모두 4xx에 해당하지만 발생하는 상황이 다르다.
    
    400 Bad Request는 요청 데이터 자체가 올바르지 않은 경우에 사용한다.
    
    예를 들어 다음과 같이 별점에 8을 입력했다면 문제가 발생한다.
    
    ```json
    {
      "movieId": 100,
      "score": 8
    }
    ```
    
    별점은 1~5점이어야 하므로 요청 데이터가 검증 조건을 만족하지 못한다.
    
    반면 409 Conflict는 요청 데이터의 형식이나 값은 올바르지만, 현재 서버의 데이터 상태와 충돌하는 경우에 사용한다.
    
    예를 들어 다음 요청은 별점 범위에는 문제가 없다.
    
    ```json
    {
      "movieId": 100,
      "score": 5
    }
    ```
    
    하지만 해당 회원이 영화 ID 100에 이미 평점을 등록했다면 중복 등록 문제가 발생한다.
    
    이 경우에는 `409 Conflict`가 적절하다.
    
    | 구분 | 400 Bad Request | 409 Conflict |
    | --- | --- | --- |
    | 의미 | 잘못된 요청 | 현재 리소스 상태와 충돌 |
    | 문제 원인 | 입력값, 요청 형식 등 | 이미 존재하는 데이터 등 |
    | 평점 서비스 예시 | 별점 8점 입력 | 동일한 영화에 평점 중복 등록 |
    | 해결 방법 | 올바른 입력값으로 수정 | 기존 데이터 확인 후 요청 변경 |
    
    ### HTTP 메서드와 상태 코드의 관계
    
    이번 실습에서 구현한 API를 기준으로 정리하면 다음과 같다.
    
    | HTTP 메서드 | API | 기능 | 성공 상태 코드 |
    | --- | --- | --- | --- |
    | `POST` | `/members` | 회원가입 | `201 Created` |
    | `GET` | `/members/{memberId}/ratings` | 평점 목록 조회 | `200 OK` |
    | `POST` | `/members/{memberId}/ratings` | 평점 등록 | `201 Created` |
    | `PATCH` | `/members/{memberId}/ratings/{ratingId}` | 평점 수정 | `200 OK` |
    | `DELETE` | `/members/{memberId}/ratings/{ratingId}` | 평점 삭제 | `204 No Content` |
    
    여기서 HTTP 메서드는 서버에 어떤 작업을 요청하는지를 나타낸다.
    
    반면 HTTP 상태 코드는 서버가 그 요청을 어떻게 처리했는지를 나타낸다.
    
    예를 들어 `POST`는 새로운 데이터를 생성할 때 자주 사용하지만, 요청이 성공하면 `201`, 중복 데이터로 인해 실패하면 `409`, 입력값이 잘못되었다면 `400`을 반환할 수 있다.
    
    즉, 하나의 HTTP 메서드에서도 처리 결과에 따라 여러 상태 코드가 반환될 수 있다.
    
    ### HTTP 상태 코드를 구분해서 사용하는 이유
    
    모든 요청에 `200 OK`만 반환한다면 클라이언트는 요청이 실제로 성공했는지, 새로운 데이터가 생성되었는지, 중복 요청이 발생했는지 구분하기 어려워진다.
    
    반면 상황에 맞는 상태 코드를 사용하면 클라이언트가 서버의 처리 결과를 명확하게 이해할 수 있다.
    
    정리하면, **201 Created는 새로운 리소스 생성 성공, 204 No Content는 응답 본문이 없는 요청 처리 성공, 409 Conflict는 현재 리소스 상태와 충돌하여 요청을 처리할 수 없다는 의미**이다.
    
- UNIQUE 제약 조건과 동시성
    
    ### UNIQUE 제약 조건이란?
    
    UNIQUE 제약 조건은 데이터베이스에서 특정 컬럼의 값이 중복 저장되지 않도록 제한하는 규칙이다.
    
    쉽게 말하면, 같은 데이터가 중복으로 저장되는 것을 방지하는 기능이다.
    
    예를 들어 회원가입할 때 동일한 이메일로 여러 계정을 생성하지 못하도록 하거나, 영화 평점 서비스에서 같은 회원이 동일한 영화에 평점을 여러 번 등록하지 못하도록 할 때 사용한다.
    
    이번 실습에서는 회원 ID와 영화 ID의 조합에 UNIQUE 제약을 설정하였다.
    
    | 평점 ID | 회원 ID | 영화 ID | 저장 가능 여부 |
    | --- | --- | --- | --- |
    | 1 | 1 | 100 | O |
    | 2 | 1 | 101 | O |
    | 3 | 2 | 100 | O |
    | 4 | 1 | 100 | X (중복) |
    
    여기서 중요한 점은 회원 ID나 영화 ID가 각각 중복되면 안 된다는 뜻이 아니라, 두 값의 조합이 중복되면 안 된다는 것이다.
    
    따라서 서로 다른 회원은 같은 영화에 평점을 등록할 수 있지만, 동일한 회원은 같은 영화에 평점을 두 번 등록할 수 없다.
    
    ### 동시성이란?
    
    동시성(Concurrency)은 여러 작업이 같은 시간대에 진행되는 것을 의미한다.
    
    예를 들어 사용자가 평점 등록 버튼을 빠르게 두 번 누르거나, 여러 요청이 거의 동시에 서버에 도착하는 상황을 생각해 보자.
    
    이번 실습에서는 평점 등록 전에 다음 메서드로 중복 여부를 확인하였다.
    
    ```java
    ratingRepository.existsByMember_MemberIdAndMovieId(memberId, movieId);
    ```
    
    하지만 중복 여부를 미리 검사하는 것만으로는 모든 상황에서 중복 등록을 막을 수 없다.
    
    두 요청이 거의 동시에 들어오면 다음과 같은 상황이 발생할 수 있기 때문이다.
    
    1. 요청 A가 기존 평점이 없는 것을 확인한다.
    2. 요청 B도 기존 평점이 없는 것을 확인한다.
    3. 요청 A가 평점을 저장한다.
    4. 요청 B도 평점 저장을 시도한다.
    
    이처럼 여러 요청이 같은 데이터를 동시에 확인하고 변경하면서 예상하지 못한 결과가 발생하는 문제를 **경쟁 상태(Race Condition)**라고 한다.
    
    ### UNIQUE 제약 조건이 필요한 이유
    
    이러한 문제를 방지하려면 Service에서 중복 여부를 검사하는 것뿐 아니라, 데이터베이스에도 UNIQUE 제약을 설정해야 한다.
    
    두 방식의 역할은 다음과 같다.
    
    | 구분 | 역할 |
    | --- | --- |
    | Service 중복 검사 | 저장 전에 중복 여부를 확인하고 적절한 오류 메시지를 반환 |
    | DB UNIQUE 제약 | 동시에 요청이 들어오더라도 중복 데이터가 저장되지 않도록 보장 |
    
    UNIQUE 제약이 설정되어 있다면 두 요청이 동시에 저장을 시도하더라도 동일한 회원 ID와 영화 ID 조합이 중복 저장되는 것을 막을 수 있다. 중복 저장을 시도한 요청은 데이터베이스 제약 위반 오류가 발생할 수 있다.
    
    이번 실습처럼 Service에서 중복 여부를 확인하고, 데이터베이스에서도 UNIQUE 제약을 설정하는 방식을 함께 사용하는 것이 좋다.
    
    정리하면, **UNIQUE 제약 조건은 데이터 중복을 방지하는 데이터베이스 규칙이고, 동시성은 여러 요청이 같은 시간대에 처리되는 상황을 의미한다.** Service의 중복 검사만으로는 동시 요청을 완전히 처리할 수 없으므로, 데이터베이스의 UNIQUE 제약 조건을 함께 사용하는 것이 중요하다.
    
- @RestControllerAdvice / Exception Filter
    
    ### 예외 처리란?
    
    예외 처리(Exception Handling)는 서버에서 오류가 발생했을 때 이를 적절하게 처리하고, 클라이언트에 오류 정보를 전달하는 기능이다.
    
    예를 들어 영화 평점 서비스에서 다음과 같은 상황이 발생할 수 있다.
    
    - 별점에 8점을 입력한 경우
    - 이미 등록한 영화에 평점을 다시 등록한 경우
    - 존재하지 않는 평점을 수정하려는 경우
    - 다른 회원이 작성한 평점을 삭제하려는 경우
    
    이러한 상황에서 서버가 오류를 제대로 처리하지 않으면 클라이언트는 어떤 문제가 발생했는지 알기 어렵다.
    
    따라서 오류의 종류에 맞는 HTTP 상태 코드와 메시지를 반환하도록 예외 처리를 구현해야 한다.
    
    ### @RestControllerAdvice란?
    
    `@RestControllerAdvice`는 Spring Boot에서 여러 Controller에서 발생하는 예외를 한곳에서 처리할 수 있도록 하는 어노테이션이다.
    
    쉽게 말하면, 각 Controller마다 오류 처리 코드를 작성하지 않고 공통으로 관리할 수 있도록 하는 기능이다.
    
    예를 들어 회원가입 Controller와 평점 Controller에서 각각 오류가 발생할 수 있다.
    
    이때 Controller마다 예외 처리 코드를 작성하면 중복 코드가 많아진다.
    
    `@RestControllerAdvice`를 사용하면 이러한 예외를 공통으로 처리할 수 있다.
    
    이번 실습에서는 `GlobalExceptionHandler`를 구현하여 예외를 처리하였다.
    
    ```java
    @RestControllerAdvice
    public class GlobalExceptionHandler {
    
        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ApiResponse<Void>> handleConflict(
                IllegalArgumentException e
        ) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.failure(
                            "COMMON409", e.getMessage()));
        }
    }
    ```
    
    여기서 각 어노테이션의 역할은 다음과 같다.
    
    - `@RestControllerAdvice`: 여러 Controller에서 발생하는 예외를 공통으로 처리한다.
    - `@ExceptionHandler`: 어떤 종류의 예외를 처리할지 지정한다.
    - `ResponseEntity`: HTTP 상태 코드와 응답 본문을 설정한다.
    
    예를 들어 중복 평점 등록으로 `IllegalArgumentException`이 발생하면 `@ExceptionHandler`가 해당 예외를 처리하여 `409 Conflict`를 반환한다.
    
    참고로 위 코드는 이번 실습의 예외 처리 방식을 간단하게 나타낸 예시이다. `IllegalArgumentException`이 항상 409를 의미하는 것은 아니므로 실제 서비스에서는 중복 등록 전용 예외를 만들어 구분할 수도 있다.
    
    ### Exception Filter란?
    
    Exception Filter는 NestJS에서 애플리케이션 실행 중 발생한 예외를 처리하는 기능이다.
    
    Spring Boot의 `@RestControllerAdvice`와 비슷한 역할을 한다.
    
    쉽게 말하면, NestJS에서 발생한 오류를 가로채 적절한 HTTP 응답으로 변환하는 기능이다.
    
    예를 들어 NestJS에서 이미 존재하는 회원의 이메일로 회원가입을 시도했다고 가정해 보자.
    
    ```tsx
    throw new ConflictException("이미 가입된 이메일입니다.");
    ```
    
    여기서 `ConflictException`은 HTTP 상태 코드 `409 Conflict`에 해당하는 예외이다.
    
    NestJS에는 이러한 HTTP 예외를 처리하는 기본 Exception Filter가 존재하므로, 별도의 필터를 만들지 않아도 적절한 오류 응답을 반환할 수 있다.
    
    필요하다면 개발자가 직접 Exception Filter를 구현하여 오류 응답 형식을 통일할 수도 있다.
    
    ### @RestControllerAdvice와 Exception Filter 비교
    
    | 구분 | Spring Boot | NestJS |
    | --- | --- | --- |
    | 예외 처리 기능 | `@RestControllerAdvice` | Exception Filter |
    | 특정 예외 처리 | `@ExceptionHandler` | `@Catch()` |
    | 주요 역할 | Controller 예외 공통 처리 | 발생한 예외를 HTTP 응답으로 변환 |
    | 사용 목적 | 상태 코드와 오류 응답 통일 | 상태 코드와 오류 응답 통일 |
    
    두 기능은 사용하는 프레임워크와 문법은 다르지만, 여러 곳에서 발생하는 예외를 일관된 방식으로 처리한다는 점에서 비슷하다.
    
    ### 공통 예외 처리가 필요한 이유
    
    공통 예외 처리를 사용하지 않으면 Controller마다 서로 다른 형식으로 오류를 반환할 수 있다.
    
    예를 들어 어떤 API는 오류 메시지만 반환하고, 다른 API는 상태 코드와 메시지를 함께 반환할 수 있다.
    
    이렇게 되면 프론트엔드에서 오류 응답을 처리하기 어려워진다.
    
    반면 공통 예외 처리를 적용하면 다음과 같이 일관된 형식으로 응답할 수 있다.
    
    ```json
    {
      "isSuccess": false,
      "code": "COMMON409",
      "message": "이미 이 영화에 평점을 남기셨습니다.",
      "result": null
    }
    ```
    
    이번 실습에서는 `GlobalExceptionHandler`를 통해 다음과 같은 오류를 공통으로 처리하였다.
    
    | HTTP 상태 코드 | 발생 상황 |
    | --- | --- |
    | `400 Bad Request` | 잘못된 이메일 형식, 허용 범위를 벗어난 별점 |
    | `403 Forbidden` | 다른 회원의 평점 수정 또는 삭제 |
    | `404 Not Found` | 존재하지 않는 회원 또는 평점 |
    | `409 Conflict` | 중복 회원가입 또는 중복 평점 등록 |
    
    이를 통해 Controller마다 예외 처리 코드를 반복해서 작성하지 않고, 클라이언트에도 일관된 오류 응답을 전달할 수 있다.
    
    정리하면, **`@RestControllerAdvice`는 Spring Boot에서 여러 Controller의 예외를 공통으로 처리하는 기능이고, Exception Filter는 NestJS에서 발생한 예외를 처리하는 기능**이다. 두 기능 모두 오류의 종류에 맞는 HTTP 상태 코드와 메시지를 반환하고, 예외 처리 로직을 한곳에서 관리하기 위해 사용한다.
