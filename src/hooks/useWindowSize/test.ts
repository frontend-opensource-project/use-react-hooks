import { act, renderHook } from '@testing-library/react';
import useWindowSize from './useWindowSize';

describe('useWindowSize', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    window.innerWidth = 1024;
    window.innerHeight = 768;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('기본 리사이즈 이벤트 발생 : 200ms 후 width, height 값이 바뀌어야 함', () => {
    const { result } = renderHook(() => useWindowSize());

    // 초기값 확인
    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(768);

    act(() => {
      window.innerWidth = 800;
      window.innerHeight = 600;
      window.dispatchEvent(new Event('resize'));
      jest.advanceTimersByTime(200);
    });

    // 변경된 값 확인
    expect(result.current.width).toBe(800);
    expect(result.current.height).toBe(600);
  });

  test('지연 시간 변경: 1000ms 후 width, height 값이 바뀌어야 함', () => {
    const { result } = renderHook(() => useWindowSize(1000));

    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(768);

    act(() => {
      window.innerWidth = 800;
      window.innerHeight = 600;
      window.dispatchEvent(new Event('resize'));
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.width).toBe(800);
    expect(result.current.height).toBe(600);
  });

  test('지연 시간 미적용: 즉시 width, height 값이 바뀌어야 함', () => {
    const { result } = renderHook(() => useWindowSize(0));

    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(768);

    act(() => {
      window.innerWidth = 800;
      window.innerHeight = 600;
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.width).toBe(800);
    expect(result.current.height).toBe(600);
  });
});
