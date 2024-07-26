import { useCallback, useEffect, useRef } from 'react';

import { type CancelToken, delayExecution } from '../utils';
import useUnmountEffect from './useUnmountEffect';

type Callback = () => void;

const useTimer = (callback: Callback, ms: number) => {
  const callbackRef = useRef<Callback>(callback);
  const timerRef = useRef<ReturnType<typeof delayExecution> | null>(null);
  const cancelTokenRef = useRef<CancelToken>({ isCancelled: false });

  const clearActiveTimer = () => {
    if (timerRef.current) {
      cancelTokenRef.current.isCancelled = true;

      timerRef.current.clear();
    }
  };

  const startHandler = useCallback(() => {
    clearActiveTimer(); // 기존 타이머 취소

    (async () => {
      cancelTokenRef.current = { isCancelled: false };
      timerRef.current = delayExecution(ms);

      await timerRef.current.start(cancelTokenRef.current);
      callbackRef.current();
    })();
  }, [ms]);

  const cancelHandler = useCallback(() => {
    clearActiveTimer();
  }, []);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useUnmountEffect(clearActiveTimer);

  return { start: startHandler, cancel: cancelHandler };
};

export default useTimer;
