import { useEffect, useState } from 'react';
import { PositiveInteger, UseWindowSizeReturns } from './type';

/**
 * 브라우저의 너비와 높이를 반환하는 훅
 *
 * @param {number} [delayTime=200] 과도한 이벤트 실행을 방지하기 위해 resize 이벤트를 지연시키는 시간(ms)
 *
 * @returns {{ width: number, height: number }}
 * - width: 브라우저의 너비
 * - height: 브라우저의 높이
 *
 * @description 브라우저 창의 크기가 변경될 때마다 업데이트된 값을 반환합니다.
 */

const useWindowSize = <T extends number>(
  delayTime: PositiveInteger<T> | 0 = 200 as PositiveInteger<T>
): UseWindowSizeReturns => {
  const isClient = typeof window === 'object';

  const [windowSize, setWindowSize] = useState({
    width: isClient ? window.innerWidth : null,
    height: isClient ? window.innerHeight : null,
  });

  useEffect(() => {
    if (!isClient) return;

    let timeoutId: NodeJS.Timeout | null = null;

    const updateWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    const handleWindowResize = () => {
      if (timeoutId) clearTimeout(timeoutId);

      if (delayTime > 0) {
        timeoutId = setTimeout(updateWindowSize, delayTime);
      } else if (delayTime === 0) {
        updateWindowSize();
      }
    };

    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return windowSize;
};

export default useWindowSize;
