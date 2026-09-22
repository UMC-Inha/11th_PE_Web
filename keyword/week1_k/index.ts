// 2. 컴파일 타임과 런타임
{
  function introduceStudent(studentName: string, currentLevel: number) {
    return studentName + " 님은 현재 " + currentLevel + "레벨이에요.";
  }

  // introduceStudent("광수", "1"); // string을 number 자리에 전달하면 컴파일 오류
  console.log(introduceStudent("광수", 1));
  // const names = ["광수"];
  // console.log(names[5].toUpperCase()); // 기본 설정에서는 런타임 오류가 날 수 있음
}

// 3. 값의 종류와 타입 추론
{
  let studentName = "광수"; // string
  let currentWeek = 1; // number
  let isCompleted = false; // boolean
  const monthlySkills: string[] = ["HTML", "CSS", "TypeScript"];
  // monthlySkills.push(123); // number는 string[]에 넣을 수 없음

  const firstMember = { name: "광수" };
  const secondMember = { name: "광수" };
  console.log(studentName, currentWeek, isCompleted, monthlySkills);
  console.log(firstMember === secondMember); // false
}

// 4. 객체와 함수 타입
{
  type StudyMember = { name: string; level: number; isLeader: boolean };
  const member: StudyMember = { name: "광수", level: 1, isLeader: false };

  function createMemberCard(studyMember: StudyMember) {
    return studyMember.name + " 님, " + studyMember.level + "레벨";
  }

  console.log(createMemberCard(member)); // 반환 타입은 string으로 추론
}

// 5. 리터럴 유니언 타입
{
  type MemberRole = "leader" | "member";

  function getRoleMessage(role: MemberRole) {
    if (role === "leader") return "스터디를 이끌어요.";
    return "스터디에 참여해요.";
  }

  console.log(getRoleMessage("leader"));
  console.log(getRoleMessage("member"));
  // getRoleMessage("manager"); // 허용하지 않은 역할이라 컴파일 오류
}

// 6. null, undefined, 옵셔널 체이닝과 널 병합
{
  type StudyMember = { name: string; githubId?: string };
  const members: StudyMember[] = [
    { name: "광수", githubId: "gwangsoo" },
    { name: "지수" },
  ];
  let selectedMember: StudyMember | null = null;
  const foundMember = members.find((member) => member.name === "현우");
  console.log(selectedMember); // null
  console.log(foundMember); // undefined

  if (foundMember) console.log(foundMember.name);
  else console.log("회원을 찾지 못했어요.");

  const studyHour: number | undefined = 0;
  console.log(studyHour || 1); // 1
  console.log(studyHour ?? 1); // 0
  console.log(foundMember?.githubId ?? "등록되지 않음");
}

// 7. unknown 값 좁히기
{
  function formatStudyWeek(week: unknown) {
    if (typeof week === "number") return "현재 " + week + "주차예요.";
    if (typeof week === "string") return "입력한 주차: " + week;
    return "주차를 확인할 수 없어요.";
  }

  console.log(formatStudyWeek(1));
  console.log(formatStudyWeek("첫째"));
  console.log(formatStudyWeek(null));
}

// 8. 제네릭으로 입력과 결과의 타입 관계 지키기
{
  function createBox<T>(value: T) {
    return { value };
  }

  const nameBox = createBox("광수"); // value: string
  const scoreBox = createBox(100); // value: number
  const memberBox = createBox({ name: "광수", level: 1 });
  console.log(nameBox.value, scoreBox.value, memberBox.value);
}

// 9. strict 모드에서 타입 오류 해결하기
{
  type WeeklyGoal = { title: string; targetCount: number };
  const weeklyGoal: WeeklyGoal = {
    title: "TypeScript 예제 연습",
    targetCount: 3,
  };

  function printGoal(goal: WeeklyGoal): string {
    const message = goal.title + ": " + goal.targetCount + "개";
    console.log(message);
    return message;
  }

  printGoal(weeklyGoal);
}
