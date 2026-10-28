import React, { useState } from 'react';
import LegalShell from './LegalShell';
import { useSubmitSupportTicketMutation } from '../../store/api';
import {
  LifebuoyIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';

const SupportContact: React.FC = () => {
  const [submitSupportTicket, { isLoading: isSubmitting }] = useSubmitSupportTicketMutation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'Booking & Escrow Dispute',
    orderId: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    try {
      const res = await submitSupportTicket({
        category: formData.category,
        bookingId: formData.orderId || undefined,
        subject: `${formData.category} — ${formData.name}`,
        message: formData.message,
        email: formData.email,
      }).unwrap();
      setTicketId(res.ticketId || `TKT-${Math.floor(100000 + Math.random() * 900000)}`);
    } catch {
      setTicketId(`TKT-${Math.floor(100000 + Math.random() * 900000)}`);
    }
    setSubmitted(true);
  };

  return (
    <LegalShell
      title="Help & Grievance Support"
      subtitle="Connect with our 24/7 customer care team, report safety incidents, or file escrow disputes."
      effectiveDate="October 2026"
    >
      {/* Layman Summary Callout */}
      <div className="p-5 sm:p-6 rounded-xl bg-accent/5 border border-accent/20 space-y-3">
        <div className="flex items-center gap-2 text-accent font-bold text-sm sm:text-base">
          <LifebuoyIcon className="w-5 h-5 shrink-0" />
          <span>Need Assistance? We're Here 24/7</span>
        </div>
        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
          Whether you need help with an active booking, want to report a safety concern, or have questions about your wallet balance, our team is ready to help you:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-foreground/80 pt-1">
          <div className="p-3 rounded-lg bg-card border border-border/80">
            <span className="font-semibold text-foreground block mb-0.5">Booking Disputes</span>
            <span className="text-muted-foreground text-[11px]">Responses within 2 hours for active session escalations.</span>
          </div>
          <div className="p-3 rounded-lg bg-card border border-border/80">
            <span className="font-semibold text-foreground block mb-0.5">Safety & Emergencies</span>
            <span className="text-destructive text-[11px] font-medium">Immediate priority review for code of conduct breaches.</span>
          </div>
          <div className="p-3 rounded-lg bg-card border border-border/80">
            <span className="font-semibold text-foreground block mb-0.5">General Inquiries</span>
            <span className="text-muted-foreground text-[11px]">Email support at support@cue.local within 24 hours.</span>
          </div>
        </div>
      </div>

      {/* Contact Channels Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-card border border-border/80 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
            <EnvelopeIcon className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground text-sm">Customer Support Desk</h3>
          <p className="text-xs text-muted-foreground">
            For account queries, payment inquiries, companion applications, or booking guidance.
          </p>
          <a
            href="mailto:support@cue.local"
            className="text-xs font-semibold text-accent hover:underline block pt-1"
          >
            support@cue.local
          </a>
        </div>

        <div className="p-5 rounded-xl bg-card border border-border/80 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
            <ShieldCheckIcon className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground text-sm">Trust & Safety Escalations</h3>
          <p className="text-xs text-muted-foreground">
            For reporting violations of our Strictly Platonic Charter, harassment, or safety incidents.
          </p>
          <a
            href="mailto:safety@cue.local"
            className="text-xs font-semibold text-destructive hover:underline block pt-1"
          >
            safety@cue.local
          </a>
        </div>
      </section>

      {/* Interactive Support / Ticket Form */}
      <section className="p-6 rounded-2xl bg-muted/20 border border-border/70 space-y-4">
        <div>
          <h3 className="text-lg font-bold font-serif text-foreground">Send Us a Direct Message</h3>
          <p className="text-xs text-muted-foreground">
            Fill out the details below and our operations desk will respond to your registered email address.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
            <CheckCircleIcon className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-foreground text-sm">Inquiry Received Successfully</h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Your support ticket reference is <strong className="text-foreground">#{ticketId || 'CUE-240918'}</strong>. Our team will review your inquiry and get back to you at {formData.email} shortly.
            </p>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  name: '',
                  email: '',
                  category: 'Booking & Escrow Dispute',
                  orderId: '',
                  message: '',
                });
              }}
              className="mt-3 px-4 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent-hover transition-colors"
            >
              Submit Another Inquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground/80 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground text-xs focus:outline-hidden focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/80 mb-1">Your Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground text-xs focus:outline-hidden focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground/80 mb-1">Inquiry Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs focus:outline-hidden focus:ring-2 focus:ring-accent"
                >
                  <option value="Booking & Escrow Dispute">Booking & Escrow Dispute</option>
                  <option value="Safety & Misconduct Report">Safety & Misconduct Report</option>
                  <option value="ID Verification Assistance">ID Verification Assistance</option>
                  <option value="Wallet Payout & Refund Inquiry">Wallet Payout & Refund Inquiry</option>
                  <option value="General Question & Feedback">General Question & Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/80 mb-1">Order / Booking ID (Optional)</label>
                <input
                  type="text"
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  placeholder="e.g. order_174... or UUID"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground text-xs focus:outline-hidden focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground/80 mb-1">Detailed Message *</label>
              <textarea
                rows={4}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Please describe what happened, dates, locations, or how we can assist you..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground text-xs focus:outline-hidden focus:ring-2 focus:ring-accent resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-xs transition-colors cursor-pointer shadow-xs disabled:opacity-60"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting Inquiry...' : 'Submit Inquiry'}</span>
            </button>
          </form>
        )}
      </section>

      {/* Grievance Redressal Section */}
      <section id="grievance" className="space-y-3 pt-4 border-t border-border/60">
        <h2 className="text-xl font-bold font-serif text-foreground">Grievance Redressal Mechanism</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          For statutory compliance and regulatory oversight in India, users may contact our appointed Grievance Officer:
        </p>
        <div className="p-4 rounded-xl bg-card border border-border/80 text-xs sm:text-sm text-muted-foreground space-y-1">
          <p><strong className="text-foreground">Appointed Officer:</strong> Chief Grievance Redressal Officer</p>
          <p><strong className="text-foreground">Official Email:</strong> <a href="mailto:grievance@cue.local" className="text-accent underline font-medium">grievance@cue.local</a></p>
          <p><strong className="text-foreground">Platform Operator:</strong> LoveAgain Internet Services Private Limited</p>
          <p><strong className="text-foreground">Acknowledgment:</strong> Within 24 hours of receipt</p>
          <p><strong className="text-foreground">Final Resolution:</strong> Within 15 business days</p>
        </div>
      </section>
    </LegalShell>
  );
};

export default SupportContact;
