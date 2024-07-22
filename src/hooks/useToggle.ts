import { useReducer } from 'react';

// nextValue로 boolean을 받으면 받은 값으로 설정, boolean 타입이 아니라면 기존 상태에 not 연산 수행
const toggleReducer = (state: boolean, nextValue?: unknown) =>
  typeof nextValue === 'boolean' ? nextValue : !state;

const useToggle = (
  initialValue: boolean
): [boolean, (nextValue?: unknown) => void] => {
  return useReducer(toggleReducer, initialValue);
};

export default useToggle;
