export type EventType = 'mousedown' | 'mouseup' | 'touchstart' | 'touchend';

export interface UseOutsideClickProps {
  onClickOutside: () => void;
  events?: EventType[];
}
