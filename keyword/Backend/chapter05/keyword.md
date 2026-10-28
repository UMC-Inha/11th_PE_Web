- SOP와 CORS
    
    # SOP와 CORS
    
    ## SOP (Same Origin Policy)
    
    > 서로 다른 출처의 문서나 스크립트가 상대방의 데이터에 접근하는 것을 제한하는 **브라우저의 보안 정책**
    > 
    
    SOP는 **Same-Origin Policy**, 즉 동일 출처 정책이다.
    
    예를 들어 사용자가 도서 서비스에 로그인한 상태에서 악성 사이트에 접속했다고 하자.
    
    악성 사이트의 JavaScript가 도서 서비스의 개인 대여 내역을 자유롭게 읽을 수 있다면 문제가 된다.
    
    ```
    사용자가 도서 서비스에 로그인
                 ↓
    다른 사이트에 접속
                 ↓
    다른 사이트의 JavaScript가 대여 내역 조회 시도
                 ↓
    브라우저가 출처에 따른 접근 제한 적용
    ```
    
    SOP는 이러한 상황에서 **다른 출처의 데이터를 마음대로 읽는 것을 제한**한다.
    
    다만 “다른 출처로 보내는 모든 요청을 막는다”는 의미는 아니다. 링크 이동, 폼 전송, 이미지 삽입 등 허용되는 동작도 있다.
    
    따라서 **요청을 보낼 수 있는가**와 **응답 내용을 JavaScript가 읽을 수 있는가**를 구분해야 한다.
    
    ---
    
    ## CORS (Cross-Origin Resource Sharing)
    
    > 서버가 허용한 출처의 JavaScript에 **다른 출처의 응답을 읽을 수 있도록 허용하는 방식**
    > 
    
    다음처럼 프론트엔드와 API 서버의 주소가 다르다고 하자.
    
    ```
    프론트엔드: https://app.example.com
    API 서버:   https://api.example.com
    ```
    
    호스트가 다르므로 다른 출처이다.
    
    프론트엔드에서 API를 호출하면 서버는 응답 헤더로 허용할 출처를 알릴 수 있다.
    
    ```
    Access-Control-Allow-Origin: https://app.example.com
    ```
    
    브라우저는 해당 헤더를 확인해 프론트엔드 코드에 응답을 공개할지 결정한다.
    
    ```
    프론트엔드가 다른 출처의 API 호출
                      ↓
    서버가 응답과 CORS 헤더 반환
                      ↓
    브라우저가 허용 조건 확인
                      ↓
    허용되면 JavaScript에서 응답 사용
    ```
    
    CORS는 프론트엔드 코드에서 임의로 해제하는 설정이 아니다. **응답을 제공하는 서버가 허용 정책을 설정**해야 한다.
    
    ---
    
    ## Preflight 요청
    
    > 실제 요청을 보내기 전에, 해당 요청이 허용되는지 확인하는 **사전 요청**
    > 
    
    모든 CORS 요청에 사전 요청이 발생하는 것은 아니다.
    
    예를 들어 JSON 본문을 보내거나 특정 헤더를 사용하는 요청은 사전 확인이 필요할 수 있다.
    
    ```tsx
    await fetch("https://api.example.com/bookmarks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookId: 10,
      }),
    });
    ```
    
    브라우저는 먼저 다음과 같은 `OPTIONS` 요청을 보낼 수 있다.
    
    ```
    OPTIONS /bookmarks
    Origin: https://app.example.com
    Access-Control-Request-Method: POST
    Access-Control-Request-Headers: content-type
    ```
    
    서버는 허용 여부를 응답한다.
    
    ```
    Access-Control-Allow-Origin: https://app.example.com
    Access-Control-Allow-Methods: POST
    Access-Control-Allow-Headers: Content-Type
    ```
    
    → 사전 확인에 통과하면 실제 POST 요청을 진행함
    
    ---
    
    ## CORS 오류가 나면 요청도 실행되지 않았을까?
    
    항상 그렇지는 않다.
    
    | 상황 | 동작 |
    | --- | --- |
    | Preflight가 필요한데 실패 | 실제 요청은 전송되지 않음 |
    | Preflight 없이 전송 가능한 요청 | 서버가 처리했어도 브라우저가 응답 읽기를 막을 수 있음 |
    
    따라서 CORS 오류만 보고 **서버에서 아무 작업도 일어나지 않았다고 단정하면 안 된다.**
    
    또한 `mode: "no-cors"`를 설정해도 일반적인 API 응답을 자유롭게 읽을 수 있게 되는 것은 아니다. 응답이 불투명한 형태로 제한되어 JSON 등을 읽을 수 없다.
    
    ---
    
    ## CORS와 인증·인가의 차이
    
    | 구분 | 확인하는 내용 |
    | --- | --- |
    | CORS | 어느 출처의 브라우저 코드에 응답을 공개할 것인가? |
    | 인증 | 요청한 사용자가 누구인가? |
    | 인가 | 해당 사용자가 이 작업을 수행할 권한이 있는가? |
    
    CORS는 브라우저가 적용하는 정책이다. 서버 간 통신이나 일반적인 HTTP 클라이언트가 같은 방식으로 제한되는 것은 아니다.
    
    따라서 **CORS를 설정했다고 인증·인가나 CSRF 방어가 완성되는 것은 아니다.**
    
- Same-Origin과 Same-Site의 차이
    
    # Same-Origin과 Same-Site의 차이
    
    ## Same-Origin
    
    > 두 주소의 **프로토콜, 호스트, 포트가 모두 같은 상태**
    > 
    
    Origin은 다음 세 요소로 구분한다.
    
    ```
    Origin = 프로토콜 + 호스트 + 포트
    ```
    
    예를 들어,
    
    ```
    https://app.example.com/books
    https://app.example.com/bookmarks
    ```
    
    는 경로만 다르므로 같은 출처이다.
    
    반면 다음 주소는 호스트가 다르다.
    
    ```
    https://app.example.com
    https://api.example.com
    ```
    
    → 서로 다른 출처인 **Cross-Origin**
    
    Origin 비교에서는 path나 검색 파라미터가 기준에 포함되지 않는다.
    
    ---
    
    ## Same-Site
    
    > 현대적인 Schemeful Same-Site 기준에서 **프로토콜과 등록 가능한 도메인이 같은 상태**
    > 
    
    일반적인 도메인 주소에서 Site는 다음처럼 이해할 수 있다.
    
    ```
    Site = 프로토콜 + 등록 가능한 도메인
    ```
    
    등록 가능한 도메인은 공용 접미사와 그 바로 앞의 도메인을 합친 부분이다.
    
    ```
    app.example.com
    api.example.com
    → 등록 가능한 도메인: example.com
    ```
    
    따라서 다음 주소는 호스트는 다르지만 같은 사이트에 해당한다.
    
    ```
    https://app.example.com
    https://api.example.com
    ```
    
    ```
    Same-Origin? → 아니오
    Same-Site?   → 예
    ```
    
    Site를 단순히 “주소의 마지막 두 단어”로 판단하면 안 된다. 예를 들어 공용 접미사가 `co.uk`라면 `example.co.uk`가 등록 가능한 도메인이 된다.
    
    ---
    
    ## 주소별 비교
    
    기준 주소를 `https://app.example.com`이라고 하자.
    
    | 비교 주소 | Same-Origin | Same-Site | 이유 |
    | --- | --- | --- | --- |
    | `https://app.example.com/books` | O | O | 경로만 다름 |
    | `https://api.example.com` | X | O | 호스트는 다르지만 등록 도메인과 프로토콜이 같음 |
    | `https://app.example.com:8443` | X | O | 포트는 Origin에 영향을 주지만 Site에는 영향을 주지 않음 |
    | `http://app.example.com` | X | X | 프로토콜이 다름 |
    | `https://example.org` | X | X | 등록 가능한 도메인이 다름 |
    
    → **같은 사이트이면서 다른 출처인 경우가 존재한다.**
    
    ---
    
    ## 어디에서 사용될까?
    
    | 개념 | 주로 연결되는 정책 |
    | --- | --- |
    | Origin | SOP, CORS, localStorage 구분 |
    | Site | 쿠키의 SameSite 판단 등 |
    
    예를 들어 다음 구조에서는,
    
    ```
    프론트엔드: https://app.example.com
    백엔드:     https://api.example.com
    ```
    
    같은 사이트이지만 다른 출처이므로, 프론트엔드에서 응답을 읽으려면 적절한 CORS 설정이 필요하다.
    
    한편 쿠키에서는 같은 사이트인지 외에도 **쿠키의 대상 호스트, Path, Secure, 요청의 credentials 설정** 등을 함께 확인해야 한다.
    
    같은 사이트라는 이유만으로 모든 하위 도메인의 쿠키가 서로 공유되는 것은 아니다.
    
- 쿠키의 SameSite 속성
    
    # 쿠키의 SameSite 속성
    
    ## SameSite란?
    
    > **Cross-Site 요청에서 쿠키를 보낼 수 있는 조건**을 정하는 속성
    > 
    
    브라우저는 조건에 맞는 요청에 쿠키를 자동으로 포함할 수 있다.
    
    공격자는 이 동작을 이용해 로그인한 사용자가 원하지 않는 요청을 보내도록 유도할 수 있다. SameSite는 이러한 상황에서 쿠키 전송을 제한하는 데 도움이 된다.
    
    ```
    Set-Cookie: sessionId=abc123; Path=/; HttpOnly; Secure; SameSite=Lax
    ```
    
    SameSite에는 `Strict`, `Lax`, `None`이 있다.
    
    ---
    
    ## SameSite=Strict
    
    > 기본적으로 **Same-Site 요청에만** 쿠키를 보낸다.
    > 
    
    ```
    Set-Cookie: sessionId=abc123; Path=/; HttpOnly; Secure; SameSite=Strict
    ```
    
    다른 사이트에서 링크를 클릭해 들어오는 최초의 Cross-Site 탐색 요청에는 해당 쿠키가 포함되지 않을 수 있다.
    
    예를 들어 외부 사이트에 있는 도서 서비스 링크를 누르면, 첫 요청에서는 로그인 쿠키가 빠져 로그인하지 않은 화면처럼 보일 수 있다.
    
    쿠키 전송을 엄격히 제한하지만, 외부 링크 진입 흐름과의 관계를 고려해야 한다.
    
    ---
    
    ## SameSite=Lax
    
    > Same-Site 요청에 쿠키를 보내며, 일부 **최상위 페이지 이동**에서도 허용한다.
    > 
    
    대표적으로 다른 사이트의 링크를 클릭하여 GET 방식으로 페이지 전체를 이동하는 경우이다.
    
    ```
    외부 사이트의 링크 클릭
               ↓
    현재 탭이 도서 서비스로 이동
               ↓
    Lax 쿠키가 전송될 수 있음
    ```
    
    하지만 다른 사이트에서 실행한 `fetch()`나 iframe 내부 요청까지 같은 방식으로 허용하는 것은 아니다.
    
    명시적인 `SameSite=Lax`에서는 일반적으로 Cross-Site POST 요청에 쿠키를 보내지 않는다.
    
    ---
    
    ## SameSite=None
    
    > SameSite 기준으로는 **Cross-Site 요청에서도 쿠키 전송을 허용**한다.
    > 
    
    ```
    Set-Cookie: sessionId=abc123; Path=/; HttpOnly; Secure; SameSite=None
    ```
    
    `SameSite=None`에는 `Secure`가 필요하다.
    
    단, 이것만 설정하면 쿠키가 무조건 전송되는 것은 아니다. 브라우저의 서드파티 쿠키 제한, 쿠키 대상 범위, 요청 설정 등에 따라 차단될 수 있다.
    
    ---
    
    ## 세 값 비교
    
    아래 표는 다른 쿠키 조건이 충족되었다는 전제에서 **SameSite에 의한 제한**을 비교한 것이다.
    
    | 요청 상황 | Strict | Lax | None |
    | --- | --- | --- | --- |
    | Same-Site 요청 | 허용 | 허용 | 허용 |
    | 외부 사이트에서 일반 링크를 통한 최상위 GET 이동 | 제한 | 허용 | 허용 |
    | Cross-Site fetch | 제한 | 제한 | 허용 가능 |
    | Cross-Site POST 폼 전송 | 제한 | 제한 | 허용 가능 |
    
    속성을 생략하면 일부 브라우저는 Lax에 준하는 기본값을 적용한다. 다만 생략 시의 완화된 예외가 있을 수 있으므로 **의도한 정책을 명시하는 편이 분명하다.**
    
    ---
    
    ## SameSite, Secure, HttpOnly의 차이
    
    | 속성 | 역할 |
    | --- | --- |
    | `SameSite` | 사이트 관계에 따라 쿠키 전송 제한 |
    | `Secure` | 일반적으로 HTTPS 연결에서만 전송 |
    | `HttpOnly` | `document.cookie` 같은 JavaScript 접근 제한 |
    | `Domain` | 쿠키를 보낼 호스트 범위 지정 |
    | `Path` | 쿠키를 보낼 경로 범위 지정 |
    
    `HttpOnly`가 있다고 쿠키가 요청에 포함되지 않는 것은 아니다.
    
    JavaScript가 직접 값을 읽지 못하더라도, 브라우저는 조건에 맞는 요청에 쿠키를 전송할 수 있다. 따라서 `HttpOnly`와 CSRF 방어도 구분해야 한다.
    
    ---
    
    ## 쿠키를 사용하는 CORS 요청
    
    다른 출처의 API에 쿠키를 포함하려면 클라이언트에서 다음처럼 요청할 수 있다.
    
    ```
    const response = await fetch(
      "https://api.example.com/me",
      {
        credentials: "include",
      },
    );
    ```
    
    `fetch()`의 기본 credentials 설정은 `same-origin`이므로, 다른 출처에는 명시적인 설정이 필요하다.
    
    서버에서도 응답 접근을 허용해야 한다.
    
    ```
    Access-Control-Allow-Origin: https://app.example.com
    Access-Control-Allow-Credentials: true
    ```
    
    이때 쿠키 같은 자격 증명을 포함하는 CORS 요청에는 `Access-Control-Allow-Origin: *`를 사용할 수 없다.
    
    또한 `credentials: "include"`는 **SameSite 제한을 무시하는 옵션이 아니다.** 쿠키 자체의 전송 조건과 브라우저 정책도 만족해야 한다.
    
- 복합 UNIQUE 제약을 사용하는 이유는?
    
    # 복합 UNIQUE 제약을 사용하는 이유
    
    ## UNIQUE 제약
    
    > 특정 컬럼 또는 컬럼 조합의 값이 **중복되지 않도록 DB에서 보장하는 제약조건**
    > 
    
    단일 UNIQUE는 하나의 컬럼을 기준으로 중복을 제한한다.
    
    ```sql
    UNIQUE (email)
    ```
    
    → 같은 이메일의 중복 저장을 제한함
    
    복합 UNIQUE는 여러 컬럼을 묶어 판단한다.
    
    ```sql
    UNIQUE (user_id, book_id)
    ```
    
    → **같은 사용자와 같은 도서의 조합**이 반복되는 것을 제한함
    
    ---
    
    ## 북마크에 적용하기
    
    사용자는 여러 책을 북마크할 수 있고, 하나의 책도 여러 사용자가 북마크할 수 있다.
    
    하지만 같은 사용자가 같은 책을 중복 등록할 필요는 없다.
    
    ```
    한 사용자가 여러 책을 북마크 → 허용
    여러 사용자가 같은 책을 북마크 → 허용
    같은 사용자가 같은 책을 두 번 북마크 → 제한
    ```
    
    이를 표현하려면 다음과 같이 구성할 수 있다.
    
    ```sql
    CREATE TABLE bookmark (
        bookmark_id BIGINT PRIMARY KEY AUTO_INCREMENT,
        user_id BIGINT NOT NULL,
        book_id BIGINT NOT NULL,
    
        CONSTRAINT uq_bookmark_user_book
            UNIQUE (user_id, book_id)
    );
    ```
    
    위 코드는 복합 UNIQUE를 설명하기 위한 MySQL 예시이며, 실제 설계에서는 사용자·도서에 대한 FK도 별도로 고려한다.
    
    | user_id | book_id | 결과 |
    | --- | --- | --- |
    | 1 | 10 | 허용 |
    | 1 | 20 | 허용 |
    | 2 | 10 | 허용 |
    | 1 | 10 | 기존 조합과 중복되므로 제한 |
    
    ---
    
    ## 컬럼마다 UNIQUE를 지정하면 안 될까?
    
    다음은 전혀 다른 제약이다.
    
    ```sql
    UNIQUE (user_id),
    UNIQUE (book_id)
    ```
    
    | 설정 | 의미 |
    | --- | --- |
    | `UNIQUE(user_id)` | 한 사용자가 최대 한 행에만 등장 |
    | `UNIQUE(book_id)` | 한 도서가 최대 한 행에만 등장 |
    | `UNIQUE(user_id, book_id)` | 두 값의 조합만 중복 금지 |
    
    북마크 테이블에서 각각 UNIQUE를 지정하면 사용자는 책 한 권만 북마크할 수 있고, 책도 사용자 한 명에게만 북마크될 수 있다.
    
    따라서 요구사항이 **개별 값의 중복 금지인지, 조합의 중복 금지인지** 구분해야 한다.
    
    ---
    
    ## PK가 있는데도 필요한 이유
    
    `bookmark_id`는 각 행을 식별한다.
    
    하지만 다음 두 행의 ID가 서로 다르므로 PK만으로는 막을 수 없다.
    
    | bookmark_id | user_id | book_id |
    | --- | --- | --- |
    | 100 | 1 | 10 |
    | 101 | 1 | 10 |
    
    ```
    PK
    → 각 행을 식별
    
    복합 UNIQUE
    → 같은 사용자의 같은 책 중복 등록 방지
    ```
    
    즉, PK와 복합 UNIQUE는 서로 다른 규칙을 보장할 수 있다.
    
    ---
    
    ## 애플리케이션에서 먼저 조회하면 충분할까?
    
    등록 전에 중복 여부를 조회하는 것은 사용자에게 명확한 안내를 제공하는 데 도움이 된다.
    
    하지만 동시에 두 요청이 들어오면 다음 상황이 가능하다.
    
    ```
    요청 A: 아직 북마크가 없음을 확인
    요청 B: 아직 북마크가 없음을 확인
    요청 A: 등록
    요청 B: 등록
    ```
    
    사전 조회만으로는 중복을 확실하게 막지 못한다.
    
    DB의 UNIQUE 제약이 있으면 두 요청이 같은 조합을 모두 저장할 수 없으므로, 애플리케이션은 중복 오류를 처리하여 적절한 응답을 반환할 수 있다.
    
    ---
    
    ## NULL과 기존 데이터에 주의
    
    MySQL의 UNIQUE 인덱스는 NULL을 허용하는 컬럼에서 여러 NULL을 허용한다.
    
    따라서 중복 방지에 사용하는 값이 반드시 존재해야 한다면 `NOT NULL`도 함께 지정하는 것이 적절하다.
    
    ```sql
    user_id BIGINT NOT NULL,
    book_id BIGINT NOT NULL,
    UNIQUE (user_id, book_id)
    ```
    
    또한 기존 데이터에 중복 조합이 있다면 UNIQUE 제약 추가가 실패할 수 있으므로 먼저 정리해야 한다.
    
    복합 UNIQUE는 **현재 저장된 데이터의 업무 규칙을 DB에서 보장하기 위한 장치**이며, 단순히 조회 성능을 위한 일반 복합 인덱스와는 목적이 다르다.
    
- 외부 Open API 연동 시 API Key를 프론트/백엔드 중 어디에 두어야 안전한가?
    
    # Open API 연동 시 API Key 위치
    
    ## 기본 원칙
    
    > 비밀로 유지해야 하는 API Key는 **백엔드의 서버 전용 환경에 보관**한다.
    > 
    
    API Key는 서비스 제공자가 요청을 보낸 애플리케이션이나 프로젝트를 식별하고, 사용량·권한·과금을 관리하는 데 사용될 수 있다.
    
    키가 유출되면 다른 사람이 해당 키로 요청해 사용량이나 비용을 발생시킬 수 있다.
    
    또한 Open API라고 해서 인증 없이 누구나 무제한 사용할 수 있다는 뜻은 아니다.
    
    ---
    
    ## 프론트엔드에 두면 왜 노출될까?
    
    브라우저에서 실행되는 코드는 사용자의 기기로 전달된다.
    
    ```tsx
    const apiKey = "SECRET_API_KEY";
    ```
    
    키를 직접 코드에 넣거나 브라우저 요청에 포함하면 사용자는 다음 위치에서 확인할 수 있다.
    
    - 내려받은 JavaScript 파일
    - 개발자 도구의 네트워크 요청
    - 실행 중인 코드와 메모리
    
    난독화하거나 변수 이름을 바꾸더라도 비밀을 보장할 수 없다.
    
    → **브라우저가 직접 사용해야 하는 값은 사용자에게 숨길 수 있다고 가정하면 안 된다.**
    
    ---
    
    ## 프론트엔드 .env에 넣으면 안전할까?
    
    환경변수 파일에 넣었다고 항상 서버에만 남는 것은 아니다.
    
    Vite의 다음 값은 클라이언트 코드에서 사용할 수 있도록 노출되는 환경변수이다.
    
    ```tsx
    const apiKey = import.meta.env.VITE_EXTERNAL_API_KEY;
    ```
    
    해당 값이 클라이언트 코드에서 사용되면 빌드 결과물에 포함될 수 있다.
    
    `.env`를 Git에 올리지 않는 것과 **브라우저에 키가 전달되지 않게 하는 것**은 서로 다른 문제이다.
    
    ```
    Git에서 제외
    → 저장소를 통한 노출 방지
    
    서버 전용으로 사용
    → 브라우저로 전달되는 것 방지
    ```
    
    따라서 비밀 키를 `VITE_`처럼 클라이언트 공개용 변수에 넣어서는 안 된다.
    
    ---
    
    ## 백엔드를 거쳐 호출하기
    
    ```
    프론트엔드
       ↓ 검색어 등 필요한 값만 전송
    우리 백엔드
       ↓ 서버에 보관된 API Key 추가
    외부 Open API
       ↓ 결과 반환
    우리 백엔드
       ↓ 필요한 데이터 반환
    프론트엔드
    ```
    
    프론트엔드는 자신의 백엔드만 호출한다.
    
    ```tsx
    const params = new URLSearchParams({
      keyword: "도서관",
    });
    
    const response = await fetch(
      `/api/books/search?${params.toString()}`,
    );
    ```
    
    백엔드는 서버 환경변수에서 키를 읽어 외부 요청에 사용한다.
    
    ```tsx
    // Node.js 백엔드의 개념 예시
    const apiKey = process.env.EXTERNAL_API_KEY;
    
    if (!apiKey) {
      throw new Error("외부 API Key가 설정되지 않았습니다.");
    }
    
    const url = new URL(
      "https://provider.example.com/books",
    );
    
    url.searchParams.set("query", keyword);
    
    const response = await fetch(url, {
      headers: {
        "X-API-Key": apiKey,
      },
    });
    ```
    
    위 주소와 인증 헤더는 예시이다. 실제 API가 정한 인증 방식을 따라야 한다.
    
    핵심은 **키를 서버에서만 사용하고, 프론트엔드에 반환하지 않는 것**이다.
    
    ---
    
    ## 백엔드에 두면 모든 문제가 해결될까?
    
    키가 노출되지 않더라도 누구나 백엔드 API를 무제한 호출할 수 있으면 외부 API 사용량이 소모될 수 있다.
    
    따라서 필요에 따라 다음을 적용한다.
    
    | 항목 | 목적 |
    | --- | --- |
    | 인증·인가 | 사용할 수 있는 사용자와 기능 제한 |
    | 요청 횟수 제한 | 과도한 호출과 비용 증가 방지 |
    | 입력값 검증 | 허용한 요청만 외부 API로 전달 |
    | 캐싱 | 같은 요청의 반복 호출 감소 |
    | 로그 관리 | 키가 로그나 오류 응답에 남지 않도록 처리 |
    | 키 권한 제한 | 필요한 API와 권한만 허용 |
    
    백엔드 프록시 역시 서비스의 일부이므로, 호출할 수 있는 외부 기능과 입력 범위를 명확하게 정해야 한다.
    
    ---
    
    ## 프론트엔드에 둘 수 있는 키도 있을까?
    
    일부 지도 SDK처럼 **브라우저 사용을 전제로 발급되는 키**는 클라이언트에 포함하도록 설계되어 있다.
    
    이 경우 키를 완전히 숨기는 것보다 제공자가 지원하는 사용 제한을 적용한다.
    
    ```
    허용 웹사이트 제한
    사용 가능한 API 제한
    사용량 제한과 모니터링
    서버용 키와 브라우저용 키 분리
    ```
    
    단, 단순히 이름이 API Key라는 이유로 공개해도 되는 것은 아니다. **제공자가 브라우저 노출을 허용하는 키인지** 확인해야 한다.
    
    | 키 종류 | 적절한 위치 |
    | --- | --- |
    | 비밀 인증 키, 서버용 키 | 백엔드 |
    | 제공자가 공개 사용을 허용한 브라우저용 키 | 프론트엔드 가능, 사용 제한 필요 |
    | 어떤 종류인지 불명확한 키 | 제공자 문서에서 용도 확인 후 결정 |
    
    비밀 API Key는 서버 전용 환경변수나 비밀 관리 서비스에 두고, 브라우저에는 외부 API를 이용한 **결과 데이터만 전달하는 구조**가 기본이다.