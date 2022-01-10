import { getCurrentUserId } from 'srcRootDir/services/auth';

// const BACKEND_ORIGIN = 'http://localhost:4000';
const BACKEND_ORIGIN = 'https://chores-api.onrender.com';

export function fetcher(url: string, init?: RequestInit): any | Response {
  const userId = getCurrentUserId();

  return fetch(`${BACKEND_ORIGIN}${url}`, { headers: { 'X-UserId': userId.toString() }, ...(init || {}) }).then(res => {
    if (res.status === 200) {
      return res.json();
    }

    if (!res.ok) {
      throw res;
    }

    return res;
  });
}
