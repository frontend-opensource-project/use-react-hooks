import { useCallback, useEffect, useState } from 'react';
import { useTimer } from '@/hooks/useTimer';
import { isTouchDevice, throttle } from '@/utils';
import { Fn } from './type';

/**
 * 일정 시간동안 사용자 이벤트가 발생하지 않았을 때 보조 함수를 실행하는 훅
 *
 * @param {number} [time=5000] 비활성 상태로 간주되는 시간(ms)
 * @param {Fn} onInactivity 비활성 상태가 되었을 때 실행될 함수
 *
 * @returns {boolean} 비활성 상태 여부
 *
 * @description
 * - 사용자가 정의한 시간동안 이벤트가 발생하지 않으면 비활성 상태로 간주하고, 지정된 보조 함수를 실행합니다.
 * - 디바이스 환경에 맞게 설정된 이벤트를 5초마다 리스닝하여 이벤트가 감지될 때마다 타이머를 리셋합니다.
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
