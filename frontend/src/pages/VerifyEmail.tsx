import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useVerifyEmailMutation } from '../store/authApi';
import {
  SparklesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Verification token is missing. Please check the link from your email.');
      return;
    }

    let isMounted = true;
    verifyEmail({ token })
      .unwrap()
      .then(() => {
        if (isMounted) setIsSuccess(true);
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err?.data?.error || err?.data?.message || 'This verification link is invalid or has expired.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token, verifyEmail]);

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-accent-foreground font-bold">
              <SparklesIcon className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold font-serif text-foreground">Cue</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500" />
            <span>Email Vetting</span>
          </div>
        </div>

        {isLoading ? (
          <div className="py-8 space-y-4">
            <ArrowPathIcon className="w-12 h-12 text-accent animate-spin mx-auto" />
            <h1 className="text-xl font-bold font-serif text-foreground">
              Verifying your email...
            </h1>
            <p className="text-xs text-muted-foreground">
              Please wait while we validate your credentials with platform security.
            </p>
          </div>
        ) : isSuccess ? (
          <div className="py-4 space-y-4 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircleIcon className="w-9 h-9" />
            </div>
            <h1 className="text-2xl font-bold font-serif text-foreground">
              Email Verified Successfully!
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Your email address has been confirmed. Your account is now fully verified for protected bookings and escrow payments.
            </p>
            <div className="pt-4 flex flex-col gap-2">
              <Link
                to="/discovery"
                className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-xs sm:text-sm transition-colors block shadow-xs"
              >
                Find Companions & Outings &rarr;
              </Link>
              <Link
                to="/profile"
                className="w-full py-2.5 rounded-xl border border-border hover:bg-muted text-foreground font-medium text-xs transition-colors block"
              >
                Go to Account Settings
              </Link>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-4 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto shadow-sm">
              <ExclamationCircleIcon className="w-9 h-9" />
            </div>
            <h1 className="text-2xl font-bold font-serif text-foreground">
              Verification Failed
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {error || 'This email confirmation link is invalid or has expired.'}
            </p>
            <div className="p-3.5 rounded-2xl bg-muted/50 border border-border text-left text-[11px] text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Need a new link?</p>
              <p>Sign in to your account to request a fresh verification link sent to your email.</p>
            </div>
            <div className="pt-3 flex flex-col gap-2">
              <Link
                to="/login"
                className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-xs sm:text-sm transition-colors block shadow-xs"
              >
                Sign in to Request New Link
              </Link>
              <Link
                to="/"
                className="text-xs text-muted-foreground hover:text-foreground underline pt-1 cursor-pointer"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;

