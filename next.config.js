module.exports = {
  eslint: {
    dirs: ["pages", "utils"], // Only run ESLint on the 'pages' and 'utils' directories during production builds (next build)
  },
  webpack: (config, { isServer }) => {
    // Shared modules may lazy-require Node built-ins (e.g. fs in saveLogsUsingFs). Browser bundles must not resolve them.
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};
