import 'whatwg-fetch';

const BACKEND = '';

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  return response.text().then(
    text => {
      throw new Error(text);
    }
  );
}

function parseJSON(response) {
  return response.json();
}


const fakeuser = login => {
  return fetch(
    `${BACKEND}/api/fakeuser?login=${login}`,
  ).then(checkStatus).then(parseJSON);
};

const checkAuth = () => {
  return fetch(
    `${BACKEND}/api/check-auth`,
    {
      credentials: 'same-origin',
    }
  ).then(checkStatus).then(parseJSON);
};

const logout = () => {
  return fetch(
    `${BACKEND}/api/logout`,
    {
      credentials: 'same-origin',
    }
  ).then(checkStatus).then(parseJSON);
};

const list = token => {
  return fetch(
    `${BACKEND}/api/list?token=${token}`
  ).then(checkStatus).then(parseJSON);
};

const add = (title, confidence, token) => {
  return fetch(
    `${BACKEND}/api/add`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title, confidence, token
      }),
    }
  ).then(checkStatus).then(parseJSON);
};

const append = (topic_id, confidence, token) => {
  return fetch(
    `${BACKEND}/api/append`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic_id, confidence, token,
      }),
    }
  ).then(checkStatus).then(parseJSON);
};

export default {
  fakeuser,
  logout,
  checkAuth,
  list,
  add,
  append,
};
