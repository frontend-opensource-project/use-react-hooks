import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

/**
 * IntersectionObserver 옵션을 정의하는 인터페이스
 */
interface IntersectionObserverOptions {
  /**
   * 관찰할 요소들의 root 엘리먼트
   */
  root?: Element | null;

  /**
   * root 엘리먼트와 각 타겟 엘리먼트 사이의 여백을 설정
   */
  rootMargin?: string;

  /**
   * 타겟 엘리먼트가 root 엘리먼트와 교차하는 정도를 설정
   */
  threshold?: number | number[];

  /**
   * 타겟 엘리먼트의 가시성이 한 번만 보고되어야 하는지 여부를 설정
   */
  visibleOnce?: boolean;

  /**
   * 초기 가시성 상태
   */
  initialView?: boolean;

  /**
   * 타겟 엘리먼트의 가시성 상태가 변경될 때 호출할 콜백 함수
   * @param isView 타겟 엘리먼트의 가시성 상태 (보이는 경우 true, 안 보이는 경우 false)
   * @param entry IntersectionObserverEntry 객체
   */
  onChange?: (isView: boolean, entry: IntersectionObserverEntry) => void;

  /**
   * 타겟 엘리먼트가 화면에 나타날 때 호출할 콜백 함수
   */
  onEnter?: () => void;

  /**
   * 타겟 엘리먼트가 화면에서 사라질 때 호출할 콜백 함수
   */
  onLeave?: () => void;
}

/**
 * IntersectionObserverResult useIntersectionObserver의 결과 객체
 */
interface IntersectionObserverResult {
  /**
   * Hook에서 사용하는 엘리먼트 상태를 설정하는 데 사용되는 디스패치 함수
   */
  intersectionRef: Dispatch<SetStateAction<Element | null>>;

  /**
   * 엘리먼트가 현재 뷰포트 내에 보이는지 여부를 나타내는 상태 값
   */
  isView: boolean;

  /**
   * Intersection Observer API를 사용하여 요소의 교차 상태와 관련된 정보를 나타내는 객체
   */
  entry?: IntersectionObserverEntry | null;
}
/**
 * useIntersectionObserver: IntersectionObserver API를 이용하여 요소의 가시성을 감지하는 훅
 * @param {IntersectionObserverOptions} options useIntersectionObserver 설정 옵션
 * @returns {IntersectionObserverResult} useIntersectionObserver의 결과 객체
 * @description
 * 주어진 요소의 가시성 상태 변화를 감지하고, 변화에 따라 지정된 콜백을 호출합니다.
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

  const onChangeRef = useRef<IntersectionObserverOptions['onChange']>();
  onChangeRef.current = onChange;

  const onLeaveRef = useRef<IntersectionObserverOptions['onLeave']>();
  onLeaveRef.current = onLeave;

  const onEnterRef = useRef<IntersectionObserverOptions['onEnter']>();
  onEnterRef.current = onEnter;

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
