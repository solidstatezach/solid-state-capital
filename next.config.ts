import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '192.168.1.181',
    '192.168.1.183',
    '10.71.62.224',
    'localhost',
  ],
}

export default nextConfig
