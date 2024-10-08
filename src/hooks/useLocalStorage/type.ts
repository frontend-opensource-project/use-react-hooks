export type ValueResolver<T> = T | ((prevPayload: T) => T);
