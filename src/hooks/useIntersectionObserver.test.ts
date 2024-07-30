import { renderHook, act } from '@testing-library/react';
import useIntersectionObserver from './useIntersectionObserver';

class MockIntersectionObserver implements IntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  takeRecords = jest.fn(() => []);
  root: Element | Document | null = null;
  rootMargin: string = '';
  thresholds: ReadonlyArray<number> = [];
}

class MockIntersectionObserverEntry implements IntersectionObserverEntry {
  isIntersecting: boolean;
  target: Element;
  boundingClientRect: DOMRectReadOnly;
  intersectionRatio: number;
  intersectionRect: DOMRectReadOnly;
  rootBounds: DOMRectReadOnly | null;
  time: number;

  constructor(isIntersecting: boolean = false, intersectionRatio: number = 0) {
    this.isIntersecting = isIntersecting;
    this.target = document.createElement('div');
    (this.boundingClientRect = {} as DOMRectReadOnly),
      (this.intersectionRatio = intersectionRatio);
    (this.intersectionRect = {} as DOMRectReadOnly),
      (this.rootBounds = {} as DOMRectReadOnly),
      (this.time = Date.now());
  }
}

// 각각 임의의 값을 입력하는 Instance
const mockEntry = (
  isIntersecting: boolean = false,
  intersectionRatio: number = 0
): IntersectionObserverEntry =>
  new MockIntersectionObserverEntry(isIntersecting, intersectionRatio);

describe('useIntersectionObserver', () => {
  let rootElement: Element;
  let targetElement: Element;
  let mockObserver: MockIntersectionObserver;

  beforeEach(() => {
    rootElement = document.createElement('div');
    targetElement = document.createElement('div');
    document.body.appendChild(rootElement);
    rootElement.appendChild(targetElement);

    (
      global as unknown as { IntersectionObserver: jest.Mock }
    ).IntersectionObserver = jest.fn(() => {
      mockObserver = new MockIntersectionObserver();
      // 여기 callback어쩌군
      return mockObserver;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
    (
      global as unknown as { IntersectionObserver: jest.Mock }
    ).IntersectionObserver.mockRestore();
  });

  const getIntersectionObserverCallback = (): ((
    entries: IntersectionObserverEntry[]
  ) => void) => {
    return (global as unknown as { IntersectionObserver: jest.Mock })
      .IntersectionObserver.mock.calls[0][0];
  };

  test('기본 : Element가 viewport에 들어왔을 때 isView가 true로 반환된다', () => {
    const { result } = renderHook(() => useIntersectionObserver());

    act(() => {
      result.current.intersectionRef(targetElement);
    });

    expect(mockObserver.observe).toHaveBeenCalledWith(targetElement);

    act(() => {
      const callback = getIntersectionObserverCallback();
      callback([mockEntry(true)]);
    });

    expect(result.current.isView).toBe(true);
  });

  test('기본 : Element가 viewport에 들어오지 않았을 때 isView가 false로 반환되는지 테스트', () => {
    const { result } = renderHook(() => useIntersectionObserver());

    act(() => {
      result.current.intersectionRef(targetElement);
    });

    act(() => {
      const callback = (
        global as unknown as { IntersectionObserver: jest.Mock }
      ).IntersectionObserver.mock.calls[0][0];
      callback([mockEntry(false)]);
    });

    expect(result.current.isView).toBe(false);
  });

  test('threshold가 0.5일 때, 요소가 50% 노출되면 isView가 true로 반환되는지 테스트', () => {
    const { result } = renderHook(() =>
      useIntersectionObserver({ threshold: 0.5 })
    );

    act(() => {
      result.current.intersectionRef(targetElement);
    });

    act(() => {
      const callback = getIntersectionObserverCallback();
      callback([mockEntry(true, 0.5)]);
    });

    expect(result.current.isView).toBe(true);
  });

  test('threshold가 0.5일 때, 요소가 30%만 노출되면 isView가 false로 반환되는지 테스트', () => {
    const { result } = renderHook(() =>
      useIntersectionObserver({ threshold: 0.5 })
    );
    act(() => {
      result.current.intersectionRef(targetElement);
    });

    act(() => {
      const callback = getIntersectionObserverCallback();
      callback([mockEntry(false, 0.3)]);
    });

    expect(result.current.isView).toBe(false);
  });

  test('root이 null일 때, 요소가 viewport에 들어오면 isView가 true로의 반환 여부 테스트', () => {
    const { result } = renderHook(() =>
      useIntersectionObserver({ root: null })
    );

    act(() => {
      result.current.intersectionRef(targetElement);
    });

    act(() => {
      const callback = getIntersectionObserverCallback();
      callback([mockEntry(true)]);
    });

    expect(result.current.isView).toBe(true);
  });

  test('root이 특정 Element일 때, 요소가 root 엘리먼트 내에 들어오면 isView가 true로 반환되는지 테스트', () => {
    const customRootElement = document.createElement('div');
    document.body.appendChild(customRootElement);

    const { result } = renderHook(() =>
      useIntersectionObserver({ root: customRootElement })
    );

    act(() => {
      result.current.intersectionRef(targetElement);
    });

    act(() => {
      const callback = getIntersectionObserverCallback();
      callback([mockEntry(true)]);
    });

    expect(result.current.isView).toBe(true);
  });

  test('visibleOnce 옵션이 true일 때, 요소가 viewport에 들어오면 isView가 true로 반환되고, 이후에는 false로 유지되는지 테스트', () => {
    const { result } = renderHook(() =>
      useIntersectionObserver({ visibleOnce: true })
    );

    act(() => {
      result.current.intersectionRef(targetElement);
    });

    act(() => {
      const callback = getIntersectionObserverCallback();
      callback([mockEntry(true)]);
    });

    expect(result.current.isView).toBe(true);
    expect(mockObserver.unobserve).toHaveBeenCalledWith(targetElement);

    act(() => {
      const callback = getIntersectionObserverCallback();
      callback([mockEntry(false)]);
    });

    expect(result.current.isView).toBe(false);
  });

  test('initialView이 true일 때, 초기 렌더링 시 isView가 true로 반환되는지 테스트', () => {
    const { result } = renderHook(() =>
      useIntersectionObserver({ initialView: true })
    );

    expect(result.current.isView).toBe(true);
  });

  test('initialView이 false일 때, 초기 렌더링 시 isView가 false로 반환되는지 테스트', () => {
    const { result } = renderHook(() =>
      useIntersectionObserver({ initialView: false })
    );

    expect(result.current.isView).toBe(false);
  });

  test('initialView이 설정되지 않았을 때, 초기 렌더링 시 isView가 false로 반환되는지 테스트', () => {
    const { result } = renderHook(() => useIntersectionObserver());

    expect(result.current.isView).toBe(false);
  });

  test('onChange 콜백이 가시성 상태 변경 시 호출되는지 테스트', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() => useIntersectionObserver({ onChange }));

    act(() => {
      result.current.intersectionRef(targetElement);
    });

    act(() => {
      const callback = getIntersectionObserverCallback();
      callback([mockEntry(true)]);
    });

    expect(onChange).toHaveBeenCalledWith(
      true,
      expect.any(MockIntersectionObserverEntry)
    );

    act(() => {
      const callback = getIntersectionObserverCallback();
      callback([mockEntry(false)]);
    });

    expect(onChange).toHaveBeenCalledWith(
      false,
      expect.any(MockIntersectionObserverEntry)
    );
  });

  test('onEnter 콜백이 요소가 화면에 나타날 때 호출되는지 테스트', () => {
    const onEnter = jest.fn();
    const { result } = renderHook(() => useIntersectionObserver({ onEnter }));

    act(() => {
      result.current.intersectionRef(targetElement);
    });
    act(() => {
      const callback = getIntersectionObserverCallback();
      callback([mockEntry(false)]);
    });

    expect(onEnter).not.toHaveBeenCalled();

    act(() => {
      const callback = getIntersectionObserverCallback();
      callback([mockEntry(true)]);
    });

    expect(onEnter).toHaveBeenCalled();
  });

  test('onLeave 콜백이 요소가 화면에서 사라질 때 호출되는지 테스트', () => {
    const onLeave = jest.fn();
    const { result } = renderHook(() => useIntersectionObserver({ onLeave }));

    act(() => {
      result.current.intersectionRef(targetElement);
    });

    act(() => {
      const callback = getIntersectionObserverCallback();
      callback([mockEntry(true)]);
    });
    expect(onLeave).not.toHaveBeenCalled();

    act(() => {
      const callback = getIntersectionObserverCallback();
      callback([mockEntry(false)]);
    });

    expect(onLeave).toHaveBeenCalled();
  });

  test('disconnect 메서드가 useEffect의 클린업 함수에서 호출되는지 테스트', () => {
    const { result, unmount } = renderHook(() => useIntersectionObserver());

    act(() => {
      result.current.intersectionRef(targetElement);
    });

    act(() => {
      unmount();
    });

    expect(mockObserver.disconnect).toHaveBeenCalled();
  });
});
