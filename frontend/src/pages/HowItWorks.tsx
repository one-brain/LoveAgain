import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import {
  ShieldCheckIcon,
  SparklesIcon,
  LockClosedIcon,
  IdentificationIcon,
  BanknotesIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ArrowRightIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

type TabMode = 'clients' | 'companions' | 'safety';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'Is Cue a dating or matchmaking app?',
    answer:
      'No. Cue is strictly a platonic experience companionship platform designed for shared activities, fitness partners, city guides, dining companions, and hobby enthusiasts. Physical intimacy, romance solicitations, or inappropriate conduct are strictly prohibited and result in permanent account bans.',
  },
  {
    question: 'How does the 100% Escrow Protection guarantee work?',
    answer:
      'When a client books a session, the total amount is held safely in our protected escrow system. The companion is never paid upfront. The funds are held safely until the session finishes. Once both parties confirm completion, 85% of the fee is released to the companion wallet.',
  },
  {
    question: 'What happens if a companion cancels or fails to show up?',
    answer:
      'If a companion cancels or does not arrive at the agreed public venue, the escrow hold is automatically voided and 100% of the funds are refunded immediately to the client wallet or original payment method without deduction.',
  },
  {
    question: 'How do you verify companions before they appear in search?',
    answer:
      'Every companion applicant must submit a valid Government ID proof (Aadhaar, Passport, or Driving License) alongside a live camera selfie verification. Our human administration team reviews every document to confirm identity authenticity before any profile goes live.',
  },
  {
    question: 'What are the platform fees and payment options?',
    answer:
      'Companions set their own transparent hourly rates in Indian Rupees (₹). Cue takes a transparent 15% platform service fee that funds banking gateways, ID verification, customer support, and dispute mediation. Clients pay via UPI (GPay, PhonePe, Paytm), NetBanking, or Credit/Debit Cards.',
  },
  {
    question: 'Can any registered user become a companion?',
    answer:
      'Yes! Cue uses a unified account model. Every registered user starts as a client. If you want to host experiences, you can apply by submitting your activities, hourly rates, and identity verification documents for review.',
  },
];

const HowItWorks: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<TabMode>('clients');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-18 lg:pb-24 border-b border-border/60">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-accent/15 via-accent/5 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider mb-6">
            <SparklesIcon className="w-4 h-4" />
            <span>Transparent, Safe, Community-Driven</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground font-serif max-w-3xl mx-auto leading-tight">
            How Cue Works
          </h1>
          <p className="mt-4 text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover verified people for sports, culture, dining, and city adventures.
            Protected by safe payments, identity verification, and community trust.
          </p>

          {/* Perspective Switcher */}
          <div className="mt-10 inline-flex p-1.5 rounded-2xl bg-card border border-border shadow-xs max-w-md w-full justify-center">
            <button
              onClick={() => setActiveTab('clients')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'clients'
                  ? 'bg-accent text-accent-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              For Clients
            </button>
            <button
              onClick={() => setActiveTab('companions')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'companions'
                  ? 'bg-accent text-accent-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              For Companions
            </button>
            <button
              onClick={() => setActiveTab('safety')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'safety'
                  ? 'bg-accent text-accent-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Safety & Escrow
            </button>
          </div>
        </div>
      </section>

      {/* Main Tab Content */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        {activeTab === 'clients' && (
          <div className="space-y-16 animate-in fade-in duration-200">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-accent mb-2 block">
                The Client Experience
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold font-serif text-foreground">
                Hire Companions in 4 Simple Steps
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base mt-2">
                Rent companionship for activities and hobbies without awkwardness or safety concerns.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="p-6 rounded-3xl bg-card border border-border shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center font-bold text-xl mb-5">
                    1
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Explore & Match</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Filter verified companions by specialty (tennis, foodie dining, museum walk, running), city, and hourly rate.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60 text-xs text-accent font-semibold flex items-center gap-1.5">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Only verified profiles</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-3xl bg-card border border-border shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center font-bold text-xl mb-5">
                    2
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Pay Safely with Escrow</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Pick a duration and time slot. Pay via UPI or Card. Your money is held in escrow and never paid upfront.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                  <LockClosedIcon className="w-4 h-4" />
                  <span>100% Escrow Protection</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-3xl bg-card border border-border shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center font-bold text-xl mb-5">
                    3
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Chat & Coordinate</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Real-time encrypted chat unlocks once booked. Agree on an open public location like a café, stadium, or gallery.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60 text-xs text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-1.5">
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  <span>Secure in-app messaging</span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-6 rounded-3xl bg-card border border-border shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center font-bold text-xl mb-5">
                    4
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Release & Review</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Enjoy the experience. After the session wraps up, confirm completion to release payment and share an honest review.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60 text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                  <SparklesIcon className="w-4 h-4" />
                  <span>Build community trust score</span>
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <Link
                to="/discovery"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-accent-foreground font-semibold hover:bg-accent-hover transition-all shadow-xs"
              >
                <span>Find a Companion Today</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'companions' && (
          <div className="space-y-16 animate-in fade-in duration-200">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-accent mb-2 block">
                The Companion Journey
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold font-serif text-foreground">
                Earn by Sharing Experiences
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base mt-2">
                Monetize your time, fitness skills, and conversational energy safely on your own schedule.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="p-6 rounded-3xl bg-card border border-border shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center font-bold text-xl mb-5">
                    1
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Apply in 4 Minutes</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Set your own hourly rate in ₹, write your bio, choose specialties, and provide your payout UPI ID.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60 text-xs text-accent font-semibold flex items-center gap-1.5">
                  <BanknotesIcon className="w-4 h-4" />
                  <span>You control your pricing</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-3xl bg-card border border-border shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center font-bold text-xl mb-5">
                    2
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Identity & Safety Verification</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Upload your Government ID proof and snap a live selfie. Our compliance team verifies your identity within 24 hours.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                  <IdentificationIcon className="w-4 h-4" />
                  <span>Verified Companion badge</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-3xl bg-card border border-border shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center font-bold text-xl mb-5">
                    3
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Host Experiences</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Receive booking requests from verified clients. Confirm meeting dates and accompany them on great experiences.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60 text-xs text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-1.5">
                  <UserGroupIcon className="w-4 h-4" />
                  <span>Flexible self-managed schedule</span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-6 rounded-3xl bg-card border border-border shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center font-bold text-xl mb-5">
                    4
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Get Paid Instantly</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Keep 85% of every booking. Funds clear into your Cue Wallet immediately upon completion, withdrawable to UPI.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                  <BanknotesIcon className="w-4 h-4" />
                  <span>Instant UPI withdrawals</span>
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <Link
                to={isAuthenticated ? "/apply-companion" : "/register?redirect=/apply-companion"}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-accent-foreground font-semibold hover:bg-accent-hover transition-all shadow-xs"
              >
                <span>Apply to Become a Companion</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'safety' && (
          <div className="space-y-16 animate-in fade-in duration-200">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-accent mb-2 block">
                Trust & Financial Security
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold font-serif text-foreground">
                The 4 Pillars of Cue Safety
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base mt-2">
                We designed Cue from the ground up so that neither clients nor companions are ever exposed to financial or physical risk.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-3xl bg-card border border-border shadow-xs flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <LockClosedIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Protected Payment Guarantee</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Funds are held securely by Cue until the experience concludes. Neither clients nor companions risk losing money to no-shows or cancellations.
                  </p>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-card border border-border shadow-xs flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
                  <IdentificationIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Government ID & Biometric Verification</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    No anonymous accounts. Companions undergo government identity verification and cross-referenced live camera selfie checks.
                  </p>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-card border border-border shadow-xs flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                  <ExclamationTriangleIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Strictly Non-Romantic & Activity Focused</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Our terms strictly mandate public venues (restaurants, parks, fitness centers, galleries). Romantic or intimate solicitations result in immediate permanent bans.
                  </p>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-card border border-border shadow-xs flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                  <ShieldCheckIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">24/7 Human Dispute Mediation</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Encountered an issue or schedule mismatch? Our dedicated support staff inspects chat logs, GPS coordinates, and provides prompt fair resolutions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Comparison Grid Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="p-8 sm:p-12 rounded-3xl bg-card border border-border shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">
              Why Cue is Different
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              How Cue protects you compared to traditional classifieds or informal meetups.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border/80">
                  <th className="py-3 px-4 font-bold text-foreground">Feature</th>
                  <th className="py-3 px-4 font-bold text-accent">Cue Platform</th>
                  <th className="py-3 px-4 font-bold text-muted-foreground">Classifieds / Direct Meetups</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                <tr>
                  <td className="py-3.5 px-4 font-medium text-foreground">Payment Protection</td>
                  <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">Protected until meetup is complete</td>
                  <td className="py-3.5 px-4 text-rose-600 dark:text-rose-400">Upfront payment risk / scams</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-foreground">Identity Verification</td>
                  <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">Govt ID + Live Selfie Vetted</td>
                  <td className="py-3.5 px-4 text-rose-600 dark:text-rose-400">Anonymous / unverified profiles</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-foreground">No-Show & Cancellation</td>
                  <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">Instant 100% refund</td>
                  <td className="py-3.5 px-4 text-rose-600 dark:text-rose-400">Zero recourse / lost funds</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-foreground">Platform Scope</td>
                  <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">Strictly activities & public venues</td>
                  <td className="py-3.5 px-4 text-muted-foreground">Unregulated & ambiguous</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-foreground">Ratings & Trust Scores</td>
                  <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">Immutable reviews from real bookings</td>
                  <td className="py-3.5 px-4 text-rose-600 dark:text-rose-400">Fake reviews or none</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-3">
            <QuestionMarkCircleIcon className="w-4 h-4" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold font-serif text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            Clear answers to common questions about using Cue safely.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-card border border-border shadow-xs overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-foreground hover:bg-muted/40 transition-colors"
                aria-expanded={openFaq === idx}
              >
                <span>{faq.question}</span>
                <ChevronDownIcon
                  className={`w-4 h-4 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${
                    openFaq === idx ? 'rotate-180 text-accent' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed animate-in fade-in duration-150">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 text-center">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-br from-accent/15 via-accent/5 to-transparent border border-accent/25 shadow-lg">
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-foreground mb-4">
            Start Exploring Today
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-8">
            Experience genuine connection with verified companions for tennis, art, food, and life's shared moments.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/discovery"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm shadow-xs hover:bg-accent-hover transition-all"
            >
              Discover Companions
            </Link>
            <Link
              to={isAuthenticated ? "/apply-companion" : "/register?redirect=/apply-companion"}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-border text-foreground hover:bg-muted font-semibold text-sm transition-all"
            >
              Become a Companion
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
