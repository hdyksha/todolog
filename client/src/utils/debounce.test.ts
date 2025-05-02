import { describe, it, expect, vi, beforeEach } from 'vitest';
import { debounce, throttle } from './debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('指定した時間が経過するまで関数を実行しない', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();
    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('連続して呼び出された場合、最後の呼び出しだけが実行される', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn(1);
    debouncedFn(2);
    debouncedFn(3);

    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith(3);
  });

  it('タイマーが切れた後に再度呼び出された場合、新しいタイマーが開始される', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn(1);
    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith(1);

    debouncedFn(2);
    expect(mockFn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenLastCalledWith(2);
  });
});

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('最初の呼び出しは即時実行される', () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 100);

    throttledFn(1);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith(1);
  });

  it('制限時間内の呼び出しは無視される', () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 100);

    throttledFn(1);
    expect(mockFn).toHaveBeenCalledTimes(1);

    throttledFn(2);
    throttledFn(3);
    expect(mockFn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenLastCalledWith(3);
  });

  it('制限時間後の呼び出しは実行される', () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 100);

    throttledFn(1);
    expect(mockFn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);

    throttledFn(2);
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenLastCalledWith(2);
  });
});
