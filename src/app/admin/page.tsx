'use client';

import { useState, useEffect } from 'react';
import { PRICING_PLANS } from '@/lib/stripe';

interface DashboardMetrics {
  totalOrganizations: number;
  activeSubscriptions: number;
  trialAccounts: number;
  monthlyRecurringRevenue: number;
  totalDocuments: number;
  totalMatters: number;
  aiCreditsUsed: number;
  recentSignups: Array<{
    id: string;
    name: string;
    created_at: string;
    subscription_tier: string;
  }>;
  subscriptionBreakdown: Record<string, number>;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    fetchMetrics();
  }, [timeRange]);

  async function fetchMetrics() {
    try {
      const response = await fetch(`/api/admin/metrics?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">Failed to load admin metrics. Please check your permissions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Legal OS Admin</h1>
              <p className="text-gray-600 mt-1">Platform analytics and customer management</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
              <button
                onClick={fetchMetrics}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Organizations"
            value={metrics.totalOrganizations}
            icon="🏢"
            trend="+12%"
            trendPositive
          />
          <MetricCard
            title="Active Subscriptions"
            value={metrics.activeSubscriptions}
            icon="✅"
            trend="+8%"
            trendPositive
          />
          <MetricCard
            title="MRR"
            value={`$${(metrics.monthlyRecurringRevenue / 100).toLocaleString()}`}
            icon="💰"
            trend="+15%"
            trendPositive
          />
          <MetricCard
            title="Trial Accounts"
            value={metrics.trialAccounts}
            icon="🎯"
            subtitle="14-day trials"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Total Documents"
            value={metrics.totalDocuments.toLocaleString()}
            icon="📄"
            subtitle="Across all orgs"
          />
          <MetricCard
            title="Total Matters"
            value={metrics.totalMatters.toLocaleString()}
            icon="⚖️"
            subtitle="Active cases"
          />
          <MetricCard
            title="AI Credits Used"
            value={metrics.aiCreditsUsed.toLocaleString()}
            icon="🤖"
            subtitle="This month"
          />
        </div>

        {/* Subscription Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(metrics.subscriptionBreakdown).map(([tier, count]) => {
              const plan = PRICING_PLANS[tier as keyof typeof PRICING_PLANS];
              return (
                <div key={tier} className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">{plan?.name || tier}</p>
                  <p className="text-3xl font-bold text-gray-900">{count}</p>
                  {plan?.price && (
                    <p className="text-xs text-gray-500 mt-1">${plan.price}/mo</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Signups */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Signups</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {metrics.recentSignups.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{org.name}</div>
                      <div className="text-xs text-gray-500">{org.id}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        org.subscription_tier === 'trial'
                          ? 'bg-yellow-100 text-yellow-800'
                          : org.subscription_tier === 'enterprise'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {PRICING_PLANS[org.subscription_tier as keyof typeof PRICING_PLANS]?.name || org.subscription_tier}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(org.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-800 mr-3">View</button>
                      <button className="text-gray-600 hover:text-gray-800">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  trend,
  trendPositive,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
  trendPositive?: boolean;
  subtitle?: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      {trend && (
        <p className={`text-sm ${trendPositive ? 'text-green-600' : 'text-red-600'}`}>
          {trend} from last period
        </p>
      )}
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  );
}
