import { pool } from './db';
import { Chore, DbChore, History, User } from '../types';
import { sendEmail, sendReminder } from '../services/email';
import { parseExpression } from 'cron-parser';

export async function getChores(): Promise<Array<Chore>> {
  const client = await pool.connect();
  const choresResult = await client.query<DbChore>(`
      select id,
             title,
             description,
             cron,
             "hoursLeftReminder",
             "completionSemaphore",
             "modifiedOnUTC"
      from chores
  `);
  await client.release();

  // determine if chore is late
  return choresResult.rows.map<Chore>((chore: DbChore) => {
    if (!chore.cron) {
      return chore;
    }

    const nextScheduledDate = parseExpression(chore.cron, { currentDate: new Date(chore.modifiedOnUTC) })
      .next()
      .toDate();

    const now = Date.now();

    // if next scheduled date is in the past, then the chore is late
    if (nextScheduledDate.getTime() - now < 0) {
      return {
        ...chore,
        isLate: true,
      };
    }

    // if next scheduled date is in the future and difference between then and now is less than hours left for reminder
    // mark task as late
    const isLate = Math.abs(nextScheduledDate.getTime() - now) / (1000 * 60 * 60) <= (chore.hoursLeftReminder || -1);
    return {
      ...chore,
      isLate,
    };
  });
}

export async function completeChore(choreId: number, user: User): Promise<void> {
  const client = await pool.connect();

  const historyResult = await client.query<History>(
    `insert into history("choreId", "completedById")values($1, $2) returning *`,
    [choreId, user.userId]
  );

  const history = historyResult.rows[0]!;

  const updateChoreResult = await client.query<DbChore>(
    `update chores 
        set "completionSemaphore" = "completionSemaphore" + $1, 
            "modifiedOnUTC" = $2
       where id = $3
       returning *
  `,
    [user.userId, history?.completedOnUTC, choreId]
  );

  await client.release();

  await sendEmail(user, updateChoreResult.rows[0]);
}

export async function undoChore(choreId: number, user: User): Promise<boolean> {
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

  const updateChoreResult = await client.query<DbChore>(
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

export async function remind(choreId: number, user: User): Promise<boolean> {
  const client = await pool.connect();
  const choreResult = await client.query<DbChore>(
    `select id,
            title,
            description,
            "completionSemaphore",
            "modifiedOnUTC"
     from chores
     where id = $1`,
    [choreId]
  );

  const chore = choreResult.rows[0];
  await client.release();

  if (!chore) {
    return false;
  }

  await sendReminder(user, chore);

  return true;
}
