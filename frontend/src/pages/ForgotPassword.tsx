import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components';
import {
  Mail20Regular,
  CheckmarkCircle24Regular,
  ShieldCheckmark16Regular,
  ArrowRight16Regular,
} from '@fluentui/react-icons';
import { useForgotPasswordMutation } from '../store/authApi';
import { AuthShell } from '../components/auth/AuthShell';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      await forgotPassword({ email: email.trim().toLowerCase() }).unwrap();
      setIsSubmitted(true);
    } catch {
      setIsSubmitted(true);
    }
  };

  return (
    <AuthShell
      title={isSubmitted ? 'Check your inbox' : 'Reset your password'}
      subtitle={
        isSubmitted
          ? 'We sent a secure password recovery link to your email.'
          : 'Enter the email linked to your Cue account and we will send an encrypted reset link.'
      }
      badgeText="Account Recovery"
      backLink={{ to: '/login', label: 'Back to sign in' }}
      editorialTitle="Encrypted account recovery."
      editorialSubtitle="Password reset links are single-use, valid for 60 minutes, and automatically revoke stale sessions once updated."
    >
      {isSubmitted ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-success-light border border-border flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-card border border-border text-success flex items-center justify-center shrink-0">
              <CheckmarkCircle24Regular />
            </div>
            <div className="space-y-1 min-w-0">
              <p className="text-body2 font-semibold text-foreground">
                Reset link dispatched
              </p>
              <p className="text-caption1 text-muted-foreground leading-relaxed break-words">
                If an account exists for <strong className="text-foreground font-semibold">{email}</strong>, a recovery link valid for <strong className="tabular">1 hour</strong> is on its way.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-muted border border-border text-caption1 text-muted-foreground space-y-1.5">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <ShieldCheckmark16Regular className="text-brand-fg shrink-0" />
              <span>Next steps</span>
            </p>
            <p>1. Open the reset link in your email to choose a new password.</p>
            <p>2. Check your spam or promotions folder if it does not arrive within 2 minutes.</p>
          </div>

          <div className="pt-1 flex flex-col gap-2">
            <Button
              appearance="primary"
              size="large"
              onClick={() => navigate('/login')}
              className="w-full min-h-11"
            >
              Sign in
            </Button>
            <Button
              appearance="subtle"
              size="medium"
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
              className="w-full"
            >
              Try another email
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <MessageBar intent="error">
              <MessageBarBody>{error}</MessageBarBody>
            </MessageBar>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label="Email address"
              required
              hint="You can also sign in directly via Mobile & OTP if your phone is linked."
            >
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                autoFocus
                value={email}
                onChange={(_, data) => setEmail(data.value)}
                placeholder="you@example.com"
                contentBefore={<Mail20Regular className="text-muted-foreground" />}
                className="w-full"
              />
            </Field>

            <Button
              type="submit"
              appearance="primary"
              size="large"
              disabled={isLoading}
              icon={<ArrowRight16Regular />}
              iconPosition="after"
              className="w-full min-h-11"
            >
              {isLoading ? 'Sending link...' : 'Send link'}
            </Button>
          </form>

          <p className="text-caption1 text-muted-foreground text-center pt-1">
            Remember your password?{' '}
            <Link to="/login" className="font-semibold text-brand-fg hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      )}
    </AuthShell>
  );
};

export default ForgotPassword;
