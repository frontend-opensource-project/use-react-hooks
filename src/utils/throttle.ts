export const throttle = <T extends Event>(
  callbackFn: (event: T) => void,
  delayTime: number
) => {
  let lastTime = 0;

  return (event: T) => {
    const now = Date.now();
    if (now - lastTime >= delayTime) {
      lastTime = now;
      callbackFn(event);
    }
  };
};
