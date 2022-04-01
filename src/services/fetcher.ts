import { getCurrentUserId } from 'srcRootDir/services/auth';

export function fetcher(url: string, init?: RequestInit): any | Response {
  const userId = getCurrentUserId();

  return fetch(`${BACKEND_ORIGIN}${url}`, {
    headers: { 'X-UserId': userId.toString(), 'Content-Type': 'application/json' },
    ...(init || {}),
  }).then(res => {
    if (res.status === 200) {
      if (res.headers.get("content-type")?.includes('json')) {
        return res.json();
      } else {
        return res.text();
      }
    }

    if (!res.ok) {
      throw res;
    }

    return res;
  });
}
