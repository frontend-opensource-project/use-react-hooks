import { useSyncExternalStore } from 'react';
import { isClient } from '@/utils';
import { Fn, UsePrefersColorSchemeProps, ColorSchemeType } from './type';

const DEFAULT_COLOR_SCHEME: ColorSchemeType = 'light';

const isServerSide = !isClient || typeof window.matchMedia !== 'function';

/**
 * 현재 사용자 컴퓨터의 다크 모드와 라이트 모드를 감지해서 반환
 *
 * @param {UsePrefersColorSchemeProps} SSR시 초기 색상 모드를 설정하기 위한 선택적 속성
 * @returns {ColorSchemeType} 선호 색상 모드('dark' 또는 'light') 반환
 */

const usePrefersColorScheme = (
  props: UsePrefersColorSchemeProps = {}
): ColorSchemeType => {
  const colorScheme = useSyncExternalStore(
    subscribeToMediaQuery,
    getMediaQuerySnapshot,
    () => getServerSnapshot(props?.serverSnapshot)
  );

  return colorScheme;
};

export default usePrefersColorScheme;

const subscribeToMediaQuery = (callback: Fn) => {
  if (isServerSide) {
    return () => {};
  }

  const darkColorScheme = window.matchMedia('(prefers-color-scheme: dark)');

  const handleChange = () => {
    callback();
  };

  darkColorScheme.addEventListener('change', handleChange);

  return () => {
    darkColorScheme.removeEventListener('change', handleChange);
  };
};

const getMediaQuerySnapshot = (): ColorSchemeType => {
  if (isServerSide) {
    return DEFAULT_COLOR_SCHEME;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

const getServerSnapshot = (
  serverSnapshot?: ColorSchemeType
): ColorSchemeType => {
  return serverSnapshot || DEFAULT_COLOR_SCHEME;
};
