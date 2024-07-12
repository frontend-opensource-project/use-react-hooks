import { useEffect, useState } from 'react';

interface IntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  visibleOnce?: boolean;
  initialView?: boolean;
}

interface IntersectionObserverResult {
  setRef: (node?: Element | null) => void;
  isView: boolean;
  entry?: IntersectionObserverEntry;
}

const useIntersectionObserver = ({
  root,
  rootMargin,
  threshold,
  visibleOnce = false,
  initialView = false,
}: IntersectionObserverOptions = {}): IntersectionObserverResult => {
  const [ref, setRef] = useState<Element | null>(null);
  const [entryState, setEntryState] = useState<{
    isView: boolean;
    entry?: IntersectionObserverEntry | null;
  }>({ isView: initialView, entry: null });

  useEffect(() => {
    if (!ref) return;

    const handleIntersection: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        const isIntersecting = entry.isIntersecting;
        setEntryState({ isView: isIntersecting, entry: entry });

        if (visibleOnce && isIntersecting) {
          observer.unobserve(ref);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      root,
      rootMargin,
      threshold,
    });
    observer.observe(ref);

    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  return {
    setRef,
    isView: entryState.isView,
    entry: entryState.entry,
  } as IntersectionObserverResult;
};

export default useIntersectionObserver;
