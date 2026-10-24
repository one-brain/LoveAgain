import React, { useState } from 'react';
import {
  XMarkIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  CalendarDaysIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { formatINR, formatRate } from '../../utils/currency';

export interface BookingRequirementData {
  activity: string;
  startDate: string;
  startTime: string;
  durationHours: number;
  meetingVenue: string;
  dressCode: string;
  transportMode: string;
  dietPreference: string;
  equipmentGear?: string;
  languagePreference: string;
  specialNotes?: string;
  totalAmount: number;
}

interface BookingRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: {
    providerId: string;
    displayName: string;
    photoUrl: string | null;
    hourlyRate: number;
    specialties: string[];
    maxRadiusKm?: number;
  };
  onProceedToPayment: (bookingData: BookingRequirementData) => void;
}

const VENUE_SUGGESTIONS = [
  '☕ Local Cafe / Coffee Shop',
  '🎾 Sports Club / Tennis Courts',
  '🛍️ City Mall / Public Plaza',
  '🍽️ Fine Dining Restaurant',
  '🌳 Public Park / Garden',
];

const DRESS_CODES = [
  'Smart Casual',
  'Casual / Sporty',
  'Formal / Black-Tie',
  'Traditional / Ethnic',
];

const TRANSPORT_MODES = [
  'Meet independently at venue',
  'Client books Uber for companion',
  'Client will provide pickup',
];

const DIET_PREFERENCES = [
  'Coffee & Drinks Only',
  'Vegetarian',
  'Non-Vegetarian',
  'No food involved',
];

const LANGUAGES = [
  'English',
  'Hindi',
  'Tamil',
  'Telugu',
  'Any',
];

export const BookingRequestModal: React.FC<BookingRequestModalProps> = ({
  isOpen,
  onClose,
  provider,
  onProceedToPayment,
}) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [step, setStep] = useState<1 | 2>(1);
  const [activity, setActivity] = useState(provider.specialties[0] || 'Companionship / Activity');
  const [customActivity] = useState('');
  const [startDate, setStartDate] = useState(defaultDateStr);
  const [startTime, setStartTime] = useState('18:00');
  const [durationHours, setDurationHours] = useState(2);
  const [meetingVenue, setMeetingVenue] = useState('');
  const [dressCode, setDressCode] = useState(DRESS_CODES[0]);
  const [transportMode, setTransportMode] = useState(TRANSPORT_MODES[0]);
  const [dietPreference] = useState(DIET_PREFERENCES[0]);
  const [equipmentGear] = useState('');
  const [languagePreference] = useState(LANGUAGES[0]);
  const [specialNotes, setSpecialNotes] = useState('');
  const [agreedToPlatonicPolicy, setAgreedToPlatonicPolicy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const resolvedActivity = activity === 'Other' && customActivity.trim() ? customActivity.trim() : activity;
  const subtotal = durationHours * provider.hourlyRate;
  const totalAmount = subtotal;

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!meetingVenue.trim()) {
      setErrorMsg('Please specify a public meeting venue (e.g. cafe, sports club, mall).');
      return;
    }

    if (!agreedToPlatonicPolicy) {
      setErrorMsg('Please confirm agreement with the safety guidelines and Escrow Vault deposit.');
      return;
    }

    onProceedToPayment({
      activity: resolvedActivity,
      startDate,
      startTime,
      durationHours,
      meetingVenue: meetingVenue.trim(),
      dressCode,
      transportMode,
      dietPreference,
      equipmentGear: equipmentGear.trim() || undefined,
      languagePreference,
      specialNotes: specialNotes.trim() || undefined,
      totalAmount,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-3">
            <img
              src={provider.photoUrl ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt={provider.displayName}
              className="w-12 h-12 rounded-2xl object-cover border border-border shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-foreground font-serif">
                  Book {provider.displayName}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[11px] font-bold">
                  {formatRate(provider.hourlyRate)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Step {step} of 2: {step === 1 ? 'Schedule & Activity' : 'Preferences & Public Venue'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Step Indicator */}
        <div className="flex border-b border-border/80">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              step === 1 ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <CalendarDaysIcon className="w-4 h-4" />
            <span>1. Schedule & Activity</span>
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              step === 2 ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
            <span>2. Venue & Preferences</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-medium flex items-center gap-2">
              <InformationCircleIcon className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5">
                  Select Activity / Skill Required
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {provider.specialties.slice(0, 4).map((spec) => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => setActivity(spec)}
                      className={`p-2.5 rounded-xl border text-left font-medium text-xs transition-all ${
                        activity === spec
                          ? 'border-accent bg-accent/10 text-accent font-semibold shadow-2xs'
                          : 'border-border bg-muted/40 text-foreground hover:bg-muted'
                      }`}
                    >
                      ✓ {spec}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    min={defaultDateStr}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-foreground text-xs focus:ring-1 focus:ring-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-foreground text-xs focus:ring-1 focus:ring-accent"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-muted-foreground">
                    Duration: <strong className="text-foreground">{durationHours} hours</strong>
                  </span>
                  <span className="text-xs font-bold text-accent">
                    {formatINR(provider.hourlyRate)} × {durationHours} = {formatINR(subtotal)}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="1"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground px-1 mt-0.5">
                  <span>1 hr</span>
                  <span>2 hrs</span>
                  <span>4 hrs</span>
                  <span>6 hrs</span>
                  <span>8 hrs</span>
                </div>
              </div>

              {/* Escrow Preview Pill */}
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-muted-foreground">100% Protected in Escrow Vault</span>
                </div>
                <span className="text-sm font-bold text-foreground">{formatINR(totalAmount)}</span>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-xs shadow-md hover:bg-accent-hover transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Continue to Venue & Preferences &rarr;</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  Public Meeting Venue / Spot <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={meetingVenue}
                  onChange={(e) => setMeetingVenue(e.target.value)}
                  placeholder="e.g. Blue Tokai Cafe, Indiranagar / Cubbon Park Gate 2"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-foreground text-xs focus:ring-1 focus:ring-accent"
                  required
                />
                {/* Venue Quick Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {VENUE_SUGGESTIONS.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setMeetingVenue(v.replace(/^[^\w\s]+/, '').trim())}
                      className="px-2 py-0.5 rounded-lg bg-muted text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    Attire / Dress Code
                  </label>
                  <select
                    value={dressCode}
                    onChange={(e) => setDressCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted text-foreground text-xs focus:ring-1 focus:ring-accent"
                  >
                    {DRESS_CODES.map((dc) => (
                      <option key={dc} value={dc}>{dc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    Logistics / Transport
                  </label>
                  <select
                    value={transportMode}
                    onChange={(e) => setTransportMode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted text-foreground text-xs focus:ring-1 focus:ring-accent"
                  >
                    {TRANSPORT_MODES.map((tm) => (
                      <option key={tm} value={tm}>{tm}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  Special Notes / Itinerary (Optional)
                </label>
                <textarea
                  rows={2}
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="Share any specific requests, discussion topics, or details about the outing..."
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted/50 text-foreground text-xs"
                />
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-muted-foreground pt-1">
                <input
                  type="checkbox"
                  checked={agreedToPlatonicPolicy}
                  onChange={(e) => setAgreedToPlatonicPolicy(e.target.checked)}
                  className="mt-0.5 rounded text-accent focus:ring-accent"
                  required
                />
                <span>
                  I understand this deposit of <strong>{formatINR(totalAmount)}</strong> is locked securely in the Escrow Vault and released only after the meetup completes.
                </span>
              </label>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  &larr; Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-xs shadow-md hover:bg-accent-hover transition-all flex items-center gap-1.5"
                >
                  <span>Lock {formatINR(totalAmount)} in Escrow</span>
                  <CheckCircleIcon className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
