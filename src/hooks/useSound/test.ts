import { renderHook, waitFor } from '@testing-library/react';
import useSound from './useSound';
import { act } from 'react';

const MOCK_URL_MP3 =
  'https://github.com/rafaelreis-hotmart/Audio-Sample-files/raw/master/sample.mp3';
const MOCK_URL_WAV =
  'https://github.com/rafaelreis-hotmart/Audio-Sample-files/raw/master/sample.wav';
const MOCK_URL_OGG =
  'https://github.com/rafaelreis-hotmart/Audio-Sample-files/raw/master/sample.ogg';
const INVALID_URL = 'https://github.com';

describe('useSound hook', () => {
  let audio: typeof Audio;

  beforeAll(() => {
    audio = global.Audio;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).Audio = jest.fn((url) => ({
      play: jest.fn(),
      pause: jest.fn(),
      addEventListener: jest.fn((event, callback) => {
        if (event === 'canplay') {
          callback();
        }
        if (event === 'error' && url === INVALID_URL) {
          callback(new Event('error'));
        }
      }),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  afterAll(() => {
    global.Audio = audio;
  });

  it('mp3 url로 Audio 객체를 초기화 해야함', async () => {
    const { result } = renderHook(() => useSound({ url: MOCK_URL_MP3 }));

    expect(global.Audio).toHaveBeenCalledWith(MOCK_URL_MP3);
    expect(result.current.isLoading).toBe(false); // loading complete
    expect(result.current.error).toBe(null);
  });

  it('wav url로 Audio 객체를 초기화 해야함', async () => {
    const { result } = renderHook(() => useSound({ url: MOCK_URL_WAV }));

    expect(global.Audio).toHaveBeenCalledWith(MOCK_URL_WAV);
    expect(result.current.isLoading).toBe(false); // loading complete
    expect(result.current.error).toBe(null);
  });

  it('ogg url로 Audio 객체를 초기화 해야함', async () => {
    const { result } = renderHook(() => useSound({ url: MOCK_URL_OGG }));

    expect(global.Audio).toHaveBeenCalledWith(MOCK_URL_OGG);
    expect(result.current.isLoading).toBe(false); // loading complete
    expect(result.current.error).toBe(null);
  });

  it('유효하지 않은 url로 Audio 객체를 초기화 시 오류가 발생해야 함', async () => {
    const { result } = renderHook(() => useSound({ url: INVALID_URL }));

    expect(global.Audio).toHaveBeenCalledWith(INVALID_URL);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).not.toBe(null);
  });

  it('play 함수 호출 시 재생되어야 함', () => {
    const { result } = renderHook(() => useSound({ url: MOCK_URL_MP3 }));
    act(() => {
      result.current.play();
    });
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.isPaused).toBe(false);
  });

  it('pause 함수 호출 시 일시 정지되어야 함', () => {
    const { result } = renderHook(() => useSound({ url: MOCK_URL_MP3 }));
    act(() => {
      result.current.play();
      result.current.pause();
    });
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.isPaused).toBe(true);
  });

  it('stop 함수 호출 시 정지되어야 함', () => {
    const { result } = renderHook(() => useSound({ url: MOCK_URL_MP3 }));
    act(() => {
      result.current.play();
      result.current.stop();
    });
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.currentTime).toBe(0);
  });

  it('loop 값 설정이 isLoop에 잘 반영되어야 함', () => {
    const { result } = renderHook(() =>
      useSound({ url: MOCK_URL_MP3, loop: true })
    );

    expect(result.current.isLoop).toBe(true);

    act(() => {
      result.current.setIsLoop(false);
    });
    expect(result.current.isLoop).toBe(false);
  });

  it('setVolum 호출 시 volume에 반영되어야 함', () => {
    const { result } = renderHook(() => useSound({ url: MOCK_URL_MP3 }));
    act(() => {
      result.current.setVolume(0.5);
    });
    expect(result.current.volume).toBe(0.5);
  });

  it('setPlaybackRate 호출 시 playbackRate에 반영되어야 함', () => {
    const { result } = renderHook(() => useSound({ url: MOCK_URL_MP3 }));
    act(() => {
      result.current.setPlaybackRate(2);
    });
    expect(result.current.playbackRate).toBe(2);
  });

  it('setPosition 호출 시 position에 반영되어야 함', () => {
    const { result } = renderHook(() => useSound({ url: MOCK_URL_MP3 }));
    act(() => {
      result.current.setPosition(15);
    });
    expect(result.current.currentTime).toBe(15);
  });

  it('setMute 호출 시 isMuted에 반영되어야 함', () => {
    const { result } = renderHook(() => useSound({ url: MOCK_URL_MP3 }));
    act(() => {
      result.current.setMute();
    });
    expect(result.current.isMuted).toBe(true);
  });

  it('setUnmute 호출 시 isMuted에 반영되어야 함', () => {
    const { result } = renderHook(() => useSound({ url: MOCK_URL_MP3 }));
    act(() => {
      result.current.setUnmute();
    });
    expect(result.current.isMuted).toBe(false);
  });

  it('onPlay 콜백이 제대로 호출되는지 확인', () => {
    const onPlay = jest.fn();
    const { result } = renderHook(() =>
      useSound({ url: MOCK_URL_MP3, onPlay })
    );

    act(() => {
      result.current.play();
    });

    waitFor(() => {
      expect(onPlay).toHaveBeenCalled();
    });
  });

  it('onPause 콜백이 제대로 호출되는지 확인', () => {
    const onPause = jest.fn();
    const { result } = renderHook(() =>
      useSound({ url: MOCK_URL_MP3, onPause })
    );

    act(() => {
      result.current.play();
      result.current.pause();
    });

    waitFor(() => {
      expect(onPause).toHaveBeenCalled();
    });
  });

  it('onEnd 콜백이 제대로 호출되는지 확인', () => {
    const onEnd = jest.fn();
    const { result } = renderHook(() => useSound({ url: MOCK_URL_MP3, onEnd }));

    act(() => {
      result.current.play();
      result.current.stop();
    });

    waitFor(() => {
      expect(onEnd).toHaveBeenCalled();
    });
  });
});
