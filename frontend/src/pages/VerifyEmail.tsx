import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Button,
  Card,
  Spinner,
} from '@fluentui/react-components';
import {
  Sparkle16Regular,
  CheckmarkCircle24Regular,
  ErrorCircle24Regular,
  ShieldCheckmark16Regular,
} from '@fluentui/react-icons';
import { useVerifyEmailMutation } from '../store/authApi';

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
          setError(err?.data?.error || err?.data?.message || 'This verification link is invalid or has expired.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token, verifyEmail]);

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 sm:px-6 py-12 bg-background">
      <Card className="w-full max-w-[440px] bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm text-center space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center text-accent-foreground font-semibold">
              <Sparkle16Regular />
            </div>
            <span className="text-subtitle2 font-semibold text-foreground">Cue</span>
          </div>
          <div className="flex items-center gap-1 text-caption1 text-muted-foreground">
            <ShieldCheckmark16Regular className="text-success" />
            <span>Email Vetting</span>
          </div>
        </div>

        {isLoading ? (
          <div className="py-8 space-y-4 flex flex-col items-center">
            <Spinner size="large" />
            <h1 className="text-subtitle1 font-semibold text-foreground">
              Verifying your email...
            </h1>
            <p className="text-caption1 text-muted-foreground">
              Please wait while we validate your credentials with platform security.
            </p>
          </div>
        ) : isSuccess ? (
          <div className="py-2 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-success-light border border-border text-success flex items-center justify-center mx-auto">
              <CheckmarkCircle24Regular />
            </div>
            <h1 className="text-title2 font-semibold text-foreground">
              Email Verified Successfully!
            </h1>
            <p className="text-body1 text-muted-foreground leading-relaxed">
              Your email address has been confirmed. Your account is now fully verified for protected bookings and escrow payments.
            </p>
            <div className="pt-3 flex flex-col gap-2">
              <Button
                appearance="primary"
                size="large"
                onClick={() => navigate('/discovery')}
                className="w-full min-h-11"
              >
                Explore
              </Button>
              <Button
                appearance="secondary"
                size="large"
                onClick={() => navigate('/profile')}
                className="w-full min-h-11"
              >
                Settings
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-2 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-destructive-light border border-border text-destructive flex items-center justify-center mx-auto">
              <ErrorCircle24Regular />
            </div>
            <h1 className="text-title2 font-semibold text-foreground">
              Verification Failed
            </h1>
            <p className="text-body1 text-muted-foreground leading-relaxed">
              {error || 'This email confirmation link is invalid or has expired.'}
            </p>
            <div className="p-3.5 rounded-2xl bg-muted border border-border text-left text-caption1 text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Need a new link?</p>
              <p>Sign in to your account to request a fresh verification link sent to your email.</p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
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
                className="text-caption1 text-muted-foreground hover:text-foreground underline pt-1"
              >
                Home
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default VerifyEmail;
