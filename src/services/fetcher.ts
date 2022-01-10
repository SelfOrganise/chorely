import { getCurrentUserId } from 'srcRootDir/services/auth';

export function fetcher(url: string, init?: RequestInit): any | Response {
  const userId = getCurrentUserId();

  return fetch(`${BACKEND_ORIGIN}${url}`, {
    headers: { 'X-UserId': userId.toString() },
    ...(init || {}),
  }).then(res => {
    if (res.status === 200) {
      return res.json();
    }

    if (!res.ok) {
      throw res;
    }

    return res;
  });
}
