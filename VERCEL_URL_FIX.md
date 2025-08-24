# 🔗 Fixing Vercel Project URLs for Screenshots

## 🎯 The Problem
Your projects are using `.vercel.app` URLs which are showing Vercel login screens instead of the actual project content. This happens because:
- These are preview/development URLs that require authentication
- The deployments are not set to public access
- We need the actual production URLs

## ✅ Solutions

### Option 1: Make Vercel Deployments Public (Recommended)
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. For each project:
   - Click on the project
   - Go to **Settings** → **General**
   - Under **Deployment Protection**, set to **"Public"**
   - This will make your `.vercel.app` URLs publicly accessible

### Option 2: Use Custom Domains
If you have custom domains configured:
1. In Vercel Dashboard → Project → Settings → Domains
2. Copy the custom domain (e.g., `northscale.com`)
3. Update in admin panel using the edit URL feature

### Option 3: Get the Correct Production URL
Sometimes the production URL is different from the project name:
1. In Vercel Dashboard → Project
2. Look for the **"Visit"** button on the latest production deployment
3. Copy that URL (it might be something like `northscale-production.vercel.app`)

## 🛠️ Quick Fix via Admin Panel

1. Visit your admin panel: `http://localhost:3004/admin/projects`
2. For each project showing a login screen:
   - Click the **pencil icon** next to the URL
   - Enter the correct public URL
   - Click the **check mark** to save
   - Click the **camera icon** to regenerate the screenshot

## 🔍 Check Your URLs

Run this to see which URLs are accessible:
```bash
curl http://localhost:3004/api/projects/check-urls
```

This will show you which project URLs are returning login screens.

## 📝 Examples

❌ **Wrong** (Shows login screen):
- `https://northscale.vercel.app`
- `https://quizsmart.vercel.app`

✅ **Correct** (Public access):
- `https://northscale-production.vercel.app` (if set to public)
- `https://northscale.com` (custom domain)
- `https://northscale.vercel.app` (after enabling public access)

## 🚀 After Fixing URLs

Once you've updated the URLs:
1. Click **"Sync from Vercel"** in admin panel
2. Or manually regenerate screenshots using the camera icon
3. Screenshots should now show actual project content!

## 💡 Pro Tip
If you want to keep using `.vercel.app` URLs, the easiest solution is to make your deployments public in Vercel's deployment protection settings. This way, the screenshots will work without needing custom domains.