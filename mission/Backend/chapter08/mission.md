1. POST /favorites 성공 응답
   !(images\image (13).png)

2. 중복 오류 응답
   !(images\image (14).png)

3. GET /favorites의 목록 응답
   !(images\image (15).png)

4. GET /favorites/{movieId}의 여부 응답
   !(images\image (16).png)

5. DELETE /favorites/{movieId}의 해제 응답
   !(images\image (17).png)

6. POST /movie-records 성공 응답
   !(images\image (18).png)

7. 트랜잭션 코드

```java
 // 1. 중복 평점/즐겨찾기 검증
 // 2. Rating 저장
 // 3. (옵션) Favorite 저장
 // 4. 두 결과를 묶어 반환
 @Transactional
    public MovieRecordResponse create(Long memberId, CreateMovieRecordRequest request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "MEMBER404_1",
                        "해당 회원을 찾을 수 없습니다."));

        if (ratingRepository.existsByMember_MemberIdAndMovieId(memberId, request.movieId())) {
            throw new ApiException(HttpStatus.CONFLICT, "RATING409_1",
                    "이미 이 영화에 평점을 남기셨습니다.");
        }

        if (request.addToFavorites()
                && favoriteRepository.existsByMember_MemberIdAndMovieId(memberId, request.movieId())) {
            throw new ApiException(HttpStatus.CONFLICT, "FAVORITE409_1",
                    "이미 이 영화를 즐겨찾기하셨습니다.");
        }

        Rating rating = Rating.builder()
                .member(member)
                .movieId(request.movieId())
                .score(request.score())
                .comment(request.comment())
                .build();
        Rating savedRating = ratingRepository.save(rating);

        FavoriteResponse favoriteResponse = null;
        if (request.addToFavorites()) {
            Favorite favorite = Favorite.builder()
                    .member(member)
                    .movieId(request.movieId())
                    .build();
            Favorite savedFavorite = favoriteRepository.save(favorite);
            favoriteResponse = FavoriteResponse.from(savedFavorite);
        }

        return new MovieRecordResponse(
                RatingResponse.from(savedRating),
                favoriteResponse
        );
    }
```
