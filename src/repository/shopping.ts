import { DbGrocery, DbUser, Grocery, MapData } from "../types";
import { pool } from "./db";
import { response, Response } from "../utilities/response";

export async function getGroceries(organisationId: number): Promise<Array<Grocery>> {
  const client = await pool.connect();
  const result = await client.query<Grocery>(
    `
        select id, name, size
        from groceries
        where organisation_id = $1
        order by name asc
     `,
    [organisationId]
  );

  await client.release();

  return result.rows;
}

export async function addGrocery({ name, size }: Pick<DbGrocery, 'name' | 'size'>, user: DbUser): Promise<Response<Grocery>> {
  const client = await pool.connect();
  const result = await client.query<Grocery>(
    `
        insert into groceries(name, size, organisation_id) 
        values($1, $2, $3) 
        returning id, name
    `, [name, size, user.organisation_id]);

  await client.release();

  return response(200, result.rows[0])
}

export async function getMaps(organisationId: number): Promise<Array<MapData>> {
  const client = await pool.connect();
  const result = await client.query<MapData>(
    `
        select id, data
        from maps
        where organisation_id = $1
     `,
    [organisationId]
  );

  await client.release();

  return result.rows;
}

export async function updateOrCreateMap(map: Pick<MapData, 'data'>, organisationId: number): Promise<void> {
  const client = await pool.connect();

  // note: currently only support 1 map per organisation
  const maps = await getMaps(organisationId);
  if (maps.length > 0) {
    const mapId = maps[0].id;

    await client.query<MapData>(
      `
        update maps
        set data = $1
        where organisation_id = $2 and id = $3
     `,
      [map.data, organisationId, mapId]
    );
  } else {
    await client.query<MapData>(
      `
        insert into maps(data, organisation_id)
        values($1, $2)
     `,
      [map.data, organisationId]
    );
  }

  await client.release();
}
