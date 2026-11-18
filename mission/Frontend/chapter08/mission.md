**1. 로그인 전용 라우트 그룹 만들기**

`/profile`과 `/profile/edit`를 `(authenticated)` 폴더로 묶었다. 공통 레이아웃에서 토큰을 확인하고, 로그인 상태면 `<Outlet />`으로 하위 화면을 보여 준다. 토큰이 없으면 `/login`으로 이동한다.

```tsx
export const Route = createFileRoute("/(authenticated)/_layout")({
  beforeLoad: () => {
    if (!useAuthStore.getState().accessToken) {
      throw redirect({ to: "/login", replace: true });
    }
  },
  component: function AuthenticatedLayout() {
    const accessToken = useAuthStore((state) => state.accessToken);
    return accessToken ? <Outlet /> : <Navigate to="/login" replace />;
  },
});
```

**2. 즐겨찾기 목록과 추가·해제 연결하기**

마이페이지는 `GET /favorites`로 받은 영화 ID를 TMDB 정보와 연결해 제목과 포스터를 표시한다. 영화 상세는 `GET /favorites/{movieId}`로 현재 상태를 확인하고, 버튼을 누르면 추가 또는 해제한다. 변경 후 목록 캐시를 무효화해 다른 화면에도 반영되도록 했다.

```tsx
mutationFn: (isFavorite: boolean) =>
  isFavorite ? removeFavorite(movieId) : addFavorite(movieId),
```

**3. 영화 상세에서 평점 등록·수정·삭제하기**

`GET /members/{memberId}/ratings`로 내 평점을 불러오고, 현재 영화의 평점이 있는지 확인했다. 저장된 평점이 있으면 별점과 후기를 폼에 채우고, 저장 시 `ratingId`로 수정한다. 평점이 없으면 새로 등록한다. 삭제도 `ratingId`로 요청하며, 변경에 성공하면 조회 캐시에 바로 반영한다.

```tsx
if (change.action === "delete") {
  await deleteRating(change.ratingId);
  return null;
}

const input = { score: change.score, comment: change.comment };
return change.ratingId === undefined
  ? createRating(movieId, input)
  : updateRating(change.ratingId, input);
```

- 선택 미션