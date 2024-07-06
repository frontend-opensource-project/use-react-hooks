import { useState, useEffect, useRef } from 'react';

export const useDelayFlag = (flag: boolean, delay: number = 1000): boolean => {
  const startTimeRef = useRef(0);
  const [delayFlag, setDelayFlag] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    if (flag) {
      startTimeRef.current = Date.now();
      setDelayFlag(true);
    } else if (startTimeRef.current) {
      const elapsedTime = Date.now() - startTimeRef.current;
      const remainingTime = delay - elapsedTime;

      if (remainingTime > 0) {
        timeoutId = setTimeout(() => {
          setDelayFlag(false);
        }, remainingTime);
      } else {
        setDelayFlag(false);
      }
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [flag]);

  return delayFlag;
};
