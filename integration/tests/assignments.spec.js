const {
  clearTables,
  provisionOrganisation,
  provisionTasks,
  provisionAssignments,
  provisionUsers,
  query,
  provisionExemptions,
} = require('../util/db');
const { apiBase, tableNames } = require('../util/constants');
const { t } = require('../util/t');
const { ADatumCorporation, AdventureWorks } = require('../fixtures/organisations');
const { Alice, Bob, Jane, Alex, Mark } = require('../fixtures/users');
const { CleanToilet, WashDishes, CallAssociates, WeeklyRevision, LeadClientMeeting } = require('../fixtures/tasks');
const { Exemption } = require('../fixtures/exemptions');
const { Assignment } = require('../fixtures/assignments');
const { useApi } = require('../util/useApi');
const FakeMailService = require('@sendgrid/mail');

describe('Assignments routes', () => {
  const api = useApi();

  beforeEach(async () => {
    await clearTables();
  });

  afterEach(() => {
    FakeMailService.send.mockClear();
  });

  //region get
  it('should return assignments for current organisation only', async () => {
    const [aDatum, adventureWorks] = await provisionOrganisation(ADatumCorporation(), AdventureWorks());

    // aDatum
    const [cleanToilet, washDishes] = await provisionTasks(CleanToilet(aDatum.id), WashDishes(aDatum.id));
    const [bob, alice] = await provisionUsers(Bob(aDatum.id, 0), Alice(aDatum.id, 1));
    const aDatumAssignments = await provisionAssignments(
      Assignment(cleanToilet.id, bob.id, alice.id, t(-2), t(-1)),
      Assignment(cleanToilet.id, alice.id, bob.id, t(-1), t(0)),
      Assignment(cleanToilet.id, bob.id, alice.id, t(0), t(1)),
      Assignment(washDishes.id, bob.id, alice.id, t(-1), null),
      Assignment(washDishes.id, alice.id, bob.id, t(-1), t(2))
    );

    // adventure works
    const [weeklyRevision, callAssociates, leadClientMeeting] = await provisionTasks(
      WeeklyRevision(adventureWorks.id),
      CallAssociates(adventureWorks.id),
      LeadClientMeeting(adventureWorks.id)
    );
    const [mark, jane, alex] = await provisionUsers(
      Mark(adventureWorks.id),
      Jane(adventureWorks.id),
      Alex(adventureWorks.id)
    );
    const adventureWorkAssignments = await provisionAssignments(
      Assignment(weeklyRevision.id, mark.id, jane.id, t(-2), t(-1)),
      Assignment(weeklyRevision.id, alex.id, mark.id, t(-1), t(2)),
      Assignment(callAssociates.id, alex.id, mark.id, t(0), t(1)),
      Assignment(leadClientMeeting.id, jane.id, mark.id, t(-1), t(2))
    );

    const response = await api().get(`${apiBase}/assignments/current`).headers({ 'x-userid': bob.id }).end();

    expect(response.json()).toEqual([
      {
        id: aDatumAssignments[2].id,
        title: cleanToilet.title,
        assigned_to_user_id: bob.id,
        due_by_utc: aDatumAssignments[2].due_by_utc.toISOString(),
        assigned_at_utc: aDatumAssignments[2].assigned_at_utc.toISOString(),
      },
      {
        id: aDatumAssignments[4].id,
        title: washDishes.title,
        assigned_to_user_id: alice.id,
        due_by_utc: aDatumAssignments[4].due_by_utc.toISOString(),
        assigned_at_utc: aDatumAssignments[4].assigned_at_utc.toISOString(),
      },
    ]);
  });

  it('should return 400 when request body is not set', async () => {
    const [aDatum] = await provisionOrganisation(ADatumCorporation());
    const [bob] = await provisionUsers(Bob(aDatum.id));

    const response = await api().post(`${apiBase}/assignments/192134`).headers({ 'x-userid': bob.id }).end();

    expect(response.statusCode).toBe(400);
  });
  //endregion

  //region common
  it.each(['complete', 'undo', 'remind'])(
    'should return 400 when trying to "%s" a non-existent assignment',
    async action => {
      const [aDatum] = await provisionOrganisation(ADatumCorporation());
      const [bob] = await provisionUsers(Bob(aDatum.id), Alice(aDatum.id));
      const invalidAssignmentId = 192134;

      const response = await api()
        .post(`${apiBase}/assignments/${invalidAssignmentId}`)
        .headers({ 'x-userid': bob.id })
        .body({ action })
        .end();

      expect(response.statusCode).toBe(400);
      expect(response.body).toBe(`Cannot find a valid assignment with id '${invalidAssignmentId}'.`);
    }
  );

  it.each(['complete', 'undo', 'remind'])(
    'should return 400 when trying to "%s" an assignment that is outdated',
    async action => {
      const [aDatum] = await provisionOrganisation(ADatumCorporation());
      const [cleanToilet] = await provisionTasks(CleanToilet(aDatum.id));
      const [bob, alice] = await provisionUsers(Bob(aDatum.id), Alice(aDatum.id));
      const assignments = await provisionAssignments(
        Assignment(cleanToilet.id, alice.id, bob.id, t(-2), t(-1)),
        Assignment(cleanToilet.id, bob.id, alice.id, t(-1), t(0)),
        Assignment(cleanToilet.id, alice.id, bob.id, t(0), t(1))
      );

      const response = await api()
        .post(`${apiBase}/assignments/${assignments[0].id}`)
        // hack: can complete only own assignment and cannot undo own assignment
        .headers({ 'x-userid': action === 'complete' ? alice.id : bob.id })
        .body({ action })
        .end();

      expect(response.statusCode).toBe(400);
      expect(response.body).toBe(`Cannot find a valid assignment with id '${assignments[0].id}'.`);
    }
  );
  //endregion

  //region complete
  it('should return 200 and assign the task to the next user in rota when completing an assignment', async () => {
    const [aDatum] = await provisionOrganisation(ADatumCorporation());
    const [cleanToilet] = await provisionTasks(CleanToilet(aDatum.id));
    const [alice, bob] = await provisionUsers(Alice(aDatum.id, 0), Bob(aDatum.id, 1)); // bob would roll-over to alice
    const assignments = await provisionAssignments(
      Assignment(cleanToilet.id, bob.id, alice.id, t(-2), t(-1)),
      Assignment(cleanToilet.id, alice.id, bob.id, t(-1), t(0)),
      Assignment(cleanToilet.id, bob.id, alice.id, t(0), t(1))
    );

    const response = await api()
      .post(`${apiBase}/assignments/${assignments[2].id}`)
      .headers({ 'x-userid': bob.id })
      .body({ action: 'complete' })
      .end();

    expect(response.statusCode).toBe(204);
    await verifyLatestAssignment(cleanToilet.id, alice.id, bob.id, 7);
    expect(FakeMailService.send).toHaveBeenCalledTimes(1);
    expect(FakeMailService.send.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        to: alice.email,
        subject: `“${cleanToilet.title}” was assigned to you.`,
        text: ` `,
      })
    );
  });

  it('should return 200 and assign it to the same user when only 1 user exists', async () => {
    const [aDatum] = await provisionOrganisation(ADatumCorporation());
    const [cleanToilet] = await provisionTasks(CleanToilet(aDatum.id));
    const [alice] = await provisionUsers(Alice(aDatum.id, 0));
    const assignments = await provisionAssignments(Assignment(cleanToilet.id, alice.id, alice.id, t(-2), t(-1)));

    const response = await api()
      .post(`${apiBase}/assignments/${assignments[0].id}`)
      .headers({ 'x-userid': alice.id })
      .body({ action: 'complete' })
      .end();

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('Due to exemptions the task has been reassigned to you.');
    await verifyLatestAssignment(cleanToilet.id, alice.id, alice.id, 7);
    expect(FakeMailService.send).toHaveBeenCalledTimes(0);
  });

  it('should return 200 and set due_by_utc to null when task does not have a frequency set', async () => {
    const [aDatum] = await provisionOrganisation(ADatumCorporation());
    const [washDishes] = await provisionTasks(WashDishes(aDatum.id));
    const [alice, bob] = await provisionUsers(Alice(aDatum.id, 0), Bob(aDatum.id, 1));
    const assignments = await provisionAssignments(Assignment(washDishes.id, alice.id, bob.id, t(-1), null));

    const response = await api()
      .post(`${apiBase}/assignments/${assignments[0].id}`)
      .headers({ 'x-userid': alice.id })
      .body({ action: 'complete' })
      .end();

    expect(response.statusCode).toBe(204);
    await verifyLatestAssignment(washDishes.id, bob.id, alice.id, null);
    expect(FakeMailService.send).toHaveBeenCalledTimes(1);
    expect(FakeMailService.send.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        to: bob.email,
        subject: `“${washDishes.title}” was assigned to you.`,
        text: ` `,
      })
    );
  });

  //region exemptions
  it('should return 200 and create an exemption when completing a task assigned to another user', async () => {
    const [aDatum] = await provisionOrganisation(ADatumCorporation());
    const [cleanToilet] = await provisionTasks(CleanToilet(aDatum.id));
    const [alice, bob] = await provisionUsers(Alice(aDatum.id, 0), Bob(aDatum.id, 1));
    const assignments = await provisionAssignments(Assignment(cleanToilet.id, bob.id, alice.id, t(-2), t(-1)));

    const response = await api()
      .post(`${apiBase}/assignments/${assignments[0].id}`)
      .headers({ 'x-userid': alice.id })
      .body({ action: 'complete' })
      .end();

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('You will be exempted the next time this task gets assigned to you.');
    expect(await getExemptions(cleanToilet.id)).toEqual([
      expect.objectContaining({
        user_id: alice.id,
        task_id: cleanToilet.id,
      }),
    ]);
  });

  it('should return 200 use the exemption and assign the task to the next user in rota when completing an assignment', async () => {
    const [aDatum] = await provisionOrganisation(ADatumCorporation());
    const [cleanToilet] = await provisionTasks(CleanToilet(aDatum.id));
    const [alice, bob] = await provisionUsers(Alice(aDatum.id, 0), Bob(aDatum.id, 1));
    const [ex1] = await provisionExemptions(Exemption(alice.id, cleanToilet.id));
    const assignments = await provisionAssignments(
      Assignment(cleanToilet.id, bob.id, alice.id, t(-2), t(-1)),
      Assignment(cleanToilet.id, alice.id, bob.id, t(-1), t(0)),
      Assignment(cleanToilet.id, bob.id, alice.id, t(0), t(1))
    );

    const response = await api()
      .post(`${apiBase}/assignments/${assignments[2].id}`)
      .headers({ 'x-userid': bob.id })
      .body({ action: 'complete' })
      .end();

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('Due to exemptions the task has been reassigned to you.');
    await verifyLatestAssignment(cleanToilet.id, bob.id, bob.id, 7);
    expect(FakeMailService.send).toHaveBeenCalledTimes(0);
    let actual = await getAssignmentsAfter(assignments[2].id);
    expect(actual[0]).toEqual(
      expect.objectContaining({
        assigned_at_utc: ex1.created_at_utc.toISOString(),
        assigned_by_user_id: null,
        assigned_to_user_id: ex1.user_id,
        task_id: cleanToilet.id,
      })
    );
  });

  it('should return 200 use multiple exemption and assign the task to the next user in rota when completing an assignment', async () => {
    const [aDatum] = await provisionOrganisation(ADatumCorporation());
    const [cleanToilet] = await provisionTasks(CleanToilet(aDatum.id));
    const [alice, bob, jane] = await provisionUsers(Alice(aDatum.id, 0), Bob(aDatum.id, 1), Jane(aDatum.id, 2));
    await provisionExemptions(Exemption(alice.id, cleanToilet.id), Exemption(jane.id, cleanToilet.id));
    const assignments = await provisionAssignments(Assignment(cleanToilet.id, bob.id, null, t(-1), t(1)));

    const response = await api()
      .post(`${apiBase}/assignments/${assignments[0].id}`)
      .headers({ 'x-userid': bob.id })
      .body({ action: 'complete' })
      .end();

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('Due to exemptions the task has been reassigned to you.');
    await verifyLatestAssignment(cleanToilet.id, bob.id, bob.id, 7);
    expect(FakeMailService.send).toHaveBeenCalledTimes(0);
  });
  //endregion
  //endregion

  //region undo
  it('should return 400 when trying to undo an assignment that is assigned to the same user', async () => {
    const [aDatum] = await provisionOrganisation(ADatumCorporation());
    const [cleanToilet] = await provisionTasks(CleanToilet(aDatum.id));
    const [alice, bob] = await provisionUsers(Alice(aDatum.id, 0), Bob(aDatum.id, 1));
    const assignments = await provisionAssignments(
      Assignment(cleanToilet.id, bob.id, alice.id, t(-1), t(0)),
      Assignment(cleanToilet.id, alice.id, bob.id, t(0), t(1))
    );

    const response = await api()
      .post(`${apiBase}/assignments/${assignments[0].id}`)
      .headers({ 'x-userid': alice.id })
      .body({ action: 'undo' })
      .end();

    expect(response.statusCode).toBe(400);
    await verifyLatestAssignment(cleanToilet.id, alice.id, bob.id, 1);
    expect(FakeMailService.send).toHaveBeenCalledTimes(0);
  });

  it('should return 200 and undo the assignment to the previous user (deletes latest assignment)', async () => {
    const [aDatum] = await provisionOrganisation(ADatumCorporation());
    const [cleanToilet] = await provisionTasks(CleanToilet(aDatum.id));
    const [alice, bob] = await provisionUsers(Alice(aDatum.id, 0), Bob(aDatum.id, 1));
    const assignments = await provisionAssignments(
      Assignment(cleanToilet.id, alice.id, bob.id, t(-2), t(-1)),
      Assignment(cleanToilet.id, bob.id, alice.id, t(-1), t(0)),
      Assignment(cleanToilet.id, alice.id, bob.id, t(0), t(1))
    );

    const response = await api()
      .post(`${apiBase}/assignments/${assignments[2].id}`)
      .headers({ 'x-userid': bob.id })
      .body({ action: 'undo' })
      .end();

    expect(response.statusCode).toBe(204);
    await verifyLatestAssignment(cleanToilet.id, bob.id, alice.id, 0);
    expect(FakeMailService.send).toHaveBeenCalledTimes(0);
  });

  it('should return 204 and undo the task to the task to the previous assignment when previous assignment is an exemption', async () => {
    const [aDatum] = await provisionOrganisation(ADatumCorporation());
    const [cleanToilet] = await provisionTasks(CleanToilet(aDatum.id));
    const [alice, bob] = await provisionUsers(Alice(aDatum.id, 0), Bob(aDatum.id, 1));
    const assignments = await provisionAssignments(
      Assignment(cleanToilet.id, alice.id, bob.id, t(-2), t(-1)),
      Assignment(cleanToilet.id, bob.id, null, t(-1), t(0)),
      Assignment(cleanToilet.id, alice.id, bob.id, t(0), t(1))
    );

    const response = await api()
      .post(`${apiBase}/assignments/${assignments[2].id}`)
      .headers({ 'x-userid': bob.id })
      .body({ action: 'undo' })
      .end();

    expect(response.statusCode).toBe(204);
    await verifyLatestAssignment(cleanToilet.id, bob.id, null, 0);
    expect(FakeMailService.send).toHaveBeenCalledTimes(0);
  });
  //endregion

  //region reminder
  it('should return 200 and send an email to the user currently assigned ', async () => {
    const [aDatum] = await provisionOrganisation(ADatumCorporation());
    const [cleanToilet] = await provisionTasks(CleanToilet(aDatum.id));
    const [alice, bob] = await provisionUsers(Alice(aDatum.id, 0), Bob(aDatum.id, 1));
    const assignments = await provisionAssignments(Assignment(cleanToilet.id, bob.id, alice.id, t(-2), t(-1)));

    const response = await api()
      .post(`${apiBase}/assignments/${assignments[0].id}`)
      .headers({ 'x-userid': bob.id })
      .body({ action: 'remind' })
      .end();

    expect(response.statusCode).toBe(204);
    expect(FakeMailService.send.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        to: bob.email,
        subject: `[Reminder] “${cleanToilet.title}”.`,
        text: ` `,
      })
    );
  });
  //endregion
});

//region helpers
async function verifyLatestAssignment(taskId, assigned_to_user_id, assigned_by_user_id, dueDaysLeft) {
  const result = await query(
    `select * from assignments where task_id = ${taskId} order by id desc fetch first 1 rows only`
  );

  let assignment = result[0];

  expect(assignment.assigned_to_user_id).toBe(assigned_to_user_id);
  expect(assignment.assigned_by_user_id).toBe(assigned_by_user_id);
  expect(new Date(assignment.assigned_at_utc).getTime() - new Date().getTime()).toBeLessThan(1000);
  if (dueDaysLeft === null) {
    expect(assignment.due_by_utc).toBeNull();
  } else {
    let actual = Math.ceil((new Date(assignment.due_by_utc).getTime() - new Date().getTime()) / 1000 / 60 / 60 / 24);
    expect(actual).toBeCloseTo(dueDaysLeft);
  }

  expect(result).toHaveLength(1);
}

async function getAssignmentsAfter(index) {
  const result = await query(
    `select id, assigned_by_user_id, assigned_to_user_id, task_id, due_by_utc, assigned_at_utc::text from assignments where id > ${index}`
  );

  return result.map(r => ({
    ...r,
    assigned_at_utc: new Date(r.assigned_at_utc).toISOString(),
    due_by_utc: new Date(r.due_by_utc).toISOString(),
  }));
}

async function getExemptions(taskId) {
  return await query(`select * from exemptions where task_id = $1`, [taskId]);
}
//endregion
