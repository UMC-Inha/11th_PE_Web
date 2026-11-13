- Bean Validation과 @Valid

  **Bean Validation**

  객체의 필드에 어노테이션으로 검증 규칙을 선언하는 자바 표준. 현재 명칭은 Jakarta Bean Validation, Hibernate Validator는 이를 구현한 라이브러리.

    - DTO: 입력 형식·길이·범위 선언
    - Controller의 `@Valid`: 요청 DTO 내부의 검증 규칙 적용
    - Service: 회원 존재 여부·중복·평점 소유자 등 업무 규칙 확인
    - DB 제약: UNIQUE·FK 등 최종 데이터 무결성 보장

  ⇒ 이메일 형식이 맞는 것과 가입 가능한 이메일인 것은 별개.

  **자주 사용하는 어노테이션**

  | 어노테이션 | 검증 내용 |
      | --- | --- |
  | `@NotNull` | null 금지. 빈 문자열·공백은 허용 |
  | `@NotEmpty` | null·길이 0 금지. 공백 문자열은 허용 |
  | `@NotBlank` | null·빈 문자열·공백으로만 구성된 문자열 금지 |
  | `@Email` | 이메일 형식 |
  | `@Size(min, max)` | 문자열·컬렉션 등의 길이·크기 |
  | `@Min` / `@Max` | 숫자의 최솟값·최댓값 |
  | `@Pattern` | 정규표현식과 일치 여부 |

  `@Email`, `@Size`, `@Min` 등은 null 자체를 거부하는 용도로는 부족 → 필수 입력이면 `@NotBlank` 또는 `@NotNull`과 조합. 숫자를 `int`로 받으면 누락과 0을 구분하기 어려워, 필수 여부 검증이 필요할 때는 `Integer` + `@NotNull` 고려.

    ```java
    public record SignUpRequest(
            @NotBlank(message = "이메일을 입력해주세요.")
            @Email(message = "올바른 이메일 형식이 아닙니다.")
            String email,
    
            @NotBlank(message = "닉네임을 입력해주세요.")
            @Size(min = 2, max = 12, message = "닉네임은 2자 이상 12자 이하로 입력해주세요.")
            String nickname
    ) {}
    ```

    ```java
    public ResponseEntity<ApiResponse<MemberResponse>> signUp(
            @Valid @RequestBody SignUpRequest request,
            @Param @Positive Long memberId
    ) {
        // 검증을 통과한 요청으로 회원가입 처리
    }
    ```

  **추가 핵심 정리**

    - 어노테이션만 붙인다고 임의로 생성한 모든 객체가 자동 검증되는 것은 X. MVC의 `@Valid` 등 검증을 실행하는 지점 필요.
    - 중첩 DTO 내부까지 검증하려면 해당 필드에도 `@Valid` 추가.
    - 경로 변수·쿼리 파라미터에 직접 제약을 붙인 메서드 검증은 `HandlerMethodValidationException`이 발생할 수 있음. DTO 검증 예외 하나만 처리하면 모든 입력 오류가 통일되는 것은 X.
    - 프론트 검증은 사용자 편의, 서버 검증은 데이터 보호. 프론트를 우회한 요청도 들어올 수 있으므로 서버 검증 유지.

  Spring MVC — Validation
  Jakarta — 검증 어노테이션

- class-validator와 ValidationPipe

  Spring의 DTO 검증 어노테이션 + `@Valid`에 대응하는 NestJS 입력 검증 방식.

  **NestJS 참고**

    - `class-validator`: DTO 클래스에 데코레이터로 검증 규칙 선언.
    - `ValidationPipe`: Controller 실행 전 규칙 적용, 검증 실패 시 기본 400 응답.
    - TypeScript 타입 선언만으로 실제 요청값을 검증하는 것은 X.

  NestJS — Validation
  class-validator — 공식 저장소

- bcrypt와 salt round

  **bcrypt**

  비밀번호 저장을 위한 단방향 해시 함수. 복호화해서 원문을 꺼내는 방식 X → 입력한 비밀번호가 저장된 해시와 일치하는지 확인.

  일반 해시보다 계산 비용을 의도적으로 크게 설정 가능 → 비밀번호 후보를 대량으로 대입하는 공격의 비용 증가.

  **salt**

  해시를 만들 때 함께 사용하는 무작위 값. 같은 비밀번호여도 salt가 다르면 다른 해시 생성 → 같은 비밀번호를 쓰는 계정을 해시만 보고 묶거나, 미리 계산한 해시 표를 재사용하기 어려움.

    - bcrypt 라이브러리에서 무작위 salt 생성
    - 생성 결과에 salt·비용 설정·해시 포함
    - salt는 비밀키가 아니며, 해시와 함께 저장 가능

  **salt round**

  일반적으로 bcrypt의 cost factor를 가리키는 표현. salt를 몇 번 바꾼다는 의미 X.

    - cost 10 → 약 `2^10` 규모의 반복 비용
    - cost 11 → cost 10보다 계산량 약 2배
    - 비용↑ → 대입 공격 비용↑, 서버의 가입·로그인 처리 시간도↑

  ⇒ 무조건 크게 설정하기보다 실제 서버에서 처리 시간을 측정해 결정.

  **Spring 사용 예시**

    ```java
    PasswordEncoder encoder = new BCryptPasswordEncoder(10);
    
    String hash = encoder.encode("Umc!1234"); // 저장
    boolean matched = encoder.matches("Umc!1234", hash); // 확인
    ```

  매번 salt가 달라지므로 `encode(입력값).equals(저장된 해시)`로 비교하면 X. `matches`가 저장된 해시의 salt·cost를 사용해 확인.

  **추가 핵심 정리**

    - 순수 bcrypt 출력은 보통 60자. Spring의 `DelegatingPasswordEncoder`처럼 `{bcrypt}` 식별자를 붙이는 저장 형식은 더 길어질 수 있음 → 컬럼 길이는 실제 저장 형식 기준.
    - bcrypt는 입력 길이에 72바이트 경계가 있음. 72글자와는 다르며, 한글·이모지는 여러 바이트 사용. 초과 시 처리 방식은 구현에 따라 확인하고 서버 입력 정책에 반영.
    - 평문 비밀번호와 해시는 모두 응답 DTO에서 제외. 요청 로그에도 비밀번호를 남기지 않도록 주의.
    - 워크북은 `spring-security-crypto`로 해시 기능 사용. 전체 Security starter 추가와는 구분.

  Spring Security — Password Storage

  **Node.js 참고**

  `bcrypt.hash`로 해시 생성, `bcrypt.compare`로 비밀번호 확인.

- HTTP 201 Created / 204 No Content / 409 Conflict

  **HTTP 상태 코드**

  요청 처리 결과를 HTTP 수준에서 표현하는 값. JSON의 `code`는 애플리케이션 내부에서 정한 세부 코드 → 서로 역할이 다름.

  | 상태 코드 | 의미 | 이번 워크북 예시 |
      | --- | --- | --- |
  | 201 Created | 요청 처리로 새 리소스 생성 | 회원가입·평점 등록 |
  | 204 No Content | 처리 성공, 응답 본문 없음 | 평점 삭제 |
  | 409 Conflict | 리소스의 현재 상태와 요청이 충돌 | 이메일·닉네임·동일 영화 평점 중복 |

  **201 Created**

  회원 생성이 끝났다는 의미. 단순히 요청을 접수했다는 의미는 X.

    ```java
    return ResponseEntity.status(201)
            .body(ApiResponse.created("회원가입에 성공했습니다.", response));
    ```

  생성된 회원 ID·이메일·닉네임 등을 result에 포함. 새 리소스의 위치를 `Location` 헤더로 안내하는 설계도 가능.

  **204 No Content**

  성공했지만 보낼 본문이 없는 응답.

    ```java
    return ResponseEntity.noContent().build();
    ```

  204를 사용하면서 성공 JSON까지 함께 반환하면 X. 프론트에서도 204 응답에 무조건 `response.json()`을 호출하지 않도록 처리.

  ⇒ 공통 응답 형식을 사용하더라도 204는 본문 없는 응답. 공통 성공 본문이 필요하면 200 등 다른 응답 설계 필요.

  **409 Conflict**

  형식은 맞지만 현재 저장된 데이터와 충돌하는 경우. 이메일 형식 오류는 400, 이미 사용 중인 이메일은 409로 구분.

    - 400: 입력 형식·범위 오류
    - 403: 다른 회원의 평점 수정·삭제 등 권한 부족
    - 404: 요청한 평점 등 리소스 없음
    - 409: 중복 등 현재 상태와 충돌

  **추가 핵심 정리**

    - JSON에 `"code": "COMMON201"`을 적는 것만으로 HTTP 상태가 201이 되는 것은 X. `ResponseEntity.status(201)` 등으로 별도 지정.
    - 모든 실패를 HTTP 200으로 돌려주면 상태 코드만으로 성공·실패를 구분하기 어려움.
    - 오류 본문의 code·message는 프론트가 오류를 구분하고 안내할 때 사용.
    - 204는 DELETE 전용 코드가 아니며, 모든 DELETE가 반드시 204여야 하는 것도 X. 이번 워크북의 삭제 계약이 204.

  RFC 9110 — 201 Created
  RFC 9110 — 204 No Content
  RFC 9110 — 409 Conflict

- UNIQUE 제약 조건과 동시성

  **UNIQUE 제약 조건**

  특정 컬럼 또는 컬럼 조합이 중복 저장되지 않도록 DB에서 보장하는 규칙.

    - 회원 이메일 UNIQUE → 같은 이메일의 회원 중복 방지
    - 회원 닉네임 UNIQUE → 같은 닉네임 중복 방지
    - `UNIQUE(member_id, movie_id)` → 같은 회원이 같은 영화에 평점을 두 번 저장하는 것 방지

  복합 UNIQUE는 각 컬럼을 개별적으로 유일하게 만드는 것이 아니라, 두 값의 조합이 유일하다는 의미.

    ```sql
    UNIQUE (member_id, movie_id)
    ```

  `(1, 10)`, `(1, 20)`, `(2, 10)`은 함께 저장 가능. `(1, 10)`을 다시 넣는 것은 불가.

  **사전 중복 검사만으로 부족한 이유**

  동시성: 여러 요청이 같은 시기에 처리되며, 실행 순서가 서로 겹치는 상황.

    1. 요청 A: 이메일 조회 → 없음
    2. 요청 B: 같은 이메일 조회 → 없음
    3. 요청 A: 저장
    4. 요청 B: 저장 시도

  조회와 저장은 별도 작업 → 둘 다 사전 검사를 통과 가능. 이런 실행 순서 경쟁을 race condition이라고 부름.

  ⇒ Service 검사로 빠르고 구체적인 안내, DB UNIQUE로 실제 중복 저장 방지.

  **예외 응답까지 연결**

    - 사전 검사에서 중복 확인 → 이메일·닉네임별 업무 예외
    - 동시에 들어온 요청이 DB UNIQUE에 걸림 → 제약 위반 예외를 공통 오류 응답으로 변환
    - 알려진 중복 제약 위반은 409로 안내
    - 이메일 UNIQUE와 닉네임 UNIQUE를 구분하려면 제약 이름 등 DB 오류 정보를 확인

  **추가 핵심 정리**

    - `@Transactional`은 작업을 하나의 트랜잭션으로 묶는 기능. 붙이는 것만으로 모든 요청이 직렬 실행되거나 중복 검사가 원자적으로 바뀌는 것은 X.
    - JPA의 `save()` 호출 시점과 실제 INSERT·flush·commit 시점이 다를 수 있음 → `save()` 바로 주변의 try-catch만으로 모든 제약 위반을 잡는다고 가정하면 X.
    - `DataIntegrityViolationException`에는 UNIQUE 외에도 FK·NOT NULL 위반 등이 포함 가능. 전부 “이메일 중복”으로 처리하면 원인을 잘못 안내할 수 있음.
    - MySQL UNIQUE는 NULL을 여러 개 허용할 수 있으므로 필수 이메일에는 NOT NULL도 함께 적용.
    - 이메일·닉네임 중복 기준은 대소문자·공백 정책과 DB collation에도 영향. 서비스 정규화 규칙과 DB 제약 기준을 맞추는 것이 중요.

  MySQL — UNIQUE 인덱스
  MySQL InnoDB — INSERT와 잠금
  Hibernate — Flushing
  Spring — DataIntegrityViolationException

- @RestControllerAdvice / Exception Filter

  **공통 목적**

  여러 컨트롤러에서 발생한 예외를 한곳에서 받아 HTTP 상태 코드와 오류 응답 형식으로 변환.

  Controller마다 같은 try-catch 반복↓, 오류 형식 통일, 처리 규칙 관리 용이.

  **Spring: @RestControllerAdvice**

  `@ControllerAdvice` + `@ResponseBody`의 조합. 여러 컨트롤러에 공통 처리를 적용하고, 예외 처리 결과를 JSON 등 응답 본문으로 반환.

    - `@RestControllerAdvice`: 공통 처리 클래스
    - `@ExceptionHandler`: 처리할 예외 타입과 메서드 연결
    - Service: 업무 규칙 위반 시 예외 발생
    - Handler: 예외를 HTTP 상태 + 공통 응답 DTO로 변환

  **구조 예시**

    ```java
    @RestControllerAdvice
    public class GlobalExceptionHandler {
        @ExceptionHandler(DuplicateEmailException.class)
        public ResponseEntity<ApiResponse<Void>> handleDuplicateEmail(
                DuplicateEmailException exception
        ) {
            return ResponseEntity.status(409)
                    .body(ApiResponse.failure(
                            "MEMBER4091", "이미 사용 중인 이메일입니다."
                    ));
        }
    }
    ```

  **처리 흐름**

  요청 → DTO 검증 → Service 업무 처리 → 예외 발생 → 공통 처리기 → HTTP 상태 + 실패 JSON → 프론트 안내

    ```json
    {
      "isSuccess": false,
      "code": "MEMBER4091",
      "message": "이미 사용 중인 이메일입니다.",
      "result": null
    }
    ```

  **추가 핵심 정리**

    - 검증 오류는 필드 이름과 메시지를 함께 반환하면 프론트에서 해당 입력칸에 안내 가능.
    - 예상 가능한 업무 오류와 예상하지 못한 서버 오류 구분. 서버 오류는 상세 로그를 남기고, 내부 SQL·스택 트레이스는 응답에서 제외.
    - 모든 예외를 400으로 처리하면 서버 버그까지 사용자 입력 문제로 보이므로 X.
    - Advice가 필터·시큐리티 계층의 모든 오류까지 자동으로 처리하는 것은 X. 해당 계층에는 별도의 예외 처리 지점이 존재.
    - 전역 예외 처리가 트랜잭션 롤백을 대신하는 것은 X. 저장 작업의 트랜잭션 경계·롤백 조건은 별도 관리.

  Spring MVC — Controller Advice

  **NestJS 참고**

  Exception Filter가 예외를 받아 상태 코드·오류 본문으로 변환. `@Catch()`로 처리할 예외 지정 → Spring의 전역 예외 처리와 비슷한 역할.