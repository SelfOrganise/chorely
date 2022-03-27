import React from 'react';
import styled from '@emotion/styled';
import { fallbackImage } from 'srcRootDir/pages/shopping/services/constants';
import { toImageName } from '../../services/utils';

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
          <img
            height={20}
            width={20}
            onError={(e: any) => {
              if (e.target.src !== fallbackImage.src) {
                e.target.src = fallbackImage.src;
              }
            }}
            src={`/images/${toImageName(product.name)}.jpeg`}
          />
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
