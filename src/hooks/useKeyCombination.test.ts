import { act, renderHook } from '@testing-library/react';
import useKeyCombination from './useKeyCombination';

describe('useKeyCombination', () => {
  const shortcutKeys = ['MetaLeft', 'KeyK'];
  const callback = jest.fn();

  const pressKey = (code: string) =>
    window.dispatchEvent(new KeyboardEvent('keydown', { code }));
  const releaseKey = (code: string) =>
    window.dispatchEvent(new KeyboardEvent('keyup', { code }));

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('지정된 키 조합이 눌렸을 때 콜백이 호출된다.', () => {
    renderHook(() => useKeyCombination({ shortcutKeys, callback }));

    act(() => {
      pressKey('MetaLeft');
      pressKey('KeyK');
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('키가 모두 눌리지 않으면 콜백이 호출되지 않는다.', () => {
    renderHook(() =>
      useKeyCombination({ shortcutKeys: shortcutKeys, callback })
    );

    act(() => {
      pressKey('MetaLeft');
    });

    expect(callback).not.toHaveBeenCalled();
  });

  test('키가 떼어졌을 때 pressedKeyMap에서 제거된다.', () => {
    renderHook(() =>
      useKeyCombination({ shortcutKeys: shortcutKeys, callback })
    );

    act(() => {
      // commend 키 눌렀다 떼기
      pressKey('MetaLeft');

      releaseKey('MetaLeft');
    });

    act(() => {
      pressKey('KeyK');
    });

    expect(callback).not.toHaveBeenCalled();
  });

  test('한 조합키를 누른 상태에서 다른 키를 반복 입력 시 콜백이 호출된다', () => {
    renderHook(() =>
      useKeyCombination({ shortcutKeys: shortcutKeys, callback })
    );

    act(() => {
      pressKey('MetaLeft');
    });

    act(() => {
      pressKey('KeyK');
    });

    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      releaseKey('KeyK');
    });

    // MetaLeft 를 누르고 있는 상태에서 keyK를 떼면 콜백 함수가 호출되지 않음
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      pressKey('KeyK');
    });

    expect(callback).toHaveBeenCalledTimes(2);
  });

  test('isPrevent가 true일 때 기본 동작이 방지된다.', () => {
    const preventDefaultSpy = jest.spyOn(Event.prototype, 'preventDefault');

    renderHook(() =>
      useKeyCombination({ shortcutKeys, callback, isPrevent: true })
    );

    act(() => {
      pressKey('MetaLeft');
      pressKey('KeyK');
    });

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('unmount 시 이벤트 리스너가 해제된다.', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() =>
      useKeyCombination({ shortcutKeys, callback })
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledTimes(2); // keydown, keyup 각각 제거됨

    removeEventListenerSpy.mockRestore();
  });
});
