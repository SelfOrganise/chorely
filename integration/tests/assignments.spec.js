const {
  clearTables,
  provisionOrganisation,
  provisionTasks,
  provisionAssignments,
  provisionUsers,
  query,
} = require('../util/db');
const { apiBase, tableNames } = require('../util/constants');
const { t } = require('../util/t');
const { ADatumCorporation, AdventureWorks } = require('../fixtures/organisations');
const { Alice, Bob, Jane, Alex, Mark } = require('../fixtures/users');
const { CleanToilet, WashDishes, CallAssociates, WeeklyRevision, LeadClientMeeting } = require('../fixtures/tasks');
const { Assignment } = require('../fixtures/assignments');
const { useApi } = require('../util/useApi');
const FakeMailService = require('@sendgrid/mail');

describe('Assignments routes', () => {
  const api = useApi();
  jest.fn();

  beforeEach(async () => {
    await clearTables();
  });

  it('should return assignments for current organisation only', async () => {
    const [aDatum, adventureWorks] = await provisionOrganisation(ADatumCorporation(), AdventureWorks());

    // aDatum
    const [cleanToilet, washDishes] = await provisionTasks(CleanToilet(aDatum.id), WashDishes(aDatum.id));
    const [bob, alice] = await provisionUsers(Bob(aDatum.id), Alice(aDatum.id));
    const aDatumAssignments = await provisionAssignments(
      Assignment(cleanToilet.id, bob.id, alice.id, t(-2), t(-1)),
      Assignment(cleanToilet.id, alice.id, bob.id, t(-1), t(0)),
      Assignment(cleanToilet.id, bob.id, alice.id, t(0), t(1)),
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
      },
      {
        id: aDatumAssignments[3].id,
        title: washDishes.title,
        assigned_to_user_id: alice.id,
        due_by_utc: aDatumAssignments[3].due_by_utc.toISOString(),
      },
    ]);
  });

  it('should return 400 when request body is not set', async () => {
    const [aDatum] = await provisionOrganisation(ADatumCorporation());
    const [bob] = await provisionUsers(Bob(aDatum.id));

    const response = await api().post(`${apiBase}/assignments/192134`).headers({ 'x-userid': bob.id }).end();

    expect(response.statusCode).toBe(400);
  });

  it('should return 400 when assignment id is invalid', async () => {
    const [aDatum] = await provisionOrganisation(ADatumCorporation());
    const [bob] = await provisionUsers(Bob(aDatum.id), Alice(aDatum.id));
    const invalidAssignmentId = 192134;

    const response = await api()
      .post(`${apiBase}/assignments/${invalidAssignmentId}`)
      .headers({ 'x-userid': bob.id })
      .body({ action: 'complete' })
      .end();

    expect(response.statusCode).toBe(400);
    expect(response.body).toBe(`Cannot find assignment with id '${invalidAssignmentId}'.`);
  });

  it('should return 400 when assignment is outdated', async () => {
    const [aDatum] = await provisionOrganisation(ADatumCorporation());
    const [cleanToilet] = await provisionTasks(CleanToilet(aDatum.id), WashDishes(aDatum.id));
    const [bob, alice] = await provisionUsers(Bob(aDatum.id), Alice(aDatum.id));
    const assignments = await provisionAssignments(
      Assignment(cleanToilet.id, bob.id, alice.id, t(-2), t(-1)),
      Assignment(cleanToilet.id, alice.id, bob.id, t(-1), t(0)),
      Assignment(cleanToilet.id, bob.id, alice.id, t(0), t(1))
    );

    const response = await api()
      .post(`${apiBase}/assignments/${assignments[0].id}`)
      .headers({ 'x-userid': bob.id })
      .body({ action: 'complete' })
      .end();

    expect(response.statusCode).toBe(400);
    expect(response.body).toBe(`Cannot process assignment with id '${assignments[0].id}' because it is outdated.`);
  });

  it('should return 200 and assign the task to the next user in rota', async () => {
    const [aDatum] = await provisionOrganisation(ADatumCorporation());
    const [cleanToilet] = await provisionTasks(CleanToilet(aDatum.id), WashDishes(aDatum.id));
    const [alice, bob] = await provisionUsers(Alice(aDatum.id, 1), Bob(aDatum.id, 2)); // bob would roll-over to alice
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
    await verifyLatestAssignment(cleanToilet.id, alice.id, bob.id, 13.99);
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
    const [alice] = await provisionUsers(Alice(aDatum.id, 1));
    const assignments = await provisionAssignments(Assignment(cleanToilet.id, alice.id, alice.id, t(-2), t(-1)));

    const response = await api()
      .post(`${apiBase}/assignments/${assignments[0].id}`)
      .headers({ 'x-userid': alice.id })
      .body({ action: 'complete' })
      .end();

    expect(response.statusCode).toBe(200);
    await verifyLatestAssignment(cleanToilet.id, alice.id, alice.id, 13.99);
    expect(FakeMailService.send).toHaveBeenCalledTimes(1);
    expect(FakeMailService.send.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        to: alice.email,
        subject: `“${cleanToilet.title}” was assigned to you.`,
        text: ` `,
      })
    );
  });
});

// helpers
async function verifyLatestAssignment(
  taskId,
  assigned_to_user_id,
  assigned_by_user_id,
  dueDaysLeft,
  assignedOn = 1000
) {
  const result = await query(
    tableNames.assignments,
    `select * from assignments where task_id = ${taskId} order by due_by_utc desc fetch first 1 rows only`
  );

  expect(result[0].assigned_to_user_id).toBe(assigned_to_user_id);
  expect(result[0].assigned_by_user_id).toBe(assigned_by_user_id);
  expect(new Date(result[0].assigned_on_utc).getTime() - new Date().getTime()).toBeLessThan(1000);
  expect((new Date(result[0].due_by_utc).getTime() - new Date().getTime()) / 1000 / 60 / 60 / 24).toBeCloseTo(
    dueDaysLeft,
    1
  );

  expect(result).toHaveLength(1);
}
