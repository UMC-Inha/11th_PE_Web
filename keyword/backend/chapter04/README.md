# chapter04

- **JPA / Hibernate와 TypeORM** — ORM과 구현체·라이브러리의 역할은 어떻게 다른가?
    
    #### ORM이란?
    
    ORM(Object-Relational Mapping)은 **Java의 객체와 같은 프로그래밍 언어의 객체를 관계형 데이터베이스의 테이블과 연결해 주는 기술**이다.
    
    애플리케이션에서는 데이터를 객체로 다루지만, 관계형 데이터베이스에서는 데이터를 테이블 형태로 저장한다.
    
    예를 들어 Java에서는 도서 데이터를 `Book` 객체로 표현할 수 있다.
    
    ```java
    Book book = new Book(...);
    ```
    
    반면 데이터베이스에서는 같은 데이터를 `book` 테이블의 행으로 저장한다.
    
    ```
    Java                         Database
    
    Book 객체        ← ORM →      book 테이블
    title                       title
    description                 description
    ```
    
    ORM은 이렇게 **객체와 테이블 사이의 차이를 연결해 주고, 필요한 SQL을 생성하여 데이터베이스와 통신할 수 있도록 도와준다.**
    
    예를 들어 3주차에는 `JdbcTemplate`을 사용하여 SQL을 직접 작성했다.
    
    ```java
    String sql = "SELECT * FROM book ORDER BY book_id DESC";
    ```
    
    하지만 4주차에는 ORM을 사용하여 다음과 같이 Repository를 통해 데이터를 조회했다.
    
    ```java
    bookRepository.findAllByOrderByBookIdDesc();
    ```
    
    개발자가 `SELECT` SQL을 직접 작성하지 않아도 ORM이 필요한 SQL을 생성하여 데이터베이스에 전달한다.
    
    #### JPA, Hibernate, Spring Data JPA의 관계
    
    Java에서 ORM을 사용할 때 자주 등장하는 것이 **JPA, Hibernate, Spring Data JPA**이다.
    
    세 가지는 모두 같은 것이 아니라 각각 역할이 다르다.
    
    ```
    Spring Data JPA
          ↓
    JPA를 편리하게 사용할 수 있도록 도와줌
          ↓
         JPA
          ↓
    ORM 사용 방법을 정의한 표준
          ↓
      Hibernate
          ↓
    JPA 규칙을 실제로 구현
          ↓
      Database
    ```
    
    #### JPA란?
    
    JPA(Java Persistence API)는 Java에서 ORM을 사용하기 위한 **표준 명세**이다.
    
    여기서 표준 명세란 쉽게 말하면 **ORM을 어떤 방식으로 사용할 것인지 정해 놓은 규칙**이라고 볼 수 있다.
    
    JPA는 Entity를 어떻게 정의하고 관리할 것인지 등에 대한 규칙과 인터페이스를 제공한다.
    
    예를 들어 다음과 같은 어노테이션도 JPA에서 정의한다.
    
    ```java
    @Entity
    @Table(name = "book")
    public class Book {
    
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long bookId;
    }
    ```
    
    하지만 **JPA 자체가 SQL을 만들어 데이터베이스와 통신하는 것은 아니다.**
    
    JPA는 규칙을 정의한 것이기 때문에 이 규칙에 따라 실제로 동작하는 프로그램이 필요하다. 그 역할을 하는 대표적인 구현체가 **Hibernate**이다.
    
    #### Hibernate란?
    
    Hibernate는 **JPA의 규칙을 실제로 구현한 ORM 프레임워크**이다.
    
    개발자가 JPA 방식으로 Entity를 정의하고 데이터를 저장하거나 조회하면 Hibernate가 실제 SQL을 생성하여 데이터베이스와 통신한다.
    
    ```
    개발자
      ↓
    JPA 방식으로 코드 작성
      ↓
    Hibernate
      ↓
    SQL 생성 및 실행
      ↓
    Database
    ```
    
    따라서 간단하게 말하면 **JPA는 규칙이고, Hibernate는 그 규칙을 실제로 동작하도록 구현한 프로그램**이라고 이해할 수 있다.
    
    #### Spring Data JPA란?
    
    Spring Data JPA는 **JPA를 Spring에서 더 편리하게 사용할 수 있도록 도와주는 기능**을 제공한다.
    
    대표적으로 `JpaRepository`를 이용하면 기본적인 저장, 조회, 삭제 기능을 직접 구현하지 않고 사용할 수 있다.
    
    이번 실습에서 작성한 다음 코드도 Spring Data JPA를 사용한 것이다.
    
    ```java
    public interface BookRepository extends JpaRepository<Book, Long> {
        List<Book> findAllByOrderByBookIdDesc();
    }
    ```
    
    여기서 `findAllByOrderByBookIdDesc()`와 같은 메서드를 작성하면 Spring Data JPA가 메서드 이름을 분석하여 필요한 조회 기능을 만들어 준다.
    
    전체 관계를 다시 정리하면 다음과 같다.
    
    ```
    Spring Data JPA
    → JPA를 편리하게 사용할 수 있도록 도와줌
    
    JPA
    → Java에서 ORM을 사용하는 방법을 정의한 표준
    
    Hibernate
    → JPA 표준을 실제로 구현하여 SQL 생성 및 DB 작업을 수행
    ```
    
    #### TypeORM이란?
    
    TypeORM은 **TypeScript와 JavaScript 환경에서 사용할 수 있는 ORM 라이브러리**이다.
    
    Java에서 JPA와 Hibernate를 이용하여 객체와 데이터베이스 테이블을 연결하는 것처럼, TypeORM에서도 Entity를 정의하고 객체를 중심으로 데이터베이스를 다룰 수 있다.
    
    ```tsx
    @Entity()
    export class Book {
      @PrimaryGeneratedColumn()
      bookId: number;
    
      @Column()
      title: string;
    }
    ```
    
    다만 **JPA와 TypeORM을 같은 종류라고 보면 안 된다.**
    
    JPA는 ORM 기능을 직접 구현한 라이브러리가 아니라 **Java에서 ORM을 사용하는 방법을 정한 표준**이다. 따라서 Hibernate와 같은 구현체가 필요하다.
    
    반면 TypeORM은 TypeScript/JavaScript에서 **ORM 기능을 실제로 제공하는 라이브러리**이므로 JPA보다는 Hibernate와 역할이 더 비슷하다고 볼 수 있다.
    
    | 구분 | JPA | Hibernate | TypeORM |
    | --- | --- | --- | --- |
    | 역할 | ORM 표준 명세 | JPA 구현체 | ORM 라이브러리 |
    | 사용 환경 | Java | Java | TypeScript / JavaScript |
    | ORM 기능 직접 구현 | X | O | O |
    | SQL 생성 및 DB 작업 | 직접 하지 않음 | O | O |
    
    #### ORM의 장점
    
    - SQL을 반복해서 직접 작성하는 코드를 줄일 수 있다.
    - 객체를 중심으로 데이터베이스의 데이터를 다룰 수 있다.
    - Entity의 연관관계를 이용하여 테이블 간의 관계를 코드로 표현할 수 있다.
    
    #### ORM의 단점
    
    - ORM이 SQL을 자동으로 생성하기 때문에 실제 어떤 SQL이 실행되는지 파악하기 어려울 수 있다.
    - 복잡한 조회에서는 ORM이 생성하는 SQL을 확인하고 성능을 고려해야 할 수 있다.
    - ORM의 동작 방식과 Entity의 관계 설정 등을 추가로 이해해야 한다.
    
    #### 정리
    
    **ORM은 객체와 관계형 데이터베이스를 연결하는 기술이다. JPA는 Java에서 ORM을 사용하는 방법을 정의한 표준이고, Hibernate는 JPA 표준을 실제로 구현하여 SQL 생성과 데이터베이스 작업을 수행하는 ORM 프레임워크이다. Spring Data JPA는 JPA를 더 편리하게 사용할 수 있도록 Repository 등의 기능을 제공한다. TypeORM은 TypeScript/JavaScript 환경에서 ORM 기능을 직접 제공하는 라이브러리이다.**
    
- **Entity Lifecycle과 Persistence Context** — 엔티티를 저장할 때 즉시 SQL이 실행되지 않을 수 있는 이유는 무엇인가?
    
    #### Entity란?
    
    Entity는 **데이터베이스의 테이블과 연결되는 Java 객체**이다.
    
    예를 들어 `book` 테이블이 있다면 다음과 같이 `Book` Entity를 만들 수 있다.
    
    ```java
    @Entity
    @Table(name = "book")
    public class Book {
    
        @Id
        private Long bookId;
    
        private String title;
    }
    ```
    
    JPA는 이러한 Entity를 이용하여 Java 객체와 데이터베이스의 데이터를 연결한다.
    
    #### Persistence Context란?
    
    Persistence Context(영속성 컨텍스트)는 **JPA가 Entity를 관리하는 공간**이다.
    
    JPA를 사용하면 Java 객체가 데이터베이스와 바로 연결되는 것이 아니라, JPA가 중간에서 Entity의 상태를 관리한다.
    
    쉽게 나타내면 다음과 같다.
    
    ```
    Java의 Entity 객체
            ↓
    영속성 컨텍스트
    (JPA가 Entity를 관리)
            ↓
    Database
    ```
    
    따라서 Entity의 값을 저장하거나 변경했다고 해서 항상 그 순간 데이터베이스에 SQL이 실행되는 것은 아니다.
    
    #### Entity Lifecycle이란?
    
    Entity Lifecycle은 **Entity가 생성되고 JPA의 관리 대상이 되거나 관리 대상에서 벗어나는 과정**을 의미한다.
    
    Entity에는 크게 네 가지 상태가 있다.
    
    | 상태 | 의미 |
    | --- | --- |
    | 비영속(New) | 객체는 만들어졌지만 JPA가 아직 관리하지 않는 상태 |
    | 영속(Managed) | JPA가 관리하고 있는 상태 |
    | 준영속(Detached) | JPA가 관리하다가 관리 대상에서 벗어난 상태 |
    | 삭제(Removed) | 데이터베이스에서 삭제하기로 한 상태 |
    
    예를 들어 다음과 같이 `Book` 객체를 만들었다고 하자.
    
    ```java
    Book book = new Book(
            category,
            "JPA 공부",
            "JPA 학습용 도서"
    );
    ```
    
    이때 `book`은 Java 객체로 생성되었지만 아직 JPA가 관리하고 있지 않다. 이러한 상태를 **비영속(New) 상태**라고 한다.
    
    이후 Spring Data JPA의 `save()`를 사용하여 새로운 Entity를 저장하면 JPA의 관리 대상이 된다.
    
    ```java
    bookRepository.save(book);
    ```
    
    새로운 Entity를 `save()`하면 내부적으로 JPA의 `persist()`가 사용되어 Entity가 영속성 컨텍스트의 관리 대상이 된다. 이렇게 JPA가 Entity를 관리하고 있는 상태를 **영속(Managed) 상태**라고 한다.
    
    영속 상태의 Entity가 영속성 컨텍스트에서 분리되면 **준영속(Detached) 상태**가 된다. Entity 객체 자체는 그대로 존재하지만 JPA가 더 이상 해당 Entity를 관리하지 않는 상태이다.
    
    ```java
    entityManager.detach(book);
    ```
    
    반대로 영속 상태의 Entity를 삭제 대상으로 지정하면 **삭제(Removed) 상태**가 된다.
    
    ```java
    entityManager.remove(book);
    ```
    
    삭제 상태가 된 Entity는 이후 Flush가 발생하면 `DELETE` SQL이 실행되어 데이터베이스에서도 삭제된다.
    
    전체적인 상태 변화는 다음과 같다.
    
    ```
    		Book 객체 생성
    		      ↓
    		비영속(New)
    		      ↓ save()
    		영속(Managed)
       ↙          ↘
    detach()     remove()
       ↓            ↓
    	준영속        삭제
    (Detached)   (Removed)
    ```
    
    #### Flush란?
    
    JPA가 영속성 컨텍스트에서 관리하고 있던 변경 내용을 **실제 데이터베이스와 동기화하는 과정**을 Flush(플러시)라고 한다.
    
    예를 들어 다음 코드가 있다고 하자.
    
    ```java
    @Transactional
    public void createBook() {
        Book book = new Book(
                category,
                "JPA 공부",
                "설명"
        );
    
        bookRepository.save(book);
    }
    ```
    
    JPA는 Entity를 관리하면서 필요한 데이터베이스 작업을 처리하고, Flush가 필요한 시점에 SQL을 실행하여 데이터베이스와 상태를 맞춘다.
    
    개념적으로는 다음과 같이 이해할 수 있다.
    
    ```
    Book 객체 생성
          ↓
    save()
          ↓
    JPA가 Entity 관리
          ↓
    Flush
          ↓
    INSERT SQL 실행
          ↓
    Database에 반영
    ```
    
    일반적으로 트랜잭션이 커밋되기 전에는 Flush가 발생하여 변경 내용을 데이터베이스와 동기화한다.
    
    #### 그러면 왜 `save()`할 때 SQL이 바로 실행되지 않을 수 있을까?
    
    JPA가 **Entity와 데이터베이스 사이에서 영속성 컨텍스트를 이용해 상태를 관리하기 때문**이다.
    
    SQL을 직접 사용하는 경우에는 다음 코드를 실행하면 SQL 자체를 데이터베이스에 전달한다.
    
    ```sql
    INSERT INTO book ...
    ```
    
    하지만 JPA에서는 개발자가 직접 `INSERT` SQL을 실행하는 것이 아니라 Entity를 저장한다.
    
    ```java
    bookRepository.save(book);
    ```
    
    JPA는 Entity의 상태를 관리하고 있다가 데이터베이스와 동기화가 필요한 **Flush 시점에 필요한 SQL을 실행할 수 있다.**
    
    따라서 다음 두 가지는 같은 의미가 아니다.
    
    ```
    save()
    → Entity를 저장하도록 JPA에 요청
    
    flush()
    → JPA가 관리하는 변경 내용을 DB와 동기화
    ```
    
    그래서 `save()`를 호출한 시점과 실제 SQL이 실행되는 시점이 항상 같다고 볼 수는 없다.
    
    단, SQL이 항상 나중에 실행된다는 뜻은 아니다. 기본 키 생성 방법이나 Flush가 필요한 상황에 따라 SQL이 더 일찍 실행될 수도 있다.
    
    ### Persistence Context와 Flush의 장단점
    
    #### 장점
    
    - Entity의 상태를 영속성 컨텍스트에서 관리하므로 객체 중심으로 데이터를 처리할 수 있다.
    - 변경 내용을 즉시 데이터베이스에 반영하지 않고 Flush 시점에 동기화할 수 있어 여러 데이터베이스 작업을 효율적으로 처리할 수 있다.
    - 개발자가 모든 `INSERT`, `UPDATE`, `DELETE` SQL을 직접 작성하지 않아도 JPA가 필요한 SQL을 생성할 수 있다.
    
    #### 단점
    
    - 코드가 실행되는 시점과 실제 SQL이 실행되는 시점이 다를 수 있어 동작을 이해하기 어려울 수 있다.
    - Flush가 발생하는 시점을 제대로 이해하지 못하면 예상하지 못한 시점에 SQL이 실행될 수 있다.
    - JPA가 SQL을 자동으로 생성하기 때문에 실제 어떤 SQL이 실행되는지 확인하며 사용할 필요가 있다.
    
    ### 정리
    
    **영속성 컨텍스트는 JPA가 Entity를 관리하는 공간이다. Entity를 저장하거나 수정하면 JPA가 그 상태를 관리하고, Flush가 발생할 때 변경 내용을 데이터베이스와 동기화한다. 따라서 `save()`와 같은 코드를 실행한 순간 항상 SQL이 즉시 실행되는 것은 아니며, 실제 SQL 실행 시점은 Flush 시점이나 ID 생성 방식 등에 따라 달라질 수 있다.**
    
- **DTO와 API Contract** — Entity를 그대로 응답하면 어떤 문제가 생길까?
    
    #### DTO란?
    
    DTO(Data Transfer Object)는 **계층 간에 필요한 데이터를 전달하기 위해 사용하는 객체**이다.
    
    예를 들어 데이터베이스의 `book` 테이블과 연결되는 `Book` Entity가 있다고 하자.
    
    ```java
    @Entity
    @Table(name = "book")
    public class Book {
    
        @Id
        private Long bookId;
    
        private String title;
        private String description;
        private Boolean isAvailable;
    }
    ```
    
    `Book` Entity는 데이터베이스의 데이터를 Java 객체로 다루기 위해 사용한다.
    
    하지만 API를 통해 클라이언트에게 데이터를 전달할 때는 Entity 자체를 전달하는 대신, **응답에 필요한 데이터만 담은 DTO를 만들어 사용할 수 있다.**
    
    이번 실습에서는 다음과 같이 `BookResponse` DTO를 사용했다.
    
    ```java
    public record BookResponse(
            Long bookId,
            String title,
            String description,
            String categoryName,
            Boolean isAvailable
    ) {
    }
    ```
    
    역할을 간단하게 구분하면 다음과 같다.
    
    ```
    Entity
    → DB의 데이터와 연결하기 위한 객체
    
    DTO
    → 필요한 데이터를 전달하기 위한 객체
    ```
    
    #### 요청 DTO와 응답 DTO
    
    DTO는 클라이언트가 서버로 데이터를 보낼 때와 서버가 클라이언트에게 데이터를 반환할 때 모두 사용할 수 있다.
    
    이번 실습의 도서 등록 API에서는 `CreateBookRequest`를 요청 DTO로 사용했다.
    
    ```java
    public record CreateBookRequest(
            @NotNull Long categoryId,
            @NotBlank @Size(max = 100) String title,
            String description
    ) {
    }
    ```
    
    클라이언트가 다음과 같은 데이터를 서버로 보내면,
    
    ```json
    {
      "categoryId": 1,
      "title": "JPA 공부",
      "description": "JPA 학습용 도서"
    }
    ```
    
    Spring은 이를 `CreateBookRequest` 객체로 받아 처리할 수 있다.
    
    반대로 조회 결과를 클라이언트에게 반환할 때는 `BookResponse`와 같은 응답 DTO를 사용할 수 있다.
    
    ```
    Client
       │
       │ 요청
       ↓
    Request DTO
       ↓
    Service / Entity
       ↓
    Response DTO
       │
       │ 응답
       ↓
    Client
    ```
    
    따라서 요청과 응답에 DTO를 사용하면 **API에서 어떤 데이터를 받고 어떤 데이터를 반환할 것인지 명확하게 구분할 수 있다.**
    
    #### API Contract란?
    
    API Contract는 **클라이언트와 서버가 API를 통해 어떤 형식으로 데이터를 주고받을지 정한 약속**이다.
    
    예를 들어 `GET /books`의 응답을 다음과 같이 정했다고 하자.
    
    ```json
    {
      "bookId": 1,
      "title": "JPA 공부",
      "description": "JPA 학습용 도서",
      "categoryName": "컴퓨터",
      "isAvailable": true
    }
    ```
    
    그러면 클라이언트는 `bookId`, `title`, `description`, `categoryName`, `isAvailable`이라는 값이 응답으로 전달된다는 것을 기준으로 화면이나 기능을 구현할 수 있다.
    
    즉,
    
    ```
    Server
    "이 형태로 데이터를 보내겠습니다."
               ↕
          API Contract
               ↕
    Client
    "이 형태로 데이터가 온다고 생각하고 사용하겠습니다."
    ```
    
    DTO를 사용하면 API가 주고받는 데이터의 형태를 별도로 정의할 수 있기 때문에 **API Contract를 명확하게 관리하기 쉽다.**
    
    #### Entity를 그대로 응답하면 어떤 문제가 생길까?
    
    Controller에서 다음과 같이 Entity를 그대로 반환하는 것도 가능하다.
    
    ```java
    @GetMapping
    public List<Book> getBooks() {
        return bookRepository.findAll();
    }
    ```
    
    하지만 이렇게 하면 **데이터베이스에서 사용하는 Entity의 구조와 API의 응답 구조가 직접 연결된다.**
    
    ```
    Database
        ↕
      Entity
        ↕
    API Response
        ↓
      Client
    ```
    
    이 구조에서는 Entity가 변경되면 API 응답에도 영향을 줄 수 있다.
    
    예를 들어 `Book` Entity에 데이터베이스에서만 필요한 필드가 추가되었다고 하자.
    
    ```java
    private String internalCode;
    ```
    
    Entity를 그대로 응답하고 있다면 의도하지 않은 필드가 API 응답에 포함될 가능성이 생긴다.
    
    반면 DTO를 사용하면 클라이언트에게 필요한 필드만 선택하여 반환할 수 있다.
    
    ```java
    public record BookResponse(
            Long bookId,
            String title,
            String description,
            String categoryName,
            Boolean isAvailable
    ) {
    }
    ```
    
    따라서 Entity가 변경되더라도 DTO의 구조를 그대로 유지하면 API 응답 구조에 미치는 영향을 줄일 수 있다.
    
    #### Entity의 연관관계가 응답에 영향을 줄 수 있다
    
    JPA Entity는 다른 Entity와 연관관계를 가질 수 있다.
    
    이번 실습에서도 `Book`과 `Category`가 연결되어 있다.
    
    ```java
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
    ```
    
    Entity를 그대로 응답하면 이러한 연관관계까지 JSON으로 변환하는 과정에서 **필요하지 않은 데이터가 함께 포함되거나 추가적인 데이터 조회가 발생할 수 있다.**
    
    특히 양방향 연관관계를 사용하는 경우에는 Entity들이 서로를 참조하면서 JSON 직렬화 과정에서 문제가 발생할 수도 있다.
    
    DTO를 사용하면 필요한 값만 직접 선택할 수 있다.
    
    ```java
    public static BookResponse from(Book book) {
        return new BookResponse(
                book.getBookId(),
                book.getTitle(),
                book.getDescription(),
                book.getCategory().getName(),
                book.getIsAvailable()
        );
    }
    ```
    
    여기서는 `Category` Entity 전체를 반환하는 것이 아니라 API에 필요한 `categoryName`만 가져와 응답한다.
    
    #### DTO를 사용했을 때의 구조
    
    DTO를 사용하면 Entity와 API 응답을 분리할 수 있다.
    
    ```
    Database
        ↕
      Entity
        ↓
       DTO
        ↓
    API Response
        ↓
      Client
    ```
    
    즉, **Entity는 데이터베이스와의 연결을 담당하고 DTO는 클라이언트와 주고받을 데이터의 형태를 담당하도록 역할을 분리할 수 있다.**
    
    #### DTO 사용의 장점
    
    - API에서 필요한 데이터만 선택하여 전달할 수 있다.
    - Entity 구조와 API 응답 구조를 분리할 수 있다.
    - Entity가 변경되더라도 API 응답에 미치는 영향을 줄일 수 있다.
    - 요청 DTO에 `@NotNull`, `@NotBlank` 등의 검증 조건을 지정할 수 있다.
    - 데이터베이스 내부에서만 필요한 정보가 API에 노출되는 것을 방지하기 쉽다.
    
    #### DTO 사용의 단점
    
    - Entity와 별도로 DTO 클래스를 작성해야 하므로 코드의 양이 늘어난다.
    - Entity와 DTO 사이에서 데이터를 변환하는 코드가 필요하다.
    - API가 많아질수록 관리해야 하는 DTO의 수도 많아질 수 있다.
    
    #### 정리
    
    **Entity는 데이터베이스와 연결되는 객체이고, DTO는 API 등에서 필요한 데이터를 전달하기 위한 객체이다. Entity를 API 응답으로 그대로 사용하면 Entity의 변경이 API 응답 구조에도 영향을 줄 수 있고, 불필요한 데이터나 연관된 Entity가 노출될 수 있다. 따라서 DTO를 사용하여 Entity와 API 응답을 분리하면 클라이언트와 서버 사이의 API Contract를 더 명확하고 안정적으로 관리할 수 있다.**
    
- **Validation** — 요청 검증을 Controller 단에서 수행해야 하는 이유는 무엇인가?
    
    #### Validation이란?
    
    Validation은 **클라이언트가 보낸 요청 데이터가 서버에서 요구하는 조건에 맞는지 확인하는 과정**이다.
    
    예를 들어 도서를 등록할 때 다음과 같은 요청을 받는다고 하자.
    
    ```json
    {
      "categoryId": 1,
      "title": "JPA 공부",
      "description": "JPA 학습용 도서"
    }
    ```
    
    정상적인 도서 등록을 위해서는 `categoryId`가 존재해야 하고, `title`이 비어 있으면 안 되는 등의 조건이 필요할 수 있다.
    
    이러한 조건을 확인하지 않으면 잘못된 데이터가 Service나 데이터베이스까지 전달될 수 있다.
    
    ```
    잘못된 요청
        ↓
    Controller
        ↓
    Service
        ↓
    Repository
        ↓
    Database
    ```
    
    Validation을 통해 잘못된 요청을 앞에서 차단하면 다음과 같이 처리할 수 있다.
    
    ```
    잘못된 요청
        ↓
    Controller
        ↓
    Validation
        ↓
    오류 응답
    
    Service까지 전달되지 않음
    ```
    
    #### DTO를 이용한 요청 검증
    
    Spring에서는 요청 DTO에 검증 조건을 지정할 수 있다.
    
    이번 실습에서는 `CreateBookRequest`에 다음과 같이 검증 조건을 작성했다.
    
    ```java
    public record CreateBookRequest(
            @NotNull Long categoryId,
            @NotBlank @Size(max = 100) String title,
            String description
    ) {
    }
    ```
    
    각각의 어노테이션은 다음과 같은 조건을 의미한다.
    
    | 어노테이션 | 의미 |
    | --- | --- |
    | `@NotNull` | 값이 `null`이면 안 됨 |
    | `@NotBlank` | 문자열이 `null`, 빈 문자열, 공백만 있는 문자열이면 안 됨 |
    | `@Size(max = 100)` | 문자열의 길이가 최대 100자를 넘으면 안 됨 |
    
    이렇게 DTO에 **어떤 값이 유효한 요청인지에 대한 조건**을 정의할 수 있다.
    
    #### `@Valid`의 역할
    
    DTO에 검증 조건을 작성했다고 해서 무조건 Controller에서 자동으로 검증되는 것은 아니다.
    
    Controller에서 요청 데이터를 받을 때 `@Valid`를 사용하면 DTO에 작성한 검증 조건을 검사할 수 있다.
    
    ```java
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookResponse createBook(
            @Valid @RequestBody CreateBookRequest request
    ) {
        return bookService.createBook(request);
    }
    ```
    
    여기서 각각의 역할을 구분하면 다음과 같다.
    
    ```
    @RequestBody
    → 요청으로 전달된 JSON을 CreateBookRequest로 변환
    
    @Valid
    → CreateBookRequest에 작성된 검증 조건을 확인
    ```
    
    예를 들어 다음과 같이 제목이 비어 있는 요청이 들어왔다고 하자.
    
    ```json
    {
      "categoryId": 1,
      "title": "",
      "description": "설명"
    }
    ```
    
    `title`에는 `@NotBlank`가 지정되어 있으므로 검증을 통과하지 못한다.
    
    ```
    HTTP 요청
        ↓
    Controller
        ↓
    @RequestBody
    JSON → CreateBookRequest
        ↓
    @Valid
    검증 조건 확인
        ↓
    title이 비어 있음
        ↓
    검증 실패
        ↓
    400 Bad Request
    ```
    
    따라서 잘못된 요청이 Service의 `createBook()`까지 전달되는 것을 막을 수 있다.
    
    #### 요청 검증을 Controller 단에서 수행하는 이유
    
    Controller는 **외부의 HTTP 요청이 애플리케이션 내부로 들어오는 입구**이다.
    
    따라서 요청 데이터의 형식이나 기본적인 조건이 올바른지 입구에서 먼저 확인하면, 잘못된 데이터를 Service나 Repository까지 전달하지 않을 수 있다.
    
    예를 들어 검증을 하지 않는다면 Service에서 다음과 같은 값을 받을 수도 있다.
    
    ```
    categoryId = null
    title = ""
    ```
    
    그러면 Service나 Repository에서 잘못된 값을 처리해야 하고, 경우에 따라 데이터베이스에서 오류가 발생할 수도 있다.
    
    반면 Controller에서 요청 DTO를 검증하면,
    
    ```
    Client
       ↓
    Controller
       ↓
    Validation
     ↙      ↘
    성공      실패
     ↓        ↓
    Service   400 Bad Request
    ```
    
    **기본적인 요청 형식이 잘못된 경우 애플리케이션 내부 로직을 실행하기 전에 요청을 거절할 수 있다.**
    
    #### 모든 검증을 Controller에서 해야 할까?
    
    모든 검증을 Controller에서 처리하는 것은 아니다.
    
    **요청 값 자체의 형식이나 기본 조건**과 **비즈니스 로직을 확인해야 알 수 있는 조건**은 구분할 필요가 있다.
    
    이번 도서 등록 API를 예로 들면 다음과 같다.
    
    ```
    title이 비어 있는가?
    → 요청 데이터 자체만 보고 판단 가능
    → DTO Validation
    
    categoryId가 null인가?
    → 요청 데이터 자체만 보고 판단 가능
    → DTO Validation
    
    categoryId에 해당하는 카테고리가 실제로 존재하는가?
    → DB를 조회해야 판단 가능
    → Service 
    ```
    
    실제 코드에서도 이러한 차이가 나타난다.
    
    **DTO에서 기본적인 요청 값 검증**
    
    ```java
    public record CreateBookRequest(
            @NotNull Long categoryId,
            @NotBlank @Size(max = 100) String title,
            String description
    ) {
    }
    ```
    
    **Service에서 카테고리 존재 여부 확인**
    
    ```java
    Category category = categoryRepository.findById(request.categoryId())
            .orElseThrow(() ->
                    new IllegalArgumentException("존재하지 않는 카테고리입니다.")
            );
    ```
    
    즉, **Controller 단에서는 요청 데이터 자체가 올바른지 검증하고, Service에서는 실제 비즈니스 규칙을 검증하는 방식으로 역할을 나눌 수 있다.**
    
    #### Validation의 장점
    
    - 잘못된 요청을 애플리케이션의 입구에서 빠르게 차단할 수 있다.
    - 잘못된 데이터가 Service나 Repository까지 전달되는 것을 방지할 수 있다.
    - DTO에 검증 조건을 작성하여 어떤 요청이 유효한지 명확하게 표현할 수 있다.
    - 잘못된 요청에 `400 Bad Request`와 같은 적절한 응답을 반환할 수 있다.
    
    #### Validation 사용 시 고려할 점
    
    - 요청 값 검증과 비즈니스 규칙 검증의 역할을 적절하게 구분해야 한다.
    - 검증 조건이 많아지면 DTO의 Validation 규칙도 함께 관리해야 한다.
    - 단순히 검증 실패 여부만 반환하기보다 어떤 값이 잘못되었는지 적절한 오류 응답을 제공하는 것도 중요하다.
    
    #### 정리
    
    **Controller는 외부 요청이 애플리케이션으로 들어오는 입구이므로 DTO와 `@Valid`를 이용해 요청 값의 기본적인 조건을 먼저 검증하는 것이 좋다. 이를 통해 잘못된 요청이 Service나 Repository까지 전달되는 것을 막을 수 있다. 다만 데이터베이스 조회나 비즈니스 로직이 필요한 검증까지 모두 Controller에서 처리하는 것은 아니며, 이러한 검증은 Service에서 처리하여 역할을 구분한다.**
    
- **N+1 Query** — 관계 데이터를 함께 조회할 때 쿼리가 예상보다 많이 실행되는 이유는 무엇인가?
    
    #### N+1 Query란?
    
    N+1 Query 문제는 **Entity 목록을 조회하기 위해 1번의 쿼리를 실행한 뒤, 각 Entity와 연관된 데이터를 가져오기 위해 추가 쿼리가 반복해서 실행되는 문제**이다.
    
    예를 들어 이번 실습에서는 `Book`과 `Category`가 다음과 같은 관계를 가지고 있다.
    
    ```
    Category 1 : N Book
    
    하나의 Category
          ↓
    여러 개의 Book
    ```
    
    `Book` Entity에서도 다음과 같이 `Category`와의 관계를 설정했다.
    
    ```java
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
    ```
    
    여기서 `FetchType.LAZY`는 **연관된 `Category`를 처음부터 바로 조회하지 않고, 실제로 필요한 시점에 조회하는 지연 로딩 방식**이다.
    
    #### 지연 로딩(Lazy Loading)이란?
    
    지연 로딩은 **연관된 Entity를 실제로 사용할 때 조회하는 방식**이다.
    
    예를 들어 다음 코드로 `Book` 목록을 조회했다고 하자.
    
    ```java
    List<Book> books = bookRepository.findAll();
    ```
    
    이때 먼저 `Book`을 조회하는 SQL이 실행된다.
    
    ```sql
    SELECT * FROM book;
    ```
    
    `Category`가 `LAZY`로 설정되어 있다면 이 시점에는 각 `Book`의 `Category` 데이터를 바로 가져오지 않을 수 있다.
    
    이후 다음과 같이 카테고리 이름을 사용하면,
    
    ```java
    book.getCategory().getName();
    ```
    
    필요한 `Category`를 가져오기 위한 추가 쿼리가 실행될 수 있다.
    
    #### N+1 문제는 어떻게 발생할까?
    
    예를 들어 데이터베이스에서 `Book` 3개를 조회했다고 하자.
    
    ```
    Book 1 → Category A
    Book 2 → Category B
    Book 3 → Category C
    ```
    
    먼저 전체 `Book`을 가져오는 쿼리가 **1번** 실행된다.
    
    ```sql
    SELECT * FROM book;
    ```
    
    이후 각각의 `Book`에서 `Category`의 정보를 사용하면 연관된 데이터를 가져오기 위한 쿼리가 추가로 실행될 수 있다.
    
    ```sql
    SELECT * FROM category WHERE category_id = 1;
    SELECT * FROM category WHERE category_id = 2;
    SELECT * FROM category WHERE category_id = 3;
    ```
    
    결과적으로 다음과 같이 된다.
    
    ```
    Book 목록 조회
         ↓
    SELECT book...       ← 1번
         ↓
    Book 1의 Category 조회 ← 추가 쿼리
    Book 2의 Category 조회 ← 추가 쿼리
    Book 3의 Category 조회 ← 추가 쿼리
         ↓
    총 1 + N번의 쿼리가 실행될 수 있음
    ```
    
    여기서 처음 목록을 가져오는 **1개의 쿼리 + 조회된 N개의 Entity에 대한 추가 쿼리**가 발생할 수 있기 때문에 이를 **N+1 Query 문제**라고 부른다.
    
    #### 이번 실습에서는 어디에서 발생할 수 있을까?
    
    이번 실습의 `BookResponse`에서는 다음과 같이 `Book` Entity를 DTO로 변환했다.
    
    ```java
    public static BookResponse from(Book book) {
        return new BookResponse(
                book.getBookId(),
                book.getTitle(),
                book.getDescription(),
                book.getCategory().getName(),
                book.getIsAvailable()
        );
    }
    ```
    
    여기서 중요한 부분은 다음 코드이다.
    
    ```
    book.getCategory().getName()
    ```
    
    `Book` 목록을 조회할 때 `Category`가 지연 로딩되어 있다면, DTO로 변환하면서 `categoryName`을 가져오는 시점에 `Category`를 조회하기 위한 추가 쿼리가 실행될 수 있다.
    
    ```
    Book 목록 조회
         ↓
    List<Book>
         ↓
    BookResponse로 변환
         ↓
    book.getCategory().getName()
         ↓
    Category 데이터 필요
         ↓
    추가 SELECT 발생 가능
    ```
    
    따라서 **Entity 목록을 한 번 조회했는데도 연관된 Entity를 사용하는 과정에서 추가 쿼리가 반복적으로 발생할 수 있다.**
    
    #### 왜 문제가 될까?
    
    데이터가 적을 때는 큰 문제가 없어 보일 수 있다.
    
    예를 들어 `Book`이 3개라면 몇 번의 추가 쿼리만 발생한다.
    
    하지만 `Book`이 1,000개이고 각각의 연관 데이터를 조회하기 위해 추가 쿼리가 발생한다면 매우 많은 SQL이 실행될 수 있다.
    
    ```
    Book 3개
    → 최대 1 + 3개의 쿼리
    
    Book 100개
    → 최대 1 + 100개의 쿼리
    
    Book 1,000개
    → 최대 1 + 1,000개의 쿼리
    ```
    
    이처럼 데이터가 많아질수록 데이터베이스와의 통신 횟수가 크게 증가하여 **API의 성능이 떨어질 수 있다.**
    
    다만 실제 추가 쿼리 수는 같은 연관 Entity의 재사용이나 영속성 컨텍스트의 상태 등에 따라 달라질 수 있으므로 항상 정확히 `N+1`번이 실행된다는 의미는 아니다.
    
    #### Fetch Join을 이용한 해결
    
    N+1 문제를 해결하는 대표적인 방법 중 하나는 **Fetch Join**이다.
    
    Fetch Join은 필요한 연관 Entity를 처음 조회할 때 함께 가져오는 방법이다.
    
    JPQL에서는 다음과 같이 작성할 수 있다.
    
    ```java
    @Query("""
        SELECT b
        FROM Book b
        JOIN FETCH b.category
        ORDER BY b.bookId DESC
    """)
    List<Book> findAllWithCategory();
    ```
    
    이렇게 조회하면 `Book`과 필요한 `Category`를 하나의 조회 과정에서 함께 가져올 수 있다.
    
    ```
    기존 방식
    
    Book 조회
       ↓
    Category 필요
       ↓
    추가 쿼리 반복
    
    Fetch Join
    
    Book + Category
           ↓
       함께 조회
           ↓
    Category를 사용할 때
    추가 조회가 필요하지 않음
    ```
    
    따라서 연관 데이터를 사용할 것이 미리 정해져 있다면 Fetch Join 등을 이용하여 필요한 데이터를 함께 조회함으로써 N+1 문제를 줄일 수 있다.
    
    #### N+1 Query의 문제점
    
    - 조회하는 Entity가 많아질수록 추가 SQL이 많이 실행될 수 있다.
    - 데이터베이스와의 통신 횟수가 증가하여 성능이 저하될 수 있다.
    - 코드만 봐서는 추가 SQL이 실행되는 것을 알아차리기 어려울 수 있다.
    - 개발 환경에서는 데이터가 적어 문제가 드러나지 않다가 실제 데이터가 많아졌을 때 성능 문제가 나타날 수 있다.
    
    #### 지연 로딩의 장점도 있다
    
    그렇다고 `LAZY` 자체가 나쁜 것은 아니다.
    
    연관된 데이터가 필요하지 않은 상황에서는 처음부터 함께 조회하지 않기 때문에 **불필요한 데이터를 가져오지 않을 수 있다는 장점**이 있다.
    
    따라서 모든 연관관계를 무조건 함께 조회하기보다는, **실제로 연관 데이터가 필요한 조회에서는 Fetch Join 등을 사용하고 필요하지 않은 경우에는 지연 로딩을 활용하는 방식**으로 상황에 맞게 사용하는 것이 중요하다.
    
    #### 정리
    
    **N+1 Query 문제는 Entity 목록을 조회하는 1번의 쿼리 이후, 각 Entity의 연관 데이터를 가져오기 위한 추가 쿼리가 반복적으로 실행되는 문제이다. 특히 지연 로딩된 연관 Entity를 반복해서 사용하는 과정에서 발생할 수 있으며, 데이터가 많아질수록 데이터베이스와의 통신 횟수가 증가하여 성능이 저하될 수 있다. 필요한 연관 데이터를 함께 조회해야 하는 경우에는 Fetch Join 등의 방법을 이용하여 N+1 문제를 줄일 수 있다.**
    
- **Migration과 synchronize** — 운영 환경에서 자동 스키마 변경이 위험한 이유는 무엇인가?
    
    #### 데이터베이스 스키마란?
    
    데이터베이스 스키마(Schema)는 **데이터베이스의 구조를 정의한 것**이다.
    
    예를 들어 `book` 테이블에 어떤 컬럼이 있고, 각 컬럼의 자료형이나 제약조건이 무엇인지 등이 스키마에 포함된다.
    
    ```
    book
    ├─ book_id       BIGINT
    ├─ category_id   BIGINT
    ├─ title         VARCHAR(100)
    ├─ description   TEXT
    └─ is_available  BOOLEAN
    ```
    
    개발을 진행하다 보면 Entity가 변경되면서 데이터베이스 구조도 함께 변경해야 하는 경우가 생긴다.
    
    예를 들어 `Book`에 출판사 정보를 추가한다고 하자.
    
    ```java
    private String publisher;
    ```
    
    데이터베이스에도 이에 맞는 컬럼이 필요하다.
    
    ```sql
    ALTER TABLE book
    ADD COLUMN publisher VARCHAR(100);
    ```
    
    이처럼 애플리케이션이 변경됨에 따라 **데이터베이스의 구조도 변경하고 관리해야 한다.**
    
    #### synchronize란?
    
    synchronize는 **Entity의 구조에 맞춰 데이터베이스 스키마를 자동으로 변경하는 방식**을 의미한다.
    
    ORM이 애플리케이션의 Entity와 현재 데이터베이스 구조를 비교하고 필요한 테이블이나 컬럼을 자동으로 생성하거나 변경하는 방식이다.
    
    개념적으로 보면 다음과 같다.
    
    ```
    Entity 변경
        ↓
    ORM이 DB 스키마와 비교
        ↓
    필요한 스키마 변경
        ↓
    Database 자동 반영
    ```
    
    JPA/Hibernate에서는 비슷한 역할을 하는 설정으로 Hibernate의 스키마 자동 생성 기능을 사용할 수 있다.
    
    예를 들어 Spring Boot에서는 다음과 같은 설정이 있다.
    
    ```yaml
    spring:
      jpa:
        hibernate:
          ddl-auto: update
    ```
    
    `update`를 사용하면 애플리케이션 실행 시 Entity와 데이터베이스의 차이를 확인하여 스키마 변경을 시도할 수 있다.
    
    이번 실습에서는 다음과 같이 `validate`를 사용했다.
    
    ```yaml
    spring:
      jpa:
        hibernate:
          ddl-auto: validate
    ```
    
    `validate`는 **Entity와 데이터베이스 스키마가 맞는지 확인하지만, 데이터베이스 구조를 자동으로 변경하지는 않는다.**
    
    #### Migration이란?
    
    Migration은 **데이터베이스 스키마의 변경 내용을 파일로 작성하고 순서대로 적용하여 관리하는 방식**이다.
    
    예를 들어 `book` 테이블에 `publisher` 컬럼을 추가해야 한다면 다음과 같은 변경 내용을 작성할 수 있다.
    
    ```sql
    ALTER TABLE book
    ADD COLUMN publisher VARCHAR(100);
    ```
    
    이러한 변경 내용을 Migration 파일로 남겨두면,
    
    ```
    초기 테이블 생성
          ↓
    book에 publisher 컬럼 추가
          ↓
    book에 새로운 인덱스 추가
    ```
    
    처럼 **데이터베이스가 어떤 과정을 거쳐 현재 구조가 되었는지 기록할 수 있다.**
    
    Java/Spring 환경에서는 Flyway나 Liquibase 같은 도구를 이용하여 Migration을 관리할 수 있다.
    
    #### synchronize와 Migration의 차이
    
    두 방식의 가장 큰 차이는 **DB 구조 변경을 ORM에게 자동으로 맡기는지, 변경 내용을 명시적으로 기록하고 관리하는지**이다.
    
    | 구분 | synchronize 방식 | Migration 방식 |
    | --- | --- | --- |
    | 스키마 변경 | ORM이 자동으로 처리 | 변경 내용을 직접 작성하여 적용 |
    | 변경 기록 | 명확하게 남기기 어려움 | Migration 파일로 남음 |
    | 변경 내용 확인 | 실행 전 파악하기 어려울 수 있음 | 적용할 변경 내용을 미리 확인 가능 |
    | 개발 환경 | 편리하게 사용할 수 있음 | 초기 설정이 조금 더 필요함 |
    | 운영 환경 | 주의가 필요함 | 일반적으로 관리하기 적합함 |
    
    #### 운영 환경에서 자동 스키마 변경이 위험한 이유
    
    개발 환경에서는 데이터베이스의 데이터가 중요하지 않거나 다시 만들 수 있기 때문에 자동 스키마 변경이 편리할 수 있다.
    
    하지만 운영 환경에는 실제 사용자의 데이터가 저장되어 있기 때문에 상황이 다르다.
    
    예를 들어 Entity에서 어떤 필드를 삭제하거나 변경했다고 하자.
    
    ```java
    // 기존
    private String description;
    
    // 변경 후
    private String bookDescription;
    ```
    
    개발자는 단순히 변수 이름만 변경했다고 생각할 수 있지만, 자동 스키마 변경 도구가 이를 **기존 컬럼의 이름 변경이 아니라 기존 컬럼과 다른 새로운 컬럼**으로 판단할 수도 있다.
    
    잘못된 스키마 변경이 운영 데이터베이스에 바로 적용되면 데이터 손실이나 애플리케이션 오류가 발생할 수 있다.
    
    ```
    Entity 변경
        ↓
    애플리케이션 실행
        ↓
    DB 스키마 자동 변경
        ↓
    예상하지 못한 변경 발생 가능
        ↓
    데이터 손실 / 서비스 오류
    ```
    
    또한 여러 서버가 동일한 운영 데이터베이스를 사용하는 환경에서는 애플리케이션 실행 시 자동으로 스키마를 변경하는 방식보다 **어떤 변경을 언제 적용할지 명확하게 관리하는 것이 중요하다.**
    
    #### Migration을 사용하는 이유
    
    Migration을 사용하면 데이터베이스 변경 사항을 파일로 관리할 수 있다.
    
    ```
    Entity 수정
        ↓
    Migration 파일 작성
        ↓
    변경 내용 검토
        ↓
    Migration 적용
        ↓
    Database 변경
    ```
    
    따라서 운영 데이터베이스에 적용하기 전에 **어떤 SQL이 실행되고 어떤 구조가 변경되는지 확인할 수 있다.**
    
    또한 Migration 파일을 Git과 같은 버전 관리 시스템에서 관리하면 애플리케이션 코드와 함께 데이터베이스의 변경 이력도 확인할 수 있다.
    
    #### 자동 스키마 변경의 장점
    
    - 개발 과정에서 Entity를 수정한 뒤 DB 구조를 직접 수정해야 하는 작업을 줄일 수 있다.
    - 테스트나 초기 개발 환경에서 빠르게 스키마를 구성할 수 있다.
    - Entity와 데이터베이스 구조를 맞추는 작업이 간편하다.
    
    #### 자동 스키마 변경의 단점
    
    - ORM이 예상과 다른 방식으로 스키마를 변경할 수 있다.
    - 운영 데이터가 있는 테이블을 잘못 변경하면 데이터 손실이나 서비스 장애로 이어질 수 있다.
    - 실제 적용될 스키마 변경을 사전에 검토하고 통제하기 어렵다.
    - 데이터베이스의 변경 과정을 명확한 이력으로 관리하기 어렵다.
    
    #### 정리
    
    **synchronize 방식은 Entity와 데이터베이스 구조를 자동으로 맞춰주기 때문에 개발 환경에서는 편리하지만, 운영 환경에서는 예상하지 못한 스키마 변경이나 데이터 손실이 발생할 위험이 있다. 따라서 운영 환경에서는 스키마를 자동으로 변경하기보다 Migration을 통해 변경 내용을 명시적으로 작성하고 검토한 뒤 적용하는 방식이 더 안전하다.**
