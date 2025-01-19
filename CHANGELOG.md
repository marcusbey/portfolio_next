# Changelog

## [Unreleased]

### feat: add alternative email implementation
- Added Nodemailer implementation as an alternative to Resend
- Created new API endpoint for Nodemailer email sending
- Added documentation for both email implementations

### docs: add RESEND_API_KEY to environment variables example
### docs: update environment variables and recreate .env.example

### feat: add comprehensive SEO optimization
- Created SEO component for dynamic meta tags
- Updated _document.tsx with improved SEO and security headers
- Added web app manifest for PWA support
- Added robots.txt for search engine crawling
- Implemented proper favicon handling

### feat: add sitemap and favicon generation
- Added automatic sitemap.xml generation
- Created script for generating multiple favicon sizes
- Updated build process to include sitemap and favicon generation
- Added new npm scripts for manual generation

### feat: add Open Graph image generation
- Added script to generate OG and Twitter card images from profile picture
- Updated SEO component to use generated images
- Added social media meta tags and keywords
- Integrated OG image generation into build process

### fix: improve favicon generation and display
- Created new script for comprehensive favicon generation
- Added support for multiple favicon sizes
- Generated favicons from profile picture
- Updated SEO component with proper favicon meta tags
- Added site.webmanifest for PWA support

### fix: resolve image aspect ratio warnings
- Added proper width and height attributes to company logo images
- Added w-auto and h-auto classes to maintain aspect ratio
- Fixed Next.js Image component warnings in Experience component
