- TypeScript와 정적 타입 검사
    - JavaScript와 비교했을 때 TypeScript는 오류를 언제, 어떤 방식으로 확인하나요?
        
        ### 1. JavaScript
        
        - 코드를 실제로 실행하는 **런타임**에 오류를 확인한다.
        - 잘못된 타입의 값을 사용해도 실행 전에는 발견하지 못할 수 있다.
        - 실행 중 문제가 발생한 부분에서 오류가 나타난다.
        
        ### 2. TypeScript
        
        - 코드를 JavaScript로 변환하는 **컴파일 단계**에서 타입 오류를 확인한다.
        - VS Code와 같은 개발 도구에서도 코드를 작성하는 즉시 오류를 표시한다.
        - 실행 전에 잘못된 타입 사용이나 함수 인자 오류 등을 발견할 수 있다.
        
        단, TypeScript가 모든 오류를 막아 주는 것은 아니다. 네트워크 연결 실패나 배열 범위 문제처럼 실행하면서 발생하는 오류는 TypeScript에서도 런타임에 확인된다.
        
    - 컴파일 타임 오류와 런타임 오류는 어떤 차이가 있나요?
        
        ### 1. 컴파일 타임 오류
        
        - 프로그램을 **실행하기 전**, 코드를 검사하거나 변환하는 과정에서 발생한다.
        - 문법 오류나 타입 불일치 등이 대표적이다.
        - 오류를 수정하기 전에는 정상적으로 컴파일되지 않는다.
        
        ```tsx
        const age: number = "20";
        // 문자열을 number 타입에 할당해 컴파일 오류 발생
        ```
        
        ### 2. 런타임 오류
        
        - 컴파일을 통과한 프로그램을 **실제로 실행하는 도중** 발생한다.
        - 존재하지 않는 값에 접근하거나 파일·네트워크 요청에 실패하는 경우 등이 있다.
        - 실행 전에는 문제가 드러나지 않을 수 있다.
        
        ```tsx
        const user = JSON.parse("{}");
        console.log(user.name.toUpperCase());
        // 실행 중 user.name이 undefined이므로 오류 발생
        ```
        
    - TypeScript의 타입 정보가 실행되는 JavaScript에 남지 않는 이유는 무엇일까요?
        
        TypeScript의 타입 정보는 **코드 실행을 위한 정보가 아니라, 개발 단계에서 오류를 검사하기 위한 정보**이기 때문이다.
        
        브라우저와 Node.js는 TypeScript를 직접 실행하지 않고 JavaScript를 실행한다. 따라서 TypeScript 컴파일러(`tsc`)는 코드를 JavaScript로 변환하면서 타입 표기와 인터페이스 등 JavaScript에 없는 문법을 제거한다. 이를 **타입 소거(Type Erasure)**라고 한다.
        
        ```tsx
        const name: string = "Jinjin";
        
        function add(a: number, b: number): number {
          return a + b;
        }
        ```
        
        컴파일된 JavaScript:
        
        ```jsx
        const name = "Jinjin";
        
        function add(a, b) {
          return a + b;
        }
        ```
        
- 타입 추론과 타입 모델링
    - TypeScript가 타입을 추론하도록 두는 경우와 타입을 직접 작성하는 경우는 각각 언제 알맞을까요?
        
        ### 1. 타입 추론을 사용하는 경우
        
        변수의 초기값만으로 타입이 명확할 때는 TypeScript가 타입을 추론하도록 두는 것이 좋다. 불필요한 타입 표기를 줄여 코드를 간결하게 만들 수 있다.
        
        ```tsx
        const name = "Jieun"; // string으로 추론
        const age = 23;       // number로 추론
        const isStudent = true; // boolean으로 추론
        ```
        
        다음처럼 타입을 작성하는 것은 가능하지만 불필요하다.
        
        ```tsx
        const name: string = "Jieun";
        ```
        
        ### 2. 타입을 직접 작성하는 경우
        
        초기값만으로 타입을 알기 어렵거나 코드가 지켜야 할 타입을 명확히 표현해야 할 때 작성한다.
        
        - 초기값이 없는 변수
        
        ```tsx
        let result: number;
        ```
        
        - 함수의 매개변수
        
        ```tsx
        function greet(name: string) {
          return `Hello, ${name}`;
        }
        ```
        
        - 객체의 구조를 정의할 때
        
        ```tsx
        interface User {
          name: string;
          age: number;
        }
        
        const user: User = {
          name: "Jieun",
          age: 23
        };
        ```
        
        - 여러 타입의 값이 들어갈 수 있을 때
        
        ```tsx
        let id: string | number;
        ```
        
        - 함수의 반환 형태를 명확히 제한하고 싶을 때
        
        ```tsx
        function add(a: number, b: number): number {
          return a + b;
        }
        ```
        
    - 객체와 함수의 형태를 타입으로 표현하면 어떤 실수를 미리 찾을 수 있을까요?
        
        ### 1. 객체에서 찾을 수 있는 실수
        
        - 필수 속성을 빠뜨린 경우
        - 속성 이름을 잘못 작성한 경우
        - 속성에 잘못된 타입의 값을 넣은 경우
        - 정의되지 않은 속성을 추가한 경우
        
        ### 2. 함수에서 찾을 수 있는 실수
        
        - 인자의 타입이 잘못된 경우
        - 필요한 인자의 개수가 맞지 않는 경우
        - 반환값의 타입이 약속과 다른 경우
        - 반환값을 잘못된 방식으로 사용하는 경우
        
    - `type`과 `interface`는 표현 범위와 확장 방식에서 어떤 차이가 있을까요?
        
        ### 1. 표현 범위
        
        `interface`는 주로 **객체, 함수, 클래스의 구조**를 정의할 때 사용한다.
        
        ```
        interfaceUser {
          name:string;
          age:number;
        }
        ```
        
        `type`은 객체뿐만 아니라 **기본 타입, 유니온, 튜플 등 다양한 타입**을 표현할 수 있다.
        
        ```
        typeID=string|number;typePoint= [number,number];typeUser= {
          name:string;
          age:number;
        };
        ```
        
        ### 2. 확장 방식
        
        `interface`는 `extends`를 사용해 확장한다.
        
        ```
        interfacePerson {
          name:string;
        }interfaceStudentextendsPerson {
          studentId:number;
        }
        ```
        
        `type`은 인터섹션 타입인 `&`를 사용해 결합한다.
        
        ```
        typePerson= {
          name:string;
        };typeStudent=Person& {
          studentId:number;
        };
        ```
        
        ### 3. 선언 병합
        
        같은 이름의 `interface`를 여러 번 선언하면 자동으로 하나로 합쳐진다.
        
        ```
        interfaceUser {
          name:string;
        }interfaceUser {
          age:number;
        }// User는 name과 age를 모두 가져야 함
        ```
        
        반면 같은 이름의 `type`을 다시 선언하면 오류가 발생한다.
        
        ```
        typeUser= {
          name:string;
        };typeUser= {// 오류: 중복 선언
          age:number;
        };
        ```
        
        ### 비교
        
        | 구분 | `type` | `interface` |
        | --- | --- | --- |
        | 객체 구조 표현 | 가능 | 가능 |
        | 유니온·튜플·기본 타입 표현 | 가능 | 직접 표현하기 어려움 |
        | 확장 방법 | `&` | `extends` |
        | 동일 이름 재선언 | 불가능 | 선언 병합 가능 |
        | 주된 용도 | 다양한 타입 조합 | 객체·클래스 구조 정의 |
        
        > 객체의 구조를 정의하고 계속 확장하려면 `interface`, 유니온이나 튜플처럼 다양한 타입을조합하려면 `type`이 알맞다. 단순한 객체 타입에서는 팀의 규칙에 따라 어느 쪽을 사용해도 된다.
        > 
        
- 유니언 타입과 타입 좁히기
    - 여러 타입 중 하나가 될 수 있는 값을 유니언 타입으로 표현하면 어떤 장점이 있나요?
        
        유니언 타입은 하나의 값이 여러 타입 중 하나가 될 수 있음을 `|` 기호로 표현한다.
        
        ```tsx
        let id: string | number;
        
        id = "user01";
        id = 100;
        ```
        
        ### 장점
        
        - 값이 가질 수 있는 타입을 명확하게 제한할 수 있다.
        - `any`보다 안전하게 여러 타입을 처리할 수 있다.
        - 허용하지 않은 타입이 들어오면 컴파일 단계에서 오류를 확인할 수 있다.
        - 타입을 확인한 후 각 타입에 맞는 속성과 메서드만 사용하게 한다.
        
        ```tsx
        function printId(id: string | number) {
          if (typeof id === "string") {
            console.log(id.toUpperCase());
          } else {
            console.log(id.toFixed(0));
          }
        }
        ```
        
        - 정해진 문자열 값만 허용하도록 제한할 수도 있다.
        
        ```tsx
        type Status = "pending" | "success" | "failed";
        
        let status: Status = "success";
        status = "complete"; // 오류: 허용되지 않은 값
        ```
        
        > 유니언 타입을 사용하면 값이 가질 수 있는 여러 가능성을 표현하면서도 허용 범위를 제한할 수 있다. 각 타입을 구분해 안전하게 처리할 수 있어 `any`보다 타입 안정성이 높다.
        > 
        
    - 조건문, `typeof`와 판별 프로퍼티는 타입을 어떻게 좁히나요?1.
        
        ### 1.`typeof`를 이용한 타입 좁히기
        
        `typeof`로 값의 자료형을 검사하면 조건문 내부에서 해당 타입으로 좁혀진다.
        
        ```tsx
        function printValue(value: string | number) {
          if (typeof value === "string") {
            console.log(value.toUpperCase()); // string
          } else {
            console.log(value.toFixed(2)); // number
          }
        }
        ```
        
        TypeScript는 `if` 내부의 `value`를 `string`, `else` 내부의 `value`를 `number`로 판단한다.
        
        `typeof`는 주로 다음 기본 타입을 구분할 때 사용한다.
        
        ```tsx
        "string"
        "number"
        "boolean"
        "undefined"
        "function"
        "object"
        "bigint"
        "symbol"
        ```
        
        ### 2. 조건문을 이용한 타입 좁히기
        
        값이 존재하는지 검사하거나 특정 값과 비교하여 타입을 좁힐 수 있다.
        
        ```tsx
        function greet(name: string | null) {
          if (name !== null) {
            console.log(name.toUpperCase()); // string
          }
        }
        ```
        
        ```tsx
        function process(value: string | undefined) {
          if (value) {
            console.log(value.length); // string
          }
        }
        ```
        
        단, `if (value)`는 빈 문자열 `""`, 숫자 `0`, `false`도 거짓으로 판단하므로 정확한 검사가 필요하면 `value !== undefined`처럼 작성하는 것이 좋다.
        
        ### 3. 판별 프로퍼티를 이용한 타입 좁히기
        
        객체 타입마다 공통 프로퍼티에 서로 다른 리터럴 값을 지정하면 이를 기준으로 객체의 타입을 구분할 수 있다. 이러한 프로퍼티를 **판별 프로퍼티**라고 한다.
        
        ```tsx
        type Success = {
          status: "success";
          data: string;
        };
        
        type Failure = {
          status: "failure";
          message: string;
        };
        
        type Result = Success | Failure;
        ```
        
        ```tsx
        function handleResult(result: Result) {
          if (result.status === "success") {
            console.log(result.data); // Success 타입
          } else {
            console.log(result.message); // Failure 타입
          }
        }
        ```
        
        `status` 값이 `"success"`이면 `Success`, `"failure"`이면 `Failure` 타입으로 좁혀진다.
        
    - `null`과 `undefined`가 포함된 값을 안전하게 다룰 때 옵셔널 체이닝과 널 병합 연산자는 어떤 역할을 하나요?
        
        값에 `null`이나 `undefined`가 포함될 수 있다면, 옵셔널 체이닝(`?.`)과 널 병합 연산자(`??`)를 사용해 오류를 방지하고 기본값을 지정할 수 있다.
        
        ### 1. 옵셔널 체이닝 `?.`
        
        객체나 프로퍼티가 `null` 또는 `undefined`인지 확인한 후 접근한다.
        
        ```tsx
        type User = {
          profile?: {
            nickname: string;
          };
        };
        
        const user: User = {};
        
        console.log(user.profile?.nickname);
        ```
        
        `profile`이 존재하면 `nickname`을 반환하고, 존재하지 않으면 오류 대신 `undefined`를 반환한다.
        
        다음 코드와 비슷한 역할을 한다.
        
        ```tsx
        const nickname =
          user.profile === null || user.profile === undefined
            ? undefined
            : user.profile.nickname;
        ```
        
        함수와 배열에도 사용할 수 있다.
        
        ```tsx
        callback?.();       // 함수가 존재할 때만 호출
        users?.[0];         // 배열이 존재할 때만 첫 요소에 접근
        ```
        
        ### 2. 널 병합 연산자 `??`
        
        왼쪽 값이 `null` 또는 `undefined`일 때 오른쪽의 기본값을 사용한다.
        
        ```tsx
        const nickname = user.profile?.nickname ?? "이름 없음";
        ```
        
        - 닉네임이 존재하면 해당 값을 사용한다.
        - 결과가 `null` 또는 `undefined`라면 `"이름 없음"`을 사용한다.
        
        ### `??`와 `||`의 차이
        
        `||`는 `0`, `false`, 빈 문자열 `""`까지 값이 없는 것으로 판단한다. 반면 `??`는 `null`과 `undefined`만 처리한다.
        
        ```tsx
        const count = 0;
        
        console.log(count || 10); // 10
        console.log(count ?? 10); // 0
        ```
        
        `0`이 정상적인 값이라면 `??`를 사용하는 것이 적절하다.
        
        ### 함께 사용하는 예시
        
        ```tsx
        const city = user.address?.city ?? "지역 미등록";
        ```
        
        1. `user.address?.city`로 안전하게 프로퍼티에 접근한다.
        2. 결과가 `null` 또는 `undefined`이면 `"지역 미등록"`을 사용한다.
        
- 타입 안전성과 제네릭
    - `any`와 `unknown`은 타입 검사를 허용하는 방식이 어떻게 다른가요?
        
        `any`와 `unknown`은 모두 어떤 타입의 값이든 저장할 수 있다. 차이는 저장된 값을 사용할 때 **타입 검사를 요구하는지**에 있다.
        
        ### 1. `any`
        
        `any`는 TypeScript의 타입 검사를 사실상 비활성화한다. 값을 검사하지 않고 속성이나 메서드를 사용할 수 있다.
        
        ```tsx
        let value: any = "hello";
        
        value.toUpperCase();
        value.toFixed(2);
        value.notExist();
        ```
        
        TypeScript는 위 코드를 모두 허용한다. 하지만 실제 값이 문자열이므로 `toFixed()` 등을 호출하면 런타임 오류가 발생한다.
        
        ### 2.`unknown`
        
        `unknown`도 어떤 값이든 저장할 수 있지만, 타입을 확인하기 전에는 직접 사용할 수 없다.
        
        ```tsx
        let value: unknown = "hello";
        
        value.toUpperCase(); // 오류: value의 타입을 알 수 없음
        ```
        
        조건문으로 타입을 좁힌 후에는 사용할 수 있다.
        
        ```tsx
        if (typeof value === "string") {
          console.log(value.toUpperCase());
        }
        ```
        
        객체를 사용할 때도 먼저 타입을 확인해야 한다.
        
        ```tsx
        if (
          typeof value === "object" &&
          value !== null &&
          "name" in value
        ) {
          console.log(value.name);
        }
        ```
        
        ### 비교
        
        | 구분 | `any` | `unknown` |
        | --- | --- | --- |
        | 모든 타입의 값 저장 | 가능 | 가능 |
        | 타입 확인 없이 사용 | 가능 | 불가능 |
        | 타입 검사 수행 | 사실상 생략 | 사용 전에 필요 |
        | 타입 안전성 | 낮음 | 높음 |
        | 잘못된 사용 발견 시점 | 주로 런타임 | 컴파일 타임 |
    - 여러 타입을 받을 때 `unknown`과 제네릭은 각각 어떤 상황에 알맞을까요?
        
        `unknown`과 제네릭은 모두 여러 타입의 값을 받을 수 있지만, **입력 타입을 알 수 없는 경우인지, 입력 타입을 유지해야 하는 경우인지**에 따라 사용 목적이 다르다.
        
        ### 1.`unknown`이 알맞은 경우
        
        입력값의 타입을 미리 알 수 없고, 사용 전에 타입 검사가 필요할 때 사용한다.
        
        ```tsx
        function printValue(value: unknown) {
          if (typeof value === "string") {
            console.log(value.toUpperCase());
          } else if (typeof value === "number") {
            console.log(value.toFixed(2));
          }
        }
        ```
        
        주로 다음과 같은 경우에 적합하다.
        
        - 외부 API에서 받은 데이터
        - `JSON.parse()` 결과
        - 사용자가 입력한 값
        - `catch`에서 받은 오류
        - 타입이 확실하지 않은 값을 안전하게 처리할 때
        
        `unknown`으로 받은 값은 원래 타입과의 관계를 유지하지 않으며, 타입을 확인해야 사용할 수 있다.
        
        ### 2. 제네릭이 알맞은 경우
        
        여러 타입을 받을 수 있으면서 **입력 타입과 반환 타입의 관계를 유지해야 할 때** 사용한다.
        
        ```tsx
        function identity<T>(value: T): T {
          return value;
        }
        
        const text = identity("hello"); // string
        const count = identity(10);     // number
        ```
        
        배열이나 객체의 타입 관계도 유지할 수 있다.
        
        ```tsx
        function getFirst<T>(items: T[]): T | undefined {
          return items[0];
        }
        
        const name = getFirst(["A", "B"]); // string | undefined
        const number = getFirst([1, 2]);   // number | undefined
        ```
        
        ### 비교
        
        | 구분 | `unknown` | 제네릭 |
        | --- | --- | --- |
        | 입력 타입 | 알 수 없음 | 호출할 때 결정됨 |
        | 타입 사용 | 검사 후 사용 | 결정된 타입으로 사용 |
        | 입력과 반환 타입 관계 | 유지하지 않음 | 유지할 수 있음 |
        | 주요 목적 | 알 수 없는 값을 안전하게 처리 | 다양한 타입에 재사용 가능한 코드 작성 |
    - 제네릭은 입력 타입과 출력 타입의 관계를 어떻게 유지하나요?
        
        제네릭은 **타입 매개변수**를 사용해 입력값의 타입을 기억하고, 그 타입을 반환값이나 다른 매개변수에도 동일하게 적용한다.
        
        ### 1. 기본 구조
        
        ```tsx
        function identity<T>(value: T): T {
          return value;
        }
        ```
        
        여기서 `T`는 실제 타입을 대신하는 타입 매개변수다.
        
        - 매개변수 `value`의 타입: `T`
        - 반환값의 타입: `T`
        - 따라서 입력 타입과 반환 타입이 동일하게 연결된다.
        
        ```tsx
        const text = identity("hello"); // 입력 string → 반환 string
        const count = identity(10);     // 입력 number → 반환 number
        ```
        
        함수를 호출하면 TypeScript가 입력값을 바탕으로 `T`를 추론한다.
        
        ### 2. `unknown`과의 차이
        
        ```tsx
        function identityUnknown(value: unknown): unknown {
          return value;
        }
        
        const result = identityUnknown("hello");
        // result의 타입은 unknown
        ```
        
        `unknown`은 입력값이 문자열이어도 반환 타입이 계속 `unknown`이다. 반면 제네릭은 입력값에서 추론한 타입을 반환값까지 전달한다.
        
        ```tsx
        const result = identity("hello");
        // result의 타입은 string
        ```
        
        ### 3. 여러 값의 관계 유지
        
        제네릭은 객체나 배열 내부의 타입 관계도 유지할 수 있다.
        
        ```tsx
        function getFirst<T>(items: T[]): T | undefined {
          return items[0];
        }
        
        const number = getFirst([10, 20]);    // number | undefined
        const name = getFirst(["Kim", "Lee"]); // string | undefined
        ```
        
        객체의 특정 속성 타입을 반환값과 연결할 수도 있다.
        
        ```tsx
        function getProperty<T, K extends keyof T>(
          object: T,
          key: K
        ): T[K] {
          return object[key];
        }
        
        const user = {
          name: "Jieun",
          age: 23
        };
        
        const name = getProperty(user, "name"); // string
        const age = getProperty(user, "age");   // number
        ```