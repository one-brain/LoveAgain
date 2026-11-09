import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Spinner } from '@fluentui/react-components';
import {
  CheckmarkCircle24Regular,
  ErrorCircle24Regular,
} from '@fluentui/react-icons';
import { useVerifyEmailMutation } from '../store/authApi';
import { AuthShell } from '../components/auth/AuthShell';

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
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
          setError(
            err?.data?.error ||
              err?.data?.message ||
              'This verification link is invalid or has expired.'
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token, verifyEmail]);

  return (
    <AuthShell
      title={
        isLoading
          ? 'Verifying your email...'
          : isSuccess
            ? 'Email verified'
            : 'Verification failed'
      }
      subtitle={
        isLoading
          ? 'Validating your email verification token with Cue security.'
          : isSuccess
            ? 'Your email address is confirmed for protected bookings and escrow updates.'
            : 'We could not confirm this email verification token.'
      }
      badgeText="Email Vetting"
    >
      {isLoading ? (
        <div className="py-8 flex flex-col items-center gap-3">
          <Spinner size="large" />
          <p className="text-caption1 text-muted-foreground">
            Confirming your account status...
          </p>
        </div>
      ) : isSuccess ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-success-light border border-border flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-card border border-border text-success flex items-center justify-center shrink-0">
              <CheckmarkCircle24Regular />
            </div>
            <div className="space-y-1">
              <p className="text-body2 font-semibold text-foreground">
                Verified badge active
              </p>
              <p className="text-caption1 text-muted-foreground leading-relaxed">
                Your email is now linked to your Cue trust score and booking receipts.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <Button
              appearance="primary"
              size="large"
              onClick={() => navigate('/discovery')}
              className="flex-1 min-h-11"
            >
              Explore
            </Button>
            <Button
              appearance="secondary"
              size="large"
              onClick={() => navigate('/profile')}
              className="flex-1 min-h-11"
            >
              Settings
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-destructive-light border border-border flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-card border border-border text-destructive flex items-center justify-center shrink-0">
              <ErrorCircle24Regular />
            </div>
            <div className="space-y-1">
              <p className="text-body2 font-semibold text-foreground">
                Link expired or invalid
              </p>
              <p className="text-caption1 text-muted-foreground leading-relaxed">
                {error || 'This email confirmation link is invalid or has expired.'}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-muted border border-border text-caption1 text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Need a fresh link?</p>
            <p>
              Sign in to your account and request a new verification code from your Profile settings.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <Button
              appearance="primary"
              size="large"
              onClick={() => navigate('/login')}
              className="w-full min-h-11"
            >
              Sign in
            </Button>
            <Link
              to="/"
              className="text-caption1 font-semibold text-muted-foreground hover:text-foreground text-center py-1"
            >
              Home
            </Link>
          </div>
        </div>
      )}
    </AuthShell>
  );
};

export default VerifyEmail;
