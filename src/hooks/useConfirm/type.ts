export interface UseConfirmReturns {
  message?: string;
  isOpen: boolean;
  confirm: (message: string) => Promise<boolean>;
  onConfirm: () => void;
  onCancel: () => void;
}
