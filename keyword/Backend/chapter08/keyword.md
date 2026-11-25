- 트랜잭션(Transaction)

  #### **1. 여러 작업을 한 덩어리로 묶는 단위**

    - 트랜잭션은 함께 성공하거나 함께 취소되어야 하는 DB 작업들을 하나로 묶은 단위이다.
    - 쇼핑몰에서 결제와 주문 생성이 같이 되어야 하는 것처럼, 우리 서버에서는 영화 기록 저장(POST /movie-records)의 평점 저장과 즐겨찾기 저장이 한 덩어리이다.
    - 지금 우리 화면은 북마크 버튼(POST /favorites)과 평점 저장 버튼(POST /ratings)이 따로라서 요청도 따로이고, 묶을 것이 없다.
    - POST /movie-records는 평점 패널에 "즐겨찾기에도 추가" 체크박스가 있는 화면을 가정한 학습용 API이다. 저장 버튼 한 번에 요청 하나로 둘 다 해 달라고 하므로(addToFavorites: true), 이 요청 안의 두 저장을 묶는다.

  | **상황** | **트랜잭션이 없으면** | **트랜잭션이 있으면** |
      | --- | --- | --- |
  | 평점 저장 성공, 즐겨찾기 저장 성공 | 둘 다 남음 | 둘 다 남음 |
  | 평점 저장 성공, 즐겨찾기 저장 실패 | 평점만 남음 (사용자가 원한 기록과 다름) | 평점도 취소되어 아무것도 안 남음 |

  #### **2. 우리 코드에서**

    ```java
    @Transactional
    public MovieRecordResponse create(Long memberId, CreateMovieRecordRequest request) {
        // 회원 찾기, 평점 중복 검사, 즐겨찾기 중복 검사
        Rating savedRating = ratingRepository.save(rating);
    
        FavoriteResponse favoriteResponse =null;
        if (request.addToFavorites()) {
            Favorite savedFavorite = favoriteRepository.save(favorite);
            favoriteResponse = FavoriteResponse.from(savedFavorite);
        }
    
        return new MovieRecordResponse(RatingResponse.from(savedRating), favoriteResponse);
    }
    ```

    - Spring에서는 Service 메서드에 @Transactional을 붙이면 메서드 시작이 트랜잭션 시작, 메서드 끝이 트랜잭션 끝이 된다.
    - RatingService.create()와 FavoriteService.create()를 Controller에서 따로 부르면 각자 @Transactional이 있어서 트랜잭션이 두 개가 된다. 그래서 영화 기록 전용 MovieRecordService의 메서드 하나에서 두 저장을 묶었다.

- commit / rollback
    - **1. 트랜잭션을 끝내는 두 가지 방법**
        - commit은 트랜잭션 안의 작업을 DB에 확정하는 것이다. 이때부터 다른 요청에서도 바뀐 데이터가 보인다.
        - rollback은 트랜잭션 안의 작업을 모두 처음 상태로 되돌리는 것이다.
        - 봉투에 비유하면 commit은 봉투를 최종 제출하는 것이고, rollback은 봉투 안의 내용을 다 버리는 것이다.

      | **구분** | **commit** | **rollback** |
              | --- | --- | --- |
      | 언제 (Spring @Transactional) | 메서드가 정상으로 끝날 때 | 런타임 예외가 메서드 밖으로 나갈 때 |
      | 결과 | 작업이 DB에 남음 | 작업이 모두 취소됨 |
      | 우리 실습 | 238번 첫 요청: 201, ratingId 10과 favoriteId 9가 저장됨 | 예외(ApiException)를 던지면 그 전에 한 저장도 취소됨 |

      #### **2. 우리 코드에서**

        ```java
        public class ApiException extends RuntimeException {
        ```

        - 우리가 만든 ApiException은 RuntimeException을 상속한다. 그래서 @Transactional 메서드 안에서 ApiException을 던지면 Spring이 rollback한다.
        - 238번으로 같은 요청을 두 번 보냈을 때 두 번째는 409 RATING409_1이 왔다. 이후 SELECT로 보니 rating과 favorite에 238번 줄이 각각 하나씩만 있었다. 실패한 요청은 아무것도 남기지 않았다.

- 원자성(Atomicity)

  #### **1. 전부 되거나, 전부 안 되거나**

    - 원자성은 트랜잭션 안의 작업이 "전부 성공"이나 "전부 실패" 둘 중 하나로만 끝나야 한다는 성질이다. 중간까지만 된 상태는 없다.
    - 더 이상 쪼갤 수 없는 원자(atom)처럼, 여러 작업을 쪼갤 수 없는 하나로 다룬다는 뜻이다.

  | **영화 기록 요청 결과** | **원자성을 지킨 것인가** |
      | --- | --- |
  | 평점 O, 즐겨찾기 O | 지킴 (전부 성공) |
  | 평점 X, 즐겨찾기 X | 지킴 (전부 실패) |
  | 평점 O, 즐겨찾기 X | 깨짐 (중간 상태) |

  #### **2. 우리 코드에서 원자성을 지키는 방법**

    - 중복 검사를 저장보다 먼저 모두 한다. 그래서 이미 즐겨찾기한 영화면 평점을 저장하기 전에 FAVORITE409_1로 멈춘다.
    - 그래도 평점 저장 뒤에 즐겨찾기 저장에서 예외가 나면(예: 동시에 들어온 요청으로 UNIQUE 위반) @Transactional의 rollback이 앞의 평점 저장까지 취소한다. 검사는 친절한 오류 메시지를 위한 것이고, 원자성은 rollback이 지킨다.

- ACID

  #### **1. 트랜잭션이 지켜야 하는 네 가지 성질**

    - ACID는 트랜잭션이 믿을 수 있으려면 갖춰야 하는 네 가지 성질의 머리글자이다.

  | **성질** | **뜻** | **우리 실습에서** |
      | --- | --- | --- |
  | Atomicity (원자성) | 전부 성공하거나 전부 실패한다 | 평점과 즐겨찾기가 같이 저장되거나 같이 취소된다 |
  | Consistency (일관성) | 트랜잭션 전후로 DB 규칙(제약 조건)이 지켜진다 | 같은 회원-영화 쌍은 UNIQUE 때문에 한 줄만 있다 |
  | Isolation (격리성) | 동시에 실행되는 트랜잭션끼리 서로의 중간 상태를 보지 못한다 | 내 영화 기록 저장이 commit되기 전에는 다른 요청의 GET /favorites에 안 보인다 |
  | Durability (지속성) | commit된 결과는 서버가 꺼져도 남는다 | 서버를 재시작해도 238번 평점과 즐겨찾기가 그대로 있다 |

  #### **2. 누가 지켜 주나**

    - 네 가지 모두 MySQL(InnoDB)이 트랜잭션 단위로 지켜 준다. 우리 코드가 할 일은 어디부터 어디까지를 한 트랜잭션으로 묶을지 정하는 것이다.
    - 그래서 @Transactional을 붙일 위치(영화 기록 Service 메서드 하나)를 정하는 것이 이번 주 설계의 핵심이었다.

- UNIQUE 제약 조건

  #### **1. 같은 값이 두 번 들어가지 못하게 DB가 막는다**

    - UNIQUE 제약 조건은 지정한 칸(또는 칸들의 묶음)에 같은 값이 두 번 저장되지 못하게 하는 DB 규칙이다.
    - favorite 테이블에는 (member_id, movie_id) 두 칸을 한 쌍으로 묶은 복합 UNIQUE가 있다.

  | **저장하려는 줄** | **movie_id만 UNIQUE라면** | **(member_id, movie_id) UNIQUE라면** |
      | --- | --- | --- |
  | 회원 A - 550 | 저장됨 | 저장됨 |
  | 회원 B - 550 | 막힘 (영화 하나를 서비스 전체에서 한 명만 즐겨찾기) | 저장됨 |
  | 회원 A - 550 한 번 더 | 막힘 | 막힘 |

  #### **2. 서버 사전 검사와 둘 다 두는 이유**

    ```java
    if (favoriteRepository.existsByMember_MemberIdAndMovieId(memberId, request.movieId())) {
        throw new ApiException(HttpStatus.CONFLICT, "FAVORITE409_1",
                "이미 이 영화를 즐겨찾기하셨습니다.");
    }
    ```

    - 위 코드는 저장 전에 이미 있는지 먼저 확인하는 서버 사전 검사이다. 실습 2에서 550을 두 번 등록했을 때 이 검사 덕분에 409 FAVORITE409_1과 알아보기 쉬운 메시지가 왔다.
    - 하지만 두 요청이 거의 동시에 들어오면 둘 다 "아직 없음"으로 검사를 통과할 수 있다. 이때 두 번째 저장을 막는 것은 DB의 UNIQUE뿐이다.

  | **구분** | **서버 사전 검사** | **DB UNIQUE** |
      | --- | --- | --- |
  | 하는 일 | 알아보기 쉬운 오류 코드와 메시지를 준다 | 어떤 경우에도 중복 데이터가 저장되지 않게 한다 |
  | 동시 요청 | 둘 다 통과할 수 있다 | 하나만 저장된다 |
- 낙관적 잠금(Optimistic Locking)

  #### **1. 동시에 같은 데이터를 고칠 때 생기는 문제**

    - 두 요청이 같은 줄을 거의 동시에 읽고 각자 고쳐 저장하면, 나중에 저장한 값이 먼저 저장한 값을 덮어써서 앞의 수정이 사라진다. 이것을 갱신 손실이라고 한다.

  | **순서** | **요청 1 (평점 수정)** | **요청 2 (평점 수정)** | **DB의 score** |
      | --- | --- | --- | --- |
  | 1 | score 3 읽음 |  | 3 |
  | 2 |  | score 3 읽음 | 3 |
  | 3 | 5로 저장 |  | 5 |
  | 4 |  | 4로 저장 (요청 1의 5를 모르고 덮어씀) | 4 |

  #### **2. 낙관적 잠금으로 막는 방법**

    - 낙관적 잠금은 "충돌은 드물 것"이라고 보고 미리 잠그지 않는다. 대신 저장할 때 내가 읽은 뒤로 누가 바꿨는지 버전 번호로 확인하고, 바뀌었으면 저장을 실패시킨다.
    - JPA에서는 엔티티에 버전 칸을 하나 두고 @Version을 붙이면 된다. 저장할 때마다 Hibernate가 버전을 1씩 올린다.

    ```java
    @Version
    private Long version;
    ```

    - 위처럼 쓰면 테이블에 version 칸이 생기고, 수정할 때 "내가 읽었을 때의 version이 아직 그대로면 바꿔 줘"라는 조건이 붙는다. 앞의 표에 version을 붙이면 아래와 같다.

  | **순서** | **요청 1** | **요청 2** | **DB (score, version)** |
      | --- | --- | --- | --- |
  | 1 | 읽음: score 3, version 1 |  | 3, 1 |
  | 2 |  | 읽음: score 3, version 1 | 3, 1 |
  | 3 | version이 1이면 5로 바꾸고 2로 올림 → 성공 |  | 5, 2 |
  | 4 |  | version이 1이면 4로 바꿈 → 이미 2라서 맞는 줄이 없음 | 5, 2 (그대로) |
  | 5 |  | 바뀐 줄이 0개라서 예외 발생 → 다시 읽고 시도해야 함 | 5, 2 |
    - 잠금이 없으면 4번에서 요청 2가 5를 4로 덮어쓴다. 잠금이 있으면 요청 2가 실패해서 요청 1의 수정이 지켜진다.

  | **구분** | **낙관적 잠금** | **비관적 잠금** |
      | --- | --- | --- |
  | 생각 | 충돌은 드물다 | 충돌이 자주 난다 |
  | 방법 | 저장할 때 버전 비교 | 읽을 때 줄을 잠가서 다른 요청이 기다리게 함 |
  | 충돌하면 | 나중 요청이 실패 (다시 시도) | 앞 요청이 끝날 때까지 기다림 |
    - 우리 서버의 평점은 작성자 본인만 수정할 수 있어서 동시에 같은 평점을 고칠 일이 드물다. 그래서 이번 주 코드에는 @Version을 넣지 않았다. 여러 사람이 같은 데이터를 고치는 기능이 생기면 고려한다.