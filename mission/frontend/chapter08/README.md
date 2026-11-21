# chapter08

## 1. 구현 방법

### 로그인 전용 라우트 구성

마이페이지와 내 정보 수정 페이지처럼 로그인한 사용자만 접근할 수 있는 페이지를 공통 라우트로 묶었다.

TanStack Router의 Pathless Layout Route를 활용하여 `src/routes/_authenticated/` 폴더를 생성하고, 해당 폴더에 마이페이지와 내 정보 수정 페이지의 라우트 파일을 배치했다.

```
src/routes/
└── _authenticated/
    ├── route.tsx
    ├── mypage.tsx
    └── mypage_.edit.tsx
```

`_authenticated`는 실제 URL에 포함되지 않으면서 하위 페이지에 공통 로직을 적용할 수 있는 라우트이다.

### 로그인 여부 검사

`_authenticated/route.tsx`에서 `beforeLoad`를 사용하여 페이지에 접근하기 전에 로그인 여부를 확인하도록 구현했다.

Zustand Store에 저장된 `accessToken`을 확인하고, 토큰이 없으면 `redirect`를 사용하여 로그인 페이지로 이동하도록 처리했다.

```tsx
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuthStore } from "../../stores/auth-store";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: () => {
    const accessToken = useAuthStore.getState().accessToken;

    if (!accessToken) {
      throw redirect({ to: "/login" });
    }
  },
  component: () => <Outlet />,
});
```

또한 `<Outlet />`을 사용하여 로그인한 사용자가 접근했을 때 하위 페이지가 렌더링되도록 구성했다.

### 마이페이지 및 내 정보 수정 라우트 이동

기존에 개별적으로 관리하던 마이페이지와 내 정보 수정 라우트를 `_authenticated` 폴더로 이동했다.

마이페이지는 `/_authenticated/mypage` 경로로 등록하고, 기존 `MyPage` 컴포넌트를 연결했다.

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { MyPage } from "../../pages/mypage/my-page";

export const Route = createFileRoute("/_authenticated/mypage")({
  component: MyPage,
});
```

내 정보 수정 페이지는 `mypage_.edit.tsx` 파일로 구성하여 기존 `EditPage` 컴포넌트를 연결했다.

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { EditPage } from "../../pages/mypage/edit-page";

export const Route = createFileRoute("/_authenticated/mypage_/edit")({
  component: EditPage,
});
```

`mypage_`의 마지막 `_`는 부모 라우트와의 중첩을 해제하는 문법이다.

이를 통해 내 정보 수정 페이지가 마이페이지 내부에 렌더링되지 않고, `/mypage/edit` 경로에서 독립적인 페이지로 표시되도록 구성했다.

### 동작 확인

로그인한 상태에서 마이페이지의 정보 수정 버튼을 클릭하면 `/mypage/edit`로 정상 이동하고, 내 정보 수정 화면이 표시되는 것을 확인했다.

또한 두 페이지 모두 `_authenticated` 라우트의 하위에 배치하여 동일한 로그인 검사 로직을 적용하도록 구성했다.
