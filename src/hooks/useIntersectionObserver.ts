import { useEffect, useState } from 'react';

interface IntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

// 얘네가 다 필요한가?
interface IntersectionState {
  isIntersecting: boolean;
  intersectionRatio: number;
  target: Element;
  intersectionRect: DOMRectReadOnly;
  boundingClientRect: DOMRectReadOnly;
  time: DOMHighResTimeStamp;
  rootBounds: DOMRectReadOnly;
}

interface IntersectionObserverResult {
  setRef: (node?: Element | null) => void;
  entry: IntersectionState | null;
}

function useIntersectionObserver({
  root,
  rootMargin,
  threshold,
}: IntersectionObserverOptions = {}): IntersectionObserverResult {
  const [ref, setRef] = useState<Element | null>(null);
  const [entry, setEntry] = useState<IntersectionState | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(
        (entry) => {
          setEntry({
            isIntersecting: entry.isIntersecting,
            intersectionRatio: entry.intersectionRatio,
            target: entry.target,
            intersectionRect: entry.intersectionRect,
            boundingClientRect: entry.boundingClientRect,
            time: entry.time,
            rootBounds: entry.rootBounds as DOMRectReadOnly,
          });
        },
        { root, rootMargin, threshold }
      );
    });

    observer.observe(ref);

    return () => {
      observer.unobserve(ref);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  // ref를 지정하는 함수와 ref로 지정된 관찰 대상 요소의 관련 상세정보 반환
  return { setRef, entry } as IntersectionObserverResult;
}

export default useIntersectionObserver;
