import { act, renderHook, waitFor } from '@testing-library/react';
import useClipboard from './useClipboard';

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
    jest.useFakeTimers();
  });

  test('copyText() 함수를 호출하면 클립보드에 텍스트가 저장된다.', async () => {
    const spy = jest.spyOn(navigator.clipboard, 'writeText');
    const { result } = renderHook(() => useClipboard());
    const { copyText } = result.current;
    const text = 'Text';

    act(() => {
      copyText(text);
    });

    expect(spy).toHaveBeenCalledWith(text);
    await waitFor(() => {
      expect(result.current.copied).toBe(true);
    });
  });

  // test('copyImg() 함수를 호출하면 클립보드에 이미지가 저장된다.', async () => {
  //   const spy = jest.spyOn(navigator.clipboard, 'write');
  //   const { result } = renderHook(() => useClipboard());
  //   const { copyImg } = result.current;
  //   const path =
  //     'https://avatars.githubusercontent.com/u/173591906?s=400&u=4083b40d445144ec5f214b5d2d7efbd5471f3f97&v=4';

  //   act(() => {
  //     copyImg(path);
  //   });

  //   expect(spy).toHaveBeenCalled();
  //   await waitFor(() => {
  //     expect(result.current.copied).toBe(true);
  //   });
  // });

  test('copied 상태가 true로 변경된 이후 5초가 지나면 다시 false로 변경된다.', async () => {
    const spy = jest.spyOn(navigator.clipboard, 'writeText');
    const { result } = renderHook(() => useClipboard());
    const { copyText } = result.current;
    const text = 'Text';

    act(() => {
      copyText(text);
    });

    expect(spy).toHaveBeenCalledWith(text);
    await waitFor(() => {
      expect(result.current.copied).toBe(true);
    });

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(result.current.copied).toBe(false);
    });
  });
});
