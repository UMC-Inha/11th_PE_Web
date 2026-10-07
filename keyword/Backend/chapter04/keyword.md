- **JPA / Hibernate와 TypeORM** — ORM과 구현체·라이브러리의 역할은 어떻게 다른가?
    
    # JPA / Hibernate와 TypeORM
    
    ## ORM이란?
    
    > 객체와 관계형 DB의 테이블을 **매핑하여 데이터를 다루는 기술**
    > 
    
    애플리케이션에서는 객체를 사용하지만, 관계형 DB에서는 테이블과 행으로 데이터를 저장한다.
    
    ORM은 이 두 표현 방식을 연결한다.
    
    | 애플리케이션 | 관계형 DB |
    | --- | --- |
    | 클래스 | 테이블 |
    | 객체의 속성 | 컬럼 |
    | 객체 인스턴스 | 행 |
    | 객체 사이의 참조 | 테이블 사이의 관계 |
    
    예를 들어 `Book` 객체의 `title` 속성을 `book` 테이블의 `title` 컬럼에 연결할 수 있다.
    
    ```
    Book 객체
    ├─ id: 1
    └─ title: "달빛 도서관"
    
    				|
         ORM 매핑
    		    |
    
    book 테이블
    ┌────┬─────────────┐
    │ id │ title       │
    ├────┼─────────────┤
    │ 1  │ 달빛 도서관 │
    └────┴─────────────┘
    ```
    
    ORM을 사용하더라도 DB에서는 SQL이 실행된다. ORM은 **객체를 이용한 작업을 DB 작업으로 연결하는 역할**을 한다.
    
    ---
    
    ## JPA
    
    > Java에서 ORM을 사용하기 위한 **표준 명세**
    > 
    
    JPA는 원래 **Java Persistence API**의 약자였으며, 현재 공식 명칭은 **Jakarta Persistence**이다.
    
    JPA는 엔티티를 어떻게 정의하고, 저장·조회하며, 생명주기를 관리할지에 대한 공통 API와 동작 규칙을 정한다.
    
    ```java
    @Entity
    public class Book {
    
        @Id
        private Long id;
    
        private String title;
    }
    ```
    
    여기서 `@Entity`, `@Id`는 객체와 DB의 매핑을 표현하는 표준 애너테이션이다.
    
    하지만 JPA는 **규칙을 정한 명세**이므로, 실제 SQL 생성과 엔티티 관리를 수행할 구현체가 필요하다.
    
    ---
    
    ## Hibernate
    
    > JPA 명세를 구현하는 대표적인 **ORM 구현체**
    > 
    
    Hibernate는 JPA에서 정의한 API와 규칙을 실제로 동작하게 만든다.
    
    ```
    애플리케이션
         ↓
    JPA API 사용
         ↓
    Hibernate가 동작 구현
         ↓
    JDBC를 통해 SQL 실행
         ↓
    DB
    ```
    
    예를 들어 애플리케이션이 `EntityManager.persist()`를 호출하면, Hibernate는 해당 엔티티를 관리하고 필요한 DB 작업을 수행한다.
    
    Hibernate는 JPA 표준 기능뿐 아니라 자체 API와 확장 기능도 제공한다.
    
    따라서 **JPA와 Hibernate는 경쟁하는 두 제품이 아니라, 명세와 구현체의 관계**로 이해하는 것이 적절하다.
    
    ---
    
    ## TypeORM
    
    > JavaScript·TypeScript 환경에서 사용하는 **ORM 라이브러리**
    > 
    
    TypeORM도 엔티티와 테이블을 매핑하고, 객체를 이용해 저장·조회 등의 작업을 수행한다.
    
    ```tsx
    import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";
    
    @Entity()
    export class Book {
      @PrimaryGeneratedColumn()
      id!: number;
    
      @Column()
      title!: string;
    }
    ```
    
    저장은 다음과 같이 처리할 수 있다.
    
    ```tsx
    const book = bookRepository.create({
      title: "달빛 도서관",
    });
    
    await bookRepository.save(book);
    ```
    
    여기서 `create()`는 객체를 만들고, `save()`는 DB 저장 작업을 수행한다.
    
    TypeORM은 **JPA를 구현한 라이브러리가 아니다.** JavaScript·TypeScript 환경에서 자체 API와 동작 방식으로 ORM 기능을 제공한다.
    
    ---
    
    ## 각각의 역할 비교
    
    | 구분 | 정체 | 역할 |
    | --- | --- | --- |
    | ORM | 기술·기법 | 객체와 관계형 데이터를 연결 |
    | JPA | Java의 표준 명세 | ORM의 API와 동작 규칙 정의 |
    | Hibernate | ORM 구현체 | JPA 규칙을 구현하고 확장 기능 제공 |
    | TypeORM | ORM 라이브러리 | JavaScript·TypeScript에서 ORM 기능 제공 |
    
    ```
    ORM이라는 공통 개념
    ├─ Java: JPA 명세 → Hibernate 등의 구현체
    └─ JavaScript·TypeScript: TypeORM 등의 라이브러리
    ```
    
    같은 ORM이라도 **변경 감지, SQL 실행 시점, 관계 로딩 방식**은 다를 수 있다.
    
    따라서 JPA에서 배운 동작을 TypeORM에도 그대로 적용해서 이해하면 안 된다.
    
- **Entity Lifecycle과 Persistence Context** — 엔티티를 저장할 때 즉시 SQL이 실행되지 않을 수 있는 이유는 무엇인가?
    
    # Entity Lifecycle과 Persistence Context
    
    ## Entity란?
    
    > DB에 저장되는 데이터와 연결되며, **식별자를 통해 구분되는 객체**
    > 
    
    예를 들어 `Book` 엔티티는 도서 정보를 표현한다.
    
    ```java
    Book book = new Book();
    book.setId(1L);
    book.setTitle("달빛 도서관");
    ```
    
    하지만 엔티티 객체를 만들었다고 DB에 자동으로 저장되는 것은 아니다.
    
    **메모리에 객체가 존재하는 것**과 **DB에 행이 저장되는 것**은 구분해야 한다.
    
    ---
    
    ## Persistence Context
    
    > JPA에서 엔티티 인스턴스와 그 상태를 관리하는 **영속성 컨텍스트**
    > 
    
    영속성 컨텍스트는 관리 중인 엔티티의 식별자와 상태를 추적한다.
    
    같은 영속성 컨텍스트에서는 같은 엔티티 식별자에 대해 하나의 관리 인스턴스를 유지한다.
    
    ```
    애플리케이션
         ↓
    EntityManager
         ↓
    영속성 컨텍스트
    ├─ 관리 중인 엔티티
    └─ 변경 상태
         ↓
    DB와 동기화
    ```
    
    DB 연결 자체나 애플리케이션 전체에서 공유하는 캐시와는 다른 개념이다.
    
    JPA의 엔티티 생명주기는 **객체가 이 관리 대상에 포함되어 있는지**와 밀접하게 연결된다.
    
    ---
    
    ## 엔티티의 생명주기
    
    | 상태 | 의미 |
    | --- | --- |
    | 비영속(New / Transient) | 새로 생성되었으며 영속성 컨텍스트가 관리하지 않음 |
    | 영속(Managed) | 영속성 컨텍스트가 관리함 |
    | 준영속(Detached) | 관리되던 객체가 관리 대상에서 분리됨 |
    | 삭제(Removed) | 관리 중인 엔티티가 삭제 대상으로 지정됨 |
    
    ### 비영속
    
    ```java
    Book book = new Book();
    book.setTitle("달빛 도서관");
    ```
    
    → 일반적인 객체를 생성한 상태이며, 이것만으로 INSERT가 실행되지는 않음
    
    ### 영속
    
    ```java
    entityManager.persist(book);
    ```
    
    → 새로운 엔티티가 영속성 컨텍스트의 관리 대상이 됨
    
    ### 준영속
    
    ```java
    entityManager.detach(book);
    ```
    
    → 해당 객체가 관리 대상에서 분리됨
    
    이후 객체의 값을 변경하더라도 JPA가 그 변경을 자동으로 DB에 반영하지 않는다.
    
    ### 삭제
    
    ```java
    entityManager.remove(book);
    ```
    
    → 관리 중인 엔티티를 삭제 대상으로 지정함
    
    이 상태 변경과 실제 DELETE 실행 시점은 구분해야 한다.
    
    ---
    
    ## 저장할 때 즉시 SQL이 실행되지 않을 수 있는 이유
    
    > JPA의 저장 요청은 곧바로 SQL 실행을 의미하기보다, **관리 상태 변경과 DB 동기화를 요청하는 동작**이기 때문이다.
    > 
    
    JPA 구현체는 엔티티 변경을 추적하다가 필요한 시점에 DB와 동기화할 수 있다.
    
    ```
    엔티티 생성
         ↓
    persist() 호출
         ↓
    영속성 컨텍스트에서 관리
         ↓
    DB 동기화 시점
         ↓
    INSERT 등 필요한 SQL 실행
    ```
    
    다만 **모든 INSERT가 항상 커밋까지 미뤄지는 것은 아니다.**
    
    예를 들어 Hibernate에서 DB의 자동 증가 키를 사용하는 `IDENTITY` 전략은 식별자를 얻기 위해 INSERT를 일찍 실행해야 하는 경우가 있다.
    
    SQL 실행 시점은 식별자 생성 전략, flush 모드, 수행하는 작업 등에 따라 달라진다.
    
    ---
    
    ## Flush
    
    > 영속성 컨텍스트의 변경 사항을 **DB와 동기화하는 작업**
    > 
    
    명시적으로 실행할 수 있다.
    
    ```tsx
    entityManager.persist(book);
    
    entityManager.flush();
    ```
    
    → 아직 반영되지 않은 변경을 DB에 동기화함
    
    일반적으로 다음과 같은 시점에 동기화가 발생할 수 있다.
    
    - `flush()`를 직접 호출할 때
    - 트랜잭션을 커밋할 때
    - AUTO 모드에서 미반영 변경이 조회 결과에 영향을 주는 쿼리를 실행할 때
    
    ### Flush와 Commit의 차이
    
    | 구분 | 역할 |
    | --- | --- |
    | Flush | 변경 내용을 DB에 동기화 |
    | Commit | 트랜잭션의 변경을 최종 확정 |
    
    ```
    flush로 SQL 실행
           ↓
    트랜잭션은 아직 진행 중
           ↓
    commit 또는 rollback
    ```
    
    따라서 **SQL이 실행되었다는 것과 변경이 커밋되었다는 것은 다르다.** 트랜잭션이 지원되는 작업이라면 flush 이후에도 롤백될 수 있다.
    
    ---
    
    ## 변경 감지
    
    > 관리 중인 엔티티의 변경을 추적하여 **필요한 UPDATE를 반영하는 기능**
    > 
    
    일반적인 JPA 트랜잭션 안에서 다음처럼 작성할 수 있다.
    
    ```tsx
    Book book = entityManager.find(Book.class, 1L);
    
    book.setTitle("변경된 제목");
    ```
    
    관리 중인 엔티티라면 별도의 수정 저장 호출 없이도, 동기화 과정에서 변경이 DB에 반영될 수 있다.
    
    단, 준영속 객체나 읽기 전용 설정 등은 구분해야 한다. **모든 Java 객체의 변경이 자동으로 저장되는 것은 아니다.**
    
    ---
    
    ## TypeORM에도 같은 방식이 적용될까?
    
    TypeORM의 일반적인 Repository 사용은 JPA의 변경 감지 방식과 다르다.
    
    ```tsx
    const book = await bookRepository.findOneByOrFail({
      id: 1,
    });
    
    book.title = "변경된 제목";
    ```
    
    위 코드처럼 객체의 속성만 변경했다고 DB가 자동으로 수정되지는 않는다.
    
    ```tsx
    await bookRepository.save(book);
    ```
    
    또는 다음처럼 명시적인 수정 작업을 수행해야 한다.
    
    ```tsx
    await bookRepository.update(
      { id: 1 },
      { title: "변경된 제목" },
    );
    ```
    
    `await save()`는 저장 작업의 완료를 기다리는 것이며, JPA의 `persist()`처럼 단순히 나중의 flush를 위한 등록으로 이해하면 안 된다.
    
    다만 바깥쪽 트랜잭션 안에서 실행했다면, **저장 SQL 실행 완료와 전체 트랜잭션 커밋은 여전히 별개**이다.
    
- **DTO와 API Contract** — Entity를 그대로 응답하면 어떤 문제가 생길까?
    
    # DTO와 API Contract
    
    ## DTO란?
    
    > 계층이나 시스템 사이에서 **전달할 데이터의 형태를 정의하는 객체**
    > 
    
    DTO는 **Data Transfer Object**의 약자이다.
    
    웹 API에서는 요청과 응답의 형태를 표현하는 데 자주 사용한다.
    
    | 구분 | 역할 |
    | --- | --- |
    | 요청 DTO | 클라이언트가 보낼 수 있는 데이터 정의 |
    | 응답 DTO | 서버가 외부에 제공할 데이터 정의 |
    | Entity | DB 매핑과 영속 데이터 표현 |
    
    예를 들어 도서 등록 요청에는 제목과 카테고리 ID가 필요하지만, 생성 시각이나 DB 식별자는 클라이언트가 직접 지정하지 않도록 할 수 있다.
    
    ```tsx
    export class CreateBookDto {
      title!: string;
      categoryId!: number;
    }
    ```
    
    → 클라이언트가 입력할 데이터를 명확하게 구분함
    
    ---
    
    ## API Contract
    
    > 클라이언트와 서버가 데이터를 주고받을 때 지켜야 하는 **인터페이스의 약속**
    > 
    
    API 계약에는 단순히 필드 이름만 포함되는 것이 아니다.
    
    | 항목 | 예시 |
    | --- | --- |
    | 요청 경로와 메서드 | `POST /books` |
    | 요청 필드 | `title`, `categoryId` |
    | 타입과 필수 여부 | 제목은 필수 문자열 |
    | 응답 구조 | `id`, `title`, `categoryName` |
    | 상태 코드 | 생성 성공 시 `201` |
    | 오류 형식 | 오류 코드와 메시지 |
    | 값의 의미 | 시간대, 날짜 형식, NULL 허용 여부 |
    
    DTO는 이 계약의 데이터 구조를 코드로 표현하는 수단이다.
    
    다만 DTO만 선언한다고 문서화나 런타임 검증이 모두 자동으로 완성되지는 않는다. 검증 도구와 API 문서 설정 등이 함께 필요하다.
    
    ---
    
    ## Entity를 그대로 응답하면 생길 수 있는 문제
    
    ### 내부 정보 노출
    
    회원 Entity에 다음과 같은 값이 있을 수 있다.
    
    ```
    User Entity
    ├─ id
    ├─ nickname
    ├─ email
    ├─ passwordHash
    └─ internalMemo
    ```
    
    이를 별도 처리 없이 직렬화하면 응답 대상 객체에 포함된 민감 정보나 내부 관리 값이 노출될 수 있다.
    
    **DB에 저장해야 하는 데이터와 클라이언트에게 보여줄 데이터는 다르다.**
    
    ### DB 구조와 API 구조의 결합
    
    Entity의 필드 이름이나 관계 구조를 바꾸었을 때 API 응답도 바뀔 수 있다.
    
    ```
    Entity 구조 변경
           ↓
    응답 구조 변경
           ↓
    기존 프론트엔드 코드에 영향
    ```
    
    응답 DTO를 분리하면 내부 구조가 바뀌어도 기존 API의 형태를 유지하기 쉽다.
    
    ### 관계 직렬화 문제
    
    양방향 관계가 실제 객체에 연결되어 있으면 순환 참조나 지나치게 큰 응답이 발생할 수 있다.
    
    ```
    Book → Category → Books → Category → ...
    ```
    
    또한 ORM과 직렬화 방식에 따라 관계 접근이 추가 조회를 유발하거나, 초기화되지 않은 지연 로딩 관계 때문에 오류가 발생할 수 있다.
    
    이런 동작은 JPA/Hibernate와 TypeORM에서 동일하지 않으므로 구분해야 한다.
    
    ---
    
    ## 응답 DTO로 필요한 값만 선택하기
    
    ```tsx
    export class BookResponseDto {
      id!: number;
      title!: string;
    }
    ```
    
    응답을 만들 때 필요한 필드만 명시적으로 선택한다.
    
    ```tsx
    function toBookResponse(book: Book): BookResponseDto {
      return {
        id: book.id,
        title: book.title,
      };
    }
    ```
    
    응답은 다음처럼 제한된다.
    
    ```json
    {
      "id": 1,
      "title": "달빛 도서관"
    }
    ```
    
    ### 타입 선언만으로 필드가 제거될까?
    
    ```tsx
    const response: BookResponseDto = book;
    ```
    
    이처럼 타입만 지정해도 실제 객체의 다른 속성이 자동으로 제거되는 것은 아니다.
    
    TypeScript 타입은 런타임 객체를 잘라내는 기능이 아니다. **명시적으로 새 응답 객체를 만들거나, 직렬화 설정을 적용해야 한다.**
    
    또한 다음 방식은 Entity의 다른 속성을 함께 복사할 수 있으므로 주의해야 한다.
    
    ```tsx
    return { ...book };
    ```
    
    DTO의 목적은 클래스 이름을 하나 더 만드는 것이 아니라 **외부에 전달할 데이터의 범위를 명확하게 관리하는 것**이다.
    
- **Validation** — 요청 검증을 Controller 단에서 수행해야 하는 이유는 무엇인가?
    
    # Validation
    
    ## Validation이란?
    
    > 입력된 데이터가 **정해진 형식과 조건을 만족하는지 확인하는 과정**
    > 
    
    예를 들어 도서 등록 요청에서는 다음을 확인할 수 있다.
    
    ```
    title
    → 문자열인가?
    → 빈 문자열은 아닌가?
    → 최대 길이를 넘지 않는가?
    
    categoryId
    → 정수인가?
    → 1 이상인가?
    ```
    
    프론트엔드에서 입력 검사를 하더라도 서버 검증은 필요하다. 사용자는 브라우저 화면을 거치지 않고 API를 직접 호출할 수 있기 때문이다.
    
    ---
    
    ## Controller 단에서 검증하는 이유
    
    > 외부 입력이 들어오는 경계에서 잘못된 요청을 걸러내기 위해서이다.
    > 
    
    ```
    클라이언트 요청
           ↓
    요청 형식 검증
           ↓
    Controller
           ↓
    Service
           ↓
    DB
    ```
    
    잘못된 요청을 초기에 거르면 불필요한 서비스 처리와 DB 접근을 줄이고, 일관된 오류 응답을 제공할 수 있다.
    
    다만 “Controller 단에서 검증한다”는 말은 **Controller 메서드에 모든 검사 코드를 직접 작성하라는 뜻이 아니다.**
    
    NestJS에서는 `ValidationPipe`처럼 Controller가 실행되기 전에 동작하는 기능을 사용할 수 있다.
    
    ---
    
    ## DTO에 검증 규칙 작성하기
    
    다음은 NestJS와 `class-validator`를 사용하는 예시이다.
    
    ```tsx
    import {IsInt, IsNotEmpty, IsString, MaxLength, Min} from "class-validator";
    
    export class CreateBookDto {
      @IsString()
      @IsNotEmpty()
      @MaxLength(100)
      title!: string;
    
      @IsInt()
      @Min(1)
      categoryId!: number;
    }
    ```
    
    검증 파이프를 전역으로 적용할 수 있다.
    
    ```tsx
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    ```
    
    | 옵션 | 역할 |
    | --- | --- |
    | `whitelist` | 검증 데코레이터가 없는 속성을 제외하는 기준 적용 |
    | `forbidNonWhitelisted` | 허용되지 않은 속성이 있으면 제거 대신 오류 처리 |
    | `transform` | 요청 데이터를 DTO 인스턴스 등으로 변환 |
    
    DTO를 Controller에서 사용한다.
    
    ```tsx
    @Post()
    create(@Body() dto: CreateBookDto) {
      return this.bookService.create(dto);
    }
    ```
    
    단, `transform: true`만으로 모든 DTO 필드의 문자열이 원하는 숫자로 자동 변환되는 것은 아니다. 쿼리 문자열 등은 별도의 변환 설정이나 Pipe가 필요할 수 있다.
    
    ---
    
    ## 타입과 검증의 차이
    
    ```tsx
    categoryId!: number;
    ```
    
    이 선언은 TypeScript 코드에서 기대하는 타입을 표현한다.
    
    하지만 외부 요청은 런타임에 들어오기 때문에 다음과 같은 값도 전송될 수 있다.
    
    ```json
    {
      "title": "달빛 도서관",
      "categoryId": "잘못된 값"
    }
    ```
    
    따라서 **타입 선언만으로 외부 입력이 안전해지는 것은 아니다.**
    
    또한 `@IsNotEmpty()`는 공백만 있는 문자열을 반드시 차단해 주는 검증이 아니다. `"   "`도 거부하려면 공백 정리나 추가 규칙이 필요하다.
    
    ---
    
    ## 모든 검증을 Controller에서 해야 할까?
    
    요청의 형식 검증과 업무 규칙 검증은 구분해야 한다.
    
    | 검증 위치 | 확인할 내용 | 예시 |
    | --- | --- | --- |
    | 요청 경계 | 형식과 기본 조건 | 제목이 문자열인지 |
    | Service·Domain | 업무 규칙 | 현재 대여 가능한 책인지 |
    | 인증·인가 계층 | 접근 권한 | 해당 대여를 취소할 권한이 있는지 |
    | DB | 최종 데이터 무결성 | FK, UNIQUE, NOT NULL |
    
    `categoryId`가 양의 정수라는 사실과 **그 카테고리가 실제로 존재한다는 사실**은 다르다.
    
    또한 “아직 등록되지 않은 값인가?”를 조회로 확인했더라도, 다른 요청이 동시에 같은 값을 등록할 수 있다. 중복을 확실하게 막아야 한다면 DB의 UNIQUE 제약조건 등도 필요하다.
    
    → 요청 검증은 입구에서 수행하되, **업무 규칙과 데이터 무결성은 각각의 책임을 가진 계층에서도 보장해야 한다.**
    
- **N+1 Query** — 관계 데이터를 함께 조회할 때 쿼리가 예상보다 많이 실행되는 이유는 무엇인가?
    
    # N+1 Query
    
    ## N+1 Query란?
    
    > 목록을 조회한 뒤 각 항목의 연관 데이터를 따로 조회하면서 **추가 쿼리가 반복되는 문제**
    > 
    
    예를 들어 책 N권과 각 책의 카테고리를 화면에 보여준다고 하자.
    
    ```
    책 목록 조회 → 1번
    
    각 책의 카테고리 조회
    → 최대 N번 추가
    
    전체 → 1 + N번
    ```
    
    화면에서는 목록 한 번을 조회하는 것처럼 보이지만, DB에는 여러 번 요청할 수 있다.
    
    단, 캐시나 이미 로딩된 관계, 같은 카테고리의 반복 여부에 따라 실제 쿼리 수는 달라질 수 있다.
    
    ---
    
    ## 반복문 안의 개별 조회
    
    TypeORM에서 다음과 같이 작성하면 추가 조회가 반복된다.
    
    ```tsx
    const books = await bookRepository.find();
    
    for (const book of books) {
      const category =
        await categoryRepository.findOneBy({
          id: book.categoryId,
        });
    
      console.log(book.title, category?.name);
    }
    ```
    
    책이 10권이라면 목록 조회 1번과 카테고리 조회 10번이 실행되는 구조이다.
    
    ```sql
    SELECT * FROM book;
    
    SELECT * FROM category WHERE id = ?;
    SELECT * FROM category WHERE id = ?;
    SELECT * FROM category WHERE id = ?;
    -- 책마다 반복
    ```
    
    이 문제는 ORM에만 한정되지 않는다. Raw SQL로 작성하더라도 반복문 안에서 개별 조회를 하면 같은 구조가 발생한다.
    
    ---
    
    ## 지연 로딩과 N+1
    
    > 관계 데이터가 필요해지는 시점에 조회하는 방식이 **지연 로딩(Lazy Loading)**이다.
    > 
    
    TypeORM에서 지연 관계가 다음처럼 정의되어 있다고 하자.
    
    ```tsx
    @ManyToOne(() => Category)
    category!: Promise<Category>;
    ```
    
    해당 관계에 접근하면서 추가 쿼리가 발생할 수 있다.
    
    ```tsx
    for (const book of books) {
      const category = await book.category;
      console.log(category.name);
    }
    ```
    
    JPA/Hibernate에서도 초기화되지 않은 관계에 접근하면서 조회가 발생할 수 있다.
    
    반대로 일반적인 TypeORM 관계가 조회되지 않았다고 해서, **단순 속성 접근만으로 항상 자동 조회되는 것은 아니다.** 지연 관계 설정과 조회 방식을 확인해야 한다.
    
    ---
    
    ## Eager로 바꾸면 해결될까?
    
    즉시 로딩은 관계를 미리 가져오도록 하는 설정이지만, **반드시 하나의 JOIN 쿼리로 가져온다는 의미는 아니다.**
    
    특히 Hibernate에서는 조회 방식에 따라 즉시 로딩 관계를 별도 쿼리로 채우면서 추가 조회가 발생할 수 있다.
    
    따라서 N+1을 해결하려면 로딩 설정 이름만 바꾸기보다 **해당 화면에서 필요한 데이터를 어떤 쿼리로 가져올지** 정해야 한다.
    
    ---
    
    ## JOIN으로 함께 조회하기
    
    TypeORM에서는 다음처럼 필요한 관계를 함께 조회할 수 있다.
    
    ```tsx
    const books = await bookRepository
      .createQueryBuilder("book")
      .leftJoinAndSelect("book.category", "category")
      .getMany();
    ```
    
    개념적으로 다음과 같은 SQL을 실행한다.
    
    ```sql
    SELECT
        b.id,
        b.title,
        c.id,
        c.name
    FROM book b
    LEFT JOIN category c
        ON b.category_id = c.id;
    ```
    
    → 책마다 카테고리를 별도 조회하는 구조를 줄임
    
    JPA에서는 필요한 관계를 fetch join으로 조회하는 방법이 있다.
    
    ```sql
    select b
    from Book b
    left join fetch b.category
    ```
    
    일반 JOIN과 fetch join은 목적이 다르다. fetch join은 연관 엔티티를 함께 가져와 관계를 로딩하도록 지시한다.
    
    ---
    
    ## 일괄 조회 방식
    
    항상 JOIN 한 번만이 정답은 아니다.
    
    다음처럼 필요한 ID를 모아서 한 번에 조회할 수도 있다.
    
    ```
    책 목록 조회
          ↓
    카테고리 ID를 중복 없이 수집
          ↓
    IN 조건으로 카테고리 일괄 조회
          ↓
    ID 기준으로 결과 연결
    ```
    
    ```sql
    SELECT *
    FROM category
    WHERE id IN (1, 2, 3);
    ```
    
    목표는 반드시 쿼리 수를 1개로 만드는 것이 아니라 **항목 수에 비례해 개별 요청이 반복되는 구조를 줄이는 것**이다.
    
    ---
    
    ## 해결할 때 주의할 점
    
    일대다 관계를 JOIN하면 결과 행이 늘어날 수 있다.
    
    ```
    책 1권 + 리뷰 20개
    → SQL 결과에서 책 정보가 20번 반복될 수 있음
    ```
    
    여러 컬렉션을 동시에 JOIN하거나 페이지네이션과 함께 사용하면 데이터량과 처리 방식이 복잡해질 수 있다.
    
    따라서 다음을 함께 확인해야 한다.
    
    - 한 요청에서 실행된 SQL 개수
    - 실제 조회된 행 수
    - 가져오는 컬럼과 데이터 크기
    - 실행 시간
    - 페이지네이션 결과의 정확성
    
    또한 `Promise.all()`로 개별 조회를 동시에 실행해도 **쿼리 개수가 줄어드는 것은 아니다.** N+1 구조 자체를 해결한 것으로 볼 수 없다.
    
- **Migration과 synchronize** — 운영 환경에서 자동 스키마 변경이 위험한 이유는 무엇인가?
    
    # Migration과 synchronize
    
    ## 스키마란?
    
    > DB의 테이블, 컬럼, 자료형, 제약조건 등 **데이터를 저장하는 구조**
    > 
    
    예를 들어 다음은 도서 테이블의 구조이다.
    
    ```
    book
    ├─ id: 정수, PK
    ├─ title: 문자열, NOT NULL
    └─ description: 문자열, NULL 허용
    ```
    
    서비스가 발전하면 새 컬럼을 추가하거나 기존 자료형과 제약조건을 변경해야 한다.
    
    이때 중요한 것은 **새로운 구조뿐 아니라 이미 저장된 데이터도 함께 유지하는 것**이다.
    
    ---
    
    ## synchronize
    
    > Entity 정의와 DB 스키마를 비교해 **스키마를 자동으로 맞추는 TypeORM 기능**
    > 
    
    ```tsx
    const dataSource = new DataSource({
      // 연결 정보와 Entity 설정 등은 생략
      type: "mysql",
      synchronize: true,
    });
    ```
    
    자동 스키마 동기화를 활성화하면 초기화 과정에서 Entity 정의에 맞추어 DB 구조를 변경할 수 있다.
    
    개발 초기에는 편리하다.
    
    ```
    Entity 수정
         ↓
    애플리케이션 초기화
         ↓
    DB 스키마 자동 변경
    ```
    
    다만 이 기능은 **스키마를 맞추는 기능이지, 기존 데이터를 어떤 의미로 변환해야 하는지 판단하는 기능은 아니다.**
    
    ---
    
    ## 운영 환경에서 위험한 이유
    
    ### 데이터 손실 가능성
    
    컬럼 이름이나 자료형을 변경했을 때, 자동 변경이 기존 데이터를 보존하는 방식으로 이루어질 것이라고 보장할 수 없다.
    
    변경 내용과 DB에 따라 컬럼 삭제·재생성이나 데이터 변환 문제가 발생할 수 있다.
    
    ### 기존 데이터와 제약조건 충돌
    
    기존 행에 NULL이 있는데 NOT NULL 제약조건을 추가하거나, 중복 데이터가 있는데 UNIQUE를 추가하면 변경에 실패할 수 있다.
    
    ### 서비스 영향
    
    큰 테이블의 구조 변경은 DB 종류와 작업에 따라 잠금이나 긴 처리 시간을 유발할 수 있다.
    
    애플리케이션 시작 과정에서 예상하지 못한 DDL이 실행되면 배포와 서비스 시작에도 영향을 줄 수 있다.
    
    → 운영에서는 변경 내용을 미리 확인하고 적용 순서를 통제하기 위해 `synchronize: false`와 마이그레이션을 사용하는 방식이 일반적이다.
    
    ---
    
    ## Migration
    
    > DB 구조와 필요한 데이터 변경을 **순서가 있는 파일로 기록하고 적용하는 방식**
    > 
    
    예를 들어 설명 컬럼을 추가하는 변경을 파일로 남긴다.
    
    ```tsx
    import {
      MigrationInterface,
      QueryRunner,
    } from "typeorm";
    
    export class AddBookDescription1760000000000
      implements MigrationInterface
    {
      async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          ALTER TABLE book
          ADD COLUMN description VARCHAR(500) NULL
        `);
      }
    
      async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          ALTER TABLE book
          DROP COLUMN description
        `);
      }
    }
    ```
    
    위 SQL은 MySQL 기준 예시이다.
    
    | 메서드 | 역할 |
    | --- | --- |
    | `up()` | 변경 적용 |
    | `down()` | 해당 변경을 되돌리는 작업 |
    
    마이그레이션 도구는 적용 이력을 기록하여 어떤 변경이 실행되었는지 관리한다.
    
    ```
    첫 번째 마이그레이션 → book 테이블 생성
    두 번째 마이그레이션 → description 컬럼 추가
    세 번째 마이그레이션 → 인덱스 추가
    ```
    
    이 파일을 코드와 함께 관리하면 개발·테스트·운영 환경에 적용할 변경을 검토할 수 있다.
    
    ---
    
    ## 자동 생성된 Migration도 검토해야 한다
    
    마이그레이션 파일을 자동 생성할 수 있어도, 결과가 업무 의도까지 이해한 것은 아니다.
    
    예를 들어 `name`을 `title`로 바꾸려는 경우 다음 두 작업은 의미가 다르다.
    
    ```
    기존 컬럼의 이름 변경
    → 기존 값을 유지하려는 목적
    
    기존 컬럼 삭제 후 새 컬럼 추가
    → 기존 값이 손실될 수 있음
    ```
    
    따라서 자동 생성된 SQL도 확인해야 한다.
    
    필수 컬럼 추가처럼 기존 데이터 처리가 필요한 변경은 다음과 같이 단계적으로 설계할 수 있다.
    
    ```
    NULL을 허용하는 새 컬럼 추가
                ↓
    기존 데이터 채우기
                ↓
    애플리케이션을 새 구조에 대응
                ↓
    데이터 검증 후 NOT NULL 적용
    ```
    
    이는 운영 중인 이전 코드와 새 코드가 함께 동작할 수 있는지도 고려해야 하는 작업이다.
    
    ---
    
    ## Migration이면 항상 안전할까?
    
    마이그레이션은 **변경을 검토하고 재현할 수 있게 만드는 수단**이지, 위험을 자동으로 없애는 기능은 아니다.
    
    특히 `down()`이 있다고 데이터까지 복구되는 것은 아니다.
    
    ```
    up: 컬럼 추가
    down: 컬럼 삭제
    ```
    
    이때 컬럼에 이미 저장된 값은 `down()`으로 삭제될 수 있다.
    
    또한 DB마다 DDL의 트랜잭션 지원이 다르다. MySQL의 여러 DDL은 암묵적인 커밋을 발생시키므로, 실패한 스키마 변경 전체가 일반 데이터 트랜잭션처럼 자동 복구된다고 가정하면 안 된다.
    
    | 구분 | synchronize | Migration |
    | --- | --- | --- |
    | 변경 기준 | 현재 Entity와 DB의 차이 | 명시한 변경 파일 |
    | 변경 시점 | 초기화 등 자동 동기화 시점 | 정해진 실행 절차 |
    | 변경 이력 | 순차적인 변경 파일을 남기는 방식은 아님 | 적용 파일과 이력 관리 |
    | 데이터 변환 | 업무 의도를 직접 표현하기 어려움 | 필요한 변환 작업 작성 가능 |
    | 운영 적용 | 자동 변경 위험이 큼 | 검토·테스트 후 통제하여 적용 가능 |
    
    운영 DB 변경에서는 **무엇이 바뀌는지, 기존 데이터는 어떻게 되는지, 이전 코드와 호환되는지**를 확인한 뒤 적용하는 것이 중요하다.