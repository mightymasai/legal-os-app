# Vercel Deployment Guide - Legal OS

## Previous Deployment Issues (And How We Fixed Them)

### Issues You Likely Had Before:
1. ❌ **PostCSS/Tailwind errors** - FIXED: We updated globals.css to use Tailwind v3 syntax
2. ❌ **TypeScript errors** - FIXED: All type errors resolved in previous commits
3. ❌ **Environment variables missing** - FIXED: We'll add them in Vercel dashboard
4. ❌ **Database not set up** - FIXED: Supabase is now configured

**Bottom line:** The previous issues are resolved. Deployment should work now.

---

## Step-by-Step Vercel Deployment (20 minutes)

### Step 1: Commit Latest Changes (2 minutes)

If you've made any local changes, commit them:

```bash
git add .
git commit -m "Configure production environment"
git push origin claude/design-legal-os-fTag0
```

### Step 2: Create Vercel Account (2 minutes)

1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your repositories

### Step 3: Import Your Repository (2 minutes)

1. In Vercel Dashboard, click "Add New" → "Project"
2. Find `legal-os-app` in your repository list
3. Click "Import"
4. **Framework Preset:** Next.js (should auto-detect)
5. **Root Directory:** `./` (leave as default)
6. **Build Command:** `npm run build` (auto-filled)
7. **Output Directory:** `.next` (auto-filled)

### Step 4: Add Environment Variables (5 minutes)

Before clicking "Deploy", expand "Environment Variables" section and add these:

**Required (from your Supabase):**
```
NEXT_PUBLIC_SUPABASE_URL = https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGci... (your anon key)
SUPABASE_SERVICE_ROLE_KEY = eyJhbGci... (your service role key)
```

**App Settings:**
```
NEXT_PUBLIC_APP_URL = https://your-app-name.vercel.app
NEXT_PUBLIC_APP_NAME = Legal OS
NODE_ENV = production
```

**Optional (leave as demo for now):**
```
STRIPE_SECRET_KEY = sk_test_demo123456789
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_demo123456789
STRIPE_WEBHOOK_SECRET = whsec_demo123456789
OPENAI_API_KEY = sk-demo-no-real-key
```

### Step 5: Deploy! (3 minutes)

1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. You'll see: ✅ "Your project has been successfully deployed"

### Step 6: Update Supabase Redirect URLs (2 minutes)

After deployment, you need to tell Supabase about your new URL:

1. Copy your Vercel URL (e.g., `https://legal-os-app.vercel.app`)
2. Go to Supabase Dashboard → Authentication → URL Configuration
3. Add to "Site URL": `https://legal-os-app.vercel.app`
4. Add to "Redirect URLs":
   - `https://legal-os-app.vercel.app/auth/callback`
   - `https://legal-os-app.vercel.app/auth/confirm`
5. Save changes

### Step 7: Test Your Live Site (2 minutes)

1. Visit your Vercel URL
2. Try to sign up with a new account
3. Check email for confirmation
4. Log in

**Expected Result:** ✅ Full signup/login flow works on production!

---

## Common Deployment Issues & Fixes

### ❌ Build fails with "Module not found"
**Fix:** Make sure all dependencies are in package.json
```bash
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```
Then redeploy in Vercel

### ❌ "Invalid API key" on deployed site
**Fix:**
1. Check Vercel → Settings → Environment Variables
2. Make sure you added ALL required variables
3. Redeploy (Vercel → Deployments → "..." → Redeploy)

### ❌ Auth redirect fails
**Fix:** Update Supabase redirect URLs (Step 6 above)

### ❌ Database queries fail
**Fix:** Check that SUPABASE_SERVICE_ROLE_KEY is set in Vercel

### ❌ "This page could not be found"
**Fix:** Make sure deployment built successfully
- Check Vercel → Deployments → View Function Logs

---

## Updating Your Deployed App

When you make changes:

1. Commit and push to GitHub:
```bash
git add .
git commit -m "Your changes"
git push origin claude/design-legal-os-fTag0
```

2. Vercel will auto-deploy (takes ~2 minutes)
3. No manual steps needed!

---

## Custom Domain (Optional)

Want `legal-os.com` instead of `legal-os-app.vercel.app`?

1. Buy domain from Namecheap/GoDaddy ($10-15/year)
2. In Vercel → Settings → Domains
3. Add your domain
4. Update DNS records (Vercel provides instructions)
5. Update Supabase redirect URLs to use new domain

---

## Production Checklist

Before launching to customers:

- [ ] Deploy to Vercel successfully
- [ ] Test signup/login on live site
- [ ] Set up real Stripe account (for billing)
- [ ] Add real OpenAI key (for AI features)
- [ ] Configure custom domain
- [ ] Set up email provider (SendGrid/AWS SES)
- [ ] Add analytics (Vercel Analytics/Google Analytics)
- [ ] Test on mobile devices
- [ ] Add terms of service & privacy policy pages

---

## Cost Estimate for Production

**Hosting (Vercel):**
- Free tier: Good for demos/testing
- Pro tier: $20/month - needed for production (better performance, more bandwidth)

**Database (Supabase):**
- Free tier: 500MB, 50K monthly active users - good for launch
- Pro tier: $25/month - needed when you grow (8GB, unlimited users)

**AI (OpenAI):**
- Pay per use: ~$0.01-0.03 per document improvement
- Estimate: $50-200/month depending on usage

**Email (SendGrid):**
- Free tier: 100 emails/day
- Paid: $15/month for 50K emails

**Total Monthly Cost:**
- Launch phase: $0-50/month (mostly free tiers)
- Growing phase: $100-250/month
- Scale phase: $300-500/month (if you have 100+ paying customers)

**Revenue Potential:**
- 10 customers @ $99/month = $990/month
- 50 customers @ $99/month = $4,950/month
- 100 customers @ $99/month = $9,900/month

**Profit margins are very healthy for SaaS!**
