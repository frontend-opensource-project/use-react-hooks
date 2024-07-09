import { useEffect, useState } from 'react';

interface WindowSize {
  width: number | null;
  height: number | null;
}

/**
 * useWindowSize : 브라우저 창의 너비와 높이를 제공하는 훅
 * @param {number} [delayTime=200] 지연 시간(밀리초). isDelay가 true일 때 사용됨.Default=200
 * @returns {{ width: number, height: number }} 창의 너비와 높이를 담은 객체
 * @description
 * 브라우저 창의 사이즈가 변경될 때마다 해당 창의 너비와 높이를 업데이트합니다.
 * delay유무와 delayTime을 설정할 수 있습니다.
 * UI의 세밀한 조작 등 동적인 변화에 유용합니다.
 */

const useWindowSize = (delayTime: number = 200): WindowSize => {
  const isClient = typeof window === 'object';

  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: isClient ? window.innerWidth : null,
    height: isClient ? window.innerHeight : null,
  });

  useEffect(() => {
    if (!isClient) return;

    let timeoutId: NodeJS.Timeout | undefined;
    const handleWindowResize = () => {
      if (timeoutId) clearTimeout(timeoutId);

      const updateWindowSize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      if (delayTime > 0) {
        timeoutId = setTimeout(updateWindowSize, delayTime);
      } else {
        updateWindowSize;
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
