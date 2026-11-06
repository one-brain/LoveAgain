import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Tab,
  TabList,
} from '@fluentui/react-components';
import {
  ShieldCheckmark20Regular,
  Sparkle20Regular,
  LockClosed20Regular,
  PersonPasskey20Regular,
  Wallet20Regular,
  ChatMultiple20Regular,
  CheckmarkCircle20Regular,
  QuestionCircle20Regular,
  ChevronDown20Regular,
  ArrowRight16Regular,
  People20Regular,
  Warning20Regular,
} from '@fluentui/react-icons';
import type { RootState } from '../store';

type TabMode = 'hosts' | 'guests' | 'safety';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'Is Cue a dating or matchmaking app?',
    answer:
      'No. Cue is strictly a platonic experience companionship platform designed for shared activities, cafe chats, dining, shopping, movies, and events. Physical intimacy, romance solicitations, or inappropriate conduct are strictly prohibited and result in permanent account bans.',
  },
  {
    question: 'How does the 100% Escrow Protection guarantee work?',
    answer:
      'When a host books an outing, the total amount is held safely in our protected escrow system. The guest is never paid upfront. The funds are held safely until the outing finishes. Once both parties confirm completion via mutual PIN handshake, 85% of the fee is released to the guest wallet.',
  },
  {
    question: 'What happens if a guest cancels or fails to show up?',
    answer:
      'If a guest cancels or does not arrive at the agreed public venue, the escrow hold is automatically voided and 100% of the funds are refunded immediately to the host wallet or original payment method without deduction.',
  },
  {
    question: 'How do you verify guests before they appear in search?',
    answer:
      'Every guest applicant must submit a valid Government ID proof (Aadhaar, Passport, or Driving License) alongside a live camera selfie verification. Our human administration team reviews every document to confirm identity authenticity before any profile goes live.',
  },
  {
    question: 'What are the platform fees and payment options?',
    answer:
      'Guests set their own transparent hourly rates in Indian Rupees (₹). Cue takes a transparent 15% platform service fee that funds banking gateways, ID verification, customer support, and dispute mediation. Hosts pay via UPI (GPay, PhonePe, Paytm), NetBanking, or Credit/Debit Cards.',
  },
  {
    question: 'Can any registered user become a guest?',
    answer:
      'Yes! Cue uses a unified account model. Every registered user can host outings. If you want to accompany others as a guest and earn escrow payouts, you can apply by submitting your activities, hourly rates, and identity verification documents for review.',
  },
];

const HowItWorks: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<TabMode>('hosts');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Hero Section */}
      <section className="pt-12 pb-12 lg:pt-16 lg:pb-16 border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-light border border-border text-brand-fg text-caption1 font-semibold mb-4">
            <Sparkle20Regular />
            <span>Transparent, safe, community-driven</span>
          </div>

          <h1 className="text-title1 sm:text-large-title font-semibold text-foreground max-w-3xl mx-auto">
            How Cue Works
          </h1>
          <p className="mt-4 text-body2 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover verified people for coffee dates, dining, shopping, movies, and weekend outings.
            Protected by safe payments, identity verification, and community trust.
          </p>

          {/* Perspective Switcher */}
          <div className="mt-8 flex justify-center">
            <TabList
              selectedValue={activeTab}
              onTabSelect={(_, data) => setActiveTab(data.value as TabMode)}
              size="large"
            >
              <Tab value="hosts">For Hosts</Tab>
              <Tab value="guests">For Guests</Tab>
              <Tab value="safety">Safety & Escrow</Tab>
            </TabList>
          </div>
        </div>
      </section>

      {/* Main Tab Content */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
        {activeTab === 'hosts' && (
          <div className="space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-caption1 font-semibold text-brand-fg mb-1 block">
                The host experience
              </span>
              <h2 className="text-title2 sm:text-title1 font-semibold text-foreground">
                Host Outings in 4 Simple Steps
              </h2>
              <p className="text-muted-foreground text-body2 mt-2">
                Invite verified guests for social outings, dining, cafe catchups, shopping, and activities without awkwardness or safety concerns.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-accent-light text-brand-fg border border-border flex items-center justify-center font-semibold text-subtitle2 tabular mb-4">
                    1
                  </div>
                  <h3 className="text-subtitle2 font-semibold text-foreground mb-2">Explore & Match</h3>
                  <p className="text-body1 text-muted-foreground leading-relaxed">
                    Filter verified guests by specialty (coffee dates, restaurant visits, shopping, movies, weekend activities, special events), city, and hourly rate.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border text-caption1 text-brand-fg font-semibold flex items-center gap-1.5">
                  <CheckmarkCircle20Regular />
                  <span>Only verified profiles</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-accent-light text-brand-fg border border-border flex items-center justify-center font-semibold text-subtitle2 tabular mb-4">
                    2
                  </div>
                  <h3 className="text-subtitle2 font-semibold text-foreground mb-2">Pay Safely with Escrow</h3>
                  <p className="text-body1 text-muted-foreground leading-relaxed">
                    Pick a duration and time slot. Pay via UPI or Card. Your money is held in escrow and never paid upfront.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border text-caption1 text-success font-semibold flex items-center gap-1.5">
                  <LockClosed20Regular />
                  <span>100% Escrow Protection</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-accent-light text-brand-fg border border-border flex items-center justify-center font-semibold text-subtitle2 tabular mb-4">
                    3
                  </div>
                  <h3 className="text-subtitle2 font-semibold text-foreground mb-2">Chat & Coordinate</h3>
                  <p className="text-body1 text-muted-foreground leading-relaxed">
                    Real-time encrypted chat unlocks once booked. Agree on an open public location like a café, restaurant, or venue.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border text-caption1 text-brand-fg font-semibold flex items-center gap-1.5">
                  <ChatMultiple20Regular />
                  <span>Secure in-app messaging</span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-accent-light text-brand-fg border border-border flex items-center justify-center font-semibold text-subtitle2 tabular mb-4">
                    4
                  </div>
                  <h3 className="text-subtitle2 font-semibold text-foreground mb-2">Release & Review</h3>
                  <p className="text-body1 text-muted-foreground leading-relaxed">
                    Enjoy the outing. After the session wraps up, confirm completion to release payment and share an honest review.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border text-caption1 text-trust font-semibold flex items-center gap-1.5">
                  <Sparkle20Regular />
                  <span>Build community trust score</span>
                </div>
              </div>
            </div>

            <div className="text-center pt-2">
              <Link
                to="/discovery"
                className="min-h-11 inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-accent text-accent-foreground font-semibold hover:bg-accent-hover transition-colors shadow-2xs"
              >
                <span>Find a Guest Today</span>
                <ArrowRight16Regular />
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'guests' && (
          <div className="space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-caption1 font-semibold text-brand-fg mb-1 block">
                The guest journey
              </span>
              <h2 className="text-title2 sm:text-title1 font-semibold text-foreground">
                Earn by Attending Curated Outings
              </h2>
              <p className="text-muted-foreground text-body2 mt-2">
                Monetize your social time and conversational energy safely on your own schedule.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-accent-light text-brand-fg border border-border flex items-center justify-center font-semibold text-subtitle2 tabular mb-4">
                    1
                  </div>
                  <h3 className="text-subtitle2 font-semibold text-foreground mb-2">Apply in 4 Minutes</h3>
                  <p className="text-body1 text-muted-foreground leading-relaxed">
                    Set your own hourly rate in ₹, write your bio, choose specialties, and provide your payout UPI ID.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border text-caption1 text-brand-fg font-semibold flex items-center gap-1.5">
                  <Wallet20Regular />
                  <span>You control your pricing</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-accent-light text-brand-fg border border-border flex items-center justify-center font-semibold text-subtitle2 tabular mb-4">
                    2
                  </div>
                  <h3 className="text-subtitle2 font-semibold text-foreground mb-2">Identity & Safety Verification</h3>
                  <p className="text-body1 text-muted-foreground leading-relaxed">
                    Upload your Government ID proof and snap a live selfie. Our compliance team verifies your identity within 24 hours.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border text-caption1 text-success font-semibold flex items-center gap-1.5">
                  <PersonPasskey20Regular />
                  <span>Verified Guest badge</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-accent-light text-brand-fg border border-border flex items-center justify-center font-semibold text-subtitle2 tabular mb-4">
                    3
                  </div>
                  <h3 className="text-subtitle2 font-semibold text-foreground mb-2">Attend Outings</h3>
                  <p className="text-body1 text-muted-foreground leading-relaxed">
                    Receive booking requests from verified hosts. Confirm meeting dates and accompany them on great experiences.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border text-caption1 text-brand-fg font-semibold flex items-center gap-1.5">
                  <People20Regular />
                  <span>Flexible self-managed schedule</span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-accent-light text-brand-fg border border-border flex items-center justify-center font-semibold text-subtitle2 tabular mb-4">
                    4
                  </div>
                  <h3 className="text-subtitle2 font-semibold text-foreground mb-2">Get Paid Instantly</h3>
                  <p className="text-body1 text-muted-foreground leading-relaxed">
                    Keep 85% of every booking. Funds clear into your Cue Wallet immediately upon completion, withdrawable to UPI.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border text-caption1 text-success font-semibold flex items-center gap-1.5">
                  <Wallet20Regular />
                  <span>Instant UPI withdrawals</span>
                </div>
              </div>
            </div>

            <div className="text-center pt-2">
              <Link
                to={isAuthenticated ? '/apply-companion' : '/register?redirect=/apply-companion'}
                className="min-h-11 inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-accent text-accent-foreground font-semibold hover:bg-accent-hover transition-colors shadow-2xs"
              >
                <span>Apply to Become a Guest</span>
                <ArrowRight16Regular />
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'safety' && (
          <div className="space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-caption1 font-semibold text-brand-fg mb-1 block">
                Trust & financial security
              </span>
              <h2 className="text-title2 sm:text-title1 font-semibold text-foreground">
                The 4 Pillars of Cue Safety
              </h2>
              <p className="text-muted-foreground text-body2 mt-2">
                We designed Cue from the ground up so that neither hosts nor guests are ever exposed to financial or physical risk.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-success-light text-success border border-border flex items-center justify-center shrink-0">
                  <LockClosed20Regular />
                </div>
                <div>
                  <h3 className="text-subtitle2 font-semibold text-foreground mb-1.5">Protected Payment Guarantee</h3>
                  <p className="text-body1 text-muted-foreground leading-relaxed">
                    Funds are held securely by Cue until the experience concludes. Neither hosts nor guests risk losing money to no-shows or cancellations.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-accent-light text-brand-fg border border-border flex items-center justify-center shrink-0">
                  <PersonPasskey20Regular />
                </div>
                <div>
                  <h3 className="text-subtitle2 font-semibold text-foreground mb-1.5">Government ID & Biometric Verification</h3>
                  <p className="text-body1 text-muted-foreground leading-relaxed">
                    No anonymous accounts. Guests undergo government identity verification and cross-referenced live camera selfie checks.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-warning-light text-warning border border-border flex items-center justify-center shrink-0">
                  <Warning20Regular />
                </div>
                <div>
                  <h3 className="text-subtitle2 font-semibold text-foreground mb-1.5">Strictly Non-Romantic & Activity Focused</h3>
                  <p className="text-body1 text-muted-foreground leading-relaxed">
                    Our terms strictly mandate public venues (restaurants, parks, fitness centers, galleries). Romantic or intimate solicitations result in immediate permanent bans.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-trust-light text-trust border border-trust-border flex items-center justify-center shrink-0">
                  <ShieldCheckmark20Regular />
                </div>
                <div>
                  <h3 className="text-subtitle2 font-semibold text-foreground mb-1.5">24/7 Human Dispute Mediation</h3>
                  <p className="text-body1 text-muted-foreground leading-relaxed">
                    Encountered an issue or schedule mismatch? Our dedicated support staff inspects chat logs, GPS coordinates, and provides prompt fair resolutions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Comparison Grid Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="p-6 sm:p-10 rounded-2xl bg-card border border-border shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-title2 font-semibold text-foreground">
              Why Cue is Different
            </h2>
            <p className="text-body1 text-muted-foreground mt-1.5">
              How Cue protects you compared to traditional classifieds or informal meetups.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-body1">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-4 font-semibold text-foreground">Feature</th>
                  <th className="py-3 px-4 font-semibold text-brand-fg">Cue Platform</th>
                  <th className="py-3 px-4 font-semibold text-muted-foreground">Classifieds / Direct Meetups</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-foreground">Payment Protection</td>
                  <td className="py-3.5 px-4 text-success font-semibold">Protected until meetup is complete</td>
                  <td className="py-3.5 px-4 text-destructive">Upfront payment risk / scams</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-foreground">Identity Verification</td>
                  <td className="py-3.5 px-4 text-success font-semibold">Govt ID + Live Selfie Vetted</td>
                  <td className="py-3.5 px-4 text-destructive">Anonymous / unverified profiles</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-foreground">No-Show & Cancellation</td>
                  <td className="py-3.5 px-4 text-success font-semibold tabular">Instant 100% refund</td>
                  <td className="py-3.5 px-4 text-destructive">Zero recourse / lost funds</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-foreground">Platform Scope</td>
                  <td className="py-3.5 px-4 text-success font-semibold">Strictly activities & public venues</td>
                  <td className="py-3.5 px-4 text-muted-foreground">Unregulated & ambiguous</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-foreground">Ratings & Trust Scores</td>
                  <td className="py-3.5 px-4 text-success font-semibold">Immutable reviews from real bookings</td>
                  <td className="py-3.5 px-4 text-destructive">Fake reviews or none</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-light border border-border text-brand-fg text-caption1 font-semibold mb-3">
            <QuestionCircle20Regular />
            <span>Got questions?</span>
          </div>
          <h2 className="text-title2 sm:text-title1 font-semibold text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-body1 text-muted-foreground mt-1.5">
            Clear answers to common questions about using Cue safely.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-card border border-border shadow-2xs overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full min-h-14 text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-semibold text-body2 text-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-expanded={openFaq === idx}
              >
                <span>{faq.question}</span>
                <ChevronDown20Regular
                  className={`text-muted-foreground transition-transform duration-200 shrink-0 ${
                    openFaq === idx ? 'rotate-180 text-brand-fg' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-2 border-t border-border text-body1 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 text-center">
        <div className="p-8 sm:p-12 rounded-2xl bg-card border border-border shadow-sm">
          <h2 className="text-title2 sm:text-title1 font-semibold text-foreground mb-3">
            Start Exploring Today
          </h2>
          <p className="text-body2 text-muted-foreground max-w-xl mx-auto mb-8">
            Experience genuine connection with verified guests for coffee, dining, shopping, movies, and weekend outings.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/discovery"
              className="w-full sm:w-auto min-h-11 px-6 py-2.5 rounded-md bg-accent text-accent-foreground font-semibold text-body1 shadow-2xs hover:bg-accent-hover transition-colors flex items-center justify-center"
            >
              Discover Guests
            </Link>
            <Link
              to={isAuthenticated ? '/apply-companion' : '/register?redirect=/apply-companion'}
              className="w-full sm:w-auto min-h-11 px-6 py-2.5 rounded-md border border-border-strong bg-card text-foreground hover:bg-muted font-semibold text-body1 transition-colors flex items-center justify-center"
            >
              Become a Guest
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
