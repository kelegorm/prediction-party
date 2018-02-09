import * as React from 'react';
import styled from 'styled-components';

import * as moment from 'moment';

import { Api, Bet } from './api';

import BetAdd from './BetAdd';
import BetList from './BetList';
import ErrorBox from './ErrorBox';
import Login from './Login';
import SelfInfo from './SelfInfo';
import { Column } from './components/layout';

moment.locale('ru');

interface Props {}

interface State {
  error?: string;
  login?: string;
  token?: string;
  bets: Bet[];
}

const MegaHeader = styled.header`
  background-color: #222;
  color: white;
  margin-bottom: 30px;
  font-size: 2em;
  line-height: 1em;
  text-align: center;
  padding: 30px 0;
`;
const Main = styled.main`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px 5px;
`;

class App extends React.Component<Props, State> {
  state: State = {
    bets: [],
  };

  constructor(props: Props) {
    super(props);
    this.setError = this.setError.bind(this);
    this.logout = this.logout.bind(this);
  }

  async componentWillMount() {
    if (window.localStorage.login && window.localStorage.token) {
      this.setAuth(window.localStorage.login, window.localStorage.token);
      return;
    }

    try {
      const user = await Api.checkAuth();
      this.setAuth(user.login, user.token);
    } catch (e) {
      this.setState({
        login: undefined,
        token: undefined,
      });
    }
  }

  setAuth(login: string, token: string) {
    window.localStorage.login = login;
    window.localStorage.token = token;
    this.setState(
      {
        login,
        token,
        error: undefined,
      },
      () => {
        this.refetch();
      }
    );
  }

  isLoggedIn() {
    return this.state.login && this.state.token;
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
        oops={this.setError}
        dev_mode={process.env.NODE_ENV === 'development'}
      />
    );
  }

  renderError() {
    if (!this.state.error) {
      return null;
    }
    return <ErrorBox>{this.state.error}</ErrorBox>;
  }

  renderCore() {
    if (!this.isLoggedIn()) {
      return this.renderLogin();
    }

    return (
      <Column margin={20}>
        <SelfInfo
          login={this.state.login!}
          token={this.state.token!}
          logout={this.logout}
        />
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
      </Column>
    );
  }

  render() {
    return (
      <div>
        <MegaHeader>Предсказания на 2017 год</MegaHeader>
        <Main>
          <Column>
            {this.renderError()}
            {this.renderCore()}
          </Column>
        </Main>
      </div>
    );
  }
}

export default App;
