# Supabase Setup Guide - Legal OS

## Step 1: Run the Fixed Database Migration

1. Open your Supabase project at https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open this file on your computer: `Downloads\legal-os-app\supabase\migrations\20260108_initial_schema_fixed.sql`
5. Copy the ENTIRE contents
6. Paste into the Supabase SQL Editor
7. Click **RUN** (or press Ctrl+Enter)
8. Wait for success message (should take 5-10 seconds)

**Expected Result:**
```
Success. No rows returned
```

## Step 2: Run the Auth Triggers Migration

1. In Supabase SQL Editor, click **New Query** again
2. Open this file: `Downloads\legal-os-app\supabase\migrations\20260108_auth_triggers.sql`
3. Copy the ENTIRE contents
4. Paste into the Supabase SQL Editor
5. Click **RUN**

**Expected Result:**
```
Success. No rows returned
```

## Step 3: Verify Tables Were Created

1. In Supabase SQL Editor, run this query:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected Result:** You should see these tables:
- active_workflows
- ai_interactions
- audit_logs
- case_predictions
- clients
- conflict_checks
- deadlines
- document_versions
- documents
- integrations
- invoices
- legal_research
- matters
- notifications
- organizations
- profiles
- templates
- usage_records
- workflow_templates

## Step 4: Get Your Supabase API Keys

1. In your Supabase Dashboard, click **Settings** (gear icon at bottom left)
2. Click **API** in the settings menu
3. You'll see:
   - **Project URL** - starts with `https://xxxxx.supabase.co`
   - **Project API keys**:
     - `anon` `public` - Copy this (the long JWT token)
     - `service_role` `secret` - Copy this (click reveal first)

## Step 5: Update Your Local Environment File

1. On your computer, navigate to: `Downloads\legal-os-app\`
2. Open `.env.local` in a text editor (Notepad works)
3. Replace these lines with your REAL Supabase values:

```env
# BEFORE (demo values):
NEXT_PUBLIC_SUPABASE_URL=https://demo-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxOTAwMDAwMDAwfQ.demo-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8iLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE5MDAwMDAwMDB9.demo-service-key

# AFTER (your real values):
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR-REAL-ANON-KEY...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR-REAL-SERVICE-ROLE-KEY...
```

4. Save the file

## Step 6: Restart Your Development Server

1. In your terminal/command prompt, press **Ctrl+C** to stop the server
2. Run again: `npm run dev`
3. Wait for "Ready on http://localhost:3000"

## Step 7: Test Signup/Login

1. Open http://localhost:3000 in your browser
2. Click **Sign Up** or **Get Started**
3. Enter an email and password
4. Try to create an account

**Expected Result:**
- Account should be created successfully
- You should be redirected to the dashboard
- Your organization should be automatically created in the database

## Step 8: Verify in Supabase

1. Go back to Supabase Dashboard
2. Click **Table Editor** in left sidebar
3. Click **organizations** table
4. You should see your new organization listed!
5. Click **profiles** table
6. You should see your user profile

## Troubleshooting

### Issue: "Failed to fetch" error when signing up
**Fix:** Make sure you updated .env.local with REAL Supabase credentials and restarted the server

### Issue: "Invalid API key" error
**Fix:** Double-check you copied the anon key correctly (it's very long, starts with `eyJ`)

### Issue: Tables not showing up
**Fix:** Run the SQL query in Step 3 to verify tables were created

### Issue: Can't create organization
**Fix:** Check Supabase logs:
1. Go to Supabase Dashboard
2. Click **Logs** → **Postgres Logs**
3. Look for any errors related to triggers or functions

## What's Next After This Works?

Once you successfully:
- ✅ Run both migrations
- ✅ Update .env.local
- ✅ Test signup/login
- ✅ See your org in Supabase

You're ready to:
1. Deploy to Vercel (production)
2. Set up Stripe for real billing
3. Add OpenAI for AI features
4. Configure custom domain

---

**Need Help?** If you get stuck at any step, copy the exact error message and I can help troubleshoot!
