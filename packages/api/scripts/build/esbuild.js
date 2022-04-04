const fs = require('fs-extra');

const copyPlugin = ({ from, to }) => ({
  name: 'copyPlugin',
  setup(build) {
    build.onEnd(() => {
      fs.copySync(from, to);
    });
  },
});

require('esbuild').build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  platform: 'node',
  format: 'esm',
  target: ['node16'],
  external: ['pg-native'],
  outdir: 'dist',
  plugins: [copyPlugin({ from: './scripts/solver.py', to: './dist/scripts/solver.py' })],
  allowOverwrite: true,
});
