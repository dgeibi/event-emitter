import buble from 'rollup-plugin-buble';
import fs from 'fs';

const pkg = JSON.parse(fs.readFileSync('./package.json'));

export default {
  entry: 'src/index.js',
  useStrict: true,
  sourceMap: false,
  plugins: [
    buble(),
  ],
  targets: [
    { dest: pkg.main, format: 'cjs' },
  ],
};
