import { useState, useEffect, useRef } from 'react';
import { PositiveInteger } from '../types/number';

export const useDelayFlag = <T extends number>(
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
