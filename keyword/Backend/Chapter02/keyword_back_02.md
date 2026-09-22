# 2주차 핵심 키워드

<details>
<summary><b>1. 요구사항 → SQL로 번역하기</b></summary>

> 찾아보기: 화면 요구사항을 SELECT 컬럼, FROM 테이블, JOIN 관계, WHERE 조건, ORDER BY/LIMIT으로 나누는 방법을 정리해 보세요.

**예시 요구사항**: 안암동에 있는 가게의 진행 가능한 미션을 마감 임박 순으로 10개 보여달라.

| 요구사항 | 질문 | SQL 절 |
| --- | --- | --- |
| 가게 이름, 지급 포인트 | 무엇을 보여줄까? | `SELECT` |
| 미션 | 기준 데이터는 어디? | `FROM` |
| 가게, 지역 정보도 필요 | 어떤 테이블과 연결할까? | `JOIN ... ON` |
| 안암동, 진행 가능한 | 어떤 행만 남길까? | `WHERE` |
| 마감 임박 순 | 어떤 순서로? | `ORDER BY` |
| 10개 | 몇 개만? | `LIMIT` |

</details>

<details>
<summary><b>2. DDL과 DML</b></summary>

> 찾아보기: CREATE TABLE이 테이블 구조를, INSERT가 행 데이터를 담당하는 이유와 ALTER TABLE과의 차이를 살펴보세요.

**DDL (Data Definition Language)**

- 테이블의 **구조**를 정의
- 명령어: `CREATE`, `ALTER`, `DROP`, `TRUNCATE`

**DML (Data Manipulation Language)**

- 테이블 안의 **데이터**를 조작
- 명령어: `SELECT`, `INSERT`, `UPDATE`, `DELETE`

</details>

<details>
<summary><b>3. PK·FK와 JOIN 조건</b></summary>

> 찾아보기: PK·FK가 무엇을 보장하는지, ON 절에서 관계가 잘못 연결되면 왜 중복 행이 생기는지 확인해 보세요.

- **PK**: 개체 무결성 보장 → 각 행을 유일하게 식별 → 같은 행이 두 번 존재하지 않음
- **FK**: 참조 무결성 보장 → 참조하는 값이 부모 테이블에 실제로 존재

**자식의 FK = 부모의 PK를 연결해야 한다.**

</details>

<details>
<summary><b>4. WHERE와 NULL</b></summary>

> 찾아보기: WHERE 조건에서 NULL을 = 과 비교할 수 없는 이유와 IS NULL을 사용하는 이유를 알아보세요.

**WHERE 조건에서 NULL을 `=`과 비교할 수 없는 이유**

- SQL은 참 / 거짓 / UNKNOWN의 **3값 논리**를 사용 → NULL과의 비교 결과는 UNKNOWN
- `NULL = NULL` → UNKNOWN
- WHERE는 참(TRUE)인 행만 통과시킴 → UNKNOWN은 통과하지 못함
- 따라서 `= NULL`로 쓰면 아무 행도 나오지 않음

**IS NULL**

`IS NULL`은 값을 비교하는 게 아니라 **"비어 있는가"를 판정**하는 연산자라서 사용할 수 있다.

</details>

<details>
<summary><b>5. ORDER BY와 일관된 정렬</b></summary>

> 찾아보기: ORDER BY가 없을 때 목록 순서가 보장되지 않는 이유와 동일 값일 때의 보조 정렬 기준을 찾아보세요.

관계형 데이터베이스에서 테이블은 **순서가 없는 행의 집합**이다.
`ORDER BY` 없이 조회하면 DB는 가장 빠르게 읽을 수 있는 순서로 돌려준다.

**보조 정렬 기준**: 첫 번째 기준 값이 같을 때 순서를 정하는 두 번째 기준

- PK처럼 값이 겹치지 않는 컬럼을 사용한다. (꼭 PK일 필요는 없음)

</details>

<details>
<summary><b>6. LIMIT / OFFSET과 페이지네이션</b></summary>

> 찾아보기: LIMIT/OFFSET이 페이지 번호 방식과 어떻게 연결되는지, 데이터가 많아질 때 어떤 한계가 있는지 살펴보세요.

- `LIMIT` → 한 페이지에 보여줄 개수
- `OFFSET` → 앞에서 건너뛸 개수, `OFFSET = (페이지 번호 - 1) × 페이지 크기`

```sql
-- 한 페이지에 10개씩
LIMIT 10 OFFSET 0     -- 1페이지 (1~10번째)
LIMIT 10 OFFSET 10    -- 2페이지 (11~20번째)
LIMIT 10 OFFSET 20    -- 3페이지 (21~30번째)
```

**한계**

**1) 뒤 페이지로 갈수록 느려진다**

`OFFSET 10000`은 실제로 1만 개를 건너뛰는 게 아니라, 1만 개를 읽은 뒤 버리고 그다음 10개를 가져온다.
→ 페이지가 뒤로 갈수록 읽는 양이 계속 증가한다.

**2) 데이터가 바뀌면 중복·누락이 생긴다**

1페이지를 본 뒤 새 내용이 맨 앞에 추가되면 전체가 한 칸씩 밀린다.
→ 다음 페이지에서 이미 본 항목이 다시 나오거나, 삭제 시 항목이 빠진다.

</details>