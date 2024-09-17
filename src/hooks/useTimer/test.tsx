import {
  renderHook,
  act,
  render,
  screen,
  fireEvent,
} from '@testing-library/react';
import { useState } from 'react';
import '@testing-library/jest-dom';

import useTimer from './useTimer';

let callback: jest.Mock;

beforeEach(() => {
  jest.useFakeTimers();
  callback = jest.fn();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.restoreAllMocks();
});

afterAll(() => {
  jest.useRealTimers();
});

const delay = 3000;

describe('useTimer hook spec', () => {
  test('start 메서드를 호출하면 타이머가 시작되고, 지정된 시간이 경과한 후 콜백이 호출되어야 한다.', async () => {
    const spySetTimeout = jest.spyOn(globalThis, 'setTimeout');
    const { result } = renderHook(() => useTimer(callback, delay));

    act(() => {
      result.current.start();
    });
    jest.advanceTimersByTime(delay);
    // 비동기 작업을 포함하는 테스트에서 모든 작업이 완료될 때까지 정확히 기다리도록 보장
    await act(async () => {});

    expect(spySetTimeout).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('cancel 메서드를 호출하면 타이머가 중단되고, 콜백이 호출되지 않아야 한다.', async () => {
    const spyClearTimeout = jest.spyOn(globalThis, 'clearTimeout');
    const { result } = renderHook(() => useTimer(callback, delay));

    act(() => {
      result.current.start();
      result.current.cancel();
    });
    await act(async () => {});

    expect(callback).toHaveBeenCalledTimes(0);
    expect(spyClearTimeout).toHaveBeenCalledTimes(1);
  });

  test('타이머가 완료된 후에는 최신 콜백만을 실행해야 한다.', async () => {
    const initialCallback = jest.fn();
    const updatedCallback = jest.fn();
    const { result, rerender } = renderHook(
      ({ callback }) => useTimer(callback, delay),
      {
        initialProps: { callback: initialCallback },
      }
    );

    rerender({ callback: updatedCallback });
    act(() => {
      result.current.start();
    });
    jest.advanceTimersByTime(delay);
    await act(async () => {});

    expect(initialCallback).not.toHaveBeenCalled();
    expect(updatedCallback).toHaveBeenCalledTimes(1);
  });

  test('언마운트할 때 타이머가 정리되어야 하며, 따라서 콜백이 호출되지 않아야 한다.', async () => {
    const spySetTimeout = jest.spyOn(globalThis, 'setTimeout');
    const spyClearTimeout = jest.spyOn(globalThis, 'clearTimeout');
    const { result, unmount } = renderHook(() => useTimer(callback, delay));

    act(() => {
      result.current.start();
    });
    unmount();
    jest.advanceTimersByTime(delay);
    await act(async () => {});

    expect(callback).not.toHaveBeenCalled();
    expect(spySetTimeout).toHaveBeenCalledTimes(1);
    expect(spyClearTimeout).toHaveBeenCalledTimes(1);
  });
});

describe('useTimer를 사용한 컴포넌트 테스트', () => {
  const TestComponent = () => {
    const [count, setCount] = useState(0);
    const { start, cancel } = useTimer(() => {
      setCount(1234);
    }, delay);

    return (
      <div>
        <p aria-label="count-display">{count}</p>
        <button onClick={start}>start</button>
        <button onClick={cancel}>cancel</button>
      </div>
    );
  };

  test('타이머가 진행된 이후 값이 반영되어야 한다.', async () => {
    const spySetTimeout = jest.spyOn(globalThis, 'setTimeout');

    render(<TestComponent />);

    fireEvent.click(screen.getByText('start'));
    jest.advanceTimersByTime(delay);
    await act(async () => {});

    expect(screen.getByLabelText('count-display')).toHaveTextContent('1234');
    expect(spySetTimeout).toHaveBeenCalledTimes(1);
  });

  test('타이머가 취소된 경우 값이 변경되지 말아야 한다.', async () => {
    const spyClearTimeout = jest.spyOn(globalThis, 'clearTimeout');

    render(<TestComponent />);

    fireEvent.click(screen.getByText('start'));
    fireEvent.click(screen.getByText('cancel'));
    jest.advanceTimersByTime(delay);
    await act(async () => {});

    expect(screen.getByLabelText('count-display')).toHaveTextContent('0');
    expect(spyClearTimeout).toHaveBeenCalledTimes(1);
  });
});
