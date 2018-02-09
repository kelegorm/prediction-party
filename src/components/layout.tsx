// import * as React from 'react';
import styled, { StyledFunction } from 'styled-components';

function withProps<T, U extends HTMLElement = HTMLElement>(
  styledFunction: StyledFunction<React.HTMLProps<U>>
): StyledFunction<T & React.HTMLProps<U>> {
  return styledFunction;
}

interface ColumnProps {
  margin?: number;
}

export const Column = withProps<ColumnProps>(styled.div)`
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: ${props => (props.margin === undefined ? 10 : props.margin)}px;
  }
`;

interface RowProps {
  margin?: number;
  center?: boolean;
  justify?: string;
}

export const Row = withProps<RowProps>(styled.div)`
  display: flex;
  flex-direction: row;
  ${props => (props.center ? 'align-items: center;' : '')}
  ${props => (props.justify ? 'justify-content: ' + props.justify + ';' : '')}

  & > * + * {
    margin-left: ${props => (props.margin === undefined ? 10 : props.margin)}px;
  }
`;
