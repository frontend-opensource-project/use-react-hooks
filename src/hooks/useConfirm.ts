import { useContext } from 'react';
import { ConfirmContext as context } from '../context/ConfirmContext';

/**
 * 컨펌 다이얼로그를 구현할 때 사용하는 훅.
 *
 * @returns {string} message: 컨펌 메시지. confirm() 함수에 전달된 값을 그대로 반환.
 * @returns {boolean} isOpen: 컨펌 다이얼로그 open/close 상태를 제어할 수 있는 값. confirm() 함수 실행 단계에서 업데이트된 message 값을 체크하여 상태를 결정.
 * @returns {function} confirm: 컨펌 로직을 실행하는 비동기 함수. 컨펌 다이얼로그를 열고 사용자의 컨펌 여부를 반환.
 * @returns {function} onConfirm: 컨펌 다이얼로그를 컨펌하는 함수.
 * @returns {function} onCancel: 컨펌 다이얼로그를 취소하는 함수.
 *
 * @description
 * - 이 훅은 브라우저의 confirm() 메서드와 동일하게 작동합니다.
 * - 훅에서 파생된 상태를 활용해 컨펌 다이얼로그 컨텍스트를 관리할 수 있습니다.
 */
const useConfirm = () => {
  const { message, resolve, setMessage, setResolve } = useContext(context);

  const confirm = (message: string) => {
    setMessage(message);
    return new Promise<boolean>((resolve) => {
      setResolve(() => resolve);
    });
  };

  const onConfirm = () => {
    resolve?.(true);
    setMessage('');
  };

  const onCancel = () => {
    resolve?.(false);
    setMessage('');
  };

  return { message, isOpen: !!message, confirm, onConfirm, onCancel };
};

export default useConfirm;
