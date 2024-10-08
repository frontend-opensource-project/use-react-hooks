import { useCallback, useEffect } from 'react';
import { debounce } from '@/utils';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Fn } from './type';

const useScrollY = (): { moveTrigger: Fn } => {
  const isClient = typeof window !== 'undefined';

  const [savedScrollY, setSavedScrollY] = useLocalStorage(
    encodeURIComponent(window?.location?.pathname),
    0
  );

  const saveScrollY = () => {
    setSavedScrollY(window.scrollY);
  };

  const handleScroll = debounce(() => {
    saveScrollY();
  }, 500);

  const moveTrigger = useCallback(() => {
    if (!isClient) return;
    window.scrollTo(0, savedScrollY);
  }, [isClient, savedScrollY]);

  useEffect(() => {
    if (!isClient) return;
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);

  return { moveTrigger };
};

export default useScrollY;
