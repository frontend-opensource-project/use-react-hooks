export type UseDelayFlagProps<T extends number> = {
  flag: boolean;
  delayTime?: PositiveInteger<T>;
};

export type UseDelayFlagReturns = boolean;

type PositiveInteger<T extends number> = `${T}` extends
  | `-${string}`
  | `${string}.${string}`
  | '0'
  ? never
  : T;
