import { useEffect, useState } from 'react';

interface IntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

interface IntersectionObserverResult {
  setRef: (node?: Element | null) => void;
  isView: boolean;
  entry?: IntersectionObserverEntry;
}

function useIntersectionObserver({
  root,
  rootMargin,
  threshold,
}: IntersectionObserverOptions = {}): IntersectionObserverResult {
  const [ref, setRef] = useState<Element | null>(null);
  const [entryState, setEntryState] = useState<{
    isView: boolean;
    entry?: IntersectionObserverEntry | null;
  }>({ isView: false, entry: null });

  useEffect(() => {
    if (!ref) return;

    const handleIntersection: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        setEntryState((prev) => ({
          ...prev,
          isView: entry.isIntersecting,
          entry: entry,
        }));
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
}

export default useIntersectionObserver;
