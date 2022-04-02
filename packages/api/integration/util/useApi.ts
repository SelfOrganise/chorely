import { buildServer } from '../../src/server';

function useApi() {
  const result: any = { api: null };

  beforeAll(() => (result.api = buildServer()));

  afterAll(async () => await result.api.close());

  return () => result.api.inject();
}

module.exports = { useApi };
