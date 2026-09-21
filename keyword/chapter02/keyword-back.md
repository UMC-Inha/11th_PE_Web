- 1. 요구사항 → SQL로 번역하기
    - 찾아보기: 화면 요구사항을 SELECT 컬럼, FROM 테이블, JOIN 관계, WHERE 조건, ORDER BY/LIMIT으로 나누는 방법을 정리해 보세요.
        - 화면 요구사항을 SQL 절 단위로 나눠서 생각
            - SELECT : 화면에 보여 줄 컬럼 / FROM : 기준 테이블
            - JOIN / ON : 다른 테이블 정보, 테이블 간 연결 조건
            - WHERE : 검색 / 제외 조건 / ORDER BY : 정렬 기준 / LIMIT : 가져올 행 수
            - Ex) 최신 리뷰 10개 + 작성자 이름 → FROM review, JOIN user, WHERE 삭제 리뷰 제외, ORDER BY created_at DESC, LIMIT 10
            - ⇒ 어떤 행을 가져올지 FROM → JOIN → WHERE 순서로 먼저 생각하면 요구사항 정리가 편함

**핵심 정리**

요구사항에 대한 SQL 작성은 “화면에 필요한 결과 행의 모양”을 정하는 과정

    - 기준 테이블 선정
        - 목록의 한 행이 무엇인지 먼저 결정
        - 리뷰 목록이면 review, 사용자 목록이면 user를 기준 테이블로 사용
    - JOIN 필요 여부
        - 기준 테이블에 없는 컬럼이 필요할 때만 JOIN
        - JOIN할 때는 관계와 결과 행 수가 1:1인지 1:N인지 함께 확인
    - 조건과 정렬 분리
        - WHERE : 어떤 행을 포함/제외할지
        - ORDER BY : 포함된 행을 어떤 순서로 보여 줄지
        - LIMIT / OFFSET : 정렬된 결과에서 일부만 가져오기
    - 별칭(Alias)
        - 테이블을 짧은 별칭으로 지정하면 JOIN 쿼리 가독성⬆️
        - 같은 이름의 컬럼이 여러 테이블에 있으면 별칭으로 명확히 구분
    - 추가로 알아두면 좋은 내용
        - SELECT 전체 조회보다 필요한 컬럼만 조회하는 습관
        - 사용자 입력값은 문자열 결합 X → 바인딩 파라미터 사용, SQL Injection 방지
        - JOIN 뒤 행 수 증가 시 1:N 관계인지, ON 조건 오류인지 확인
    - 출처 / 참고 자료
        - MySQL 8.4 Reference Manual - SELECT Statement
        - MySQL 8.4 Reference Manual - JOIN Clause
- 2. DDL과 DML
    - 찾아보기: CREATE TABLE이 테이블 구조를, INSERT가 행 데이터를 담당하는 이유와 ALTER TABLE과의 차이를 살펴보세요.
        - DDL(Data Definition Language)은 DB 구조 정의 / 변경
            - CREATE TABLE : 테이블, 컬럼, 제약 조건 생성
            - ALTER TABLE : 기존 테이블 구조 변경
        - DML(Data Manipulation Language)은 테이블 안의 행 데이터 조작
            - INSERT : 행 추가 / UPDATE : 조건에 맞는 행 수정 / DELETE : 행 삭제
            - ⇒ CREATE TABLE은 데이터가 들어갈 틀 생성, INSERT는 그 틀에 실제 데이터 추가

**핵심 정리**

DDL은 DB 설계 자체를 바꾸는 작업, DML은 설계된 테이블 안에서 데이터를 다루는 작업

    - CREATE TABLE
        - 테이블 이름, 컬럼 이름, 데이터 타입을 정의
        - PK, FK, NOT NULL, UNIQUE, DEFAULT 같은 제약 조건도 이 단계에서 설정
    - ALTER TABLE
        - 이미 운영 중인 테이블에 컬럼 추가, 타입 변경, 제약 조건 변경 등을 수행
        - 데이터와 애플리케이션 코드에 영향 가능 → 변경 순서와 호환성 확인 필요
    - INSERT / UPDATE / DELETE
        - INSERT는 새 행 추가
        - UPDATE, DELETE는 WHERE 조건이 없으면 여러 행에 적용될 수 있음 → 실행 전 대상 행 확인
    - 트랜잭션
        - 여러 DML 작업이 하나의 업무 단위라면 모두 성공하거나 모두 실패해야 함
        - Ex) 대여 생성 + 도서 재고 변경
    - 추가로 알아두면 좋은 내용
        - 타입뿐 아니라 NOT NULL, UNIQUE, DEFAULT, PK·FK 같은 제약 조건도 함께 설계
        - ALTER는 기존 데이터와 애플리케이션 코드에 영향 가능 → 마이그레이션 파일로 기록
        - 여러 DML 작업을 함께 성공/실패시켜야 하면 트랜잭션 사용
    - 출처 / 참고 자료
        - MySQL 8.4 Reference Manual - Data Definition Statements
        - MySQL 8.4 Reference Manual - Data Manipulation Statements
- 3. PK·FK와 JOIN 조건
    - 찾아보기: PK·FK가 무엇을 보장하는지, ON 절에서 관계가 잘못 연결되면 왜 중복 행이 생기는지 확인해 보세요.
        - PK(Primary Key) : 각 행을 유일하게 식별 → 중복 X, NULL X
        - FK(Foreign Key) : 다른 테이블의 PK 또는 UNIQUE 값 참조 → 관계 표현, 참조 무결성 유지
        - ON 절에는 실제 관계에 맞는 키 비교 작성
            - ON 조건 누락 / 관련 없는 컬럼 연결 → 행 수가 의도보다 증가 가능
            - 1:N 관계라면 부모 정보가 자식 행 수만큼 반복되는 것은 정상
            - ⇒ 결과의 기준 단위가 무엇인지 먼저 확인

**핵심 정리**

PK와 FK는 단순히 JOIN을 위한 컬럼이 아니라 데이터의 식별과 관계 무결성을 보장하는 장치

    - PK 설계
        - 한 행을 다른 행과 구분하는 유일한 값
        - 단일 컬럼 PK뿐 아니라 여러 컬럼을 합친 복합키도 가능
        - PK 값은 자주 바뀌지 않고 식별 목적에 집중된 값이 적합
    - FK 설계
        - 자식 테이블이 부모 테이블의 존재하는 행만 참조하도록 제한
        - 부모 삭제 시 자식 데이터를 어떻게 처리할지 RESTRICT, CASCADE, SET NULL 등을 정책으로 결정
    - JOIN과 중복 행
        - JOIN 결과의 중복은 SQL 엔진 오류가 아니라 관계의 카디널리티에서 발생하는 경우가 많음
        - 사용자 1명당 한 행이 필요하면 집계, 서브쿼리, EXISTS 등을 검토
    - 인덱스
        - FK가 무결성을 보장하는 것과 조회가 빠른 것은 별개
        - 자주 JOIN, WHERE에 쓰는 컬럼은 실행 계획을 보고 인덱스 검토
    - 추가로 알아두면 좋은 내용
        - INNER JOIN : 양쪽에 연결되는 행만 조회
        - LEFT JOIN : 왼쪽 행 유지, 연결 없는 오른쪽 값은 NULL
        - FK는 무결성 제약, 조회 성능은 JOIN / 조건 컬럼의 인덱스를 별도로 검토
        - N:M 관계는 보통 두 FK를 가진 중계 테이블로 표현
    - 출처 / 참고 자료
        - MySQL 8.4 Reference Manual - PRIMARY KEY Constraints
        - MySQL 8.4 Reference Manual - FOREIGN KEY Constraints
- 4. WHERE와 NULL
    - 찾아보기: WHERE 조건에서 NULL을 = 과 비교할 수 없는 이유와 IS NULL을 사용하는 이유를 알아보세요.
        - NULL : 0, 빈 문자열과 다른 값 → 값이 없거나 아직 알 수 없음을 의미
        - NULL과의 비교 결과는 TRUE / FALSE가 아닌 UNKNOWN, WHERE는 TRUE인 행만 조회
            - column = NULL : NULL 행 조회 X
            - column IS NULL : NULL 행 조회 / column IS NOT NULL : 값이 있는 행 조회
            - Ex) 탈퇴하지 않은 사용자 : deleted_at IS NULL

**핵심 정리**

NULL은 값이 없다는 별도의 상태이므로 일반 값과 같은 방식으로 비교하면 안 됨

    - 3값 논리
        - SQL 조건식 결과 : TRUE, FALSE, UNKNOWN
        - NULL이 포함된 비교는 대체로 UNKNOWN → WHERE에서 제외됨
    - NULL과 빈 값의 차이
        - NULL : 값 자체가 없음 / 아직 모름
        - 빈 문자열 : 길이가 0인 문자열이라는 값
        - 0 : 숫자 값
    - NULL 처리 방식
        - 조회 조건 : IS NULL, IS NOT NULL
        - 화면 표시 : COALESCE(컬럼, 기본값)
        - 데이터 설계 : 반드시 필요한 값이면 NOT NULL 제약
    - OUTER JOIN과 NULL
        - LEFT JOIN에서 연결되는 오른쪽 행이 없으면 오른쪽 컬럼이 NULL
        - WHERE 조건을 어느 테이블에 거는지에 따라 LEFT JOIN 결과가 INNER JOIN처럼 바뀔 수 있어 주의
    - 추가로 알아두면 좋은 내용
        - COALESCE : NULL을 화면용 기본값으로 바꿔서 조회 가능
        - NOT IN 목록에 NULL이 있으면 의도와 다르게 동작 가능 → NOT EXISTS 검토
        - 값이 반드시 필요하면 애플리케이션 검증뿐 아니라 NOT NULL 제약도 설정
    - 출처 / 참고 자료
        - MySQL 8.4 Reference Manual - Working with NULL Values
        - MySQL 8.4 Reference Manual - Problems with NULL Values
- 5. ORDER BY와 일관된 정렬
    - 찾아보기: ORDER BY가 없을 때 목록 순서가 보장되지 않는 이유와 동일 값일 때의 보조 정렬 기준을 찾아보세요.
        - ORDER BY : 조회 결과의 정렬 기준 지정
            - ORDER BY가 없으면 결과 순서 보장 X
            - 삽입 순서처럼 보여도 인덱스, 실행 계획, 데이터 변경에 따라 순서 변경 가능
            - 정렬 기준값이 같은 행이 있으면 보조 정렬 기준 추가
            - Ex) created_at DESC, review_id DESC
            - ⇒ 목록 / 페이지네이션에서는 고유한 보조 정렬 기준까지 명시

**핵심 정리**

ORDER BY는 단순히 보기 좋게 정렬하는 기능이 아니라 API 결과의 일관성을 만드는 기준

    - 기본 문법
        - ASC : 오름차순, 생략 시 기본값
        - DESC : 내림차순
        - 여러 컬럼을 순서대로 지정 가능
    - 보조 정렬
        - created_at 값이 같은 행이 있으면 id 같은 고유값을 두 번째 기준으로 추가
        - 같은 요청에 같은 결과 순서를 보장 → 페이지 중복/누락 방지
    - 데이터 타입과 정렬
        - 숫자, 날짜는 적절한 타입으로 저장해야 의도한 순서 보장
        - 문자열 정렬은 DB의 collation 설정에 영향
    - 성능
        - WHERE 조건 + ORDER BY 조합이 자주 쓰이면 복합 인덱스 검토
        - 정렬 대상이 많을수록 DB 정렬 비용 증가 가능
    - 추가로 알아두면 좋은 내용
        - 날짜를 문자열로 저장하면 형식에 따라 시간순 정렬이 깨질 수 있음 → 적절한 날짜 타입 사용
        - 자주 쓰는 필터 + 정렬 조합은 인덱스 설계와 함께 검토
        - 화면과 API에서 항상 같은 순서가 필요하면 동률 처리 기준까지 작성
    - 출처 / 참고 자료
        - MySQL 8.4 Reference Manual - SELECT Statement의 ORDER BY 문법
        - MySQL 8.4 Reference Manual - ORDER BY Optimization
- 6. LIMIT / OFFSET과 페이지네이션
    - 찾아보기: LIMIT/OFFSET이 페이지 번호 방식과 어떻게 연결되는지, 데이터가 많아질 때 어떤 한계가 있는지 살펴보세요.
        - LIMIT / OFFSET : 목록에서 가져올 행 수와 건너뛸 행 수 지정
            - page가 1부터 시작 : LIMIT size, OFFSET (page - 1) 곱하기 size
            - Ex) 20개씩 3페이지 → LIMIT 20, OFFSET 40
            - OFFSET이 커질수록 앞의 많은 행을 건너뜀 → 성능⬇️
            - 조회 사이 새 행 추가 / 삭제 → 중복 조회, 누락 가능
            - 커서 기반 페이지네이션 : 마지막으로 본 정렬 키를 다음 요청에 전달
            - 데이터가 많고 다음 / 이전 이동 중심인 목록에 유리, ORDER BY + 고유 보조 정렬 기준 필요

**핵심 정리**

LIMIT / OFFSET은 가장 이해하기 쉬운 페이지네이션 방식이지만, 데이터가 커질수록 한계를 고려해야 함

    - 오프셋 기반 페이지네이션
        - UI page가 1부터 시작해도 SQL OFFSET은 0부터 시작
        - 페이지 크기와 페이지 번호만 있으면 특정 페이지로 바로 이동 가능
        - 일반 게시판처럼 전체 페이지 이동이 필요한 화면에 적합
    - 성능 / 일관성 문제
        - OFFSET이 커질수록 앞의 행을 많이 읽고 버려야 할 수 있음
        - 조회 중 새 데이터가 들어오면 다음 페이지에서 중복 / 누락 가능
    - 커서 기반 페이지네이션
        - 마지막으로 받은 created_at, id 같은 정렬 키를 cursor로 전달
        - 다음 페이지를 계속 보는 무한 스크롤, 피드에 적합
        - 특정 20페이지로 바로 이동하기는 어려움
    - API 설계
        - size의 최대값 설정, 정렬 기준 고정, page/cursor 중 하나만 받도록 명확히 설계
    - 추가로 알아두면 좋은 내용
        - page, size는 0 / 음수 / 과도하게 큰 값 검증 필요
        - LIMIT만 있고 ORDER BY가 없으면 요청마다 다른 묶음이 나올 수 있음
        - 목록 API에서는 LIMIT과 ORDER BY를 함께 설계
    - 출처 / 참고 자료
        - MySQL 8.4 Reference Manual - SELECT Statement의 LIMIT 문법
        - MySQL 8.4 Reference Manual - LIMIT Query Optimization