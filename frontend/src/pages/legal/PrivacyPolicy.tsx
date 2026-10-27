import React from 'react';
import LegalShell from './LegalShell';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  EyeSlashIcon,
  IdentificationIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';

const PrivacyPolicy: React.FC = () => {
  return (
    <LegalShell
      title="Privacy Policy"
      subtitle="How Cue collects, protects, uses, and safeguards your personal data and identity verification documents."
      effectiveDate="October 2026"
    >
      {/* Layman Summary Callout */}
      <div className="p-5 sm:p-6 rounded-xl bg-accent/5 border border-accent/20 space-y-3">
        <div className="flex items-center gap-2 text-accent font-bold text-sm sm:text-base">
          <ShieldCheckIcon className="w-5 h-5 shrink-0" />
          <span>Privacy at a Glance (Summary in Simple English)</span>
        </div>
        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
          At Cue, your privacy and physical safety are fundamental. Here is our straightforward promise to you:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-foreground/80 pt-1">
          <li className="flex items-start gap-2">
            <CheckBadgeIcon className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <span><strong>Zero Data Selling:</strong> We never sell, rent, or trade your personal information to advertisers.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckBadgeIcon className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <span><strong>Private Contact:</strong> Your phone number and email are never shown publicly to visitors or other seekers.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckBadgeIcon className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <span><strong>Encrypted Government IDs:</strong> ID proofs submitted for companion verification are reviewed exclusively by human admins and stored encrypted.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckBadgeIcon className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <span><strong>Safe Payments:</strong> Card and bank details are handled by PCI-DSS compliant payment gateways. Cue never stores raw card credentials.</span>
          </li>
        </ul>
      </div>

      {/* Section 1 */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">1. Introduction & Platform Scope</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Cue ("we", "us", "our", or "the Platform") operates a verified companionship and lifestyle activity marketplace connecting verified companions with individuals seeking platonic activity partners (such as dining, sports, cultural events, cooking, and local guidance). This Privacy Policy explains our practices regarding the collection, use, disclosure, and protection of your personal information when you use our website, mobile interface, APIs, or customer support channels.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          By registering an account, booking an experience, or offering companionship services on Cue, you acknowledge and agree to the practices described herein.
        </p>
      </section>

      {/* Section 2 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-serif text-foreground">2. Information We Collect</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="p-4 rounded-xl bg-muted/30 border border-border/60">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2 mb-1.5">
              <IdentificationIcon className="w-4 h-4 text-accent" />
              A. Account & Profile Information
            </h3>
            <p className="leading-relaxed">
              When you create an account, we collect your first and last name, email address, mobile phone number, profile photo, and demographic preferences. If you apply as a companion, we additionally collect your listed specialties, activities, hourly fee, languages spoken, and bio.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-muted/30 border border-border/60">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2 mb-1.5">
              <LockClosedIcon className="w-4 h-4 text-accent" />
              B. Identity Verification Information
            </h3>
            <p className="leading-relaxed">
              To guarantee community trust and physical safety, companion applicants are required to submit valid Government identification proof (such as Aadhaar, Passport, Voter ID, or Driving License) alongside a live camera selfie. These documents are encrypted, stored in an isolated storage bucket, and used solely by our verification team to authenticate identity. They are never published or made available to the public.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-muted/30 border border-border/60">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2 mb-1.5">
              <EyeSlashIcon className="w-4 h-4 text-accent" />
              C. Location & Geolocation Data
            </h3>
            <p className="leading-relaxed">
              With your permission, we use approximate city or GPS coordinates to calculate proximity for the "Near Me" discovery search. We do not continuously track your real-time location in the background when the app is closed.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-muted/30 border border-border/60">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2 mb-1.5">
              <ShieldCheckIcon className="w-4 h-4 text-accent" />
              D. Booking & In-App Communication Records
            </h3>
            <p className="leading-relaxed">
              To mediate disputes, prevent fraud, and enforce our platonic safety policies, our systems retain records of booking requests, scheduled session dates, escrow transactions, and messages exchanged through our in-app chat.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">3. How We Use Your Information</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We process your information strictly for the following operational and safety purposes:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground pl-2">
          <li><strong>Matching & Discovery:</strong> Facilitating discovery of relevant companions based on specialties, gender preferences, and proximity.</li>
          <li><strong>Escrow Security & Payments:</strong> Holding booking fees safely in escrow until meetup completion and routing companion earnings.</li>
          <li><strong>Fraud & Threat Prevention:</strong> Detecting fraudulent accounts, unauthorized payment attempts, and violations of our Platonic Charter.</li>
          <li><strong>Dispute Resolution:</strong> Providing evidence and context to our 24/7 mediation team if a booking disagreement or safety incident arises.</li>
          <li><strong>Service Notifications:</strong> Sending OTP login codes, booking status alerts, and wallet transaction receipts via SMS or email.</li>
        </ul>
      </section>

      {/* Section 4 */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">4. Data Protection & Security Architecture</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We maintain rigorous industry-standard administrative, technical, and physical safeguards:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground pl-2">
          <li>All communication with our servers is encrypted using <strong>TLS 1.3 / HTTPS</strong>.</li>
          <li>Sensitive credentials and identity documents are encrypted at rest using <strong>AES-256</strong>.</li>
          <li>User passwords are never stored in plaintext; they are hashed using salted cryptographic algorithms (BCrypt / Argon2).</li>
          <li>Staff access to user documents is restricted through Role-Based Access Control (RBAC) and logged for auditability.</li>
        </ul>
      </section>

      {/* Section 5 */}
      <section id="cookies" className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">5. Cookies & Local Storage</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Cue uses essential session tokens and local storage strictly to keep you authenticated, remember your theme preference (dark/light mode), and preserve your active filters. We do not use third-party cross-site behavioral tracking cookies. You may manage your cookie preferences through your browser settings or our footer cookie controls.
        </p>
      </section>

      {/* Section 6 */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">6. Your Data Rights & Choices</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          You have full ownership of your personal data. You are entitled to:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm pt-1">
          <div className="p-3.5 rounded-lg border border-border/80 bg-muted/20">
            <span className="font-semibold text-foreground block mb-1">Access & Portability</span>
            <span className="text-muted-foreground">Request a copy of the personal data and booking history associated with your account.</span>
          </div>
          <div className="p-3.5 rounded-lg border border-border/80 bg-muted/20">
            <span className="font-semibold text-foreground block mb-1">Rectification</span>
            <span className="text-muted-foreground">Update or correct inaccurate profile info, photos, and contact numbers anytime via Account Settings.</span>
          </div>
          <div className="p-3.5 rounded-lg border border-border/80 bg-muted/20">
            <span className="font-semibold text-foreground block mb-1">Account Deletion</span>
            <span className="text-muted-foreground">Request permanent deletion of your account and identification records (subject to active financial escrow holds).</span>
          </div>
          <div className="p-3.5 rounded-lg border border-border/80 bg-muted/20">
            <span className="font-semibold text-foreground block mb-1">Consent Withdrawal</span>
            <span className="text-muted-foreground">Withdraw consent for non-essential notifications or pause your companion public visibility at will.</span>
          </div>
        </div>
      </section>

      {/* Section 7 */}
      <section id="grievance" className="space-y-3 pt-4 border-t border-border/60">
        <h2 className="text-xl font-bold font-serif text-foreground">7. Grievance Officer & Inquiries</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          In accordance with data protection regulations, if you have any questions, concerns, or grievances regarding our handling of your personal data, you may reach our designated Grievance Officer:
        </p>
        <div className="p-4 rounded-xl bg-card border border-border/80 text-xs sm:text-sm text-muted-foreground space-y-1">
          <p><strong className="text-foreground">Designation:</strong> Data Protection & Grievance Redressal Officer</p>
          <p><strong className="text-foreground">Platform:</strong> Cue Platform (LoveAgain Services)</p>
          <p><strong className="text-foreground">Email:</strong> <a href="mailto:grievance@cue.local" className="text-accent underline font-medium">grievance@cue.local</a> (cc: <a href="mailto:support@cue.local" className="text-accent underline font-medium">support@cue.local</a>)</p>
          <p><strong className="text-foreground">Response SLA:</strong> We acknowledge requests within 24 hours and resolve grievances within 15 working days.</p>
        </div>
      </section>
    </LegalShell>
  );
};

export default PrivacyPolicy;

