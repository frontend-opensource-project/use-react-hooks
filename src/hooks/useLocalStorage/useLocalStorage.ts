import { useState, useEffect, useCallback, useRef } from 'react';
import { validators } from '../../utils';
import { ValueResolver } from '../../types';

/**
 * 로컬 스토리지와 동기화된 상태를 관리하는 훅
 * @param key - 로컬 스토리지 키
 * @param initialValue - 초기 값
 *
 * @returns [storedValue, setValue] - 저장된 값과 설정 함수
 *
 * @description
 * 브라우저의 로컬 스토리지 API를 간편하게 사용합니다.
 * 다른 타입의 값 저장 시 에러를 발생시켜 안전하게 차단합니다.
 */
const useLocalStorage = <T>(key: string, initialValue: T) => {
  const storageManager = useRef(createLocalStorageManager<T>(key));
  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = storageManager.current.getItem(initialValue);

    // 초기값 타입이 다른 경우, 전달된 초기값을 저장하고 반환합니다.
    if (!validators.isSameType(item, initialValue)) {
      storageManager.current.setItem(initialValue, initialValue);

      return initialValue;
    }

    return item;
  });

  const setValue = useCallback((value: ValueResolver<T>) => {
    setStoredValue((prevValue) => {
      return storageManager.current.setItem(value, prevValue);
    });
  }, []);

  const handleStorageChange = useCallback(
    (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        setStoredValue(JSON.parse(event.newValue));
      }
    },
    [key]
  );

  useEffect(() => {
    if (!validators.isClient()) return;

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleStorageChange]);

  return [storedValue, setValue] as const;
};

const createLocalStorageManager = <T>(key: string) => {
  const storage = new LocalStorage();

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
    getItem(fallback: T): T {
      const ERROR_GET_MESSAGE = 'Failed to get item in localStorage';

      try {
        const item = storage.getItem(key);

        return item ? JSON.parse(item) : fallback;
      } catch (error) {
        console.warn(ERROR_GET_MESSAGE, error);

        return fallback;
      }
    },
  };

  return manager;
};

class LocalStorage {
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
