export type Fn = () => void;

export interface UseOnlineStatusProps {
  onlineCallback?: Fn;
  offlineCallback?: Fn;
}

export interface UseOnlineStatusReturns {
  isOnline: boolean;
}
