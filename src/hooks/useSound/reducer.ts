import { AudioState, Action, ACTION_TYPES } from './type';

export const reducer = (state: AudioState, action: Action): AudioState => {
  switch (action.type) {
    case ACTION_TYPES.SET_DURATION:
      return { ...state, duration: action.payload };
    case ACTION_TYPES.SET_CURRENT_TIME:
      return { ...state, currentTime: action.payload };
    case ACTION_TYPES.SET_IS_PAUSED:
      return { ...state, isPaused: action.payload };
    case ACTION_TYPES.SET_IS_LOADING:
      return { ...state, isLoading: action.payload };
    case ACTION_TYPES.SET_IS_PLAYING:
      return { ...state, isPlaying: action.payload };
    case ACTION_TYPES.SET_ERROR:
      return { ...state, error: action.payload };
    case ACTION_TYPES.SET_IS_LOOP:
      return { ...state, isLoop: action.payload };
    case ACTION_TYPES.SET_VOLUME:
      return { ...state, volume: action.payload };
    case ACTION_TYPES.SET_PLAYBACK_RATE:
      return { ...state, playbackRate: action.payload };
    case ACTION_TYPES.SET_IS_MUTED:
      return { ...state, isMuted: action.payload };
    default:
      return state;
  }
};
