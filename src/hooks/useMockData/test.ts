import { act, renderHook } from '@testing-library/react';
import useMockData, { useMockDataOptions } from './useMockData';

describe('useMockData hook spec', () => {
  test('전달된 스카마를 기반으로 데이터 형식을 반환해야 한다.', () => {
    const { result } = renderHook(() =>
      useMockData({
        schema: {
          name: 'string',
          age: 'number',
          isActive: 'boolean',
          image: 'image',
          date: 'date',
          uuid: 'UUID',
          array: ['string', 'number'],
          object: {
            innerObject: {
              name: 'string',
            },
            array: ['string', 'number'],
          },
        },
      })
    );

    expect(result.current.mockData).toHaveLength(1);
    const [generatedData] = result.current.mockData;

    expect(typeof generatedData.name).toBe('string');
    expect(typeof generatedData.age).toBe('number');
    expect(typeof generatedData.isActive).toBe('boolean');
    expect(typeof generatedData.image).toBe('string');
    expect(generatedData.date instanceof Date).toBeTruthy();
    expect(generatedData.uuid.length).toBe(36);
    expect(typeof generatedData.uuid).toBe('string');
    expect(Array.isArray(generatedData.array)).toBeTruthy();
    expect(typeof generatedData.object).toBe('object');
    expect(typeof generatedData.object.innerObject.name).toBe('string');
    expect(typeof generatedData.object.array[0]).toBe('string');
    expect(typeof generatedData.object.array[1]).toBe('number');
  });

  it('addItem를 호출하면 새로운 mockData가 추가되어야 한다.', () => {
    const { result } = renderHook(() =>
      useMockData({
        schema: {
          age: 'number',
        },
      })
    );

    act(() => {
      result.current.addItem();
    });

    expect(result.current.mockData).toHaveLength(2);
  });

  test('제공된 옵션을 기반으로 모의 데이터를 생성해야 한다.', () => {
    const customOptions: useMockDataOptions = {
      count: 5,
      type: {
        string: { min: 4, max: 4 },
        number: { min: 5, max: 5 },
        image: { width: { min: 6, max: 6 }, height: { min: 7, max: 7 } },
        date: { start: '2024-01-01', end: '2024-12-31' },
      },
    };

    const { result } = renderHook(() =>
      useMockData({
        schema: {
          string: 'string',
          number: 'number',
          image: 'image',
          date: 'date',
        },
        options: customOptions,
      })
    );
    const [generatedData] = result.current.mockData;

    expect(result.current.mockData).toHaveLength(5);
    expect(generatedData.string.length).toBe(4);
    expect(generatedData.number).toBe(5);
    expect(generatedData.image).toBe('https://picsum.photos/6/7');
    const date = new Date(generatedData.date);
    expect(date.getFullYear()).toBe(2024);
    expect(date.getMonth() + 1).toBeGreaterThanOrEqual(1);
    expect(date.getMonth() + 1).toBeLessThanOrEqual(12);
  });

  test('잘못된 타입을 전달하면 예외가 발생해야 한다.', () => {
    expect(() => {
      renderHook(() =>
        useMockData({
          schema: {
            name: 'error',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
        })
      );
    }).toThrow('Invalid type');
  });

  test('유효하지 않은 범위 값을 전달하면 예외가 발생해야 한다. (string)', () => {
    expect(() => {
      renderHook(() =>
        useMockData({
          schema: {
            name: 'string',
          },
          options: {
            type: {
              string: {
                min: 10,
                max: 5, // 유효하지 않은 범위
              },
            },
          },
        })
      );
    }).toThrow('Min value (10) must be less than Max value (5)');
  });

  test('유효하지 않은 범위 값을 전달하면 예외가 발생해야 한다. (number)', () => {
    expect(() => {
      renderHook(() =>
        useMockData({
          schema: {
            number: 'number',
          },
          options: {
            type: {
              number: {
                min: 100,
                max: 50, // min이 max보다 큼
              },
            },
          },
        })
      );
    }).toThrow('Min value (100) must be less than Max value (50)');
  });

  test('잘못된 날짜 포맷을 전달하면 예외가 발생해야 한다.', () => {
    expect(() => {
      renderHook(() =>
        useMockData({
          schema: {
            dateField: 'date',
          },
          options: {
            type: {
              date: {
                start: '2024-09-01',
                end: '2024-08-01', // end가 start보다 이른 날짜
              },
            },
          },
        })
      );
    }).toThrow('startDate must be earlier than endDate');
  });
});
