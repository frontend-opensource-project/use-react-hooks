import { useEffect, useRef, useReducer, useMemo } from 'react';
import type { Dispatch, MutableRefObject } from 'react';
import {
  asyncWave,
  type AsyncWaveOptions,
  PromiseCircularityError,
} from 'async-wave';
import { delayExecution } from '@/utils';
import { Task, Options, StateInfo, TaskAction, ACTION_TYPES } from './type';
import { reducer } from './reducer';

/**
 * useAsyncTasks
 * @param {Task<R>[]} tasks - 비동기 작업 리스트
 * @param {Options<R>} options - 비동기 작업 옵션
 * @returns {StateInfo<R>} 비동기 작업 상태 정보를 반환
 */
const useAsyncTasks = <R>(tasks: Task<R>[], options: Options<R>) => {
  const isMountedRef = useRef(false); // 컴포넌트가 언마운트된 후 비동기 작업이 완료될 때 상태 업데이트를 방지
  const [state, dispatch] = useReducer(reducer<R>, {
    isLoading: false,
    data: null,
    error: null,
  });

  useEffect(() => {
    isMountedRef.current = true;

    (async () => {
      await asyncWave<R>(
        [...tasks],
        generateTaskHandlers(dispatch, isMountedRef, { ...options })
      );
    })();

    return () => {
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stateInfo: StateInfo<R> = useMemo(
    () => ({
      ...state,
      isError: Boolean(state.error),
      reset() {
        dispatch({
          type: ACTION_TYPES.RESET,
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
    async onBefore() {
      if (!isMountedRef.current) return;

      dispatch({ type: ACTION_TYPES.LOADING });
      options?.initialLazyDelay &&
        (await delayExecution(options.initialLazyDelay).start());
      onBefore?.();
    },
    async onSuccess(payload: R) {
      if (!isMountedRef.current) return;

      options?.successLazyDelay &&
        (await delayExecution(options.successLazyDelay).start());
      dispatch({ type: ACTION_TYPES.SUCCESS, payload });
      onSuccess?.(payload);
    },
    onError(error: PromiseCircularityError) {
      if (!isMountedRef.current) return;

      dispatch({
        type: ACTION_TYPES.ERROR,
        payload: error,
      });
      onError?.(error);
    },
    onSettled() {
      if (!isMountedRef.current) return;

      onSettled?.();
    },
  };

  return handler;
};

export default useAsyncTasks;
