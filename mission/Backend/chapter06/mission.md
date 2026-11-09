### 1. 비밀번호 암호화 — spring-security-crypto

Spring Security 전체를 쓰면 인증/인가 필터가 자동으로 붙어 모든 요청이 막힌다.
비밀번호 해시 기능만 필요하므로 `spring-security-crypto` 모듈만 의존성에 추가했다.
BCryptPasswordEncoder로 저장하고, 응답 DTO(MemberResponse)에는 password 필드를 포함하지 않았다.

### 2. 중복 평점 차단 — 사전 체크 + DB UNIQUE 제약

rating 테이블에 `(member_id, movie_id)` 복합 UNIQUE 제약을 걸어 DB 레벨에서 중복을 막았다.
그러나 DB 예외 메시지는 사용자에게 그대로 노출하면 안 되므로, 저장 전에
`existsByMember_MemberIdAndMovieId()`로 먼저 확인하고 `IllegalArgumentException`을 던졌다.
GlobalExceptionHandler가 이를 잡아 409 + 우리가 정한 메시지로 응답했다.

### 3. 403/404 처리 — findOwnedRating 메서드

평점 수정/삭제 모두 같은 검사(존재 확인 → 소유자 확인)가 필요하므로 `findOwnedRating()`으로 묶었다.

- 평점이 없으면 404
- 평점은 있지만 본인 것이 아니면 403

순서가 중요한데, 404를 먼저 체크하지 않으면 타인 평점에 접근할 때 403이 아닌
"없는 평점"처럼 보일 수 있기 때문에 반드시 존재 확인을 먼저 했다.

### 4. 일관된 에러 응답 — GlobalExceptionHandler

`@RestControllerAdvice`로 예외를 한 곳에서 처리했다.
모든 에러가 `ApiResponse` 형태(`isSuccess`, `code`, `message`, `result`)로 반환된다.

| 예외                            | 상태코드 | code           |
| ------------------------------- | -------- | -------------- |
| MethodArgumentNotValidException | 400      | COMMON4001     |
| DataIntegrityViolationException | 409      | COMMON4091     |
| IllegalArgumentException        | 409      | COMMON4092     |
| ResponseStatusException         | 그대로   | COMMON{status} |

### 5. DELETE 204 응답

삭제 성공 시 반환할 body가 없으므로 `ResponseEntity<Void>`와 `.noContent().build()`를 사용했다.
204는 body가 없는 것이 HTTP 표준이다.
