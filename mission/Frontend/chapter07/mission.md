- 필수 미션
    1. **로그인 화면 연결**
        
        `/login`에 이메일·비밀번호 입력 폼을 만들었다. 이메일 형식이 올바르고 비밀번호가 입력되면 로그인 버튼이 활성화된다. 헤더와 회원가입 화면에서 로그인 페이지로 이동할 수 있도록 연결했다. 실제 인증은 이후 API 연결 단계에서 구현할 예정이다.
        
        ```tsx
        const canSubmit = isEmailValid && password.length > 0;
        
        <button disabled={!canSubmit}>로그인</button>
        ```
        
    2. **내 정보 조회와 수정 화면 분리**
        
        `/profile`에서 내 정보를 조회하고, `/profile/edit`에서 닉네임과 프로필 이미지를 수정할 수 있게 했다. 저장하면 Zustand 상태를 갱신하고 조회 화면으로 돌아가 변경 내용을 보여 준다. 변경 사항은 새로고침 전까지 유지된다.
        
        ```tsx
        function saveProfile() {
          if (!isNicknameValid) return;
          updateProfile({ ...profile, nickname: nickname.trim(), image: preview });
          void navigate({ to: "/profile" });
        }
        ```
        
    3. **회원가입 오류와 중복 확인 안내 정리**
        
        네 입력 필드의 오류를 해당 필드 아래에 빨간 글씨로 표시했다. 이메일과 닉네임은 서버의 `available` 응답에 따라 사용 가능 여부를 팝업으로 안내한다. 로컬 백엔드를 `8080` 포트에 연결한 뒤 두 중복 확인 API의 정상 응답을 확인했다.
        
        ```tsx
        const isAvailable = response.available === true;
        
        alert(
          isAvailable
            ? `사용할 수 있는 ${label}이에요.`
            : `이미 사용 중인 ${label}이에요.`,
        );
        ```
        
    
    !image.png
    
    !image.png
    
    !image.png
    
- 선택 미션