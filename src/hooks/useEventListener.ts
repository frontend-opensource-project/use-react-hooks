import { useEffect } from 'react';

// window event
// dom elements
// mediaqueries
// with ref

interface useEventListenerProps {
  eventName: string;
  handler: (e: Event) => void;
  element?: Element | Window | null;
}

function useEventListener(options: useEventListenerProps) {
  const { eventName, handler, element = window } = options;
  useEffect(() => {
    if (!element) return;

    const eventListener = (e: Event) => {
      handler(e);
    };

    element.addEventListener(eventName, eventListener);

    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element, handler]);
}

export default useEventListener;
