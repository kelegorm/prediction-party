import * as React from "react";

import { Api } from "./api";
import { DISABLE_NEW_BETS } from "./config";

interface Props {
  refetch: () => void;
  token: string;
  oops: (e: Error) => void;
}

interface State {
  title: string;
  confidence?: number;
}

export default class BetAdd extends React.Component<Props, State> {
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
        throw Error("internal error");
      }

      await Api.add(this.state.title, this.state.confidence!, this.props.token);
      this.props.refetch();
    } catch (e) {
      this.props.oops(e);
    }
    this.clean();
  }

  clean() {
    this.setState({
      title: "",
      confidence: undefined
    });
    this.textarea!.focus();
  }

  isValid() {
    return (
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
      <form className="bet-add" onSubmit={e => this.handleSubmit(e)}>
        <label>Текст ставки:</label>
        <textarea
          placeholder="Например: Путин останется президентом"
          value={this.state.title}
          onChange={e => this.handleChange(e)}
          ref={ref => (this.textarea = ref)}
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
