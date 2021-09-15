const path = require('path')

const {
  addAfterLoader,
  addBeforeLoader,
  loaderByName
} = require('@craco/craco')
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

      const tsLoader = {
        include: paths.appSrc,
        loader: require.resolve('ts-loader'),
        options: { transpileOnly: true },
        test: /\.(js|mjs|jsx|ts|tsx)$/
      }

      addAfterLoader(webpackConfig, loaderByName('url-loader'), tsLoader)

      return webpackConfig
    }
  }
}
