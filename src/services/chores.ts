import { fetcher } from 'srcRootDir/services/fetcher';
export async function baseChoreAction(choreId: number, body: any) {
  await fetcher(`/chores/${choreId}`, { method: 'POST', body: JSON.stringify(body) });
}

export async function completeChore(choreId: number) {
  await baseChoreAction(choreId, { action: 'complete' });
}

export async function undoChore(choreId: number) {
  await baseChoreAction(choreId, { action: 'undo' });
}

export async function sendReminder(choreId: number) {
  await baseChoreAction(choreId, { action: 'remind' });
}
