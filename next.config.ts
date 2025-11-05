import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactCompiler: true,
    poweredByHeader: false,
    images: {
        unoptimized: true
    },
};

export default nextConfig;
