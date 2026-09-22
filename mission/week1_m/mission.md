# 1주차 TypeScript 미션 기록

<details>
<summary>필수 미션</summary>

회원 ID, 이름, 역할, 선택적 GitHub 아이디를 타입으로 정의하고 서로 다른 회원 두 명을 작성했습니다. [전체 코드](src/index.ts)

```ts
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
  if (!member) return `ID ${memberId}에 해당하는 회원이 없습니다.`;

  const roleMessage = member.role === "leader" ? "리더" : "멤버";
  const githubId = member.githubId ?? "등록되지 않음";
  return `${member.name} 님은 ${roleMessage}입니다. GitHub: ${githubId}`;
}
```

`pnpm exec tsc --noEmit` 타입 검사, `pnpm exec tsc` 컴파일, `node dist/index.js` 실행이 모두 성공했습니다. 실행 결과:

```text
광수 님은 리더입니다. GitHub: gwangsoo
지수 님은 멤버입니다. GitHub: 등록되지 않음
ID 999에 해당하는 회원이 없습니다.
```

</details>
