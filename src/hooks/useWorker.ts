import { MutableRefObject, useCallback, useRef, useState } from 'react';

import { validators } from '../utils';
import useUnmountEffect from './useUnmountEffect';

type WorkerScript<A, R, C> = (arg: A, accessClosure?: C) => R;

/**
 * 웹 워커를 사용하여 비동기 작업을 처리하는 훅.
 *
 * @template Arg - 작업에 필요한 인수 타입.
 * @template Return - 작업 결과의 반환 타입.
 * @template Closure - 클로저(closure)로 전달될 타입 (선택 사항).
 *
 * @param {WorkerScript<Arg, Return, Closure>} script - 웹 워커에서 실행할 함수.
 *
 * @returns {object}
 *  - `result`: 작업의 결과를 저장하는 상태 값.
 *  - `start`: 작업을 시작하는 함수.
 *  - `cancel`: 현재 진행 중인 작업을 취소하는 함수.
 *
 * @description
 * - 이 훅은 웹 워커를 활용하여 비동기 작업을 수행하고, 그 결과를 React 상태로 관리합니다.
 * - `start` 함수를 호출하면 웹 워커가 생성되고, 작업이 시작됩니다. 작업이 완료되면 결과가 `result` 상태로 업데이트됩니다.
 * - `cancel` 함수를 호출하면 현재 활성화된 웹 워커가 종료되고, 작업이 취소됩니다.
 * - 컴포넌트가 언마운트될 때, 사용 중이던 웹 워커를 자동으로 정리합니다.
 * - 웹 워커는 특정 작업을 백그라운드에서 비동기로 처리하고자 할 때 유용합니다.
 */
const useWorker = <Arg, Return, Closure = never>(
  script: WorkerScript<Arg, Return, Closure>
) => {
  const [result, setResult] = useState<Return>();
  const workerRef = useRef<FunctionWorker<Arg, Return, Closure> | null>(null);
  const safeWorkerHelper = validateRef(workerRef);

  const clearWorker = () => {
    safeWorkerHelper((worker) => {
      worker.current.terminate();
      workerRef.current = null;
    });
  };

  const createWorker = () => {
    clearWorker(); // 기존 작업 정리

    const scriptWorker = new FunctionWorker<Arg, Return, Closure>(script);
    workerRef.current = scriptWorker;
  };

  const startHandler = useCallback((args: Arg, closure?: Closure) => {
    createWorker();

    safeWorkerHelper((worker) => {
      // 작업이 완료된 스레드로부터 이벤트 수신 #1
      worker.current.onmessage = (
        e: MessageEvent<Return & { error?: string }>
      ) => {
        const payload = e.data;

        if (payload?.error) {
          console.error(payload.error);
          clearWorker();
        }

        setResult(payload);
        clearWorker();
      };

      // 작업을 수행할 작업 스레드로 인수 전달 #2
      worker.current.postMessage([args, closure]);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancelHandler = useCallback(() => {
    clearWorker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useUnmountEffect(clearWorker);

  return { result, start: startHandler, cancel: cancelHandler };
};

export default useWorker;

class FunctionWorker<A, R, C> extends Worker {
  constructor(workerScript: WorkerScript<A, R, C>) {
    if (!validators.isClient() || !window.Worker || !globalThis.Blob) {
      throw new WebWorkerError("Your browser doesn't support web workers.");
    }

    if (!validators.isFunction(workerScript)) {
      throw new WebWorkerError(
        'Invalid workerScript: Expected a function but received a different type.'
      );
    }

    // this === DedicatedWorkerGlobalScope
    const workerFunction = (script: WorkerScript<A, R, C>) => {
      // 작업 스레드로 전달된 인수 수신 #2
      this.onmessage = async ({ data }: MessageEvent<[A, C]>) => {
        try {
          // 작업 수행
          const workerResult = await script(data[0], data[1]);

          // 작업이 완료된 값 발신 #1
          this.postMessage(workerResult);
        } catch (error) {
          this.postMessage({ error });
        }
      };
    };

    try {
      const workerBlob = new Blob(
        [`(${workerFunction.toString()})(${workerScript.toString()})`],
        { type: 'application/javascript' }
      );

      super(URL.createObjectURL(workerBlob));
    } catch (error) {
      throw new WebWorkerError(
        `Failed to create workerBlob: ${error instanceof Error ? error.message : 'unknown error'}`
      );
    }
  }
}

const validateRef = <T>(workerRef: MutableRefObject<T | null>) => {
  return (action: (arg: MutableRefObject<T>) => void) => {
    if (workerRef.current) {
      action(workerRef as MutableRefObject<T>);
    }
  };
};

class WebWorkerError extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
    this.name = 'WebWorkerError';
  }
}
