import React, { useState } from "react";
import styled from "styled-components";
import { ReactSortable } from "../../src/index";
import { Item, threes, createId } from "../util";

export function DisableButton() {
  const [list1, setList1] = useState(threes);
  const [disabled, setDisabled] = useState(false);
  return (
    <Container>
        <button onClick={() => {
            setDisabled(!disabled)
        }
        }>Disable</button>
      <ReactSortable
        list={list1}
        setList={setList1}
        animation={150}
        disabled={disabled}
      >
        {list1.map(item => (
          <Item key={item.id}>{item.name}</Item>
        ))}
        </ReactSortable>
    </Container>
  );
}

/** Wraps internal components for styling. */
const Container = styled.div`
  display: flex;
  width: inherit;
  & > * {
    width: 100%;
    margin-left: 0.3rem;
    :first-child() {
      margin-left: 0rem;
    }
  }
`;
