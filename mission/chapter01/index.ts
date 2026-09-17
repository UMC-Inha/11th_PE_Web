type StudyRole = "LEADER" | "MEMBER";

interface StudyMember {
  id: number;
  name: string;
  role: StudyRole;
  githubId?: string;
}

type StudyMemberByType = {
  id: number;
  name: string;
  role: StudyRole;
  githubId?: string;
};

const studyMembers: StudyMember[] = [
  {
    id: 1,
    name: "member1",
    role: "LEADER",
    githubId: "member1-dev",
  },
  {
    id: 2,
    name: "member2",
    role: "MEMBER",
  },
];

const memberWrittenWithType: StudyMemberByType = studyMembers[0];

function findStudyMember(memberId: number) {
  return studyMembers.find((member) => member.id === memberId);
}

function createMemberGuide(memberId: number) {
  const member = findStudyMember(memberId);

  if (!member) {
    return `ID ${memberId}번 회원을 찾을 수 없어요.`;
  }

  const githubGuide = member.githubId
    ? `GitHub: ${member.githubId}`
    : "GitHub 아이디가 아직 등록되지 않았어요.";

  return `${member.name}님은 ${member.role} 역할입니다. ${githubGuide}`;
}

function formatMemberId(input: unknown) {
  if (typeof input === "number") {
    return `숫자 회원 ID: ${input}`;
  }

  if (typeof input === "string") {
    return `문자열 회원 ID: ${input}`;
  }

  return "회원 ID 형식을 확인할 수 없어요.";
}

const studyHour: number | undefined = 0;
const hourWithOr = studyHour || 1;
const hourWithNullish = studyHour ?? 1;

console.log(createMemberGuide(1));
console.log(createMemberGuide(2));
console.log(createMemberGuide(999));
console.log(`type으로 작성한 회원: ${memberWrittenWithType.name}`);
console.log(`|| 결과: ${hourWithOr}, ?? 결과: ${hourWithNullish}`);
console.log(formatMemberId(1));
console.log(formatMemberId("2"));
console.log(formatMemberId(null));
