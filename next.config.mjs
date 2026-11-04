/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Marca o binário nativo do Argon2 para não ser empacotado pelo Webpack do cliente
  experimental: {
    serverComponentsExternalPackages: ['@node-rs/argon2'],
  },
};

export default nextConfig;
