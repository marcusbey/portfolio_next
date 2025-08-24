# Vercel Deployment Guide

## Step 1: Set up PostgreSQL Database

### Option A: Vercel Postgres (Recommended)
1. Go to your Vercel project dashboard
2. Click on the "Storage" tab
3. Click "Create Database" → "Postgres"
4. Choose a name (e.g., `portfolio-db`)
5. Click "Create"
6. Copy the `DATABASE_URL` connection string

### Option B: Free PostgreSQL Services
- **Neon.tech**: Free tier with 0.5GB storage
- **Supabase**: Free tier with 500MB storage
- **Railway**: Free tier with 1GB storage

## Step 2: Configure Environment Variables

In your Vercel dashboard, go to Settings → Environment Variables and add:

```
# Database
DATABASE_URL=your_postgresql_connection_string

# Vercel API
VERCEL_API_TOKEN=Zl88c6vhyT1lYzmR3US20dAb

# Admin Authentication
ADMIN_SECRET=admin_secret_2024
NEXT_PUBLIC_ADMIN_SECRET=admin_secret_2024
NEXT_PUBLIC_ADMIN_PASSWORD=Comxmal1985%

# Email (from your existing setup)
RESEND_API_KEY=your_existing_key
CONTACT_FORM_EMAIL=hi@romainboboe.com
VERIFIED_DOMAIN=romainboboe.com

# Site URLs
NEXT_PUBLIC_API_URL=https://www.romainboboe.com
NEXT_PUBLIC_SITE_URL=https://www.romainboboe.com
```

## Step 3: Deploy to Vercel

### From Git (Recommended)
1. Push your code to GitHub (already done)
2. Connect your Vercel project to the GitHub repository
3. Vercel will auto-deploy when you push to main

### From CLI
```bash
npm install -g vercel
vercel --prod
```

## Step 4: Initialize Database

After deployment, run these commands:

### 4.1 Test Database Connection
```bash
curl -X POST https://www.romainboboe.com/api/setup-database \
  -H "Authorization: Bearer admin_secret_2024"
```

### 4.2 Migrate Existing Projects
```bash
curl -X POST https://www.romainboboe.com/api/migrate-projects \
  -H "Authorization: Bearer admin_secret_2024"
```

### 4.3 Sync Vercel Projects
```bash
curl -X POST https://www.romainboboe.com/api/projects/sync \
  -H "Authorization: Bearer admin_secret_2024"
```

## Step 5: Access Admin Dashboard

1. Go to: `https://www.romainboboe.com/admin/login`
2. Enter password: `Comxmal1985%`
3. Manage your projects!

## Step 6: Generate Screenshots (Optional)

In the admin dashboard, click "Generate Images" to create preview screenshots for all projects.

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check if database exists and is accessible
- Try the `/api/setup-database` endpoint

### Build Failures
- Check that all environment variables are set
- Verify Prisma schema is valid
- Look at build logs in Vercel dashboard

### Puppeteer Issues in Production
Puppeteer might have issues on Vercel. If screenshots fail:
1. Screenshots are optional - projects will work without them
2. You can disable auto-screenshot generation in sync
3. Consider using a screenshot service like Browserless

## Performance Notes

- Database queries are optimized for small datasets
- Screenshots are generated async and cached
- Cron jobs run every 6 hours automatically
- Admin dashboard is protected and lightweight

## Security

- All sensitive data is in environment variables
- Admin routes are protected with secrets
- Contact form has rate limiting and anti-spam
- Database uses parameterized queries