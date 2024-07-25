import { delayExecution, type CancelToken } from './delayExecution';

describe('delayExecution', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.restoreAllMocks();
  });

  test('명시된 시간 후 "started"로 이행해야 한다.', async () => {
    const spySetTimeout = jest.spyOn(globalThis, 'setTimeout');
    const delay = 1000;
    const { start } = delayExecution(delay);
    const startPromise = start();

    jest.advanceTimersByTime(delay);

    await expect(startPromise).resolves.toBe('started');
    expect(spySetTimeout).toHaveBeenCalledTimes(1);
  });

  test('취소된 경우 "cancelled"로 이행해야 한다.', async () => {
    const spyClearTimeout = jest.spyOn(globalThis, 'clearTimeout');
    const delay = 1000;
    const { start } = delayExecution(delay);
    const cancelToken: CancelToken = { isCancelled: true };
    const startPromise = start(cancelToken);

    jest.advanceTimersByTime(delay);

    await expect(startPromise).resolves.toBe('cancelled');
    expect(spyClearTimeout).toHaveBeenCalledTimes(1);
  });

  test('clear가 호출되면 타임아웃을 해제해야 한다.', () => {
    const spyClearTimeout = jest.spyOn(globalThis, 'clearTimeout');
    const delay = 1000;
    const { start, clear } = delayExecution(delay);

    start();
    clear();

    expect(spyClearTimeout).toHaveBeenCalledTimes(1);
  });

  test('잘못된 cancel token 제공 시 에러가 발생해야 한다.', async () => {
    const delay = 1000;
    const { start } = delayExecution(delay);

    await expect(
      start({ isCancelled: null } as unknown as CancelToken)
    ).rejects.toThrow('Invalid cancel token provided');
    await expect(start({} as CancelToken)).rejects.toThrow(
      'Invalid cancel token provided'
    );
  });

  test('이전 타임아웃이 남아있는 경우 에러가 발생해야 한다.', async () => {
    const delay = 1000;
    const { start } = delayExecution(delay);

    start(); // 첫 번째 시작

    // 이전 타임아웃이 해제되기 전에 다시 시작 시도
    await expect(start()).rejects.toThrow('Previous timeout is still pending');
  });

  test('내부에서 예외가 발생하는 경우 rejected 상태에 도달해야 한다.', async () => {
    (globalThis.setTimeout as unknown) = undefined; // 예외 테스트

    const delay = 1000;
    const { start } = delayExecution(delay);

    await expect(start()).rejects.toThrow();
  });
});
