import { renderHook, act } from '@testing-library/react';
import useScrollLock from './useScrollLock';

describe('useScrollLock', () => {
  let spyScrollTo: jest.Mock;

  beforeEach(() => {
    spyScrollTo = jest.fn();
    window.scrollTo = spyScrollTo;
  });

  afterEach(() => {
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

  test('스크롤 락 비활성 시, 페이지가 저장해둔 스크롤위치로 돌아가야 합니다.', () => {
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
    Object.defineProperty(window, 'scrollX', { value: 0, writable: true });

    const { rerender } = renderHook(({ isLocked }) => useScrollLock(isLocked), {
      initialProps: { isLocked: false },
    });

    act(() => {
      rerender({ isLocked: true });
    });

    expect(spyScrollTo).toHaveBeenCalledWith(0, 0);

    act(() => {
      rerender({ isLocked: false });
    });

    expect(spyScrollTo).toHaveBeenCalledWith(0, 100);
  });

  test('스크롤 락 비활성 후, 언마운트 시에 스크롤 위치와 스타일이 올바르게 리셋되는지 검증', () => {
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
});
