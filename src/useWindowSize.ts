import { useEffect, useState } from 'react';

interface UseWindowSizeParams {
  isDelay?: boolean;
  delayTime?: number;
}

interface WindowSize {
  width: number;
  height: number;
}

const useWindowSize = ({
  isDelay = true,
  delayTime = 200,
}: UseWindowSizeParams): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleWindowResize = () => {
      clearTimeout(timeoutId);
      if (isDelay) {
        timeoutId = setTimeout(() => {
          setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight,
          });
        }, delayTime);
      } else {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    };

    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
      clearTimeout(timeoutId);
    };
  }, [isDelay, delayTime]);

  return windowSize;
};

export default useWindowSize;
