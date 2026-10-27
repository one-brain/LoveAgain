import React from 'react';
import { Link } from 'react-router-dom';
import LegalShell from './LegalShell';
import {
  ArrowPathIcon,
  ClockIcon,
  CheckBadgeIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const CancellationPolicy: React.FC = () => {
  return (
    <LegalShell
      title="Cancellation & Refund Policy"
      subtitle="Transparent, fair cancellation rules protecting seeker flexibility and companion time."
      effectiveDate="October 2026"
    >
      {/* Layman Summary Callout */}
      <div className="p-5 sm:p-6 rounded-xl bg-accent/5 border border-accent/20 space-y-3">
        <div className="flex items-center gap-2 text-accent font-bold text-sm sm:text-base">
          <ArrowPathIcon className="w-5 h-5 shrink-0" />
          <span>Refund Rules at a Glance (Summary in Simple English)</span>
        </div>
        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
          We know plans can change. Here is how cancellations and refunds work on Cue:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-foreground/80 pt-1">
          <div className="p-3.5 rounded-xl bg-card border border-border/80 text-center space-y-1">
            <span className="text-emerald-500 font-bold text-lg block">100% Refund</span>
            <strong className="text-foreground block">&gt; 24 Hours Before</strong>
            <span className="text-muted-foreground block text-[11px]">Cancel anytime with more than 24h notice for a full wallet refund.</span>
          </div>
          <div className="p-3.5 rounded-xl bg-card border border-border/80 text-center space-y-1">
            <span className="text-amber-500 font-bold text-lg block">80% Refund</span>
            <strong className="text-foreground block">2 to 24 Hours Before</strong>
            <span className="text-muted-foreground block text-[11px]">80% refunded to you; 20% goes to companion for holding their schedule.</span>
          </div>
          <div className="p-3.5 rounded-xl bg-card border border-border/80 text-center space-y-1">
            <span className="text-red-500 font-bold text-lg block">No Refund</span>
            <strong className="text-foreground block">&lt; 2 Hours / No-Show</strong>
            <span className="text-muted-foreground block text-[11px]">Late cancellation compensates companion for their travel and reserved time.</span>
          </div>
        </div>
      </div>

      {/* Section 1 */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">1. Overview & Fair Balance Principle</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Cue operates a fair escrow system. When a seeker confirms a booking, the companion locks out their calendar and declines other potential clients for that time slot. Our refund rules balance flexibility for the client with economic fairness for the companion.
        </p>
      </section>

      {/* Section 2 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-serif text-foreground">2. Client Cancellation Tiers</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="p-4 rounded-xl bg-card border border-border/80">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-emerald-500" />
                More Than 24 Hours Notice
              </h3>
              <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                100% Refund
              </span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed">
              If you cancel more than 24 hours before the session start time, 100% of the booking escrow amount is immediately credited back to your Cue Wallet. No cancellation fees apply.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border/80">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-amber-500" />
                Between 2 and 24 Hours Notice
              </h3>
              <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full">
                80% Refund
              </span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed">
              If you cancel between 2 and 24 hours before the session start time, 80% of the booking fee is refunded to your wallet. The remaining 20% is credited to the companion as inconvenience compensation for their reserved time.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border/80">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-destructive" />
                Less Than 2 Hours Notice or No-Show
              </h3>
              <span className="text-xs bg-destructive/10 text-destructive font-bold px-2 py-0.5 rounded-full">
                Non-Refundable
              </span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed">
              If you cancel less than 2 hours before the meetup or fail to arrive at the agreed location within 20 minutes of start time without communication, the booking is deemed a client no-show. The session fee (minus platform service fee) is paid to the companion to compensate for their time and transit.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">3. Companion Cancellations & No-Shows</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Companions are held to strict punctuality and reliability standards. If a companion cancels a confirmed session at any point:
        </p>
        <div className="p-4 rounded-xl bg-card border border-border/80 space-y-2 text-xs sm:text-sm text-foreground/90">
          <div className="flex items-start gap-2">
            <CheckBadgeIcon className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>100% Instant Refund:</strong> The seeker receives an immediate 100% refund of all escrowed funds into their wallet.</span>
          </div>
          <div className="flex items-start gap-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <span><strong>Trust Score Penalty:</strong> The companion incurs an automatic -15 point penalty on their public Trust Score. Repeated unexcused cancellations result in profile suspension.</span>
          </div>
          <div className="flex items-start gap-2">
            <BanknotesIcon className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <span><strong>Courtesy Credit:</strong> For late companion cancellations (under 4 hours), Cue provides the seeker with a ₹100 platform credit towards their next booking.</span>
          </div>
        </div>
      </section>

      {/* Section 4 */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">4. The 48-Hour Escrow Dispute Window</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Once a session ends, the escrow funds are held in a pending state for <strong>48 hours</strong> before being released to the companion's withdrawable balance. If an issue occurred during the session (such as early departure, misconduct, or severe misrepresentation), either party can file a dispute within this window via the{' '}
          <Link to="/support" className="text-accent underline font-semibold">
            Support Desk
          </Link>
          . Our team will freeze the funds and review evidence before issuing an impartial verdict.
        </p>
      </section>

      {/* Section 5 */}
      <section className="space-y-3 pt-4 border-t border-border/60">
        <h2 className="text-xl font-bold font-serif text-foreground">5. How Refunds Are Processed</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Refunds are credited immediately to your <strong>Cue Wallet</strong> in Indian Rupees (₹), where they can be applied instantly toward another companion experience. If you paid directly via card/UPI and prefer a return to your original payment method, you may request a payout from your wallet page, which typically reflects in your bank account within 3 to 5 business days.
        </p>
      </section>
    </LegalShell>
  );
};

export default CancellationPolicy;

