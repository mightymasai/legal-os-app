# ⚡ QUICK DEPLOY - Copy & Paste Commands

## 🎯 Fast Track (5 Minutes)

### 1. Push to GitHub

```bash
cd "C:\Users\M M\Downloads\legal-os-mvp (2)\legal-os-mvp\home\ubuntu\legal-os-mvp\legal-os-app"
git init
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/legal-os-mvp.git
git push -u origin main
```

**Replace `YOUR_USERNAME` with your GitHub username!**

---

### 2. Vercel Deployment Settings

**Go to**: https://vercel.com/new

**Settings to configure**:
- **Root Directory**: `legal-os-app` ⚠️ **MUST SET THIS!**
- **Framework**: Next.js (auto-detected)

**Environment Variables** (add these before deploying):
```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Get these from**: Supabase Dashboard → Settings → API

---

### 3. Supabase Setup (One-Time)

1. Create project at: https://supabase.com
2. Copy URL and anon key
3. Run SQL schema in Supabase SQL Editor
4. Add redirect URL in Supabase: `https://your-app.vercel.app/**`

---

## ✅ That's It!

Your app will be live at: `https://your-project.vercel.app`

**Full detailed guide**: See `DEPLOY_NOW.md`

