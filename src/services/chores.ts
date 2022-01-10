import { fetcher } from 'srcRootDir/services/fetcher';

export async function completeChore(choreId: number) {
  await fetcher(`/chores/${choreId}`, { method: 'POST' });
}
