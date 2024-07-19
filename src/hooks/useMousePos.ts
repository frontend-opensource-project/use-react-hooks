import { Dispatch, SetStateAction, useEffect, useState } from 'react';

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

interface MouseResult extends CursorState {
  targetRef: Dispatch<SetStateAction<Element | null>>;
  isInside: boolean;
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

const useMousePos = (): MouseResult => {
  const [cursorState, setCursorState] =
    useState<CursorState>(initialCursorState);
  const [ref, setRef] = useState<Element | null>(null);
  const [isInside, setIsInside] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
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
        const { left, top, right, bottom } = ref.getBoundingClientRect();
        newCursorState.elementX = clientX - left;
        newCursorState.elementY = clientY - top;

        const isCursorInside =
          clientX >= left &&
          clientX <= right &&
          clientY >= top &&
          clientY <= bottom;
        setIsInside(isCursorInside);
      }

      setCursorState(newCursorState);
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [ref]);

  return {
    ...cursorState,
    targetRef: setRef,
    isInside,
  };
};

export default useMousePos;
