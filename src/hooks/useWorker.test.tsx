/* eslint-disable @typescript-eslint/no-explicit-any */
import { act, renderHook } from '@testing-library/react';

import useWorker from './useWorker';
import {
  mockPostMessage,
  mockTerminate,
  mockWorkerScript,
} from '../mocks/mockWorker';

beforeEach(() => {
  globalThis.URL.createObjectURL = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('useWorker', () => {
  test('초기 상태에서 result는 undefined 상태어야 한다.', () => {
    const { result } = renderHook(() => useWorker(mockWorkerScript));

    expect(result.current.result).toBeUndefined();
  });

  test('start 메서드가 호출되었을 때 postMessage 메시지가 올바르게 생성되고 메시지가 전송되어야 한다.', () => {
    const { result } = renderHook(() => useWorker(mockWorkerScript));

    act(() => {
      result.current.start('test argument', [1, 2, 3]);
    });

    expect(mockPostMessage).toHaveBeenCalledWith(['test argument', [1, 2, 3]]);
  });

  test('작업 결과를 올바르게 처리해야 한다.', () => {
    const { result } = renderHook(() => useWorker(mockWorkerScript));

    act(() => {
      result.current.start('test argument');
    });

    expect(mockWorkerScript).toHaveBeenCalled();
    expect(result.current.result).toBe('test argument');
  });

  test('cancel 메서드가 호출되었을 때 웹 워커가 올바르게 종료되어야 한다.', () => {
    const { result } = renderHook(() => useWorker(mockWorkerScript));

    act(() => {
      result.current.start('test argument');
    });

    act(() => {
      result.current.cancel();
    });

    expect(mockTerminate).toHaveBeenCalled();
  });

  test('컴포넌트가 언마운트될 때 웹 워커가 올바르게 종료되어야 한다.', () => {
    const { result, unmount } = renderHook(() => useWorker(mockWorkerScript));

    act(() => {
      result.current.start('test argument');
    });

    unmount();

    expect(mockTerminate).toHaveBeenCalled();
  });

  test('워커 스크립트 동작 중에 문제가 발생한다면 오류정보를 담은 값을 로그로 메시지를 발신해야 한다.', () => {
    const spyLog = jest.spyOn(console, 'error');
    const { result } = renderHook(() => useWorker(mockWorkerScript));

    act(() => {
      try {
        result.current.start({ error: 'worker error' });
      } catch (error) {
        expect(mockTerminate).toHaveBeenCalled();
        expect(result.current.result).toStrictEqual({ error: 'worker error' });
        expect(spyLog).toHaveBeenCalledWith('worker error');
      }
    });
  });

  test('useWorker가 전달되는 첫번째 인수가 함수가 아니면 예외를 발생해야 한다.', () => {
    const { result } = renderHook(() => useWorker(30 as any));

    act(() => {
      try {
        result.current.start('test argument');
      } catch (error) {
        console.log(error);
        expect(error instanceof Error ? error.message : '').toBe(
          'Invalid workerScript: Expected a function but received a different type.'
        );
      }
    });
  });

  describe('worker script 변환 예외 테스트', () => {
    const originalBlob = globalThis.Blob;
    const originalCreateObjectURL = globalThis.URL.createObjectURL;

    afterEach(() => {
      globalThis.Blob = originalBlob;
      globalThis.URL.createObjectURL = originalCreateObjectURL;
    });

    const runWorkerErrorTest = (
      envSetter: () => void,
      expectedMessage: string,
      testName: string
    ) => {
      test(testName, () => {
        envSetter(); // 주어진 환경을 설정

        const { result } = renderHook(() => useWorker(mockWorkerScript));

        act(() => {
          try {
            result.current.start('test argument');
          } catch (error) {
            expect(error instanceof Error ? error.message : '').toBe(
              expectedMessage
            );
            expect(error instanceof Error ? error.name : '').toBe(
              'WebWorkerError'
            );
          }
        });
      });
    };

    // Blob 생성 중 예외 발생 테스트
    runWorkerErrorTest(
      () => {
        globalThis.Blob = jest.fn(() => {
          throw new Error('Blob 생성 실패');
        }) as unknown as typeof Blob;
      },
      'Failed to create workerBlob: Blob 생성 실패',
      'Blob 생성 중 예외 발생 시 WebWorkerError를 발생시켜야 한다.'
    );

    // 전달되는 인자가 함수가 아닌 예외 발생 테스트
    runWorkerErrorTest(
      () => {
        globalThis.URL.createObjectURL = jest.fn(() => {
          throw new Error('createObjectURL 실패');
        });
      },
      'Failed to create workerBlob: createObjectURL 실패',
      'URL.createObjectURL 호출 중 예외 발생 시 WebWorkerError를 발생시켜야 한다.'
    );
  });

  describe('web Worker 환경 테스트', () => {
    const originalWindow = globalThis.window;
    const originalWorker = globalThis.Worker;
    const originalBlob = globalThis.Blob;

    afterEach(() => {
      // 각 테스트 후 원래 환경으로 복원
      globalThis.window = originalWindow;
      globalThis.Worker = originalWorker;
      globalThis.Blob = originalBlob;
    });

    const runWorkerSupportTest = (envSetter: () => void, envName: string) => {
      test(`웹 워커를 지원하지 않는 환경에서는 예외를 발생해야 한다. [${envName}]`, () => {
        envSetter(); // 주어진 환경을 설정

        const { result } = renderHook(() => useWorker(mockWorkerScript));

        act(() => {
          try {
            result.current.start('test argument');
          } catch (error) {
            expect(error instanceof Error ? error.message : '').toBe(
              "Your browser doesn't support web workers."
            );
            expect(error instanceof Error ? error.name : '').toBe(
              'WebWorkerError'
            );
          }
        });
      });
    };

    // 각 환경에 대해 테스트를 실행
    runWorkerSupportTest(() => {
      (globalThis.window as unknown) = undefined;
    }, 'node 환경');

    runWorkerSupportTest(() => {
      (globalThis.Worker as unknown) = undefined;
    }, 'Worker API 없음');

    runWorkerSupportTest(() => {
      (globalThis.Blob as unknown) = undefined;
    }, 'Blob 없음');
  });
});
