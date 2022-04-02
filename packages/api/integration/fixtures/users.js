const Alice = (organisation_id, rota_order = 0) => ({
  name: 'alice',
  email: 'alice@home.com',
  created_at_utc: new Date().toISOString(),
  is_admin: false,
  rota_order,
  organisation_id,
});

const Bob = (organisation_id, rota_order = 0) => ({
  name: 'bob',
  email: 'bob@home.com',
  created_at_utc: new Date().toISOString(),
  is_admin: false,
  rota_order,
  organisation_id,
});

const Mark = (organisation_id, rota_order = 0) => ({
  name: 'mark',
  email: 'mark@office.com',
  created_at_utc: new Date().toISOString(),
  is_admin: false,
  rota_order,
  organisation_id,
});

const Jane = (organisation_id, rota_order = 0) => ({
  name: 'Jane',
  email: 'jane@office.com',
  created_at_utc: new Date().toISOString(),
  is_admin: false,
  rota_order,
  organisation_id,
});

const Alex = (organisation_id, rota_order = 0) => ({
  name: 'Alex',
  email: 'alex@office.com',
  created_at_utc: new Date().toISOString(),
  is_admin: false,
  rota_order,
  organisation_id,
});

module.exports = {
  Bob,
  Alice,
  Mark,
  Jane,
  Alex,
};
