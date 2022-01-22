import { DbUser } from '../types';
import { pool } from './db';

export async function findUser(email: string | undefined): Promise<DbUser | null | undefined> {
  if (!email) {
    return null;
  }

  const client = await pool.connect();
  const users = await client.query<DbUser>(
    `
      select id from users where email = $1
  `,
    [email]
  );

  await client.release();

  if (users.rows.length !== 1) {
    return null;
  }

  return users.rows[0];
}

export async function findUserByUserId(userId: number): Promise<DbUser | undefined | null> {
  const client = await pool.connect();
  const result = await client.query<DbUser>(
    `
      select u.id,
             u."name",
             u.email,
             u.created_at_utc,
             u.is_admin,
             u.rota_order,
             u.organisation_id
      from users u
      where u.id = $1
  `,
    [userId]
  );

  await client.release();

  if (result.rows.length !== 1) {
    return null;
  }

  return result.rows[0];
}
