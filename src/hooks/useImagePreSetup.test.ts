import { act, renderHook, waitFor } from '@testing-library/react';
import useImagePreSetup, {
  convertFile,
  DEFAULT_WEBP_QUALITY,
  urlFromFileHandler,
  validateWebPQuality,
} from './useImagePreSetup';

import { imgTo } from '../utils';

jest.mock('../utils/imgTo');

describe('useImagePreSetup', () => {
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let mockFiles: File[];
  const mockUrls: string[] = ['mock-url1', 'mock-url2', 'mock-url3'];

  beforeEach(() => {
    mockFiles = [
      new File(['content1'], 'example1.png', { type: 'image/png' }),
      new File(['content2'], 'example2.png', { type: 'image/jpeg' }),
      new File(['content3'], 'example3.png', { type: 'image/gif' }),
    ];

    global.URL.createObjectURL = jest.fn(() => mockUrls.shift() || 'mock-url');
    global.URL.revokeObjectURL = jest.fn();

    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleWarnSpy.mockRestore();
  });

  test('파일이 주어지면 변환함수가 올바르게 호출되고 로딩 상태가 정상적으로 변경된다.', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (imgTo as jest.Mock).mockImplementation((_url: string) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return (_type: string) => {
        return Promise.resolve(new Blob());
      };
    });

    const { result } = renderHook(() =>
      useImagePreSetup({ imageFiles: mockFiles, convertToWebP: true })
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(imgTo).toHaveBeenCalledTimes(mockFiles.length);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(imgTo).toHaveBeenCalledTimes(mockFiles.length);
    expect(result.current.isError).toBe(false);
    expect(result.current.previewUrls.length).toBe(mockFiles.length);
    expect(result.current.webpImages.length).toBe(mockFiles.length);
  });

  test('파일이 주어졌을 때, URL이 생성되어 반환된다.', async () => {
    for (const file of mockFiles) {
      const result = await urlFromFileHandler(file);

      expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);

      expect(result).toEqual({
        webpBlob: null,
        previewUrl: 'mock-url',
      });
    }
  });

  test('파일이 없거나 빈 배열이 주어지면 처리하지 않는다.', () => {
    const { result: resultNull } = renderHook(() =>
      useImagePreSetup({ imageFiles: null, convertToWebP: true })
    );

    expect(resultNull.current.isLoading).toBe(false);
    expect(resultNull.current.isError).toBe(false);
    expect(resultNull.current.previewUrls).toEqual([]);
    expect(resultNull.current.webpImages).toEqual([]);

    const { result: resultEmpty } = renderHook(() =>
      useImagePreSetup({ imageFiles: [], convertToWebP: true })
    );

    expect(resultEmpty.current.isLoading).toBe(false);
    expect(resultEmpty.current.isError).toBe(false);
    expect(resultEmpty.current.previewUrls).toEqual([]);
    expect(resultEmpty.current.webpImages).toEqual([]);
  });

  test('컴포넌트 언마운트 시 URL이 적절히 해제된다.', async () => {
    const { unmount } = renderHook(() =>
      useImagePreSetup({ imageFiles: mockFiles, convertToWebP: true })
    );

    expect(global.URL.revokeObjectURL).not.toHaveBeenCalled();

    act(() => {
      unmount();
    });

    mockUrls.forEach((url) => {
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(url);
    });
    expect(global.URL.revokeObjectURL).toHaveBeenCalledTimes(mockUrls.length);
  });

  test('convertToWebP가 false일 때 경고가 출력된다.', () => {
    const webPQuality = 0.5;

    validateWebPQuality(false, webPQuality);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'webPQuality`는 WebP로의 변환 품질을 설정하는 옵션입니다. `convertToWebP`를 true로 설정해야만 `webPQuality`가 적용됩니다.'
    );
  });

  test('유효 범위를 벗어난 webPQuality 값이 주어졌을 때, 이 값이 반환된다.', () => {
    const validWebPQuality = 1.5;

    const result = validateWebPQuality(true, validWebPQuality);

    expect(result).toBe(0.8);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      `webPQuality 값이 유효 범위(0 ~ 1)를 벗어나 기본값(${DEFAULT_WEBP_QUALITY})이 사용됩니다.`
    );
  });

  test('convertHandler가 실패할 경우, console.error가 호출되고 올바른 반환값을 가지는지 검증한다.', async () => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const mockFile = new File(['content'], 'example.png', {
      type: 'image/png',
    });

    const failingHandler = jest
      .fn()
      .mockRejectedValue(new Error('Conversion error'));

    const result = await convertFile(mockFile, failingHandler, 0);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '1번째 파일 처리 중 오류 발생:',
      new Error('Conversion error')
    );

    expect(result).toEqual({ webpBlob: null, previewUrl: null });

    consoleErrorSpy.mockRestore();
  });
});
