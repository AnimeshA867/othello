/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      "@radix-ui/react-dialog",
      "lucide-react",
      "framer-motion",
    ],
  },
  allowedDevOrigins: [
    "local-origin.dev",
    "*.local-origin.dev",
    "http://192.168.1.78:3000",
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
