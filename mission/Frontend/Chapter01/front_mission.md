- 필수 미션
    
    ### 1. 코드
    
    ```tsx
    type MemberRole = "스터디장" | "스터디원";
    
    interface StudyMember {
      id: number;
      name: string;
      role: MemberRole;
      githubId?: string;
    }
    
    const members: StudyMember[] = [
      {
        id: 1,
        name: "진진",
        role: "스터디원",
        githubId: "JIEUN233",
      },
      {
        id: 2,
        name: "유리",
        role: "스터디장",
      },
      {
        id: 3,
        name: "제로",
        role: "스터디원",
      }
    ];
    
    function createMemberGuide(
      memberId: number,
      memberList: StudyMember[]
    ): string {
      const member = memberList.find(({ id }) => id === memberId);
    
      if (!member) {
        return `ID가 ${memberId}인 회원을 찾을 수 없습니다.`;
      }
    
      const githubGuide =
        member.githubId !== undefined
          ? `GitHub 아이디는 ${member.githubId}입니다.`
          : "등록된 GitHub 아이디가 없습니다.";
    
      return `${member.name}님은 ${member.role}입니다. ${githubGuide}`;
    }
    
    console.log(createMemberGuide(1, members));
    console.log(createMemberGuide(2, members));
    console.log(createMemberGuide(3, members));
    console.log(createMemberGuide(999, members));
    ```
    
    ### 2. 결과
    
    !image.png