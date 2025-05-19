import { defineConfig, transformWithEsbuild } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { yamlPlugin } from 'esbuild-plugin-yaml'
import fs from 'fs-extra'
import raw from 'vite-raw-plugin'
import react from '@vitejs/plugin-react'
import ViteYaml from '@modyfi/vite-plugin-yaml'

// Empty tmp folder before copying stuff there.
fs.emptyDirSync('./tmp')

// TODO: Handle custom index.html

const CUSTOM_CSS = (process.env && process.env.CUSTOM_CSS) || './example.css'
fs.copySync(CUSTOM_CSS, './tmp/custom-styles.css')

// For the config.yml file, convert to JSON for direct import
// because existing YAML plugins are not able to handle special characters in the YML file.
// TODO: Put this into a config inline plugin.
const YAML_CONFIG =
  (process.env && process.env.YAML_CONFIG) || './example/example-config.yml'
fs.copySync(YAML_CONFIG, './tmp/config.yml')

const JS_CONFIG =
  (process.env && process.env.JS_CONFIG) || './example/config.js'
if (JS_CONFIG) {
  // JS config can be one file or the content of a folder. Files are placed in the ./tmp subfolder.
  if (JS_CONFIG.endsWith('.js')) {
    fs.copySync(JS_CONFIG, './tmp/config.js')
  } else {
    fs.copySync(JS_CONFIG, './tmp/')
  }
}

const PLAN_QUERY_RESOURCE_URI =
  process.env && process.env.PLAN_QUERY_RESOURCE_URI
if (PLAN_QUERY_RESOURCE_URI) {
  fs.copySync(PLAN_QUERY_RESOURCE_URI, './tmp/planQuery.graphql')
}

// https://vite.dev/config/
export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      // Point JS files to the JSX loader (neededin addition to the JS-JSX conversion plugin below)
      // From https://stackoverflow.com/questions/74620427/how-to-configure-vite-to-allow-jsx-syntax-in-js-files
      loader: {
        '.js': 'jsx'
      },
      plugins: [yamlPlugin()]
    }
  },
  plugins: [
    {
      name: 'treat-js-files-as-jsx',
      async transform(code, id) {
        if (!id.match(/(lib|tmp)\/.*\.js$/)) return null

        // Use the exposed transform from vite, instead of directly
        // transforming with esbuild (needed in addition to the esbuild js loader option above)
        // From https://stackoverflow.com/questions/74620427/how-to-configure-vite-to-allow-jsx-syntax-in-js-files
        return transformWithEsbuild(code, id, {
          jsx: 'automatic',
          loader: 'jsx'
        })
      }
    },

    ViteYaml(),
    // Support old libraries such as blob and its dependencies
    nodePolyfills({
      protocolImports: true
    }),
    raw({
      fileRegex: /\.graphql$/
    }),
    react()
  ],
  server: {
    port: 9966,
    strictPort: true
  }
})
