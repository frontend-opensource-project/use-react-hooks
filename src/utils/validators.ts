type ValueResolver<T> = T | ((prevPayload: T) => T);

const validators = {
  isClient(): boolean {
    return typeof window !== 'undefined';
  },
  isString(value: unknown): value is string {
    return typeof value === 'string';
  },
  isNumber(value: unknown): value is number {
    return typeof value === 'number';
  },
  isArray(value: unknown): value is Array<unknown> {
    return Array.isArray(value);
  },
  isFunction(value: unknown) {
    return typeof value === 'function';
  },
  isObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  },
  isDate(value: unknown): value is Date {
    return value instanceof Date && !isNaN(value.getTime());
  },
  isNull(value: unknown): value is null {
    return value === null;
  },
  isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
  },
  isSameType(value1: unknown, value2: unknown): boolean {
    const typeChecks = [
      validators.isString,
      validators.isNumber,
      validators.isArray,
      validators.isBoolean,
      validators.isNull,
      validators.isObject,
    ];

    return typeChecks.some((checkFn) => checkFn(value1) && checkFn(value2));
  },
  getType(value: unknown): string {
    if (validators.isArray(value)) {
      return 'array';
    }

    if (validators.isNull(value)) {
      return 'null';
    }

    return typeof value;
  },
  validateTypeConsistency(value1: unknown, value2: unknown) {
    if (!validators.isSameType(value1, value2)) {
      throw new MatchError(
        `New value type does not match stored value type\n current:${value1}->${validators.getType(value1)}, prev:${value2}->${validators.getType(value2)}`
      );
    }
  },
  resolveValue<T>(newPayload: ValueResolver<T>, prevPayload: T): T {
    return newPayload instanceof Function
      ? newPayload(prevPayload)
      : newPayload;
  },
};

class MatchError extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
    this.name = 'MatchError';
  }
}

export { validators, MatchError };
