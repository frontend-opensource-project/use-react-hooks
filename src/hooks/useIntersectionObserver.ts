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
/**
 * IntersectionObserver API를 이용하여 요소의 가시성을 감지하는 훅
 * @param {Element | null} root 관찰할 요소들의 root 엘리먼트
 * @param {string} rootMargin root 엘리먼트와 각 타겟 엘리먼트 사이의 여백을 설정
 * @param {number | number[]} threshold 타겟 엘리먼트가 root 엘리먼트와 교차하는 정도를 설정
 * @param {boolean} visibleOnce 타겟 엘리먼트의 가시성이 처음 한 번만 보고되어야 하는지 여부 설정
 * @param {boolean} initialView 초기 가시성 상태
 * @param {(isView: boolean, entry: IntersectionObserverEntry) => void} onChange
 * 타겟 엘리먼트의 가시성 상태가 변경될 때 호출할 콜백 함수
 * @param {() => void} onEnter 타겟 엘리먼트가 화면에 나타날 때 호출할 콜백 함수
 * @param {() => void} onLeave 타겟 엘리먼트가 화면에서 사라질 때 호출할 콜백 함수
 * @returns {IntersectionObserverResult} useIntersectionObserver의 결과 객체
 * @description
 * 주어진 요소의 가시성 상태 변화를 감지하여 변화에 따라 지정된 콜백을 호출합니다.
 */

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

  const onChangeRef = useRef<IntersectionObserverOptions['onChange']>(onChange);
  const onLeaveRef = useRef<IntersectionObserverOptions['onLeave']>(onLeave);
  const onEnterRef = useRef<IntersectionObserverOptions['onEnter']>(onEnter);

  const previousIsIntersecting = useRef(initialView);

  useEffect(() => {
    if (!ref) return;

    const handleIntersection: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        const isIntersecting = entry.isIntersecting;

        if (
          !previousIsIntersecting.current &&
          isIntersecting &&
          onEnterRef.current
        ) {
          onEnterRef.current();
        }

        if (
          previousIsIntersecting.current &&
          !isIntersecting &&
          onLeaveRef.current
        ) {
          onLeaveRef.current();
        }

        setEntryState({ isView: isIntersecting, entry });
        previousIsIntersecting.current = isIntersecting;

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
