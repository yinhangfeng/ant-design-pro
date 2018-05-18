// babel-plugin-dynamic-const-node-sync
// umi preset

// TODO https://github.com/jamiebuilds/babel-react-optimize
module.exports = function({ isDev }) {
  const plugins = [['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }]];
  if (isDev) {
    // 开发环境不需要分包加载
    // 是否可以通过 splitchunks 配置? https://webpack.js.org/configuration/optimization/#optimization-splitchunks
    plugins.push('dynamic-import-node-sync');
    plugins.push('dva-hmr');
  }
  // else {
  //   plugins.push('dynamic-import-node-sync');
  // }

  return {
    presets: [
      // TODO options https://github.com/umijs/umi/blob/master/packages/babel-preset-umi/src/index.js
      // useBuiltIns https://github.com/babel/babel/blob/master/packages/babel-preset-env/README.md
      [
        'babel-preset-umi',
        {
          useBuiltIns: 'entry',
        },
      ],
    ],
    plugins,
    babelrc: false,
  };
};
