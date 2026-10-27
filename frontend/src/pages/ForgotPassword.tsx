import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForgotPasswordMutation } from '../store/authApi';
import {
  SparklesIcon,
  EnvelopeIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const ForgotPassword: React.FC = () => {
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
    } catch (err: any) {
      // For security, even on network hiccups, we still show the user guidance
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-accent transition-colors cursor-pointer"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
          <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center text-accent">
            <SparklesIcon className="w-4 h-4" />
          </div>
        </div>

        {isSubmitted ? (
          <div className="text-center space-y-4 py-4 animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircleIcon className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold font-serif text-foreground">
              Check your inbox
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              If an account is associated with <strong className="text-foreground font-medium">{email}</strong>, we have sent a password reset link valid for <strong>1 hour</strong>.
            </p>
            <div className="p-3.5 rounded-2xl bg-muted/50 border border-border text-left text-[11px] text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheckIcon className="w-3.5 h-3.5 text-accent" />
                <span>Next steps:</span>
              </p>
              <p>1. Open the reset link in your email to choose a new password.</p>
              <p>2. Be sure to check your spam or promotions folder if not found in 2 minutes.</p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-xs transition-colors block text-center shadow-xs"
              >
                Return to Sign In
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                }}
                className="text-xs text-muted-foreground hover:text-foreground underline pt-1 cursor-pointer"
              >
                Didn't receive email? Try another address
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">
                Reset your password
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                Enter the email associated with your Cue account and we'll send you an encrypted link to reset your credentials.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <EnvelopeIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-xs sm:text-sm shadow-xs transition-colors disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <span>Sending reset link...</span>
                ) : (
                  <span>Send Password Reset Link</span>
                )}
              </button>
            </form>

            <p className="text-[11px] text-muted-foreground text-center">
              Remember your password?{' '}
              <Link to="/login" className="font-semibold text-accent hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

