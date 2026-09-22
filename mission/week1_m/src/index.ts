type MemberRole = "leader" | "member";

interface StudyMember {
  id: number;
  name: string;
  role: MemberRole;
  githubId?: string;
}

const members: StudyMember[] = [
  { id: 1, name: "광수", role: "leader", githubId: "gwangsoo" },
  { id: 2, name: "지수", role: "member" },
];

function createMemberMessage(memberId: number): string {
  const member = members.find((item) => item.id === memberId);

  if (!member) {
    return `ID ${memberId}에 해당하는 회원이 없습니다.`;
  }

  const roleMessage = member.role === "leader" ? "리더" : "멤버";
  const githubId = member.githubId ?? "등록되지 않음";

  return `${member.name} 님은 ${roleMessage}입니다. GitHub: ${githubId}`;
}

for (const memberId of [1, 2, 999]) {
  console.log(createMemberMessage(memberId));
}
