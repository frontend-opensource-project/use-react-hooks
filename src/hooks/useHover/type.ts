export interface UseHoverReturns<T> {
  isHovered: boolean;
  callbackRef: (node: T) => void;
}
