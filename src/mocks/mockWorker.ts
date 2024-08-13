/* eslint-disable @typescript-eslint/no-explicit-any */

const mockPostMessage = jest.fn();
const mockOnmessage = jest.fn();
const mockTerminate = jest.fn();
const mockWorkerScript = jest.fn();

class MockWorker {
  onmessage: ((this: any, ev: MessageEvent) => any) | null = null;
  postMessage = (receivedArg: any) => {
    mockPostMessage(receivedArg); // 이벤트 발신

    if (this.onmessage) {
      const event = { data: receivedArg[0] };
      const result = mockWorkerScript.mockReturnValue(
        event
      )() as unknown as MessageEvent;

      this.onmessage(result as any);
    }
  };
  terminate = mockTerminate;
}

globalThis.Worker = MockWorker as any;

export { mockPostMessage, mockTerminate, mockOnmessage, mockWorkerScript };
