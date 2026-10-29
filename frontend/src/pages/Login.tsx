import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { loginSuccess } from '../store/slices/authSlice';
import {
  useLoginMutation,
  useSendMobileOtpMutation,
  useVerifyMobileOtpMutation,
} from '../store/authApi';
import { useGetSeekerProfileQuery } from '../store/api';
import { resetAllApiCaches } from '../utils/sessionManager';
import {
  SparklesIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  EnvelopeIcon,
  PhoneIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const Login: React.FC = () => {
  const [authMethod, setAuthMethod] = useState<'mobile' | 'email'>('mobile');

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Mobile form state
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isNewUserStep, setIsNewUserStep] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawRedirect = searchParams.get('redirect');
  const redirectTarget = rawRedirect && !rawRedirect.startsWith('/admin') ? rawRedirect : '/discovery';

  const [login, { isLoading: isEmailLoading }] = useLoginMutation();
  const [sendMobileOtp, { isLoading: isSendingOtp }] = useSendMobileOtpMutation();
  const [verifyMobileOtp, { isLoading: isVerifyingOtp }] = useVerifyMobileOtpMutation();
  const { refetch: refetchSeeker } = useGetSeekerProfileQuery(undefined, { skip: true });

  // Check for expired session notice
  useEffect(() => {
    if (searchParams.get('session_expired') === 'true') {
      setInfoMessage('Your session has expired. Please log in again to continue.');
    }
  }, [searchParams]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async (overridePhone?: string) => {
    setError(null);
    setInfoMessage(null);
    const targetPhone = overridePhone || phoneNumber.trim();

    if (!targetPhone || targetPhone.length < 8) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      const fullPhone = targetPhone.startsWith('+') ? targetPhone : `${countryCode}${targetPhone}`;
      const res = await sendMobileOtp({ phone: fullPhone }).unwrap();
      setOtpSent(true);
      setCountdown(30);
      setInfoMessage(res.message);
    } catch (err: any) {
      setError(err?.data?.error || 'Failed to send OTP. Please check your number.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const fullPhone = phoneNumber.startsWith('+') ? phoneNumber : `${countryCode}${phoneNumber.trim()}`;
    const cleanOtp = otp.trim();

    if (!cleanOtp) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    try {
      const res = await verifyMobileOtp({
        phone: fullPhone,
        otp: cleanOtp,
        firstName: isNewUserStep ? firstName.trim() : undefined,
        lastName: isNewUserStep ? lastName.trim() : undefined,
      }).unwrap();

      if (res.isNewUser && !isNewUserStep) {
        setIsNewUserStep(true);
        setInfoMessage('Mobile verified! Please tell us your name to finish setup.');
        return;
      }

      if (res.tokenResponse) {
        resetAllApiCaches(dispatch);

        const tokenResp = res.tokenResponse;
        const user = tokenResp.user;
        dispatch(
          loginSuccess({
            accessToken: tokenResp.accessToken,
            refreshToken: tokenResp.refreshToken,
            user: {
              id: user?.id || tokenResp.userId,
              email: user?.email || '',
              firstName: user?.firstName || firstName || 'Member',
              lastName: user?.lastName || lastName || '',
              isVerified: true,
              trustScore: user?.trustScore ?? 50,
              roles: user?.roles || ['Seeker', 'Provider'],
            },
          })
        );
        navigate(redirectTarget, { replace: true });
      }
    } catch (err: any) {
      setError(err?.data?.error || 'Invalid OTP code. Please try again.');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const result = await login({ email, password }).unwrap();
      resetAllApiCaches(dispatch);

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
        navigate(rawRedirect && rawRedirect.startsWith('/admin') ? rawRedirect : '/admin', { replace: true });
        return;
      }

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
        // Fallback to already stored user state
      }

      navigate(redirectTarget, { replace: true });
    } catch {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col lg:flex-row">
      {/* Left side: Editorial brand story */}
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
        <div className="w-full max-w-md space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              New to Cue?{' '}
              <Link
                to={rawRedirect ? `/register?redirect=${encodeURIComponent(rawRedirect)}` : '/register'}
                className="font-semibold text-accent hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>

          {/* Segmented Auth Method Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-muted/60 border border-border/80">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('mobile');
                setError(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === 'mobile'
                  ? 'bg-card text-foreground shadow-xs border border-border/60'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <PhoneIcon className="w-3.5 h-3.5 text-accent" />
              <span>Mobile & OTP</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('email');
                setError(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === 'email'
                  ? 'bg-card text-foreground shadow-xs border border-border/60'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <EnvelopeIcon className="w-3.5 h-3.5 text-accent" />
              <span>Email & Password</span>
            </button>
          </div>

          {/* Status alerts */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold animate-in fade-in duration-150">
              {error}
            </div>
          )}

          {infoMessage && (
            <div className="p-3.5 rounded-2xl bg-accent/10 border border-accent/20 text-accent text-xs font-medium flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircleIcon className="w-4 h-4 shrink-0 text-accent" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* MOBILE & OTP FORM */}
          {authMethod === 'mobile' ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label htmlFor="phoneNumber" className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Mobile Number
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-24 px-2 py-2.5 rounded-xl border border-border bg-card text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+65">🇸🇬 +65</option>
                  </select>
                  <div className="relative flex-1">
                    <PhoneIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="98765 43210"
                      maxLength={12}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={isSendingOtp || (otpSent && countdown > 0)}
                    className="px-3.5 py-2.5 rounded-xl bg-muted/80 hover:bg-muted text-foreground font-semibold text-xs border border-border/80 transition-colors disabled:opacity-40 shrink-0 cursor-pointer"
                  >
                    {isSendingOtp ? (
                      'Sending...'
                    ) : otpSent && countdown > 0 ? (
                      `Resend (${countdown}s)`
                    ) : (
                      otpSent ? 'Resend' : 'Get OTP'
                    )}
                  </button>
                </div>
              </div>

              {otpSent && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div>
                    <label htmlFor="otp" className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      6-Digit Verification Code
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="otp"
                        name="otp"
                        type="text"
                        required
                        autoFocus
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="123456"
                        maxLength={6}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm tracking-widest font-mono focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>

                  {/* Prompt for First Name & Last Name if First-Time Mobile User */}
                  {isNewUserStep && (
                    <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-3 animate-in fade-in duration-150">
                      <span className="text-xs font-bold text-foreground block">
                        Complete your mobile profile:
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label htmlFor="firstName" className="block text-[11px] font-semibold text-muted-foreground mb-1">
                            First Name
                          </label>
                          <div className="relative">
                            <UserIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                              id="firstName"
                              type="text"
                              required
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              placeholder="First name"
                              className="w-full pl-8 pr-2 py-2 rounded-lg border border-border bg-background text-xs focus:ring-1 focus:ring-accent"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="lastName" className="block text-[11px] font-semibold text-muted-foreground mb-1">
                            Last Name
                          </label>
                          <div className="relative">
                            <UserIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                              id="lastName"
                              type="text"
                              required
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              placeholder="Last name"
                              className="w-full pl-8 pr-2 py-2 rounded-lg border border-border bg-background text-xs focus:ring-1 focus:ring-accent"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifyingOtp}
                    className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-sm shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    {isVerifyingOtp ? 'Verifying OTP...' : 'Verify & Sign In'}
                  </button>
                </div>
              )}
            </form>
          ) : (
            /* EMAIL & PASSWORD FORM */
            <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="text-xs font-semibold text-muted-foreground">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-accent hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <LockClosedIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>

              <button
                type="submit"
                disabled={isEmailLoading}
                className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-sm shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
              >
                {isEmailLoading ? 'Signing in...' : 'Sign in to Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
