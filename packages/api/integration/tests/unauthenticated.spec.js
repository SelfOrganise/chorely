const { apiBase, tableNames } = require('../util/constants');
const { useApi } = require('../util/useApi');
const { Alice, Bob, Alex } = require('../fixtures/users');
const { ADatumCorporation, AdventureWorks } = require('../fixtures/organisations');
const { clearTables, provisionOrganisation, provisionUsers } = require('../util/db');

describe('Unauthenticated routes', () => {
  const api = useApi();

  beforeEach(async () => {
    await clearTables();
  });

  it('should response 200 on healthz endpoint', async () => {
    const result = await api().get('/healthz').end();
    expect(result.statusCode).toBe(200);
  });

  it('should authenticate', async () => {
    const [aDatum] = await provisionOrganisation(ADatumCorporation(), AdventureWorks());
    const [alice] = await provisionUsers(Alice(aDatum.id), Bob(aDatum.id));

    const result = await api().post(`${apiBase}/login`).body({ username: alice.email });
    expect(result.json()).toEqual({ id: alice.id });
  });

  it('should return 401 on invalid user', async () => {
    const result = await api().post(`${apiBase}/login`).body({ username: 'unknown' });
    expect(result.statusCode).toBe(401);
  });
});
