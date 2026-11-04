# Backend Chapter06

## 키워드 정리

### Bean Validation과 `@Valid`

- Bean Validation: 자바 표준 검증 규격. 실제 동작은 Hibernate Validator가 담당
- DTO 필드에 `@NotBlank`, `@Email`, `@Pattern`, `@Size` 같은 애노테이션으로 검증 규칙 선언
- 컨트롤러 파라미터에 `@Valid`를 붙이면 요청이 DTO로 바인딩된 직후 검증 시작
- 규칙 위반 시 `MethodArgumentNotValidException` 발생, 전역 예외 처리에서 400으로 응답
- 형식 검증은 DTO에 선언, 이메일 중복처럼 DB 조회가 필요한 검증은 Service에서 처리

### class-validator와 ValidationPipe

- Bean Validation에 대응하는 NestJS 방식
- DTO 클래스 필드에 `@IsEmail`, `@MinLength` 같은 데코레이터로 규칙 선언
- 전역 `ValidationPipe` 등록 시 요청 body를 DTO 인스턴스로 변환한 뒤 검증. 변환에는 class-transformer 사용
- `whitelist` 옵션: DTO에 없는 값 제거
- `forbidNonWhitelisted` 옵션: DTO에 없는 값이 들어오면 400으로 차단
- 화면에서 보내지 않아야 할 값이 DB까지 들어가는 일을 방지

### bcrypt와 salt round

- bcrypt: 비밀번호용 단방향 해시. 원문 복원 불가, 로그인 시 입력값을 해시해 비교(matches)
- salt: 해시할 때 섞는 임의의 값. 같은 비밀번호도 매번 다른 해시를 생성해서 레인보우 테이블 공격을 방어
- 결과 문자열에 알고리즘 버전, 라운드 수, salt가 함께 포함되어 salt를 따로 저장하지 않아도 됨. 길이 60자 고정이라 password 컬럼도 60자
- salt round(cost): 해시 연산을 2의 n제곱 번 반복. 값이 클수록 무차별 대입 공격에 강하지만 서버 처리도 느려짐. 보통 10 안팎 사용

### HTTP 201 Created / 204 No Content / 409 Conflict

- **201 Created:** 새 자원 생성 성공. 회원가입, 평점 등록에 사용
- **204 No Content:** 성공했지만 응답 본문 없음. 삭제에 사용. 본문이 비어 있는 것이 정상
- **409 Conflict:** 요청 형식은 맞지만 현재 자원 상태와 충돌. 중복 이메일, 닉네임, 같은 영화 평점 재등록이 해당
- **400과의 차이:** 400은 요청 자체가 잘못된 경우(형식 오류, 별점 범위 초과), 409는 요청은 올바르나 상태 때문에 불가한 경우

### UNIQUE 제약 조건과 동시성

- UNIQUE 제약: 같은 값의 중복 저장을 DB가 직접 차단. 평점은 `member_id` + `movie_id` 복합 UNIQUE로 한 회원이 한 영화에 평점 1개만 가능
- Service의 사전 확인만으로는 부족함. 확인과 저장 사이에 같은 요청이 동시에 들어오면 둘 다 통과할 수 있음(경쟁 상태)
- 사전 확인은 친절한 오류 메시지용이고, 데이터 무결성의 마지막 안전망은 DB의 UNIQUE
- DB가 차단하면 `DataIntegrityViolationException` 발생, 전역 예외 처리에서 409로 변환

### `@RestControllerAdvice` / Exception Filter

- 컨트롤러마다 try-catch를 쓰면 같은 처리가 반복됨. 전역 예외 처리는 예외를 한 곳에서 모아 동일한 형식으로 응답
- **Spring:** `@RestControllerAdvice` 클래스에 `@ExceptionHandler` 메서드를 두고, 예외 종류별로 상태 코드와 공통 응답(`isSuccess`, `code`, `message`, `result`) 생성
- **NestJS:** `ExceptionFilter` 구현 후 `@Catch` 데코레이터로 잡을 예외 지정, 전역 필터로 등록
- 어디서 오류가 나도 응답 형식이 같아 프론트가 한 가지 방식으로 처리 가능
