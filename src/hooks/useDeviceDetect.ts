import { useEffect, useState } from 'react';
import { isClient } from '../utils';

const useDeviceDetect = () => {
  const [deviceType, setDeviceType] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  useEffect(() => {
    if (!isClient) return;

    const UA = navigator.userAgent;

    const isMobile = /Mobi/i.test(UA);
    const isTablet = /Tablet|iPad/i.test(UA);
    const isDesktop = !isMobile && !isTablet;

    setDeviceType({
      isMobile,
      isTablet,
      isDesktop,
    });
  }, []);

  const { isMobile, isTablet, isDesktop } = deviceType;

  return { isMobile, isTablet, isDesktop };
};

export default useDeviceDetect;
