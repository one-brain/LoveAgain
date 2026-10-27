import React from 'react';
import { Link } from 'react-router-dom';
import LegalShell from './LegalShell';
import {
  UserGroupIcon,
  ShieldCheckIcon,
  HeartIcon,
  ExclamationCircleIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

const CommunityGuidelines: React.FC = () => {
  return (
    <LegalShell
      title="Community Guidelines"
      subtitle="Our code of conduct, safety standards, and mutual expectations for fostering safe and meaningful companionship."
      effectiveDate="October 2026"
    >
      {/* Layman Summary Callout */}
      <div className="p-5 sm:p-6 rounded-xl bg-accent/5 border border-accent/20 space-y-3">
        <div className="flex items-center gap-2 text-accent font-bold text-sm sm:text-base">
          <UserGroupIcon className="w-5 h-5 shrink-0" />
          <span>Community Standards (In Simple English)</span>
        </div>
        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
          Cue is built on human warmth, shared passions, and verified trust. To ensure every meetup is joyful and safe, we expect everyone to follow 4 golden principles:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-foreground/80 pt-1">
          <li className="flex items-start gap-2">
            <HeartIcon className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <span><strong>Treat Everyone with Respect:</strong> Be courteous, arrive on time, and communicate clearly before meeting.</span>
          </li>
          <li className="flex items-start gap-2">
            <ShieldCheckIcon className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <span><strong>Always Meet in Public:</strong> Parks, cafes, museums, sports centers, and restaurants keep meetups comfortable for both sides.</span>
          </li>
          <li className="flex items-start gap-2">
            <SparklesIcon className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <span><strong>Keep It Platonic:</strong> Cue is for companionship, learning, and fun activities—never for dating or physical intimacy.</span>
          </li>
          <li className="flex items-start gap-2">
            <ChatBubbleLeftRightIcon className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <span><strong>Keep Payments On-Platform:</strong> Always book and pay through Cue escrow so your funds are 100% protected.</span>
          </li>
        </ul>
      </div>

      {/* Section 1 */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">1. The Core Tenet: Safe Platonic Human Connection</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          In a world with increasing digital isolation, Cue creates real-world spaces where people can discover companionship for fitness, artistic pursuits, dining, cooking, and city exploration. Our community thrives only when every member feels respected, heard, and physically secure.
        </p>
      </section>

      {/* Section 2 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-serif text-foreground">2. Guidelines for Experience Seekers</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="p-4 rounded-xl bg-card border border-border/80">
            <h3 className="font-semibold text-foreground text-sm mb-1">Clear Communication & Realistic Expectations</h3>
            <p className="text-xs sm:text-sm leading-relaxed">
              Before confirming a booking, use the in-app chat to clarify the meetup agenda (e.g. playing tennis, visiting an art gallery, or preparing festival decor). Ensure both you and the companion are aligned on expectations and venue.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border/80">
            <h3 className="font-semibold text-foreground text-sm mb-1">Honor Personal Space & Physical Boundaries</h3>
            <p className="text-xs sm:text-sm leading-relaxed">
              Respect the personal space and bodily autonomy of your companion. Handshakes or friendly greetings in accordance with local customs are acceptable; non-consensual physical contact, unwanted advances, or suggestive remarks are strictly prohibited.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border/80">
            <h3 className="font-semibold text-foreground text-sm mb-1">Punctuality & Expenses</h3>
            <p className="text-xs sm:text-sm leading-relaxed">
              Respect the companion’s reserved time. If you are delayed, notify them promptly through chat. Activity-related expenses (e.g. your own meal, museum entry tickets, or sports court fees) should be agreed upon in advance; companion hourly fees do not automatically cover personal seeker expenses unless agreed.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-serif text-foreground">3. Guidelines for Companion Hosts</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="p-4 rounded-xl bg-card border border-border/80">
            <h3 className="font-semibold text-foreground text-sm mb-1">Authentic Representation</h3>
            <p className="text-xs sm:text-sm leading-relaxed">
              Your profile photos, bios, listed specialties, and hourly rates must represent you truthfully. Impersonating someone else or using misleading stock imagery is grounds for immediate account suspension.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border/80">
            <h3 className="font-semibold text-foreground text-sm mb-1">Reliability & Commitment</h3>
            <p className="text-xs sm:text-sm leading-relaxed">
              When you accept a session, you are making a binding commitment. Cancellations disrupt the seeker's plans and harm your platform Trust Score. In case of genuine emergencies, notify the client as early as possible.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border/80">
            <h3 className="font-semibold text-foreground text-sm mb-1">Safety First</h3>
            <p className="text-xs sm:text-sm leading-relaxed">
              Always ensure meetups happen in safe, well-lit spaces. If you ever feel uncomfortable with a seeker's behavior or topic of conversation, you have full authority to conclude the meetup early and notify Cue support.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4 */}
      <section id="platonic-charter" className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">4. Zero-Tolerance Red Lines</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The following violations will result in immediate termination of account access and referral to legal authorities where warranted:
        </p>
        <div className="space-y-2 text-xs sm:text-sm text-foreground/90">
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <ExclamationCircleIcon className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <span><strong>Sexual or Romantic Harassment:</strong> Any solicitation of intimacy, non-consensual touching, or suggestive messages.</span>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <ExclamationCircleIcon className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <span><strong>Off-Platform Escrow Bypassing:</strong> Asking a seeker to cancel on the app and pay via cash or UPI directly.</span>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <ExclamationCircleIcon className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <span><strong>Substance Abuse & Intoxication:</strong> Using illicit drugs or displaying violent or intoxicated behavior during a session.</span>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <ExclamationCircleIcon className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <span><strong>Hate Speech & Discrimination:</strong> Any form of verbal abuse or refusal of service on grounds of religion, caste, gender, sexual orientation, disability, or nationality.</span>
          </div>
        </div>
      </section>

      {/* Section 5 */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">5. Community Trust Score System</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Every profile on Cue displays an algorithmic <strong>Trust Score (0 to 100)</strong> based on:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-center">
          <div className="p-3 rounded-lg bg-card border border-border/80">
            <span className="text-accent font-bold text-base block mb-0.5">30%</span>
            <span className="text-muted-foreground">ID & Selfie Verification</span>
          </div>
          <div className="p-3 rounded-lg bg-card border border-border/80">
            <span className="text-accent font-bold text-base block mb-0.5">35%</span>
            <span className="text-muted-foreground">Completed Sessions & Ratings</span>
          </div>
          <div className="p-3 rounded-lg bg-card border border-border/80">
            <span className="text-accent font-bold text-base block mb-0.5">20%</span>
            <span className="text-muted-foreground">Punctuality & Reliability</span>
          </div>
          <div className="p-3 rounded-lg bg-card border border-border/80">
            <span className="text-accent font-bold text-base block mb-0.5">15%</span>
            <span className="text-muted-foreground">Community Clean History</span>
          </div>
        </div>
      </section>

      {/* Section 6 */}
      <section className="space-y-3 pt-4 border-t border-border/60">
        <h2 className="text-xl font-bold font-serif text-foreground">6. Reporting & Immediate Assistance</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          If you ever encounter uncomfortable behavior, or someone violates our guidelines, report them immediately. You can flag a profile from their page or reach our 24/7 safety team:
        </p>
        <div className="p-4 rounded-xl bg-card border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
          <div>
            <strong className="text-foreground block">Need help right away?</strong>
            <span className="text-muted-foreground">Our moderation team reviews safety escalations in real-time.</span>
          </div>
          <Link
            to="/support"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-accent text-accent-foreground font-semibold text-xs hover:bg-accent-hover transition-colors shrink-0"
          >
            Contact Safety Team
          </Link>
        </div>
      </section>
    </LegalShell>
  );
};

export default CommunityGuidelines;

