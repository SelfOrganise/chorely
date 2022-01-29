import { pool } from './db';
import { Assignment, DbAssignment, DbExemption, DbTask, DbUser, User } from '../types';
import { sendEmail, sendReminder } from '../services/email';
import { Response, response } from '../utilities/response';
import { getUsersByOrganisation } from './users';
import { PoolClient } from 'pg';
import { setHours, setMinutes, setSeconds, addHours } from 'date-fns';

export async function getTasks(organisationId: number): Promise<Array<Assignment>> {
  const client = await pool.connect();
  const choresResult = await client.query<DbAssignment>(
    `
        select extended.id,
               t.title,
               extended.due_by_utc,
               extended.assigned_to_user_id,
               extended.assigned_at_utc
        from (
                 select a.id,
                        a.due_by_utc,
                        a.assigned_at_utc,
                        a.task_id,
                        a.assigned_to_user_id,
                        row_number() over (
                            partition by a.task_id
                            order by
                                id desc
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

  const latestAssignment = await getLatestAssignmentForTask(client, assignmentId);

  if (!latestAssignment || latestAssignment.id !== assignmentId) {
    return response(400, `Cannot find a valid assignment with id '${assignmentId}'.`);
  }

  if (latestAssignment.assigned_to_user_id != user.id) {
    await client.query(`insert into exemptions(user_id, task_id) values ($1, $2)`, [user.id, latestAssignment.task_id]);
    return response(200, `You will be exempted the next time this task gets assigned to you.`);
  }

  const orgUsers = await getUsersByOrganisation(user.organisation_id);
  const exemptions = await getExemptions(client, latestAssignment.task_id);

  const nextUser = await determineNextUser(client, user, latestAssignment, orgUsers, exemptions);

  const result = await createAssignment(client, {
    task_id: latestAssignment.task_id,
    assigned_to_user_id: nextUser.id,
    assigned_by_user_id: user.id,
    assigned_at_utc: new Date().toISOString(),
    due_by_utc: determineDueDate(latestAssignment.frequency, latestAssignment.preferred_time),
  });

  await client.release();

  if (nextUser.id === user.id) {
    return response(200, 'Due to exemptions the task has been reassigned to you.');
  } else {
    await sendEmail(nextUser.email, latestAssignment.title);
    return response(204); // todo message if it was assigned back to you
  }
}

export async function undoAssignment(assignmentId: number, user: User): Promise<Response> {
  const client = await pool.connect();

  const latestTwoAssignmentsForTask = await client.query<DbAssignment>(
    `select a.id
     from assignments a
     where task_id = (select task_id from assignments where id = $1)
     order by id desc
     fetch first 2 rows only
    `,
    [assignmentId]
  );

  if (latestTwoAssignmentsForTask.rowCount === 1) {
    return response(400, 'Cannot undo if there were no previous assignments.');
  }

  const latestAssignment = latestTwoAssignmentsForTask.rows[0];

  if (
    latestTwoAssignmentsForTask.rowCount !== 2 ||
    (latestAssignment.id != assignmentId && latestAssignment.assigned_to_user_id != user.id)
  ) {
    return response(400, `Cannot find a valid assignment with id '${assignmentId}'.`);
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
    return response(400, `Cannot find a valid assignment with id '${assignmentId}'.`);
  }

  const latestAssignment = await getLatestAssignmentForTask(client, assignmentId);

  if (!latestAssignment || assignmentId != latestAssignment.id) {
    return response(400, `Cannot find a valid assignment with id '${assignmentId}'.`);
  }

  await client.release();

  await sendReminder(details.email, details.title);

  return response(204);
}

// helpers
async function getLatestAssignmentForTask(client: PoolClient, assignmentId: number) {
  const result = await client.query<DbAssignment & Pick<DbTask, 'title' | 'frequency' | 'preferred_time'>>(
    `
        select a.id,
               a.task_id,
               a.assigned_to_user_id,
               a.due_by_utc,
               a.assigned_by_user_id,
               a.assigned_at_utc,
               t.title,
               t.frequency,
               t.preferred_time
        from assignments a
            inner join tasks t on a.task_id = t.id
        where task_id = (
            select task_id
            from assignments
            where id = $1)
        order by id desc
            fetch first 1 rows only
    `,
    [assignmentId]
  );

  return result.rows[0];
}

async function createAssignment(client: PoolClient, assignment: Omit<DbAssignment, 'id'>) {
  return await client.query<DbAssignment>(
    `insert into assignments(task_id, assigned_to_user_id, assigned_by_user_id, due_by_utc, assigned_at_utc)
                                           values ($1, $2, $3, $4, $5)`,
    [
      assignment.task_id,
      assignment.assigned_to_user_id,
      assignment.assigned_by_user_id,
      assignment.due_by_utc,
      assignment.assigned_at_utc,
    ]
  );
}

async function getExemptions(client: PoolClient, taskId: number) {
  const result = await client.query<DbExemption>(`select * from exemptions where task_id = $1`, [taskId]);
  return result.rows;
}

async function deleteExemptions(client: PoolClient, exemptionsIds: Array<number>) {
  if (exemptionsIds.length === 0) {
    return;
  }

  return await client.query<DbAssignment>(`delete from exemptions where id = ANY($1::int[])`, [exemptionsIds]);
}

async function determineNextUser(
  client: PoolClient,
  currentUser: DbUser,
  assignment: Awaited<ReturnType<typeof getLatestAssignmentForTask>>,
  users: Array<DbUser>,
  exemptions: Array<DbExemption>
) {
  let nextUser: DbUser | null = null;
  const usedExemptions = [];
  const exemptionsCopy = [...exemptions];
  let nextRotaNumber = currentUser.rota_order;

  do {
    nextRotaNumber = (nextRotaNumber + 1) % users.length;
    const user = users.find(u => u.rota_order === nextRotaNumber)!;
    const exemptionIndex = exemptionsCopy.findIndex(e => e.user_id === user.id);
    if (exemptionIndex > -1) {
      usedExemptions.push(exemptionsCopy[exemptionIndex].id);
      // create a past assignment for the exemption to have a flat history in assignments table
      await createAssignment(client, {
        task_id: assignment.task_id,
        assigned_by_user_id: null,
        assigned_to_user_id: user.id,
        assigned_at_utc: exemptionsCopy[exemptionIndex].created_at_utc,
        due_by_utc: determineDueDate(assignment.frequency, assignment.preferred_time),
      });
      exemptionsCopy.splice(exemptionIndex, 1); // remove used exemption
    } else {
      nextUser = user;
    }
  } while (!nextUser);

  await deleteExemptions(client, usedExemptions);

  return nextUser;
}

function determineDueDate(frequency: number | null, preferred_time: number | null) {
  if (!frequency || !preferred_time) {
    return null;
  }

  return setSeconds(setMinutes(setHours(addHours(new Date(), frequency), preferred_time), 0), 0).toISOString();
}
