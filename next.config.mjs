/** @type {import('next').NextConfig} */
import nextMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import rehypePrism from "@mapbox/rehype-prism";

const nextConfig = {
  pageExtensions: ["tsx", "ts", "mdx"],
  reactStrictMode: true,
  images: {
    domains: [
      "api.microlink.io", // Microlink Image Preview
      "avatars.githubusercontent.com", // GitHub avatars
    ],
  },
  experimental: {
    newNextLinkBehavior: true,
    scrollRestoration: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Allow scripts from Vercel and other necessary sources
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://nownownow.io https://datafa.st https://*.vercel.app",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              // Allow connections to necessary APIs
              "connect-src 'self' https://api.github.com https://api.resend.com https://datafa.st https://vercel.live https://*.vercel.app wss://*.vercel.app https://*.vercel.live",
              "frame-src 'self' https://vercel.live",
              "media-src 'self'",
              "worker-src 'self' blob:",
              // Allow WebSocket connections
              "child-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
    ];
  },
  // Ensure API routes are properly handled
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

const withMDX = nextMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypePrism],
  },
});

export default withMDX(nextConfig);
