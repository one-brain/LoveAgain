import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Button,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components';
import {
  LockClosed20Regular,
  CheckmarkCircle24Regular,
  ErrorCircle24Regular,
  Eye20Regular,
  EyeOff20Regular,
  CheckmarkCircle16Regular,
  Circle16Regular,
} from '@fluentui/react-icons';
import { useResetPasswordMutation } from '../store/authApi';
import { AuthShell } from '../components/auth/AuthShell';

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

  const hasMinLength = newPassword.length >= 8;
  const passwordsMatch =
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

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
      const msg =
        err?.data?.error ||
        err?.data?.message ||
        'This reset link is invalid or has expired. Please request a new one.';
      setError(msg);
    }
  };

  if (!token) {
    return (
      <AuthShell
        title="Invalid reset link"
        subtitle="This password reset link is missing a verification token."
        badgeText="256-Bit Encrypted"
        backLink={{ to: '/login', label: 'Back to sign in' }}
      >
        <div className="p-4 rounded-xl bg-warning-light border border-border flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-card border border-border text-warning flex items-center justify-center shrink-0">
            <ErrorCircle24Regular />
          </div>
          <div className="space-y-1">
            <p className="text-body2 font-semibold text-foreground">
              Verification token missing
            </p>
            <p className="text-caption1 text-muted-foreground leading-relaxed">
              Please request a fresh password reset link from your email to continue.
            </p>
          </div>
        </div>
        <Button
          appearance="primary"
          size="large"
          onClick={() => navigate('/forgot-password')}
          className="w-full min-h-11"
        >
          Reset password
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={isSuccess ? 'Password updated' : 'Set new password'}
      subtitle={
        isSuccess
          ? 'Your credentials have been updated and previous active sessions were signed out.'
          : 'Choose a strong, unique password for your Cue account.'
      }
      badgeText="256-Bit Encrypted"
      backLink={isSuccess ? undefined : { to: '/login', label: 'Back to sign in' }}
    >
      {isSuccess ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-success-light border border-border flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-card border border-border text-success flex items-center justify-center shrink-0">
              <CheckmarkCircle24Regular />
            </div>
            <div className="space-y-1">
              <p className="text-body2 font-semibold text-foreground">
                Password reset complete
              </p>
              <p className="text-caption1 text-muted-foreground leading-relaxed">
                You can now sign in with your new password across web and mobile.
              </p>
            </div>
          </div>

          <Button
            appearance="primary"
            size="large"
            onClick={() => navigate('/login')}
            className="w-full min-h-11"
          >
            Sign in
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <MessageBar intent="error">
              <MessageBarBody>{error}</MessageBarBody>
            </MessageBar>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="New password" required>
              <Input
                id="newPassword"
                name="newPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                autoFocus
                value={newPassword}
                onChange={(_, data) => setNewPassword(data.value)}
                placeholder="8+ characters"
                contentBefore={<LockClosed20Regular className="text-muted-foreground" />}
                contentAfter={
                  <Button
                    type="button"
                    appearance="transparent"
                    size="small"
                    icon={showPassword ? <EyeOff20Regular /> : <Eye20Regular />}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  />
                }
              />
            </Field>

            <Field label="Confirm new password" required>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(_, data) => setConfirmPassword(data.value)}
                placeholder="Repeat new password"
                contentBefore={<LockClosed20Regular className="text-muted-foreground" />}
                contentAfter={
                  <Button
                    type="button"
                    appearance="transparent"
                    size="small"
                    icon={showConfirmPassword ? <EyeOff20Regular /> : <Eye20Regular />}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword ? 'Hide password' : 'Show password'
                    }
                  />
                }
              />
            </Field>

            <div className="flex flex-wrap items-center gap-4 px-3 py-2 rounded-xl bg-muted border border-border text-caption2">
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  hasMinLength ? 'text-success' : 'text-muted-foreground'
                }`}
              >
                {hasMinLength ? <CheckmarkCircle16Regular /> : <Circle16Regular />}
                <span>8+ characters</span>
              </span>
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  passwordsMatch ? 'text-success' : 'text-muted-foreground'
                }`}
              >
                {passwordsMatch ? <CheckmarkCircle16Regular /> : <Circle16Regular />}
                <span>Passwords match</span>
              </span>
            </div>

            <Button
              type="submit"
              appearance="primary"
              size="large"
              disabled={isLoading}
              className="w-full min-h-11 mt-1"
            >
              {isLoading ? 'Updating...' : 'Update password'}
            </Button>
          </form>
        </div>
      )}
    </AuthShell>
  );
};

export default ResetPassword;
