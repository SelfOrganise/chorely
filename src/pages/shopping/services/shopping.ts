import { fetcher } from 'srcRootDir/services/fetcher';

export async function addGrocery(grocery: Omit<Grocery, 'id'>): Promise<unknown> {
  return await fetcher('/shopping/groceries', { method: 'POST', body: JSON.stringify(grocery) });
}

export async function updateOrCreateMap(storeMap: MapDefinition): Promise<unknown> {
  return await fetcher('/shopping/maps', { method: 'POST', body: JSON.stringify({ data: JSON.stringify(storeMap) }) });
}

export async function solveShopping(weights: Array<Array<number>>): Promise<Array<Array<number>>> {
  return await fetcher('/shopping/solve', {
    method: 'POST',
    body: JSON.stringify({
      weights,
      numberOfPeople: 2,
    }),
  });
}
