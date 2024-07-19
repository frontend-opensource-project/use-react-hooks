import { useCallback, MutableRefObject, useEffect, useRef } from 'react';

type EventType =
  | 'mousedown'
  | 'mouseup'
  | 'touchstart'
  | 'touchend'
  | 'keydown';

interface UseOutsideInteractionProps {
  handleOutsideInteraction: () => void;
  events?: EventType[];
}

const defaultEvents: EventType[] = ['mousedown', 'touchstart', 'keydown'];

const useOutsideInteraction = ({
  handleOutsideInteraction,
  events = defaultEvents,
}: UseOutsideInteractionProps): MutableRefObject<HTMLElement | null> => {
  const ref = useRef<HTMLElement | null>(null);

  const handleEvent = useCallback(
    (event: Event) => {
      if (event instanceof KeyboardEvent) {
        if (event.key === 'Escape') {
          handleOutsideInteraction();
          return;
        }
      }

      const target = event.target as Node | null;
      if (!target) return;

      if (ref.current && !ref.current.contains(target)) {
        handleOutsideInteraction();
      }
    },
    [handleOutsideInteraction]
  );

  useEffect(() => {
    if (events.length === 0) return;

    events.forEach((event) => document.addEventListener(event, handleEvent));

    return () => {
      events.forEach((event) =>
        document.removeEventListener(event, handleEvent)
      );
    };
  }, [handleEvent, events]);

  return ref;
};

export default useOutsideInteraction;
