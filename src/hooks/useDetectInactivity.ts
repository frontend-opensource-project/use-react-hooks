import { useCallback, useEffect, useState } from 'react';
import useTimer from './useTimer';
import { Fn } from '../types';

const useDetectInactivity = (time: number, onInactivity: Fn) => {
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
  }, [isInactive, onInactivity]);

  return isInactive;
};

export default useDetectInactivity;

const isTouchDevice = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};
