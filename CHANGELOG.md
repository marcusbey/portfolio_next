# Changelog

## [Unreleased]

### style: improve page layout with max-width constraint
- Added max-w-7xl container in main layout component
- Applied responsive padding with px-4 sm:px-6 lg:px-8
- Enhanced overall page readability and content focus

### security: implement comprehensive Content-Security-Policy
- Added Content-Security-Policy meta tag to _document.tsx
- Updated server-level CSP headers in next.config.mjs (preferred approach)
- Configured script-src directive to allow 'self', widget.nownownow.io, www.nownownow.io, and datafa.st
- Added connect-src directive to allow API connections to datafa.st and www.nownownow.io
- Enhanced security while maintaining widget and analytics functionality

### feat: add vercel analytics
- Integrated Vercel Analytics into the application by adding the `<Analytics />` component to `pages/_app.tsx`.

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

### fix: resolve moment.js date format warnings
- Created dateFormatter utility for consistent date handling
- Added proper date format validation
- Fixed 'Present' date handling
- Improved type safety for date formatting
- Removed direct moment.js usage in components

### fix: enhance contact form email delivery debugging
- Added comprehensive logging for email sending process
- Improved environment variable validation
- Enhanced error handling and reporting
- Added detailed request and response logging
- Improved error messages for better debugging

### fix: improve contact form API configuration
- Added NEXT_PUBLIC_API_URL environment variable
- Enhanced CORS handling for development
- Improved API endpoint error messages
- Added emojis to console logs for better visibility
- Added request origin validation

### fix: add proper Resend API response type handling
- Added ResendEmailResponse interface
- Fixed type error with Resend API response
- Added null checks for response data
- Improved error handling for API responses

### fix: resolve favicon and contact form issues
- Added comprehensive favicon configuration
- Added multiple favicon sizes support
- Updated Content Security Policy for Resend API
- Improved contact form error handling
- Added form clearing on successful submission
- Added better console logging with emojis

### fix: enhance email API error handling
- Added detailed environment variable logging
- Added Resend API initialization error handling
- Added raw API response logging
- Added detailed error messages with timestamps
- Added nested try-catch for better error isolation
