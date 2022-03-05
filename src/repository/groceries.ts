import { Grocery } from "../types";
import { pool } from "./db";

export async function getGroceries(organisationId: number): Promise<Array<Grocery>> {
  const client = await pool.connect();
  const choresResult = await client.query<Grocery>(
    `
        select id, name
        from groceries
        where organisation_id = $1
        order by name asc
     `,
    [organisationId]
  );

  await client.release();

  return choresResult.rows;
}
