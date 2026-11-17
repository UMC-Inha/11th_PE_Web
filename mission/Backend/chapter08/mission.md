![post favorites.png](images/post%20favorites.png)
![get favorites.png](images/get%20favorites.png)
![get favorites{movieId}.png](images/get%20favorites%7BmovieId%7D.png)
![delete favorites.png](images/delete%20favorites.png)
![영화기록중복저장.png](images/%EC%98%81%ED%99%94%EA%B8%B0%EB%A1%9D%EC%A4%91%EB%B3%B5%EC%A0%80%EC%9E%A5.png)
![POST movie-records.png](images/POST%20movie-records.png)
```java
//성공 응답
{
    "isSuccess": true,
    "code": "COMMON201",
    "message": "영화 기록을 저장하였습니다.",
    "result": {
        "rating": {
            "ratingId": 6,
            "movieId": 238,
            "score": 5,
            "comment": "다시 보고 싶은 영화입니다.",
            "createdAt": "2026-11-16T23:44:27.958013",
            "updatedAt": "2026-11-16T23:44:27.958013"
        },
        "favorite": {
            "favoriteId": 2,
            "movieId": 238,
            "createdAt": "2026-11-16T23:44:28.079618"
        }
    }
}
```

```java
//핵심코드
package com.umc.movie.service;

import com.umc.movie.dto.req.CreateMovieRecordRequest;
import com.umc.movie.dto.res.FavoriteResponse;
import com.umc.movie.dto.res.MovieRecordResponse;
import com.umc.movie.dto.res.RatingResponse;
import com.umc.movie.entity.Favorite;
import com.umc.movie.entity.Member;
import com.umc.movie.entity.Rating;
import com.umc.movie.exception.ApiException;
import com.umc.movie.repository.FavoriteRepository;
import com.umc.movie.repository.MemberRepository;
import com.umc.movie.repository.RatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MovieRecordService {

    private final MemberRepository memberRepository;
    private final RatingRepository ratingRepository;
    private final FavoriteRepository favoriteRepository;

    @Transactional
    public MovieRecordResponse create(Long memberId, CreateMovieRecordRequest request) {
        Member member = memberRepository.findById(memberId).orElseThrow(
                ()->new ApiException(HttpStatus.NOT_FOUND, "MEMBER404_1",
                        "해당 회원을 찾을 수 없습니다.")
        );

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
            favoriteResponse = favoriteResponse.from(savedFavorite);
        }

        return new MovieRecordResponse(RatingResponse.from(rating), favoriteResponse);
    }
}

```

![스크린샷 2026-11-16 235030.png](images/%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7%202026-11-16%20235030.png)
![스크린샷 2026-11-16 235745.png](images/%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7%202026-11-16%20235745.png)
![스크린샷 2026-11-16 235818.png](images/%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7%202026-11-16%20235818.png)