import { useContext } from 'react';
import { ConfirmContext as context } from '../context/ConfirmContext';

const useConfirm = () => {
  const { setMessage, setResolve } = useContext(context);

  const confirm = (message: string) => {
    setMessage(message);

    return new Promise<boolean>((resolve) => {
      setResolve(() => resolve);
    });
  };

  return confirm;
};

export default useConfirm;
