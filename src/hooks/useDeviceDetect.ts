import { useEffect, useState } from 'react';
import { isClient } from '../utils';

const useDeviceDetect = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    os: '',
    browser: '',
  });

  const detectDeviceType = (userAgent: string) => {
    const isMobile = /Mobi/i.test(userAgent);
    const isTablet = /Tablet|iPad/i.test(userAgent);
    const isDesktop = !isMobile && !isTablet;
    return { isMobile, isTablet, isDesktop };
  };

  const detectOS = (userAgent: string) => {
    if (/Windows/i.test(userAgent)) return 'Windows';
    if (/Macintosh|Mac/i.test(userAgent)) return 'MacOS';
    if (/Linux/i.test(userAgent)) return 'Linux';
    if (/Android/i.test(userAgent)) return 'Android';
    if (/iOS|iPhone|iPad|iPod/i.test(userAgent)) return 'iOS';
    return '';
  };

  const detectBrowser = (userAgent: string): string => {
    if (/Edg/i.test(userAgent)) return 'Edge';
    if (/Chrome/i.test(userAgent) && !/Edg/.test(userAgent)) return 'Chrome';
    if (/Safari/i.test(userAgent) && !/Chrome/.test(userAgent)) return 'Safari';
    if (/Firefox/i.test(userAgent)) return 'Firefox';
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
