- TypeScript와 정적 타입 검사
    - JavaScript와 비교했을 때 TypeScript는 오류를 언제, 어떤 방식으로 확인하나요?

  JavaScript는 기본적으로 실행할 때 오류가 발생하지만, TypeScript는 코드를 실행하기 전 컴파일 과정에서 타입을 검사하여 타입 오류를 미리 알려준다

  예를 들어 addScore(80,”10”)에서 JavaScript는 숫자 80과 문자열 “10”을 더해서 “8010”이라는 결과가 나오지만 TypeScript는 매개변수에 number 타입을 지정하면 tsc를 실행하는 시점에 타입 오류를 잡아낸다

    - 컴파일 타임 오류와 런타임 오류는 어떤 차이가 있나요?

  컴파일 오류 - 프로그램이 실행되기 전에 컴파일 과정에서 발견되는 오류, TypeScript에서 잘못된 타입을 사용하는 것은 컴파일 타임에 발견할 수 있음

  런타임 오류 - 프로그램이 실제로 실행되는 과정에서 발생하는 오류, 컴파일 오류를 통과해도 런타임 오류가 발생할 수 있음

    - TypeScript의 타입 정보가 실행되는 JavaScript에 남지 않는 이유는 무엇일까요?

  TypeScript의 타입 정보는 실행을 위한 정보가 아니라 컴파일 과정에서 타입을 검사하기 위한 정보이기 때문이다

  즉, tsc가 타입을 검사한 후 타입 표시를 제거하고 JavaScript 파일을 만들기 때문에 실행되는 JavaScript에는 TypeScript의 타입 정보가 남지 않는다

- 타입 추론과 타입 모델링
    - TypeScript가 타입을 추론하도록 두는 경우와 타입을 직접 작성하는 경우는 각각 언제 알맞을까요?

  값만 보고 타입을 분명하게 알 수 있다면 추론에 맡겨도 좋지만 처음 값이 없거나 함수의 매개변수처럼 어떤 값이 들어올지 알려 줘야 하는 곳에는 타입을 직접 적는 것이 알맞다

  예를 들어

  let courseName = "TypeScript";
  let lessonCount = 8;

  와 같은 코드에서는 각각  string, number로 추론할 수 있지만

  function createGreeting(studentName: string) {
  return "안녕하세요, " + studentName + " 님!";
  }

  처럼 매개변수에 string이 들어와야 한다고 알려줘야 하는 경우에는 타입을 직접 적는 것이 알맞다

    - 객체와 함수의 형태를 타입으로 표현하면 어떤 실수를 미리 찾을 수 있을까요?

  객체의 경우 필요한 프로퍼티가 빠지거나 프로퍼티의 타입이 잘못되는 실수를 미리 찾을 수 있고, 함수의 경우 잘못된 타입의 매개변수를 전달하는 실수를 찾을 수 있습니다

  예를 들어

  type StudyMember = {
  name: string;
  level: number;
  isLeader: boolean;
  };

  와 같이 타입으로 표현하면

  const member: StudyMember = {
  name: "광수",
  level: "1",
  };

  처럼 level에 문자열이 들어왔을 때 컴파일 타임에 오류를 찾아 실수를 방지할 수 있다

    - `type`과 `interface`는 표현 범위와 확장 방식에서 어떤 차이가 있을까요?

  type - 객체뿐만 아니라 원시 타입의 별칭이나 유니언 타입도 표현할 수 있고, &를 사용해서 여러 타입을 조합할 수 있다

  예를 들어, 아래처럼 MemberProfile & GithubProfile로 name과 gitbubID를 모두 가지는 MemberWithGithub 타입을 만들 수 있다

    ```jsx
    type MemberProfile = {
      name: string;
    };
    
    type GithubProfile = {
      githubId: string;
    };
    
    type MemberWithGithub = MemberProfile & GithubProfile;
    ```

  interface - 주로 객체의 모양을 표현하고 extends를 이용해 확장할 수 있다.

  예를 들어, 아래처럼 StudyStudent가 Student의 속성을 물려받으면서 level 이라는 속성을 추가할 수 있다

    ```jsx
    interface Student { 
    	name: string; 
    }  
    interface StudyStudent extends Student {
      level: number; 
    } 
    ```

  또한, 아래처럼 같은 이름으로 여러 번 선언하면 하나의 인터페이스로 합쳐지는 특징도 있다

    ```jsx
    type StudentName = string;
    
    interface StudyMember {
      name: StudentName;
    }
    
    interface StudyMember {
      level: number;
    }
    
    const member: StudyMember = {
      name: "광수",
      level: 1,
    };
    ```

- 유니언 타입과 타입 좁히기
    - 여러 타입 중 하나가 될 수 있는 값을 유니언 타입으로 표현하면 어떤 장점이 있나요?

  유니언 타입은 여러 타입을 허용하면서 아무 값이나 허용하지 않아서 사용할 수 있는 값의 범위를 명확하게 제한할 수 있음

  예를 들어,

    ```jsx
    function printMemberId(memberId: string | number) {
      console.log(memberId);
    }
    ```

  처럼 작성하면 memberID에는 string 또는 number만 들어갈 수 있다

    - 조건문, `typeof`와 판별 프로퍼티는 타입을 어떻게 좁히나요?

  유니언 타입으로 여러 타입이 지정된 경우, 조건문을 이용해 현재 값이 어떤 타입인지 확인하면서 타입의 범위를 좁힐 수 있다

  예를 들어,

    ```jsx
    function formatMemberId(memberId: string | number) {
      if (typeof memberId === "string") {
        return memberId.toUpperCase();
      }
    
      return "MEMBER-" + memberId;
    }
    ```

  처럼 작성하면 typeof memberId === "string" 인 블록 안에서는 TypeScript가 memberId를 문자열로 판단한다. 이렇게 넓은 타입을 더 구체적인 타입으로 줄이는 것이 가능하다

    - `null`과 `undefined`가 포함된 값을 안전하게 다룰 때 옵셔널 체이닝과 널 병합 연산자는 어떤 역할을 하나요?

  옵셔널 체이닝 - 옵셔널 체이닝 연산자 ?. 앞의 값이 null 또는 undefined 이면 오류를 내지 않고 undefined 를 반환한다

  예를 들어,

    ```tsx
    const githubId = foundMember?.githubId;
    ```

  foundMember가 존재하면 githubId를 가져오고, foundMember가 null이나 undefined라면 오류를 내지 않고 undefined를 반환한다

  널 병합 연산자 - undefined가 아닌 기본 값을 보여주고 싶을 때 사용

    - ?? - 왼쪽 값이 null 또는 undefined일 때만 오른쪽 기본 값 사용, 0과 빈 문자열을 유효한 값으로 유지해야 하는 경우에 사용
    - || - 왼쪽 값이 어떤 falsy 값이든 오른쪽 기본 값을 사용, 모든 flasy 값을 비어있는 값처럼 처리하려는 의도가 분명한 경우에 사용

- 타입 안전성과 제네릭
    - `any`와 `unknown`은 타입 검사를 허용하는 방식이 어떻게 다른가요?

  any -  타입 검사를 거의 하지 않기 때문에 어떤 값이든 넣을 수 있음

  unknown - 어떤 값이든 받을 수 있지만 사용하기 전에 조건문을 이용해 타입을 확인해야함

    - 여러 타입을 받을 때 `unknown`과 제네릭은 각각 어떤 상황에 알맞을까요?

  둘 다 여러 타입을 받을 수 있지만, 제네릭은 들어온 타입을 그대로 유지해야 할 때 사용한다

  예를 들어,

    ```jsx
    function test(value: unknown) {
      return value;
    }
    
    const result = test(10);
    ```

  unknown은 이 경우에 result가 unknown이지만

    ```jsx
    function test<T>(value: T) {
      return value;
    }
    
    const result = test(10);
    ```

  제네릭은 이 경우 T가 number로 결정되기 때문에 result도 number가 된다

  즉, unknown - 타입을 모르는 값을 안전하게 받기
  제네릭 - 받은 값의 타입을 유지하면서 사용하기

    - 제네릭은 입력 타입과 출력 타입의 관계를 어떻게 유지하나요?

  제네릭은 입력 받은 타입을 반환 값까지 그대로 연결하여 출력 시에도 타입을 유지할 수 있다