import { pool } from './db';
import { Assignment, DbAssignment, DbTask, DbUser, History, User } from '../types';
import { sendEmail, sendReminder } from '../services/email';
import { Response, response } from '../utilities/response';
import { getUsersByOrganisation } from './users';
import { PoolClient } from 'pg';

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

  const assignmentResult = await client.query<DbAssignment & Pick<DbTask, 'title'>>(
    `select a.id,
            a.task_id,
            a.assigned_to_user_id,
            a.assigned_by_user_id,
            a.due_by_utc,
            a.assigned_on_utc,
            t.title
     from assignments a
     inner join tasks t on a.task_id = t.id
     where a.id = $1 and a.assigned_to_user_id = $2`,
    [assignmentId, user.id]
  );

  if (assignmentResult.rowCount !== 1) {
    return response(400, `Cannot find assignment with id '${assignmentId}'.`);
  }

  const latestAssignmentForTask = await getLatestAssignmentForTask(client, assignmentId);

  if (latestAssignmentForTask.rowCount !== 1 || assignmentId != latestAssignmentForTask.rows[0].id) {
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

  await sendEmail(nextUser.email, assignmentResult.rows[0].title);

  return response(204); // todo message if it was assigned back to you
}

export async function undoAssignment(assignmentId: number, user: User): Promise<Response> {
  const client = await pool.connect();

  const assignmentResult = await client.query<DbAssignment & Pick<DbTask, 'title'>>(
    `select a.id,
            a.assigned_to_user_id
     from assignments a
     where a.id = $1 and a.assigned_to_user_id != $2`,
    [assignmentId, user.id]
  );

  if (assignmentResult.rowCount !== 1) {
    return response(400, `Cannot find assignment with id '${assignmentId}'.`);
  }

  const latestTwoAssignmentsForTask = await client.query<DbAssignment>(
    `select a.id
     from assignments a
     where task_id = (select task_id from assignments where id = $1)
     order by due_by_utc desc
     fetch first 2 rows only
    `,
    [assignmentId]
  );

  if (latestTwoAssignmentsForTask.rowCount === 1) {
    return response(400, 'Cannot undo if there were no previous assignments.');
  }

  if (
    latestTwoAssignmentsForTask.rowCount !== 2 ||
    assignmentResult.rows[0].id != latestTwoAssignmentsForTask.rows[0].id
  ) {
    return response(400, `Cannot process assignment with id '${assignmentId}' because it is outdated.`);
  }

  const result = await client.query(
    `delete from assignments
     where id = $1`,
    [assignmentId]
  );

  await client.release();

  return response(204);
}

export async function remindAssignment(assignmentId: number): Promise<Response> {
  const client = await pool.connect();
  const getAssignmentDetails = await client.query<Pick<DbUser, 'email'> & Pick<DbTask, 'title'>>(
    `select u.email, t.title
     from assignments a 
     inner join users u on u.id = a.assigned_to_user_id
     inner join tasks t on t.id = a.task_id
     where a.id = $1`,
    [assignmentId]
  );

  const details = getAssignmentDetails.rows[0];

  if (!details) {
    return response(400, `Cannot find assignment with id '${assignmentId}'.`);
  }

  const latestAssignmentForTask = await getLatestAssignmentForTask(client, assignmentId);

  if (latestAssignmentForTask.rowCount !== 1 || assignmentId != latestAssignmentForTask.rows[0].id) {
    return response(400, `Cannot process assignment with id '${assignmentId}' because it is outdated.`);
  }

  await client.release();

  await sendReminder(details.email, details.title);

  return response(204);
}

// helpers
async function getLatestAssignmentForTask(client: PoolClient, assignmentId: number) {
  return await client.query<DbAssignment>(
    `select a.id
     from assignments a
     where task_id = (select task_id from assignments where id = $1)
     order by due_by_utc desc
     fetch first 1 rows only
    `,
    [assignmentId]
  );
}
