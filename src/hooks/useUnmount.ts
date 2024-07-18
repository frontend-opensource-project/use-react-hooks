import { useEffect, useRef } from 'react';

/**
 * 컴포넌트가 언마운트 될 때 전달받은 인자 함수를 호출하는 훅
 *
 * @param callback 언마운트 시에 호출될 함수
 */

type Fn = () => void;

const useUnmount = (callback: Fn) => {
  const callbackRef = useRef<null | Fn>(callback);

  useEffect(() => {
    // 최신 함수를 callbackRef에 저장
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (callbackRef.current) {
        callbackRef.current();
      }

      callbackRef.current = null;
    };
  }, []);
};

export default useUnmount;
