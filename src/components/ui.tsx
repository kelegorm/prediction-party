// import * as React from 'react';
import styled from 'styled-components';

export const Button = styled.button`
  padding: 4px 10px;
  border: 2px solid hsl(200, 100%, 75%);
  color: hsl(200, 100%, 10%);
  cursor: pointer;

  &:disabled {
    color: #999;
    background-color: hsl(200, 90%, 95%);
    border-color: hsl(200, 90%, 90%);
    cursor: auto;
  }
  &:hover {
    background-color: hsl(200, 90%, 95%);
  }
`;

export const LargeButton = Button.extend`
  padding: 6px 10px;
`;

export const Counter = styled.div`
  width: 32px;
  height: 32px;
  line-height: 30px;
  border: 2px solid #b8b8b8;
  background-color: #ddd;
  border-radius: 50%;
  text-align: center;
  cursor: default;
`;

export const Label = styled.label`
  font-variant: all-small-caps;
  display: block;
`;

export const Input = styled.input`
  border-radius: 0;
  padding: 8px;
  height: 32px;
  border: 1px solid #ddd;

  &:hover {
  }
  &:focus {
    outline: none;
    box-shadow: 0px 2px hsl(200, 60%, 60%);
    border-bottom-color: transparent;
  }
`;

export const Textarea = styled.textarea`
  border: 1px solid #ddd;
  border-radius: 0;
  padding: 8px;
  width: 100%;
  &:focus {
    outline: none;
    box-shadow: 0px 2px hsl(200, 60%, 60%);
    border-bottom-color: transparent;
  }
`;

export const Card = {
  Container: styled.article`
    border: 2px solid hsl(120, 80%, 80%);
  `,

  Header: styled.header`
    background-color: hsl(120, 80%, 80%);
    padding: 8px;
  `,

  Body: styled.header`
    padding: 8px;
  `,
};
