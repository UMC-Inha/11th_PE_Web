- HTTP와 API
    - API, endpoint, HTTP method와 status code는 요청과 응답에서 각각 어떤 역할을 할까요?
        
        ## API, endpoint, HTTP method와 status coded의 역할
        
        > API는 **통신 규칙**, endpoint는 **접근할 대상**, HTTP method는 **요청의 의미**, status code는 **처리 결과**를 나타낸다.
        > 
        
        웹 서비스에서 프론트엔드는 서버의 데이터나 기능이 필요할 때 HTTP 요청을 보낸다.
        
        ```
        프론트엔드
           ↓ HTTP 요청
        API 서버
           ↓ HTTP 응답
        프론트엔드에서 결과 표시
        ```
        
        ### API
        
        > 다른 프로그램이 제공하는 데이터나 기능을 사용할 수 있도록 정한 **인터페이스**
        > 
        
        API는 **Application Programming Interface**의 약자이다.
        
        API라는 개념이 HTTP에만 한정되는 것은 아니지만, 여기서는 프론트엔드와 서버가 HTTP로 통신하는 웹 API를 기준으로 설명한다.
        
        도서 서비스에서는 다음과 같은 기능을 API로 제공할 수 있다.
        
        ```
        도서 목록 조회
        도서 상세 조회
        북마크 등록
        북마크 삭제
        ```
        
        API를 사용하려면 요청 주소뿐 아니라 필요한 입력값, 응답 구조, 오류 처리 방식도 알아야 한다.
        
        ### Endpoint
        
        > API의 특정 기능이나 자원에 접근하는 **접점**
        > 
        
        예를 들어 다음 주소를 통해 도서 목록에 접근할 수 있다.
        
        ```
        https://api.example.com/books
        ```
        
        실무에서는 주소 자체를 endpoint라고 부르기도 하고, 메서드까지 포함해 특정 API 작업을 구분하기도 한다.
        
        ```
        GET /books     → 도서 목록 조회
        POST /books    → 새 도서 등록
        GET /books/10  → 10번 도서 조회
        ```
        
        같은 `/books` 경로를 사용하더라도 HTTP method에 따라 의미가 달라질 수 있다.
        
        ### HTTP method
        
        > 요청으로 **어떤 동작을 의도하는지** 나타낸다.
        > 
        
        | 메서드 | 일반적인 의미 | 예시 |
        | --- | --- | --- |
        | `GET` | 자원 조회 | 도서 목록 조회 |
        | `POST` | 데이터 제출·처리, 새 자원 생성 등 | 북마크 등록 |
        | `PUT` | 대상 자원의 표현을 생성하거나 대체 | 설정 전체 교체 |
        | `PATCH` | 자원의 일부 변경 | 책 제목 수정 |
        | `DELETE` | 대상 자원 삭제 | 북마크 삭제 |
        
        메서드는 단순한 함수 이름이 아니라 HTTP에서 정의한 의미를 가진다.
        
        예를 들어 GET은 조회를 위한 안전한 메서드이므로, GET 요청으로 북마크를 삭제하는 식의 설계는 피해야 한다.
        
        ### Status code
        
        > 서버가 요청을 처리한 **결과를 나타내는 숫자 코드**
        > 
        
        | 범위 | 의미 |
        | --- | --- |
        | `1xx` | 처리 과정에 대한 정보 |
        | `2xx` | 성공 |
        | `3xx` | 리다이렉션 등 추가 동작 관련 |
        | `4xx` | 요청·인증·권한 등 클라이언트 측 조건과 관련된 오류 |
        | `5xx` | 서버가 요청을 처리하는 과정에서 발생한 오류 |
        
        자주 사용하는 코드는 다음과 같다.
        
        | 코드 | 의미 |
        | --- | --- |
        | `200 OK` | 요청 성공 |
        | `201 Created` | 새 자원 생성 성공 |
        | `204 No Content` | 성공했지만 응답 본문 없음 |
        | `400 Bad Request` | 잘못된 요청 |
        | `401 Unauthorized` | 유효한 인증 정보가 필요함 |
        | `403 Forbidden` | 요청을 이해했지만 접근을 허용하지 않음 |
        | `404 Not Found` | 대상 자원을 찾지 못함 |
        | `409 Conflict` | 현재 자원 상태와 요청이 충돌함 |
        | `500 Internal Server Error` | 서버 내부 오류 |
        
        예를 들어 북마크를 등록한다면,
        
        ```
        POST /bookmarks
        Content-Type: application/json
        
        {
          "bookId": 10
        }
        ```
        
        서버는 다음과 같이 응답할 수 있다.
        
        ```
        HTTP/1.1 201 Created
        Content-Type: application/json
        
        {
          "id": 100,
          "bookId": 10
        }
        ```
        
        → **어디에 어떤 작업을 요청할지**는 endpoint와 method가, **어떻게 처리되었는지**는 status code와 응답 본문이 설명한다.
        
    - 브라우저와 API 서버의 origin이 다를 때 CORS는 어떤 역할을 할까요?
        
        ## 브라우저와 API 서버의 origin이 다를 때 CORS의 역할
        
        > CORS는 서버가 허용한 출처의 브라우저 코드에 **다른 출처의 응답을 읽을 수 있도록 허용하는 방식**이다.
        > 
        
        Origin은 **프로토콜, 호스트, 포트**의 조합이다.
        
        ```
        프론트엔드: https://app.example.com
        API 서버:   https://api.example.com
        
        → 호스트가 다르므로 다른 Origin
        ```
        
        브라우저는 동일 출처 정책에 따라 다른 출처의 데이터 접근을 제한한다. API 서버는 CORS 응답 헤더로 허용할 출처를 지정할 수 있다.
        
        ```
        Access-Control-Allow-Origin: https://app.example.com
        ```
        
        ```
        프론트엔드에서 API 요청
                  ↓
        서버가 응답과 CORS 헤더 반환
                  ↓
        브라우저가 허용 조건 확인
                  ↓
        허용되면 JavaScript에서 응답 사용
        ```
        
        ### 사전 요청
        
        요청 방식이나 헤더에 따라 브라우저는 실제 요청 전에 `OPTIONS` 요청을 보낸다. 이를 **Preflight**라고 한다.
        
        ```
        이 출처가 POST를 보내도 되는가?
        이 헤더를 사용해도 되는가?
        ```
        
        서버의 허용 응답을 확인한 후 실제 요청을 보낸다.
        
        ### 쿠키를 사용하는 경우
        
        다른 출처에 쿠키를 포함하려면 다음처럼 설정할 수 있다.
        
        ```
        const response = await fetch(
          "https://api.example.com/me",
          {
            credentials: "include",
          },
        );
        ```
        
        서버에서도 필요한 CORS 설정을 해야 한다.
        
        ```
        Access-Control-Allow-Origin: https://app.example.com
        Access-Control-Allow-Credentials: true
        ```
        
        이 경우 허용 출처에 `*`를 사용할 수 없다. 쿠키의 SameSite와 브라우저 쿠키 정책도 별도로 만족해야 한다.
        
        ### 주의할 점
        
        - CORS 오류라고 서버가 요청을 처리하지 않았다고 단정할 수 없다.
        - CORS는 인증이나 권한 검사를 대신하지 않는다.
        - `mode: "no-cors"`는 API 응답을 자유롭게 읽게 해 주는 해결책이 아니다.
        - 브라우저가 적용하는 정책이므로 서버 간 통신과 동작이 다르다.
        
        → CORS의 핵심은 **다른 출처의 브라우저 코드에 응답 접근을 허용할지 결정하는 것**이다.
        
- Promise와 비동기 처리
    - Promise의 pending, fulfilled와 rejected 상태는 각각 무엇을 의미할까요?
        
        ## Promise의 pending, fulfilled와 rejected 상태
        
        > Promise는 비동기 작업의 **최종 결과나 실패를 나타내는 객체**이다.
        > 
        
        서버 응답은 요청한 즉시 도착하지 않는다. Promise를 사용하면 아직 결과가 없는 작업을 표현하고, 완료되었을 때 후속 처리를 연결할 수 있다.
        
        ### 세 가지 상태
        
        | 상태 | 의미 |
        | --- | --- |
        | `pending` | 성공이나 실패가 아직 확정되지 않음 |
        | `fulfilled` | 성공적으로 완료되어 결과값이 정해짐 |
        | `rejected` | 실패하여 실패 이유가 정해짐 |
        
        ```
        pending
           ├─ 성공 → fulfilled
           └─ 실패 → rejected
        ```
        
        fulfilled 또는 rejected가 된 상태를 **settled**라고 한다.
        
        한 번 결과가 확정된 Promise는 다시 pending으로 돌아가거나 반대 상태로 바뀌지 않는다. 재시도는 보통 새로운 작업과 Promise를 만드는 방식으로 처리한다.
        
        ### 예시
        
        ```
        function wait(ms: number): Promise<void> {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, ms);
          });
        }
        
        const promise = wait(1000);
        ```
        
        ```
        타이머가 끝나기 전 → pending
        resolve() 호출 후 → fulfilled
        ```
        
        실패는 `reject()`로 표현할 수 있다.
        
        ```
        function fail(): Promise<never> {
          return Promise.reject(
            new Error("작업에 실패했습니다."),
          );
        }
        
        fail().catch((error: unknown) => {
          console.error(error);
        });
        ```
        
        ### Promise 성공과 HTTP 성공은 다르다
        
        `fetch()`는 서버에서 `404`나 `500` 응답을 받아도 일반적으로 fulfilled가 된다.
        
        HTTP 오류 응답도 **응답 자체는 받은 것**이기 때문이다.
        
        ```
        Promise fulfilled
        → 작업이 정한 기준으로 완료됨
        
        HTTP 2xx
        → HTTP 요청이 성공한 상태
        ```
        
        따라서 Promise 상태만으로 API 요청의 업무적 성공까지 판단해서는 안 된다.
        
    - `.then().catch()`와 `async/await`는 같은 비동기 흐름을 어떻게 다르게 표현하나요?
        
        ## 비동기 흐름 표현 차이
        
        > 두 방식 모두 Promise를 사용하지만, **후속 함수를 연결하는 방식**과 **순차적인 코드처럼 작성하는 방식**이라는 차이가 있다.
        > 
        
        ### `.then().catch()`
        
        - `.then()`은 성공했을 때 실행할 처리를 연결한다.
        - `.catch()`는 앞선 Promise 체인에서 발생한 실패를 처리한다.
        
        ```
        function loadBooks(): Promise<void> {
          return fetch("/api/books")
            .then((response) => {
              if (!response.ok) {
                throw new Error(
                  `조회 실패: ${response.status}`,
                );
              }
        
              return response.json();
            })
            .then((data: unknown) => {
              console.log(data);
            })
            .catch((error: unknown) => {
              console.error(error);
            });
        }
        ```
        
        여기서 `return response.json()`이 중요하다.
        
        후속 작업의 Promise를 반환해야 다음 `.then()`이 그 작업의 완료를 기다릴 수 있다.
        
        ### `async/await`
        
        같은 흐름을 다음처럼 작성할 수 있다.
        
        ```
        async function loadBooks(): Promise<void> {
          try {
            const response = await fetch("/api/books");
        
            if (!response.ok) {
              throw new Error(
                `조회 실패: ${response.status}`,
              );
            }
        
            const data: unknown = await response.json();
        
            console.log(data);
          } catch (error: unknown) {
            console.error(error);
          }
        }
        ```
        
        `await`는 Promise가 fulfilled되면 결과값을 얻고, rejected되면 해당 위치에서 예외가 발생한 것처럼 처리한다.
        
        ### 비교
        
        | 구분 | `.then().catch()` | `async/await` |
        | --- | --- | --- |
        | 성공 처리 | `.then()` | `await` 이후 코드 |
        | 실패 처리 | `.catch()` | `try/catch` |
        | 순차 처리 | Promise 체인 연결 | 위에서 아래로 작성 |
        | 반환 | 체인의 Promise | async 함수가 반환하는 Promise |
        
        `async` 함수는 항상 Promise를 반환한다.
        
        ```
        async function getCount(): Promise<number> {
          return 3;
        }
        ```
        
        → 숫자 `3`을 결과로 갖는 Promise를 반환함
        
        위 예제들의 오류 처리는 로그를 남기고 끝내므로, 호출자에게 실패를 다시 전달하지 않는다. 호출자도 실패를 처리해야 한다면 `throw error` 등으로 다시 전달해야 한다.
        
        또한 서로 독립적인 작업은 `Promise.all()`로 함께 기다릴 수 있다.
        
        ```
        const [booksResponse, categoriesResponse] =
          await Promise.all([
            fetch("/api/books"),
            fetch("/api/categories"),
          ]);
        ```
        
        단, 각 응답의 `ok` 확인은 별도로 필요하다.
        
    - `await`를 사용해도 브라우저 전체가 멈추지 않는 이유는 무엇일까요?
        
        ## `await` 을 사용해도 브라우저 전체가 멈추지 않는 이유
        
        > `await`는 **현재 비동기 함수의 진행을 일시 중단**하며, 브라우저의 메인 스레드를 기다림으로 점유하지 않기 때문이다.
        > 
        
        ```
        async function loadBooks(): Promise<void> {
          console.log("1. 요청 시작");
        
          const response = await fetch("/api/books");
        
          console.log("3. 응답 도착", response.status);
        }
        
        void loadBooks();
        
        console.log("2. 다른 코드 실행");
        ```
        
        일반적인 출력 순서는 다음과 같다.
        
        ```
        1. 요청 시작
        2. 다른 코드 실행
        3. 응답 도착
        ```
        
        `fetch()`를 기다리는 동안 `loadBooks()`의 나머지 부분은 중단되지만, 다른 코드는 계속 실행될 수 있다.
        
        ### 실행 흐름
        
        ```
        비동기 함수 실행
              ↓
        await에서 함수 진행 중단
              ↓
        다른 JavaScript 작업과 브라우저 작업 진행
              ↓
        Promise 결과 확정
              ↓
        이어지는 코드가 실행 가능한 시점에 재개
        ```
        
        `await` 뒤의 코드는 Promise의 후속 처리로 예약된다. 결과가 준비되었다고 현재 실행 중인 코드를 즉시 끊고 들어오는 것은 아니다.
        
        ### async가 코드를 자동으로 별도 스레드에서 실행할까?
        
        그렇지 않다.
        
        ```
        async function heavyWork(): Promise<number> {
          let total = 0;
        
          for (let i = 0; i < 1_000_000_000; i += 1) {
            total += i;
          }
        
          return total;
        }
        ```
        
        이 함수는 `async`로 선언했지만, 반복문은 동기적으로 실행된다. 메인 스레드에서 오래 실행되면 입력 처리와 화면 갱신이 지연될 수 있다.
        
        ```
        네트워크 결과 기다리기
        → 비동기적으로 대기 가능
        
        큰 반복문 직접 실행
        → 실행 시간 동안 메인 스레드 점유 가능
        ```
        
        무거운 연산은 작업을 나누거나 Web Worker 등을 고려해야 한다.
        
        → **비동기 대기와 병렬 실행은 같은 개념이 아니다.**
        
- fetch와 HTTP 요청 라이브러리
    - `fetch`에서 네트워크 오류와 HTTP 오류를 따로 처리해야 하는 이유는 무엇일까요?
        
        ## 네트워크 오류와 HTTP 오류를 따로 처리해야 하는 이유
        
        > `fetch()`는 **응답을 받지 못한 실패**와 **오류 상태 코드가 포함된 응답**을 다르게 처리하기 때문이다.
        > 
        
        ### 네트워크 단계의 실패
        
        연결 실패 등으로 응답을 얻지 못하면 `fetch()`의 Promise가 rejected된다.
        
        CORS에 의해 응답 접근이 차단되는 경우도 코드에서는 요청 실패로 보일 수 있다. 사용자 취소는 `AbortError` 등 별도로 구분할 수 있다.
        
        ### HTTP 오류
        
        서버가 다음처럼 응답했다면 HTTP 응답 자체는 받은 것이다.
        
        ```
        404 → 대상을 찾지 못함
        500 → 서버 내부 오류
        ```
        
        따라서 `fetch()`는 일반적으로 정상적인 `Response` 객체를 반환한다.
        
        ```
        try {
          const response = await fetch("/api/books/999");
        
          // 404여도 이 위치까지 실행될 수 있다.
          console.log(response.status);
        } catch {
          // HTTP 404라는 이유만으로 실행되지는 않는다.
        }
        ```
        
        ### response.ok 확인
        
        `response.ok`는 상태 코드가 `200~299`일 때 `true`이다.
        
        ```
        class HttpError extends Error {
          constructor(public readonly status: number) {
            super(`HTTP 오류: ${status}`);
            this.name = "HttpError";
          }
        }
        
        async function getBook(): Promise<unknown> {
          const response = await fetch("/api/books/999");
        
          if (!response.ok) {
            throw new HttpError(response.status);
          }
        
          return response.json();
        }
        ```
        
        호출부에서는 구분하여 처리할 수 있다.
        
        ```
        try {
          const book = await getBook();
          console.log(book);
        } catch (error: unknown) {
          if (error instanceof HttpError) {
            console.error("서버 응답 오류", error.status);
          } else {
            console.error(
              "요청 또는 응답 처리 중 오류가 발생했습니다.",
              error,
            );
          }
        }
        ```
        
        ### JSON 파싱 오류도 구분해야 한다
        
        서버가 `200`을 반환해도 응답이 올바른 JSON이 아니면 `response.json()`이 실패할 수 있다.
        
        따라서 catch에 들어왔다고 전부 네트워크 오류라고 부르면 부정확하다.
        
        | 오류 종류 | 예시 |
        | --- | --- |
        | 요청 실패 | 연결 실패, CORS 차단 |
        | 요청 취소 | AbortController로 취소 |
        | HTTP 오류 | 404, 500 |
        | 본문 처리 오류 | JSON 파싱 실패 |
        
        `204 No Content`처럼 본문이 없는 성공 응답에 무조건 `.json()`을 호출하지 않는 것도 중요하다.
        
    - 순수 `fetch`로 여러 API 함수를 작성하면 어떤 설정과 처리가 반복될까요?
        
        ## 순수 `fetch`로 여러 API 함수 작성 시 반복되는 처리
        
        > API마다 공통으로 필요한 **요청 설정, 응답 검사, 데이터 변환, 오류 처리**가 반복될 수 있다.
        > 
        
        | 반복되는 작업 | 예시 |
        | --- | --- |
        | 기본 주소 | API 서버 주소 연결 |
        | 쿼리 문자열 | 검색어·페이지를 URL에 추가 |
        | 요청 헤더 | `Accept`, `Content-Type` |
        | 인증 관련 설정 | 쿠키 포함, 인증 헤더 |
        | 요청 본문 변환 | `JSON.stringify()` |
        | HTTP 오류 검사 | `response.ok` 확인 |
        | 응답 본문 처리 | `response.json()` |
        | 요청 제어 | 취소, 시간 제한 |
        | 공통 오류 처리 | 오류 객체와 메시지 형식 통일 |
        
        ### 반복 예시
        
        ```
        async function getBooks(): Promise<unknown> {
          const response = await fetch("/api/books");
        
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
        
          return response.json();
        }
        
        async function getCategories(): Promise<unknown> {
          const response = await fetch("/api/categories");
        
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
        
          return response.json();
        }
        ```
        
        주소만 다르고 나머지 처리가 비슷하다.
        
        ### 공통 함수로 묶기
        
        다음은 **성공 시 JSON 본문을 반환하는 API 전용** 예시이다.
        
        ```
        async function requestJson(
          path: string,
          options: RequestInit = {},
        ): Promise<unknown> {
          const headers = new Headers(options.headers);
        
          if (!headers.has("Accept")) {
            headers.set("Accept", "application/json");
          }
        
          const response = await fetch(`/api${path}`, {
            ...options,
            headers,
          });
        
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
        
          return response.json();
        }
        ```
        
        ```
        const books = await requestJson("/books");
        
        const categories = await requestJson("/categories");
        ```
        
        POST 요청에도 사용할 수 있다.
        
        ```
        const bookmark = await requestJson("/bookmarks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookId: 10,
          }),
        });
        ```
        
        ### 모든 API를 같은 방식으로 처리하면 안 된다
        
        ```
        JSON 응답 → json()
        파일 응답 → blob() 등
        텍스트 응답 → text()
        본문 없는 응답 → 본문 파싱 생략
        ```
        
        또한 `FormData`를 전송할 때는 브라우저가 multipart 경계값을 설정하도록 `Content-Type`을 직접 지정하지 않는 것이 일반적이다.
        
        공통 함수는 반복을 줄이는 데 유용하지만, **서로 다른 요청·응답 형식까지 하나의 가정으로 강제하지 않도록** 설계해야 한다.
        
    - ky와 Axios는 JSON 응답을 읽고 공통 요청 처리를 추가하는 방식이 어떻게 다를까요?
        
        ## 공통 요청 처리를 추가하는 방식의 차이
        
        > ky는 Fetch API와 가까운 사용 방식을 제공하고, Axios는 **자체 응답 객체와 interceptor 구조**를 제공한다.
        > 
        
        두 라이브러리 모두 Promise 기반으로 HTTP 요청을 처리한다.
        
        ### ky의 JSON 응답 처리
        
        ```
        import ky from "ky";
        
        type Book = {
          id: number;
          title: string;
        };
        
        const books = await ky
          .get("/api/books")
          .json<Book[]>();
        ```
        
        → `.json<Book[]>()`으로 파싱한 데이터를 직접 받음
        
        JSON 요청 본문은 `json` 옵션으로 전달할 수 있다.
        
        ```
        const bookmark = await ky
          .post("/api/bookmarks", {
            json: {
              bookId: 10,
            },
          })
          .json<{
            id: number;
            bookId: number;
          }>();
        ```
        
        ### Axios의 JSON 응답 처리
        
        ```
        import axios from "axios";
        
        type Book = {
          id: number;
          title: string;
        };
        
        const response = await axios.get<Book[]>(
          "/api/books",
        );
        
        const books = response.data;
        ```
        
        → Axios 응답 객체의 `data`에서 본문을 꺼냄
        
        ```
        const response = await axios.post<{
          id: number;
          bookId: number;
        }>("/api/bookmarks", {
          bookId: 10,
        });
        
        const bookmark = response.data;
        ```
        
        일반적인 JSON 사용에서는 객체 전달과 응답 변환을 라이브러리가 처리한다.
        
        ### 공통 설정
        
        ky는 공통 옵션을 가진 인스턴스를 만들 수 있다.
        
        ```
        const api = ky.create({
          timeout: 10_000,
          headers: {
            Accept: "application/json",
          },
        });
        
        const books = await api
          .get("/api/books")
          .json<Book[]>();
        ```
        
        요청 전후의 공통 처리는 `beforeRequest`, `afterResponse` 등의 **hook**으로 연결할 수 있다. hook 인자 형태와 옵션 이름은 버전에 따라 확인해야 한다.
        
        Axios도 인스턴스에 공통 설정을 둘 수 있다.
        
        ```
        const api = axios.create({
          baseURL: "/api",
          timeout: 10_000,
        });
        
        api.interceptors.request.use((config) => {
          config.headers.set("Accept", "application/json");
          return config;
        });
        
        const response = await api.get<Book[]>("/books");
        ```
        
        Axios의 **interceptor**는 요청 전이나 응답 후에 공통 처리를 연결한다.
        
        응답 interceptor에서 오류를 계속 전달하려면 `Promise.reject(error)` 등을 반환해야 한다. 오류를 처리하다가 성공 값처럼 반환하면 호출부의 흐름이 달라질 수 있다.
        
        ### 비교
        
        | 구분 | ky | Axios |
        | --- | --- | --- |
        | JSON 본문 읽기 | `.json<T>()` | `response.data` |
        | JSON 요청 전송 | `json: data` | `post(url, data)` |
        | 공통 인스턴스 | `ky.create()` | `axios.create()` |
        | 공통 요청·응답 처리 | hooks | interceptors |
        | 기본 HTTP 오류 처리 | 일반적으로 비-2xx에서 reject | 기본적으로 비-2xx에서 reject |
        
        Axios는 `validateStatus`로 성공으로 취급할 범위를 변경할 수 있고, ky도 HTTP 오류 처리 설정을 변경할 수 있다. **라이브러리 기본값과 프로젝트 설정을 함께 확인해야 한다.**
        
        또한 `<Book[]>`는 TypeScript가 기대하는 타입을 알려줄 뿐이다. 실제 서버 응답이 그 구조인지 자동 검증하지는 않는다.
        
- 비동기 데이터의 UI 상태
    - 서버 데이터를 보여 주는 화면에서 로딩, 오류, 빈 결과와 성공 상태를 구분해야 하는 이유는 무엇일까요?
        
        ## 로딩, 오류, 빈 결과와 성공 상태를 구분해야 하는 이유
        
        > 데이터가 보이지 않는 이유에 따라 **사용자가 이해해야 할 상황과 다음 행동이 다르기 때문**이다.
        > 
        
        도서 목록이 비어 있다고 하더라도 원인은 다를 수 있다.
        
        ```
        아직 응답을 기다리는 중인가?
        요청이 실패했는가?
        검색 결과가 실제로 없는가?
        정상적으로 데이터를 받았는가?
        ```
        
        ### 상태별 의미
        
        | 상태 | 의미 |
        | --- | --- |
        | 로딩 | 요청을 처리하고 결과를 기다리는 중 |
        | 오류 | 요청 또는 데이터 처리에 실패 |
        | 빈 결과 | 조회에 성공했지만 보여줄 항목이 없음 |
        | 성공 | 조회에 성공했고 표시할 데이터가 있음 |
        
        특히 **빈 결과는 실패가 아니라 성공한 조회의 한 종류**이다.
        
        ```
        200 OK + []
        → 조회 성공, 결과 없음
        
        500 Internal Server Error
        → 조회 실패
        ```
        
        오류가 났을 때 데이터를 빈 배열로만 바꾸면 사용자는 “책이 없다”고 오해할 수 있다.
        
        ### 상태를 명시적으로 표현하기
        
        TypeScript의 유니온 타입을 사용할 수 있다.
        
        ```
        type Book = {
          id: number;
          title: string;
        };
        
        type BooksState =
          | { status: "loading" }
          | { status: "error"; message: string }
          | { status: "success"; books: Book[] };
        ```
        
        빈 결과는 성공 상태에서 배열 길이로 구분한다.
        
        ```
        if (
          state.status === "success" &&
          state.books.length === 0
        ) {
          // 빈 결과 UI
        }
        ```
        
        이렇게 하면 `isLoading`, `isError`, `isSuccess`가 동시에 참이 되는 등의 모순을 줄일 수 있다.
        
        요청 전 대기 상태가 필요한 화면이라면 `idle`을 추가할 수도 있다.
        
        → 화면 상태는 단순히 데이터 유무가 아니라 **요청의 진행 상황과 결과를 함께 표현**해야 한다.
        
    - 각 상태를 사용자가 이해할 수 있게 표현하려면 어떤 정보와 동작이 필요할까요?
        
        ## 필요한 정보와 동작
        
        > 각 상태에서 **현재 상황, 표시할 내용, 가능한 다음 행동**을 제공해야 한다.
        > 
        
        ### 로딩
        
        ```
        도서 목록을 불러오는 중입니다.
        ```
        
        스피너나 스켈레톤을 사용할 수 있다. 전체 소요량을 모른다면 근거 없는 진행률을 표시하기보다 처리 중임을 알리는 편이 정확하다.
        
        중복 제출이 문제가 되는 저장 요청에서는 처리 중 버튼을 비활성화할 수 있다.
        
        ### 오류
        
        ```
        도서 목록을 불러오지 못했습니다.
        잠시 후 다시 시도해 주세요.
        
        [다시 시도]
        ```
        
        상황에 맞는 행동을 제공한다.
        
        | 오류 상황 | 가능한 안내·행동 |
        | --- | --- |
        | 일시적인 연결 실패 | 다시 시도 |
        | 인증 만료 | 로그인 |
        | 권한 부족 | 접근 불가 안내 |
        | 대상 삭제·존재하지 않음 | 목록으로 돌아가기 |
        
        내부 스택 추적이나 서버의 민감한 오류 정보를 그대로 화면에 보여주지는 않는다.
        
        ### 빈 결과
        
        ```
        검색 결과가 없습니다.
        다른 검색어를 입력하거나 필터를 변경해 보세요.
        
        [필터 초기화]
        ```
        
        북마크가 비어 있다면 다른 안내가 적절하다.
        
        ```
        아직 북마크한 도서가 없습니다.
        
        [도서 둘러보기]
        ```
        
        같은 빈 배열이어도 **검색 결과인지, 사용자가 아직 등록하지 않은 상태인지**에 따라 안내가 달라진다.
        
        ### 성공
        
        조회한 데이터를 보여주되, 현재 검색 조건이나 결과 개수처럼 해석에 필요한 정보도 제공할 수 있다.
        
        ```
        ‘도서관’ 검색 결과 12건
        ```
        
        ### React 표현 예시
        
        다음은 앞의 `BooksState`를 사용하는 표시 컴포넌트이다.
        
        ```
        type BookListViewProps = {
          state: BooksState;
          onRetry: () => void;
        };
        
        export function BookListView({
          state,
          onRetry,
        }: BookListViewProps) {
          if (state.status === "loading") {
            return (
              <p role="status">
                도서 목록을 불러오는 중입니다.
              </p>
            );
          }
        
          if (state.status === "error") {
            return (
              <section>
                <p role="alert">{state.message}</p>
        
                <button type="button" onClick={onRetry}>
                  다시 시도
                </button>
              </section>
            );
          }
        
          if (state.books.length === 0) {
            return <p>조회된 도서가 없습니다.</p>;
          }
        
          return (
            <ul>
              {state.books.map((book) => (
                <li key={book.id}>{book.title}</li>
              ))}
            </ul>
          );
        }
        ```
        
        ### 재조회와 오래된 응답도 고려해야 한다
        
        이미 데이터가 있는 상태에서 다시 조회한다면, 기존 목록을 유지하면서 “새로고침 중”이라고 표시할 수 있다. 최초 로딩과 재조회를 반드시 같은 화면으로 처리할 필요는 없다.
        
        또한 검색어를 빠르게 바꾸면 먼저 보낸 요청이 나중에 도착할 수 있다.
        
        ```
        A 검색 요청
        B 검색 요청
        B 응답 도착 → B 결과 표시
        A 응답 도착 → 잘못하면 A 결과로 덮어씀
        ```
        
        요청 취소나 이전 응답 무시 처리를 통해 **현재 화면 조건에 맞는 응답만 반영**해야 한다.
        
    - API 응답 타입과 화면에서 사용하는 타입을 분리하면 어떤 상황에서 도움이 될까요?
        
        ## 타입을 분리하면 도움이 되는 상황
        
        > 서버의 데이터 구조와 화면의 표현 요구가 다를 때, **변환 책임을 한곳에 모으고 변경 영향을 줄일 수 있다.**
        > 
        
        서버는 저장·전송에 적합한 데이터를 반환하고, 화면은 사용자가 읽기 좋은 데이터를 필요로 한다.
        
        ### API 응답 타입
        
        ```
        type BookApiResponse = {
          book_id: number;
          title: string;
          category: {
            name: string;
          } | null;
          is_available: boolean;
        };
        ```
        
        ### 화면용 타입
        
        ```
        type BookCardModel = {
          id: number;
          title: string;
          categoryName: string;
          availabilityLabel: string;
          canRent: boolean;
        };
        ```
        
        화면에서는 다음 작업이 필요할 수 있다.
        
        ```
        book_id → id로 이름 변경
        중첩된 category.name → categoryName으로 정리
        category가 null → 기본 문구 사용
        boolean → 사용자용 문구로 변환
        ```
        
        ### 변환 함수
        
        ```
        function toBookCardModel(
          book: BookApiResponse,
        ): BookCardModel {
          return {
            id: book.book_id,
            title: book.title,
            categoryName:
              book.category?.name ?? "미분류",
            availabilityLabel: book.is_available
              ? "대여 가능"
              : "대여 중",
            canRent: book.is_available,
          };
        }
        ```
        
        ```
        const cards: BookCardModel[] =
          apiBooks.map(toBookCardModel);
        ```
        
        → 화면에서는 서버의 중첩 구조나 NULL 처리 방식을 반복해서 알 필요가 줄어듦
        
        ### 도움이 되는 상황
        
        | 상황 | 분리했을 때의 이점 |
        | --- | --- |
        | 서버 필드 이름 변경 | 변환 부분을 중심으로 수정 |
        | 중첩 구조가 복잡함 | 화면에서 사용하기 쉽게 정리 |
        | NULL 허용 필드 존재 | 기본값 처리 통일 |
        | 날짜·금액 표시 | 형식 변환 위치 통일 |
        | 여러 API를 조합 | 하나의 화면 모델로 구성 |
        | 같은 API를 여러 화면에서 사용 | 화면마다 필요한 표현으로 변환 |
        
        다만 API와 화면의 구조가 같고 별도 변환이 필요 없다면 무조건 타입을 복제할 필요는 없다.
        
        ### 타입 선언은 응답 검증이 아니다
        
        ```
        const data = await response.json()
          as BookApiResponse;
        ```
        
        이 코드는 서버 응답이 실제로 `BookApiResponse`인지 검사하지 않는다.
        
        잘못된 데이터에 대비하려면 런타임 검증을 별도로 수행해야 한다.
        
        ```
        서버 응답
           ↓
        필요한 경우 런타임 구조 검증
           ↓
        API 응답 데이터로 취급
           ↓
        화면 모델로 변환
           ↓
        UI 표시
        ```
        
        또한 `canRent`는 화면에서 버튼을 표시하는 데 쓰는 값일 뿐, 실제 대여 가능 여부나 권한을 최종 보장하지 않는다. 서버는 요청 시점에 다시 확인해야 한다.
        
        → 응답 타입과 화면 타입을 분리하는 목적은 **서버 계약과 화면 표현 사이의 변환을 명확하게 관리하는 것**이다. TypeScript 타입 단언 자체에는 런타임 검사 기능이 없다.