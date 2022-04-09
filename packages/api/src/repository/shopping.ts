import { pool } from './db';
import { response, Response } from '../utilities/response';

export async function getRecipes(organisationId: number): Promise<Array<Recipe>> {
  const result = await pool.query<Recipe>(
    `
        select id, name, created_at_utc
        from recipes
        where organisation_id = $1 and deleted = false
        order by created_at_utc desc
     `,
    [organisationId]
  );

  return result.rows;
}

export async function getRecipe(recipeId: number, organisationId: number): Promise<Response<Recipe>> {
  const recipe = await pool.query<Recipe>(
    `
        select id, name, created_at_utc
        from recipes
        where organisation_id = $1 and id = $2 and deleted = false
        order by created_at_utc asc
     `,
    [organisationId, recipeId]
  );

  if (recipe.rows.length != 1) {
    return response(400, `Cannot find recipe with id ${recipeId}.`);
  }

  const groceries = await pool.query<Grocery>(
    `
        select g.id, g.name, g.size, ri.description
        from recipe_ingredients ri
        inner join groceries g on g.id = ri.grocery_id
        where g.organisation_id = $1 and ri.recipe_id = $2
        order by g.name asc
     `,
    [organisationId, recipeId]
  );

  return response(200, {
    ...recipe.rows[0],
    groceries: groceries.rows,
  });
}

export async function deleteRecipe(recipeId: number, organisationId: number): Promise<void> {
  await pool.query(
    `
      update recipes 
      set deleted = true
      where id = $1 and organisation_id = $2
    `,
    [recipeId, organisationId]
  );
}

export async function addRecipe(name: string, organisationId: number): Promise<Response<void>> {
  await pool.query(
    `
    insert into recipes(name, organisation_id)
    values($1, $2)`,
    [name, organisationId]
  );

  return response(204);
}

export async function addGroceryToRecipe(recipeId: number, groceryId: number): Promise<Response<void>> {
  await pool.query(
    `
    insert into recipe_ingredients(recipe_id, grocery_id)
    values ($1, $2)
    `,
    [recipeId, groceryId]
  );

  return response(204);
}

export async function deleteGroceryFromRecipe(recipeId: number, groceryId: number): Promise<Response<void>> {
  // todo: add organisationId validation 😱
  await pool.query(
    `
      delete from recipe_ingredients
      where recipe_id = $1 and grocery_id = $2
    `,
    [recipeId, groceryId]
  );

  return response(204);
}

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

export async function addGroceryToBasket(groceryId: number, organisationId: number) {
  const basket = await ensureCurrentBasket(organisationId);

  await pool.query(
    `
    insert into basket_items(basket_id, grocery_id)
    values($1, $2)
  `,
    [basket.id, groceryId]
  );
}

export async function deleteGroceryFromBasket(groceryId: number, organisationId: number) {
  const basket = await ensureCurrentBasket(organisationId);

  await pool.query(
    `
    delete from basket_items
    where id in (
        select id 
        from basket_items 
        where basket_id = $1 and grocery_id = $2 
        limit 1
    )
  `,
    [basket.id, groceryId]
  );
}

export async function addRecipeToBasket(recipeId: number, organisationId: number) {
  const basket = await ensureCurrentBasket(organisationId);

  await pool.query(
    `
    insert into basket_items(basket_id, grocery_id)
    select $1 as basket_id, g.id 
    from recipes r 
    inner join recipe_ingredients ri on ri.recipe_id = r.id
    inner join groceries g on ri.grocery_id = g.id
    where r.organisation_id = $2 and r.id = $3 
  `,
    [basket.id, organisationId, recipeId]
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
