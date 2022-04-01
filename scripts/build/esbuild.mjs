import fs from 'fs-extra';
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
  entryNames: isProd ? '[name]-[hash]' : '[name]',
  chunkNames: '[name]-[hash]',
  minify: isProd,
  outdir: './dist',
  outExtension: { '.js': '.mjs' },
  bundle: true,
  format: 'esm',
  splitting: true,
  metafile: false,
  sourcemap: isDev,
  target: 'esnext',
  loader: { '.svg': 'file', '.png': 'file' },
  legalComments: 'none',
  watch: isDev,
  plugins: [copyPlugin({ from: './static', to: './dist' })],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    BACKEND_ORIGIN: JSON.stringify(process.env.BACKEND_ORIGIN),
  },
};

const main = async () => {
  // clear build folder
  fs.emptydirSync('./dist');

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
