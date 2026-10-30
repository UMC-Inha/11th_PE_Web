- HTTP와 API
    - API, endpoint, HTTP method와 status code는 요청과 응답에서 각각 어떤 역할을 할까요?
        
        ### API
        
        API(Application Programming Interface)는 서로 다른 프로그램이 정해진 규칙에 따라 기능과 데이터를 주고받기 위한 인터페이스다.
        
        웹에서는 클라이언트가 API 서버에 HTTP 요청을 보내고, 서버가 처리 결과를 HTTP 응답으로 반환한다.
        
        ```
        클라이언트
        → HTTP 요청
        → API 서버
        → HTTP 응답
        → 클라이언트
        ```
        
        예를 들어 프론트엔드는 도서 목록 API를 호출하여 서버가 관리하는 도서 데이터를 받을 수 있다.
        
        ---
        
        ### Endpoint
        
        Endpoint는 클라이언트가 API의 특정 기능에 접근하기 위한 주소다.
        
        ```
        GET /api/books
        GET /api/books/1
        POST /api/books
        ```
        
        같은 `/api/books` 주소라도 HTTP method에 따라 수행하는 작업이 달라질 수 있다.
        
        | Endpoint | Method | 역할 |
        | --- | --- | --- |
        | `/api/books` | `GET` | 도서 목록 조회 |
        | `/api/books/1` | `GET` | 1번 도서 조회 |
        | `/api/books` | `POST` | 도서 등록 |
        | `/api/books/1` | `PATCH` | 1번 도서 일부 수정 |
        | `/api/books/1` | `DELETE` | 1번 도서 삭제 |
        
        일반적으로 endpoint는 **HTTP method와 URL을 함께 고려하여 구분**한다.
        
        ---
        
        ### HTTP Method
        
        HTTP method는 클라이언트가 서버에 요청하는 작업의 종류를 나타낸다.
        
        | Method | 역할 | 예시 |
        | --- | --- | --- |
        | `GET` | 데이터 조회 | 도서 목록 조회 |
        | `POST` | 데이터 생성 또는 작업 요청 | 새로운 도서 등록 |
        | `PUT` | 자원 전체 수정·교체 | 도서 정보 전체 수정 |
        | `PATCH` | 자원 일부 수정 | 도서 대여 가능 여부 수정 |
        | `DELETE` | 데이터 삭제 | 도서 삭제 |
        
        예를 들어 다음 요청은 1번 도서를 조회한다는 의미다.
        
        ```
        GET /api/books/1
        ```
        
        다음 요청은 새로운 도서를 등록한다는 의미다.
        
        ```json
        POST /api/books
        Content-Type: application/json
        
        {
          "categoryId": 2,
          "title": "데미안",
          "description": "헤르만 헤세의 소설"
        }
        ```
        
        ---
        
        ### HTTP Status Code
        
        HTTP status code는 서버가 요청을 처리한 결과를 숫자로 나타낸다.
        
        | 범위 | 의미 | 대표 코드 |
        | --- | --- | --- |
        | `2xx` | 요청 처리 성공 | `200`, `201`, `204` |
        | `3xx` | 리다이렉션 | `301`, `302`, `304` |
        | `4xx` | 클라이언트 요청 문제 | `400`, `401`, `403`, `404` |
        | `5xx` | 서버 내부 문제 | `500`, `503` |
        
        대표적인 상태 코드는 다음과 같다.
        
        | 코드 | 의미 | 사용 예시 |
        | --- | --- | --- |
        | `200 OK` | 요청 성공 | 조회·수정 성공 |
        | `201 Created` | 자원 생성 성공 | 도서 등록 성공 |
        | `204 No Content` | 응답 본문 없이 성공 | 삭제 성공 |
        | `400 Bad Request` | 잘못된 요청 | 필수값 누락, 형식 오류 |
        | `401 Unauthorized` | 인증 필요 또는 실패 | 로그인하지 않음 |
        | `403 Forbidden` | 접근 권한 없음 | 일반 사용자의 관리자 기능 접근 |
        | `404 Not Found` | 자원을 찾을 수 없음 | 존재하지 않는 도서 조회 |
        | `409 Conflict` | 현재 상태와 충돌 | 중복 데이터 등록 |
        | `500 Internal Server Error` | 서버 내부 오류 | 처리 중 예상하지 못한 오류 |
        
        > `401`은 주로 인증되지 않은 경우이고, `403`은 사용자가 누구인지는 확인했지만 해당 작업의 권한이 없는 경우다.
        > 
        
        ---
        
        ### 요청과 응답에서의 역할
        
        ```
        요청
        ├── Endpoint: 어떤 자원에 요청할지 결정
        ├── HTTP Method: 어떤 작업을 수행할지 표현
        ├── Header: 인증 정보, 데이터 형식 등 전달
        └── Body: 등록하거나 수정할 데이터 전달
        
        응답
        ├── Status Code: 요청 처리 결과 표현
        ├── Header: 응답 형식, 캐시 정책 등 전달
        └── Body: 실제 데이터 또는 오류 정보 전달
        ```
        
        정리하면 **API는 통신 규칙 전체, endpoint는 기능에 접근하는 주소, HTTP method는 요청할 작업, status code는 서버의 처리 결과**를 의미한다.
        
    - 브라우저와 API 서버의 origin이 다를 때 CORS는 어떤 역할을 할까요?
        
        ### Origin이란?
        
        Origin은 URL의 다음 세 요소를 합친 것이다.
        
        ```
        프로토콜 + 호스트 + 포트
        ```
        
        예를 들어 다음 두 주소는 포트가 다르므로 서로 다른 origin이다.
        
        ```
        프론트엔드: http://localhost:5173
        API 서버:   http://localhost:8080
        ```
        
        다음 경우에도 서로 다른 origin으로 판단한다.
        
        - 프로토콜이 다른 경우: `http`와 `https`
        - 호스트가 다른 경우: `example.com`과 `api.example.com`
        - 포트가 다른 경우: `5173`과 `8080`
        
        ---
        
        ### Same-Origin Policy
        
        브라우저에는 다른 origin의 데이터에 함부로 접근하지 못하게 제한하는 **동일 출처 정책(Same-Origin Policy)**이 있다.
        
        프론트엔드와 API 서버의 origin이 다르면 브라우저가 API 응답을 프론트엔드 JavaScript에 전달하지 않을 수 있다.
        
        ```
        http://localhost:5173
        → http://localhost:8080/api/books
        → 다른 origin이므로 브라우저가 접근 여부 확인
        ```
        
        ---
        
        ### CORS의 역할
        
        CORS(Cross-Origin Resource Sharing)는 서버가 **어떤 origin의 브라우저 요청을 허용할지 알려 주는 규칙**이다.
        
        서버는 응답 헤더를 통해 허용된 origin을 전달한다.
        
        ```
        Access-Control-Allow-Origin: http://localhost:5173
        ```
        
        브라우저는 이 헤더를 확인한 뒤 프론트엔드 JavaScript가 API 응답을 읽을 수 있게 한다.
        
        ```
        브라우저가 다른 origin으로 요청
        → API 서버가 CORS 허용 헤더 응답
        → 브라우저가 허용 여부 확인
        → 허용된 경우 응답을 프론트엔드에 전달
        ```
        
        Spring Boot에서는 다음과 같이 특정 origin을 허용할 수 있다.
        
        ```java
        @CrossOrigin(origins = "http://localhost:5173")
        @RestController
        @RequestMapping("/api/books")
        public class BookController {
        }
        ```
        
        애플리케이션 전체에 적용하려면 전역 CORS 설정을 사용할 수 있다.
        
        ```java
        @Configuration
        public class WebConfig implements WebMvcConfigurer {
        
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:5173")
                    .allowedMethods(
                        "GET",
                        "POST",
                        "PATCH",
                        "DELETE"
                    );
            }
        }
        ```
        
        ---
        
        ### Preflight 요청
        
        브라우저는 실제 요청을 보내기 전에 해당 요청이 허용되는지 확인하기 위해 `OPTIONS` 요청을 먼저 보낼 수 있다. 이를 preflight 요청이라고 한다.
        
        ```
        OPTIONS 요청
        → 서버가 허용할 origin·method·header 응답
        → 브라우저가 확인
        → 실제 POST·PATCH·DELETE 요청 전송
        ```
        
        서버는 다음과 같은 정보로 허용 범위를 알려준다.
        
        ```
        Access-Control-Allow-Origin: http://localhost:5173
        Access-Control-Allow-Methods: GET, POST, PATCH, DELETE
        Access-Control-Allow-Headers: Content-Type, Authorization
        ```
        
        모든 교차 출처 요청에 preflight가 발생하는 것은 아니다. 특정 method나 header를 사용하는 등 단순 요청의 조건을 벗어날 때 발생한다.
        
        ---
        
        ### CORS 사용 시 주의점
        
        CORS는 브라우저가 적용하는 정책이다. Postman이나 서버 간 통신은 브라우저의 동일 출처 정책을 적용받지 않으므로 같은 CORS 제한이 발생하지 않는다.
        
        또한 CORS는 인증이나 인가 기능이 아니다. 특정 origin을 허용해도 서버에서는 사용자 인증과 접근 권한을 별도로 확인해야 한다.
        
        ```
        CORS
        → 어느 웹페이지가 브라우저에서 응답을 읽을 수 있는지 결정
        
        인증·인가
        → 누가 어떤 데이터와 기능에 접근할 수 있는지 결정
        ```
        
        따라서 CORS는 **브라우저와 API 서버의 origin이 다를 때, 서버가 허용한 프론트엔드에서만 API 응답을 읽을 수 있도록 교차 출처 요청을 제어하는 역할**을 한다.
        
- Promise와 비동기 처리
    - Promise의 pending, fulfilled와 rejected 상태는 각각 무엇을 의미할까요?
        
        `Promise`는 네트워크 요청이나 파일 읽기처럼 결과가 나중에 결정되는 작업의 상태와 결과를 표현하는 JavaScript 객체다.
        
        Promise는 다음 세 상태 중 하나를 가진다.
        
        | 상태 | 의미 | 예시 |
        | --- | --- | --- |
        | `pending` | 작업이 아직 완료되지 않음 | API 응답을 기다리는 중 |
        | `fulfilled` | 작업이 성공적으로 완료됨 | 서버에서 데이터를 정상적으로 받음 |
        | `rejected` | 작업이 실패함 | 네트워크 오류가 발생함 |
        
        ```jsx
        const promise = fetch("/api/books");
        ```
        
        `fetch()`를 호출한 직후에는 응답을 기다리고 있으므로 `pending` 상태다.
        
        ```
        pending
        ├── 작업 성공 → fulfilled
        └── 작업 실패 → rejected
        ```
        
        `fulfilled` 상태가 되면 성공 결과를 받을 수 있다.
        
        ```jsx
        promise.then((response) => {
          console.log(response);
        });
        ```
        
        `rejected` 상태가 되면 실패 원인을 받을 수 있다.
        
        ```jsx
        promise.catch((error) => {
          console.error(error);
        });
        ```
        
        Promise가 `fulfilled` 또는 `rejected`가 되면 작업이 끝난 상태이며, 두 상태를 합쳐서 `settled`라고 한다. 한 번 결정된 Promise의 상태는 다시 바뀌지 않는다.
        
        ```
        pending → fulfilled
        pending → rejected
        
        fulfilled → rejected 불가능
        rejected → fulfilled 불가능
        ```
        
    - `.then().catch()`와 `async/await`는 같은 비동기 흐름을 어떻게 다르게 표현하나요?
        
        두 방식 모두 Promise의 성공 결과와 실패를 처리한다. 동작 원리는 같지만 코드를 표현하는 방법이 다르다.
        
        ### `.then().catch()` 방식
        
        Promise 뒤에 성공 처리와 실패 처리를 연결한다.
        
        ```jsx
        fetch("/api/books")
          .then((response) => {
            if (!response.ok) {
              throw new Error("도서 조회에 실패했습니다.");
            }
        
            return response.json();
          })
          .then((books) => {
            console.log(books);
          })
          .catch((error) => {
            console.error(error);
          });
        ```
        
        - `.then()`은 이전 Promise가 성공했을 때 실행된다.
        - `.catch()`는 앞의 Promise 체인에서 오류가 발생했을 때 실행된다.
        - `.then()`에서 반환한 값은 다음 `.then()`으로 전달된다.
        - Promise를 반환하면 다음 `.then()`은 그 작업이 끝날 때까지 기다린다.
        
        ```
        fetch()
        → 응답 처리
        → JSON 변환
        → 데이터 사용
        → 오류 발생 시 catch()
        ```
        
        ### `async/await` 방식
        
        `async` 함수 안에서 Promise의 결과를 기다린 뒤 다음 줄로 진행하는 것처럼 작성한다.
        
        ```jsx
        async function loadBooks() {
          try {
            const response = await fetch("/api/books");
        
            if (!response.ok) {
              throw new Error("도서 조회에 실패했습니다.");
            }
        
            const books = await response.json();
            console.log(books);
          } catch (error) {
            console.error(error);
          }
        }
        ```
        
        - `async`가 붙은 함수는 항상 Promise를 반환한다.
        - `await`는 Promise가 처리될 때까지 해당 함수의 다음 코드 실행을 미룬다.
        - 실패 처리는 일반적으로 `try-catch`를 사용한다.
        
        ### 두 방식 비교
        
        | 구분 | `.then().catch()` | `async/await` |
        | --- | --- | --- |
        | 표현 방식 | Promise 작업을 체인으로 연결 | 동기 코드와 비슷하게 위에서 아래로 작성 |
        | 성공 처리 | `.then()` | `await` 다음 코드 |
        | 실패 처리 | `.catch()` | `try-catch` |
        | 장점 | 간단한 Promise 연결에 적합 | 여러 비동기 작업의 순서를 읽기 쉬움 |
        | 내부 원리 | Promise | Promise |
        
        다음 두 코드는 같은 흐름을 표현한다.
        
        ```jsx
        getBook()
          .then((book) => getCategory(book.categoryId))
          .then((category) => console.log(category))
          .catch((error) => console.error(error));
        ```
        
        ```jsx
        async function loadCategory() {
          try {
            const book = await getBook();
            const category = await getCategory(book.categoryId);
        
            console.log(category);
          } catch (error) {
            console.error(error);
          }
        }
        ```
        
        `async/await`는 Promise를 대체하는 별개의 기술이 아니라, **Promise 기반 비동기 처리를 더 순차적으로 읽히게 작성하는 문법**이다.
        
    - `await`를 사용해도 브라우저 전체가 멈추지 않는 이유는 무엇일까요?
        
        `await`는 브라우저 전체를 멈추는 것이 아니라 **현재 실행 중인 `async` 함수의 진행만 잠시 멈춘다.**
        
        ```jsx
        async function loadBooks() {
          console.log("요청 시작");
        
          const response = await fetch("/api/books");
        
          console.log("응답 완료");
        }
        ```
        
        `fetch()`의 응답을 기다리는 동안 `loadBooks()`의 다음 줄은 실행되지 않는다. 하지만 브라우저는 다른 JavaScript 작업이나 화면 처리를 계속 수행할 수 있다.
        
        ```
        loadBooks()는 응답 대기
                 ↓
        브라우저는 다른 작업 수행
        ├── 버튼 클릭 처리
        ├── 화면 렌더링
        ├── 타이머 실행
        └── 다른 이벤트 처리
        ```
        
        ### Event Loop의 동작
        
        JavaScript는 한 번에 하나의 코드를 실행하지만, 네트워크 요청이나 타이머 같은 작업을 JavaScript 실행 스택에서 계속 기다리지 않는다.
        
        ```
        1. async 함수 실행
        2. fetch 요청 시작
        3. await에서 async 함수의 실행 일시 중단
        4. 실행 스택을 비움
        5. 브라우저가 다른 이벤트와 렌더링 처리
        6. Promise 완료
        7. 중단했던 async 함수의 나머지 코드 실행
        ```
        
        예를 들어 다음 코드에서 API 응답을 기다리는 중에도 버튼을 클릭할 수 있다.
        
        ```jsx
        async function loadBooks() {
          const response = await fetch("/api/books");
          const books = await response.json();
        
          console.log(books);
        }
        
        loadBooks();
        
        console.log("다른 코드 실행");
        ```
        
        출력 순서는 일반적으로 다음과 같다.
        
        ```
        다른 코드 실행
        API 응답을 받은 후 books 출력
        ```
        
        `loadBooks()`가 `await`에서 멈췄을 때 호출한 쪽으로 제어권을 돌려주기 때문이다.
        
        다만 `await`가 있다고 모든 작업이 자동으로 비동기가 되는 것은 아니다. 반복문이나 복잡한 계산처럼 CPU를 오래 사용하는 동기 코드는 여전히 메인 스레드를 막는다.
        
        ```jsx
        async function calculate() {
          // 오래 걸리는 동기 계산은 브라우저를 멈추게 할 수 있음
          for (let i = 0; i < 10_000_000_000; i++) {
            // 계산
          }
        }
        ```
        
        따라서 `await`를 사용해도 브라우저 전체가 멈추지 않는 이유는 **Promise를 기다리는 동안 현재 async 함수만 중단되고, JavaScript 실행 스택이 비워져 이벤트 루프가 다른 작업을 처리할 수 있기 때문**이다.
        
- fetch와 HTTP 요청 라이브러리
    - `fetch`에서 네트워크 오류와 HTTP 오류를 따로 처리해야 하는 이유는 무엇일까요?
        
        `fetch()`는 네트워크 요청의 성공 여부와 HTTP 응답의 성공 여부를 다르게 처리한다.
        
        ### 네트워크 오류
        
        서버에 연결하지 못해 정상적인 HTTP 응답 자체를 받지 못한 경우다.
        
        - 인터넷 연결 끊김
        - DNS 조회 실패
        - 서버에 연결할 수 없음
        - 잘못된 URL
        - 요청 중단
        
        이 경우 `fetch()`가 반환한 Promise가 `rejected` 상태가 되므로 `catch`에서 처리할 수 있다.
        
        ```jsx
        try {
          const response = await fetch("/api/books");
        } catch (error) {
          console.error("네트워크 오류", error);
        }
        ```
        
        ### HTTP 오류
        
        서버가 요청을 받고 `404`, `400`, `500` 같은 오류 상태 코드로 응답한 경우다.
        
        이때는 오류 응답이더라도 서버로부터 정상적으로 HTTP 응답을 받은 것이므로 `fetch()`의 Promise는 `fulfilled` 상태가 된다. 따라서 `catch`로 바로 이동하지 않고 `response.ok`나 `response.status`를 직접 확인해야 한다. MDN
        
        ```jsx
        async function getBooks() {
          try {
            const response = await fetch("/api/books");
        
            if (!response.ok) {
              throw new Error(`HTTP 오류: ${response.status}`);
            }
        
            return await response.json();
          } catch (error) {
            console.error(error);
            throw error;
          }
        }
        ```
        
        `response.ok`는 상태 코드가 `200~299`이면 `true`, 그 외에는 `false`다.
        
        ```
        fetch 요청
        ├── 응답을 받지 못함
        │   └── Promise rejected → catch
        │
        └── HTTP 응답을 받음
            ├── 2xx → response.ok === true
            └── 4xx·5xx → response.ok === false
        ```
        
        따라서 `fetch`에서는 **통신 자체가 실패한 네트워크 오류와 서버가 오류 상태 코드를 반환한 HTTP 오류를 별도로 확인해야 한다.**
        
    - 순수 `fetch`로 여러 API 함수를 작성하면 어떤 설정과 처리가 반복될까요?
        
        여러 API 함수를 순수 `fetch`로 작성하면 다음 코드가 반복될 수 있다.
        
        - 공통 API 서버 주소
        - `Content-Type` 같은 요청 헤더
        - 인증 토큰 설정
        - 요청 body의 `JSON.stringify()`
        - `response.ok` 검사
        - 응답의 `response.json()` 호출
        - 오류 응답 변환
        - 네트워크 오류 처리
        - 요청 취소와 timeout 처리
        
        ### 반복되는 코드 예시
        
        ```jsx
        async function createBook(request: BookCreateRequest) {
          const response = await fetch(
            "http://localhost:8080/api/books",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(request),
            },
          );
        
          if (!response.ok) {
            throw new Error(`HTTP 오류: ${response.status}`);
          }
        
          return await response.json();
        }
        ```
        
        다른 API에도 비슷한 코드가 필요하다.
        
        ```jsx
        async function updateBook(
          bookId: number,
          request: BookUpdateRequest,
        ) {
          const response = await fetch(
            `http://localhost:8080/api/books/${bookId}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(request),
            },
          );
        
          if (!response.ok) {
            throw new Error(`HTTP 오류: ${response.status}`);
          }
        
          return await response.json();
        }
        ```
        
        반복을 줄이기 위해 공통 요청 함수를 만들 수 있다.
        
        ```jsx
        const BASE_URL = "http://localhost:8080/api";
        
        async function apiFetch<T>(
          path: string,
          options: RequestInit = {},
        ): Promise<T> {
          const response = await fetch(`${BASE_URL}${path}`, {
            ...options,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              ...options.headers,
            },
          });
        
          if (!response.ok) {
            throw new Error(`HTTP 오류: ${response.status}`);
          }
        
          return response.json() as Promise<T>;
        }
        ```
        
        ```jsx
        function getBooks() {
          return apiFetch<BookResponse[]>("/books");
        }
        
        function createBook(request: BookCreateRequest) {
          return apiFetch<BookResponse>("/books", {
            method: "POST",
            body: JSON.stringify(request),
          });
        }
        ```
        
        결국 순수 `fetch`를 사용하면 프로젝트에 맞는 **HTTP 요청 래퍼를 직접 만들어 관리하게 될 수 있다.** ky나 Axios는 이러한 반복 처리를 줄이기 위한 기능을 제공한다.
        
    - ky와 Axios는 JSON 응답을 읽고 공통 요청 처리를 추가하는 방식이 어떻게 다를까요?
        
        ky와 Axios는 모두 HTTP 요청 코드를 줄여 주는 라이브러리지만 구조가 다르다.
        
        - **ky**: Fetch API를 기반으로 기능을 추가한 가벼운 라이브러리
        - **Axios**: 자체 요청·응답 설정 구조를 제공하는 Promise 기반 HTTP 클라이언트
        
        ---
        
        ### 순수 `fetch`
        
        `fetch`는 먼저 `Response` 객체를 반환하므로 JSON을 얻으려면 `.json()`을 호출해야 한다.
        
        ```jsx
        const response = await fetch("/api/books");
        
        if (!response.ok) {
          throw new Error("요청 실패");
        }
        
        const books = await response.json();
        ```
        
        ---
        
        ### ky의 JSON 처리
        
        ky도 Fetch API를 기반으로 하므로 `.json()`을 사용하지만, 응답을 먼저 `await`하지 않고 요청 뒤에 바로 연결할 수 있다.
        
        ```jsx
        import ky from "ky";
        
        const books = await ky
          .get("/api/books")
          .json<BookResponse[]>();
        ```
        
        ky의 `.json()`은 JSON 본문을 읽어 변환한 결과를 바로 반환한다. 또한 기본적으로 `2xx`가 아닌 상태 코드를 오류로 처리하므로 순수 `fetch`처럼 매번 `response.ok`를 검사할 필요가 없다. GitHub
        
        POST 요청에서는 `json` 옵션을 사용할 수 있다.
        
        ```jsx
        const book = await ky
          .post("/api/books", {
            json: {
              categoryId: 1,
              title: "데미안",
            },
          })
          .json<BookResponse>();
        ```
        
        `JSON.stringify()`와 `Content-Type: application/json` 설정을 직접 반복하지 않아도 된다.
        
        ---
        
        ### Axios의 JSON 처리
        
        Axios는 JSON 응답을 자동으로 변환하고, 변환된 결과를 `response.data`에 담아 반환한다.
        
        ```jsx
        import axios from "axios";
        
        const response = await axios.get<BookResponse[]>("/api/books");
        const books = response.data;
        ```
        
        Axios의 응답 객체에는 실제 데이터 외에도 상태 코드와 헤더 등이 포함된다. axios-http.com
        
        ```
        AxiosResponse
        ├── data
        ├── status
        ├── headers
        ├── config
        └── request
        ```
        
        구조 분해 할당을 사용할 수도 있다.
        
        ```jsx
        const { data: books } =
          await axios.get<BookResponse[]>("/api/books");
        ```
        
        POST 요청에 객체를 전달하면 JSON 요청으로 변환해 보낼 수 있다.
        
        ```jsx
        const { data: book } =
          await axios.post<BookResponse>("/api/books", {
            categoryId: 1,
            title: "데미안",
          });
        ```
        
        ---
        
        ## 공통 요청 처리 방식
        
        ### ky: instance와 hooks
        
        `ky.create()`로 기본 설정을 가진 인스턴스를 만들고, `hooks`를 사용하여 요청 전후의 공통 처리를 추가한다.
        
        ```jsx
        import ky from "ky";
        
        export const api = ky.create({
          prefixUrl: "http://localhost:8080/api",
        
          headers: {
            "Content-Type": "application/json",
          },
        
          hooks: {
            beforeRequest: [
              ({ request }) => {
                const token = localStorage.getItem("access-token");
        
                if (token) {
                  request.headers.set(
                    "Authorization",
                    `Bearer ${token}`,
                  );
                }
              },
            ],
        
            beforeError: [
              ({ error }) => {
                console.error("API 요청 실패", error);
                return error;
              },
            ],
          },
        });
        ```
        
        ```jsx
        const books = await api
          .get("books")
          .json<BookResponse[]>();
        ```
        
        ky는 `beforeRequest`, `afterResponse`, `beforeRetry`, `beforeError` 등의 hook으로 요청 생명주기에 공통 로직을 추가한다. GitHub
        
        ---
        
        ### Axios: instance와 interceptors
        
        `axios.create()`로 공통 설정을 가진 인스턴스를 만들고, interceptor로 요청과 응답을 가로채 처리한다.
        
        ```jsx
        import axios from "axios";
        
        export const api = axios.create({
          baseURL: "http://localhost:8080/api",
          headers: {
            "Content-Type": "application/json",
          },
        });
        ```
        
        ```jsx
        api.interceptors.request.use((config) => {
          const token = localStorage.getItem("access-token");
        
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        
          return config;
        });
        ```
        
        ```jsx
        api.interceptors.response.use(
          (response) => response,
          (error) => {
            console.error("API 요청 실패", error);
            return Promise.reject(error);
          },
        );
        ```
        
        ```jsx
        const response =
          await api.get<BookResponse[]>("/books");
        
        const books = response.data;
        ```
        
        Axios interceptor는 요청이 전송되기 전이나 응답이 사용하는 코드에 전달되기 전에 공통 처리를 적용한다.
        
        ---
        
        ## 비교 정리
        
        | 구분 | 순수 `fetch` | ky | Axios |
        | --- | --- | --- | --- |
        | 기반 | 브라우저 표준 API | Fetch API 기반 | 독립적인 HTTP 클라이언트 |
        | JSON 응답 | `response.json()` | `.json<T>()` | `response.data` |
        | JSON 요청 | 직접 `JSON.stringify()` | `json` 옵션 | 객체를 `data`로 전달 |
        | 4xx·5xx 처리 | 직접 `response.ok` 확인 | 기본적으로 오류 발생 | 기본적으로 오류 발생 |
        | 공통 인스턴스 | 직접 함수 작성 | `ky.create()` | `axios.create()` |
        | 공통 요청 처리 | 직접 래퍼 구현 | hooks | interceptors |
        | 대표 특징 | 별도 설치 불필요 | Fetch와 유사하고 간결함 | 기능과 생태계가 풍부함 |
        
        정리하면 **ky는 Fetch API의 사용 방식을 유지하면서 JSON 처리와 hooks 같은 편의 기능을 추가하고, Axios는 `response.data`와 interceptors 중심의 자체적인 요청·응답 구조를 제공한다.**
        
- 비동기 데이터의 UI 상태
    - 서버 데이터를 보여 주는 화면에서 로딩, 오류, 빈 결과와 성공 상태를 구분해야 하는 이유는 무엇일까요?
        
        서버 데이터는 요청과 동시에 화면에 나타나지 않는다. 요청을 보내고 응답을 받기까지 시간이 필요하며, 요청이 실패하거나 데이터가 없을 수도 있다.
        
        따라서 서버 데이터를 사용하는 화면은 다음 상태를 구분해야 한다.
        
        | 상태 | 의미 | 예시 |
        | --- | --- | --- |
        | 로딩 | 서버 응답을 기다리는 중 | 도서 목록을 불러오는 중 |
        | 오류 | 요청이 실패함 | 네트워크 오류, 서버 오류 |
        | 빈 결과 | 요청은 성공했지만 데이터가 없음 | 검색 결과가 0개 |
        | 성공 | 요청이 성공했고 보여 줄 데이터가 있음 | 도서 목록 표시 |
        
        ### 상태를 구분하지 않을 때의 문제
        
        요청이 진행 중인데 아무것도 표시하지 않으면 사용자는 버튼이 작동했는지 알 수 없다.
        
        또한 오류와 빈 결과를 같은 빈 화면으로 보여 주면 다음 두 상황을 구별할 수 없다.
        
        ```
        요청 성공 + 데이터 없음
        요청 실패 + 데이터를 받지 못함
        ```
        
        오류인데 단순히 “도서가 없습니다”라고 보여 주면 사용자는 실제로 데이터가 없는 것으로 오해할 수 있다.
        
        따라서 비동기 화면은 일반적으로 다음 순서로 상태를 확인한다.
        
        ```tsx
        if (isLoading) {
          return <Loading />;
        }
        
        if (isError) {
          return <ErrorMessage />;
        }
        
        if (books.length === 0) {
          return <EmptyResult />;
        }
        
        return <BookList books={books} />;
        ```
        
        상태를 구분하면 사용자가 현재 상황을 이해할 수 있고, 개발자도 각 상황에 맞는 화면과 동작을 명확하게 작성할 수 있다.
        
    - 각 상태를 사용자가 이해할 수 있게 표현하려면 어떤 정보와 동작이 필요할까요?
        
        상태를 단순히 표시하는 것에서 끝내지 않고, 사용자가 현재 상황과 다음 행동을 이해할 수 있게 해야 한다.
        
        | 상태 | 필요한 정보 | 제공할 동작 |
        | --- | --- | --- |
        | 로딩 | 무엇을 불러오는 중인지 | 필요하면 취소 |
        | 오류 | 무엇이 실패했는지 | 다시 시도, 이전 화면 이동 |
        | 빈 결과 | 데이터가 없는 이유 | 필터 초기화, 검색어 변경, 새 항목 등록 |
        | 성공 | 조회된 데이터와 현재 조건 | 상세 조회, 수정, 정렬, 페이지 이동 |
        
        ### 로딩 상태
        
        무엇을 기다리고 있는지 사용자가 알 수 있게 표시한다.
        
        ```tsx
        function Loading() {
          return <p>도서 목록을 불러오는 중입니다.</p>;
        }
        ```
        
        스피너나 스켈레톤 UI를 사용할 수도 있다.
        
        ```
        도서 목록을 불러오는 중...
        ```
        
        로딩 중에는 중복 요청을 막기 위해 버튼을 비활성화할 수 있다.
        
        ```tsx
        <button disabled={isLoading}>
          {isLoading ? "저장 중..." : "저장"}
        </button>
        ```
        
        다만 데이터의 일부만 다시 불러오는 중이라면 기존 화면 전체를 없애기보다 기존 데이터를 유지하면서 작은 로딩 표시를 보여 주는 것이 자연스럽다.
        
        ---
        
        ### 오류 상태
        
        “오류가 발생했습니다”만 보여 주기보다 어떤 작업이 실패했는지 알려 주는 것이 좋다.
        
        ```tsx
        function ErrorMessage({ onRetry }: { onRetry: () => void }) {
          return (
            <div>
              <p>도서 목록을 불러오지 못했습니다.</p>
              <button type="button" onClick={onRetry}>
                다시 시도
              </button>
            </div>
          );
        }
        ```
        
        오류 화면에는 다음 정보와 동작이 필요할 수 있다.
        
        - 실패한 작업
        - 사용자가 이해할 수 있는 오류 메시지
        - 다시 시도 버튼
        - 이전 화면으로 이동하는 버튼
        - 입력값을 수정할 방법
        
        서버의 내부 오류나 스택 트레이스를 사용자에게 그대로 보여 주면 안 된다.
        
        ```
        좋은 표현: 도서 목록을 불러오지 못했습니다. 다시 시도해 주세요.
        
        피해야 할 표현: NullPointerException at BookService.java:42
        ```
        
        ---
        
        ### 빈 결과 상태
        
        요청은 성공했지만 표시할 데이터가 없는 상태다. 단순히 빈 화면을 보여 주지 않고 데이터가 없다는 사실을 알려야 한다.
        
        ```tsx
        function EmptyResult() {
          return (
            <div>
              <p>조건에 맞는 도서가 없습니다.</p>
              <button type="button">검색 조건 초기화</button>
            </div>
          );
        }
        ```
        
        상황에 따라 안내 문구가 달라질 수 있다.
        
        ```
        전체 목록이 비어 있음
        → 아직 등록된 도서가 없습니다.
        
        검색 결과가 비어 있음
        → 검색 조건에 맞는 도서가 없습니다.
        
        북마크 목록이 비어 있음
        → 아직 북마크한 도서가 없습니다.
        ```
        
        사용자가 다음 행동을 할 수 있도록 등록, 검색 조건 초기화, 목록 이동 등의 버튼을 제공할 수 있다.
        
        ---
        
        ### 성공 상태
        
        성공 상태에서는 데이터만 보여 주는 것이 아니라 사용자가 현재 어떤 조건의 결과를 보고 있는지도 알 수 있게 한다.
        
        ```tsx
        <div>
          <p>총 {books.length}권</p>
          <BookList books={books} />
        </div>
        ```
        
        필요한 정보와 동작은 다음과 같다.
        
        - 조회된 데이터
        - 전체 결과 수
        - 적용된 검색어와 필터
        - 정렬 기준
        - 페이지 정보
        - 상세 화면 이동이나 수정 등의 동작
    - API 응답 타입과 화면에서 사용하는 타입을 분리하면 어떤 상황에서 도움이 될까요?
        
        API 응답 타입은 서버가 보내는 데이터 구조를 표현하고, 화면 타입은 UI가 실제로 사용하기 편한 데이터 구조를 표현한다.
        
        두 타입의 목적이 다르므로 항상 같은 구조일 필요는 없다.
        
        ### API 응답 타입
        
        ```tsx
        interface BookApiResponse {
          book_id: number;
          title: string;
          category_name: string;
          is_available: boolean;
          created_at: string;
        }
        ```
        
        서버가 보내는 JSON 구조를 그대로 표현한다.
        
        ### 화면 타입
        
        ```tsx
        interface BookViewModel {
          id: number;
          title: string;
          categoryName: string;
          availabilityText: string;
          createdDate: Date;
        }
        ```
        
        화면에서 사용하기 편한 이름과 값으로 구성한다.
        
        ### 변환 함수
        
        ```tsx
        function toBookViewModel(
          response: BookApiResponse,
        ): BookViewModel {
          return {
            id: response.book_id,
            title: response.title,
            categoryName: response.category_name,
            availabilityText: response.is_available
              ? "대여 가능"
              : "대여 중",
            createdDate: new Date(response.created_at),
          };
        }
        ```
        
        ```
        API 응답
        → 변환 함수
        → 화면에서 사용할 데이터
        ```
        
        ---
        
        ### 1. 서버와 프론트엔드의 이름 규칙이 다를 때
        
        서버는 `snake_case`, 프론트엔드는 `camelCase`를 사용할 수 있다.
        
        ```
        API: category_name
        화면: categoryName
        ```
        
        타입을 분리하면 변환 위치를 명확하게 관리할 수 있다.
        
        ---
        
        ### 2. 서버 값을 화면용 값으로 변환할 때
        
        서버의 boolean이나 enum 값을 그대로 보여 주는 대신 사용자에게 이해하기 쉬운 문구로 바꿀 수 있다.
        
        ```
        true  → 대여 가능
        false → 대여 중
        ```
        
        ```tsx
        availabilityText: response.is_available
          ? "대여 가능"
          : "대여 중";
        ```
        
        ---
        
        ### 3. 날짜 문자열을 날짜 객체나 표시 문자열로 바꿀 때
        
        API의 날짜는 보통 문자열로 전달된다.
        
        ```tsx
        {
          "created_at": "2026-10-26T10:00:00"
        }
        ```
        
        화면에서는 `Date` 객체나 형식이 적용된 문자열이 필요할 수 있다.
        
        ```tsx
        createdDate: new Date(response.created_at);
        ```
        
        ```
        2026-10-26T10:00:00
        → 2026년 10월 26일
        ```
        
        ---
        
        ### 4. 여러 API 값을 하나의 화면 값으로 합칠 때
        
        서버가 이름을 각각 전달하지만 화면에서는 하나의 문자열로 보여 줄 수 있다.
        
        ```tsx
        interface MemberApiResponse {
          firstName: string;
          lastName: string;
        }
        
        interface MemberViewModel {
          fullName: string;
        }
        ```
        
        ```tsx
        const memberViewModel = {
          fullName: `${response.lastName}${response.firstName}`,
        };
        ```
        
        ---
        
        ### 5. 화면에 필요 없는 값을 제외할 때
        
        API 응답에는 많은 정보가 포함될 수 있지만 화면에서는 일부만 필요할 수 있다.
        
        ```tsx
        interface BookApiResponse {
          bookId: number;
          title: string;
          description: string;
          createdAt: string;
          updatedAt: string;
          internalStatus: string;
        }
        ```
        
        ```tsx
        interface BookListItem {
          bookId: number;
          title: string;
        }
        ```
        
        목록 화면에는 필요한 필드만 전달하여 컴포넌트의 역할을 단순하게 만들 수 있다.
        
        ---
        
        ### 6. API 구조가 변경될 때
        
        API 구조와 화면 타입이 같으면 서버 응답의 변경이 여러 컴포넌트에 바로 영향을 준다.
        
        ```
        API 응답 변경
        → 여러 화면 컴포넌트 수정
        ```
        
        변환 계층을 두면 변환 함수만 수정하여 화면에 미치는 영향을 줄일 수 있다.
        
        ```
        API 응답 변경
        → 변환 함수 수정
        → 기존 화면 타입 유지
        ```
        
        | 구분 | API 응답 타입 | 화면 타입 |
        | --- | --- | --- |
        | 목적 | 서버 응답 구조 표현 | UI에서 사용할 구조 표현 |
        | 기준 | API Contract | 화면 요구사항 |
        | 예시 | 날짜 문자열, 상태 코드 | 날짜 객체, 사용자용 문구 |
        | 변경 원인 | 서버 API 변경 | 화면 설계 변경 |
        
        따라서 API 응답 타입과 화면 타입을 분리하면 **서버 데이터의 이름이나 형식을 화면에 맞게 변환할 수 있고, API 변경이 UI 전체로 퍼지는 것을 줄일 수 있다.** 다만 응답 구조가 단순하고 화면에서도 그대로 사용한다면 처음부터 불필요하게 타입을 나눌 필요는 없다.