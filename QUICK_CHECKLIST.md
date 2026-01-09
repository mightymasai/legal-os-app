# Legal OS - Quick Setup Checklist

## ✅ Database Setup (Do This First!)

- [ ] Open Supabase Dashboard
- [ ] Run migration: `20260108_initial_schema_fixed.sql` ⚠️ Use the **_fixed** version!
- [ ] Run migration: `20260108_auth_triggers.sql`
- [ ] Verify 19 tables created (run verification query)
- [ ] Copy Project URL from Settings → API
- [ ] Copy anon key from Settings → API
- [ ] Copy service_role key from Settings → API

## ✅ Local Environment Setup

- [ ] Open `.env.local` in your `Downloads\legal-os-app\` folder
- [ ] Update `NEXT_PUBLIC_SUPABASE_URL` with your real URL
- [ ] Update `NEXT_PUBLIC_SUPABASE_ANON_KEY` with your real anon key
- [ ] Update `SUPABASE_SERVICE_ROLE_KEY` with your real service key
- [ ] Save the file
- [ ] Restart dev server: `npm run dev`

## ✅ Test Basic Functionality

- [ ] Open http://localhost:3000
- [ ] Click "Sign Up" or "Get Started"
- [ ] Enter email and password
- [ ] Submit form
- [ ] Should redirect to dashboard (not show errors)
- [ ] Go to Supabase → Table Editor → organizations (should see your org)
- [ ] Go to Supabase → Table Editor → profiles (should see your profile)

## 🎯 Once Basic Auth Works

- [ ] Test document creation
- [ ] Test navigation between pages
- [ ] Check that multi-tenancy works (data is isolated)

## 🚀 Production Deployment (After Local Works)

- [ ] Commit latest changes to GitHub
- [ ] Create Vercel account
- [ ] Import GitHub repo to Vercel
- [ ] Add environment variables in Vercel dashboard
- [ ] Deploy!

## 💳 Stripe Setup (Optional - Can Wait)

- [ ] Create Stripe account
- [ ] Create products: Starter ($39) and Professional ($99)
- [ ] Copy price IDs to .env
- [ ] Set up webhook endpoint
- [ ] Test checkout flow

## 🤖 AI Features (Optional - Can Wait)

- [ ] Get OpenAI API key
- [ ] Add to `OPENAI_API_KEY` in .env
- [ ] Test document improvement feature
- [ ] Monitor token usage

---

## Current Status: 🔄 Database Setup Phase

**What you're working on now:**
Setting up Supabase database with the fixed migration file to resolve the "permission denied for schema auth" error.

**Next immediate action:**
Follow the detailed steps in `SUPABASE_SETUP_GUIDE.md`

---

## Common Issues & Quick Fixes

### ❌ "permission denied for schema auth"
**Fix:** Use `20260108_initial_schema_fixed.sql` (not the original file)

### ❌ "relation already exists"
**Fix:** Either DROP all tables first, or create a fresh Supabase project

### ❌ "Invalid API key"
**Fix:** Make sure you copied the full key (it's very long, ~200+ characters)

### ❌ "Failed to fetch"
**Fix:** Restart the dev server after updating .env.local

### ❌ Can't sign up
**Fix:** Check Supabase → Logs → Postgres Logs for specific error

---

**📍 You are here:** Running the fixed database migration in Supabase
