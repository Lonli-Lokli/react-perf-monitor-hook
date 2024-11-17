import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePerformanceMonitor } from './react-perf-monitor-hook';

describe('usePerformanceMonitor', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should initialize with default config', async () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));
    vi.advanceTimersToNextFrame()
    expect(result.current).toBeDefined();
  });

  it('should respect disabled logging', async () => {
    const watcherFn = vi.fn();
    await act(async () => {
      renderHook(() =>
        usePerformanceMonitor('TestComponent', {
          logging: { enabled: false, onMetrics: watcherFn },
        })
      );
    });
    vi.advanceTimersToNextFrame()
    expect(watcherFn).not.toHaveBeenCalled();
  });

  it('should minimize calls when disabled', async () => {
    const perfNowSpy = vi.mocked(performance.now);
    const rafSpy = vi.mocked(window.requestAnimationFrame);

    await act(async () => {
      renderHook(() =>
        usePerformanceMonitor('TestComponent', {
          frames: false,
          timing: false,
          memory: false,
          dom: false,
        })
      );
    });

    const initialPerfCalls = perfNowSpy.mock.calls.length;
    const initialRafCalls = rafSpy.mock.calls.length;

    vi.advanceTimersToNextFrame()

    expect(perfNowSpy.mock.calls.length).toBe(initialPerfCalls);
    expect(rafSpy.mock.calls.length).toBe(initialRafCalls);
  });

  describe('Frame Metrics', () => {
    it('should track FPS when enabled', async () => {
      const watcherFn = vi.fn();
      await act(async () => {
        renderHook(() =>
          usePerformanceMonitor('TestComponent', {
            frames: { fps: true, dropped: false },
            logging: {onMetrics: watcherFn}
          })
        );
      });

      vi.advanceTimersToNextFrame()

      expect(watcherFn).toHaveBeenCalled();
      expect(watcherFn).toHaveBeenCalledWith({})
      // expect(logCalls[0][1]).toHaveProperty('fps');
    });
  });

  // describe('Timing Metrics', () => {
  //   it('should measure render timing', async () => {
  //     await act(async () => {
  //       renderHook(() => usePerformanceMonitor('TestComponent', {
  //         timing: { render: true, script: false, paint: false }
  //       }));
  //     });

  //     await advanceFrames(2);

  //     const logCalls = vi.mocked(console.log).mock.calls;
  //     expect(logCalls[0][1]).toHaveProperty('render');
  //   });

  //   it('should include all timing metrics when enabled', async () => {
  //     await act(async () => {
  //       renderHook(() => usePerformanceMonitor('TestComponent', {
  //         timing: { render: true, script: true, paint: true }
  //       }));
  //     });

  //     await advanceFrames(2);

  //     const logCalls = vi.mocked(console.log).mock.calls;
  //     const metrics = logCalls[0][1];
  //     expect(metrics).toHaveProperty('render');
  //     expect(metrics).toHaveProperty('script');
  //     expect(metrics).toHaveProperty('paint');
  //     expect(metrics).toHaveProperty('total');
  //   });
  // });

  // describe('Buffering', () => {
  //   it('should respect buffer size', async () => {
  //     await act(async () => {
  //       renderHook(() => usePerformanceMonitor('TestComponent', {
  //         bufferSize: 3,
  //         timing: true
  //       }));
  //     });

  //     await advanceFrames(1);
  //     expect(console.log).not.toHaveBeenCalled();

  //     await advanceFrames(1);
  //     expect(console.log).not.toHaveBeenCalled();

  //     await advanceFrames(1);
  //     expect(console.log).toHaveBeenCalled();
  //   });
  // });

  // describe('Cleanup', () => {
  //   it('should clean up on unmount', async () => {
  //     const { unmount } = renderHook(() => usePerformanceMonitor('TestComponent', {
  //       frames: true
  //     }));

  //     await advanceFrames(1);
  //     const rafSpy = vi.mocked(window.requestAnimationFrame);
  //     const initialCalls = rafSpy.mock.calls.length;

  //     await act(async () => {
  //       unmount();
  //     });

  //     await advanceFrames(1);
  //     expect(rafSpy.mock.calls.length).toBe(initialCalls);
  //   });

  //   it('should handle component updates', async () => {
  //     const { rerender } = renderHook(
  //       ({ name }) => usePerformanceMonitor(name, { frames: true }),
  //       { initialProps: { name: 'TestComponent' } }
  //     );

  //     await advanceFrames(1);

  //     await act(async () => {
  //       rerender({ name: 'UpdatedComponent' });
  //     });

  //     await advanceFrames(1);

  //     const logCalls = vi.mocked(console.log).mock.calls;
  //     expect(logCalls.some(call => call[0].includes('UpdatedComponent'))).toBe(true);
  //   });
  // });

  // describe('Error Handling', () => {
  //   it('should handle performance.now errors', async () => {
  //     vi.mocked(performance.now).mockImplementation(() => {
  //       throw new Error('performance.now error');
  //     });

  //     const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));
  //     await advanceFrames(1);
  //     expect(result.error).toBeUndefined();
  //   });

  //   it('should handle RAF errors', async () => {
  //     vi.mocked(window.requestAnimationFrame).mockImplementation(() => {
  //       throw new Error('RAF error');
  //     });

  //     const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));
  //     await advanceFrames(1);
  //     expect(result.error).toBeUndefined();
  //   });

  //   it('should handle CAF errors', async () => {
  //     vi.mocked(window.cancelAnimationFrame).mockImplementation(() => {
  //       throw new Error('CAF error');
  //     });

  //     const { unmount } = renderHook(() => usePerformanceMonitor('TestComponent'));
  //     await advanceFrames(1);

  //     await act(async () => {
  //       expect(() => unmount()).not.toThrow();
  //     });
  //   });
  // });
});
