- Bean Validation과 @Valid
    
    ## Bean Validation이란?
    
    > Java 객체의 값이 **정해진 제약조건을 만족하는지 검증하는 표준**
    > 
    
    예를 들어 회원가입 요청에서는 다음과 같은 조건을 확인해야 한다.
    
    ```
    이메일 → 비어 있지 않고 이메일 형식이어야 함
    닉네임 → 공백만 있으면 안 됨
    나이   → 정해진 범위 안에 있어야 함
    ```
    
    Bean Validation에서는 이러한 규칙을 애너테이션으로 표현한다.
    
    현재는 Jakarta Validation이라는 이름으로 사용되며, 대표적인 구현체로 **Hibernate Validator**가 있다.
    
    여기서 Hibernate Validator는 검증 라이브러리이며, DB 매핑을 담당하는 Hibernate ORM과는 역할이 다르다.
    
    ---
    
    ## 대표적인 검증 애너테이션
    
    | 애너테이션 | 역할 |
    | --- | --- |
    | `@NotNull` | NULL을 허용하지 않음 |
    | `@NotEmpty` | NULL이나 빈 문자열·컬렉션 등을 허용하지 않음 |
    | `@NotBlank` | NULL, 빈 문자열, 공백만 있는 문자열을 허용하지 않음 |
    | `@Size` | 문자열 길이·컬렉션 크기 제한 |
    | `@Email` | 이메일 형식 검증 |
    | `@Min` / `@Max` | 숫자의 최솟값·최댓값 제한 |
    | `@Positive` | 양수인지 검증 |
    | `@Pattern` | 정규표현식 조건 검증 |
    
    특히 문자열 검증은 구분해야 한다.
    
    ```tsx
    null → @NotNull, @NotEmpty, @NotBlank 모두 실패
    
    ""   → @NotNull 통과
           @NotEmpty, @NotBlank 실패
    
    " "  → @NotNull, @NotEmpty 통과
           @NotBlank 실패
    ```
    
    또한 `@Email`, `@Size` 등은 NULL 자체를 금지하는 규칙과 별개이므로, 필수값이라면 적절한 제약을 조합해야 한다.
    
    ---
    
    ## DTO에 규칙 선언하기
    
    다음은 Java 예시이다.
    
    ```tsx
    import jakarta.validation.constraints.Email;
    import jakarta.validation.constraints.NotBlank;
    import jakarta.validation.constraints.Size;
    
    public record CreateUserRequest(
        @NotBlank
        @Email
        String email,
    
        @NotBlank
        @Size(min = 2, max = 20)
        String nickname
    ) {}
    ```
    
    → 이메일과 닉네임이 만족해야 하는 규칙을 요청 DTO에 선언함
    
    하지만 DTO에 애너테이션을 작성했다고 모든 객체 생성 시점에 자동으로 검증되는 것은 아니다.
    
    **검증을 실행하는 과정**이 필요하다.
    
    ---
    
    ## `@Valid`의 역할
    
    > 검증 대상 객체에 선언된 제약조건을 확인하도록 연결하고, 중첩 객체의 검증을 이어가는 데 사용하는 애너테이션
    > 
    
    Spring MVC에서는 요청 본문에 `@Valid`를 붙여 검증을 적용할 수 있다.
    
    ```tsx
    @PostMapping("/users")
    public ResponseEntity<Void> createUser(
        @Valid @RequestBody CreateUserRequest request
    ) {
        userService.create(request);
    
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .build();
    }
    ```
    
    일반적인 흐름은 다음과 같다.
    
    ```
    HTTP 요청
        ↓
    JSON을 DTO로 변환
        ↓
    @Valid를 통한 검증
        ├─ 통과 → Controller 실행
        └─ 실패 → 검증 오류 처리
    ```
    
    단, 검증 구현체와 프레임워크 연동이 설정되어 있어야 한다.
    
    `@Valid` 자체가 “문자열이 비어 있으면 안 된다”는 제약은 아니다. 구체적인 조건은 `@NotBlank`, `@Size` 등이 담당한다.
    
    ---
    
    ## 검증 실패와 업무 규칙의 구분
    
    요청 객체 검증 실패는 Spring MVC에서 일반적으로 `MethodArgumentNotValidException` 등으로 처리된다. 메서드 검증 방식에 따라 다른 예외가 발생할 수도 있다.
    
    하지만 이메일 형식이 올바르다고 회원가입이 반드시 가능한 것은 아니다.
    
    | 확인할 내용 | 담당 위치 |
    | --- | --- |
    | 이메일 형식이 맞는가? | 요청 DTO 검증 |
    | 가입 가능한 상태인가? | Service·Domain |
    | 이메일이 중복되는가? | 서비스 정책과 DB UNIQUE 제약 |
    | 관리자가 수행하는 요청인가? | 인증·인가 계층 |
    
    → Bean Validation은 **입력값의 제약을 선언하고 검증하는 기능**이며, 모든 업무 규칙과 동시성 문제를 대신하지 않는다.
    
- class-validator와 ValidationPipe
    
    ## class-validator란?
    
    > TypeScript 클래스의 속성에 **검증 규칙을 선언하고 실행할 수 있는 라이브러리**
    > 
    
    NestJS에서는 요청 DTO에 검증 데코레이터를 작성하는 데 자주 사용한다.
    
    ```tsx
    import {
      IsEmail,
      IsString,
      Length,
      Matches,
    } from "class-validator";
    
    export class CreateUserDto {
      @IsEmail()
      email!: string;
    
      @IsString()
      @Length(2, 20)
      @Matches(/\S/, {
        message: "닉네임은 공백만으로 구성할 수 없습니다.",
      })
      nickname!: string;
    }
    ```
    
    → 이메일 형식, 닉네임 길이, 공백만 있는지 등을 검증함
    
    ### 대표적인 데코레이터
    
    | 데코레이터 | 역할 |
    | --- | --- |
    | `@IsString()` | 문자열인지 확인 |
    | `@IsEmail()` | 이메일 형식 확인 |
    | `@IsInt()` | 정수인지 확인 |
    | `@Min()` / `@Max()` | 숫자 범위 확인 |
    | `@Length()` | 문자열 길이 확인 |
    | `@IsNotEmpty()` | 빈 문자열·NULL·undefined 등을 제한 |
    | `@IsOptional()` | NULL 또는 undefined이면 해당 속성의 다른 검증을 건너뜀 |
    | `@ValidateNested()` | 중첩 객체 검증 |
    
    `@IsNotEmpty()`만으로 `"   "`처럼 공백만 있는 문자열까지 차단되는 것은 아니다.
    
    또한 중첩 객체를 검증하려면 해당 객체의 클래스 정보와 인스턴스 변환도 고려해야 한다.
    
    ---
    
    ## ValidationPipe란?
    
    > NestJS의 요청 처리 과정에서 **DTO 검증과 필요한 변환을 실행하는 Pipe**
    > 
    
    역할을 나누면 다음과 같다.
    
    ```
    class-validator
    → 어떤 값을 허용할지 규칙 선언·검증
    
    ValidationPipe
    → HTTP 요청 처리 흐름에 검증 연결
    
    class-transformer
    → 일반 객체를 클래스 인스턴스 등으로 변환
    ```
    
    전역 설정 예시는 다음과 같다.
    
    ```tsx
    import { ValidationPipe } from "@nestjs/common";
    
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
    | `whitelist` | 검증 데코레이터가 없는 속성을 제외하는 기준 적용 |
    | `forbidNonWhitelisted` | 허용되지 않은 속성이 있으면 제거 대신 오류 반환 |
    | `transform` | 요청값을 DTO 인스턴스 등으로 변환 |
    
    `whitelist`는 TypeScript 클래스에 속성이 선언되어 있는지만 보는 것이 아니다. 검증 메타데이터가 있는지가 중요하며, 검증 없이 허용할 속성에는 `@Allow()` 등을 사용할 수 있다.
    
    ---
    
    ## Controller에서 사용하기
    
    ```tsx
    @Post()
    create(@Body() dto: CreateUserDto) {
      return this.usersService.create(dto);
    }
    ```
    
    ```
    요청 수신
       ↓
    ValidationPipe 실행
       ↓
    DTO 규칙 검증
       ├─ 성공 → Controller에 전달
       └─ 실패 → 기본적으로 400 응답
    ```
    
    요청 DTO에는 런타임 정보가 남는 **class**를 사용하는 것이 중요하다. TypeScript의 interface는 실행 시 사라지므로 검증 대상 정보로 그대로 사용할 수 없다.
    
    또한 `transform: true`라고 모든 문자열이 원하는 숫자·불리언으로 자동 변환되는 것은 아니다. 필드별 변환이나 `ParseIntPipe` 같은 도구가 필요할 수 있다.
    
    ---
    
    ## Bean Validation과 비교
    
    | 구분 | Java·Spring | TypeScript·NestJS |
    | --- | --- | --- |
    | 규칙 선언 | `@NotBlank`, `@Email` 등 | `@IsString`, `@IsEmail` 등 |
    | 검증 기능 | Jakarta Validation 구현체 | class-validator |
    | 요청 흐름 연결 | `@Valid`와 Spring 연동 | ValidationPipe |
    | 런타임 DTO | Java 객체 | TypeScript class 인스턴스 |
    
    두 방식 모두 **외부 입력을 서비스 로직에 전달하기 전에 검증한다**는 목적은 비슷하다.
    
    다만 개별 애너테이션과 데코레이터가 NULL이나 공백을 처리하는 방식까지 동일한 것은 아니다.
    
- bcrypt와 salt round
    
    ## bcrypt란?
    
    > 비밀번호를 저장하기 위해 사용하는 **느린 단방향 해시 함수**
    > 
    
    비밀번호를 그대로 저장하면 DB가 유출되었을 때 즉시 노출된다.
    
    따라서 비밀번호 자체 대신 해시 결과를 저장한다.
    
    ```
    회원가입
    비밀번호 → bcrypt 해시 → DB 저장
    
    로그인
    입력한 비밀번호 + 저장된 해시 → 일치 여부 확인
    ```
    
    bcrypt는 복호화해서 원래 비밀번호를 알아내는 방식이 아니다.
    
    로그인할 때는 **입력값이 저장된 해시와 일치하는지 검사**한다.
    
    ---
    
    ## Salt란?
    
    > 비밀번호를 해시할 때 함께 사용하는 **무작위 값**
    > 
    
    같은 비밀번호라도 서로 다른 salt를 사용하면 해시 결과가 달라진다.
    
    ```
    같은 비밀번호 + salt A → 해시 A
    같은 비밀번호 + salt B → 해시 B
    ```
    
    이를 통해 같은 비밀번호를 쓰는 계정이 같은 해시를 갖는 문제와, 미리 계산한 해시 목록을 재사용하는 공격을 어렵게 만든다.
    
    salt는 비밀 키가 아니다. 일반적인 bcrypt 해시 문자열에는 **알고리즘 정보, 비용 값, salt, 해시 결과**가 포함된다.
    
    따라서 보통 bcrypt가 반환한 문자열을 그대로 저장하면 된다.
    
    ---
    
    ## saltRounds란?
    
    > salt의 개수가 아니라, **해시 계산 비용을 조절하는 값**
    > 
    
    Node.js의 bcrypt API에서는 이 값을 흔히 `saltRounds`라고 부른다.
    
    ```tsx
    const saltRounds = 12;
    ```
    
    이는 비밀번호를 단순히 12번 해시한다는 뜻이 아니다. 비용 값은 로그 스케일이며, 핵심 계산량은 대략 `2^cost`에 비례한다.
    
    ```
    cost 10 → 기준 계산량
    cost 11 → 대략 2배
    cost 12 → 대략 4배
    ```
    
    실제 시간은 장비와 실행 환경에 따라 달라진다.
    
    ### TypeScript 예시
    
    ```tsx
    import * as bcrypt from "bcrypt";
    
    const saltRounds = 12; // 설명용 예시
    
    const passwordHash = await bcrypt.hash(
      plainPassword,
      saltRounds,
    );
    ```
    
    로그인할 때는 `compare()`를 사용한다.
    
    ```tsx
    const isPasswordValid = await bcrypt.compare(
      inputPassword,
      storedPasswordHash,
    );
    ```
    
    매번 새 salt로 해시를 만든 뒤 문자열끼리 비교하면 안 된다. 새 해시 결과가 달라질 수 있기 때문이다.
    
    Node.js 서버에서는 일반적으로 비동기 API를 사용하여 동기식 해시 계산으로 이벤트 루프를 막는 것을 피한다.
    
    ---
    
    ## 비용 값은 어떻게 정할까?
    
    | 비용이 너무 낮으면 | 비용이 너무 높으면 |
    | --- | --- |
    | 공격자가 더 빠르게 대입 가능 | 회원가입·로그인 응답 지연 |
    | 해시 유출 시 추측 비용이 낮음 | 서버 CPU와 작업 처리 부담 증가 |
    
    따라서 숫자를 무조건 크게 설정하기보다, 운영 환경에서 **처리 시간과 동시 로그인 부하**를 측정하여 정해야 한다.
    
    ### 입력 길이 주의
    
    bcrypt는 일반적으로 비밀번호 입력의 **앞 72바이트까지만 사용**한다.
    
    72글자가 아니라 바이트이므로 한글이나 이모지는 더 적은 글자 수에서도 제한에 도달할 수 있다. 초과 입력을 조용히 잘라서 처리하지 않도록 정책이 필요하다.
    
    또한 새 시스템의 비밀번호 저장 방식을 선택하는 상황이라면 OWASP는 Argon2id를 우선 권장하며, bcrypt는 기존 시스템 등에서 사용할 때 비용과 길이 제한을 고려하도록 안내한다.
    
- HTTP 201 Created / 204 No Content / 409 Conflict
    
    > 세 코드는 각각 **자원 생성 성공**, **본문 없는 성공**, **현재 상태와의 충돌**을 표현한다.
    > 
    
    | 코드 | 의미 | 예시 |
    | --- | --- | --- |
    | `201 Created` | 요청 결과 새 자원이 생성됨 | 회원가입, 북마크 생성 |
    | `204 No Content` | 성공했지만 응답 본문 없음 | 삭제 완료 |
    | `409 Conflict` | 대상 자원의 현재 상태와 요청이 충돌함 | 중복 등록, 상태 충돌 |
    
    ---
    
    ## 201 Created
    
    > 요청이 성공했고 **새로운 자원이 생성되었음**을 나타낸다.
    > 
    
    ```json
    POST /bookmarks
    Content-Type: application/json
    
    {
      "bookId": 10
    }
    ```
    
    ```json
    HTTP/1.1 201 Created
    Location: /bookmarks/100
    Content-Type: application/json
    
    {
      "id": 100,
      "bookId": 10
    }
    ```
    
    `Location` 헤더로 생성된 자원의 주소를 알려줄 수 있다.
    
    응답 본문에는 생성된 ID나 자원 정보를 포함할 수 있지만, 본문이 반드시 필요한 것은 아니다.
    
    또한 모든 POST 요청이 201이어야 하는 것은 아니다. POST는 생성 이외의 처리에도 사용된다.
    
    ---
    
    ## 204 No Content
    
    > 요청은 성공했지만 **응답 본문을 보내지 않음**을 나타낸다.
    > 
    
    ```json
    DELETE /bookmarks/100
    ```
    
    ```json
    HTTP/1.1 204 No Content
    ```
    
    204 응답에는 JSON 본문을 함께 보내면 안 된다.
    
    ```json
    204 + {"message": "삭제 성공"}
    → 적절하지 않음
    ```
    
    성공 메시지를 본문에 전달하고 싶다면 200 등 본문을 허용하는 응답을 선택할 수 있다.
    
    프론트엔드도 204 응답에 무조건 `response.json()`을 호출하지 않아야 한다.
    
    ---
    
    ## 409 Conflict
    
    > 요청이 대상 자원의 **현재 상태와 충돌하여 완료되지 못했음**을 나타낸다.
    > 
    
    예를 들어 같은 사용자가 이미 등록한 북마크를 다시 등록하는 요청을 생각할 수 있다.
    
    ```json
    HTTP/1.1 409 Conflict
    Content-Type: application/json
    
    {
      "code": "BOOKMARK_ALREADY_EXISTS",
      "message": "이미 북마크한 도서입니다."
    }
    ```
    
    다만 중복 요청을 반드시 409로 처리해야 하는 것은 아니다.
    
    API가 “이미 등록되어 있어도 원하는 상태가 충족되었으므로 성공”이라고 설계되었다면 기존 결과를 반환하는 방식도 가능하다.
    
    → 상태 코드는 **HTTP 의미와 API 계약에 맞게 선택**해야 하며, 모든 DB 오류를 409로 바꾸어서는 안 된다.
    
    ---
    
    ## NestJS에서 표현하기
    
    다음은 Controller 메서드 일부를 보여주는 TypeScript 예시이다.
    
    ```tsx
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() dto: CreateBookmarkDto) {
      return this.bookmarksService.create(dto);
    }
    ```
    
    ```tsx
    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(
      @Param("id", ParseIntPipe) id: number,
    ): Promise<void> {
      await this.bookmarksService.remove(id);
    }
    ```
    
    충돌 상황은 다음처럼 표현할 수 있다.
    
    ```tsx
    throw new ConflictException({
      code: "BOOKMARK_ALREADY_EXISTS",
      message: "이미 북마크한 도서입니다.",
    });
    ```
    
    성공 응답과 오류 응답은 **처리 결과를 정확하게 전달하도록** 구분해야 한다.
    
- UNIQUE 제약 조건과 동시성
    
    ## UNIQUE 제약 조건
    
    > 컬럼 또는 컬럼 조합의 값이 **중복 저장되지 않도록 DB에서 보장하는 제약조건**
    > 
    
    이메일 중복을 제한하려면 다음처럼 사용할 수 있다.
    
    ```sql
    CREATE TABLE app_user (
        user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL,
    
        CONSTRAINT uq_app_user_email
            UNIQUE (email)
    );
    ```
    
    북마크에서는 사용자와 도서의 조합을 제한할 수 있다.
    
    ```sql
    CONSTRAINT uq_bookmark_user_book
        UNIQUE (user_id, book_id)
    ```
    
    → 사용자 한 명이 같은 도서를 두 번 등록하지 못하도록 함
    
    MySQL에서 NULL을 허용하는 UNIQUE 컬럼은 여러 NULL을 허용할 수 있으므로, 값이 필수라면 `NOT NULL`도 지정해야 한다.
    
    ---
    
    ## 중복 조회만으로 충분하지 않은 이유
    
    다음 로직은 자연스러워 보인다.
    
    ```tsx
    const existing = await userRepository.findOneBy({
      email: dto.email,
    });
    
    if (existing) {
      throw new ConflictException(
        "이미 사용 중인 이메일입니다.",
      );
    }
    
    await userRepository.save(
      userRepository.create({
        email: dto.email,
      }),
    );
    ```
    
    하지만 두 요청이 동시에 실행되면 문제가 생길 수 있다.
    
    | 순서 | 요청 A | 요청 B |
    | --- | --- | --- |
    | 1 | 이메일 없음 확인 |  |
    | 2 |  | 이메일 없음 확인 |
    | 3 | 회원 저장 |  |
    | 4 |  | 같은 이메일로 회원 저장 |
    
    두 요청 모두 조회 시점에는 “중복 없음”이라는 결과를 얻을 수 있다.
    
    이처럼 실행 순서에 따라 결과가 달라지는 문제를 경쟁 상태(Race Condition)라고 한다.
    
    ---
    
    ## UNIQUE가 동시 요청을 처리하는 역할
    
    UNIQUE 제약이 있으면 DB는 충돌하는 값이 모두 저장되는 것을 허용하지 않는다.
    
    ```
    요청 A → 같은 이메일 저장 시도
    요청 B → 같은 이메일 저장 시도
                  ↓
    DB가 UNIQUE 규칙 검사
                  ↓
    둘 다 같은 값으로 커밋되는 것을 방지
    ```
    
    실제로는 다른 트랜잭션의 종료를 기다리거나, 중복 오류 또는 교착 상태가 발생할 수 있다. A가 롤백되면 B가 성공할 수도 있다.
    
    따라서 단순히 “먼저 요청한 쪽이 무조건 성공한다”기보다는 **최종 데이터의 중복을 DB가 막는다**고 이해하는 것이 정확하다.
    
    ---
    
    ## 트랜잭션으로 감싸면 해결될까?
    
    조회와 저장을 하나의 트랜잭션으로 묶었다고 자동으로 중복이 방지되는 것은 아니다.
    
    일반적인 격리 수준에서는 여러 트랜잭션이 같은 시점에 “없음”을 확인할 수 있다.
    
    ```
    트랜잭션
    → 여러 작업의 처리 단위와 격리 관리
    
    UNIQUE
    → 특정 값의 중복 금지 규칙 보장
    ```
    
    필요에 따라 잠금이나 격리 수준도 고려하지만, **데이터의 고유성 규칙은 UNIQUE로 명시하는 것이 중요**하다.
    
    ---
    
    ## 애플리케이션에서 할 일
    
    ```
    필요하면 사전 중복 조회
              ↓
    DB 저장 시도
              ↓
    실제 중복 제약 위반 확인
              ↓
    API 계약에 맞는 오류로 변환
    ```
    
    오류를 구분할 때는 다음을 주의해야 한다.
    
    - DB 오류 코드와 위반한 제약조건을 확인한다.
    - 연결 실패나 문법 오류를 중복 오류로 처리하지 않는다.
    - DB의 내부 SQL 메시지를 그대로 사용자에게 노출하지 않는다.
    - 트랜잭션 실패 후 롤백 등 필요한 정리를 수행한다.
    
    또한 ORM의 UNIQUE 선언만 작성하고 실제 DB 스키마에 적용하지 않았다면 제약이 보장되지 않는다. 마이그레이션 등으로 **DB에 제약조건이 생성되었는지** 확인해야 한다.
    
- @RestControllerAdvice / Exception Filter
    
    ## 공통 예외 처리가 필요한 이유
    
    > 여러 Controller에서 발생하는 예외를 **일관된 HTTP 상태와 응답 형식으로 변환**하기 위해서이다.
    > 
    
    각 Controller에서 오류 응답을 따로 작성하면 형식이 달라질 수 있다.
    
    ```json
    {
      "message": "이미 북마크했습니다."
    }
    ```
    
    ```json
    {
      "error": "중복입니다."
    }
    ```
    
    공통 처리에서는 다음과 같은 계약으로 통일할 수 있다.
    
    ```json
    {
      "code": "BOOKMARK_ALREADY_EXISTS",
      "message": "이미 북마크한 도서입니다."
    }
    ```
    
    ---
    
    ## Spring의 `@RestControllerAdvice`
    
    > 여러 Controller에 적용할 **공통 예외 처리 등을 정의하는 애너테이션**
    > 
    
    `@RestControllerAdvice`는 `@ControllerAdvice`에 응답 본문 처리를 위한 `@ResponseBody` 성격이 결합된 것이다.
    
    예외별 처리는 `@ExceptionHandler`로 작성한다.
    
    ```tsx
    @RestControllerAdvice
    public class GlobalExceptionHandler {
    
        @ExceptionHandler(
            BookmarkAlreadyExistsException.class
        )
        public ResponseEntity<ErrorResponse>
        handleBookmarkConflict(
            BookmarkAlreadyExistsException exception
        ) {
            return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(
                    "BOOKMARK_ALREADY_EXISTS",
                    "이미 북마크한 도서입니다."
                ));
        }
    
        public record ErrorResponse(
            String code,
            String message
        ) {}
    }
    ```
    
    예시의 `BookmarkAlreadyExistsException`은 애플리케이션에서 정의한 사용자 지정 예외이다.
    
    ```
    Service 등에서 예외 발생
              ↓
    Spring MVC의 예외 처리 흐름
              ↓
    일치하는 @ExceptionHandler 선택
              ↓
    HTTP 상태와 오류 본문 반환
    ```
    
    다만 서버의 모든 예외를 잡는 기능은 아니다. Servlet Filter나 보안 필터, 별도 비동기 작업에서 발생한 예외는 발생 위치에 맞는 처리가 필요할 수 있다.
    
    ---
    
    ## NestJS의 Exception Filter
    
    > NestJS 요청 처리 중 발생한 예외를 받아 **응답과 로깅 방식을 제어하는 기능**
    > 
    
    NestJS에는 기본 예외 처리 기능이 있다.
    
    ```tsx
    throw new NotFoundException(
      "도서를 찾을 수 없습니다.",
    );
    ```
    
    이런 HTTP 예외는 기본 처리만으로도 해당 상태 코드의 응답으로 변환된다.
    
    공통 응답 구조를 더 세밀하게 관리하려면 사용자 정의 Exception Filter를 사용할 수 있다.
    
    ### 사용자 정의 예외
    
    ```tsx
    export class BookmarkAlreadyExistsError
      extends Error {}
    ```
    
    ### Filter 예시
    
    다음은 **Express 어댑터 기준**이다.
    
    ```tsx
    import {
      ArgumentsHost,
      Catch,
      ExceptionFilter,
      HttpStatus,
    } from "@nestjs/common";
    import type { Response } from "express";
    
    @Catch(BookmarkAlreadyExistsError)
    export class BookmarkConflictFilter
      implements ExceptionFilter
    {
      catch(
        exception: BookmarkAlreadyExistsError,
        host: ArgumentsHost,
      ): void {
        const response = host
          .switchToHttp()
          .getResponse<Response>();
    
        response
          .status(HttpStatus.CONFLICT)
          .json({
            code: "BOOKMARK_ALREADY_EXISTS",
            message: "이미 북마크한 도서입니다.",
          });
      }
    }
    ```
    
    전역으로 등록할 수 있다.
    
    ```tsx
    app.useGlobalFilters(
      new BookmarkConflictFilter(),
    );
    ```
    
    Filter에서 NestJS의 의존성 주입이 필요하다면 모듈에서 `APP_FILTER` provider로 등록하는 방법을 사용할 수 있다.
    
    ---
    
    ## 두 방식 비교
    
    | 구분 | Spring | NestJS |
    | --- | --- | --- |
    | 공통 처리 구성 | `@RestControllerAdvice` | Exception Filter |
    | 처리할 예외 지정 | `@ExceptionHandler` | `@Catch()` |
    | 응답 구성 | `ResponseEntity` 등 | HTTP 응답 객체·어댑터 등 |
    | 주요 목적 | 예외를 공통 HTTP 응답으로 변환 | 예외를 공통 HTTP 응답으로 변환 |
    
    이 기능들은 예외를 없애거나, 실패한 DB 작업을 자동으로 성공시키는 장치가 아니다.
    
    ```
    검증
    → 잘못된 입력을 발견
    
    Service·Domain
    → 업무 규칙 위반을 판단
    
    DB 제약
    → 데이터 무결성을 보장
    
    공통 예외 처리
    → 발생한 실패를 클라이언트가 이해할 응답으로 변환
    ```
    
    예상하지 못한 오류는 서버 로그에 필요한 정보를 남기고, 클라이언트에는 내부 SQL·비밀번호·스택 추적 같은 민감한 정보가 포함되지 않도록 응답해야 한다.