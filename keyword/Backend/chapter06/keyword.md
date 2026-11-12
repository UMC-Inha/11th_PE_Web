- Bean Validation과 @Valid

  ### 1. Bean Validation이란

  | 구분 | 설명 |
      | --- | --- |
  | Bean Validation | Jakarta Bean Validation은 객체, 객체 멤버, 메서드, 생성자를 검증하는 기능이다. 규칙은 `jakarta.validation` 패키지의 애노테이션으로 선언한다. |
  | Hibernate Validator | Bean Validation의 참조 구현체이다. 실제 검증은 이 라이브러리가 수행한다. |
  | spring-boot-starter-validation | Hibernate Validator 같은 구현체를 보통 이 스타터가 제공하며, 클래스패스에 있으면 Spring Boot가 검증 기능을 자동으로 켠다.  |

  `build.gradle`에 `spring-boot-starter-validation`이 없으면 `@Valid`가 동작하지 않는다.

  ### 2. 제약 애노테이션

  `@NotNull`, `@Size`, `@Min`, `@Max`, `@Pattern`, `@Email` 등이 기본으로 제공된다.

  | 애노테이션 | 검사 내용 | 사용 위치 |
      | --- | --- | --- |
  | `@NotBlank` | null, 빈 문자열, 공백만 있는 문자열 불가 | 이메일, 비밀번호, 닉네임 |
  | `@Email` | 이메일 형식 | 이메일 |
  | `@Pattern` | 정규식 일치 | 비밀번호 |
  | `@Size` | 문자열 길이 범위 | 닉네임, 후기 |
  | `@NotNull` | null 불가 | movieId, score |
  | `@Min`, `@Max` | 숫자 범위 | score |
  | `@Positive` | 양수 | movieId |

  `@NotNull`은 null만, `@NotEmpty`는 null과 빈 값을, `@NotBlank`는 공백만 있는 문자열까지 막는다. 문자열 입력에는 `@NotBlank`가 가장 엄격하다.

  ### 3. @Valid란

    - `@Valid`는 객체를 자동 검증 대상으로 표시하는 Jakarta 애노테이션이며, 컨트롤러 파라미터에 붙이면 Spring이 메서드 본문에 들어가기 전에 Validator를 실행한다.
    - 검증 규칙을 어기면 Spring이 이후 로직을 실행하지 않고 400 Bad Request를 반환한다.
    - 다른 객체를 참조하는 필드에 `@Valid`를 붙이면 그 객체까지 검증하는 중첩 검증(cascaded validation)이 된다.
    - `@Valid`는 규칙을 정의하지 않고 검증을 시작하는 스위치 역할만 한다. 규칙은 DTO의 제약 애노테이션에 있다.

  ### 4. @Valid와 @Validated

  | 구분 | @Valid | @Validated |
      | --- | --- | --- |
  | 출처 | Jakarta 표준 | Spring 제공 |
  | 주 용도 | 컨트롤러 요청 DTO, 중첩 객체 검증 | 서비스 등 메서드 파라미터 검증, 검증 그룹 지정 |
  | 비고 | 이번 주차에서 사용 | Spring의 메서드 검증 대상이 되려면 클래스에 `@Validated`를 붙여야 한다.  |
- class-validator와 ValidationPipe

  ### 1. class-validator란

    - class-validator는 클래스의 프로퍼티에 데코레이터를 붙여 검증 규칙을 선언하는 TypeScript 라이브러리이다.
    - 규칙은 `@IsEmail()`, `@Min(0)`, `@Length(10, 20)`처럼 프로퍼티 위에 데코레이터로 적는다.
    - `validate`를 직접 호출하면 실패한 항목이 `ValidationError` 배열로 반환된다. 각 항목에는 검증한 객체, 실패한 프로퍼티, 입력값 등이 들어 있다.
    - 데코레이터의 `message` 옵션으로 실패 시 보여 줄 메시지를 지정할 수 있다.
    - 하위 클래스는 부모 클래스의 데코레이터를 자동으로 상속한다.

  ### 2. ValidationPipe란

    - ValidationPipe는 NestJS에 내장된 파이프이며 `@nestjs/common`에서 가져온다.
    - 내부적으로 class-validator와 class-transformer를 사용하므로 두 패키지를 함께 설치해야 한다.
    - 규칙은 모듈별 DTO 클래스에 데코레이터로 선언하고, 파이프는 들어오는 요청 데이터가 그 규칙에 맞는지 검증한다.
    - 앱 전체에 적용하면 모든 엔드포인트가 잘못된 데이터로부터 보호된다.

  ### 3. 주요 옵션

  | 옵션 | 동작 | 워크북 설정 |
      | --- | --- | --- |
  | `whitelist` | 검증 데코레이터가 없는 프로퍼티를 결과 객체에서 제거한다. | `true` |
  | `forbidNonWhitelisted` | 제거하는 대신 예외를 던져 요청을 막는다. `whitelist`와 함께 써야 한다. | `true` |
  | `transform` | 네트워크로 들어온 일반 객체를 DTO 클래스 인스턴스로 변환한다. 경로 변수 같은 기본 타입도 변환한다. | `true` |
  | `disableErrorMessages` | 오류 메시지를 숨긴다. | 미사용 |
  | `exceptionFactory` | 검증 실패 시 던질 예외를 직접 만든다. | 미사용 |
- bcrypt와 salt round

  ### 1. bcrypt란

    - bcrypt는 비밀번호를 저장하기 위한 해시 함수이며, 일부러 느리게 동작하도록 설계되어 비밀번호 크래킹을 어렵게 한다.
    - 해시는 단방향 변환이라 저장된 값에서 원래 비밀번호를 되돌릴 수 없다. 로그인할 때는 입력값을 같은 방식으로 해시해 비교한다.
    - 워크북에서는 DB에 평문 대신 bcrypt 해시만 저장하고, 응답 DTO에는 비밀번호를 넣지 않는다.

  ### 2. salt란

    - salt는 해시를 만들 때 비밀번호에 섞는 무작위 값이다.
    - Spring Security의 bcrypt는 해시마다 무작위 16바이트 salt를 사용한다.
    - salt가 매번 달라서 같은 비밀번호라도 해시 결과가 매번 다르다. 해시가 매번 다르게 나오는 것은 정상이다.
    - salt와 cost는 해시 문자열 안에 함께 저장되므로 따로 보관할 필요가 없다. 검증 시에는 저장된 해시에서 salt를 읽어 같은 방식으로 계산한다.

  ### 3. salt round(cost)란

    - salt round는 해시 연산을 얼마나 무겁게 할지 정하는 값이며, 실제 반복 횟수는 `2^rounds`이다.
    - 값이 1 커질 때마다 계산량이 2배가 된다.
    - 값이 클수록 해시가 느려져 무차별 대입 공격에 강해지지만, 우리 서버의 가입과 로그인도 그만큼 느려진다.

  ### 4. 해시 문자열 구조

  bcrypt 해시는 항상 60자이며 `$[알고리즘]$[cost]$[salt + 해시]` 구조이다. 예를 들어 `$2b$10$nOUIs5kJ7naTuTFkBy1veuK0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa`는 다음과 같이 나뉜다.

  | 부분 | 값 | 의미 |
      | --- | --- | --- |
  | 알고리즘 | `$2b$` | bcrypt 버전 |
  | cost | `10` | 2^10번 반복 |
  | salt | 22자 | 16바이트 salt를 base64로 인코딩한 값 |
  | 해시 | 나머지 31자 | 비밀번호 해시 결과 |

  워크북에서 `member` 테이블의 `password` 컬럼을 60자로 준비한 이유가 이 구조 때문이다.

- HTTP 201 Created / 204 No Content / 409 Conflict

  ### 1. 201 Created

    - 201은 요청이 성공했고 리소스가 생성되었음을 나타내는 성공 상태 코드이며, 가장 흔한 사용처는 POST 요청의 결과이다.
    - 새 리소스는 응답이 반환되기 전에 이미 만들어져 있다.
    - 새로 만들어진 항목은 응답 본문에 담겨 돌아가고, 그 위치는 요청 URL이나 `Location` 헤더의 URL이다.
    - 워크북에서는 회원가입 응답에 `memberId`, `email`, `nickname`을, 평점 등록 응답에 `ratingId`를 `result`로 담는다. `Location` 헤더는 사용하지 않는다.

  ### 2. 204 No Content

    - 204는 요청이 성공했으며 클라이언트가 현재 페이지에서 이동할 필요가 없다는 뜻이다.
    - 204 응답에는 콘텐츠나 `Content-Length` 헤더를 포함하면 안 되며, 콘텐츠가 있으면 브라우저가 거부할 수 있다.
    - 본문이 없으므로 `ApiResponse` 형식(`isSuccess`, `code`, `message`, `result`)을 쓸 수 없다. 워크북에서 삭제만 형식 없이 응답하는 것은 이 때문이다.
    - 수정(PATCH)은 본문을 돌려주므로 200, 삭제는 돌려줄 내용이 없으므로 204로 구분한다.

  | 구현 | 코드 |
      | --- | --- |
  | Spring Boot | `ResponseEntity.noContent().build()` |
  | NestJS | `@HttpCode(HttpStatus.NO_CONTENT)` |

  ### 3. 409 Conflict

    - 409는 요청이 서버의 현재 상태와 충돌했음을 나타내는 클라이언트 오류 상태 코드이다.
    - 충돌은 PUT 요청에서 가장 흔하며, 서버에 있는 파일보다 오래된 버전을 올릴 때처럼 버전 충돌이 대표적인 예이다.
    - 같은 리소스를 갱신하는 여러 요청이 동시에 들어왔음을 알리는 등 구현에 따라 다른 용도로도 쓰인다.
    - 이번 주차에서는 이미 존재하는 이메일, 닉네임, 같은 영화에 대한 평점을 다시 등록하려는 요청에 쓴다. 형식은 맞지만 이미 저장된 데이터와 겹치기 때문이다.

  ### 4. 비슷한 오류 코드와의 구분

  | 코드 | 기준 | 예시 |
      | --- | --- | --- |
  | 400 Bad Request | 요청 자체가 규칙에 어긋남 | 이메일 형식 오류, 별점 6점 |
  | 403 Forbidden | 요청은 이해했지만 권한이 없음 | 다른 회원의 평점 수정 |
  | 404 Not Found | 대상이 존재하지 않음 | 없는 ratingId |
  | 409 Conflict | 요청은 올바르지만 현재 상태와 충돌함 | 중복 이메일, 중복 평점 |

  400은 서버 상태와 무관하게 입력이 잘못됐을 때, 409는 입력은 올바르지만 저장된 상태 때문에 처리할 수 없을 때 쓴다.

  ### 5. 주의할 점

    - 사전 중복 체크를 통과한 뒤 DB의 UNIQUE 제약 위반이 발생해도 409로 변환해야 한다. 동시에 같은 요청이 들어오면 둘 다 사전 체크를 통과할 수 있기 때문이다.
    - 워크북의 Spring `GlobalExceptionHandler`는 `IllegalArgumentException`을 모두 409로 처리한다. 앞서 URL에 `{ratingId}`를 그대로 보냈을 때 409가 나온 것도 이 때문이며, 형식 오류까지 409로 나오는 것은 워크북 코드의 한계이다.
    - 204 응답에 본문을 넣으면 브라우저가 거부할 수 있으므로 삭제 API에서 `ApiResponse`를 반환하지 않는다.
- UNIQUE 제약 조건과 동시성

  ### 1. UNIQUE 제약 조건이란

    - UNIQUE 제약은 해당 컬럼(또는 컬럼 조합)에 같은 값이 두 행 이상 저장되지 않도록 DB가 직접 막는 규칙이다.
    - UNIQUE 인덱스나 PRIMARY KEY에 이미 있는 값을 INSERT, UPDATE로 넣으려 하면 MySQL이 `ERROR 1062 (23000): Duplicate entry ...` 오류를 낸다. 이 오류는 SQLSTATE 23000(무결성 제약 위반)에 속한다.
    - 워크북에서는 이메일, 닉네임, 그리고 `rating`의 `(member_id, movie_id)` 조합에 UNIQUE가 걸려 있다. 복합 UNIQUE는 한 회원이 같은 영화에 평점을 한 번만 남기게 한다.

  ### 2. 사전 체크만으로 부족한 이유

  `existsByEmail`로 먼저 확인하는 방식은 "확인"과 "저장"이 별개 단계라서 그 사이에 틈이 생긴다.

  | 시점 | 요청 A | 요청 B |
      | --- | --- | --- |
  | 1 | 이메일 중복 확인: 없음 | 이메일 중복 확인: 없음 |
  | 2 | INSERT 성공 | (A의 저장이 끝나기 전에 체크를 이미 통과함) |
  | 3 | 커밋 | INSERT 시도: UNIQUE 위반으로 실패 |
    1. 두 요청이 거의 동시에 들어오면 둘 다 체크를 통과할 수 있다.
    2. 이때 마지막 관문인 DB UNIQUE 제약이 한 요청만 성공시키고 나머지를 막는다.
    3. 그래서 서비스 검증은 친절한 오류 메시지를 위한 것이고, 데이터 정합성은 DB 제약이 최종적으로 보장한다.

  ### 3. MySQL(InnoDB)은 동시 INSERT를 어떻게 처리하나

  MySQL 공식 문서의 “Locks Set by Different SQL Statements in InnoDB” 내용은 다음과 같다.

  | 상황 | 동작 |
      | --- | --- |
  | INSERT | 삽입한 행에 exclusive lock을 건다. |
  | 중복 키 오류 발생 | 중복된 인덱스 레코드에 shared lock을 건다. |
  | 같은 값을 동시에 INSERT | 먼저 삽입한 세션이 락을 잡고, 나머지 세션은 중복 키 오류를 받으며 shared lock을 요청해 대기한다. |
    - 세션 1이 `INSERT INTO t1 VALUES(1)`을 하고 아직 커밋하지 않은 상태에서 세션 2, 3이 같은 값을 넣으면, 둘 다 중복 키 오류를 받고 해당 행의 shared lock을 요청한다.
    - 세션 1이 커밋하면 대기하던 shared lock 요청이 허용된다.
    - 공식 문서는 shared lock 때문에, 다른 세션이 이미 exclusive lock을 쥔 상태에서 여러 세션이 같은 행을 삽입하려 하면 교착 상태(deadlock)가 날 수 있다고 설명한다.
    - 결과적으로 같은 키는 한 번만 저장되고, 나머지는 오류가 된다. 애플리케이션은 이 오류를 409로 바꿔 응답해야 한다.

  ### 4. Spring에서의 예외

    1. UNIQUE나 PK 위반은 Spring에서 `DataIntegrityViolationException`으로 올라온다. 무결성 제약을 위반한 INSERT, UPDATE에 대해 던지는 예외이다.
    2. 하위 클래스로 `DuplicateKeyException`이 있다. 공식 문서는 하위 클래스에 기대지 말고 `DataIntegrityViolationException` 자체를 처리하길 권장한다.
    3. 워크북의 `GlobalExceptionHandler`가 이 예외를 잡아 409와 `COMMON4091`로 응답한다.

  | 구분 | 발생 지점 | 응답 |
      | --- | --- | --- |
  | 사전 체크 | `existsBy...`로 확인 후 `IllegalArgumentException` | 409, `COMMON4092`, 구체적 메시지 |
  | DB 제약 | UNIQUE 위반으로 `DataIntegrityViolationException` | 409, `COMMON4091`, `이미 존재하는 데이터입니다.` |
- @RestControllerAdvice / Exception Filter

  ### 1. 왜 전역 예외 처리를 쓰나

    - 컨트롤러마다 try-catch를 쓰면 같은 오류를 여러 번 처리하게 되고 응답 형식도 제각각이 된다.
    - 전역 예외 처리는 어디서 예외가 발생하든 한 곳에서 잡아 정해진 형식(`isSuccess`, `code`, `message`, `result`)으로 응답한다.
    - Spring Boot에서는 `@RestControllerAdvice`, NestJS에서는 Exception Filter가 이 역할을 한다.

  ### 2. Spring: @ExceptionHandler와 @RestControllerAdvice

  | 애노테이션 | 역할 |
      | --- | --- |
  | `@ExceptionHandler` | 컨트롤러 메서드에서 발생한 예외를 처리하는 메서드에 붙인다. `@Controller` 또는 `@ControllerAdvice` 클래스에 둘 수 있다. |
  | `@ControllerAdvice` | 클래스에 붙이면 안의 `@ExceptionHandler`가 모든 컨트롤러에 적용된다. `@Component`가 붙어 있어 컴포넌트 스캔으로 빈에 등록된다. |
  | `@RestControllerAdvice` | `@ControllerAdvice`와 `@ResponseBody`를 합친 애노테이션이며, 핸들러의 반환값이 뷰 이름이 아니라 응답 본문(JSON)으로 변환된다. |
    - 컨트롤러 안에 선언한 `@ExceptionHandler`는 그 컨트롤러에서만 동작하고, `@ControllerAdvice`나 `@RestControllerAdvice` 안에 선언하면 모든 컨트롤러에 적용된다.
    - 컨트롤러 안의 로컬 핸들러가 먼저 적용되고, 전역 핸들러는 그 뒤에 적용된다.
    - 기본값은 모든 컨트롤러에 적용이며, 애노테이션 속성으로 대상 패키지나 컨트롤러를 좁힐 수 있다.
    - `@ExceptionHandler` 메서드는 `@RequestMapping` 메서드와 같은 반환값을 지원하므로 `ResponseEntity`로 상태 코드와 본문을 함께 돌려줄 수 있다.
    - 핸들러는 지정한 예외 클래스와 그 하위 클래스를 모두 처리한다. 앞서 `{ratingId}` 문자열을 보냈을 때 `NumberFormatException`이 `IllegalArgumentException` 핸들러에 잡혀 409가 나온 것도 이 때문이다.

  ### 3. NestJS: Exception Filter

    - Nest에는 처리되지 않은 모든 예외를 잡아 사용자에게 적절한 응답을 보내는 내장 예외 계층이 있다.
    - Exception Filter는 이 흐름을 가로채 예외 처리 과정을 제어하고 클라이언트로 보내는 응답 내용을 바꾸는 기능이다.
    - 필터는 `ExceptionFilter<T>` 인터페이스를 구현해 `catch(exception, host: ArgumentsHost)` 메서드를 작성한다.
    - `@Catch(HttpException)`은 어떤 예외를 잡을지 지정하는 데코레이터이며, 인자 없이 `@Catch()`로 쓰면 모든 예외를 잡는다.
    - `ArgumentsHost`로 요청과 응답 객체에 접근해 원하는 JSON을 만들어 보낸다.

  | 적용 방법 | 범위 |
      | --- | --- |
  | `@UseFilters(필터)` | 컨트롤러 또는 라우트 핸들러 단위 |
  | `app.useGlobalFilters(필터)` | 앱 전체의 모든 컨트롤러와 라우트 핸들러 |
    - `useGlobalFilters()`는 게이트웨이나 마이크로서비스용 필터는 설정하지 않으며, 모듈 밖(`main.ts`)에서 등록한 전역 필터는 의존성 주입을 쓸 수 없다.

  ### 4. Spring과 NestJS 비교

  | 구분 | Spring Boot | NestJS |
      | --- | --- | --- |
  | 전역 처리 위치 | `@RestControllerAdvice` 클래스 | `ExceptionFilter` 클래스 |
  | 예외 지정 | `@ExceptionHandler(예외.class)` | `@Catch(예외)` |
  | 응답 작성 | `ResponseEntity` 반환 | `response.status().json()` |
  | 전역 등록 | 컴포넌트 스캔으로 자동 등록 | `main.ts`의 `useGlobalFilters` |