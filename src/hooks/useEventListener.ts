import { useEffect, useRef } from 'react';

// document
// mediaqueries
// with ref

// isClient해줘야하나?

type EventMap =
  | WindowEventMap
  | DocumentEventMap
  | ElementEventMap
  | SVGElementEventMap
  | MediaQueryListEventMap;

interface useEventListenerProps<K extends keyof EventMap> {
  eventName: K;
  handler: (event: EventMap[K]) => void;
  element?:
    | Window
    | Document
    | HTMLElement
    | HTMLElement
    | SVGElement
    | MediaQueryList
    | null;
}

function useEventListener<K extends keyof EventMap>({
  eventName,
  handler,
  element = window,
}: useEventListenerProps<K>) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!element) return;

    const eventListener = (event: Event) => {
      handler(event as EventMap[K]);
    };

    element.addEventListener(eventName, eventListener);

    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element, handler]);
}

export default useEventListener;
