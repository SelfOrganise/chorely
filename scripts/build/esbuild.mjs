import fs from 'fs-extra';
import path from 'path';
import { build } from 'esbuild';
import { updateHtmlReferences } from './update-html-references.mjs';

const isProd = process.env.NODE_ENV === 'production';
const isDev = !isProd;

const copyPlugin = ({ from, to }) => ({
  name: 'copyPlugin',
  setup(build) {
    build.onEnd(() => {
      fs.copySync(from, to);
    });
  },
});

export const buildConfig = {
  logLevel: 'info',
  entryPoints: ['./src/index.tsx'],
  entryNames: isProd ? '[dir]/[name]-[hash]' : undefined,
  chunkNames: isProd ? 'chunks/[name]-[hash]' : undefined,
  minify: isProd,
  outdir: './dist/esbuild/js',
  outExtension: { '.js': '.mjs' },
  bundle: true,
  format: 'esm',
  splitting: true,
  metafile: true,
  sourcemap: true,
  target: 'esnext',
  loader: { '.svg': 'file', '.png': 'file' },
  watch: isDev,
  plugins: [copyPlugin({ from: './static/index.html', to: './dist/esbuild/index.html' })],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    BACKEND_ORIGIN: JSON.stringify(process.env.BACKEND_ORIGIN),
  },
};

const main = async () => {
  // clear build folder
  fs.emptydirSync('./dist/esbuild');

  await build(buildConfig);

  if (isProd) {
    updateHtmlReferences();
  }
};

try {
  await main();
} catch (ex) {
  console.error(ex);
  process.exit(1);
}
