import { fetcher } from 'srcRootDir/services/fetcher';

export async function addGrocery(grocery: Omit<Grocery, 'id'>): Promise<unknown> {
  return await fetcher('/shopping/groceries', { method: 'POST', body: JSON.stringify(grocery) });
}

export async function updateOrCreateMap(storeMap: Pick<MapData, 'data'>): Promise<unknown> {
  return await fetcher('/shopping/maps', { method: 'POST', body: JSON.stringify(storeMap) });
}
