import { useEffect, useState } from 'react';
import { isClient } from '../utils';

const DEVICE_PATTERNS = {
  mobile: /Mobi/i,
  tablet: /Tablet|iPad/i,
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

const useDeviceDetect = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    os: '',
    browser: '',
  });

  const detectDeviceType = (userAgent: string) => {
    const isMobile = DEVICE_PATTERNS.mobile.test(userAgent);
    const isTablet = DEVICE_PATTERNS.tablet.test(userAgent);
    const isDesktop = !isMobile && !isTablet;
    return { isMobile, isTablet, isDesktop };
  };

  const detectOS = (userAgent: string) => {
    if (OS_PATTERNS.windows.test(userAgent)) return 'Windows';
    if (OS_PATTERNS.macOS.test(userAgent)) return 'MacOS';
    if (OS_PATTERNS.linux.test(userAgent)) return 'Linux';
    if (OS_PATTERNS.android.test(userAgent)) return 'Android';
    if (OS_PATTERNS.iOS.test(userAgent)) return 'iOS';
    return '';
  };

  const detectBrowser = (userAgent: string): string => {
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

    const { isMobile, isTablet, isDesktop } = detectDeviceType(UA);
    const os = detectOS(UA);
    const browser = detectBrowser(UA);

    setDeviceInfo({
      isMobile,
      isTablet,
      isDesktop,
      os,
      browser,
    });
  }, []);

  const { isMobile, isTablet, isDesktop, os, browser } = deviceInfo;

  return { isMobile, isTablet, isDesktop, os, browser };
};

export default useDeviceDetect;
