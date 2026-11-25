# 워크북 백엔드 키워드 정리 — API 문서와 테스트

## 목차

- [Swagger / OpenAPI](#swagger--openapi)
- [단위 테스트](#단위-테스트)
- [통합 테스트](#통합-테스트)
- [Mock, Stub](#mock-stub)
- [given-when-then](#given-when-then)
- [회귀 테스트](#회귀-테스트)

---

## Swagger / OpenAPI

#### API 명세 (API Specification)

- API가 어떤 주소로, 어떤 요청을 받고, 어떤 응답을 주는지 정리한 문서
- 엔드포인트, HTTP 메서드, 요청 파라미터·body, 응답 형식, 상태 코드, 인증 방식 등을 포함
- 프론트엔드·백엔드·외부 개발자가 같은 약속을 보고 개발하기 위해 필요

#### OpenAPI (OpenAPI Specification, OAS)

- REST API 명세를 정해진 형식(JSON 또는 YAML)으로 작성하기 위한 표준 규격
- 사람이 읽을 수 있고, 도구가 읽어서 문서·코드·테스트를 자동 생성할 수 있음
- 원래 이름은 Swagger Specification이었고, OpenAPI Initiative로 옮겨지면서 OpenAPI로 이름이 바뀜

#### Swagger

- OpenAPI 명세를 작성·시각화·활용하기 위한 도구 모음의 이름

| 도구 | 역할 |
| --- | --- |
| **Swagger UI** | OpenAPI 명세를 웹 페이지 문서로 보여주고, 브라우저에서 직접 API를 호출해볼 수 있게 함 |
| **Swagger Editor** | OpenAPI 명세를 작성하면서 실시간으로 문서를 미리 보는 편집기 |
| **Swagger Codegen** | 명세를 읽어 클라이언트·서버 코드를 자동 생성 |

#### Swagger와 OpenAPI의 관계

| 구분 | OpenAPI | Swagger |
| --- | --- | --- |
| 정체 | **명세 규격(표준)** | 그 규격을 다루는 **도구** |
| 비유 | 문서 양식 | 양식을 작성하고 보여주는 프로그램 |
| 예시 | `openapi.yaml` 파일 | Swagger UI 화면 (`/api-docs`) |

- 실무에서는 "Swagger 문서"라고 하면 보통 OpenAPI 명세 + Swagger UI로 띄운 문서 페이지를 함께 가리킴

---

## 단위 테스트

#### 테스트 (Test)

- 작성한 코드가 의도한 대로 동작하는지 코드로 확인하는 것
- 한 번 작성해두면 코드를 바꿀 때마다 자동으로 다시 실행해서 문제를 빠르게 발견할 수 있음

#### 단위 테스트 (Unit Test)

- 프로그램의 가장 작은 단위(함수, 메서드, 클래스 하나)가 올바르게 동작하는지 다른 부분과 분리해서 검증하는 테스트
- DB, 외부 API, 다른 서비스 같은 의존성은 가짜 객체(테스트 더블)로 대체
- NestJS에서는 주로 Service 클래스의 메서드를 대상으로 작성

### 단위 테스트의 특징

| 특징 | 설명 |
| --- | --- |
| **빠름** | DB·네트워크를 사용하지 않아 수백 개도 몇 초 안에 실행 |
| **독립적** | 다른 테스트의 결과나 실행 순서에 영향을 받지 않음 |
| **반복 가능** | 언제, 어디서 실행해도 같은 결과 |
| **문제 위치가 명확** | 실패하면 **어느 함수가 잘못됐는지** 바로 알 수 있음 |
| **한계** | 각 부분이 맞아도 **합쳤을 때의 문제**(DB 쿼리, 설정 오류)는 발견하지 못함 → 통합 테스트로 보완 |

#### 테스트 프레임워크

- 테스트를 작성·실행·결과 확인할 수 있게 해주는 도구
- NestJS 프로젝트는 기본으로 **Jest**가 설정되어 있음 (`.spec.ts` 파일)

### Jest 기본 문법

| 문법 | 역할 |
| --- | --- |
| `describe('이름', () => {})` | 관련된 테스트를 **묶는 그룹** |
| `it('설명', () => {})` / `test()` | **테스트 케이스 하나** |
| `expect(값).toBe(기대값)` | 결과 검증 (assertion) |
| `beforeEach(() => {})` | 각 테스트 실행 **전마다** 실행 |
| `jest.fn()` | 가짜 함수 생성 |
| `mockResolvedValue(값)` | 가짜 함수가 Promise로 반환할 값 지정 |
| `await expect(promise).rejects.toThrow(에러)` | 비동기 함수가 에러를 던지는지 검증 |

---

## 통합 테스트

#### 통합 테스트 (Integration Test)

- 여러 모듈·계층을 실제로 연결한 상태에서 함께 잘 동작하는지 검증하는 테스트
- 예: Controller → Service → Prisma → 실제 **테스트 DB**까지 연결해서 요청부터 저장까지 확인
- 단위 테스트에서 가짜로 대체했던 부분(DB, 설정, 파이프, 가드)을 실제 객체로 사용

#### 테스트 DB

- 테스트 전용으로 사용하는 DB
- 개발·운영 DB와 분리해서, 테스트가 데이터를 마음대로 만들고 지워도 문제가 없게 함
- Docker로 띄운 DB, 별도 스키마, SQLite 등을 사용

### 테스트 피라미드

```
          ▲  적게
         / \
        / E2E\         느리고 비용이 큼
       /───────\
      /  통합   \
     /───────────\
    /    단위     \     빠르고 비용이 적음
   /───────────────\
          ▼  많이
```

- 빠르고 안정적인 단위 테스트를 가장 많이, 통합 테스트는 중요한 연결 부분 위주로, E2E는 핵심 흐름만 작성

#### E2E 테스트 (End-to-End Test)

- 사용자 관점에서 시스템의 처음부터 끝까지 실제 사용 흐름대로 검증하는 테스트
- 백엔드에서는 보통 HTTP 요청을 보내고 응답을 확인하는 형태 (NestJS의 `test/*.e2e-spec.ts`)
- 통합 테스트보다 범위가 넓으며, 팀에 따라 API 수준의 E2E 테스트를 통합 테스트로 부르기도 함

---

## Mock, Stub

#### 테스트 더블 (Test Double)

- 테스트에서 실제 의존성 대신 사용하는 가짜 객체를 통틀어 부르는 말
- 영화 촬영에서 배우 대신 위험한 장면을 찍는 스턴트 더블(대역)에서 따온 이름
- 사용하는 이유
  - DB, 외부 API처럼 느리거나 준비가 어려운 의존성을 대체
  - 에러, 타임아웃처럼 실제로 만들기 어려운 상황을 재현
  - 테스트 대상의 로직만 분리해서 검증

#### Stub

- 테스트 대상이 의존성에게 무언가를 물어볼 때 정해진 답을 돌려주는 가짜 객체
- 목적: 테스트 대상이 특정 상황에서 어떻게 동작하는지 만들기 위한 입력 제공
- 검증 대상: 테스트 대상의 결과(반환값, 상태) → 상태 검증 (State Verification)

#### Mock

- 테스트 대상이 의존성을 올바르게 호출했는지 확인하기 위한 가짜 객체
- 목적: 반환값이 없거나 외부에 영향을 주는 동작(저장, 이메일 발송, 결제 요청)이 제대로 일어났는지 확인
- 검증 대상: 의존성과의 상호작용(호출 여부, 횟수, 인자) → 행위 검증 (Behavior Verification)

### Stub과 Mock 비교

| 구분 | Stub | Mock |
| --- | --- | --- |
| 역할 | 정해진 값을 제공 | 호출을 기록하고 검증 |
| 질문 | "이 값이 들어오면 테스트 대상은 어떻게 동작하지?" | "테스트 대상이 의존성을 제대로 호출했나?" |
| 검증 방식 | 상태 검증 (결과값 확인) | 행위 검증 (호출 확인) |
| Jest 사용 | `mockResolvedValue`, `mockReturnValue` | `toHaveBeenCalled`, `toHaveBeenCalledWith`, `toHaveBeenCalledTimes` |
| 예시 | `findUnique`가 기존 회원을 반환하도록 설정 | `create`가 호출되지 않았는지 확인 |

#### 테스트 더블의 종류

| 종류 | 의미 | 예시 |
| --- | --- | --- |
| **Dummy** | 전달만 되고 실제로 사용되지 않는 객체 | 필요 없는 파라미터에 넣는 빈 객체 |
| **Stub** | 호출되면 미리 정해둔 값을 반환하는 객체 | `findUnique`가 항상 `null`을 반환 |
| **Spy** | 실제 동작을 유지하면서 호출 기록을 남기는 객체 | `jest.spyOn(logger, 'error')` |
| **Mock** | 어떻게 호출되어야 하는지 기대를 정해두고, 그대로 호출됐는지 검증하는 객체 | `create`가 특정 인자로 1번 호출됐는지 확인 |
| **Fake** | 간단하게 실제로 동작하는 구현체 | DB 대신 메모리 배열을 사용하는 저장소 |

---

## given-when-then

#### given-when-then

- 테스트 코드를 준비(given) → 실행(when) → 검증(then) 세 단계로 나눠 작성하는 패턴
- BDD(Behavior-Driven Development, 행위 주도 개발)에서 나온 방식으로, 테스트를 시나리오처럼 읽히게 작성하는 것이 목적

| 단계 | 의미 | 테스트 코드에서 하는 일 |
| --- | --- | --- |
| **Given** (주어진 상황) | 테스트를 위한 **사전 조건·상황** | 입력 데이터 준비, Stub 설정, DB에 데이터 저장 |
| **When** (어떤 행동을 하면) | 테스트하려는 **동작 실행** | 테스트 대상 메서드 호출, API 요청 |
| **Then** (어떤 결과가 나와야 한다) | 기대하는 **결과 검증** | 반환값, 예외, 상태 코드, DB 상태, 호출 여부 확인 |

### 시나리오로 표현하기

```
Scenario: 이미 가입된 이메일로 회원가입

  Given "woods@x.com" 이메일로 가입한 회원이 있다
  When  같은 이메일로 회원가입을 요청하면
  Then  409 Conflict 응답을 받는다
  And   새 회원은 생성되지 않는다
```

- 이 시나리오를 그대로 테스트 코드 구조로 옮기면, 테스트가 무엇을 검증하는지 읽기 쉬워짐

### 테스트 코드에 적용하기

#### 1) 테스트 안에서 단계별로 나누기

- 각 단계 사이를 빈 줄로 구분하고, 단계 순서를 지켜서 작성

```ts
it('이미 가입된 이메일이면 ConflictException을 던지고 회원을 생성하지 않는다', async () => {
  const dto = { email: 'woods@x.com', password: 'password123', nickname: '우즈' };
  prismaMock.user.findUnique.mockResolvedValue({ id: 1, email: dto.email });

  const signUp = service.signUp(dto);

  await expect(signUp).rejects.toThrow(ConflictException);
  expect(prismaMock.user.create).not.toHaveBeenCalled();
});
```

#### 2) describe와 it 이름으로 표현하기

- `describe`에 상황(given)과 동작(when)을, `it`에 기대 결과(then)를 적으면 테스트 결과 출력이 시나리오처럼 읽힘

```ts
describe('UsersService.signUp', () => {
  describe('이미 가입된 이메일로 요청하면', () => {
    beforeEach(() => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 1, email: 'woods@x.com' });
    });

    it('ConflictException을 던진다', async () => {
      await expect(service.signUp(dto)).rejects.toThrow(ConflictException);
    });

    it('회원을 생성하지 않는다', async () => {
      await service.signUp(dto).catch(() => undefined);
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });
  });

  describe('가입되지 않은 이메일로 요청하면', () => {
    beforeEach(() => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({ id: 1, ...dto });
    });

    it('회원 정보를 반환한다', async () => {
      const result = await service.signUp(dto);
      expect(result.email).toBe(dto.email);
    });
  });
});
```

#### 테스트 실행 결과

```
UsersService.signUp
  이미 가입된 이메일로 요청하면
    ✓ ConflictException을 던진다
    ✓ 회원을 생성하지 않는다
  가입되지 않은 이메일로 요청하면
    ✓ 회원 정보를 반환한다
```

---

## 회귀 테스트

#### 회귀 (Regression)

- 코드를 수정·추가한 뒤, 원래 잘 동작하던 기능이 다시 고장 나는 현상
- "이전 상태로 되돌아간다(퇴행)"는 의미
- 예: 회원가입 응답 형식을 바꿨더니 로그인 API가 깨짐, 버그를 고쳤는데 다른 화면에서 새 버그가 생김

#### 회귀 테스트 (Regression Test)

- 코드 변경 이후에도 기존 기능이 여전히 올바르게 동작하는지 확인하는 테스트
- 새로운 종류의 테스트라기보다, 이미 작성된 테스트(단위·통합·E2E)를 변경할 때마다 다시 실행하는 활동을 말함
- 기능 추가, 버그 수정, 리팩터링, 라이브러리 업데이트 후에 실행

### 회귀 테스트가 필요한 이유

- 코드는 서로 연결되어 있어서, 한 곳을 고치면 예상하지 못한 다른 곳에 영향을 줄 수 있음
- 기능이 많아질수록 사람이 모든 기능을 직접 다시 확인하기 어려움
- 자동화된 회귀 테스트가 있으면 변경 직후 문제를 발견할 수 있어서, 배포 후에 사용자가 발견하는 것보다 훨씬 적은 비용으로 고칠 수 있음
- 테스트가 안전망이 되어 리팩터링을 안심하고 할 수 있음

#### CI (Continuous Integration, 지속적 통합)

- 코드를 저장소에 올릴 때마다(Push, PR) 자동으로 빌드하고 테스트를 실행하는 방식
- 회귀 테스트를 사람이 잊지 않고 매번 실행하게 만드는 가장 일반적인 방법