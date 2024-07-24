export interface CancelToken {
  isCancelled: boolean;
}

export const delayExecution = (ms: number) => {
  let timeoutId: NodeJS.Timeout | undefined;
  const defaultCancelToken: CancelToken = { isCancelled: false };

  const startHandler = (cancelToken: CancelToken = defaultCancelToken) => {
    return new Promise<void>((resolve) => {
      timeoutId = setTimeout(() => {
        if (!cancelToken.isCancelled) {
          resolve();
        } else {
          clearHandler();
        }
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
