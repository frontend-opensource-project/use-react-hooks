import { RefObject, useEffect, useRef } from 'react';
import { isClient } from '@/utils';
import { EventMap, EventElement } from './type';

/**
 * 특정 이벤트에 대한 이벤트 리스너를 추가하여, 이벤트 발생 시 핸들러를 실행하는 훅.
 *
 * @param {E} eventName - 추가할 이벤트의 이름.
 * @param {(event: EventMap[K][E]) => void} handler - 이벤트 발생 시 호출되는 콜백 함수.
 * @param {EventElement[K] | null} [element=window] - 이벤트를 추가할 대상 Element, 기본값은 window.
 * @param {AddEventListenerOptions} [options] - 이벤트 리스너 기본 옵션.
 *
 * @description
 * 지정된 이벤트가 발생할 때마다 제공된 핸들러를 호출합니다.
 * 가능한 Element로 window, document, htmlElement, svgElement
 */

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
