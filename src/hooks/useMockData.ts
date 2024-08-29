import { useState } from 'react';

import { validators } from '../utils';
import { Fn } from '../types';

type PrimitiveType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'image'
  | 'date'
  | 'UUID';

type ObjectType = { [key: string]: DataType };

type DataType = PrimitiveType | DataType[] | ObjectType;

type Schema = Record<string, DataType>;

// prettier-ignore
type InferType<T extends DataType> = 
  T extends 'string' ? string :
  T extends 'number' ? number :
  T extends 'boolean' ? boolean :
  T extends 'image' ? 'image' :
  T extends 'date' ? Date :
  T extends 'UUID' ? 'UUID' :
  T extends DataType[] ? InferType<T[number]>[] :
  T extends ObjectType ? { [K in keyof T]: InferType<T[K]> } : never;

type SchemaToType<S extends Schema> = {
  [K in keyof S]: InferType<S[K]>;
};

type Range = {
  min: number;
  max: number;
};

type TypeOptions = {
  name: Range;
  number: Range;
  image: {
    width: Range;
    height: Range;
  };
  date: {
    start: DateFormat;
    end: DateFormat;
  };
};

interface Options {
  count: number;
  type: Partial<TypeOptions>;
}

interface UseMockDataProps<S extends Schema> {
  options?: Partial<Options>;
  schema: S;
}

interface UseMockDataReturns<T> {
  mockData: T;
  addItem: Fn;
}

const defaultOptions: Options = {
  count: 1,
  type: {
    name: {
      min: 3,
      max: 10,
    },
    number: {
      min: 1,
      max: 100,
    },
    image: {
      width: {
        min: 800,
        max: 2560,
      },
      height: {
        min: 600,
        max: 1440,
      },
    },
    date: {
      start: formatDateToYYYYMMDD(),
      end: formatDateToYYYYMMDD(1),
    },
  },
};

/**
 * 주어진 스키마와 옵션을 바탕으로 모의 데이터를 생성하는 커스텀 훅.
 *
 * @param {Object} params - 훅에 전달되는 파라미터.
 * @param {S} params.schema - 모의 데이터의 구조를 정의하는 스키마 객체.
 * @param {Partial<Options>} [params.options] - 모의 데이터 생성을 위한 옵션 객체. 기본 값은 `defaultOptions`로 설정됨.
 *
 * @template S - 스키마 타입.
 *
 * @returns {Object}
 *  - `mockData`: 생성된 모의 데이터 배열.
 *  - `addItem`: 새로운 모의 데이터를 추가하는 함수. 호출 시 현재의 `schema`에 기반한 새로운 데이터를 배열에 추가.
 *
 * @description
 * - 이 훅은 주어진 `schema`와 `options`를 사용하여 모의 데이터를 생성하고 상태로 관리합니다.
 */
const useMockData = <S extends Schema>({
  schema,
  options,
}: UseMockDataProps<S>): UseMockDataReturns<SchemaToType<S>[]> => {
  const { count, type: typeOptions } = {
    count: options?.count ?? defaultOptions.count,
    type: {
      ...defaultOptions.type,
      ...(options?.type ?? {}), // 없는 경우에도 기본 값이 그대로 유지
    },
  } as { count: number; type: TypeOptions };

  const createMockRecords = (count: number, schema: Schema) => {
    return Array.from({ length: count }).map(() => generateMockData(schema));
  };

  /**
   * 값을 순회하면서 타입에 맞는 값으로 변화시키는 함수.
   * 순회 도중 객체나 배열을 만나면 재귀함수로 내부 값을 해결한다.
   */
  const generateMockData = (schema: Schema): SchemaToType<Schema> => {
    return Object.entries(schema).reduce((acc, [key, value]) => {
      const recurseGenerateArray = (dataArr: DataType[]): unknown[] => {
        return dataArr.map((type) => {
          if (validators.isArray(type)) {
            return recurseGenerateArray(type);
          }

          if (validators.isObject(type)) {
            return generateMockData({ [key]: type });
          }

          return generateValueFromType(type);
        });
      };

      /**
       * 요소가 배열인경우
       * 배열 요소는 @type {DataType} 값으로 구성되어 있다.
       */
      if (validators.isArray(value)) {
        acc[key] = value.map((type) => {
          if (validators.isArray(type)) {
            return recurseGenerateArray(type);
          }

          if (validators.isObject(type)) {
            return generateMockData(type);
          }

          return generateValueFromType(type);
        }) as DataType;

        return acc;
      }

      /**
       * 요소가 객체인경우
       * 객체 요소는 @type {ObjectType} 값으로 구성되어 있다.
       */
      if (validators.isObject(value)) {
        acc[key] = generateMockData(value);

        return acc;
      }

      /**
       * 요소가 객체, 배열이 아닌경우
       * @type {PrimitiveType} 값으로 구성되어 있다.
       */
      acc[key] = generateValueFromType(value) as DataType;

      return acc;
    }, {} as SchemaToType<Schema>);
  };

  const generateValueFromType = (type: PrimitiveType) => {
    switch (type) {
      case 'string':
        return dataGenerator.generateRandomName(typeOptions.name);
      case 'number':
        return dataGenerator.generateRandomNumberInRange(typeOptions.number);
      case 'boolean':
        return dataGenerator.generateRandomBoolean();
      case 'image':
        return dataGenerator.generateRandomImageURL(typeOptions.image);
      case 'date':
        return dataGenerator.generateRandomDateInRange(typeOptions.date);
      case 'UUID':
        return dataGenerator.generateSimpleUUID();
      default:
        throw new Error('Invalid type');
    }
  };

  const [mockData, setMockData] = useState(() => {
    return createMockRecords(count, schema) as SchemaToType<S>[];
  });

  const addItemHandler = () => {
    setMockData((prev) => {
      return [...prev, generateMockData(schema) as SchemaToType<S>];
    });
  };

  return {
    mockData,
    addItem: addItemHandler,
  };
};

export default useMockData;

type DateFormat = `${string}-${string}-${string}`;

const dataGenerator = {
  generateRandomName(range: Range) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const result = Array.from({
      length: this.generateRandomValueInRange(range.min, range.max),
    })
      .map(() => alphabet[this.generateRandomIndex(alphabet.length)])
      .join('');

    return result.charAt(0).toUpperCase() + result.slice(1);
  },
  generateRandomNumberInRange(range: Range) {
    return this.generateRandomValueInRange(range.min, range.max);
  },
  generateRandomBoolean() {
    return [true, false][this.generateRandomIndex(2)];
  },
  generateRandomImageURL(range: { width: Range; height: Range }) {
    const width = this.generateRandomValueInRange(
      range.width.min,
      range.width.max
    );
    const height = this.generateRandomValueInRange(
      range.height.min,
      range.height.max
    );

    return `https://picsum.photos/${width}/${height}`;
  },
  generateRandomDateInRange(range: { start: DateFormat; end: DateFormat }) {
    const start = new Date(range.start);
    const end = new Date(range.end);

    if (start >= end) {
      throw new Error('startDate must be earlier than endDate');
    }

    // 시작 날짜와 끝 날짜 사이의 차이를 밀리초 단위로 계산
    const startTime = start.getTime();
    const endTime = end.getTime();
    const randomTime = startTime + Math.random() * (endTime - startTime);

    return new Date(randomTime);
  },
  generateSimpleUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = this.generateRandomIndex(16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },
  generateRandomValueInRange(min: number, max: number) {
    if (min >= max) {
      throw new Error(
        `Min value (${min}) must be less than Max value (${max})`
      );
    }

    return this.generateRandomIndex(max - min + 1) + min;
  },
  generateRandomIndex(range: number) {
    if (range <= 0) {
      throw new Error('Range must be greater than 0');
    }
    return Math.floor(Math.random() * range);
  },
};

function formatDateToYYYYMMDD(additionalMonths = 0): DateFormat {
  const currentDate = new Date();

  // 현재 날짜에 추가할 개월 수를 더함
  currentDate.setMonth(currentDate.getMonth() + additionalMonths);

  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // 월을 1부터 시작하도록 조정
  const day = String(currentDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
