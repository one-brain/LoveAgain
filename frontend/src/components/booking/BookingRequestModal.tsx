import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import {
  XMarkIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  CalendarDaysIcon,
  AdjustmentsHorizontalIcon,
  MapPinIcon,
  ClockIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { formatINR, formatRate } from '../../utils/currency';
import { useGetCompanionAvailabilityQuery, type CompanionAvailabilitySlot } from '../../store/bookingApi';

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

  const [step, setStep] = useState<1 | 2>(1);
  const [activity, setActivity] = useState(initialActivity || provider.specialties[0] || 'Companionship / Activity');
  const [customActivity] = useState('');
  const [startDate, setStartDate] = useState(initialDate || defaultDateStr);
  const [startTime, setStartTime] = useState(initialTime || '18:00');
  const [durationHours, setDurationHours] = useState(initialDuration || 2);
  const [selectedDateKey, setSelectedDateKey] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<CompanionAvailabilitySlot | null>(null);

  const { data: rawSlots = [], isLoading: isLoadingSlots } = useGetCompanionAvailabilityQuery(
    provider.providerId,
    { skip: !isOpen || !provider?.providerId }
  );

  const availableSlots = useMemo(() => {
    const now = new Date();
    return (rawSlots || []).filter((s: CompanionAvailabilitySlot) => !s.isBooked && new Date(s.endTime) > now);
  }, [rawSlots]);

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

  const availableDates = useMemo(() => {
    return Array.from(slotsByDate.keys()).sort();
  }, [slotsByDate]);

  const handleSelectSlot = (slot: CompanionAvailabilitySlot) => {
    setSelectedSlot(slot);
    const start = new Date(slot.startTime);
    const end = new Date(slot.endTime);
    const dateStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 3600);
    const resolvedHours = slot.durationHours || (diffHours > 0 ? Math.round(diffHours * 10) / 10 : 2);

    setStartDate(dateStr);
    setStartTime(timeStr);
    setDurationHours(resolvedHours);
  };

  useEffect(() => {
    if (availableDates.length > 0) {
      if (!selectedDateKey || !slotsByDate.has(selectedDateKey)) {
        const firstDate = availableDates[0];
        setSelectedDateKey(firstDate);
        const slotsForFirst = slotsByDate.get(firstDate);
        if (slotsForFirst && slotsForFirst.length > 0) {
          handleSelectSlot(slotsForFirst[0]);
        }
      }
    }
  }, [availableDates, slotsByDate]);
  const [meetingVenue, setMeetingVenue] = useState('');
  const [dressCode, setDressCode] = useState(DRESS_CODES[0]);
  const [transportMode, setTransportMode] = useState(TRANSPORT_MODES[0]);
  const [dietPreference] = useState(DIET_PREFERENCES[0]);
  const [equipmentGear] = useState('');
  const [languagePreference] = useState(LANGUAGES[0]);
  const [specialNotes, setSpecialNotes] = useState('');
  const [agreedToPlatonicPolicy, setAgreedToPlatonicPolicy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    if (initialDate) setStartDate(initialDate);
    if (initialTime) setStartTime(initialTime);
    if (initialDuration) setDurationHours(initialDuration);
    if (initialActivity) setActivity(initialActivity);
  }, [initialDate, initialTime, initialDuration, initialActivity]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
              className="w-full py-3 px-4 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheckIcon className="w-4 h-4" />
              <span>Complete KYC Now &rarr;</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold transition-all cursor-pointer"
            >
              Back to Companion Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  const resolvedActivity = activity === 'Other' && customActivity.trim() ? customActivity.trim() : activity;
  const subtotal = durationHours * provider.hourlyRate;
  const totalAmount = subtotal;

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMsg('');

    if (!meetingVenue.trim()) {
      setErrorMsg('Please specify a public meeting venue (e.g. cafe, sports club, mall).');
      return;
    }

    if (!agreedToPlatonicPolicy) {
      setErrorMsg('Please confirm agreement with the safety guidelines and protected payment terms.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onProceedToPayment({
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
      aria-labelledby="booking-request-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
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
                <h2 id="booking-request-title" className="text-base sm:text-lg font-bold text-foreground font-serif">
                  Book with Escrow: {provider.displayName}
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
            aria-label="Close booking dialog"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
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
                  Select Activity / Experience
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {provider.specialties.slice(0, 4).map((spec) => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => setActivity(spec)}
                      className={`min-h-[44px] p-2.5 rounded-xl border text-left font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                        activity === spec
                          ? 'border-accent bg-accent/10 text-accent font-semibold shadow-2xs'
                          : 'border-border bg-muted/40 text-foreground hover:bg-muted'
                      }`}
                    >
                      <span className="text-accent font-bold">✓</span>
                      <span className="truncate">{spec}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Companion Availability Slot Selector */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                    <CalendarDaysIcon className="w-4 h-4 text-accent" />
                    <span>Select Available Companion Schedule</span>
                  </label>
                  {availableSlots.length > 0 && (
                    <span className="text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 tabular-nums">
                      {availableSlots.length} slot{availableSlots.length > 1 ? 's' : ''} open
                    </span>
                  )}
                </div>

                {isLoadingSlots ? (
                  <div className="p-8 rounded-2xl bg-muted/30 border border-border/60 text-center space-y-2 animate-pulse">
                    <ClockIcon className="w-6 h-6 text-muted-foreground mx-auto animate-spin" />
                    <p className="text-xs text-muted-foreground">Checking companion's published schedule...</p>
                  </div>
                ) : availableDates.length === 0 ? (
                  /* Zero-Slot Empty State: Informational notice with NO action button; booking disabled */
                  <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                      <CalendarDaysIcon className="w-6 h-6" />
                    </div>
                    <h4 className="font-serif text-base font-bold text-foreground">
                      No Availability Scheduled
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                      This companion currently has no open availability slots scheduled. Please check back later.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Day Selector Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
                      {availableDates.map((dateKey) => {
                        const [y, m, d] = dateKey.split('-').map(Number);
                        const dateObj = new Date(y, m - 1, d);
                        const weekday = dateObj.toLocaleDateString('en-IN', { weekday: 'short' });
                        const day = dateObj.getDate();
                        const month = dateObj.toLocaleDateString('en-IN', { month: 'short' });
                        const isSelected = selectedDateKey === dateKey;
                        const count = slotsByDate.get(dateKey)?.length || 0;
                        return (
                          <button
                            key={dateKey}
                            type="button"
                            onClick={() => {
                              setSelectedDateKey(dateKey);
                              const slotsForDate = slotsByDate.get(dateKey) || [];
                              if (slotsForDate.length > 0) {
                                handleSelectSlot(slotsForDate[0]);
                              }
                            }}
                            className={`min-w-[76px] min-h-[64px] px-3 py-2 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center shrink-0 ${
                              isSelected
                                ? 'border-accent bg-accent text-accent-foreground shadow-xs'
                                : 'border-border bg-card hover:bg-muted/60 text-foreground'
                            }`}
                          >
                            <span className={`text-[10px] uppercase font-semibold tracking-wider ${isSelected ? 'text-accent-foreground/80' : 'text-muted-foreground'}`}>
                              {weekday}
                            </span>
                            <span className="text-base font-bold font-mono tabular-nums leading-tight">
                              {day}
                            </span>
                            <span className={`text-[10px] ${isSelected ? 'text-accent-foreground/90' : 'text-muted-foreground'}`}>
                              {month} • {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Time Slot Chips for Selected Day */}
                    {selectedDateKey && slotsByDate.has(selectedDateKey) && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-muted-foreground block">
                          Available Slots for Selected Date:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {slotsByDate.get(selectedDateKey)!.map((slot) => {
                            const isSlotActive = selectedSlot?.slotId === slot.slotId;
                            const s = new Date(slot.startTime);
                            const e = new Date(slot.endTime);
                            const timeRangeStr = `${s.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })} – ${e.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`;
                            const slotHours = slot.durationHours || 2;
                            const slotCost = slotHours * provider.hourlyRate;
                            return (
                              <button
                                key={slot.slotId}
                                type="button"
                                onClick={() => handleSelectSlot(slot)}
                                className={`min-h-[52px] p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                  isSlotActive
                                    ? 'border-accent bg-accent/10 ring-1 ring-accent text-foreground shadow-2xs'
                                    : 'border-border bg-card hover:bg-muted/50 text-foreground'
                                }`}
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <ClockIcon className={`w-3.5 h-3.5 shrink-0 ${isSlotActive ? 'text-accent' : 'text-muted-foreground'}`} />
                                    <span className="font-mono text-xs font-bold tabular-nums truncate">
                                      {timeRangeStr}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-muted-foreground font-medium block mt-0.5">
                                    {slotHours} hr session
                                  </span>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="font-mono font-bold text-xs text-foreground block tabular-nums">
                                    {formatINR(slotCost)}
                                  </span>
                                  <span className="text-[10px] text-accent font-semibold block">
                                    {isSlotActive ? '✓ Selected' : 'Available'}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Selected Slot Confirmation Pill */}
                    {selectedSlot && (
                      <div className="p-3.5 rounded-2xl bg-accent/5 border border-accent/20 flex items-center justify-between text-xs mt-2">
                        <div className="flex items-center gap-2">
                          <SparklesIcon className="w-4 h-4 text-accent shrink-0" />
                          <span className="text-foreground font-medium">
                            Confirmed slot: <strong className="font-semibold text-accent">{durationHours} hrs</strong> on <strong className="font-mono">{startDate}</strong> at <strong className="font-mono">{startTime}</strong>
                          </span>
                        </div>
                        <span className="font-mono font-bold text-foreground tabular-nums">
                          {formatINR(subtotal)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Escrow Preview Pill */}
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-muted-foreground">Protected Payment (Safe Escrow)</span>
                </div>
                <span className="text-sm font-bold font-mono text-foreground tabular-nums">{formatINR(totalAmount)}</span>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!selectedSlot || availableDates.length === 0}
                  className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-xs shadow-md hover:bg-accent-hover transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
                <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                  <MapPinIcon className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>
                    {provider.displayName} operates near{' '}
                    <strong className="text-foreground">{provider.area || provider.city || 'Central City Hub'}</strong> and travels up to{' '}
                    <strong className="text-foreground">{provider.maxRadiusKm ?? 25} km</strong>.
                  </span>
                </p>
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
                  I understand this payment of <strong>{formatINR(totalAmount)}</strong> is held safely by the platform and released only after the meetup is complete.
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
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-xs shadow-md hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                      <span>Creating Safe Order...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Safe Payment ({formatINR(totalAmount)})</span>
                      <CheckCircleIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
