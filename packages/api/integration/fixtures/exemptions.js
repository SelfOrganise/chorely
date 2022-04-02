function Exemption(user_id, task_id, created_at_utc = new Date().toISOString()) {
  return {
    task_id,
    user_id,
    created_at_utc,
  };
}

module.exports = { Exemption };
