- Web Storage
    - localStorage와 sessionStorage는 저장값의 수명과 공유 범위가 어떻게 다른가요?
        
        ## localStorage와 sessionStorage의 저장값의 수명과 공유 범위
        
        > Web Storage는 브라우저에서 **문자열 형태의 데이터를 저장하는 기능**이며, `localStorage`와 `sessionStorage`로 구분된다.
        > 
        
        두 저장소는 사용하는 메서드가 비슷하지만, **데이터가 유지되는 기간과 공유되는 범위**가 다르다.
        
        ### localStorage
        
        > 브라우저를 종료한 뒤에도 데이터를 유지할 수 있는 저장소
        > 
        
        ```tsx
        localStorage.setItem("theme", "dark");
        
        const theme = localStorage.getItem("theme");
        // "dark"
        ```
        
        새로고침하거나 브라우저를 닫았다가 다시 접속하더라도 저장된 값을 읽을 수 있다.
        
        또한 일반적인 동일 브라우저 프로필에서 **같은 출처의 페이지들은 localStorage를 공유**한다.
        
        여기서 출처인 **Origin**은 프로토콜, 호스트, 포트의 조합이다.
        
        ```
        https://example.com/books
        https://example.com/bookmarks
        → 같은 출처이므로 공유
        
        http://example.com
        https://example.com
        → 프로토콜이 다르므로 다른 출처
        
        https://example.com
        https://admin.example.com
        → 호스트가 다르므로 다른 출처
        ```
        
        단, 별도의 만료 시간이 없다는 것이 영구 보존을 보장한다는 뜻은 아니다. 사용자의 데이터 삭제, 브라우저 정책, 시크릿 모드 등에 따라 사라질 수 있다.
        
        ### sessionStorage
        
        > **현재 탭의 페이지 세션 동안** 데이터를 유지하는 저장소
        > 
        
        ```tsx
        sessionStorage.setItem("currentStep", "2");
        
        const currentStep = sessionStorage.getItem("currentStep");
        // "2"
        ```
        
        같은 탭에서 새로고침하더라도 값은 유지되지만, 일반적으로 탭을 닫아 페이지 세션이 끝나면 제거된다.
        
        또한 출처뿐 아니라 탭 단위로 저장 공간이 구분된다.
        
        ```
        탭 A → currentStep = "2"
        탭 B → 별도의 sessionStorage 사용
        ```
        
        새 창이나 탭을 여는 방식에 따라 시작 시 기존 탭의 값이 복사될 수는 있지만, 이후 두 저장소가 계속 동기화되는 것은 아니다.
        
        `sessionStorage`의 세션은 **서버의 로그인 세션과 같은 개념이 아니다.** 로그아웃했다고 자동으로 삭제되는 저장소도 아니다.
        
        ### 차이 비교
        
        | 구분 | localStorage | sessionStorage |
        | --- | --- | --- |
        | 새로고침 | 유지 | 유지 |
        | 탭을 닫은 뒤 | 일반적으로 유지 | 일반적으로 제거 |
        | 브라우저 재실행 | 일반적으로 유지 | 새로운 세션에서는 유지되지 않음 |
        | 공유 범위 | 같은 출처의 탭·창 | 같은 출처이면서 같은 탭의 페이지 세션 |
        | 활용 예시 | 테마, 로컬 북마크 | 탭별 임시 입력, 작업 단계 |
        
        두 저장소 모두 다음과 같은 메서드를 제공한다.
        
        ```tsx
        // 저장 또는 덮어쓰기
        localStorage.setItem("theme", "dark");
        
        // 읽기: 없으면 null
        const theme: string | null =
          localStorage.getItem("theme");
        
        // 특정 항목 삭제
        localStorage.removeItem("theme");
        ```
        
        → 다시 방문해도 유지할 값은 `localStorage`, 현재 탭의 작업 동안 유지할 값은 `sessionStorage`를 고려할 수 있다.
        
    - 객체나 배열을 저장할 때 JSON 문자열로 바꿔야 하는 이유는 무엇일까요?
        
        ## 객체나 배열을 저장할 때 JSON 문자열로 바꿔야 하는 이유
        
        > Web Storage는 객체나 배열 자체가 아니라 **문자열을 저장하기 때문**이다.
        > 
        
        예를 들어 북마크한 책의 ID를 배열로 관리한다고 하자.
        
        ```tsx
        const bookmarkIds: number[] = [10, 20, 30];
        ```
        
        이 배열을 저장하려면 문자열로 변환해야 한다.
        
        ### JSON.stringify()
        
        > 객체나 배열을 **JSON 형식의 문자열로 변환**한다.
        > 
        
        ```tsx
        const bookmarkIds: number[] = [10, 20, 30];
        
        localStorage.setItem(
          "bookmarkIds",
          JSON.stringify(bookmarkIds),
        );
        ```
        
        실제로 저장되는 값은 다음 문자열이다.
        
        ```
        "[10,20,30]"
        ```
        
        객체도 같은 방식으로 저장할 수 있다.
        
        ```tsx
        const settings = {
          theme: "dark",
          fontSize: 16,
        };
        
        localStorage.setItem(
          "settings",
          JSON.stringify(settings),
        );
        ```
        
        이처럼 데이터를 저장하거나 전송할 수 있는 형태로 바꾸는 과정을 직렬화(Serialization)라고 한다.
        
        ### JSON.parse()
        
        > JSON 문자열을 다시 **객체나 배열 등의 값으로 변환**한다.
        > 
        
        ```tsx
        const raw = localStorage.getItem("bookmarkIds");
        
        if (raw !== null) {
          const parsed: unknown = JSON.parse(raw);
          console.log(parsed);
        }
        ```
        
        이 과정을 **역직렬화(Deserialization)**라고 한다.
        
        ```
        배열·객체
           ↓ JSON.stringify()
        JSON 문자열
           ↓ Web Storage에 저장
        저장된 문자열 읽기
           ↓ JSON.parse()
        배열·객체 등의 값
        ```
        
        JSON은 일반적인 객체와 배열을 문자열로 표현하는 방법이다. 반드시 JSON만 사용할 수 있는 것은 아니지만, 구조를 보존하기 편리해서 널리 사용한다.
        
        ### 단순한 문자열 변환과의 차이
        
        ```tsx
        String({ id: 10, title: "달빛 도서관" });
        // "[object Object]"
        
        String([10, 20, 30]);
        // "10,20,30"
        ```
        
        위 방식으로는 객체의 필드 구조나 배열의 각 값에 대한 정보를 안정적으로 복원하기 어렵다.
        
        반면 JSON은 이름과 값, 배열의 구조를 표현한다.
        
        ```tsx
        JSON.stringify({ id: 10, title: "달빛 도서관" });
        // '{"id":10,"title":"달빛 도서관"}'
        ```
        
        ### 읽을 때는 형식도 확인해야 한다
        
        저장된 문자열이 항상 정상적인 JSON이거나 예상한 배열이라는 보장은 없다.
        
        사용자가 값을 수정하거나, 이전 버전의 애플리케이션이 다른 형식으로 저장했을 수 있다.
        
        ```tsx
        function loadBookmarkIds(): number[] {
          try {
            const raw = localStorage.getItem("bookmarkIds");
        
            if (raw === null) {
              return [];
            }
        
            const parsed: unknown = JSON.parse(raw);
        
            if (
              Array.isArray(parsed) &&
              parsed.every(
                (id: unknown) =>
                  typeof id === "number" &&
                  Number.isSafeInteger(id) &&
                  id > 0,
              )
            ) {
              return parsed;
            }
        
            return [];
          } catch {
            return [];
          }
        }
        ```
        
        → 이 예시는 양의 정수 ID 배열만 허용하고, 저장소 접근이나 파싱에 실패하면 빈 배열을 반환함
        
        ```tsx
        JSON.parse(raw) as number[]
        ```
        
        처럼 타입을 단언하는 것만으로 실제 값이 검증되지는 않는다.
        
        또한 JSON은 모든 JavaScript 값을 그대로 보존하지 않는다. 예를 들어 `Date`는 일반적으로 문자열로 변환되며, 함수는 그대로 저장·복원되지 않는다.
        
    - Web Storage에는 어떤 데이터를 저장하는 것이 적절할까요?
        
        ## Web Storage에는 어떤 데이터를 저장하는 것이 적절한가
        
        > **작고, 민감하지 않으며, 브라우저에 남겨 두면 편리한 데이터**를 저장하기 적절하다.
        > 
        
        ### 적절한 데이터
        
        | 데이터 | 저장 예시 | 고려할 저장소 |
        | --- | --- | --- |
        | 화면 테마 | `"light"`, `"dark"` | localStorage |
        | 목록 표시 방식 | `"grid"`, `"list"` | localStorage |
        | 비회원 북마크 | 도서 ID 배열 | localStorage |
        | 탭별 작업 단계 | 현재 입력 단계 | sessionStorage |
        | 임시 입력 | 민감하지 않은 작성 중 내용 | 유지 기간에 따라 선택 |
        
        예를 들어 비회원이 북마크한 책을 같은 브라우저에서 다시 확인하게 하려면 다음처럼 저장할 수 있다.
        
        ```tsx
        const bookmarkIds: number[] = [10, 20, 30];
        
        localStorage.setItem(
          "bookmarkIds",
          JSON.stringify(bookmarkIds),
        );
        ```
        
        책의 제목, 설명, 재고 등 전체 정보를 중복 저장하기보다 **ID처럼 필요한 최소 정보만 저장**하면 오래된 데이터가 남는 문제를 줄일 수 있다.
        
        단, ID만으로는 책의 상세 내용을 알 수 없으므로 화면 표시에는 별도의 데이터가 필요하다.
        
        ### 저장에 주의해야 하는 데이터
        
        비밀번호나 비밀 키처럼 노출되면 안 되는 값은 저장하면 안 된다.
        
        Web Storage는 같은 출처에서 실행되는 JavaScript가 접근할 수 있기 때문에, XSS가 발생하면 저장된 값도 노출될 수 있다. 인증 토큰 역시 이러한 위험을 고려해야 한다.
        
        또한 사용자가 값을 수정할 수 있으므로 다음 값이 있다고 서버가 믿어서는 안 된다.
        
        ```tsx
        localStorage.setItem("isAdmin", "true");
        ```
        
        → 클라이언트 저장값은 **권한을 증명하는 근거가 될 수 없다.** 권한은 서버에서 검증해야 한다. 
        
        ### 큰 데이터나 잦은 저장에는 주의
        
        Web Storage는 동기식 API이다. 읽기와 쓰기가 실행되는 동안 해당 JavaScript 실행 흐름이 기다린다.
        
        따라서 큰 데이터를 자주 변환하고 저장하면 화면 반응성에 부담을 줄 수 있다. 저장 공간에도 제한이 있으므로 저장 실패를 고려해야 한다.
        
        큰 구조화 데이터나 복잡한 로컬 저장이 필요하다면 IndexedDB 같은 다른 저장 방식을 검토할 수 있다.
        
        ### 서버 저장과의 차이
        
        localStorage에 저장했다고 다른 기기나 브라우저에도 자동으로 전달되는 것은 아니다.
        
        ```
        노트북 브라우저의 북마크
                ≠
        스마트폰 브라우저의 북마크
        ```
        
        계정 단위로 북마크를 유지하고 여러 기기에서 사용하려면 서버에 저장하고 동기화하는 구조가 필요하다.
        
- 클라이언트 상태와 전역 상태 관리
    - 컴포넌트 상태와 전역 상태는 사용하는 범위가 어떻게 다른가요?
        
        ## 컴포넌트 상태와 전역 상태가 사용하는 범위
        
        > 컴포넌트 상태는 **특정 컴포넌트나 가까운 영역**, 전역 상태는 **여러 컴포넌트와 화면이 공유하는 영역**에서 사용한다.
        > 
        
        클라이언트 상태는 브라우저에서 애플리케이션을 실행하는 동안 관리하는 값이다.
        
        ```
        모달이 열려 있는가?
        현재 선택한 탭은 무엇인가?
        어떤 책을 북마크했는가?
        ```
        
        이 중 어떤 값을 어디서 관리할지는 **누가 읽고 변경하는지**를 기준으로 결정할 수 있다.
        
        ### 컴포넌트 상태
        
        React에서는 `useState`로 컴포넌트 상태를 관리할 수 있다.
        
        ```tsx
        import { useState } from "react";
        
        export function BookDescription() {
          const [isExpanded, setIsExpanded] =
            useState<boolean>(false);
        
          return (
            <section>
              <button
                type="button"
                aria-expanded={isExpanded}
                onClick={() => setIsExpanded((value) => !value)}
              >
                {isExpanded ? "설명 접기" : "설명 펼치기"}
              </button>
        
              {isExpanded && <p>책의 상세 설명입니다.</p>}
            </section>
          );
        }
        ```
        
        `isExpanded`는 이 설명 영역에서만 필요하므로 컴포넌트 가까이에 두는 것이 자연스럽다.
        
        같은 컴포넌트를 여러 번 렌더링하면 각각 자신의 상태를 가진다.
        
        ### 가까운 컴포넌트끼리 공유할 때
        
        두 컴포넌트가 같은 상태를 사용한다고 반드시 전역 저장소가 필요한 것은 아니다.
        
        공통 부모로 상태를 옮기고 props로 전달할 수 있다. 이를 상태 끌어올리기(Lifting State Up)라고 한다.
        
        ```
        부모 컴포넌트: 선택한 카테고리 관리
               ├─ 필터: 선택값 변경
               └─ 목록: 선택값에 맞는 데이터 표시
        ```
        
        이렇게 하면 두 자식이 하나의 상태를 기준으로 동작한다.
        
        ### 전역 상태
        
        여러 화면에서 같은 북마크 목록이 필요하다면 공통 저장소를 사용할 수 있다.
        
        ```
        북마크 Store
           ├─ 도서 목록 화면
           ├─ 도서 상세 화면
           ├─ 북마크 목록 화면
           └─ 헤더의 북마크 개수
        ```
        
        | 구분 | 컴포넌트 상태 | 전역 상태 |
        | --- | --- | --- |
        | 주요 범위 | 특정 컴포넌트·가까운 영역 | 여러 컴포넌트·화면 |
        | 예시 | 설명 펼침, 입력 중인 값 | 공통 북마크, 앱 전체 테마 |
        | 공유 방법 | props, 상태 끌어올리기 등 | 공통 Store 구독 등 |
        | 관리 기준 | 사용하는 곳 가까이 | 공통으로 사용할 범위에 배치 |
        
        전역 상태라고 브라우저의 모든 탭이나 다른 기기까지 자동 공유되는 것은 아니다.
        
        또한 **전역으로 공유하는 것과 새로고침 후에도 저장하는 것은 별개의 문제**이다.
        
    - 여러 화면에서 사용하는 북마크 상태를 전역으로 관리하면 어떤 장점과 비용이 생길까요?
        
        ## 북마크 상태를 전역으로 관리할 때의 장점
        
        > 북마크의 기준 데이터를 한곳에 모으면 **화면 사이의 일관성을 유지하기 쉬워지지만**, 공유 범위와 갱신 규칙을 관리해야 한다.
        > 
        
        ### 화면마다 따로 관리하면?
        
        ```
        도서 목록 화면 → 북마크 [10, 20]
        도서 상세 화면 → 북마크 [10]
        헤더          → 북마크 개수 1
        ```
        
        각 화면이 별도의 상태를 관리하면 변경 내용을 전달하지 못해 표시가 어긋날 수 있다.
        
        전역 상태를 사용하면 하나의 목록을 기준으로 화면을 구성할 수 있다.
        
        ```
        공통 북마크 [10, 20]
               ├─ 목록: 10번과 20번 표시
               ├─ 상세: 현재 책의 포함 여부 표시
               └─ 헤더: 개수 2 표시
        ```
        
        ### 장점 ① 같은 기준으로 화면 갱신
        
        상세 화면에서 북마크를 추가하면, 같은 Store를 구독하는 헤더나 목록도 변경된 상태를 사용할 수 있다.
        
        개별 화면마다 별도의 북마크 목록을 맞추는 작업이 줄어든다.
        
        ### 장점 ② 변경 로직을 한곳에서 관리
        
        ```
        추가 → 이미 등록되었는지 확인
        삭제 → 해당 ID 제거
        전체 삭제 → 빈 목록으로 변경
        ```
        
        이러한 규칙을 Store의 액션으로 모으면 화면마다 다른 방식으로 수정하는 일을 줄일 수 있다.
        
        ### 장점 ③ 중간 컴포넌트의 전달 부담 감소
        
        깊은 컴포넌트 구조에서는 실제로 값을 사용하지 않는 컴포넌트도 props를 전달해야 할 수 있다.
        
        공통 Store를 사용하면 필요한 컴포넌트가 상태를 직접 구독할 수 있다. Zustand는 이러한 Store와 선택적 구독 기능을 제공한다.
        
        ### 비용 ① 공유 상태에 대한 의존성
        
        전역 상태의 구조나 변경 규칙을 바꾸면 여러 화면이 영향을 받을 수 있다.
        
        따라서 “어디서든 변경 가능하게 한다”보다 **정해진 액션으로 변경하도록 구성**하는 것이 이해하기 쉽다.
        
        ### 비용 ② 구독 범위와 렌더링 관리
        
        필요한 값만 선택해서 구독하는 것이 좋다.
        
        ```tsx
        const count = useBookmarkStore(
          (state) => state.bookmarkIds.length,
        );
        ```
        
        → 북마크 개수가 필요한 컴포넌트에서 해당 값만 선택함
        
        전체 Store를 구독하면 관계없는 상태 변경에도 컴포넌트가 갱신될 수 있다.
        
        ### 비용 ③ 저장·계정·동기화 정책
        
        다음과 같은 요구사항은 전역 상태만으로 해결되지 않는다.
        
        | 요구사항 | 추가로 필요한 처리 |
        | --- | --- |
        | 새로고침 후 복원 | Web Storage 등의 저장 |
        | 다른 탭에 변경 반영 | 탭 사이 동기화 |
        | 다른 기기에서 사용 | 서버 저장과 동기화 |
        | 사용자 계정 전환 | 계정별 분리·초기화 정책 |
        
        또한 북마크 개수는 ID 배열에서 계산할 수 있으므로, 별도 상태로 중복 저장하지 않는 편이 일관성을 유지하기 쉽다.
        
        ```tsx
        const bookmarkIds = [10, 20];
        
        const count = bookmarkIds.length;
        ```
        
        → 전역 상태는 **여러 화면이 실제로 공유해야 하는 데이터**를 중심으로 구성하고, 계산할 수 있는 값은 원본에서 구하는 것이 좋다.
        
    - Zustand와 Web Storage는 북마크 상태를 관리할 때 각각 어떤 역할을 할까요?
        
        ## Zustand와 Web Storage의 역할
        
        > Zustand는 **실행 중인 상태와 화면 갱신**, Web Storage는 **새로고침 이후에도 사용할 값의 저장**을 담당한다.
        > 
        
        | 구분 | Zustand | Web Storage |
        | --- | --- | --- |
        | 주요 역할 | 상태 관리와 변경 알림 | 문자열 데이터 저장 |
        | 사용하는 위치 | 애플리케이션 메모리 | 브라우저 저장소 |
        | 화면 갱신 | 구독한 값의 변경을 React에 반영 | 저장만으로 React가 갱신되지는 않음 |
        | 새로고침 이후 | 별도 저장이 없으면 초기화 | 저장소의 수명에 따라 유지 |
        | 북마크 예시 | 추가·삭제, 버튼 상태, 개수 | 북마크 ID 목록 보관 |
        
        ### 두 기능을 함께 사용하는 흐름
        
        ```
        사용자가 북마크 버튼 클릭
                  ↓
        Zustand 상태 변경
                  ├─ 관련 화면 갱신
                  └─ localStorage에 저장
        
        새로고침
                  ↓
        localStorage의 데이터 읽기
                  ↓
        Zustand 상태 복원
                  ↓
        복원한 상태로 화면 표시
        ```
        
        Zustand에서는 `persist` 미들웨어를 이용해 상태 저장과 복원을 연결할 수 있다.
        
        ### 북마크 Store 예시
        
        아래는 **브라우저에서 실행하는 React 앱의 기본 구조**를 설명하는 TypeScript 예시이다.
        
        ```tsx
        import { create } from "zustand";
        import {
          createJSONStorage,
          persist,
        } from "zustand/middleware";
        
        type BookmarkStore = {
          bookmarkIds: number[];
          toggleBookmark: (bookId: number) => void;
        };
        
        export const useBookmarkStore = create<BookmarkStore>()(
          persist(
            (set) => ({
              bookmarkIds: [],
        
              toggleBookmark: (bookId) => {
                set((state) => ({
                  bookmarkIds: state.bookmarkIds.includes(bookId)
                    ? state.bookmarkIds.filter(
                        (id) => id !== bookId,
                      )
                    : [...state.bookmarkIds, bookId],
                }));
              },
            }),
            {
              name: "bookmarks",
        
              storage: createJSONStorage(
                () => localStorage,
              ),
        
              partialize: (state) => ({
                bookmarkIds: state.bookmarkIds,
              }),
            },
          ),
        );
        ```
        
        | 코드 | 역할 |
        | --- | --- |
        | `create` | Zustand Store 생성 |
        | `set` | 상태 변경 |
        | `persist` | 저장소에 상태 저장·복원 |
        | `name` | 저장소에서 사용할 키 |
        | `createJSONStorage` | JSON 문자열 변환과 저장소 연결 |
        | `partialize` | 저장할 필드 선택 |
        
        `partialize`로 ID 배열만 선택했으므로, 액션 함수까지 저장 대상으로 삼지 않는다.
        
        `createJSONStorage`가 JSON 변환을 처리하므로 이 예시에서는 직접 `JSON.stringify()`와 `JSON.parse()`를 호출할 필요가 없다.
        
        ### 컴포넌트에서 사용하기
        
        ```tsx
        type BookmarkButtonProps = {
          bookId: number;
        };
        
        export function BookmarkButton({
          bookId,
        }: BookmarkButtonProps) {
          const isBookmarked = useBookmarkStore(
            (state) => state.bookmarkIds.includes(bookId),
          );
        
          const toggleBookmark = useBookmarkStore(
            (state) => state.toggleBookmark,
          );
        
          return (
            <button
              type="button"
              aria-pressed={isBookmarked}
              onClick={() => toggleBookmark(bookId)}
            >
              {isBookmarked ? "북마크 해제" : "북마크 추가"}
            </button>
          );
        }
        ```
        
        다른 컴포넌트에서는 같은 Store로 개수를 표시할 수 있다.
        
        ```tsx
        export function BookmarkCount() {
          const count = useBookmarkStore(
            (state) => state.bookmarkIds.length,
          );
        
          return <span>북마크 {count}개</span>;
        }
        ```
        
        ### 저장과 복원에서 추가로 고려할 점
        
        `createJSONStorage`는 JSON을 읽는 과정에서 **데이터 구조까지 자동 검증하지는 않는다.**
        
        실제 서비스에서는 저장값의 형식 검증, 저장 실패 처리, 이전 형식의 데이터 변환 등을 고려해야 한다.
        
        서버 렌더링을 사용한다면 서버에는 `localStorage`가 없다는 점과, 서버의 초기 화면과 브라우저에서 복원한 상태가 달라질 수 있다는 점도 처리해야 한다.
        
        ### 다른 탭도 자동으로 갱신될까?
        
        같은 출처의 탭들은 localStorage 값을 공유하지만, **각 탭의 Zustand 메모리 상태는 별개**이다.
        
        ```
        탭 A의 Zustand 상태
                ↓ 저장
        공유 localStorage
                ↓ 변경 감지와 다시 읽기 필요
        탭 B의 Zustand 상태
        ```
        
        다른 탭의 변경을 반영하려면 `storage` 이벤트 등을 이용한 동기화 처리가 필요하다.
        
        이 이벤트는 값을 변경한 문서 자신이 아니라, 해당 저장소를 공유하는 다른 문서에 발생한다.
        
        → **Zustand로 현재 화면들이 사용할 상태를 관리하고, Web Storage로 다음 실행 때 복원할 데이터를 보관하는 것**으로 역할을 나누어 이해하면 된다.