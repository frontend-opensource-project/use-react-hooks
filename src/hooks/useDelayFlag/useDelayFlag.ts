import { useState, useEffect, useRef } from 'react';
import { UseDelayFlagProps, UseDelayFlagReturns } from './type';
/**
 * 플래그를 원하는 시간만큼 지연시킨 후에 업데이트하는 커스텀 훅
 *
 * @param {boolean} flag 지연시킬 플래그
 * @param {number} [delayTime=1000] 지연 시간(ms, 양의 정수)
 *
 * @returns {boolean} delayTime 만큼 지연시킨 후에 업데이트된 flag 반환
 *
 * @description
 * 데이터 페칭 시, 페칭(또는 로딩) 플래그를 지정한 시간동안 유지하여 로딩 UI의 깜빡임 현상 제거, 중복 호출 방지 등의 용도로 사용할 수 있습니다.
 */
const useDelayFlag = <T extends number>({
  flag,
  delayTime,
}: UseDelayFlagProps<T>): UseDelayFlagReturns => {
  const startTime = useRef(0);
  const [delayFlag, setDelayFlag] = useState(flag);

  const switchFlag = () => {
    setDelayFlag((prev) => !prev);
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const delay = () => {
      const elapsedTime = Date.now() - startTime.current;
      const remainingTime = (delayTime || 1000) - elapsedTime;

      if (remainingTime > 0) {
        timeoutId = setTimeout(switchFlag, remainingTime);
      } else {
        switchFlag();
      }
    };

    if (!startTime.current) {
      startTime.current = Date.now();
      return;
    }

    if (flag !== delayFlag) delay();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flag]);

  return delayFlag;
};

export default useDelayFlag;
