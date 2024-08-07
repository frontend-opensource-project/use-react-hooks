import { useState, useEffect, useCallback, useRef } from 'react';

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
    if (!utils.isSameType(item, initialValue)) {
      storageManager.current.setItem(initialValue, initialValue);

      return initialValue;
    }

    return item;
  });

  const setValue = useCallback((value: Payload<T>) => {
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
    if (!utils.isClient()) return;

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
    setItem(currentValue: Payload<T>, prevValue: T): T {
      const ERROR_SET_MESSAGE = 'Failed to set item in localStorage';

      try {
        const newValue = utils.resolveValue(currentValue, prevValue);

        utils.validateTypeConsistency(newValue, prevValue);
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
    if (!utils.isClient()) {
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

type Payload<T> = T | ((prevPayload: T) => T);

const utils = {
  isClient(): boolean {
    return typeof window === 'object';
  },
  isString(value: unknown): value is string {
    return typeof value === 'string';
  },
  isNumber(value: unknown): value is number {
    return typeof value === 'number';
  },
  isArray(value: unknown): value is Array<unknown> {
    return Array.isArray(value);
  },
  isObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  },
  isSameType(value1: unknown, value2: unknown): boolean {
    const typeChecks = [
      utils.isString,
      utils.isNumber,
      utils.isArray,
      utils.isObject,
    ];

    return typeChecks.some((checkFn) => checkFn(value1) && checkFn(value2));
  },
  getType(value: unknown): string {
    if (utils.isArray(value)) {
      return 'array';
    }

    return typeof value;
  },
  validateTypeConsistency(value1: unknown, value2: unknown) {
    if (!utils.isSameType(value1, value2)) {
      throw new MatchError(
        `New value type does not match stored value type\n current:${value1}->${utils.getType(value1)}, prev:${value2}->${utils.getType(value2)}`
      );
    }
  },
  resolveValue<T>(newPayload: Payload<T>, prevPayload: T): T {
    return newPayload instanceof Function
      ? newPayload(prevPayload)
      : newPayload;
  },
};

class MatchError extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
    this.name = 'MatchError';
  }
}

export default useLocalStorage;
