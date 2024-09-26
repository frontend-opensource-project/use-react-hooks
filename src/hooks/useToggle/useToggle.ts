import { useReducer } from 'react';

const toggleReducer = (state: boolean, nextValue?: unknown) =>
  typeof nextValue === 'boolean' ? nextValue : !state;

/**
 * boolean 값을 토글하는 훅
 *
 * @param {boolean} initialValue 토글의 시작 상태 설정
 *
 * @returns {[boolean, (nextValue?: unknown) => void]} 첫 번째 요소는 현재 상태값, 두 번째 요소는 상태를 토글하거나 지정된 값을 설정
 *
 * @description
 * 상태를 토글하거나, 전달된 값으로 상태를 설정할 수 있습니다.
 * 상태 변경 함수는 인자로 `boolean` 값을 받을 수 있으며, 전달된 값이 `boolean`이 아니면 현재 상태의 반대값으로 설정됩니다.
 * 모달을 표시하고 숨기거나, 사이드 메뉴를 열거나 닫을 때처럼 어떤 동작을 반대 동작으로 바꾸고 싶을 때 유용합니다.
 */

const useToggle = (
  initialValue: boolean
): [boolean, (nextValue?: unknown) => void] => {
  return useReducer(toggleReducer, initialValue);
};

export default useToggle;
