/* eslint-disable react/prop-types, react/no-multi-comp */
import React, { Component } from "react";
import "./App.css";
import Api from "./api";
import moment from "moment";

moment.locale("ru");

const DISABLE_NEW_BETS = true;

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      login: ""
    };
  }

  async handleSubmit(event) {
    event.preventDefault();

    try {
      const json = await Api.fakeuser(this.state.login);
      this.props.cb(json.login, json.token);
    } catch (err) {
      this.props.oops(err);
    }
  }

  handleChange(event) {
    this.setState({
      login: event.target.value
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
              value={this.state.text}
              onChange={e => this.handleChange(e)}
            />
            <button onClick={e => this.handleSubmit(e)}>Войти</button>
          </form>
        )}
      </div>
    );
  }
}

class Bet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      confidence: ""
    };
  }

  async handleSubmit(event) {
    event.preventDefault();
    await Api.append(
      this.props.topic_id,
      this.state.confidence,
      this.props.token
    );
    this.props.refetch();
  }

  handleConfidenceChange(e) {
    this.setState({ confidence: e.target.value });
  }

  canBet() {
    return this.state.confidence >= 1 && this.state.confidence <= 99;
  }

  renderConfidence() {
    if (this.props.self_confidence) {
      return this.props.self_confidence;
    }
    if (DISABLE_NEW_BETS) {
      return null;
    }
    return (
      <form onSubmit={e => this.handleSubmit(e)}>
        <input
          type="number"
          min="1"
          max="99"
          value={this.state.confidence}
          onChange={e => this.handleConfidenceChange(e)}
        />
        <button disabled={!this.canBet()}>Поставить</button>
      </form>
    );
  }

  render() {
    return (
      <div className="bet">
        <div className="bet--title">{this.props.title}</div>
        <div className="bet--aux">
          <div className="bet--counter">{this.props.count}</div>
          <div className="bet--moments">
            <div className="bet--last-bet-created">
              Последняя ставка:{" "}
              {moment(
                parseInt(this.props.last_bet_created, 10) * 1000
              ).fromNow()}
            </div>
            <div className="bet--topic-created">
              Первая ставка:{" "}
              {moment(parseInt(this.props.topic_created, 10) * 1000).fromNow()}
            </div>
          </div>
          <div className="bet--confidence">{this.renderConfidence()}</div>
        </div>
      </div>
    );
  }
}

const BetList = props => (
  <div className="bet-list">
    {props.bets.map(bet => (
      <Bet
        {...bet}
        token={props.token}
        refetch={props.refetch}
        key={bet.topic_id}
      />
    ))}
  </div>
);

class BetAdd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
      confidence: ""
    };
  }

  handleChange(event) {
    this.setState({ title: event.target.value });
  }

  handleConfidenceChange(event) {
    this.setState({ confidence: event.target.value });
  }

  async handleSubmit(event) {
    event.preventDefault();

    try {
      await Api.add(this.state.title, this.state.confidence, this.props.token);
      this.props.refetch();
    } catch (e) {
      this.props.oops(e);
    }
    this.clean();
  }

  clean() {
    this.setState({
      title: "",
      confidence: ""
    });
    this.refs.text.focus();
  }

  isValid() {
    return (
      this.state.title.length &&
      this.state.confidence >= 50 &&
      this.state.confidence <= 99
    );
  }

  render() {
    if (DISABLE_NEW_BETS) {
      return <h1>Ставки сделаны, ставок больше нет.</h1>;
    }
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
          <button
            disabled={!this.isValid()}
            onClick={e => this.handleSubmit(e)}
          >
            Добавить
          </button>
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
      bets: []
    };
    this.setError = this.setError.bind(this);
  }

  async componentWillMount() {
    try {
      const user = await Api.checkAuth();
      this.setAuth(user.login, user.token);
    } catch (e) {
      this.setState({
        login: null,
        token: null
      });
    }
  }

  setAuth(login, token) {
    this.setState({
      login,
      token,
      error: null
    });
    this.refetch();
  }

  setError(error) {
    this.setState({ error: String(error) });
  }

  async refetch() {
    const bets = await Api.list(this.state.token);
    this.setState({ bets });
  }

  async logout() {
    await Api.logout();
    this.setState({
      login: null,
      token: null
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
    return <div className="error">{this.state.error}</div>;
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
