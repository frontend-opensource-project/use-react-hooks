import { useCallback, useEffect, useState } from 'react';
import useTimer from './useTimer';

const useDetectInactivity = (time = 10000, onInactivity = () => {}) => {
  const [isInactive, setIsInactive] = useState(false);
  const { start } = useTimer(() => setIsInactive(true), time);

  const clientEvent = ['mousemove', 'keydown', 'click', 'dblclick', 'scroll'];

  const resetTimer = useCallback(() => {
    setIsInactive(false);
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    start();

    clientEvent.forEach((event) => window.addEventListener(event, resetTimer));

    if (isInactive) {
      onInactivity();
    }

    return () => {
      clientEvent.forEach((event) =>
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
