import { useEffect } from 'react';

type Fn = () => void;

interface UseKeyCombination {
  shortcutKeys: string[];
  callback: Fn;
  isPrevent?: boolean;
}

/**
 * 지정된 키 조합이 눌렸을 때 콜백 함수를 호출하는 훅.
 *
 * @param {string[]} params.shortcutKeys - 키 조합을 나타내는 키 코드의 배열
 * @param {Fn} params.callback - 키 조합이 감지되었을 때 실행할 콜백 함수
 * @param {boolean} [params.isPrevent=false] - true로 설정하면 키 조합이 눌렸을 때 기본 동작 방지
 *
 * @description
 * 이 훅은 지정된 키들이 모두 눌렸을 때 콜백 함수를 호출하며, 필요에 따라 기본 동작을 막을 수도 있습니다.
 * 예를 들어, 'Ctrl + K' 키 조합을 감지하여 특정 작업을 실행하고자 할 때 사용할 수 있습니다.
 */

export const useKeyCombination = ({
  shortcutKeys,
  callback,
  isPrevent = false,
}: UseKeyCombination) => {
  const shortcutKeysId = shortcutKeys.join();

  useEffect(() => {
    let pressedKeyMap: Record<string, boolean> = {};

    const onKeyDown = (e: KeyboardEvent) => {
      pressedKeyMap[e.code] = true;
      if (shortcutKeys.every((k) => pressedKeyMap[k])) {
        if (isPrevent) e.preventDefault();
        callback();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      // macOS에서는 Meta 키가 눌린 상태에서 keyup 이벤트가 발생하지 않기에
      // Meta가 떼어질 경우 다른 키들도 떼어진 것으로 간주
      if (e.key === 'Meta') {
        pressedKeyMap = {};
        return;
      }

      pressedKeyMap[e.code] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortcutKeysId, callback]);
};

export default useKeyCombination;
