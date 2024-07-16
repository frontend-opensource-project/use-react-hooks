import { useContext } from 'react';
import { ConfirmContext as context } from '../context/ConfirmContext';

const useConfirm = () => {
  const { message, resolve, setMessage, setResolve } = useContext(context);

  const isOpen = !!message;

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

  return { message, isOpen, confirm, onConfirm, onCancel };
};

export default useConfirm;
