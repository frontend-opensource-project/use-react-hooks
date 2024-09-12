import { TaskState, TaskAction, ActionType } from './type';

export function reducer<R>(
  state: TaskState<R>,
  action: TaskAction<R>
): TaskState<R> {
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
