import { pool } from './db';
import { Assignment, DbAssignment, DbUser, History, User } from '../types';
import { sendEmail, sendReminder } from '../services/email';

export async function getChores(organisationId: number): Promise<Array<Assignment>> {
  const client = await pool.connect();
  const choresResult = await client.query<DbAssignment>(
    `
      select a.id,
             t.title,
             a.assigned_to_user_id,
             a.due_by_utc
      from assignments a
               inner join tasks t on
          a.task_id = t.id
               inner join users u on
          a.assigned_to_user_id = u.id
      where t.organisation_id = $1`,
    [organisationId]
  );

  await client.release();

  return choresResult.rows;
}

export async function completeChore(choreId: number, user: DbUser): Promise<void> {
  const client = await pool.connect();

  const historyResult = await client.query<History>(
    `insert into history("choreId", "completedById") values($1, $2) returning *`,
    [choreId, user.id]
  );

  const history = historyResult.rows[0]!;

  const updateChoreResult = await client.query<DbAssignment>(
    `update chores 
        set "completionSemaphore" = "completionSemaphore" + $1, 
            "modifiedOnUTC" = $2
       where id = $3
       returning *
  `,
    [user.id, history?.completedOnUTC, choreId]
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

  const updateChoreResult = await client.query<DbAssignment>(
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

export async function remindChore(choreId: number, user: User): Promise<boolean> {
  const client = await pool.connect();
  const choreResult = await client.query<DbAssignment>(
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
