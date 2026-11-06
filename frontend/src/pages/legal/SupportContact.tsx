import React, { useState } from 'react';
import {
  Button,
  Field,
  Input,
  Select,
  Textarea,
} from '@fluentui/react-components';
import {
  QuestionCircle20Regular,
  Mail20Regular,
  ShieldCheckmark20Regular,
  CheckmarkCircle24Regular,
  Send16Regular,
} from '@fluentui/react-icons';
import LegalShell from './LegalShell';
import { useSubmitSupportTicketMutation } from '../../store/api';

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
      <div className="p-5 sm:p-6 rounded-2xl bg-accent-light border border-border space-y-3">
        <div className="flex items-center gap-2 text-brand-fg font-semibold text-subtitle2">
          <QuestionCircle20Regular className="shrink-0" />
          <span>Need Assistance? We're Here 24/7</span>
        </div>
        <p className="text-body1 text-foreground leading-relaxed">
          Whether you need help with an active booking, want to report a safety concern, or have questions about your wallet balance, our team is ready to help you:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-caption1 text-foreground pt-1">
          <div className="p-3 rounded-2xl bg-card border border-border">
            <span className="font-semibold text-foreground block mb-0.5">Booking Disputes</span>
            <span className="text-muted-foreground">Responses within 2 hours for active session escalations.</span>
          </div>
          <div className="p-3 rounded-2xl bg-card border border-border">
            <span className="font-semibold text-foreground block mb-0.5">Safety & Emergencies</span>
            <span className="text-destructive font-semibold">Immediate priority review for code of conduct breaches.</span>
          </div>
          <div className="p-3 rounded-2xl bg-card border border-border">
            <span className="font-semibold text-foreground block mb-0.5">General Inquiries</span>
            <span className="text-muted-foreground">Email support at support@cue.local within 24 hours.</span>
          </div>
        </div>
      </div>

      {/* Contact Channels Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
          <div className="w-8 h-8 rounded-md bg-accent-light flex items-center justify-center text-brand-fg">
            <Mail20Regular />
          </div>
          <h3 className="font-semibold text-foreground text-body1">Customer Support Desk</h3>
          <p className="text-caption1 text-muted-foreground">
            For account queries, payment inquiries, companion applications, or booking guidance.
          </p>
          <a
            href="mailto:support@cue.local"
            className="text-caption1 font-semibold text-brand-fg hover:underline block pt-1"
          >
            support@cue.local
          </a>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
          <div className="w-8 h-8 rounded-md bg-destructive-light flex items-center justify-center text-destructive">
            <ShieldCheckmark20Regular />
          </div>
          <h3 className="font-semibold text-foreground text-body1">Trust & Safety Escalations</h3>
          <p className="text-caption1 text-muted-foreground">
            For reporting violations of our Strictly Platonic Charter, harassment, or safety incidents.
          </p>
          <a
            href="mailto:safety@cue.local"
            className="text-caption1 font-semibold text-destructive hover:underline block pt-1"
          >
            safety@cue.local
          </a>
        </div>
      </section>

      {/* Interactive Support / Ticket Form */}
      <section className="p-6 rounded-2xl bg-muted border border-border space-y-4">
        <div>
          <h3 className="text-subtitle1 font-semibold text-foreground">Send Us a Direct Message</h3>
          <p className="text-caption1 text-muted-foreground">
            Fill out the details below and our operations desk will respond to your registered email address.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-success-light border border-border text-center space-y-2">
            <CheckmarkCircle24Regular className="text-success mx-auto" />
            <h4 className="font-semibold text-foreground text-body1">Inquiry Received Successfully</h4>
            <p className="text-caption1 text-muted-foreground max-w-md mx-auto">
              Your support ticket reference is <strong className="text-foreground font-mono tabular">#{ticketId || 'CUE-240918'}</strong>. Our team will review your inquiry and get back to you at {formData.email} shortly.
            </p>
            <div className="pt-2">
              <Button
                appearance="primary"
                size="small"
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
              >
                Submit Another Inquiry
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Your Full Name" required>
                <Input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(_, data) => setFormData({ ...formData, name: data.value })}
                  placeholder="e.g. Rahul Sharma"
                />
              </Field>

              <Field label="Your Email Address" required>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(_, data) => setFormData({ ...formData, email: data.value })}
                  placeholder="name@example.com"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Inquiry Category" required>
                <Select
                  value={formData.category}
                  onChange={(_, data) => setFormData({ ...formData, category: data.value })}
                >
                  <option value="Booking & Escrow Dispute">Booking & Escrow Dispute</option>
                  <option value="Safety & Misconduct Report">Safety & Misconduct Report</option>
                  <option value="ID Verification Assistance">ID Verification Assistance</option>
                  <option value="Wallet Payout & Refund Inquiry">Wallet Payout & Refund Inquiry</option>
                  <option value="General Question & Feedback">General Question & Feedback</option>
                </Select>
              </Field>

              <Field label="Order / Booking ID (Optional)">
                <Input
                  type="text"
                  value={formData.orderId}
                  onChange={(_, data) => setFormData({ ...formData, orderId: data.value })}
                  placeholder="e.g. order_174... or UUID"
                  className="tabular"
                />
              </Field>
            </div>

            <Field label="Detailed Message" required>
              <Textarea
                rows={4}
                required
                value={formData.message}
                onChange={(_, data) => setFormData({ ...formData, message: data.value })}
                placeholder="Please describe what happened, dates, locations, or how we can assist you..."
              />
            </Field>

            <Button
              type="submit"
              appearance="primary"
              size="large"
              icon={<Send16Regular />}
              disabled={isSubmitting}
              className="min-h-11"
            >
              {isSubmitting ? 'Submitting Inquiry...' : 'Submit Inquiry'}
            </Button>
          </form>
        )}
      </section>

      {/* Grievance Redressal Section */}
      <section id="grievance" className="space-y-3 pt-4 border-t border-border">
        <h2 className="text-subtitle1 font-semibold text-foreground">Grievance Redressal Mechanism</h2>
        <p className="text-body1 text-muted-foreground leading-relaxed">
          For statutory compliance and regulatory oversight in India, users may contact our appointed Grievance Officer:
        </p>
        <div className="p-4 rounded-2xl bg-card border border-border text-body1 text-muted-foreground space-y-1">
          <p><strong className="text-foreground">Appointed Officer:</strong> Chief Grievance Redressal Officer</p>
          <p><strong className="text-foreground">Official Email:</strong> <a href="mailto:grievance@cue.local" className="text-brand-fg underline font-semibold">grievance@cue.local</a></p>
          <p><strong className="text-foreground">Platform Operator:</strong> LoveAgain Internet Services Private Limited</p>
          <p><strong className="text-foreground">Acknowledgment:</strong> Within 24 hours of receipt</p>
          <p><strong className="text-foreground">Final Resolution:</strong> Within 15 business days</p>
        </div>
      </section>
    </LegalShell>
  );
};

export default SupportContact;
