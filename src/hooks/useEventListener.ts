import { useEffect } from 'react';

// window event
// dom elements
// document
// mediaqueries
// with ref

interface useEventListenerProps<K extends keyof WindowEventMap> {
  eventName: K;
  handler: (event: WindowEventMap[K]) => void;
  element?: Window | Document | Element | null;
}

function useEventListener<K extends keyof WindowEventMap>({
  eventName,
  handler,
  element = window,
}: useEventListenerProps<K>) {
  useEffect(() => {
    if (!element) return;

    const eventListener = (event: Event) => {
      handler(event as WindowEventMap[K]);
    };

    element.addEventListener(eventName, eventListener);

    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element, handler]);
}

export default useEventListener;
