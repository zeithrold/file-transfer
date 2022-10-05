/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  webpack: (config, {}) => {
    config.experiments.topLevelAwait = true;
    // Important: return the modified config
    return config;
  },
  images: {
    domains: ['gravatar.loli.net'],
  },
};

module.exports = nextConfig;
