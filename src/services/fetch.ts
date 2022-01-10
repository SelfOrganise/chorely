// const BACKEND_ORIGIN = 'http://localhost:4000';
const BACKEND_ORIGIN = 'https://chores-api.onrender.com';

export const fetcher = (url: string, init?: RequestInit) =>
  fetch(`${BACKEND_ORIGIN}${url}`, { credentials: 'include', ...(init || {}) }).then(res => {
    if (res.status === 200) {
      return res.json();
    }

    if (!res.ok) {
      throw res;
    }

    return res;
  });
