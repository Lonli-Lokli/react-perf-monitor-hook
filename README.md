# React Performance Monitor Hook

A highly configurable React hook for monitoring and reporting various performance metrics in React components, including frame rates, memory usage, DOM metrics, and timing measurements.

## Table of Contents
- [Installation](#installation)
- [Features](#features)
- [Usage](#usage)
- [Configuration](#configuration)
  - [Configuration Options](#configuration-options)
  - [Default Configuration](#default-configuration)
- [Examples](#examples)
  - [Basic Usage](#basic-usage)
  - [Custom Configuration](#custom-configuration)
  - [Selective Monitoring](#selective-monitoring)
- [Output Format](#output-format)
- [Important Notes](#important-notes)
- [Best Practices](#best-practices)
- [Browser Support](#browser-support)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)
- [Acknowledgments](#acknowledgments)

## Installation

```bash
npm install react-performance-monitor
# or
yarn add react-performance-monitor
```

## Features

- 📊 Frame metrics (FPS, dropped frames)
- 💾 Memory usage tracking
- 🌳 DOM metrics (node count, mutations)
- ⏱️ Timing measurements (render, script, paint)
- 📝 Customizable logging
- 🎯 Configurable sampling rate
- 📈 Metrics buffering

## Usage

```jsx
import { usePerformanceMonitor } from 'react-performance-monitor';

function MyComponent() {
  usePerformanceMonitor('MyComponent', {
    frames: true,
    memory: true,
    dom: true,
    timing: true
  });

  return (
    <div data-component="MyComponent">
      {/* Your component content */}
    </div>
  );
}
```

## Configuration

The hook accepts two parameters:
- `componentName`: string - Unique identifier for the component
- `config`: PerformanceMonitorConfig (optional) - Configuration object

### Configuration Options

```typescript
interface PerformanceMonitorConfig {
  frames?: boolean | {
    fps?: boolean;      // Track frames per second
    dropped?: boolean;  // Track dropped frames count
  };
  
  memory?: boolean | {
    nodes?: boolean;    // Track detached DOM nodes
    heap?: boolean;     // Track heap memory usage
  };
  
  dom?: boolean | {
    count?: boolean;    // Track total node count
    mutations?: boolean; // Track node additions/removals
  };
  
  timing?: boolean | {
    render?: boolean;   // Track render time
    script?: boolean;   // Track script execution time
    paint?: boolean;    // Track painting time
  };
  
  logging?: {
    enabled?: boolean;  // Enable/disable logging
    decimals?: number;  // Number of decimal points for durations
    prefix?: string;    // Log prefix format
    onMetrics?: (message?: any, ...optionalParams: any[]) => void;
  };
  
  sampleRate?: number;  // Measure every nth render
  bufferSize?: number;  // Number of measurements to average
}
```

### Default Configuration

```typescript
const DEFAULT_CONFIG = {
  frames: { fps: true, dropped: false },
  memory: { nodes: true, heap: false },
  dom: { count: true, mutations: false },
  timing: { render: true, script: true, paint: true },
  logging: { enabled: true, decimals: 2, onMetrics: console.log },
  sampleRate: 1,
  bufferSize: 1
};
```

## Examples

### Basic Usage

```jsx
function SimpleComponent() {
  usePerformanceMonitor('SimpleComponent');
  return <div data-component="SimpleComponent">Hello World</div>;
}
```

### Custom Configuration

```jsx
function ComplexComponent() {
  usePerformanceMonitor('ComplexComponent', {
    frames: { fps: true, dropped: true },
    memory: { heap: true },
    dom: { count: true, mutations: true },
    timing: { render: true, paint: true },
    logging: {
      decimals: 1,
      onMetrics: (message, metrics) => {
        // Custom metrics handling
        console.log(`${message}:`, metrics);
      }
    },
    sampleRate: 5,  // Monitor every 5th render
    bufferSize: 3   // Average 3 measurements before reporting
  });

  return (
    <div data-component="ComplexComponent">
      {/* Component content */}
    </div>
  );
}
```

### Selective Monitoring

```jsx
function OptimizedComponent() {
  usePerformanceMonitor('OptimizedComponent', {
    // Only monitor frame rate and render timing
    frames: { fps: true },
    timing: { render: true },
    memory: false,
    dom: false
  });

  return <div data-component="OptimizedComponent">{/* Content */}</div>;
}
```

## Output Format

The hook outputs performance metrics in the following format:

```javascript
{
  fps: "59.94 fps",          // Current frames per second
  dropped: 2,                // Number of dropped frames
  render: "1.50ms",          // Render time
  script: "0.75ms",          // Script execution time
  paint: "0.25ms",           // Paint time
  total: "2.50ms",           // Total operation time
  nodes: 150,                // Total DOM node count
  heap: "25.5MB"            // Heap memory usage
}
```

## Important Notes

1. The component being monitored must have a `data-component` attribute matching the `componentName` parameter for DOM metrics to work properly.
2. Memory metrics (heap size) may not be available in all browsers.
3. High sampling rates or low buffer sizes may impact performance.
4. Frame metrics are most accurate when measured over longer periods.

## Best Practices

- Use a higher `sampleRate` for frequently updating components
- Increase `bufferSize` for more stable measurements
- Disable unnecessary metrics to reduce overhead
- Consider disabling logging in production
- Use custom `onMetrics` handlers for production monitoring

## Browser Support

The hook uses the following Web APIs:
- Performance Observer API
- Performance Timeline API
- requestAnimationFrame

Supported in all modern browsers:
- Chrome 58+
- Firefox 57+
- Safari 11+
- Edge 79+

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Lonli-Lokli
- GitHub: [@Lonli-Lokli](https://github.com/yourusername)

## Acknowledgments

- Inspired by React DevTools performance monitoring
- Built with React Hooks
- Special thanks to Claude AI