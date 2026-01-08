'use client';

import { useState, useEffect } from 'react';
import { PRICING_PLANS } from '@/lib/stripe';

interface Organization {
  id: string;
  name: string;
  subscription_tier: string;
  subscription_status: string;
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
  stripe_customer_id: string | null;
  max_users: number;
  max_documents: number;
  max_storage_gb: number;
  ai_credits_monthly: number;
  ai_credits_used: number;
}

export default function BillingSettings() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingUpgrade, setProcessingUpgrade] = useState(false);
  const [processingPortal, setProcessingPortal] = useState(false);

  useEffect(() => {
    fetchOrganization();
  }, []);

  async function fetchOrganization() {
    try {
      const response = await fetch('/api/organization');
      if (response.ok) {
        const data = await response.json();
        setOrganization(data);
      }
    } catch (error) {
      console.error('Failed to fetch organization:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgrade(planId: string) {
    setProcessingUpgrade(true);
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        alert('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to create checkout session');
    } finally {
      setProcessingUpgrade(false);
    }
  }

  async function handleManageBilling() {
    setProcessingPortal(true);
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        alert('Failed to open billing portal');
      }
    } catch (error) {
      console.error('Portal error:', error);
      alert('Failed to open billing portal');
    } finally {
      setProcessingPortal(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load billing information</p>
      </div>
    );
  }

  const currentPlan = PRICING_PLANS[organization.subscription_tier as keyof typeof PRICING_PLANS];
  const isTrial = organization.subscription_status === 'trialing';
  const isActive = organization.subscription_status === 'active';
  const isPastDue = organization.subscription_status === 'past_due';

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
            <p className="text-sm text-gray-600">Manage your subscription and billing</p>
          </div>
          {organization.stripe_customer_id && (
            <button
              onClick={handleManageBilling}
              disabled={processingPortal}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {processingPortal ? 'Loading...' : 'Manage Billing'}
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Plan Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">{currentPlan.name}</span>
              {currentPlan.price && (
                <span className="text-lg text-gray-600">
                  ${currentPlan.price}/{currentPlan.interval}
                </span>
              )}
            </div>
            {isTrial && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                Trial
              </span>
            )}
            {isActive && (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Active
              </span>
            )}
            {isPastDue && (
              <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                Payment Required
              </span>
            )}
          </div>

          {/* Trial Warning */}
          {isTrial && organization.trial_ends_at && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Trial ends:</strong>{' '}
                {new Date(organization.trial_ends_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Upgrade now to continue using Legal OS without interruption
              </p>
            </div>
          )}

          {/* Past Due Warning */}
          {isPastDue && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Payment failed.</strong> Please update your payment method to continue using Legal OS.
              </p>
            </div>
          )}

          {/* Usage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                ? / {organization.max_users}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Documents</p>
              <p className="text-2xl font-semibold text-gray-900">
                ? / {organization.max_documents === 999999 ? '∞' : organization.max_documents}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Storage</p>
              <p className="text-2xl font-semibold text-gray-900">
                ? / {organization.max_storage_gb}GB
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">AI Credits</p>
              <p className="text-2xl font-semibold text-gray-900">
                {organization.ai_credits_used} / {organization.ai_credits_monthly}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min((organization.ai_credits_used / organization.ai_credits_monthly) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Options */}
      {(isTrial || organization.subscription_tier === 'starter') && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upgrade Your Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(PRICING_PLANS)
              .filter(([key]) => !['trial', 'white_label'].includes(key))
              .map(([key, plan]) => {
                const isCurrentPlan = key === organization.subscription_tier;
                const canUpgrade =
                  (organization.subscription_tier === 'trial' && key !== 'trial') ||
                  (organization.subscription_tier === 'starter' && ['professional', 'enterprise'].includes(key));

                return (
                  <div
                    key={key}
                    className={`border rounded-lg p-6 ${
                      plan.popular
                        ? 'border-blue-500 shadow-lg relative'
                        : 'border-gray-200'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                    {plan.price ? (
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                        <span className="text-gray-600">/{plan.interval}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 mb-4">Contact us for pricing</p>
                    )}
                    <ul className="space-y-2 mb-6">
                      {plan.features.slice(0, 5).map((feature, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleUpgrade(key)}
                      disabled={isCurrentPlan || !canUpgrade || processingUpgrade}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        isCurrentPlan
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : canUpgrade
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isCurrentPlan
                        ? 'Current Plan'
                        : canUpgrade
                        ? plan.price
                          ? 'Upgrade Now'
                          : 'Contact Sales'
                        : 'Not Available'}
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Enterprise CTA */}
      {organization.subscription_tier !== 'enterprise' && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-8 text-white">
          <div className="max-w-2xl">
            <h3 className="text-2xl font-bold mb-2">Need more?</h3>
            <p className="text-blue-100 mb-6">
              Our Enterprise plan offers unlimited users, storage, and AI credits, plus dedicated
              support and custom integrations.
            </p>
            <a
              href="mailto:sales@legal-os.com"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Contact Sales
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
