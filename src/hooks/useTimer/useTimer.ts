import { useCallback, useEffect, useRef } from 'react';

import { type CancelToken, delayExecution } from '../../utils';
import useUnmountEffect from '../useUnmountEffect/useUnmountEffect';

type Callback = () => void;

/**
 * 일정 시간(ms) 후에 지정된 콜백 함수를 실행하는 타이머 훅.
 *
 * @param {function} callback 타이머가 완료된 후 실행할 콜백 함수.
 * @param {number} ms 지연 시간(밀리초). 양의 정수로 지정.
 *
 * @returns {object}
 *  - `start`: 타이머를 시작하는 함수.
 *  - `cancel`: 현재 활성화된 타이머를 취소하는 함수.
 *
 * @description
 * - 이 훅은 주어진 시간(ms)이 지난 후 콜백 함수를 실행하는 타이머를 제공합니다.
 * - `start` 함수를 호출하면 타이머가 시작되며, 지정된 시간이 지나면 콜백 함수가 호출됩니다.
 * - `cancel` 함수를 호출하면 현재 활성화된 타이머를 취소할 수 있습니다.
 * - 콜백 함수가 변경될 때마다 참조를 업데이트합니다.
 * - 컴포넌트가 언마운트될 때 타이머를 정리합니다.
 */
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
