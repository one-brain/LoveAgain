import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetMyProfileQuery,
} from '../store/api';
import { useApplyCompanionMutation } from '../store/adminApi';
import {
  SparklesIcon,
  ShieldCheckIcon,
  IdentificationIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const SPECIALTY_OPTIONS = [
  // 💼 Pro Skilled Services
  'Photography & Video',
  'Fitness & Sports Coaching',
  'Yoga & Mindfulness',
  'Language Tutoring',
  'Coding & Tech Mentorship',
  'DJ & Music Performance',
  'Event Hosting & Emcee',
  // 🤝 Companionship & Activities
  'City Guide & Tours',
  'Dinner Date & Foodie',
  'Concert & Festival Buddy',
  'Workout & Tennis Partner',
  'Business Gala & Plus-One',
  'Hiking & Outdoor Walks',
  // 💍 Relationships & Matrimony
  'Seeking Matrimony Match',
  'Live-In Compatibility',
  'Casual Dating & Coffee',
];

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

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    hourlyRate: providerProfile?.hourlyRate || 1500,
    bio: providerProfile?.bio || '',
    specialties: (providerProfile?.specialties as string[]) || ['Dinner Date', 'Coffee & Chat'],
    maxRadiusKm: providerProfile?.maxRadiusKm || 25,
    idProofUrl: providerProfile?.idProofUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600',
    selfieVerificationUrl: providerProfile?.selfieVerificationUrl || SAMPLE_GALLERY[0],
    upiId: 'companion@oksbi',
    idType: 'Aadhaar Card',
  });

  const [errorMsg, setErrorMsg] = useState('');

  const toggleSpecialty = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(item)
        ? prev.specialties.filter((s) => s !== item)
        : [...prev.specialties, item],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.specialties.length === 0) {
      setErrorMsg('Please select at least one companion specialty.');
      return;
    }
    if (!formData.bio.trim() || formData.bio.length < 30) {
      setErrorMsg('Please provide a descriptive bio of at least 30 characters.');
      return;
    }
    if (!formData.hourlyRate || formData.hourlyRate <= 0) {
      setErrorMsg('Please enter a valid hourly companionship rate.');
      return;
    }

    try {
      await applyCompanion({
        hourlyRate: Number(formData.hourlyRate),
        bio: formData.bio,
        specialties: formData.specialties,
        maxRadiusKm: Number(formData.maxRadiusKm),
        idProofUrl: formData.idProofUrl,
        selfieVerificationUrl: formData.selfieVerificationUrl,
        upiId: formData.upiId,
      }).unwrap();

      await refetchProfile();
      setStep(4); // Celebration / In Review state
    } catch (err: any) {
      setErrorMsg(err?.data?.error || 'Failed to submit companion application. Please check your inputs.');
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Already submitted and under review view
  if (status === 'PendingReview' && step !== 1 && step !== 2 && step !== 3) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-card border border-border/80 rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col items-center text-center max-w-xl mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-6 shadow-inner">
              <ClockIcon className="w-10 h-10 animate-pulse" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-3">
              Application Under Review
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-3">
              Your Companion Application is Being Verified
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              Thank you for applying to be a verified companion on LoveAgain. Our Trust & Safety team is reviewing your ID documents and bio. Turnaround time is usually within <strong>24 hours</strong>.
            </p>

            <div className="w-full bg-muted/40 border border-border/60 rounded-2xl p-6 text-left mb-8 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-accent" /> Verification Progress
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-xs sm:text-sm text-foreground/90 font-medium">Profile Details & Rates Submitted</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-xs sm:text-sm text-foreground/90 font-medium">Government ID & Selfie Uploaded</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin shrink-0" />
                  <span className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 font-semibold">Admin Document & Safety Review (In Progress)</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground/60">
                  <div className="w-5 h-5 rounded-full border border-dashed border-border shrink-0 flex items-center justify-center text-[10px]">4</div>
                  <span className="text-xs sm:text-sm font-medium">Public Discovery Activation</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 px-5 py-3 rounded-xl border border-border/80 bg-muted/30 hover:bg-muted font-semibold text-sm transition-all"
              >
                Edit Submitted Details
              </button>
              <button
                type="button"
                onClick={() => navigate('/bookings')}
                className="flex-1 px-5 py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:opacity-95 shadow-md transition-all"
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
  if (status === 'Approved' && step !== 1 && step !== 2 && step !== 3) {
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
            Your profile is visible to clients across India. You will receive notifications when clients request your companionship.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/provider')}
              className="flex-1 px-6 py-3.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-md hover:opacity-95 transition-all"
            >
              Open Companion Hub & Earnings
            </button>
            <button
              onClick={() => setStep(1)}
              className="px-5 py-3.5 rounded-xl border border-border/80 text-foreground hover:bg-muted font-semibold text-sm transition-all"
            >
              Update Pricing & Bio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-3 border border-accent/20">
          <SparklesIcon className="w-4 h-4" />
          <span>Unified Creator & Companion Program</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Offer Companionship on Cue
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base mt-2">
          Earn 85% on every booking with instant UPI payouts, 100% upfront escrow protection, and verified safe clients.
        </p>
      </div>

      {/* Stepper Progress */}
      <div className="flex items-center justify-between max-w-md mx-auto mb-10">
        {[
          { num: 1, label: 'Profile' },
          { num: 2, label: 'Media' },
          { num: 3, label: 'KYC & UPI' },
        ].map((item, idx) => (
          <React.Fragment key={item.num}>
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => setStep(item.num)}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all ${
                  step === item.num
                    ? 'bg-accent text-accent-foreground shadow-md ring-4 ring-accent/20 scale-105'
                    : step > item.num
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                    : 'bg-muted text-muted-foreground border border-border'
                }`}
              >
                {step > item.num ? '✓' : item.num}
              </button>
              <span className={`text-[11px] mt-1.5 font-semibold ${step === item.num ? 'text-accent' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            </div>
            {idx < 2 && (
              <div className={`flex-1 h-0.5 mx-2 -mt-4 transition-colors ${step > item.num ? 'bg-emerald-500/60' : 'bg-border'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Error banner */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
          <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Rejection notice if previously rejected */}
      {providerProfile?.rejectionReason && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-sm">
          <p className="font-bold flex items-center gap-1.5 mb-1">
            <ExclamationCircleIcon className="w-4 h-4" /> Previous Review Feedback:
          </p>
          <p>{providerProfile.rejectionReason}</p>
          <p className="text-xs opacity-80 mt-1">Please address the feedback above and submit your updated application.</p>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xl">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">Step 1: Your Hourly Rate & Specialties</h2>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Hourly Rate (₹ INR) <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-foreground text-lg">₹</span>
                <input
                  type="number"
                  min="500"
                  max="50000"
                  step="100"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-background text-foreground font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="1500"
                  required
                />
              </div>
              <p className="text-[12px] text-muted-foreground mt-1.5 flex justify-between">
                <span>You earn <strong>₹{(formData.hourlyRate * 0.85).toFixed(0)}/hr</strong> (85% net take-home)</span>
                <span>Platform commission: 15%</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Specialties & Activities (Select 1 or more) <span className="text-destructive">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {SPECIALTY_OPTIONS.map((spec) => {
                  const isSelected = formData.specialties.includes(spec);
                  return (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => toggleSpecialty(spec)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                        isSelected
                          ? 'bg-accent text-accent-foreground border-accent shadow-xs'
                          : 'bg-muted/40 text-foreground border-border/80 hover:bg-muted'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {spec}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                About You & Companionship Bio <span className="text-destructive">*</span>
              </label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Introduce yourself, your conversational style, hobbies, and the experiences you offer to clients (at least 30 characters)..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
              <span className="text-xs text-muted-foreground">Character count: {formData.bio.length} / 30 minimum</span>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  if (formData.specialties.length === 0) {
                    setErrorMsg('Please select at least one specialty.');
                    return;
                  }
                  if (!formData.bio || formData.bio.length < 30) {
                    setErrorMsg('Please enter a bio of at least 30 characters.');
                    return;
                  }
                  setErrorMsg('');
                  setStep(2);
                }}
                className="px-6 py-3 rounded-xl bg-accent text-accent-foreground font-bold text-sm flex items-center gap-2 hover:opacity-95 shadow-md"
              >
                <span>Continue to Media</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">Step 2: Profile Photo & Visual Verification</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Select or provide your high-resolution profile photo. Verified badges are only issued when clear face photos are provided.
            </p>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Live Face Selfie / Primary Photo <span className="text-destructive">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {SAMPLE_GALLERY.map((url, i) => (
                  <div
                    key={i}
                    onClick={() => setFormData({ ...formData, selfieVerificationUrl: url })}
                    className={`relative rounded-2xl overflow-hidden aspect-square border-2 cursor-pointer transition-all ${
                      formData.selfieVerificationUrl === url
                        ? 'border-accent ring-2 ring-accent/30 scale-102'
                        : 'border-border/60 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Gallery sample ${i}`} className="w-full h-full object-cover" />
                    {formData.selfieVerificationUrl === url && (
                      <div className="absolute top-2 right-2 bg-accent text-accent-foreground rounded-full p-1 shadow-md">
                        <CheckCircleIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <input
                type="text"
                value={formData.selfieVerificationUrl}
                onChange={(e) => setFormData({ ...formData, selfieVerificationUrl: e.target.value })}
                placeholder="Or paste an image URL directly"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-xl border border-border/80 text-foreground font-semibold text-sm hover:bg-muted"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl bg-accent text-accent-foreground font-bold text-sm flex items-center gap-2 hover:opacity-95 shadow-md"
              >
                <span>Continue to KYC & Bank</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">Step 3: Identity Verification & Payout UPI</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              To keep our community safe and compliant with Indian regulations, all companions verify their government identity before listings go live.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Government ID Type <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.idType}
                  onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="Passport">Indian Passport</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Voter ID">Voter ID</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  UPI ID for Direct Payouts <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <BanknotesIcon className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-accent" />
                  <input
                    type="text"
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    placeholder="yourname@oksbi"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Government ID Document URL / Preview <span className="text-destructive">*</span>
              </label>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                <IdentificationIcon className="w-8 h-8 text-accent shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{formData.idType} Document Attached</p>
                  <p className="text-[11px] text-muted-foreground truncate">{formData.idProofUrl}</p>
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
                  Encrypted & Vaulted
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-accent/5 border border-accent/20 text-xs text-muted-foreground space-y-1.5">
              <p className="font-semibold text-foreground">💡 How LoveAgain Companionship Works:</p>
              <p>• Clients pay 100% in advance held in Cue Escrow before any meeting occurs.</p>
              <p>• After you conclude the meeting, 85% is instantly deposited to your available balance for 1-click UPI withdrawal.</p>
              <p>• Only Admin-approved profiles appear in public discovery to maintain premium trust.</p>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-3 rounded-xl border border-border/80 text-foreground font-semibold text-sm hover:bg-muted"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-lg hover:opacity-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Submit for Admin Verification</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ApplyCompanion;
