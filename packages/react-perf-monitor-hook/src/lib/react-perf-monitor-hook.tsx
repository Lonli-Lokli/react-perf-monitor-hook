import { useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * Configuration for frame metrics
 * @example
 * frames: true // Enable all frame metrics
 * frames: { fps: true, dropped: false } // Only track FPS
 */
interface FrameMetricsConfig {
  fps?: boolean; // Track frames per second
  dropped?: boolean; // Track dropped frames count
}

/**
 * Configuration for memory metrics
 * @example
 * memory: true // Enable all memory metrics
 * memory: { nodes: true, heap: false } // Only track DOM nodes
 */
interface MemoryMetricsConfig {
  nodes?: boolean; // Track detached DOM nodes
  heap?: boolean; // Track heap memory usage
}

/**
 * Configuration for DOM metrics
 * @example
 * dom: true // Enable all DOM metrics
 * dom: { count: true, mutations: false } // Only track node count
 */
interface DOMMetricsConfig {
  count?: boolean; // Track total node count
  mutations?: boolean; // Track node additions/removals
}

/**
 * Configuration for timing metrics
 * @example
 * timing: true // Enable all timing metrics
 * timing: { render: true, script: false, paint: false } // Only track render time
 */
interface TimingMetricsConfig {
  render?: boolean; // Track render time
  script?: boolean; // Track script execution time
  paint?: boolean; // Track painting time
}

/**
 * Global logging configuration
 * @example
 * logging: { decimals: 1, prefix: '[MyComponent]' }
 */
interface LoggingConfig {
  enabled?: boolean; // Enable/disable logging
  decimals?: number; // Number of decimal points for durations
  prefix?: string; // Log prefix format
   /** Custom callback for handling metrics */
   onMetrics?: (message?: any, ...optionalParams: any[]) => void;
}

/**
 * Main configuration for the performance monitor
 * @example
 * // Enable all metrics with default configuration
 * { frames: true, memory: true, dom: true, timing: true }
 *
 * // Detailed configuration
 * {
 *   frames: { fps: true, dropped: false },
 *   memory: { nodes: true, heap: false },
 *   logging: { decimals: 1 }
 * }
 */
export interface PerformanceMonitorConfig {
  frames?: boolean | FrameMetricsConfig;
  memory?: boolean | MemoryMetricsConfig;
  dom?: boolean | DOMMetricsConfig;
  timing?: boolean | TimingMetricsConfig;
  logging?: LoggingConfig;
  sampleRate?: number; // Measure every nth render
  bufferSize?: number; // Number of measurements to average
}

interface PerformanceMetrics {
  // Frame metrics
  fps?: number;
  droppedFrames?: number;
  // Memory metrics
  detachedNodes?: number;
  heapSize?: number;
  // DOM metrics
  nodeCount?: number;
  addedNodes?: number;
  removedNodes?: number;
  // Timing metrics
  renderTimeMs?: number;
  scriptTimeMs?: number;
  paintTimeMs?: number;
  totalTimeMs?: number;
}

// Default configurations
const DEFAULT_CONFIG: {
  frames: FrameMetricsConfig;
  memory: MemoryMetricsConfig;
  dom: DOMMetricsConfig;
  timing: TimingMetricsConfig;
  logging: LoggingConfig;
  sampleRate: number;
  bufferSize: number;
} = {
  frames: { fps: true, dropped: false },
  memory: { nodes: true, heap: false },
  dom: { count: true, mutations: false },
  timing: { render: true, script: true, paint: true },
  logging: { enabled: true, decimals: 2, onMetrics: console.log },
  sampleRate: 1,
  bufferSize: 1,
};

export const usePerformanceMonitor = (
  componentName: string,
  userConfig: PerformanceMonitorConfig = {}
) => {
  const config = useMemo(() => ({
    ...DEFAULT_CONFIG,
    ...userConfig
  }), [userConfig]); // Only recreate when userConfig changes
  const metricsBuffer = useRef<PerformanceMetrics[]>([]);
  const frameStats = useRef({
    count: 0,
    dropped: 0,
    lastTime: 0,
    times: [] as number[],
  });
  const renderCount = useRef(0);
  const timings = useRef({ start: 0, script: 0, render: 0, paint: 0 });

  const trackFrames = useCallback(() => {
    if (!config.frames) return;

    const now = performance.now();
    if (frameStats.current.lastTime) {
      const delta = now - frameStats.current.lastTime;
      frameStats.current.times.push(delta);
      if (frameStats.current.times.length > 60)
        frameStats.current.times.shift();

      if (delta > 16.67) {
        // 60fps threshold
        frameStats.current.dropped++;
      }
    }
    frameStats.current.count++;
    frameStats.current.lastTime = now;

    requestAnimationFrame(trackFrames);
  }, [config.frames]);

  const measureDOMMetrics = useCallback(
    (element: Element | null) => {
      if (!element || !config.dom) return {};

      const metrics: Partial<PerformanceMetrics> = {};
      const domConfig =
        typeof config.dom === 'boolean' ? DEFAULT_CONFIG.dom : config.dom;

      if (domConfig?.count) {
        metrics.nodeCount = element.getElementsByTagName('*').length;
      }

      return metrics;
    },
    [config.dom]
  );

  const measureMemoryMetrics = useCallback(() => {
    if (!config.memory) return {};

    const metrics: Partial<PerformanceMetrics> = {};
    const memConfig =
      typeof config.memory === 'boolean'
        ? DEFAULT_CONFIG.memory
        : config.memory;

    if (memConfig?.heap && (performance as any).memory) {
      metrics.heapSize =
        (performance as any).memory.usedJSHeapSize / (1024 * 1024);
    }

    return metrics;
  }, [config.memory]);

  const calculateMetrics = useCallback((): PerformanceMetrics => {
    const metrics: PerformanceMetrics = {};
    const { frames, timing } = config;

    // Frame metrics
    if (frames) {
      const framesConfig =
        typeof frames === 'boolean' ? DEFAULT_CONFIG.frames : frames;
      if (framesConfig?.fps) {
        const times = frameStats.current.times;
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        metrics.fps = avgTime ? Math.min(1000 / avgTime, 60) : 0;
      }
      if (framesConfig?.dropped) {
        metrics.droppedFrames = frameStats.current.dropped;
      }
    }

    // Timing metrics
    if (timing) {
      const timingConfig =
        typeof timing === 'boolean' ? DEFAULT_CONFIG.timing : timing;
      if (timingConfig?.script) {
        metrics.scriptTimeMs = timings.current.script - timings.current.start;
      }
      if (timingConfig?.render) {
        metrics.renderTimeMs = timings.current.render - timings.current.script;
      }
      if (timingConfig?.paint) {
        metrics.paintTimeMs = timings.current.paint - timings.current.render;
      }
      metrics.totalTimeMs = timings.current.paint - timings.current.start;
    }

    return metrics;
  }, [config]);

  const reportMetrics = useCallback(
    (metrics: PerformanceMetrics) => {
      if (!config.logging?.enabled) return;

      const decimals = config.logging?.decimals ?? 2;
      const format = (num: number) => num.toFixed(decimals);

      const logObject: Record<string, any> = {};

      if (metrics.fps !== undefined)
        logObject.fps = `${format(metrics.fps)} fps`;
      if (metrics.droppedFrames !== undefined)
        logObject.dropped = metrics.droppedFrames;
      if (metrics.renderTimeMs !== undefined)
        logObject.render = `${format(metrics.renderTimeMs)}ms`;
      if (metrics.scriptTimeMs !== undefined)
        logObject.script = `${format(metrics.scriptTimeMs)}ms`;
      if (metrics.paintTimeMs !== undefined)
        logObject.paint = `${format(metrics.paintTimeMs)}ms`;
      if (metrics.totalTimeMs !== undefined)
        logObject.total = `${format(metrics.totalTimeMs)}ms`;
      if (metrics.nodeCount !== undefined) logObject.nodes = metrics.nodeCount;
      if (metrics.heapSize !== undefined)
        logObject.heap = `${format(metrics.heapSize)}MB`;

      (config.logging.onMetrics ?? console.log)(`[${componentName}] Performance:`, logObject)
    },
    [componentName, config.logging]
  );

  // Frame tracking
  useEffect(() => {
    if (config.frames) {
      requestAnimationFrame(trackFrames);
    }
  }, [config.frames, trackFrames]);

  // Main metrics collection
  useEffect(() => {
    renderCount.current++;
    if (renderCount.current % (config.sampleRate ?? 1) !== 0) return;

    timings.current.start = performance.now();

    const cleanup = () => {
      timings.current.script = performance.now();

      requestAnimationFrame(() => {
        timings.current.render = performance.now();

        requestAnimationFrame(() => {
          timings.current.paint = performance.now();

          const element = document.querySelector(
            `[data-component="${componentName}"]`
          );
          const metrics = {
            ...calculateMetrics(),
            ...measureDOMMetrics(element),
            ...measureMemoryMetrics(),
          };

          metricsBuffer.current.push(metrics);

          if (metricsBuffer.current.length >= (config.bufferSize ?? 1)) {
            reportMetrics(metrics);
            metricsBuffer.current = [];
          }
        });
      });
    };

    return cleanup;
  });

  return null;
};
