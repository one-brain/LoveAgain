import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components';
import {
  Sparkle16Regular,
  Mail20Regular,
  ArrowLeft16Regular,
  CheckmarkCircle24Regular,
  ShieldCheckmark16Regular,
} from '@fluentui/react-icons';
import { useForgotPasswordMutation } from '../store/authApi';

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
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 sm:px-6 py-12 bg-background">
      <Card className="w-full max-w-[440px] bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-caption1 font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft16Regular />
            <span>Back to Sign In</span>
          </Link>
          <div className="w-7 h-7 rounded-md bg-accent-light flex items-center justify-center text-brand-fg">
            <Sparkle16Regular />
          </div>
        </div>

        {isSubmitted ? (
          <div className="text-center space-y-4 py-2">
            <div className="w-12 h-12 rounded-2xl bg-success-light border border-border text-success flex items-center justify-center mx-auto">
              <CheckmarkCircle24Regular />
            </div>
            <h1 className="text-title2 font-semibold text-foreground">
              Check your inbox
            </h1>
            <p className="text-body1 text-muted-foreground leading-relaxed">
              If an account is associated with <strong className="text-foreground font-semibold">{email}</strong>, we have sent a password reset link valid for <strong>1 hour</strong>.
            </p>
            <div className="p-3.5 rounded-2xl bg-muted border border-border text-left text-caption1 text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheckmark16Regular className="text-brand-fg" />
                <span>Next steps:</span>
              </p>
              <p>1. Open the reset link in your email to choose a new password.</p>
              <p>2. Be sure to check your spam or promotions folder if not found in 2 minutes.</p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Button
                appearance="primary"
                size="large"
                onClick={() => navigate('/login')}
                className="w-full min-h-11"
              >
                Return to Sign In
              </Button>
              <Button
                appearance="subtle"
                size="small"
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                }}
              >
                Didn't receive email? Try another address
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <h1 className="text-title2 font-semibold text-foreground">
                Reset your password
              </h1>
              <p className="text-body1 text-muted-foreground mt-1.5 leading-relaxed">
                Enter the email associated with your Cue account and we'll send you an encrypted link to reset your credentials.
              </p>
            </div>

            {error && (
              <MessageBar intent="error">
                <MessageBarBody>{error}</MessageBarBody>
              </MessageBar>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Email Address" required>
                <Input
                  id="email"
                  name="email"
                  type="email"
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
                className="w-full min-h-11"
              >
                {isLoading ? 'Sending reset link...' : 'Send Password Reset Link'}
              </Button>
            </form>

            <p className="text-caption1 text-muted-foreground text-center">
              Remember your password?{' '}
              <Link to="/login" className="font-semibold text-brand-fg hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
