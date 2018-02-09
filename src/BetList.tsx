import * as React from 'react';

import BetCard from './BetCard';

import { Column } from './components/layout';

import { Bet } from './api';

interface Props {
  bets: Bet[];
  token: string;
  refetch: () => void;
}

const BetList = (props: Props) => (
  <Column margin={20}>
    <h1>Список ставок</h1>
    {props.bets.map(bet => (
      <BetCard
        bet={bet}
        token={props.token}
        refetch={props.refetch}
        key={bet.topic_id}
      />
    ))}
  </Column>
);

export default BetList;
