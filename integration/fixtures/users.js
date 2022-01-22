const faker = require('@faker-js/faker');

function getDefaultUsers(organisations) {
  const users = [];
  for (let i = 0; i < organisations.length * 3; i++) {
    users.push({
      name: faker.name.findName(),
      email: faker.internet.email(),
      created_at_utc: faker.date.past(1),
      is_admin: false,
      rota_order: Math.floor(i / organisations.length),
      organisation_id: organisations[i % organisations.length]['id'],
    });
  }

  return users;
}

module.exports = {
  getDefaultUsers,
};
