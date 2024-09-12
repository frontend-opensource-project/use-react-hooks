import { useEffect, useState, useRef, useReducer } from 'react';

// 타입 정의
type Fn = () => void;
type SafeAudioAction = (audio: HTMLAudioElement) => void;

interface useSoundProps {
  url: string;
  onLoad?: Fn;
  onPlay?: Fn;
  onPause?: Fn;
  onEnd?: Fn;
  loop?: boolean;
  defaultVolume?: number;
  defaultPlaybackRate?: number;
}

interface UseSoundReturnType {
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

// 오디오 객체 설정 함수
const setupAudioElement = (audio: HTMLAudioElement, state: AudioState) => {
  audio.volume = state.volume;
  audio.playbackRate = state.playbackRate;
  audio.loop = state.isLoop;
  audio.muted = state.isMuted;
};

// 오디오 객체 이벤트 핸들러 설정 함수
const setupEventHandlers = (
  audio: HTMLAudioElement,
  isLoop: boolean,
  dispatch: React.Dispatch<Action>,
  onLoad?: Fn,
  onPlay?: Fn,
  onPause?: Fn,
  onEnd?: Fn
) => {
  const handlePause = () => onPause?.();

  const handlePlay = () => onPlay?.();

  const handleError = (e: ErrorEvent) => {
    dispatch({ type: 'SET_ERROR', payload: e });
  };

  const handleCanPlay = () => {
    dispatch({ type: 'SET_IS_LOADING', payload: false });
    dispatch({ type: 'SET_DURATION', payload: audio.duration });
    onLoad?.();
  };

  const handleTimeUpdate = () => {
    dispatch({ type: 'SET_CURRENT_TIME', payload: audio.currentTime });
  };

  const handleEnd = () => {
    dispatch({ type: 'SET_IS_PLAYING', payload: false });
    if (isLoop) {
      audio.currentTime = 0;
      audio.play();
    }
    onEnd?.();
  };

  audio.addEventListener('play', handlePlay);
  audio.addEventListener('pause', handlePause);
  audio.addEventListener('ended', handleEnd);
  audio.addEventListener('error', handleError);
  audio.addEventListener('canplay', handleCanPlay);
  audio.addEventListener('timeupdate', handleTimeUpdate);

  return () => {
    audio.removeEventListener('play', handlePlay);
    audio.removeEventListener('pause', handlePause);
    audio.removeEventListener('ended', handleEnd);
    audio.removeEventListener('error', handleError);
    audio.removeEventListener('canplay', handleCanPlay);
    audio.removeEventListener('timeupdate', handleTimeUpdate);
  };
};

/**
 * @typedef {Object} UseSoundReturnType
 * @property {ErrorEvent | null} error - 오디오 로드 중 발생한 오류
 * @property {number} volume - 현재 볼륨 (0.0 ~ 1.0)
 * @property {number} playbackRate - 현재 재생 속도 (0.5 ~ 4.0)
 * @property {boolean} isLoop - 반복 재생 여부
 * @property {boolean} isMuted - 음소거 여부
 * @property {boolean} isLoading - 오디오가 로드 중인지 여부
 * @property {boolean} isPlaying - 오디오가 재생 중인지 여부
 * @property {boolean} isPaused - 오디오가 일시 정지되었는지 여부
 * @property {number} duration - 오디오의 전체 길이 (단위 : 초)
 * @property {number} currentTime - 오디오의 현재 재생 위치 (단위 : 초)
 * @property {Fn} play - 오디오 재생 함수
 * @property {Fn} pause - 오디오 일시 정지 함수
 * @property {Fn} stop - 오디오 정지 함수
 * @property {Fn} setMute - 음소거 설정 함수
 * @property {Fn} setUnmute - 음소거 해제 함수
 * @property {(loop: boolean) => void} setIsLoop - 반복 재생 설정 함수
 * @property {(time: number) => void} setPosition - 재생 위치 설정 함수
 * @property {(volume: number) => void} setVolume - 볼륨 설정 함수
 * @property {(rate: number) => void} setPlaybackRate - 재생 속도 설정 함수
 */

/**
 * 오디오 재생을 관리하는 커스텀 훅
 *
 * @param {Object} props
 * @param {string} props.url - 오디오 URL
 * @param {boolean} [props.loop=false] - 반복 재생 여부
 * @param {number} [props.defaultVolume=1] - 초기 볼륨. 범위: 0.0 ~ 1.0
 * @param {number} [props.defaultPlaybackRate=1] - 초기 재생 속도 범위: 0.5 ~ 4.0
 * @param {Fn} [props.onLoad] - 오디오 로드 시 호출할 콜백 함수
 * @param {Fn} [props.onPlay] - 오디오 재생 시 호출할 콜백 함수
 * @param {Fn} [props.onPause] - 오디오 정지 시 호출할 콜백 함수
 * @param {Fn} [props.onEnd] - 오디오 완료 시 호출되는 콜백 함수
 * @returns {UseSoundReturnType}
 */
function useSound({
  url,
  loop = false,
  defaultVolume = 1,
  defaultPlaybackRate = 1,
  onLoad,
  onPlay,
  onPause,
  onEnd,
}: useSoundProps): UseSoundReturnType {
  const [volume] = useState(() =>
    setValidRange(0, 1, defaultVolume, 'defaultVolume')
  );
  const [playbackRate] = useState(() =>
    setValidRange(0.5, 4, defaultPlaybackRate, 'defaultPlaybackRate')
  );
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    isLoop: loop || false,
    volume,
    playbackRate,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const safeAudioHelper = (action: SafeAudioAction) => {
    if (audioRef.current) {
      action(audioRef.current);
    }
  };

  const cleanUpAudioRef = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  useEffect(() => {
    audioRef.current = new Audio(url);

    return () => {
      cleanUpAudioRef();
    };
  }, [url]);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    const cleanup = setupEventHandlers(
      audioRef.current,
      state.isLoop,
      dispatch,
      onLoad,
      onPlay,
      onPause,
      onEnd
    );

    return () => {
      cleanup();
      cleanUpAudioRef();
    };
  }, [onLoad, onPlay, onPause, onEnd, state.isLoop]);

  useEffect(() => {
    safeAudioHelper((audioRef) => {
      setupAudioElement(audioRef, state);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.volume, state.playbackRate, state.isLoop, state.isMuted]);

  const play = () =>
    safeAudioHelper((audioRef) => {
      dispatch({ type: ACTION_TYPES.SET_IS_PLAYING, payload: true });
      dispatch({ type: ACTION_TYPES.SET_IS_PAUSED, payload: false });
      audioRef.play();
    });

  const pause = () =>
    safeAudioHelper((audioRef) => {
      dispatch({ type: ACTION_TYPES.SET_IS_PAUSED, payload: true });
      audioRef.pause();
    });

  const stop = () =>
    safeAudioHelper((audioRef) => {
      dispatch({ type: ACTION_TYPES.SET_IS_PLAYING, payload: false });
      dispatch({ type: ACTION_TYPES.SET_IS_PAUSED, payload: false });
      dispatch({ type: ACTION_TYPES.SET_CURRENT_TIME, payload: 0 });
      audioRef.pause();
    });

  const setPosition = (time: number) => {
    safeAudioHelper((audioRef) => {
      dispatch({ type: ACTION_TYPES.SET_CURRENT_TIME, payload: time });
      audioRef.currentTime = time;
    });
  };

  const setMute = () => {
    dispatch({ type: ACTION_TYPES.SET_IS_MUTED, payload: true });
  };

  const setUnmute = () => {
    dispatch({ type: ACTION_TYPES.SET_IS_MUTED, payload: false });
  };

  return {
    ...state,
    play,
    pause,
    stop,
    setMute,
    setUnmute,
    setPosition,
    setIsLoop(isLoop) {
      dispatch({ type: ACTION_TYPES.SET_IS_LOOP, payload: isLoop });
    },
    setVolume(volume) {
      dispatch({
        type: ACTION_TYPES.SET_VOLUME,
        payload: setValidRange(0, 1, volume, 'volume'),
      });
    },
    setPlaybackRate(rate) {
      dispatch({
        type: ACTION_TYPES.SET_PLAYBACK_RATE,
        payload: setValidRange(0.5, 4, rate, 'playbackRate'),
      });
    },
  };
}

export default useSound;

// 타입 및 초기값 정의
interface AudioState {
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

const ACTION_TYPES = {
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

type Action =
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

const initialState: AudioState = {
  isMuted: false,
  duration: 0,
  currentTime: 0,
  isPaused: false,
  isLoading: true,
  isPlaying: false,
  error: null,
  isLoop: false,
  volume: 1,
  playbackRate: 1,
};

// 리듀서 함수
const reducer = (state: AudioState, action: Action): AudioState => {
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

// 범위 체크 함수 (유효하지 않은 범위는 조정)
const setValidRange = (
  start: number,
  end: number,
  currentValue: number,
  valueName?: string
) => {
  if (currentValue < start || currentValue > end) {
    const adjusted = Math.min(Math.max(currentValue, start), end);
    console.warn(
      `${valueName ? `${valueName} 값` : ''} ${currentValue}이 허용 범위(${start} ~ ${end})를 벗어나 ${adjusted}로 조정되었습니다`
    );
    return adjusted;
  }

  return currentValue;
};
