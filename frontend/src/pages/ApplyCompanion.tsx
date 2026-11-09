import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGetMyProfileQuery } from '../store/api';
import { useApplyCompanionMutation } from '../store/adminApi';
import { formatRate } from '../utils/currency';
import {
  Badge,
  Button,
  Card,
  Dropdown,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
  Option,
  ProgressBar,
  Spinner,
  Tag,
} from '@fluentui/react-components';
import {
  Sparkle20Regular,
  ShieldCheckmark20Regular,
  ContactCard20Regular,
  Money20Regular,
  CheckmarkCircle20Regular,
  Clock20Regular,
  Edit16Regular,
} from '@fluentui/react-icons';

const ID_TYPE_OPTIONS = [
  { value: 'Aadhaar (DigiLocker)', label: 'Aadhaar (DigiLocker Token)' },
  { value: 'Passport', label: 'Indian / International Passport' },
  { value: 'Driving License', label: 'Driving License' },
  { value: 'Voter ID / PAN', label: 'Voter ID / PAN Card' },
];

export const ApplyCompanion: React.FC = () => {
  const navigate = useNavigate();
  const { data: profileData, isLoading: isLoadingProfile, refetch: refetchProfile } =
    useGetMyProfileQuery();
  const [applyCompanion, { isLoading: isSubmitting }] = useApplyCompanionMutation();

  const providerProfile = profileData?.profile;
  const status = providerProfile?.status || 'Draft';

  const [isEditingVerification, setIsEditingVerification] = useState(false);

  const [idType, setIdType] = useState('Aadhaar (DigiLocker)');
  const [idProofUrl, setIdProofUrl] = useState('');
  const [selfieVerificationUrl, setSelfieVerificationUrl] = useState('');
  const [upiId, setUpiId] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedJustNow, setSubmittedJustNow] = useState(false);

  useEffect(() => {
    if (providerProfile) {
      if (providerProfile.idProofUrl) setIdProofUrl(providerProfile.idProofUrl);
      if (providerProfile.selfieVerificationUrl)
        setSelfieVerificationUrl(providerProfile.selfieVerificationUrl);
    }
  }, [providerProfile]);

  const hourlyRate = providerProfile?.hourlyRate || 1500;
  const maxRadiusKm = providerProfile?.maxRadiusKm || 25;
  const bio =
    providerProfile?.bio ||
    'Engaging, respectful, and verified guest for dining outings, cafe catchups, shopping, and local events.';
  const specialties =
    providerProfile?.specialties && providerProfile.specialties.length > 0
      ? providerProfile.specialties
      : ['Dinner Date & Foodie', 'City Guide & Tours'];

  const isIdUrlValid = idProofUrl.trim().startsWith('http');
  const isSelfieUrlValid = selfieVerificationUrl.trim().startsWith('http');
  const isUpiValid = upiId.trim().includes('@') && upiId.trim().length >= 5;

  const step1Done = isIdUrlValid && isSelfieUrlValid;
  const step2Done = isUpiValid;
  const completionValue = (step1Done ? 0.5 : 0) + (step2Done ? 0.5 : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ idProofUrl: true, selfieVerificationUrl: true, upiId: true });
    setErrorMsg('');

    if (!idProofUrl.trim() || !selfieVerificationUrl.trim()) {
      setErrorMsg('Please provide both your ID verification document and live selfie.');
      return;
    }

    if (!upiId.trim() || !upiId.includes('@')) {
      setErrorMsg(
        'Please enter a valid UPI ID (e.g. yourname@okaxis) for receiving escrow payouts.'
      );
      return;
    }

    try {
      await applyCompanion({
        hourlyRate: Number(hourlyRate),
        bio: bio.trim(),
        specialties,
        maxRadiusKm: Number(maxRadiusKm),
        idProofUrl: idProofUrl.trim(),
        selfieVerificationUrl: selfieVerificationUrl.trim(),
        upiId: upiId.trim(),
        displayName: providerProfile?.displayName,
        profileImages: providerProfile?.profileImages,
        introVideoUrl: providerProfile?.introVideoUrl,
      }).unwrap();

      await refetchProfile();
      setIsEditingVerification(false);
      setSubmittedJustNow(true);
    } catch (err: any) {
      setErrorMsg(
        err?.data?.error ||
          'Failed to submit verification. Please verify your inputs and try again.'
      );
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner label="Loading verification profile..." />
      </div>
    );
  }

  if ((status === 'PendingReview' || submittedJustNow) && !isEditingVerification) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Card className="bg-card border border-border rounded-2xl p-8 sm:p-10 shadow-sm">
          <div className="flex flex-col items-center text-center max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-warning-light border border-border flex items-center justify-center text-warning mb-5">
              <Clock20Regular />
            </div>

            <Badge appearance="tint" color="warning" className="mb-3">
              Verification under review
            </Badge>

            <h1 className="text-title2 font-semibold text-foreground mb-2">
              Your guest verification is in progress
            </h1>
            <p className="text-muted-foreground text-body1 leading-relaxed mb-6">
              Our safety team is reviewing your verification documents and payout details. Turnaround time is typically under <strong>24 hours</strong>.
            </p>

            <div className="w-full bg-muted border border-border rounded-2xl p-5 text-left mb-6 space-y-3">
              <h3 className="text-body1 font-semibold text-foreground flex items-center gap-2">
                <ShieldCheckmark20Regular className="text-brand-fg" />
                <span>Verification checklist</span>
              </h3>

              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <CheckmarkCircle20Regular className="text-success shrink-0" />
                  <span className="text-body1 text-foreground tabular">
                    Guest settings linked ({formatRate(hourlyRate)} · {specialties.length} specialties)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckmarkCircle20Regular className="text-success shrink-0" />
                  <span className="text-body1 text-foreground">
                    Government ID & live selfie submitted
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Spinner size="extra-tiny" />
                  <span className="text-body1 text-warning font-semibold">
                    Trust & safety review (in progress)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                appearance="outline"
                onClick={() => setIsEditingVerification(true)}
                className="flex-1 min-h-11"
              >
                Update ID
              </Button>
              <Link
                to="/profile?tab=provider"
                className="flex-1 px-4 py-2.5 rounded-md border border-border bg-card hover:bg-muted font-semibold text-body1 flex items-center justify-center min-h-11"
              >
                Edit rates & bio
              </Link>
              <Button
                appearance="primary"
                onClick={() => navigate('/bookings')}
                className="flex-1 min-h-11"
              >
                My outings
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (status === 'Approved' && !isEditingVerification) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card className="bg-card border border-border rounded-2xl p-8 sm:p-10 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-success-light border border-border flex items-center justify-center text-success mx-auto">
            <CheckmarkCircle20Regular />
          </div>
          <div>
            <Badge appearance="tint" color="success">
              Verified guest
            </Badge>
            <h1 className="text-title2 font-semibold text-foreground mt-3 mb-2">
              You are officially live on discovery
            </h1>
            <p className="text-body1 text-muted-foreground">
              Your identity and guest profile are verified. You can update your hourly rate, bio, and activities anytime from your unified profile.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              appearance="primary"
              onClick={() => navigate('/profile?tab=provider')}
              className="min-h-11"
            >
              Host settings
            </Button>
            <Button
              appearance="outline"
              onClick={() => navigate('/discovery')}
              className="min-h-11"
            >
              Explore
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const selectedIdTypeLabel =
    ID_TYPE_OPTIONS.find((o) => o.value === idType)?.label || idType;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10 space-y-6">
      {/* Header Banner */}
      <div className="space-y-2">
        <Badge appearance="tint" color="brand" icon={<Sparkle20Regular />}>
          Guest verification
        </Badge>
        <h1 className="text-title2 font-semibold text-foreground">
          Verify identity & payouts
        </h1>
        <p className="text-muted-foreground text-body1">
          Your rates and activities are automatically synced from your guest settings. Complete the two verification steps below to go live.
        </p>
      </div>

      {/* Stepped Progress Indicator */}
      <Card className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-caption1 font-semibold">
          <span className={step1Done ? 'text-success' : 'text-brand-fg'}>
            Step 1: Identity & selfie verification {step1Done ? '✓' : ''}
          </span>
          <span className={step2Done ? 'text-success' : 'text-muted-foreground'}>
            Step 2: UPI payout destination {step2Done ? '✓' : ''}
          </span>
        </div>
        <ProgressBar value={completionValue} />
      </Card>

      {status === 'Rejected' && providerProfile?.rejectionReason && (
        <MessageBar intent="error">
          <MessageBarBody>
            <strong>Previous verification requires attention:</strong> {providerProfile.rejectionReason}
          </MessageBarBody>
        </MessageBar>
      )}

      {/* Linked Guest Settings Summary Card */}
      <Card className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-caption1 font-semibold text-brand-fg">
                Synced guest profile
              </span>
              <Badge appearance="tint" color="success" className="tabular">
                {formatRate(hourlyRate)} · {maxRadiusKm} km radius
              </Badge>
            </div>
            <p className="text-caption1 text-foreground line-clamp-1">{bio}</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {specialties.slice(0, 5).map((s: string) => (
                <Tag key={s} size="small" appearance="outline">
                  {s}
                </Tag>
              ))}
              {specialties.length > 5 && (
                <span className="text-caption1 text-muted-foreground self-center tabular">
                  +{specialties.length - 5} more
                </span>
              )}
            </div>
          </div>

          <Link
            to="/profile?tab=provider"
            className="px-3.5 py-2 rounded-md border border-border hover:bg-muted text-foreground text-caption1 font-semibold flex items-center gap-1.5 shrink-0 self-start sm:self-center transition-colors"
          >
            <Edit16Regular className="text-brand-fg" />
            <span>Edit rates & bio</span>
          </Link>
        </div>
      </Card>

      {/* Stepped Verification & Payout Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMsg && (
          <MessageBar intent="error">
            <MessageBarBody>{errorMsg}</MessageBarBody>
          </MessageBar>
        )}

        {/* Step 1 Card: KYC Verification */}
        <Card className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <ContactCard20Regular className="text-brand-fg" />
            <div>
              <h2 className="text-subtitle1 font-semibold text-foreground">
                1. Government ID & selfie verification
              </h2>
              <p className="text-caption1 text-muted-foreground">
                Encrypted and private — never shared publicly.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="ID document type">
              <Dropdown
                value={selectedIdTypeLabel}
                selectedOptions={[idType]}
                onOptionSelect={(_e, data) => {
                  if (data.optionValue) setIdType(data.optionValue);
                }}
              >
                {ID_TYPE_OPTIONS.map((opt) => (
                  <Option key={opt.value} value={opt.value} text={opt.label}>
                    {opt.label}
                  </Option>
                ))}
              </Dropdown>
            </Field>

            <Field
              label="Document verification link / image URL"
              required
              validationState={
                touched.idProofUrl
                  ? isIdUrlValid
                    ? 'success'
                    : 'error'
                  : undefined
              }
              validationMessage={
                touched.idProofUrl
                  ? isIdUrlValid
                    ? 'Valid document URL'
                    : 'Enter a valid https:// document link'
                  : undefined
              }
            >
              <Input
                type="url"
                value={idProofUrl}
                onBlur={() => setTouched((p) => ({ ...p, idProofUrl: true }))}
                onChange={(_e, data) => setIdProofUrl(data.value)}
                placeholder="https://..."
                required
              />
            </Field>
          </div>

          <Field
            label="Live verification selfie URL"
            required
            hint="Provide a direct, clear photo link of yourself holding your photo ID."
            validationState={
              touched.selfieVerificationUrl
                ? isSelfieUrlValid
                  ? 'success'
                  : 'error'
                : undefined
            }
            validationMessage={
              touched.selfieVerificationUrl
                ? isSelfieUrlValid
                  ? 'Valid selfie URL'
                  : 'Enter a valid https:// selfie image link'
                : undefined
            }
          >
            <Input
              type="url"
              value={selfieVerificationUrl}
              onBlur={() => setTouched((p) => ({ ...p, selfieVerificationUrl: true }))}
              onChange={(_e, data) => setSelfieVerificationUrl(data.value)}
              placeholder="https://..."
              required
            />
          </Field>
        </Card>

        {/* Step 2 Card: Direct Escrow Payout Setup */}
        <Card className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <Money20Regular className="text-success" />
            <div>
              <h2 className="text-subtitle1 font-semibold text-foreground">
                2. Earnings withdrawal details (UPI)
              </h2>
              <p className="text-caption1 text-muted-foreground">
                85% of every completed meetup is transferred directly to your wallet & UPI.
              </p>
            </div>
          </div>

          <Field
            label="UPI ID for receiving earnings"
            required
            validationState={
              touched.upiId ? (isUpiValid ? 'success' : 'error') : undefined
            }
            validationMessage={
              touched.upiId
                ? isUpiValid
                  ? 'Valid UPI handle format'
                  : 'Include your bank handle (e.g. yourname@okhdfcbank)'
                : undefined
            }
          >
            <Input
              value={upiId}
              onBlur={() => setTouched((p) => ({ ...p, upiId: true }))}
              onChange={(_e, data) => setUpiId(data.value)}
              placeholder="yourname@okhdfcbank"
              className="font-mono tabular"
              required
            />
          </Field>

          <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-caption1 text-muted-foreground">
              By submitting, you agree to the Cue{' '}
              <Link
                to="/community-guidelines#platonic-charter"
                className="text-brand-fg underline font-semibold"
              >
                Strictly Platonic & Anti-Solicitation Safety Charter
              </Link>{' '}
              and{' '}
              <Link to="/terms" className="text-brand-fg underline font-semibold">
                Terms of Service
              </Link>
              .
            </p>
            <Button
              type="submit"
              appearance="primary"
              size="large"
              disabled={isSubmitting}
              icon={<ShieldCheckmark20Regular />}
              className="w-full sm:w-auto min-h-11 shrink-0"
            >
              {isSubmitting ? 'Submitting...' : 'Submit ID'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default ApplyCompanion;
