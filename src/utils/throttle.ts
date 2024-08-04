import { GenericFn } from '../types';

export const throttle = <T extends unknown[]>(
  callbackFn: GenericFn<T>,
  delayTime: number
) => {
  let lastTime = 0;

  const throttledFunction = (...args: T) => {
    const now = Date.now();
    if (now - lastTime >= delayTime) {
      lastTime = now;
      callbackFn(...args);
    }
  };

  return throttledFunction;
};
