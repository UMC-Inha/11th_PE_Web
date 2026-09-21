## 필수 미션

```javascript
"use strict";
// 회원의 ID, 이름, 역할과 선택 값인 GitHub 아이디를 타입으로 표현하고,
// 서로 다른 정보를 가진 회원 두 명 이상을 작성해요.
type Member = {
  id: string;
  name: string;
  role: string;
  githubId?: string;
};

const dohun: Member = {
  id: "1",
  name: "도훈",
  role: "leader",
  githubId: "dohun415",
};
const minki: Member = {
  id: "2",
  name: "민기",
  role: "member",
};
const members: Member[] = [dohun, minki];

function checkMember(id: string): Member | null {
  const member = members.find((m) => m.id === id);
  return member ?? null;
}

function printMessage(id: string) {
  const member = checkMember(id);
  if (member === null) {
    console.log(`[ID: ${id}] 회원을 찾을 수 없습니다: null`);
    return;
  }

  const githubText = member.githubId ? `GitHub: ${member.githubId}` : "GitHub: 없음";
  console.log(`[ID: ${member.id}] 이름: ${member.name}, 역할: ${member.role}, ${githubText}`);
}

printMessage("1");
printMessage("2");
printMessage("999");
```

