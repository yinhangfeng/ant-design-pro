const webpack = require('webpack');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const SystemBellWebpackPlugin = require('system-bell-webpack-plugin');
// const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const postcssFlexbugsFixes = require('postcss-flexbugs-fixes');
const autoprefixer = require('autoprefixer');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { resolve } = require('path');
// const fs = require('fs');
// const {
//   TsConfigPathsPlugin
// } = require('awesome-typescript-loader');

const getBabelConfig = require('./babel.config.js');
const theme = require('../src/theme');

const projectRoot = resolve(__dirname, '../');

function projectPath(relativePath) {
  return resolve(projectRoot, relativePath);
}

// https://webpack.js.org/configuration
// https://github.com/umijs/umi/blob/master/packages/af-webpack/src/getConfig.js
// https://github.com/facebook/create-react-app/blob/next/packages/react-scripts/config/webpack.config.prod.js
// TODO serviceworker typescript sass
// TODO js css file-loader 输出路径
module.exports = function(env = { production: false } /* , argv */) {
  if (env.production) {
    // babel-preset-umi 是根据 NODE_ENV 判断的
    process.env.NODE_ENV = 'production';
  }

  const isDev = !env.production;

  // https://github.com/browserslist/browserslist
  let browsers;
  if (isDev) {
    // dev 环境只兼容新浏览器 以方便调试 增加编译速度 TODO 用环境变量配置
    browsers = ['last 3 Chrome versions'];
  } else {
    browsers = [
      '>1%',
      'last 4 versions',
      'Firefox ESR',
      'not ie < 9', // React doesn't support IE8 anyway
    ];
  }

  const postcssOptions = {
    // Necessary for external CSS imports to work
    // https://github.com/facebookincubator/create-react-app/issues/2677
    ident: 'postcss',
    plugins: () => [
      postcssFlexbugsFixes,
      autoprefixer({
        browsers,
        flexbox: 'no-2009',
      }),
    ],
  };
  const cssModulesConfig = {
    modules: true,
    localIdentName: isDev ? '[name]__[local]___[hash:base64:5]' : '[local]___[hash:base64:5]',
  };
  const lessOptions = {
    modifyVars: theme,
  };
  const cssOptions = {
    constLoaders: 1,
    ...(!isDev && {
      minimize: {
        // ref: https://github.com/umijs/umi/issues/164
        minifyFontValues: false,
      },
      sourceMap: true,
    }),
  };

  function getCSSLoader({ cssModules, less } = {}) {
    const loaders = [
      'style-loader',
      {
        loader: 'css-loader',
        options: {
          ...cssOptions,
          ...(cssModules && cssModulesConfig),
        },
      },
      {
        loader: 'postcss-loader',
        options: postcssOptions,
      },
    ];
    if (less) {
      loaders.push({
        loader: 'less-loader',
        options: lessOptions,
      });
    }
    return loaders;
  }

  const cssRules = [
    {
      test: /\.css$/,
      exclude: /node_modules/,
      use: getCSSLoader({
        cssModules: true,
      }),
    },
    {
      test: /\.css$/,
      include: /node_modules/,
      use: getCSSLoader(),
    },
    {
      test: /\.less$/,
      exclude: /node_modules/,
      use: getCSSLoader({
        cssModules: true,
        less: true,
      }),
    },
    {
      test: /\.less$/,
      include: /node_modules/,
      use: getCSSLoader({
        less: true,
      }),
    },
  ];

  if (!isDev) {
    cssRules.forEach(rule => {
      rule.use[0] = MiniCssExtractPlugin.loader;
    });
  }

  const outputPath = projectPath('dist');

  // js 和 css 采用不同的 hash 算法
  const jsHash = !isDev ? '.[chunkhash:8]' : '';
  const cssHash = !isDev ? '.[contenthash:8]' : '';

  const babelUse = [
    {
      loader: 'babel-loader',
      options: getBabelConfig({
        isDev,
        browsers,
      }),
    },
  ];

  const plugins = [
    isDev && new webpack.HotModuleReplacementPlugin(),
    // https://www.npmjs.com/package/react-dev-utils
    // TODO
    // isDev && new WatchMissingNodeModulesPlugin(projectPath('node_modules')),
    // https://github.com/jannesmeyer/system-bell-webpack-plugin
    isDev && new SystemBellWebpackPlugin(),
    // 用于代替 devtool 选项 进行更细粒度的控制 https://doc.webpack-china.org/plugins/source-map-dev-tool-plugin/
    // TODO
    // isDev && new webpack.SourceMapDevToolPlugin({
    //   columns: false,
    //   moduleFilenameTemplate: info => {
    //     if (
    //       /\/koi-pkgs\/packages/.test(
    //         info.absoluteResourcePath,
    //       ) ||
    //       /packages\/koi-core/.test(info.absoluteResourcePath) ||
    //       /webpack\/bootstrap/.test(info.absoluteResourcePath) ||
    //       /\/node_modules\//.test(info.absoluteResourcePath)
    //     ) {
    //       return `internal:///${info.absoluteResourcePath}`;
    //     }
    //     return resolve(info.absoluteResourcePath).replace(
    //       /\\/g,
    //       '/',
    //     );
    //   },
    // }),

    !isDev &&
      new CleanWebpackPlugin([outputPath], {
        root: projectRoot,
      }),
    !isDev &&
      new MiniCssExtractPlugin({
        filename: `[name]${cssHash}.css`,
        chunkFilename: `[id]${cssHash}.css`,
      }),

    // 只定义 process.env.NODE_ENV 的话在 webpack4 以上可以省略
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
      // 'process.env.HMR': process.env.HMR,
    }),
    new HTMLWebpackPlugin({
      template: projectPath('src/index.ejs'),
    }),
    // https://github.com/Urthen/case-sensitive-paths-webpack-plugin
    new CaseSensitivePathsPlugin(),
    // https://doc.webpack-china.org/plugins/ignore-plugin 忽略 moment 的本地化内容
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new CopyWebpackPlugin([
      {
        from: projectPath('public'),
        to: outputPath,
        toType: 'dir',
      },
    ]),
    // https://github.com/webpack-contrib/webpack-bundle-analyzer
    process.env.ANALYZE &&
      new BundleAnalyzerPlugin({
        analyzerMode: 'server',
        analyzerPort: process.env.ANALYZE_PORT || 8888,
        openAnalyzer: true,
      }),
  ].filter(Boolean);

  const config = {
    mode: isDev ? 'development' : 'production',
    // TODO webpackHotDevClientPath
    entry: projectPath('src/index.js'),
    output: {
      path: outputPath,
      // Add /* filename */ comments to generated require()s in the output.
      pathinfo: isDev,
      filename: `[name]${jsHash}.js`,
      publicPath: '/',
      chunkFilename: `[name]${jsHash}.async.js`,
    },
    // 'source-map'
    devtool: isDev ? 'eval-source-map' : 'none',
    devServer: isDev
      ? {
          port: 9007,
          proxy: {
            '/api': 'http://localhost:8000',
          },
        }
      : {},
    bail: !isDev,
    // devtool,
    resolve: {
      // modules,
      extensions: [
        '.web.js',
        '.web.jsx',
        '.web.ts',
        '.web.tsx',
        '.js',
        '.json',
        '.jsx',
        '.ts',
        '.tsx',
      ],
      alias: {
        components: projectPath('src/components'),
      },
      // plugins: [new TsConfigPathsPlugin()],
    },
    module: {
      rules: [
        // https://github.com/webpack-contrib/url-loader
        // 考虑 减小 limit 或者 直接用 file-loader
        {
          exclude: [/\.html|ejs$/, /\.json$/, /\.(js|jsx|ts|tsx)$/, /\.(css|less|scss|sass)$/],
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: 'static/[name].[hash:8].[ext]',
          },
        },
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: babelUse,
        },
        // {
        //   test: /\.(ts|tsx)$/,
        //   exclude: /node_modules/,
        //   use: [
        //     ...babelUse,
        //     {
        //       loader: 'awesome-typescript-loader',
        //       options: {
        //         transpileOnly: true,
        //       },
        //     },
        //   ],
        // },
        {
          test: /\.html$/,
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
          },
        },
        ...cssRules,
      ],
    },
    plugins,
    // externals: {},
    // node: {
    //   dgram: 'empty',
    //   fs: 'empty',
    //   net: 'empty',
    //   tls: 'empty',
    //   child_process: 'empty',
    // },
    performance: isDev
      ? {
          hints: false,
        }
      : undefined,
    // TODO 该配置比默认的差
    // optimization: isDev ? undefined : {
    //   minimizer: [new UglifyJsPlugin({
    //     uglifyOptions: {
    //       compress: {
    //         ie8: false, // React doesn't support IE8
    //         warnings: false,
    //       },
    //       mangle: {
    //         ie8: false,
    //       },
    //       output: {
    //         comments: false,
    //         ascii_only: true,
    //       },
    //       sourceMap: true,
    //     },
    //   })],
    //   // splitChunks,
    // },
  };

  return config;
};
