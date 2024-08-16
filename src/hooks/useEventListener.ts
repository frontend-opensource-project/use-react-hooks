import { useEffect, useRef } from 'react';
import { isClient } from '../utils';

// isClient해줘야하나?

type EventMap =
  | WindowEventMap
  | DocumentEventMap
  | HTMLElementEventMap
  | SVGElementEventMap
  | ElementEventMap;

interface useEventListenerProps<K extends keyof EventMap> {
  eventName: K;
  handler: (event: EventMap[K]) => void;
  element?:
    | Window
    | Document
    | HTMLElement
    | SVGElement
    | Element
    | MediaQueryList
    | null;
  options: AddEventListenerOptions;
}

function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: Window | null,
  options?: AddEventListenerOptions
): void;

function useEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (event: DocumentEventMap[K]) => void,
  element?: Document,
  options?: AddEventListenerOptions
): void;

function useEventListener<K extends keyof HTMLElementEventMap>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  element?: HTMLElement,
  options?: AddEventListenerOptions
): void;

function useEventListener<K extends keyof SVGElementEventMap>(
  eventName: K,
  handler: (event: SVGElementEventMap[K]) => void,
  element?: SVGElement,
  options?: AddEventListenerOptions
): void;

function useEventListener<K extends keyof ElementEventMap>(
  eventName: K,
  handler: (event: ElementEventMap[K]) => void,
  element?: Element,
  options?: AddEventListenerOptions
): void;

function useEventListener<K extends keyof EventMap>({
  eventName,
  handler,
  element = window,
  options,
}: useEventListenerProps<K>) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!element || !isClient) return;

    const eventListener = (event: Event) => {
      handler(event as EventMap[K]);
    };

    element.addEventListener(eventName, eventListener, options);

    return () => {
      element.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, element, handler, options]);
}

export default useEventListener;
