![실행 결과](<./images/chap5b(1).png>)
![실행 결과](<./images/chap5b(2).png>)
![실행 결과](<./images/chap5b(3).png>)
![실행 결과](<./images/chap5b(4).png>)

### API 연결 코드

```html
<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>회원 API 연결 확인</title>
</head>
<body>
<h1>회원 API 연결 확인</h1>

<section>
  <h2>닉네임 중복 확인</h2>
  <form onsubmit="requestApi(event, 'nickname')">
    <label for="nickname">닉네임</label>
    <input id="nickname" type="text" value="noco" required />
    <button type="submit">중복 확인</button>
    <pre aria-live="polite"></pre>
  </form>
</section>

<section>
  <h2>이메일 중복 확인</h2>
  <form onsubmit="requestApi(event, 'email')">
    <label for="email">이메일</label>
    <input id="email" type="email" value="noco@umc.com" required />
    <button type="submit">중복 확인</button>
    <pre aria-live="polite"></pre>
  </form>
</section>

<section>
  <h2>회원 평점 조회</h2>
  <form onsubmit="requestApi(event, 'ratings')">
    <label for="member-id">회원 ID</label>
    <input
            id="member-id"
            type="number"
            min="1"
            step="1"
            value="1"
            required
    />
    <button type="submit">평점 조회</button>
    <pre aria-live="polite"></pre>
  </form>
</section>

<script>
  const API_BASE_URL = "http://localhost:8080";

  async function requestApi(event, kind) {
    event.preventDefault();

    const form = event.currentTarget;
    const input = form.querySelector("input");
    const button = form.querySelector("button");
    const result = form.querySelector("pre");
    const value = input.value.trim();

    if (!value) {
      result.textContent = "조회할 값을 입력해주세요.";
      return;
    }

    const encodedValue = encodeURIComponent(value);
    const path =
            kind === "ratings"
                    ? `/members/${encodedValue}/ratings`
                    : `/members/${kind}/${encodedValue}`;

    button.disabled = true;
    result.textContent = "조회 중이에요.";

    try {
      const response = await fetch(`${API_BASE_URL}${path}`);

      if (!response.ok) {
        const message =
                response.status === 404
                        ? "조회 대상을 찾을 수 없어요."
                        : "요청을 처리하지 못했어요.";

        throw new Error(`HTTP ${response.status}\n${message}`);
      }

      const data = await response.json();

      result.textContent =
              `HTTP ${response.status}\n` +
              JSON.stringify(data, null, 2);
    } catch (error) {
      result.textContent =
              error instanceof Error
                      ? error.message
                      : "요청 중 오류가 발생했어요.";
    } finally {
      button.disabled = false;
    }
  }
</script>
</body>
</html>

```