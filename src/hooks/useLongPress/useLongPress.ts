import { useCallback, useEffect, useRef, useState } from 'react';
import { Fn, UseLongPressReturns } from './type';

/**
 * 사용자가 요소를 길게 눌렀을 때 콜백 함수를 호출하는 훅
 *
 * @param {Function} callback - 사용자가 요소를 길게 눌렀을 때 호출될 콜백 함수
 * @param {number} delay - (옵션) 사용자가 요소를 길게 눌러야 하는 시간(밀리초, 기본값 500ms)
 *
 * @returns {Object} { onMouseDown, onMouseUp, onMouseLeave, onTouchStart, onTouchEnd } - 요소에 연결될 이벤트 핸들러 객체:
 *
 * @description
 * 사용자가 지정한 시간 이상 요소를 눌렀을 때 콜백 함수가 호출되며, 마우스와 터치 이벤트를 모두 지원합니다.
 */
const useLongPress = (callback: Fn, delay = 500): UseLongPressReturns => {
  const [isPress, setIsPress] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPress) {
      timeoutRef.current = setTimeout(callback, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
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
