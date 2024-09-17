export type EventType =
  | 'mousedown'
  | 'mouseup'
  | 'touchstart'
  | 'touchend'
  | 'keydown';

export interface UseOutsideInteractionProps {
  handleOutsideInteraction: () => void;
  events?: EventType[];
}
