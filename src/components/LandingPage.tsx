'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('features')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative container mx-auto px-6 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              The Smart Way to Practice Law in the
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400"> Digital Age</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
              Legal OS combines proven legal workflows with intelligent automation to help law firms
              work faster, smarter, and more profitably. Trusted by modern legal professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Start Your Free Trial
              </Link>
              <Link
                href="#features"
                className="border-2 border-white text-white hover:bg-white hover:text-indigo-900 font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-200"
              >
                See How It Works
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400">500+</div>
                <div className="text-blue-200">Law Firms Trust Us</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400">70%</div>
                <div className="text-blue-200">Time Saved on Documents</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400">99.9%</div>
                <div className="text-blue-200">Compliance Accuracy</div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Who We Are Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Who We Are: Technology That Understands Law
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Founded by legal technology experts and practicing attorneys, Legal OS bridges the gap between
              traditional legal practice and modern technology. We're not here to replace lawyers—we're here
              to empower them with tools that enhance their expertise and amplify their impact.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Assisted Workflows</h3>
              <p className="text-gray-600">
                Intelligent automation that handles repetitive tasks, freeing lawyers to focus on high-value strategic work.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Compliance First</h3>
              <p className="text-gray-600">
                Built-in compliance checks and automated deadline tracking to protect your practice and clients.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Team Collaboration</h3>
              <p className="text-gray-600">
                Seamless collaboration tools that keep your team connected and productive, no matter where they work.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-orange-50 to-red-50">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Proven Results</h3>
              <p className="text-gray-600">
                Measurable improvements in productivity, client satisfaction, and firm profitability for our users.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              What Makes Legal OS Different?
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              While other platforms focus on flashy AI features, we prioritize what matters most to law firms:
              reliability, compliance, and tools that integrate seamlessly into your existing workflows.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🎯 Focused on Legal Workflows</h3>
              <p className="text-gray-600 mb-4">
                Built by legal professionals for legal professionals. Every feature is designed around
                how lawyers actually work, not generic business processes.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Matter-centric organization</li>
                <li>• Court rule automation</li>
                <li>• Client communication integration</li>
                <li>• Deadline management</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🔒 Compliance Built-In</h3>
              <p className="text-gray-600 mb-4">
                Security and compliance aren't afterthoughts—they're fundamental to our platform.
                Protect your practice and your clients with enterprise-grade security.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• SOC 2 compliant infrastructure</li>
                <li>• End-to-end encryption</li>
                <li>• Audit trails for all actions</li>
                <li>• Attorney-client privilege protection</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🤝 Human-Centered AI</h3>
              <p className="text-gray-600 mb-4">
                AI that augments your expertise, not replaces it. Smart automation for repetitive tasks,
                with you always in control of critical decisions.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• AI-assisted document drafting</li>
                <li>• Intelligent research suggestions</li>
                <li>• Automated compliance checks</li>
                <li>• Voice-to-text for faster input</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">⚡ Proven Productivity Gains</h3>
              <p className="text-gray-600 mb-4">
                Our users report measurable improvements in efficiency, client satisfaction, and profitability.
                Real results from real law firms.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 70% faster document preparation</li>
                <li>• 50% reduction in administrative work</li>
                <li>• Improved client communication</li>
                <li>• Better case organization</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features & Pricing Tabs */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-lg p-1 shadow-lg border">
              <button
                onClick={() => setActiveTab('features')}
                className={`px-8 py-3 rounded-md font-semibold transition-all duration-200 ${
                  activeTab === 'features'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Features
              </button>
              <button
                onClick={() => setActiveTab('pricing')}
                className={`px-8 py-3 rounded-md font-semibold transition-all duration-200 ${
                  activeTab === 'pricing'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Pricing
              </button>
            </div>
          </div>

          {/* Features Tab */}
          {activeTab === 'features' && (
            <div>
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Smart Tools for Modern Law Firms
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Technology that enhances your legal expertise without overwhelming your workflow.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Document Management</h3>
                  <p className="text-gray-600 mb-4">
                    Professional document creation with templates, auto-save, and version control.
                    Focus on your legal arguments, not formatting.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-2">
                    <li>• Rich text editing</li>
                    <li>• Document templates</li>
                    <li>• Auto-save & versioning</li>
                    <li>• PDF export</li>
                  </ul>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Compliance Automation</h3>
                  <p className="text-gray-600 mb-4">
                    Built-in compliance checks and automated deadline tracking protect your practice
                    and ensure you never miss critical dates.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-2">
                    <li>• Deadline automation</li>
                    <li>• Court rule compliance</li>
                    <li>• Ethical rule checks</li>
                    <li>• Audit trails</li>
                  </ul>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Team Collaboration</h3>
                  <p className="text-gray-600 mb-4">
                    Seamless collaboration tools that keep your team connected and working efficiently,
                    whether in the office or remotely.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-2">
                    <li>• Real-time editing</li>
                    <li>• Comment threads</li>
                    <li>• Document sharing</li>
                    <li>• Activity tracking</li>
                  </ul>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Legal Research Assistant</h3>
                  <p className="text-gray-600 mb-4">
                    Intelligent research tools that help you find relevant cases and statutes quickly,
                    with smart suggestions based on your practice area.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-2">
                    <li>• Case law research</li>
                    <li>• Statute lookup</li>
                    <li>• Citation management</li>
                    <li>• Research history</li>
                  </ul>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Case Management</h3>
                  <p className="text-gray-600 mb-4">
                    Organize your matters, track deadlines, and manage client relationships all in one place.
                    Never miss a filing deadline again.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-2">
                    <li>• Matter organization</li>
                    <li>• Client management</li>
                    <li>• Deadline tracking</li>
                    <li>• Case status updates</li>
                  </ul>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Practice Analytics</h3>
                  <p className="text-gray-600 mb-4">
                    Gain insights into your practice with detailed analytics on productivity, case outcomes,
                    and firm performance to make data-driven decisions.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-2">
                    <li>• Productivity metrics</li>
                    <li>• Case analytics</li>
                    <li>• Time tracking</li>
                    <li>• Revenue insights</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div>
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Choose the Perfect Plan for Your Firm
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Start free and scale as your practice grows. All plans include our core legal workflow tools.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Starter Plan */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
                    <p className="text-gray-600">Perfect for solo practitioners</p>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">$39</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                  </div>
                  <div className="px-8 py-6">
                    <ul className="space-y-4">
                      <li className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Up to 50 documents/month
                      </li>
                      <li className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Document templates
                      </li>
                      <li className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        PDF export
                      </li>
                      <li className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Basic client management
                      </li>
                      <li className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Email support
                      </li>
                    </ul>
                    <Link
                      href="/auth/signup"
                      className="block w-full mt-8 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 px-6 rounded-lg text-center transition-all duration-200"
                    >
                      Start Free Trial
                    </Link>
                  </div>
                </div>

                {/* Professional Plan - Most Popular */}
                <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-500 overflow-hidden hover:shadow-3xl transition-shadow duration-300 relative">
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-2 text-sm font-semibold">
                    MOST POPULAR
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 mt-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
                    <p className="text-gray-600">Ideal for growing firms (2-10 attorneys)</p>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">$99</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                  </div>
                  <div className="px-8 py-6">
                    <ul className="space-y-4">
                      <li className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Unlimited documents
                      </li>
                      <li className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Advanced templates
                      </li>
                      <li className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Team collaboration
                      </li>
                      <li className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Legal research tools
                      </li>
                      <li className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Matter management
                      </li>
                      <li className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Priority support
                      </li>
                      <li className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Practice analytics
                      </li>
                    </ul>
                    <Link
                      href="/auth/signup"
                      className="block w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-all duration-200 transform hover:scale-105"
                    >
                      Start Free Trial
                    </Link>
                  </div>
                </div>

                {/* Enterprise Plan */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-8 py-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                    <p className="text-gray-600">For established firms (10+ attorneys)</p>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">Custom</span>
                      <span className="text-gray-600 block text-sm">Pricing & features</span>
                    </div>
                  </div>
                  <div className="px-8 py-6">
                    <ul className="space-y-4">
                      <li className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Everything in Professional
                      </li>
                      <li className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Custom integrations
                      </li>
                      <li className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Advanced analytics
                      </li>
                      <li className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Dedicated account manager
                      </li>
                      <li className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Custom training
                      </li>
                      <li className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        SLA guarantees
                      </li>
                    </ul>
                    <Link
                      href="/contact"
                      className="block w-full mt-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-all duration-200"
                    >
                      Contact Sales
                    </Link>
                  </div>
                </div>
              </div>

              <div className="text-center mt-12">
                <p className="text-gray-600 mb-4">
                  All plans include a 14-day free trial. No credit card required to get started.
                </p>
                <p className="text-sm text-gray-500">
                  Questions about pricing? <Link href="/contact" className="text-blue-600 hover:underline">Contact our team</Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Competitive Advantage Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-blue-900 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Why Choose Legal OS Over Traditional Tools?
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              We're not just another legal software—we're the evolution of how law firms work in the digital age.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-8 border border-white border-opacity-20">
              <h3 className="text-2xl font-bold mb-6 text-center">Traditional Legal Software</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-400 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-red-300">Fragmented Tools</h4>
                    <p className="text-blue-100 text-sm">Separate systems for documents, research, billing, and case management</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-400 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-red-300">Manual Processes</h4>
                    <p className="text-blue-100 text-sm">Hours spent on formatting, research, and administrative tasks</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-400 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-red-300">Outdated Interfaces</h4>
                    <p className="text-blue-100 text-sm">Clunky desktop software that feels like it's from the 90s</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-400 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-red-300">Data Silos</h4>
                    <p className="text-blue-100 text-sm">Information trapped in separate systems with no integration</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-8 border border-white border-opacity-20">
              <h3 className="text-2xl font-bold mb-6 text-center">Legal OS Approach</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-400 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-green-300">Unified Platform</h4>
                    <p className="text-blue-100 text-sm">Everything in one place: documents, research, cases, clients, deadlines</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-400 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-green-300">Smart Automation</h4>
                    <p className="text-blue-100 text-sm">AI handles repetitive tasks while you focus on legal strategy</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-400 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-green-300">Modern Experience</h4>
                    <p className="text-blue-100 text-sm">Beautiful, intuitive interface that works on any device</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-400 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-green-300">Connected Intelligence</h4>
                    <p className="text-blue-100 text-sm">All data connected and searchable across your entire practice</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Legal Practice?
          </h2>
          <p className="text-xl mb-8 text-indigo-100 max-w-2xl mx-auto">
            Join hundreds of modern law firms already using Legal OS to work smarter, faster, and more profitably.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-white text-indigo-900 font-semibold py-4 px-8 rounded-lg text-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Start Your Free Trial
            </Link>
            <Link
              href="#features"
              className="border-2 border-white text-white hover:bg-white hover:text-indigo-900 font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-200"
            >
              Explore Features
            </Link>
          </div>
          <p className="text-sm text-indigo-200 mt-6">
            14-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Legal OS</h3>
              <p className="text-gray-400 mb-4">
                Technology that understands law. Built for modern legal professionals.
              </p>
              <p className="text-sm text-gray-500">
                Empowering law firms with intelligent automation and seamless workflows.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/templates" className="hover:text-white transition-colors">Templates</Link></li>
                <li><Link href="/research" className="hover:text-white transition-colors">Research Tools</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/press" className="hover:text-white transition-colors">Press</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Legal OS. All rights reserved. Built for the future of legal practice.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}