import { fetcher } from 'srcRootDir/services/fetch';

export async function login(username: string) {
  try {
    const response = await fetcher(`/login?username=${username}`);
    return response.ok;
  } catch (ex) {
    return false;
  }
}

export function getCurrentUserId(): number {
  const match = document.cookie.match(new RegExp('(^| )userId=([^;]+)'));

  return parseInt(match![2]);
}

export function logout() {
  document.cookie = 'userId=; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
}
