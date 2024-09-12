import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { throttle } from '../../utils';

interface MousePosOptions {
  delayTime?: number;
  animationMode?: boolean;
}

interface CursorState {
  viewX: number | null;
  viewY: number | null;
  pageX: number | null;
  pageY: number | null;
  screenX: number | null;
  screenY: number | null;
  elementX: number | null;
  elementY: number | null;
}

interface RefScale {
  refW: number | null;
  refH: number | null;
}

interface MouseResult extends CursorState, RefScale {
  targetRef: Dispatch<SetStateAction<Element | null>>;
}

const initialCursorState: CursorState = {
  viewX: null,
  viewY: null,
  pageX: null,
  pageY: null,
  screenX: null,
  screenY: null,
  elementX: null,
  elementY: null,
};

const DEFAULT_DELAY_TIME = 1000 / 60;

/**
 * 마우스의 위치와 관련된 정보를 추적하는 훅
 * @param {MousePosOptions} [options] - 마우스 위치 추적의 설정 옵션
 * @param {number} [options.delayTime=1000/60] - 이벤트 핸들링을 throttle할 시간 간격 (ms 단위)
 * @param {boolean} [options.animationMode=false] - animationMode를 활성화할지 여부
 * @returns {MouseResult} MouseResult - 마우스 위치와 요소의 크기 및 좌표 정보를 포함한 객체
 * @returns {number | null} viewX - 뷰포트에서의 마우스 x 좌표
 * @returns {number | null} viewY - 뷰포트에서의 마우스 y 좌표
 * @returns {number | null} pageX - 페이지에서의 마우스 x 좌표
 * @returns {number | null} pageY - 페이지에서의 마우스 y 좌표
 * @returns {number | null} screenX - 화면에서의 마우스 x 좌표
 * @returns {number | null} screenY - 화면에서의 마우스 y 좌표
 * @returns {number | null} elementX - 지정된 Element와의 상대적인 마우스 x 좌표(Element 왼쪽 기준)
 * @returns {number | null} elementY - 지정된 Element와의 상대적인 마우스 y 좌표(Element 상단 기준)
 * @returns {number | null} refW - 지정된 Element의 너비
 * @returns {number | null} refH - 지정된 Element의 높이
 * @returns {Dispatch<SetStateAction<Element | null>>} targetRef - 참조를 설정하는 함수
 * @description
 * 마우스 이벤트를 감지하고 마우스의 다양한 좌표 및 관련 정보를 제공합니다.
 * 기본적으로 throttle을 사용하여 성능을 최적화하며 delayTime으로 해당 호출 빈도를 설정할 수 있습니다.
 * animationMode가 활성화된 경우 requestAnimationFrame을 사용, throttle을 대체한 최적화를 통해 마우스 움직임을 처리합니다.
 */

const useMousePosition = ({
  delayTime = DEFAULT_DELAY_TIME,
  animationMode = false,
}: MousePosOptions = {}): MouseResult => {
  const [cursorState, setCursorState] =
    useState<CursorState>(initialCursorState);
  const [ref, setRef] = useState<Element | null>(null);

  const refScale = useRef<RefScale>({ refW: null, refH: null });

  const calculateRefState = useCallback(
    (element: Element, clientX: number, clientY: number) => {
      const { left, top, width, height } = element.getBoundingClientRect();
      const elementX = clientX - left;
      const elementY = clientY - top;
      refScale.current = { refW: width, refH: height };

      return { elementX, elementY };
    },
    []
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      const { clientX, clientY, pageX, pageY, screenX, screenY } = event;

      const newCursorState: CursorState = {
        viewX: clientX,
        viewY: clientY,
        pageX,
        pageY,
        screenX,
        screenY,
        elementX: null,
        elementY: null,
      };

      if (ref) {
        const { elementX, elementY } = calculateRefState(ref, clientX, clientY);
        newCursorState.elementX = elementX;
        newCursorState.elementY = elementY;
      }
      setCursorState(newCursorState);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ref]
  );

  // Throttle
  useEffect(() => {
    if (!animationMode) {
      const throttledHandleMouseMove = throttle(
        (event: MouseEvent) => handleMouseMove(event),
        delayTime
      );
      document.addEventListener('mousemove', throttledHandleMouseMove);
      return () => {
        document.removeEventListener('mousemove', throttledHandleMouseMove);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleMouseMove]);

  // Animation
  useEffect(() => {
    if (animationMode) {
      if (delayTime !== DEFAULT_DELAY_TIME) {
        console.warn(
          "The 'delayTime' option is ignored when 'animationMode' is enabled."
        );
      }
      const { handler: animatedHandleMouseMove, cancelAnimation } =
        animationFrameHandler(handleMouseMove);

      document.addEventListener('mousemove', animatedHandleMouseMove);
      return () => {
        document.removeEventListener('mousemove', animatedHandleMouseMove);
        cancelAnimation();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleMouseMove]);

  return {
    ...cursorState,
    ...refScale.current,
    targetRef: setRef,
  };
};

export default useMousePosition;

const animationFrameHandler = <T extends Event>(
  callbackFn: (event: T) => void
) => {
  let frameId: number | null = null;

  const handler = (event: T) => {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
    }
    frameId = requestAnimationFrame(() => callbackFn(event));
  };

  const cancelAnimation = () => {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  };

  return { handler, cancelAnimation };
};
