import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import {
  XMarkIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  SparklesIcon,
  CheckBadgeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { formatINR, formatRate } from '../../utils/currency';
import { useGetCompanionAvailabilityQuery, type CompanionAvailabilitySlot } from '../../store/bookingApi';
import { DayAvailabilityTimeline } from './DayAvailabilityTimeline';

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
    latitude?: number;
    longitude?: number;
    city?: string;
    area?: string;
    averageRating?: number;
  };
  initialDate?: string;
  initialTime?: string;
  initialDuration?: number;
  initialActivity?: string;
  onProceedToPayment: (bookingData: BookingRequirementData) => void | Promise<void>;
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

const DURATION_PRESETS = [1, 2, 3, 4, 5];

export const BookingRequestModal: React.FC<BookingRequestModalProps> = ({
  isOpen,
  onClose,
  provider,
  initialDate,
  initialTime,
  initialDuration,
  initialActivity,
  onProceedToPayment,
}) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  // Core booking state
  const [activity, setActivity] = useState(
    initialActivity || provider.specialties[0] || 'Companionship / Activity'
  );
  const [startDate, setStartDate] = useState(initialDate || defaultDateStr);
  const [startTime, setStartTime] = useState(initialTime || '11:00');
  const [durationHours, setDurationHours] = useState(initialDuration || 2);
  const [meetingVenue, setMeetingVenue] = useState('');
  const [dressCode, setDressCode] = useState(DRESS_CODES[0]);
  const [transportMode, setTransportMode] = useState(TRANSPORT_MODES[0]);
  const [specialNotes, setSpecialNotes] = useState('');
  const [agreedToPlatonicPolicy, setAgreedToPlatonicPolicy] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch companion's future available slots
  const { data: rawSlots = [] } = useGetCompanionAvailabilityQuery(
    provider.providerId,
    { skip: !isOpen || !provider?.providerId }
  );

  const availableSlots = useMemo(() => {
    const now = new Date();
    return (rawSlots || []).filter(
      (s: CompanionAvailabilitySlot) => !s.isBooked && new Date(s.endTime) > now
    );
  }, [rawSlots]);

  // Group slots by local date (YYYY-MM-DD)
  const slotsByDate = useMemo(() => {
    const map = new Map<string, CompanionAvailabilitySlot[]>();
    for (const slot of availableSlots) {
      const d = new Date(slot.startTime);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(slot);
    }
    for (const [_, slots] of map.entries()) {
      slots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }
    return map;
  }, [availableSlots]);

  // Slots specifically for currently selected date
  const slotsForSelectedDate = useMemo(() => {
    return slotsByDate.get(startDate) || [];
  }, [slotsByDate, startDate]);

  // Quick Date suggestions (next 4 days starting tomorrow)
  const quickDateOptions = useMemo(() => {
    const list: { key: string; label: string; weekday: string; openSlots: number }[] = [];
    for (let i = 1; i <= 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const weekday = i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short' });
      const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      const openSlots = slotsByDate.get(key)?.length || 0;
      list.push({ key, label, weekday, openSlots });
    }
    return list;
  }, [slotsByDate]);

  // Select first available start time on current date when slots or duration change
  useEffect(() => {
    if (slotsForSelectedDate.length > 0) {
      const requiredMinutes = durationHours * 60;
      let matched = false;
      for (const slot of slotsForSelectedDate) {
        const s = new Date(slot.startTime);
        const e = new Date(slot.endTime);
        const sMin = s.getHours() * 60 + s.getMinutes();
        const eMin = e.getHours() * 60 + e.getMinutes();
        if (sMin + requiredMinutes <= eMin) {
          const hours = String(s.getHours()).padStart(2, '0');
          const mins = String(s.getMinutes()).padStart(2, '0');
          setStartTime(`${hours}:${mins}`);
          matched = true;
          break;
        }
      }
      if (!matched && slotsForSelectedDate[0]) {
        const s = new Date(slotsForSelectedDate[0].startTime);
        const hours = String(s.getHours()).padStart(2, '0');
        const mins = String(s.getMinutes()).padStart(2, '0');
        setStartTime(`${hours}:${mins}`);
      }
    }
  }, [startDate, durationHours, slotsForSelectedDate]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Identity / KYC Guard
  if (!user || !user.isVerified) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-150">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheckIcon className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold font-serif text-foreground">
              Identity Verification Required
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Identity verification required to book companions. Complete KYC now.
            </p>
            <p className="text-[11px] text-muted-foreground/80 leading-relaxed pt-1">
              For community trust and member safety, government identity card submission is mandatory before initiating bookings with verified companions.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/profile?tab=kyc');
              }}
              className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheckIcon className="w-4 h-4" />
              <span>Complete KYC Now &rarr;</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold transition-all cursor-pointer"
            >
              Back to Companion Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = durationHours * provider.hourlyRate;
  const totalAmount = subtotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMsg('');

    if (!meetingVenue.trim()) {
      setErrorMsg('Please specify a public meeting venue (e.g. cafe, sports club, mall).');
      return;
    }

    if (!agreedToPlatonicPolicy) {
      setErrorMsg('Please confirm agreement with the safety guidelines and protected escrow terms.');
      return;
    }

    if (slotsForSelectedDate.length === 0) {
      setErrorMsg('Companion has no availability on this date. Please pick another date.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onProceedToPayment({
        activity,
        startDate,
        startTime,
        durationHours,
        meetingVenue: meetingVenue.trim(),
        dressCode,
        transportMode,
        dietPreference: 'Standard / Casual',
        languagePreference: 'English',
        specialNotes: specialNotes.trim() || undefined,
        totalAmount,
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to initiate booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-sheet-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-card border border-border w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[94vh]">
        {/* Header with companion summary */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={
                provider.photoUrl ??
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
              }
              alt={provider.displayName}
              className="w-12 h-12 rounded-2xl object-cover border border-border shadow-xs shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2
                  id="booking-sheet-title"
                  className="text-base sm:text-lg font-bold text-foreground font-serif truncate"
                >
                  Book with Escrow: {provider.displayName}
                </h2>
                <CheckBadgeIcon className="w-4 h-4 text-amber-500 shrink-0" title="Verified Companion" />
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-xs font-bold text-accent tabular-nums">
                  {formatRate(provider.hourlyRate)}
                </span>
                <span className="text-border">•</span>
                <span className="text-xs text-muted-foreground truncate">
                  {provider.area || provider.city || 'Central City Hub'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close booking dialog"
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center justify-center"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Unified Single Sheet Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-medium flex items-center gap-2">
              <InformationCircleIcon className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Activity Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
              1. Choose Activity / Experience
            </label>
            <div className="flex flex-wrap gap-2">
              {provider.specialties.slice(0, 5).map((spec) => {
                const isSelected = activity === spec;
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => setActivity(spec)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'border-accent bg-accent/10 text-accent font-bold shadow-2xs'
                        : 'border-border bg-muted/40 text-foreground hover:bg-muted'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '•'}</span>
                    <span>{spec}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Date & Duration Selector */}
          <div className="space-y-4 pt-1 border-t border-border/60">
            {/* Date Quick Selector */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarDaysIcon className="w-4 h-4 text-accent" />
                  <span>2. Outing Date</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  min={defaultDateStr}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-border bg-muted/60 text-foreground text-xs font-mono tabular-nums focus:ring-1 focus:ring-accent cursor-pointer"
                  title="Choose custom date"
                />
              </div>

              {/* Quick Date Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {quickDateOptions.map((opt) => {
                  const isSelected = startDate === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setStartDate(opt.key)}
                      className={`min-h-[52px] p-2 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? 'border-accent bg-accent text-accent-foreground shadow-xs'
                          : 'border-border bg-card hover:bg-muted/60 text-foreground'
                      }`}
                    >
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${isSelected ? 'text-accent-foreground/80' : 'text-muted-foreground'}`}>
                        {opt.weekday}
                      </span>
                      <span className="text-xs font-bold font-mono tabular-nums">
                        {opt.label}
                      </span>
                      {opt.openSlots > 0 ? (
                        <span className={`text-[9px] font-mono font-medium ${isSelected ? 'text-accent-foreground/90' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {opt.openSlots} open
                        </span>
                      ) : (
                        <span className={`text-[9px] ${isSelected ? 'text-accent-foreground/70' : 'text-muted-foreground/60'}`}>
                          No slots
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <ClockIcon className="w-4 h-4 text-accent" />
                  <span>3. Outing Duration</span>
                </label>
                <span className="font-mono text-xs font-bold text-accent tabular-nums">
                  {formatINR(provider.hourlyRate)} × {durationHours}h = {formatINR(subtotal)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {DURATION_PRESETS.map((hrs) => {
                  const isSelected = durationHours === hrs;
                  return (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setDurationHours(hrs)}
                      className={`flex-1 min-h-[44px] py-2 px-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer flex items-center justify-center font-mono tabular-nums ${
                        isSelected
                          ? 'border-accent bg-accent text-accent-foreground shadow-xs'
                          : 'border-border bg-muted/40 hover:bg-muted text-foreground'
                      }`}
                    >
                      <span>{hrs} {hrs === 1 ? 'hour' : 'hours'}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Visual Day Availability Timeline */}
          <div className="pt-1">
            <DayAvailabilityTimeline
              availableSlots={slotsForSelectedDate}
              durationHours={durationHours}
              selectedStartTime={startTime}
              onSelectStartTime={(newTime) => setStartTime(newTime)}
              selectedDateKey={startDate}
            />
          </div>

          {/* Section 4: Public Meeting Venue */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <MapPinIcon className="w-4 h-4 text-accent" />
              <span>4. Public Meeting Venue <span className="text-destructive">*</span></span>
            </label>
            <input
              type="text"
              value={meetingVenue}
              onChange={(e) => setMeetingVenue(e.target.value)}
              placeholder="e.g. Blue Tokai Coffee, Indiranagar / Cubbon Park Gate 2"
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-border bg-muted/50 text-foreground text-xs focus:ring-1 focus:ring-accent"
              required
            />
            {/* Quick Venue Chips */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {VENUE_SUGGESTIONS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setMeetingVenue(v.replace(/^[^\w\s]+/, '').trim())}
                  className="px-2.5 py-1 min-h-[32px] rounded-lg bg-muted text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Preferences Accordion */}
          <div className="rounded-2xl border border-border/70 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowPreferences(!showPreferences)}
              className="w-full p-3.5 bg-muted/30 hover:bg-muted/50 transition-colors flex items-center justify-between text-xs font-semibold text-foreground cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-accent" />
                <span>Optional Dress Code & Notes</span>
              </div>
              {showPreferences ? (
                <ChevronUpIcon className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {showPreferences && (
              <div className="p-4 space-y-3 bg-card border-t border-border/60 text-xs animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                      Attire / Dress Code
                    </label>
                    <select
                      value={dressCode}
                      onChange={(e) => setDressCode(e.target.value)}
                      className="w-full px-3 py-2 min-h-[40px] rounded-xl border border-border bg-muted/50 text-foreground text-xs focus:ring-1 focus:ring-accent"
                    >
                      {DRESS_CODES.map((dc) => (
                        <option key={dc} value={dc}>{dc}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                      Travel / Logistics
                    </label>
                    <select
                      value={transportMode}
                      onChange={(e) => setTransportMode(e.target.value)}
                      className="w-full px-3 py-2 min-h-[40px] rounded-xl border border-border bg-muted/50 text-foreground text-xs focus:ring-1 focus:ring-accent"
                    >
                      {TRANSPORT_MODES.map((tm) => (
                        <option key={tm} value={tm}>{tm}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Special Activity Notes
                  </label>
                  <input
                    type="text"
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="e.g. Please bring comfortable walking shoes / beginner tennis player"
                    className="w-full px-3 py-2 min-h-[40px] rounded-xl border border-border bg-muted/50 text-foreground text-xs focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Safety Policy & Escrow Guarantee */}
          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/80 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToPlatonicPolicy}
                onChange={(e) => setAgreedToPlatonicPolicy(e.target.checked)}
                className="mt-0.5 rounded border-border text-accent focus:ring-accent cursor-pointer"
                required
              />
              <span className="text-[11px] text-muted-foreground leading-relaxed">
                I agree to Cue's <strong>Platonic Companionship Policy</strong> and public venue safety rules. Booking fee is held in protected escrow and only released after mutual PIN completion.
              </span>
            </label>

            {/* Escrow Ledger Card */}
            <div className="p-4 rounded-2xl bg-accent/5 border border-accent/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheckIcon className="w-5 h-5 text-accent shrink-0" />
                <div>
                  <span className="text-[11px] font-bold text-foreground block">
                    Escrow Protected Total
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    {durationHours} hrs @ {formatRate(provider.hourlyRate)}
                  </span>
                </div>
              </div>
              <span className="font-mono text-xl font-bold text-foreground tabular-nums">
                {formatINR(totalAmount)}
              </span>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isSubmitting || slotsForSelectedDate.length === 0}
              className="w-full min-h-[48px] py-3 px-6 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldCheckIcon className="w-4 h-4" />
              <span>{isSubmitting ? 'Initiating Escrow Hold...' : `Deposit Escrow & Lock Outing (${formatINR(totalAmount)})`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
