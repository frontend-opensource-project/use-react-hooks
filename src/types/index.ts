export type Fn = () => void;

export type ValueResolver<T> = T | ((prevPayload: T) => T);

export type GenericFn<T extends unknown[]> = (...args: T) => void;
