import { RefObject, useEffect, useRef } from 'react';
import { isClient } from '@/utils';
import { EventMap, EventElement } from './type';

/**
 * 특정 객체에 이벤트 리스너를 손쉽게 추가할 수 있는 훅
 *
 * @param {E} eventName - 추가할 이벤트의 이름
 * @param {(event: EventMap[K][E]) => void} handler - 이벤트 발생 시 실행되는 콜백 함수
 * @param {EventElement[K] | null} [element=window] - 이벤트를 추가할 대상 Element, 기본값은 window
 * @param {AddEventListenerOptions} [options] - 이벤트 리스너 기본 옵션
 *
 * @description
 * 현재 이벤트 리스너를 추가할 수 있는 객체는 `window`, `document`, `htmlElement`, `svgElement` 4가지입니다.
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
