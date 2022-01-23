const { Pool, types } = require('pg');

const { tableNames } = require('./constants');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
});

function withDbClient(callback) {
  return async (...args) => {
    const client = await pool.connect();
    const result = callback(client, ...args);
    await client.release();

    return result;
  };
}

const clearTables = withDbClient(async client => {
  await client.query(`delete from ${tableNames.assignments} where true`);
  await client.query(`delete from ${tableNames.tasks} where true`);
  await client.query(`delete from ${tableNames.users} where true`);
  await client.query(`delete from ${tableNames.organisations} where true`);
});

// eg for [{ name: 'a' }, { name: 'b' }]
const provision = withDbClient(async (client, tableName, data) => {
  // ["name"]
  const columnNames = Object.keys(data[0]).filter(key => typeof data[0][key] !== 'function');

  // ['a', 'b']
  const allValues = data.flatMap(d => columnNames.map(col => d[col]));

  // '"name"'
  const columnNameList = columnNames.map(c => `"${c}"`).join(',');

  // ($1) ($2)
  const valuesPlaceholder = expand(data);

  const query = `
      insert into ${tableName}(${columnNameList}) values ${valuesPlaceholder} returning *
    `;

  const result = await client.query(query, allValues);

  return result.rows;
});

const query = withDbClient(async (client, tableName, query, queryValues) => {
  const result = await client.query(query, queryValues);

  return result.rows;
});

function provisionOrganisation(...data) {
  return provision(tableNames.organisations, data);
}

function provisionUsers(...data) {
  return provision(tableNames.users, data);
}

function provisionTasks(...data) {
  return provision(tableNames.tasks, data);
}

function provisionAssignments(...data) {
  return provision(tableNames.assignments, data);
}

function expand(items) {
  const columnCount = Object.keys(items[0]).filter(key => typeof items[0][key] !== 'function').length;
  let index = 1;
  return Array(items.length)
    .fill(0)
    .map(
      () =>
        `(${Array(columnCount)
          .fill(0)
          .map(() => `$${index++}`)
          .join(', ')})`
    )
    .join(', ');
}

module.exports = { query, clearTables, provisionOrganisation, provisionTasks, provisionAssignments, provisionUsers };
