import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Badge,
  Button,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
  Select,
} from '@fluentui/react-components';
import {
  Sparkle16Regular,
  LockClosed20Regular,
  Mail20Regular,
  Person20Regular,
  Phone20Regular,
  Eye20Regular,
  EyeOff20Regular,
  Calendar20Regular,
  CheckmarkCircle16Regular,
  Circle16Regular,
  Edit16Regular,
  ArrowRight16Regular,
} from '@fluentui/react-icons';
import {
  useRegisterMutation,
  useSendMobileOtpMutation,
  useVerifyMobileOtpMutation,
} from '../store/authApi';
import { loginSuccess } from '../store/slices/authSlice';
import { resetAllApiCaches } from '../utils/sessionManager';
import { isLegalAge, getMaxLegalBirthdate } from '../utils/dateUtils';
import { AuthShell } from '../components/auth/AuthShell';
import { OtpCodeInput } from '../components/auth/OtpCodeInput';

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
  const redirectTarget =
    rawRedirect && !rawRedirect.startsWith('/admin') ? rawRedirect : '/discovery';
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

  const handleSendMobileOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
      setErrors({
        mobileDateOfBirth: `You must be at least 18 years old to join Cue (born on or before ${maxLegalDate})`,
      });
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.trim().length < 8) {
      setErrors({ phoneNumber: 'Please enter a valid 10-digit mobile number' });
      return;
    }

    try {
      const fullPhone = phoneNumber.startsWith('+')
        ? phoneNumber
        : `${countryCode}${phoneNumber.trim()}`;
      const res = await sendMobileOtp({ phone: fullPhone, purpose: 'register' }).unwrap();
      setOtpSent(true);
      setCountdown(30);
      setInfoMessage(res.message);
    } catch (err: any) {
      setErrors({
        form:
          err?.data?.error ||
          'Failed to send verification code. Please check your number.',
      });
    }
  };

  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!otpSent) {
      await handleSendMobileOtp();
      return;
    }

    const fullPhone = phoneNumber.startsWith('+')
      ? phoneNumber
      : `${countryCode}${phoneNumber.trim()}`;
    const cleanOtp = otp.trim();

    if (cleanOtp.length < 6) {
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
      setErrors({
        form:
          err?.data?.error ||
          err?.data?.title ||
          'Invalid OTP code. Please try again.',
      });
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
      const msg =
        err?.data?.message ||
        err?.data?.detail ||
        err?.data?.error ||
        err?.data?.title ||
        'Registration failed. Please check your credentials or try a different email.';
      setErrors({ form: msg });
    }
  };

  const hasMinLength = formData.password.length >= 8;
  const passwordsMatch =
    formData.password.length > 0 &&
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

  return (
    <AuthShell
      title="Create your account"
      subtitle={
        <>
          Already have an account?{' '}
          <Link
            to={
              rawRedirect
                ? `/login?redirect=${encodeURIComponent(rawRedirect)}`
                : '/login'
            }
            className="font-semibold text-brand-fg hover:underline"
          >
            Sign in
          </Link>
        </>
      }
      badgeText="Identity Verified"
      editorialTitle="Verified companionship for life's best moments."
      editorialSubtitle="Every Cue member is age-verified (18+) and protected by RBI-compliant escrow from reservation through arrival."
      footer={
        <p className="text-caption2 text-muted-foreground text-center leading-relaxed">
          By joining Cue, you agree to our{' '}
          <Link to="/terms" className="text-brand-fg hover:underline font-semibold">
            Terms
          </Link>
          ,{' '}
          <Link to="/privacy" className="text-brand-fg hover:underline font-semibold">
            Privacy Policy
          </Link>
          ,{' '}
          <Link
            to="/community-guidelines"
            className="text-brand-fg hover:underline font-semibold"
          >
            Community Guidelines
          </Link>
          , and{' '}
          <Link
            to="/cancellation-policy"
            className="text-brand-fg hover:underline font-semibold"
          >
            Escrow Policy
          </Link>
          .
        </p>
      }
    >
      {rawRedirect?.includes('apply-companion') && (
        <div>
          <Badge appearance="tint" color="brand" size="medium" icon={<Sparkle16Regular />}>
            Companion Application • Step 1 of 2
          </Badge>
        </div>
      )}

      {/* Segmented Auth Method Switcher */}
      <div
        role="tablist"
        aria-label="Registration method"
        className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-muted border border-border"
      >
        <button
          type="button"
          role="tab"
          aria-selected={authMethod === 'mobile'}
          onClick={() => {
            setAuthMethod('mobile');
            setErrors({});
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
            setErrors({});
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

      {/* 1. MOBILE & OTP REGISTRATION */}
      {authMethod === 'mobile' ? (
        <form
          onSubmit={otpSent ? handleMobileSubmit : (e) => handleSendMobileOtp(e)}
          className="space-y-4"
        >
          {!otpSent ? (
            /* Step 1: Enter Details & Mobile Number */
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                label="Date of birth (18+)"
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
                label="Mobile number"
                required
                validationMessage={errors.phoneNumber}
                validationState={errors.phoneNumber ? 'error' : 'none'}
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
                    type="tel"
                    inputMode="numeric"
                    required
                    value={phoneNumber}
                    onChange={(_, data) =>
                      setPhoneNumber(data.value.replace(/\D/g, ''))
                    }
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
            /* Step 2: Verify 6-Digit OTP */
            <>
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-muted border border-border">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckmarkCircle16Regular className="text-success shrink-0" />
                  <span className="text-caption1 text-muted-foreground truncate">
                    {mobileFirstName} ·
                  </span>
                  <span className="text-body2 font-semibold text-foreground tabular truncate">
                    {countryCode} {phoneNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp('');
                    setErrors({});
                    setInfoMessage(null);
                  }}
                  className="inline-flex items-center gap-1 text-caption1 font-semibold text-brand-fg hover:underline shrink-0 cursor-pointer"
                >
                  <Edit16Regular />
                  <span>Edit</span>
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="otp" className="text-body1 font-semibold text-foreground">
                    6-digit verification code
                  </label>
                  <button
                    type="button"
                    disabled={isSendingOtp || countdown > 0}
                    onClick={() => handleSendMobileOtp()}
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
                  hasError={Boolean(errors.otp)}
                />
                {errors.otp && (
                  <p className="text-caption1 text-destructive">{errors.otp}</p>
                )}
              </div>

              <Button
                type="submit"
                appearance="primary"
                size="large"
                disabled={isVerifyingOtp}
                className="w-full min-h-11"
              >
                {isVerifyingOtp ? 'Joining...' : 'Verify & join'}
              </Button>
            </>
          )}
        </form>
      ) : (
        /* 2. EMAIL & PASSWORD REGISTRATION */
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                placeholder="Alex"
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
                placeholder="Rivera"
                value={formData.lastName}
                onChange={(_, data) => handleEmailChange('lastName', data.value)}
                contentBefore={<Person20Regular className="text-muted-foreground" />}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="Date of birth (18+)"
              required
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
                autoComplete="email"
                required
                value={formData.email}
                onChange={(_, data) => handleEmailChange('email', data.value)}
                placeholder="you@example.com"
                contentBefore={<Mail20Regular className="text-muted-foreground" />}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="Password"
              required
              validationMessage={errors.password}
              validationState={errors.password ? 'error' : 'none'}
            >
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={(_, data) => handleEmailChange('password', data.value)}
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

            <Field
              label="Confirm password"
              required
              validationMessage={errors.confirmPassword}
              validationState={errors.confirmPassword ? 'error' : 'none'}
            >
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={(_, data) =>
                  handleEmailChange('confirmPassword', data.value)
                }
                placeholder="Repeat password"
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
          </div>

          {/* Live Password & Age Checklist */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-3 py-2 rounded-xl bg-muted border border-border text-caption2">
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
            <span className="text-muted-foreground ml-auto tabular">
              18+ (on/before {maxLegalDate})
            </span>
          </div>

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
    </AuthShell>
  );
};

export default Register;
