interface Assignment {
  id: number;
  assigned_to_user_id: number;
  assigned_at_utc: string;
  due_by_utc: string | null;
  title: string;
  subtasks: string[] | null;
}
