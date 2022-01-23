function Assignment(task_id, assigned_to_user_id, assigned_by_user_id, assigned_on_utc, due_by_utc) {
  return {
    task_id,
    assigned_to_user_id,
    assigned_by_user_id,
    due_by_utc,
    assigned_on_utc,
  };
}

module.exports = { Assignment };
