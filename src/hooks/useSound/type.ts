export type Fn = () => void;

export type SafeAudioAction = (audio: HTMLAudioElement) => void;

export interface UseSoundProps {
  url: string;
  onLoad?: Fn;
  onPlay?: Fn;
  onPause?: Fn;
  onEnd?: Fn;
  loop?: boolean;
  defaultVolume?: number;
  defaultPlaybackRate?: number;
}

export interface UseSoundReturns {
  error: ErrorEvent | null;
  volume: number;
  playbackRate: number;
  isLoop: boolean;
  isMuted: boolean;
  isLoading: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  duration: number;
  currentTime: number;
  play: Fn;
  pause: Fn;
  stop: Fn;
  setMute: Fn;
  setUnmute: Fn;
  setIsLoop: (loop: boolean) => void;
  setPosition: (time: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
}

export interface AudioState {
  isMuted: boolean;
  duration: number;
  currentTime: number;
  isPaused: boolean;
  isLoading: boolean;
  isPlaying: boolean;
  error: ErrorEvent | null;
  isLoop: boolean;
  volume: number;
  playbackRate: number;
}

export const ACTION_TYPES = {
  SET_DURATION: 'SET_DURATION',
  SET_CURRENT_TIME: 'SET_CURRENT_TIME',
  SET_IS_PAUSED: 'SET_IS_PAUSED',
  SET_IS_LOADING: 'SET_IS_LOADING',
  SET_IS_PLAYING: 'SET_IS_PLAYING',
  SET_ERROR: 'SET_ERROR',
  SET_IS_LOOP: 'SET_IS_LOOP',
  SET_VOLUME: 'SET_VOLUME',
  SET_PLAYBACK_RATE: 'SET_PLAYBACK_RATE',
  SET_IS_MUTED: 'SET_IS_MUTED',
} as const;

export type Action =
  | { type: typeof ACTION_TYPES.SET_DURATION; payload: number }
  | { type: typeof ACTION_TYPES.SET_CURRENT_TIME; payload: number }
  | { type: typeof ACTION_TYPES.SET_IS_PAUSED; payload: boolean }
  | { type: typeof ACTION_TYPES.SET_IS_LOADING; payload: boolean }
  | { type: typeof ACTION_TYPES.SET_IS_PLAYING; payload: boolean }
  | { type: typeof ACTION_TYPES.SET_ERROR; payload: ErrorEvent | null }
  | { type: typeof ACTION_TYPES.SET_IS_LOOP; payload: boolean }
  | { type: typeof ACTION_TYPES.SET_VOLUME; payload: number }
  | { type: typeof ACTION_TYPES.SET_PLAYBACK_RATE; payload: number }
  | { type: typeof ACTION_TYPES.SET_IS_MUTED; payload: boolean };
