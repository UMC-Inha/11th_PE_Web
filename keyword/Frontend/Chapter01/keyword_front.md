# 1주차 핵심 키워드 — TypeScript

## TypeScript와 정적 타입 검사

### JavaScript와 비교했을 때 TypeScript는 오류를 언제, 어떤 방식으로 확인하나요?

<details>
<summary>Answer</summary>

**JavaScript**는 동적 타입 언어라서 값의 타입을 실행 중에 결정한다. 그래서 타입이 잘못되었더라도 그 줄이 실제로 실행되기 전까지는 아무도 모른다.

**TypeScript**는 정적 타입 언어라서 코드를 실행하지 않고 소스 코드만 분석해 타입을 검사한다.

</details>

### 컴파일 타임 오류와 런타임 오류는 어떤 차이가 있나요?

<details>
<summary>Answer</summary>

**컴파일 타임 오류**는 코드를 실행 가능한 형태로 변환하기 전, 코드를 분석하는 단계에서 발견되는 오류다. TypeScript에서는 타입 검사 단계가 여기에 해당한다.

- 존재하지 않는 프로퍼티 접근
- 함수 인자의 타입이나 개수 불일치
- 잘못된 타입 대입

**런타임 오류**는 코드가 실행되는 도중에 발생하는 오류다.

- `undefined`의 프로퍼티 접근 (`Cannot read properties of undefined`)
- 네트워크 요청 실패
- 사용자 입력이 예상과 다른 경우

</details>

### TypeScript의 타입 정보가 실행되는 JavaScript에 남지 않는 이유는 무엇일까요?

<details>
<summary>Answer</summary>

**브라우저와 Node.js는 TypeScript를 실행하지 못하기 때문이다.** 실제로 실행되는 것은 컴파일 결과물인 JavaScript이고, 타입은 컴파일 과정에서 전부 지워진다. 이것을 **타입 소거(Type Erasure)** 라고 한다.

</details>

## 타입 추론과 타입 모델링

### TypeScript가 타입을 추론하도록 두는 경우와 타입을 직접 작성하는 경우는 각각 언제 알맞을까요?

<details>
<summary>Answer</summary>

**추론에 맡기는 게 좋은 경우**

```ts
const name = "김지후";          // string으로 추론
const count = 0;                // number
const items = [1, 2, 3];        // number[]
const user = { id: 1, age: 20 } // { id: number; age: number }

function double(n: number) {
  return n * 2;                 // 반환 타입 number로 추론
}
```

초기값만 봐도 타입이 명확한 곳에 `const name: string = "김지후"`처럼 쓰는 건 중복이다. 오히려 나중에 값이 바뀌면 타입도 같이 고쳐야 해서 관리 지점만 늘어난다.

**직접 작성해야 하는 경우**

- **함수 매개변수**: 추론할 근거가 없어서 안 쓰면 `any`가 된다.

  ```ts
  function greet(name: string) { }   // 필수
  ```

- **빈 배열이나 빈 객체로 시작할 때**: `[]`는 `any[]`로 추론된다.

  ```ts
  const users: User[] = [];
  ```

- **모듈의 공개 인터페이스**: 다른 파일에서 쓰는 함수의 반환 타입을 명시하면, 내부 구현을 고쳤을 때 반환 타입이 의도치 않게 바뀌는 것을 그 자리에서 잡아준다.

  ```ts
  export function getUser(id: number): User { }
  ```

- **넓은 타입으로 추론되는 게 곤란할 때**: 리터럴 타입을 유지하고 싶으면 `as const`를 쓴다.

  ```ts
  let status = "loading";                    // string으로 넓어짐
  const status2 = "loading";                 // "loading" 리터럴
  const config = { mode: "dark" } as const;  // { readonly mode: "dark" }
  ```

</details>

### 객체와 함수의 형태를 타입으로 표현하면 어떤 실수를 미리 찾을 수 있을까요?

<details>
<summary>Answer</summary>

**(1) 프로퍼티 이름 오타**

JavaScript였다면 `undefined`가 조용히 반환되고, 화면에 빈 값이 나온 뒤에야 알게 된다.

**(2) 필수 속성 누락**

**(3) 타입이 다른 값 대입**

API에서 숫자로 오는 줄 알았는데 문자열로 오는 경우처럼 실무에서 자주 겪는 문제다.

**(4) 함수 인자의 개수나 순서 실수**

**(5) 선택 속성을 검사 없이 사용**

**(6) 반환값을 잘못 사용한 경우**

</details>

### `type`과 `interface`는 표현 범위와 확장 방식에서 어떤 차이가 있을까요?

<details>
<summary>Answer</summary>

`interface`는 객체와 함수의 **형태**만 표현할 수 있지만, `type`은 모든 타입에 이름을 붙일 수 있다.

| 구분 | `interface` | `type` |
| --- | --- | --- |
| 객체 형태 | 가능 | 가능 |
| 유니언, 튜플, 원시 | 불가 | 가능 |
| 확장 | `extends` | `&` |
| 선언 병합 | 가능 | 불가 |
| 에러 메시지 | 이름이 그대로 표시됨 | 펼쳐져서 길게 나올 때가 있음 |

</details>

## 유니언 타입과 타입 좁히기

### 여러 타입 중 하나가 될 수 있는 값을 유니언 타입으로 표현하면 어떤 장점이 있나요?

<details>
<summary>Answer</summary>

**(1) 가능한 값의 범위를 정확히 좁힌다**

`status: string`이라고 쓰면 세상의 모든 문자열이 들어올 수 있다. 리터럴 유니언으로 쓰면 네 가지만 허용된다.

```ts
let status: Status = "loding";
// Type '"loding"' is not assignable to type 'Status'.  ← 오타를 잡는다
```

**(2) 자동완성이 된다**

에디터가 가능한 값을 목록으로 보여주니 문자열을 외울 필요가 없다.

**(3) 분기 누락을 컴파일러가 잡아준다**

`never`를 이용한 완전성 검사(exhaustiveness check)를 붙이면, 나중에 상태를 하나 추가했을 때 처리하지 않은 곳이 전부 에러로 표시된다.

```tsx
function render(status: Status) {
  switch (status) {
    case "idle": return <Idle />;
    case "loading": return <Spinner />;
    case "success": return <Result />;
    case "error": return <ErrorView />;
    default:
      const _exhaustive: never = status;   // 빠진 케이스가 있으면 여기서 에러
      return _exhaustive;
  }
}
```

**(4) 불가능한 상태를 만들지 못하게 한다**

</details>

### 조건문, `typeof`와 판별 프로퍼티는 타입을 어떻게 좁히나요?

<details>
<summary>Answer</summary>

**(1) `typeof` — 원시 타입 판별**

```ts
function print(value: string | number) {
  if (typeof value === "string") {
    value.toUpperCase();   // 여기서 value는 string
  } else {
    value.toFixed(2);      // 여기서 value는 number
  }
}
```

**(2) `instanceof` — 클래스 인스턴스 판별**

```ts
if (error instanceof Error) {
  console.log(error.message);
}
```

**(3) `in` — 프로퍼티 존재 여부로 판별**

```ts
type Admin = { name: string; role: string };
type Guest = { name: string };

function greet(user: Admin | Guest) {
  if ("role" in user) {
    console.log(user.role);   // Admin으로 좁혀짐
  }
}
```

**(4) 판별 프로퍼티 (Discriminated Union)**

유니언에 속한 모든 타입이 공통 이름의 리터럴 타입 필드를 가지면, 그 값으로 어떤 타입인지 판별할 수 있다. 이 필드를 판별자(discriminant)라고 한다.

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; size: number };

function area(shape: Shape) {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;   // radius에 접근 가능
    case "square":
      return shape.size ** 2;               // size에 접근 가능
  }
}
```

유니언 안의 객체 타입을 다룰 때 가장 많이 쓰는 패턴이다. 앞서 본 API 상태 모델링이 그대로 이 형태다.

**(5) 사용자 정의 타입 가드**

조건이 복잡하면 `값 is 타입` 형태로 직접 만들 수 있다.

```ts
function isUser(value: unknown): value is User {
  return typeof value === "object" && value !== null && "id" in value;
}

if (isUser(data)) {
  console.log(data.id);   // User로 좁혀짐
}
```

**(6) truthiness 검사**

</details>

### `null`과 `undefined`가 포함된 값을 안전하게 다룰 때 옵셔널 체이닝과 널 병합 연산자는 어떤 역할을 하나요?

<details>
<summary>Answer</summary>



</details>

## 타입 안전성과 제네릭

### `any`와 `unknown`은 타입 검사를 허용하는 방식이 어떻게 다른가요?

<details>
<summary>Answer</summary>

`any` : 타입 검사를 포기한다

`unknown` : 검사하기 전까지 아무것도 못 한다

| 구분 | `any` | `unknown` |
| --- | --- | --- |
| 값 대입 | 무엇이든 | 무엇이든 |
| 프로퍼티 접근 | 검사 없이 허용 | 좁히기 전에는 불가 |
| 다른 타입에 대입 | 허용 | 불가 (단언 또는 좁히기 필요) |
| 안전성 | 낮음 | 높음 |

</details>

### 여러 타입을 받을 때 `unknown`과 제네릭은 각각 어떤 상황에 알맞을까요?

<details>
<summary>Answer</summary>

`unknown`: 값이 무엇인지 몰라서 확인해야 할 때

제네릭: 값이 무엇이든 상관없이 그대로 흘려보낼 때

</details>

### 제네릭은 입력 타입과 출력 타입의 관계를 어떻게 유지하나요?

<details>
<summary>Answer</summary>

제네릭은 타입을 **변수처럼 받아서**, 호출 시점에 실제 타입으로 채운다. 입력과 출력에 같은 타입 변수를 쓰면 둘이 묶여서 관계가 유지된다.

</details>
