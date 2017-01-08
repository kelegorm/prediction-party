import 'whatwg-fetch';

const BACKEND = 'http://localhost:8000';

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    return response.text().then(
      text => {
        throw new Error(text);
      }
    );
  }
}

function parseJSON(response) {
  return response.json();
}


const login = login => {
  return fetch(
    `${BACKEND}/api/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        login
      })
    }
  ).then(checkStatus).then(parseJSON);
};

const checkToken = token => {
  return fetch(
    `${BACKEND}/api/check-token?token=${token}`,
  ).then(checkStatus).then(parseJSON).then(json => json.login);
};

const list = token => {
  return fetch(
    `${BACKEND}/api/list?token=${token}`,
  ).then(checkStatus).then(parseJSON);
}

const add = (title, confidence, token) => {
  return fetch(
    `${BACKEND}/api/add`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title, confidence, token
      })
    }
  ).then(checkStatus).then(parseJSON);
};

const append = (topic_id, confidence, token) => {
  return fetch(
    `${BACKEND}/api/append`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic_id, confidence, token
      })
    }
  ).then(checkStatus).then(parseJSON);
};

export default {
  login,
  checkToken,
  list,
  add,
  append,
};
