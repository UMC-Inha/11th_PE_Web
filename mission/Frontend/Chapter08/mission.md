- 필수 미션

  **1. 로그인 전용 라우트 구성**

    - 마이페이지와 내 정보 수정 라우트를 `(authenticated)/_auth/` 아래로 이동.
    - Route Group으로 관련 파일을 묶고, 경로에 드러나지 않는 공통 Layout Route에서 토큰 확인 → 없으면 로그인 페이지로 이동. `Outlet`으로 하위 페이지 표시.

    ```tsx
    export const Route = createFileRoute("/(authenticated)/_auth")({
      beforeLoad: () => {
        if (!useAuthStore.getState().accessToken) {
          throw redirect({ to: "/login" });
        }
      },
      component: () => <Outlet />,
    });
    ```

    - 로그인 전 `/my`, `/my-edit` 접근 시 `/login`으로 이동하는 것 확인.

  **2. 즐겨찾기 조회·등록·삭제 연결**

    - `authApi`로 로컬 백엔드의 즐겨찾기 API 4개 연결. 마이페이지는 `GET /favorites`로 목록을 받고, 영화 ID별 TMDB 상세 정보를 조회해 제목·포스터·개봉일 표시.
    - 한 페이지에 5편씩 표시하고, 로딩·오류·빈 목록을 구분.

    ```tsx
    const favoritesQuery = useQuery({
      queryKey: ["favorites", "list"],
      queryFn: getFavorites,
      enabled: Boolean(accessToken),
    });
    
    const movieQueries = useQueries({
      queries: visibleFavorites.map((favorite) =>
        getMovieDetailOptions(favorite.movieId),
      ),
    });
    ```

    - 카드와 상세 화면에서 같은 `useFavorite(movieId)` 훅 사용. `GET /favorites/{movieId}`로 여부 조회 후 현재 상태에 따라 등록·삭제 요청.
    - 성공 시 해당 영화의 상태 캐시는 직접 갱신하고, 목록 캐시는 무효화 → 마이페이지에서도 변경 반영.

    ```tsx
    onSuccess: async (isFavorite) => {
      queryClient.setQueryData(statusQueryKey, isFavorite);
    
      await queryClient.invalidateQueries({
        queryKey: ["favorites", "list"],
      });
    },
    ```

    - 등록·해제 후 아이콘과 문구, 영화 목록·상세·마이페이지의 즐겨찾기 반영 확인.

  **3. 내 평점 조회·등록·수정·삭제 연결**

    - `GET /members/{memberId}/ratings`로 로그인한 회원의 평점 조회. 회원 ID는 토큰의 `sub`에서 읽고, 회원·영화 ID를 query key에 포함.
    - 응답은 `result`로 감싼 객체가 아닌 평점 배열. 10개씩 조회하면서 현재 영화의 평점을 찾고, 마지막 페이지까지 없으면 `null` 반환.
    - `RatingForm`으로 입력 영역 분리. 조회한 별점·후기로 초기화하고, 입력 중인 값은 `useState`로 관리.
    - 기존 평점이 없으면 `POST /ratings`, 있으면 `PATCH /ratings/{ratingId}` 호출. 수정·삭제 주소에는 영화 ID 대신 `ratingId` 사용.

    ```tsx
    const saveMutation = useMutation({
      mutationFn: (body: RatingInput) => {
        if (rating) {
          return updateRating(rating.ratingId, body);
        }
    
        return createRating({
          movieId,
          ...body,
        });
      },
    
      onSuccess: (savedRating) => {
        queryClient.setQueryData<Rating | null>(
          ratingQueryKey,
          savedRating,
        );
      },
    });
    ```

    ```tsx
    const deleteMutation = useMutation({
      mutationFn: deleteRating,
    
      onSuccess: () => {
        queryClient.setQueryData<Rating | null>(
          ratingQueryKey,
          null,
        );
      },
    });
    ```

    - 등록·수정 성공 응답으로 조회 캐시 갱신, 삭제 성공 시 `null` 저장. 영화·평점 ID와 수정 시각을 폼의 `key`에 반영해 저장 결과가 달라지면 입력값도 초기화.
    - 별점은 1~5점 정수, 후기는 최대 500자. 요청 중 입력과 버튼 비활성화, 실패 시 안내 표시.
    - 평점 조회·등록·수정·삭제 동작 확인 완료. 최종 코드의 `pnpm build` 성공.