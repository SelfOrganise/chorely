import React from 'react';
import styled from '@emotion/styled';

export interface Item {
  name: string;
}

interface SelectorProps {
  availableItems: Array<Item>;
  onSelected: (item: Item) => void;
}

export function Selector({ availableItems, onSelected }: SelectorProps) {
  return (
    <div>
      {availableItems.map(product => (
        <Selectable key={product.name} onClick={() => onSelected(product)}>
          <img alt={product.name} height={20} width={20} src={`/images/${product.name}.png`} />
          {product.name}
        </Selectable>
      ))}
    </div>
  );
}

const Selectable = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid black;
  margin-bottom: 5px;

  &:hover {
    background-color: #f5f5f5;
  }
`;
