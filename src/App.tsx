import * as React from "react";

import * as moment from "moment";

import { Api, Bet } from "./api";

import BetAdd from './BetAdd';
import BetList from './BetList';
import Login from './Login';

import "./App.css";

moment.locale("ru");

interface Props {}

interface State {
  error?: string;
  login?: string;
  token?: string;
  bets: Bet[];
}

class App extends React.Component<Props, State> {
  state: State = {
    bets: []
  };

  constructor(props: Props) {
    super(props);
    this.setError = this.setError.bind(this);
  }

  async componentWillMount() {
    try {
      const user = await Api.checkAuth();
      this.setAuth(user.login, user.token);
    } catch (e) {
      this.setState({
        login: undefined,
        token: undefined
      });
    }
  }

  setAuth(login: string, token: string) {
    this.setState({
      login,
      token,
      error: undefined
    });
    this.refetch();
  }

  setError(error: Error) {
    this.setState({ error: String(error) });
  }

  async refetch() {
    const bets = await Api.list(this.state.token!);
    this.setState({ bets });
  }

  async logout() {
    await Api.logout();
    this.setState({
      login: undefined,
      token: undefined,
    });
  }

  renderLogin() {
    return (
      <Login
        cb={(login, token) => this.setAuth(login, token)}
        oops={err => this.setError(err)}
        dev_mode={process.env.NODE_ENV === "development"}
      />
    );
  }

  renderMain() {
    return (
      <div>
        <div className="auth-data">
          <div className="auth-data--login">
            login: {this.state.login}, token: {this.state.token}
          </div>
          <a className="logout" href="#" onClick={() => this.logout()}>
            Выйти
          </a>
        </div>
        <BetAdd
          refetch={() => this.refetch()}
          token={this.state.token!}
          oops={this.setError}
        />
        <BetList
          bets={this.state.bets}
          refetch={() => this.refetch()}
          token={this.state.token!}
        />
      </div>
    );
  }

  renderError() {
    if (!this.state.error) {
      return null;
    }
    return <div className="error">{this.state.error}</div>;
  }

  renderLoading() {
    return null;
  }

  renderCore() {
    if (!this.state.token) {
      return this.renderLogin();
    }
    return this.renderMain();
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">Предсказания на 2017 год</header>
        <div className="App-main">
          {this.renderError()}
          {this.renderCore()}
        </div>
      </div>
    );
  }
}

export default App;
