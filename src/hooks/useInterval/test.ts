import useInterval from './useInterval';
import { act, renderHook } from '@testing-library/react';

let callback: jest.Mock;

describe('useInterval', () => {
  beforeEach(() => {
    callback = jest.fn();
  });

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    callback.mockRestore();
    jest.clearAllTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('2초 뒤에 콜백함수가 두 번 실행되는지 확인', () => {
    renderHook(() => useInterval(callback, 1000));
    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(999);
    expect(callback).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);

    jest.advanceTimersToNextTimer();
    expect(callback).toHaveBeenCalledTimes(2);
  });

  test('useInterval에서 반환된 함수 호출 시 타이머가 멈추는지 확인', () => {
    const { result } = renderHook(() => useInterval(callback, 1000));

    expect(typeof result.current).toBe('function');

    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      result.current();
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('delay 변경 시 타이머가 재설정 되는지 확인', () => {
    let delay = 1000;

    const { rerender } = renderHook(() => useInterval(callback, delay));

    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      delay = 500;
      rerender();
    });

    jest.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(2);

    jest.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(3);
  });

  test('타이머 중지 후 delay가 변경되더라도 타이머가 재설정되지 않는지 확인', () => {
    let delay = 1000;

    const { result, rerender } = renderHook(() => useInterval(callback, delay));

    expect(typeof result.current).toBe('function');

    act(() => {
      result.current();
    });

    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(0);

    act(() => {
      delay = 500;
      rerender();
    });

    jest.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(0);
  });

  test('unmount 시 타이머가 정리되는지 확인', () => {
    const { unmount } = renderHook(() => useInterval(callback, 1000));
    const initialTimerCount = jest.getTimerCount();
    const clearInterval = jest.spyOn(global, 'clearInterval');
    expect(clearInterval).not.toHaveBeenCalled();

    unmount();

    expect(clearInterval).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(initialTimerCount - 1);
  });
});
