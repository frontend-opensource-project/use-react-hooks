import { renderHook } from '@testing-library/react';
import useDetectDevice from './useDetectDevice';
import * as utils from '../../utils';

const mockUserAgent = (userAgent: string) => {
  Object.defineProperty(navigator, 'userAgent', {
    value: userAgent,
    configurable: true,
  });
};

const uaAndroid14 =
  'Mozilla/5.0 (Linux; Android 14; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.6613.88 Mobile Safari/537.36';
const uaiOS17 =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const uaWindows10 = {
  edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/127.0.2651.105',
  chrome:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
};
const uaMac14 = {
  safari:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  firefox:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.6; rv:129.0) Gecko/20100101 Firefox/129.0',
};
const uaLinux =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36';
const uaWhale =
  'mozilla/5.0 (linux; android 11; sm-a908n build/rp1a.200720.012; wv) applewebkit/537.36 (khtml, like gecko) version/4.0 chrome/80.0.3987.163 whale/1.0.0.0 crosswalk/25.80.14.29 mobile safari/537.36 naver(inapp; search; 1000; 11.6.7)';

describe('useDetectDevice', () => {
  let originalUserAgent: string;

  beforeEach(() => {
    originalUserAgent = navigator.userAgent;
  });

  afterEach(() => {
    mockUserAgent(originalUserAgent);
  });

  test('모바일 디바이스(Android)를 감지한다.', () => {
    mockUserAgent(uaAndroid14);

    const { result } = renderHook(() => useDetectDevice());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  test('모바일 디바이스(iOS)를 감지한다.', () => {
    mockUserAgent(uaiOS17);

    const { result } = renderHook(() => useDetectDevice());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  test('데스크탑 디바이스를 올바르게 감지한다.', () => {
    mockUserAgent(uaWindows10.chrome);

    const { result } = renderHook(() => useDetectDevice());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isDesktop).toBe(true);
  });

  test('iOS 환경을 감지한다.', () => {
    mockUserAgent(uaiOS17);

    const { result } = renderHook(() => useDetectDevice());

    expect(result.current.os).toBe('iOS');
  });

  test('Android 환경을 감지한다.', () => {
    mockUserAgent(uaAndroid14);

    const { result } = renderHook(() => useDetectDevice());

    expect(result.current.os).toBe('Android');
  });

  test('Windows 환경을 감지한다.', () => {
    mockUserAgent(uaWindows10.chrome);

    const { result } = renderHook(() => useDetectDevice());

    expect(result.current.os).toBe('Windows');
  });

  test('MacOS 환경을 감지한다.', () => {
    mockUserAgent(uaMac14.safari);

    const { result } = renderHook(() => useDetectDevice());

    expect(result.current.os).toBe('MacOS');
  });

  test('Linux 환경을 감지한다.', () => {
    mockUserAgent(uaLinux);

    const { result } = renderHook(() => useDetectDevice());

    expect(result.current.os).toBe('Linux');
  });

  test('Chrome 브라우저를 감지한다.', () => {
    mockUserAgent(uaWindows10.chrome);

    const { result } = renderHook(() => useDetectDevice());

    expect(result.current.browser).toBe('Chrome');
  });

  test('Firefox 브라우저를 감지한다.', () => {
    mockUserAgent(uaMac14.firefox);

    const { result } = renderHook(() => useDetectDevice());

    expect(result.current.browser).toBe('Firefox');
  });

  test('Safari 브라우저를 감지한다.', () => {
    mockUserAgent(uaMac14.safari);

    const { result } = renderHook(() => useDetectDevice());

    expect(result.current.browser).toBe('Safari');
  });

  test('Whale 브라우저를 감지한다.', () => {
    mockUserAgent(uaWhale);

    const { result } = renderHook(() => useDetectDevice());

    expect(result.current.browser).toBe('Whale');
  });

  test('Edge 브라우저를 감지한다.', () => {
    mockUserAgent(uaWindows10.edge);

    const { result } = renderHook(() => useDetectDevice());

    expect(result.current.browser).toBe('Edge');
  });

  test('isClient가 false일 때, 디바이스 정보가 초기값으로 유지된다', () => {
    jest.spyOn(utils, 'isClient', 'get').mockReturnValue(false);
    expect(utils.isClient).toBe(false);

    const { result } = renderHook(() => useDetectDevice());
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.os).toBe('');
    expect(result.current.browser).toBe('');
  });
});
