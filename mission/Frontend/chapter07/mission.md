#### 1. 라우트 구성

| 화면 | 경로 | 라우트 파일 | 화면 컴포넌트 |
| --- | --- | --- | --- |
| 로그인 | `/login` | `routes/login.tsx` | `pages/auth/login-page.tsx` |
| 내 정보 | `/me` | `routes/me.index.tsx` | `pages/me/my-page.tsx` |
| 내 정보 수정 | `/me/edit` | `routes/me.edit.tsx` | `pages/me/my-edit-page.tsx` |
- 라우트 파일은 경로와 컴포넌트만 연결하고, 화면 코드는 `pages`에 분리했다.
- 헤더의 "내 정보"는 `/me`, "로그인"은 `/login`으로 연결했다. `/me`로 시작하는 경로에서는 "내 정보" 메뉴가 활성화된다.

```tsx
// routes/login.tsx
export const Route = createFileRoute("/login")({ component: LoginPage });
```

#### 2. 로그인

```tsx
const [form, setForm] = useState({ email: "", password: "" });
const canSubmit = form.email.trim().length > 0 && form.password.length > 0;

<input
  value={form.email}
  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
/>
<button type="submit" disabled={!canSubmit}>로그인</button>
```

- 이메일과 비밀번호를 `useState`로 관리하고, 둘 다 입력해야 로그인 버튼이 활성화된다.
- 로그인 API 연결은 8주차에 진행한다.

#### 3. 내 정보

| 영역 | 내용 |
| --- | --- |
| 상단 | 제목 "내 정보", "정보 수정" 버튼 (`/me/edit`로 이동) |
| 기본 정보 | 프로필 이미지, 닉네임, 이메일 |
| 내 즐겨찾기 | 영화 카드 목록, 페이지네이션 |
- 회원 정보는 8주차에 `GET /members/me`로 교체할 예정이라 지금은 가짜 데이터로 채웠다.

#### 4. 내 정보 수정

```tsx
const [nickname, setNickname] = useState(MOCK_ME.nickname);
const isNicknameValid =
  nickname.trim().length >= 2 && nickname.trim().length <= 12;

<input value={nickname} onChange={(e) => setNickname(e.target.value)} />
<input value={MOCK_ME.email} readOnly />
```

- 닉네임만 수정할 수 있고 이메일은 `readOnly`로 막았다. 백엔드 `PATCH /members/me`도 닉네임만 받는다.
- 닉네임이 2~12자가 아니면 에러 문구가 뜨고 저장 버튼이 비활성화된다.

#### 5. 공통 레이아웃

- 내용이 짧은 페이지에서 푸터 아래에 빈 공간이 생겨서, `__root.tsx`를 `min-h-screen flex flex-col`로 감싸고 내용 영역에 `flex-1`을 줬다.
- 이제 모든 페이지에서 푸터가 화면 맨 아래에 붙는다.