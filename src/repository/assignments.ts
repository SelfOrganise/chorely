import { pool } from './db';
import { Assignment, DbAssignment, DbUser, History, User } from '../types';
import { sendEmail, sendReminder } from '../services/email';
import { Response, response } from '../utilities/response';
import { getUsersByOrganisation } from './users';

export async function getTasks(organisationId: number): Promise<Array<Assignment>> {
  const client = await pool.connect();
  const choresResult = await client.query<DbAssignment>(
    `
        select extended.id,
               t.title,
               extended.due_by_utc,
               extended.assigned_to_user_id
        from (
                 select a.id,
                        a.due_by_utc,
                        a.task_id,
                        a.assigned_to_user_id,
                        row_number() over (
                            partition by a.task_id
                            order by
                                due_by_utc desc
                            ) as row_number
                 from assignments a) as extended
                 inner join tasks t on
            extended.task_id = t.id
        where extended.row_number = 1
          and t.organisation_id = $1
     `,
    [organisationId]
  );

  await client.release();

  return choresResult.rows;
}

export async function completeAssignment(assignmentId: number, user: DbUser): Promise<Response | void> {
  const client = await pool.connect();

  const assignmentResult = await client.query<DbAssignment>(
    `select a.id,
            a.task_id,
            a.assigned_to_user_id,
            a.assigned_by_user_id,
            a.due_by_utc,
            a.assigned_on_utc
     from assignments a
     where a.id = $1 and a.assigned_to_user_id = $2`,
    [assignmentId, user.id]
  );

  if (assignmentResult.rowCount !== 1) {
    return response(400, `Cannot find assignment with id '${assignmentId}'.`);
  }

  const latestAssignment = await client.query<DbAssignment>(
    `select a.id
     from assignments a
     where task_id = (select task_id from assignments where id = $1)
     order by due_by_utc desc
     fetch first 1 rows only
    `, [assignmentId]
  );

  if (latestAssignment.rowCount !== 1 || assignmentResult.rows[0].id != latestAssignment.rows[0].id) {
    return response(400, `Cannot process assignment with id '${assignmentId}' because it is outdated.`);
  }

  const orgUsers = await getUsersByOrganisation(user.organisation_id);

  const nextRotaIndex = (user.rota_order + 1) % orgUsers.length;
  const nextUser = orgUsers.find(u => u.rota_order === nextRotaIndex) || user;

  const result = await client.query<DbAssignment>(
    `insert into assignments(task_id, assigned_to_user_id, assigned_by_user_id, assigned_on_utc, due_by_utc)
                     values ($1, $2, $3, $4, $5)
    `,
    [
      assignmentResult.rows[0].task_id,
      nextUser.id,
      user.id,
      new Date(),
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // default 14 days in the future TODO frequency
    ]
  );

  await client.release();

  return response(200); // todo message if it was assigned back to you

  // await sendEmail(user, updateChoreResult.rows[0]);
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
