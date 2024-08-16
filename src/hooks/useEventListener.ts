import { RefObject, useEffect, useRef } from 'react';
import { isClient } from '../utils';

type EventMap =
  | WindowEventMap
  | DocumentEventMap
  | HTMLElementEventMap
  | SVGElementEventMap;

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
  element?: RefObject<HTMLElement>,
  options?: AddEventListenerOptions
): void;

function useEventListener<K extends keyof SVGElementEventMap>(
  eventName: K,
  handler: (event: SVGElementEventMap[K]) => void,
  element?: RefObject<SVGElement>,
  options?: AddEventListenerOptions
): void;

function useEventListener<K extends keyof EventMap>(
  eventName: K,
  handler: (event: EventMap[K]) => void,
  element:
    | Window
    | Document
    | RefObject<HTMLElement | SVGElement>
    | null = window,
  options?: AddEventListenerOptions
): void {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!element || !isClient) return;

    const targetElement = 'current' in element ? element.current : element;
    if (!targetElement) return;

    const eventListener = (event: Event) => {
      savedHandler.current(event as EventMap[K]);
    };

    targetElement.addEventListener(eventName, eventListener, options);

    return () => {
      targetElement.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, element, handler, options]);
}

export default useEventListener;
