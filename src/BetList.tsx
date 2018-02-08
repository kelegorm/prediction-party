import * as React from "react";

import BetCard from './BetCard';

import { Bet } from './api';

interface Props {
  bets: Bet[];
  token: string;
  refetch: () => void;
}

const BetList = (props: Props) => (
  <div className="bet-list">
    {props.bets.map(bet => (
      <BetCard
        bet={bet}
        token={props.token}
        refetch={props.refetch}
        key={bet.topic_id}
      />
    ))}
  </div>
);

export default BetList;
