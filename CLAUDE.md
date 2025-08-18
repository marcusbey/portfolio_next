# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 13.2.4 personal/portfolio website for Romain Boboe, using TypeScript and Tailwind CSS. The site features a blog system with MDX support, project showcases, and contact functionality.

## Essential Commands

```bash
# Development
npm run dev              # Start development server on http://localhost:3000

# Building & Production
npm run build            # Build for production (includes sitemap generation)
npm run start            # Start production server

# Testing
npm run test             # Run tests once
npm run test:watch       # Run tests in watch mode

# Code Quality
npm run lint             # Run Next.js linter

# Site Generation
npm run generate:sitemap # Generate sitemap.xml
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 13.2.4 with Pages Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS with custom theme and plugins
- **Blog**: MDX for content with syntax highlighting
- **Email**: Resend API for contact form
- **Animations**: Framer Motion
- **Testing**: Jest with React Testing Library

### Key Directories
- `/pages` - Next.js pages and API routes
- `/pages/blogs` - MDX blog posts
- `/components` - React components
- `/constants` - Configuration data (user info, projects, timeline)
- `/lib` - Utility functions (blog fetching, RSS, GitHub integration)

### Environment Variables
The project requires environment variables for:
- GitHub Personal Access Token (for fetching repositories)
- Resend API key (for contact form)

Create a `.env` file based on the example configuration mentioned in documentation.md.

### Blog System
Blog posts are written in MDX format in `/pages/blogs/`. Each post should include frontmatter with:
- title
- publishedDate
- description
- category
- image (optional)

### API Routes
- `/api/contact` - Handles contact form submissions via Resend
- `/api/github` - Fetches latest GitHub repositories

### Domain Configuration
The site redirects from non-www to www domain through Next.js middleware.

## Project Management System

The site includes an automated Vercel project sync system:

### Database Schema
- **Projects**: Stored in SQLite with Prisma ORM
- **Technologies**: Linked project technologies for filtering
- **Visibility Control**: Toggle projects on/off for public display

### Admin Dashboard
- Access via `/admin/projects` (requires authentication)
- Manual project sync from Vercel API
- Drag & drop reordering
- Bulk visibility controls

### Automated Sync
- Cron job syncs projects every 6 hours
- API endpoint: `/api/cron/sync-vercel-projects`
- Fetches latest deployments and project metadata
- Automatically generates preview screenshots for new projects

### Screenshot Generation
- Automated screenshot capture using Puppeteer
- Generates preview images for project cards
- Manual generation via admin dashboard
- Bulk processing for multiple projects
- Screenshots saved to `/public/images/projects/generated/`

### Environment Variables Required
```env
VERCEL_API_TOKEN=your_vercel_token
ADMIN_SECRET=your_admin_secret
DATABASE_URL="file:./dev.db"
```

### Key API Endpoints
- `GET /api/projects` - Public projects display
- `POST /api/projects/sync` - Manual Vercel sync
- `GET /api/projects/admin` - Dashboard data
- `POST /api/projects/generate-screenshots` - Generate project previews

## Contact Form

Two contact form implementations:
- **Original**: `/api/send-email` - Basic Resend integration
- **Enhanced**: `/api/contact-v2` - Rate limiting, validation, anti-spam

## Development Notes

1. **Path Aliases**: TypeScript is configured with @ alias pointing to the root directory
2. **Image Optimization**: External images from githubusercontent.com and i.pinimg.com are configured for Next.js Image component
3. **Security**: CSP headers are configured in next.config.js
4. **SEO**: Automatic sitemap generation runs before build
5. **Testing**: Tests are located in `__tests__` directory with Jest setup
6. **Database**: Prisma with SQLite for project management
7. **Project Migration**: Run `/api/migrate-projects` to import existing static projects