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
            value: process.env.NODE_ENV === 'development' 
              ? 'default-src * self blob: data: gap:; style-src * self \'unsafe-inline\' blob: data: gap:; script-src * \'self\' \'unsafe-eval\' \'unsafe-inline\' blob: data: gap:; object-src * \'self\' blob: data: gap:; img-src * self \'unsafe-inline\' blob: data: gap:; connect-src self * \'unsafe-inline\' blob: data: gap:; frame-src * self blob: data: gap:;'
              : [
                  "default-src 'self'",
                  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://nownownow.io https://datafa.st https://vercel.live",
                  "style-src 'self' 'unsafe-inline'",
                  "img-src 'self' data: https: blob:",
                  "font-src 'self' data:",
                  "connect-src 'self' https://api.github.com https://api.resend.com https://datafa.st https://vercel.live",
                  "frame-src 'self'",
                  "media-src 'self'",
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
