import { useEffect } from 'react';

const useMount = (callback: () => void) => {
  useEffect(() => {
    callback();
  }, []);
};

export default useMount;
