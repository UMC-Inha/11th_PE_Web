- 클라이언트 상태와 서버 상태
    - 입력값, 로그인 토큰과 회원 정보는 각각 어디에서 관리하는 것이 적절할까요? 각 상태의 원본이 어디에 있는지도 함께 생각해 보세요.
        
        상태를 저장할 위치는 **그 값의 원본이 어디에 있는지**를 기준으로 정한다.
        
        ### 입력값
        
        폼 입력값의 원본은 현재 브라우저 화면에서 사용자가 입력한 값이다. 서버에서 가져온 데이터가 아니므로 클라이언트 상태다.
        
        한 화면에서만 사용한다면 `useState`나 React Hook Form으로 관리하는 것이 적절하다.
        
        ```tsx
        const [nickname, setNickname] = useState("");
        ```
        
        ```tsx
        <input
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
        />
        ```
        
        여러 화면에서 작성 중인 값을 공유해야 하는 특별한 경우에는 전역 store를 사용할 수 있지만, 일반적인 폼 입력값까지 모두 전역으로 관리할 필요는 없다.
        
        ### 로그인 토큰
        
        로그인 토큰은 서버가 인증 결과로 발급하지만, 이후 요청에 포함하기 위해 클라이언트가 보관하는 인증 정보다.
        
        브라우저에서 JavaScript로 접근할 필요가 없다면 다음과 같은 쿠키 설정을 사용하는 것이 일반적으로 더 안전하다.
        
        ```
        HttpOnly
        Secure
        SameSite
        ```
        
        `HttpOnly` 쿠키는 JavaScript로 직접 읽을 수 없고, 브라우저가 요청에 자동으로 포함한다.
        
        ```
        로그인 성공
        → 서버가 Set-Cookie 응답
        → 브라우저가 쿠키 저장
        → 이후 요청에 쿠키 자동 포함
        ```
        
        Bearer 방식으로 Access Token을 직접 헤더에 넣어야 한다면 Access Token을 메모리에 보관하고, 수명이 긴 Refresh Token은 `HttpOnly` 쿠키에 두는 방식을 고려할 수 있다.
        
        인증 토큰을 `localStorage`에 저장하면 JavaScript로 접근할 수 있어 XSS 공격이 발생했을 때 탈취될 위험이 있다.
        
        ### 회원 정보
        
        회원 이름, 이메일, 역할과 프로필 정보의 원본은 서버의 데이터베이스다. 따라서 회원 정보는 서버 상태이며 TanStack Query로 관리하는 것이 적절하다.
        
        ```tsx
        const memberQuery = useQuery({
          queryKey: ["members", "me"],
          queryFn: fetchMyProfile,
        });
        ```
        
        ```tsx
        <p>{memberQuery.data?.nickname}</p>
        ```
        
        로그인 여부도 회원 정보 조회 결과로 판단할 수 있다.
        
        ```
        내 정보 조회 성공
        → 로그인 상태
        
        인증 오류 발생
        → 비로그인 상태
        ```
        
        ### 정리
        
        | 데이터 | 상태 종류 | 원본 | 적절한 관리 위치 |
        | --- | --- | --- | --- |
        | 폼 입력값 | 클라이언트 상태 | 브라우저의 현재 입력 | `useState`, React Hook Form |
        | 모달 열림 여부 | 클라이언트 상태 | 현재 UI | `useState` |
        | 여러 화면의 UI 설정 | 클라이언트 상태 | 브라우저 | Zustand 등 전역 store |
        | Access Token | 인증 정보 | 서버가 발급 | 쿠키 또는 메모리 |
        | 회원 정보 | 서버 상태 | 서버 DB | TanStack Query |
        | 영화·게시글 목록 | 서버 상태 | 서버 DB | TanStack Query |
        
        > 입력값과 UI 상태는 React 상태나 전역 store로 관리하고, 회원 정보처럼 서버가 원본인 데이터는 TanStack Query로 관리한다.
        > 
    - 같은 회원 정보를 전역 store와 query 캐시에 각각 저장하면 어떤 문제가 생길 수 있을까요?
        
        같은 회원 정보를 Zustand와 TanStack Query에 각각 저장하면 두 개의 원본이 생긴다.
        
        ```
        Zustand store
        {
          nickname: "지은"
        }
        
        TanStack Query 캐시
        {
          nickname: "이지은"
        }
        ```
        
        회원 정보가 수정됐을 때 한쪽만 갱신되면 화면마다 서로 다른 값이 나타날 수 있다.
        
        ```
        프로필 수정 성공
        → Query 캐시만 갱신
        → Query를 사용하는 화면에는 새 닉네임 표시
        → Zustand를 사용하는 Header에는 이전 닉네임 표시
        ```
        
        다음과 같은 문제가 발생한다.
        
        - 어느 값이 최신인지 판단하기 어렵다.
        - 데이터를 수정할 때 두 저장소를 모두 갱신해야 한다.
        - 새로고침과 재조회 시점에 값이 달라질 수 있다.
        - 로그아웃할 때 두 저장소를 모두 초기화해야 한다.
        - 코드마다 서로 다른 저장소를 참조할 수 있다.
        - 상태 동기화 코드가 늘어나고 오류 가능성이 커진다.
        
        회원 정보의 원본이 서버라면 TanStack Query 캐시 하나에서 관리하는 것이 좋다.
        
        ```tsx
        const nickname = useQuery({
          queryKey: ["members", "me"],
          queryFn: fetchMyProfile,
          select: (member) => member.nickname,
        });
        ```
        
        여러 컴포넌트가 같은 query key를 사용하면 동일한 Query 캐시를 공유할 수 있으므로 회원 정보를 전역 store에 다시 복사할 필요가 없다.
        
        > 서버 상태를 전역 store에 복사하면 Query 캐시와 전역 store 중 어느 것이 최신인지 알기 어려워진다. 회원 정보는 Query 캐시에서 한 번만 관리하는 것이 좋다.
        > 
- 캐시 일관성
    - 서버에서 데이터를 수정했는데 다른 화면에는 이전 값이 보이는 이유는 무엇인가요?
        
        TanStack Query는 query key별로 데이터를 따로 캐시한다.
        
        ```tsx
        // 회원 상세
        ["members", "detail", 1]
        
        // 회원 목록
        ["members", "list", { page: 1 }]
        
        // 로그인한 회원 정보
        ["members", "me"]
        ```
        
        회원 정보 수정 요청이 성공해도 TanStack Query가 어떤 캐시를 변경해야 하는지 자동으로 모두 판단하는 것은 아니다.
        
        ```
        회원 수정 API 성공
        → 서버 DB는 변경됨
        → ["members", "detail", 1] 캐시는 이전 값
        → ["members", "list"] 캐시도 이전 값
        → 다른 화면에 이전 회원 정보 표시
        ```
        
        다음과 같은 이유로 이전 데이터가 보일 수 있다.
        
        - 수정 후 관련 query를 무효화하지 않음
        - 상세 캐시만 수정하고 목록 캐시는 수정하지 않음
        - 화면마다 서로 다른 query key를 사용함
        - `staleTime` 동안 기존 데이터를 `fresh`로 판단함
        - 비활성 query가 캐시에 남아 있음
        - 전역 store에도 같은 데이터를 별도로 저장함
        
        수정 성공 후 관련 query를 무효화하면 해당 데이터를 오래된 상태로 만들고 필요한 경우 다시 조회한다.
        
        ```tsx
        const queryClient = useQueryClient();
        
        const updateMemberMutation = useMutation({
          mutationFn: updateMember,
        
          onSuccess: async () => {
            await Promise.all([
              queryClient.invalidateQueries({
                queryKey: ["members", "me"],
              }),
              queryClient.invalidateQueries({
                queryKey: ["members", "list"],
              }),
            ]);
          },
        });
        ```
        
        서버 데이터 변경 후 관련 query를 무효화하고 다시 조회하는 것이 일반적인 캐시 일관성 유지 방법이다. TanStack Query React Docs
        
    - 변경한 데이터를 다시 조회하는 방식과 캐시를 직접 수정하는 방식은 각각 어떤 상황에 적절할까요?
        
        ### 다시 조회하는 방식
        
        `invalidateQueries()`로 관련 캐시를 무효화하고 서버에서 최신 데이터를 다시 가져오는 방식이다.
        
        ```tsx
        onSuccess: async () => {
          await queryClient.invalidateQueries({
            queryKey: ["members", "me"],
          });
        }
        ```
        
        다음 상황에 적합하다.
        
        - 서버에서 최종 데이터가 복잡하게 계산되는 경우
        - 수정으로 여러 데이터가 함께 변경되는 경우
        - 어떤 캐시를 어떻게 수정해야 할지 정확히 알기 어려운 경우
        - 정확성이 네트워크 요청 비용보다 중요한 경우
        - 목록의 정렬, 필터, 집계 결과가 바뀌는 경우
        
        예를 들어 닉네임 변경으로 회원 상세, 회원 목록과 검색 결과가 모두 달라진다면 관련 query를 다시 조회하는 편이 안전하다.
        
        장점은 서버의 실제 최종 상태를 가져와 정확성이 높다는 것이다. 단점은 추가 네트워크 요청이 발생한다는 것이다.
        
        ### 캐시를 직접 수정하는 방식
        
        서버가 반환한 최신 데이터를 `setQueryData()`로 캐시에 바로 저장하는 방식이다.
        
        ```tsx
        const updateMemberMutation = useMutation({
          mutationFn: updateMember,
        
          onSuccess: (updatedMember) => {
            queryClient.setQueryData(
              ["members", "me"],
              updatedMember,
            );
          },
        });
        ```
        
        다음 상황에 적합하다.
        
        - 수정 API가 변경된 전체 객체를 반환하는 경우
        - 어떤 query key를 수정해야 하는지 명확한 경우
        - 추가 네트워크 요청을 줄이고 싶은 경우
        - 변경 결과를 즉시 화면에 보여줘야 하는 경우
        
        수정 API가 최신 회원 객체를 이미 반환했다면 다시 조회하지 않고 해당 객체를 캐시에 저장할 수 있다. TanStack Query 공식 문서도 Mutation 응답에 최신 객체가 포함되어 있다면 `setQueryData()`로 기존 캐시를 갱신할 수 있다고 설명한다. TanStack Query React Docs
        
        다만 상세 캐시만 직접 수정하면 목록 캐시는 여전히 이전 값일 수 있다.
        
        ```tsx
        onSuccess: async (updatedMember) => {
          // 최신 객체를 정확히 알고 있는 상세 캐시는 직접 수정
          queryClient.setQueryData(
            ["members", "me"],
            updatedMember,
          );
        
          // 여러 회원이 포함된 목록은 다시 조회
          await queryClient.invalidateQueries({
            queryKey: ["members", "list"],
          });
        }
        ```
        
        ### 낙관적 업데이트
        
        서버 응답을 기다리기 전에 캐시를 먼저 변경하는 방식이다.
        
        ```
        좋아요 버튼 클릭
        → 화면의 좋아요 상태를 먼저 변경
        → 서버에 요청
        → 실패하면 이전 상태로 복구
        ```
        
        반응 속도가 중요한 좋아요, 북마크와 토글 기능에 적합하다. 하지만 서버 요청이 실패할 수 있으므로 이전 값을 저장하고 롤백하는 처리가 필요하다. TanStack Query React Docs
        
        ### 비교
        
        | 방식 | 적절한 상황 | 장점 | 단점 |
        | --- | --- | --- | --- |
        | `invalidateQueries()` | 서버의 최종 결과가 복잡하거나 관련 캐시가 많음 | 정확하고 구현이 단순함 | 추가 요청 발생 |
        | `setQueryData()` | 서버가 최신 객체를 반환하고 대상 캐시가 명확함 | 즉시 반영, 요청 감소 | 관련 캐시를 빠뜨릴 수 있음 |
        | 낙관적 업데이트 | 좋아요처럼 즉각적인 반응이 중요함 | 빠른 사용자 경험 | 실패 시 롤백 필요 |
        
        > 정확한 최종 상태를 직접 계산하기 어렵다면 다시 조회하고, 서버가 최신 객체를 반환해 변경 결과를 확실히 알고 있다면 캐시를 직접 수정한다. 실제로는 상세 캐시는 직접 수정하고 목록 캐시는 무효화하는 방식을 함께 사용하는 경우가 많다.
        >