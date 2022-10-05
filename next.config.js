/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack },
  ) => {
    config.experiments.topLevelAwait = true;
    // Important: return the modified config
    return config;
  },
};

module.exports = nextConfig;
