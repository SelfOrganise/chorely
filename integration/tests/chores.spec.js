const faker = require('@faker-js/faker');
const { clearTables, provision } = require('../util/db');
const { tableNames, apiBase } = require('../util/constants');
const { getDefaultOrganisations } = require('../fixtures/organisations');
const { getDefaultUsers } = require('../fixtures/users');
const { getDefaultTasks } = require('../fixtures/tasks');
const { getDefaultAssignments } = require('../fixtures/assignments');
const { useApi } = require('../util/useApi');

describe('Chores routes', () => {
  const api = useApi();

  beforeEach(async () => {
    await clearTables(tableNames.assignments, tableNames.tasks, tableNames.users, tableNames.organisations);
  });

  it('should return correctly assigned tasks', async () => {
    faker.seed(1234);
    const orgs = await provision(tableNames.organisations, getDefaultOrganisations());
    const tasks = await provision(tableNames.tasks, getDefaultTasks(orgs));
    const users = await provision(tableNames.users, getDefaultUsers(orgs));
    await provision(tableNames.assignments, getDefaultAssignments(users, tasks));

    const user = users[1];

    const response = await api().get(`${apiBase}/tasks/current`).headers({ 'x-userid': user.id }).end();
    const result = response.json();
    expect(result.filter(t => t.assigned_to_user_id === user.id)).toHaveLength(3);
  });
});
