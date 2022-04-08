import { fetcher } from 'srcRootDir/common/services/fetcher';

export async function login(username: string) {
  try {
    const response = await fetcher(`/login`, { method: 'POST', body: JSON.stringify({ username }) });

    if (response?.id) {
      window.localStorage.setItem('userId', response.id);
      return true;
    }

    return false;
  } catch (ex) {
    return false;
  }
}

export function getCurrentUserId(): number {
  return parseInt(window.localStorage.getItem('userId')!);
}
