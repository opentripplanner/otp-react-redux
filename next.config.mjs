/** @type {import('next').NextConfig} */
const nextConfig = {
  // Outputs a Single-Page Application (SPA).
  distDir: './dist',
  // output: 'export', // Changes the build output directory to `./dist/`.
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.ya?ml$/,
      type: 'json',
      use: 'yaml-loader'
    })

    return config
  }
}

export default nextConfig
