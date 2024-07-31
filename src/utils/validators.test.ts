import { MatchError, validators } from './validators';

describe('validators', () => {
  test('isClient', () => {
    expect(validators.isClient()).toBe(typeof window === 'object');
  });

  test('isString', () => {
    expect(validators.isString('hello')).toBe(true);
    expect(validators.isString(123)).toBe(false);
    expect(validators.isString({})).toBe(false);
    expect(validators.isString(undefined)).toBe(false);
  });

  test('isNumber', () => {
    expect(validators.isNumber(123)).toBe(true);
    expect(validators.isNumber('hello')).toBe(false);
    expect(validators.isNumber({})).toBe(false);
    expect(validators.isNumber(null)).toBe(false);
  });

  test('isArray', () => {
    expect(validators.isArray([])).toBe(true);
    expect(validators.isArray('hello')).toBe(false);
    expect(validators.isArray({})).toBe(false);
    expect(validators.isArray(undefined)).toBe(false);
  });

  test('isObject', () => {
    expect(validators.isObject({})).toBe(true);
    expect(validators.isObject([])).toBe(false);
    expect(validators.isObject('hello')).toBe(false);
    expect(validators.isObject(null)).toBe(false);
  });

  test('isFunction', () => {
    expect(validators.isFunction(() => {})).toBe(true);
    expect(validators.isFunction(function () {})).toBe(true);
    expect(validators.isFunction([])).toBe(false);
    expect(validators.isFunction({})).toBe(false);
    expect(validators.isFunction('hello')).toBe(false);
    expect(validators.isFunction(null)).toBe(false);
  });

  test('isSameType', () => {
    expect(validators.isSameType('hello', 'world')).toBe(true);
    expect(validators.isSameType(123, 456)).toBe(true);
    expect(validators.isSameType([], {})).toBe(false);
    expect(validators.isSameType('hello', 123)).toBe(false);
    expect(validators.isSameType(undefined, null)).toBe(false);
  });

  test('getType', () => {
    expect(validators.getType('hello')).toBe('string');
    expect(validators.getType(123)).toBe('number');
    expect(validators.getType([])).toBe('array');
    expect(validators.getType({})).toBe('object');
    expect(validators.getType(undefined)).toBe('undefined');
  });

  test('validateTypeConsistency', () => {
    expect(() =>
      validators.validateTypeConsistency('hello', 'world')
    ).not.toThrow();
    expect(() => validators.validateTypeConsistency(123, 456)).not.toThrow();
    expect(() => validators.validateTypeConsistency([], {})).toThrow();
    expect(() => validators.validateTypeConsistency('hello', 123)).toThrow();
    expect(() => validators.validateTypeConsistency(undefined, null)).toThrow();
  });

  test('validateTypeConsistency throws MatchError', () => {
    expect(() => validators.validateTypeConsistency('hello', 123)).toThrow(
      MatchError
    );
    expect(() => validators.validateTypeConsistency([], {})).toThrow(
      MatchError
    );
    expect(() => validators.validateTypeConsistency(undefined, null)).toThrow(
      MatchError
    );

    expect(() => validators.validateTypeConsistency('hello', 123)).toThrow(
      `New value type does not match stored value type\n current:hello->string, prev:123->number`
    );

    expect(() => validators.validateTypeConsistency([], {})).toThrow(
      `New value type does not match stored value type\n current:->array, prev:[object Object]->object`
    );

    expect(() => validators.validateTypeConsistency(undefined, null)).toThrow(
      `New value type does not match stored value type\n current:undefined->undefined, prev:null->object`
    );
  });

  test('resolveValue', () => {
    const prevPayload = 10;
    const newPayload = (prev: number) => prev + 1;
    expect(validators.resolveValue(newPayload, prevPayload)).toBe(11);
    expect(validators.resolveValue(15, prevPayload)).toBe(15);
    expect(validators.resolveValue('hello', 'world')).toBe('hello');
    expect(
      validators.resolveValue((prev: string) => prev + ' world', 'hello')
    ).toBe('hello world');
  });
});
