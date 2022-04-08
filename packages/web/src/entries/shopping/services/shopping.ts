import { fetcher } from 'srcRootDir/common/services/fetcher';

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
