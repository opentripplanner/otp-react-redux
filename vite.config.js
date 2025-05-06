import { defineConfig } from 'vite'
import fs from 'fs-extra'
import path from 'path'
import react from '@vitejs/plugin-react'
import ViteYaml from '@modyfi/vite-plugin-yaml'

// Empty tmp folder before copying stuff.
fs.emptyDirSync('./tmp')

// TODO: Handle custom index.html

const CUSTOM_CSS = (process.env && process.env.CUSTOM_CSS) || './example.css'
fs.copySync(CUSTOM_CSS, './tmp/custom-styles.css')

const YAML_CONFIG =
  (process.env && process.env.YAML_CONFIG) || './example-config.yml'
fs.copySync(YAML_CONFIG, './tmp/config.yml')

const JS_CONFIG = process.env && process.env.JS_CONFIG
if (JS_CONFIG) {
  fs.ensureDirSync('./tmp/js/')
  // JS config can be one file or a folder. Files are placed in the ./tmp/js subfolder.
  if (JS_CONFIG.endsWith('.js')) {
    fs.copySync(JS_CONFIG, './tmp/js/config.js')
  } else {
    fs.copySync(JS_CONFIG, './tmp/js/')
  }
}

const PLAN_QUERY_RESOURCE_URI =
  (process.env && process.env.PLAN_QUERY_RESOURCE_URI) ||
  'node_modules/@opentripplanner/core-utils/src/planQuery.graphql'
fs.copySync(PLAN_QUERY_RESOURCE_URI, './tmp/planQuery.graphql')

// https://vite.dev/config/
export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      // Point JS files to the JSX loader
      // From https://stackoverflow.com/questions/74620427/how-to-configure-vite-to-allow-jsx-syntax-in-js-files
      loader: {
        '.js': 'jsx'
      }
    },
    force: true
  },
  plugins: [
    react(),
    ViteYaml()
  ],
  server: {
    port: 9966,
    strictPort: true
  }
})
