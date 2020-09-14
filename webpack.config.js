/* eslint-disable no-undef */
const path = require('path');
const webpack = require('webpack');

module.exports = (env) => ({
  entry: './src/index.js',
  mode: "development",
  /*optimization: {
    minimize: true
  },*/
  devtool: 'inline-source-map',
  target: 'web',
  output: {
    filename: 'main.js',
    libraryTarget: 'window',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          presets: [[
            "@babel/preset-env",
            {
              targets: {
                esmodules: true,
              },
            }
          ]],
          plugins: ["transform-class-properties"]
        }
      },
      {
        test: /(\.txt)|(\.frag)|(\.vert)$/i,
        use: 'raw-loader',
      },
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      THREE: 'three', //['three', 'default']
      //THREE: [path.resolve(__dirname, './src/three.js'), 'default']
    }),
    new webpack.DefinePlugin({
      '__DEV__': env === 'dev' ? 'true' : 'false',
    }),
    new webpack.IgnorePlugin({resourceRegExp: /^fs$|^path$/})
  ],
  resolve: {
    symlinks: false,
    modules: [path.resolve(__dirname, 'node_modules')]
    /*alias: {
      "@/engine": path.resolve(__dirname, '../common/engine'),
    }*/
  },
  resolveLoader: {
    modules: [path.resolve(__dirname, 'node_modules')]
  },
});
