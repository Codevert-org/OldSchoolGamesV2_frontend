import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validatePassword, createPseudoChecker } from './validation';

describe('validatePassword', () => {
  it('returns all false for empty string', () => {
    expect(validatePassword('')).toEqual({
      length: false,
      uppercase: false,
      lowercase: false,
      digit: false,
      special: false,
    });
  });

  it('detects length criterion (8–16 chars)', () => {
    expect(validatePassword('abcdefg').length).toBe(false);   // 7
    expect(validatePassword('abcdefgh').length).toBe(true);   // 8
    expect(validatePassword('abcdefghijklmnop').length).toBe(true);  // 16
    expect(validatePassword('abcdefghijklmnopq').length).toBe(false); // 17
  });

  it('detects uppercase criterion', () => {
    expect(validatePassword('abcdef1!').uppercase).toBe(false);
    expect(validatePassword('Abcdef1!').uppercase).toBe(true);
  });

  it('detects lowercase criterion', () => {
    expect(validatePassword('ABCDEF1!').lowercase).toBe(false);
    expect(validatePassword('ABCDEf1!').lowercase).toBe(true);
  });

  it('detects digit criterion', () => {
    expect(validatePassword('Abcdefg!').digit).toBe(false);
    expect(validatePassword('Abcdef1!').digit).toBe(true);
  });

  it('detects special character criterion', () => {
    expect(validatePassword('Abcdef12').special).toBe(false);
    expect(validatePassword('Abcdef1!').special).toBe(true);
  });

  it('returns all true for a fully valid password', () => {
    expect(validatePassword('Abcdef1!')).toEqual({
      length: true,
      uppercase: true,
      lowercase: true,
      digit: true,
      special: true,
    });
  });
});

describe('createPseudoChecker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires checkFn only for the last call within 1000ms (debounce)', async () => {
    const checkFn = vi.fn().mockResolvedValue(true);
    const callback = vi.fn();
    const checker = createPseudoChecker(checkFn);

    checker('a', callback);
    checker('ab', callback);
    checker('abc', callback);

    expect(checkFn).not.toHaveBeenCalled();

    await vi.runAllTimersAsync();

    expect(checkFn).toHaveBeenCalledTimes(1);
    expect(checkFn).toHaveBeenCalledWith('abc');
    expect(callback).toHaveBeenCalledWith(true);
  });

  it('does not fire a new call while a previous one is in-flight', async () => {
    let resolveFirst!: (v: boolean) => void;
    const firstCallPromise = new Promise<boolean>((res) => { resolveFirst = res; });

    const checkFn = vi.fn()
      .mockReturnValueOnce(firstCallPromise)
      .mockResolvedValue(true);

    const callback = vi.fn();
    const checker = createPseudoChecker(checkFn);

    // First call — timer fires, in-flight starts
    checker('abc', callback);
    await vi.runAllTimersAsync();
    expect(checkFn).toHaveBeenCalledTimes(1);

    // Second call while first is still in-flight
    checker('abcd', callback);
    await vi.runAllTimersAsync();
    // checkFn must NOT be called again
    expect(checkFn).toHaveBeenCalledTimes(1);

    // First call resolves
    resolveFirst(true);
    await Promise.resolve();
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
