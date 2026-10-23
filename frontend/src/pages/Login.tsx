import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginSuccess } from '../store/slices/authSlice';
import { useLoginMutation } from '../store/authApi';
import { useGetSeekerProfileQuery } from '../store/api';
import {
  SparklesIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const { refetch: refetchSeeker } = useGetSeekerProfileQuery(undefined, { skip: true });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const result = await login({ email, password }).unwrap();
      const user = result.user;
      const isAdmin = user?.roles?.includes('Admin') || email.trim().toLowerCase() === 'admin@cue.local';

      if (isAdmin) {
        dispatch(
          loginSuccess({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            user: {
              id: user?.id || result.userId,
              email: user?.email || email,
              firstName: user?.firstName || 'Back-Office',
              lastName: user?.lastName || 'Administrator',
              isVerified: true,
              trustScore: 100,
              roles: ['Admin'],
            },
          })
        );
        navigate('/admin', { replace: true });
        return;
      }

      // 1. Immediately store session with verified user name & roles
      dispatch(
        loginSuccess({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: {
            id: user?.id || result.userId,
            email: user?.email || email,
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            isVerified: user?.isVerified ?? false,
            trustScore: user?.trustScore ?? 50,
            roles: user?.roles || ['Seeker', 'Provider'],
          },
        })
      );

      // 2. Fetch full seeker profile now that token is stored in localStorage
      try {
        const seekerData = await refetchSeeker().unwrap();
        const profile = seekerData?.profile;
        if (profile?.firstName) {
          dispatch(
            loginSuccess({
              accessToken: result.accessToken,
              refreshToken: result.refreshToken,
              user: {
                id: result.userId,
                email: profile.email || email,
                firstName: profile.firstName,
                lastName: profile.lastName || '',
                isVerified: profile.isVerified,
                trustScore: profile.trustScore,
                roles: user?.roles || ['Seeker', 'Provider'],
              },
            })
          );
        }
      } catch {
        // Already logged in with validated user info from auth service
      }

      navigate('/discovery', { replace: true });
    } catch {
      setError('Invalid email or password.');
    }
  };

  const handleDemoLogin = async (role: 'Seeker' | 'Provider' | 'Admin') => {
    let demoEmail = 'seeker.demo@cue.com';
    let demoPassword = 'Password123!';

    if (role === 'Provider') {
      demoEmail = 'elena.provider@cue.com';
      demoPassword = 'Password123!';
    } else if (role === 'Admin') {
      demoEmail = 'admin@cue.local';
      demoPassword = 'CueAdmin123!';
    }

    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);

    try {
      const result = await login({ email: demoEmail, password: demoPassword }).unwrap();

      if (role === 'Admin') {
        dispatch(
          loginSuccess({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            user: {
              id: result.userId,
              email: demoEmail,
              firstName: 'Back-Office',
              lastName: 'Administrator',
              isVerified: true,
              trustScore: 100,
              roles: ['Admin'],
            },
          })
        );
        navigate('/admin', { replace: true });
        return;
      }

      const seekerData = await refetchSeeker().unwrap().catch(() => null);
      const profile = seekerData?.profile;

      dispatch(
        loginSuccess({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: {
            id: result.userId,
            email: profile?.email ?? demoEmail,
            firstName: profile?.firstName ?? (role === 'Seeker' ? 'Alex' : 'Elena'),
            lastName: profile?.lastName ?? (role === 'Seeker' ? 'Rivera' : 'Rostova'),
            roles: ['Seeker', 'Provider'],
          },
        })
      );
      navigate(role === 'Provider' ? '/provider' : '/discovery', { replace: true });
    } catch {
      // Fallback only if REST service is offline
      if (role === 'Admin') {
        dispatch(
          loginSuccess({
            accessToken: 'demo-admin-jwt-token-12345',
            refreshToken: 'demo-admin-refresh-token-12345',
            user: {
              id: 'admin-self',
              email: demoEmail,
              firstName: 'Back-Office',
              lastName: 'Administrator',
              isVerified: true,
              trustScore: 100,
              roles: ['Admin'],
            },
          })
        );
        navigate('/admin', { replace: true });
        return;
      }

      dispatch(
        loginSuccess({
          accessToken: 'demo-jwt-token-12345',
          refreshToken: 'demo-refresh-token-12345',
          user: {
            id: role === 'Seeker' ? 'user-self' : 'sample-1',
            email: demoEmail,
            firstName: role === 'Seeker' ? 'Alex' : 'Elena',
            lastName: role === 'Seeker' ? 'Rivera' : 'Rostova',
            roles: ['Seeker', 'Provider'],
          },
        })
      );
      navigate(role === 'Provider' ? '/provider' : '/discovery', { replace: true });
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

        <blockquote className="space-y-6 max-w-lg">
          <p className="text-2xl sm:text-3xl font-serif leading-snug text-primary-foreground">
            "I found an incredible tennis companion who quickly became a genuine friend. We play weekly and discover new courts across the city."
          </p>
          <footer className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-accent/30 border border-accent/40 flex items-center justify-center font-bold text-accent-foreground">
              M
            </div>
            <div>
              <div className="font-semibold text-primary-foreground text-sm">Maya Chen</div>
              <div className="text-xs text-primary-foreground/75">Verified Member • New York</div>
            </div>
          </footer>
        </blockquote>

        <div className="flex items-center gap-2 text-xs text-primary-foreground/80">
          <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
          <span>Encrypted sessions & verified identity escrow protection.</span>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              New to Cue?{' '}
              <Link to="/register" className="font-semibold text-accent hover:underline">
                Create an account
              </Link>
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <LockClosedIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-sm shadow-xs transition-colors disabled:opacity-40"
            >
              {isLoading ? 'Signing in...' : 'Sign in to Account'}
            </button>
          </form>

          {/* Quick Demo Access Pills */}
          <div className="pt-6 border-t border-border space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block text-center">
              Instant Demo Access
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('Seeker')}
                className="py-2.5 px-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold transition-colors flex items-center justify-center text-center"
              >
                <span>Seeker</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('Provider')}
                className="py-2.5 px-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold transition-colors flex items-center justify-center text-center"
              >
                <span>Companion</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('Admin')}
                className="py-2.5 px-2 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-semibold transition-colors flex items-center justify-center text-center shadow-xs"
              >
                <span>Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
