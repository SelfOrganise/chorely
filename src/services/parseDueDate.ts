import { formatDistance, parseISO, differenceInHours } from 'date-fns';

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
  const hoursLeft = differenceInHours(parsedDate, now);
  const distance = formatDistance(parsedDate, now);
  if (parsedDate < now) {
    return { dueString: `${distance} late`, isLate: true };
  } else {
    return { dueString: `due in ${distance}`, isLate: hoursLeft < 2 };
  }
};
