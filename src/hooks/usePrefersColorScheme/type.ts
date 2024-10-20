export type Fn = () => void;

export type UsePrefersColorSchemeReturns = 'dark' | 'light';

export interface UsePrefersColorSchemeProps {
  serverSnapshot?: UsePrefersColorSchemeReturns;
}
