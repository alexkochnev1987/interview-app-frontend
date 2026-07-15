import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

import { DEFAULT_LOCALE, LOCALES } from './src/i18n/locales'

const withNextIntl = createNextIntlPlugin({
  requestConfig: './src/i18n/request.ts',
})

const nonDefaultLocales = LOCALES.filter((locale) => locale !== DEFAULT_LOCALE)

const nextConfig: NextConfig = {
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  output: 'standalone',
  allowedDevOrigins: ['127.0.0.1'],
  async redirects() {
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
    const apiUrl = process.env.BACKEND_URL || 'http://localhost:3000'
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ]
  },
}

export default withNextIntl(nextConfig)
