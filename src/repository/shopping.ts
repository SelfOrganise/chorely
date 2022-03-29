import { Basket, BasketItem, DbBasket, DbBasketItem, DbGrocery, DbUser, Grocery, MapData } from '../types';
import { pool } from './db';
import { response, Response } from '../utilities/response';

export async function getGroceries(organisationId: number): Promise<Array<Grocery>> {
  const result = await pool.query<Grocery>(
    `
        select id, name, size
        from groceries
        where organisation_id = $1
        order by name asc
     `,
    [organisationId]
  );

  return result.rows;
}

export async function addGrocery(
  { name, size }: Pick<DbGrocery, 'name' | 'size'>,
  user: DbUser
): Promise<Response<Grocery>> {
  const result = await pool.query<Grocery>(
    `
        insert into groceries(name, size, organisation_id) 
        values($1, $2, $3) 
        returning id, name
    `,
    [name, size, user.organisation_id]
  );

  return response(200, result.rows[0]);
}

export async function getStoreMaps(organisationId: number): Promise<Array<MapData>> {
  const result = await pool.query<MapData>(
    `
        select id, data
        from maps
        where organisation_id = $1
     `,
    [organisationId]
  );

  return result.rows;
}

export async function updateOrCreateMap(map: Pick<MapData, 'data'>, organisationId: number): Promise<void> {
  // note: currently only support 1 map per organisation
  const maps = await getStoreMaps(organisationId);

  if (maps.length > 0) {
    const mapId = maps[0].id;

    await pool.query<MapData>(
      `
        update maps
        set data = $1
        where organisation_id = $2 and id = $3
     `,
      [map.data, organisationId, mapId]
    );
  } else {
    await pool.query<MapData>(
      `
        insert into maps(data, organisation_id)
        values($1, $2)
     `,
      [map.data, organisationId]
    );
  }
}

export async function addToBasket(groceryId: number, organisationId: number) {
  const basket = await ensureCurrentBasket(organisationId);

  await pool.query(
    `
    insert into basket_items(basket_id, grocery_id)
    values($1, $2)
  `,
    [basket.id, groceryId]
  );
}

export async function ensureCurrentBasket(organisationId: number): Promise<DbBasket> {
  const latestBasket = await _getCurrentBasket(organisationId);

  if (latestBasket) {
    return latestBasket;
  }

  return await createNewBasket(organisationId);
}

export async function createNewBasket(organisationId: number): Promise<DbBasket> {
  const basketResult = await pool.query<DbBasket>(
    `
      insert into baskets(organisation_id) 
      values($1)
      returning *
    `,
    [organisationId]
  );

  return basketResult.rows[0];
}

export async function _getCurrentBasket(organisationId: number): Promise<DbBasket | null> {
  const baskets = await pool.query<DbBasket>(
    `
      select id 
      from baskets
      where organisation_id = $1
      order by id desc
      fetch first 1 rows only
  `,
    [organisationId]
  );

  return baskets.rows[0];
}

export async function getCurrentBasket(organisationId: number): Promise<Basket | null> {
  const currentBasket = await _getCurrentBasket(organisationId);

  if (!currentBasket) {
    return null;
  }

  const basketItems = await pool.query<BasketItem>(
    `
      select i.id as basketId, g.*
      from basket_items i
      inner join groceries g on g.id = i.grocery_id
      where basket_id = $1
      order by g.name asc
     `,
    [currentBasket.id]
  );

  return {
    id: currentBasket.id,
    created_at_utc: currentBasket.create_at_utc,
    items: basketItems.rows,
  };
}
