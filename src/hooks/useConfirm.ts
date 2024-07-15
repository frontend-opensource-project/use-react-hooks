import { useContext } from 'react';
import { ConfirmContext } from '../context/ConfirmContext';

const useConfirm = () => {
  const { setMessage, setResolve } = useContext(ConfirmContext);

  const confirm = (message: string) => {
    setMessage(message);

    return new Promise<boolean>((resolve) => {
      setResolve(() => resolve);
    });
  };

  return confirm;
};

export default useConfirm;
