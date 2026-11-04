# 워크북 백엔드 키워드 정리 (2)

## 목차

- [Bean Validation과 @Valid](#bean-validation과-valid)
- [class-validator와 ValidationPipe](#class-validator와-validationpipe)
- [bcrypt와 salt round](#bcrypt와-salt-round)
- [HTTP 201 Created / 204 No Content / 409 Conflict](#http-201-created--204-no-content--409-conflict)
- [UNIQUE 제약 조건과 동시성](#unique-제약-조건과-동시성)
- [@RestControllerAdvice / Exception Filter](#restcontrolleradvice--exception-filter)

---

## Bean Validation과 @Valid

#### 유효성 검증 (Validation)

- 클라이언트가 보낸 데이터가 **서버가 정한 규칙에 맞는지 확인**하는 것
- 예: 이메일 형식인지, 비밀번호가 8자 이상인지, 필수 값이 비어 있지 않은지
- 잘못된 데이터가 비즈니스 로직과 DB까지 들어가기 전에 **요청 입구에서 걸러내는 역할**

#### Bean Validation

- 자바 객체(Bean)의 필드에 **어노테이션으로 검증 규칙을 선언**하는 자바 표준 명세
- 현재 이름은 **Jakarta Bean Validation** (Spring Boot 3부터 패키지가 `javax.validation` → `jakarta.validation`)
- 명세(인터페이스)일 뿐이고, 실제 검증은 구현체인 **Hibernate Validator**가 수행
- Spring Boot에서는 `spring-boot-starter-validation` 의존성을 추가하면 사용 가능

```groovy
// build.gradle
implementation 'org.springframework.boot:spring-boot-starter-validation'
```

#### @Valid

- `jakarta.validation` 패키지의 어노테이션으로, **"이 객체에 선언된 검증 규칙을 실행하라"** 고 지시하는 것
- 컨트롤러 메서드의 파라미터에 붙이면, 요청 데이터를 객체로 변환한 뒤 **메서드 실행 전에 검증**
- DTO에 검증 어노테이션을 붙여도 **`@Valid`가 없으면 검증이 실행되지 않음**

#### @Validated

- Spring이 제공하는 어노테이션으로, `@Valid`의 기능에 **검증 그룹(groups)** 지정 기능을 더한 것
- 클래스에 붙이면 `@PathVariable`, `@RequestParam` 같은 **메서드 파라미터 자체의 검증**에도 사용

### 주요 검증 어노테이션

| 어노테이션 | 검증 내용 |
| --- | --- |
| `@NotNull` | `null`이 아니어야 함 (빈 문자열 `""`은 통과) |
| `@NotEmpty` | `null`이 아니고 길이가 0이 아니어야 함 (공백 `" "`은 통과) |
| `@NotBlank` | `null`이 아니고 공백을 제외한 문자가 1개 이상 (문자열 전용) |
| `@Size(min, max)` | 문자열 길이, 컬렉션 크기 범위 |
| `@Email` | 이메일 형식 |
| `@Pattern(regexp)` | 정규식과 일치 |
| `@Min`, `@Max` | 숫자 최솟값, 최댓값 |
| `@Positive`, `@PositiveOrZero` | 양수, 0 이상 |
| `@Past`, `@Future` | 과거 날짜, 미래 날짜 |

#### @NotNull / @NotEmpty / @NotBlank 비교

| 입력값 | `@NotNull` | `@NotEmpty` | `@NotBlank` |
| --- | --- | --- | --- |
| `null` | ❌ | ❌ | ❌ |
| `""` | ⭕ | ❌ | ❌ |
| `" "` | ⭕ | ⭕ | ❌ |
| `"woods"` | ⭕ | ⭕ | ⭕ |

- 문자열 필수 값에는 보통 `@NotBlank`를 사용

### 사용 예시

#### DTO에 규칙 선언

```java
public record SignUpRequest(
    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "이메일 형식이 올바르지 않습니다.")
    String email,

    @NotBlank(message = "비밀번호는 필수입니다.")
    @Size(min = 8, max = 20, message = "비밀번호는 8~20자여야 합니다.")
    String password,

    @NotBlank(message = "닉네임은 필수입니다.")
    @Size(max = 10, message = "닉네임은 10자 이하여야 합니다.")
    String nickname
) {}
```

#### 컨트롤러에서 @Valid로 검증 실행

```java
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<UserResponse> signUp(@Valid @RequestBody SignUpRequest request) {
        UserResponse response = userService.signUp(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
```

#### 중첩 객체 검증

- DTO 안에 다른 객체가 있으면, 그 필드에도 `@Valid`를 붙여야 **내부 객체까지 검증**됨

```java
public record OrderRequest(
    @NotNull Long productId,
    @Valid @NotNull AddressRequest address   // AddressRequest 안의 규칙도 검증
) {}
```

### 검증 실패 시 동작

| 검증 대상 | 발생하는 예외 | 기본 응답 |
| --- | --- | --- |
| `@Valid @RequestBody` | `MethodArgumentNotValidException` | 400 Bad Request |
| `@Validated` 클래스의 `@PathVariable`, `@RequestParam` | `ConstraintViolationException` | 처리하지 않으면 500 |
| Spring 6.1 이상 메서드 파라미터 검증 | `HandlerMethodValidationException` | 400 Bad Request |

- 기본 에러 응답에는 어떤 필드가 왜 실패했는지가 원하는 형식으로 담기지 않으므로, 보통 `@RestControllerAdvice`에서 예외를 잡아 **일관된 에러 응답 형식**으로 변환함

### 검증 흐름

```
HTTP 요청 (JSON)
   │
   ▼  Jackson이 JSON → SignUpRequest 객체로 변환
   │
   ▼  @Valid → Hibernate Validator가 어노테이션 규칙 검사
   │
   ├─ 실패 → MethodArgumentNotValidException → 400 응답 (컨트롤러 메서드 실행 X)
   │
   └─ 성공 → 컨트롤러 메서드 실행
```

---

## class-validator와 ValidationPipe

#### Pipe (NestJS)

- 요청이 **컨트롤러 메서드(라우트 핸들러)에 도착하기 직전**에 실행되어, 메서드 인자를 처리하는 클래스
- 두 가지 역할
  - **변환(transformation)**: 입력값을 원하는 타입으로 바꿈 (예: 문자열 `"1"` → 숫자 `1`)
  - **검증(validation)**: 입력값이 올바른지 확인하고, 틀리면 예외를 던짐
- 내장 파이프: `ValidationPipe`, `ParseIntPipe`, `ParseUUIDPipe`, `DefaultValuePipe` 등

#### class-validator

- 클래스의 속성에 **데코레이터로 검증 규칙을 선언**하는 라이브러리
- NestJS 전용이 아닌 독립 라이브러리지만, NestJS에서 DTO 검증에 표준처럼 사용됨

#### class-transformer

- 일반 객체(plain object)를 **클래스 인스턴스로 변환**하는 라이브러리
- HTTP 요청 body는 단순한 JS 객체라서 데코레이터 정보가 없음 → 클래스 인스턴스로 바꿔야 class-validator가 규칙을 읽을 수 있음

#### ValidationPipe

- NestJS 내장 파이프로, **class-transformer로 DTO 인스턴스를 만든 뒤 class-validator로 검증**하는 파이프
- 검증에 실패하면 `BadRequestException`(400)을 던져서 **컨트롤러 메서드가 실행되지 않게** 함

```bash
npm i class-validator class-transformer
```

### 주요 데코레이터

| 데코레이터 | 검증 내용 |
| --- | --- |
| `@IsString()`, `@IsInt()`, `@IsBoolean()` | 타입 확인 |
| `@IsNotEmpty()` | `''`, `null`, `undefined`가 아니어야 함 |
| `@IsEmail()` | 이메일 형식 |
| `@Length(min, max)`, `@MinLength()`, `@MaxLength()` | 문자열 길이 |
| `@Min()`, `@Max()` | 숫자 범위 |
| `@Matches(regex)` | 정규식과 일치 |
| `@IsEnum(enum)` | enum 값 중 하나 |
| `@IsOptional()` | 값이 `null`/`undefined`이면 나머지 검증을 건너뜀 |
| `@ValidateNested()` | 중첩 객체 검증 (`@Type()`과 함께 사용) |

#### Bean Validation과 대응 관계

| Bean Validation (Spring) | class-validator (NestJS) |
| --- | --- |
| `@NotBlank` | `@IsNotEmpty()` + `@IsString()` |
| `@Email` | `@IsEmail()` |
| `@Size(min, max)` | `@Length(min, max)` |
| `@Min`, `@Max` | `@Min()`, `@Max()` |
| `@Pattern` | `@Matches()` |
| `@Valid` (중첩) | `@ValidateNested()` + `@Type()` |
| `@Valid` (검증 실행) | `ValidationPipe` |

### 사용 예시

#### DTO에 규칙 선언

```ts
import { IsEmail, IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';

export class SignUpDto {
  @IsEmail({}, { message: '이메일 형식이 올바르지 않습니다.' })
  email: string;

  @IsString()
  @Length(8, 20, { message: '비밀번호는 8~20자여야 합니다.' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: '닉네임은 필수입니다.' })
  @MaxLength(10)
  nickname: string;
}
```

- DTO는 반드시 **class**로 선언해야 함
  - TypeScript의 `interface`와 타입은 컴파일 후 사라져서 런타임에 데코레이터 정보가 남지 않음

#### 전역으로 ValidationPipe 적용

```ts
// main.ts
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // DTO에 없는 속성은 제거
      forbidNonWhitelisted: true,   // DTO에 없는 속성이 있으면 400 에러
      transform: true,              // 요청 값을 DTO 인스턴스·선언한 타입으로 변환
    }),
  );

  await app.listen(3000);
}
```

#### 컨트롤러

```ts
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  signUp(@Body() dto: SignUpDto) {   // 전역 ValidationPipe가 자동으로 검증
    return this.userService.signUp(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {   // 문자열 → 숫자 변환 + 검증
    return this.userService.findOne(id);
  }
}
```

#### 중첩 객체 검증

```ts
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class CreateOrderDto {
  @IsInt()
  productId: number;

  @ValidateNested()
  @Type(() => AddressDto)   // 중첩 객체를 AddressDto 인스턴스로 변환해야 검증 가능
  address: AddressDto;
}
```

### ValidationPipe 주요 옵션

| 옵션 | 의미 |
| --- | --- |
| `whitelist` | DTO에 데코레이터가 없는 속성을 **자동으로 제거** |
| `forbidNonWhitelisted` | DTO에 없는 속성이 들어오면 제거 대신 **400 에러** (`whitelist: true`와 함께 사용) |
| `transform` | 검증 후 컨트롤러에 **DTO 클래스 인스턴스**를 넘기고, 경로·쿼리 파라미터를 선언 타입으로 변환 |
| `transformOptions: { enableImplicitConversion: true }` | 데코레이터 없이도 TS 타입 기준으로 암묵적 형 변환 |
| `disableErrorMessages` | 에러 응답에 상세 메시지를 넣지 않음 (운영 환경용) |

- `whitelist`는 클라이언트가 `role: 'ADMIN'`처럼 **허용하지 않은 필드를 몰래 넣어 보내는 것**(Mass Assignment)을 막는 데 중요함

### 검증 실패 응답 (기본)

```json
{
  "statusCode": 400,
  "message": [
    "이메일 형식이 올바르지 않습니다.",
    "비밀번호는 8~20자여야 합니다."
  ],
  "error": "Bad Request"
}
```

### 검증 흐름

```
HTTP 요청 (JSON)
   │
   ▼  ValidationPipe
   │    ① class-transformer: plain object → SignUpDto 인스턴스
   │    ② class-validator: 데코레이터 규칙 검사
   │
   ├─ 실패 → BadRequestException → 400 응답 (컨트롤러 메서드 실행 X)
   │
   └─ 성공 → 컨트롤러 메서드에 dto 전달
```

---

## bcrypt와 salt round

#### 암호화 (Encryption)와 해시 (Hash)

| 구분 | 암호화 | 해시 |
| --- | --- | --- |
| 방향 | **양방향**: 키가 있으면 원래 값으로 복호화 가능 | **단방향**: 원래 값으로 되돌릴 수 없음 |
| 용도 | 나중에 원문이 다시 필요한 데이터 (개인정보 등) | 원문이 필요 없고 **일치 여부만 확인**하면 되는 데이터 (비밀번호) |

- 비밀번호는 **해시로 저장**함 → DB가 유출되어도 원래 비밀번호를 알기 어렵게 하기 위해
- 로그인 시에는 입력한 비밀번호를 같은 방식으로 해시해서 **저장된 해시와 비교**

#### 솔트 (Salt)

- 해시하기 전에 비밀번호에 덧붙이는 **사용자마다 다른 무작위 문자열**
- 솔트가 없으면 같은 비밀번호는 항상 같은 해시가 됨 → 문제 발생
  - 같은 해시를 가진 사용자들이 **같은 비밀번호를 쓴다는 것**이 드러남
  - 미리 계산해 둔 "비밀번호 → 해시" 표(**레인보우 테이블**)로 원래 비밀번호를 바로 찾을 수 있음
- 솔트를 붙이면 같은 비밀번호라도 **해시 결과가 매번 달라짐**

```
password123 + salt(a8Fk...) → 해시 A
password123 + salt(Qz2p...) → 해시 B   ← 같은 비밀번호인데 결과가 다름
```

#### bcrypt

- 비밀번호 저장을 위해 만들어진 **해시 함수**
- 특징
  - **솔트를 자동으로 생성**해서 해시 결과 안에 함께 저장 → 솔트 컬럼을 따로 둘 필요 없음
  - **일부러 느리게** 동작하도록 설계됨
  - 느린 정도를 **cost(salt round)** 로 조절할 수 있음 → 컴퓨터가 빨라지면 cost를 올려 대응

#### salt round (cost factor, work factor)

- bcrypt가 해시를 계산할 때 **내부 연산을 반복하는 강도**를 나타내는 숫자
- 반복 횟수는 **2^cost** → cost가 1 오르면 계산 시간이 **약 2배**
- 이름은 "salt round"지만 솔트를 여러 번 만드는 게 아니라 **해시 연산의 반복 강도**를 뜻함

### 왜 느린 해시를 쓰는가

- SHA-256 같은 일반 해시는 **매우 빠르게** 계산되도록 설계됨 → 공격자가 GPU로 초당 수십억 개의 비밀번호를 대입해볼 수 있음
- bcrypt는 해시 한 번에 수십~수백 ms가 걸리게 만들어 **무차별 대입 공격(Brute Force)의 비용을 크게 높임**
- 정상 사용자는 로그인할 때 한 번만 계산하므로 체감 차이가 거의 없음

### bcrypt 해시 구조

```
$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
 │   │  └───────────┬──────────┘└──────────────┬──────────────┘
 │   │       솔트 (22자)                  해시 값 (31자)
 │   └ cost (salt round) = 10
 └ 알고리즘 버전 (2a, 2b, 2y)
```

- 해시 문자열 안에 **버전, cost, 솔트, 해시 값이 모두 포함** → 비교할 때 이 정보를 꺼내서 같은 조건으로 다시 계산
- 결과 길이는 항상 **60자** → DB 컬럼은 `VARCHAR(60)` 이상으로 설정

### salt round 값 정하기

| cost | 반복 횟수 | 계산 시간 (대략) |
| --- | --- | --- |
| 8 | 256 | 수 ms |
| 10 | 1,024 | 수십 ms ~ 100ms 내외 |
| 12 | 4,096 | 수백 ms |
| 14 | 16,384 | 1초 이상 |

- 시간은 서버 성능에 따라 다름
- 일반적으로 **10~12**를 많이 사용하고, OWASP 권장 최솟값은 **10**
- 기준: 서버에서 해시 1회에 **약 100ms~수백 ms** 정도 걸리는 값
  - 너무 낮으면 공격에 약하고, 너무 높으면 로그인·회원가입 요청마다 CPU를 많이 써서 서버가 느려짐
- 나중에 cost를 올려도, 기존 해시에는 각자의 cost가 저장되어 있어서 **기존 사용자도 정상적으로 로그인 가능**

### 사용 예시

#### NestJS (bcrypt 라이브러리)

```bash
npm i bcrypt
npm i -D @types/bcrypt
```

```ts
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// 회원가입: 해시해서 저장
async signUp(dto: SignUpDto) {
  const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);
  return this.prisma.user.create({
    data: { email: dto.email, password: hashedPassword, nickname: dto.nickname },
  });
}

// 로그인: 입력값과 저장된 해시 비교
async login(dto: LoginDto) {
  const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
  const isMatch = user && (await bcrypt.compare(dto.password, user.password));

  if (!isMatch) {
    throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
  }
  // 토큰 발급 등
}
```

#### Spring (Spring Security)

```java
@Configuration
public class SecurityConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);   // strength = salt round (기본값 10)
    }
}
```

```java
String hashed = passwordEncoder.encode(rawPassword);               // 회원가입
boolean isMatch = passwordEncoder.matches(rawPassword, hashed);    // 로그인
```

### 사용할 때 지켜야 할 점

- 비교는 반드시 **`compare` / `matches`** 로 해야 함
  - 같은 비밀번호도 솔트 때문에 해시가 매번 달라서 `hash(입력값) === 저장된 해시`로는 비교할 수 없음
- 해시는 CPU를 많이 쓰므로 **비동기 함수(`bcrypt.hash`, `bcrypt.compare`)** 를 사용 (`hashSync`는 이벤트 루프를 막음)
- bcrypt는 입력값의 **앞 72바이트까지만** 사용함 → 비밀번호 최대 길이를 제한하는 것이 좋음
- 로그인 실패 메시지는 "이메일이 없음"과 "비밀번호 틀림"을 구분하지 않고 **하나의 메시지**로 응답 (가입된 이메일 노출 방지)
- 참고: 최근에는 **Argon2id**도 권장되는 비밀번호 해시 알고리즘으로 많이 쓰임

---

## HTTP 201 Created / 204 No Content / 409 Conflict

#### 201 Created

- 요청이 성공했고, 그 결과로 **새로운 리소스가 생성됨**
- 주로 `POST` 요청(회원가입, 게시글 작성)의 성공 응답
- 생성된 리소스의 위치를 **`Location` 헤더**에 담아주는 것이 권장됨
- 응답 body에는 보통 생성된 리소스 정보를 담음

```
HTTP/1.1 201 Created
Location: /posts/42
Content-Type: application/json

{ "id": 42, "title": "첫 글", "createdAt": "2026-11-04T19:14:00Z" }
```

#### 204 No Content

- 요청이 성공했지만 **응답 body로 보낼 내용이 없음**
- 주로 `DELETE`, 또는 결과를 돌려줄 필요가 없는 `PUT`/`PATCH`의 성공 응답
- **body를 포함하면 안 됨**

```
HTTP/1.1 204 No Content
```

#### 409 Conflict

- 요청이 **서버에 있는 리소스의 현재 상태와 충돌**해서 처리할 수 없음
- 요청 형식 자체는 올바르지만, 지금 상태에서는 수행할 수 없는 경우
- 응답 body에 **무엇과 충돌했는지** 알려주는 것이 좋음

```
HTTP/1.1 409 Conflict
Content-Type: application/json

{ "code": "USER_EMAIL_DUPLICATED", "message": "이미 가입된 이메일입니다." }
```

### 사용 상황

| 코드 | 사용 상황 |
| --- | --- |
| **201** | 회원가입, 게시글·댓글 작성, 주문 생성, 파일 업로드 |
| **204** | 게시글 삭제, 로그아웃, 좋아요 취소, 응답 데이터가 필요 없는 수정 |
| **409** | 이미 가입된 이메일·닉네임, 이미 누른 좋아요, 이미 예약된 시간대, 동시 수정 충돌(버전 불일치), 이미 처리된 주문 취소 |

### 비슷한 상태 코드와의 차이

#### 200 OK vs 201 Created

| 구분 | 200 OK | 201 Created |
| --- | --- | --- |
| 의미 | 요청 성공 (일반) | 요청 성공 + **새 리소스 생성** |
| 사용 | 조회, 수정 | 생성 |

#### 200 OK vs 204 No Content

| 구분 | 200 OK | 204 No Content |
| --- | --- | --- |
| body | 있음 | **없음** |
| 사용 | 결과 데이터를 돌려줄 때 | 결과 데이터가 필요 없을 때 |

#### 400 Bad Request vs 409 Conflict vs 422 Unprocessable Content

| 코드 | 의미 | 예시 |
| --- | --- | --- |
| **400** | 요청 자체가 잘못됨 (형식·필수 값 오류) | 이메일 형식이 틀림, 필수 필드 누락 |
| **409** | 요청은 올바르지만 **현재 리소스 상태와 충돌** | 이미 가입된 이메일 |
| **422** | 형식은 맞지만 **의미적으로 처리할 수 없음** | 시작일이 종료일보다 늦음 (팀에 따라 400으로 통일하기도 함) |

- 같은 이메일로 가입 요청이 오는 경우: 요청 형식은 정상이고, **이미 존재하는 데이터와 충돌**하는 것이므로 409가 적절

#### 404 Not Found vs 409 Conflict

- 404: 대상 리소스가 **없음** (존재하지 않는 게시글 수정)
- 409: 대상은 있지만 **상태가 맞지 않음** (이미 취소된 주문을 다시 취소)

### 서버에서 응답하기

#### Spring

```java
@PostMapping
public ResponseEntity<PostResponse> create(@Valid @RequestBody PostCreateRequest request) {
    PostResponse response = postService.create(request);
    URI location = URI.create("/posts/" + response.id());
    return ResponseEntity.created(location).body(response);      // 201 + Location
}

@DeleteMapping("/{id}")
public ResponseEntity<Void> delete(@PathVariable Long id) {
    postService.delete(id);
    return ResponseEntity.noContent().build();                    // 204
}
```

```java
// 409: 예외를 던지고 @RestControllerAdvice에서 409로 변환
if (userRepository.existsByEmail(request.email())) {
    throw new BusinessException(ErrorCode.USER_EMAIL_DUPLICATED);   // HttpStatus.CONFLICT
}
```

#### NestJS

```ts
@Controller('posts')
export class PostController {
  @Post()                       // POST는 기본 응답 코드가 201
  create(@Body() dto: CreatePostDto) {
    return this.postService.create(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)   // 204로 변경
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.postService.remove(id);
  }
}
```

```ts
// 409
throw new ConflictException('이미 가입된 이메일입니다.');
```

- NestJS는 `POST`의 기본 응답 코드가 **201**, 나머지 메서드는 **200**

---

## UNIQUE 제약 조건과 동시성

#### UNIQUE 제약 조건

- 지정한 컬럼(또는 컬럼 조합)의 값이 테이블 안에서 **중복되지 않도록 DB가 보장**하는 제약
- 위반하는 INSERT/UPDATE는 DB가 에러를 내고 거부함
- 대부분의 DB에서 UNIQUE 제약을 만들면 **유니크 인덱스가 함께 생성**됨

#### 동시성 (Concurrency)

- 여러 요청이 **같은 시점에 함께 처리**되는 것
- 웹 서버는 여러 사용자의 요청을 동시에 처리하므로, 같은 데이터에 **동시에 접근하는 상황**이 항상 생길 수 있음

#### 경쟁 상태 (Race Condition)

- 여러 요청이 같은 데이터를 다룰 때, **실행 순서·타이밍에 따라 결과가 달라지는 상황**
- 의도하지 않은 결과(중복 데이터, 잘못된 값)가 생길 수 있음

#### Check-Then-Act

- "먼저 **확인(check)** 하고, 조건이 맞으면 **실행(act)** 하는" 코드 패턴
- 예: 이메일이 이미 있는지 조회 → 없으면 회원 저장
- 확인과 실행 사이에 **다른 요청이 끼어들 수 있어서** 경쟁 상태가 발생하기 쉬운 패턴

### 애플리케이션 코드의 중복 검사만으로 부족한 이유

```ts
async signUp(dto: SignUpDto) {
  const exists = await this.prisma.user.findUnique({ where: { email: dto.email } }); // ① check
  if (exists) throw new ConflictException('이미 가입된 이메일입니다.');
  return this.prisma.user.create({ data: dto });                                     // ② act
}
```

- 같은 이메일로 **거의 동시에 두 요청**이 들어오면 (회원가입 버튼 따닥 클릭, 네트워크 재시도 등)

```
요청 A: ① 조회 → 없음 ──────────────▶ ② 저장 성공
요청 B:     ① 조회 → 없음 ──────────────▶ ② 저장 성공   ← 같은 이메일 회원 2명!
```

- 두 요청 모두 ①을 실행하는 시점에는 데이터가 없으므로 검사를 통과함
- 서버가 여러 대(인스턴스)여도 같은 문제가 발생 → **애플리케이션 코드만으로는 막을 수 없음**

#### 트랜잭션만으로도 막을 수 없다

- 트랜잭션으로 ①과 ②를 묶어도, 일반적인 격리 수준(READ COMMITTED, REPEATABLE READ)에서는 **아직 존재하지 않는 행**을 조회하는 SELECT가 다른 트랜잭션의 INSERT를 막지 못함
- 가장 높은 격리 수준(SERIALIZABLE)이나 잠금(`SELECT ... FOR UPDATE`)을 쓰면 막을 수 있지만, 성능 저하나 데드락 위험이 커짐

### 해결: UNIQUE 제약을 최종 방어선으로 둔다

- DB는 UNIQUE 인덱스에 값을 넣을 때 **한 번에 하나씩 원자적으로 확인**하므로, 동시에 들어와도 **하나만 성공**하고 나머지는 에러가 남

```
요청 A: INSERT email='woods@x.com' → 성공
요청 B: INSERT email='woods@x.com' → UNIQUE 위반 에러로 거부
```

- 서버는 이 에러를 잡아서 **409 Conflict**로 응답

#### 권장 구조: 사전 검사 + UNIQUE 제약

| 단계 | 역할 |
| --- | --- |
| 사전 검사 (조회) | 대부분의 중복을 빠르게 걸러내고 **친절한 에러 메시지** 제공 |
| UNIQUE 제약 | 사전 검사를 통과한 동시 요청까지 **DB가 최종적으로 차단** |
| 예외 처리 | UNIQUE 위반 에러를 **409 응답**으로 변환 |

### UNIQUE 위반 에러 처리

| DB / ORM | UNIQUE 위반 에러 |
| --- | --- |
| MySQL | 에러 코드 `1062` (`ER_DUP_ENTRY`) |
| PostgreSQL | SQLSTATE `23505` (`unique_violation`) |
| Prisma | `P2002` (`PrismaClientKnownRequestError`) |
| Spring (JPA) | `DataIntegrityViolationException` |

#### NestJS + Prisma

```ts
async signUp(dto: SignUpDto) {
  const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
  if (exists) throw new ConflictException('이미 가입된 이메일입니다.');

  try {
    return await this.prisma.user.create({ data: { ...dto, password: hashed } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw new ConflictException('이미 가입된 이메일입니다.');   // 동시 요청으로 통과한 경우
    }
    throw e;
  }
}
```

#### Spring + JPA

```java
@Transactional
public UserResponse signUp(SignUpRequest request) {
    if (userRepository.existsByEmail(request.email())) {
        throw new BusinessException(ErrorCode.USER_EMAIL_DUPLICATED);
    }
    try {
        User user = userRepository.saveAndFlush(User.create(request));   // 즉시 INSERT 실행
        return UserResponse.from(user);
    } catch (DataIntegrityViolationException e) {
        throw new BusinessException(ErrorCode.USER_EMAIL_DUPLICATED);
    }
}
```

- JPA의 `save()`는 INSERT를 바로 실행하지 않고 **flush(보통 트랜잭션 커밋) 시점**에 실행할 수 있음
  - 그러면 예외가 메서드 밖(커밋 시점)에서 발생해 위의 `try-catch`에 잡히지 않음
  - 그래서 `saveAndFlush()`로 즉시 실행하거나, `@RestControllerAdvice`에서 `DataIntegrityViolationException`을 전역으로 처리

### 중복을 에러 대신 처리하는 방법

- 중복이 정상적인 상황(이미 좋아요를 눌렀으면 그냥 성공 처리 등)이라면 **DB의 충돌 처리 문법**을 사용

| DB | 문법 | 동작 |
| --- | --- | --- |
| MySQL | `INSERT IGNORE` | 중복이면 무시 |
| MySQL | `INSERT ... ON DUPLICATE KEY UPDATE` | 중복이면 기존 행 수정 |
| PostgreSQL | `INSERT ... ON CONFLICT DO NOTHING` | 중복이면 무시 |
| PostgreSQL | `INSERT ... ON CONFLICT (...) DO UPDATE` | 중복이면 기존 행 수정 |

```sql
-- PostgreSQL: 이미 좋아요가 있으면 아무것도 하지 않음
INSERT INTO post_like (user_id, post_id)
VALUES (1, 10)
ON CONFLICT (user_id, post_id) DO NOTHING;
```

- Prisma의 `upsert`도 비슷한 목적이지만, 동시 요청 상황에서 UNIQUE 위반 에러가 날 수 있으므로 `P2002` 처리는 함께 해두는 것이 안전함

### UNIQUE 제약을 설계할 때 고려할 점

- **값 정규화**: `Woods@X.com`과 `woods@x.com`을 같은 이메일로 볼지 결정
  - 저장 전에 소문자로 통일하거나, DB collation(대소문자 구분 여부)을 확인
- **소프트 삭제(soft delete)**: 탈퇴 회원을 `deleted_at`으로만 표시하면 행이 남아 있어서 **같은 이메일로 재가입이 막힘**
  - 탈퇴 시 이메일 값을 변경하거나, 조건부 유니크 인덱스(PostgreSQL의 `WHERE deleted_at IS NULL`) 등을 고려
- **NULL 처리**: 대부분의 DB는 NULL끼리 같은 값으로 보지 않아서, NULL이 포함되면 중복이 허용됨 → 필요한 컬럼은 `NOT NULL` 지정

---

## @RestControllerAdvice / Exception Filter

#### 전역 예외 처리 (Global Exception Handling)

- 컨트롤러·서비스 곳곳에서 발생한 예외를 **한 곳에서 모아 처리**하고, **일관된 형식의 에러 응답**으로 변환하는 방식
- 각 메서드마다 try-catch로 응답을 만들지 않아도 됨
- 비즈니스 로직은 **예외를 던지기만** 하고, HTTP 응답 형태는 전역 처리기가 결정

#### @ExceptionHandler (Spring)

- 특정 예외가 발생했을 때 실행할 메서드를 지정하는 어노테이션
- 컨트롤러 안에 두면 **그 컨트롤러에서 발생한 예외만** 처리

#### @ControllerAdvice / @RestControllerAdvice (Spring)

- 여러 컨트롤러에 공통으로 적용할 기능(예외 처리 등)을 모아두는 클래스에 붙이는 어노테이션
- 이 클래스 안의 `@ExceptionHandler`는 **모든 컨트롤러에서 발생한 예외를 처리**
- `@RestControllerAdvice` = `@ControllerAdvice` + `@ResponseBody`
  - 반환 값을 뷰 이름이 아니라 **JSON 응답 body**로 변환 → REST API에서 사용

#### Exception Filter (NestJS)

- NestJS의 예외 처리 계층으로, **처리되지 않은 예외를 잡아서 클라이언트에 보낼 응답을 직접 만드는 클래스**
- `ExceptionFilter` 인터페이스를 구현하고, `@Catch()` 데코레이터로 **잡을 예외 타입**을 지정
- NestJS에는 기본 전역 예외 필터가 내장되어 있어서 `HttpException`은 자동으로 응답으로 변환되고, 알 수 없는 예외는 **500**으로 응답

### 왜 사용하는가

| 이유 | 내용 |
| --- | --- |
| 중복 제거 | 컨트롤러마다 반복되는 try-catch와 에러 응답 생성 코드를 한 곳으로 |
| 일관된 응답 형식 | 어떤 에러든 `{ code, message, ... }` 같은 **같은 구조**로 응답 → API 사용자가 처리하기 쉬움 |
| 관심사 분리 | 서비스는 비즈니스 규칙에 맞지 않으면 예외만 던지고, HTTP 상태 코드 결정은 전역 처리기가 담당 |
| 예외 변환 | 검증 실패, DB UNIQUE 위반 같은 **라이브러리·프레임워크 예외**를 적절한 상태 코드로 변환 |
| 보안 | 예상하지 못한 에러의 **스택 트레이스·SQL 같은 내부 정보**를 응답에 노출하지 않음 |
| 로깅 | 에러 로그를 한 곳에서 일관되게 기록 |

#### 일관된 에러 응답 형식 예시

```json
{
  "status": 409,
  "code": "USER_EMAIL_DUPLICATED",
  "message": "이미 가입된 이메일입니다.",
  "path": "/users",
  "timestamp": "2026-11-04T19:14:00Z"
}
```

### Spring: @RestControllerAdvice

#### 에러 코드와 커스텀 예외 정의

```java
@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "COMMON_400", "입력값이 올바르지 않습니다."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "USER_404", "사용자를 찾을 수 없습니다."),
    USER_EMAIL_DUPLICATED(HttpStatus.CONFLICT, "USER_409", "이미 가입된 이메일입니다."),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "COMMON_500", "서버 오류가 발생했습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;
}
```

```java
@Getter
public class BusinessException extends RuntimeException {
    private final ErrorCode errorCode;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}
```

```java
public record ErrorResponse(String code, String message, List<FieldError> errors) {
    public record FieldError(String field, String reason) {}

    public static ErrorResponse of(ErrorCode errorCode) {
        return new ErrorResponse(errorCode.getCode(), errorCode.getMessage(), List.of());
    }
}
```

#### 전역 예외 처리기

```java
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1) 직접 정의한 비즈니스 예외
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessException e) {
        ErrorCode code = e.getErrorCode();
        return ResponseEntity.status(code.getStatus()).body(ErrorResponse.of(code));
    }

    // 2) @Valid 검증 실패 → 400 + 필드별 에러
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException e) {
        List<ErrorResponse.FieldError> errors = e.getBindingResult().getFieldErrors().stream()
            .map(fe -> new ErrorResponse.FieldError(fe.getField(), fe.getDefaultMessage()))
            .toList();
        ErrorCode code = ErrorCode.INVALID_INPUT;
        return ResponseEntity.status(code.getStatus())
            .body(new ErrorResponse(code.getCode(), code.getMessage(), errors));
    }

    // 3) DB UNIQUE 위반 → 409
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrity(DataIntegrityViolationException e) {
        ErrorCode code = ErrorCode.USER_EMAIL_DUPLICATED;
        return ResponseEntity.status(code.getStatus()).body(ErrorResponse.of(code));
    }

    // 4) 예상하지 못한 모든 예외 → 500 (내부 정보는 로그로만)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e) {
        log.error("Unhandled exception", e);
        ErrorCode code = ErrorCode.INTERNAL_ERROR;
        return ResponseEntity.status(code.getStatus()).body(ErrorResponse.of(code));
    }
}
```

- 여러 핸들러가 해당되면 **가장 구체적인 예외 타입**의 핸들러가 선택됨 (`Exception`은 마지막 안전망)
- 위 예시는 `DataIntegrityViolationException`을 이메일 중복으로만 처리했지만, 실제로는 어떤 제약이 위반됐는지 구분이 필요할 수 있어 **서비스에서 비즈니스 예외로 바꿔 던지는 방식**이 더 명확함
- 적용 범위 지정: `@RestControllerAdvice(basePackages = "com.woods.api")`
- Spring 6부터는 RFC 9457 표준 에러 형식인 `ProblemDetail`을 응답으로 사용할 수도 있음

### NestJS: Exception Filter

#### NestJS 기본 예외

- `HttpException`과 이를 상속한 내장 예외를 던지면 기본 필터가 자동으로 응답을 만듦

| 예외 | 상태 코드 |
| --- | --- |
| `BadRequestException` | 400 |
| `UnauthorizedException` | 401 |
| `ForbiddenException` | 403 |
| `NotFoundException` | 404 |
| `ConflictException` | 409 |
| `InternalServerErrorException` | 500 |

```json
{ "statusCode": 409, "message": "이미 가입된 이메일입니다.", "error": "Conflict" }
```

#### 커스텀 Exception Filter: 응답 형식 통일

```ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()   // 인자가 없으면 모든 예외를 잡음
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : '서버 오류가 발생했습니다.';

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception);   // 내부 정보는 로그로만
    }

    res.status(status).json({
      status,
      message,
      path: req.url,
      timestamp: new Date().toISOString(),
    });
  }
}
```

#### 특정 예외만 잡는 필터: Prisma UNIQUE 위반 → 409

```ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    if (exception.code === 'P2002') {
      return res.status(HttpStatus.CONFLICT).json({
        status: 409,
        code: 'DUPLICATED',
        message: '이미 존재하는 데이터입니다.',
      });
    }

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: 500,
      message: '서버 오류가 발생했습니다.',
    });
  }
}
```

#### 필터 적용 범위

| 범위 | 방법 |
| --- | --- |
| 메서드 | 메서드에 `@UseFilters(PrismaExceptionFilter)` |
| 컨트롤러 | 컨트롤러 클래스에 `@UseFilters(...)` |
| 전역 | `app.useGlobalFilters(new AllExceptionsFilter())` |
| 전역 (DI 사용) | 모듈 providers에 `{ provide: APP_FILTER, useClass: AllExceptionsFilter }` |

```ts
// app.module.ts — 필터 안에서 다른 서비스를 주입받아야 하면 이 방식 사용
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

@Module({
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_FILTER, useClass: PrismaExceptionFilter },
  ],
})
export class AppModule {}
```

- `app.useGlobalFilters()`는 모듈 밖에서 `new`로 생성하므로 **의존성 주입을 받을 수 없음**
- 여러 전역 필터를 등록하면, 예외 타입이 더 구체적인 필터(`@Catch(특정 예외)`)가 먼저 선택되도록 **등록 순서**에 주의