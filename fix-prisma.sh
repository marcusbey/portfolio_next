#!/bin/bash

echo "🔄 Fixing Prisma client..."

# Remove the existing Prisma client
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client

# Reinstall Prisma client
npm install @prisma/client

# Generate the new client
npx prisma generate

echo "✅ Prisma client regenerated!"
echo "🔗 Testing database connection..."

# Test the connection
npx prisma db push --preview-feature

echo "🎉 Done! Try restarting your dev server."