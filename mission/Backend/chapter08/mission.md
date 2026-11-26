### 1. 즐겨찾기 엔티티와 Repository 등록

`Favorite` 엔티티에 회원과 영화 ID를 연결했다. `(member_id, movie_id)`에 복합 UNIQUE 제약을 적용해 같은 회원이 같은 영화를 두 번 즐겨찾기할 수 없도록 했다.

```tsx
@Entity('favorite')
@Unique('uk_favorite_member_movie', ['member', 'movieId'])
export class Favorite extends BaseTimeEntity {
  @PrimaryGeneratedColumn({ name: 'favorite_id', type: 'bigint' })
  favoriteId: number;

  @ManyToOne(() => Member, { nullable: false })
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @Column({ name: 'movie_id', type: 'bigint' })
  movieId: number;
}
```

`AppModule`에서 `TypeOrmModule.forFeature([Member, Rating, Favorite])`로 Repository를 등록하고, `FavoriteService`에서 주입받아 사용했다.

### 2. 토큰 기반 즐겨찾기 API 구현

`FavoriteController`에 `AuthGuard`를 적용해 등록·목록 조회·상태 조회·해제 요청을 보호했다. 요청의 URL·Body·쿼리에는 `memberId`를 받지 않고, 가드가 토큰을 검증한 뒤 요청 객체에 넣은 회원 ID를 사용했다.

```tsx
const payload = await this.jwtService.verifyAsync<{
  sub: string;
  email: string;
}>(token);

request.memberId = Number(payload.sub);
```

등록 전에 해당 회원이 같은 영화를 즐겨찾기했는지 조회하고, 이미 등록된 경우 `409 FAVORITE409_1`을 반환했다.

```tsx
const existing = await this.favoriteRepository.findOne({
  where: { member: { memberId }, movieId: dto.movieId },
});

if (existing) {
  throw new ApiException(
    HttpStatus.CONFLICT,
    'FAVORITE409_1',
    '이미 이 영화를 즐겨찾기하셨습니다.',
  );
}
```

상태 조회는 즐겨찾기한 기록이 없어도 `200`과 `isFavorite: false`를 반환한다. 해제에 성공하면 `200`과 `result: null`을 반환하고, 해제할 기록이 없으면 `404 FAVORITE404_1`을 반환한다.

### 3. 평점과 즐겨찾기를 한 트랜잭션에서 저장

`POST /movie-records`에서는 같은 트랜잭션의 `manager`에서 평점과 즐겨찾기 Repository를 가져왔다. 아래는 회원과 중복 여부를 확인한 뒤 실행하는 저장 부분이다.

```tsx
const rating = await ratings.save(
  ratings.create({
    member,
    movieId: dto.movieId,
    score: dto.score,
    comment: dto.comment ?? null,
  }),
);

let favorite: FavoriteResponseDto | null = null;
if (dto.addToFavorites) {
  const saved = await favorites.save(
    favorites.create({ member, movieId: dto.movieId }),
  );
  favorite = FavoriteResponseDto.from(saved);
}

return MovieRecordResponseDto.of(RatingResponseDto.from(rating), favorite);
```

두 저장을 `DataSource.transaction()` 안에서 실행해, 즐겨찾기 저장에 실패하면 먼저 저장한 평점도 롤백되도록 했다. `addToFavorites`가 `false`이면 평점만 저장하고 `result.favorite`에 `null`을 반환한다.

!image.png

!image.png

!image.png

!image.png

!image.png

!image.png
