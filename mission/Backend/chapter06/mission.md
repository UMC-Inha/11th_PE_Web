- **미션 기록**

  API 명세

  | 기능 | 메소드 | URL | 요청 Body | 성공 응답 |
      | --- | --- | --- | --- | --- |
  | 회원가입 | POST | /members | email, password,nickname | 201 Created, memberId, email, nickname |
  | 평점 등록 | POST | /members/{memberID}/ratings | movieId,score,comment | 201 Created result: ratingId |
  | 평점 수정 | PATCH | /members/{memberID}/ratings/{ratingId} | score, comment | 200 OK |
  | 평점 삭제 | DELETE | /members/{memberID}/ratings/{ratingId} |  | 204 No Content |

  회원가입 실패

![image1.png](images/image1.png)

  회원가입 성공(비밀번호가 응답에 없다)

![image2.png](images/image2.png)

  이메일 중복

![image3.png](images/image3.png)

  평점 등록

![image4.png](images/image4.png)

  평점 수정

![image5.png](images/image5.png)

  잘못된 평점

![image6.png](images/image6.png)

  평점 삭제(204 No Content로 요청 처리 성공 후 본문 없음)
  
![image7.png](images/image7.png)