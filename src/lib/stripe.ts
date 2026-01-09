/**
 * Stripe Integration for Legal OS
 * Handles subscription billing, license management, and payment processing
 */

import Stripe from 'stripe';

// Initialize Stripe with API key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// ============================================================================
// PRICING CONFIGURATION
// ============================================================================

export const PRICING_PLANS = {
  trial: {
    id: 'trial',
    name: 'Free Trial',
    price: 0,
    interval: 'month' as const,
    features: [
      '14-day free trial',
      'Up to 3 users',
      '100 documents',
      '10GB storage',
      '100 AI credits/month',
      'Email support',
    ],
    limits: {
      max_users: 3,
      max_documents: 100,
      max_storage_gb: 10,
      ai_credits_monthly: 100,
    },
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 39,
    priceId: process.env.STRIPE_PRICE_STARTER || 'price_starter',
    interval: 'month' as const,
    features: [
      'Up to 5 users',
      '500 documents',
      '50GB storage',
      '500 AI credits/month',
      'Email support',
      'Basic templates',
      'Document versioning',
    ],
    limits: {
      max_users: 5,
      max_documents: 500,
      max_storage_gb: 50,
      ai_credits_monthly: 500,
    },
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 99,
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL || 'price_professional',
    interval: 'month' as const,
    popular: true,
    features: [
      'Up to 20 users',
      'Unlimited documents',
      '500GB storage',
      '5,000 AI credits/month',
      'Priority email & chat support',
      'Advanced templates & workflows',
      'E-signature integration',
      'Practice management integration',
      'Advanced analytics',
      'API access',
    ],
    limits: {
      max_users: 20,
      max_documents: 999999,
      max_storage_gb: 500,
      ai_credits_monthly: 5000,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: null, // Custom pricing
    interval: 'year' as const,
    features: [
      'Unlimited users',
      'Unlimited documents',
      'Unlimited storage',
      'Unlimited AI credits',
      'Dedicated account manager',
      'Phone & Slack support',
      'SLA guarantee (99.9% uptime)',
      'Custom integrations',
      'SSO/SAML',
      'Advanced security & compliance',
      'Custom contract terms',
      'On-premise deployment option',
    ],
    limits: {
      max_users: 999999,
      max_documents: 999999,
      max_storage_gb: 999999,
      ai_credits_monthly: 999999,
    },
  },
  white_label: {
    id: 'white_label',
    name: 'White Label Partnership',
    price: null, // Revenue share model
    interval: 'year' as const,
    features: [
      'Full white-label branding',
      'Custom domain',
      'Revenue share model',
      'Reseller portal',
      'Multi-tenant management',
      'Custom feature development',
      'Dedicated infrastructure',
    ],
    limits: {
      max_users: 999999,
      max_documents: 999999,
      max_storage_gb: 999999,
      ai_credits_monthly: 999999,
    },
  },
};

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

export interface CreateSubscriptionParams {
  organizationId: string;
  priceId: string;
  customerId?: string;
  email: string;
  name: string;
  trialDays?: number;
}

export async function createStripeCustomer(params: {
  email: string;
  name: string;
  organizationId: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Customer> {
  return await stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: {
      organization_id: params.organizationId,
      ...params.metadata,
    },
  });
}

export async function createSubscription(
  params: CreateSubscriptionParams
): Promise<Stripe.Subscription> {
  let customerId = params.customerId;

  // Create customer if doesn't exist
  if (!customerId) {
    const customer = await createStripeCustomer({
      email: params.email,
      name: params.name,
      organizationId: params.organizationId,
    });
    customerId = customer.id;
  }

  // Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: params.priceId }],
    trial_period_days: params.trialDays,
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
    metadata: {
      organization_id: params.organizationId,
    },
  });

  return subscription;
}

export async function cancelSubscription(
  subscriptionId: string,
  cancelImmediately: boolean = false
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: !cancelImmediately,
    ...(cancelImmediately && { cancel_at: Math.floor(Date.now() / 1000) }),
  });
}

export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
  });
}

export async function resumeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

// ============================================================================
// PAYMENT METHODS
// ============================================================================

export async function createCheckoutSession(params: {
  priceId: string;
  customerId?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  trialDays?: number;
}): Promise<Stripe.Checkout.Session> {
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
  };

  if (params.customerId) {
    sessionParams.customer = params.customerId;
  } else {
    sessionParams.customer_creation = 'always';
  }

  if (params.trialDays) {
    sessionParams.subscription_data = {
      trial_period_days: params.trialDays,
    };
  }

  return await stripe.checkout.sessions.create(sessionParams);
}

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

// ============================================================================
// USAGE-BASED BILLING
// ============================================================================

export async function reportUsage(params: {
  subscriptionItemId: string;
  quantity: number;
  timestamp?: number;
  action?: 'increment' | 'set';
}): Promise<Stripe.UsageRecord> {
  return await stripe.subscriptionItems.createUsageRecord(
    params.subscriptionItemId,
    {
      quantity: params.quantity,
      timestamp: params.timestamp || Math.floor(Date.now() / 1000),
      action: params.action || 'increment',
    }
  );
}

// ============================================================================
// INVOICING
// ============================================================================

export async function getUpcomingInvoice(
  customerId: string
): Promise<Stripe.Invoice> {
  return await stripe.invoices.retrieveUpcoming({
    customer: customerId,
  });
}

export async function listInvoices(
  customerId: string,
  limit: number = 10
): Promise<Stripe.ApiList<Stripe.Invoice>> {
  return await stripe.invoices.list({
    customer: customerId,
    limit,
  });
}

// ============================================================================
// WEBHOOK SIGNATURE VERIFICATION
// ============================================================================

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret);
}

// ============================================================================
// SUBSCRIPTION STATUS HELPERS
// ============================================================================

export function isSubscriptionActive(
  subscription: Stripe.Subscription
): boolean {
  return ['active', 'trialing'].includes(subscription.status);
}

export function getSubscriptionEndDate(
  subscription: Stripe.Subscription
): Date | null {
  if (subscription.cancel_at) {
    return new Date(subscription.cancel_at * 1000);
  }
  if (subscription.current_period_end) {
    return new Date(subscription.current_period_end * 1000);
  }
  return null;
}

// ============================================================================
// PRICING HELPERS
// ============================================================================

export function getPlanByPriceId(priceId: string) {
  return Object.values(PRICING_PLANS).find(plan => plan.priceId === priceId);
}

export function formatPrice(cents: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

// ============================================================================
// CUSTOMER PORTAL
// ============================================================================

export async function getCustomerPortalUrl(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const session = await createBillingPortalSession(customerId, returnUrl);
  return session.url;
}

// ============================================================================
// TRIAL MANAGEMENT
// ============================================================================

export async function extendTrial(
  subscriptionId: string,
  daysToExtend: number
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  if (subscription.trial_end) {
    const newTrialEnd = new Date(subscription.trial_end * 1000);
    newTrialEnd.setDate(newTrialEnd.getDate() + daysToExtend);

    return await stripe.subscriptions.update(subscriptionId, {
      trial_end: Math.floor(newTrialEnd.getTime() / 1000),
    });
  }

  throw new Error('Subscription is not in trial period');
}

// ============================================================================
// METERED BILLING (For AI Credits, Storage, etc.)
// ============================================================================

export async function createMeteredPrice(params: {
  productId: string;
  unitAmount: number;
  currency?: string;
  billingScheme?: 'per_unit' | 'tiered';
  tiers?: Stripe.PriceCreateParams.Tier[];
}): Promise<Stripe.Price> {
  return await stripe.prices.create({
    product: params.productId,
    unit_amount: params.unitAmount,
    currency: params.currency || 'usd',
    recurring: {
      interval: 'month',
      usage_type: 'metered',
    },
    billing_scheme: params.billingScheme || 'per_unit',
    tiers: params.tiers,
    tiers_mode: params.tiers ? 'graduated' : undefined,
  });
}

// ============================================================================
// ENTERPRISE QUOTES
// ============================================================================

export async function createQuote(params: {
  customerId: string;
  lineItems: Array<{
    priceId?: string;
    quantity?: number;
    price_data?: Stripe.QuoteCreateParams.LineItem.PriceData;
  }>;
  expiresAt?: number;
  metadata?: Record<string, string>;
}): Promise<Stripe.Quote> {
  return await stripe.quotes.create({
    customer: params.customerId,
    line_items: params.lineItems as Stripe.QuoteCreateParams.LineItem[],
    expires_at: params.expiresAt,
    metadata: params.metadata,
  });
}

// ============================================================================
// DISCOUNT & COUPON MANAGEMENT
// ============================================================================

export async function createCoupon(params: {
  percentOff?: number;
  amountOff?: number;
  currency?: string;
  duration: 'once' | 'repeating' | 'forever';
  durationInMonths?: number;
  name?: string;
}): Promise<Stripe.Coupon> {
  return await stripe.coupons.create({
    percent_off: params.percentOff,
    amount_off: params.amountOff,
    currency: params.currency,
    duration: params.duration,
    duration_in_months: params.durationInMonths,
    name: params.name,
  });
}

export async function applyPromoCode(
  subscriptionId: string,
  promoCodeId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    promotion_code: promoCodeId,
  });
}

// ============================================================================
// ANALYTICS & REPORTING
// ============================================================================

export async function getSubscriptionMetrics(params?: {
  created?: {
    gte?: number;
    lte?: number;
  };
}): Promise<{
  total: number;
  active: number;
  trialing: number;
  canceled: number;
  past_due: number;
}> {
  const subscriptions = await stripe.subscriptions.list({
    limit: 100,
    created: params?.created,
  });

  const metrics = {
    total: subscriptions.data.length,
    active: 0,
    trialing: 0,
    canceled: 0,
    past_due: 0,
  };

  subscriptions.data.forEach((sub) => {
    if (sub.status === 'active') metrics.active++;
    if (sub.status === 'trialing') metrics.trialing++;
    if (sub.status === 'canceled') metrics.canceled++;
    if (sub.status === 'past_due') metrics.past_due++;
  });

  return metrics;
}

export async function getMonthlyRecurringRevenue(): Promise<number> {
  const subscriptions = await stripe.subscriptions.list({
    status: 'active',
    limit: 100,
  });

  let mrr = 0;
  subscriptions.data.forEach((sub) => {
    if (sub.items.data[0]?.price?.recurring?.interval === 'month') {
      mrr += sub.items.data[0].price.unit_amount || 0;
    } else if (sub.items.data[0]?.price?.recurring?.interval === 'year') {
      mrr += (sub.items.data[0].price.unit_amount || 0) / 12;
    }
  });

  return mrr;
}
