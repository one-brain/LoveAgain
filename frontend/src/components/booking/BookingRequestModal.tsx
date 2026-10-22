import React, { useState } from 'react';
import {
  XMarkIcon,
  ShieldCheckIcon,
  ClockIcon,
  MapPinIcon,
  SparklesIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

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

const DRESS_CODES = [
  'Casual / Sporty',
  'Smart Casual',
  'Formal / Black-Tie',
  'Traditional / Ethnic',
  'Outdoor / Hiker',
];

const TRANSPORT_MODES = [
  'Meet independently at public venue',
  'Client will book Uber / Cab for companion',
  'Client will provide pickup',
];

const DIET_PREFERENCES = [
  'No food involved (Drinks/Coffee only)',
  'Vegetarian',
  'Non-Vegetarian',
  'Vegan / Gluten-Free',
];

const LANGUAGES = [
  'English',
  'Hindi',
  'Tamil',
  'Telugu',
  'Kannada',
  'Marathi',
  'Bengali',
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

  const [activity, setActivity] = useState(provider.specialties[0] || 'Companionship / Activity');
  const [customActivity, setCustomActivity] = useState('');
  const [startDate, setStartDate] = useState(defaultDateStr);
  const [startTime, setStartTime] = useState('18:00');
  const [durationHours, setDurationHours] = useState(2);
  const [meetingVenue, setMeetingVenue] = useState('');
  const [dressCode, setDressCode] = useState(DRESS_CODES[1]);
  const [transportMode, setTransportMode] = useState(TRANSPORT_MODES[0]);
  const [dietPreference, setDietPreference] = useState(DIET_PREFERENCES[0]);
  const [equipmentGear, setEquipmentGear] = useState('');
  const [languagePreference, setLanguagePreference] = useState(LANGUAGES[0]);
  const [specialNotes, setSpecialNotes] = useState('');
  const [agreedToPlatonicPolicy, setAgreedToPlatonicPolicy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const resolvedActivity = activity === 'Other' && customActivity.trim() ? customActivity.trim() : activity;
  const subtotal = durationHours * provider.hourlyRate;
  const platformFee = 0; // Promotional zero fee
  const totalAmount = subtotal + platformFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!meetingVenue.trim()) {
      setErrorMsg('Please specify a public meeting venue (e.g. cafe, sports club, mall).');
      return;
    }

    if (!agreedToPlatonicPolicy) {
      setErrorMsg('Please confirm agreement with the safety and Escrow Vault guidelines.');
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
      <div className="bg-card border border-border w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <img
              src={provider.photoUrl ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt={provider.displayName}
              className="w-12 h-12 rounded-2xl object-cover border border-border shadow-xs"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-bold text-foreground font-serif">
                  Book {provider.displayName}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[11px] font-semibold">
                  ₹{provider.hourlyRate}/hr
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your booking requirements & lock deposit in Escrow
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-medium flex items-center gap-2">
              <InformationCircleIcon className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Activity & Schedule */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
              <SparklesIcon className="w-4 h-4" /> 1. Selected Activity & Schedule
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Activity / Service Requested
                </label>
                <select
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted text-foreground text-xs font-medium focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  {provider.specialties.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                  <option value="Other">+ Custom Activity...</option>
                </select>
              </div>

              {activity === 'Other' && (
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Describe Activity
                  </label>
                  <input
                    type="text"
                    value={customActivity}
                    onChange={(e) => setCustomActivity(e.target.value)}
                    placeholder="e.g. Scrabble, Architectural Walk"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted text-foreground text-xs"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  min={defaultDateStr}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted text-foreground text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted text-foreground text-xs"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Duration: <span className="text-foreground font-bold">{durationHours} hours</span>
                  </label>
                  <span className="text-xs text-accent font-semibold">
                    Subtotal: ₹{subtotal}
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
                <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                  <span>1 hr</span>
                  <span>2 hrs</span>
                  <span>4 hrs</span>
                  <span>6 hrs</span>
                  <span>8 hrs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Requirements & Preferences */}
          <div className="space-y-4 pt-4 border-t border-border/70">
            <h3 className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
              <ClockIcon className="w-4 h-4" /> 2. Outing Requirements & Logistics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Attire / Dress Code
                </label>
                <select
                  value={dressCode}
                  onChange={(e) => setDressCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted text-foreground text-xs font-medium focus:outline-none"
                >
                  {DRESS_CODES.map((dc) => (
                    <option key={dc} value={dc}>
                      {dc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Transportation Logistics
                </label>
                <select
                  value={transportMode}
                  onChange={(e) => setTransportMode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted text-foreground text-xs font-medium focus:outline-none"
                >
                  {TRANSPORT_MODES.map((tm) => (
                    <option key={tm} value={tm}>
                      {tm}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Food / Dining Preference
                </label>
                <select
                  value={dietPreference}
                  onChange={(e) => setDietPreference(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted text-foreground text-xs font-medium focus:outline-none"
                >
                  {DIET_PREFERENCES.map((dp) => (
                    <option key={dp} value={dp}>
                      {dp}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Language Preference
                </label>
                <select
                  value={languagePreference}
                  onChange={(e) => setLanguagePreference(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted text-foreground text-xs font-medium focus:outline-none"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Equipment / Gear Needed (Optional)
                </label>
                <input
                  type="text"
                  value={equipmentGear}
                  onChange={(e) => setEquipmentGear(e.target.value)}
                  placeholder="e.g. I will bring tennis rackets, need camera tripod, etc."
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted text-foreground text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Venue & Meeting Notes */}
          <div className="space-y-4 pt-4 border-t border-border/70">
            <h3 className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
              <MapPinIcon className="w-4 h-4" /> 3. Public Venue & Itinerary Notes
            </h3>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Public Meeting Venue / Spot <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={meetingVenue}
                onChange={(e) => setMeetingVenue(e.target.value)}
                placeholder="e.g. Blue Tokai Cafe, Indiranagar / Cubbon Park Gate 2"
                className="w-full px-3 py-2 rounded-xl border border-border bg-muted text-foreground text-xs"
                required
              />
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Safety Rule: All first-time companion meets must take place in public venues.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Agenda / Special Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="Tell the companion about your plan, event specifics, or things you would like to discuss..."
                className="w-full px-3 py-2 rounded-xl border border-border bg-muted text-foreground text-xs"
              />
            </div>
          </div>

          {/* Section 4: Escrow Protection Summary */}
          <div className="p-4 rounded-2xl bg-muted/60 border border-border space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
              <span>100% Escrow Vault Guarantee</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Your deposit of <strong>₹{totalAmount}</strong> is held safely in Cue Escrow. The companion is never paid upfront. Funds are only released after the session completes. Full refund if canceled or no-show.
            </p>

            <div className="pt-2 border-t border-border/70 flex justify-between font-bold text-sm text-foreground">
              <span>Total Escrow Deposit</span>
              <span className="text-accent text-base">₹{totalAmount}</span>
            </div>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={agreedToPlatonicPolicy}
              onChange={(e) => setAgreedToPlatonicPolicy(e.target.checked)}
              className="mt-0.5 rounded text-accent focus:ring-accent"
              required
            />
            <span>
              I agree to the Community Code of Conduct and understand this booking is protected under the 100% Escrow Vault guarantee.
            </span>
          </label>

          {/* Modal Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-xs shadow-md hover:bg-accent-hover transition-all flex items-center gap-1.5"
            >
              <span>Proceed to Escrow Deposit (₹{totalAmount})</span>
              <CheckCircleIcon className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
