export type PositiveInteger<T extends number> = `${T}` extends
  | `-${string}`
  | `${string}.${string}`
  | '0'
  ? never
  : T;
