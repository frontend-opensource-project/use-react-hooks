import { TaskState, TaskAction, ACTION_TYPES } from './type';

export function reducer<R>(
  state: TaskState<R>,
  action: TaskAction<R>
): TaskState<R> {
  switch (action.type) {
    case ACTION_TYPES.LOADING:
      return { ...state, isLoading: true, error: null };
    case ACTION_TYPES.SUCCESS:
      return {
        isLoading: false,
        data: action.payload,
        error: null,
      };
    case ACTION_TYPES.ERROR:
      return { ...state, isLoading: false, error: action.payload };
    case ACTION_TYPES.RESET:
      return { isLoading: false, data: null, error: null };
    default:
      throw new Error('Unhandled task action type');
  }
}
