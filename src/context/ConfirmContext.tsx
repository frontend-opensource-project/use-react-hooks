import { createContext, useState } from 'react';

interface ConfirmContext {
  setMessage: (message: string) => void;
  setResolve: (resolve: (value: boolean) => void) => void;
}

export const ConfirmContext = createContext<ConfirmContext>({
  setMessage() {},
  setResolve() {},
});

export const ConfirmProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [message, setMessage] = useState<string>('');
  const [resolve, setResolve] = useState<(value: boolean) => void>();

  const onConfirm = () => {
    resolve?.(true);
  };

  const onCancel = () => {
    resolve?.(false);
  };

  return (
    <ConfirmContext.Provider value={{ setMessage, setResolve }}>
      <>
        {children}
        <div className="dialog">
          <div className="dialog-content">{message}</div>
          <div className="dialog-actions">
            <button onClick={onCancel}>아니오</button>
            <button onClick={onConfirm}>예</button>
          </div>
        </div>
      </>
    </ConfirmContext.Provider>
  );
};
