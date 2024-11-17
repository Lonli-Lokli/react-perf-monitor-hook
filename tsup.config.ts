import { defineConfig } from 'tsup';

export default defineConfig({
  entryPoints: ['packages/react-perf-monitor-hook/src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  outDir: 'build/dist',
  clean: true,
});
