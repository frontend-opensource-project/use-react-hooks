import { useEffect } from 'react';

/**
 * 브라우저에서 복사 이벤트를 차단하는 훅
 *
 * @param {VoidFunction} callback - 복사 이벤트가 발생할 때 실행할 콜백 함수
 *
 * @description 복사(또는 잘라내기) 이벤트를 차단하고 콜백 함수를 실행합니다.
 */
const usePreventCopy = (callback?: () => void) => {
  const preventCopy = (e: ClipboardEvent) => {
    e.preventDefault();
    callback?.();
  };

  useEffect(() => {
    // TODO: useEventListener 적용하기
    window.addEventListener('copy', preventCopy);
    window.addEventListener('cut', preventCopy);
    return () => {
      window.removeEventListener('copy', preventCopy);
      window.removeEventListener('cut', preventCopy);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export default usePreventCopy;
