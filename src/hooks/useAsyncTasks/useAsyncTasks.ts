import { useEffect, useRef, useReducer, useMemo, useState } from 'react';
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
 * useAsyncTasks: 비동기 작업 리스트와 옵션을 받아 상태 정보를 관리하는 훅
 *
 * @param {Task<R>[]} tasks - 비동기 작업 리스트
 *   - 실행할 비동기 작업들을 담은 배열입니다.
 * @param {Options<R>} [options={}] - 비동기 작업 옵션
 *   - 비동기 작업 실행 중 설정할 옵션. 선택적이며 기본값은 빈 객체입니다.
 *
 * @returns {StateInfo<R>} 비동기 작업 상태 정보를 반환
 *   - 작업의 로딩 상태, 데이터, 오류 정보를 포함합니다.
 *   - 추가적으로 `isError` 속성을 통해 오류 여부를 확인할 수 있고, `reset` 메서드를 통해 상태를 초기화할 수 있습니다.
 *
 * @description
 * - 비동기 작업을 관리하며, 작업의 상태 정보(로딩, 데이터, 오류)를 제공합니다.
 * - 컴포넌트 언마운트 시, 비동기 작업이 완료된 후 상태 업데이트를 방지합니다.
 * - `reset` 메서드를 호출하여 상태를 초기화할 수 있습니다.
 */
const useAsyncTasks = <R>(tasks: Task<R>[], options: Options<R>) => {
  const isMountedRef = useRef(false); // 컴포넌트가 언마운트된 후 비동기 작업이 완료될 때 상태 업데이트를 방지
  const [state, dispatch] = useReducer(reducer<R>, {
    isLoading: false,
    data: null,
    error: null,
  });
  const [resetTrigger, setResetTrigger] = useState(0); // reset 호출 시 useEffect 재실행을 위한 상태

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
  }, [resetTrigger]);

  const stateInfo: StateInfo<R> = useMemo(
    () => ({
      ...state,
      isError: Boolean(state.error),
      reset() {
        dispatch({
          type: ACTION_TYPES.RESET,
        });
        isMountedRef.current = false;
        setResetTrigger((prev) => prev + 1);
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
