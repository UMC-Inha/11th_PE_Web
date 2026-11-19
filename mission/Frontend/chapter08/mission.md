- 필수 미션
    1. 로그인 전용 폴더 만들기

![image1.png](images/image1.png)

  기존의 me.tsx → _auth.me.tsx

  me-edit.tsx → _auth.me-edit.tsx

    ```jsx
    import {
      createFileRoute,
      Outlet,
      redirect,
    } from "@tanstack/react-router";
    import { useAuthStore } from "../../stores/auth-store";
    
    export const Route = createFileRoute("/(authenticated)/_auth")({
      beforeLoad: () => {
        const accessToken = useAuthStore.getState().accessToken;
    
        if (!accessToken) {
          throw redirect({ to: "/login" });
        }
      },
      component: AuthLayout,
    });
    
    function AuthLayout() {
      return <Outlet />;
    }
    ```

  로그인한 사용자만 들어갈 수 있게 beforeLoad로 페이지를 보여주기 전에 실행되어 auth-store로 토큰을 받고 토큰이 없으면 login창, 있으면 허용된다.

    1.