export type Fn = () => void;

export interface useOnlineStatusProps {
  onlineCallback?: Fn;
  offlineCallback?: Fn;
}

export interface UseOnlineStatusReturns {
  isOnline: boolean;
}
