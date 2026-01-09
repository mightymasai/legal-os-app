# Legal OS - Enterprise Legal Practice Management Platform

> **Your practice. Elevated by intelligence, controlled by you.**

Legal OS is a production-ready SaaS platform built for law firms and legal professionals. We combine powerful AI assistance with human expertise—streamlining document workflows, automating busy work, and surfacing insights that matter—while keeping you in full control.

[![License](https://img.shields.io/badge/license-Proprietary-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)

---

## 🚀 Features

### Core Platform
- **📄 Document Management** - Rich text editing, templates, auto-save, version control
- **⚖️ Matter/Case Management** - Organize cases, track deadlines, manage clients
- **👥 Multi-Tenant Architecture** - Full organization/team support with role-based access
- **💳 Stripe Integration** - Subscription billing, license management, usage tracking
- **🤖 AI-Powered Features** - Document improvement, legal research, case prediction (OpenAI GPT-4)
- **🔒 Enterprise Security** - Row-level security, audit logging, encryption
- **📊 Admin Dashboard** - Customer analytics, MRR tracking, usage metrics

### AI Capabilities
- **Document Improvement** - AI-powered editing suggestions and compliance checks
- **Legal Research** - Intelligent case law and statute search
- **Case Prediction** - Data-driven outcome analysis
- **Document Summarization** - Extract key points and entities
- **Compliance Checking** - Automated regulatory compliance verification

### Business Features
- **Multi-Tier Pricing** - Trial, Starter, Professional, Enterprise, White-Label
- **Usage Metering** - Track AI credits, documents, storage per organization
- **Billing Portal** - Stripe Customer Portal for self-service subscription management
- **License Management** - Flexible licensing for different customer types

---

## 🏗️ Tech Stack

**Frontend:**
- Next.js 14.2 (App Router)
- React 18
- TypeScript 5
- Tailwind CSS 3.4
- TipTap (Rich Text Editor)

**Backend:**
- Next.js API Routes (Serverless)
- Supabase (PostgreSQL + Auth)
- OpenAI GPT-4 API
- Stripe (Payments & Subscriptions)

**Infrastructure:**
- Vercel (Hosting & Deployment)
- Supabase (Database, Auth, Storage)
- Stripe (Billing Infrastructure)

---

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ and npm
- A Supabase account (free tier works for development)
- A Stripe account (test mode for development)
- An OpenAI API key (for AI features)
- Git

---

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/legal-os-app.git
cd legal-os-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_your-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the migrations in order:
   ```
   supabase/migrations/20260108_initial_schema.sql
   supabase/migrations/20260108_auth_triggers.sql
   ```

### 5. Configure Stripe

1. Create products and prices in Stripe Dashboard:
   - **Starter**: $39/month
   - **Professional**: $99/month
   - **Enterprise**: Custom pricing

2. Update `.env.local` with your Stripe Price IDs:
   ```env
   STRIPE_PRICE_STARTER=price_your_starter_id
   STRIPE_PRICE_PROFESSIONAL=price_your_professional_id
   ```

3. Set up Stripe webhook:
   - URL: `https://your-domain.com/api/billing/webhook`
   - Events: `customer.*`, `invoice.*`, `subscription.*`, `checkout.session.completed`
   - Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## 🗄️ Database Schema

The platform uses a comprehensive multi-tenant database schema:

### Core Tables
- `organizations` - Multi-tenant organizations with subscription info
- `profiles` - User profiles with roles and permissions
- `clients` - Client management
- `matters` - Case/matter tracking
- `documents` - Document storage with versioning
- `document_versions` - Complete version history
- `templates` - Document templates

### Advanced Features
- `legal_research` - AI-powered research results
- `case_predictions` - Predictive analytics
- `conflict_checks` - Conflict of interest checking
- `deadlines` - Deadline tracking
- `workflow_templates` & `active_workflows` - Workflow automation
- `ai_interactions` - AI usage tracking
- `audit_logs` - Complete audit trail
- `invoices` - Billing and invoicing
- `usage_records` - Usage metering

All tables include Row-Level Security (RLS) policies for multi-tenant isolation.

---

## 🚢 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

3. **Configure Environment Variables**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add all variables from `.env.local`
   - Redeploy

4. **Set Up Custom Domain** (Optional)
   - Vercel Dashboard → Settings → Domains
   - Add your custom domain
   - Update `NEXT_PUBLIC_APP_URL`

### Post-Deployment Setup

1. **Update Stripe Webhook URL**
   - Change webhook URL to production domain
   - Update `STRIPE_WEBHOOK_SECRET`

2. **Configure Supabase**
   - Add production URL to allowed redirect URLs
   - Update CORS settings

3. **Test Critical Flows**
   - User signup and login
   - Subscription checkout
   - Document creation
   - AI features

---

## 💼 Business Model & Pricing

### Subscription Tiers

| Plan | Price | Users | Documents | AI Credits | Target |
|------|-------|-------|-----------|------------|--------|
| **Trial** | Free (14 days) | 3 | 100 | 100 | Trial users |
| **Starter** | $39/mo | 5 | 500 | 500 | Solo practitioners |
| **Professional** | $99/mo | 20 | Unlimited | 5,000 | Small-mid firms |
| **Enterprise** | Custom | Unlimited | Unlimited | Unlimited | Large firms |
| **White-Label** | Revenue share | Unlimited | Unlimited | Unlimited | Partners |

### Revenue Streams

1. **Subscription Revenue** - Monthly/annual subscriptions
2. **Overage Charges** - Additional AI credits, storage
3. **Enterprise Licenses** - Annual licenses for large firms
4. **White-Label Partnership** - Revenue share with legal tech companies
5. **Professional Services** - Implementation, training, custom development

---

## 🔐 Security & Compliance

### Security Features

- ✅ **Row-Level Security (RLS)** on all tables
- ✅ **Encryption at rest** (Supabase)
- ✅ **Encryption in transit** (HTTPS/TLS)
- ✅ **Audit logging** for all critical actions
- ✅ **Multi-factor authentication** (configurable)
- ✅ **Session management** with secure cookies
- ✅ **API rate limiting** (planned)

### Compliance

- 📋 **SOC 2 Ready** - Audit logging and security controls in place
- 📋 **GDPR Compliant** - Data privacy and deletion capabilities
- 📋 **Attorney-Client Privilege** - Data isolation and access controls

### Roadmap for Certification

1. Complete SOC 2 Type II audit
2. HIPAA compliance (for healthcare legal work)
3. ISO 27001 certification
4. Bar association compliance verification

---

## 🛠️ Development

### Project Structure

```
legal-os-app/
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/           # API routes
│   │   ├── auth/          # Authentication pages
│   │   ├── dashboard/     # Main dashboard
│   │   ├── admin/         # Admin dashboard
│   │   └── ...
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   └── lib/               # Business logic
│       ├── ai.ts          # OpenAI integration
│       ├── stripe.ts      # Stripe integration
│       ├── auth.ts        # Authentication
│       └── ...
├── supabase/
│   └── migrations/        # Database migrations
├── public/               # Static assets
└── ...
```

### Key Files

- `/src/lib/ai.ts` - AI service integration (OpenAI)
- `/src/lib/stripe.ts` - Subscription billing
- `/src/lib/auth.ts` - Authentication utilities
- `/src/app/api/billing/webhook/route.ts` - Stripe webhook handler
- `/supabase/migrations/` - Database schema

### Adding New Features

1. Create database migration if needed
2. Add RLS policies for new tables
3. Create API routes in `/src/app/api/`
4. Build UI components in `/src/components/`
5. Update types in TypeScript files

---

## 📊 Admin Dashboard

Access the admin dashboard at `/admin` to view:

- Total organizations and active subscriptions
- Monthly Recurring Revenue (MRR)
- Usage metrics (documents, AI credits)
- Recent signups
- Subscription tier breakdown

**Note:** In production, add authentication middleware to restrict access to admin users only.

---

## 🤖 AI Integration

### OpenAI Features

The platform integrates OpenAI GPT-4 for:

- **Document Improvement** (`/api/ai/improve`)
- **Legal Research** (`/api/ai/research`)
- **Case Prediction** (`/api/ai/predict`)
- **Summarization** (library function)
- **Compliance Checking** (library function)

### Usage Tracking

All AI interactions are:
- Logged to `ai_interactions` table
- Counted against organization's AI credits
- Tracked for billing purposes
- Monitored for cost optimization

### Cost Management

- Each AI call increments AI credits used
- Organizations have monthly credit limits based on tier
- Automatic notifications when approaching limit
- Overage tracking for billing

---

## 🎯 Roadmap

### Phase 1: MVP (Completed ✅)
- [x] Core document management
- [x] Matter/case management
- [x] Multi-tenant architecture
- [x] Stripe billing integration
- [x] OpenAI AI features
- [x] Admin dashboard

### Phase 2: Enterprise Features (Next)
- [ ] E-signature integration (DocuSign/HelloSign)
- [ ] Practice management integrations (Clio, MyCase)
- [ ] Calendar synchronization (Google, Outlook)
- [ ] Time tracking & billing
- [ ] Client portal
- [ ] Mobile app (React Native)

### Phase 3: Advanced Features
- [ ] Real-time collaboration (Yjs backend)
- [ ] Voice dictation (Speech-to-text)
- [ ] Advanced analytics dashboard
- [ ] White-label customization UI
- [ ] API for third-party integrations
- [ ] Marketplace for templates & integrations

---

## 🤝 Contributing

This is a proprietary product. If you're part of the development team:

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

---

## 📞 Support & Sales

### For Customers
- **Help Center**: https://legal-os.com/help
- **Email Support**: support@legal-os.com
- **Chat Support**: Available in-app for Professional+ plans

### For Sales Inquiries
- **Email**: sales@legal-os.com
- **Enterprise Demo**: https://legal-os.com/demo
- **Pricing**: https://legal-os.com/pricing

---

## 📄 License

Copyright © 2024 Legal OS. All rights reserved.

This is proprietary software. Unauthorized copying, distribution, or use of this software is strictly prohibited.

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend platform
- [Stripe](https://stripe.com/) - Payment processing
- [OpenAI](https://openai.com/) - AI capabilities
- [Vercel](https://vercel.com/) - Hosting & deployment
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [TipTap](https://tiptap.dev/) - Rich text editor

---

**Legal OS** - Built for attorneys who demand both precision and progress.

*Your practice. Elevated by intelligence, controlled by you.*
