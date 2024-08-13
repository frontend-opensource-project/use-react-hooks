import { act, renderHook, waitFor } from '@testing-library/react';
import useClipboard from './useClipboard';

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: jest.fn(),
});

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
    write: jest.fn(),
  },
});

describe('useClipboard', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useClipboard());
    result.current.copied = false;
  });

  test('copyText() 함수를 호출하면 클립보드에 텍스트가 저장된다.', () => {
    const { result } = renderHook(() => useClipboard());
    const { copied, copyText } = result.current;

    const text = 'Text';
    const spy = jest.spyOn(navigator.clipboard, 'writeText');

    act(() => {
      copyText(text);
    });

    expect(spy).toHaveBeenCalledWith(text);

    waitFor(() => {
      expect(copied).toBe(true);
    });
  });

  test('copyImg() 함수를 호출하면 클립보드에 이미지가 저장된다.', () => {
    const { result } = renderHook(() => useClipboard());
    const { copied, copyImg } = result.current;

    const path =
      'https://avatars.githubusercontent.com/u/173591906?s=400&u=4083b40d445144ec5f214b5d2d7efbd5471f3f97&v=4';
    const spy = jest.spyOn(navigator.clipboard, 'write');

    act(() => {
      copyImg(path);
    });

    waitFor(() => {
      expect(spy).toHaveBeenCalled();
      expect(copied).toBe(true);
    });
  });

  test('copied 상태가 true로 변경된 이후 5초가 지나면 다시 false로 변경된다.', () => {});
});
