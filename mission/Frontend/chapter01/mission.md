# TypeScript 핵심 문법 및 타입 시스템

```
type MemberRole = "LEADER" | "MEMBER";

type StudyMember = {
  id: number;
  name: string;
  role: MemberRole;
  githubId?: string;
};

const members: StudyMember[] = [
  {
    id: 1,
    name: "세라",
    role: "LEADER",
    githubId: "Seojin5",
  },
  {
    id: 2,
    name: "에밀",
    role: "MEMBER",
  },
  {
    id: 3,
    name: "우즈",
    role: "MEMBER",
  },
];

function findMember(memberId: number) {
  const member = members.find((member) => member.id === memberId);

  if (!member) {
    return "존재하지 않는 회원입니다.";
  }

  const githubId = member.githubId ?? "등록되지 않음";

  return `${member.name} (${member.role}) - GitHub: ${githubId}`;
}

console.log(findMember(1));
console.log(findMember(2));
console.log(findMember(999));
```
<img width="377" height="62" alt="Image" src="https://github.com/user-attachments/assets/78e1577f-e61a-4343-81fd-a8827ef90e04" />