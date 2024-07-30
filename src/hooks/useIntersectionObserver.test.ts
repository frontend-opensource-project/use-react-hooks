import { renderHook, act } from '@testing-library/react';
import useIntersectionObserver from './useIntersectionObserver';
import {
  MockIntersectionObserver,
  mockIntersectionObserver,
} from './mockIntersectionObserver';

describe('useIntersectionObserver', () => {
  let rootElement: Element;
  let targetElement: Element;
  let mockObserverInstance: MockIntersectionObserver;
  let mockObserverConstructor: jest.Mock;

  beforeEach(() => {
    rootElement = document.createElement('div');
    targetElement = document.createElement('div');
    document.body.appendChild(rootElement);
    rootElement.appendChild(targetElement);

    [mockObserverInstance, mockObserverConstructor] =
      mockIntersectionObserver();
  });

  afterEach(() => {
    window.IntersectionObserver = IntersectionObserver;
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  const getCallback = () => mockObserverConstructor.mock.calls[0][0];

  test('Basic : Element가 viewport에 들어왔을 때 isView를 true로 반환한다', () => {
    const { result } = renderHook(() => useIntersectionObserver());

    act(() => {
      result.current.intersectionRef(targetElement);
    });

    expect(mockObserverInstance.observe).toHaveBeenCalledWith(targetElement);

    act(() => {
      const callback = getCallback();
      callback([{ isIntersecting: true }]);
    });

    expect(result.current.isView).toBe(true);
  });

  test('Basic : Element가 viewport에 들어오지 않았을 때 isView를 false로 반환한다', () => {
    const { result } = renderHook(() => useIntersectionObserver());

    act(() => {
      result.current.intersectionRef(targetElement);
    });

    act(() => {
      const callback = getCallback();
      callback([{ isIntersecting: false }]);
    });

    expect(result.current.isView).toBe(false);
  });

  test('Basic : disconnect 메서드가 useEffect의 클린업 함수에서 호출된다', () => {
    const { result, unmount } = renderHook(() => useIntersectionObserver());

    act(() => {
      result.current.intersectionRef(targetElement);
    });

    act(() => {
      unmount();
    });

    expect(mockObserverInstance.disconnect).toHaveBeenCalled();
  });

  test('Option : threshold가 0.5일 때, Element가 50% 노출되면 isView를 true로 반환한다', () => {
    const { result } = renderHook(() =>
      useIntersectionObserver({ threshold: 0.5 })
    );

    act(() => {
      result.current.intersectionRef(targetElement);
    });

    act(() => {
      const callback = getCallback();
      callback([{ isIntersecting: true, intersectionRatio: 0.5 }]);
    });

    expect(result.current.isView).toBe(true);
  });

  test('Option : threshold가 0.5일 때, Element가 30%만 노출되면 isView를 false로 반환한다', () => {
    const { result } = renderHook(() =>
      useIntersectionObserver({ threshold: 0.5 })
    );
    act(() => {
      result.current.intersectionRef(targetElement);
    });

    act(() => {
      const callback = getCallback();
      callback([{ isIntersecting: false, intersectionRatio: 0.3 }]);
    });

    expect(result.current.isView).toBe(false);
  });

  test('Option : root가 null일 때, Element가 viewport에 들어오면 isView를 true로 반환한다', () => {
    const { result } = renderHook(() =>
      useIntersectionObserver({ root: null })
    );

    act(() => {
      result.current.intersectionRef(targetElement);
    });

    act(() => {
      const callback = getCallback();
      callback([{ isIntersecting: true }]);
    });

    expect(result.current.isView).toBe(true);
  });

  test('Option : root이 특정 Element일 때, Element가 root Element 내에 들어오면 isView를 true로 반환한다', () => {
    const customRootElement = document.createElement('div');
    document.body.appendChild(customRootElement);

    const { result } = renderHook(() =>
      useIntersectionObserver({ root: customRootElement })
    );

    act(() => {
      result.current.intersectionRef(targetElement);
    });

    act(() => {
      const callback = getCallback();
      callback([{ isIntersecting: true }]);
    });

    expect(result.current.isView).toBe(true);
  });

  test('Option : visibleOnce 옵션이 true일 때, Element가 viewport에 들어오면 isView를 true로 반환하고, 이후에는 false로 유지된다', () => {
    const { result } = renderHook(() =>
      useIntersectionObserver({ visibleOnce: true })
    );

    act(() => {
      result.current.intersectionRef(targetElement);
    });

    act(() => {
      const callback = getCallback();
      callback([{ isIntersecting: true }]);
    });

    expect(result.current.isView).toBe(true);
    expect(mockObserverInstance.unobserve).toHaveBeenCalledWith(targetElement);

    act(() => {
      const callback = getCallback();
      callback([{ isIntersecting: false }]);
    });

    expect(result.current.isView).toBe(false);
  });

  test('Option : initialView이 true일 때, 초기 렌더링 시 isView를 true로 반환한다', () => {
    const { result } = renderHook(() =>
      useIntersectionObserver({ initialView: true })
    );

    expect(result.current.isView).toBe(true);
  });

  test('Option : initialView이 false일 때, 초기 렌더링 시 isView를 false로 반환한다', () => {
    const { result } = renderHook(() =>
      useIntersectionObserver({ initialView: false })
    );

    expect(result.current.isView).toBe(false);
  });

  test('Option : initialView이 설정되지 않았을 때, 초기 렌더링 시 isView를 false로 반환한다', () => {
    const { result } = renderHook(() => useIntersectionObserver());

    expect(result.current.isView).toBe(false);
  });

  test('Callback : onChange 콜백이 가시성 상태 변경 시 호출된다', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() => useIntersectionObserver({ onChange }));

    act(() => {
      result.current.intersectionRef(targetElement);
    });

    act(() => {
      const callback = getCallback();
      callback([{ isIntersecting: true }]);
    });
    expect(onChange).toHaveBeenCalledWith(true, expect.any(Object));

    act(() => {
      const callback = getCallback();
      callback([{ isIntersecting: false }]);
    });

    expect(onChange).toHaveBeenCalledWith(false, expect.any(Object));
  });

  test('Callback : onEnter 콜백이 Element가 화면에 나타날 때 호출된다', () => {
    const onEnter = jest.fn();
    const { result } = renderHook(() => useIntersectionObserver({ onEnter }));

    act(() => {
      result.current.intersectionRef(targetElement);
    });
    act(() => {
      const callback = getCallback();
      callback([{ isIntersecting: false }]);
    });

    expect(onEnter).not.toHaveBeenCalled();

    act(() => {
      const callback = getCallback();
      callback([{ isIntersecting: true }]);
    });

    expect(onEnter).toHaveBeenCalled();
  });

  test('Callback : onLeave 콜백이 Element가 화면에서 사라질 때 호출된다', () => {
    const onLeave = jest.fn();
    const { result } = renderHook(() => useIntersectionObserver({ onLeave }));

    act(() => {
      result.current.intersectionRef(targetElement);
    });

    act(() => {
      const callback = getCallback();
      callback([{ isIntersecting: true }]);
    });
    expect(onLeave).not.toHaveBeenCalled();

    act(() => {
      const callback = getCallback();
      callback([{ isIntersecting: false }]);
    });

    expect(onLeave).toHaveBeenCalled();
  });
});
