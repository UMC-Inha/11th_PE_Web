- **JPA / Hibernate와 TypeORM** — ORM과 구현체·라이브러리의 역할은 어떻게 다른가?
    
    #### ORM이란?
    
    ⇒ ORM(Object-Relational Mapping)은 프로그래밍 언어의 객체와 데이터베이스의 테이블을 연결(매핑)해 주는 기술
    
    ⇒ ORM은 개념(기술 방식)이고, 이를 실제로 사용하려면 표준 명세나 라이브러리가 필요
    
    #### JPA
    
    - JPA(Java Persistence API, 현 Jakarta Persistence)는 자바에서 ORM을 사용하는 방법을 정한 표준 명세(인터페이스)입니다.
    - `@Entity`, `@Id`, `EntityManager` 같은 규칙과 인터페이스만 정의합니다.
    - 실제로 SQL을 만들고 실행하는 동작 코드는 없습니다.
    
    #### Hibernate
    
    Hibernate는 JPA 명세를 실제로 구현한 구현체입니다.
    
    - JPA 인터페이스대로 동작하는 코드를 제공해, 실제로 SQL을 생성하고 실행합니다.
    - 다른 구현체(EclipseLink 등)로 바꿔도 JPA 인터페이스만 사용했다면 코드를 거의 수정하지 않아도 됩니다.
    - 스프링에서는 보통 Spring Data JPA → JPA → Hibernate 순서로 감싸서 사용합니다.
    
    #### TypeORM
    
    TypeORM은 TypeScript/JavaScript용 ORM 라이브러리입니다.
    
    - 별도의 표준 명세 없이, 사용 방법(API)과 실제 동작(구현)을 하나의 라이브러리가 모두 제공합니다.
    - NestJS에서 `@nestjs/typeorm`으로 많이 사용합니다.
    
    #### 정리
    
    - **ORM**은 개념, **JPA**는 자바의 표준 규칙, **Hibernate**는 그 규칙의 구현체입니다.
    - **TypeORM**은 표준과 구현이 나뉘지 않고, 하나의 라이브러리가 규칙과 구현을 모두 담당합니다.
    
- **Entity Lifecycle과 Persistence Context** — 엔티티를 저장할 때 즉시 SQL이 실행되지 않을 수 있는 이유는 무엇인가?
    
    #### Persistence Context(영속성 컨텍스트)란?
    
    JPA에서 엔티티를 보관하고 관리하는 메모리 공간
    
    `EntityManager`를 통해 접근하며, 보통 트랜잭션 하나당 하나가 만들어진다.
    
    **주요 기능**
    
    - **1차 캐시**: 한 번 조회한 엔티티를 보관해, 같은 id로 다시 조회하면 DB에 가지 않고 캐시에서 반환합니다.
    - **쓰기 지연**: INSERT, UPDATE 등의 SQL을 바로 실행하지 않고 모아 두었다가 트랜잭션 커밋 시점에 한 번에 실행합니다.
    - **변경 감지(Dirty Checking)**: 엔티티의 값을 바꾸기만 해도, 커밋 시점에 처음 상태와 비교해 UPDATE SQL을 자동으로 만듭니다.
    
    #### Entity Lifecycle(엔티티 생명주기)이란?
    
    엔티티가 영속성 컨텍스트와 어떤 관계에 있는지를 나타내는 상태입니다.
    
    | 상태 | 설명 | 예시 |
    | --- | --- | --- |
    | 비영속(New / Transient) | 객체만 만들고 영속성 컨텍스트와 관계가 없는 상태 | `new User()` |
    | 영속(Managed) | 영속성 컨텍스트가 관리하는 상태 | `em.persist(user)`, 조회한 엔티티 |
    | 준영속(Detached) | 관리되다가 분리된 상태 (변경 감지 안 됨) | `em.detach(user)`, 트랜잭션 종료 후 |
    | 삭제(Removed) | 삭제가 예약된 상태 | `em.remove(user)` |
    
    ```tsx
    @Transactional
    public void createUser() {
        User user = new User("지후");   // 비영속
        em.persist(user);               // 영속 — 아직 INSERT 실행 안 됨 (쓰기 지연 저장소에 보관)
        user.setName("김지후");          // 변경 감지 대상
    }                                   // 커밋 시점에 flush → SQL 실행
    ```
    
    `persist()`를 호출해도 SQL은 바로 실행되지 않음
    
    ⇒ 왜?
    
    ⇒ 영속성 컨텍스트가 SQL을 모았다가 flush 시점(트랜잭션 커밋, JPQL 실행 직전, `em.flush()` 호출)에 한 번에 보냅니다.
    
    ⇒ 왜…?
    
    ⇒ 여러 SQL을 모아 보내 DB 통신 횟수를 줄이고, 같은 엔티티를 여러 번 수정해도 최종 상태만 반영할 수 있습니다. 트랜잭션 중 오류가 나면 SQL을 보내지 않고 롤백하기도 쉽습니다.
    
- **DTO와 API Contract** — Entity를 그대로 응답하면 어떤 문제가 생길까?
    
    #### DTO
    
    - DTO(Data Transfer Object)는 계층 간, 또는 서버와 클라이언트 간에 데이터를 주고받기 위해 만든 객체입니다. DB 구조가 아니라 API에 필요한 데이터 모양에 맞춰 만듭니다.
    
    #### API Contract
    
    API 계약은 서버와 클라이언트가 약속한 요청·응답의 형식입니다. 어떤 필드가 어떤 타입으로 오고 가는지를 정한 것으로, 함부로 바뀌면 프론트엔드가 깨집니다.
    
    #### Entity를 그대로 응답하면 생기는 문제
    
    | 문제 | 이유 |
    | --- | --- |
    | 민감 정보 노출 | 비밀번호, 내부 관리용 필드 등 DB의 모든 컬럼이 응답에 포함됩니다. |
    | API 계약이 DB 구조에 묶임 | 컬럼 이름을 바꾸거나 추가하면 **응답 형식도 같이 바뀌어** 프론트엔드가 깨질 수 있습니다. |
    | 순환 참조 | `User → posts → Post → user → ...`처럼 양방향 관계가 있으면 JSON 변환 중 무한 반복이나 에러가 발생합니다. |
    | 불필요한 데이터·추가 쿼리 | 필요 없는 관계 데이터까지 응답에 포함되고, 지연 로딩 설정에 따라 추가 쿼리(N+1)가 실행될 수 있습니다. |
    | 요청에도 Entity를 쓰면 | 클라이언트가 `role: "admin"`처럼 **바꾸면 안 되는 필드까지 보내 수정**할 수 있습니다. |
    
    ```tsx
    // Entity를 그대로 반환
    @Get(":id")
    findOne(@Param("id") id: number) {
      return this.userRepository.findOneBy({ id });
      // { id, name, email, password, role, createdAt, ... } 전부 노출
    }
    ```
    
    #### DTO로 해결하기
    
    ```tsx
    // 응답 DTO
    export class UserResponseDto {
      id: number;
      name: string;
      email: string;
    
      static from(user: User): UserResponseDto {
        const dto = new UserResponseDto();
        dto.id = user.id;
        dto.name = user.name;
        dto.email = user.email;
        return dto;
      }
    }
    
    // Service
    async findOne(id: number): Promise<UserResponseDto> {
      const user = await this.userRepository.findOneBy({ id });
      if (!user) throw new NotFoundException();
      return UserResponseDto.from(user);
    }
    ```
    
- **Validation** — 요청 검증을 Controller 단에서 수행해야 하는 이유는 무엇인가?
    
    #### Validation이란?
    
    - 클라이언트가 보낸 요청 데이터가 올바른지 확인하는 과정입니다.
    - 필수 값이 있는지, 타입이 맞는지, 형식(이메일, 길이 등)이 맞는지 검사합니다.
    
    #### Controller 단에서 검증해야 하는 이유
    
    - **외부 입력이 처음 들어오는 경계**: Controller는 요청이 서버에 들어오는 입구입니다. 입구에서 막으면 잘못된 데이터가 Service, DB까지 들어가지 않습니다.
    - **빠른 실패(Fail Fast)**: 비즈니스 로직이나 DB 조회를 하기 전에 거르므로 불필요한 작업과 비용이 줄어듭니다.
    - **Service는 비즈니스 로직에 집중**: Service 메서드마다 `if (!name)` 같은 형식 검사를 반복하지 않아도 됩니다.
    - **일관된 에러 응답**: 검증 실패 시 항상 같은 형식의 400 Bad Request를 응답할 수 있어 프론트엔드가 처리하기 쉽습니다.
    
    #### NestJS에서의 검증
    
    ```tsx
    // DTO에 검증 규칙 선언
    import { IsEmail, IsString, Length } from "class-validator";
    
    export class CreateUserDto {
      @IsString()
      @Length(2, 10)
      name: string;
    
      @IsEmail()
      email: string;
    }
    
    // main.ts — 전역 ValidationPipe 등록
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,            // DTO에 없는 필드는 제거
        forbidNonWhitelisted: true, // DTO에 없는 필드가 오면 에러
        transform: true,            // 요청 데이터를 DTO 클래스 인스턴스로 변환
      })
    );
    
    // Controller
    @Post()
    create(@Body() dto: CreateUserDto) {
      return this.userService.create(dto); // 여기 도착한 dto는 이미 검증 완료
    }
    ```
    
- **N+1 Query** — 관계 데이터를 함께 조회할 때 쿼리가 예상보다 많이 실행되는 이유는 무엇인가?
    
    #### N+1 문제
    
    목록을 조회하는 쿼리 1번을 실행했는데, 각 항목의 관계 데이터를 가져오기 위해 쿼리가 N번 추가로 실행되는 문제입니다.
    
    - 게시글 100개 조회(1번) + 각 게시글의 작성자 조회(100번) = **총 101번**
    
    #### 발생하는 이유
    
    - ORM은 관계 데이터를 필요한 시점에 따로 조회하는 경우가 많습니다(지연 로딩).
    - 목록을 먼저 가져온 뒤, 반복문에서 각 항목의 관계 데이터에 접근하면 그때마다 쿼리가 1번씩 실행됩니다.
    - 코드에서는 단순히 `post.author`에 접근하는 것처럼 보이므로 쿼리가 늘어나는 것을 알아차리기 어렵습니다.
    
    ```tsx
    // 문제 코드
    const posts = await this.postRepository.find(); // 쿼리 1번: SELECT * FROM post
    
    for (const post of posts) {
      const author = await this.userRepository.findOneBy({ id: post.authorId });
      // 게시글마다 쿼리 1번씩: SELECT * FROM user WHERE id = ?  → N번
    }
    ```
    
    #### 해결 방법 — JOIN으로 한 번에 조회
    
    ```tsx
    // 방법 1: relations 옵션
    const posts = await this.postRepository.find({
      relations: { author: true },
    });
    
    // 방법 2: QueryBuilder
    const posts = await this.postRepository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.author", "author")
      .getMany();
    ```
    
- **Migration과 synchronize** — 운영 환경에서 자동 스키마 변경이 위험한 이유는 무엇인가?
    
    #### synchronize
    
    TypeORM에서 `synchronize: true`로 설정하면, 앱이 시작될 때 Entity 코드와 DB 스키마를 비교해 자동으로 테이블을 변경합니다. (JPA의 `ddl-auto: update`와 비슷합니다.)
    
    #### Migration
    
    DB 스키마 변경 내용을 파일로 기록하고, 순서대로 적용·되돌릴 수 있게 관리하는 방식입니다. Git이 코드 변경 이력을 관리하듯, Migration은 DB 구조의 변경 이력을 관리합니다.
    
    #### 운영 환경에서 synchronize가 위험한 이유
    
    | 위험 | 이유 |
    | --- | --- |
    | 데이터 손실 | 컬럼 이름만 바꿔도 **기존 컬럼을 삭제하고 새 컬럼을 추가**하는 방식으로 처리되어 데이터가 사라질 수 있습니다. 타입 변경도 마찬가지입니다. |
    | 실행 전 확인 불가 | 어떤 SQL이 실행될지 **미리 보거나 리뷰할 수 없습니다**. 앱이 시작되는 순간 바로 적용됩니다. |
    | 되돌리기 어려움 | 변경 이력이 남지 않아 문제가 생겨도 **이전 상태로 롤백**하기 어렵습니다. |
    | 예상치 못한 시점에 실행 | 서버를 재시작하거나 여러 인스턴스가 동시에 뜰 때마다 스키마 변경이 실행될 수 있습니다. |
    | 환경 간 불일치 | 개발·스테이징·운영 DB가 각자 자동 변경되어 구조가 서로 달라질 수 있습니다. |