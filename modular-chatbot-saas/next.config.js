/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    output: 'standalone',
    images: {
        domains: ['localhost'],
    },
    env: {
        BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3000',
    },
}

module.exports = nextConfig
