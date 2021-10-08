const path = require('path')

const { addBeforeLoader, getLoaders, loaderByName } = require('@craco/craco')
const BabelRcPlugin = require('@jackwilsdon/craco-use-babelrc')
const fastRefreshCracoPlugin = require('craco-fast-refresh')
const fs = require('fs-extra')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const webpack = require('webpack')

module.exports = {
  plugins: [{ plugin: BabelRcPlugin }, { plugin: fastRefreshCracoPlugin }],
  // This is disabled as it creates a race condition which prevents load
  // See https://github.com/facebook/create-react-app/issues/10315
  // Type checking is done via babel
  typescript: { enableTypeChecking: false },
  /**
   * Webpack can be passed a few environment variables to override the default
   * files used to run this project. The environment variables are CUSTOM_CSS,
   * HTML_FILE, YAML_CONFIG, and JS_CONFIG. They must each be passed in the
   * format --env.*=/path/to/file. For example:
   *
   *    yarn start --env.YAML_CONFIG=/absolute/path/to/config.yml
   */
  webpack: {
    configure: function (webpackConfig, { env, paths }) {
      // Config items to adjust behavior to match mastarm behavior
      paths.appBuild = webpackConfig.output.path = path.join(__dirname, 'dist')
      paths.appSrc = path.resolve(__dirname, 'lib')
      paths.appIndexJs = path.resolve(__dirname, 'lib/main.js')

      // Support YAML
      const yamlLoader = {
        loader: ['json-loader', 'yaml-loader'],
        test: /\.(yml|yaml)$/
      }
      addBeforeLoader(webpackConfig, loaderByName('file-loader'), yamlLoader)

      // Support typescript
      const { matches } = getLoaders(
        webpackConfig,
        loaderByName('babel-loader')
      )
      matches.forEach(({ loader }) => {
        loader.test = /\.(js|jsx|ts|tsx)$/
        loader.exclude = /node_modules/
      })

      // trimet-mod-otp integration:
      // Gather the CSS, HTML, YAML, and JS override files.
      const CUSTOM_CSS =
        (process.env && process.env.CUSTOM_CSS) || '../example.css'
      const HTML_FILE =
        (process.env && process.env.HTML_FILE) || 'lib/index.tpl.html'
      const YAML_CONFIG =
        (process.env && process.env.YAML_CONFIG) || '../example-config.yml'
      // resolve the custom js file. If it is present, copy the file to a
      // temporary folder within this project so that the file will be able to
      // use the node_modules from this project
      let customJsFile = './config.js'
      if (process.env && process.env.JS_CONFIG) {
        const splitPath = process.env.JS_CONFIG.split(path.sep)
        customJsFile = `../tmp/${splitPath[splitPath.length - 1]}`
        // copy location is relative to root, while js file for app is relative to lib
        fs.copySync(
          process.env.JS_CONFIG,
          `./tmp/${splitPath[splitPath.length - 1]}`
        )
      }

      // Support React hot-reloading
      const hotLoaderEntries = []
      if (env === 'development') {
        hotLoaderEntries.push(
          require.resolve('react-dev-utils/webpackHotDevClient')
        )
      }
      webpackConfig.entry = [...hotLoaderEntries, paths.appIndexJs]

      // Allow for manual configuration of optimization plugins
      webpackConfig.optimization = {
        minimizer: [new TerserPlugin(), new OptimizeCSSAssetsPlugin({})]
      }

      // Custom plugins to allow trimet-mod-otp integration
      const hotLoaderPlugins = []
      if (env === 'development') {
        hotLoaderPlugins.push(new ReactRefreshWebpackPlugin())
      }
      webpackConfig.plugins = [
        ...hotLoaderPlugins,
        new HtmlWebpackPlugin({
          filename: 'index.html',
          inject: 'body',
          template: HTML_FILE
        }),
        new MiniCssExtractPlugin(),
        new webpack.DefinePlugin({
          CSS: JSON.stringify(CUSTOM_CSS),
          JS_CONFIG: JSON.stringify(customJsFile),
          // Optionally override the default config files with some other
          // files.
          YAML_CONFIG: JSON.stringify(YAML_CONFIG)
        })
      ]

      // Enable hot-reloading
      webpackConfig.devServer = {
        hot: true,
        static: './dist'
      }

      // Make source-maps useful
      webpackConfig.devtool = 'eval-cheap-module-source-map'

      // Match mastarm behavior
      webpackConfig.output = {
        filename: 'bundle.js',
        path: path.join(__dirname, '/dist'),
        publicPath: ''
      }

      return webpackConfig
    }
  }
}
