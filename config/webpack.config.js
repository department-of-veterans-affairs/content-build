const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

const ENVIRONMENTS = require('../src/site/constants/environments');

const { VAGOVSTAGING, VAGOVPROD, LOCALHOST } = ENVIRONMENTS;

const getAbsolutePath = relativePath =>
  path.join(__dirname, '../', relativePath);
const apps = '';

const globalEntryFiles = {
  style: getAbsolutePath('src/platform/site-wide/sass/style.scss'),
};

module.exports = env => {
  const { buildtype = LOCALHOST } = env;
  const buildOptions = {
    buildtype,
    destination: buildtype,
    ...env,
  };

  const buildPath = path.resolve(
    __dirname,
    '../',
    'build',
    buildOptions.destination,
  );

  const entryFiles = Object.assign({}, apps, globalEntryFiles);
  const isOptimizedBuild = [VAGOVSTAGING, VAGOVPROD].includes(buildtype);

  return {
    mode: process.env.NODE_ENV || 'development',
    entry: entryFiles,
    output: {
      path: path.resolve(buildPath, 'css'),
    },
    plugins: [new MiniCssExtractPlugin()],
    module: {
      rules: [
        {
          test: /\.(s[ac]|c)ss$/i,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: ['autoprefixer'],
                },
              },
            },
            'sass-loader',
          ],
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
      ],
    },
    target: process.env.NODE_ENV === 'production' ? 'browserslist' : 'web',
    devtool: isOptimizedBuild ? 'source-map' : 'eval-source-map',
    devServer: {
      static: {
        directory: path.join(__dirname, `../build/${buildOptions.destination}`),
      },
      compress: true,
      port: 3002,
    },
  };
};
