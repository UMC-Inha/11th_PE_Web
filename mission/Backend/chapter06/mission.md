1. API 명세

| 기능 | Method | 경로 | 요청 Body | 성공 | 실패 |
| --- | --- | --- | --- | --- | --- |
| 회원가입 | POST | /members | email, password, nickname | 201 | 400, 409 |
| 평점 등록 | POST | /members/{memberId}/ratings | movieId, score, comment | 201 (result: ratingId) | 400, 404, 409 |
| 평점 수정 | PATCH | /members/{memberId}/ratings/{ratingId} | score, comment | 200 | 400, 403, 404 |
| 평점 삭제 | DELETE | /members/{memberId}/ratings/{ratingId} | 없음 | 204 | 403, 404 |
1. Postman 또는 화면 요청/응답 캡처

   → 실습 인증

2. 핵심 코드 링크
    - `SignUpRequest` (검증 애노테이션)
    - `MemberService.signUp` (중복 확인, bcrypt 저장)
    - `ApiResponse`, `GlobalExceptionHandler` (일관된 응답)
    - `RatingService` (`create`, `update`, `delete`, `findOwnedRating`)
    - `RatingController`
3. ⚡이슈 No.1
   **`이슈`**
   👉 `PasswordConfig.java`에서 `org.springframework.security` 패키지를 찾을 수 없다는 `Cannot resolve symbol 'security'` 오류가 발생했다.
   **`문제`**
   👉 `build.gradle`에 `spring-security-crypto` 의존성을 추가했지만 IntelliJ가 Gradle 변경 사항을 반영하지 않아 라이브러리가 인식되지 않았다. 터미널의 `BUILD SUCCESSFUL`은 Gradle 태스크만 실행된 것이라 IDE 인덱스에는 영향이 없었다.
   **`해결`**
   👉 Gradle 탭에서 Reload All Gradle Projects를 실행해 의존성을 다시 동기화했고, 이후 빨간 줄이 사라졌다.