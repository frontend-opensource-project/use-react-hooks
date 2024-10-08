export type Fn = () => void;

export interface UseLongPressReturns {
  onMouseDown: Fn;
  onMouseUp: Fn;
  onMouseLeave: Fn;
  onTouchStart: Fn;
  onTouchEnd: Fn;
}
