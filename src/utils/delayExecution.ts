export interface CancelToken {
  isCancelled: boolean;
}

type Status = 'started' | 'cancelled';

export const delayExecution = (ms: number) => {
  let timeoutId: NodeJS.Timeout | undefined;
  const defaultCancelToken: CancelToken = { isCancelled: false };

  const startHandler = (cancelToken: CancelToken = defaultCancelToken) => {
    return new Promise<Status>((resolve, reject) => {
      if (!cancelToken || typeof cancelToken.isCancelled !== 'boolean') {
        reject(new ReferenceError('Invalid cancel token provided'));
      }

      if (timeoutId !== undefined) {
        reject(new Error('Previous timeout is still pending'));
      }

      try {
        timeoutId = setTimeout(() => {
          if (!cancelToken.isCancelled) {
            resolve('started');
          } else {
            clearHandler();
            resolve('cancelled'); // Promise를 resolve하여, 대기 상태에서 벗어나게 처리
          }
        }, ms);
      } catch (error) {
        reject(new Error('Failed to set a timeout'));
      }
    });
  };

  const clearHandler = () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);

      timeoutId = undefined; // 타이머 ID 초기화
    }
  };

  return {
    start: startHandler,
    clear: clearHandler,
  };
};
