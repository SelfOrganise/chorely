import { pool } from './db';
import { Chore, History, User } from '../types';
import { sendEmail } from '../services/email';

export async function getChores(): Promise<Array<Chore>> {
  const client = await pool.connect();
  const chores = await client.query(`
      select id,
             title,
             description,
             "completionSemaphore",
             "modifiedOnUTC"
      from chores
  `);
  await client.release();

  return chores.rows;
}

export async function completeChore(choreId: number, user: User): Promise<void> {
  const client = await pool.connect();

  const historyResult = await client.query<History>(
    `insert into history("choreId", "completedById")values($1, $2) returning *`,
    [choreId, user.userId]
  );

  const history = historyResult.rows[0]!;

  const updateChoreResult = await client.query<Chore>(
    `update chores 
        set "completionSemaphore" = "completionSemaphore" + $1, 
            "modifiedOnUTC" = $2
       where id = $3
       returning *
  `,
    [user.userId, history?.completedOnUTC, choreId]
  );

  await client.release();

  // await sendEmail(user, updateChoreResult.rows[0]);
}

export async function undoChore(choreId: number): Promise<boolean> {
  const client = await pool.connect();

  const latestHistoryResult = await client.query<History>(
    `delete from history
     where "id" in (
        select "id"
        from history
        where "choreId" = $1
        order by "completedOnUTC" desc
        limit 1
     )
     returning *;
    `,
    [choreId]
  );

  const latestHistory = latestHistoryResult.rows[0];

  if (!latestHistory) {
    return false;
  }

  const previousHistoryResult = await client.query<History>(
    `select "completedOnUTC"
     from history
     where "choreId" = $1
     order by "completedOnUTC" desc
     limit 1`,
    [choreId]
  );

  const previousHistory = previousHistoryResult?.rows[0];
  console.log(previousHistory);

  const updateChoreResult = await client.query<Chore>(
    `update chores 
        set "completionSemaphore" = "completionSemaphore" - $1, 
            "modifiedOnUTC" = $2
       where id = $3
       returning *
  `,
    [latestHistory.completedById, previousHistory?.completedOnUTC || new Date(), choreId]
  );

  await client.release();

  // await sendEmail(user, updateChoreResult.rows[0]);

  return true;
}
