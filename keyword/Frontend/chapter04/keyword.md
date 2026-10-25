- Web Storage
  Web Stroage : 서버가 아닌 클라이언트에 데이터를 저장할 수 있도록 하는 기능

  쿠키와 기능은 유사하지만 쿠키는 4KB, 웹 스토리지는 5MB의 저장공간 이용 가능

    - localStorage와 sessionStorage는 저장값의 수명과 공유 범위가 어떻게 다른가요?

      localStorage

      브라우저에 반영구적인 데이터 저장, 종료해도 데이터 유지된다.

      도메인이 다른 경우엔 로컬 스토리지에 저장한 데이터 접근 불가.

      브라우저를 닫고 열어도 데이터 유지

      ex) 사용자 설정 저장(테마, 언어 등), 장바구니

      sessionStorage

      각 세션마다 데이터가 개별적으로 저장된다.

      세션을 종료하면 데이터가 자동 제거되며 같은 도메인이어도 세션이 다르면 데이터에 접근 불가\

      데이터는 동일한 탭 또는 창 내에서만 공유된다

      ex) 현재 사용자 세션 상태 관리, 단기적인 UI 상태 저장

    - 객체나 배열을 저장할 때 JSON 문자열로 바꿔야 하는 이유는 무엇일까요?

      Web Storage에는 문자열만 저장할 수 있어 배열이나 객체를 저장하면 구조를 유지할 수 없어 JSON.stringify()로 문자열로 바꿔 저장한다.

      읽을땐 다시 JSON.parse()로 배열 또는 객체로 바꾼다

        ```jsx
        const bookmarkedMovieIds = [2, 7];
        const savedValue = **JSON.stringify(bookmarkedMovieIds)**;
        
        localStorage.setItem("umcine-bookmarks", savedValue);
        
        const storedValue = localStorage.getItem("umcine-bookmarks");
        const parsedValue = storedValue ? **JSON.parse(storedValue)** : [];
        
        console.log(parsedValue);
        ```

    - Web Storage에는 어떤 데이터를 저장하는 것이 적절할까요?

      사용자가 개발자 도구에서 바꾸거나 지울 수 있어 인증 토큰, 비밀번호 등의 중요한 정보는 저장하지 않는다.

      사용자 설정(언어, 다크모드 등)

      북마크, 좋아요 목록

      최근 검색어

      장바구니

      입력 폼의 임시 저장 데이터 등의 민감하지 않은 데이터만 저장한다.

- 클라이언트 상태와 전역 상태 관리
    - 컴포넌트 상태와 전역 상태는 사용하는 범위가 어떻게 다른가요?

      컴포넌트 상태(components state) : 한 컴포넌트 안에서만 관리되는 상태

      다수의 컴포넌트에서 쓰이고 영향을 미치는 상태

      ex) 검색  입력창에 입력한 값, 카드 펼침 여부 등

      전역 상태(global state) : 프로젝트 전체에 영향을 끼치는 상태

      전역상태관리 라이브러리

        - Context API
        - Redux
        - Recoil
        - Mobx
        - Zustand

      ex) 로그인한 사용자 정보, 장바구니 등

      둘 다 상위 컴포넌트에서 하위 컴포넌트로 props를 넘겨주기 위해 props drilling 방식을 사용한다.

    - 여러 화면에서 사용하는 북마크 상태를 전역으로 관리하면 어떤 장점과 비용이 생길까요?

      장점

      목록에서 북마크 시 다른 곳에서의 북마크 개수도 바뀐다.

      각 화면마다 같은 상태를 따로 관리하지 않아 불일치 줄어듦

      props 전달 단계 줄어듦

      비용

      상태를 어디까지 전역으로 둘지 설계

      전역 상태가 너무 많으면 어떤 화면이 값을 바꾸는지 추적이 어려움

      관련 없는 컴포넌트까지 렌더링 될 수 있어 관리와 성능에 신경쓸 부분이 많아진다

    - Zustand와 Web Storage는 북마크 상태를 관리할 때 각각 어떤 역할을 할까요?

      Zustand : 여러 컴포넌트가 같은 상태를 함께 사용할 수 있게 해주는 상태 관리 라이브러리

      컴포넌트 바깥에 상태를 보관하는 곳(store)을 만들고 필요한 컴포넌트에서 사용한다.

      → 앱이 실행중일 때 북마크 상태를 전역으로 관리한다.

      Web Storage : 새로고침하거나 브라우저를 닫았다 열어도 북마크를 유지하도록 브라우저에 저장