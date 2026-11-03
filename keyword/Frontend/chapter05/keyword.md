- HTTP와 API
    - API, endpoint, HTTP method와 status code는 요청과 응답에서 각각 어떤 역할을 할까요?
        - **API**
            - 클라이언트와 서버가 데이터를 주고 받기 위해 정한 통신 규칙
        - **endpoint**
            - 클라이언트가 서버의 특정 리소스나 기능에 접근하기 위해 요청하는 URL 또는 경로
        - api 요청 예시

            ```java
            GET /movies/123 HTTP/1.1
            Host: api.example.com
            ```

            - GET: 영화 정보를 조회하겠다는 **HTTP Method**
                - HTTP Method는 POST, DELETE 등 다양한 종류가 있음
            - /movies/123: 요청 대상 리소스의 경로
            - https://api.example.com/movies/123: HTTPS를 사용한다고 가정했을 때의 전체 URL
        - api 응답 예시

            ```java
            HTTP/1.1 200 OK
            Content-Type: application/json
            
            {
              "id": 123,
              "title": "인터스텔라"
            }
            ```

            - 200 OK: 요청이 성공적으로 처리되었다는 **Status Code**
                - 201, 400, 404 등 다양한 종류가 있음
            - Content-Type: 응답 데이터가 JSON 형식임을 나타내는 헤더
            - Body: 서버가 반환한 실제 영화 데이터
    - 브라우저와 API 서버의 origin이 다를 때 CORS는 어떤 역할을 할까요?
        - **CORS**
            - 브라우저와 API 서버의 Origin이 다를 때 서버가 해당 브라우저의 교차 출처 요청에 대한 응답을 허용할지 결정할 수 있도록 하는 보안 메커니즘
        - CORS 동작 과정

      예를 들어 프론트엔드가 `http://localhost:5173`이고 API 서버가 `http://localhost:8080`이라면 포트가 다르므로 서로 다른 Origin

        1. 브라우저가 API 서버에 요청을 보냄
        2. 서버는 Access-Control-Allow-Origin 등의 응답 헤더를 통해 허용할 Origin을 알림
        3. 브라우저는 해당 헤더를 확인하여 JavaScript가 응답에 접근할 수 있는지 결정
        4. 허용되지 않은 Origin이면 브라우저가 응답에 대한 접근을 차단하여 CORS 오류가 발생
- Promise와 비동기 처리
    - Promise의 pending, fulfilled와 rejected 상태는 각각 무엇을 의미할까요?
        - **pending**: 비동기 작업이 아직 완료되지 않은 상태
        - **fulfilled**: 비동기 작업이 성공적으로 완료된 상태로, resolve()를 통해 결과값이 전달됨
        - **rejected**: 비동기 작업이 실패한 상태로, reject()를 통해 실패 이유가 전달됨
    - `.then().catch()`와 `async/await`는 같은 비동기 흐름을 어떻게 다르게 표현하나요?
        - **.then().catch() 방식**
            - Promise 객체에 `.then()`과 `.catch()`를 연결하여 비동기 작업의 성공과 실패를 처리하는 방식
            - `.then()`은 성공한 결과를 처리하고, `.catch()`는 발생한 오류를 처리함
            - 여러 비동기 작업을 메서드 체인 형태로 연결할 수 있음
        - **async/await 방식**
            - Promise 기반의 비동기 작업을 동기 코드처럼 순서대로 작성할 수 있는 방식
            - `async` 함수는 항상 Promise를 반환하며, `await`는 Promise의 결과가 정해질 때까지 해당 함수의 다음 코드 실행을 기다림
            - `try/catch`를 사용하여 오류를 처리함
        - 두 방식의 차이점

          두 방식 모두 동일한 Promise 기반의 비동기 처리를 수행하지만, `.then().catch()`는 메서드 체인을 통해 결과를 처리하고 `async/await`는 await를 통해 Promise의 결과를 기다린 후 다음 코드를 실행하는 방식이라는 차이가 있음

          따라서 여러 비동기 작업을 순서대로 처리해야 하는 경우에는 `async/await`가 가독성 측면에서 유리할 수 있음

    - `await`를 사용해도 브라우저 전체가 멈추지 않는 이유는 무엇일까요?
- fetch와 HTTP 요청 라이브러리
    - `fetch`에서 네트워크 오류와 HTTP 오류를 따로 처리해야 하는 이유는 무엇일까요?
        - **네트워크 오류**
            - 인터넷 연결 끊김이나 서버 연결 실패 등으로 요청을 정상적으로 수행하지 못한 경우
            - 이 경우 fetch()가 반환한 Promise가 rejected 상태가 되어 .catch() 또는 await와 try/catch를 함께 사용하여 처리할 수 있음
        - **HTTP 오류**
            - 서버로부터 응답은 받았지만, 상태 코드가 404 , 500 등으로 요청 처리에 문제가 있음을 나타내는 경우
            - fetch()는 이러한 HTTP 오류 응답만으로 Promise를 reject하지 않으므로, response.ok 또는 response.status를 직접 확인해야 함
            - response.ok는 상태 코드가 200 이상 299 이하일 때 true이므로, false이면 오류를 발생시키는 방식으로 처리할 수 있음
        - 처리 예시

            ```jsx
            async function getMovie(id) {
              try {
                const response = await fetch(`/api/movies/${id}`);
            
                if (!response.ok) {
                  throw new Error(`영화 조회 실패: HTTP ${response.status}`);
                }
            
                const movie = await response.json();
                return movie;
              } catch (error) {
                console.error("영화 정보를 불러오지 못했습니다.", error);
                throw error;
              }
            }
            ```

            - 네트워크 오류는 fetch() 자체의 실패로, HTTP 오류는 response.ok를 확인한 뒤 직접 발생시킨 오류로 catch에서 처리됨
            - response.json()에서 발생하는 응답 본문 읽기 오류나 JSON 파싱 오류도 위 코드의 catch에서 처리됨
            - CORS 정책에 따른 차단이나 요청 취소 등으로도 Promise가 reject될 수 있음
            - 따라서 catch에서 잡힌 오류를 모두 네트워크 오류로 판단하면 안 됨
            - 위 예시는 성공 시 JSON 본문을 반환하는 API를 가정함
    - 순수 `fetch`로 여러 API 함수를 작성하면 어떤 설정과 처리가 반복될까요?
        - **공통 URL 설정**
            - API 서버의 기본 주소와 각 요청 경로를 조합하는 코드가 반복됨
        - **요청 헤더 설정**
            - JSON 본문을 보낼 때의 Content-Type: application/json, 인증이 필요한 요청의 Authorization 등을 설정하는 코드가 반복됨
        - **요청 데이터 변환**
            - 객체를 JSON 본문으로 보내기 위한 처리와, 검색 조건 등을 URL 쿼리 문자열로 만드는 처리가 반복됨
        - **응답과 오류 처리**
            - response.ok를 통한 HTTP 오류 확인, JSON 응답의 response.json() 호출, 오류 메시지 처리 등이 반복됨
            - 응답 본문이 없는 204 No Content처럼 JSON으로 읽으면 안 되는 경우도 구분해야 함
        - **추가적인 공통 처리**
            - 필요한 경우 요청 취소, 시간 제한, 재시도 정책 등을 구현하는 코드도 반복될 수 있음

      → 이러한 처리를 공통 요청 함수로 묶거나 ky, Axios 같은 라이브러리의 공통 설정 기능을 사용하면 중복을 줄이고 요청 처리 방식을 일관되게 유지할 수 있음

    - ky와 Axios는 JSON 응답을 읽고 공통 요청 처리를 추가하는 방식이 어떻게 다를까요?
        - **ky**
            - Fetch API를 기반으로 한 HTTP 요청 라이브러리
            - JSON 응답을 읽을 때 .json()을 호출하며, 요청 뒤에 바로 연결할 수 있음
            - ky.create()로 공통 설정을 가진 인스턴스를 만들고, hooks를 통해 요청 전이나 응답 후의 공통 처리를 추가할 수 있음
            - 예를 들어 beforeRequest에서 인증 헤더를 추가하고, afterResponse에서 응답을 확인할 수 있음
        - **Axios**
            - 기본 설정에서 JSON 응답을 자동으로 JavaScript 값으로 변환하며, 응답 객체의 data 속성으로 접근함
            - axios.create()로 기본 URL, 헤더 등의 공통 설정을 가진 인스턴스를 만들 수 있음
            - interceptors.request와 interceptors.response를 통해 요청 및 응답의 공통 처리를 추가할 수 있음
            - 예를 들어 요청 인터셉터에서 인증 헤더를 추가하고, 응답 인터셉터에서 공통 오류를 처리할 수 있음
        - JSON 응답을 읽는 방식 비교

            ```jsx
            import ky from "ky";
            import axios from "axios";
            
            // ky: .json()으로 JSON 응답 본문을 읽음
            const kyMovie = await ky.get("/api/movies/123").json();
            
            // Axios: 응답 객체의 data에서 변환된 데이터를 읽음
            const response = await axios.get("/api/movies/123");
            const axiosMovie = response.data;
            ```

            - 두 라이브러리 모두 기본 설정에서는 리다이렉트를 따라간 뒤 최종 응답의 상태 코드가 2xx 범위를 벗어나면 오류로 처리하므로, 순수 fetch처럼 매번 response.ok를 직접 확인하는 코드를 줄일 수 있음
            - ky는 throwHttpErrors로 HTTP 오류를 발생시킬지 설정할 수 있고, Axios는 validateStatus로 성공으로 처리할 상태 코드의 조건을 변경할 수 있음
- 비동기 데이터의 UI 상태
    - 서버 데이터를 보여 주는 화면에서 로딩, 오류, 빈 결과와 성공 상태를 구분해야 하는 이유는 무엇일까요?
        - 서버 요청과 데이터 준비는 비동기로 진행되며, 진행 상황과 결과에 따라 사용자에게 보여 줘야 하는 화면과 가능한 동작이 달라지기 때문
        - **로딩 상태**
            - 요청을 보내고 응답 본문을 읽는 등, 화면에 표시할 데이터를 준비하는 중인 상태
            - 데이터를 불러오는 중임을 알려 화면이 멈췄다고 오해하거나 같은 요청을 반복하는 일을 줄일 수 있음
        - **오류 상태**
            - 네트워크 문제나 서버 오류 등으로 데이터를 정상적으로 불러오지 못한 상태
            - 요청이 실패했음을 알리고 재시도 등 다음 동작을 제공해야 함
        - **빈 결과 상태**
            - 요청은 성공했지만, 검색 결과나 표시할 목록이 없는 상태
            - 오류와 구분하여 검색 조건 변경이나 새 항목 추가 등 상황에 맞는 동작을 안내해야 함
        - **성공 상태**
            - 요청이 성공하여 표시할 데이터를 정상적으로 받은 상태
            - 데이터를 보여 주고 상세 조회 등 필요한 기능을 사용할 수 있게 해야 함
        - 빈 결과도 요청 자체는 성공한 것이지만, 화면에서는 데이터가 있는 성공 상태와 구분하여 표현할 수 있음
        - 예를 들어 영화 목록이 보이지 않더라도, 아직 불러오는 중인지, 요청이 실패했는지, 검색 결과가 없는지에 따라 안내가 달라져야 함
    - 각 상태를 사용자가 이해할 수 있게 표현하려면 어떤 정보와 동작이 필요할까요?
        - **로딩 상태**
            - “영화 목록을 불러오는 중입니다.” 같은 안내 문구와 로딩 표시 또는 스켈레톤 UI를 제공함
            - 중복 실행을 막아야 하는 요청 버튼은 일시적으로 비활성화할 수 있음
            - 다시 조회하는 상황이라면 기존 데이터를 유지하면서 갱신 중임을 표시할 수도 있음
        - **오류 상태**
            - “영화 목록을 불러오지 못했습니다.”처럼 사용자가 이해할 수 있는 오류 메시지를 제공함
            - “다시 시도” 버튼을 제공하고, 원인을 알 수 있다면 연결 확인이나 로그인 등 필요한 동작을 안내함
            - 개발용 오류 내용이나 상태 코드만 표시하기보다 사용자가 할 수 있는 동작을 함께 알려 주는 것이 좋음
        - **빈 결과 상태**
            - “검색 결과가 없습니다.” 또는 “아직 등록한 영화가 없습니다.”처럼 결과가 없는 이유를 설명함
            - 검색어 변경, 필터 초기화, 영화 추가 등 현재 상황에 맞는 동작을 제공함
        - **성공 상태**
            - 영화 제목, 포스터 등 사용자가 요청한 데이터를 읽기 쉽게 표시함
            - 상세 보기, 다음 페이지 조회 등 데이터와 관련된 동작을 제공함
        - 상태를 표시할 때는 색상이나 아이콘만 사용하기보다 설명 문구를 함께 제공하는 것이 좋음
    - API 응답 타입과 화면에서 사용하는 타입을 분리하면 어떤 상황에서 도움이 될까요?
        - **API 응답 타입**
            - 서버가 반환하는 데이터의 필드 이름, 구조, 값의 형태를 나타내는 타입
        - **화면에서 사용하는 타입**
            - 화면에서 실제로 필요한 데이터와 표시하기 편리한 구조를 나타내는 타입
        - 분리하면 도움이 되는 상황
            - 서버의 poster_path 같은 필드 이름을 화면에서 사용하기 편한 이름으로 바꾸고, 필요한 값으로 변환할 때
            - 서버에서 받은 상대 경로를 전체 이미지 URL로 바꾸거나, 날짜와 평점을 화면에 맞게 가공할 때
            - null이 가능한 값에 기본 문구나 기본 이미지를 적용할 때
            - 여러 API의 데이터를 합쳐 하나의 화면에서 사용할 때
            - 서버 응답 구조가 바뀌어도 변환 함수에서 차이를 처리하여 화면 코드의 수정 범위를 줄이고 싶을 때
        - 타입 분리 예시

            ```tsx
            // 서버가 반환하는 데이터 구조
            type MovieResponse = {
              id: number;
              title: string;
              poster_path: string | null;
              vote_average: number;
            };
            
            // 화면에서 사용하는 데이터 구조
            type MovieCard = {
              id: number;
              title: string;
              posterUrl: string;
              ratingText: string;
            };
            
            function toMovieCard(movie: MovieResponse): MovieCard {
              return {
                id: movie.id,
                title: movie.title,
                posterUrl: movie.poster_path
                  ? `https://image.example.com${movie.poster_path}`
                  : "/images/default-poster.png",
                ratingText: movie.vote_average.toFixed(1),
              };
            }
            ```

            - 위 예시에서는 서버의 포스터 경로를 화면용 URL로 바꾸고, 평점을 소수점 한 자리 문자열로 변환함
            - 이미지 주소와 기본 이미지 경로는 설명을 위한 예시이며, 실제 프로젝트에 맞게 설정해야 함
            - 타입을 나누는 것만으로 데이터가 변환되는 것은 아니므로, 위 예시의 toMovieCard처럼 실제 변환 함수를 작성하여 사용해야 함
            - 타입을 선언하거나 단언하는 것만으로 실제 API 응답을 실행 중에 검사하는 것은 아니므로, 필요한 경우 별도의 데이터 검증을 추가해야 함