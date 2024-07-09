import { useEffect, useRef, useReducer, useMemo } from 'react';
import type { Dispatch, MutableRefObject } from 'react';
import {
  asyncWave,
  type AsyncWaveOptions,
  PromiseCircularityError,
} from 'async-wave';

type Task<R> = R | ((input: R) => R | Promise<R> | void | Promise<void>);

type HookOptionProps = {
  initialLazyDelay: number;
  successLazyDelay: number;
};

type HookOptions = {
  options: Partial<HookOptionProps>;
};

type SyncOnBefore = { onBefore: () => void };

type Options<R> = Partial<
  Omit<AsyncWaveOptions<R>, 'onBefore'> & SyncOnBefore & Partial<HookOptions>
>;

type StateInfo<R> = {
  isLoading: boolean;
  data: R | null;
  error: PromiseCircularityError | null;
  isError: boolean;
  reset: () => void;
};

const [IS_UNMOUNTED, IS_MOUNTED] = [false, true];

/**
 * useAsyncTasks
 * @param {Task<R>[]} tasks - 비동기 작업 리스트
 * @param {Options<R>} options - 비동기 작업 옵션
 * @returns {StateInfo<R>} 비동기 작업 상태 정보를 반환
 */
const useAsyncTasks = <R>(tasks: Task<R>[], options: Options<R>) => {
  const isMountedRef = useRef(IS_UNMOUNTED); // 컴포넌트가 언마운트된 후 비동기 작업이 완료될 때 상태 업데이트를 방지
  const [state, dispatch] = useReducer(reducer<R>, {
    isLoading: false,
    data: null,
    error: null,
  });

  useEffect(() => {
    isMountedRef.current = IS_MOUNTED;

    (async () => {
      await asyncWave<R>(
        isMountedRef.current ? [...tasks] : [],
        generateTaskHandlers(dispatch, isMountedRef, { ...options })
      );
    })();

    return () => {
      isMountedRef.current = IS_UNMOUNTED;
    };
  }, []);

  const stateInfo: StateInfo<R> = useMemo(
    () => ({
      isLoading: state.isLoading,
      data: state.data,
      error: state.error,
      isError: Boolean(state.error),
      reset: () => {
        dispatch({
          type: ActionType.RESET,
        });
      },
    }),
    [state]
  );

  return stateInfo;
};

/**
 * generateTaskHandlers 함수
 * @param {Dispatch<TaskAction<R>>} dispatch - 상태 업데이트를 위한 디스패치 함수
 * @param {MutableRefObject<boolean>} isMountedRef - 컴포넌트 마운트 상태를 추적하는 ref
 * @param {Options<R>} options - 비동기 작업 옵션
 * @returns {Partial<AsyncWaveOptions<R>>} 비동기 작업 핸들러들
 */
const generateTaskHandlers = <R>(
  dispatch: Dispatch<TaskAction<R>>,
  isMountedRef: MutableRefObject<boolean>,
  { onBefore, onError, onSettled, onSuccess, options }: Options<R>
): Partial<AsyncWaveOptions<R>> => {
  const handler = {
    onBefore: async () => {
      if (!isMountedRef.current) return;

      dispatch({ type: ActionType.LOADING });
      options?.initialLazyDelay &&
        (await delayExecution(options.initialLazyDelay));
      onBefore && onBefore();
    },
    onSuccess: async (payload: R) => {
      if (!isMountedRef.current) return;

      options?.successLazyDelay &&
        (await delayExecution(options.successLazyDelay));
      dispatch({ type: ActionType.SUCCESS, payload });
      onSuccess && onSuccess(payload);
    },
    onError: (error: PromiseCircularityError) => {
      if (!isMountedRef.current) return;

      dispatch({
        type: ActionType.ERROR,
        payload: error,
      });
      onError && onError(error);
    },
    onSettled: () => {
      if (!isMountedRef.current) return;

      onSettled && onSettled();
    },
  };

  return handler;
};

enum ActionType {
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
  RESET = 'reset',
}

type TaskState<R> = {
  isLoading: boolean;
  data: R | null;
  error: PromiseCircularityError | null;
};

type TaskAction<R> =
  | { type: ActionType.LOADING }
  | { type: ActionType.SUCCESS; payload: R }
  | { type: ActionType.ERROR; payload: PromiseCircularityError }
  | { type: ActionType.RESET };

/**
 * reducer 함수
 * @param {TaskState<R>} state - 현재 상태
 * @param {TaskAction<R>} action - 액션 객체
 * @returns {TaskState<R>} 새로운 상태
 */
function reducer<R>(state: TaskState<R>, action: TaskAction<R>): TaskState<R> {
  switch (action.type) {
    case ActionType.LOADING:
      return { ...state, isLoading: true, error: null };
    case ActionType.SUCCESS:
      return {
        isLoading: false,
        data: action.payload,
        error: null,
      };
    case ActionType.ERROR:
      return { ...state, isLoading: false, error: action.payload };
    case ActionType.RESET:
      return { isLoading: false, data: null, error: null };
    default:
      throw new Error('Unhandled task action type');
  }
}

/**
 * delayExecution 함수
 * @param {number} ms - 지연 시간 (밀리초)
 * @returns {Promise<void>} 주어진 시간만큼 지연된 후 resolve되는 프로미스
 */
const delayExecution = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export default useAsyncTasks;
