import * as React from 'react';

import { Api } from './api';
import { DISABLE_NEW_BETS } from './config';

import { Column } from './components/layout';
import { LargeButton, Input, Label, Textarea } from './components/ui';

interface Props {
  refetch: () => void;
  token: string;
  oops: (e: Error) => void;
}

interface State {
  title?: string;
  confidence?: number;
}

export default class BetAdd extends React.Component<Props, State> {
  state: State = {};

  private textarea: HTMLTextAreaElement | null;

  handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    this.setState({ title: event.currentTarget.value });
  }

  handleConfidenceChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ confidence: parseInt(event.target.value, 10) });
  }

  async handleSubmit(event: React.SyntheticEvent<EventTarget>) {
    event.preventDefault();

    try {
      if (!this.isValid()) {
        throw Error('internal error');
      }

      await Api.add(
        this.state.title!,
        this.state.confidence!,
        this.props.token
      );
      this.props.refetch();
    } catch (e) {
      this.props.oops(e);
    }
    this.clean();
  }

  clean() {
    this.setState({
      title: '',
      confidence: undefined,
    });
    this.textarea!.focus();
  }

  isValid() {
    return (
      this.state.title &&
      this.state.title.length &&
      this.state.confidence &&
      this.state.confidence >= 50 &&
      this.state.confidence <= 99
    );
  }

  render() {
    if (DISABLE_NEW_BETS) {
      return <h1>Ставки сделаны, ставок больше нет.</h1>;
    }
    return (
      <form onSubmit={e => this.handleSubmit(e)}>
        <h1>Добавить ставку</h1>
        <Column>
          <div>
            <Label>Текст ставки:</Label>
            <Textarea
              placeholder="Например: Путин останется президентом"
              value={this.state.title}
              onChange={e => this.handleChange(e)}
              innerRef={ref => (this.textarea = ref)}
            />
          </div>
          <div>
            <Label>Степень уверенности:</Label>
            <Input
              type="number"
              min="50"
              max="99"
              value={this.state.confidence}
              onChange={e => this.handleConfidenceChange(e)}
            />
          </div>
          <LargeButton
            disabled={!this.isValid()}
            onClick={e => this.handleSubmit(e)}
          >
            Добавить
          </LargeButton>
        </Column>
      </form>
    );
  }
}
