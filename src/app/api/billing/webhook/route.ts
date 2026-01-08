/**
 * Stripe Webhook Handler
 * Processes Stripe events and updates database accordingly
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe, constructWebhookEvent, PRICING_PLANS } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Disable body parsing so we can verify the webhook signature
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = constructWebhookEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    console.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.created':
      case 'customer.updated':
        await handleCustomerChange(event.data.object as Stripe.Customer);
        break;

      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// ============================================================================
// WEBHOOK EVENT HANDLERS
// ============================================================================

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const organizationId = subscription.metadata.organization_id;

  if (!organizationId) {
    console.error('No organization_id in subscription metadata');
    return;
  }

  // Determine subscription tier from price ID
  const priceId = subscription.items.data[0]?.price?.id;
  let subscriptionTier = 'trial';

  if (priceId) {
    const plan = Object.values(PRICING_PLANS).find((p) => p.priceId === priceId);
    if (plan) {
      subscriptionTier = plan.id;
    }
  }

  // Update organization
  const { error } = await supabaseAdmin
    .from('organizations')
    .update({
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      subscription_tier: subscriptionTier,
      subscription_status: subscription.status,
      trial_ends_at: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
      subscription_ends_at: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
      max_users: PRICING_PLANS[subscriptionTier as keyof typeof PRICING_PLANS]?.limits.max_users,
      max_documents: PRICING_PLANS[subscriptionTier as keyof typeof PRICING_PLANS]?.limits.max_documents,
      max_storage_gb: PRICING_PLANS[subscriptionTier as keyof typeof PRICING_PLANS]?.limits.max_storage_gb,
      ai_credits_monthly: PRICING_PLANS[subscriptionTier as keyof typeof PRICING_PLANS]?.limits.ai_credits_monthly,
      updated_at: new Date().toISOString(),
    })
    .eq('id', organizationId);

  if (error) {
    console.error('Failed to update organization:', error);
    throw error;
  }

  console.log(`Updated organization ${organizationId} subscription to ${subscriptionTier}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const organizationId = subscription.metadata.organization_id;

  if (!organizationId) {
    console.error('No organization_id in subscription metadata');
    return;
  }

  // Downgrade to free trial or canceled status
  const { error } = await supabaseAdmin
    .from('organizations')
    .update({
      subscription_tier: 'trial',
      subscription_status: 'canceled',
      stripe_subscription_id: null,
      subscription_ends_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', organizationId);

  if (error) {
    console.error('Failed to update organization:', error);
    throw error;
  }

  console.log(`Canceled subscription for organization ${organizationId}`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const organizationId = invoice.metadata?.organization_id;

  // Create invoice record
  const { error } = await supabaseAdmin.from('invoices').insert({
    organization_id: organizationId,
    stripe_invoice_id: invoice.id,
    stripe_payment_intent_id: invoice.payment_intent as string,
    amount_cents: invoice.amount_paid,
    currency: invoice.currency.toUpperCase(),
    status: 'paid',
    period_start: new Date(invoice.period_start * 1000).toISOString().split('T')[0],
    period_end: new Date(invoice.period_end * 1000).toISOString().split('T')[0],
    line_items: invoice.lines.data.map((line) => ({
      description: line.description,
      amount: line.amount,
      quantity: line.quantity,
    })),
    paid_at: new Date(invoice.status_transitions.paid_at! * 1000).toISOString(),
  });

  if (error) {
    console.error('Failed to create invoice record:', error);
  }

  console.log(`Recorded payment for invoice ${invoice.id}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const organizationId = invoice.metadata?.organization_id;

  if (!organizationId) {
    return;
  }

  // Update organization status
  const { error } = await supabaseAdmin
    .from('organizations')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('id', organizationId);

  if (error) {
    console.error('Failed to update organization status:', error);
  }

  // TODO: Send notification to organization admins about payment failure

  console.log(`Payment failed for organization ${organizationId}`);
}

async function handleCustomerChange(customer: Stripe.Customer) {
  const organizationId = customer.metadata?.organization_id;

  if (!organizationId) {
    return;
  }

  // Update organization with customer info
  const { error } = await supabaseAdmin
    .from('organizations')
    .update({
      stripe_customer_id: customer.id,
      billing_email: customer.email || undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', organizationId);

  if (error) {
    console.error('Failed to update organization customer:', error);
  }

  console.log(`Updated customer for organization ${organizationId}`);
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const organizationId = session.metadata?.organization_id;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!organizationId) {
    console.error('No organization_id in checkout session metadata');
    return;
  }

  // Update organization with Stripe IDs
  const { error } = await supabaseAdmin
    .from('organizations')
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', organizationId);

  if (error) {
    console.error('Failed to update organization after checkout:', error);
  }

  // Fetch and process the subscription to update tier and limits
  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await handleSubscriptionChange(subscription);
  }

  console.log(`Checkout completed for organization ${organizationId}`);
}
