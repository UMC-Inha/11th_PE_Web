- Bean Validation과 @Valid

  ## Bean Validation이란?

  자바에서 객체에 들어온 데이터가 정해진 조건을 만족하는지 검사하는 표준 규칙

  - 사용자가 입력한 데이터가 올바른지 검증하기 위해 사용
  - DTO의 필드에 어노테이션을 붙여 검증 조건을 설정할 수 있음
  - Spring Boot에서는 주로 @Valid, @Validated를 통해 검증을 실행
  - Bean Validation은 표준 규칙이고, 실제 검증은 같은 구현체가 수행

  #### 주요 검증 어노테이션

  - @NotNull: null 허용하지 않음
  - @NotBlank: null, 빈 문자열, 공백만 있는 문자열 허용하지 않음
  - @NotEmpty: null이나 빈 문자열·컬렉션 허용하지 않음
  - @Size: 문자열 길이 또는 컬렉션 크기 제한
  - @Min, @Max: 숫자의 최솟값, 최댓값 제한
  - @Email: 이메일 형식 검사
  - @Pattern: 정규표현식으로 형식 검사

    ```java
    public class UserDto {
    
        @NotBlank
        private String username;
    
        @Email
        private String email;
    
        @Size(min = 8, max = 20)
        private String password;
    }
    ```

  **DTO에 검증 조건을 지정할 수 있지만, 어노테이션만 붙인다고 자동으로 검증되는 것은 아님**

  ## @Valid

  자바 표준인 Jakarta Bean Validation에서 제공하는 유효성 검증을 실행하도록 지정하는 어노테이션

  - 특징: 자바 표준이므로 Spring에 종속되지 않음
  - 사용 위치: 주로 Controller에서 요청받은 DTO를 검증할 때 사용
  - 동작 방식: Spring MVC가 컨트롤러 메서드의 매개변수를 준비하는 과정에서 검증을 수행
  - 예외 발생: 일반적인 @Valid 검증 실패 시 `MethodArgumentNotValidException` 발생
  - 중첩 검증: DTO 안에 다른 DTO가 있다면 해당 필드에도 `@Valid`를 붙여 내부 객체까지 검증할 수 있음

  ### 사용 예시

    ```java
    @PostMapping("/users")
    public ResponseEntity<Void> createUser(
            @Valid @RequestBody UserDto userDto) {
    
        return ResponseEntity.ok().build();
    }
    ```

  동작 과정

  1. 클라이언트가 회원가입 요청을 보냄
  2. Spring이 요청 JSON을 UserDto 객체로 변환
  3. @Valid를 확인하고 DTO에 선언된 검증 조건을 검사
  4. 검증에 성공하면 Controller 메서드를 실행
  5. 검증에 실패하면 예외가 발생하고, 기본적으로 HTTP 400 Bad Request 응답을 반환

  ## @Validated

  Spring Framework에서 제공하는 유효성 검증 어노테이션으로, 검증 그룹을 지정하거나 메서드의 매개변수와 반환값을 검증할 때 사용

  - 특징: @Valid와 달리 검증 그룹을 지정할 수 있음
  - 사용 위치: Controller, Service 등 Spring이 관리하는 객체에서 사용
  - AOP 기능: Service 클래스에 @Validated를 선언하면 프록시를 통해 메서드 호출 시 검증 가능
  - 예외 발생: 일반적인 AOP 기반 메서드 검증 실패 시 `ConstraintViolationException` 발생
  - 주의: 클래스 내부에서 자기 자신의 메서드를 직접 호출하면 프록시를 거치지 않아 검증이 적용되지 않을 수 있음

  ### 사용 예시

    ```java
    @Service
    @Validated
    public class UserService {
    
        public void signUp(@NotBlank String email) {
            // email이 비어 있으면 검증 실패
        }
    }
    ```

- class-validator와 ValidationPipe

  ## class-validator란?

  NestJS에서 DTO에 들어온 데이터가 정해진 조건을 만족하는지 검사하기 위해 사용하는 라이브러리

  - DTO의 필드에 데코레이터를 붙여 검증 조건을 설정할 수 있음
  - 이메일 형식, 문자열 길이, 숫자 범위 등을 검사할 수 있음
  - Spring Boot의 Bean Validation과 비슷한 역할
  - NestJS에서는 주로 `ValidationPipe`와 함께 사용

  #### 주요 검증 데코레이터

  - @IsNotEmpty(): 빈 문자열, null, undefined 허용하지 않음
  - @IsString(): 문자열인지 검사
  - @IsInt(): 정수인지 검사
  - @IsEmail(): 이메일 형식 검사
  - @Min(), @Max(): 숫자의 최솟값, 최댓값 제한
  - @MinLength(), @MaxLength(): 문자열 길이 제한
  - @IsOptional(): null 또는 undefined이면 다른 검증을 건너뜀
  - @Matches(): 정규표현식으로 형식 검사

  **단, DTO에 데코레이터를 선언하는 것만으로 HTTP 요청이 자동 검증되지는 않음**

  ## ValidationPipe란?

  NestJS에서 제공하는 요청 데이터를 검사하고, 검증에 실패하면 예외를 발생시키는 기능

  - 특징: class-validator에 선언된 조건을 이용하여 입력값을 검증
  - 동작 위치: Controller 메서드가 실행되기 전에 요청 데이터 검증
  - 검증 대상: @Body(), @Query(), @Param() 등으로 전달받는 데이터
  - 예외 발생: 기본적으로 BadRequestException이 발생하여 HTTP 400 응답 반환
  - 추가 기능: 불필요한 필드 제거, 허용되지 않은 필드 차단, 데이터 타입 변환

  ### 동작 과정

  1. 클라이언트가 HTTP 요청을 보냄
  2. NestJS가 요청 데이터를 Controller에 전달하기 전에 `ValidationPipe`를 실행
  3. `ValidationPipe`가 DTO에 선언된 `class-validator` 검증 조건을 확인
  4. 검증에 성공하면 Controller 메서드를 실행
  5. 검증에 실패하면 HTTP 400 Bad Request 응답 반환
- bcrypt와 salt round

  ## bcrypt

  사용자의 비밀번호를 안전하게 저장하기 위해 비밀번호와 무작위 값(salt)을 이용한 해시 알고리즘

  - 비밀번호를 원래 값으로 되돌릴 수 없는 해시값으로 변환
  - 비밀번호마다 무작위 값인 Salt를 추가하여 서로 다른 해시값 생성
  - 해시 계산 속도를 의도적으로 느리게 만들어 비밀번호 추측 공격을 어렵게 함

  ## Bcrypt를 사용하는 이유

  일반적인 해시 알고리즘은 계산 속도가 매우 빠르기 때문에 비밀번호 저장에 단독으로 사용하기 적합하지 않음

  - SHA-256: 계산 속도가 빨라 공격자가 GPU 등을 이용해 수많은 비밀번호를 빠르게 대입할 수 있음
  - Bcrypt: 계산을 의도적으로 느리게 만들어 공격자가 비밀번호를 반복적으로 추측하는 데 더 많은 시간이 필요함
  - 컴퓨터 성능이 좋아지더라도 Salt Rounds를 높여 계산 비용을 증가시킬 수 있음

  ## Salt와 Salt Rounds

  ### Salt란?

  비밀번호에 추가하여 같은 비밀번호라도 서로 다른 해시값이 나오도록 만드는 무작위 값

  - Bcrypt는 기본적으로 16바이트 Salt를 사용
  - 같은 비밀번호를 가진 사용자라도 서로 다른 해시값으로 저장됨
  - 미리 계산된 해시값을 이용하는 공격을 어렵게 함

  ### Salt Rounds란?

  Bcrypt의 반복 계산 비용(횟수)를 설정하는 값

  - Salt Rounds가 높을수록 계산 횟수가 증가하여 해싱 속도가 느려짐
  - 값이 1 증가할 때마다 주요 반복 횟수가 2배 증가
  - 보안성과 서버 처리 속도를 고려하여 적절한 값을 설정해야 함

  ## 사용 예시

    ```java
    import * as bcrypt from 'bcrypt';
    
    // 비밀번호 해싱 salt rounds 12로 설정
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // 비밀번호 검증 입력한 비밀번호와 일치하는지 비교
    const isMatch = await bcrypt.compare('password123', hashedPassword);
    ```

- HTTP 201 Created / 204 No Content / 409 Conflict

  HTTP 상태 코드는 **클라이언트가 보낸 요청을 서버가 어떻게 처리했는지 알려주는 숫자 코드**

  ## 201 Created

  서버가 요청을 정상적으로 처리하여 새로운 리소스를 생성했을 때 반환하는 상태 코드

  - 주로 POST 요청에서 사용
  - 회원가입, 게시글 작성 등 **새로운 데이터를 생성**했을 때 사용
  - 생성된 데이터나 해당 리소스의 위치를 응답에 포함할 수 있음

  ## 204 No Content

  서버가 요청을 정상적으로 처리했지만 응답 본문에 전달할 데이터가 없을 때 반환하는 상태 코드

  - 주로 DELETE, PUT, PATCH 요청에서 사용
  - 데이터 삭제나 수정이 **성공했지만 별도의 응답 데이터가 필요하지 않을 때** 사용
  - 응답 본문을 포함하지 않음
  - ex) 게시글 삭제 성공

  ## 409 Conflict

  클라이언트의 요청이 현재 서버에 저장된 리소스의 상태와 충돌하여 처리할 수 없을 때 반환하는 상태 코드

  - 4xx 계열의 클라이언트 오류
  - 이미 존재하는 아이디로 회원가입을 요청하는 경우
  - 중복 신청 등 **현재 데이터와 충돌하는 작업**을 요청하는 경우
  - 충돌 원인을 해결한 뒤 다시 요청할 수 있음

  → 2xx는 성공 4xx는 클라이언트 쪽에 책임이 있는 실패 5xx는 서버 쪽에 책임이 있는 실패

- UNIQUE 제약 조건과 동시성

  ## UNIQUE 제약 조건이란?

  데이터베이스에서 특정 컬럼에 중복된 값이 저장되지 않도록 제한하는 제약 조건

  - 데이터의 중복을 방지하고 무결성을 유지하기 위해 사용
  - UNIQUE가 설정된 컬럼에는 중복된 값을 저장할 수 없음
  - 여러 컬럼을 조합하여 중복을 방지하는 복합 UNIQUE 제약도 가능
  - 애플리케이션이 아닌 데이터베이스 자체에서 중복을 검사함

  ex) 동일한 이메일로 회원가입하는 것을 방지

    ```sql
    CREATE TABLE users (
        id BIGINT PRIMARY KEY,
        **email VARCHAR(255) NOT NULL UNIQUE**
    );
    ```

  ## 동시성이란?

  여러 요청이나 작업이 같은 시간에 겹쳐서 실행되는 상황

  예를 들어 두 사용자가 동시에 test@gmail.com이라는 이메일로 회원가입을 시도한다고 가정

  - 회원 가입 처리 순서
    - 해당 이메일이 이미 존재하는지 확인
    - 존재하지 않으면 회원가입 진행
    - 데이터베이스에 사용자 정보 저장

  → a 사용자 이메일 중복 확인 → b 사용자 이메일 중복 확인 → a 사용자 저장 → b 사용자 저장

  이렇게 두 요청 모두 저장을 시도하게 되는 문제 발생

  ## UNIQUE 제약 조건으로 동시성 문제 해결

  UNIQUE 제약 조건을 설정하면 여러 요청이 동시에 같은 값을 저장하려고 하더라도 DB에서 중복을 방지함.

  - 두 요청이 모두 중복 검사를 통과할 수 있음
  - 하지만 DB의 UNIQUE 제약으로 중복된 데이터가 저장되지 않음
  - 애플리케이션의 중복 검사만 믿지 않고 DB에도 UNIQUE 제약을 설정해야 함

  ### Spring Boot에서 처리 방법

  JPA에서는 @Column(unique = true)로 UNIQUE 제약을 선언할 수 있음.

    ```java
    @Entity
    public class User {
    
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
    
        **@Column(nullable = false, unique = true)**
        private String email;
    }
    ```

  이 예외를 처리해 클라이언트에 HTTP 409 Conflict를 반환할 수 있음

- @RestControllerAdvice / Exception Filter

  # @RestControllerAdvice / Exception Filter

  서버에서 예외(Exception)가 발생했을 때 에러를 한곳에서 처리하고, 클라이언트에 적절한 HTTP 응답을 반환하기 위한 기능

  - Spring Boot에서는 @RestControllerAdvice
  - NestJS에서는 Exception Filter
  - 여러 Controller에서 발생하는 예외를 공통으로 처리할 수 있음

  ## @RestControllerAdvice (Spring Boot)

  Spring Boot에서 Controller에서 발생한 예외를 공통으로 처리하기 위해 사용하는 어노테이션

  - 특징: 여러 Controller의 예외를 하나의 클래스에서 처리 가능
  - 동작 방식: 예외가 발생하면 해당 예외를 처리할 @ExceptionHandler 메서드를 찾아 실행
  - 응답 처리: HTTP 상태 코드와 에러 메시지를 JSON 등으로 반환 가능
  - 사용 목적: 중복된 예외 처리 코드를 줄이고 에러 응답 형식을 통일

  ### 사용 예시

  이미 존재하는 이메일로 회원가입을 시도하면 예외를 발생시킨다고 가정함.

  1. Service에서 예외 발생

    ```
    if (userRepository.existsByEmail(email)) {
        throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
    }
    ```

  2. @RestControllerAdvice에서 예외 처리

    ```
    @RestControllerAdvice
    public class GlobalExceptionHandler {
    
        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<String> handleException(
                IllegalArgumentException e) {
    
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(e.getMessage());
        }
    }
    ```

  - `@RestControllerAdvice`: Controller의 예외를 공통으로 처리
  - `@ExceptionHandler`: 처리할 예외 종류 지정
  - `HttpStatus.CONFLICT`: HTTP 409 상태 코드 반환
  - `e.getMessage()`: 예외가 발생할 때 전달한 메시지 반환

  응답 예시

    ```
    HTTP/1.1 409 Conflict
    Content-Type: text/plain
    
    이미 존재하는 이메일입니다.
    ```

  실제 프로젝트에서는 `IllegalArgumentException` 전체를 409로 처리하기보다, 이메일 중복을 나타내는 별도의 예외 클래스를 만드는 것이 좋음