import * as React from "react";

import { Api, Bet } from "./api";

import { DISABLE_NEW_BETS } from "./config";

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
      <div className="bet">
        <div className="bet--title">{this.props.bet.title}</div>
        <div className="bet--aux">
          <div className="bet--counter">{this.props.bet.count}</div>
          <div className="bet--moments">
            <div className="bet--last-bet-created">
              Последняя ставка: {this.props.bet.last_bet_created.fromNow()}
            </div>
            <div className="bet--topic-created">
              Первая ставка: {this.props.bet.topic_created.fromNow()}
            </div>
          </div>
          <div className="bet--confidence">{this.renderConfidence()}</div>
        </div>
      </div>
    );
  }
}
