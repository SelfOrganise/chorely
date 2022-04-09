import create from 'zustand';
import { useEffect } from 'react';

import { getCurrentUserId } from 'srcRootDir/entries/login/services/auth';

export const useLiveBasket = create<{ connected: boolean; basket: Basket | null }>(set => ({
  connected: false,
  basket: null,
}));

export function useListenToLiveBasket(): void {
  useEffect(() => {
    const userId = getCurrentUserId();

    const setup = () => {
      const sse = new EventSource(`${BACKEND_ORIGIN}/shopping/baskets/current?userId=${userId}`);
      sse.onopen = () => useLiveBasket.setState(state => ({ ...state, connected: true }));
      sse.onerror = () => useLiveBasket.setState(state => ({ ...state, connected: false }));
      sse.onmessage = e => useLiveBasket.setState(state => ({ ...state, basket: JSON.parse(e.data) }));

      return sse;
    };

    let sse: EventSource = setup();

    const handleFocus = () => {
      if (!sse || sse.readyState === 2) {
        useLiveBasket.setState(state => ({ ...state, connected: false }));
        sse.close();
        sse = setup();
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      sse.close();
      window.removeEventListener('focus', handleFocus);
    };
  }, []);
}
