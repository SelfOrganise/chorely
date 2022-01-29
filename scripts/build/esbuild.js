require('esbuild').buildSync({
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  platform: 'node',
  format: 'esm',
  target: ['node16'],
  external: ['pg-native'],
  outdir: 'dist',
  allowOverwrite: true,
});
