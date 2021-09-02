const { addBeforeLoader, loaderByName } = require("@craco/craco");
const path = require("path");

module.exports = {
  babel: {
    plugins: ["babel-plugin-add-module-exports", 'babel-plugin-lodash'],
    presets: ["@babel/preset-env", "@babel/preset-react"],
  },
  jest: {
    configure: {
        rootDir: process.cwd(),
      setupFilesAfterEnv: [
        "@wordpress/jest-puppeteer-axe",
        "<rootDir>/__tests__/test-utils/setup-env.js"
      ]
    }
  },
  webpack: {
    configure: function (webpackConfig, { paths }) {
      const yamlLoader = {
        test: /\.(yml|yaml)$/,
        loader: ["json-loader", "yaml-loader"],
      };
      paths.appBuild = webpackConfig.output.path = path.resolve("dist");
      paths.appSrc = path.resolve(__dirname, "lib");
      paths.appIndexJs = path.resolve(__dirname, "example.js");
      webpackConfig.entry = paths.appIndexJs;
      addBeforeLoader(webpackConfig, loaderByName("file-loader"), yamlLoader);
      return webpackConfig;
    },
    externals: [
        {
          pdfkit: "commonjs2 pdfkit",
        }
      ]
    }
};
