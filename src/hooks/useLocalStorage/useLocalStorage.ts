import { useState, useEffect, useCallback, useRef } from 'react';
import { validators } from '@/utils';
import { ValueResolver } from './type';

/**
 * 로컬 스토리지와 동기화된 상태를 관리하는 훅
 *
 * @param {string} key - 로컬 스토리지 키
 * @param {T} initialValue - 초기 값 (저장된 값이 없을 때 사용)
 *
 * @returns {[T, (value: ValueResolver<T>) => void]}
 *  저장된 값과 설정 함수
 *
 * @description
 * - 브라우저의 로컬 스토리지 API와 동기화된 상태를 간편하게 관리합니다.
 * - 로컬 스토리지에 저장된 값의 타입이 초기값과 다르면 초기값으로 설정합니다.
 * - 로컬 스토리지의 값이 변경될 때 이벤트를 통해 상태를 업데이트합니다.
 * - SSR 환경에서는 안전하게 동작하지 않도록 클라이언트 여부를 검사합니다.
 */
const useLocalStorage = <T>(key: string, initialValue: T) => {
  const isClient = useIsClient();
  const storageManager = useRef(createStorageManager<T>(key));
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!validators.isClient()) return initialValue;

    const item = storageManager.current.getItem();

    // 초기값 타입이 다른 경우, 전달된 초기값을 저장하고 반환.
    if (!item || !validators.isSameType(item, initialValue)) {
      storageManager.current.setItem(initialValue, initialValue);

      return initialValue;
    }

    return item;
  });

  const setValue = useCallback((value: ValueResolver<T>) => {
    setStoredValue((prevValue) => {
      const newValue = storageManager.current.setItem(value, prevValue);

      return newValue;
    });
  }, []);

  // SSR이 끝난 후 CSR이 시작될 때 동작 지원.
  useEffect(() => {
    if (!isClient) return;

    const item = createStorageManager<T>(key).getItem();

    if (item) setStoredValue(item);
  }, [isClient, key]);

  useEffect(() => {
    if (!validators.isClient()) return;

    const handleChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        setStoredValue(JSON.parse(event.newValue));
      }
    };

    window.addEventListener('storage', handleChange);
    return () => window.removeEventListener('storage', handleChange);
  }, [key]);

  return [storedValue, setValue] as const;
};

const createStorageManager = <T>(key: string) => {
  const storage: StorageManager = validators.isClient()
    ? new LocalStorage()
    : new MockStorage();

  const manager = {
    setItem(currentValue: ValueResolver<T>, prevValue: T): T {
      const ERROR_SET_MESSAGE = 'Failed to set item in localStorage';

      try {
        const newValue = validators.resolveValue(currentValue, prevValue);

        validators.validateTypeConsistency(newValue, prevValue);
        storage.setItem(key, JSON.stringify(newValue));

        return newValue;
      } catch (error) {
        console.warn(ERROR_SET_MESSAGE, error);

        return prevValue;
      }
    },
    getItem(): T | null {
      const ERROR_GET_MESSAGE = 'Failed to get item in localStorage';

      try {
        const item = storage.getItem(key);

        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.warn(ERROR_GET_MESSAGE, error);

        return null;
      }
    },
  };

  return manager;
};

const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};

interface StorageManager {
  setItem(key: string, value: string): void;
  getItem(key: string): string | null;
  removeItem(key: string): void;
}

// 로컬 스토리지에 접근할 수 없는 환경에서도 기본 동작을 제공하는 MockStorage 구현체
class MockStorage implements StorageManager {
  private store: Record<string, string> = {};

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }
}

class LocalStorage implements StorageManager {
  private storage: Storage;

  constructor() {
    if (!validators.isClient()) {
      throw new Error(
        'localStorage is not available in this environment. Please ensure you are running this code in a browser.'
      );
    }

    this.storage = window.localStorage;
  }

  setItem(key: string, value: string): void {
    this.storage.setItem(key, value);
  }

  getItem(key: string): string | null {
    return this.storage.getItem(key);
  }

  removeItem(key: string): void {
    this.storage.removeItem(key);
  }
}

export default useLocalStorage;
