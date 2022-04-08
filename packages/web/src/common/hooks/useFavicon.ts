import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const nodes = document.querySelectorAll<HTMLLinkElement>('link[rel~=icon]');

const entries = ['chores', 'shopping'];
export function useFavicon() {
  const { pathname } = useLocation();

  useEffect(() => {
    for (const entry of entries) {
      if (pathname.startsWith(`/${entry}`)) {
        for (const node of nodes) {
          if (!node.href.includes(`/${entry}`)) {
            node.href = `favicon/${entry}.png`;
          }
        }

        return;
      }
    }
  }, [pathname]);
}
