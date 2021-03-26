const CracoLessPlugin = require('craco-less');
const webpack = require('webpack');

let buildMode = 'local';
if (process.argv.indexOf('dev') > -1) buildMode = 'dev';
if (process.argv.indexOf('prod') > -1) buildMode = 'prod';
if (process.argv.indexOf('stg') > -1) buildMode = 'stg';
const raw = Object.keys(process.env).reduce(
  (env, key) => {
    env[key] = process.env[key];
    return env;
  },
  {
    BUILD_TIME: new Date(),
    BUILD_USERNAME: process.env.USERNAME,
    BUILD_MODE: buildMode,
  }
);

module.exports = {
  babel: {
    plugins: [
      ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }],
    ],
  },
  webpack: {
    plugins: [
      new webpack.DefinePlugin({
        'process.env': Object.keys(raw).reduce((env, key) => {
          env[key] = JSON.stringify(raw[key]);
          return env;
        }, {}),
      }),
    ],
    configure: (webpackConfig, { env, paths }) => {
      return webpackConfig;
    },
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              '@primary-color': '#17B978',
              '@text-selection-bg': '#1890ff',
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
