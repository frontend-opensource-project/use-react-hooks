import { useCallback, useEffect, useRef, RefObject } from 'react';
import { EventType, UseOutsideInteractionProps } from './type';

const defaultEvents: EventType[] = ['mousedown', 'touchstart', 'keydown'];

/**
 * 지정된 element 외부의 interaction을 감지하는 hook
 * 마우스 클릭, 터치, 키보드 이벤트(Escape 키)를 처리할 수 있습니다.
 *
 * @param {Object} props - hook props
 * @param {() => void} props.handleOutsideInteraction - 외부 interaction 발생 시 실행될 콜백 함수
 * @param {EventType[]} [props.events] - 감지할 이벤트 (default :['mousedown', 'touchstart', 'keydown'])
 *
 * @returns {React.RefObject<HTMLElement>} element에 연결할 ref 객체
 */

const useOutsideInteraction = ({
  handleOutsideInteraction,
  events = defaultEvents,
}: UseOutsideInteractionProps): RefObject<HTMLElement> => {
  const ref = useRef<HTMLElement>(null);

  const handleEvent = useCallback(
    (event: Event) => {
      if (event instanceof KeyboardEvent) {
        if (event.key === 'Escape') {
          handleOutsideInteraction();
          return;
        }
      }

      const target = event.target as Node | null;
      if (!target) return;

      if (ref.current && !ref.current.contains(target)) {
        handleOutsideInteraction();
      }
    },
    [handleOutsideInteraction]
  );

  useEffect(() => {
    if (events.length === 0) return;

    events.forEach((event) => document.addEventListener(event, handleEvent));

    return () => {
      events.forEach((event) =>
        document.removeEventListener(event, handleEvent)
      );
    };
  }, [handleEvent, events]);

  return ref;
};

export default useOutsideInteraction;
