import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

interface IntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  visibleOnce?: boolean;
  initialView?: boolean;
  onChange?: (isView: boolean, entry: IntersectionObserverEntry) => void;
  onEnter?: () => void;
  onLeave?: () => void;
}

interface IntersectionObserverResult {
  intersectionRef: Dispatch<SetStateAction<Element | null>>;
  isView: boolean;
  entry?: IntersectionObserverEntry | null;
}

const useIntersectionObserver = ({
  root,
  rootMargin,
  threshold,
  visibleOnce = false,
  initialView = false,
  onChange,
  onEnter,
  onLeave,
}: IntersectionObserverOptions = {}): IntersectionObserverResult => {
  const [ref, setRef] = useState<Element | null>(null);
  const [entryState, setEntryState] = useState<{
    isView: boolean;
    entry?: IntersectionObserverEntry | null;
  }>({ isView: initialView, entry: null });

  const onChangeRef = useRef<IntersectionObserverOptions['onChange']>();
  onChangeRef.current = onChange;

  const onLeaveRef = useRef<IntersectionObserverOptions['onLeave']>();
  onLeaveRef.current = onLeave;

  const onEnterRef = useRef<IntersectionObserverOptions['onEnter']>();
  onEnterRef.current = onEnter;

  const currentValue = useRef(false);

  useEffect(() => {
    if (!ref) return;

    const handleIntersection: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        const isIntersecting = entry.isIntersecting;

        if (
          currentValue.current === false &&
          isIntersecting === true &&
          onEnterRef.current
        ) {
          onEnterRef.current();
        }

        if (
          currentValue.current === true &&
          isIntersecting === false &&
          onLeaveRef.current
        ) {
          onLeaveRef.current();
        }

        setEntryState({ isView: isIntersecting, entry });
        currentValue.current = isIntersecting;

        if (onChangeRef.current) {
          onChangeRef.current(isIntersecting, entry);
        }

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
    intersectionRef: setRef,
    isView: entryState.isView,
    entry: entryState.entry,
  };
};

export default useIntersectionObserver;
