import { act, renderHook } from '@testing-library/react';
import usePreventCopy from './usePreventCopy';

describe('usePreventCopy', () => {
  it("'copy' 이벤트가 발생하면 기본 동작을 차단하고, 콜백 함수가 호출된다.", () => {
    const callback = jest.fn();

    renderHook(() => usePreventCopy(callback));

    const copyEvent = new Event('copy', {
      bubbles: true,
      cancelable: true,
    }) as ClipboardEvent;

    act(() => {
      window.dispatchEvent(copyEvent);
    });

    expect(copyEvent.defaultPrevented).toBe(true);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("'cut' 이벤트가 발생하면 기본 동작을 차단하고, 콜백 함수가 호출된다.", () => {
    const callback = jest.fn();

    renderHook(() => usePreventCopy(callback));

    const cutEvent = new Event('cut', {
      bubbles: true,
      cancelable: true,
    }) as ClipboardEvent;

    act(() => {
      window.dispatchEvent(cutEvent);
    });

    expect(cutEvent.defaultPrevented).toBe(true);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
