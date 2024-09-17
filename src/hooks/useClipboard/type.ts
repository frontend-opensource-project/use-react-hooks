export interface UseClipboardProps {
  resetTime?: number;
}

export interface UseClipboardReturns {
  copied: boolean;
  copyText: (text: string) => void;
  copyImg: (path: string) => void;
}
