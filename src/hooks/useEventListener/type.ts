import { RefObject } from 'react';

export type EventMap = {
  window: WindowEventMap;
  document: DocumentEventMap;
  htmlElement: HTMLElementEventMap;
  svgElement: SVGElementEventMap;
};

export type EventElement = {
  window: Window;
  document: Document;
  htmlElement: RefObject<HTMLElement> | HTMLElement;
  svgElement: RefObject<SVGElement> | SVGElement;
};
