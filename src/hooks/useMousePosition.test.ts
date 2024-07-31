import { act, renderHook } from '@testing-library/react';
import useMousePosition from './useMousePosition';

const mockElement = {
  getBoundingClientRect: () => ({
    left: 0,
    top: 0,
    width: 100,
    height: 100,
  }),
};

const createMouseEvent = (
  value: number,
  options: Partial<MouseEventInit> = {}
): MouseEvent => {
  const event = new MouseEvent('mousemove', {
    clientX: value,
    clientY: value,
    screenX: value,
    screenY: value,
    ...options,
  });

  Object.defineProperty(event, 'pageX', { value: value });
  Object.defineProperty(event, 'pageY', { value: value });

  return event;
};

describe('useMousePosition', () => {
  test('마우스 움직임에 따라 주어진 상태가 업데이트되어야 합니다.', () => {
    const { result } = renderHook(() => useMousePosition());

    act(() => {
      document.dispatchEvent(createMouseEvent(100));
    });

    const { viewX, viewY, pageX, pageY, screenX, screenY } = result.current;

    expect({ viewX, viewY, pageX, pageY, screenX, screenY }).toEqual({
      viewX: 100,
      viewY: 100,
      pageX: 100,
      pageY: 100,
      screenX: 100,
      screenY: 100,
    });
  });

  test('ref가 설정되었을때, 타겟 Element의 크기와 위치를 올바르게 계산해야 합니다', () => {
    const { result } = renderHook(() => useMousePosition());

    act(() => {
      result.current.targetRef(mockElement as Element);
    });

    act(() => {
      document.dispatchEvent(createMouseEvent(100));
    });

    const { elementX, elementY, refW, refH } = result.current;
    expect({ elementX, elementY, refW, refH }).toEqual({
      elementX: 100,
      elementY: 100,
      refW: 100,
      refH: 100,
    });
  });

  test('첫 번째 이벤트는 즉시 트리거되고, 이후 이벤트는 delayTime에 따라 throttle되며 제한됩니다.', () => {
    jest.useFakeTimers();

    const { result } = renderHook(() => useMousePosition({ delayTime: 100 }));

    act(() => {
      result.current.targetRef(mockElement as Element);
    });

    act(() => {
      document.dispatchEvent(createMouseEvent(100));
    });

    expect(result.current.viewX).toBe(100);
    expect(result.current.viewY).toBe(100);

    act(() => {
      document.dispatchEvent(createMouseEvent(200));
    });

    expect(result.current.viewX).toBe(100);
    expect(result.current.viewY).toBe(100);

    act(() => {
      jest.advanceTimersByTime(100);
      document.dispatchEvent(createMouseEvent(200));
    });

    expect(result.current.viewX).toBe(200);
    expect(result.current.viewY).toBe(200);

    jest.useRealTimers();
  });

  test('animationMode가 true일 때 requestAnimationFrame이 사용되어야 합니다.', () => {
    const spyOnRequestAnimationFrame = jest.spyOn(
      window,
      'requestAnimationFrame'
    );
    const spyOnCancelAnimationFrame = jest.spyOn(
      window,
      'cancelAnimationFrame'
    );

    const { result } = renderHook(() =>
      useMousePosition({ animationMode: true })
    );

    act(() => {
      result.current.targetRef(mockElement as Element);
    });

    act(() => {
      document.dispatchEvent(createMouseEvent(100));
    });

    expect(spyOnRequestAnimationFrame).toHaveBeenCalled();
    expect(spyOnCancelAnimationFrame).not.toHaveBeenCalled();

    act(() => {
      result.current.targetRef(null);
    });

    expect(spyOnCancelAnimationFrame).toHaveBeenCalled();

    spyOnRequestAnimationFrame.mockRestore();
    spyOnCancelAnimationFrame.mockRestore();
  });
});
