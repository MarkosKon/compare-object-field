import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';
import { terser } from 'rollup-plugin-terser';

import pkg from './package.json';

const bundles = [
  {
    output: {
      file: pkg.module,
      format: 'es',
    },

    plugins: [terser()],
  },
  {
    output: {
      file: pkg.main,
      format: 'cjs',
    },
    plugins: [uglify()],
  },
  {
    output: {
      name: 'compareObjectField',
      file: 'dist/compare-object-field.umd.js',
      format: 'umd',
    },
    plugins: [uglify()],
  },
];

const common = {
  input: 'src/index.js',
  plugins: [babel({ exclude: 'node_modules/**' })],
};

export default bundles.map(({ output, plugins }) => ({
  ...common,
  output,
  plugins: common.plugins.concat(plugins),
}));
