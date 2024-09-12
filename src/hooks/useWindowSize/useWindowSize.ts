import { useEffect, useState } from 'react';
import { PositiveInteger, UseWindowSizeReturns } from './type';

/**
 * useWindowSize : 브라우저의 너비와 높이를 제공하는 훅
 * @param {number} [delayTime=200] 지연 시간(ms). 리사이즈 이벤트 딜레이 설정. Default=200
 * @returns {{ width: number, height: number }} 브라우저의 너비와 높이를 담은 객체
 * @description
 * 브라우저 창의 사이즈가 변경될 때마다 해당 창의 너비와 높이를 업데이트합니다.
 * UI의 세밀한 조작 등 동적인 변화에 유용합니다.
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
