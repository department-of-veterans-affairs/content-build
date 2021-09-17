const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ENVIRONMENTS = require('../src/site/constants/environments');

const { LOCALHOST } = ENVIRONMENTS;

module.exports = async (env = {}) => {
  const { buildtype = LOCALHOST } = env;
  const buildOptions = {
    api: '',
    buildtype,
    host: LOCALHOST,
    port: 3002,
    scaffold: false,
    watch: false,
    destination: buildtype,
    ...env,
  };

  // const isOptimizedBuild = [VAGOVSTAGING, VAGOVPROD].includes(buildtype);
  // const isOptimizedBuild = false;
  // const enableCSSSourcemaps =
  //   buildtype !== LOCALHOST ||
  //   buildOptions['local-css-sourcemaps'] ||
  //   !!buildOptions.entry;

  const getAbsolutePath = relativePath =>
    path.join(__dirname, '../', relativePath);

  const globalEntryFiles = {};
  const apps = {
    style: getAbsolutePath('src/platform/site-wide/sass/style.scss'),
  };

  const buildPath = path.resolve(
    __dirname,
    '../',
    'build',
    buildOptions.destination,
  );

  const entryFiles = Object.assign({}, apps, globalEntryFiles);

  return {
    devtool: 'source-map',
    mode: 'production',
    entry: entryFiles,
    output: {
      path: path.resolve(buildPath, 'generated'),
    },
    module: {
      rules: [
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            'cache-loader',
            {
              loader: 'css-loader',
              options: {},
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [require('autoprefixer'), require('cssnano')],
                },
              },
            },
            {
              loader: 'sass-loader',
            },
          ],
        },
      ],
    },
    plugins: [new MiniCssExtractPlugin()],
  };
};
