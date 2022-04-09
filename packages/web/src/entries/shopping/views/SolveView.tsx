import useSWR from 'swr';
import React, { useRef, useState } from 'react';
import { Button, Loading } from 'srcRootDir/common/components';
import { StoreMap, Types, getAllRoutes, solveShopping } from 'srcRootDir/entries/shopping/services';
import { fetcher } from 'srcRootDir/common/services/fetcher';
import { useLiveBasket } from 'srcRootDir/entries/shopping/hooks';

export function SolveView() {
  const [result, setResult] = useState<Array<Array<Grocery>>>();
  const canvasElement = useRef<HTMLCanvasElement | null>(null);
  const storeMap = useRef<StoreMap>();
  const currentBasket = useLiveBasket(state => state.basket);

  const groceriesResponse = useSWR<Array<Grocery>>('/shopping/groceries', { fetcher });
  const mapResponse = useSWR<Array<MapData>>('/shopping/maps', { fetcher });

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

  if (mapResponse.isValidating) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col items-center">
      <Button onClick={solve}>Solve</Button>
      <div className="overflow-hidden border-2 border-black">
        <canvas ref={canvasElement} />
      </div>
      {result && (
        <div className="flex justify-around space-x-2 p-2">
          <div className="border-2 p-2">
            {result[0].map((v, i) => (
              <div key={v.name + i}>
                {v?.name} - {v?.size}
              </div>
            ))}
          </div>
          <div className="border-2 p-2">
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
