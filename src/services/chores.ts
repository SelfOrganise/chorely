import { fetcher } from 'srcRootDir/services/fetcher';
export async function baseAssignmentAction(assignmentId: number, body: any) {
  await fetcher(`/assignments/${assignmentId}`, { method: 'POST', body: JSON.stringify(body) });
}

export async function completeAssignment(assignment: number) {
  await baseAssignmentAction(assignment, { action: 'complete' });
}

export async function undoAssignment(assignment: number) {
  await baseAssignmentAction(assignment, { action: 'undo' });
}

export async function sendReminder(assignment: number) {
  await baseAssignmentAction(assignment, { action: 'remind' });
}
