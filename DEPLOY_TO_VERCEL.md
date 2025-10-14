# 🚀 CarTalker - Deploy to Vercel

**Ready to deploy!** All configuration is complete.

---

## Option 1: Deploy via Vercel CLI (Fastest - 2 minutes)

### Step 1: Install Vercel CLI (if needed)
```bash
npm i -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy!
```bash
cd /Users/evanstoudt/Documents/File\ Cabinet/Coding/cartalker
vercel
```

When prompted:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No (or Yes if you already created one)
- **Project name?** → cartalker (or whatever you prefer)
- **Directory?** → ./ (current directory)
- **Override settings?** → No

### Step 4: Add Environment Variables

After first deployment, add environment variables:

```bash
# Or go to: https://vercel.com/[your-username]/cartalker/settings/environment-variables
vercel env add DATABASE_URL
# Paste: postgresql://postgres:8QqYnnNjfWy8gXF4iuhM@db.ityvuxcdjqywpbysjttp.supabase.co:6543/postgres?pgbouncer=true

vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste: https://ityvuxcdjqywpbysjttp.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0eXZ1eGNkanF5d3BieXNqdHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTIxNDgsImV4cCI6MjA3NjAyODE0OH0.yJreQ4XYksZNUZSM-ooTT0uX6AKs9J767SRAI_-oktw

vercel env add OPENAI_API_KEY
# Paste: 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

vercel env add GEMINI_API_KEY
# Paste: AIzaSyDc9DnX2ed4eyL0LcBnDT-Q9oaCCp7nUzg

vercel env add GEMINI_PROJECT_ID
# Paste: gen-lang-client-0030010180
```

### Step 5: Redeploy with Environment Variables
```bash
vercel --prod
```

**Done!** Your app will be live at: `https://cartalker-[hash].vercel.app`

---

## Option 2: Deploy via Vercel Dashboard (Easiest - 5 minutes)

### Step 1: Push to GitHub

```bash
cd /Users/evanstoudt/Documents/File\ Cabinet/Coding/cartalker

# Check status
git status

# Add all files (CREDENTIALS.md is already in .gitignore)
git add .

# Commit
git commit -m "feat: Configure for Vercel deployment with Supabase PostgreSQL

- Switch from SQLite to PostgreSQL
- Add Supabase configuration
- Add Vercel deployment config
- Update Prisma schema for PostgreSQL
- Add all API keys securely

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push (create GitHub repo if needed first)
git push origin main
```

### Step 2: Import to Vercel

1. Go to: https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repository
4. **Framework Preset:** Next.js (auto-detected)
5. **Root Directory:** ./
6. **Build Command:** Leave as default (vercel.json will override)
7. **Install Command:** Leave as default

### Step 3: Add Environment Variables

Click "Environment Variables" and add:

```bash
DATABASE_URL=postgresql://postgres:8QqYnnNjfWy8gXF4iuhM@db.ityvuxcdjqywpbysjttp.supabase.co:6543/postgres?pgbouncer=true
NEXT_PUBLIC_SUPABASE_URL=https://ityvuxcdjqywpbysjttp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0eXZ1eGNkanF5d3BieXNqdHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTIxNDgsImV4cCI6MjA3NjAyODE0OH0.yJreQ4XYksZNUZSM-ooTT0uX6AKs9J767SRAI_-oktw
OPENAI_API_KEY=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
GEMINI_API_KEY=AIzaSyDc9DnX2ed4eyL0LcBnDT-Q9oaCCp7nUzg
GEMINI_PROJECT_ID=gen-lang-client-0030010180
NODE_ENV=production
```

### Step 4: Deploy!

Click "Deploy" and wait 2-3 minutes.

**Done!** Your app will be live!

---

## What Happens During Deployment

1. ✅ Vercel installs dependencies
2. ✅ Prisma generates client
3. ✅ Prisma runs migrations to Supabase (this wakes up your database!)
4. ✅ Next.js builds the application
5. ✅ App is deployed to global CDN

---

## Troubleshooting

### Database connection fails during build:
- Go to Supabase dashboard: https://supabase.com/dashboard/project/ityvuxcdjqywpbysjttp
- Check if database is paused → Click "Resume"
- Retry deployment in Vercel

### Build succeeds but app crashes:
- Check Vercel logs: https://vercel.com/[your-username]/cartalker
- Look for "Runtime Logs"
- Usually missing environment variables

### Prisma migration fails:
- The first deploy will create all tables
- If it fails, you can manually run in Vercel Functions:
  - Go to Vercel dashboard → Functions
  - Or redeploy with "Redeploy" button

---

## After Deployment

### Test your app:
```
https://cartalker-[hash].vercel.app
```

### Set up custom domain (optional):
1. Go to Vercel project settings
2. Click "Domains"
3. Add your domain
4. Update DNS records

### Enable continuous deployment:
- Every `git push` will auto-deploy
- Automatic previews for pull requests
- Instant rollbacks if needed

---

## Cost: $0/month

- ✅ Vercel: Free tier (100GB bandwidth)
- ✅ Supabase: Free tier (500MB database)
- ✅ Total: **FREE** for personal projects

---

**Ready to deploy? Pick Option 1 or Option 2 above!**
