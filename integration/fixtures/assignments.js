const faker = require('@faker-js/faker');

function getDefaultAssignments(users, tasks) {
  const assignments = [];
  for (let i = 0; i < tasks.length; i++) {
    const currentTask = tasks[i];
    const currentOrgId = currentTask.organisation_id;
    const orgUsers = users.filter(u => u.organisation_id === currentOrgId);

    assignments.push({
      task_id: currentTask.id,
      assigned_to_user_id: orgUsers[i % orgUsers.length].id,
      due_by_utc: faker.date.soon(currentTask.frequency / 2),
      assigned_by_user_id: orgUsers[(i + 1) % orgUsers.length].id,
      assigned_on_utc: faker.date.soon(-currentTask.frequency / 2),
    });
  }

  return assignments;
}

module.exports = { getDefaultAssignments };
