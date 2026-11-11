#### api 명세

- 회원 api

![스크린샷 2026-11-05 143058.png](images/%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7%202026-11-05%20143058.png)

- 평점 api

![스크린샷 2026-11-05 143251.png](images/%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7%202026-11-05%20143251.png)

![스크린샷 2026-11-05 143301.png](images/%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7%202026-11-05%20143301.png)

![스크린샷 2026-11-05 143319.png](images/%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7%202026-11-05%20143319.png)

#### postman

**실습 인증**

+

- 중복 평점
![스크린샷 2026-11-05 142238.png](images/%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7%202026-11-05%20142238.png)

- 잘못된 별점

![스크린샷 2026-11-05 142311.png](images/%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7%202026-11-05%20142311.png)

- 다른 회원의 평점 수정

![스크린샷 2026-11-05 142423.png](images/%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7%202026-11-05%20142423.png)

- 존재하지 않는 평점

![스크린샷 2026-11-05 142523.png](images/%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7%202026-11-05%20142523.png)

#### 핵심코드

```java
    @PostMapping("/{memberId}/ratings")
    public ResponseEntity<ApiResponse<Long>> create(
            @PathVariable Long memberId,
            @Valid @RequestBody CreateRatingRequest request
            ){
        Long ratingId = ratingService.create(memberId, request);
        return ResponseEntity.status(201).body(ApiResponse.created("평점 등록에 성공했습니다.", ratingId));
    }

    @PatchMapping("/{memberId}/ratings/{ratingId}")
    public ResponseEntity<ApiResponse<Void>> update(
            @PathVariable Long memberId,
            @PathVariable Long ratingId,
            @Valid @RequestBody UpdateRatingRequest request
    ){
        ratingService.update(memberId, ratingId, request);
        return ResponseEntity.ok(ApiResponse.ok("평점 수정에 성공했습니다.", null));
    }

    @DeleteMapping("/{memberId}/ratings/{ratingId}")
    public ResponseEntity<Void> delete(@PathVariable Long memberId, @PathVariable Long ratingId) {
        ratingService.delete(ratingId, memberId);
        return ResponseEntity.noContent().build();
    }
```

```java
package com.umc.movie.dto;

import jakarta.validation.constraints.*;

public record CreateRatingRequest(
        @NotNull(message = "영화 ID를 입력해주세요.")
        @Positive(message = "영화 ID는 양수여야 합니다.")
        Long movieId,

        @NotNull(message = "별점을 입력해주세요.")
        @Min(value=1, message = "별점은 1점 이상이어야 합니다.")
        @Max(value=5, message = "별점은 5점 이하여야 합니다.")
        Integer score,

        @Size(max=500, message = "후기는 500자 이하로 입력해주세요.")
        String comment
) {
}

```

```java
    @Transactional
    public Long create(Long memberId, CreateRatingRequest request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 유저입니다."));

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

    @Transactional
    public void update(Long ratingId, Long memberId, UpdateRatingRequest request) {
        Rating rating = findOwnedRating(ratingId, memberId);

        rating.update(request.score(), request.comment());
        ratingRepository.save(rating);
    }

    @Transactional
    public void delete(Long ratingId, Long memberId) {
        Rating rating = findOwnedRating(ratingId, memberId);

        ratingRepository.delete(rating);
    }

    private Rating findOwnedRating(Long ratingId, Long memberId) {
        Rating rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 평점입니다."));

        if (!rating.getMember().getMemberId().equals(memberId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인이 작성한 평점만 수정하거나 삭제할 수 있습니다.");
        }

        return rating;
    }
```

#### 트러블 슈팅

- path variable 적을 때 `@PatchMapping("/**{memberId]**/ratings/{ratingId}")` }를 ]로 작성해서 실행 실패가 발생했는데 수정하였다