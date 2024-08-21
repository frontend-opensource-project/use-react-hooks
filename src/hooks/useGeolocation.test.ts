import { renderHook, waitFor } from '@testing-library/react';
import useGeolocation from './useGeolocation';

const mockOptions = {
  enableHighAccuracy: false,
  timeout: 5000,
  maximumAge: 0,
};

const mockError: GeolocationPositionError = {
  code: 1,
  message: '사용자가 위치 정보를 거부했습니다.',
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3,
};

beforeEach(() => {
  const mockGeolocation = {
    watchPosition: jest.fn().mockImplementation((success) => {
      success({
        coords: {
          latitude: 35,
          longitude: 139,
          altitude: 0,
          accuracy: 100,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      });
      return 1;
    }),
    clearWatch: jest.fn(),
  };

  Object.defineProperty(global.navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true,
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('useGeolocation hook', () => {
  it('성공 후 위치 정보를 반환해야 함', async () => {
    const { result } = renderHook(() => useGeolocation(mockOptions));

    waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.latitude).toBe(35);
      expect(result.current.longitude).toBe(139);
    });
  });

  it('오류를 처리해야 한다', async () => {
    global.navigator.geolocation.watchPosition = jest.fn((_, errorCallback) => {
      if (errorCallback) {
        errorCallback(mockError);
      }
      return 1;
    });

    const { result } = renderHook(() =>
      useGeolocation({
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0,
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).not.toBe(null);
      expect(result.current.latitude).toBeUndefined();
      expect(result.current.longitude).toBeUndefined();
    });
  });
});
