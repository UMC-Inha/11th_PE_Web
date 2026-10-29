- **JPA / Hibernate와 TypeORM** — ORM과 구현체·라이브러리의 역할은 어떻게 다른가?

**ORM은 "방식",
JPA는 그 방식을 자바에서 쓰는 "규칙",
Hibernate는 그 규칙대로 실제로 SQL을 만드는 "구현체"다.**

| ORM | SQL을 직접 쓰지 않고, 객체를 넘기면 SQL이 만들어지게 하는 **방식** |
| --- | --- |
| JPA | ORM을 자바에서 쓰기 위한 **규칙**. @Entity, @Id, @Column 같은 어노테이션과 save, find 같은 메서드 이름만 정해 둔다. SQL을 만드는 코드는 없다 |
| 구현체 | 정해진 규칙대로 **실제로 동작하는 코드**를 만든 것 |
| Hibernate | JPA의 구현체. 엔터티의 어노테이션을 읽고 SQL을 만들어 DB에 보낸다 |
| 라이브러리 | build.gradle로 가져와 쓰는, 남이 만든 코드 묶음. Hibernate, lombok 모두 라이브러리다 |
| TypeORM | NestJS에서 쓰는 ORM 라이브러리 |

**관계**

```
ORM (방식)
 └ JPA (자바에서 ORM을 쓰는 규칙)
     └ Hibernate (그 규칙을 실제로 실행하는 구현체)
```

**코드 예시**

```java
@Entity
@Table(name = "book")
public class Book {
    @Id
    @Column(name = "book_id")
    private Long bookId;

    @Column(nullable = false, length = 100)
    private String title;
}
```

```java
public interface BookRepository extends JpaRepository<Book, Long> {
}
```

- @Entity, @Table, @Column: JPA 규칙. "이 클래스는 book 테이블, 이 필드는 book_id 컬럼"이라는 정보
- JpaRepository: Spring Data JPA. 상속만 하면 save, findById를 쓸 수 있음
- SQL은 어디에도 없다. Hibernate가 위 정보를 읽고 만든다

**우리 코드에서 일어나는 일**

1. Book.java에 JPA 규칙대로 @Entity, @Table(name = "book"), @Column을 붙인다.
2. Service에서 bookRepository.save(book)를 부른다.
3. Hibernate가 Book의 어노테이션을 읽고 "book 테이블에 저장하는 INSERT문"을 만든다.
4. 그 SQL이 MySQL로 가서 저장된다.

**왜 규칙(JPA)과 구현체(Hibernate)가 나뉘어 있나**

- 우리 코드는 JPA 규칙에만 맞춰 쓰기 때문에, Hibernate 대신 다른 구현체로 바꿔도 우리 코드는 그대로 쓸 수 있다.
- 그래서 코드에는 JPA만 보이고, Hibernate는 실행할 때 뒤에서 동작한다.
- TypeORM은 이렇게 나뉘어 있지 않다. 규칙과 SQL을 만드는 기능이 TypeORM 하나에 다 들어 있다.

- **Entity Lifecycle과 Persistence Context** — 엔티티를 저장할 때 즉시 SQL이 실행되지 않을 수 있는 이유는 무엇인가?

**JPA는 엔터티를 바로 DB에 보내지 않고 영속성 컨텍스트라는 공간에 모아 뒀다가,
트랜잭션(메서드)이 끝날 때 한꺼번에 SQL로 보내기 때문이다.**

| 트랜잭션 | 여러 작업을 한 묶음으로 처리하는 단위. @Transactional이 붙은 메서드 하나가 트랜잭션 하나다. 끝나면 COMMIT(확정)된다 |
| --- | --- |
| Persistence Context (영속성 컨텍스트) | 트랜잭션 동안 JPA가 **엔터티를 모아 두고 관리하는 공간** |
| Entity Lifecycle (엔터티 생명주기) | 엔터티가 그 공간에 들어가 있는지에 따라 바뀌는 **상태** |

**엔터티의 4가지 상태**

| 상태 | 언제 |
| --- | --- |
| 비영속 | new Book(...)으로 객체만 만든 상태 |
| 영속 | save()나 findById()를 거쳐 공간에 들어간 상태 |
| 준영속 | 메서드가 끝나서 공간에서 빠진 상태 |
| 삭제 | delete()로 삭제 표시된 상태 |

**우리 코드에서 일어나는 일**

```
@Transactional 메서드 시작          → 공간이 생김
  Book book = new Book(...)        → 비영속 (공간 밖)
  bookRepository.save(book)        → 영속 (공간 안), INSERT는 바로 실행 (아래 예외 참고)
  값 수정(UPDATE) / delete(DELETE)  → SQL 안 나감. 공간에 바뀐 내용만 기록
메서드 끝 (COMMIT)                  → 기록해 둔 UPDATE / DELETE를 한 번에 실행
                                   → 공간이 사라지고 엔터티는 준영속
```

| 작업 | SQL이 나가는 시점 |
| --- | --- |
| save (새 저장) | 바로 INSERT  |
| 값 수정 (예: 제목을 바꿈) | 메서드 끝날 때 UPDATE |
| delete (삭제) | 메서드 끝날 때 DELETE |
| 같은 데이터 다시 조회 | SQL 없음. 공간에 있는 걸 꺼냄 |
- JPA는 공간에 모아 뒀다가 메서드가 끝날 때 보낸다.
- 공간에 이미 있는 엔터티를 다시 조회하면 DB에 가지 않고 공간에서 꺼내 준다. 그래서 같은 SELECT가 반복되지 않는다.
- 영속 상태의 엔터티는 값만 바꿔도, 메서드가 끝날 때 JPA가 처음 값과 비교해서 UPDATE를 알아서 보낸다.

**예외: 우리 Book의 save는 바로 INSERT 된다**

- Book의 bookId는 번호를 DB의 AUTO_INCREMENT가 정한다.
- JPA는 엔터티를 공간에 넣을 때 번호(ID)가 꼭 필요한데, 이 번호는 INSERT를 해야 알 수 있다.
- 그래서 이 경우에는 기다리지 않고 save를 부르는 순간 INSERT가 실행된다.

- **DTO와 API Contract** — Entity를 그대로 응답하면 어떤 문제가 생길까?

**DB 테이블 모양이 그대로 API 응답이 되어서, DB를 바꾸면 프론트가 깨지고, 보내면 안 되는 값까지 나가고, 에러가 날 수도 있다.**

| 단어 | 뜻 |
| --- | --- |
| DTO | API Contract를 코드로 옮긴 클래스 |
| API Contract | 서버와 프론트가 정한 "이 요청에는 이런 모양으로 응답한다"는 약속 |

**엔터티와 DTO 비교**

|  | 엔터티 (Book) | DTO (BookResponse) |
| --- | --- | --- |
| 무엇에 맞춘 모양 | DB 테이블 | 프론트에 필요한 값 |
| 쓰이는 곳 | 서버 ↔ DB | 서버 ↔ 프론트 |
| 바뀌는 때 | DB 구조가 바뀔 때 | 프론트와의 약속이 바뀔 때 |

**Entity를 그대로 응답하면 생기는 문제**

1. **DB를 바꾸면 프론트가 깨진다**
    - 엔터티의 필드 이름이 그대로 JSON 키가 된다.
    - Book의 isAvailable을 available로 바꾸면 JSON 키도 available로 바뀐다.
    - 프론트는 여전히 isAvailable을 읽고 있어서 값이 사라지고 화면이 깨진다.
2. **보내면 안 되는 값까지 나간다**
    - 엔터티의 모든 필드가 응답에 들어간다.
    - 회원 엔터티를 그대로 응답하면 비밀번호도 프론트로 나간다.
3. **에러가 날 수 있다**
    - Book 안의 Category는 LAZY라서, 조회 직후에는 아직 내용이 채워지지 않은 상태다.
      (LAZY - Book을 조회할 때 Category는 같이 안 가져오고, 실제로 꺼내 쓰는 순간 따로 조회하는 설정)
    - 이걸 JSON으로 바꾸려다 에러가 난다.

**코드 예시**

```java
public record BookResponse(Long bookId, String title, String description,
                           String categoryName, Boolean isAvailable) {
    public static BookResponse from(Book book) {
        return new BookResponse(
                book.getBookId(),
                book.getTitle(),
                book.getDescription(),
                book.getCategory().getName(),
                book.getIsAvailable()
        );
    }
}
```

- record 괄호 안의 5칸이 API Contract(응답 모양)다.
- from은 Book(엔터티)에서 값 5개를 꺼내 BookResponse의 5칸에 순서대로 넣어서 돌려준다.

**DTO가 있을 때와 없을 때**

```
엔터티로 응답: DB 컬럼 이름 변경 → 엔터티 필드 이름 변경 → 응답 JSON 키 바뀜 → 프론트 깨짐
DTO로 응답:   DB 컬럼 이름 변경 → 엔터티 필드 이름 변경 → BookResponse.from 안쪽만 고침
                                                   → 응답 JSON 키 그대로 → 프론트 안 깨짐
```

**우리 코드에서 일어나는 일 (POST /books)**

```
프론트 JSON → CreateBookRequest (DTO)로 받음
            → DTO 값으로 Book (엔터티)을 만들어 DB에 저장
            → 저장된 Book을 BookResponse (DTO)로 바꿔서 응답
```

- BookResponse.from에서 응답에 넣을 값을 **직접 골라** 담는다. 그래서 필요 없는 값은 나가지 않는다.
- 엔터티의 필드 이름이 바뀌어도 from 안쪽만 고치면 응답 모양은 그대로다.

- **Validation** — 요청 검증을 Controller 단에서 수행해야 하는 이유는 무엇인가?

**controller는 요청이 처음 들어오는 입구라서, 여기서 막아야 잘못된 값이 Service와 DB까지 안 가고, "요청이 잘못됐다(400)"고 정확히 알려줄 수 있다.**

**코드 예시**

```java
public record CreateBookRequest(
        @NotNull Long categoryId,
        @NotBlank @Size(max = 100) String title,
        String description
) {}
```

```java
@PostMapping
public BookResponse createBook(@Valid @RequestBody CreateBookRequest request) {
    return bookService.createBook(request);
}
```

- 검사 규칙은 DTO(CreateBookRequest)에 붙이고, 실제 검사는 Controller의 @Valid가 실행한다.
- 검사에 걸리면 bookService.createBook은 실행되지 않고 바로 400으로 응답한다.

**ex) 제목을 비워서 보냈을 때**

```
검증 없음: Controller → Service → DB까지 감 → 빈 제목이 저장되거나 DB 에러 → 500
검증 있음: Controller에서 @Valid가 막음 → Service, DB는 실행 안 됨 → 400
```

**왜 Controller에서 해야 하나**

- 요청은 Controller → Service → Repository → DB 순서로 들어간다. 입구에서 막아야 안쪽 코드가 잘못된 값을 처리할 일이 없다.
- 검증이 없으면 DB에 가서야 에러가 나고 500으로 응답한다. 요청이 틀린 건데 서버가 고장 난 것처럼 보인다.

- **N+1 Query** — 관계 데이터를 함께 조회할 때 쿼리가 예상보다 많이 실행되는 이유는 무엇인가?

**코드에는 JOIN이 없어서, JPA가 책 목록을 1번 조회한 뒤 카테고리를 책마다 따로 조회하기 때문이다.
그래서 1 + N번 실행된다.**

**2주차 SQL**

```sql
SELECT b.title, c.name
FROM book b
JOIN category c ON b.category_id = c.category_id;
```

JOIN으로 묶어서 **SQL 1번**에 책과 카테고리 이름을 다 가져왔다.

**4주차 GET /books 코드**

```java
bookRepository.findAllByOrderByBookIdDesc()
        .stream()
        .map(BookResponse::from)
        .toList();
```

위 코드에는 JOIN이 없고, Book의 category는 LAZY다.

**위 코드를 실행하면 JPA가 실제로 보내는 SQL** (책 3권, 카테고리가 다 다를 때)

```sql
SELECT * FROM book;                              
SELECT * FROM category WHERE category_id = 1;    
SELECT * FROM category WHERE category_id = 2;    
SELECT * FROM category WHERE category_id = 3;   
```

- 직접 짰다면 1번이면 될 일을 **1번(책 목록) + N번(책마다 카테고리)** 으로 나눠 보냈다. 그래서 N+1이다.
- 코드에 SQL이 안 보여서 이렇게 여러 번 나가는 줄 모르고 지나가기 쉽다. 이게 "예상보다 많이" 실행되는 이유다.
- 책이 1,000권이면 SQL이 최대 1,001번 나가서 느려진다.
- 같은 카테고리는 영속성 컨텍스트에 이미 있어서 다시 조회하지 않는다. 그래서 정확히는 서로 다른 카테고리 수만큼 늘어난다.

**해결: fetch join**

2주차처럼 JOIN으로 한 번에 가져오라고 JPA에 직접 알려 준다.

```java
@Query("SELECT b FROM Book b JOIN FETCH b.category ORDER BY b.bookId DESC")
List<Book> findAllWithCategory();
```

책이 몇 권이든 SQL은 **1번**으로 끝난다.

- **Migration과 synchronize** — 운영 환경에서 자동 스키마 변경이 위험한 이유는 무엇인가?

### synchronize란

**"테이블을 엔터티에 맞춰 자동으로 동기화(맞춤)하라"는 설정**이다. NestJS(TypeORM)에서 쓰는 이름이고, Spring에서는 같은 기능을 **ddl-auto**로 설정한다.

```
엔터티 코드 수정 → 서버 재시작 → 서버가 엔터티와 테이블을 비교 → 다른 부분을 테이블에 알아서 반영
```

예를 들어 Book 엔터티에 책 가격을 담는 price 필드를 추가하고 서버를 켜면, 서버가 book 테이블에 price 컬럼을 알아서 추가한다. 개발할 때는 SQL을 안 써도 돼서 편하다.

| Spring ddl-auto 값 | 서버가 켜질 때 |
| --- | --- |
| create | 테이블을 지우고 엔터티대로 새로 만든다 |
| update | 엔터티에 새로 생긴 필드를 컬럼으로 추가한다 |
| validate | 테이블은 안 바꾸고, 엔터티와 맞는지만 확인한다 (우리 설정) |
| none | 아무것도 안 한다 |

### Migration이란

**테이블을 바꾸는 SQL을 사람이 직접 파일로 쓰고, 버전 번호를 붙여서 순서대로 적용하는 방식**이다.

```
db/migration/
├── V1__create_book.sql       ← CREATE TABLE book (...)
├── V2__add_price.sql         ← ALTER TABLE book ADD COLUMN price INT;
└── V3__rename_title.sql      ← ALTER TABLE book RENAME COLUMN title TO book_title;
```

1. 테이블을 바꿀 일이 생기면, 바꾸는 SQL을 새 파일로 쓴다. 번호는 V4, V5처럼 이어 붙인다.
2. 서버가 켜질 때 Migration 도구(Spring은 Flyway 등)가 아직 실행 안 한 파일만 순서대로 실행한다.
3. 어떤 파일까지 실행했는지는 DB 안에 기록해 둬서, 같은 파일을 두 번 실행하지 않는다.

### 위험한 이유: 같은 변경을 두 방식으로 해 보면

운영 서버에 책 1,000권이 있다. title 필드 이름을 bookTitle로 바꾸고 싶다.

| 방식 | 하는 일 | 결과 |
| --- | --- | --- |
| synchronize / ddl-auto: create | 엔터티 필드 이름만 바꾸고 서버 재시작 → 서버가 알아서 테이블을 고침 | 기존 컬럼이나 테이블이 지워져서 책 제목 또는 책 전체가 사라짐 |
| Migration | 사람이 V3__rename_title.sql을 써서 검토 후 적용 | 컬럼 이름만 바뀌고 제목 1,000개는 그대로 |
- synchronize는 "어떻게 바꿀지"를 서버가 정한다. 서버는 이름을 바꾼 건지, 지우고 새로 만든 건지 구분하지 못해서 지우고 새로 만들어 버린다.
- Migration은 "어떻게 바꿀지"를 사람이 SQL로 정확히 적는다. 그래서 데이터를 지키면서 바꿀 수 있고, 파일이 기록으로 남는다.