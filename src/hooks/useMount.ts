import { useEffect } from 'react';

/**
 * 컴포넌트가 마운트 되었을 때 인자로 전달받은 함수를 호출하는 훅.
 *
 * @param callback 마운트 이후에 호출할 함수
 */

const useMount = (callback: () => void) => {
  useEffect(() => {
    callback();
  }, []);
};

export default useMount;
