import { formatDistance, parseISO } from 'date-fns';

export const parseDueDate = (assignment: Assignment): { dueString: string; isLate?: boolean } => {
  const now = new Date();
  if (!assignment.due_by_utc) {
    let lastCompleted = formatDistance(parseISO(assignment.assigned_at_utc), now);
    return {
      dueString: `completed ${lastCompleted} ago`,
      isLate: false,
    };
  }

  const parsedDate = parseISO(assignment.due_by_utc);
  const distance = formatDistance(parsedDate, new Date());
  if (parsedDate < now) {
    return { dueString: `${distance} late`, isLate: true };
  } else {
    return { dueString: `due in ${distance}` };
  }
};
