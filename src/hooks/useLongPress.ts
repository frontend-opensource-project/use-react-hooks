import { useCallback, useEffect, useRef, useState } from 'react';
import { Fn } from '../types';

const useLongPress = (callback: Fn, delay = 500) => {
  const [isPress, setIsPress] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPress) {
      timeoutRef.current = setTimeout(() => callback(), delay);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isPress, callback, delay]);

  const start = useCallback(() => setIsPress(true), []);
  const clear = useCallback(() => setIsPress(false), []);

  return {
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: start,
    onTouchEnd: clear,
  };
};

export default useLongPress;
