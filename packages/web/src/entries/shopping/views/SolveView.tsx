import useSWR from 'swr';
import React from 'react';
import { Button, Loading } from 'srcRootDir/common/components';
import { Types, getAllRoutes, solveShopping, RoutesContext } from 'srcRootDir/entries/shopping/services';
import { fetcher } from 'srcRootDir/common/services/fetcher';
import { useLiveBasket } from 'srcRootDir/entries/shopping/hooks';
import { useNavigate } from 'react-router-dom';

export function SolveView() {
  const groceriesResponse = useSWR<Array<Grocery>>('/shopping/groceries', { fetcher });
  const mapResponse = useSWR<Array<MapData>>('/shopping/maps', { fetcher });
  const currentBasket = useLiveBasket(state => state.basket);
  const navigate = useNavigate();

  async function solve() {
    if (!mapResponse?.data?.[0]) {
      alert('map data not loaded');
      return;
    }

    if (!groceriesResponse?.data || !groceriesResponse?.data.length) {
      alert('groceries not loaded');
      return;
    }

    if (!currentBasket) {
      alert('Basket not loaded');
      return;
    }

    const mapDefinition: MapDefinition = JSON.parse(mapResponse.data[0].data);

    // we use this later to obtain an array of sizes, this needs to be the same order as the items in the map definition
    const productOrder: Array<Grocery> = [{ id: -1, name: 'start', size: 0 }];

    // this forEach is needed to obtain the product order and to duplicate map items for each grocery instance in the
    // basket so that each grocery is counted in the final weight, it's awkward code I know
    const basketGroceriesAsMapDefinition = [];
    for (const mapItem of mapDefinition) {
      if (mapItem.type === Types.product && currentBasket) {
        const addedItems = currentBasket.items.filter(b => b.name === mapItem.name);

        for (const item of addedItems) {
          productOrder.push(item);
          basketGroceriesAsMapDefinition.push(mapItem);
        }
      } else {
        basketGroceriesAsMapDefinition.push(mapItem);
      }
    }

    productOrder.push({ id: -1, name: 'finish', size: 0 });

    // note: getAllRoutes maintains order of passed in products
    const routesBetweenBasketGroceries = getAllRoutes(basketGroceriesAsMapDefinition);
    const rawSolution = await solveShopping({
      weights: routesBetweenBasketGroceries.map(a => a.map(b => b.route?.length)),
      sizes: productOrder.map(p => p.size),
    });

    const groceriesSolution = rawSolution.map(sol => sol.map(productIndex => productOrder[productIndex]));

    const solution: {
      basketId: number;
      rawSolution: Array<Array<number>>;
      groceriesSolution: Array<Array<Grocery>>;
      routesBetweenBasketGroceries: RoutesContext;
      basketGroceriesAsMapDefinition: MapDefinition;
    } = {
      basketId: currentBasket.id,
      rawSolution,
      groceriesSolution,
      routesBetweenBasketGroceries,
      basketGroceriesAsMapDefinition,
    };

    window.localStorage.setItem('solution', JSON.stringify(solution));
    navigate('/shopping/basket/solution');
  }

  if (mapResponse.isValidating) {
    return <Loading />;
  }

  return (
    <div className="flex h-full flex-col justify-center items-center space-y-2">
      <Button onClick={solve}>🧠 Solve 👨‍🎓</Button>
      <Button onClick={() => navigate('/shopping/basket/solution')}>📚️ View last solution</Button>
    </div>
  );
}
