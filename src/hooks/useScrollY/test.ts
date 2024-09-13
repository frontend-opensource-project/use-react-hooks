import { act, renderHook } from '@testing-library/react';
import useScrollY from './useScrollY';

global.scrollTo = jest.fn();

describe('useScrollY', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    localStorage.clear();
  });

  test('스크롤 이벤트 발생 시 500ms 딜레이 후 로컬스토리지에 스크롤 위치가 저장된다.', () => {
    renderHook(() => useScrollY());

    const pathname = encodeURIComponent(window.location.pathname);

    Object.defineProperty(window, 'scrollY', { value: 100, writable: true });

    act(() => {
      window.dispatchEvent(new Event('scroll'));
      jest.advanceTimersByTime(500);
    });

    const savedScrollY = localStorage.getItem(pathname);
    expect(savedScrollY).toBe('100');
  });

  test('moveTrigger() 함수가 실행되면 로컬스토리지에 저장되어있던 스크롤 위치로 이동한다.', () => {
    const pathname = encodeURIComponent(window.location.pathname);
    localStorage.setItem(pathname, '100');

    const { result } = renderHook(() => useScrollY());

    act(() => {
      result.current.moveTrigger();
    });

    expect(global.scrollTo).toHaveBeenCalledWith(0, 100);
  });
});
