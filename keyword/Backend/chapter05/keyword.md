- SOP와 CORS

  SOP는 다른 출처의 응답을 막는 브라우저 규칙이고, CORS는 서버가 "이 출처는 괜찮다"고 허락해서 그 막힘을 풀어 주는 규칙이다.

  **출처(Origin)** - 프로토콜 + 호스트 + 포트. 셋 중 하나라도 다르면 다른 출처다.

  **SOP** - 지금 열린 화면과 출처가 다른 서버의 응답을 JS가 읽지 못하게 막는 브라우저의 기본 보안 규칙이다.

  **CORS** - 서버가 응답 헤더 Access-Control-Allow-Origin에 허락할 출처를 적어 보내면, 브라우저가 그 헤더를 확인하고 응답을 JS에 넘겨주는 규칙이다.

  **우리 코드에서**

  화면은 http://localhost:5173,
  서버는 http://localhost:8080 이라 포트가 달라서 다른 출처다.
  실습 0에서는 서버에 허락이 없어서 Console에 에러가 났고, 아래 WebConfig를 추가한 뒤 같은 화면에서 응답을 받았다.

    ```java
    @Configuration
    public class WebConfig implements WebMvcConfigurer {
    
        @Override
        public void addCorsMappings(CorsRegistry registry) {
            registry.addMapping("/**")
                    .allowedOrigins("http://localhost:5173")
                    .allowedMethods("GET", "POST", "PATCH", "DELETE")
                    .allowedHeaders("*");
        }
    }
    ```

  allowedOrigins에는 요청을 받는 서버 주소(8080)가 아니라 요청을 보내는 화면의 주소(5173)를 적는다.

- Same-Origin과 Same-Site의 차이

  Same-Origin은 프로토콜, 호스트, 포트가 모두 같아야 하고, Same-Site는 등록 가능한 도메인만 같으면 된다. 포트나 서브도메인이 달라도 무방한, **Same-Origin보다 훨씬 느슨한 기준**

  | **구분** | **같다고 보는 기준** | **브라우저가 판단하는 것** |
      | --- | --- | --- |
  | Same-Origin | 프로토콜 + 호스트 + 포트가 모두 같음 | 이 응답을 JS가 읽어도 되나 (SOP, CORS) |
  | Same-Site | 등록 가능한 도메인이 같음. 포트, 서브도메인은 달라도 됨 | 이 요청에 쿠키를 실어 보내도 되나 (SameSite 쿠키) |

  **예시로 비교**

  | **두 주소** | **Same-Origin** | **Same-Site** |
      | --- | --- | --- |
  | http://localhost:5173 과 http://localhost:8080 | X (포트 다름) | O |
  | https://www.umc.com 과 https://api.umc.com | X (호스트 다름) | O |
  | http://umc.com 과 
    https://umc.com | X (프로토콜 다름) | X |
  | https://umc.com 과 https://naver.com | X | X |

  우리 화면과 서버는 Same-Site지만 Same-Origin이 아니라서 CORS 설정이 필요했다.

- 쿠키의 SameSite 속성

  다른 사이트에서 시작된 요청에 이 쿠키를 같이 보낼지 정하는 속성이다. 다른 사이트가 몰래 우리 서버로 요청을 보내 로그인 쿠키를 악용하는 공격(CSRF)을 막는다.

  | **값** | **다른 사이트에서 시작된 요청에 쿠키를** |
      | --- | --- |
  | Strict | 보내지 않는다 |
  | Lax | 링크 클릭으로 페이지를 이동하는 GET만 보낸다 |
  | None | 항상 보낸다. Secure(https 전용)를 꼭 같이 붙인다 |

    ```
    Set-Cookie: sessionId=abc123; 
    SameSite=Lax; Secure; HttpOnly
    ```

  서버가 응답 헤더에 이렇게 보내면 브라우저가 이 규칙대로 쿠키를 다룬다. 같이 쓰는 Secure는 https에서만 보내기, HttpOnly는 JS에서 못 읽게 하기다.

  우리 커리큘럼 로그인은 쿠키가 아니라 헤더에 토큰을 담는 방식이라 이번 주에 직접 설정하지 않았다.

- 복합 UNIQUE 제약을 사용하는 이유는?

  칼럼 하나가 아니라 여러 칼럼의 조합이 겹치지 않게 막기 위해서다. 워크북에서는 한 회원이 여러 영화에 평점을 남길 수 있지만, 영화 하나에는 하나씩만 남기도록 (member_id, movie_id)를 묶었다.

  **어디에 UNIQUE를 걸면 무엇이 막히나**

  | **제약** | **(1, 550) 다음에 (1, 155)** | **(1, 550) 다음에 (2, 550)** | **(1, 550) 다음에 (1, 550)** |
      | --- | --- | --- | --- |
  | member_id만 UNIQUE | 막힘 (회원이 영화 하나만 평가) | 됨 | 막힘 |
  | movie_id만 UNIQUE | 됨 | 막힘 (영화당 한 명만 평가) | 막힘 |
  | (member_id, movie_id) 복합 UNIQUE | 됨 | 됨 | 막힘 |

  복합 UNIQUE만 원하는 규칙과 정확히 맞는다.

  **우리 코드에서**

    ```sql
    UNIQUE KEY uk_rating_member_movie (member_id, movie_id)
    ```

    ```java
    @Table(name ="rating", uniqueConstraints =@UniqueConstraint(columnNames ={"member_id", "movie_id"}))
    public class Rating extends BaseTimeEntity {
    ```

  1번 회원이 550번 영화에 평점을 또 넣으면 Duplicate entry '1-550' for key 'rating.uk_rating_member_movie' 에러로 막힌다.

- 외부 Open API 연동 시 API Key를 프론트/백엔드 중 어디에 두어야 안전한가?

  백엔드에 두어야 안전하다. 프론트에 둔 키는 사용자 브라우저로 내려가서 누구나 볼 수 있다.

  | **두는 곳** | **키가 보이나** | **이유** |
      | --- | --- | --- |
  | 프론트 (.env의 VITE_ 변수) | 보인다 | 빌드할 때 JS 파일에 글자 그대로 들어가고, Network 탭 요청 헤더에도 찍힌다 |
  | 백엔드 (서버 환경 변수) | 안 보인다 | 서버 안에서만 쓰고, 브라우저는 우리 서버의 응답만 받는다 |

  **키가 새면 생기는 일**

  **요금, 한도** - 다른 사람이 내 키로 요청을 보내서 사용량 한도가 차거나 요금이 나온다.

  **권한 악용** - 쓰기 권한이 있는 키라면 내 계정으로 데이터를 바꿀 수 있다.

  **우리 코드에서**

  이번 주 프론트는 TMDB 토큰을 .env.local의 VITE_TMDB_ACCESS_TOKEN에 두었다. .gitignore 덕분에 GitHub에는 안 올라가지만 F12 Network 탭 Authorization 헤더에 그대로 보인다. 실습용 읽기 전용 토큰이라 괜찮았지만, 실제 서비스라면 백엔드가 TMDB를 대신 불러야 한다.

    ```yaml
    tmdb:
      access-token: ${TMDB_ACCESS_TOKEN}
    ```

    ```java
    @Service
    public class TmdbService {
    
        private final RestClient restClient;
    
        public TmdbService(@Value("${tmdb.access-token}") String accessToken) {
            this.restClient = RestClient.builder()
                    .baseUrl("https://api.themoviedb.org/3")
                    .defaultHeader("Authorization", "Bearer " + accessToken)
                    .build();
        }
    
        public String getPopularMovies() {
            return restClient.get()
                    .uri("/movie/popular?language=ko-KR")
                    .retrieve()
                    .body(String.class);
        }
    }
    ```

  DB_PASSWORD처럼 키도 서버 환경 변수로 넣고, 서버가 TMDB에 대신 요청한다. 프론트는 우리 서버 주소만 부르니까 키가 브라우저에 한 번도 내려가지 않는다.