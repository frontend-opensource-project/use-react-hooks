import { useState, useEffect, useRef } from 'react';
import { PositiveInteger } from '../types/number';

/**
 * 인자로 받은 플래그를 주어진 시간만큼 지연시키는 커스텀 훅.
 *
 * @param {boolean} flag 지연시키고자 하는 플래그.
 * @param {PositiveInteger<T>} [delayTime] 지연 시간(ms). 양의 정수로 지정(Default=1000).
 *
 * @returns {boolean} true 상태의 입력된 플래그를 delayTime 시간이 지난 후 false로 업데이트해 반환.
 *
 * @description
 * - 이 훅은 플래그를 특정 시간 동안 유지하고자 할 때 유용합니다.
 * - 데이터 페칭 시, 페칭(또는 로딩) 플래그를 특정 시간 동안 유지하여 로딩 UI의 깜빡임 현상 제거, 중복 호출 방지 등의 용도로 사용할 수 있습니다.
 */
const useDelayFlag = <T extends number>(
  flag: boolean,
  delayTime?: PositiveInteger<T>
): boolean => {
  const startTimeRef = useRef(0);
  const [delayFlag, setDelayFlag] = useState(false);

  const initializeFlag = () => {
    startTimeRef.current = Date.now();
    setDelayFlag(true);
  };

  const resetFlag = () => {
    setDelayFlag(false);
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const delayFlag = () => {
      const elapsedTime = Date.now() - startTimeRef.current;
      const remainingTime = (delayTime || 1000) - elapsedTime;

      if (remainingTime > 0) {
        timeoutId = setTimeout(resetFlag, remainingTime);
      } else {
        resetFlag();
      }
    };

    if (flag) {
      initializeFlag();
    } else if (startTimeRef.current) {
      delayFlag();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flag]);

  return delayFlag;
};

export default useDelayFlag;
