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
    Api.login(this.state.login)
      .then(json => {
        this.props.cb(this.state.login, json.token)
      }).catch(
        err => this.props.oops(err)
      );
  }
  handleChange(event) {
    this.setState({ login: event.target.value });
  }
  render() {
    return (
      <form className="login" onSubmit={e => this.handleSubmit(e)}>
        <input type="text" placeholder="Логин латиницей" value={this.state.text} onChange={e => this.handleChange(e)} />
        <button onClick={e => this.handleSubmit(e)}>Войти</button>
      </form>
    )
  }
}

class Bet extends Component{
  constructor(props) {
    super(props);
    this.state = {
      confidence: '',
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    Api.append(this.props.topic_id, this.state.confidence, this.props.token)
      .then(json => {
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
                  <input type="number" min="50" max="99" placeholder="hm?" value={this.state.confidence} onChange={e => this.handleConfidenceChange(e)} />
                </form>
              )
            }
          </div>
        </div>
      </div>
    );
  }
};

class BetList extends Component {
  render() {
    return (
      <div className="bet-list">
        {
          this.props.bets.map(
            (bet, i) => <Bet {...bet} token={this.props.token} refetch={this.props.refetch} key={bet.topic_id} />
          )
        }
      </div>
    );
  }
}

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
      .then(json => {
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
        <textarea placeholder="Например: Путин останется президентом" value={this.state.title} onChange={e => this.handleChange(e)} ref="text" />
        <div className="bet-add--line2">
          <label>Степень уверенности:</label>
          <input type="number" min="50" max="99" value={this.state.confidence} onChange={e => this.handleConfidenceChange(e)} />
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
      error: undefined,
      bets: [],
      login: window.localStorage.getItem('prediction-party.login'),
      token: window.localStorage.getItem('prediction-party.token'), // TODO validate token
    };
    this.setError = this.setError.bind(this);
  }

  setAuth(login, token) {
    this.setState({
      login: login,
      token: token,
      error: undefined,
    });
    window.localStorage.setItem('prediction-party.login', login);
    window.localStorage.setItem('prediction-party.token', token);
    this.refetch();
  }

  refetch() {
    console.log('refetch!');
    Api.list(this.state.token)
      .then(bets => this.setState({ bets }));
  }

  setError(error) {
    this.setState({ error: String(error) });
  }

  logout() {
    window.localStorage.removeItem('prediction-party.login');
    window.localStorage.removeItem('prediction-party.token');
    this.setState({
        login: undefined,
        token: undefined,
    })
  }

  componentWillMount() {
    if (this.state.token) {
      Api.checkToken(this.state.token).then(
        login => {
          if (login === this.state.login) {
            this.refetch();
          }
          else {
            this.logout();
            this.setError('wrong login for the current token, huh?');
          }
        }
      ).catch(
        err => {
          this.logout();
          this.setError(err);
        }
      );
    }
  }

  renderLogin() {
    return (
      <Login
        cb={(login, token) => this.setAuth(login, token)}
        oops={err => this.setError(err)}
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
          <a className="logout" href="#" onClick={() => this.logout()}>Выйти</a> (и никогда больше не войти)
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
      return;
    }
    return (
      <div className="error">
        {this.state.error}
      </div>
    )
  }

  render() {
    return (
      <div className="App">
      <header className="App-header">
        Предсказания на 2017 год
      </header>
      <div className="App-main">
        {this.renderError()}
        {
          this.state.token ? this.renderMain() : this.renderLogin()
        }
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
