import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Badge,
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
  Sparkle16Regular,
  ShieldCheckmark16Regular,
  LockClosed20Regular,
  Mail20Regular,
  Person20Regular,
  Phone20Regular,
  Eye20Regular,
  EyeOff20Regular,
  Calendar20Regular,
} from '@fluentui/react-icons';
import {
  useRegisterMutation,
  useSendMobileOtpMutation,
  useVerifyMobileOtpMutation,
} from '../store/authApi';
import { loginSuccess } from '../store/slices/authSlice';
import { resetAllApiCaches } from '../utils/sessionManager';
import { isLegalAge, getMaxLegalBirthdate } from '../utils/dateUtils';
import { BrandLogo } from '../components/ui/BrandLogo';

const Register: React.FC = () => {
  const [authMethod, setAuthMethod] = useState<'mobile' | 'email'>('mobile');

  // Email form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    roles: ['Seeker', 'Provider'] as string[],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Mobile form state
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mobileFirstName, setMobileFirstName] = useState('');
  const [mobileLastName, setMobileLastName] = useState('');
  const [mobileDateOfBirth, setMobileDateOfBirth] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const maxLegalDate = getMaxLegalBirthdate(18);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawRedirect = searchParams.get('redirect');
  const redirectTarget = rawRedirect && !rawRedirect.startsWith('/admin') ? rawRedirect : '/discovery';
  const dispatch = useDispatch();

  const [register, { isLoading: isEmailLoading }] = useRegisterMutation();
  const [sendMobileOtp, { isLoading: isSendingOtp }] = useSendMobileOtpMutation();
  const [verifyMobileOtp, { isLoading: isVerifyingOtp }] = useVerifyMobileOtpMutation();

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleEmailChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSendMobileOtp = async () => {
    setErrors({});
    setInfoMessage(null);

    if (!mobileFirstName.trim()) {
      setErrors({ mobileFirstName: 'First name is required' });
      return;
    }
    if (!mobileDateOfBirth) {
      setErrors({ mobileDateOfBirth: 'Date of birth is required to verify legal age' });
      return;
    }
    if (!isLegalAge(mobileDateOfBirth)) {
      setErrors({ mobileDateOfBirth: `You must be at least 18 years old to join Cue (born on or before ${maxLegalDate})` });
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.trim().length < 8) {
      setErrors({ phoneNumber: 'Please enter a valid mobile number' });
      return;
    }

    try {
      const fullPhone = phoneNumber.startsWith('+') ? phoneNumber : `${countryCode}${phoneNumber.trim()}`;
      const res = await sendMobileOtp({ phone: fullPhone, purpose: 'register' }).unwrap();
      setOtpSent(true);
      setCountdown(30);
      setInfoMessage(res.message);
    } catch (err: any) {
      setErrors({ form: err?.data?.error || 'Failed to send verification code. Please check your number.' });
    }
  };

  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const fullPhone = phoneNumber.startsWith('+') ? phoneNumber : `${countryCode}${phoneNumber.trim()}`;
    const cleanOtp = otp.trim();

    if (!cleanOtp) {
      setErrors({ otp: 'Please enter the 6-digit verification code' });
      return;
    }

    try {
      const res = await verifyMobileOtp({
        phone: fullPhone,
        otp: cleanOtp,
        firstName: mobileFirstName.trim(),
        lastName: mobileLastName.trim(),
        dateOfBirth: mobileDateOfBirth,
      }).unwrap();

      if (res.tokenResponse) {
        const tokenResp = res.tokenResponse;
        const user = tokenResp.user;
        resetAllApiCaches(dispatch);
        dispatch(
          loginSuccess({
            accessToken: tokenResp.accessToken,
            refreshToken: tokenResp.refreshToken,
            user: {
              id: user?.id || tokenResp.userId,
              email: user?.email || '',
              firstName: user?.firstName || mobileFirstName.trim(),
              lastName: user?.lastName || mobileLastName.trim(),
              isVerified: true,
              trustScore: user?.trustScore ?? 50,
              roles: ['Seeker', 'Provider'],
            },
          })
        );
        navigate(redirectTarget, { replace: true });
      }
    } catch (err: any) {
      const rfcErrors = err?.data?.errors;
      if (rfcErrors && typeof rfcErrors === 'object') {
        const fieldErrors: Record<string, string> = {};
        for (const [key, val] of Object.entries(rfcErrors)) {
          const fieldKey = key.charAt(0).toLowerCase() + key.slice(1);
          fieldErrors[fieldKey] = Array.isArray(val) ? val.join(' ') : String(val);
        }
        setErrors(fieldErrors);
        return;
      }
      setErrors({ form: err?.data?.error || err?.data?.title || 'Invalid OTP code. Please try again.' });
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validationErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) validationErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) validationErrors.lastName = 'Last name is required';
    if (!formData.dateOfBirth) {
      validationErrors.dateOfBirth = 'Date of birth is required to verify legal age';
    } else if (!isLegalAge(formData.dateOfBirth)) {
      validationErrors.dateOfBirth = `You must be at least 18 years old to join Cue (born on or before ${maxLegalDate})`;
    }
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
        dateOfBirth: formData.dateOfBirth,
        roles: ['Seeker', 'Provider'],
      }).unwrap();

      resetAllApiCaches(dispatch);

      dispatch(
        loginSuccess({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: {
            id: result.user?.id || result.userId,
            email: result.user?.email || formData.email,
            firstName: result.user?.firstName || formData.firstName,
            lastName: result.user?.lastName || formData.lastName,
            isVerified: result.user?.isVerified ?? false,
            trustScore: result.user?.trustScore ?? 50,
            roles: result.user?.roles || ['Seeker', 'Provider'],
          },
        })
      );
      navigate(redirectTarget, { replace: true });
    } catch (err: any) {
      const rfcErrors = err?.data?.errors;
      if (rfcErrors && typeof rfcErrors === 'object') {
        const fieldErrors: Record<string, string> = {};
        for (const [key, val] of Object.entries(rfcErrors)) {
          const fieldKey = key.charAt(0).toLowerCase() + key.slice(1);
          fieldErrors[fieldKey] = Array.isArray(val) ? val.join(' ') : String(val);
        }
        setErrors(fieldErrors);
        return;
      }
      const msg = err?.data?.message || err?.data?.detail || err?.data?.error || err?.data?.title || 'Registration failed. Please check your credentials or try a different email.';
      setErrors({ form: msg });
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
            <span>Identity Verified</span>
          </div>
        </div>

        <div>
          {rawRedirect?.includes('apply-companion') && (
            <div className="mb-2">
              <Badge appearance="tint" color="brand" size="medium" icon={<Sparkle16Regular />}>
                Companion Application • Step 1 of 2
              </Badge>
            </div>
          )}
          <h1 className="text-title2 font-semibold text-foreground">
            Create your account
          </h1>
          <p className="text-body1 text-muted-foreground mt-1">
            Already have an account?{' '}
            <Link
              to={rawRedirect ? `/login?redirect=${encodeURIComponent(rawRedirect)}` : '/login'}
              className="font-semibold text-brand-fg hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Auth Method Switcher */}
        <TabList
          selectedValue={authMethod}
          onTabSelect={(_, data) => {
            setAuthMethod(data.value as 'mobile' | 'email');
            setErrors({});
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

        {errors.form && (
          <MessageBar intent="error">
            <MessageBarBody>{errors.form}</MessageBarBody>
          </MessageBar>
        )}

        {infoMessage && (
          <MessageBar intent="info">
            <MessageBarBody>{infoMessage}</MessageBarBody>
          </MessageBar>
        )}

        {/* MOBILE & OTP REGISTRATION */}
        {authMethod === 'mobile' ? (
          <form onSubmit={handleMobileSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="First name"
                required
                validationMessage={errors.mobileFirstName}
                validationState={errors.mobileFirstName ? 'error' : 'none'}
              >
                <Input
                  id="mobileFirstName"
                  type="text"
                  required
                  value={mobileFirstName}
                  onChange={(_, data) => setMobileFirstName(data.value)}
                  placeholder="Alex"
                  contentBefore={<Person20Regular className="text-muted-foreground" />}
                />
              </Field>

              <Field label="Last name">
                <Input
                  id="mobileLastName"
                  type="text"
                  value={mobileLastName}
                  onChange={(_, data) => setMobileLastName(data.value)}
                  placeholder="Rivera"
                  contentBefore={<Person20Regular className="text-muted-foreground" />}
                />
              </Field>
            </div>

            <Field
              label="Date of birth (must be 18+)"
              required
              hint={`Born on or before ${maxLegalDate}`}
              validationMessage={errors.mobileDateOfBirth}
              validationState={errors.mobileDateOfBirth ? 'error' : 'none'}
            >
              <Input
                id="mobileDateOfBirth"
                type="date"
                required
                max={maxLegalDate}
                value={mobileDateOfBirth}
                onChange={(_, data) => {
                  setMobileDateOfBirth(data.value);
                  if (errors.mobileDateOfBirth) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.mobileDateOfBirth;
                      return next;
                    });
                  }
                }}
                contentBefore={<Calendar20Regular className="text-muted-foreground" />}
                className="tabular"
              />
            </Field>

            <Field
              label="Mobile Number"
              required
              validationMessage={errors.phoneNumber}
              validationState={errors.phoneNumber ? 'error' : 'none'}
            >
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
                  onClick={handleSendMobileOtp}
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
                <Field
                  label="6-Digit Verification Code"
                  required
                  validationMessage={errors.otp}
                  validationState={errors.otp ? 'error' : 'none'}
                >
                  <Input
                    id="otp"
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

                <Button
                  type="submit"
                  appearance="primary"
                  size="large"
                  disabled={isVerifyingOtp}
                  className="w-full min-h-11"
                >
                  {isVerifyingOtp ? 'Joining...' : 'Verify & join'}
                </Button>
              </div>
            )}
          </form>
        ) : (
          /* EMAIL & PASSWORD REGISTRATION */
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="First name"
                required
                validationMessage={errors.firstName}
                validationState={errors.firstName ? 'error' : 'none'}
              >
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(_, data) => handleEmailChange('firstName', data.value)}
                  contentBefore={<Person20Regular className="text-muted-foreground" />}
                />
              </Field>

              <Field
                label="Last name"
                required
                validationMessage={errors.lastName}
                validationState={errors.lastName ? 'error' : 'none'}
              >
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(_, data) => handleEmailChange('lastName', data.value)}
                  contentBefore={<Person20Regular className="text-muted-foreground" />}
                />
              </Field>
            </div>

            <Field
              label="Date of birth (must be 18+)"
              required
              hint={`Born on or before ${maxLegalDate}`}
              validationMessage={errors.dateOfBirth}
              validationState={errors.dateOfBirth ? 'error' : 'none'}
            >
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                required
                max={maxLegalDate}
                value={formData.dateOfBirth}
                onChange={(_, data) => handleEmailChange('dateOfBirth', data.value)}
                contentBefore={<Calendar20Regular className="text-muted-foreground" />}
                className="tabular"
              />
            </Field>

            <Field
              label="Email address"
              required
              validationMessage={errors.email}
              validationState={errors.email ? 'error' : 'none'}
            >
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(_, data) => handleEmailChange('email', data.value)}
                placeholder="you@example.com"
                contentBefore={<Mail20Regular className="text-muted-foreground" />}
              />
            </Field>

            <Field
              label="Password (min 8 chars)"
              required
              validationMessage={errors.password}
              validationState={errors.password ? 'error' : 'none'}
            >
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(_, data) => handleEmailChange('password', data.value)}
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

            <Field
              label="Confirm Password"
              required
              validationMessage={errors.confirmPassword}
              validationState={errors.confirmPassword ? 'error' : 'none'}
            >
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={(_, data) => handleEmailChange('confirmPassword', data.value)}
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
              disabled={isEmailLoading}
              className="w-full min-h-11 mt-1"
            >
              {isEmailLoading ? 'Creating...' : 'Create account'}
            </Button>
          </form>
        )}

        <p className="text-caption1 text-muted-foreground text-center leading-relaxed pt-1">
          By signing up, you agree to our{' '}
          <Link to="/terms" className="text-brand-fg underline font-semibold">
            Terms of Service
          </Link>
          ,{' '}
          <Link to="/privacy" className="text-brand-fg underline font-semibold">
            Privacy Policy
          </Link>
          ,{' '}
          <Link to="/community-guidelines" className="text-brand-fg underline font-semibold">
            Community Guidelines
          </Link>
          , and{' '}
          <Link to="/cancellation-policy" className="text-brand-fg underline font-semibold">
            Escrow Cancellation Policy
          </Link>
          .
        </p>
      </Card>
    </div>
  );
};

export default Register;
