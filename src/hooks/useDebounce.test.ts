import useDebounce from './useDebounce';
import { act, renderHook } from '@testing-library/react';

let callback: jest.Mock;

describe('useDebounce', () => {
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

  test('콜백 함수가 반환되는지 확인', () => {
    const { result } = renderHook(() => useDebounce(callback, 200));
    expect(typeof result.current).toBe('function');
  });

  test('디바운스된 콜백 함수가 지연 후 호출되는지 확인', () => {
    const { result } = renderHook(() => useDebounce(callback, 200));

    jest.advanceTimersByTime(100);

    act(() => {
      result.current(); // 타이머 다시 시작
    });

    jest.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('연속적으로 호출되는 경우 마지막 호출만 실행되는지 확인', () => {
    const { result } = renderHook(() => useDebounce(callback, 200));

    act(() => {
      result.current();
    });

    jest.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(0);

    act(() => {
      result.current();
    });

    jest.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(100); // 마지막 호출 시점으로 200ms 경과
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('지연 시간이 변경될 경우 타이머가 재설정되는지 확인', () => {
    let delay = 200;

    const { rerender, result } = renderHook(() => useDebounce(callback, delay));

    act(() => {
      result.current();
    });

    jest.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(0);

    act(() => {
      delay = 500;
      rerender();
    });

    act(() => {
      result.current();
    });

    jest.advanceTimersByTime(499);
    expect(callback).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(1); // 지연 시간 변경 후 500ms 경과
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
