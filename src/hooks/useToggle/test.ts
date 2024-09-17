import { act, renderHook } from '@testing-library/react';
import useToggle from './useToggle';

describe('useToggle', () => {
  test('초기값 true로 설정', () => {
    const { result } = renderHook(() => useToggle(true));

    expect(result.current[0]).toBe(true);
    expect(typeof result.current[1]).toBe('function');
  });

  test('초기값 false로 설정', () => {
    const { result } = renderHook(() => useToggle(false));

    expect(result.current[0]).toBe(false);
    expect(typeof result.current[1]).toBe('function');
  });

  it('false -> ture -> false로 토글', () => {
    const { result } = renderHook(() => useToggle(false));
    const [, toggle] = result.current;

    expect(result.current[0]).toBe(false);

    act(() => {
      toggle();
    });

    expect(result.current[0]).toBe(true);

    act(() => {
      toggle();
    });

    expect(result.current[0]).toBe(false);
  });

  it('true로 상태 변경', () => {
    const { result } = renderHook(() => useToggle(false));
    const [, toggle] = result.current;

    expect(result.current[0]).toBe(false);

    act(() => {
      toggle(true);
    });

    expect(result.current[0]).toBe(true);
  });

  it('false로 상태 변경', () => {
    const { result } = renderHook(() => useToggle(true));
    const [, toggle] = result.current;

    expect(result.current[0]).toBe(true);

    act(() => {
      toggle(false);
    });

    expect(result.current[0]).toBe(false);
  });

  it('boolean 타입이 아닐 경우 기존값 토글', () => {
    const { result } = renderHook(() => useToggle(true));
    const [, toggle] = result.current;

    expect(result.current[0]).toBe(true);

    act(() => {
      toggle('false');
    });

    expect(result.current[0]).toBe(false);

    act(() => {
      toggle(null);
    });

    expect(result.current[0]).toBe(true);
  });
});
