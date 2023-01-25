/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['media.discordapp.net', 'cdn.discordapp.com', 'raw.githubusercontent.com']
  }
}

module.exports = nextConfig
