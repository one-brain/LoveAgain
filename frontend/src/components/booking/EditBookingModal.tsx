import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  PencilSquareIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  MapPinIcon,
  ClockIcon,
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

export const EditBookingModal: React.FC<EditBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const [updateBooking, { isLoading: isUpdating }] = useUpdateBookingMutation();

  const [meetingVenue, setMeetingVenue] = useState('');
  const [activity, setActivity] = useState('');
  const [dressCode, setDressCode] = useState(DRESS_CODES[0]);
  const [transportMode, setTransportMode] = useState(TRANSPORT_MODES[0]);
  const [dietPreference, setDietPreference] = useState(DIET_PREFERENCES[0]);
  const [equipmentGear, setEquipmentGear] = useState('');
  const [languagePreference, setLanguagePreference] = useState(LANGUAGES[0]);
  const [specialNotes, setSpecialNotes] = useState('');

  // Date & Time reschedule fields (enabled for PendingPayment status)
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [durationHours, setDurationHours] = useState(2);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isPendingPayment = booking?.status === 'PendingPayment';
  const isConfirmed = booking?.status === 'Confirmed';

  useEffect(() => {
    if (!booking) return;

    setMeetingVenue(booking.meetingAddress || '');
    const req = booking.requirements;
    setActivity(req?.activity || req?.activityName || booking.specialty || 'Companionship / Activity');
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

  // Compute estimated rate & new total if pending payment
  const originalDurationHours =
    booking.startTime && booking.endTime
      ? Math.max(1, Math.round((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / 3600000))
      : 2;
  const hourlyRate = booking.totalAmount ? booking.totalAmount / originalDurationHours : 1000;
  const estimatedTotal = isPendingPayment ? Math.round(hourlyRate * durationHours * 100) / 100 : booking.totalAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!meetingVenue.trim()) {
      setErrorMsg('Please specify a public meeting venue or address.');
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
          activity: activity.trim(),
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
      }, 1000);
    } catch (err: any) {
      console.error('Update booking error:', err);
      setErrorMsg(err?.data?.error || err?.message || 'Failed to update booking. Please verify input details.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-booking-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-card border border-border w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <PencilSquareIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="edit-booking-title" className="text-base sm:text-lg font-bold text-foreground font-serif">
                  Modify Booking #{booking.orderId.slice(0, 8)}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isPendingPayment
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    : isConfirmed
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {booking.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Companion: {booking.providerName || 'Verified Companion'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close edit dialog"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
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

          {/* Date & Time (Editable if PendingPayment, read-only note if Confirmed) */}
          {isPendingPayment ? (
            <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <CalendarDaysIcon className="w-4 h-4 text-accent" />
                  <span>Reschedule Date & Duration</span>
                </span>
                <span className="text-[11px] text-muted-foreground font-mono tabular-nums">
                  Rate: {formatINR(hourlyRate)}/hr
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-card text-foreground text-xs focus:ring-1 focus:ring-accent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-card text-foreground text-xs focus:ring-1 focus:ring-accent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Duration (Hours)
                  </label>
                  <select
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-card text-foreground text-xs focus:ring-1 focus:ring-accent"
                  >
                    {[1, 2, 3, 4, 5, 6, 8].map((h) => (
                      <option key={h} value={h}>
                        {h} {h === 1 ? 'hour' : 'hours'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ClockIcon className="w-4 h-4 text-accent" />
                <span>Schedule locked under active escrow. To reschedule time window, please coordinate in Chat.</span>
              </div>
            </div>
          )}

          {/* Meeting Venue */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1 flex items-center gap-1">
              <MapPinIcon className="w-3.5 h-3.5 text-accent" />
              <span>Public Meeting Venue / Landmark</span>
            </label>
            <input
              type="text"
              value={meetingVenue}
              onChange={(e) => setMeetingVenue(e.target.value)}
              placeholder="e.g. Third Wave Coffee, Koramangala 4th Block"
              className="w-full px-3 py-2 rounded-xl border border-border bg-muted text-foreground text-xs focus:ring-1 focus:ring-accent"
              required
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {VENUE_SUGGESTIONS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setMeetingVenue(v.replace(/^[^\w]+/, ''))}
                  className="px-2 py-0.5 rounded-lg border border-border/80 bg-background hover:bg-muted text-[10px] text-muted-foreground transition-colors cursor-pointer"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">
              Activity / Outing Topic
            </label>
            <input
              type="text"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="e.g. Specialty Coffee Tasting, Museum Tour, Tennis"
              className="w-full px-3 py-2 rounded-xl border border-border bg-muted text-foreground text-xs focus:ring-1 focus:ring-accent"
              required
            />
          </div>

          {/* Dress Code & Transport */}
          <div className="grid grid-cols-2 gap-3">
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

          {/* Diet & Language */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">
                Food / Diet Preference
              </label>
              <select
                value={dietPreference}
                onChange={(e) => setDietPreference(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-muted text-foreground text-xs focus:ring-1 focus:ring-accent"
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
                className="w-full px-3 py-2 rounded-xl border border-border bg-muted text-foreground text-xs focus:ring-1 focus:ring-accent"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Equipment / Gear */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">
              Equipment / Gear Required (Optional)
            </label>
            <input
              type="text"
              value={equipmentGear}
              onChange={(e) => setEquipmentGear(e.target.value)}
              placeholder="e.g. Bring own tennis racket, running shoes"
              className="w-full px-3 py-2 rounded-xl border border-border bg-muted text-foreground text-xs focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Special Notes */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">
              Special Notes / Discussion Topics
            </label>
            <textarea
              rows={2}
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="Share any special instructions, preferences, or conversation topics..."
              className="w-full px-3 py-2 rounded-xl border border-border bg-muted text-foreground text-xs focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Footer Action Bar */}
          <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                Total Escrow
              </span>
              <span className="text-base font-bold font-mono tabular-nums text-foreground">
                {formatINR(estimatedTotal)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 min-h-[40px] rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-5 py-2.5 min-h-[40px] rounded-xl bg-accent text-accent-foreground font-bold text-xs shadow-md hover:bg-accent-hover disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
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
      </div>
    </div>
  );
};
