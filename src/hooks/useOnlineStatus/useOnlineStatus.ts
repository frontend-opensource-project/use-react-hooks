import { useEffect, useState } from 'react';
import { hasNavigator } from '@/utils';
import { useOnlineStatusProps, UseOnlineStatusReturns } from './type';

/**
 * 온라인/오프라인 네트워크 상태를 판별하는 훅.
 *
 * @param {Object} props - 훅에 전달되는 옵션 객체
 * @param {Fn} [props.onlineCallback] - 브라우저가 온라인 상태가 될 때 실행할 콜백 함수
 * @param {Fn} [props.offlineCallback] - 브라우저가 오프라인 상태가 될 때 실행할 콜백 함수
 *
 * @returns {{ isOnline: boolean }} - 현재 온라인 상태를 나타내는 객체
 *
 * @description
 * 브라우저의 온라인/오프라인 상태를 추적하는 훅입니다.
 * 온라인 상태가 변경될 때 실행할 콜백 함수를 선택적으로 지정할 수 있습니다.
 * 콜백 함수들은 `useCallback`을 사용하여 메모이제이션 할 것을 권장합니다.
 * 이를 통해 의도하지 않은 재생성을 방지하고 성능을 최적화할 수 있습니다.
 */

const useOnlineStatus = ({
  onlineCallback = () => {},
  offlineCallback = () => {},
}: useOnlineStatusProps = {}): UseOnlineStatusReturns => {
  const [isOnline, setIsOnline] = useState(() =>
    hasNavigator() ? navigator.onLine : false
  );

  useEffect(() => {
    if (!hasNavigator()) {
      console.error('navigator is not supported in this environment.');
      return;
    }

    const handleOnline = () => {
      setIsOnline(true);
      onlineCallback();
    };

    const handleOffline = () => {
      setIsOnline(false);
      offlineCallback();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onlineCallback, offlineCallback]);

  return {
    isOnline,
  };
};

export default useOnlineStatus;
