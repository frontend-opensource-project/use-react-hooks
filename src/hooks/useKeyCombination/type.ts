export type Fn = () => void;

export interface UseKeyCombinationProps {
  shortcutKeys: string[];
  callback: Fn;
  isPrevent?: boolean;
}
