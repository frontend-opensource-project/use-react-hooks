import { useEffect, useRef, useState } from 'react';
import { Fn } from '../../types';

/**
 * 지정된 시간 간격만큼 반복적으로 콜백 함수를 호출하는 훅
 *
 * @param {Function} callback - 지정된 간격마다 호출될 콜백 함수
 * @param {number} ms - 콜백 함수가 호출되는 시간 간격(밀리초)
 *
 * @returns {Function} - interval 중지 함수
 *
 * @description
 * 지정된 시간 간격으로 콜백 함수를 호출하는 타이머를 설정합니다.
 * `ms` 값이 변경될 때마다 interval이 재설정되며, 컴포넌트가 언마운트될 때 자동으로 타이머가 정리됩니다.
 * 반환된 `clear` 함수를 호출하여 수동으로 타이머를 중지할 수도 있습니다.
 */
const useInterval = (callback: Fn, ms: number) => {
  const savedCallback = useRef<Fn>(callback);
  const intervalRef = useRef<number | null>(null);
  const [intervalCleared, setIntervalCleared] = useState(false);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    // clear가 호출된 이후로 인터벌 설정 방지
    if (intervalCleared) return;

    intervalRef.current = window.setInterval(() => savedCallback.current(), ms);

    return () => {
      if (intervalRef.current === null) return;

      clearInterval(intervalRef.current);
    };
  }, [ms, intervalCleared]);

  const clear = () => {
    if (intervalRef.current === null) return;

    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIntervalCleared(true);
  };

  return clear;
};

export default useInterval;
