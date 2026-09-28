# TypeScript 핵심 문법 및 타입 시스템
    
    - TypeScript와 정적 타입 검사
    - JavaScript와 비교했을 때 TypeScript는 오류를 언제, 어떤 방식으로 확인하나요?
    - 컴파일 타임 오류와 런타임 오류는 어떤 차이가 있나요?
    - TypeScript의 타입 정보가 실행되는 JavaScript에 남지 않는 이유는 무엇일까요?
    
    # TypeScript와 정적 타입 검사
    
    > TypeScript는 Javascript에 **정적 타입 시스템**을 추가한 프로그래밍 언어이다.
    > 
    
    **JavaScript** : **동적 타입** 언어 → **실행 중**에 변수의 타입을 결정하고 확인함
    **TypeScript**:  코드 **실행 전** 타입 검사 수행 → 타입과 관련된 **오류를 미리 발견**할 수 있음
    
    ### JavaScript
    
    ```jsx
    let age = 20;
    age = "twenty";
    ```
    
    변수에 **숫자**를 저장했다가 **문자열**을 저장할 수 있다.
    
    ```jsx
    function add (a, b) { 
    return a + b; 
    } 
    add(10, "20");
    ```
    
    `10 + “20”` → `“1020”` 
    이런 문제를 코드 실행 전에 발견하지 못할 수 있다.
    
    ### 정적 타입 검사
    
    > 프로그램 **실행 전**, 코드에 정의된 **타입**이 올바르게 사용되었는지 **검사**하는 것
    > 
    
    TS는 코드는 JS로 실행하기 전, **타입 검사**를 수행한다.
    
    ```
    TypeScript 코드 
        ↓ 
    타입 검사 
        ↓ 
    타입 오류 발견
     /         \ 
    Yes         No 
     ↓           ↓ 
    오류 표시    JavaScript로 변환 
                 ↓ 
                 실행
    ```
    
    ---
    
    ### 컴파일 타임 오류 (Compile-time Error)
    
    > 프로그램 **실행 전 코드 검사**나 **컴파일 과정**에서 발생하는 오류
    > 
    
    : TS의 대표적인 타입 오류가 이에 해당한다.
    
    `let age: number = "twenty";`
    
    → `number` 타입에 `string`을 할당했으므로 **실행 전**에 **오류 확인** 가능
    
    ### 런타임 오류 (Runtime Error)
    
    > 프로그램이 **실행되는 과정**에서 발생하는 오류
    > 
    
    ```tsx
    const user = null; 
    console.log(user.name);
    ```
    
    → 코드 자체는 문법적으로 문제가 없기 때문에 실행 가능하지만, 실제로 `user.name` 에 접근하는 순간 오류 발생
    
    ---
    
    ### TS의 타입 정보가 JS에 남지 않는 이유
    
    : **TS**는 최종적으로 **JS로 변환**되어 실행된다.
    
    ```tsx
    **TypeScript**
    function add(a: number, b: number): number { 
    	return a + b; 
    }
    
    ↓
    
    **JavaScript**
    function add(a, b) { 
    	return a + b; 
    }
    ```
    
    **TS**의 **타입**은 **개발 단계**에서 코드가 올바르게 작성되었는지 **검사**하기 위한 정보이고, 브라우저나 Node.js같은 **JS 실행 환경**은 기본적으로 **TS의 타입 문법을 이해하지 못한다.**
    
    → TS 코드 실행 전, **JS로 변환**해야 하는데, 타입 정보는 실행에 **필요한 JS 문법이 아니므로** 변환 과정에서 **제거**됨
    
    ---
    
    ### TypeScript의 장점
    
    - **오류 미리 발견 가능**
        
        : 실행 전 타입 오류를 확인할 수 있기 때문에 **런타임 오류**를 줄이는 데 도움이 된다.
        
    - **코드의 가독성과 이해도 상승**
        
        : 타입을 명시하면 함수의 **입력**과 **반환값**을 쉽게 파악할 수 있다.
        
    - **규모가 큰 프로젝트에서 유지보수 유리**
        
        : 데이터의 형태와 함수의 입출력을 명확하게 정의하여 **협업과 유지보수**에 도움이 된다.
        
    
- 타입 추론과 타입 모델링
    - TypeScript가 타입을 추론하도록 두는 경우와 타입을 직접 작성하는 경우는 각각 언제 알맞을까요?
    - 객체와 함수의 형태를 타입으로 표현하면 어떤 실수를 미리 찾을 수 있을까요?
    - `type`과 `interface`는 표현 범위와 확장 방식에서 어떤 차이가 있을까요?
    
    # 타입 추론과 타입 모델링
    
    ## 타입 추론 (Type Inference)
    
    > TypeScript가 코드의 값을 분석하여 **타입을 자동으로 판단**하는 것
    > 
    
    ```tsx
    let age = 20; 
    const name = "Sarah";
    ```
    
    → TS가 자동으로 `age → number` , `name → string` 으로 추론함. 
        타입이 명확한 경우에는 `const age: number = 20;`과 같이 불필요한 타입 작성 x
    
    ### 타입을 직접 작성하는 경우
    
    : 타입 추론만으로 타입을 정확하게 표현하기 어렵거나 코드에서 요구되는 형태를 명확하게 정의해야 할 때 사용한다.
    
    ```tsx
    function add(a: number, b: number): number { 
    	return a + b; 
    }
    ```
    
    → 함수의 매개변수나 반환값은 외부에서 전달되는 값과 관련되므로 타입을 명시해 함수의 사용법을 명확하게 정의할 수 있음.
    
    객체의 형태를 미리 정의할 때에도 사용한다.
    
    ```tsx
    type User = { 
    	id: number; 
    	name: string; 
    }; 
    
    const user: User = { 
    	id: 1, 
    	name: "철수" 
    };
    ```
    
    ---
    
    ## 타입 모델링
    
    > 객체나 함수가 가져야 하는 **데이터의 형태**와 **규칙**을 **타입으로 정의**하는 것
    > 
    
    ### 객체 타입 모델링
    
    ```tsx
    type User = { 
    	id: number; 
    	name: string; 
    	email: string; 
    };
    
    const user: User = { 
    	id: 1, 
    	name: "철수", 
    	email: 123 // email이 number이므로 오류 발생
    };
    
    const user: User = { 
    	id: 1, 
    	name: "철수" 
    }; // email이 없으므로 오류 발생
    ```
    
    객체 생성 시 잘못된 데이터 형태를 미리 확인할 수 있다.
    
    ### 함수 타입 모델링
    
    함수의 매개변수와 반환값을 타입으로 정의할 수 있다.
    
    ```tsx
    // 잘못된 타입의 인자를 전달하는 경우
    function add(a: number, b: number): number { 
    	return a + b; 
    }
    
    add(10, "20"); // b는 number이어야 하므로 오류 발생
    
    --------------------------------------------------
    
    // 반환값의 타입이 잘못된 경우
    function add(a: number, b: number): number {
    	return "hello"; // 반환값이 number이어야 하지만 string을 반환하므로 오류 발생
    }
    ```
    
    **객체와 함수의 형태를 타입으로 정의하면, 속성 누락/잘못된 타입/잘못된 함수 인자/잘못된 반환값 등의 실수를 실행 전에 발견할 수 있다.**
    
    ---
    
    ## Type과 Interface
    
    : `type` 과 `interface` 는 객체의 형태를 정의하는 데 사용할 수 있다.
    
    ### Type
    
    객체뿐만 아니라 유니온, 기본 타입 등 다양한 타입 표현에 사용 가능하다.
    
    ```tsx
    type ID = string | number; 
    
    type User = { 
    	id: number; 
    	name: string; 
    }; 
    
    type Admin = User & { 
    	adminLevel: number; 
    };
    ```
    
    → 타입 조합이나 다양한 형태의 타입 표현 시 유용
    
    ### Interface
    
    객체의 구조를 정의하고, 다른 Interface를 확장하는 데 사용한다.
    
    ```tsx
    interface User { 
    	id: number; 
    	name: string; 
    } 
    
    interface Admin extends User { 
    	adminLevel: number; 
    }
    ```
    
    → `extends` 를 이용해 기존 interface 확장 가능
    
    동일한 이름으로 선언하면 **선언 병합**이 가능하다.
    
    ```tsx
    interface User { 
    	id: number; 
    } 
    
    interface User { 
    	name: string; 
    }
    
    ->
    interface User { 
    	id: number; 
    	name: string; 
    } 
    ```
    
- 유니언 타입과 타입 좁히기
    - 여러 타입 중 하나가 될 수 있는 값을 유니언 타입으로 표현하면 어떤 장점이 있나요?
    - 조건문, `typeof`와 판별 프로퍼티는 타입을 어떻게 좁히나요?
    - `null`과 `undefined`가 포함된 값을 안전하게 다룰 때 옵셔널 체이닝과 널 병합 연산자는 어떤 역할을 하나요?
    
    # 유니언 타입과 타입 좁히기
    
    ## 유니언 타입 (Union Type)
    
    > 여러 타입 중 **하나가 될 수 있는 값**을 표현하는 타입
    > 
    
    `|` 연산자를 사용하여 표현한다.
    
    ```tsx
    let id: string | number;
    
    id = 123;
    id = "user01";
    ```
    
    → `id`는 `string` 또는 `number` 타입의 값을 가질 수 있다.
    
    ### 유니언 타입의 장점
    
    여러 타입이 허용되는 값을 **명확하게 표현**하면서도, 허용되지 않은 타입의 값은 오류로 잡을 수 있다.
    
    ```tsx
    function printId(id: string | number) {
      console.log(id);
    }
    
    printId(123);       // O
    printId("user01"); // O
    printId(true);     // 오류
    ```
    
    → `string`과 `number`는 허용하지만 `boolean`은 허용하지 않으므로 **잘못된 타입의 값이 전달되는 것을 방지**할 수 있다.
    
    ---
    
    ## 타입 좁히기 (Type Narrowing)
    
    > 유니언 타입처럼 여러 타입이 가능한 값의 **구체적인 타입을 조건문 등을 통해 좁혀가는 것**
    > 
    
    ### `typeof`를 이용한 타입 좁히기
    
    ```tsx
    function printValue(value: string | number) {
      if (typeof value === "string") {
        console.log(value.toUpperCase());
      } else {
        console.log(value.toFixed(2));
      }
    }
    ```
    
    → `if`문 내부에서는 `value`가 `string`임을 알 수 있고, `else`에서는 `number`임을 알 수 있다.
    
    즉, `typeof`를 이용하면 **값의 타입에 따라 안전하게 다른 로직을 실행**할 수 있다.
    
    ---
    
    ### 조건문을 이용한 타입 좁히기
    
    ```tsx
    function printName(name: string | null) {
      if (name !== null) {
        console.log(name.toUpperCase());
      }
    }
    ```
    
    → `if`문에서 `null`이 아님을 확인했기 때문에 내부에서는 `name`을 `string`으로 사용할 수 있다.
    
    ---
    
    ### 판별 프로퍼티 (Discriminated Union)
    
    > 객체에 **타입을 구분할 수 있는 공통 프로퍼티**를 두어 타입을 좁히는 방법
    > 
    
    ```tsx
    type User = {
      type: "user";
      name: string;
    };
    
    type Admin = {
      type: "admin";
      name: string;
      adminLevel: number;
    };
    
    type Account = User | Admin;
    ```
    
    `type` 프로퍼티를 이용해 타입을 구분할 수 있다.
    
    ```tsx
    function printAccount(account: Account) {
      if (account.type === "admin") {
        console.log(account.adminLevel);
      } else {
        console.log(account.name);
      }
    }
    ```
    
    → `account.type`이 `"admin"`인지 확인하면 TypeScript가 `Admin` 타입으로 **자동으로 좁혀준다.**
    
    ---
    
    ## `null`과 `undefined`
    
    > 값이 존재하지 않을 수 있음을 나타내는 타입
    > 
    - `null` → **의도적으로 값이 없음을 나타냄**
    - `undefined` → **값이 할당되지 않았거나 존재하지 않음을 나타냄**
    
    ```tsx
    let username: string | null = null;
    let age: number | undefined;
    ```
    
    `strictNullChecks`가 활성화된 경우 `null`과 `undefined`는 다른 타입과 구분되므로, 사용하기 전에 존재 여부를 확인해야 한다.
    
    ---
    
    ## 옵셔널 체이닝 (`?.`)
    
    > 객체나 값이 `null` 또는 `undefined`일 때 **오류를 발생시키지 않고 `undefined`를 반환**하는 연산자
    > 
    
    ```tsx
    const user = {
      profile: {
        name: "철수"
      }
    };
    
    console.log(user.profile?.name);
    ```
    
    만약 `profile`이 없거나 `null`이라면:
    
    ```tsx
    user.profile?.name
    → undefined
    ```
    
    → `if`문으로 일일이 존재 여부를 확인하지 않아도 **안전하게 프로퍼티에 접근**할 수 있다.
    
    ---
    
    ## 널 병합 연산자 (`??`)
    
    > 왼쪽 값이 `null` 또는 `undefined`일 때 **오른쪽의 기본값을 사용하는 연산자**
    > 
    
    ```tsx
    const username: string | null = null;
    
    const displayName = username ?? "익명";
    
    console.log(displayName);
    // "익명"
    ```
    
    → `username`이 `null` 또는 `undefined`이면 `"익명"`을 사용한다.
    
    `||`와 달리 `0`, `""`, `false` 같은 **falsy 값은 그대로 유지**한다.
    
    ```tsx
    const count = 0;
    
    console.log(count ?? 10); // 0
    console.log(count || 10); // 10
    ```
    
- 타입 안전성과 제네릭
    - `any`와 `unknown`은 타입 검사를 허용하는 방식이 어떻게 다른가요?
    - 여러 타입을 받을 때 `unknown`과 제네릭은 각각 어떤 상황에 알맞을까요?
    - 제네릭은 입력 타입과 출력 타입의 관계를 어떻게 유지하나요?
    
    # 타입 안전성과 제네릭
    
    ## any와 unknown
    
    : 둘 다 **여러 타입의 값**을 받을 수 있지만, **타입 검사 방식**이 다르다.
    
    ### any
    
    > **타입 검사**를 사실상 **해제**하고 **어떤 값이든 허용**
    > 
    
    ```tsx
    let value: any = "hello";
    
    value = 123;
    value.toUpperCase(); // 실행 시 오류가 발생 가능
    ```
    
    → 타입 오류를 검사하지 않기 때문에 **타입 안전성**이 **낮다.**
    
    ### unknown
    
    > 어떤 타입의 값이든 저장할 수 있지만, 사용하기 전 **타입 확인 필요**
    > 
    
    ```tsx
    let value: unknown = "hello";
    
    value.toUpperCase(); // 오류 발생
    
    if (typeof value === "string") {
      console.log(value.toUpperCase());
    }
    ```
    
    → 사용 전에 타입을 좁혀야 하므로 **타입 안전성**이 **높다.**
    
    ---
    
    ## unknown & 제네릭
    
    ### unknown
    
    : 실제 타입을 알 수 없고, 특정 타입과의 관계가 필요하지 않을 때 사용
    
    ```tsx
    function printValue(value: unknown) {
      if (typeof value === "string") {
        console.log(value.toUpperCase());
      }
    }
    ```
    
    → 입력값의 타입을 미리 알 수 없고, **타입을 확인한 후** 처리할 때 적합하다.
    
    ### 제네릭
    
    : 입력받은 타입을 그대로 유지하면서 입력과 출력의 타입 관계를 표현할 때 사용
    
    ```tsx
    function identity<T>(value: T): T {
      return value;
    }
    
    const num = identity(10);       // number
    const text = identity("hello"); // string
    ```
    
    → `T`가 입력 타입과 출력 타입을 연결해 준다.
    
    ---
    
    ## 제네릭과 입출력 타입의 관계
    
    제네릭은 **입력**으로 **받은 타입**을 **출력**에서도 그대로 **유지**할 수 있다.
    
    ```tsx
    function first<T>(items: T[]): T {
      return items[0];
    }
    
    const num = first([1, 2, 3]);
    // number
    
    const text = first(["a", "b", "c"]);
    // string
    ```
    
    `T`가 `number`이면 → 입력 `number[]` → 출력 `number
    T`가 `string`이면 → 입력 `string[]` → 출력 `string`
    
    → 여러 타입을 받을 수 있으면서도 **입력**과 **출력 사이**의 **타입 관계**를 **유지**할 수 있다.
    
    ### 제네릭의 장점
    
    - 여러 타입에서 재사용 가능하다.
    - `any`보다 타입 안전하다.
    - 입력과 출력의 타입 관계를 유지한다.
    - 코드 중복이 감소한다.