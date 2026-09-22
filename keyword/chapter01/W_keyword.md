- TypeScript와 정적 타입 검사
    - JavaScript와 비교했을 때 TypeScript는 오류를 언제, 어떤 방식으로 확인하나요?
        - **JavaScript**
            - **런타임** 때 오류를 발견
            - 코드를 직접 실행해야 타입과 관련된 문제를 알 수 있는 경우가 많음
        - **TypeScript**
            - **컴파일** 시에 오류를 발견
            - 실행 전에 변수, 함수의 매개변수, 반환값 등의 **타입이 올바른지 검사**
            - 런타임에서 발생할 수 있는 오류를 **미리 줄일 수 있음**
    - 컴파일 타임 오류와 런타임 오류는 어떤 차이가 있나요?
        - **컴파일 타임 오류**
            - 소스 코드를 실행하기 전인 **컴파일하는 과정에서 발생하는 오류**
            - 오류가 있으면 정상적으로 컴파일되지 않아 프로그램 실행이 어려움
            - 보통 컴파일러가 **어느 코드에서 문제가 발생했는지 알려줌**
            - 대표적인 예시
                - 문법 오류(Syntax Error)
                - 잘못된 타입 사용
                - 존재하지 않는 변수나 함수 사용
                - 파일 또는 라이브러리 참조 오류
        - **런타임 오류**
            - 프로그램이 정상적으로 컴파일되었지만 **실행 중에 발생하는 오류**
            - 컴파일 단계에서는 발견되지 않고 실제 해당 코드가 실행될 때 발생
            - 대표적인 예시
                - `null`, `undefined` 값에 접근
                - 0으로 나누기
                - 존재하지 않는 배열 위치에 잘못 접근
                - 예상하지 못한 입력이나 데이터로 인한 예외
                - 프로그램 실행 중 충돌
    - TypeScript의 타입 정보가 실행되는 JavaScript에 남지 않는 이유는 무엇일까요?
        - TypeScript의 타입 정보는 **코드를 실행하기 위한 정보가 아니라, 실행 전에 오류를 검사하기 위한 정보**
        - TypeScript는 컴파일 과정에서 string, number 같은 타입이 올바르게 사용되었는지 확인함
        - 타입 검사가 끝나면 실제 프로그램을 실행하는 데에는 타입 정보가 필요하지 않기 때문에 제거
        - JavaScript 엔진은 TypeScript의 타입 문법을 이해하지 못하므로, JavaScript로 변환할 때 타입 정보가 사라짐
        - 이렇게 컴파일 과정에서 타입 정보가 제거되는 것을 **타입 소거(Type Erasure)**라고 한다.

        ```
        TypeScriptletage**:number**=21;
        ```

      ↓ 컴파일

        ```
        **JavaScriptletage=21;**
        ```

- 타입 추론과 타입 모델링
    - TypeScript가 타입을 추론하도록 두는 경우와 타입을 직접 작성하는 경우는 각각 언제 알맞을까요?
        - **타입 추론을 사용하는 경우**
            - 변수에 값을 바로 넣어서 타입이 명확할 때
            - 코드가 짧고 타입이 쉽게 예상되는 경우

            ```jsx
            const name = "subin"; // string으로 추론
            const age = 21;       // number로 추론
            const isStudent = true; // boolean으로 추론
            ```

        - **타입을 직접 작성하는 경우**
            - 변수에 들어올 값의 타입을 명확하게 제한하고 싶을 때
            - **함수의 매개변수**처럼 TypeScript가 타입을 알아낼 수 없을 때

                ```jsx
                const add = (**a: number, b: number**) => {
                  return a + b;
                };
                ```

            - 객체의 구조를 미리 정하고 싶을 때

                ```jsx
                **type User = {
                  name: string;
                  age: number;
                };**
                
                const user: User = {
                  name: "수빈",
                  age: 21,
                };
                ```

            - null, 여러 타입 등 **가능한 타입을 명확하게 표현해야 할 때**

                ```jsx
                let selectedUser: User | null = null;
                ```

    - 객체와 함수의 형태를 타입으로 표현하면 어떤 실수를 미리 찾을 수 있을까요?
        - 객체나 함수를 잘못 사용하는 실수를 **컴파일 단계에서 미리 발견할 수 있음**
        - 코드가 어떤 데이터를 필요로 하고 어떤 값을 반환하는지 명확해짐
        - 다른 사람이 코드를 사용할 때도 올바른 사용 방법을 쉽게 알 수 있음
    - `type`과 `interface`는 표현 범위와 확장 방식에서 어떤 차이가 있을까요?
        - **표현 범위**
            - type은 **객체뿐만 아니라 문자열, 숫자, 유니언( | ), 튜플 등 다양한 타입**을 표현 가능

                ```tsx
                type Name = string;
                
                type Status = "ready" | "done";
                
                type Point = [number, number];
                z`
                type User = {
                  name: string;
                  age: number;
                };
                ```

            - interface는 주로 **객체가 어떤 프로퍼티를 가져야 하는지 객체의 형태를 정의할 때** 사용

                ```tsx
                interface User {
                  name: string;
                  age: number;
                }
                ```

        - **확장 방식**
            - type은 &를 이용한 **교차 타입(Intersection Type)**으로 여러 타입을 조합
                - 조합된 타입은 양쪽의 프로퍼티를 모두 가진다

                    ```tsx
                    type Member = {
                      name: string;
                    };
                    
                    type GithubProfile = {
                      githubId: string;
                    };
                    
                    type MemberWithGithub = Member & GithubProfile;
                    ```

                    ```tsx
                    const member: MemberWithGithub = {
                      **name: "수빈",
                      githubId: "subin",**
                    };
                    ```

            - interface는 extends를 사용해 기존 인터페이스를 **상속해서 확장**함 ****
                - 여러 인터페이스를 동시에 확장하는 것도 가능하다

                    ```tsx
                    interface MemberProfile {
                      name: string;
                    }
                    
                    interface GithubProfile {
                      githubId: string;
                    }
                    
                    interface StudyInfo {
                      level: number;
                    }
                    
                    // 여러 인터페이스 확장
                    interface StudyMember extends MemberProfile, GithubProfile, StudyInfo {
                      isActive: boolean;
                    }
                    
                    const member: StudyMember = {
                      name: "수빈",
                      githubId: "subin",
                      level: 1,
                      isActive: true,
                    };
                    ```

        - 추가로 interface는 **같은 이름으로 다시 선언하면 선언 병합(Declaration Merging)**이 일어날 수 있지만, type은 같은 이름으로 다시 선언할 수 없다

        ```tsx
        interface Member {
          name: string;
        }
        
        interface Member {
          level: number;
        }
        
        // 최종적으로
        // { name: string; level: number; }
        ```

        - type은 반대로 같은 이름으로 선언이 아예 불가능하다

        ```tsx
        type Member = {
          name: string;
        };
        
        type Member = {  //같은 이름으로 다시 선언 불가
          level: number;
        };
        ```

- 유니언 타입과 타입 좁히기
    - 여러 타입 중 하나가 될 수 있는 값을 유니언 타입으로 표현하면 어떤 장점이 있나요?
        - 유니언 타입은 `|`를 사용해서 **하나의 값이 여러 타입 중 하나를 가질 수 있도록 표현**
            - 특정한 문자열 정해놓고 그 문자열 중에서만 값을 받는 것도 가능
        - 실제로 들어올 수 있는 값의 범위를 타입으로 명확하게 나타냄
        - 허용하지 않은 타입의 값이 들어오는 실수를 컴파일 단계에서 확인할 수 있게된다

            ```tsx
            type Status = "ready" | "running" | "done";
            
            let status: Status = "ready";
            
            status = "done";  // 가능
            status = "error"; // 오류
            ```

    - 조건문, `typeof`와 판별 프로퍼티는 타입을 어떻게 좁히나요?
        - **타입 좁히기 :** 여러 타입이 가능한 값에서 조건을 검사하여, **특정 코드 안에서는 더 구체적인 타입으로 판단하도록 만드는 것**

      ### 조건문 + typeof

      유니언 타입은 처음에는 어떤 타입인지 확실하지 않기 때문에 해당 타입만의 기능을 바로 사용할 수 없음

        ```tsx
        function printValue(value: string | number) {
          if (typeof value === "string") {
            console.log(value.toUpperCase());
          } else {
            console.log(value.toFixed(2));
          }
        }
        ```

        - typeof value === "string" 조건 안에서는 value를 string으로 좁힘
        - else에서는 string이 아니므로 number로 좁힘
        - 이렇게 조건을 이용해 타입을 판별하는 것을 **타입 가드(Type Guard)**라고 한다

      ### 판별 프로퍼티

      객체의 경우에는 **공통으로 가지고 있는 특정 프로퍼티의 값**을 기준으로 타입을 구분한다

        ```tsx
        type Dog = {
          **type: "dog";**
          bark: () => void;
        };
        
        type Cat = {
          **type: "cat";**
          meow: () => void;
        };
        
        function makeSound(animal: Dog | Cat) {
          if (animal.type === "dog") {
            animal.bark();
          } else {
            animal.meow();
          }
        }
        ```

      여기서 type이 **판별 프로퍼티**

        - animal.type === "dog" → Dog 타입으로 좁힘
        - animal.type === "cat" → Cat 타입으로 좁힘
    - `null`과 `undefined`가 포함된 값을 안전하게 다룰 때 옵셔널 체이닝과 널 병합 연산자는 어떤 역할을 하나요?
        - **옵셔널 체이닝(?.)**
            - 값이 null 또는 undefined일 수 있을 때 안전하게 속성에 접근하기 위한 연산자
            - 값이 존재하지 않을 경우 오류를 발생시키는 대신 undefined 반환
            - 값의 존재 여부를 확인하면서 속성에 접근할 때 사용
        - **널 병합 연산자(??)**
            - 왼쪽 값이 null 또는 undefined일 경우 오른쪽의 기본값을 사용하는 연산자
            - 값이 존재하지 않을 때 사용할 기본값 지정 가능
            - 0, false, 빈 문자열은 그대로 유지
        - **?.를 사용하면 값이 없을 때 발생할 수 있는 오류 방지 가능**
        - **??를 사용하면 값이 없을 때 사용할 기본값 지정 가능**
        - 두 연산자를 함께 사용하여 null이나 undefined가 포함될 수 있는 값을 안전하게 처리 가능

        ```tsx
        **const displayGithubId = foundMember?.githubId ?? "등록되지 않음";** 
        console.log(displayGithubId); // "등록되지 않음"
        ```

- 타입 안전성과 제네릭
    - `any`와 `unknown`은 타입 검사를 허용하는 방식이 어떻게 다른가요?
        - **any**
            - 어느 값이든 값 저장 가능
            - 바로 사용 가능
            - 타입 검사를 끄기 때문에 타입 오류를 놓치기가 쉽다
        - **unknown**
            - 어느 값이든 값 저장 가능
            - 사용 전에 타입 검사를 하고 사용해야함
                - 타입 좁히기 안하면 에러!!
                - 값을 받는 것 자체는 가능
                - 바로 속성 접근이나 연산 불가능
    - 여러 타입을 받을 때 `unknown`과 제네릭은 각각 어떤 상황에 알맞을까요?
        - **unknown**
            - 어떤 타입의 값이 들어올지 미리 알 수 없는 경우 사용
            - 값을 사용하기 전에 typeof 등의 타입 검사 필요
            - 외부 API 응답이나 사용자 입력처럼 타입을 확신하기 어려운 값 처리에 적합
            - 타입을 확인한 뒤 안전하게 사용하기 위한 목적
        - **제네릭**
            - 여러 타입을 받을 수 있으면서 입력된 타입 정보를 그대로 유지하고 싶은 경우 사용
            - 함수나 클래스 등을 다양한 타입에서 재사용할 때 적합
            - 입력 타입과 반환 타입의 관계를 유지할 수 있다는 장점
        - **unknown은 들어오는 값의 타입을 모를 때 안전하게 검사하기 위한 타입**
        - **제네릭은 여러 타입을 지원하면서도 전달된 타입 정보를 유지하기 위한 기능**
    - 제네릭은 입력 타입과 출력 타입의 관계를 어떻게 유지하나요?
        - **제네릭은 T와 같은 타입 매개변수를 사용하여 입력된 타입 정보를 저장하고 출력까지 전달하는 방식**
        - 함수의 매개변수와 반환 타입에 같은 T를 사용하면 입력 타입과 출력 타입을 동일하게 유지 가능

        ```tsx
        function keepValue<T>(value: T): T {
          return value;
        }
        
        const name = keepValue("광수"); // string
        const level = keepValue(1);    // number
        ```

        - 타입을 직접 지정하지 않아도 전달된 값을 기준으로 TypeScript가 T를 자동 추론
        - any와 달리 입력된 타입 정보를 잃지 않고 반환값까지 유지 가능
        - 하나의 함수를 여러 타입에 사용할 수 있으면서 각 타입에 맞는 타입 검사도 유지 가능