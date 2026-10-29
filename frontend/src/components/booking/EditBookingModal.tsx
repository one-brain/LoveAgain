import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  CalendarDaysIcon,
  AdjustmentsHorizontalIcon,
  MapPinIcon,
  ClockIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import type { BookingSummary } from '../BookingCard';
import { useUpdateBookingMutation } from '../../store/bookingApi';
import { formatINR } from '../../utils/currency';

interface EditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingSummary | null;
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

const POPULAR_ACTIVITIES = [
  '☕ Specialty Coffee & Conversation',
  '🍽️ Casual Dining / Lunch',
  '🎾 Sports / Tennis Practice',
  '🖼️ Art Gallery / Museum Tour',
  '🛍️ Personal Shopping Companion',
  '🌳 City Walk / Mindful Stroll',
];

export const EditBookingModal: React.FC<EditBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const [updateBooking, { isLoading: isUpdating }] = useUpdateBookingMutation();

  const [step, setStep] = useState<1 | 2>(1);
  const [meetingVenue, setMeetingVenue] = useState('');
  const [activity, setActivity] = useState('');
  const [customActivity, setCustomActivity] = useState('');
  const [dressCode, setDressCode] = useState(DRESS_CODES[0]);
  const [transportMode, setTransportMode] = useState(TRANSPORT_MODES[0]);
  const [dietPreference, setDietPreference] = useState(DIET_PREFERENCES[0]);
  const [equipmentGear, setEquipmentGear] = useState('');
  const [languagePreference, setLanguagePreference] = useState(LANGUAGES[0]);
  const [specialNotes, setSpecialNotes] = useState('');

  // Date & Time reschedule fields (active when in PendingPayment status)
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [durationHours, setDurationHours] = useState(2);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isPendingPayment = booking?.status === 'PendingPayment';
  const isConfirmed = booking?.status === 'Confirmed';

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];

  useEffect(() => {
    if (!booking) return;

    setMeetingVenue(booking.meetingAddress || '');
    const req = booking.requirements;
    const initialAct = req?.activity || req?.activityName || booking.specialty || booking.activity || 'Companionship / Activity';
    setActivity(initialAct);
    setDressCode(req?.dressCode || DRESS_CODES[0]);
    setTransportMode(req?.transportMode || TRANSPORT_MODES[0]);
    setDietPreference(req?.dietPreference || DIET_PREFERENCES[0]);
    setEquipmentGear(req?.equipmentGear || '');
    setLanguagePreference(req?.languagePreference || LANGUAGES[0]);
    setSpecialNotes(req?.specialNotes || '');

    if (booking.startTime) {
      const d = new Date(booking.startTime);
      setStartDate(d.toISOString().split('T')[0]);
      setStartTime(d.toTimeString().slice(0, 5));
    }
    if (booking.startTime && booking.endTime) {
      const diffMs = new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime();
      const hrs = Math.max(1, Math.round(diffMs / 3600000));
      setDurationHours(hrs);
    }
    setStep(1);
    setErrorMsg('');
    setSuccessMsg('');
  }, [booking, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !booking) return null;

  // Compute estimated rate & dynamic recalculation for Pending bookings
  const originalDurationHours =
    booking.startTime && booking.endTime
      ? Math.max(1, Math.round((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / 3600000))
      : 2;
  const hourlyRate = booking.totalAmount ? booking.totalAmount / originalDurationHours : 1500;
  const estimatedTotal = isPendingPayment
    ? Math.round(hourlyRate * durationHours * 100) / 100
    : booking.totalAmount;

  const resolvedActivity = activity === 'Custom' && customActivity.trim() ? customActivity.trim() : activity;

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUpdating) return;
    setErrorMsg('');
    setSuccessMsg('');

    if (!meetingVenue.trim()) {
      setErrorMsg('Please specify a public meeting venue or landmark.');
      return;
    }

    try {
      let startIso: string | undefined;
      let endIso: string | undefined;

      if (isPendingPayment && startDate && startTime) {
        const startD = new Date(`${startDate}T${startTime}:00`);
        const endD = new Date(startD.getTime() + durationHours * 3600000);
        startIso = startD.toISOString();
        endIso = endD.toISOString();
      }

      await updateBooking({
        orderId: booking.orderId,
        meetingAddress: meetingVenue.trim(),
        startTime: startIso,
        endTime: endIso,
        durationHours: isPendingPayment ? durationHours : undefined,
        requirements: {
          activity: resolvedActivity.trim(),
          dressCode,
          transportMode,
          dietPreference,
          equipmentGear: equipmentGear.trim() || undefined,
          languagePreference,
          specialNotes: specialNotes.trim() || undefined,
        },
      }).unwrap();

      setSuccessMsg('Booking updated successfully.');
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      console.error('Update booking error:', err);
      setErrorMsg(err?.data?.error || err?.message || 'Failed to update booking. Please verify input details.');
    }
  };

  const companionName = booking.providerName || 'Verified Companion';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-booking-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-card border border-border w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header: mirrors BookingRequestModal */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-3 min-w-0">
            {booking.providerPhoto ? (
              <img
                src={booking.providerPhoto}
                alt={companionName}
                className="w-12 h-12 rounded-2xl object-cover border border-border shadow-xs shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent font-serif text-xl font-normal flex items-center justify-center border border-border shadow-xs shrink-0">
                {companionName.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 id="edit-booking-title" className="text-base sm:text-lg font-bold text-foreground font-serif truncate">
                  Edit Booking: {companionName}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                  isPendingPayment
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                    : isConfirmed
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {isPendingPayment ? 'Awaiting Escrow' : isConfirmed ? 'Escrow Confirmed' : booking.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                Step {step} of 2: {step === 1 ? 'Schedule & Activity' : 'Venue & Experience Preferences'} • Ref #{booking.orderId.slice(0, 8)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close edit booking dialog"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0 ml-2"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Canonical 2-Step Segmented Navigator */}
        <div className="flex border-b border-border/80">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              step === 1 ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <CalendarDaysIcon className="w-4 h-4" />
            <span>1. Schedule & Activity</span>
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              step === 2 ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
            <span>2. Venue & Preferences</span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-medium flex items-center gap-2">
              <InformationCircleIcon className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: Schedule & Activity */
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5">
                  Select Activity / Outing Focus
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {POPULAR_ACTIVITIES.map((act) => {
                    const cleanName = act.replace(/^[^\w\s]+/, '').trim();
                    const isSelected = activity === cleanName || activity === act;
                    return (
                      <button
                        key={act}
                        type="button"
                        onClick={() => {
                          setActivity(cleanName);
                          setCustomActivity('');
                        }}
                        className={`p-2.5 rounded-xl border text-left font-medium text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'border-accent bg-accent/10 text-accent font-semibold shadow-2xs'
                            : 'border-border bg-muted/40 text-foreground hover:bg-muted'
                        }`}
                      >
                        ✓ {cleanName}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2.5">
                  <input
                    type="text"
                    value={customActivity || (POPULAR_ACTIVITIES.some(p => p.includes(activity)) ? '' : activity)}
                    onChange={(e) => {
                      setCustomActivity(e.target.value);
                      setActivity(e.target.value);
                    }}
                    placeholder="Or type custom activity (e.g. Badminton practice, Heritage walk)"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-foreground text-xs focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Schedule Configuration: Reschedule if PendingPayment, locked summary if Confirmed */}
              {isPendingPayment ? (
                <div className="pt-2 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        min={minDateStr}
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

                  {/* Duration Slider: exact match with BookingRequestModal */}
                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-muted-foreground">
                        Duration: <strong className="text-foreground">{durationHours} {durationHours === 1 ? 'hour' : 'hours'}</strong>
                      </span>
                      <span className="text-xs font-bold text-accent font-mono tabular-nums">
                        {formatINR(hourlyRate)} × {durationHours} = {formatINR(estimatedTotal)}
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
                    <div className="flex justify-between text-[10px] text-muted-foreground px-1 mt-0.5 font-mono">
                      <span>1 hr</span>
                      <span>2 hrs</span>
                      <span>4 hrs</span>
                      <span>6 hrs</span>
                      <span>8 hrs</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <ClockIcon className="w-4 h-4 text-accent" />
                    <span>Active Escrow Confirmed Schedule</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Outing timing is locked under confirmed escrow. You can modify your public venue, dress code, and preferences on Step 2. To reschedule timing, please coordinate with your companion in Chat.
                  </p>
                </div>
              )}

              {/* Escrow Preview Pill */}
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-muted-foreground">Protected Payment (Safe Escrow)</span>
                </div>
                <span className="text-sm font-bold font-mono tabular-nums text-foreground">
                  {formatINR(estimatedTotal)}
                </span>
              </div>

              {/* Step 1 CTA */}
              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-xs shadow-xs hover:bg-accent-hover transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to Venue & Preferences</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: Venue & Preferences */
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              {/* Meeting Venue & Quick Chips */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  Public Meeting Venue / Spot <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={meetingVenue}
                  onChange={(e) => setMeetingVenue(e.target.value)}
                  placeholder="e.g. Third Wave Coffee, Koramangala / Cubbon Park Gate 2"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-foreground text-xs focus:ring-1 focus:ring-accent"
                  required
                />
                <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                  <MapPinIcon className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>Always specify public spaces (cafes, malls, lounges, parks) for verified safety.</span>
                </p>

                {/* Quick Venue Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {VENUE_SUGGESTIONS.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setMeetingVenue(v.replace(/^[^\w\s]+/, '').trim())}
                      className="px-2 py-0.5 rounded-lg bg-muted text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Attire & Transport */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    Attire / Dress Code
                  </label>
                  <select
                    value={dressCode}
                    onChange={(e) => setDressCode(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted text-foreground text-xs focus:ring-1 focus:ring-accent cursor-pointer"
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
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted text-foreground text-xs focus:ring-1 focus:ring-accent cursor-pointer"
                  >
                    {TRANSPORT_MODES.map((tm) => (
                      <option key={tm} value={tm}>{tm}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Diet & Language */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    Food / Diet Preference
                  </label>
                  <select
                    value={dietPreference}
                    onChange={(e) => setDietPreference(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted text-foreground text-xs focus:ring-1 focus:ring-accent cursor-pointer"
                  >
                    {DIET_PREFERENCES.map((dp) => (
                      <option key={dp} value={dp}>{dp}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    Preferred Language
                  </label>
                  <select
                    value={languagePreference}
                    onChange={(e) => setLanguagePreference(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted text-foreground text-xs focus:ring-1 focus:ring-accent cursor-pointer"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Equipment / Gear Required */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  Equipment / Gear Required (Optional)
                </label>
                <input
                  type="text"
                  value={equipmentGear}
                  onChange={(e) => setEquipmentGear(e.target.value)}
                  placeholder="e.g. Bring own tennis racket, running shoes, camera"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-foreground text-xs focus:ring-1 focus:ring-accent"
                />
              </div>

              {/* Special Notes / Discussion Topics */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  Special Notes / Conversation Topics
                </label>
                <textarea
                  rows={2}
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="Share any special instructions, preferences, or conversation topics..."
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-foreground text-xs focus:ring-1 focus:ring-accent"
                />
              </div>

              {/* Footer Actions: Strictly compliant 44px touch targets */}
              <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Total Escrow
                  </span>
                  <span className="text-base sm:text-lg font-bold font-mono tabular-nums text-foreground">
                    {formatINR(estimatedTotal)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <ArrowLeftIcon className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-xs shadow-xs hover:bg-accent-hover disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isUpdating ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span>Save Changes</span>
                        <CheckCircleIcon className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
