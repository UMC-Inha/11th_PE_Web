#### 1. 준비

| 항목 | 내용 |
| --- | --- |
| 의존성 | `jjwt-api`, `jjwt-impl`, `jjwt-jackson` 0.12.6 추가 후 Gradle Reload |
| 환경변수 | IntelliJ 실행 구성에 `JWT_SECRET`, `JWT_ACCESS_EXPIRATION=3600` 추가 |
| 설정 | `application.yaml`에 `jwt.secret`, `jwt.access-expiration`을 환경변수로 연결 |
| 예외 | `ApiException(status, code, message)`을 만들고 `GlobalExceptionHandler`에 핸들러 추가 |
- 비밀키는 코드에 직접 쓰지 않고 환경변수로만 관리했다.
- 실행 로그의 classpath에 jjwt jar 3개가 올라온 것으로 의존성 적용을 확인했다.

#### 2. 구현 내용

| 실습 | 구현 | 핵심 |
| --- | --- | --- |
| 1. 로그인 | `AuthService`, `AuthController`, `JwtUtil` | `findByEmail`로 회원을 찾고 `passwordEncoder.matches()`로 비교한 뒤 Access Token 발급 |
| 2. 관문 | `AuthInterceptor`, `WebConfig` | `Bearer`  토큰을 검증해 memberId를 요청에 담음. 전부 잠그고 필요한 경로만 예외로 연다 |
| 3. 내 정보 조회 | `GET /members/me` | `@RequestAttribute`로 memberId를 받아 조회 |
| 4. 내 정보 수정 | `PATCH /members/me` | `existsByNicknameAndMemberIdNot`으로 본인을 제외하고 닉네임 중복 검사 |
| 5. 평점 리팩토링 | `/ratings`, `/ratings/{ratingId}` | URL에서 memberId를 제거하고 토큰에서 추출. `findOwnedRating`으로 소유권 검증 |
| 6. 401·403 | Postman 시나리오 | 인증 실패와 인가 실패를 서로 다른 코드로 확인 |

**로그인 실패 메시지 통일**

- 이메일이 없을 때와 비밀번호가 틀렸을 때 모두 `AUTH401_1` "이메일 또는 비밀번호가 올바르지 않습니다."를 반환한다.
- 이렇게 해야 가입된 이메일인지 아닌지를 외부에서 알아낼 수 없다.

**인증과 인가의 분담**

- 인증(토큰 검사)은 `AuthInterceptor`가 모든 요청에 공통으로 처리한다 → 401
- 인가(내 평점인지)는 `RatingService.findOwnedRating`이 기능별로 처리한다 → 403
- 판단 순서는 401 → 404 → 403이다.

#### 3. 토큰 확인 (jwt.io)

| 항목 | 값 | 확인 내용 |
| --- | --- | --- |
| Header | `{"alg":"HS384"}` | 키가 48자를 넘어서 jjwt가 HS384를 선택함 |
| Payload | `sub: "6"`, `email: "b@umc.com"` | 가입한 회원의 memberId와 일치 |
| `exp - iat` | 3600 | 유효시간 1시간이 적용됨 |
| Signature | 비밀키 입력 전 Invalid, 입력 후 Verified | 디코딩과 서명 검증이 다르다는 것을 확인 |
- 비밀키 없이도 payload가 그대로 보였다. 그래서 payload에는 비밀번호 같은 민감한 정보를 넣지 않는다.

#### 4. Postman 시나리오 결과

| 순서 | 요청 | 토큰 | 결과 |
| --- | --- | --- | --- |
| 1 | `POST /auth/login` | - | 200, accessToken 발급 |
| 2 | `GET /members/me` | 없음 | 401 `AUTH401_2` |
| 3 | `POST /ratings` | A | 201 `COMMON201` |
| 4 | `POST /ratings` (같은 movieId) | A | 409 `RATING409_1` |
| 5 | `PATCH /ratings/{id}` | A | 200 `COMMON200` |
| 6 | `PATCH /ratings/{id}` | **B** | **403 `RATING403_1`** |
| 7 | `PATCH /ratings/{id}` | 없음 | 401 `AUTH401_2` |
| 8 | `DELETE /ratings/99999` | A | 404 `RATING404_1` |
| 9 | `DELETE /ratings/{id}` | A | 200 `COMMON200` |
- 6번은 토큰이 정상인데도 막혔다. 인증은 통과했지만 인가에서 걸린 것이다.
- 평점 등록 요청 바디에는 memberId가 없다. 요청자는 서버가 토큰에서 알아낸다.