import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Button,
  Card,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
  Select,
  Tab,
  TabList,
} from '@fluentui/react-components';
import {
  ShieldCheckmark16Regular,
  LockClosed20Regular,
  Mail20Regular,
  Phone20Regular,
  Eye20Regular,
  EyeOff20Regular,
  Person20Regular,
} from '@fluentui/react-icons';
import { loginSuccess } from '../store/slices/authSlice';
import {
  useLoginMutation,
  useSendMobileOtpMutation,
  useVerifyMobileOtpMutation,
} from '../store/authApi';
import { useGetSeekerProfileQuery } from '../store/api';
import { BrandLogo } from '../components/ui/BrandLogo';
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
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 sm:px-6 py-12 bg-background">
      <Card className="w-full max-w-[440px] bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <Link to="/">
            <BrandLogo size="sm" subtitle="Curated outings" />
          </Link>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-trust-light border border-trust-border text-caption2 font-semibold text-trust">
            <ShieldCheckmark16Regular className="shrink-0" />
            <span>Escrow Protected</span>
          </div>
        </div>

        <div>
          <h1 className="text-title2 font-semibold text-foreground">
            Welcome back
          </h1>
          <p className="text-body1 text-muted-foreground mt-1">
            New to Cue?{' '}
            <Link
              to={rawRedirect ? `/register?redirect=${encodeURIComponent(rawRedirect)}` : '/register'}
              className="font-semibold text-brand-fg hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>

        {/* Auth Method Switcher */}
        <TabList
          selectedValue={authMethod}
          onTabSelect={(_, data) => {
            setAuthMethod(data.value as 'mobile' | 'email');
            setError(null);
          }}
          className="w-full"
        >
          <Tab value="mobile" icon={<Phone20Regular />}>
            Mobile & OTP
          </Tab>
          <Tab value="email" icon={<Mail20Regular />}>
            Email & Password
          </Tab>
        </TabList>

        {/* Status alerts */}
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

        {/* MOBILE & OTP FORM */}
        {authMethod === 'mobile' ? (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <Field label="Mobile Number">
              <div className="flex gap-2">
                <Select
                  value={countryCode}
                  onChange={(_, data) => setCountryCode(data.value)}
                  aria-label="Country code"
                  className="w-24 tabular"
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
                  required
                  value={phoneNumber}
                  onChange={(_, data) => setPhoneNumber(data.value.replace(/\D/g, ''))}
                  placeholder="98765 43210"
                  maxLength={12}
                  contentBefore={<Phone20Regular className="text-muted-foreground" />}
                  className="flex-1 tabular"
                />
                <Button
                  type="button"
                  appearance="secondary"
                  onClick={() => handleSendOtp()}
                  disabled={isSendingOtp || (otpSent && countdown > 0)}
                  className="shrink-0 tabular"
                >
                  {isSendingOtp
                    ? 'Sending...'
                    : otpSent && countdown > 0
                    ? `Resend (${countdown}s)`
                    : otpSent
                    ? 'Resend'
                    : 'Get OTP'}
                </Button>
              </div>
            </Field>

            {otpSent && (
              <div className="space-y-4">
                <Field label="6-Digit Verification Code" required>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    autoFocus
                    value={otp}
                    onChange={(_, data) => setOtp(data.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    contentBefore={<LockClosed20Regular className="text-muted-foreground" />}
                    className="w-full font-mono tabular"
                  />
                </Field>

                {/* Prompt for First Name & Last Name if First-Time Mobile User */}
                {isNewUserStep && (
                  <div className="p-3.5 rounded-2xl bg-muted border border-border space-y-3">
                    <span className="text-caption1 font-semibold text-foreground block">
                      Complete your mobile profile:
                    </span>
                    <div className="grid grid-cols-2 gap-2.5">
                      <Field label="First Name" required>
                        <Input
                          id="firstName"
                          type="text"
                          required
                          value={firstName}
                          onChange={(_, data) => setFirstName(data.value)}
                          placeholder="First name"
                          contentBefore={<Person20Regular className="text-muted-foreground" />}
                        />
                      </Field>
                      <Field label="Last Name" required>
                        <Input
                          id="lastName"
                          type="text"
                          required
                          value={lastName}
                          onChange={(_, data) => setLastName(data.value)}
                          placeholder="Last name"
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
                  {isVerifyingOtp ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            )}
          </form>
        ) : (
          /* EMAIL & PASSWORD FORM */
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <Field label="Email Address" required>
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

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="text-body1 text-foreground">
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
      </Card>
    </div>
  );
};

export default Login;
