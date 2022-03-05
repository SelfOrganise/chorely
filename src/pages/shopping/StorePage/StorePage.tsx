import React, { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { StoreMap } from './services/StoreMap';
import { Item, Selector } from './components/Selector';
import { Types } from './services/constants';

const items: Array<Item> = [
  { name: 'milk' },
  { name: 'broccoli' },
  { name: 'eggs' },
  { name: 'onion' },
  { name: 'pak_choy' },
  { name: 'salmon' },
  { name: 'water' },
];

export function StorePage() {
  const canvasElement = useRef<HTMLCanvasElement | null>(null);
  const storeMap = useRef<StoreMap>();

  const [addedItems, setAddedItems] = useState<Array<string>>([]);

  useEffect(() => {
    if (!canvasElement.current) {
      throw Error('canvasElement.current is null');
    }

    storeMap.current = new StoreMap(canvasElement.current);
    const imported = storeMap.current?.import(window.localStorage.getItem('backup'));

    setAddedItems(imported.filter((i: any) => i.type === Types.product).map((i: any) => i.name));
  }, []);

  function handleOnSelected(item: Item) {
    setAddedItems(old => [...old, item.name]);
    storeMap.current?.addProduct(item);
  }

  return (
    <Wrapper>
      <Selector
        onSelected={handleOnSelected}
        availableItems={items.filter(item => addedItems.every(added => added !== item.name))}
      />
      <div className="buttons">
        <button onClick={() => storeMap.current?.addWall()}>Add wall</button>
        <button
          id="export"
          onClick={() => {
            const data = storeMap.current?.export();
            window.localStorage.setItem('backup', data || '[]');
          }}
        >
          Save state
        </button>
        <button onClick={() => storeMap.current?.solve()}>Solve</button>
        <button onClick={() => storeMap.current?.copy()}>copy</button>
        <button onClick={() => storeMap.current?.paste()}>paste</button>
        <button onClick={() => storeMap.current?.delete()}>delete</button>
      </div>
      <CanvasWrapper>
        <canvas ref={canvasElement} />
      </CanvasWrapper>
    </Wrapper>
  );
}

const CanvasWrapper = styled.div`
  width: 1000px;
  height: 1000px;
  border: 1px solid black;
`;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`;
