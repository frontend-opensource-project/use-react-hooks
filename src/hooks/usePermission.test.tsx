import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react';
import usePermission from './usePermission';
import React, { useState } from 'react';
import '@testing-library/jest-dom';

let originalNavigator: typeof window.navigator;

beforeEach(() => {
  originalNavigator = global.navigator;
  Object.assign(navigator, {
    permissions: {
      query: jest.fn().mockResolvedValue({
        state: 'prompt',
        onchange: null,
      }),
    },
    geolocation: {
      getCurrentPosition: (
        fn: (arg: { coords: { latitude: number; longitude: number } }) => void
      ) => {
        fn({
          coords: {
            latitude: 11111111,
            longitude: 22222222,
          },
        });
      },
    },
  });
});

afterEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global.navigator.permissions as any) = originalNavigator;
  jest.clearAllMocks();
});

describe('usePermission hook spec', () => {
  test('훅 초기 상태는 "prompt" 상태이어야 한다.', async () => {
    const { result } = renderHook(() =>
      usePermission({ permission: 'geolocation' })
    );

    await act(async () => {
      expect(result.current.status).toBe('prompt');
    });
  });

  test('Permissions API가 지원되지 않는 경우 “notSupported”를 반환해야 한다.', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.navigator.permissions as any) = undefined;

    const { result } = renderHook(() =>
      usePermission({ permission: 'geolocation' })
    );

    await act(async () => {
      expect(result.current.status).toBe('notSupported');
    });
  });

  test('권한 상태에 따라 상태를 업데이트해야 한다.', async () => {
    Object.assign(navigator, {
      permissions: {
        query: jest.fn().mockResolvedValue({
          state: 'granted',
          onchange: null,
        }),
      },
    });
    const setStatusSpy = jest.spyOn(React, 'useState');

    const { result } = renderHook(() =>
      usePermission({ permission: 'geolocation' })
    );

    await act(async () => {});

    const permissionsQuery = await navigator.permissions.query({
      name: 'geolocation',
    });

    expect(typeof permissionsQuery.onchange).toBe('function');
    expect(result.current.status).toBe('granted');
    expect(setStatusSpy).toHaveBeenCalledTimes(2);
  });

  test('인수로 전달된 권한이름이 존재하지 않는다면 "notSupported" 상태를 반환해야 한다.', async () => {
    Object.assign(navigator, {
      permissions: {
        query: jest.fn().mockRejectedValue(undefined),
      },
    });

    const { result } = renderHook(() =>
      usePermission({ permission: 'geolocation' })
    );

    await act(async () => {});

    expect(result.current.status).toBe('notSupported');
  });
});

describe('usePermission를 사용한 컴포넌트 테스트', () => {
  const TestComponent = () => {
    const { status } = usePermission({ permission: 'geolocation' });
    const [location, setLocation] = useState<{
      latitude: number;
      longitude: number;
    } | null>(null);

    const handleGetLocation = () => {
      if (status === 'prompt' || status === 'granted') {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            console.error('위치 정보를 가져오는데 실패했습니다.', error);
          }
        );
      }
    };

    return (
      <div>
        <h2 aria-label="permission-display">위치 정보 권한 상태: {status}</h2>
        <button onClick={handleGetLocation}>위치 정보 가져오기</button>
        {location && (
          <div>
            <p aria-label="latitude-display">위도: {location.latitude}</p>
            <p aria-label="longitude-display">경도: {location.longitude}</p>
          </div>
        )}
        {status === 'prompt' && (
          <p aria-label="loading-display">
            위치 정보 접근 권한을 요청 중입니다...
          </p>
        )}
        {status === 'denied' && (
          <p aria-label="error-display">
            위치 정보 접근 권한이 거부되었습니다. 설정에서 권한을 허용해 주세요.
          </p>
        )}
        {status === 'notSupported' && (
          <p aria-label="notSupported-display">
            이 브라우저는 위치 정보 접근 권한을 지원하지 않습니다.
          </p>
        )}
      </div>
    );
  };

  describe('전달된 권한에 대한 상태에 따라 상태를 변화시켜야 한다.', () => {
    test('prompt', async () => {
      render(<TestComponent />);

      expect(screen.getByLabelText('loading-display')).toHaveTextContent(
        '위치 정보 접근 권한을 요청 중입니다...'
      );

      await act(async () => {});

      expect(screen.getByLabelText('permission-display')).toHaveTextContent(
        '위치 정보 권한 상태: prompt'
      );

      fireEvent.click(screen.getByText('위치 정보 가져오기'));

      expect(
        await screen.findByLabelText('latitude-display')
      ).toHaveTextContent('위도: 11111111');
      expect(
        await screen.findByLabelText('longitude-display')
      ).toHaveTextContent('경도: 22222222');
    });

    test('denied', async () => {
      Object.assign(navigator, {
        permissions: {
          query: jest.fn().mockResolvedValue({
            state: 'denied',
            onchange: null,
          }),
        },
      });

      render(<TestComponent />);

      await act(async () => {});

      expect(screen.getByLabelText('permission-display')).toHaveTextContent(
        '위치 정보 권한 상태: denied'
      );

      fireEvent.click(screen.getByText('위치 정보 가져오기'));

      expect(await screen.findByLabelText('error-display')).toHaveTextContent(
        '위치 정보 접근 권한이 거부되었습니다. 설정에서 권한을 허용해 주세요.'
      );
    });

    test('notSupported', async () => {
      Object.assign(navigator, {
        permissions: undefined,
      });

      render(<TestComponent />);

      await act(async () => {});

      expect(screen.getByLabelText('permission-display')).toHaveTextContent(
        '위치 정보 권한 상태: notSupported'
      );

      fireEvent.click(screen.getByText('위치 정보 가져오기'));

      expect(
        await screen.findByLabelText('notSupported-display')
      ).toHaveTextContent(
        '이 브라우저는 위치 정보 접근 권한을 지원하지 않습니다.'
      );
    });
  });
});
