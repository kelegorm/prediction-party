import * as React from 'react';
import styled from 'styled-components';

import { Row } from './components/layout';
import { Button } from './components/ui';

interface Props {
  login: string;
  token: string;
  logout: () => void;
}

const SelfCard = styled.section``;

const Gray = styled.div`
  color: #999;
  font-size: 0.8em;
`;

export default class SelfInfo extends React.Component<Props, {}> {
  render() {
    return (
      <SelfCard>
        <Row justify="center" margin={10}>
          <div>
            <header>{this.props.login}</header>
            <Gray>token: {this.props.token}</Gray>
          </div>
          <Button onClick={() => this.props.logout()}>Выйти &rarr;</Button>
        </Row>
      </SelfCard>
    );
  }
}
