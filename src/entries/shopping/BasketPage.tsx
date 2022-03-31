import React, { useRef, useState } from 'react';
import { GroceryItem } from 'srcRootDir/entries/shopping/ManageGroceriesPage/components/GroceryItem';
import useSWR from 'swr';
import { fetcher } from 'srcRootDir/services/fetcher';
import { Types } from 'srcRootDir/entries/shopping/services/constants';
import { getAllRoutes } from 'srcRootDir/entries/shopping/services/utils';
import {
  addToBasket,
  createNewBasket,
  solveShopping,
  useLiveBasket,
} from 'srcRootDir/entries/shopping/services/shopping';
import { StoreMap } from 'srcRootDir/entries/shopping/services/StoreMap';
import { toast } from 'react-toastify';
import { Button } from 'srcRootDir/common/components';
import { Tab } from '@headlessui/react';

export function BasketPage() {
  const canvasElement = useRef<HTMLCanvasElement | null>(null);
  const storeMap = useRef<StoreMap>();
  const currentBasket = useLiveBasket();

  const [result, setResult] = useState<Array<Array<Grocery>>>();

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

    setResult(productRoutes);
  }

  if (groceriesResponse.isValidating) {
    return <span>loading</span>;
  }

  if (groceriesResponse.error) {
    return <span>{JSON.stringify(groceriesResponse.error)}</span>;
  }

  return (
    <div className="flex flex-col items-center">
      <Tab.Group>
        <Tab.List className="flex justify-between w-64 mb-2">
          <Tab as={Button}>List </Tab>
          <Tab as={Button}>Basket ({currentBasket?.items.length || 0})</Tab>
          <Tab as={Button}>Solve</Tab>
        </Tab.List>
        <Tab.Panels className="flex flex-col w-full md:w-[500px] p-6">
          <Tab.Panel>
            {groceriesResponse.data?.map(g => (
              <GroceryItem
                key={g.id}
                item={g}
                onAdd={async item => {
                  await addToBasket(item.id);
                  toast.success(`added '${item.name}'`, { autoClose: 1500, position: 'bottom-center' });
                }}
              />
            ))}
          </Tab.Panel>
          <Tab.Panel>
            <Button onClick={() => createNewBasket()}>Create new basket</Button>
            {currentBasket?.items.map((g, i) => (
              <GroceryItem key={`${g.id}-${i}`} item={g} onAdd={() => null} />
            ))}
          </Tab.Panel>
          <Tab.Panel className="flex flex-col">
            <Button onClick={solve}>Solve</Button>
            <div className="w-full h-[330px] overflow-hidden border-2 border-black">
              <canvas ref={canvasElement} />
            </div>
            {result && (
              <div className="flex justify-around">
                <div>
                  {result[0].map(v => (
                    <div>
                      {v?.name} - {v?.size}
                    </div>
                  ))}
                </div>
                <div>
                  {result[1].map(v => (
                    <div>
                      {v?.name} - {v?.size}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
