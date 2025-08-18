# Vercel Project Sync Setup Guide

This guide will help you set up the automated Vercel project synchronization feature.

## Prerequisites

1. Vercel account with deployed projects
2. Database setup (SQLite)
3. Admin authentication

## Step 1: Environment Variables

Add these environment variables to your `.env` file:

```env
# Vercel API Token for project syncing
VERCEL_API_TOKEN=your_vercel_token_here

# Admin secret for API authentication
ADMIN_SECRET=your_admin_secret_here

# Database
DATABASE_URL="file:./dev.db"
```

### Getting a Vercel API Token

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your profile (bottom left)
3. Go to "Settings" → "Tokens"
4. Click "Create Token"
5. Give it a name like "Project Sync"
6. Copy the token and add it to your `.env` file

## Step 2: Database Setup

The database should already be set up, but if needed:

```bash
npx prisma generate
npx prisma db push
```

## Step 3: Migrate Existing Projects

Run this API call to migrate your existing projects to the database:

```bash
curl -X POST http://localhost:3000/api/migrate-projects \
  -H "Authorization: Bearer your_admin_secret_here" \
  -H "Content-Type: application/json"
```

## Step 4: Access the Dashboard

1. Go to `/admin/login`
2. Enter the admin password (default: `admin123` or set `NEXT_PUBLIC_ADMIN_PASSWORD`)
3. Access the project dashboard at `/admin/projects`

## Step 5: Manual Sync

You can manually sync projects from the dashboard or via API:

```bash
curl -X POST http://localhost:3000/api/projects/sync \
  -H "Authorization: Bearer your_admin_secret_here" \
  -H "Content-Type: application/json"
```

## Step 6: Automatic Sync (Optional)

For production deployment, set up a cron job to run:

```bash
curl -X POST https://your-domain.com/api/cron/sync-vercel-projects \
  -H "Authorization: Bearer your_admin_secret_here"
```

Or use Vercel Cron Jobs by adding to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-vercel-projects",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

## Usage

1. **View Projects**: Visit your website to see projects from the database
2. **Manage Visibility**: Use the admin dashboard to show/hide projects
3. **Reorder Projects**: Drag and drop in the dashboard to reorder
4. **Sync New Projects**: New Vercel deployments will be automatically detected
5. **Generate Screenshots**: Use the "Generate Images" button in the dashboard to create preview images

## API Endpoints

- `GET /api/projects` - Get visible projects for public display
- `GET /api/projects/admin` - Get all projects for dashboard
- `PATCH /api/projects/admin` - Update project visibility/order
- `POST /api/projects/sync` - Manual sync from Vercel
- `POST /api/cron/sync-vercel-projects` - Automated sync endpoint

## Troubleshooting

### Projects not syncing
- Check your Vercel API token is valid
- Ensure you have projects deployed on Vercel
- Check the logs for API errors

### Dashboard not accessible
- Verify admin authentication is set up
- Check the admin password/secret

### Database errors
- Run `npx prisma db push` to ensure schema is up to date
- Check database file permissions

## Security Notes

- Keep your Vercel API token secure
- Use a strong admin secret
- In production, implement proper authentication (OAuth, etc.)
- Consider rate limiting for public endpoints