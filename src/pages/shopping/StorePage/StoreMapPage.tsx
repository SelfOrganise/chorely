import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { StoreMap } from '../services/StoreMap';
import { Item, Selector } from './components/Selector';
import { Types } from '../services/constants';
import useSWR from 'swr';
import { fetcher } from 'srcRootDir/services/fetcher';
import { updateOrCreateMap } from 'srcRootDir/pages/shopping/services/shopping';
import { toast } from 'react-toastify';

const items: Array<Item> = [
  { name: 'milk' },
  { name: 'broccoli' },
  { name: 'eggs' },
  { name: 'onion' },
  { name: 'pak_choy' },
  { name: 'salmon' },
  { name: 'water' },
];

export function StoreMapPage() {
  const canvasElement = useRef<HTMLCanvasElement | null>(null);
  const storeMap = useRef<StoreMap>();

  const response = useSWR<Array<MapData>>('/shopping/maps', {
    fetcher,
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: false,
  });

  useEffect(() => {
    if (!canvasElement.current) {
      throw Error('canvasElement.current is null');
    }

    storeMap.current = new StoreMap(canvasElement.current);
  }, []);

  const [addedItems, setAddedItems] = useState<Array<string>>([]);

  useEffect(() => {
    if (response.data && response.data[0]) {
      const imported = storeMap.current?.import(response.data[0].data);
      setAddedItems(imported.filter((i: any) => i.type === Types.product).map((i: any) => i.name));
    }
  }, [response.data]);

  const saveMap = useCallback(async () => {
    const data = storeMap.current?.export();
    if (data) {
      try {
        await updateOrCreateMap({ data });
        toast.success(`Map saved 🗺️`);
      } catch (ex: any) {
        toast.error(`Could not save map. Reason: ${JSON.stringify(ex?.text())}`);
      }
    }
  }, [storeMap]);

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
        <button onClick={() => response.mutate()}>Load map</button>
        <button onClick={() => storeMap.current?.addWall()}>Add wall</button>
        <button id="export" onClick={saveMap}>
          Save map
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
