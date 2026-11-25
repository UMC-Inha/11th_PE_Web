- ***
  요청/응답 데이터 판단 방법
  백엔드 DTO를 그대로 TypeScript 타입으로 옮김.
  ```jsx
  //login.ts
  import { apiClient } from "../api-client";
  import { unwrapResponse } from "../unwrap-response";

  export interface LoginRequest {
    email: string;
    password: string;
  }

  export interface LoginResponse {
    nickname: string;
    accessToken: string;
  }

  export function login(body: LoginRequest) {
    return apiClient
      .post("auth/login", { json: body })
      .json<LoginResponse | { result: LoginResponse }>()
      .then(unwrapResponse);
  }

  //update-me.ts
  import { authApi } from "../auth-api";
  import type { MemberInfo } from "./me";

  export interface UpdateMeRequest {
    nickname: string;
  }

  interface UpdateMeResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    result: MemberInfo;
  }

  export function updateMe(body: UpdateMeRequest) {
    return authApi.patch("members/me", { json: body }).json<UpdateMeResponse>();
  }

  ```
  ```jsx
  //update-my-info
  import { apiClient } from "../api-client";
  import { unwrapResponse } from "../unwrap-response";
  import type { MyInfo } from "./get-my-info";

  export interface UpdateMyInfoRequest {
    nickname: string;
  }

  export function updateMyInfo(body: UpdateMyInfoRequest) {
    return apiClient
      .patch("members/me", { json: body })
      .json<MyInfo | { result: MyInfo }>()
      .then(unwrapResponse);
  }
  ```
  조회 → useQuery
  화면에 데이터를 보여줘야 하면 Query. 로딩/에러 상태를 UI에 반영하고, queryKey로 캐시를
  관리
  ```jsx
  Query (데이터 조회):
    const myInfoQuery = useQuery({
      queryKey: MY_INFO_QUERY_KEY, // ["members",
    "me"]
      queryFn: getMyInfo,
    });
  ```
  생성·수정·삭제 → useMutation
  버튼 클릭으로 발생하는 요청은 Mutation. isPending으로 버튼 비활성화,
  onSuccess/onError로 결과 처리.
  ```jsx
   Mutation (생성/수정/삭제) + 성공 시 캐시 무효화:
    export function useCreateFavoriteMutation() {
      const queryClient = useQueryClient();
      const addBookmark = useBookmarkStore((state) =>
    state.addBookmark);

      return useMutation({
        mutationFn: createFavorite,
        onSuccess: (data) => {
          addBookmark(data.movieId);
                      // 로컬 store 동기화
          queryClient.invalidateQueries({ queryKey:
    MY_FAVORITES_QUERY_KEY }); // 캐시 무효화
        },
      });
    }
  ```

닉네임 중복 확인

!(images\image(13).png)

내 정보 수정

!(images\image(14).png)

평점 저장

!(images\image(15).png)
