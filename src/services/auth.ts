import { fetcher } from 'srcRootDir/services/fetcher';

export async function login(username: string) {
  try {
    const response = await fetcher(`/login?username=${username}`);

    if (response?.userId) {
      window.localStorage.setItem('userId', response.userId);
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

export function logout() {
  document.cookie = 'userId=; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
}
