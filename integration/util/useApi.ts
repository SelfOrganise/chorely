import { buildServer } from '../../src/server';

function useApi() {
  const result = { api: null };

  beforeAll(() => (result.api = buildServer()));

  afterAll(async () => await result.api.close());

  return () => result.api.inject();
}

module.exports = { useApi };
