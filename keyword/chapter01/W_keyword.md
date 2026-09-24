- TypeScript와 정적 타입 검사
    - JavaScript와 비교했을 때 TypeScript는 오류를 언제, 어떤 방식으로 확인하나요?
        
        JavaScript는 주로 코드를 실행하는 도중에 오류를 발견한다. 반면 TypeScript는 코드를 실행하기 전에 변수, 매개변수, 객체 속성 등의 타입을 검사한다.
        
        예를 들어 다음 코드는 `id`에 문자열을 넣었기 때문에 TypeScript의 타입 검사 단계에서 오류가 발생한다.
        
        ```tsx
        type StudyMember = {
          id: number;
          name: string;
        };
        
        const member: StudyMember = {
          id: "1",
          name: "광수",
        };
        ```
        
        `pnpm exec tsc --noEmit`을 실행하면 JavaScript 파일을 만들지 않고 이러한 타입 오류만 확인할 수 있다.
        
        TypeScript가 모든 오류를 찾아주는 것은 아니다. 외부 API에서 예상과 다른 데이터가 오거나, 존재하지 않는 파일을 읽는 것처럼 실행해야 알 수 있는 문제는 별도로 처리해야 한다.
        
    - 컴파일 타임 오류와 런타임 오류는 어떤 차이가 있나요?
        
        컴파일 타임 오류는 코드를 실행하기 전에 TypeScript가 발견하는 오류다.
        
        ```tsx
        const id: number = "1";
        ```
        
        숫자 타입에 문자열을 넣었기 때문에 실행 전에 오류가 발생한다.
        
        런타임 오류는 타입 검사를 통과한 JavaScript가 실제로 실행되는 도중 발생하는 오류다.
        
        ```tsx
        const text = "{ 잘못된 JSON }";
        JSON.parse(text);
        ```
        
        `text`는 정상적인 문자열이므로 타입 오류는 없지만, 올바른 JSON 형식이 아니기 때문에 실행 도중 오류가 발생한다.
        
        정리하면 다음과 같다.
        
        - 컴파일 타임 오류: 실행 전에 발견되는 타입 관련 오류
        - 런타임 오류: 실제 실행 중 발생하는 오류
    - TypeScript의 타입 정보가 실행되는 JavaScript에 남지 않는 이유는 무엇일까요?
        
        Node.js와 브라우저는 TypeScript가 아니라 JavaScript를 실행한다. 따라서 `tsc`는 타입 검사를 마친 뒤 타입 문법을 제거하고 실행 가능한 JavaScript를 만든다.
        
        다음 TypeScript 코드에서:
        
        ```tsx
        const memberId: number = 1;
        ```
        
        컴파일된 JavaScript는 다음과 같다.
        
        ```jsx
        const memberId = 1;
        ```
        
        `number`는 타입 검사에만 사용되므로 실행되는 JavaScript에는 필요하지 않다. `type StudyMember` 같은 타입 정의도 컴파일된 JavaScript에서는 사라진다. 이를 타입 소거라고 한다.
        
- 타입 추론과 타입 모델링
    - TypeScript가 타입을 추론하도록 두는 경우와 타입을 직접 작성하는 경우는 각각 언제 알맞을까요?
        
        값만으로 타입이 명확한 간단한 변수는 TypeScript가 타입을 추론하도록 두는 것이 편리하다.
        
        ```tsx
        let currentWeek = 1;      
        let isCompleted = false;  
        ```
        
        TypeScript는 각각 `number`와 `boolean`으로 추론한다.
        
        반면 객체 구조, 함수의 매개변수 또는 여러 곳에서 반복해서 사용하는 데이터는 타입을 직접 작성하는 것이 좋다.
        
        ```tsx
        type StudyMember = {
          id: number;
          name: string;
          role: string;
          githubId?: string;
        };
        ```
        
        함수에도 매개변수와 반환 타입을 표시하면 함수의 사용 방법을 쉽게 확인할 수 있다.
        
        ```tsx
        function getMemberInfo(id: number): string {
          // 회원 검색
        }
        ```
        
        정리하면 다음과 같다.
        
        - 단순하고 값이 명확한 변수: 타입 추론 활용
        - 객체 구조나 함수의 입력·출력: 타입을 직접 작성
        - 여러 곳에서 반복하는 데이터 구조: 별도의 타입으로 정의
    - 객체와 함수의 형태를 타입으로 표현하면 어떤 실수를 미리 찾을 수 있을까요?
        
        객체의 타입을 정의하면 필수 속성이 빠지거나 잘못된 타입의 값이 들어가는 실수를 미리 발견할 수 있다.
        
        ```tsx
        const member: StudyMember = {
          id: 1,
          name: "광수",
          // role이 없으므로 타입 오류
        };
        ```
        
        함수의 타입을 작성하면 잘못된 타입의 값을 전달하는 것도 방지할 수 있다.
        
        ```tsx
        getMemberInfo("1");
        // id는 number여야 하므로 타입 오류
        ```
        
        이를 통해 프로그램을 실행하기 전에 객체 속성 누락, 잘못된 값 전달, 잘못된 반환값 등의 문제를 찾을 수 있다.
        
    - `type`과 `interface`는 표현 범위와 확장 방식에서 어떤 차이가 있을까요?
        
        둘 다 객체의 형태를 표현할 수 있다.
        
        ```tsx
        type StudyMember = {
          id: number;
          name: string;
        };
        ```
        
        ```tsx
        interface StudyMember {
          id: number;
          name: string;
        }
        ```
        
        `type`은 객체뿐만 아니라 유니언 타입, 튜플, 원시 타입의 별칭 등 더 다양한 타입을 표현할 수 있다.
        
        ```tsx
        type StudyRole = "스터디장" | "스터디원";
        type MemberId = number;
        ```
        
        `interface`는 주로 객체의 구조를 표현하며, `extends`를 사용해 다른 인터페이스를 확장할 수 있다.
        
        ```tsx
        interface Person {
          name: string;
        }
        
        interface StudyMember extends Person {
          id: number;
        }
        ```
        
        같은 이름의 `interface`를 여러 번 선언하면 내용이 합쳐지는 선언 병합도 가능하다. 반면 같은 이름의 `type`을 다시 선언할 수는 없다.
        
        일반적인 객체는 둘 다 사용할 수 있지만, 유니언과 같이 다양한 타입을 조합할 때는 `type`이 더 알맞다.
        
- 유니언 타입과 타입 좁히기
    - 여러 타입 중 하나가 될 수 있는 값을 유니언 타입으로 표현하면 어떤 장점이 있나요?
        
        유니언 타입은 하나의 값이 여러 타입 중 하나가 될 수 있음을 표현한다.
        
        ```tsx
        let selectedMember: StudyMember | null = null;
        ```
        
        `selectedMember`에는 회원 객체 또는 `null`만 들어갈 수 있다. 가능한 값을 타입에 정확하게 표현하기 때문에 예상하지 못한 값이 들어오는 것을 방지할 수 있다.
        
        ```tsx
        selectedMember = "광수";
        // StudyMember도 null도 아니므로 타입 오류
        ```
        
    - 조건문, `typeof`와 판별 프로퍼티는 타입을 어떻게 좁히나요?
        
        `find()`는 회원을 찾으면 회원 객체를, 찾지 못하면 `undefined`를 반환한다.
        
        ```tsx
        const foundMember = members.find(
          (member) => member.id === id
        );
        ```
        
        따라서 `foundMember`의 타입은 다음과 같다.
        
        ```tsx
        StudyMember | undefined
        ```
        
        조건문으로 `undefined`인 경우를 먼저 처리하면, 그 아래에서 TypeScript는 `foundMember`를 `StudyMember`로 좁혀서 판단한다.
        
        ```tsx
        if (!foundMember) {
          return "존재하지 않는 회원입니다.";
        }
        
        console.log(foundMember.name);
        ```
        
        `typeof`는 문자열이나 숫자처럼 실행 중 확인할 수 있는 타입을 좁힐 때 사용한다.
        
        ```tsx
        function printId(id: number | string) {
          if (typeof id === "number") {
            console.log(id + 1);
          } else {
            console.log(id.toUpperCase());
          }
        }
        ```
        
        판별 프로퍼티는 여러 객체 타입을 공통 속성의 값으로 구분하는 방법이다.
        
        ```tsx
        type SearchResult =
          | { status: "found"; member: StudyMember }
          | { status: "not-found"; id: number };
        
        function printResult(result: SearchResult) {
          if (result.status === "found") {
            console.log(result.member.name);
          } else {
            console.log(`${result.id}번 회원이 없습니다.`);
          }
        }
        ```
        
        `status`를 검사하면 TypeScript가 어떤 객체 타입인지 구분할 수 있다.
        
    - `null`과 `undefined`가 포함된 값을 안전하게 다룰 때 옵셔널 체이닝과 널 병합 연산자는 어떤 역할을 하나요?
        
        옵셔널 체이닝 `?.`은 값이 `null` 또는 `undefined`일 때 속성 접근을 중단하고 `undefined`를 반환한다.
        
        ```tsx
        const githubId = foundMember?.githubId;
        ```
        
        회원이 없어도 `foundMember.githubId`에 접근하려다 오류가 발생하지 않는다.
        
        널 병합 연산자 `??`는 값이 `null` 또는 `undefined`일 때 대신 사용할 기본값을 지정한다.
        
        ```tsx
        const githubId = foundMember?.githubId ?? "등록되지 않음";
        ```
        
        - 회원과 GitHub 아이디가 있음 → 실제 GitHub 아이디
        - 회원이 없거나 GitHub 아이디가 없음 → `"등록되지 않음"`
        
        `??`는 `0`, `false`, 빈 문자열은 정상적인 값으로 유지하고 `null`과 `undefined`만 처리한다.
        
- 타입 안전성과 제네릭
    - `any`와 `unknown`은 타입 검사를 허용하는 방식이 어떻게 다른가요?
        
        `any`는 TypeScript의 타입 검사를 사실상 끄는 타입이다.
        
        ```tsx
        let value: any = "hello";
        
        value.toFixed();
        ```
        
        문자열에는 `toFixed()`가 없지만 `any`를 사용했기 때문에 컴파일 오류가 발생하지 않는다. 대신 실행 중 오류가 발생할 수 있다.
        
        `unknown`에도 모든 값을 넣을 수 있지만, 타입을 확인하기 전에는 바로 사용할 수 없다.
        
        ```tsx
        let value: unknown = "hello";
        
        // value.toUpperCase(); // 타입 오류
        
        if (typeof value === "string") {
          console.log(value.toUpperCase());
        }
        ```
        
        따라서 타입을 알 수 없는 값을 받을 때는 `any`보다 `unknown`이 안전하다.
        
    - 여러 타입을 받을 때 `unknown`과 제네릭은 각각 어떤 상황에 알맞을까요?
        
        `unknown`은 입력값의 타입을 알 수 없고, 사용하기 전에 검사해야 할 때 적합하다.
        
        ```tsx
        function printValue(value: unknown) {
          if (typeof value === "string") {
            console.log(value.toUpperCase());
          }
        }
        ```
        
        제네릭은 다양한 타입을 받을 수 있으면서 입력 타입과 출력 타입의 관계를 유지해야 할 때 사용한다.
        
        ```tsx
        function returnValue<T>(value: T): T {
          return value;
        }
        ```
        
        사용할 때 전달한 값에 따라 `T`가 결정된다.
        
        ```tsx
        const name = returnValue("광수"); // string
        const id = returnValue(1);       // number
        ```
        
    - 제네릭은 입력 타입과 출력 타입의 관계를 어떻게 유지하나요?
        
        제네릭은 함수가 호출될 때 전달된 타입을 기억하고 결과에도 같은 타입을 적용한다.
        
        ```tsx
        function getFirst<T>(items: T[]): T | undefined {
          return items[0];
        }
        ```
        
        문자열 배열을 전달하면 결과는 `string | undefined`가 된다.
        
        ```tsx
        const firstName = getFirst(["광수", "지수"]);
        ```
        
        숫자 배열을 전달하면 결과는 `number | undefined`가 된다.
        
        ```tsx
        const firstId = getFirst([1, 2, 3]);
        ```
        
        `unknown`을 반환하면 입력과 출력의 관계가 사라지지만, 제네릭은 입력으로 들어온 타입을 출력까지 유지한다. 따라서 배열, 응답 데이터, 재사용 함수처럼 여러 타입에서 동일한 동작을 수행할 때 유용하다.