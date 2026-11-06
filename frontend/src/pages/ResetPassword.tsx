import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  LockClosed20Regular,
  CheckmarkCircle24Regular,
  ErrorCircle24Regular,
  Eye20Regular,
  EyeOff20Regular,
  ShieldCheckmark16Regular,
} from '@fluentui/react-icons';
import { useResetPasswordMutation } from '../store/authApi';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      await resetPassword({ token, newPassword }).unwrap();
      setIsSuccess(true);
    } catch (err: any) {
      const msg = err?.data?.error || err?.data?.message || 'This reset link is invalid or has expired. Please request a new one.';
      setError(msg);
    }
  };

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 sm:px-6 py-12 bg-background">
        <Card className="w-full max-w-[440px] bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-warning-light border border-border text-warning flex items-center justify-center mx-auto">
            <ErrorCircle24Regular />
          </div>
          <h1 className="text-title2 font-semibold text-foreground">
            Invalid Reset Link
          </h1>
          <p className="text-body1 text-muted-foreground leading-relaxed">
            The password reset link is missing a verification token. Please initiate a new password reset request.
          </p>
          <div className="pt-2">
            <Button
              appearance="primary"
              size="large"
              onClick={() => navigate('/forgot-password')}
              className="w-full min-h-11"
            >
              Request Password Reset
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 sm:px-6 py-12 bg-background">
      <Card className="w-full max-w-[440px] bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center text-accent-foreground font-semibold">
              <Sparkle16Regular />
            </div>
            <span className="text-subtitle2 font-semibold text-foreground">Cue</span>
          </div>
          <div className="flex items-center gap-1 text-caption1 text-muted-foreground">
            <ShieldCheckmark16Regular className="text-success" />
            <span>Secure 256-bit</span>
          </div>
        </div>

        {isSuccess ? (
          <div className="text-center space-y-4 py-2">
            <div className="w-12 h-12 rounded-2xl bg-success-light border border-border text-success flex items-center justify-center mx-auto">
              <CheckmarkCircle24Regular />
            </div>
            <h1 className="text-title2 font-semibold text-foreground">
              Password reset successfully!
            </h1>
            <p className="text-body1 text-muted-foreground leading-relaxed">
              Your password has been securely updated and all previous active sessions have been terminated.
            </p>
            <div className="pt-2">
              <Button
                appearance="primary"
                size="large"
                onClick={() => navigate('/login')}
                className="w-full min-h-11"
              >
                Sign In with New Password &rarr;
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <h1 className="text-title2 font-semibold text-foreground">
                Set new password
              </h1>
              <p className="text-body1 text-muted-foreground mt-1.5 leading-relaxed">
                Choose a strong, unique password with at least 8 characters.
              </p>
            </div>

            {error && (
              <MessageBar intent="error">
                <MessageBarBody>{error}</MessageBarBody>
              </MessageBar>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="New Password" required hint="Minimum 8 characters.">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={newPassword}
                  onChange={(_, data) => setNewPassword(data.value)}
                  placeholder="••••••••"
                  contentBefore={<LockClosed20Regular className="text-muted-foreground" />}
                  contentAfter={
                    <Button
                      appearance="transparent"
                      size="small"
                      icon={showPassword ? <EyeOff20Regular /> : <Eye20Regular />}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    />
                  }
                />
              </Field>

              <Field label="Confirm New Password" required>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(_, data) => setConfirmPassword(data.value)}
                  placeholder="••••••••"
                  contentBefore={<LockClosed20Regular className="text-muted-foreground" />}
                  contentAfter={
                    <Button
                      appearance="transparent"
                      size="small"
                      icon={showConfirmPassword ? <EyeOff20Regular /> : <Eye20Regular />}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    />
                  }
                />
              </Field>

              <Button
                type="submit"
                appearance="primary"
                size="large"
                disabled={isLoading}
                className="w-full min-h-11 mt-1"
              >
                {isLoading ? 'Resetting password...' : 'Update Password'}
              </Button>
            </form>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ResetPassword;
