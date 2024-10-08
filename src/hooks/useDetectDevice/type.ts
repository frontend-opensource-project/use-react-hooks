export interface UseDeviceDetectReturns {
  isMobile: boolean;
  isDesktop: boolean;
  os: string;
  browser: string;
}

export const DEVICE_PATTERNS = {
  mobile: /Mobi/i,
};

export const OS_PATTERNS = {
  windows: /Windows/i,
  macOS: /Macintosh|Mac/i,
  linux: /Linux/i,
  android: /Android/i,
  iOS: /iPhone|iPad|iPod/i,
};

export const BROWSER_PATTERNS = {
  whale: /Whale/i,
  edge: /Edg/i,
  chrome: /Chrome/i,
  safari: /Safari/i,
  firefox: /Firefox/i,
};
