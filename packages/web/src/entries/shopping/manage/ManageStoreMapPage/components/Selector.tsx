import React from 'react';
import { fallbackImage } from 'srcRootDir/entries/shopping/services/constants';
import { toProductImageUrl } from 'srcRootDir/entries/shopping/services';

export interface Item {
  name: string;
}

interface SelectorProps {
  availableItems: Array<Item>;
  onSelected: (item: Item) => void;
}

export function Selector({ availableItems, onSelected }: SelectorProps) {
  return (
    <div className="product-selector-grid">
      {availableItems.map(product => (
        <div
          className="flex w-100 h-100 justify-center items-center border-2 border-black"
          key={product.name}
          onClick={() => onSelected(product)}
        >
          <img
            height={16}
            width={16}
            onError={(e: any) => {
              if (e.target.src !== fallbackImage.src) {
                e.target.src = fallbackImage.src;
              }
            }}
            src={toProductImageUrl(product.name)}
          />
          {product.name}
        </div>
      ))}
    </div>
  );
}
