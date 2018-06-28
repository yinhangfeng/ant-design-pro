'use strict';

/**
 * https://github.com/facebook/react-native/blob/master/babel-preset/configs/main.js
 * https://github.com/umijs/umi/blob/master/packages/babel-preset-umi/src/index.js
 * https://github.com/facebook/create-react-app/blob/next/packages/babel-preset-react-app/index.js
 *
 * https://github.com/babel/babel/blob/master/packages/babel-preset-env/package.json
 * https://github.com/babel/babel/blob/master/packages/babel-preset-stage-3/package.json
 * https://github.com/babel/babel/blob/master/packages/babel-preset-stage-2/package.json
 * https://github.com/babel/babel/blob/master/packages/babel-preset-stage-1/package.json
 * https://github.com/babel/babel/blob/master/packages/babel-preset-stage-0/package.json
 *
 * TODO https://github.com/jamiebuilds/babel-react-optimize
 */
module.exports = function({ isDev, targets, browsers }) {
  const extraPlugins = [
    // require.resolve('@babel/plugin-proposal-optional-catch-binding'),
    // // require.resolve('@babel/plugin-proposal-async-generator-functions'),
    [require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }],
    // require.resolve('@babel/plugin-proposal-export-namespace-from'),
    // require.resolve('@babel/plugin-proposal-export-default-from'),
    // require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
    // require.resolve('@babel/plugin-proposal-optional-chaining'),
    // require.resolve('@babel/plugin-proposal-pipeline-operator'),
    // require.resolve('@babel/plugin-proposal-do-expressions'),
    // require.resolve('@babel/plugin-proposal-function-bind'),
    ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }],
  ];
  if (isDev) {
    // 开发环境不需要分包加载
    // extraPlugins.push('transform-dynamic-import'),
    // 与 transform-dynamic-import 的区别 https://github.com/seeden/babel-plugin-dynamic-import-node-sync
    extraPlugins.push('dynamic-import-node-sync');
    // extraPlugins.push('dva-hmr');
  }
  // else {
  //   extraPlugins.push('dynamic-import-node-sync');
  // }

  // create-react-app
  return {
    presets: [
      [
        // Latest stable ECMAScript features
        // 包括的插件 https://github.com/babel/babel/blob/master/packages/babel-preset-env/data/plugins.json
        // 包括的 built-ins https://github.com/babel/babel/blob/master/packages/babel-preset-env/data/built-ins.json
        require('@babel/preset-env').default,
        {
          targets: targets || { browsers },
          // `entry` transforms `@babel/polyfill` into individual requires for
          // the targeted browsers. This is safer than `usage` which performs
          // static code analysis to determine what's required.
          // This is probably a fine default to help trim down bundles when
          // end-users inevitably import '@babel/polyfill'.
          // preset-env 的 useBuiltIns 不为 false 会给内部所有插件传递 useBuiltIns true
          useBuiltIns: 'entry',
          // Do not transform modules to CJS
          modules: false,
          // TODO
          exclude: [
            // promise 使用 bluebird
            // 'es6.promise',
            // 'es7.promise.finally',

            'transform-typeof-symbol',
            'transform-unicode-regex',
            'transform-sticky-regex',
            'transform-object-super',
            'transform-new-target',
            'transform-modules-umd',
            'transform-modules-systemjs',
            'transform-modules-amd',
            'transform-literals',
            'transform-duplicate-keys',
          ],
        },
      ],
      [
        require('@babel/preset-react').default,
        {
          // Adds component stack to warning messages
          // Adds __self attribute to JSX which React will use for some warnings
          development: isDev,
          // Will use the native built-in instead of trying to polyfill
          // behavior for any plugins that require one.
          useBuiltIns: true,
        },
      ],
      // [require('@babel/preset-flow').default],
    ],
    plugins: extraPlugins
      .concat([
        // Necessary to include regardless of the environment because
        // in practice some other transforms (such as object-rest-spread)
        // don't work without it: https://github.com/babel/babel/issues/7215
        // TODO 上面的 BUG 还在?
        // require('@babel/plugin-transform-destructuring').default,
        // class { handleClick = () => { } }
        // Enable loose mode to use assignment instead of defineProperty
        // See discussion in https://github.com/facebook/create-react-app/issues/4263
        // babel-preset-stage-3
        [
          require('@babel/plugin-proposal-class-properties').default,
          {
            loose: true,
          },
        ],
        // The following two plugins use Object.assign directly, instead of Babel's
        // extends helper. Note that this assumes `Object.assign` is available.
        // { ...todo, completed: true }
        // 虽然包括在 babel-preset-env 中 但需要开启 shippedProposals
        [
          require('@babel/plugin-proposal-object-rest-spread').default,
          {
            useBuiltIns: true,
          },
        ],
        // Polyfills the runtime needed for async/await and generators https://babeljs.io/docs/en/next/babel-plugin-transform-runtime.html
        [
          require('@babel/plugin-transform-runtime').default,
          {
            helpers: true,
            polyfill: false,
            regenerator: true,
          },
        ],
        !isDev && [
          // Remove PropTypes from production build
          require('babel-plugin-transform-react-remove-prop-types').default,
          {
            removeImport: true,
          },
        ],
        // function* () { yield 42; yield 43; }
        // preset-env 已经包括
        // [
        //   require('@babel/plugin-transform-regenerator').default,
        //   {
        //     // Async functions are converted to generators by @babel/preset-env
        //     async: false,
        //   },
        // ],
        // Adds syntax support for import()
        require('@babel/plugin-syntax-dynamic-import').default,
      ])
      .filter(Boolean),
    babelrc: false,
  };
};
