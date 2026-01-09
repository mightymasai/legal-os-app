# How to Set Up .env.local File

## Step 1: Find the File

On your Windows computer, navigate to your Legal OS folder:
```
Downloads\legal-os-app\
```

You should see a file called `.env.local` (it might be hidden)

**If you don't see it:**
1. Open Notepad
2. Copy the template below
3. Save as: `.env.local` (make sure it's not `.env.local.txt`)
4. Save it in the `legal-os-app` folder

## Step 2: Copy This Template

```env
# ==============================================================================
# LEGAL OS - PRODUCTION CONFIGURATION
# ==============================================================================

# SUPABASE (REQUIRED - Get from Supabase Dashboard → Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR-ANON-KEY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR-SERVICE-ROLE-KEY

# STRIPE (OPTIONAL - Can be added later for billing)
STRIPE_SECRET_KEY=sk_test_demo123456789
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_demo123456789
STRIPE_WEBHOOK_SECRET=whsec_demo123456789
STRIPE_PRICE_STARTER=price_demo_starter
STRIPE_PRICE_PROFESSIONAL=price_demo_professional

# OPENAI (OPTIONAL - Can be added later for AI features)
OPENAI_API_KEY=sk-demo-no-real-key
OPENAI_MODEL=gpt-4-turbo-preview

# APP SETTINGS
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Legal OS
NODE_ENV=development
```

## Step 3: Replace ONLY These 3 Lines

Replace these with your REAL Supabase values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR-ANON-KEY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR-SERVICE-ROLE-KEY
```

Leave everything else as-is for now.

## Step 4: Save and Restart

1. Save the file (Ctrl+S)
2. Restart your dev server:
   - Press Ctrl+C in terminal
   - Run: `npm run dev`

## Quick Copy-Paste Version

If you just want to quickly update the existing file:

1. Find `.env.local` in your downloads folder
2. Open with Notepad
3. Find the lines starting with `NEXT_PUBLIC_SUPABASE` and `SUPABASE_SERVICE`
4. Replace with your real values from Supabase Dashboard
5. Save

---

**That's it!** The Stripe and OpenAI keys are optional and can stay as demo values for now.
