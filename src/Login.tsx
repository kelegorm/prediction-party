import * as React from "react";

import { Api } from './api';

interface Props {
  dev_mode: boolean;
  cb: (login: string, token: string) => void;
  oops: (error: Error) => void;
}

interface State {
  login: string;
}

export default class Login extends React.Component<Props, State> {
  state: State = {
    login: '',
  };

  async handleSubmit(event: React.SyntheticEvent<EventTarget>) {
    event.preventDefault();

    try {
      const json = await Api.fakeuser(this.state.login);
      this.props.cb(json.login, json.token);
    } catch (err) {
      this.props.oops(err);
    }
  }

  handleChange(event: React.FormEvent<HTMLInputElement>) {
    this.setState({
      login: event.currentTarget.value
    });
  }

  render() {
    return (
      <div>
        <form className="login" action="/auth/slack" method="get">
          <button>Войти через Slack</button>
        </form>
        {this.props.dev_mode && (
           <form className="login" onSubmit={e => this.handleSubmit(e)}>
             <input
               type="text"
               placeholder="Логин латиницей"
               value={this.state.login}
               onChange={e => this.handleChange(e)}
             />
             <button onClick={e => this.handleSubmit(e)}>Войти</button>
           </form>
        )}
      </div>
    );
  }
}
