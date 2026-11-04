- **미션 기록**

  **API 명세**

    - 회원가입 — POST /members

      **요청**

      | 필드 | 타입 | 필수 | 조건 |
              | --- | --- | --- | --- |
      | email | String | O | 공백 불가, 이메일 형식, 중복 불가 |
      | password | String | O | 공백 불가, 8자 이상, 영문 대문자·소문자·숫자·특수문자 포함 |
      | nickname | String | O | 공백 불가, 2~12자, 중복 불가 |

        ```json
        {
          "email": "member1@example.com",
          "password": "Member!1234",
          "nickname": "멤버1"
        }
        ```

      **성공 응답 — 201 Created**

        ```json
        {
          "isSuccess": true,
          "code": "COMMON201",
          "message": "회원가입에 성공했습니다",
          "result": {
            "memberId": 3,
            "email": "member1@example.com",
            "nickname": "멤버1"
          }
        }
        ```

      **실패 응답**

      | HTTP 상태 | code | 조건 / message |
              | --- | --- | --- |
      | 400 | COMMON4001 | 입력 검증 실패, 첫 번째 필드 오류 메시지 반환 |
      | 409 | COMMON4092 | 이메일 중복: 이미 사용중인 이메일입니다. |
      | 409 | COMMON4092 | 닉네임 중복: 이미 사용중인 닉네임입니다. |
      | 409 | COMMON4091 | DB 제약 위반: 이미 존재하는 데이터입니다. |

        ```json
        {
          "isSuccess": false,
          "code": "COMMON4092",
          "message": "이미 사용중인 이메일입니다.",
          "result": null
        }
        ```

      !image.png

    - 평점 등록 — POST /members/{memberId}/ratings

      **경로 변수**

      | 이름 | 타입 | 의미 |
              | --- | --- | --- |
      | memberId | Long | 평점을 작성할 회원 ID |

      **요청 본문**

      | 필드 | 타입 | 필수 | 조건 |
              | --- | --- | --- | --- |
      | movieId | Long | O | 양수, TMDB 영화 ID |
      | score | Integer | O | 1~5 |
      | comment | String | X | 최대 500자, 생략 또는 null 허용 |

      요청 예시: `POST /members/3/ratings`

        ```json
        {
          "movieId": 550,
          "score": 5,
          "comment": "재밌게 본 영화"
        }
        ```

      **성공 응답 — 201 Created**

        ```json
        {
          "isSuccess": true,
          "code": "COMMON201",
          "message": "평점 등록에 성공했습니다.",
          "result": 7
        }
        ```

      **실패 응답**

      | HTTP 상태 | code | 조건 / message |
              | --- | --- | --- |
      | 400 | COMMON4001 | 영화 ID·별점·후기 검증 실패, 첫 번째 필드 오류 메시지 반환 |
      | 404 | COMMON404 | 회원 없음: 존재하지 않는 유저입니다. |
      | 409 | COMMON4092 | 중복 평점: 이미 이 영화에 평점을 남기셨습니다. |
      | 409 | COMMON4091 | DB 제약 위반: 이미 존재하는 데이터입니다. |

        ```json
        {
          "isSuccess": false,
          "code": "COMMON4092",
          "message": "이미 이 영화에 평점을 남기셨습니다.",
          "result": null
        }
        ```

      !image.png

    - 평점 수정 — PATCH /members/{memberId}/ratings/{ratingId}

      **경로 변수**

      | 이름 | 타입 | 의미 |
              | --- | --- | --- |
      | memberId | Long | 요청 회원 ID |
      | ratingId | Long | 수정할 평점 ID |

      **요청 본문**

      | 필드 | 타입 | 필수 | 조건 |
              | --- | --- | --- | --- |
      | score | Integer | O | 1~5 |
      | comment | String | X | 최대 500자 |

        ```json
        {
          "score": 4,
          "comment": "다시 보니 생각이 조금 달라짐"
        }
        ```

      **성공 응답 — 200 OK**

        ```json
        {
          "isSuccess": true,
          "code": "COMMON200",
          "message": "평점 수정에 성공했습니다.",
          "result": null
        }
        ```

      **실패 응답**

      | HTTP 상태 | code | 조건 / message |
              | --- | --- | --- |
      | 400 | COMMON4001 | 별점·후기 검증 실패, 첫 번째 필드 오류 메시지 반환 |
      | 403 | COMMON403 | 작성자 불일치: 본인이 작성한 평점만 수정하거나 삭제할 수 있습니다. |
      | 404 | COMMON404 | 평점 없음: 존재하지 않는 평점입니다. |

        ```json
        {
          "isSuccess": false,
          "code": "COMMON403",
          "message": "본인이 작성한 평점만 수정하거나 삭제할 수 있습니다.",
          "result": null
        }
        ```

      !image.png

    - 평점 삭제 — DELETE /members/{memberId}/ratings/{ratingId}

      **경로 변수**

      | 이름 | 타입 | 의미 |
              | --- | --- | --- |
      | memberId | Long | 요청 회원 ID |
      | ratingId | Long | 삭제할 평점 ID |

      **성공 응답 — 204 No Content**

      응답 본문 없음. 공통 성공 JSON도 반환하지 않는 구조.

      **실패 응답**

      | HTTP 상태 | code | 조건 / message |
              | --- | --- | --- |
      | 403 | COMMON403 | 작성자 불일치: 본인이 작성한 평점만 수정하거나 삭제할 수 있습니다. |
      | 404 | COMMON404 | 평점 없음: 존재하지 않는 평점입니다. |

        ```json
        {
          "isSuccess": false,
          "code": "COMMON404",
          "message": "존재하지 않는 평점입니다.",
          "result": null
        }
        ```

      !image.png


    **회원가입**
    
    DTO + `@Valid`로 이메일·닉네임·비밀번호 검증. 중복 검사 후 bcrypt 해시로 저장하고, 응답은 비밀번호를 제외한 `MemberResponse`로 분리.
    
    ```java
    .password(passwordEncoder.encode(request.password()))
    ```
    
    **평점 등록·수정·삭제**
    
    같은 회원·영화의 평점은 사전 중복 검사 + 복합 UNIQUE로 중복 저장 방지.
    
    ```java
    if (ratingRepository.existsByMember_MemberIdAndMovieId(memberId, request.movieId())) {
        throw new IllegalArgumentException("이미 이 영화에 평점을 남기셨습니다.");
    }
    ```
    
    수정·삭제는 `findOwnedRating`에서 평점 존재 여부(404)와 작성자 일치 여부(403)를 공통 확인한 뒤 처리.
    
    ```java
    if (!rating.getMember().getMemberId().equals(memberId)) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인이 작성한 평점만 수정하거나 삭제할 수 있습니다.");
    }
    ```
    
    **응답·예외 처리**
    
    `ApiResponse<T>`로 응답 형식 통일, `@RestControllerAdvice`에서 예외별 상태와 메시지 변환.
    
    - DTO 검증 실패 → 400
    - 중복 검사·DB 제약 위반 → 409
    - 다른 회원의 평점 → 403 / 없는 평점 → 404
    - 회원가입·평점 등록 → 201 / 수정 → 200 / 삭제 → 204, 본문 없음