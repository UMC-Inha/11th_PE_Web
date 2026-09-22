# 프론트엔드 핵심 키워드 — React

## React 컴포넌트와 JSX

### JSX는 HTML과 어떤 점이 다르며 React 컴포넌트 안에서 어떤 역할을 하나요?

<details>
<summary>Answer</summary>

**JSX(JavaScript XML)란?**

- JavaScript 안에서 HTML처럼 생긴 문법으로 UI 구조를 작성할 수 있게 해주는 **JavaScript 확장 문법**
- JavaScript 안에 HTML 구조를 그대로 작성하여 가독성이 좋음

**HTML과의 차이점**

**1) JSX와 HTML의 본질적인 차이**

| 구분 | HTML | JSX (React) |
| --- | --- | --- |
| 실행 방식 | 브라우저가 직접 해석 | 빌드 도구가 JavaScript로 변환한 뒤 실행 |
| 파일 확장자 | `.html` | `.jsx` / `.tsx` |
| 문법 기반 | 마크업 언어 | JavaScript 확장 문법 |
| 동적 표현 | 제한적 | JavaScript 표현식 사용 가능 |
| 이벤트 처리 | 문자열 기반 | 함수 기반 |

**2) 문법 및 속성 명명 규칙 (Naming Convention)**

HTML은 소문자 속성을 사용하고, JSX는 JavaScript의 camelCase 규칙을 따른다.

| 구분 | HTML | JSX (React) |
| --- | --- | --- |
| 클래스 지정 | `class="container"` | `className="container"` |
| 이벤트 핸들러 | `onclick="handleClick()"` | `onClick={handleClick}` |
| 라벨 연결 | `<label for="id">` | `<label htmlFor="id">` |
| 인라인 스타일 | `style="color: red;"` | `style={{ color: 'red' }}` |

**3) 그 외**

- **반드시 닫아야 하는 태그 (Self-Closing)**
  HTML에서는 `<img>`, `<input>`, `<br>` 같은 태그를 닫지 않아도 큰 문제가 없지만, JSX에서는 `<img />`처럼 반드시 닫아야 한다.
- **단일 부모 요소 (Single Root Element)**
  JSX는 반드시 하나의 부모 요소로 감싸져야 한다. HTML은 이런 제약이 없어 형제 요소를 나란히 써도 문제없다.

**React 컴포넌트 안에서의 역할**

화면이 어떻게 보여야 하는지를 **선언적으로** 표현한다.

- UI 구조 정의
- 데이터와 화면 연결
- 컴포넌트 조합

</details>

### 하나의 화면을 여러 컴포넌트로 나누면 어떤 장점이 있으며, 분리 기준은 어떻게 정할 수 있을까요?

<details>
<summary>Answer</summary>

**장점**

1. 재사용 가능
2. 가독성 향상 (화면이 어떤 덩어리로 구성되는지 잘 보임)
3. 수정 범위와 렌더링 범위가 좁아짐
4. 협업과 테스트가 쉬움 (컴포넌트 단위로 작업과 테스트 가능)

**분리 기준**

1. 반복되는 UI인가
2. 하나의 역할만 하는가 (단일 책임 원칙)
3. 디자인에서 시각적으로 구분되는가

</details>

### 조건부 렌더링과 목록 렌더링은 데이터에 따라 보여 줄 컴포넌트를 어떻게 결정하나요?

<details>
<summary>Answer</summary>

**조건부 렌더링**

- 데이터의 값이나 상태에 따라 어떤 UI를 보여줄지 선택하는 것
- **무엇을** 보여줄지 결정할 때 사용
- `if`, 삼항 연산자, `&&`(조건이 참일 때만 보여줌)

사용 예시

- 로딩 중 / 에러 / 데이터 없음 화면 구분
- 로그인 여부에 따라 버튼 바꾸기
- 알림이 있을 때만 빨간 점 표시

**목록 렌더링**

- 배열 데이터를 `map`으로 순회해 항목 개수만큼 UI를 반복 생성하는 것
- **몇 개를** 보여줄지 결정할 때 사용

사용 예시

- 미션 목록, 리뷰 목록, 가게 리스트
- 게시글, 댓글, 알림 목록

</details>

## props와 단방향 데이터 흐름

### 부모와 자식 컴포넌트 사이에서 props는 어떤 역할을 하나요?

<details>
<summary>Answer</summary>

**props**: 부모 컴포넌트가 자식 컴포넌트에게 넘겨주는 데이터

- 컴포넌트 재사용 (하나의 컴포넌트에 props만 바꿔서 전달)
- props로 함수를 넘기면 자식이 부모에게 이벤트를 알릴 수 있음

</details>

### 데이터가 부모에서 자식으로만 흐르면 화면의 변화를 추적하는 데 어떤 도움이 되나요?

<details>
<summary>Answer</summary>

값의 출처가 명확해지기 때문에 버그가 생겼을 때 추적 경로가 단순해지고, 동작을 예측하기 쉽다.

</details>

### props에 TypeScript 타입을 붙이면 컴포넌트를 잘못 사용하는 실수를 어떻게 찾을 수 있나요?

<details>
<summary>Answer</summary>

props에 타입을 붙이면 컴포넌트와 부모 사이의 약속이 코드로 명시된다.
→ 컴포넌트를 쓰는 쪽(부모)에서 실수했을 때 **컴파일 타임에 바로** 찾을 수 있다.

</details>

## 상태와 리렌더링

### 일반 변수와 state(상태)는 값이 바뀐 뒤 화면을 다시 보여 주는 방식이 어떻게 다른가요?

<details>
<summary>Answer</summary>

| 구분 | 일반 변수 | state |
| --- | --- | --- |
| 값을 바꾸면 | 화면이 안 바뀜 | 리렌더링 |
| 리렌더링 후 값 | 초기값으로 리셋 | 유지됨 |

</details>

### React에서 원본 상태를 직접 수정하지 않고 새로운 값으로 업데이트해야 하는 이유는 무엇일까요?

<details>
<summary>Answer</summary>

React는 이전 값과 새 값이 **같은 참조인지**만 보고 변화를 판단한다.
→ 원본을 직접 고치면 참조가 그대로라서 React가 변화를 알아채지 못한다.
→ 항상 새 배열이나 객체를 만들어서 `setState`에 넘겨야 한다.

</details>

### 이전 상태로 다음 상태를 계산할 때 업데이터 함수를 사용하는 이유는 무엇일까요?

<details>
<summary>Answer</summary>

**업데이터 함수란?**

`setState`에 값 대신 **이전 상태를 받아 다음 상태를 반환하는 함수**를 넘기는 방식

```tsx
setCount((prev) => prev + 1);
```

**사용하는 이유**

- state 값은 렌더링 시점에 고정된 값이다.
- 연속 업데이트나 비동기 상황에서는 최신 값이 아닐 수 있다.
- 업데이터 함수는 React가 **가장 최신의 상태**를 넘겨주도록 보장한다.

</details>

## 상태 공유와 Context

### 여러 컴포넌트가 같은 상태를 사용해야 할 때 상태를 어느 컴포넌트에 두는 것이 좋을까요?

<details>
<summary>Answer</summary>

그 상태를 쓰는 컴포넌트들의 **가장 가까운 공통 부모**에 둔다. (**상태 끌어올리기**)

</details>

### props 전달, 상태 끌어올리기와 Context는 각각 어떤 상황에 알맞을까요?

<details>
<summary>Answer</summary>

| 방법 | 상황 | 예시 |
| --- | --- | --- |
| **props 전달** | 부모가 가진 값을 **바로 아래 자식**에게 줄 때 | `MissionList` → `MissionCard`에 미션 정보 |
| **상태 끌어올리기** | **형제나 가까운 컴포넌트끼리** 같은 상태를 공유할 때 | 탭 토글과 목록이 같은 탭 값을 씀 |
| **Context** | **멀리 떨어진 여러 컴포넌트**가 같은 값을 쓸 때 | 로그인 사용자, 테마, 언어 설정 |

**선택 순서**

1. 먼저 **props**로 해결되는지 본다
2. 형제끼리 공유해야 하면 **상태 끌어올리기**
3. 여러 단계를 거쳐 넘기느라 코드가 번거로워지면 **Context**

</details>

### 모든 값을 Context로 전달하면 어떤 문제가 생길 수 있을까요?

<details>
<summary>Answer</summary>

**문제점**

- 불필요한 리렌더링
- 데이터 흐름을 추적하기 어려움
- 컴포넌트 재사용이 어려움

→ Context는 props drilling을 없애는 도구로만 사용하는 것이 좋다!

</details>

---