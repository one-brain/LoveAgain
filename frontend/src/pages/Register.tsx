import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useRegisterMutation } from '../store/authApi';
import { loginSuccess } from '../store/slices/authSlice';
import {
  SparklesIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  EnvelopeIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    roles: ['Seeker', 'Provider'] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [register, { isLoading }] = useRegisterMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validationErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) validationErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) validationErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      validationErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      validationErrors.email = 'Enter a valid email address';
    }
    if (!formData.password) {
      validationErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      validationErrors.password = 'Use at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        roles: ['Seeker', 'Provider'],
      }).unwrap();

      dispatch(
        loginSuccess({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: {
            id: result.user?.id || result.userId,
            email: result.user?.email || formData.email,
            firstName: result.user?.firstName || formData.firstName,
            lastName: result.user?.lastName || formData.lastName,
            isVerified: result.user?.isVerified ?? true,
            trustScore: result.user?.trustScore ?? 99,
            roles: result.user?.roles || ['Seeker', 'Provider'],
          },
        })
      );
      navigate('/discovery', { replace: true });
    } catch (err: any) {
      const msg = err?.data?.message || err?.data?.detail || err?.data?.error || 'Registration failed. Please check your credentials or try a different email.';
      setErrors({ email: msg });
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col lg:flex-row">
      {/* Left side: Editorial quote & Brand Moment */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-light to-primary text-primary-foreground flex-col justify-between p-16 relative overflow-hidden border-r border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-accent-foreground font-bold">
            <SparklesIcon className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold font-serif text-primary-foreground">Cue</span>
        </div>

        <div className="space-y-6 max-w-lg">
          <h2 className="text-3xl sm:text-4xl font-bold font-serif leading-tight text-primary-foreground">
            Share experiences. Learn new skills. Connect genuinely.
          </h2>
          <p className="text-sm sm:text-base text-primary-foreground/85 leading-relaxed">
            Join thousands finding companions for activities, from tennis rallies to cooking workshops to museum strolls, with verified community trust.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-primary-foreground/80">
          <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
          <span>Identity-verified safety checks & escrow guarantees.</span>
        </div>
      </div>

      {/* Right side: Registration Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
              Create your account
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-accent hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {errors.submit && (
            <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  First name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-[11px] text-destructive">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Last name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-[11px] text-destructive">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Email address
              </label>
              <div className="relative">
                <EnvelopeIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-[11px] text-destructive">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Password (min 8 chars)
              </label>
              <div className="relative">
                <LockClosedIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-[11px] text-destructive">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <LockClosedIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-[11px] text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-sm shadow-xs transition-colors disabled:opacity-40 mt-2"
            >
              {isLoading ? 'Creating account...' : 'Create Cue Account'}
            </button>
          </form>

          <p className="text-[11px] text-muted-foreground text-center">
            By signing up, you agree to our Terms of Service, Escrow Safety Policy, and Community Code of Conduct.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
