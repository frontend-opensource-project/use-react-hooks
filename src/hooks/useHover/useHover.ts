import { useCallback, useRef, useState } from 'react';
import { UseHoverReturns } from './type';

/**
 * ref(callbackRef) 요소에 마우스가 올려져있는지 감지하는 훅
 *
 * @returns
 * - `isHovered`: 마우스가 올려져있는지 여부
 * - `callbackRef`: ref 요소에 마우스 이벤트 리스너를 추가하는 함수
 */
const useHover = <T extends HTMLElement>(): UseHoverReturns<T> => {
  const ref = useRef<T | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const callbackRef = useCallback(
    (node: T) => {
      if (ref.current) {
        ref.current.removeEventListener('mouseenter', handleMouseEnter);
        ref.current.removeEventListener('mouseleave', handleMouseLeave);
      }

      ref.current = node;

      if (ref.current) {
        ref.current.addEventListener('mouseenter', handleMouseEnter);
        ref.current.addEventListener('mouseleave', handleMouseLeave);
      }
    },
    [handleMouseEnter, handleMouseLeave]
  );

  return { isHovered, callbackRef };
};

export default useHover;
