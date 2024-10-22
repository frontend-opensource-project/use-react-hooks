import { useCallback, useEffect, useRef, RefObject } from 'react';
import { EventType, UseOutsideClickProps } from './type';

const defaultEvents: EventType[] = ['mousedown', 'touchstart'];

/**
 * 지정된 element 외부의 click event를 감지하는 hook
 * onClickOutside 함수를 통해 마우스 클릭 이벤트를 처리할 수 있습니다.
 *
 * @param {Object} props - hook props
 * @param {() => void} props.onClickOutside - 외부 interaction 발생 시 실행될 콜백 함수
 * @param {EventType[]} [props.events] - 감지할 이벤트 (default :['mousedown', 'touchstart'])
 *
 * @returns {React.RefObject<HTMLElement>} element에 연결할 ref 객체
 */

const useOutsideClick = ({
  onClickOutside,
  events = defaultEvents,
}: UseOutsideClickProps): RefObject<HTMLElement> => {
  const ref = useRef<HTMLElement>(null);

  const handleClick = useCallback(
    (event: Event) => {
      const target = event.target as Node | null;
      if (!target) return;

      if (ref.current && !ref.current.contains(target)) {
        onClickOutside();
      }
    },
    [onClickOutside]
  );

  useEffect(() => {
    if (events.length === 0) return;

    events.forEach((event) => document.addEventListener(event, handleClick));

    return () => {
      events.forEach((event) =>
        document.removeEventListener(event, handleClick)
      );
    };
  }, [handleClick, events]);

  return ref;
};

export default useOutsideClick;
