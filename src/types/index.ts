export type Fn = () => void;

export type GenericFn<T extends unknown[]> = (...args: T) => void;
