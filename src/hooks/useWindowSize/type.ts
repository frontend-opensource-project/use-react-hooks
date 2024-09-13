export type PositiveInteger<T extends number> = `${T}` extends
  | `-${string}`
  | `${string}.${string}`
  | '0'
  ? never
  : T;

export interface UseWindowSizeReturns {
  width: number | null;
  height: number | null;
}
