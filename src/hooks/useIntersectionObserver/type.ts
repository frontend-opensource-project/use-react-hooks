import { Dispatch, SetStateAction } from 'react';

export interface IntersectionObserverProps {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  visibleOnce?: boolean;
  initialView?: boolean;
  onChange?: (isView: boolean, entry: IntersectionObserverEntry) => void;
  onEnter?: () => void;
  onLeave?: () => void;
}

export interface Entry {
  isView: boolean;
  entry?: IntersectionObserverEntry | null;
}

export interface IntersectionObserverReturns extends Entry {
  intersectionRef: Dispatch<SetStateAction<Element | null>>;
}
