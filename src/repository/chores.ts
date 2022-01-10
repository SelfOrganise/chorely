import { pool } from './db';
import { sendEmail } from '../services/email';

interface Chore {
  id: number;
  title: string;
  description: string;
  completions: Array<number>;
}

interface History {
  choreId: number;
  completedOnUTC: string;
  completedById: number;
}

export async function getChores(): Promise<Array<Chore>> {
  const client = await pool.connect();
  const chores = await client.query(`
      select id,
             title,
             description,
             "completionSemaphore"
      from chores
  `);
  await client.release();

  return chores.rows;
}

export async function completeChore(choreId: number, userId: number): Promise<History> {
  const client = await pool.connect();

  const result = await client.query(
    `insert into history("choreId", "completedById", "completedOnUTC") 
                  values($1, $2, $3) returning *`,
    [choreId, userId, new Date()]
  );

  await client.query(
    `update chores 
        set "completionSemaphore" = "completionSemaphore" + $1
       where id = $2
       returning *
  `,
    [userId, choreId]
  );

  await client.release();

  // await sendEmail();

  return result.rows?.[0];
}
