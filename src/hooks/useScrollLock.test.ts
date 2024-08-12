import { renderHook, act } from '@testing-library/react';
import useScrollLock from './useScrollLock';

describe('useScrollLock', () => {
  let spyScrollTo: jest.Mock;

  beforeEach(() => {
    spyScrollTo = jest.fn();
    window.scrollTo = spyScrollTo;
  });

  afterEach(() => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    Object.defineProperty(window, 'scrollX', { value: 0, writable: true });
    jest.restoreAllMocks();
  });

  test('스크롤 락 활성 시, 페이지의 고정과 스크롤 위치가 저장되어야 합니다.', () => {
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
    Object.defineProperty(window, 'scrollX', { value: 0, writable: true });

    const { rerender } = renderHook(({ isLocked }) => useScrollLock(isLocked), {
      initialProps: { isLocked: false },
    });

    act(() => {
      rerender({ isLocked: true });
    });

    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.top).toBe('-100px');
    expect(document.body.style.width).toBe('100%');
    expect(document.body.style.overflowY).toBe('scroll');
  });

  test('스크롤 락 비활성 후, 언마운트 시에 스크롤 위치와 스타일이 올바르게 리셋되어야 합니다.', () => {
    Object.defineProperty(window, 'scrollY', { value: 50, writable: true });
    Object.defineProperty(window, 'scrollX', { value: 50, writable: true });

    const { unmount, rerender } = renderHook(
      ({ isLocked }) => useScrollLock(isLocked),
      {
        initialProps: { isLocked: true },
      }
    );

    act(() => {
      rerender({ isLocked: false });
    });

    act(() => {
      unmount();
    });

    expect(spyScrollTo).toHaveBeenCalledWith(50, 50);
    expect(document.body.style.position).toBe('');
    expect(document.body.style.top).toBe('');
    expect(document.body.style.width).toBe('');
    expect(document.body.style.left).toBe('');
    expect(document.body.style.overflowY).toBe('');
    expect(document.body.style.overflowX).toBe('');
  });

  test('스크롤 락 활성화 시, 페이지의 가로 스크롤 위치가 저장되고 적용되어야 합니다.', () => {
    Object.defineProperty(document.documentElement, 'scrollWidth', {
      value: 1200,
      writable: true,
    });
    Object.defineProperty(window, 'innerWidth', {
      value: 1000,
      writable: true,
    });

    Object.defineProperty(window, 'scrollX', { value: 100, writable: true });

    const { rerender } = renderHook(({ isLocked }) => useScrollLock(isLocked), {
      initialProps: { isLocked: false },
    });

    act(() => {
      rerender({ isLocked: true });
    });

    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.left).toBe('-100px');
    expect(document.body.style.width).toBe('100%');
    expect(document.body.style.overflowX).toBe('scroll');

    act(() => {
      rerender({ isLocked: false });
    });

    expect(window.scrollTo).toHaveBeenCalledWith(100, 0);

    expect(document.body.style.position).toBe('');
    expect(document.body.style.left).toBe('');
    expect(document.body.style.width).toBe('');
    expect(document.body.style.overflowX).toBe('');

    Object.defineProperty(document.documentElement, 'scrollWidth', {
      value: 0,
      writable: true,
    });
    Object.defineProperty(window, 'innerWidth', { value: 0, writable: true });
  });
});
