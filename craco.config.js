const path = require('path')

const { addBeforeLoader, loaderByName } = require('@craco/craco')
const BabelRcPlugin = require('@jackwilsdon/craco-use-babelrc')

module.exports = {
  plugins: [{ plugin: BabelRcPlugin }],
  webpack: {
    configure: function (webpackConfig, { paths }) {
      const yamlLoader = {
        loader: ['json-loader', 'yaml-loader'],
        test: /\.(yml|yaml)$/
      }
      paths.appBuild = webpackConfig.output.path = path.resolve('dist')
      paths.appSrc = path.resolve(__dirname, 'lib')
      paths.appIndexJs = path.resolve(__dirname, 'example.js')
      webpackConfig.entry = paths.appIndexJs
      addBeforeLoader(webpackConfig, loaderByName('file-loader'), yamlLoader)
      return webpackConfig
    }
  }
}
