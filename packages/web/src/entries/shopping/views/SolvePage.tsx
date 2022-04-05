import useSWR from 'swr';
import React, { useRef, useState } from 'react';
import { Button } from 'srcRootDir/common/components';
import { StoreMap, Types, getAllRoutes, solveShopping, useLiveBasket } from 'srcRootDir/entries/shopping/services';
import { fetcher } from 'srcRootDir/services/fetcher';

export function SolvePage() {
  const [result, setResult] = useState<Array<Array<Grocery>>>();
  const canvasElement = useRef<HTMLCanvasElement | null>(null);
  const storeMap = useRef<StoreMap>();
  const currentBasket = useLiveBasket();

  const groceriesResponse = useSWR<Array<Grocery>>('/shopping/groceries', {
    fetcher,
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const mapResponse = useSWR<Array<MapData>>('/shopping/maps', {
    fetcher,
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: true,
  });

  async function solve() {
    if (!mapResponse?.data?.[0]) {
      alert('map data not loaded');
      return;
    }

    if (!groceriesResponse?.data || !groceriesResponse?.data.length) {
      alert('groceries not loaded');
      return;
    }

    if (!canvasElement.current) {
      throw Error('canvasElement.current is null');
    }

    if (!storeMap.current) {
      storeMap.current = new StoreMap(canvasElement.current);
    }

    const mapDefinition: MapDefinition = JSON.parse(mapResponse.data[0].data);

    const productOrder: Array<Grocery> = [{ id: -1, name: 'start', size: 0 }];
    const filteredMapData = mapDefinition.filter(p => {
      if (p.type === Types.product && currentBasket) {
        const item = currentBasket.items.find((a: BasketItem) => a.name === p.name);
        if (item) {
          productOrder.push(item);
        }

        return item;
      } else {
        return true;
      }
    });
    productOrder.push({ id: -1, name: 'finish', size: 0 });

    storeMap.current?.import(filteredMapData);

    // note: getAllRoutes maintains order of passed in products
    const routes = getAllRoutes(filteredMapData);
    const weights = routes.map(a => a.map(b => b.route?.length));
    const response = await solveShopping({ weights, sizes: productOrder.map(p => p.size) });

    const productRoutes = response.map(user => user.map(p => productOrder[p]));

    storeMap.current?.drawRoutes(response, routes);

    storeMap.current?.canvas.forEachObject(o => (o.selectable = false));
    setResult(productRoutes);
  }

  return (
    <div>
      <Button onClick={solve}>Solve</Button>
      <div className="w-full h-[330px] overflow-hidden border-2 border-black">
        <canvas ref={canvasElement} />
      </div>
      {result && (
        <div className="flex justify-around">
          <div>
            {result[0].map((v, i) => (
              <div key={v.name + i}>
                {v?.name} - {v?.size}
              </div>
            ))}
          </div>
          <div>
            {result[1].map((v, i) => (
              <div key={v.name + i}>
                {v?.name} - {v?.size}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
