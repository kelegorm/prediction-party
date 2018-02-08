import * as React from 'react';

import './ErrorBox.css';

interface Props {
  children: React.ReactNode;
}

export default class ErrorBox extends React.Component<Props, {}> {
  render() {
    return <div className="ErrorBox">{this.props.children}</div>;
  }
}
