import { DbGrocery, DbUser, Grocery } from "../types";
import { pool } from "./db";
import { response, Response } from "../utilities/response";

export async function getGroceries(organisationId: number): Promise<Array<Grocery>> {
  const client = await pool.connect();
  const result = await client.query<Grocery>(
    `
        select id, name
        from groceries
        where organisation_id = $1
        order by name asc
     `,
    [organisationId]
  );

  await client.release();

  return result.rows;
}


export async function addGrocery({ name }: Pick<DbGrocery, 'name'>, user: DbUser): Promise<Response<Grocery>> {
  const client = await pool.connect();
  const result = await client.query<Grocery>(
    `
        insert into groceries(name, organisation_id) 
        values($1, $2) 
        returning id, name
    `, [name, user.organisation_id]);

  await client.release();

  return response(200, result.rows[0])
}
