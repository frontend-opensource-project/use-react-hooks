import { Dispatch, SetStateAction } from 'react';

export interface UseMousePositionProps {
  delayTime?: number;
  animationMode?: boolean;
}

export interface CursorState {
  viewX: number | null;
  viewY: number | null;
  pageX: number | null;
  pageY: number | null;
  screenX: number | null;
  screenY: number | null;
  elementX: number | null;
  elementY: number | null;
}

export interface RefScale {
  refW: number | null;
  refH: number | null;
}

export interface UseMousePositionReturns extends CursorState, RefScale {
  targetRef: Dispatch<SetStateAction<Element | null>>;
}
