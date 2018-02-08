import * as React from "react";

import { Api, Bet } from "./api";

import { DISABLE_NEW_BETS } from "./config";

import './BetCard.css';

export interface Props {
  token: string;
  refetch: () => void;
  bet: Bet;
}

interface State {
  confidence: number | undefined;
}

export default class BetCard extends React.Component<Props, State> {
  state: State = {
    confidence: undefined
  };

  async handleSubmit(event: React.SyntheticEvent<EventTarget>) {
    event.preventDefault();

    if (!this.canBet()) {
      return;
    }
    await Api.append(
      this.props.bet.topic_id,
      this.state.confidence!,
      this.props.token
    );
    this.props.refetch();
  }

  handleConfidenceChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ confidence: parseInt(e.currentTarget.value, 10) });
  }

  canBet() {
    return (
      this.state.confidence &&
      this.state.confidence >= 1 &&
      this.state.confidence <= 99
    );
  }

  renderConfidence() {
    if (this.props.bet.self_confidence) {
      return this.props.bet.self_confidence;
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
      <div className="BetCard">
        <div className="BetCard-title">{this.props.bet.title}</div>
        <div className="BetCard-aux">
          <div className="BetCard-counter">{this.props.bet.count}</div>
          <div className="BetCard-moments">
            <div className="BetCard-last-bet-created">
              Последняя ставка: {this.props.bet.last_bet_created.fromNow()}
            </div>
            <div className="BetCard-topic-created">
              Первая ставка: {this.props.bet.topic_created.fromNow()}
            </div>
          </div>
          <div className="BetCard-confidence">{this.renderConfidence()}</div>
        </div>
      </div>
    );
  }
}
