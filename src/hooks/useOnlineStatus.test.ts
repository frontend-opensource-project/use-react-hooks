import { act, renderHook } from '@testing-library/react';
import useOnlineStatus from './useOnlineStatus';

let windowSpy: jest.SpyInstance;
let onlineCallback: jest.Mock;
let offlineCallback: jest.Mock;

describe('useOnlineStatus', () => {
  beforeEach(() => {
    windowSpy = jest.spyOn(global, 'window', 'get');
    onlineCallback = jest.fn();
    offlineCallback = jest.fn();
  });

  afterEach(() => {
    windowSpy.mockRestore();
  });

  test('온라인 상태라면 isOnline은 true이다.', () => {
    jest.spyOn(navigator, 'onLine', 'get').mockReturnValueOnce(true);

    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current.isOnline).toBe(true);
  });

  test('오프라인 상태에서 isOnline은 false이다.', () => {
    jest.spyOn(navigator, 'onLine', 'get').mockReturnValueOnce(false);

    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current.isOnline).toBe(false);
  });

  test('네트워크 상태가 변경되면 isOnline 상태가 갱신된다.', () => {
    const { result } = renderHook(() => useOnlineStatus());

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOnline).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.isOnline).toBe(true);
  });

  test('콜백 함수가 호출되는지 확인', () => {
    renderHook(() => useOnlineStatus({ onlineCallback, offlineCallback }));
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(offlineCallback).toHaveBeenCalledTimes(1);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(onlineCallback).toHaveBeenCalledTimes(1);
  });

  test('언마운트 시 이벤트 리스너가 제거된다.', () => {
    const { unmount } = renderHook(() =>
      useOnlineStatus({ onlineCallback, offlineCallback })
    );

    unmount();

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(offlineCallback).toHaveBeenCalledTimes(0);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(onlineCallback).toHaveBeenCalledTimes(0);
  });
});
