import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Button,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
  Select,
} from '@fluentui/react-components';
import {
  LockClosed20Regular,
  Mail20Regular,
  Phone20Regular,
  Eye20Regular,
  EyeOff20Regular,
  Person20Regular,
  CheckmarkCircle16Regular,
  Edit16Regular,
  ArrowRight16Regular,
} from '@fluentui/react-icons';
import { loginSuccess } from '../store/slices/authSlice';
import {
  useLoginMutation,
  useSendMobileOtpMutation,
  useVerifyMobileOtpMutation,
} from '../store/authApi';
import { useGetSeekerProfileQuery } from '../store/api';
import { AuthShell } from '../components/auth/AuthShell';
import { OtpCodeInput } from '../components/auth/OtpCodeInput';
import { resetAllApiCaches } from '../utils/sessionManager';

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
  const redirectTarget =
    rawRedirect && !rawRedirect.startsWith('/admin') ? rawRedirect : '/discovery';

  const [login, { isLoading: isEmailLoading }] = useLoginMutation();
  const [sendMobileOtp, { isLoading: isSendingOtp }] = useSendMobileOtpMutation();
  const [verifyMobileOtp, { isLoading: isVerifyingOtp }] = useVerifyMobileOtpMutation();
  const { refetch: refetchSeeker } = useGetSeekerProfileQuery(undefined, { skip: true });

  // Check for expired session notice
  useEffect(() => {
    if (searchParams.get('session_expired') === 'true') {
      setInfoMessage('Your session has expired. Please sign in again to continue.');
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

  const handleSendOtp = async (e?: React.FormEvent, overridePhone?: string) => {
    if (e) e.preventDefault();
    setError(null);
    setInfoMessage(null);
    const targetPhone = overridePhone || phoneNumber.trim();

    if (!targetPhone || targetPhone.length < 8) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      const fullPhone = targetPhone.startsWith('+')
        ? targetPhone
        : `${countryCode}${targetPhone}`;
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

    if (!otpSent) {
      await handleSendOtp();
      return;
    }

    const fullPhone = phoneNumber.startsWith('+')
      ? phoneNumber
      : `${countryCode}${phoneNumber.trim()}`;
    const cleanOtp = otp.trim();

    if (cleanOtp.length < 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    if (isNewUserStep && !firstName.trim()) {
      setError('Please enter your first name to finish setting up your account.');
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
        setInfoMessage('Mobile verified! Tell us your name to complete your profile.');
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
      const isAdmin =
        user?.roles?.includes('Admin') ||
        email.trim().toLowerCase() === 'admin@cue.local';

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
        navigate(rawRedirect && rawRedirect.startsWith('/admin') ? rawRedirect : '/admin', {
          replace: true,
        });
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
    <AuthShell
      title={isNewUserStep ? 'Complete your profile' : 'Welcome back'}
      subtitle={
        <>
          New to Cue?{' '}
          <Link
            to={
              rawRedirect
                ? `/register?redirect=${encodeURIComponent(rawRedirect)}`
                : '/register'
            }
            className="font-semibold text-brand-fg hover:underline"
          >
            Create an account
          </Link>
        </>
      }
      badgeText="Escrow Protected"
    >
      {/* Segmented Auth Method Switcher */}
      <div
        role="tablist"
        aria-label="Sign in method"
        className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-muted border border-border"
      >
        <button
          type="button"
          role="tab"
          aria-selected={authMethod === 'mobile'}
          onClick={() => {
            setAuthMethod('mobile');
            setError(null);
          }}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-caption1 font-semibold transition-colors cursor-pointer ${
            authMethod === 'mobile'
              ? 'bg-card text-brand-fg border border-border shadow-xs'
              : 'text-muted-foreground hover:text-foreground border border-transparent'
          }`}
        >
          <Phone20Regular className="shrink-0" />
          <span>Mobile & OTP</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={authMethod === 'email'}
          onClick={() => {
            setAuthMethod('email');
            setError(null);
          }}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-caption1 font-semibold transition-colors cursor-pointer ${
            authMethod === 'email'
              ? 'bg-card text-brand-fg border border-border shadow-xs'
              : 'text-muted-foreground hover:text-foreground border border-transparent'
          }`}
        >
          <Mail20Regular className="shrink-0" />
          <span>Email & Password</span>
        </button>
      </div>

      {/* Status Alerts */}
      {error && (
        <MessageBar intent="error">
          <MessageBarBody>{error}</MessageBarBody>
        </MessageBar>
      )}

      {infoMessage && (
        <MessageBar intent="info">
          <MessageBarBody>{infoMessage}</MessageBarBody>
        </MessageBar>
      )}

      {/* 1. MOBILE & OTP FLOW */}
      {authMethod === 'mobile' ? (
        <form onSubmit={otpSent ? handleVerifyOtp : (e) => handleSendOtp(e)} className="space-y-4">
          {!otpSent ? (
            /* Step 1: Enter Mobile Number */
            <>
              <Field
                label="Mobile number"
                required
                hint="We'll send a 6-digit SMS code. First-time numbers are registered automatically."
              >
                <div className="flex gap-2">
                  <Select
                    value={countryCode}
                    onChange={(_, data) => setCountryCode(data.value)}
                    aria-label="Country code"
                    className="w-28 shrink-0 tabular"
                  >
                    <option value="+91">IN +91</option>
                    <option value="+1">US +1</option>
                    <option value="+44">UK +44</option>
                    <option value="+971">AE +971</option>
                    <option value="+65">SG +65</option>
                  </Select>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    required
                    autoFocus
                    value={phoneNumber}
                    onChange={(_, data) => setPhoneNumber(data.value.replace(/\D/g, ''))}
                    placeholder="98765 43210"
                    maxLength={12}
                    contentBefore={<Phone20Regular className="text-muted-foreground" />}
                    className="flex-1 tabular"
                  />
                </div>
              </Field>

              <Button
                type="submit"
                appearance="primary"
                size="large"
                disabled={isSendingOtp}
                icon={<ArrowRight16Regular />}
                iconPosition="after"
                className="w-full min-h-11"
              >
                {isSendingOtp ? 'Sending code...' : 'Get OTP'}
              </Button>
            </>
          ) : (
            /* Step 2 & 3: Verify OTP or Complete New User Name */
            <>
              {/* Target Mobile Summary Pill */}
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-muted border border-border">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckmarkCircle16Regular className="text-success shrink-0" />
                  <span className="text-caption1 text-muted-foreground">Code sent to</span>
                  <span className="text-body2 font-semibold text-foreground tabular truncate">
                    {countryCode} {phoneNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setIsNewUserStep(false);
                    setOtp('');
                    setError(null);
                    setInfoMessage(null);
                  }}
                  className="inline-flex items-center gap-1 text-caption1 font-semibold text-brand-fg hover:underline shrink-0 cursor-pointer"
                >
                  <Edit16Regular />
                  <span>Change</span>
                </button>
              </div>

              {!isNewUserStep ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="otp" className="text-body1 font-semibold text-foreground">
                      6-digit verification code
                    </label>
                    <button
                      type="button"
                      disabled={isSendingOtp || countdown > 0}
                      onClick={() => handleSendOtp()}
                      className="text-caption1 font-semibold text-brand-fg hover:underline disabled:text-muted-foreground disabled:no-underline tabular cursor-pointer disabled:cursor-default"
                    >
                      {isSendingOtp
                        ? 'Sending...'
                        : countdown > 0
                          ? `Resend in ${countdown}s`
                          : 'Resend code'}
                    </button>
                  </div>
                  <OtpCodeInput
                    id="otp"
                    value={otp}
                    onChange={setOtp}
                    disabled={isVerifyingOtp}
                    hasError={Boolean(error)}
                  />
                </div>
              ) : (
                /* Step 3: First-Time Mobile User Name Prompt */
                <div className="p-4 rounded-xl bg-muted border border-border space-y-3">
                  <p className="text-caption1 font-semibold text-foreground">
                    Almost there — tell us your name to finish creating your profile:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="First name" required>
                      <Input
                        id="firstName"
                        type="text"
                        required
                        autoFocus
                        value={firstName}
                        onChange={(_, data) => setFirstName(data.value)}
                        placeholder="Alex"
                        contentBefore={<Person20Regular className="text-muted-foreground" />}
                      />
                    </Field>
                    <Field label="Last name">
                      <Input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(_, data) => setLastName(data.value)}
                        placeholder="Rivera"
                        contentBefore={<Person20Regular className="text-muted-foreground" />}
                      />
                    </Field>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                appearance="primary"
                size="large"
                disabled={isVerifyingOtp}
                className="w-full min-h-11"
              >
                {isVerifyingOtp
                  ? 'Verifying...'
                  : isNewUserStep
                    ? 'Complete sign in'
                    : 'Verify & sign in'}
              </Button>
            </>
          )}
        </form>
      ) : (
        /* 2. EMAIL & PASSWORD FLOW */
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <Field label="Email address" required>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(_, data) => setEmail(data.value)}
              placeholder="you@example.com"
              contentBefore={<Mail20Regular className="text-muted-foreground" />}
              className="w-full"
            />
          </Field>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-body1 font-semibold text-foreground">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-caption1 font-semibold text-brand-fg hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Field>
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(_, data) => setPassword(data.value)}
                placeholder="Enter your password"
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
                className="w-full"
              />
            </Field>
          </div>

          <Button
            type="submit"
            appearance="primary"
            size="large"
            disabled={isEmailLoading}
            className="w-full min-h-11"
          >
            {isEmailLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      )}
    </AuthShell>
  );
};

export default Login;
