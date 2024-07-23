import { useEffect, useRef, useState } from 'react';

type Fn = () => void;

const useInterval = (callback: Fn, ms: number) => {
  const savedCallback = useRef<Fn>(() => {});
  const intervalRef = useRef<number>();
  const [intervalCleared, setIntervalCleared] = useState(false);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    // clear가 호출된 이후로 인터벌 설정 방지
    if (intervalCleared) return;

    intervalRef.current = window.setInterval(() => savedCallback.current(), ms);

    return () => clearInterval(intervalRef.current);
  }, [ms, intervalCleared]);

  const clear = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = 0;
    setIntervalCleared(true);
  };

  return clear;
};

export default useInterval;
