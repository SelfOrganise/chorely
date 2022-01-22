const { Pool } = require('pg');

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

const clearTables = withDbClient(async (client, ...tableNames) => {
  for (const tableName of tableNames) {
    await client.query(`delete from ${tableName} where true`);
  }
});

// eg for [{ name: 'a' }, { name: 'b' }]
const provision = withDbClient(async (client, tableName, data) => {
  // ["name"]
  const columnNames = Object.keys(data[0]);

  // ['a', 'b']
  const allValues = data.flatMap(d => Object.values(d));

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

function expand(items) {
  const columnCount = Object.values(items[0]).length;
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

module.exports = { pool, provision, clearTables };
