- Bean Validation과 @Valid

  #### **1. Bean Validation이란**

    - 입력값 규칙을 DTO 필드 위에 애노테이션으로 적어 두고, 자동으로 검사하게 하는 자바 표준이다.
    - 스프링에서는 spring-boot-starter-validation을 넣으면 쓸 수 있다. 실제 검사는 Hibernate Validator가 한다.
    - 규칙만 적어 두면 동작하지 않는다. Controller 파라미터에 @Valid를 붙여야 검사가 시작된다.

  | **애노테이션** | **검사 내용** | **우리 코드** |
      | --- | --- | --- |
  | @NotBlank | null, 빈 문자열, 공백만 있는 문자열 거부 | email, password, nickname |
  | @NotNull | null만 거부 (숫자에 사용) | movieId, score |
  | @Email | 이메일 형식 | email |
  | @Size(min, max) | 문자열 길이 | nickname 2~12자, comment 500자 이하 |
  | @Min, @Max | 숫자 범위 | score 1~5 |
  | @Positive | 0보다 큰 수 | movieId |
  | @Pattern | 정규식 | password 대/소문자, 숫자, 특수문자 포함 8자 이상 |

  #### **2. 동작 흐름**

    ```java
    @PostMapping
    public ResponseEntity<ApiResponse<MemberResponse>> signUp(
            @Valid @RequestBody SignUpRequest request
    ) {
        MemberResponse response = memberService.signUp(request);
        return ResponseEntity.status(201).body(ApiResponse.created("회원가입에 성공했습니다.", response));
    }
    ```

    - 요청 JSON이 SignUpRequest로 바뀐 직후 @Valid가 규칙을 검사한다.
    - 하나라도 틀리면 Controller 메서드 안으로 들어가지 않고 MethodArgumentNotValidException이 발생한다.
    - 우리는 이 예외를 GlobalExceptionHandler에서 받아 400, COMMON4001로 응답했다. 이메일을 "abc"로 보냈을 때 "올바른 이메일 형식이 아닙니다."가 나왔다.

  #### **3. 알아둘 점**

    - DTO 검증은 형식과 범위만 본다. 이메일이 이미 있는지처럼 DB를 봐야 하는 규칙은 Service에서 확인한다.
    - JSON 문법 자체가 깨진 요청(둥근 따옴표 등)은 DTO로 바뀌기 전에 실패하므로 @Valid까지 가지 못한다. 이때는 HttpMessageNotReadableException이 난다.

- class-validator와 ValidationPipe

  #### **1. NestJS의 입력 검증**

    - NestJS에서는 class-validator 데코레이터로 DTO에 규칙을 적고, ValidationPipe가 요청이 들어올 때 검사한다.
    - 스프링의 Bean Validation + @Valid와 같은 역할이다.

  | **역할** | **Spring Boot** | **NestJS** |
      | --- | --- | --- |
  | 규칙 적기 | @NotBlank, @Email, @Size | @IsNotEmpty, @IsEmail, @MinLength |
  | 검사 시작 | 파라미터마다 @Valid | main.ts에 전역 ValidationPipe 한 번 |
  | 실패 시 | MethodArgumentNotValidException | BadRequestException (400) |

  #### **2. ValidationPipe 옵션**

    ```tsx
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    ```

  | **옵션** | **하는 일** |
      | --- | --- |
  | whitelist | DTO에 없는 필드를 지운다. |
  | forbidNonWhitelisted | DTO에 없는 필드가 오면 지우지 않고 400으로 막는다. |
  | transform | 요청 값을 DTO 클래스와 타입으로 바꿔 준다. |
    - whitelist가 있으면 화면에서 보내면 안 되는 값(예: memberId를 몰래 넣는 것)이 DB까지 가는 일을 줄일 수 있다.

- bcrypt와 salt round

  #### **1. 비밀번호를 해시로 저장하는 이유**

    - 해시는 원래 값으로 되돌릴 수 없는 한 방향 변환이다. DB가 유출돼도 원래 비밀번호를 바로 알 수 없다.
    - 로그인할 때는 입력한 비밀번호를 같은 방식으로 해시해서 저장된 값과 비교한다. 스프링에서는 passwordEncoder.matches()를 쓴다.

  #### **2. salt와 salt round**

  | **용어** | **뜻** |
      | --- | --- |
  | salt | 해시할 때 섞는 무작위 값. 같은 비밀번호라도 매번 다른 해시가 나온다. |
  | salt round (cost) | 해시를 반복하는 정도. 10이면 2의 10제곱 번 반복한다. |
    - salt 덕분에 미리 계산해 둔 해시 표(레인보우 테이블)로 비밀번호를 알아내기 어렵다.
    - round가 1 오르면 계산 시간이 2배가 된다. 너무 높으면 회원가입, 로그인이 느려진다. 스프링 BCryptPasswordEncoder 기본값은 10이다.

  #### **3. 해시 결과 읽기**

    ```sql
    SELECT email,password FROM memberWHERE email ='umc@example.com';
    -- $2a$10$N9qo8uLOickgx2ZMRZoMye...
    ```

  | **부분** | **뜻** |
      | --- | --- |
  | $2a$ | bcrypt 버전 |
  | 10$ | salt round |
  | 다음 22자 | salt |
  | 나머지 31자 | 해시 값 |
    - 전체가 항상 60자라서 member.password 컬럼을 VARCHAR(60)으로 만들었다.
    - salt가 해시 문자열 안에 들어 있어서 따로 저장할 필요가 없다.

- HTTP 201 Created / 204 No Content / 409 Conflict

  #### **1. 이번 주에 쓴 상태 코드**

  | **코드** | **뜻** | **우리 API** |
      | --- | --- | --- |
  | 201 Created | 새로 만들어졌다. | 회원가입, 평점 등록 |
  | 200 OK | 성공했고 응답 내용이 있다. | 평점 수정 |
  | 204 No Content | 성공했지만 돌려줄 내용이 없다. | 평점 삭제 |
  | 400 Bad Request | 요청 형식이 틀렸다. | 이메일 형식, 별점 7점 |
  | 403 Forbidden | 누군지는 알지만 권한이 없다. | 다른 회원의 평점 수정, 삭제 |
  | 404 Not Found | 대상이 없다. | 없는 회원, 없는 평점 |
  | 409 Conflict | 지금 서버 상태와 부딪힌다. | 이메일 중복, 같은 영화 중복 평점 |

  #### **2. 헷갈리기 쉬운 것**

    - 200과 201: 둘 다 성공이지만 201은 "새 데이터가 생겼다"는 뜻까지 담는다. 그래서 POST로 만들 때 201을 쓴다.
    - 204는 body가 없다. 삭제를 보냈을 때 Postman에 아무것도 안 뜬 것이 정상이었다.
    - 400과 409: 400은 요청 자체가 틀린 것이고, 409는 요청은 맞는데 이미 같은 데이터가 있어서 안 되는 것이다.

- UNIQUE 제약 조건과 동시성

  #### **1. 서비스 검사만으로 부족한 이유**

    - Service에서 existsByEmail로 먼저 확인해도, 두 요청이 거의 동시에 오면 둘 다 "없음"을 보고 통과할 수 있다.

  | **시점** | **요청 A** | **요청 B** |
      | --- | --- | --- |
  | 1 | existsByEmail → 없음 |  |
  | 2 |  | existsByEmail → 없음 |
  | 3 | save → 성공 |  |
  | 4 |  | save → 같은 이메일 두 개가 생긴다 |
    - 그래서 DB에 UNIQUE를 걸어 둔다. 4번에서 DB가 막고, 스프링은 DataIntegrityViolationException을 던진다.

  #### **2. 우리 코드의 두 겹 방어**

  | **단계** | **막는 곳** | **응답** |
      | --- | --- | --- |
  | 평소 | Service의 exists 확인 → IllegalArgumentException | 409, COMMON4092, "이미 사용 중인 이메일입니다." |
  | 동시 요청 | DB UNIQUE → DataIntegrityViolationException | 409, COMMON4091, "이미 존재하는 데이터입니다." |

    ```sql
    emailVARCHAR(254)NOT NULL UNIQUE,
    nicknameVARCHAR(50)NOT NULL UNIQUE,
    UNIQUE KEY uk_rating_member_movie (member_id, movie_id)
    ```

    - 대부분의 중복은 Service 검사에서 걸리고, "이미 사용 중인 이메일입니다."처럼 무엇이 문제인지 알려 준다.
    - 두 요청이 동시에 와서 Service 검사를 둘 다 통과한 드문 경우만 DB UNIQUE가 막는다. 이때는 메시지가 "이미 존재하는 데이터입니다."로 덜 구체적이지만, 중복 데이터가 저장되는 일은 없다.

- @RestControllerAdvice / Exception Filter

  #### **1. 전역 예외 처리**

    - Controller마다 try-catch를 쓰지 않고, 어디서 예외가 나든 한 곳에서 받아 같은 모양으로 응답한다.
    - 스프링은 @RestControllerAdvice 클래스 안에 @ExceptionHandler 메서드를, NestJS는 @Catch가 붙은 Exception Filter를 쓴다.

  | **구분** | **Spring Boot** | **NestJS** |
      | --- | --- | --- |
  | 만드는 것 | @RestControllerAdvice 클래스 | @Catch(HttpException) 필터 클래스 |
  | 예외 고르기 | @ExceptionHandler(예외.class) | @Catch(예외) |
  | 등록 | 클래스만 만들면 자동 적용 | main.ts에서 useGlobalFilters |

  #### **2. 우리 코드에서**

    - GlobalExceptionHandler 안에 예외마다 메서드를 하나씩 만들었다. 메서드 위의 @ExceptionHandler가 어떤 예외를 받을지 정한다.

    ```java
    @RestControllerAdvice
    public class GlobalExceptionHandler {
    
        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException exception) {
            String message = exception.getBindingResult().getFieldErrors().get(0).getDefaultMessage();
            return ResponseEntity.status(400).body(ApiResponse.failure("COMMON4001", message));
        }
    
        @ExceptionHandler(DataIntegrityViolationException.class)
        public ResponseEntity<ApiResponse<Void>> handleDuplicate(DataIntegrityViolationException exception) {
            return ResponseEntity.status(409).body(ApiResponse.failure("COMMON4091", "이미 존재하는 데이터입니다."));
        }
    
        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException exception) {
            return ResponseEntity.status(409).body(ApiResponse.failure("COMMON4092", exception.getMessage()));
        }
    
        @ExceptionHandler(ResponseStatusException.class)
        public ResponseEntity<ApiResponse<Void>> handleResponseStatus(ResponseStatusException exception) {
            int status = exception.getStatusCode().value();
            return ResponseEntity.status(status).body(ApiResponse.failure("COMMON" + status, exception.getReason()));
        }
    }
    ```

    - 위 코드의 메서드 4개를 표로 정리하면 아래와 같다. 모든 메서드가 ApiResponse.failure로 응답하기 때문에 실패해도 isSuccess, code, message, result 4칸 모양이 유지된다.

  | **잡는 예외** | **언제 나나** | **응답** |
      | --- | --- | --- |
  | MethodArgumentNotValidException | @Valid 검사 실패 (이메일 "abc", 별점 7점) | 400, COMMON4001 |
  | DataIntegrityViolationException | DB UNIQUE에 걸림 (동시 요청) | 409, COMMON4091 |
  | IllegalArgumentException | Service 중복 검사에 걸림 (이메일, 평점 중복) | 409, COMMON4092 |
  | ResponseStatusException | Service에서 404, 403을 직접 던짐 (없는 평점, 남의 평점) | 404 또는 403, COMMON404 / COMMON403 |
    - 위 4개에 없는 예외는 이 클래스가 받지 않아서 스프링 기본 응답이 나간다.