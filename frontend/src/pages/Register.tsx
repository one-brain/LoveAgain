import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  useRegisterMutation,
  useSendMobileOtpMutation,
  useVerifyMobileOtpMutation,
} from '../store/authApi';
import { loginSuccess } from '../store/slices/authSlice';
import { resetAllApiCaches } from '../utils/sessionManager';
import { isLegalAge, getMaxLegalBirthdate } from '../utils/dateUtils';
import {
  SparklesIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  EnvelopeIcon,
  UserIcon,
  PhoneIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

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
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setErrors({ mobileDateOfBirth: `You must be at least 18 years old to join LoveAgain (born on or before ${maxLegalDate})` });
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
      if (res.devOtp) {
        setDevOtpHint(res.devOtp);
      }
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
      validationErrors.dateOfBirth = `You must be at least 18 years old to join LoveAgain (born on or before ${maxLegalDate})`;
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
            {rawRedirect?.includes('apply-companion')
              ? 'Monetize your passions with guaranteed escrow earnings.'
              : 'Share experiences. Learn new skills. Connect genuinely.'}
          </h2>
          <p className="text-sm sm:text-base text-primary-foreground/85 leading-relaxed">
            {rawRedirect?.includes('apply-companion')
              ? 'Set your own schedule, connect with clients for social outings, dining, city tours, or sports, and get paid securely with zero escrow payment defaults.'
              : 'Join thousands finding companions for activities, from tennis rallies to cooking workshops to museum strolls, with verified community trust.'}
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
            {rawRedirect?.includes('apply-companion') && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-semibold mb-3 border border-accent/25">
                <SparklesIcon className="w-3.5 h-3.5" />
                <span>Companion Application &bull; Step 1 of 2</span>
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
              Create your account
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Already have an account?{' '}
              <Link
                to={rawRedirect ? `/login?redirect=${encodeURIComponent(rawRedirect)}` : '/login'}
                className="font-semibold text-accent hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Segmented Auth Method Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-muted/60 border border-border/80">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('mobile');
                setErrors({});
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
                setErrors({});
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

          {errors.form && (
            <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold animate-in fade-in duration-150">
              {errors.form}
            </div>
          )}

          {infoMessage && (
            <div className="p-3.5 rounded-2xl bg-accent/10 border border-accent/20 text-accent text-xs font-medium flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircleIcon className="w-4 h-4 shrink-0 text-accent" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* MOBILE & OTP REGISTRATION */}
          {authMethod === 'mobile' ? (
            <form onSubmit={handleMobileSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="mobileFirstName" className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    First name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="mobileFirstName"
                      type="text"
                      required
                      value={mobileFirstName}
                      onChange={(e) => setMobileFirstName(e.target.value)}
                      placeholder="Alex"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  {errors.mobileFirstName && (
                    <p className="mt-1 text-[11px] text-destructive">{errors.mobileFirstName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="mobileLastName" className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Last name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="mobileLastName"
                      type="text"
                      value={mobileLastName}
                      onChange={(e) => setMobileLastName(e.target.value)}
                      placeholder="Rivera"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="mobileDateOfBirth" className="block text-xs font-semibold text-muted-foreground">
                    Date of birth <span className="text-muted-foreground/70 font-normal">(must be 18+)</span>
                  </label>
                  <span className="text-[10px] text-muted-foreground/80 font-medium">Born on or before {maxLegalDate}</span>
                </div>
                <div className="relative">
                  <CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    id="mobileDateOfBirth"
                    type="date"
                    required
                    max={maxLegalDate}
                    value={mobileDateOfBirth}
                    onChange={(e) => {
                      setMobileDateOfBirth(e.target.value);
                      if (errors.mobileDateOfBirth) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.mobileDateOfBirth;
                          return next;
                        });
                      }
                    }}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                {errors.mobileDateOfBirth && (
                  <p className="mt-1 text-[11px] text-destructive">{errors.mobileDateOfBirth}</p>
                )}
              </div>

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
                    onClick={handleSendMobileOtp}
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
                {errors.phoneNumber && (
                  <p className="mt-1 text-[11px] text-destructive">{errors.phoneNumber}</p>
                )}
              </div>

              {otpSent && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="otp" className="text-xs font-semibold text-muted-foreground">
                        6-Digit Verification Code
                      </label>
                      {devOtpHint && (
                        <span className="text-[10px] text-accent font-mono font-semibold">
                          Sandbox OTP: {devOtpHint}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <LockClosedIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="otp"
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
                    {errors.otp && (
                      <p className="mt-1 text-[11px] text-destructive">{errors.otp}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifyingOtp}
                    className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-sm shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    {isVerifyingOtp ? 'Completing signup...' : 'Verify OTP & Create Account'}
                  </button>
                </div>
              )}
            </form>
          ) : (
            /* EMAIL & PASSWORD REGISTRATION */
            <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                      onChange={handleEmailChange}
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
                      onChange={handleEmailChange}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-[11px] text-destructive">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="dateOfBirth" className="block text-xs font-semibold text-muted-foreground">
                    Date of birth <span className="text-muted-foreground/70 font-normal">(must be 18+)</span>
                  </label>
                  <span className="text-[10px] text-muted-foreground/80 font-medium">Born on or before {maxLegalDate}</span>
                </div>
                <div className="relative">
                  <CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    required
                    max={maxLegalDate}
                    value={formData.dateOfBirth}
                    onChange={handleEmailChange}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                {errors.dateOfBirth && (
                  <p className="mt-1 text-[11px] text-destructive">{errors.dateOfBirth}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <EnvelopeIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleEmailChange}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent"
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
                  <LockClosedIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleEmailChange}
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
                {errors.password && (
                  <p className="mt-1 text-[11px] text-destructive">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <LockClosedIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleEmailChange}
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
                {errors.confirmPassword && (
                  <p className="mt-1 text-[11px] text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isEmailLoading}
                className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-sm shadow-xs transition-colors disabled:opacity-40 mt-2 cursor-pointer"
              >
                {isEmailLoading ? 'Creating account...' : 'Create Cue Account'}
              </button>
            </form>
          )}

          <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
            By signing up, you agree to our{' '}
            <Link to="/terms" className="text-accent underline font-medium hover:text-accent-hover">
              Terms of Service
            </Link>
            ,{' '}
            <Link to="/privacy" className="text-accent underline font-medium hover:text-accent-hover">
              Privacy Policy
            </Link>
            ,{' '}
            <Link to="/community-guidelines" className="text-accent underline font-medium hover:text-accent-hover">
              Community Guidelines
            </Link>
            , and{' '}
            <Link to="/cancellation-policy" className="text-accent underline font-medium hover:text-accent-hover">
              Escrow Cancellation Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
