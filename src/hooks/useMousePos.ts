import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

interface MousePosOptions {
  delayTime?: number;
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

const useMousePos = ({
  delayTime = DEFAULT_DELAY_TIME,
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const throttledHandleMouseMove = useCallback(
    throttle((event: MouseEvent) => handleMouseMove(event), delayTime),
    [handleMouseMove]
  );

  useEffect(() => {
    document.addEventListener('mousemove', throttledHandleMouseMove);
    return () => {
      document.removeEventListener('mousemove', throttledHandleMouseMove);
    };
  }, [throttledHandleMouseMove]);

  return {
    ...cursorState,
    ...refScale.current,
    targetRef: setRef,
  };
};

export default useMousePos;

const throttle = <T extends Event>(
  callbackFn: (event: T) => void,
  delayTime: number
) => {
  let lastTime = 0;

  return (event: T) => {
    const now = Date.now();
    if (now - lastTime >= delayTime) {
      lastTime = now;
      callbackFn(event);
    }
  };
};
