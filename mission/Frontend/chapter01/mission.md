```ts
type MemberRole = "Leader" | "Member";


type StudyMember = {
id: number;
name: string;
role: MemberRole;
githubId?: string;
};

const members: StudyMember[] = [
{ id: 1, name: "철수", role: "Leader", githubId: "123456-dev" },
{ id: 2, name: "성현", role: "Member" },
];

function createMemberIntro(id: number): string {
const foundMember = members.find((member) => member.id === id);

if (!foundMember) {
return ID ${id}에 해당하는 회원을 찾을 수 없습니다.;
}

const githubInfo = foundMember.githubId
? GitHub: ${foundMember.githubId}
: "GitHub 계정 없음";

return ${foundMember.name} 님 (${foundMember.role}) - ${githubInfo};
}

console.log(createMemberIntro(1));
console.log(createMemberIntro(2));
console.log(createMemberIntro(999));