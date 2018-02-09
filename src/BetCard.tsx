import * as React from 'react';
import styled from 'styled-components';

import { Api, Bet } from './api';

import { DISABLE_NEW_BETS } from './config';

import { Row } from './components/layout';
import { Button, Card, Counter, Input } from './components/ui';

export interface Props {
  token: string;
  refetch: () => void;
  bet: Bet;
}

interface State {
  confidence: number | undefined;
}

const Moments = styled.div`
  font-size: 0.8em;
  color: #999;
  text-align: right;
`;

const Confidence = styled.div`
  font-weight: bold;
  font-size: 1.2em;
  &:after {
    content: '%';
  }
`;

export default class BetCard extends React.Component<Props, State> {
  state: State = {
    confidence: undefined,
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
      return <Confidence>{this.props.bet.self_confidence}</Confidence>;
    }
    if (DISABLE_NEW_BETS) {
      return null;
    }
    return (
      <form onSubmit={e => this.handleSubmit(e)}>
        <Row>
          <Input
            type="number"
            min="1"
            max="99"
            value={this.state.confidence}
            onChange={e => this.handleConfidenceChange(e)}
          />
          <Button disabled={!this.canBet()}>Поставить</Button>
        </Row>
      </form>
    );
  }

  render() {
    return (
      <Card.Container>
        <Card.Header>{this.props.bet.title}</Card.Header>
        <Card.Body>
          <Row center>
            <div style={{ flex: 1 }}>{this.renderConfidence()}</div>
            <Moments>
              Последняя ставка: {this.props.bet.last_bet_created.fromNow()}
              <br />
              Первая ставка: {this.props.bet.topic_created.fromNow()}
            </Moments>
            <Counter>{this.props.bet.count}</Counter>
          </Row>
        </Card.Body>
      </Card.Container>
    );
  }
}
