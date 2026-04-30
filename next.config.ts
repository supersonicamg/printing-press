import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Transpile antd and its dependencies for Next.js compatibility
  transpilePackages: ['antd', '@ant-design/icons', 'rc-util', 'rc-pagination', 'rc-picker'],
  // Allow .jsx files in pages/components
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
};

export default nextConfig;
