# chapter06

## 1. 구현 내용

6주차 실습에서 영화 평점 서비스에 회원가입 API와 평점 등록, 수정, 삭제 API를 구현하였다.

회원가입 시 이메일, 닉네임, 비밀번호의 유효성을 검증하고, 비밀번호는 bcrypt로 해시 처리하여 데이터베이스에 저장하도록 구현하였다. 응답 DTO에는 비밀번호를 포함하지 않도록 구성하였다.

평점 API에서는 중복 등록을 방지하고, 수정 및 삭제 시 요청한 회원 ID와 실제 평점 작성자를 비교하도록 구현하였다.

또한 `GlobalExceptionHandler`를 통해 잘못된 입력, 중복 요청, 접근 권한 오류, 존재하지 않는 데이터에 대한 실패 응답을 공통 형식으로 처리하였다.

## 2. Entity 및 Repository

기존 `Member`와 `Rating` Entity를 활용하고, 회원가입과 평점 등록 및 수정에 필요한 기능을 추가하였다.

**Rating Entity - 평점 생성 및 수정**

```java
@Builder
public Rating(Member member, Long movieId, Integer score, String comment) {
    this.member = member;
    this.movieId = movieId;
    this.score = score;
    this.comment = comment;
}

public void update(Integer score, String comment) {
    this.score = score;
    this.comment = comment;
}
```

`@Builder`를 사용하여 새로운 평점 객체를 생성하고, `update()` 메서드를 통해 기존 평점의 별점과 후기를 수정하도록 구현하였다.

또한 회원과 영화의 조합에 UNIQUE 제약을 설정하여 동일한 회원이 같은 영화에 평점을 중복 등록하지 못하도록 하였다.

**RatingRepository - 중복 평점 확인**

```java
public interface RatingRepository extends JpaRepository<Rating, Long> {

    List<Rating> findByMember_MemberIdOrderByRatingIdDesc(Long memberId);

    boolean existsByMember_MemberIdAndMovieId(Long memberId, Long movieId);
}
```

`existsByMember_MemberIdAndMovieId()`를 사용하여 특정 회원이 해당 영화에 이미 평점을 등록했는지 확인하도록 구현하였다.

## 3. DTO 및 Service

### 3-1. 회원가입 DTO 및 비밀번호 암호화

회원가입 요청에는 이메일, 닉네임, 비밀번호에 대한 검증 규칙을 적용하였다.

- 이메일: `@Email`을 통한 이메일 형식 검증
- 닉네임: `@Size`를 통한 길이 검증
- 비밀번호: `@Pattern`을 통한 비밀번호 형식 검증

비밀번호는 `BCryptPasswordEncoder`를 사용하여 해시 처리한 뒤 저장하도록 구현하였다.

회원가입 성공 시에는 회원 ID, 이메일, 닉네임만 응답하도록 구성하여 비밀번호가 노출되지 않도록 하였다.

### 3-2. 평점 요청 DTO

평점 등록과 수정 요청을 구분하기 위해 `CreateRatingRequest`, `UpdateRatingRequest`를 사용하였다.

**CreateRatingRequest - 평점 등록 요청 검증**

```java
public record CreateRatingRequest(
        @NotNull(message = "영화 ID를 입력해주세요.")
        @Positive(message = "영화 ID는 양수여야 합니다.")
        Long movieId,

        @NotNull(message = "별점을 입력해주세요.")
        @Min(value = 1, message = "별점은 1점 이상이어야 합니다.")
        @Max(value = 5, message = "별점은 5점 이하여야 합니다.")
        Integer score,

        @Size(max = 500, message = "후기는 500자 이하로 입력해주세요.")
        String comment
) {}
```

별점은 1~5점 사이로 제한하고, 후기는 최대 500자까지 입력할 수 있도록 검증하였다.

수정 요청에서도 동일한 별점 및 후기 검증 규칙을 적용하였다.

### 3-3. RatingService - 평점 등록 및 소유자 확인

Service에서는 Repository를 통해 회원과 평점을 조회하고, 등록·수정·삭제 기능을 처리하도록 구현하였다.

**RatingService - 평점 중복 등록 방지**

```java
@Transactional
public Long create(Long memberId, CreateRatingRequest request) {
    Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "존재하지 않는 유저입니다."));

    if (ratingRepository.existsByMember_MemberIdAndMovieId(memberId, request.movieId())) {
        throw new IllegalArgumentException("이미 이 영화에 평점을 남기셨습니다.");
    }

    Rating rating = Rating.builder()
            .member(member)
            .movieId(request.movieId())
            .score(request.score())
            .comment(request.comment())
            .build();

    return ratingRepository.save(rating).getRatingId();
}
```

이미 평점을 등록한 영화에 다시 등록을 요청하면 예외를 발생시켜 중복 저장을 방지하였다.

**RatingService - 평점 소유자 검증**

```java
private Rating findOwnedRating(Long ratingId, Long memberId) {
    Rating rating = ratingRepository.findById(ratingId)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "존재하지 않는 평점입니다."));

    if (!rating.getMember().getMemberId().equals(memberId)) {
        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "본인이 작성한 평점만 수정하거나 삭제할 수 있습니다.");
    }

    return rating;
}
```

평점 수정 및 삭제 전에 작성자를 확인하여 다른 회원이 작성한 평점에 접근하지 못하도록 처리하였다.

## 4. Controller 및 API 명세

회원가입과 평점 등록, 수정, 삭제를 위한 API를 구현하였다.

| HTTP Method | API | 기능 | 성공 응답 |
| --- | --- | --- | --- |
| POST | `/members` | 회원가입 | 201 Created |
| GET | `/members/{memberId}/ratings` | 회원별 평점 목록 조회 | 200 OK |
| POST | `/members/{memberId}/ratings` | 평점 등록 | 201 Created |
| PATCH | `/members/{memberId}/ratings/{ratingId}` | 평점 수정 | 200 OK |
| DELETE | `/members/{memberId}/ratings/{ratingId}` | 평점 삭제 | 204 No Content |

**RatingController - 평점 등록**

```java
@PostMapping("/{memberId}/ratings")
public ResponseEntity<ApiResponse<Long>> create(
        @PathVariable Long memberId,
        @Valid @RequestBody CreateRatingRequest request
) {
    Long ratingId = ratingService.create(memberId, request);
    return ResponseEntity.status(201)
            .body(ApiResponse.created("평점 등록에 성공했습니다.", ratingId));
}
```

**RatingController - 평점 수정**

```java
@PatchMapping("/{memberId}/ratings/{ratingId}")
public ResponseEntity<ApiResponse<Void>> update(
        @PathVariable Long memberId,
        @PathVariable Long ratingId,
        @Valid @RequestBody UpdateRatingRequest request
) {
    ratingService.update(ratingId, memberId, request);
    return ResponseEntity.ok(
            ApiResponse.ok("평점 수정에 성공했습니다.", null));
}
```

**RatingController - 평점 삭제**

```java
@DeleteMapping("/{memberId}/ratings/{ratingId}")
public ResponseEntity<Void> delete(
        @PathVariable Long memberId,
        @PathVariable Long ratingId
) {
    ratingService.delete(ratingId, memberId);
    return ResponseEntity.noContent().build();
}
```

Controller에서는 `@Valid`를 사용하여 요청 DTO의 유효성을 검증하고, 처리 결과에 맞는 HTTP 상태 코드를 반환하도록 구성하였다.

## 5. 공통 응답 및 예외 처리

`ApiResponse`를 사용하여 성공과 실패 응답의 구조를 통일하였다.

**ApiResponse - 공통 응답 DTO**

```java
public record ApiResponse<T>(
        boolean isSuccess,
        String code,
        String message,
        T result
) {
    public static <T> ApiResponse<T> created(String message, T result) {
        return new ApiResponse<>(true, "COMMON201", message, result);
    }

    public static <T> ApiResponse<T> ok(String message, T result) {
        return new ApiResponse<>(true, "COMMON200", message, result);
    }

    public static ApiResponse<Void> failure(String code, String message) {
        return new ApiResponse<>(false, code, message, null);
    }
}
```

`GlobalExceptionHandler`에서는 유효성 검증 실패, 중복 요청, 존재하지 않는 데이터 및 권한 오류를 처리하도록 구현하였다.

| HTTP 상태 코드 | 발생 상황 |
| --- | --- |
| 400 Bad Request | 이메일 형식 오류, 잘못된 별점 |
| 403 Forbidden | 다른 회원의 평점 수정 또는 삭제 |
| 404 Not Found | 존재하지 않는 회원 또는 평점 |
| 409 Conflict | 중복 회원가입 또는 중복 평점 등록 |

삭제 성공 시에는 응답 본문 없이 `204 No Content`를 반환하도록 구현하였다.

## 6. 실행 결과

### 6-1. 회원가입 API 테스트

**POST /members - 회원가입 성공 (201 Created)**

정상적인 이메일, 닉네임, 비밀번호로 회원가입을 요청한 결과 `201 Created`가 반환되었으며, 응답에 비밀번호가 포함되지 않는 것을 확인하였다.

!image.png

**MySQL - 회원가입 비밀번호 bcrypt 해시 저장 확인**

회원가입 후 MySQL에서 회원 정보를 조회한 결과, 비밀번호가 평문이 아닌 bcrypt 해시 형태로 저장된 것을 확인하였다.

!image.png

**POST /members - 잘못된 이메일 형식 (400 Bad Request)**

이메일 형식에 맞지 않는 값을 입력한 경우 `400 Bad Request`와 오류 메시지가 반환되는 것을 확인하였다.

!image.png

### 6-2. 평점 등록 및 수정 API 테스트

**POST /members/1/ratings - 평점 등록 성공 (201 Created)**

영화 ID, 별점, 후기를 전달하여 새로운 평점을 등록하고, 생성된 평점 ID가 반환되는 것을 확인하였다.

!image.png

**POST /members/1/ratings - 중복 평점 등록 (409 Conflict)**

동일한 회원이 같은 영화에 다시 평점을 등록한 경우 `409 Conflict`가 반환되는 것을 확인하였다.

!image.png

**POST /members/1/ratings - 잘못된 별점 입력 (400 Bad Request)**

별점에 허용 범위를 벗어난 6점을 입력한 경우 `400 Bad Request`가 반환되는 것을 확인하였다.

!image.png

**PATCH /members/1/ratings/4 - 평점 수정 성공 (200 OK)**

기존 평점의 별점과 후기를 수정하고, 조회 API를 통해 변경된 내용이 반영된 것을 확인하였다.

!image.png

**GET /members/1/ratings - 수정된 평점 조회 (200 OK)**

평점 수정 후 조회 API를 호출하여 평점 ID 4번의 별점이 5점에서 3점으로 변경되고, 후기도 정상적으로 수정된 것을 확인하였다.

!image.png

### 6-3. 평점 삭제 API 테스트

**DELETE /members/1/ratings/4 - 평점 삭제 성공 (204 No Content)**

평점 삭제 요청 시 `204 No Content`가 반환되었으며, 이후 조회 결과에서 삭제된 평점이 제외된 것을 확인하였다.

!image.png

**GET /members/1/ratings - 평점 삭제 후 조회 (200 OK)**

평점 삭제 후 조회 API를 호출하여 평점 ID 4번이 목록에서 제외되고, 평점 개수가 3개에서 2개로 감소한 것을 확인하였다.

!image.png

### 6-4. 평점 접근 권한 및 예외 처리 테스트

**PATCH /members/2/ratings/2 - 다른 회원의 평점 수정 (403 Forbidden)**

평점 작성자와 요청 회원 ID가 일치하지 않는 경우 `403 Forbidden`이 반환되는 것을 확인하였다.

!image.png

**DELETE /members/2/ratings/2 - 다른 회원의 평점 삭제 (403 Forbidden)**

다른 회원이 작성한 평점을 삭제하려고 한 경우에도 `403 Forbidden`이 반환되는 것을 확인하였다.

!image.png

**PATCH /members/1/ratings/99999 - 존재하지 않는 평점 수정 (404 Not Found)**

존재하지 않는 평점 ID로 수정 요청을 보낸 경우 `404 Not Found`가 반환되는 것을 확인하였다.

!image.png

**DELETE /members/1/ratings/99999 - 존재하지 않는 평점 삭제 (404 Not Found)**

존재하지 않는 평점을 삭제하려고 한 경우에도 `404 Not Found`가 반환되는 것을 확인하였다.

!image.png
