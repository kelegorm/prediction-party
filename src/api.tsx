import "whatwg-fetch";

import * as moment from "moment";

const BACKEND = "";

async function checkStatus(response: Response) {
  if (response.ok) {
    return;
  }
  const text = await response.text();
  throw new Error(text);
}

export interface Bet {
  topic_id: number;
  title: string;
  count: number;
  topic_created: moment.Moment;
  last_bet_created: moment.Moment;
  self_confidence?: number;
}

export interface BetJSON {
  topic_id: number;
  title: string;
  count: number;
  topic_created: string;
  last_bet_created: string;
  self_confidence?: number;
}

type Token = string;

class ApiClass {
  async fakeuser(login: string) {
    const response = await fetch(`${BACKEND}/api/fakeuser?login=${login}`);
    await checkStatus(response);
    return response.json();
  }

  async checkAuth() {
    const response = await fetch(`${BACKEND}/api/check-auth`, {
      credentials: "same-origin"
    });
    await checkStatus(response);
    return response.json();
  }

  async logout() {
    const response = await fetch(`${BACKEND}/api/logout`, {
      credentials: "same-origin"
    });
    await checkStatus(response);
    return response.json();
  }

  async list(token: Token): Promise<Bet[]> {
    const response = await fetch(`${BACKEND}/api/list?token=${token}`);
    await checkStatus(response);
    const result = (await response.json()) as BetJSON[];

    return result.map(bet => ({
      ...bet,
      topic_created: moment(parseInt(bet.topic_created, 10) * 1000),
      last_bet_created: moment(parseInt(bet.last_bet_created, 10) * 1000)
    }));
  }

  async add(title: string, confidence: number, token: Token) {
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

  async append(topicId: number, confidence: number, token: Token) {
    const response = await fetch(`${BACKEND}/api/append`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        topic_id: topicId,
        confidence,
        token
      })
    });
    await checkStatus(response);
    return response.json();
  }
}

export const Api = new ApiClass();
