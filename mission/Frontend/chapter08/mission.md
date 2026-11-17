![스크린샷 2026-11-18 061155.png](images/%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7%202026-11-18%20061155.png)
```tsx
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequireAuth } from "../../../components/auth/require-auth";

export const Route = createFileRoute("/(protected)/me")({
  component: () => <RequireAuth><Outlet /></RequireAuth>,
});

```
![스크린샷 2026-11-18 061606.png](images/%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7%202026-11-18%20061606.png)
![스크린샷 2026-11-18 061913.png](images/%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7%202026-11-18%20061913.png)
![스크린샷 2026-11-18 062052.png](images/%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7%202026-11-18%20062052.png)
![스크린샷 2026-11-18 062125.png](images/%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7%202026-11-18%20062125.png)
![스크린샷 2026-11-18 062155.png](images/%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7%202026-11-18%20062155.png)
![스크린샷 2026-11-18 062229.png](images/%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7%202026-11-18%20062229.png)
![스크린샷 2026-11-18 062248.png](images/%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7%202026-11-18%20062248.png)