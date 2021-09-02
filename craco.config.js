const path = require('path')

const { addBeforeLoader, loaderByName } = require('@craco/craco')

module.exports = {
  babel: {
    plugins: ['babel-plugin-add-module-exports', 'babel-plugin-lodash'],
    presets: ['@babel/preset-env', '@babel/preset-react']
  },
  jest: {
    configure: {
      moduleFileExtensions: ['js', 'jsx', 'json', 'png', 'yml'],
      notify: true,
      rootDir: process.cwd(),
      setupFilesAfterEnv: [
        '@wordpress/jest-puppeteer-axe',
        '<rootDir>/__tests__/test-utils/setup-env.js'
      ],
      testURL: 'http://localhost:9966'
    }
  },
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
    },
    externals: [
      {
        pdfkit: 'commonjs2 pdfkit'
      }
    ]
  }
}
