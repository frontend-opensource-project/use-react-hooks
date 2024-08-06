import { MutableRefObject, useCallback, useRef, useState } from 'react';

import { validators } from '../utils';
import useUnmountEffect from './useUnmountEffect';

type WorkerScript<A, R, C> = (arg: A, accessClosure?: C) => R;

const useWorker = <Arg, Return, Closure = never>(
  script: WorkerScript<Arg, Return, Closure>
) => {
  const [result, setResult] = useState<Arg>();
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

    // 작업이 완료된 스레드로부터 이벤트 수신 #1
    safeWorkerHelper((worker) => {
      worker.current.onmessage = (e: MessageEvent<Arg>) => {
        setResult(e.data);
        clearWorker();
      };
    });

    // 작업을 수행할 작업 스레드로 인수 전달 #2
    safeWorkerHelper((worker) => {
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
      throw new Error("Your browser doesn't support web workers.");
    }

    if (!validators.isFunction(workerScript)) {
      throw new Error(
        'Invalid workerScript: Expected a function but received a different type.'
      );
    }

    // this === DedicatedWorkerGlobalScope
    const workerFunction = (script: WorkerScript<A, R, C>) => {
      // 작업 스레드로 전달된 인수 수신 #2
      this.onmessage = async ({ data }: MessageEvent<[A, C]>) => {
        // 작업 수행
        const workerResult = await script(data[0], data[1]);

        // 작업이 완료된 값 발신 #1
        this.postMessage(workerResult);
      };
    };

    const workerBlob = new Blob(
      [`(${workerFunction.toString()})(${workerScript.toString()})`],
      { type: 'application/javascript' }
    );

    super(URL.createObjectURL(workerBlob));
  }
}

const validateRef = <T>(workerRef: MutableRefObject<T | null>) => {
  return (action: (arg: MutableRefObject<T>) => void) => {
    if (workerRef.current) {
      action(workerRef as MutableRefObject<T>);
    }
  };
};
