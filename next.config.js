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
  headers: async () => {
    return [
      {
        source: '/',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.ZEITHROLD_ALIYUN_OSS_ENDPOINT,
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
