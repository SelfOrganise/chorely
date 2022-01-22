const faker = require('@faker-js/faker');

function getDefaultTasks(organisations) {
  const tasks = [];
  for (let i = 0; i < organisations.length * 10; i++) {
    tasks.push({
      title: `${faker.word.adjective()} ${faker.word.noun()}`,
      frequency: i % 5 === 0 ? faker.datatype.number({ min: 1, max: 7 }) : null,
      organisation_id: organisations[i % organisations.length]['id'],
    });
  }

  return tasks;
}

module.exports = { getDefaultTasks };
