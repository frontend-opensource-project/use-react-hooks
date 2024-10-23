import { useEffect, useState } from 'react';
import { validators } from '../../utils';

interface UsePermissionProps {
  permission: Permission; // 정의된 타입과 문자열 타입 모두 허용
}

interface UsePermissionReturns {
  status: PermissionState;
}

type PermissionState = 'granted' | 'prompt' | 'denied' | 'notSupported';

/**
 * 사용자의 권한 상태를 확인하고 추적하는 커스텀 훅.
 *
 * @param {object} props permission {Permission}: 확인하려는 권한의 이름.
 *
 * @returns {object}
 * - `status`: 현재 권한의 상태. ‘granted’, ‘prompt’, ‘denied’, ‘notSupported’
 *
 * @description
 * - 이 훅은 주어진 권한에 대한 상태를 확인하고, 권한 상태가 변경될 때마다 업데이트합니다.
 */
const usePermission = ({
  permission,
}: UsePermissionProps): UsePermissionReturns => {
  const [status, setStatus] = useState<PermissionState>('prompt');

  const monitorPermissionStatus = async (permission: PermissionName) => {
    const updateStatusOnPermissionChange = (
      permissionStatus: PermissionStatus
    ) => {
      setStatus(permissionStatus.state);

      permissionStatus.onchange = () => {
        setStatus(permissionStatus.state);
      };
    };

    try {
      if (!validators.isClient() || !navigator.permissions) {
        throw new PermissionError('The Permissions API is not supported.');
      }

      const permissionStatus = await navigator.permissions.query({
        name: permission,
      });

      updateStatusOnPermissionChange(permissionStatus);
    } catch {
      setStatus('notSupported');
    }
  };

  useEffect(() => {
    monitorPermissionStatus(permission as PermissionName);
  }, [permission]);

  return { status };
};

// eslint-disable-next-line @typescript-eslint/ban-types
type Permission = PredefinedPermissionName | (string & {});

// Firefox, Chromium, WebKit
type PredefinedPermissionName =
  | 'accessibility-events'
  | 'accelerometer'
  | 'ambient-light-sensor'
  | 'background-fetch'
  | 'background-sync'
  | 'bluetooth'
  | 'camera'
  | 'captured-surface-control'
  | 'clipboard-read'
  | 'clipboard-write'
  | 'display-capture'
  | 'fullscreen'
  | 'geolocation'
  | 'gyroscope'
  | 'idle-detection'
  | 'keyboard-lock'
  | 'local-fonts'
  | 'magnetometer'
  | 'microphone'
  | 'midi'
  | 'nfc'
  | 'notifications'
  | 'payment-handler'
  | 'periodic-background-sync'
  | 'persistent-storage'
  | 'pointer-lock'
  | 'push'
  | 'screen-wake-lock'
  | 'speaker-selection'
  | 'storage-access'
  | 'system-wake-lock'
  | 'top-level-storage-access'
  | 'window-management';

class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
    this.name = 'PermissionError';
  }
}

export default usePermission;
