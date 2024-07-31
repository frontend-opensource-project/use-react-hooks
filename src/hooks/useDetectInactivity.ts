import { useCallback, useEffect, useState } from 'react';
import useTimer from './useTimer';

// 시간 바꾸고

const useDetectInactivity = (time = 10000, onInactivity = () => {}) => {
  const [isInactive, setIsInactive] = useState(false);
  const { start } = useTimer(() => setIsInactive(true), time);

  const clientEvents = isTouchDevice()
    ? ['touchstart']
    : ['mousemove', 'keydown', 'click', 'dblclick', 'scroll'];

  const resetTimer = useCallback(() => {
    setIsInactive(false);
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    start();

    clientEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    if (isInactive) {
      onInactivity();
    }

    return () => {
      clientEvents.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isInactive) {
      onInactivity();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInactive]);

  return isInactive;
};

export default useDetectInactivity;

const isTouchDevice = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};
