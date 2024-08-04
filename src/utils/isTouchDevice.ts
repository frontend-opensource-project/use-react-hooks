import { isClient } from './isClient';

export const isTouchDevice = () => {
  if (!isClient) {
    return false;
  }
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};
