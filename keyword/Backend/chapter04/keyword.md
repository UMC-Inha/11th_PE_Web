- **JPA / Hibernate와 TypeORM** — ORM과 구현체·라이브러리의 역할은 어떻게 다른가?

### JPA와 Hibernate

- JPA는  Java에서 ORM을 사용할 때 지켜야 할 **표준 규칙과 API를 정의한 명세**
    - 엔티티를 어떻게 정의할지
    - 데이터를 어떻게 저장하고 조회할지
    - 객체 간의 관계를 어떻게 매핑할지

  등을 위한 **인터페이스와 애노테이션을 정의**


ex) 엔티티 정의할 때 사용한 `@Entity`, `@Id`, `@GeneratedValue` 등도 JPA에서 정의한 규칙

그리고 데이터를 저장할 때도 다음과 같은 api를 사용한다

```java
entityManager.persist(user);
```

persist()를 호출하면 해당 객체가 **영속성 컨텍스트에서 관리되는 엔티티**가 됨 → 이후 구현체가 sql을 만들어 db에 실제로 저장시킴

**즉 JPA는 실제로 db와 통신 X**

실제로는 JPA 규칙을 구현한 **Hibernate**를 구현체로 사용

```
Spring Data JPA
        ↓
JPA API
        ↓
Hibernate
        ↓
JDBC
        ↓
Database
```

### TypeORM은

TypeORM은 JavaScript/TypeScript에서 사용할 수 있는 ORM 라이브러리

JPA처럼 별도의 ORM 표준이 존재하고 TypeORM이 그것을 구현하는 구조가 아닌 **TypeORM 자체가 ORM 사용 방법과 실제 기능을 함께 제공**

```java
const bookRepository = dataSource.getRepository(Book);

const book = bookRepository.create({
  title: "데이터베이스 개론",
  available: true,
});

await bookRepository.save(book);
```

핵심적인 차이는 **JPA와 Hibernate 사이에는 표준 ↔ 구현체 관계가 존재하지만, TypeORM에는 그에 대응하는 별도의 표준 계층이 없다는 것**

---

- **Entity Lifecycle과 Persistence Context** — 엔티티를 저장할 때 즉시 SQL이 실행되지 않을 수 있는 이유는 무엇인가?

## 영속성 컨텍스트(Persistence Context)

**영속성 컨텍스트는 JPA가 엔티티 객체를 관리하는 논리적인 공간**

JPA는 데이터베이스에서 조회하거나 새로 저장한 엔티티를 바로 DB와 주고받는 것이 아니라, 먼저 영속성 컨텍스트에서 관리함

영속성 컨텍스트 내부에서는 대표적으로 다음과 같은 기능이 동작한다

- **1차 캐시**
- **변경 감지**
- **쓰기 지연**
- 엔티티 동일성 보장

## Entity Lifecycle

엔티티는 영속성 컨텍스트와의 관계에 따라 크게 4가지 상태를 가짐

- **비영속(Transient)**: 아직 영속성 컨텍스트에서 관리되지 않는 상태
- **영속(Managed)**: 영속성 컨텍스트에서 관리되는 상태
- **준영속(Detached)**: 관리되다가 영속성 컨텍스트에서 분리된 상태
- **삭제(Removed)**: 삭제 대상으로 등록된 상태

예를 들어

```java
Member member = new Member();
member.setName("수빈");

entityManager.persist(member);
```

`persist()`를 호출하면 `member`는 **영속 상태**가 된다

이때 `persist()`가 반드시 즉시 `INSERT` SQL을 실행한다는 의미는 아님

```
persist(member)
      ↓
영속성 컨텍스트에서 관리
      ↓
SQL 실행을 지연
      ↓
**flush**
      ↓
INSERT SQL 실행
```

이처럼 변경 사항을 바로 DB에 반영하지 않고 일정 시점까지 미루는 것을 **쓰기 지연**이라고 함

---

### flush

- 영속성 컨텍스트의 변경사항을 **즉시 데이터베이스에 반영**
    - 1차 캐시나 영속성 컨텍스트 안에 있는 엔티티들은 그대로 유지
    - 비우는 역할은 clear()
- 해당 트랜잭션을 바로 커밋하지 않음
    - ROLLBACK을 사용해서 데이터베이스를 반영 전으로 되돌리기 가능
- 자동 실행 시점
    - 트랜잭션 커밋 시 (commit 내부 동작)
    - JPQL 쿼리 실행 시
- 사용 목적
    - 변경 사항을 즉시 데이터베이스에 반영해야 하지만 트랜잭션은 유지해야 할 때 사용
    - JPQL 실행 전에 변경 사항을 강제 반영해야 할 때 사용

### commit

- 현재 트랜잭션을 완료하고 모든 변경 사항을 확정
- 내부적으로 **flush 실행 후 바로 트랜잭션을 커밋**하는 과정
- 이후 rollback(트랜잭션 취소할 때 사용) 불가

---

- **DTO와 API Contract** — Entity를 그대로 응답하면 어떤 문제가 생길까?

## 발생하는 문제

Entity는 **DB 테이블과 매핑되는 객체**이고, DTO는 **API에서 주고받을 데이터 형태를 정의하는 객체**

Entity를 그대로 API 응답에 사용 → API 응답에 DB의 데이터가 가공 없이 바로 들어감

→ **필요하지 않은 (보내서는 안될) 데이터까지 보내짐!** or **여러 테이블에 흩어져 있는 정보를 모아서 줄 수 없음(불필요한 통신이 많아지게 됨)**

예를 들어 다음 Entity가 있다고 하자

```java
@Entity
public class Member {

    @Id
    private Long id;

    private String name;

    private String password;

    private LocalDateTime createdAt;
}
```

이를 그대로 반환한다면 password처럼 **외부에 공개하면 안 되는 값까지 응답에 포함될 위험**이 있다

또한 Entity에 필드가 추가되거나 이름이 변경된다면 API 응답 형식까지 같이 바뀔 수 있다
**→ 프론트엔드 코드에까지 영향을 줌**

**DTO를 이용해서 분리하자!**

## **API Contract(api 명세서)**

API Contract는 클라이언트와 서버 사이에서 **어떤 데이터를 어떤 형태로 주고받을 것인지 정한 약속**

간단하게 말하면

```json
{
  "id": 1,
  "name": "수빈"
}
```

으로 프론트엔드에게 data를 주기로 약속했다면 그대로 맞춰서 api 응답이 가도록 해야 하는 약속이다

- api 명세서 예시

  !image.png

  ### 요청

    ```jsx
    {
    	"headers": {
    		"Authorization": `Bearer ${token}`
    	},
    	"body": {}
    	"path": {}
    	"query": {
    		searchKey: "검색어",
    		regionIds: [1, 2]
    		categoryIds: [1, 2],
    		cursor: 0,
    		size: 1,
    		sort: "popular"
    	}
    }
    ```

    - cursor : 마지막으로 받은 항목의 id 값
        - 첫 번째 요청이라면 -1
    - sort: 정렬 기준(popular, deadline)

  ### 응답(200)

    ```jsx
    {
      "isSuccess": true,
      "code": "BENEFIT200_1",
      "message": "성공적으로 혜택이 조회되었습니다.",
      "result": {
        "benefits": [
          {
            "benefitId": 1,
            "benefitTitle": "복지 혜택 이름",
            "benefitCategory": "혜택 해당 카테고리"
          }
        ],
    	    "hasNext": true,
    	    "nextCursor": "2",
    	    "pageSize": 0,
    	    "totalCount":0
      }
    }
    ```

    - nextCursor가 0이라면 마지막 페이지

  ### 에러(400)

    ```tsx
    {
      "isSuccess": false,
      "code": "BENEFIT400_1",
      "message": "최소 하나의 옵션을 선택해주세요.",
      "result": null
    }
    ```

  ### 에러(500)

    ```tsx
    {
      "isSuccess": false,
      "code": "GLOBAL500_1",
      "message": "서버 오류가 발생하였습니다.",
      "result": null
    }
    ```


---

- **Validation** — 요청 검증을 Controller 단에서 수행해야 하는 이유는 무엇인가?

## Validation

요청 검증은 보통 **Controller에서 요청을 받는 시점에 최대한 빠르게 수행하는 것이 좋음**

예를 들어 회원가입 요청이 다음과 같다면

```java
public record MemberCreateReqDTO(

    @NotBlank
    String name,

    @Email
    String email,

    @Min(1)
    int age
) {}
```

Controller에서는 `@Valid`를 사용해 바로 요청 값을 검증할 수 있다

```java
@PostMapping("/members")
public ResponseEntity<Void> createMember(
        @Valid @RequestBody MemberCreateRequest request
) {
    memberService.createMember(request);
    return ResponseEntity.ok().build();
}
```

### Controller에서 검증하는 이유

- **잘못된 요청을 빠르게 차단할 수 있음**
    - 불필요한 Service 로직이나 DB 접근을 줄일 수 있다
- **Service가 비즈니스 로직에 집중할 수 있음**
    - null, 빈 문자열, 길이 제한 등 단순한 입력 형식 검증을 Controller 계층에서 처리할 수 있다
- **API 요청 규칙을 명확하게 표현할 수 있음**
    - DTO의 `@NotBlank`, `@Email`, `@Size` 등을 통해 어떤 요청이 허용되는지 쉽게 확인할 수 있다

### 예외

- 검증은 성격에 따라 나누자
    - **Controller ← 요청 형식 검증**
    - **Service ← 비즈니스 규칙 검증**

#### Controller에서 검증

- 이메일 형식이 올바른가?
- regionIds가 최대 2개인가?
- 이름이 비어 있지 않은가?

#### Service에서 검증

- 이미 가입된 이메일인가?
- 해당 도서를 현재 대여할 수 있는가?
- 사용자가 이 혜택을 찜할 수 있는 상태인가?

위와 같은 **DB 조회나 도메인 규칙이 필요한 검증은 Service에서 처리하는 것이 적절**

---

- **N+1 Query** — 관계 데이터를 함께 조회할 때 쿼리가 예상보다 많이 실행되는 이유는 무엇인가?

# N+1 문제

orm 기술에서 특정 객체를 대상으로 수행한 쿼리가 그 객체의 연관 관계에 있는 n개의 객체들도 조회하게 되어서 n번의 추가적인 쿼리가 발생하게 되는 문제

## 예시

식당과 메뉴 엔티티가 1:N 관계일 때 식당 엔티티가 5개가 있다고 가정
이 때 5개의 식당 메뉴 정보를 알려고 할 때 코드를 작성하고 실제 실행 되는 쿼리는

```sql
SELECT * FROM restaurant;

SELECT * FROM menu WHERE restaurant_id = 1;
SELECT * FROM menu WHERE restaurant_id = 2;
...
```

이렇게 N번의 쿼리가 더 실행되게 됨

이러면 후에 데이터가 많아졌을 때 장애 요인이 됨

## 원인

식당 엔티티를 조회할 때 테이블을 객체로 맵핑하기 위해 먼저 식당 테이블을 가져오는 쿼리를 날리고 추가로 메뉴 테이블을 조회하는 쿼리를 날려서 식당 테이블을 완성하는 방식으로 작동하기 때문!

## 해결 방법

## **1. outer join fetching**

### 1.1 **fetch join**

```sql
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    @Query("select t from restaurant r join fetch r.menu")
    List<Team> findAllWithInnerFetchJoin();
    
    @Query("select t from restaurant r left join fetch r.menu")
    List<Team> findAllWithOuterFetchJoin();
}
```

→ 모든 식당 데이터를 가져올 때 메뉴도 join해서 가져와서 실제 실행되는 쿼리의 개수가 1개

### 1.2 EntityGraph

```sql
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    @Query("SELECT r FROM restaurant r")
    @EntityGraph(attributePaths = "menu")
    List<Restaurant> findAllWithEntityGraph();
}
```

→ 실제로 실행되는 쿼리는 menu를 left join fetch해서 restaurant 엔티티를 가져오는 쿼리기 때문에 쿼리가 1번만 실행

## 2.  **batch fetching**

```sql
@Entity
public class Restaurant{

    ...

    @OneToMany(mappedBy = "restaurant", fetch = FetchType.EAGER)
    @BatchSize(size = 5)
    private List<Menu> menu = new ArrayList<>();
	
    ...
}

```

조회되는 엔티티 위에 @BatchSize를 추가하고 Menu 엔티티가 조회될 때 IN 절을 통해 한번에 조회

→ n번의 조회를 1번으로 줄이는 방식

## 3. **subselect fetching**

```sql
@Entity
public class Restaurant{

    ...

    @OneToMany(mappedBy = "restaurant", fetch = FetchType.EAGER)
     @Fetch(value = FetchMode.SUBSELECT)
    private List<Menu> menu = new ArrayList<>();
	
    ...
}

```

Menu 엔티티가 조회될 때 IN절과 서브 쿼리를 사용하여 한번에 조회

→ n번의 조회를 1번으로 줄이는 방식

**batch & subselect fetching의 공통점**

- LAZY하게 동작하기 때문에 LAZY 로딩에서 선언하기만 하면 상황을 고려할 필요가 없어서 편리
- 그러나 fetch join을 권장
    - 편하지만 상황에 따라 쿼리가 달라지는 문제점 존재

---

- **Migration과 synchronize** — 운영 환경에서 자동 스키마 변경이 위험한 이유는 무엇인가?

## Migration과 synchronize

### synchronize

TypeORM의 synchronize: true는 **Entity 정의와 실제 DB 스키마를 비교하여 애플리케이션 실행 시 DB 구조를 자동으로 맞춰주는 기능**

```tsx
const dataSource = new DataSource({
  // ...
  synchronize: true,
});
```

개발 환경에서는 Entity만 수정해도 테이블 구조가 자동으로 변경되어 편리함

하지만 운영 환경에서는 사용하지 않는 것이 권장

### 운영 환경에서 위험한 이유

Entity가 변경되면 애플리케이션 실행 과정에서 **자동으로 ALTER TABLE, 컬럼 추가·삭제 등의 스키마 변경이 발생할 수 있음**

이 과정에서 문제가 발생 가능

- 예상하지 못한 스키마 변경이 실행될 수 있음
- 컬럼 삭제 등으로 **기존 데이터가 손실될 위험**이 있음
- 실행될 SQL을 충분히 검토하지 않은 상태에서 운영 DB가 변경될 수 있음
- 큰 테이블을 변경하는 경우 DB 작업이 오래 걸리거나 서비스에 영향을 줄 수 있음

따라서 TypeORM에서도 운영 환경에서는 synchronize: true 사용을 권장하지 않음

---

### Migration

운영 환경에서는 보통 synchronize 대신 **Migration을 사용해서 DB 스키마 변경을 관리함.**

Migration: **DB 스키마가 어떻게 변경되어야 하는지를 파일로 기록하고 순서대로 적용하는 방식**

예를 들어 title 컬럼을 name으로 변경한다면 다음과 같은 Migration을 만들 수 있음

```sql
ALTER TABLE post
RENAME COLUMN title TO name;
```

TypeORM에서는 직접 Migration을 작성할 수도 있고 Entity와 DB 스키마의 차이를 비교하여 Migration 파일을 생성할 수도 있음.

이를 통해

- 실제 실행될 스키마 변경을 미리 확인할 수 있음
- DB 변경 이력을 코드로 관리할 수 있음
- 개발/테스트/운영 환경에 동일한 변경을 순서대로 적용할 수 있음

따라서 일반적으로

- 개발 환경 → synchronize 사용 가능
- 운영 환경 → synchronize: false + Migration 사용