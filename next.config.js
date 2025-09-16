/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      // Não quebre o build por causa de lint no Vercel
      ignoreDuringBuilds: true,
    },
    typescript: {
      // (opcional) Não quebre o build por erros de TS no Vercel
      ignoreBuildErrors: true,
    },
  };
  
  module.exports = nextConfig;
  