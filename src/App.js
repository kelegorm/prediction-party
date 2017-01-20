/* eslint-disable react/prop-types, react/no-multi-comp */
import React, { Component } from 'react';
import './App.css';
import Api from './api';
import moment from 'moment';

moment.locale('ru');

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      login: '',
    };
  }
  handleSubmit(event) {
    event.preventDefault();
    Api.fakeuser(this.state.login)
      .then(json => {
        this.props.cb(json.login, json.token);
      })
      .catch(
        err => this.props.oops(err)
      );
  }
  handleChange(event) {
    this.setState({
      login: event.target.value,
    });
  }
  render() {
    return (
      <div>
        <form className="login" action="/auth/slack" method="get">
          <button>Войти через Slack</button>
        </form>
        {
          this.props.dev_mode &&
          <form className="login" onSubmit={e => this.handleSubmit(e)}>
            <input
              type="text"
              placeholder="Логин латиницей"
              value={this.state.text}
              onChange={e => this.handleChange(e)}
            />
            <button onClick={e => this.handleSubmit(e)}>Войти</button>
          </form>
        }
      </div>
    );
  }
}

class Bet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      confidence: '',
    };
  }

  handleSubmit(event) {
    event.preventDefault();
    Api.append(this.props.topic_id, this.state.confidence, this.props.token)
      .then(() => {
        this.props.refetch();
      });
  }

  handleConfidenceChange(e) {
    this.setState({ confidence: e.target.value });
  }

  render() {
    return (
      <div className="bet">
        <div className="bet--title">
          {this.props.title}
        </div>
        <div className="bet--aux">
          <div className="bet--counter">
            {this.props.count}
          </div>
          <div className="bet--moments">
            <div className="bet--last-bet-created">
              Последняя ставка: {moment(parseInt(this.props.last_bet_created, 10) * 1000).fromNow()}
            </div>
            <div className="bet--topic-created">
              Первая ставка: {moment(parseInt(this.props.topic_created, 10) * 1000).fromNow()}
            </div>
          </div>
          <div className="bet--confidence">
            {
              this.props.self_confidence ?
              this.props.self_confidence :
              (
                <form onSubmit={e => this.handleSubmit(e)}>
                  <label>Ставка: </label>
                  <input
                    type="number"
                    min="50"
                    max="99"
                    placeholder="hm?"
                    value={this.state.confidence}
                    onChange={e => this.handleConfidenceChange(e)}
                  />
                </form>
              )
            }
          </div>
        </div>
      </div>
    );
  }
}

const BetList = (props) => (
  <div className="bet-list">
    {
      props.bets.map(
        (bet) => <Bet {...bet} token={props.token} refetch={props.refetch} key={bet.topic_id} />
      )
    }
  </div>
);

class BetAdd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      confidence: '',
    };
  }
  handleChange(event) {
    this.setState({ title: event.target.value });
  }
  handleConfidenceChange(event) {
    this.setState({ confidence: event.target.value });
  }
  handleSubmit(event) {
    event.preventDefault();
    Api.add(this.state.title, this.state.confidence, this.props.token)
      .then(() => {
        this.props.refetch();
      })
      .catch(this.props.oops);
    this.clean();
  }

  clean() {
    this.setState({
      title: '',
      confidence: '',
    });
    this.refs.text.focus();
  }

  isValid() {
    return this.state.title.length && this.state.confidence >= 50 && this.state.confidence <= 99;
  }

  render() {
    return (
      <form className="bet-add" onSubmit={e => this.handleSubmit(e)}>
        <label>Текст ставки:</label>
        <textarea
          placeholder="Например: Путин останется президентом"
          value={this.state.title}
          onChange={e => this.handleChange(e)}
          ref="text"
        />
        <div className="bet-add--line2">
          <label>Степень уверенности:</label>
          <input
            type="number"
            min="50"
            max="99"
            value={this.state.confidence}
            onChange={e => this.handleConfidenceChange(e)}
          />
          <button disabled={!this.isValid()} onClick={e => this.handleSubmit(e)}>Добавить</button>
        </div>
      </form>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      login: undefined,
      token: undefined,
      bets: [],
    };
    this.setError = this.setError.bind(this);
  }

  componentWillMount() {
    Api.checkAuth().then(
      user => {
        this.setAuth(user.login, user.token);
      }
    ).catch(
      () => {
        this.setState({
          login: null,
          token: null,
        });
      }
    );
  }

  setAuth(login, token) {
    this.setState({
      login,
      token,
      error: null,
    });
    this.refetch();
  }

  setError(error) {
    this.setState({ error: String(error) });
  }

  refetch() {
    Api.list(this.state.token)
      .then(bets => this.setState({ bets }));
  }

  logout() {
    Api.logout().then(
      () => {
        this.setState({
          login: null,
          token: null,
        });
      }
    );
  }

  renderLogin() {
    return (
      <Login
        cb={(login, token) => this.setAuth(login, token)}
        oops={err => this.setError(err)}
        dev_mode={false}
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
          <a
            className="logout"
            href="#"
            onClick={() => this.logout()}
          >Выйти</a>
        </div>
        <BetAdd
          refetch={() => this.refetch()}
          token={this.state.token}
          oops={this.setError}
        />
        <BetList
          bets={this.state.bets}
          refetch={() => this.refetch()}
          token={this.state.token}
          oops={this.setError}
        />
      </div>
    );
  }

  renderError() {
    if (!this.state.error) {
      return null;
    }
    return (
      <div className="error">
        {this.state.error}
      </div>
    );
  }

  renderLoading() {
    return null;
  }

  renderCore() {
    if (this.state.token === null) {
      return this.renderLogin();
    }
    if (this.state.token === undefined) {
      return this.renderLoading();
    }
    return this.renderMain();
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          Предсказания на 2017 год
        </header>
        <div className="App-main">
          {this.renderError()}
          {this.renderCore()}
        </div>
      </div>
    );
  }

}

export default App;

/*
TODO
   [x] токен и логин в базе
   [x] сохранять ставки в базу
   [x] append bet
   [x] error handling
   [x] bet counter
   [x] token in local storage
   [x] show last bet's time
   [x] order by last bet
   [x] forms - pretty button
   [x] logout
   [x] validate confidence value
   [x] validate title
   [x] validate title dups
   [x] validate login
   [x] check token on page reload
   [x] error message - wrong login
   [x] two-line bet design
   [x] longer bet-add text line (multiline design)
   [x] polyfill fetch
   [x] mobile design
   cleanup bet-add on addition
   smaller prediction field
   text with explanation of good bets
   single server with static
   fill bet list with my own bets
*/

/*
AUTH ISSUES

1. sign in with slack
2. enter username (or token)
   - quickly
   - without direct backend calls
   - but with backend support
   - cache? not important
3. check current user
   - possible in dev with fetch()
   - can save token in memory (to avoid credentials: 'same-origin', but not really necessary)

Create user in dev:
   - enter username
   - create user on backend (DEV=1 mode, custom route)
   - return user+token

*/
