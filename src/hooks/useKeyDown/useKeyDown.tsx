import { useEffect } from 'react';
import { UseKeyDownProps } from '@/hooks/useKeyDown/type';

/**
 * 주어진 키 입력에 대한 이벤트를 처리하는 훅
 *
 * @param {string} key - 감지할 키 값 (예: 'Escape', 'Enter' 등)
 * @param {() => void} onKeyPress - 지정된 키가 눌렸을 때 실행할 콜백 함수
 *
 * @returns {void}
 */
const useKeyDown = ({ key, onKeyPress }: UseKeyDownProps): void => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === key.toLowerCase() && !event.repeat) {
        onKeyPress();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, onKeyPress]);
};

export default useKeyDown;
