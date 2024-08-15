import { useEffect, useRef } from 'react';
import { isClient } from '../utils';

/**
 * 페이지의 스크롤을 잠그거나 해제하여 사용자가 스크롤할 수 없도록 하는 훅
 * @param {boolean} isLocked - 스크롤 잠금을 활성화할지 여부를 결정
 * `isLocked`가 `true`로 설정되면, 현재의 스크롤 위치를 저장하고 페이지의 스타일을 변경하여 스크롤을 잠급니다.
 * `isLocked`가 `false`로 설정되면, 저장된 스크롤 위치로 돌아가고 페이지 스타일이 원래대로 복원됩니다.
 * @returns {void}
 */

const useScrollLock = (isLocked: boolean) => {
  const scrollRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const storeScrollPosition = () => {
    scrollRef.current = {
      x: window.scrollX,
      y: window.scrollY,
    };
  };

  const applyScrollLock = () => {
    storeScrollPosition();

    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollRef.current.y}px`;
    document.body.style.width = '100%';
    document.body.style.overflowY = 'scroll';

    const isScrollX = document.documentElement.scrollWidth > window.innerWidth;

    if (isScrollX) {
      document.body.style.left = `-${scrollRef.current.x}px`;
      document.body.style.overflowX = 'scroll';
    }
  };

  const removeScrollLock = () => {
    ['position', 'top', 'left', 'width', 'overflowY', 'overflowX'].forEach(
      (property) => {
        document.body.style.removeProperty(property);
      }
    );
  };

  const restoreScrollPosition = () => {
    window.scrollTo(scrollRef.current.x, scrollRef.current.y);
  };

  useEffect(() => {
    if (!isClient) return;

    if (isLocked) {
      applyScrollLock();
    } else {
      removeScrollLock();
    }

    return () => {
      removeScrollLock();
      if (isLocked) {
        restoreScrollPosition();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLocked]);

  return null;
};

export default useScrollLock;
