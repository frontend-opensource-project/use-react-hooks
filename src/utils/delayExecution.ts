export interface CancelToken {
  isCancelled: boolean;
}

type Status = 'completed' | 'cancelled';

/**
 * 지연 함수
 * @param ms 대기할 시간(밀리초).
 *
 * @returns start, clear 시작 및 정리 함수.
 *
 * @description
 * - 지정된 시간(ms) 동안 대기한 후 Promise를 해결합니다.
 * - 작업은 CancelToken을 사용하여 중간에 취소될 수 있습니다.
 *
 * @example
 * ```ts
 * await delayExecution(1000).start(); // <-- 1초 지연
 * task();
 * ```
 */
export const delayExecution = (ms: number) => {
  let timeoutId: NodeJS.Timeout | undefined;
  const defaultCancelToken: CancelToken = { isCancelled: false };

  /**
   * 지연 시작 함수
   * @param cancelToken 작업을 취소할 수 있는 토큰.
   *
   * @returns Promise 작업이 완료되면 'completed', 취소되면 ‘cancelled’로 해결되는 Promise.
   *
   * @description
   * 주어진 시간(ms) 동안 대기한 후, 상태에 따라 Promise를 해결하거나 취소합니다.
   */
  const startHandler = (cancelToken: CancelToken = defaultCancelToken) => {
    return new Promise<Status>((resolve, reject) => {
      if (!cancelToken || typeof cancelToken.isCancelled !== 'boolean') {
        return reject(new ReferenceError('Invalid cancel token provided'));
      }

      if (timeoutId !== undefined) {
        return reject(new Error('Previous timeout is still pending'));
      }

      if (cancelToken.isCancelled) {
        clearHandler();
        return resolve('cancelled'); // Promise를 resolve하여, 대기 상태에서 벗어나게 처리
      }

      timeoutId = setTimeout(() => {
        return resolve('completed');
      }, ms);
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
