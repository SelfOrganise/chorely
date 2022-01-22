const { apiBase, tableNames } = require('../util/constants');
const { useApi } = require('../util/useApi');
const { getDefaultUsers } = require('../fixtures/users');
const { getDefaultOrganisations } = require('../fixtures/organisations');
const { provision, clearTables } = require('../util/db');

describe('Unauthenticated routes', () => {
  const api = useApi();

  beforeEach(async () => {
    await clearTables(tableNames.users, tableNames.organisations);
  });

  it('should response 200 on healthz endpoint', async () => {
    const result = await api().get('/healthz').end();
    expect(result.statusCode).toBe(200);
  });

  it('should authenticate', async () => {
    const orgs = await provision(tableNames.organisations, getDefaultOrganisations());
    const users = await provision(tableNames.users, getDefaultUsers(orgs));

    const user = users[0];
    const result = await api().post(`${apiBase}/login`).body({ username: user.email });
    expect(result.json()).toEqual({ id: user.id });
  });

  it('should return 401 on invalid user', async () => {
    const result = await api().post(`${apiBase}/login`).body({ username: 'unknown' });
    expect(result.statusCode).toBe(401);
  });
});
