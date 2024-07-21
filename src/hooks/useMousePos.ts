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

const useMousePos = ({
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
