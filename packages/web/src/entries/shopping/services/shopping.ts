import { fetcher } from 'srcRootDir/services/fetcher';
import { useEffect, useState } from 'react';
import { getCurrentUserId } from 'srcRootDir/entries/login/services/auth';
import { toast } from 'react-toastify';

export async function addRecipe(name: string): Promise<unknown> {
  return await fetcher('/shopping/recipes', { method: 'POST', body: JSON.stringify({ name }) });
}

export async function addGroceryToRecipe(recipeId: string | number, groceryId: string | number): Promise<unknown> {
  return await fetcher(`/shopping/recipes/${recipeId}`, { method: 'POST', body: JSON.stringify({ groceryId }) });
}

export async function deleteGroceryFromRecipe(recipeId: string | number, groceryId: string | number): Promise<unknown> {
  return await fetcher(`/shopping/recipes/${recipeId}/groceries/${groceryId}`, { method: 'DELETE' });
}

export async function addGrocery(grocery: Omit<Grocery, 'id'>): Promise<unknown> {
  return await fetcher('/shopping/groceries', { method: 'POST', body: JSON.stringify(grocery) });
}

export async function addToBasket(item: { groceryId?: number; recipeId?: number }): Promise<unknown> {
  return await fetcher('/shopping/baskets/current', { method: 'POST', body: JSON.stringify(item) });
}

export async function deleteFromBasket(item: { groceryId?: number; recipeId?: number }): Promise<unknown> {
  return await fetcher('/shopping/baskets/current', { method: 'delete', body: JSON.stringify(item) });
}

export async function deleteRecipe(recipeId: string | number): Promise<unknown> {
  return await fetcher(`/shopping/recipes/${recipeId}`, { method: 'DELETE' });
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

    const setup = () => {
      const sse = new EventSource(`${BACKEND_ORIGIN}/shopping/baskets/current?userId=${userId}`);
      sse.onopen = () => toast.success('Connected to live basket');
      sse.onmessage = e => setCurrentBasket(JSON.parse(e.data));
      return sse;
    };

    let sse: EventSource = setup();

    const handleFocus = () => {
      if (!sse || sse.readyState === 2) {
        sse.close();
        sse = setup();
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      sse.close();
      window.removeEventListener('focus', handleFocus);
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
