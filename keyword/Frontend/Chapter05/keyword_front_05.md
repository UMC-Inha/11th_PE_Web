# 워크북 키워드 정리

## 목차

- [HTTP와 API](#http와-api)
  - API, endpoint, HTTP method와 status code는 요청과 응답에서 각각 어떤 역할을 할까요?
  - 브라우저와 API 서버의 origin이 다를 때 CORS는 어떤 역할을 할까요?
- [Promise와 비동기 처리](#promise와-비동기-처리)
  - Promise의 pending, fulfilled와 rejected 상태는 각각 무엇을 의미할까요?
  - `.then().catch()`와 `async/await`는 같은 비동기 흐름을 어떻게 다르게 표현하나요?
  - `await`를 사용해도 브라우저 전체가 멈추지 않는 이유는 무엇일까요?
- [fetch와 HTTP 요청 라이브러리](#fetch와-http-요청-라이브러리)
  - `fetch`에서 네트워크 오류와 HTTP 오류를 따로 처리해야 하는 이유는 무엇일까요?
  - 순수 `fetch`로 여러 API 함수를 작성하면 어떤 설정과 처리가 반복될까요?
  - ky와 Axios는 JSON 응답을 읽고 공통 요청 처리를 추가하는 방식이 어떻게 다를까요?
- [비동기 데이터의 UI 상태](#비동기-데이터의-ui-상태)
  - 서버 데이터를 보여 주는 화면에서 로딩, 오류, 빈 결과와 성공 상태를 구분해야 하는 이유는 무엇일까요?
  - 각 상태를 사용자가 이해할 수 있게 표현하려면 어떤 정보와 동작이 필요할까요?
  - API 응답 타입과 화면에서 사용하는 타입을 분리하면 어떤 상황에서 도움이 될까요?

---

## HTTP와 API

### Q. API, endpoint, HTTP method와 status code는 요청과 응답에서 각각 어떤 역할을 할까요?

#### 1. API (Application Programming Interface)

- 프로그램끼리 서로 기능이나 데이터를 주고받기 위해 정해둔 약속(규칙)
- 웹에서는 주로 클라이언트(프론트엔드)가 서버(백엔드)에 "이런 형식으로 요청하면, 이런 형식으로 응답할게"라고 정한 규칙을 말함
- 예) 식당 메뉴판 → 손님(클라이언트)은 메뉴판(API)에 있는 것만 주문할 수 있고, 주방(서버) 내부 구조는 몰라도 됨
- **역할**: 요청과 응답 전체의 형식(어떤 주소로, 어떤 방식으로, 어떤 데이터를 보내고 받는지)을 정의하는 틀

#### 2. Endpoint

- API가 제공하는 기능 하나하나에 접근하는 **구체적인 주소(URL)**
- 예: `https://api.example.com/users/1`
  - `/users` → 사용자 자원
  - `/users/1` → id가 1인 사용자
- **요청에서의 역할**: "어떤 자원(무엇)에 대해 요청하는지"를 나타냄
- REST 방식에서는 엔드포인트에 동사 대신 **명사(자원)** 를 쓰는 것이 관례
  - ❌ `/getUsers`, `/deleteUser/1`
  - ⭕ `/users`, `/users/1` + 동작은 HTTP Method로 표현

#### 3. HTTP Method

- 엔드포인트(자원)에 대해 **어떤 동작을 할지** 알려주는 것
- **요청에서의 역할**: "그 자원을 어떻게 할 건지(행위)"를 나타냄

| Method | 의미 | 예시 |
| --- | --- | --- |
| GET | 조회 | `GET /users` 사용자 목록 조회 |
| POST | 생성 | `POST /users` 새 사용자 생성 (body에 데이터) |
| PUT | 전체 수정 | `PUT /users/1` 1번 사용자 정보 전체 교체 |
| PATCH | 일부 수정 | `PATCH /users/1` 1번 사용자 일부 필드만 수정 |
| DELETE | 삭제 | `DELETE /users/1` 1번 사용자 삭제 |

- 같은 엔드포인트(`/users/1`)라도 메서드에 따라 조회/수정/삭제로 의미가 달라짐

#### 4. Status Code

- 서버가 요청을 어떻게 처리했는지 결과를 숫자로 알려주는 것
- **응답에서의 역할**: "요청이 성공했는지, 실패했다면 왜 실패했는지"를 나타냄
- 클라이언트는 이 코드를 보고 다음 행동(화면 표시, 에러 처리, 재로그인 등)을 결정함

| 범위 | 의미 | 대표 코드 |
| --- | --- | --- |
| 1xx | 정보 (처리 중) | 100 Continue |
| 2xx | 성공 | 200 OK, 201 Created, 204 No Content |
| 3xx | 리다이렉션 | 301 Moved Permanently, 304 Not Modified |
| 4xx | 클라이언트 오류 | 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found |
| 5xx | 서버 오류 | 500 Internal Server Error, 503 Service Unavailable |

- 401 vs 403: 401은 **인증 안 됨**(로그인 필요), 403은 **인증은 됐지만 권한 없음**

#### 📌 요청과 응답에서의 역할 한눈에 보기

| 구성 요소 | 위치 | 역할 |
| --- | --- | --- |
| API | 요청 + 응답 전체 | 주고받는 규칙(약속) 정의 |
| Endpoint | 요청 | **무엇에** 요청하는지 (자원의 주소) |
| HTTP Method | 요청 | **어떻게** 할 건지 (행위) |
| Status Code | 응답 | **결과가 어땠는지** (성공/실패 이유) |

#### 예시 흐름

```
[요청]
POST /users              ← Method + Endpoint
Content-Type: application/json

{ "name": "우즈", "email": "woods@example.com" }

[응답]
201 Created              ← Status Code
{ "id": 7, "name": "우즈", "email": "woods@example.com" }
```

→ "users 자원에(Endpoint) 새로 생성해줘(Method)" → "생성 성공했어(201)"

---

### Q. 브라우저와 API 서버의 origin이 다를 때 CORS는 어떤 역할을 할까요?

#### 1. Origin이란?

- **프로토콜(scheme) + 호스트(host) + 포트(port)** 세 가지를 합친 것
- 셋 중 하나라도 다르면 **다른 Origin(Cross-Origin)**

| 비교 대상 (기준: `http://localhost:5173`) | 같은 Origin? | 이유 |
| --- | --- | --- |
| `http://localhost:5173/users` | ⭕ | 경로(path)는 Origin에 포함 안 됨 |
| `http://localhost:8080` | ❌ | 포트가 다름 |
| `https://localhost:5173` | ❌ | 프로토콜이 다름 |
| `http://api.example.com` | ❌ | 호스트가 다름 |

- 예: 프론트(Vite) `http://localhost:5173` ↔ 백엔드 `http://localhost:3000` → 포트가 달라서 Cross-Origin

#### 2. 왜 막혀있을까? — SOP (Same-Origin Policy, 동일 출처 정책)

- 브라우저는 기본적으로 다른 Origin의 리소스를 JS로 읽는 것을 제한함
- 이유: 악성 사이트가 사용자의 로그인 쿠키를 이용해 다른 사이트(은행 등)의 데이터를 몰래 요청하고 읽어가는 것을 막기 위해
- 즉, SOP는 보안을 위한 기본 차단 정책

#### 3. CORS의 역할

- SOP 때문에 막히는 Cross-Origin 요청을 **서버가 허락한 경우에만 예외적으로 허용**하는 규칙
- 서버가 응답 헤더로 "이 Origin은 내 리소스를 읽어도 돼"라고 알려주면, 브라우저가 그걸 확인하고 응답을 JS에 넘겨줌
- **허용 여부는 서버가 정하고, 검사(차단)는 브라우저가 한다**

#### 4. 동작 방식

##### (1) 단순 요청 (Simple Request)

- GET, HEAD, POST 중 하나 + 기본적인 헤더/Content-Type만 사용하는 경우
- 바로 본 요청을 보내고, 응답 헤더를 브라우저가 검사

```
[요청]
GET /users
Origin: http://localhost:5173

[응답]
200 OK
Access-Control-Allow-Origin: http://localhost:5173   ← 일치하면 JS가 응답 읽기 가능
```

##### (2) 예비 요청 (Preflight Request)

- PUT, PATCH, DELETE 요청이나 `Content-Type: application/json`, `Authorization` 같은 헤더를 쓰는 경우
- 본 요청 전에 **OPTIONS 메서드로 "이 요청 보내도 돼?"라고 먼저 물어봄**

```
[예비 요청]
OPTIONS /users/1
Origin: http://localhost:5173
Access-Control-Request-Method: DELETE
Access-Control-Request-Headers: Authorization

[예비 응답]
204 No Content
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type

→ 허용되면 그때 실제 DELETE /users/1 요청 전송
```

##### (3) 인증 정보 포함 요청 (Credentialed Request)

- 쿠키 등을 같이 보내려면 양쪽 모두 설정 필요
  - 클라이언트: `fetch(url, { credentials: 'include' })` / axios `withCredentials: true`
  - 서버: `Access-Control-Allow-Credentials: true`
- 이때 `Access-Control-Allow-Origin: *` (와일드카드)는 **사용 불가**, 정확한 Origin을 지정해야 함

#### 5. 주요 CORS 응답 헤더

| 헤더 | 의미 |
| --- | --- |
| `Access-Control-Allow-Origin` | 허용할 Origin |
| `Access-Control-Allow-Methods` | 허용할 HTTP 메서드 |
| `Access-Control-Allow-Headers` | 허용할 요청 헤더 |
| `Access-Control-Allow-Credentials` | 쿠키 등 인증 정보 허용 여부 |
| `Access-Control-Max-Age` | 예비 요청 결과를 캐시할 시간(초) |

---

## Promise와 비동기 처리

### Q. Promise의 pending, fulfilled와 rejected 상태는 각각 무엇을 의미할까요?

#### 1. Promise란?

- 비동기 작업의 최종 결과(성공 또는 실패)를 나중에 받기로 약속하는 객체
- 예: API 요청을 보내면 응답이 바로 오지 않음 → "결과가 나오면 알려줄게"라는 약속(Promise)을 먼저 받아두는 것
- 콜백 지옥 없이 비동기 흐름을 `then`/`catch` 또는 `async`/`await`로 깔끔하게 다룰 수 있음

#### 2. 3가지 상태

| 상태 | 의미 | 언제? | 처리 방법 |
| --- | --- | --- | --- |
| **pending** (대기) | 아직 결과가 나오지 않은 상태 | Promise 생성 직후 ~ 작업 완료 전 | - |
| **fulfilled** (이행) | 작업이 성공적으로 끝난 상태 | `resolve(값)`이 호출됐을 때 | `.then()` / `await` |
| **rejected** (거부) | 작업이 실패한 상태 | `reject(에러)` 호출 또는 에러 발생 시 | `.catch()` / `try...catch` |

- fulfilled와 rejected를 합쳐 **settled(처리 완료)** 상태라고 부름
- `.finally()`는 settled 상태가 되면 성공·실패와 상관없이 실행됨

#### 3. 상태 변화 흐름

```
                ┌── resolve(value) ──▶ fulfilled (성공, 결과값 보유)
pending (대기) ─┤
                └── reject(error) ───▶ rejected  (실패, 에러 보유)
```

- 상태는 pending → fulfilled 또는 pending → rejected 로 **딱 한 번만** 바뀜
- 한 번 settled 되면 다시 바뀌지 않음 (resolve 후에 reject를 호출해도 무시됨)

#### 4. 코드로 보기

```js
const promise = new Promise((resolve, reject) => {
  // 이 시점: pending
  setTimeout(() => {
    const success = true;
    if (success) {
      resolve('데이터 도착!');           // → fulfilled
    } else {
      reject(new Error('요청 실패'));    // → rejected
    }
  }, 1000);
});

console.log(promise); // Promise {<pending>}

promise
  .then((data) => console.log(data))     // fulfilled일 때 실행
  .catch((err) => console.error(err))    // rejected일 때 실행
  .finally(() => console.log('끝'));     // 둘 중 어느 쪽이든 실행
```

##### async / await 버전

```js
async function getUser() {
  try {
    const res = await fetch('/users/1'); // pending 동안 여기서 기다림
    const user = await res.json();       // fulfilled → 값이 user에 담김
    console.log(user);
  } catch (err) {
    console.error(err);                  // rejected → catch로 이동
  } finally {
    console.log('로딩 끝');
  }
}
```

---

### Q. `.then().catch()`와 `async/await`는 같은 비동기 흐름을 어떻게 다르게 표현하나요?

#### 1. 공통점

- 둘 다 Promise를 다루는 문법이고, 내부 동작(비동기 흐름)은 같음
- async/await는 Promise를 대체하는 게 아니라, Promise를 더 읽기 쉽게 쓰는 문법(문법적 설탕, syntactic sugar)
- `async` 함수는 항상 Promise를 반환함

#### 2. 같은 흐름, 다른 표현

> 사용자 정보 조회 → 그 사용자의 게시글 조회 → 출력

##### .then().catch() — 체이닝 방식

```js
function loadPosts() {
  fetch('/users/1')
    .then((res) => res.json())
    .then((user) => fetch(`/posts?userId=${user.id}`))
    .then((res) => res.json())
    .then((posts) => console.log(posts))
    .catch((err) => console.error(err))
    .finally(() => console.log('로딩 끝'));
}
```

##### async/await — 동기 코드처럼 보이는 방식

```js
async function loadPosts() {
  try {
    const userRes = await fetch('/users/1');
    const user = await userRes.json();
    const postsRes = await fetch(`/posts?userId=${user.id}`);
    const posts = await postsRes.json();
    console.log(posts);
  } catch (err) {
    console.error(err);
  } finally {
    console.log('로딩 끝');
  }
}
```

#### 3. 차이점 비교

| 구분 | .then().catch() | async/await |
| --- | --- | --- |
| 표현 방식 | 콜백 함수를 **체인으로 연결** | 위에서 아래로 **동기 코드처럼** 작성 |
| 결과값 받기 | `.then((값) => ...)` 콜백의 매개변수 | `const 값 = await 프로미스` 변수에 바로 담음 |
| 에러 처리 | `.catch()` | `try...catch` |
| 마무리 처리 | `.finally()` | `finally` 블록 |
| 사용 위치 | 어디서나 | `await`는 **async 함수 안**에서만 (ES 모듈 최상위는 예외) |
| 중간 값 재사용 | 앞 단계 값을 뒤에서 쓰려면 중첩되거나 변수를 밖으로 빼야 함 | 변수에 담겨 있어서 아래 어디서든 바로 사용 |
| 가독성 | 짧은 흐름엔 간결, 길어지면 읽기 어려움 | 단계가 많아도 순서대로 읽힘 |

---

### Q. `await`를 사용해도 브라우저 전체가 멈추지 않는 이유는 무엇일까요?

#### 이유 1. await는 "함수 하나"만 멈추고 제어권을 돌려준다

- `await`를 만나면 **그 async 함수의 실행만 일시 중단**되고, 함수는 콜 스택(Call Stack)에서 빠져나감
- 즉, 메인 스레드를 붙잡고 기다리는 게 아니라 "결과 나오면 여기서부터 이어서 할게" 하고 자리를 비켜주는 것
- 콜 스택이 비었으니 메인 스레드는 그동안 다른 JS 코드 실행, 화면 렌더링, 클릭·입력 처리를 계속할 수 있음

```js
async function loadUser() {
  console.log(1);
  await fetch('/users/1'); // loadUser만 멈춤
  console.log(3);
}
loadUser();
console.log(2); // 기다리지 않고 바로 실행됨

// 출력: 1 → 2 → 3
```

#### 이유 2. 실제로 "기다리는 일"은 자바스크립트가 아니라 브라우저가 한다

- 자바스크립트는 **싱글 스레드**라서, 만약 JS가 직접 응답을 기다린다면 그동안 아무것도 못 함
- 하지만 fetch(네트워크 요청), setTimeout(타이머) 같은 작업은 브라우저의 **Web APIs가 JS 스레드 밖에서 대신 처리**함
- 그래서 JS 메인 스레드는 기다리는 동안 놀지 않고 다른 일을 할 수 있음

#### 이유 3. 결과가 나오면 이벤트 루프가 "비어 있을 때" 이어서 실행해준다

- Promise가 처리(settled)되면 → await 다음 코드가 **Microtask Queue**에 등록됨
- **이벤트 루프(Event Loop)** 는 콜 스택이 비는 순간을 기다렸다가, 큐에 있는 작업을 꺼내 콜 스택에 올려줌
- 그래서 중단됐던 함수가 다른 작업을 방해하지 않는 타이밍에 이어서 실행됨

#### 전체 흐름

```
① async 함수 실행 → await 만남
② 기다리는 작업(fetch 등)은 브라우저(Web API)에 맡김          ← 이유 2
③ async 함수는 중단되고 콜 스택에서 빠짐 (제어권 반환)          ← 이유 1
④ 메인 스레드는 다른 코드·렌더링·사용자 이벤트를 계속 처리
⑤ 응답 도착 → 나머지 코드가 Microtask Queue에 대기
⑥ 콜 스택이 비면 이벤트 루프가 꺼내서 함수 실행을 이어감       ← 이유 3
```

---

## fetch와 HTTP 요청 라이브러리

### Q. `fetch`에서 네트워크 오류와 HTTP 오류를 따로 처리해야 하는 이유는 무엇일까요?

#### 두 오류의 차이

| 구분 | 네트워크 오류 | HTTP 오류 |
| --- | --- | --- |
| 의미 | 서버에 **도달하지 못했거나 응답을 못 받음** | 서버에 도달해서 **응답은 받았지만, 실패 응답**임 |
| 예시 | 인터넷 끊김, 서버 다운, 잘못된 도메인, CORS 차단, 요청 취소(abort) | 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error |
| fetch Promise 상태 | **rejected** | **fulfilled** |
| 잡히는 곳 | `.catch()` / `catch` 블록 | `.then()` / `await` 다음 코드 (`res.ok === false`) |

#### 이유 1. fetch는 HTTP 오류를 "실패"로 보지 않는다

- fetch의 Promise는 **응답을 받기만 하면 fulfilled** 됨 → 상태 코드가 404든 500이든 상관없음
- rejected가 되는 건 **응답 자체를 받지 못한 경우(네트워크 오류)** 뿐
- 그래서 `catch`만 써두면 **HTTP 오류는 그냥 통과해서 성공처럼 처리**되어 버림

```js
// ❌ 404여도 catch로 안 감 → 에러 데이터를 정상 데이터처럼 사용하게 됨
try {
  const res = await fetch('/users/999'); // 404 응답 → fulfilled
  const user = await res.json();         // { message: 'Not Found' } 같은 에러 내용
  console.log(user.name);                // undefined
} catch (err) {
  console.error(err); // 실행 안 됨
}
```

#### 이유 2. 두 오류는 도착하는 경로가 달라서, 각각 확인해야 다 잡힌다

- 네트워크 오류 → Promise가 rejected → **catch에서 처리**
- HTTP 오류 → Promise는 fulfilled → **`res.ok`(200~299이면 true)나 `res.status`를 직접 확인**해서 처리
- 둘 중 하나만 처리하면 나머지 하나는 놓치게 됨

#### 이유 3. 원인이 달라서 사용자에게 보여줄 대응도 다르다

| 상황 | 원인 | 적절한 대응 |
| --- | --- | --- |
| 네트워크 오류 | 사용자의 연결 상태, 서버 접속 불가 | "인터넷 연결을 확인해주세요", 재시도 버튼 |
| 400 | 요청 내용이 잘못됨 | 입력값 검증 메시지 표시 |
| 401 | 로그인 필요 / 토큰 만료 | 로그인 페이지로 이동, 토큰 재발급 |
| 403 | 권한 없음 | "접근 권한이 없습니다" |
| 404 | 리소스 없음 | "존재하지 않는 페이지입니다" |
| 500 | 서버 내부 문제 | "잠시 후 다시 시도해주세요" |

- 모두 "오류가 발생했습니다" 하나로 처리하면 사용자는 **무엇을 해야 할지 알 수 없음**
- 또한 HTTP 오류는 서버가 응답 body에 **에러 메시지를 담아 보내는 경우가 많아서**, 그 내용을 꺼내 쓸 수 있음 (네트워크 오류는 응답 자체가 없음)

#### 처리 예시

```js
async function getUser(id) {
  let res;

  // 1) 네트워크 오류 처리
  try {
    res = await fetch(`/users/${id}`);
  } catch (err) {
    throw new Error('네트워크 연결을 확인해주세요.');
  }

  // 2) HTTP 오류 처리
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('로그인이 필요합니다.');
    }
    if (res.status === 404) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }
    const errorBody = await res.json().catch(() => null); // 서버가 보낸 에러 메시지
    throw new Error(errorBody?.message ?? `서버 오류 (${res.status})`);
  }

  // 3) 성공
  return res.json();
}
```

#### 참고: axios와 비교

| 구분 | fetch | axios |
| --- | --- | --- |
| HTTP 오류(4xx, 5xx) | fulfilled → 직접 `res.ok` 확인 필요 | **자동으로 rejected** 처리 |
| 오류 구분 방법 | catch(네트워크) / `res.ok`(HTTP) | `err.response`가 있으면 HTTP 오류, 없으면 네트워크 오류 |

---

### Q. 순수 `fetch`로 여러 API 함수를 작성하면 어떤 설정과 처리가 반복될까요?

#### 1. 반복이 생기는 모습

```js
const BASE_URL = 'http://localhost:3000';

export async function getUser(id) {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export async function createPost(post) {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`${BASE_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify(post),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export async function deletePost(id) {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`${BASE_URL}/posts/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message ?? `HTTP ${res.status}`);
  }
}
```

→ 실제로 다른 부분은 **경로, 메서드, body** 정도뿐이고 나머지는 전부 같은 코드

#### 2. 반복되는 항목

##### 요청 설정

| 반복 항목 | 내용 |
| --- | --- |
| **Base URL** | 모든 요청 앞에 서버 주소(`BASE_URL`)를 붙임 |
| **Content-Type 헤더** | JSON을 보낼 때마다 `'Content-Type': 'application/json'` 지정 |
| **인증 헤더** | 매번 토큰을 꺼내서 `Authorization: Bearer 토큰` 추가 |
| **body 직렬화** | 객체를 매번 `JSON.stringify()`로 변환 |
| **credentials** | 쿠키를 보내야 하면 매번 `credentials: 'include'` 지정 |
| **쿼리 스트링 생성** | `?page=1&size=10` 같은 파라미터를 `URLSearchParams` 등으로 직접 만들어 붙임 |
| **타임아웃** | fetch에는 타임아웃 옵션이 없어서 필요하면 매번 `AbortController` + `setTimeout` 구성 |

##### 응답 처리

| 반복 항목 | 내용 |
| --- | --- |
| **HTTP 오류 확인** | fetch는 4xx·5xx도 fulfilled라서 매번 `if (!res.ok)` 확인 |
| **에러 메시지 추출** | 서버가 보낸 에러 body를 꺼내서 Error로 변환 |
| **응답 파싱** | 매번 `await res.json()` 호출 (204처럼 body가 없는 응답은 따로 처리) |
| **네트워크 오류 처리** | try...catch로 연결 실패 처리 |
| **공통 상태 코드 처리** | 401이면 토큰 재발급 후 재요청 또는 로그인 페이지 이동 등을 함수마다 처리 |

#### 3. 반복이 문제가 되는 이유

- **코드 중복**: API 함수가 늘어날수록 같은 코드가 계속 복사됨
- **수정이 어려움**: 서버 주소, 토큰 저장 방식, 에러 형식이 바뀌면 **모든 함수를 하나하나 고쳐야 함**
- **실수 가능성**: 어떤 함수는 `res.ok` 확인을 빼먹거나 헤더를 빠뜨리는 등 처리가 제각각이 됨

#### 4. 해결 방법: 공통 처리를 한 곳으로 모으기

##### (1) fetch 래퍼 함수 만들기

```js
const BASE_URL = 'http://localhost:3000';

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const token = localStorage.getItem('accessToken');

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(body && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message ?? `HTTP ${res.status}`);
  }

  return res.status === 204 ? null : res.json();
}

// 개별 API 함수는 달라지는 부분만 작성
export const getUser = (id) => request(`/users/${id}`);
export const createPost = (post) => request('/posts', { method: 'POST', body: post });
export const deletePost = (id) => request(`/posts/${id}`, { method: 'DELETE' });
```

##### (2) axios 인스턴스 + 인터셉터 사용

```js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // Base URL
  withCredentials: true,            // credentials
  timeout: 5000,                    // 타임아웃
});

// 요청 인터셉터: 모든 요청에 토큰 자동 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 응답 인터셉터: 공통 에러 처리 (예: 401)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // 토큰 재발급 또는 로그인 페이지 이동
    }
    return Promise.reject(err);
  }
);

export const getUser = (id) => api.get(`/users/${id}`).then((res) => res.data);
export const createPost = (post) => api.post('/posts', post).then((res) => res.data);
```

- axios는 JSON 직렬화·파싱, 4xx·5xx 자동 reject, 타임아웃을 기본으로 제공해서 반복 코드가 더 줄어듦

---

### Q. ky와 Axios는 JSON 응답을 읽고 공통 요청 처리를 추가하는 방식이 어떻게 다를까요?

> ky v1 기준

#### 1. 기본 성격

| 구분 | ky | Axios |
| --- | --- | --- |
| 기반 | **fetch API를 감싼** 라이브러리 | 브라우저에서는 기본적으로 **XMLHttpRequest** 기반 (fetch 어댑터도 선택 가능) |
| 반환값 | fetch의 **Response를 확장한 객체** (Promise) | Axios가 만든 **response 객체** `{ data, status, headers, ... }` |
| 크기 | 작고 가벼움 | 상대적으로 큼, 기능이 많음 |
| HTTP 오류(4xx, 5xx) | 자동으로 `HTTPError` throw | 자동으로 `AxiosError` reject |

#### 2. JSON 응답을 읽는 방식

##### ky — 응답 body를 메서드로 직접 꺼냄

```js
import ky from 'ky';

const user = await ky.get('http://localhost:3000/users/1').json();
```

- fetch처럼 응답 body를 어떤 형식으로 읽을지 **직접 고름** → `.json()`, `.text()`, `.blob()`
- 다만 fetch와 달리 `await res.json()`을 따로 쓰지 않고, **요청에 바로 `.json()`을 이어 붙일 수 있음**
- 요청 body를 JSON으로 보낼 때는 `json` 옵션 사용 → `JSON.stringify`, `Content-Type` 자동 처리

```js
const post = await ky.post('http://localhost:3000/posts', { json: { title: '안녕' } }).json();
```

##### Axios — 응답이 이미 파싱되어 `data`에 담겨 옴

```js
import axios from 'axios';

const res = await axios.get('http://localhost:3000/users/1');
const user = res.data;
```

- JSON 응답을 **자동으로 파싱**해서 `res.data`에 넣어줌 → 꺼내는 메서드를 호출할 필요 없음
- 대신 실제 데이터를 쓰려면 매번 `.data`로 한 단계 들어가야 함
- 요청 body는 객체를 그대로 넘기면 자동으로 JSON 변환

```js
const res = await axios.post('http://localhost:3000/posts', { title: '안녕' });
```

| 구분 | ky | Axios |
| --- | --- | --- |
| 응답 JSON 읽기 | `.json()` 호출 | 자동 파싱 → `res.data` |
| 요청 JSON 보내기 | `{ json: 객체 }` 옵션 | 두 번째 인자로 객체 전달 |
| 상태 코드 확인 | `response.status` | `res.status` |

#### 3. 공통 요청 처리를 추가하는 방식

##### ky — 인스턴스 + hooks(훅)

- `ky.create()` 또는 `ky.extend()`로 공통 설정을 가진 인스턴스를 만듦
- 요청 생명주기의 특정 시점에 실행할 함수를 **hooks 배열**에 등록
  - `beforeRequest`: 요청 보내기 직전 (토큰 추가 등)
  - `afterResponse`: 응답 받은 직후 (401 처리, 재요청 등)
  - `beforeError`: HTTPError가 throw되기 직전 (에러 메시지 가공)
  - `beforeRetry`: 재시도 직전
- 훅이 받는 값은 fetch 표준 객체인 **Request, Response** → 헤더도 `request.headers.set()`처럼 표준 방식으로 다룸

```js
import ky from 'ky';

export const api = ky.create({
  prefixUrl: 'http://localhost:3000', // Base URL
  credentials: 'include',
  timeout: 5000,                      // 기본 10초
  retry: 1,                           // 재시도 기능 내장
  hooks: {
    beforeRequest: [
      (request) => {
        const token = localStorage.getItem('accessToken');
        if (token) request.headers.set('Authorization', `Bearer ${token}`);
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        if (response.status === 401) {
          // 토큰 재발급 후 재요청 또는 로그인 페이지 이동
        }
      },
    ],
    beforeError: [
      async (error) => {
        const body = await error.response.json().catch(() => null);
        if (body?.message) error.message = body.message;
        return error;
      },
    ],
  },
});

// prefixUrl을 쓰면 경로 앞에 '/'를 붙이지 않음
export const getUser = (id) => api.get(`users/${id}`).json();
export const createPost = (post) => api.post('posts', { json: post }).json();
```

##### Axios — 인스턴스 + interceptors(인터셉터)

- `axios.create()`로 공통 설정을 가진 인스턴스를 만듦
- 요청/응답을 가로채는 **인터셉터를 `.use()`로 등록**
  - 요청 인터셉터: `(config) => config` → Axios의 **config 객체**를 수정해서 반환
  - 응답 인터셉터: 성공 콜백과 실패 콜백을 **두 개로 나눠** 등록 → 에러는 실패 콜백에서 처리

```js
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
  timeout: 5000, // 기본값은 0 (타임아웃 없음)
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config; // 반드시 config 반환
});

api.interceptors.response.use(
  (res) => res, // 성공(2xx)
  (error) => {  // 실패(4xx, 5xx, 네트워크 오류)
    if (error.response?.status === 401) {
      // 토큰 재발급 후 재요청 또는 로그인 페이지 이동
    }
    return Promise.reject(error);
  }
);

export const getUser = (id) => api.get(`/users/${id}`).then((res) => res.data);
export const createPost = (post) => api.post('/posts', post).then((res) => res.data);
```

#### 4. 공통 처리 방식 비교

| 구분 | ky | Axios |
| --- | --- | --- |
| 인스턴스 생성 | `ky.create()` / `ky.extend()` | `axios.create()` |
| 공통 처리 등록 | 옵션 안의 `hooks` 배열 | `interceptors.request/response.use()` |
| 요청 가공 대상 | fetch 표준 **Request** 객체 | Axios **config** 객체 |
| 응답 가공 대상 | fetch 표준 **Response** 객체 | Axios **response** 객체 |
| 에러 처리 위치 | `beforeError` 훅 / `afterResponse`에서 상태 확인 | 응답 인터셉터의 **두 번째(실패) 콜백** |
| Base URL | `prefixUrl` (경로 앞 `/` 없이 작성) | `baseURL` |
| 재시도 | `retry` 옵션 **내장** | 기본 미제공 (직접 구현 또는 axios-retry 등) |
| 타임아웃 기본값 | 10초 | 없음(0) |

---

## 비동기 데이터의 UI 상태

### Q. 서버 데이터를 보여 주는 화면에서 로딩, 오류, 빈 결과와 성공 상태를 구분해야 하는 이유는 무엇일까요?

#### 4가지 상태

| 상태 | 의미 | 보여줄 화면 |
| --- | --- | --- |
| **로딩 (loading)** | 요청을 보내고 응답을 기다리는 중 | 스피너, 스켈레톤 UI |
| **오류 (error)** | 요청이 실패함 (네트워크 오류, 4xx, 5xx) | 에러 메시지 + 재시도 버튼 |
| **빈 결과 (empty)** | 요청은 성공했지만 데이터가 0개 | "아직 게시글이 없어요" + 작성하기 버튼 |
| **성공 (success)** | 요청이 성공했고 보여줄 데이터가 있음 | 실제 데이터 목록 |

#### 이유 1. 상태를 구분하지 않으면 사용자가 상황을 잘못 이해한다

- 네 상태 모두 "화면에 데이터가 없다"는 겉모습은 비슷하지만, **의미는 완전히 다름**
  - 로딩 중인데 빈 목록을 보여주면 → "데이터가 없네?"로 오해 (잠깐 "게시글이 없습니다"가 깜빡였다가 목록이 뜨는 현상)
  - 오류인데 빈 목록을 보여주면 → 실제로는 데이터가 있는데 **"없다"고 거짓 정보를 주는 것**
  - 빈 결과인데 아무것도 안 보여주면 → 고장 난 건지, 아직 로딩 중인지 알 수 없음
- 상태를 나눠야 **화면이 실제 상황을 정확하게 전달**함

#### 이유 2. 상태마다 사용자가 해야 할 행동이 다르다

| 상태 | 사용자에게 필요한 행동 |
| --- | --- |
| 로딩 | 기다리기 (기다리면 된다는 걸 알려줘야 함) |
| 오류 | 다시 시도하기, 연결 확인하기, 로그인하기 |
| 빈 결과 | 새 데이터 만들기, 검색 조건 바꾸기 |
| 성공 | 데이터 보기, 상호작용하기 |

- 구분하지 않으면 재시도 버튼이나 작성하기 버튼처럼 **다음 행동을 안내할 수 없음**

#### 이유 3. 데이터가 없는 상태에서 렌더링하면 화면이 깨질 수 있다

- 로딩 중이나 오류 상태에서는 데이터가 아직 `undefined`나 `null`
- 이때 성공 화면을 그대로 렌더링하면 `posts.map is not a function`, `Cannot read properties of undefined` 같은 **런타임 에러로 화면 전체가 깨짐**
- 상태를 먼저 확인하고, **데이터가 확실히 있을 때만 성공 화면을 렌더링**해야 안전함

#### 이유 4. 오류와 빈 결과는 원인 자체가 다르다

- **빈 결과는 정상적인 응답** → 요청은 성공했고, 서버가 "0개"라고 알려준 것 (`200 OK` + `[]`)
- **오류는 비정상 상황** → 요청이나 서버에 문제가 있는 것
- 둘을 섞으면 개발자 입장에서도 **문제가 생겼는데 "데이터 없음"으로 가려져서 버그를 발견하기 어려움**

#### 상태별 렌더링 예시 (React)

```jsx
import { useEffect, useState } from 'react';

function PostList() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/posts');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setPosts(await res.json());
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 1) 로딩
  if (isLoading) return <p>불러오는 중...</p>;

  // 2) 오류
  if (error) {
    return (
      <div>
        <p>게시글을 불러오지 못했어요.</p>
        <button onClick={fetchPosts}>다시 시도</button>
      </div>
    );
  }

  // 3) 빈 결과
  if (posts.length === 0) {
    return (
      <div>
        <p>아직 게시글이 없어요.</p>
        <button>첫 글 작성하기</button>
      </div>
    );
  }

  // 4) 성공
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

- **로딩 → 오류 → 빈 결과 → 성공** 순서로 확인하면, 마지막 성공 화면에서는 데이터가 반드시 있다는 게 보장됨
- 참고: TanStack Query 같은 라이브러리는 `isPending`, `isError`, `data` 등을 제공해서 이 상태 관리를 직접 하지 않아도 됨

---

### Q. 각 상태를 사용자가 이해할 수 있게 표현하려면 어떤 정보와 동작이 필요할까요?

> 각 상태마다 **"지금 무슨 상황인지(정보)"** 와 **"그래서 내가 뭘 할 수 있는지(동작)"** 를 함께 보여줘야 함

#### 1. 로딩 상태

##### 필요한 정보

| 정보 | 예시 |
| --- | --- |
| **무엇을** 불러오는 중인지 | "게시글을 불러오는 중..." (그냥 "로딩 중"보다 구체적으로) |
| 화면이 **어떤 모양이 될지** | 실제 레이아웃과 비슷한 **스켈레톤 UI** → 레이아웃이 갑자기 튀는 현상 방지 |
| 오래 걸릴 때 **진행 정도** | 파일 업로드 진행률 "60%", "조금만 더 기다려주세요" |

##### 필요한 동작

- **중복 요청 막기**: 제출 버튼 비활성화(`disabled`) + 버튼 안에 "저장 중..." 표시
- **취소하기**: 오래 걸리는 작업은 취소 버튼 제공 (`AbortController`)
- **이전 데이터 유지**: 새로고침·페이지 이동 시 기존 목록을 그대로 두고 작은 로딩 표시만 추가 → 화면 깜빡임 방지
- 아주 빠른 응답(수백 ms 이하)에는 스피너를 바로 띄우지 않고 약간 지연시켜 깜빡임 방지

#### 2. 오류 상태

##### 필요한 정보

| 정보 | 예시 |
| --- | --- |
| **무엇이** 실패했는지 | "게시글 목록을 불러오지 못했어요" |
| **왜** 실패했는지 (사용자 언어로) | 원인별로 다르게 안내 (아래 표) |
| **어떻게** 하면 되는지 | "인터넷 연결을 확인한 뒤 다시 시도해주세요" |

| 원인 | 사용자에게 보여줄 문구 예시 |
| --- | --- |
| 네트워크 오류 | "인터넷 연결을 확인해주세요" |
| 400 | "입력한 내용을 다시 확인해주세요" + 어떤 필드가 잘못됐는지 |
| 401 | "로그인이 필요해요" |
| 403 | "이 페이지에 접근할 권한이 없어요" |
| 404 | "존재하지 않거나 삭제된 게시글이에요" |
| 500 | "일시적인 문제가 발생했어요. 잠시 후 다시 시도해주세요" |

- `TypeError: Failed to fetch`, `HTTP 500` 같은 개발자용 메시지나 에러 스택은 그대로 노출하지 않기 (콘솔·로그로 따로 기록)

##### 필요한 동작

- **다시 시도 버튼**: 일시적인 오류(네트워크, 500)에 가장 기본적인 동작
- **다른 경로 안내**: 401 → 로그인 버튼, 404 → 목록으로 돌아가기 / 홈으로
- **입력값 유지**: 폼 제출이 실패해도 사용자가 작성한 내용은 지우지 않기
- **부분 오류는 부분만 표시**: 사이드 위젯 하나가 실패했다고 페이지 전체를 에러 화면으로 바꾸지 않기
- 폼 오류는 페이지 상단 알림보다 **해당 입력 필드 바로 아래**에 표시

#### 3. 빈 결과 상태

##### 필요한 정보

| 정보 | 예시 |
| --- | --- |
| 데이터가 **없다는 사실** | 오류가 아니라 정상이라는 걸 알 수 있게 |
| **왜** 비어 있는지 | 상황에 따라 다르게 구분 (아래 표) |

| 상황 | 문구 예시 | 동작 |
| --- | --- | --- |
| 아직 아무것도 만들지 않음 | "아직 작성한 게시글이 없어요" | **첫 글 작성하기** 버튼 |
| 검색 결과 없음 | "'리액트'에 대한 검색 결과가 없어요" | 검색어 바꾸기 제안, 검색어 지우기 |
| 필터 결과 없음 | "조건에 맞는 게시글이 없어요" | **필터 초기화** 버튼 |
| 모두 처리함 | "새 알림을 모두 확인했어요" | (완료 메시지, 별도 동작 없어도 됨) |

##### 필요한 동작

- 빈 화면에서 다음에 할 수 있는 행동(**CTA, Call To Action**)을 바로 제공
- 사용자가 입력한 검색어·필터 조건을 화면에 다시 보여줘서 왜 결과가 없는지 이해할 수 있게 함

#### 4. 성공 상태

##### 필요한 정보

| 정보 | 예시 |
| --- | --- |
| 실제 데이터 | 게시글 목록, 상세 내용 |
| 데이터의 **범위·개수** | "총 24개", "1 / 3 페이지" |
| 데이터의 **최신 여부** | "방금 전 업데이트됨" (실시간성이 중요한 화면) |

##### 필요한 동작

- **새로고침**: 최신 데이터 다시 불러오기
- **더 보기 / 페이지네이션 / 무한 스크롤**: 데이터가 많을 때
- **작업 결과 피드백**: 생성·수정·삭제 후 "게시글이 등록됐어요" 같은 토스트 메시지, 삭제는 실행 취소(Undo) 제공
- 작업 성공 후 목록에 바로 반영되게 데이터 갱신

#### 5. 모든 상태에 공통으로 필요한 것: 접근성

- 스크린 리더 사용자도 상태 변화를 알 수 있게 처리
  - 로딩 영역: `aria-busy="true"`
  - 상태 메시지: `role="status"` 또는 `aria-live="polite"` (오류는 `role="alert"`)
- 색상만으로 상태를 구분하지 않고 문구·아이콘을 함께 사용 (빨간색만으로 오류 표시 X)

#### 예시 (React)

```jsx
function PostList({ posts, isLoading, error, keyword, onRetry, onResetSearch }) {
  if (isLoading) {
    return (
      <div aria-busy="true" role="status">
        <PostSkeleton count={5} />
        <span className="sr-only">게시글을 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert">
        <p>게시글 목록을 불러오지 못했어요.</p>
        <p>{getErrorMessage(error)}</p> {/* 원인별 사용자용 문구 */}
        {error.status === 401 ? (
          <a href="/login">로그인하기</a>
        ) : (
          <button onClick={onRetry}>다시 시도</button>
        )}
      </div>
    );
  }

  if (posts.length === 0) {
    return keyword ? (
      <div role="status">
        <p>'{keyword}'에 대한 검색 결과가 없어요.</p>
        <button onClick={onResetSearch}>검색어 지우기</button>
      </div>
    ) : (
      <div role="status">
        <p>아직 작성한 게시글이 없어요.</p>
        <a href="/posts/new">첫 글 작성하기</a>
      </div>
    );
  }

  return (
    <section>
      <p>총 {posts.length}개</p>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </section>
  );
}
```

---

### Q. API 응답 타입과 화면에서 사용하는 타입을 분리하면 어떤 상황에서 도움이 될까요?

#### 1. 두 타입의 의미

| 구분 | API 응답 타입 (DTO) | 화면용 타입 (View Model / 도메인 타입) |
| --- | --- | --- |
| 기준 | **서버가 보내주는 모양** 그대로 | **화면이 쓰기 편한 모양** |
| 정하는 쪽 | 백엔드 | 프론트엔드 |
| 예시 이름 | `PostResponse`, `PostDto` | `Post`, `PostItem` |

- 응답을 받자마자 **변환 함수(mapper)** 로 화면용 타입으로 바꾸고, 컴포넌트는 화면용 타입만 사용

```ts
// API 응답 타입: 서버 응답 그대로
interface PostResponse {
  post_id: number;
  title: string;
  content: string | null;
  created_at: string;          // "2026-10-28T02:28:00Z"
  status: 'D' | 'P';           // D: 임시저장, P: 발행
  writer: { user_id: number; nick_name: string; password_hash: string };
}

// 화면용 타입: 화면에서 쓰기 편한 모양
interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  isPublished: boolean;
  authorName: string;
}

// 변환 함수
function toPost(res: PostResponse): Post {
  return {
    id: res.post_id,
    title: res.title,
    content: res.content ?? '',
    createdAt: new Date(res.created_at),
    isPublished: res.status === 'P',
    authorName: res.writer.nick_name,
  };
}

// API 함수에서 변환까지 끝내고 반환
export async function getPost(id: number): Promise<Post> {
  const res = await api.get(`posts/${id}`).json<PostResponse>();
  return toPost(res);
}
```

#### 2. 도움이 되는 상황

##### 상황 1. 서버 API가 변경될 때

- 백엔드에서 필드 이름이 `nick_name` → `nickname`으로 바뀌거나 구조가 바뀌어도
- **변환 함수 한 곳만 수정**하면 됨 → 이 데이터를 쓰는 수십 개의 컴포넌트는 그대로
- 분리하지 않으면 `post.writer.nick_name`을 쓰는 **모든 컴포넌트를 찾아서 고쳐야 함**

##### 상황 2. 서버의 네이밍·형식이 프론트 관례와 다를 때

- 서버는 `snake_case`, 프론트는 `camelCase`를 쓰는 경우
- 날짜가 문자열(`"2026-10-28T02:28:00Z"`)로 오는데 화면에서는 `Date`나 "3분 전" 같은 형식이 필요한 경우
- 상태가 `'D'`, `'P'` 같은 코드값으로 오는데 화면에서는 `isPublished`나 "발행됨" 라벨이 필요한 경우
- → 변환을 한 번 해두면 컴포넌트마다 반복해서 변환할 필요가 없음

##### 상황 3. null / 누락 가능한 값을 처리해야 할 때

- 서버 응답에 `content: null`, 선택적 필드가 섞여 있으면 컴포넌트마다 `?.`, `??` 처리가 반복됨
- 변환 시점에 기본값을 채워두면 화면용 타입에서는 항상 값이 있다고 믿고 쓸 수 있음

##### 상황 4. 화면에 필요 없는 데이터나 민감한 데이터가 섞여 올 때

- 응답에 화면에서 안 쓰는 필드, 내부용 필드가 포함된 경우
- 화면용 타입에 필요한 필드만 남기면 컴포넌트가 무엇을 쓰는지 명확해지고, 실수로 노출할 위험도 줄어듦

##### 상황 5. 여러 API 응답을 합쳐서 한 화면을 만들 때

- 게시글 API + 작성자 API + 좋아요 API를 합쳐 하나의 카드를 보여주는 경우
- 화면용 타입을 화면 기준으로 하나로 정의하고, 여러 응답을 조합해서 만들 수 있음

```ts
interface PostCard {
  id: number;
  title: string;
  authorName: string;
  likeCount: number;
  isLikedByMe: boolean;
}
```

##### 상황 6. 같은 데이터를 화면마다 다르게 쓸 때

- 목록에서는 제목·작성자·날짜만, 상세에서는 본문·댓글까지 필요한 경우
- `PostListItem`, `PostDetail`처럼 화면 목적에 맞는 타입을 따로 만들 수 있음

##### 상황 7. 백엔드 API가 아직 완성되지 않았을 때

- 화면용 타입을 기준으로 목(mock) 데이터를 만들어 화면 먼저 개발 가능
- 나중에 실제 API가 나오면 응답 타입과 변환 함수만 추가하면 됨
- 테스트 코드도 화면용 타입으로 작성할 수 있어서 서버 응답 형식에 덜 의존함

#### 3. 분리 구조 정리

```
서버 응답 (PostResponse)
      │
      ▼  API 계층에서 변환 (toPost)
      │
화면용 타입 (Post)
      │
      ▼
컴포넌트 / 훅에서 사용
```

| 위치 | 하는 일 | 사용하는 타입 |
| --- | --- | --- |
| API 함수 (`api/post.ts`) | 요청 보내기 + 응답 변환 | `PostResponse` → `Post` |
| 커스텀 훅 / 상태 관리 | 데이터 보관, 로딩·오류 관리 | `Post` |
| 컴포넌트 | 화면 렌더링 | `Post` |

- 응답 타입은 **API 계층 밖으로 나가지 않게** 하는 것이 핵심
- 단, 서버 응답과 화면 모양이 거의 같은 단순한 경우에는 굳이 분리하지 않고 응답 타입을 그대로 써도 됨 (분리할수록 변환 코드가 늘어나기 때문)