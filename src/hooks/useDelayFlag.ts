import { useState, useEffect, useRef } from 'react';

export const useDelayFlag = (
  flag: boolean,
  delayTime: number = 1000
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
      const remainingTime = delayTime - elapsedTime;

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
  }, [flag]);

  return delayFlag;
};
