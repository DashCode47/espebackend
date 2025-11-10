# Vercel Deployment Guide

## Files Created for Vercel Deployment

✅ **vercel.json** - Vercel configuration file  
✅ **api/index.ts** - Serverless function entry point  
✅ **.vercelignore** - Files to exclude from deployment  
✅ **Updated src/index.ts** - Exports app for Vercel  
✅ **Updated tsconfig.json** - Excludes api folder from compilation  
✅ **Updated package.json** - Added postinstall script for Prisma

## Quick Deployment Steps

### Option 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   Follow the prompts. For production:
   ```bash
   vercel --prod
   ```

### Option 2: Using GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repository
4. Vercel will auto-detect settings
5. Click **Deploy**

## Environment Variables

After deployment, set these in Vercel Dashboard:
- Go to **Settings** → **Environment Variables**
- Add:
  - `DATABASE_URL` - Your production PostgreSQL connection string
  - `JWT_SECRET` - Your JWT secret key
  - `PORT` - (Optional, defaults to 3000)

**Important:** Set these for **Production**, **Preview**, and **Development** environments.

## Your API URL

After deployment, you'll get a URL like:
- `https://your-project-name.vercel.app`

All endpoints will be available at:
- `https://your-project-name.vercel.app/api/auth`
- `https://your-project-name.vercel.app/api/users`
- `https://your-project-name.vercel.app/api/posts`
- etc.

## Database Migrations

Before deploying, ensure your production database is set up. Run migrations:

```bash
npx prisma migrate deploy
```

Or set up automatic migrations in your CI/CD pipeline.

## Troubleshooting

- **Build fails**: Check that all dependencies are correctly listed in `package.json`
- **Database errors**: Verify `DATABASE_URL` is set correctly in Vercel
- **Module errors**: Check build logs in Vercel dashboard

---

**Note:** Prisma client is automatically generated during deployment via the `postinstall` script.

