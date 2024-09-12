import { cleanup, fireEvent, render, renderHook } from '@testing-library/react';
import useEventListener from './useEventListener';
import { act, useRef } from 'react';
import * as utils from '@/utils';

describe('useEventListener', () => {
  let handler: jest.Mock;

  beforeEach(() => {
    handler = jest.fn();
  });

  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
  });

  const TestComponent = () => {
    const ref = useRef<HTMLDivElement>(null);
    useEventListener('click', handler, ref);
    return <div ref={ref} data-testid="test-element"></div>;
  };

  test('이벤트 리스너가 document에 등록되고, 이벤트 발생 시 핸들러가 호출된다.', () => {
    renderHook(() => useEventListener('click', handler, document));

    act(() => {
      fireEvent.click(document);
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('이벤트 리스너가 HTMLElement에 등록되고, 이벤트 발생 시 핸들러가 호출된다.', () => {
    const htmlElement = document.createElement('div');

    document.body.appendChild(htmlElement);

    renderHook(() => useEventListener('click', handler, htmlElement));

    act(() => {
      fireEvent.click(htmlElement);
    });

    expect(handler).toHaveBeenCalledTimes(1);
    document.body.removeChild(htmlElement);
  });

  test('이벤트 리스너가 SVGElement에 등록되고, 이벤트 발생 시 핸들러가 호출된다.', () => {
    const svgElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svgElement'
    );

    document.body.appendChild(svgElement);

    renderHook(() => useEventListener('click', handler, svgElement));

    act(() => {
      fireEvent.click(svgElement);
    });

    expect(handler).toHaveBeenCalledTimes(1);
    document.body.removeChild(svgElement);
  });

  test('element가 null일때, window에 이벤트 리스너가 등록되어 이벤트 발생 시 핸들러가 호출된다.', () => {
    renderHook(() => useEventListener('click', handler));

    act(() => {
      fireEvent.click(window);
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('element가 RefObject일때, 이벤트 리스너가 등록되어 이벤트 발생 시 핸들러가 호출된다.', () => {
    const { getByTestId } = render(<TestComponent />);

    const element = getByTestId('test-element');

    act(() => {
      fireEvent.click(element);
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('컴포넌트 언마운트 시 이벤트 리스너가 해제된다.', () => {
    const { getByTestId, unmount } = render(<TestComponent />);

    const element = getByTestId('test-element');

    act(() => {
      fireEvent.click(element);
    });

    expect(handler).toHaveBeenCalledTimes(1);

    unmount();

    act(() => {
      fireEvent.click(element);
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('isClient가 false일 때, 이벤트 리스너가 등록되지 않는다.', () => {
    jest.spyOn(utils, 'isClient', 'get').mockReturnValue(false);
    expect(utils.isClient).toBe(false);

    renderHook(() => useEventListener('click', handler));

    act(() => {
      fireEvent.click(window);
    });

    expect(handler).not.toHaveBeenCalled();
  });
});
