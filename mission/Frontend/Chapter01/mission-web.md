- 필수 미션

    ```tsx
    type StudyRole = "LEADER" | "MEMBER";
    
    interface StudyMember {
      id: number;
      name: string;
      role: StudyRole;
      githubId?: string;
    }
    ```

  회원 ID로 배열에서 회원을 찾고, 없는 회원은 먼저 확인해서 오류가 나지 않도록 처리했다. GitHub ID는 선택 값으로 두어서 없는 경우에는 "아직 등록되지 않았어요"라는 안내가 나오게 했다.

    ```
    멤버1님은 LEADER 역할입니다. GitHub: member-dev
    멤버2님은 MEMBER 역할입니다. GitHub 아이디가 아직 등록되지 않았어요.
    ID 999번 회원을 찾을 수 없어요.
    ```

  `pnpm exec tsc --noEmit`으로 타입 검사를 통과했고, 컴파일한 뒤 `node dist/index.js`로 실행 결과도 확인했다.

- 선택 미션

  ### 1. `type`과 `interface`

  `StudyMember`와 같은 모양을 `StudyMemberByType`이라는 `type`으로도 작성해서 같은 회원 객체를 넣어 봤다.

  `type`과 `interface` 모두 객체의 필드 모양을 정해서 타입 검사에 쓸 수 있다는 점은 같다.

  `interface`는 같은 이름으로 선언을 추가해 확장할 수 있고, `type`은 유니언이나 교차 타입처럼 여러 타입을 조합하는 표현에 더 유연하다.

  ### 2. `||`와 `??`

    ```tsx
    const studyHour: number | undefined = 0;
    const hourWithOr = studyHour || 1;
    const hourWithNullish = studyHour ?? 1;
    ```

  실행 결과는 `|| 결과: 1, ?? 결과: 0`이었다. `||`는 `0`도 false로 판단해서 기본값 `1`을 사용하지만, `??`는 `null`이나 `undefined`일 때만 기본값을 사용한다.

  ### 3. `unknown` 값 구분하기

    ```tsx
    function formatMemberId(input: unknown) {
      if (typeof input === "number") return `숫자 회원 ID: ${input}`;
      if (typeof input === "string") return `문자열 회원 ID: ${input}`;
      return "회원 ID 형식을 확인할 수 없어요.";
    }
    ```

  `unknown`은 바로 사용하지 않고 `typeof`로 타입을 확인한 다음에 사용했다. 숫자 `1`, 문자열 `"2"`, `null`을 넣어 각각 숫자 ID, 문자열 ID, 확인 불가 메시지가 나오는 것을 확인했다.