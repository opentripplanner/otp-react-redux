import { defineConfig, transformWithEsbuild } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { yamlPlugin } from 'esbuild-plugin-yaml'
import fs from 'fs-extra'
import raw from 'vite-raw-plugin'
import react from '@vitejs/plugin-react'
import ViteYaml from '@modyfi/vite-plugin-yaml'

/**
 * Helper function to copy file based on an env variable.
 * @param {string} envVar The name of the environment variable that contains the custom file.
 * @param {string|(arg: string) => string} getDestFile The destination file or a function that computes it based on the extracted custom file.
 * @param {string} defaultFile Optional file to fall back on if no custom file is extracted from the environment variable.
 */
function customFile(envVar, getDestFile, defaultFile) {
  const fileName = (process.env && process.env[envVar]) || defaultFile
  if (fileName) {
    const destFile =
      typeof getDestFile === 'function' ? getDestFile(fileName) : getDestFile
    fs.copySync(fileName, destFile)
  }
}

// Empty tmp folder before copying stuff there.
fs.emptyDirSync('./tmp')

// TODO: Insert a script tag just below the <div id="main"></div> tag.

// index.html is placed at the root of the repo for Vite to pick up.
customFile('HTML_FILE', './index.html', './lib/index.tpl.html')
customFile('CUSTOM_CSS', './tmp/custom-styles.css', './example/example.css')
customFile('YAML_CONFIG', './tmp/config.yml', './example/example-config.yml')
customFile('PLAN_QUERY_RESOURCE_URI', './tmp/planQuery.graphql')
// JS_CONFIG can be a single file or a folder.
customFile(
  'JS_CONFIG',
  (file) => (file.endsWith('.js') ? './tmp/config.js' : '/tmp/'),
  './example/config.js'
)

export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      // Point JS files to the JSX loader (needed in addition to the JS-JSX conversion plugin below)
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

        // Use the exposed transform from Vite, instead of directly transforming with esbuild.
        // This is needed in addition to the esbuild js loader option above.
        // See https://stackoverflow.com/questions/74620427/how-to-configure-vite-to-allow-jsx-syntax-in-js-files
        return transformWithEsbuild(code, id, {
          jsx: 'automatic',
          loader: 'jsx'
        })
      }
    },

    ViteYaml(),
    // Support very old libraries such as blob-stream and its dependencies
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
