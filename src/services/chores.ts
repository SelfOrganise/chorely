import { fetcher } from 'srcRootDir/services/fetch';

export async function completeChore(choreId: number) {
  await fetcher(`/chores/${choreId}`, { method: 'POST' });
}
