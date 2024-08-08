import { act, renderHook } from '@testing-library/react';
import useLongPress from './useLongPress';

const callback = jest.fn();
const defaultDelay = 500;

describe('useLongPress', () => {
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

  test('이벤트가 발생하지 않으면 콜백 함수가 호출되지 않는지 확인', () => {
    renderHook(() => useLongPress(callback));
    expect(callback).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(defaultDelay);
    expect(callback).toHaveBeenCalledTimes(0);
  });

  test('디폴트 시간동안 Mouse Down 시 콜백 함수가 호출되는지 확인', () => {
    const { result } = renderHook(() => useLongPress(callback));
    const { onMouseDown } = result.current;

    expect(callback).toHaveBeenCalledTimes(0);

    act(() => {
      onMouseDown();
    });
    expect(callback).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(defaultDelay - 100);
    expect(callback).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('onMouseUp 이벤트 발생 시 콜백 함수가 호출되지 않는지 확인', () => {
    const { result } = renderHook(() => useLongPress(callback));
    const { onMouseDown, onMouseUp } = result.current;

    expect(callback).toHaveBeenCalledTimes(0);

    act(() => {
      onMouseDown();
    });
    expect(callback).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(defaultDelay - 100);
    expect(callback).toHaveBeenCalledTimes(0);

    act(() => {
      onMouseUp();
    });

    jest.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(0);
  });

  test('onMouseLeave 이벤트 발생 시 콜백 함수가 호출되지 않는지 확인', () => {
    const { result } = renderHook(() => useLongPress(callback));
    const { onMouseDown, onMouseLeave } = result.current;

    expect(callback).toHaveBeenCalledTimes(0);

    act(() => {
      onMouseDown();
    });
    expect(callback).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(defaultDelay - 100);
    expect(callback).toHaveBeenCalledTimes(0);

    act(() => {
      onMouseLeave();
    });

    jest.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(0);
  });

  test('디폴트 시간동안 터치 시 콜백 함수가 호출되는지 확인', () => {
    const { result } = renderHook(() => useLongPress(callback));
    const { onTouchStart } = result.current;

    expect(callback).toHaveBeenCalledTimes(0);

    act(() => {
      onTouchStart();
    });
    expect(callback).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(defaultDelay - 100);
    expect(callback).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('onTouchEnd 이벤트 발생 시 콜백 함수가 호출되지 않는지 확인', () => {
    const { result } = renderHook(() => useLongPress(callback));
    const { onTouchStart, onTouchEnd } = result.current;

    expect(callback).toHaveBeenCalledTimes(0);

    act(() => {
      onTouchStart();
    });
    expect(callback).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(defaultDelay - 100);
    expect(callback).toHaveBeenCalledTimes(0);

    act(() => {
      onTouchEnd();
    });
    jest.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(0);
  });

  test('파라미터로 전달한 delay 시간 이후 콜백 함수가 호출되는지 확인', () => {
    const { result } = renderHook(() => useLongPress(callback, 300));
    const { onMouseDown } = result.current;

    expect(callback).toHaveBeenCalledTimes(0);

    act(() => {
      onMouseDown();
    });
    expect(callback).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(300);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('unmount 시 타이머가 정리되는지 확인', () => {
    const { result, unmount } = renderHook(() => useLongPress(callback));
    const { onMouseDown } = result.current;

    const clearTimeout = jest.spyOn(global, 'clearTimeout');
    expect(clearTimeout).not.toHaveBeenCalled();

    act(() => {
      onMouseDown();
    });
    expect(callback).toHaveBeenCalledTimes(0);

    unmount();
    expect(clearTimeout).toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);

    clearTimeout.mockRestore();
  });
});
