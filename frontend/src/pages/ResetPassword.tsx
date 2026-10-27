import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useResetPasswordMutation } from '../store/authApi';
import {
  SparklesIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const ResetPassword: React.FC = () => {
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
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto shadow-sm">
            <ExclamationCircleIcon className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold font-serif text-foreground">
            Invalid Reset Link
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            The password reset link is missing a verification token. Please initiate a new password reset request.
          </p>
          <div className="pt-2">
            <Link
              to="/forgot-password"
              className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-xs transition-colors block shadow-xs"
            >
              Request Password Reset
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-accent-foreground font-bold">
              <SparklesIcon className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold font-serif text-foreground">Cue</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secure 256-bit</span>
          </div>
        </div>

        {isSuccess ? (
          <div className="text-center space-y-4 py-4 animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircleIcon className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold font-serif text-foreground">
              Password reset successfully!
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Your password has been securely updated and all previous active sessions have been terminated.
            </p>
            <div className="pt-3">
              <Link
                to="/login"
                className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-xs sm:text-sm transition-colors block shadow-xs"
              >
                Sign In with New Password &rarr;
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">
                Set new password
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                Choose a strong, unique password with at least 8 characters.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <LockClosedIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Minimum 8 characters.</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <LockClosedIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-xs sm:text-sm shadow-xs transition-colors disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? 'Resetting password...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;

