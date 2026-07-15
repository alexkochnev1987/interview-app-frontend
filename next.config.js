const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin({
  requestConfig: './src/i18n/request.ts',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  output: 'standalone',
  allowedDevOrigins: ['127.0.0.1'],
  async redirects() {
    const nonDefaultLocales = ['be', 'ru', 'pl']

    return [
      {
        source: '/interviews',
        destination: '/',
        permanent: false,
      },
      {
        source: '/en/interviews',
        destination: '/',
        permanent: false,
      },
      ...nonDefaultLocales.map((locale) => ({
        source: `/${locale}/interviews`,
        destination: `/${locale}`,
        permanent: false,
      })),
    ]
  },
  async rewrites() {
    const apiUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
