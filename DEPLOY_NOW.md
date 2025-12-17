# 🚀 EXACT DEPLOYMENT INSTRUCTIONS

Follow these steps **exactly** to deploy your Legal OS MVP to Vercel.

## Prerequisites Checklist

Before starting, make sure you have:
- [ ] GitHub account
- [ ] Vercel account (free at vercel.com)
- [ ] Supabase account (free at supabase.com)
- [ ] Git installed on your computer

---

## STEP 1: Prepare Your Code for GitHub

Open your terminal/command prompt and run these commands **one by one**:

```bash
# Navigate to your project directory
cd "C:\Users\M M\Downloads\legal-os-mvp (2)\legal-os-mvp\home\ubuntu\legal-os-mvp\legal-os-app"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your changes
git commit -m "Ready for deployment - fixed all issues"

# Check your current branch
git branch
```

---

## STEP 2: Create GitHub Repository

1. **Go to GitHub**: https://github.com/new
2. **Repository name**: `legal-os-mvp` (or any name you prefer)
3. **Visibility**: Choose Private or Public
4. **DO NOT** check "Initialize with README" (we already have files)
5. **Click "Create repository"**

---

## STEP 3: Push Code to GitHub

After creating the repository, GitHub will show you commands. Use these **exact commands** (replace `YOUR_USERNAME` with your GitHub username):

```bash
# Make sure you're still in the legal-os-app directory
cd "C:\Users\M M\Downloads\legal-os-mvp (2)\legal-os-mvp\home\ubuntu\legal-os-mvp\legal-os-app"

# Add GitHub remote (replace YOUR_USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/legal-os-mvp.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**If you get authentication errors**, you may need to:
- Use a Personal Access Token instead of password
- Or use GitHub Desktop app
- Or use SSH keys

---

## STEP 4: Set Up Supabase Database

1. **Go to Supabase**: https://supabase.com
2. **Sign up/Login** (free account)
3. **Click "New Project"**
4. **Fill in**:
   - Project Name: `legal-os-mvp`
   - Database Password: (create a strong password, save it!)
   - Region: Choose closest to you
5. **Click "Create new project"** (wait 2-3 minutes)

6. **Get Your Keys**:
   - Go to **Settings** → **API**
   - Copy these two values:
     - **Project URL** (looks like: `https://xxxxx.supabase.co`)
     - **anon public key** (long string starting with `eyJ...`)

7. **Set Up Database Schema**:
   - Go to **SQL Editor** in Supabase dashboard
   - Click **New Query**
   - Copy the contents of `schema.sql` or `supabase-schema.md` from your project
   - Paste into the SQL Editor
   - Click **Run** (or press F5)

---

## STEP 5: Deploy to Vercel

### 5.1 Create Vercel Account

1. **Go to Vercel**: https://vercel.com
2. **Click "Sign Up"**
3. **Choose "Continue with GitHub"** (recommended)
4. **Authorize Vercel** to access your GitHub

### 5.2 Import Your Project

1. **Click "Add New..."** → **"Project"**
2. **Find your repository**: `legal-os-mvp` (or whatever you named it)
3. **Click "Import"**

### 5.3 Configure Project Settings

**IMPORTANT**: Set these exact values:

- **Framework Preset**: `Next.js` (should auto-detect)
- **Root Directory**: `legal-os-app` ⚠️ **CRITICAL - Change this!**
  - Click "Edit" next to Root Directory
  - Type: `legal-os-app`
  - Click "Continue"
- **Build Command**: `npm run build` (auto-filled, leave as is)
- **Output Directory**: `.next` (auto-filled, leave as is)
- **Install Command**: `npm install` (auto-filled, leave as is)

### 5.4 Add Environment Variables

**Before clicking "Deploy"**, click **"Environment Variables"** and add these:

```
NEXT_PUBLIC_SUPABASE_URL
```
- **Value**: Your Supabase Project URL (from Step 4)
- **Example**: `https://xxxxx.supabase.co`

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
- **Value**: Your Supabase anon key (from Step 4)
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)

**For each variable**:
1. Click "Add"
2. Enter the name (exactly as shown above)
3. Paste the value
4. Make sure it's checked for **Production**, **Preview**, and **Development**
5. Click "Save"

### 5.5 Deploy

1. **Click "Deploy"** button
2. **Wait 2-3 minutes** for build to complete
3. **Watch the build logs** - it should show:
   - ✅ Installing dependencies
   - ✅ Building application
   - ✅ Deployment complete

---

## STEP 6: Configure Supabase Redirect URLs

After deployment, Vercel will give you a URL like: `https://legal-os-mvp.vercel.app`

1. **Go back to Supabase**
2. **Go to**: Authentication → URL Configuration
3. **Add to "Redirect URLs"**:
   - `https://legal-os-mvp.vercel.app/**`
   - `https://legal-os-mvp-*.vercel.app/**` (for preview deployments)
4. **Click "Save"**

---

## STEP 7: Test Your Deployment

1. **Visit your Vercel URL**: `https://your-project.vercel.app`
2. **You should see**: The landing page
3. **Click "Sign Up"** or "Get Started"
4. **Create an account** with email/password
5. **Test features**:
   - Create a document
   - Edit a document
   - Export PDF (will use browser print)
   - Navigate dashboard

---

## 🐛 Troubleshooting

### Build Fails with "Missing Supabase URL"

**Fix**: 
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Make sure both variables are added
3. Make sure they're enabled for "Production"
4. Redeploy

### "Cannot find module" errors

**Fix**:
1. Make sure Root Directory is set to `legal-os-app` (not the parent folder)
2. Redeploy

### Authentication not working

**Fix**:
1. Check Supabase redirect URLs are set correctly
2. Verify environment variables in Vercel
3. Check Supabase project is active (not paused)

### PDF Export shows error

**This is normal!** PDF will use browser print as fallback. Just use:
- **Windows**: Ctrl+P → Save as PDF
- **Mac**: Cmd+P → Save as PDF

---

## ✅ Success Checklist

Your deployment is successful when:
- [ ] Build completes without errors
- [ ] Site loads at Vercel URL
- [ ] Can sign up for account
- [ ] Can create documents
- [ ] Can edit documents
- [ ] Can save changes

---

## 📞 Quick Reference

**Your Vercel URL**: `https://your-project-name.vercel.app`
**Vercel Dashboard**: https://vercel.com/dashboard
**Supabase Dashboard**: https://supabase.com/dashboard

---

## 🎉 You're Done!

Your Legal OS MVP is now live! Share the Vercel URL with your partner for testing.

**Next time you make changes**:
1. Make changes locally
2. Run: `git add . && git commit -m "Your changes" && git push`
3. Vercel will automatically redeploy!

