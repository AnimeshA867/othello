/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      "@radix-ui/react-dialog",
      "lucide-react",
      "framer-motion",
    ],
  },
};

export default nextConfig;
