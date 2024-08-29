import { useEffect, useState } from 'react';
import { isClient } from '../utils';

interface UseDeviceDetectReturns {
  isMobile: boolean;
  isDesktop: boolean;
  os: string;
  browser: string;
}

const DEVICE_PATTERNS = {
  mobile: /Mobi/i,
};

const OS_PATTERNS = {
  windows: /Windows/i,
  macOS: /Macintosh|Mac/i,
  linux: /Linux/i,
  android: /Android/i,
  iOS: /iPhone|iPad|iPod/i,
};

const BROWSER_PATTERNS = {
  whale: /Whale/i,
  edge: /Edg/i,
  chrome: /Chrome/i,
  safari: /Safari/i,
  firefox: /Firefox/i,
};

/**
 * 사용자 디바이스의 유형, os, 브라우저를 감지하는 훅.
 *
 * @returns {UseDeviceDetectReturns} - 디바이스 정보 객체(isMobile, isTablet, isDesktop, os, browser)를 반환합니다.
 *
 * @property {boolean} isMobile - 사용 중인 디바이스의 Mobile 여부를 나타냅니다.
 * @property {boolean} isTablet - 사용 중인 디바이스의 Tablet 여부를 나타냅니다.
 * @property {boolean} isDesktop - 사용 중인 디바이스의 Desktop 여부를 나타냅니다.
 * @property {string} os - 사용 중인 디바이스의 OS 이름을 나타냅니다.
 * @property {string} browser - 사용 중인 브라우저의 이름을 나타냅니다.
 *
 * @description
 * 사용자의 userAgent 문자열을 기반으로 디바이스 유형(Mobile, Tablet, Desktop), 운영체제(OS),
 * 그리고 브라우저 종류를 감지하여 반환합니다.
 */

const useDetectDevice = (): UseDeviceDetectReturns => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isDesktop: false,
    os: '',
    browser: '',
  });

  const detectDeviceType = (userAgent: string) => {
    const isMobile = DEVICE_PATTERNS.mobile.test(userAgent);
    const isDesktop = !isMobile;
    return { isMobile, isDesktop };
  };

  const detectOS = (userAgent: string) => {
    if (OS_PATTERNS.iOS.test(userAgent)) return 'iOS';
    if (OS_PATTERNS.android.test(userAgent)) return 'Android';
    if (OS_PATTERNS.windows.test(userAgent)) return 'Windows';
    if (OS_PATTERNS.macOS.test(userAgent)) return 'MacOS';
    if (OS_PATTERNS.linux.test(userAgent)) return 'Linux';
    return '';
  };

  const detectBrowser = (userAgent: string) => {
    // Order is fixed(due to the structure of the userAgent): Whale -> Edge -> Chrome -> Safari -> Firefox
    if (BROWSER_PATTERNS.whale.test(userAgent)) return 'Whale';
    if (BROWSER_PATTERNS.edge.test(userAgent)) return 'Edge';
    if (BROWSER_PATTERNS.chrome.test(userAgent)) return 'Chrome';
    if (BROWSER_PATTERNS.safari.test(userAgent)) return 'Safari';
    if (BROWSER_PATTERNS.firefox.test(userAgent)) return 'Firefox';
    return '';
  };

  useEffect(() => {
    if (!isClient) return;

    const UA = navigator.userAgent;

    const { isMobile, isDesktop } = detectDeviceType(UA);
    const os = detectOS(UA);
    const browser = detectBrowser(UA);

    setDeviceInfo({
      isMobile,
      isDesktop,
      os,
      browser,
    });
  }, []);

  return deviceInfo;
};

export default useDetectDevice;
