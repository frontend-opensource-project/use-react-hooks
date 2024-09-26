export type WorkerScript<A, R, C> = (arg: A, accessClosure?: C) => R;
