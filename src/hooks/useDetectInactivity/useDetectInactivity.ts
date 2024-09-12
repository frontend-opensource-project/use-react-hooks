import { useCallback, useEffect, useState } from 'react';
import { useTimer } from '@/hooks/useTimer';
import { isTouchDevice, throttle } from '@/utils';

type Fn = () => void;

/**
 * 일정 시간(ms) 동안 활동이 없을 때 지정된 콜백 함수를 실행하는 훅.
 *
 * @param {number} time - 비활성 상태로 간주되기까지의 시간(밀리초). 양의 정수로 지정. (최소값 5000ms)
 * @param {Fn} onInactivity - 비활성 상태가 감지되었을 때 호출되는 콜백 함수.
 *
 * @returns {boolean} - 현재 비활동 상태 여부를 나타내는 boolean 값.
 *
 * @description
 * 사용자가 정의한 시간(time) 동안 활동이 없으면 비활성 상태로 간주하고, 지정된 콜백 함수(onInactivity)를 호출합니다.
 * 해당 환경에 맞게 설정된 이벤트를 5초마다 리스닝하여, 활동이 감지될 시 타이머를 리셋합니다.
 */

const useDetectInactivity = (time: number, onInactivity: Fn) => {
  const [isInactive, setIsInactive] = useState(false);
  const { start } = useTimer(() => setIsInactive(true), time);

  // 이벤트 리스너는 5초마다 감지
  const MIN_THROTTLE_TIME = 5000;

  if (time < MIN_THROTTLE_TIME) {
    throw new Error(
      `'time'은 최소 ${MIN_THROTTLE_TIME}ms 이상으로 설정되어야 합니다.`
    );
  }

  const clientEvents = isTouchDevice()
    ? ['touchstart']
    : ['mousemove', 'keydown', 'click', 'dblclick', 'scroll'];

  const resetTimer = useCallback(() => {
    setIsInactive(false);
    start();
  }, [start]);

  useEffect(() => {
    start();

    const throttledResetTimer = throttle(resetTimer, MIN_THROTTLE_TIME);

    clientEvents.forEach((event) => {
      window.addEventListener(event, throttledResetTimer);
    });

    return () => {
      clientEvents.forEach((event) =>
        window.removeEventListener(event, throttledResetTimer)
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetTimer]);

  useEffect(() => {
    if (isInactive) {
      onInactivity();
    }
  }, [isInactive, onInactivity]);

  return isInactive;
};

export default useDetectInactivity;
