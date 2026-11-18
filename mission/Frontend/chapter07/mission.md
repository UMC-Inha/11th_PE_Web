1. 로그인 화면
   !(images\image(13).png)

2. 내 정보
   !(images\image(15).png)

3. 내 정보 수정
   !(images\image(14).png)

4. API 응답 형식
   API 하나당 파일 하나에, 요청과 응답 타입을 함께 적음

```ts
//src/api/members/get-my-info.ts
export interface MyInfo {
  email: string;
  nickname: string;
  createdAt: string;
}

export const MY_INFO_QUERY_KEY = ["members", "me"];

export function getMyInfo() {
  return apiClient
    .get("members/me")
    .json<MyInfo | { result: MyInfo }>()
    .then(unwrapResponse);
}
```

5. 인증: 토큰
   zustand에 두면 헤더 같은 컴포넌트가 로그인 상태가 바뀔 때 자동으로 다시 그려지고, persist로 localStorage에 저장하면 새로고침해도 로그인이 유지됨

```ts
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      setAccessToken: (accessToken) => set({ accessToken }),
      logout: () => set({ accessToken: null }),
    }),
    {
      name: "umcine-auth-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
```

6. 인가
   로그인하지 않은 사람은 내 정보 페이지에 들어가지 못하게 막음

```ts
export function requireAuth() {
  const { accessToken } = useAuthStore.getState();
  if (!accessToken) {
    alert("로그인이 필요해요.");
    throw redirect({ to: "/login" });
  }
}
```
