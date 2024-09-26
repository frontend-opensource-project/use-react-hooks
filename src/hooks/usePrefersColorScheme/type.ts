export type Fn = () => void;

export type ColorSchemeType = 'dark' | 'light';

export interface UsePrefersColorSchemeProps {
  serverSnapshot?: ColorSchemeType;
}
