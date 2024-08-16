import { RefObject, useEffect, useRef } from 'react';
import { isClient } from '../utils';

type EventMap = {
  window: WindowEventMap;
  document: DocumentEventMap;
  htmlElement: HTMLElementEventMap;
  svgElement: SVGElementEventMap;
};

type EventElement = {
  window: Window;
  document: Document;
  htmlElement: RefObject<HTMLElement>;
  svgElement: RefObject<SVGElement>;
};

function useEventListener<
  K extends keyof EventMap,
  E extends keyof EventMap[K] & string,
>(
  eventName: E,
  handler: (event: EventMap[K][E]) => void,
  element?: EventElement[K] | null,
  options?: AddEventListenerOptions
): void {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!isClient) return;

    let targetElement: HTMLElement | SVGElement | Window | Document | null =
      null;

    if (element && 'current' in element) {
      targetElement = (element as RefObject<HTMLElement | SVGElement>).current;
    } else {
      targetElement = element || window;
    }

    if (!targetElement) return;

    const eventListener = (event: Event) => {
      if (savedHandler.current) {
        savedHandler.current(event as EventMap[K][E]);
      }
    };

    targetElement.addEventListener(eventName, eventListener, options);

    return () => {
      targetElement.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, element, options]);
}

export default useEventListener;
