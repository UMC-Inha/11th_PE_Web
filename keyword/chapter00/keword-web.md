- TypeScript와 정적 타입 검사
    - JavaScript와 비교했을 때 TypeScript는 오류를 언제, 어떤 방식으로 확인하나요?
        - **TypeScript** : JavaScript 문법을 확장해 타입 정보를 작성할 수 있게 한 언어. 작성한 코드는 JavaScript로 변환되어 실행됨
        - JavaScript는 실행 중 값의 타입이 어긋난 지점에서 오류가 드러나는 경우가 많음
        - TypeScript는 실행 전에 타입 검사기(`tsc` 또는 에디터)를 통해 변수·함수 인자·반환값·객체 형태가 약속한 타입과 맞는지 확인
        - 예시 : `function add(a: number, b: number) {}`에 문자열을 전달하면 실행 전 오류를 알려 줌
        - 단, TypeScript는 컴파일 시점의 검사 도구이므로 서버 응답·사용자 입력처럼 런타임에 들어오는 데이터 검증까지 대신하지는 못함
    - 컴파일 타임 오류와 런타임 오류는 어떤 차이가 있나요?
        - **컴파일 타임 오류** : JavaScript를 실행하기 전, TypeScript 컴파일러가 발견하는 오류
            - 잘못된 인자 타입, 존재하지 않는 속성 접근, 잘못된 반환 타입 등
            - 개발 단계에서 빠르게 수정 가능
        - **런타임 오류** : JavaScript가 실제 브라우저·Node.js에서 실행되는 중 발생하는 오류
            - 네트워크 실패, `null` 접근, API가 예상과 다른 데이터를 반환하는 경우 등
            - TypeScript를 사용해도 런타임 검증·예외 처리는 필요
    - TypeScript의 타입 정보가 실행되는 JavaScript에 남지 않는 이유는 무엇일까요?
        - 브라우저와 Node.js는 JavaScript만 실행하므로 TypeScript는 컴파일 과정에서 타입 표기를 제거(**type erasure**)하고 JavaScript를 출력함
        - 타입은 개발 도구와 컴파일러가 코드 이해·검사에 사용하는 정보이며, 실행 환경에는 존재하지 않음
        - 따라서 `interface`, `type`, 제네릭 타입 인자 등은 런타임 값으로 사용할 수 없음

- 타입 추론과 타입 모델링
    - TypeScript가 타입을 추론하도록 두는 경우와 타입을 직접 작성하는 경우는 각각 언제 알맞을까요?
        - **타입 추론** : 초기값과 문맥을 보고 TypeScript가 타입을 자동으로 결정하는 기능

        ```tsx
        const count = 3; // number로 추론
        const names = ["민지", "준호"]; // string[]으로 추론
        ```

        - 초기값이 분명한 지역 변수, 간단한 반환값은 추론에 맡기면 중복이 줄고 코드가 간결함
        - 함수의 인자·반환 타입, 외부에 공개하는 API, 객체의 의도, 초기값이 없는 변수는 타입을 명시하면 계약이 분명해짐
        - 빈 배열·빈 객체는 의도와 다른 넓은 타입으로 추론될 수 있으므로 요소 타입·객체 형태를 명시하는 편이 안전
    - 객체와 함수의 형태를 타입으로 표현하면 어떤 실수를 미리 찾을 수 있을까요?
        - 객체 필수 속성 누락, 속성 이름 오타, 속성 값 타입 불일치
        - 함수에 필요한 인자를 빼먹거나 순서·타입을 잘못 전달하는 실수
        - 함수가 약속한 반환 타입과 실제 반환값이 다른 경우

        ```tsx
        interface User {
          id: number;
          name: string;
        }
        
        function greet(user: User): string {
          return `안녕하세요, ${user.name}`;
        }
        ```

        - 위 구조에서는 `id`가 없는 객체, `name`이 숫자인 객체를 전달할 때 실행 전에 오류를 확인할 수 있음
    - `type`과 `interface`는 표현 범위와 확장 방식에서 어떤 차이가 있을까요?
        - 둘 다 객체의 형태를 정의할 수 있고, 대부분의 일반 객체 모델링에서는 어느 쪽이든 가능
        - **interface**
            - 객체의 구조와 클래스 구현 계약을 표현하는 데 적합
            - `extends`로 확장하며, 같은 이름 선언은 병합(declaration merging)됨
        - **type**
            - 객체뿐 아니라 유니언, 교차 타입, 원시 타입 별칭, 튜플, 매핑 타입 등 더 다양한 타입 표현 가능
            - 교차 타입(`&`)으로 조합하며, 같은 이름을 선언해 병합할 수 없음
        - 프로젝트 안에서는 한 규칙을 정해 일관되게 사용하는 것이 중요

- 유니언 타입과 타입 좁히기
    - 여러 타입 중 하나가 될 수 있는 값을 유니언 타입으로 표현하면 어떤 장점이 있나요?
        - **유니언 타입(Union Type)** : 값이 여러 타입 중 하나일 수 있음을 `A | B`로 표현

        ```tsx
        let id: string | number;
        ```

        - 실제로 가능한 상태만 코드에 드러내므로, 불가능한 값을 줄이고 API의 의미를 명확하게 함
        - 예를 들어 요청 상태를 `"idle" | "loading" | "success" | "error"`로 제한하면 오타나 정의되지 않은 상태를 막을 수 있음
    - 조건문, `typeof`와 판별 프로퍼티는 타입을 어떻게 좁히나요?
        - **타입 좁히기(Narrowing)** : 실행 경로의 조건을 확인해 유니언 중 현재 가능한 더 구체적인 타입으로 범위를 줄이는 과정
        - `typeof value === "string"` : 원시 타입 구분
        - `Array.isArray(value)`, `value instanceof Date`, `"key" in value` : 배열·인스턴스·속성 존재 여부 확인
        - **판별 유니언(Discriminated Union)** : 각 객체에 공통의 리터럴 속성(`kind`, `status` 등)을 두고 분기

        ```tsx
        type Result =
          | { status: "success"; data: string }
          | { status: "error"; message: string };
        
        function printResult(result: Result) {
          if (result.status === "success") return result.data;
          return result.message;
        }
        ```

        - `status`를 확인한 뒤 해당 분기에서는 TypeScript가 맞는 속성만 접근하게 함
    - `null`과 `undefined`가 포함된 값을 안전하게 다룰 때 옵셔널 체이닝과 널 병합 연산자는 어떤 역할을 하나요?
        - `null` : 의도적으로 값이 없음을 나타내는 값, `undefined` : 값이 할당되지 않았거나 속성이 없을 수 있음을 나타내는 값
        - **옵셔널 체이닝 `?.`** : 왼쪽 값이 `null` 또는 `undefined`면 오류 대신 `undefined`를 반환하고 접근을 멈춤
            - `user?.profile?.nickname`
        - **널 병합 연산자 `??`** : 왼쪽 값이 `null` 또는 `undefined`일 때만 기본값 사용
            - `const name = user?.name ?? "익명";`
        - `||`는 `0`, 빈 문자열, `false`도 기본값으로 바꾸므로 “값 없음”만 처리하려면 `??`가 더 알맞음

- 타입 안전성과 제네릭
    - `any`와 `unknown`은 타입 검사를 허용하는 방식이 어떻게 다른가요?
        - **any** : 사실상 타입 검사를 끄는 타입
            - 어떤 값이든 대입·속성 접근·함수 호출이 가능하고, 오류가 다른 코드까지 전파될 수 있음
            - 점진적으로 JavaScript를 TypeScript로 옮기는 매우 제한적인 경우 외에는 피하는 편이 좋음
        - **unknown** : 어떤 값이 들어올 수는 있지만, 사용 전에는 안전성이 보장되지 않는 타입
            - 다른 타입에 바로 대입하거나 속성을 읽을 수 없고, `typeof`·`instanceof`·사용자 정의 타입 가드 등으로 확인한 뒤 사용

        ```tsx
        function printLength(value: unknown) {
          if (typeof value === "string") {
            console.log(value.length);
          }
        }
        ```

    - 여러 타입을 받을 때 `unknown`과 제네릭은 각각 어떤 상황에 알맞을까요?
        - 입력의 실제 형태를 아직 모르고 먼저 검증해야 하는 경계(외부 API 응답, `JSON.parse()`, 사용자 입력)에는 `unknown`이 알맞음
        - 입력 타입을 받아 같은 타입을 결과에도 유지해야 하는 재사용 함수·컴포넌트에는 **제네릭(Generic)**이 알맞음
            - `unknown`은 “무엇이 올지 모른다”를 표현
            - 제네릭은 “어떤 타입이 오든 그 타입과의 관계를 보존한다”를 표현
    - 제네릭은 입력 타입과 출력 타입의 관계를 어떻게 유지하나요?
        - 타입 매개변수 `T`를 입력과 출력에 함께 사용하면 호출 시 결정된 타입이 끝까지 연결됨

        ```tsx
        function first<T>(items: T[]): T | undefined {
          return items[0];
        }
        
        const name = first(["민지", "준호"]); // string | undefined
        const score = first([10, 20]); // number | undefined
        ```

        - `any`를 쓰면 결과가 any가 되어 타입 정보를 잃지만, 제네릭은 `string[]` 입력이면 `string | undefined`, `number[]` 입력이면 `number | undefined`를 유지
        - 필요한 속성만 허용하려면 제약 조건을 추가할 수 있음

        ```tsx
        function getId<T extends { id: number }>(item: T): number {
          return item.id;
        }
        ```