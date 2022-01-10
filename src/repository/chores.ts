import { pool } from './db';
import { Chore, History, User } from '../types';
import { sendEmail } from '../services/email';
import { findUserByUserId } from './users';

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

export async function completeChore(choreId: number, user: User | undefined): Promise<History | null> {
  if (user == null) {
    console.log(`Could not complete chore ${choreId} because user was null.`);
    return null;
  }
  const client = await pool.connect();

  const result = await client.query(
    `insert into history("choreId", "completedById", "completedOnUTC") 
                  values($1, $2, $3) returning *`,
    [choreId, user.userId, new Date()]
  );

  const updateChoreResult = await client.query<Chore>(
    `update chores 
        set "completionSemaphore" = "completionSemaphore" + $1
       where id = $2
       returning *
  `,
    [user.userId, choreId]
  );

  await client.release();

  await sendEmail(user, updateChoreResult.rows[0]);

  return result.rows?.[0];
}
