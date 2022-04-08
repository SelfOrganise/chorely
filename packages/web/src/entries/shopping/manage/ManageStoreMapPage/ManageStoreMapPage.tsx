import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getAllRoutes, StoreMap, Types, solveShopping, updateOrCreateMap } from '../../services';
import { Item, Selector } from './components/Selector';
import useSWR from 'swr';
import { fetcher } from 'srcRootDir/common/services/fetcher';
import { toast } from 'react-toastify';
import { Button } from 'srcRootDir/common/components';

export function ManageStoreMapPage() {
  const canvasElement = useRef<HTMLCanvasElement | null>(null);
  const storeMap = useRef<StoreMap>();

  const mapResponse = useSWR<Array<MapData>>('/shopping/maps', {
    fetcher,
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: false,
  });

  const groceriesResponse = useSWR<Array<Grocery>>('/shopping/groceries', {
    fetcher,
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: false,
  });

  const items = groceriesResponse?.data || [];

  const [addedItems, setAddedItems] = useState<Array<string>>([]);

  useEffect(() => {
    // note: currently only handles 1 map
    if (mapResponse.data && mapResponse.data[0]) {
      if (!canvasElement.current) {
        throw Error('canvasElement.current is null');
      }

      if (!storeMap.current) {
        storeMap.current = new StoreMap(canvasElement.current);
      }

      const imported = JSON.parse(mapResponse.data[0].data);
      storeMap.current?.import(imported);
      setAddedItems(imported.filter((i: any) => i.type === Types.product).map((i: any) => i.name));
    }
  }, [mapResponse.data]);

  const saveMap = useCallback(async () => {
    const data = storeMap.current?.export();
    if (data) {
      try {
        await updateOrCreateMap(data);
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

  function load(): void {
    mapResponse?.mutate();
    groceriesResponse?.mutate();
  }

  async function solve(): Promise<void> {
    const mapDefinition = storeMap.current!.export();
    const routes = getAllRoutes(mapDefinition);
    const weights = routes.map(a => a.map(b => b.route?.length));

    const result = await solveShopping({
      weights,
      // todo: pass in correct sizes
      sizes: Array(mapDefinition.filter(m => m.type === Types.product).length + 2 /* for checkpoints */).fill(0),
    });

    storeMap.current!.drawRoutes(result, routes);
  }

  return (
    <div className="w-100 h-100">
      <div>
        <Button onClick={load}>Load map</Button>
        <Button onClick={() => storeMap.current?.addWall()}>Add wall</Button>
        <Button id="export" onClick={saveMap}>
          Save map
        </Button>
        <Button onClick={solve}>Solve</Button>
        <Button onClick={() => storeMap.current?.copy()}>copy</Button>
        <Button onClick={() => storeMap.current?.paste()}>paste</Button>
        <Button onClick={() => storeMap.current?.delete()}>delete</Button>
      </div>
      <div className="w-full h-[330px] overflow-hidden border-2 border-black">
        <canvas ref={canvasElement} />
      </div>
      <Selector
        onSelected={handleOnSelected}
        availableItems={items.filter(item => addedItems.every(added => added !== item.name))}
      />
    </div>
  );
}
