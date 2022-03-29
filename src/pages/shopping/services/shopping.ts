import { fetcher } from 'srcRootDir/services/fetcher';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getCurrentUserId } from 'srcRootDir/services/auth';

export async function addGrocery(grocery: Omit<Grocery, 'id'>): Promise<unknown> {
  return await fetcher('/shopping/groceries', { method: 'POST', body: JSON.stringify(grocery) });
}

export async function addToBasket(groceryId: number): Promise<unknown> {
  return await fetcher('/shopping/baskets/current', { method: 'POST', body: JSON.stringify({ groceryId }) });
}

export async function updateOrCreateMap(storeMap: MapDefinition): Promise<unknown> {
  return await fetcher('/shopping/maps', { method: 'POST', body: JSON.stringify({ data: JSON.stringify(storeMap) }) });
}

export async function createNewBasket(): Promise<unknown> {
  return await fetcher('/shopping/baskets', { method: 'POST', body: '{}' });
}

export function useLiveBasket(): Basket | null {
  const [currentBasket, setCurrentBasket] = useState<Basket | null>(null);

  useEffect(() => {
    const userId = getCurrentUserId();
    const sse = new EventSource(`${BACKEND_ORIGIN}/shopping/baskets/current?userId=${userId}`);
    sse.onmessage = e => setCurrentBasket(JSON.parse(e.data));
    sse.onerror = () => {
      toast.error('lost connection to basket data, try to reload the page');
      sse.close();
    };
    return () => {
      sse.close();
    };
  }, []);

  return currentBasket;
}

export async function solveShopping({
  weights,
  sizes,
}: {
  weights: Array<Array<number>>;
  sizes: Array<number>;
}): Promise<Array<Array<number>>> {
  return await fetcher('/shopping/solve', {
    method: 'POST',
    body: JSON.stringify({
      weights,
      sizes,
      numberOfPeople: 2,
    }),
  });
}
