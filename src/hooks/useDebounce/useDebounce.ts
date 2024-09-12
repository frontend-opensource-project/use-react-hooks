import { useCallback, useRef } from 'react';
import { GenericFn } from './type';

/**
 * 주어진 콜백 함수를 디바운스하여, 일정 시간(delay)동안 값이 변경되지 않을 때까지 호출을 지연시키는 훅
 *
 * @param {Function} callback - 디바운스하려는 콜백 함수
 * @param {number} delay - 값이 변경된 후 적용될 때까지 기다릴 시간(밀리초)
 *
 * @returns {Function} - 디바운스된 콜백 함수
 *
 * @description
 * `useDebounce` 훅은 주어진 콜백 함수가 일정 시간(`delay`) 동안 호출되지 않을 때까지 콜백 함수를 지연시킵니다.
 * 이는 입력 필드와 같은 사용자 입력을 처리할 때 유용하며, 사용자가 입력을 멈춘 후에만
 * 콜백 함수가 호출되도록 합니다. 이를 통해 불필요한 렌더링이나 API 호출을 줄일 수 있습니다.
 **/

const useDebounce = <T extends unknown[]>(
  callback: GenericFn<T>,
  delay: number
) => {
  const timerRef = useRef<number>();

  const debouncedCallback = useCallback(
    (...args: T) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  return debouncedCallback;
};

export default useDebounce;
