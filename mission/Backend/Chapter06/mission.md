#### API 명세

기본 주소: http://localhost:8080

POST·PATCH 요청 형식: application/json

memberId는 회원 ID, ratingId는 평점 등록 응답으로 받은 ID다.

**회원가입**

| 항목 | 내용 |
| --- | --- |
| 요청 | **POST** /members |
| 요청 Body | email, password, nickname |
| 입력 조건 | 이메일 형식, 비밀번호 8자 이상 및 대문자·소문자·숫자를 각각 1개 이상 포함하고 특수문자 !@#$%^&* 중 1개 이상 포함, 닉네임 2~12자 |
| 성공 응답 | **201 Created** — 회원 ID·이메일·닉네임 반환 |
| 실패 응답 | **400** 입력 검증 실패 / **409** 이메일 또는 닉네임 중복 |
| 처리 내용 | 비밀번호를 bcrypt로 해시하여 저장하고 응답에서 제외 |

비밀번호는 !@#$%^&* 중 특수문자를 최소 1개 포함해야 한다. 예를 들어 Abcdef1?는 이 조건을 충족하지 않아 거부되고, Abcdef1!는 충족한다. 목록 밖의 특수문자를 모두 금지하는 조건은 아니므로 Abcdef1!?도 이 조건을 충족한다.

**비밀번호 바이트 제한 — 추가 구현 필요**

bcrypt에 전달하기 전에 비밀번호의 UTF-8 바이트 길이가 72바이트 이하인지 입력 단계에서 검증해야 한다. 문자 수와 바이트 수는 다르므로 글자 수 제한만으로 대체하지 않는다. 72바이트를 초과하면 400 Bad Request와 비밀번호 길이 오류 메시지를 반환하도록 보완한다.

현재 SignUpRequest에는 이 바이트 길이 검증이 없다. 따라서 조건을 만족하는 73바이트 비밀번호가 bcrypt에서 거부될 경우, 기존 IllegalArgumentException 처리기에 의해 중복 오류를 뜻하는 409로 응답할 수 있다. 위의 400 처리는 검증 코드를 추가한 뒤 확인해야 한다.

**평점 등록**

| 항목 | 내용 |
| --- | --- |
| 요청 | **POST** /members/{memberId}/ratings |
| 요청 Body | movieId, score, comment |
| 입력 조건 | 영화 ID는 양수, 별점은 1~5, 후기는 선택 입력이며 최대 500자 |
| 성공 응답 | **201 Created** — result에 생성된 평점 ID 반환 |
| 실패 응답 | **400** 입력 검증 실패 / **404** 회원 없음 / **409** 중복 평점 |
| 처리 내용 | 같은 회원이 같은 영화에 평점을 중복 등록하지 못하도록 검사 |

**평점 수정**

| 항목 | 내용 |
| --- | --- |
| 요청 | **PATCH** /members/{memberId}/ratings/{ratingId} |
| 요청 Body | score, comment |
| 입력 조건 | 별점은 필수이며 1~5, 후기는 최대 500자 |
| 성공 응답 | **200 OK** — 수정 성공 메시지와 result: null 반환 |
| 실패 응답 | **400** 입력 검증 실패 / **403** 경로의 회원 ID와 평점 작성자 ID 불일치 / **404** 평점 없음 |
| 처리 내용 | 경로의 memberId와 DB에 저장된 평점 작성자 ID를 비교한 후 별점과 후기를 수정 |

현재는 comment를 생략하면 기존 후기가 null로 바뀌므로, 유지할 후기도 함께 전송한다.

**평점 삭제**

| 항목 | 내용 |
| --- | --- |
| 요청 | **DELETE** /members/{memberId}/ratings/{ratingId} |
| 요청 Body | 없음 |
| 성공 응답 | **204 No Content** — 응답 본문 없음 |
| 실패 응답 | **403** 경로의 회원 ID와 평점 작성자 ID 불일치 / **404** 평점 없음 |
| 처리 내용 | 경로의 memberId와 DB에 저장된 평점 작성자 ID를 비교한 후 평점 삭제 |

**인증된 회원과 평점 작성자 비교 — 추가 구현 필요**

현재는 로그인 인증 없이 요청 경로의 memberId만 평점 작성자 ID와 비교한다. memberId는 요청자가 변경할 수 있으므로, 이 비교만으로 실제 요청자가 평점 작성자인지 확인할 수는 없다. 다른 회원의 memberId와 ratingId를 함께 지정하면 해당 회원의 평점을 수정하거나 삭제할 수 있는 문제가 남아 있다.

이를 해결하려면 요청자를 인증하고, 서버가 검증한 세션 또는 토큰에서 회원 ID를 얻어 DB에 저장된 평점 작성자 ID와 비교해야 한다. 인증되지 않은 요청은 401 Unauthorized, 인증된 회원과 작성자가 다르면 403 Forbidden으로 처리하도록 보완한다. 경로의 memberId를 유지한다면 인증된 회원 ID와도 일치하는지 검사한다. 평점 등록 역시 인증된 회원 ID를 기준으로 처리해야 한다.

이 인증 검사는 현재 구현에 포함되어 있지 않으며, 아래 기존 캡처는 로그인 인증이나 회원 ID 위조 방지를 검증한 결과가 아니다.

**회원별 평점 조회 — 등록·수정·삭제 확인용**

| 항목 | 내용 |
| --- | --- |
| 요청 | **GET** /members/{memberId}/ratings |
| 요청 Body | 없음 |
| 성공 응답 | **200 OK** — 평점 ID·영화 ID·별점·후기·생성일·수정일을 담은 배열 |
| 실패 응답 | **404** 회원 없음 |
| 처리 내용 | 평점 ID 내림차순 조회, 작성한 평점이 없으면 빈 배열 [] 반환 |

회원가입·평점 등록·수정과 처리 대상 오류는 isSuccess, code, message, result 구조를 사용한다. 평점 조회는 배열을 직접 반환하고, 삭제 성공은 본문을 반환하지 않는다.

#### **Postman**

**회원가입 성공**

![실행 결과 1](<./images/chap6b(1).png>)

**회원가입 실패**

![실행 결과 2](<./images/chap6b(2).png>)

**평점 등록**

![실행 결과 3](<./images/chap6b(3).png>)

**평점 수정**

![실행 결과 4](<./images/chap6b(4).png>)

**중복 평점**

![실행 결과 5](<./images/chap6b(5).png>)

**잘못된 별점**

![실행 결과 6](<./images/chap6b(6).png>)

**다른 회원의 수정 요청**

![실행 결과 7](<./images/chap6b(7).png>)

현재 캡처는 경로의 memberId와 평점 작성자 ID가 다를 때 403을 반환하는지 확인한 결과다. 인증 적용 후에는 다른 회원으로 인증한 상태에서 작성자의 memberId와 ratingId를 지정해도 요청이 거부되는지 추가 확인해야 한다.

**삭제 성공**

![실행 결과 8](<./images/chap6b(8).png>)

**없는 평점 요청**

![실행 결과 9](<./images/chap6b(9).png>)

#### 핵심 코드

https://github.com/psylo5608-Seoyeon/11th_BE_Spring_Practice_Mission

**service/MemberService.java**

이메일·닉네임 중복 검사, bcrypt 해시 저장, 비밀번호를 제외한 회원 정보 반환

**service/RatingService.java**

평점 중복 검사, 등록·수정·삭제 처리, 경로의 회원 ID와 평점 작성자 ID 비교 및 403·404 처리

**controller/RatingController.java**

평점 API 경로, 입력 검증 호출, 201·200·204 응답 처리

**controller/GlobalExceptionHandler.java**

검증 실패·중복·권한·조회 실패를 공통 오류 형식으로 반환

**entity/Rating.java**

회원 ID와 영화 ID의 복합 UNIQUE 제약 선언

#### 트러블슈팅

회원가입 API를 추가한 뒤 MemberController에서 cannot find symbol method signUp(SignUpRequest) 오류가 발생했다.