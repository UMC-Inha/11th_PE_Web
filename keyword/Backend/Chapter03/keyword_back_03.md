# 3주차 백엔드 핵심 키워드

## 1. 3계층 아키텍처 이외에 어떤 아키텍처들이 있을까?

### 1) MVC 패턴

- Model(데이터·로직), View(화면), Controller(요청 처리·연결)로 역할 분리
- 서버가 화면(HTML)까지 만들어 주는 전통적인 웹 구조에서 많이 사용

### 2) 클린 아키텍처 / 어니언 아키텍처

- 동심원 구조: 안쪽(Entity, UseCase) → 바깥쪽(Controller, DB, 프레임워크)
- 의존성은 항상 바깥에서 안쪽으로만 향함

### 3) 이벤트 기반 아키텍처 (Event-Driven)

- 서비스끼리 직접 호출하지 않고 이벤트를 발행·구독하며 통신 (Kafka, RabbitMQ 등)
- ex) "주문 완료" 이벤트 → 결제, 알림, 재고 서비스가 각자 처리
- 서비스 간 결합도가 낮아지고 비동기 처리에 유리

### 4) CQRS (Command Query Responsibility Segregation)

- 쓰기(Command)와 읽기(Query) 모델을 분리
- 조회가 많고 복잡한 서비스에서 읽기 전용 DB·모델을 따로 최적화

---

## 2. SQL Injection을 포함한 대표적인 웹 보안 공격 기법

### 1) SQL Injection

⇒ 사용자 입력값에 SQL 구문을 삽입해서, 서버가 의도하지 않은 쿼리를 DB에서 실행하게 만드는 공격

- 로그인 우회
- 데이터 탈취 / 삭제

### 2) XSS (Cross-Site Scripting)

⇒ 웹 페이지에 악성 스크립트를 삽입해서, 그 페이지를 보는 다른 사용자의 브라우저에서 실행시키는 공격

- 쿠키·세션 탈취
- 사용자 몰래 요청 전송
- 피싱 페이지로 이동
- 화면 변조

### 3) DoS / DDoS

⇒ 대량의 요청으로 서버 자원을 고갈시켜 서비스 마비

---

## 3. 커넥션 풀(Connection Pool)이란?

- DB와의 연결(Connection)을 미리 여러 개 만들어 보관(Pool)해 두고, 요청이 오면 빌려주고 작업이 끝나면 반납받아 재사용하는 방식

**왜?**

⇒ DB 연결은 비용이 큰 작업 ⇒ 연결을 매번 새로 만들고 끊는 대신 만들어 둔 연결을 쓰는 것

---

## 4. Raw SQL vs ORM

### 1) Raw SQL

⇒ SQL 쿼리를 문자열로 직접 작성해서 DB에 실행하는 방식

### 2) ORM (Object Relational Mapping)

⇒ DB의 테이블을 코드의 객체(모델·클래스)와 연결(매핑)해서, SQL 대신 메서드 호출로 데이터를 다루는 방식

### 3) 장단점

#### Raw SQL

**장점**

- 실행되는 쿼리를 정확히 알고 통제할 수 있음
- 복잡한 JOIN, 집계, 서브쿼리, DB 전용 기능도 자유롭게 작성
- 인덱스 활용 등 성능 튜닝이 쉬움
- ORM 학습 없이 SQL만 알면 됨

**단점**

- 단순 CRUD도 반복 코드가 많음
- 결과를 객체로 가공하는 작업을 직접 해야 함
- 컬럼 이름 오타 등을 실행해 봐야 알 수 있음
- 문자열을 이어 붙이면 SQL Injection 위험 → 바인딩 필수
- DB 종류를 바꾸면 문법 차이를 직접 수정

#### ORM

**장점**

- CRUD 코드가 짧고 빠르게 작성됨 → 비즈니스 로직에 집중
- 결과가 객체 형태로 오고, 관계 데이터도 자연스럽게 다룸
- 타입 안정성: Prisma는 스키마로 타입을 자동 생성 → 오타를 작성 중에 발견
- 기본적으로 파라미터 바인딩 → SQL Injection 방어
- DB 종류 차이를 ORM이 흡수, 마이그레이션 도구 제공

**단점**

- ORM이 만든 쿼리가 비효율적일 수 있음 (불필요한 컬럼 조회, 과한 JOIN 등)
- 복잡한 쿼리는 ORM 문법으로 표현하기 어렵거나 더 복잡해짐
- 실제로 어떤 SQL이 실행되는지 숨겨져 있어 문제 파악이 어려움
- ORM 자체의 학습 비용 + 결국 SQL 지식도 필요

---

## 5. INSERT 외에 데이터를 다루는 핵심 SQL 문법

⇒ **DML** (Data Manipulation Language) ⇒ `SELECT`, `INSERT`, `UPDATE`, `DELETE` 등

### 1) SELECT — 조회

**기본 문법**

```sql
SELECT 컬럼1, 컬럼2
FROM 테이블명
WHERE 조건
ORDER BY 정렬기준
LIMIT 개수;
```

**예시**

```sql
SELECT * FROM users;                          -- 전체 조회
SELECT name, age FROM users;                  -- 특정 컬럼만
SELECT * FROM users WHERE age >= 25;          -- 조건 조회
SELECT * FROM users ORDER BY age DESC;        -- 나이 내림차순
SELECT * FROM users LIMIT 10 OFFSET 0;        -- 처음 10개
```

### 2) INSERT — 추가

**기본 문법**

```sql
INSERT INTO 테이블명 (컬럼1, 컬럼2)
VALUES (값1, 값2);
```

**예시**

```sql
-- 한 행 추가
INSERT INTO users (name, age) VALUES ('우즈', 25);
-- 여러 행 한 번에 추가
INSERT INTO users (name, age) VALUES ('세라', 24), ('에밀', 23);
```

### 3) UPDATE — 수정

**기본 문법**

```sql
UPDATE 테이블명
SET 컬럼1 = 값1, 컬럼2 = 값2
WHERE 조건;
```

**예시**

```sql
UPDATE users SET age = 26 WHERE id = 1;                 -- 특정 행 수정
UPDATE users SET name = '우즈', age = 26 WHERE id = 1;  -- 여러 컬럼 수정
UPDATE users SET age = age + 1 WHERE id = 3;            -- 기존 값 기준 수정
```

> **`WHERE`를 빼면 테이블의 모든 행이 수정됨**
>
> ⇒ 실행 전에 같은 조건으로 `SELECT`를 먼저 해서 대상이 맞는지 확인하는 것이 좋음

### 4) DELETE — 삭제

**기본 문법**

```sql
DELETE FROM 테이블명
WHERE 조건;
```

**예시**

```sql
DELETE FROM users WHERE id = 3;          -- 특정 행 삭제
DELETE FROM users WHERE age < 20;        -- 조건에 맞는 행 모두 삭제
```

> **`WHERE`를 빼면 모든 행이 삭제됨**
>
> ⇒ 실무에서는 실제로 지우는 대신 `deleted_at` 컬럼에 삭제 시각을 기록하는 소프트 삭제도 많이 사용