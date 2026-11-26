# 실습 인증
<img width="612" height="687" alt="image" src="https://github.com/user-attachments/assets/a8e6aa0f-b769-4c08-b521-7870991a13e2" />

<img width="927" height="531" alt="image2" src="https://github.com/user-attachments/assets/fadb0028-d535-4bb2-ae4b-3110bce6297b" />

<img width="931" height="717" alt="image3" src="https://github.com/user-attachments

<img width="617" height="287" alt="image7" src="https://github.com/user-attachments/assets/7419cf5b-c97e-4661-82a0-3cbd3e87b3e7" />

<img width="602" height="281" alt="image8" src="https://github.com/user-attachments/assets/7ea1e587-b11a-4f4c-8779-3d5c4ada5b88" />

<img width="622" height="415" alt="image9" src="https://github.com/user-attachments/assets/58554264-4a77-4e9f-8494-003976751d8c" />

<img width="922" height="675" alt="image4" src="https://github.com/user-attachments/assets/cded6c89-a7c2-4484-b1c6-85cf46429c0b" />

<img width="930" height="692" alt="image5" src="https://github.com/user-attachments/assets/38da64a5-b0fd-405f-80a4-91a9c4eb6773" />

<img width="587" height="261" alt="image6" src="https://github.com/user-attachments/assets/fdcd6ae7-1808-4ff1-b02f-649ea50a0a58" />

---
# 미션 기록

**1. Swagger에 API 설명과 인증 정보 추가**

평점 등록·수정·삭제, 회원별 평점 조회, 내 정보 조회·수정, 즐겨찾기 조회·해제 API에 한 줄 설명과 토큰 필요 여부를 표시했다. 회원별 평점 조회는 공개 API이고, 내 정보와 즐겨찾기 API, 평점 등록·수정·삭제에는 Bearer 토큰이 필요하다. 실패 응답에는 HTTP 상태와 서비스 오류 코드를 함께 기록했다.

```tsx
@ApiOperation({ summary: '영화에 평점을 등록합니다 · 토큰 필요' })
@ApiAuthRequired()
@ApiResponse({ status: 201, description: 'COMMON201 · 평점 등록 성공' })
@ApiResponse({
  status: 409,
  description: 'RATING409_1 · 같은 영화에 이미 평점을 남겼습니다.',
})
```

**2. 평점 Service 단위 테스트 2개 작성**

Repository를 모의 객체로 주입해 중복 등록과 다른 회원의 평점 수정이 차단되는지 확인했다. 예외의 상태와 코드를 비교하고, 실패 시 저장이나 갱신이 호출되지 않는지도 검사했다.

```tsx
await expect(service.create(1, { movieId: 550, score: 4 }))
  .rejects.toMatchObject({ status: 409, code: 'RATING409_1' });
expect(ratings.save).not.toHaveBeenCalled();

await expect(service.update(1, 10, { score: 3 }))
  .rejects.toMatchObject({ status: 403, code: 'RATING403_1' });
expect(ratings.update).not.toHaveBeenCalled();
```

**3. 평점 등록 통합 테스트 2개 작성**

Supertest로 `POST /ratings`를 호출하고, 메모리 SQLite에서 저장 결과까지 확인했다. 토큰이 없으면 `401 AUTH401_2`를 반환하고 평점을 저장하지 않았다. 유효한 토큰을 보내면 `201 COMMON201`을 반환하고 토큰의 회원에게 평점을 저장했다.

```tsx
await request(app.getHttpServer())
  .post('/ratings')
  .send({ movieId: 550, score: 4 })
  .expect(401);

await request(app.getHttpServer())
  .post('/ratings')
  .set('Authorization', 'Bearer ' + accessToken)
  .send({ movieId: 155, score: 5, comment: '다시 보고 싶은 영화' })
  .expect(201);
```

새로 작성한 평점 테스트 4개와 기존 즐겨찾기 테스트 6개를 함께 실행해 **총 10개가 모두 통과**했다.

<img width="927" height="777" alt="1" src="https://github.com/user-attachments/assets/cc03fcaa-3702-428c-8145-9f76005e3971" />

<img width="642" height="662" alt="2" src="https://github.com/user-attachments/assets/d96bfe7c-295f-4f27-9bd2-90e871f70c9c" />