import type { AsyncWaveOptions, PromiseCircularityError } from 'async-wave';

export type Task<R> = R | ((input: R) => R | Promise<R> | void | Promise<void>);

export type HookOptionProps = {
  initialLazyDelay: number;
  successLazyDelay: number;
};

export type HookOptions = {
  options: Partial<HookOptionProps>;
};

export type SyncOnBefore = { onBefore: () => void };

export type Options<R> = Partial<
  Omit<AsyncWaveOptions<R>, 'onBefore'> & SyncOnBefore & Partial<HookOptions>
>;

export type StateInfo<R> = {
  isLoading: boolean;
  data: R | null;
  error: PromiseCircularityError | null;
  isError: boolean;
  reset: () => void;
};

export const ACTION_TYPES = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  RESET: 'reset',
} as const;

export interface TaskState<R> {
  isLoading: boolean;
  data: R | null;
  error: PromiseCircularityError | null;
  resetTrigger: number;
}

export type TaskAction<R> =
  | { type: typeof ACTION_TYPES.LOADING }
  | { type: typeof ACTION_TYPES.SUCCESS; payload: R }
  | { type: typeof ACTION_TYPES.ERROR; payload: PromiseCircularityError }
  | { type: typeof ACTION_TYPES.RESET };
