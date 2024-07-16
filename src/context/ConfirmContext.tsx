import { createContext, useState } from 'react';

interface ConfirmContext {
  message?: string;
  resolve?: (value: boolean) => void;
  setMessage: (message: string) => void;
  setResolve: (resolve: (value: boolean) => void) => void;
}

export const ConfirmContext = createContext<ConfirmContext>({
  message: '',
  resolve() {},
  setMessage() {},
  setResolve() {},
});

export const ConfirmProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [message, setMessage] = useState<string>();
  const [resolve, setResolve] = useState<(value: boolean) => void>();

  return (
    <ConfirmContext.Provider
      value={{ message, resolve, setMessage, setResolve }}>
      {children}
    </ConfirmContext.Provider>
  );
};
