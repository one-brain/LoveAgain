import React from 'react';
import { Link } from 'react-router-dom';
import LegalShell from './LegalShell';
import {
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

const TermsOfService: React.FC = () => {
  return (
    <LegalShell
      title="Terms of Service"
      subtitle="The official terms and conditions governing your use of Cue, booking policies, escrow protection, and code of conduct."
      effectiveDate="October 2026"
    >
      {/* Layman Summary Callout */}
      <div className="p-5 sm:p-6 rounded-xl bg-accent/5 border border-accent/20 space-y-3">
        <div className="flex items-center gap-2 text-accent font-bold text-sm sm:text-base">
          <DocumentCheckIcon className="w-5 h-5 shrink-0" />
          <span>Terms at a Glance (Summary in Simple English)</span>
        </div>
        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
          Welcome to Cue! Before you start, here are the most important rules you need to know:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-foreground/80 pt-1">
          <div className="p-3 rounded-lg bg-card/60 border border-border/80">
            <span className="font-semibold text-foreground flex items-center gap-1.5 mb-1">
              <HeartIcon className="w-4 h-4 text-accent" />
              1. Strictly Platonic Experiences
            </span>
            <span>Cue is purely for shared activities (sports, dining, events, city tours). Romance, dating, escorting, or intimate solicitations are strictly forbidden.</span>
          </div>
          <div className="p-3 rounded-lg bg-card/60 border border-border/80">
            <span className="font-semibold text-foreground flex items-center gap-1.5 mb-1">
              <BanknotesIcon className="w-4 h-4 text-accent" />
              2. Protected Escrow Payments
            </span>
            <span>All fees stay protected in escrow. Companions are paid only after both parties complete the session. Never pay cash or off-platform UPI.</span>
          </div>
          <div className="p-3 rounded-lg bg-card/60 border border-border/80">
            <span className="font-semibold text-foreground flex items-center gap-1.5 mb-1">
              <ShieldCheckIcon className="w-4 h-4 text-accent" />
              3. Verified Identity (18+)
            </span>
            <span>You must be at least 18 years old. Companions must pass government ID verification and human approval before hosting.</span>
          </div>
          <div className="p-3 rounded-lg bg-card/60 border border-border/80">
            <span className="font-semibold text-foreground flex items-center gap-1.5 mb-1">
              <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
              4. Safe Public Venues
            </span>
            <span>Initial meetups must take place in public venues (cafes, gyms, parks, museums, restaurants) for mutual comfort and safety.</span>
          </div>
        </div>
      </div>

      {/* Section 1 */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">1. Contractual Agreement & Eligibility</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          These Terms of Service ("Terms") constitute a legally binding agreement between you ("User", "Seeker", or "Companion") and Cue Platform ("Cue", "we", "our"). By accessing our website, creating an account, or transacting on the platform, you represent and warrant that:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground pl-2">
          <li>You are at least <strong>18 years of age</strong> and legally capable of entering into binding contracts.</li>
          <li>All information and documentation provided during registration or verification are accurate, genuine, and current.</li>
          <li>You have not been previously suspended or barred from the Cue platform.</li>
        </ul>
      </section>

      {/* Section 2 */}
      <section id="platonic-mandate" className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold font-serif text-foreground">2. Strictly Platonic & Anti-Solicitation Mandate</h2>
          <span className="text-xs bg-red-500/10 text-red-600 dark:text-red-400 font-semibold px-2.5 py-0.5 rounded-full border border-red-500/20">
            Zero Tolerance
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Cue is an experiential companion marketplace designed for shared hobbies, skill-learning, domestic lifestyle help, and local exploration. Cue is <strong>not a dating service, matrimonial agency, or escort directory</strong>.
        </p>
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-xs sm:text-sm text-foreground/90 space-y-2">
          <p className="font-semibold text-destructive flex items-center gap-1.5">
            <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
            Strictly Prohibited Conduct:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
            <li>Any request, proposal, solicitation, or offer for romantic dates, physical intimacy, sexual services, or erotic acts.</li>
            <li>Inappropriate touching, suggestive comments, or harassment before, during, or after a meetup.</li>
            <li>Soliciting or accepting off-platform payments (such as direct cash, personal UPI, or outside transfers) to circumvent platform escrow safety rules.</li>
          </ul>
          <p className="text-xs font-medium text-foreground pt-1">
            Violation of this section results in an <strong>immediate, permanent ban</strong> across the network, forfeiture of any active escrow balances, and reporting to relevant law enforcement authorities where applicable.
          </p>
        </div>
      </section>

      {/* Section 3 */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">3. Escrow Bookings & Platform Fees</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          All financial transactions on Cue are denominated in <strong>Indian Rupees (₹)</strong> and processed under strict escrow protection:
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground pl-2">
          <li>
            <strong className="text-foreground">Escrow Holding:</strong> When a seeker books a companion session, 100% of the session fee is authorized and placed into a secure escrow hold. The companion is never paid upfront.
          </li>
          <li>
            <strong className="text-foreground">Completion & Release:</strong> Once the scheduled meetup has occurred and both parties have signed off or the 48-hour dispute window has lapsed without grievance, the escrow funds are automatically cleared.
          </li>
          <li>
            <strong className="text-foreground">Platform Service Fee (15%):</strong> Cue deducts a transparent 15% platform fee to cover automated payment processing, identity verification checks, platform infrastructure, and 24/7 dispute mediation. The remaining <strong>85%</strong> is credited directly to the companion's withdrawable wallet.
          </li>
          <li>
            <strong className="text-foreground">Direct Bank Payouts:</strong> Companions may request wallet withdrawal to their verified bank account or UPI VPA at any time, subject to standard bank settlement timelines (T+1 to T+2 days).
          </li>
        </ul>
      </section>

      {/* Section 4 */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">4. In-Person Safety & Code of Conduct</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Both seekers and companions must adhere to basic safety and decency standards during every session:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm pt-1">
          <div className="p-3.5 rounded-lg border border-border/80 bg-muted/20">
            <span className="font-semibold text-foreground block mb-1">Public Venues First</span>
            <span className="text-muted-foreground">Sessions must start and take place in public, well-lit spaces (cafes, restaurants, sports arenas, art galleries, or parks).</span>
          </div>
          <div className="p-3.5 rounded-lg border border-border/80 bg-muted/20">
            <span className="font-semibold text-foreground block mb-1">Zero Substance Abuse</span>
            <span className="text-muted-foreground">Consumption of illicit drugs, excessive alcohol intoxication, or possession of weapons is strictly prohibited during any session.</span>
          </div>
          <div className="p-3.5 rounded-lg border border-border/80 bg-muted/20">
            <span className="font-semibold text-foreground block mb-1">Punctuality & Respect</span>
            <span className="text-muted-foreground">Both parties must arrive promptly at the agreed time. Any delays exceeding 15 minutes must be communicated via in-app chat.</span>
          </div>
          <div className="p-3.5 rounded-lg border border-border/80 bg-muted/20">
            <span className="font-semibold text-foreground block mb-1">Immediate Exit Right</span>
            <span className="text-muted-foreground">Either party has the right to immediately terminate the session if they feel unsafe or uncomfortable, and report it through the safety desk.</span>
          </div>
        </div>
      </section>

      {/* Section 5 */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">5. Cancellations & Disputes</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Booking cancellations and refunds are subject to our formal{' '}
          <Link to="/cancellation-policy" className="text-accent underline font-semibold">
            Cancellation & Refund Policy
          </Link>
          . In the event of a dispute regarding service delivery or quality, our resolution team reviews the chat transcripts, booking records, and mutual statements to issue a binding determination within 48 hours.
        </p>
      </section>

      {/* Section 6 */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">6. Limitation of Liability</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Cue functions as a technology intermediary facilitating peer-to-peer connections and escrow settlements. While we conduct government identity checks and review companion profiles, Cue does not employ companions as agents or employees. Users interact with one another independently. To the maximum extent permitted by applicable law, Cue shall not be liable for indirect, incidental, punitive, or consequential damages arising out of in-person interactions, personal items, or third-party venue policies.
        </p>
      </section>

      {/* Section 7 */}
      <section className="space-y-3 pt-4 border-t border-border/60">
        <h2 className="text-xl font-bold font-serif text-foreground">7. Governing Law & Arbitration</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          These Terms and any dispute arising from your use of Cue shall be governed by and construed in accordance with the laws of India. Any unresolved dispute shall be referred to and finally resolved by binding arbitration conducted in accordance with the Arbitration and Conciliation Act, 1996, in New Delhi, India.
        </p>
      </section>
    </LegalShell>
  );
};

export default TermsOfService;

