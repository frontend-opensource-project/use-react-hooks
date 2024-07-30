type IntersectionObserverCallback = (
  entries: IntersectionObserverEntry[]
) => void;

export class MockIntersectionObserver implements IntersectionObserver {
  root: Element | null = null;
  rootMargin: string = '';
  thresholds: ReadonlyArray<number> = [];
  callback: IntersectionObserverCallback = () => {};

  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  takeRecords = jest.fn(() => []);

  setCallback(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  triggerCallback(entries: IntersectionObserverEntry[]) {
    this.callback(entries);
  }
}

export function mockIntersectionObserver(
  isIntersectingItems?: Array<{ isIntersecting: boolean }>
): [MockIntersectionObserver, jest.Mock] {
  const mockObserverInstance = new MockIntersectionObserver();

  const mockIntersectionObserverConstructor = jest
    .fn()
    .mockImplementation((callback: IntersectionObserverCallback) => {
      mockObserverInstance.setCallback(callback);
      if (isIntersectingItems) {
        const entries: IntersectionObserverEntry[] = isIntersectingItems.map(
          (item) => ({
            isIntersecting: item.isIntersecting,
            intersectionRatio: 0,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: {} as DOMRectReadOnly,
            boundingClientRect: {} as DOMRectReadOnly,
            target: document.createElement('div'),
            time: 0,
          })
        );
        mockObserverInstance.triggerCallback(entries);
      }
      return mockObserverInstance;
    });

  window.IntersectionObserver =
    mockIntersectionObserverConstructor as unknown as typeof IntersectionObserver;

  return [mockObserverInstance, mockIntersectionObserverConstructor];
}
