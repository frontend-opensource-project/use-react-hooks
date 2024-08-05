import { act, renderHook } from '@testing-library/react';
import useDetectInactivity from './useDetectInactivity';
import useTimer from './useTimer';
import { isTouchDevice } from '../utils';

jest.mock('./useTimer');

describe('useDetectInactivity', () => {
  let startMock: jest.Mock;
  let onInactivityMock: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    startMock = jest.fn();
    onInactivityMock = jest.fn();
    (useTimer as jest.Mock).mockImplementation((callback, time) => ({
      start: () => {
        startMock();
        setTimeout(() => {
          callback();
        }, time);
      },
    }));
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('타이머에 설정된 시간 후에는 비활동 상태가 감지된다.', () => {
    const { result } = renderHook(() =>
      useDetectInactivity(5000, onInactivityMock)
    );
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(onInactivityMock).toHaveBeenCalled();
    expect(result.current).toBe(true);
  });

  test('비활동 상태일때 onInactivity콜백은 호출되지 않는다.', () => {
    renderHook(() => useDetectInactivity(5000, onInactivityMock));

    act(() => {
      jest.advanceTimersByTime(4500);
    });

    expect(onInactivityMock).not.toHaveBeenCalled();
  });

  test('활동(설정된 이벤트)이 감지되면 타이머는 리셋된 후 다시 실행된다.', () => {
    const { result } = renderHook(() =>
      useDetectInactivity(5000, onInactivityMock)
    );

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(startMock).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('keyup'));
    });

    expect(startMock).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('mousemove'));
    });

    expect(startMock).toHaveBeenCalledTimes(2);
    expect(result.current).toBe(false);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(onInactivityMock).toHaveBeenCalled();
    expect(result.current).toBe(true);
  });

  test('환경에 맞게 이벤트 리스너가 추가/제거된다.', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() =>
      useDetectInactivity(5000, onInactivityMock)
    );

    const expectedClientEvents = isTouchDevice()
      ? ['touchstart']
      : ['mousemove', 'keydown', 'click', 'dblclick', 'scroll'];

    const addedEvents = addEventListenerSpy.mock.calls.map(
      ([event, callback]) => ({ event, callback })
    );

    expectedClientEvents.forEach((event) => {
      expect(addedEvents.some((e) => e.event === event)).toBe(true);
    });

    act(() => {
      unmount();
    });

    const removedEvents = removeEventListenerSpy.mock.calls.map(
      ([event, callback]) => ({ event, callback })
    );

    expectedClientEvents.forEach((event) => {
      expect(removedEvents.some((e) => e.event === event)).toBe(true);
    });

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});
