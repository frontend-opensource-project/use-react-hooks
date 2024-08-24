import { useEffect, useRef } from 'react';
import isEqual from 'fast-deep-equal';

/**
 * 의존성 배열의 깊은 비교를 통해 변화를 감지하고 콜백을 실행시키는 훅
 *
 * @param callback 의존성 배열의 변화가 감지되었을 때 실행할 콜백 함수
 * @param dependencies 의존성 배열
 */
const useDeepCompareEffect = (
  callback: () => void,
  dependencies: unknown[]
) => {
  const prevDependencies = useRef(dependencies);

  if (!isEqual(dependencies, prevDependencies.current)) {
    prevDependencies.current = dependencies;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(callback, prevDependencies.current);
};

export default useDeepCompareEffect;
