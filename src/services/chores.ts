import { fetcher } from 'srcRootDir/services/fetcher';

export async function completeChore(choreId: number) {
  await fetcher(`/chores/${choreId}`, { method: 'POST' });
}

export async function undoChore(choreId: number) {
  await fetcher(`/chores/${choreId}/undo`, { method: 'POST' });
}

export async function sendReminder(choreId: number) {
  await fetcher(`/chores/${choreId}/remind`, { method: 'POST' });
}
