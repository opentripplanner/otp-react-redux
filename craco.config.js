const { addBeforeLoader, loaderByName } = require('@craco/craco')


module.exports = {
  webpack: {
    configure: function(webpackConfig) {
      const yamlLoader = {
        test: /\.(yml|yaml)$/,
        loader: ['json-loader', 'yaml-loader']
      }
      addBeforeLoader(webpackConfig, loaderByName('file-loader'), yamlLoader )
      return webpackConfig
    }
  },
}
