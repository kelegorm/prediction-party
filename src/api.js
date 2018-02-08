import "whatwg-fetch";

const BACKEND = "";

async function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return;
  }
  const text = await response.text();
  throw new Error(text);
}

class Api {
  async fakeuser(login) {
    const response = await fetch(`${BACKEND}/api/fakeuser?login=${login}`);
    await checkStatus(response);
    return await response.json();
  }

  async checkAuth() {
    const response = await fetch(`${BACKEND}/api/check-auth`, {
      credentials: "same-origin"
    });
    await checkStatus(response);
    return await response.json();
  }

  async logout() {
    const response = await fetch(`${BACKEND}/api/logout`, {
      credentials: "same-origin"
    });
    await checkStatus(response);
    return await response.json();
  }

  async list(token) {
    const response = await fetch(`${BACKEND}/api/list?token=${token}`);
    await checkStatus(response);
    return await response.json();
  }

  async add(title, confidence, token) {
    const response = await fetch(`${BACKEND}/api/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        confidence,
        token
      })
    });
    await checkStatus(response);
    return response.json();
  }

  async append(topic_id, confidence, token) {
    const response = await fetch(`${BACKEND}/api/append`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        topic_id,
        confidence,
        token
      })
    });
    await checkStatus(response);
    return response.json();
  }
}

export default new Api();
