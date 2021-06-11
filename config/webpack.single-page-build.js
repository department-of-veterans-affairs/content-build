const path = require('path');
const webpack = require('webpack');

const root = path.resolve(__dirname, '..');

module.exports = {
  entry: path.join(root, 'src', 'platform', 'lambdas', 'single-page-build.js'),
  output: {
    path: path.join(root, 'build', 'webpack.single-page-build'),
    filename: 'index.js',
    libraryTarget: 'commonjs',
  },
  target: 'node',
  node: { __dirname: true },
  plugins: [new webpack.IgnorePlugin(/process-cms-exports$/)],
  optimization: {
    // Disabling minimization to avoid errors from parsing optional chaining,
    // which our current versions of Terser + Webpack don't support.
    minimize: false,
  },
  externals: {
    'aws-sdk/clients/s3': 'commonjs2 aws-sdk/clients/s3',
  },
};
