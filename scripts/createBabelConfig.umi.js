/**
 * https://github.com/umijs/umi/blob/master/packages/babel-preset-umi/src/index.js
 */
module.exports = function({ isDev, targets, browsers }) {
  const env = isDev ? 'development' : 'production';

  const plugins = [
    [require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }],
    [require.resolve('@babel/plugin-proposal-class-properties'), { loose: true }],
    // adds React import declaration if file contains JSX tags
    // require.resolve('babel-plugin-react-require'),
    require.resolve('@babel/plugin-syntax-dynamic-import'),
    require.resolve('@babel/plugin-proposal-object-rest-spread'),
    require.resolve('@babel/plugin-proposal-optional-catch-binding'),
    require.resolve('@babel/plugin-proposal-async-generator-functions'),
    require.resolve('@babel/plugin-proposal-export-namespace-from'),
    require.resolve('@babel/plugin-proposal-export-default-from'),
    require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
    require.resolve('@babel/plugin-proposal-optional-chaining'),
    require.resolve('@babel/plugin-proposal-pipeline-operator'),
    require.resolve('@babel/plugin-proposal-do-expressions'),
    require.resolve('@babel/plugin-proposal-function-bind'),
  ];

  if (env === 'production') {
    plugins.push(require.resolve('@babel/plugin-transform-react-constant-elements'));
  }

  if (env !== 'test') {
    plugins.push(require.resolve('@babel/plugin-transform-runtime'));
  }

  if (env === 'production') {
    plugins.push.apply(plugins, [
      require.resolve('babel-plugin-transform-react-remove-prop-types'),
    ]);
  }

  return {
    presets: [
      [
        require.resolve('@babel/preset-env'),
        {
          targets: targets || { browsers },
          useBuiltIns: 'entry',
          modules: false,
          exclude: [
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
      require.resolve('@babel/preset-react'),
    ],
    plugins,
  };
};
