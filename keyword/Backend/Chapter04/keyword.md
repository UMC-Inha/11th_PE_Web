- **JPA / Hibernate와 TypeORM** — ORM과 구현체·라이브러리의 역할은 어떻게 다른가?

### 개념

ORM(Object-Relational Mapping)은 **객체와 관계형 데이터베이스의 테이블을 연결해 주는 기술**이다.

예를 들어 DB의 book 테이블을 Java에서는 Book 객체로 표현하고, 개발자는 SQL을 매번 직접 작성하기보다 객체와 Repository를 통해 데이터를 조회·저장할 수 있다.

ORM을 사용한다고 SQL이 사라지는 것은 아니다. 내부에서는 여전히 SQL이 실행되며, ORM이 반복적인 CRUD와 객체-테이블 매핑 작업을 대신해 주는 것이다.

### 각각의 역할

- JPA: Java에서 객체와 DB를 어떻게 매핑할지 정의한 표준 명세이다.
- Hibernate: JPA 명세를 실제로 구현한 대표적인 ORM 구현체이다.
- Spring Data JPA: JPA를 더 편리하게 사용할 수 있도록 Repository 기능을 제공한다.
- TypeORM: TypeScript·Node.js 환경에서 사용하는 ORM 라이브러리이다.

즉 Spring에서는 보통 다음 관계로 이해하면 된다.

JPA = 규칙

Hibernate = JPA 규칙을 실제로 구현

Spring Data JPA = JPA를 편하게 사용하도록 도와주는 기능

Spring Data JPA에서는 JpaRepository를 상속하면 기본적인 저장·조회·삭제 기능을 직접 구현하지 않아도 사용할 수 있다. 

### Raw SQL과 비교

3주차에는 SQL 문자열과 파라미터 순서를 직접 관리했다.

Raw SQL

→ SELECT, INSERT 등의 SQL을 직접 작성한다.

ORM

→ Entity와 Repository를 이용해 객체 중심으로 데이터를 다룬다.

다만 복잡한 조회나 성능 문제를 해결하려면 ORM을 사용하더라도 SQL과 JOIN, PK/FK 구조를 이해해야 한다. 

### 핵심 정리

ORM은 DB를 몰라도 되게 만드는 기술이 아니라, **DB 지식을 기반으로 객체와 테이블을 더 편리하게 연결해 주는 기술**이다.

- **Entity Lifecycle과 Persistence Context** — 엔티티를 저장할 때 즉시 SQL이 실행되지 않을 수 있는 이유는 무엇인가?

### 개념

JPA에서 Entity는 단순한 Java 객체가 아니라 **Persistence Context(영속성 컨텍스트)** 안에서 상태를 관리받을 수 있다.

그래서 Entity의 값을 바꿨다고 해서 항상 그 순간 바로 SQL이 실행되는 것은 아니다.

전체 흐름은 다음처럼 이해할 수 있다.

Entity 생성

→ 영속성 컨텍스트에서 관리

→ 값 변경

→ flush 또는 commit

→ 실제 SQL 실행

→ DB 반영

### Entity Lifecycle

추가로 알아두면 좋은 JPA Entity의 대표적인 상태는 다음과 같다.

- 비영속(Transient): 아직 JPA가 관리하지 않는 일반 객체 상태이다.
- 영속(Managed): 영속성 컨텍스트가 관리하는 상태이다.
- 준영속(Detached): 한때 관리되었지만 현재는 영속성 컨텍스트에서 분리된 상태이다.
- 삭제(Removed): 삭제 대상으로 등록된 상태이다.

### 변경 감지(Dirty Checking)

영속 상태의 Entity 값이 변경되면 JPA가 이를 감지해 UPDATE SQL을 만들어낼 수 있다.

즉 개발자가 매번 UPDATE SQL을 직접 작성하지 않아도 된다.

### 1차 캐시

같은 영속성 컨텍스트 안에서 동일한 Entity를 다시 조회할 때, DB를 바로 조회하기 전에 이미 관리 중인 객체를 확인할 수 있다.

### 왜 SQL이 바로 실행되지 않을 수 있는가?

JPA는 여러 변경 작업을 모아 적절한 시점에 DB에 반영할 수 있기 때문이다.

특히 트랜잭션 안에서 Entity를 생성하거나 변경한 뒤 commit 시점에 실제 SQL이 실행될 수 있다. 신규 도서 저장 역시 트랜잭션 안에서 Entity를 생성하고 저장하는 형태로 구성된다. 

### 핵심 정리

JPA는 Entity를 영속성 컨텍스트에서 관리하기 때문에 **객체를 변경한 시점과 실제 SQL 실행 시점이 다를 수 있다.**

- **DTO와 API Contract** — Entity를 그대로 응답하면 어떤 문제가 생길까?

### DTO란?

DTO(Data Transfer Object)는 **클라이언트와 서버 사이에서 주고받을 데이터의 형태를 정의하는 객체**이다.

Entity와 DTO의 역할은 다르다.

Entity

→ DB 구조와 관계를 표현한다.

DTO

→ API 요청과 응답의 형태를 표현한다.

### 왜 Entity를 그대로 응답하면 안 되는가?

Entity를 그대로 API 응답에 사용하면 DB 구조와 API가 강하게 결합된다.

예를 들어 Entity 내부에 DB 관리용 필드나 관계 정보가 추가되면, 의도하지 않게 API 응답에도 노출될 수 있다.

DTO를 사용하면 필요한 값만 골라 반환할 수 있다.

예를 들어 Book Entity가 Category 객체까지 가지고 있어도 실제 API에서는 다음 정도만 전달할 수 있다.

bookId

title

description

categoryName

isAvailable

실제 도서 조회 응답도 DB 내부 컬럼명 대신 API에 필요한 형태의 DTO를 사용하도록 구성되어 있다. 

### API Contract란?

API Contract는 쉽게 말하면 **클라이언트와 서버 사이의 데이터 약속**이다.

예를 들어 신규 도서 등록 API라면:

요청에서는

categoryId, title, description을 받는다.

응답에서는

bookId, title, categoryName 등을 반환한다.

처럼 명확하게 정할 수 있다.

### 장점

- DB 구조와 API 구조의 결합을 줄인다.
- 필요한 데이터만 외부에 공개할 수 있다.
- 요청과 응답 형식을 명확하게 정의할 수 있다.
- Entity가 변경되어도 API 형식을 비교적 안정적으로 유지할 수 있다.

### 핵심 정리

Entity는 **DB 모델**, DTO는 **API 모델**이다.

둘을 분리해야 DB 구조가 외부 API에 그대로 노출되는 것을 막을 수 있다.

- **Validation** — 요청 검증을 Controller 단에서 수행해야 하는 이유는 무엇인가?

### 개념

Validation은 **클라이언트가 보낸 요청 데이터가 서버가 요구하는 조건을 만족하는지 검사하는 과정**이다.

예를 들어 신규 도서 등록 요청에는 다음과 같은 조건이 있을 수 있다.

- categoryId는 반드시 존재해야 한다.
- title은 비어 있으면 안 된다.
- title은 최대 100자여야 한다.
- description은 선택 값이다.

Spring에서는 NotNull, NotBlank, Size 등의 검증 조건을 DTO에 선언하고, Controller에서 Valid를 사용해 요청을 검증할 수 있다. 

### 왜 Controller 단계에서 검증하는가?

잘못된 요청을 가능한 한 빨리 차단하기 위해서이다.

잘못된 요청

→ Validation 실패

→ Service로 전달하지 않음

→ Repository와 DB에도 접근하지 않음

이렇게 하면 Service는 입력 형식 검사보다 실제 비즈니스 로직에 집중할 수 있다.

### Validation과 비즈니스 검증의 차이

두 개는 구분해야 한다.

title이 비어 있는가?

→ Validation

categoryId가 실제 DB에 존재하는가?

→ 비즈니스 검증

즉 데이터의 기본 형식과 조건은 Validation으로 검사하고, 실제 서비스 규칙이나 DB 상태가 필요한 검사는 Service에서 처리하는 것이 자연스럽다.

### 추가로 알아둘 점

Validation 실패는 일반적으로 클라이언트가 잘못된 요청을 보낸 경우이므로 400 Bad Request와 같은 응답으로 처리하는 경우가 많다.

### 핵심 정리

Validation은 **잘못된 요청을 API 입구에서 차단해 이후 계층이 정상 데이터만 처리하도록 만드는 과정**이다.

- **N+1 Query** — 관계 데이터를 함께 조회할 때 쿼리가 예상보다 많이 실행되는 이유는 무엇인가?

### 개념

N+1 문제는 ORM으로 연관 데이터를 조회할 때 **예상보다 많은 SQL이 반복 실행되는 성능 문제**이다.

예를 들어 Book 10개와 각 Book의 Category 이름을 조회한다고 가정한다.

먼저 Book 목록 조회가 1번 실행된다.

그다음 각 Book의 Category를 하나씩 조회한다면:

Book 조회 1번

- Category 조회 10번= 총 11번

이 된다.

그래서 1 + N, 즉 N+1 문제라고 부른다.

### 왜 발생하는가?

Book과 Category가 연관 관계를 가지고 있고, Category가 LAZY Loading으로 설정되어 있다고 가정한다.

Book 자체를 조회할 때는 Category 데이터를 바로 가져오지 않고, 이후 실제로 Category에 접근할 때 추가 SQL이 실행될 수 있다. 

### LAZY와 EAGER

LAZY

→ 실제 연관 데이터가 필요할 때 조회한다.

EAGER

→ Entity를 조회할 때 연관 데이터도 함께 가져오려고 한다.

하지만 N+1을 해결한다고 모든 관계를 EAGER로 바꾸는 것은 좋은 방법이 아니다. 필요 없는 관계까지 함께 조회되어 다른 성능 문제가 생길 수 있다.

### 대표적인 해결 방법

- Fetch Join
- EntityGraph
- DTO Projection
- Batch Fetching

핵심은 어떤 관계를 언제 조회할지 명확하게 설계하는 것이다.

### 중요한 점

N+1은 ORM이 무조건 느리다는 뜻이 아니다.

ORM이 만들어내는 SQL을 확인하지 않고 연관 관계를 무심코 사용했을 때 발생할 수 있는 조회 방식의 문제이다.

### 핵심 정리

N+1은 **연관 데이터를 가져오는 과정에서 1번이면 될 조회가 여러 번 반복되는 문제**이며, ORM을 사용할수록 실제 실행되는 SQL을 확인하는 습관이 중요하다.

- **Migration과 synchronize** — 운영 환경에서 자동 스키마 변경이 위험한 이유는 무엇인가?

### 왜 필요한가?

개발을 진행하다 보면 DB 구조도 계속 바뀐다.

예를 들면:

- 새로운 컬럼 추가
- 컬럼 타입 변경
- FK 추가
- 인덱스 추가
- 테이블 추가

등이 있다.

### 자동 스키마 변경

ORM에서는 Entity 구조를 기준으로 DB 스키마를 자동으로 맞춰주는 기능을 사용할 수 있다.

개발 환경에서는 편하지만 운영 환경에서는 위험할 수 있다.

잘못된 Entity 변경이 실제 DB에 자동으로 적용되면 중요한 컬럼이나 데이터에 영향을 줄 수 있기 때문이다.

Spring에서는 기존 DB 구조를 사용할 때 ddl-auto를 validate로 설정할 수 있다.

validate의 의미는 다음과 같다.

Entity와 실제 DB 구조 비교

→ 같으면 정상 실행

→ 다르면 오류 발생

→ DB 구조 자체는 변경하지 않음

TypeORM에서는 synchronize를 false로 설정하여 자동 변경을 막을 수 있다. 

### Migration이란?

Migration은 **DB 스키마 변경 내용을 버전별 파일로 관리하는 방식**이다.

예를 들어:

V1: book 테이블 생성

V2: publisher 컬럼 추가

V3: index 추가

처럼 변경 이력을 남긴다.

대표적인 도구는 다음과 같다.

- Flyway
- Liquibase

### Migration의 장점

- 언제 어떤 DB 변경이 발생했는지 확인할 수 있다.
- 개발·테스트·운영 환경에 같은 변경을 적용할 수 있다.
- 변경 내용을 Git으로 관리하고 리뷰할 수 있다.
- 문제 발생 시 어떤 변경이 원인이었는지 추적하기 쉽다.

### synchronize와 Migration의 차이

synchronize / 자동 DDL

→ Entity를 기준으로 DB 구조를 자동으로 맞춘다.

Migration

→ 개발자가 변경 내용을 명시적으로 작성하고 순서대로 적용한다.

따라서 개인 개발 환경에서는 자동 변경이 편할 수 있지만, 실제 데이터가 존재하는 운영 환경에서는 Migration 방식이 훨씬 안전하다.

### 핵심 정리

운영 DB에서는 **자동으로 스키마를 바꾸기보다 Migration을 이용해 변경 내용을 명시적으로 관리하는 것이 안전하다.**