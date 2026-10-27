import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGetMyProfileQuery } from '../store/api';
import { useApplyCompanionMutation } from '../store/adminApi';
import { formatRate } from '../utils/currency';
import {
  SparklesIcon,
  ShieldCheckIcon,
  IdentificationIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';

const SAMPLE_GALLERY = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=600',
];

export const ApplyCompanion: React.FC = () => {
  const navigate = useNavigate();
  const { data: profileData, isLoading: isLoadingProfile, refetch: refetchProfile } = useGetMyProfileQuery();
  const [applyCompanion, { isLoading: isSubmitting }] = useApplyCompanionMutation();

  const providerProfile = profileData?.profile;
  const status = providerProfile?.status || 'Draft';

  const [isEditingVerification, setIsEditingVerification] = useState(false);

  const [idType, setIdType] = useState('Aadhaar (DigiLocker)');
  const [idProofUrl, setIdProofUrl] = useState(
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600'
  );
  const [selfieVerificationUrl, setSelfieVerificationUrl] = useState(SAMPLE_GALLERY[0]);
  const [upiId, setUpiId] = useState('companion@oksbi');
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedJustNow, setSubmittedJustNow] = useState(false);

  useEffect(() => {
    if (providerProfile) {
      if (providerProfile.idProofUrl) setIdProofUrl(providerProfile.idProofUrl);
      if (providerProfile.selfieVerificationUrl) setSelfieVerificationUrl(providerProfile.selfieVerificationUrl);
    }
  }, [providerProfile]);

  // Fallback defaults if user came directly without saving Companion tab yet
  const hourlyRate = providerProfile?.hourlyRate || 1500;
  const maxRadiusKm = providerProfile?.maxRadiusKm || 25;
  const bio =
    providerProfile?.bio ||
    'Friendly, punctual, and engaging companion for social outings, cafe catchups, and local events.';
  const specialties =
    providerProfile?.specialties && providerProfile.specialties.length > 0
      ? providerProfile.specialties
      : ['Dinner Date & Foodie', 'City Guide & Tours'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!idProofUrl.trim() || !selfieVerificationUrl.trim()) {
      setErrorMsg('Please provide both your ID verification document and live selfie.');
      return;
    }

    if (!upiId.trim() || !upiId.includes('@')) {
      setErrorMsg('Please enter a valid UPI ID (e.g. yourname@okaxis) for receiving escrow payouts.');
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
      }).unwrap();

      await refetchProfile();
      setIsEditingVerification(false);
      setSubmittedJustNow(true);
    } catch (err: any) {
      setErrorMsg(
        err?.data?.error || 'Failed to submit verification. Please verify your inputs and try again.'
      );
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Already submitted and under review view
  if ((status === 'PendingReview' || submittedJustNow) && !isEditingVerification) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-card border border-border/80 rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col items-center text-center max-w-xl mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-6 shadow-inner">
              <ClockIcon className="w-10 h-10 animate-pulse" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-3">
              Verification Under Review
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-3">
              Your Companion Verification is In Progress
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              Our safety team is reviewing your verification documents and payout details. Turnaround time is typically under <strong>24 hours</strong>.
            </p>

            <div className="w-full bg-muted/40 border border-border/60 rounded-2xl p-6 text-left mb-8 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-accent" /> Verification Checklist
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-xs sm:text-sm text-foreground/90 font-medium">
                    Companion Settings Linked ({formatRate(hourlyRate)} • {specialties.length} specialties)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-xs sm:text-sm text-foreground/90 font-medium">
                    Government ID & Live Selfie Submitted
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin shrink-0" />
                  <span className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 font-semibold">
                    Trust & Safety Review (In Progress)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                type="button"
                onClick={() => setIsEditingVerification(true)}
                className="flex-1 px-5 py-3 rounded-xl border border-border/80 bg-muted/30 hover:bg-muted font-semibold text-sm transition-all cursor-pointer"
              >
                Update Verification Docs
              </button>
              <Link
                to="/profile?tab=provider"
                className="flex-1 px-5 py-3 rounded-xl border border-border/80 bg-card hover:bg-muted font-semibold text-sm transition-all flex items-center justify-center"
              >
                Edit Rates & Bio
              </Link>
              <button
                type="button"
                onClick={() => navigate('/bookings')}
                className="flex-1 px-5 py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:opacity-95 shadow-md transition-all cursor-pointer"
              >
                Go to My Bookings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Approved state view
  if (status === 'Approved' && !isEditingVerification) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-card border border-emerald-500/30 rounded-3xl p-8 sm:p-10 shadow-xl text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mx-auto mb-6">
            <CheckCircleIcon className="w-12 h-12" />
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            Verified Companion
          </span>
          <h1 className="text-3xl font-extrabold text-foreground mt-3 mb-2">
            You Are Officially Live on Discovery!
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Your identity and companion profile are verified. You can update your hourly rate, bio, and activities anytime from your Unified Profile.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/profile?tab=provider')}
              className="px-6 py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm shadow-lg hover:opacity-95 transition-all cursor-pointer"
            >
              Manage Companion Settings
            </button>
            <button
              onClick={() => navigate('/discovery')}
              className="px-6 py-3 rounded-xl border border-border bg-muted/40 hover:bg-muted font-semibold text-sm transition-all cursor-pointer"
            >
              View Discovery Feed
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      {/* Header Banner */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider mb-3">
          <SparklesIcon className="w-4 h-4" /> Fast-Track Companion Verification
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Verify Identity & Payouts
        </h1>
        <p className="text-muted-foreground text-sm mt-2">
          Your rates and activities are automatically synced from your Companion Settings. Complete identity verification and payout setup below to go live.
        </p>
      </div>

      {/*Rejection Notice if Rejected */}
      {status === 'Rejected' && providerProfile?.rejectionReason && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-start gap-3">
          <ExclamationCircleIcon className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-rose-500">Previous Verification Requires Attention</h4>
            <p className="text-xs text-foreground/80 mt-0.5">{providerProfile.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* Linked Companion Settings Summary Card (No Duplicate Inputs!) */}
      <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
              Synced Companion Profile
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
              {formatRate(hourlyRate)} • {maxRadiusKm} km radius
            </span>
          </div>
          <p className="text-xs text-foreground/90 line-clamp-1 font-medium">{bio}</p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {specialties.slice(0, 5).map((s: string) => (
              <span
                key={s}
                className="px-2 py-0.5 rounded-lg bg-muted border border-border text-[11px] font-medium text-muted-foreground"
              >
                {s}
              </span>
            ))}
            {specialties.length > 5 && (
              <span className="text-[11px] text-muted-foreground self-center">
                +{specialties.length - 5} more
              </span>
            )}
          </div>
        </div>

        <Link
          to="/profile?tab=provider"
          className="px-4 py-2.5 rounded-xl border border-border hover:bg-muted text-foreground text-xs font-bold flex items-center gap-1.5 shrink-0 self-start sm:self-center transition-colors"
        >
          <PencilSquareIcon className="w-4 h-4 text-accent" />
          <span>Edit Rates & Bio</span>
        </Link>
      </div>

      {/* Single-Step Verification & Payout Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6"
      >
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold flex items-center gap-2">
            <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Section 1: KYC Verification */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <IdentificationIcon className="w-5 h-5 text-accent" />
            <div>
              <h2 className="text-base font-bold text-foreground">1. Government ID & Selfie Verification</h2>
              <p className="text-xs text-muted-foreground">
                Encrypted and private — never shared publicly.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                ID Document Type
              </label>
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground font-semibold text-sm focus:border-accent outline-hidden"
              >
                <option value="Aadhaar (DigiLocker)">Aadhaar (DigiLocker Token)</option>
                <option value="Passport">Indian / International Passport</option>
                <option value="Driving License">Driving License</option>
                <option value="Voter ID / PAN">Voter ID / PAN Card</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Document Verification Link / Image URL
              </label>
              <input
                type="url"
                value={idProofUrl}
                onChange={(e) => setIdProofUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground text-sm focus:border-accent outline-hidden"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Live Verification Selfie
            </label>
            <div className="grid grid-cols-3 gap-3 mb-2">
              {SAMPLE_GALLERY.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelfieVerificationUrl(imgUrl)}
                  className={`relative rounded-xl overflow-hidden h-24 border-2 transition-all cursor-pointer ${
                    selfieVerificationUrl === imgUrl
                      ? 'border-accent ring-2 ring-accent/30 scale-[1.01]'
                      : 'border-border/60 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Selfie ${idx + 1}`} className="w-full h-full object-cover" />
                  {selfieVerificationUrl === imgUrl && (
                    <div className="absolute top-1.5 right-1.5 bg-accent text-accent-foreground rounded-full p-0.5">
                      <CheckCircleIcon className="w-4 h-4" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <input
              type="url"
              value={selfieVerificationUrl}
              onChange={(e) => setSelfieVerificationUrl(e.target.value)}
              placeholder="Or paste custom selfie image URL..."
              className="w-full px-4 py-2 rounded-xl bg-muted/50 border border-border text-foreground text-xs focus:border-accent outline-hidden"
              required
            />
          </div>
        </div>

        {/* Section 2: Direct Escrow Payout Setup */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <BanknotesIcon className="w-5 h-5 text-emerald-500" />
            <div>
              <h2 className="text-base font-bold text-foreground">2. Earnings Withdrawal Details (UPI)</h2>
              <p className="text-xs text-muted-foreground">
                85% of every completed meetup is transferred directly to your wallet & UPI.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              UPI ID for Receiving Earnings
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@okhdfcbank"
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground font-mono text-sm focus:border-accent outline-hidden"
              required
            />
          </div>
        </div>

        {/* Submit Footer */}
        <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            By submitting, you agree to the Cue{' '}
            <Link to="/community-guidelines#platonic-charter" className="text-accent underline font-semibold hover:text-accent-hover">
              Strictly Platonic & Anti-Solicitation Safety Charter
            </Link>
            {' '}and{' '}
            <Link to="/terms" className="text-accent underline font-semibold hover:text-accent-hover">
              Terms of Service
            </Link>
            .
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shrink-0"
          >
            <ShieldCheckIcon className="w-5 h-5" />
            <span>{isSubmitting ? 'Submitting Verification...' : 'Submit for Verification'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplyCompanion;

