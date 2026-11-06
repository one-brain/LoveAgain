import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Input,
  Field,
  ToggleButton,
  MessageBar,
  MessageBarBody,
  Badge,
  Spinner,
} from '@fluentui/react-components';
import {
  Dismiss20Regular,
  ShieldCheckmark24Regular,
  ShieldCheckmark20Regular,
  ShieldCheckmark16Regular,
  Calendar16Regular,
  Clock16Regular,
  Location16Regular,
  CheckmarkStarburst16Filled,
  ChevronDown16Regular,
  ChevronUp16Regular,
  Options16Regular,
} from '@fluentui/react-icons';
import type { RootState } from '../../store';
import { formatINR, formatRate } from '../../utils/currency';
import { toProviderGuid, generateDemoSlots } from '../../utils/providerData';
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

const ACTIVITY_VENUE_MAP: Record<string, string[]> = {
  Coffee: ['Blue Tokai Coffee, Indiranagar', 'Third Wave Coffee, Koramangala', 'Araku Coffee, 12th Main', 'Starbucks Reserve'],
  Restaurant: ['Olive Beach, Richmond Town', 'The Smoke House Deli, Lavelle Rd', 'The Fatty Bao, Indiranagar', 'Toit Brewpub'],
  Dining: ['Olive Beach, Richmond Town', 'The Smoke House Deli, Lavelle Rd', 'The Fatty Bao, Indiranagar', 'Toit Brewpub'],
  Shopping: ['UB City Luxury Mall', 'Phoenix Marketcity, Whitefield', '100ft Road Boutiques, Indiranagar', 'Commercial Street'],
  Movies: ["PVR Director's Cut, Forum Rex", 'INOX Megaplex, Mall of Asia', 'PVR Gold Class, Phoenix', 'Cinepolis VIP'],
  Weekend: ['Cubbon Park (Bamboo Grove)', 'Nandi Hills Sunrise Point', 'Lalbagh Botanical Gardens', 'Sankey Tank Promenade'],
  'Special Events': ['National Gallery of Modern Art (NGMA)', 'Bangalore Club Lawn', 'Chowdiah Memorial Hall', 'Ranga Shankara'],
  Tennis: ['KSLTA Tennis Stadium, Cubbon Park', 'Bowring Institute Courts', 'Topspin Tennis Academy'],
  Cooking: ['Kitchen Studio, Indiranagar', 'Culinary Lab, Koramangala', 'Slurp Cooking Studio'],
};

function getSuggestedVenues(currentActivity: string): string[] {
  for (const [key, venues] of Object.entries(ACTIVITY_VENUE_MAP)) {
    if (currentActivity.toLowerCase().includes(key.toLowerCase())) {
      return venues;
    }
  }
  return [
    'Blue Tokai Coffee, Indiranagar',
    'Third Wave Coffee, Koramangala',
    'UB City Promenade',
    'Cubbon Park Gate 2',
  ];
}

const DRESS_CODES = [
  'Smart Casual',
  'Casual / Sporty',
  'Formal / Black-Tie',
  'Traditional / Ethnic',
];

const TRANSPORT_MODES = [
  'Meet independently at venue',
  'Host books Uber for Guest',
  'Host will provide pickup',
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

  const initialAct = initialActivity || provider.specialties[0] || 'Coffee Dates';
  const defaultVenues = getSuggestedVenues(initialAct);

  const [activity, setActivity] = useState(initialAct);
  const [startDate, setStartDate] = useState(initialDate || defaultDateStr);
  const [startTime, setStartTime] = useState(initialTime || '11:00');
  const [durationHours, setDurationHours] = useState(initialDuration || 2);
  const [meetingVenue, setMeetingVenue] = useState(defaultVenues[0] || '');
  const [dressCode, setDressCode] = useState(DRESS_CODES[0]);
  const [transportMode, setTransportMode] = useState(TRANSPORT_MODES[0]);
  const [specialNotes, setSpecialNotes] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const targetProviderGuid = useMemo(() => {
    const rawId = provider.providerId || (provider as any).id || (provider as any).userId || '';
    return toProviderGuid(rawId);
  }, [provider]);

  const { data: rawSlots = [] } = useGetCompanionAvailabilityQuery(
    targetProviderGuid,
    { skip: !isOpen || !targetProviderGuid }
  );

  const availableSlots = useMemo(() => {
    const now = new Date();
    const active = (rawSlots || []).filter(
      (s: CompanionAvailabilitySlot) => !s.isBooked && new Date(s.endTime) > now
    );
    if (active.length > 0) return active;
    return generateDemoSlots(targetProviderGuid);
  }, [rawSlots, targetProviderGuid]);

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
    for (const [, slots] of map.entries()) {
      slots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }
    return map;
  }, [availableSlots]);

  const slotsForSelectedDate = useMemo(() => {
    return slotsByDate.get(startDate) || [];
  }, [slotsByDate, startDate]);

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

  if (!isOpen) return null;

  // Identity / KYC Guard
  if (!user || !user.isVerified) {
    return (
      <Dialog open={isOpen} onOpenChange={(_, data) => !data.open && onClose()}>
        <DialogSurface className="max-w-md w-full bg-card border border-border rounded-2xl p-6 text-center">
          <DialogBody>
            <DialogTitle>
              <div className="w-14 h-14 rounded-2xl bg-trust-light border border-trust-border text-trust flex items-center justify-center mx-auto mb-2">
                <ShieldCheckmark24Regular />
              </div>
              <span className="text-subtitle1 font-semibold text-foreground block text-center">
                Identity verification required
              </span>
            </DialogTitle>
            <DialogContent className="space-y-2 pt-2 text-center">
              <p className="text-body1 text-muted-foreground">
                Identity verification required to host outings with verified guests. Complete KYC now.
              </p>
              <p className="text-caption1 text-muted-foreground">
                For community trust and member safety, government identity card submission is mandatory before inviting verified guests.
              </p>
            </DialogContent>
            <DialogActions className="pt-4 flex flex-col gap-2">
              <Button
                appearance="primary"
                size="large"
                className="w-full min-h-11"
                icon={<ShieldCheckmark20Regular />}
                onClick={() => {
                  onClose();
                  navigate('/profile?tab=kyc');
                }}
              >
                Verify ID
              </Button>
              <Button
                appearance="secondary"
                size="large"
                className="w-full min-h-11"
                onClick={onClose}
              >
                Back
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    );
  }

  const subtotal = durationHours * provider.hourlyRate;
  const totalAmount = subtotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMsg('');

    const finalVenue = meetingVenue.trim() || getSuggestedVenues(activity)[0] || 'Central Public Venue';

    if (slotsForSelectedDate.length === 0) {
      setErrorMsg('Guest has no availability on this date. Please pick another date.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onProceedToPayment({
        activity,
        startDate,
        startTime,
        durationHours,
        meetingVenue: finalVenue,
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
    <Dialog open={isOpen} onOpenChange={(_, data) => !data.open && onClose()}>
      <DialogSurface className="max-w-2xl w-full bg-card border border-border rounded-2xl p-6 max-h-[92vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <DialogTitle
              action={
                <Button
                  appearance="subtle"
                  aria-label="Close booking dialog"
                  icon={<Dismiss20Regular />}
                  onClick={onClose}
                />
              }
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={
                    provider.photoUrl ??
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                  }
                  alt={provider.displayName}
                  className="w-12 h-12 rounded-lg object-cover border border-border shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span id="booking-sheet-title" className="text-subtitle1 font-semibold text-foreground truncate">
                      Host an outing: {provider.displayName}
                    </span>
                    <CheckmarkStarburst16Filled className="text-trust shrink-0" title="Verified Guest" />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-caption1 font-normal">
                    <span className="font-mono tabular font-semibold text-brand-fg">
                      {formatRate(provider.hourlyRate)}
                    </span>
                    <span className="text-border">•</span>
                    <span className="text-muted-foreground truncate">
                      {provider.area || provider.city || 'Central City Hub'}
                    </span>
                  </div>
                </div>
              </div>
            </DialogTitle>

            <DialogContent className="space-y-5 pt-4">
              {/* 2-Step Hospitality Journey Progress */}
              <div className="px-4 py-2.5 rounded-lg bg-accent-light border border-border flex items-center justify-between text-caption1">
                <div className="flex items-center gap-2">
                  <Badge appearance="filled" color="brand" className="tabular">
                    1
                  </Badge>
                  <span className="font-semibold text-foreground">Step 1: Outing details & venue</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <span>Step 2:</span>
                  <span className="inline-flex items-center gap-1 text-trust font-semibold">
                    <ShieldCheckmark16Regular />
                    <span>100% escrow hold</span>
                  </span>
                </div>
              </div>

              {errorMsg && (
                <MessageBar intent="error">
                  <MessageBarBody>{errorMsg}</MessageBarBody>
                </MessageBar>
              )}

              {/* Section 1: Activity Selection */}
              <div className="space-y-2">
                <label className="block text-caption1 font-semibold text-muted-foreground">
                  1. Choose activity / experience
                </label>
                <div className="flex flex-wrap gap-2">
                  {provider.specialties.slice(0, 5).map((spec) => {
                    const isSelected = activity === spec;
                    return (
                      <ToggleButton
                        key={spec}
                        size="medium"
                        checked={isSelected}
                        appearance={isSelected ? 'primary' : 'outline'}
                        onClick={() => setActivity(spec)}
                        className="min-h-11"
                      >
                        {spec}
                      </ToggleButton>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Date & Duration Selector */}
              <div className="space-y-4 pt-3 border-t border-border">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-caption1 font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Calendar16Regular className="text-brand-fg" />
                      <span>2. Outing date</span>
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      min={defaultDateStr}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-2.5 py-1 rounded-md border border-border bg-card text-foreground text-caption1 font-mono tabular cursor-pointer"
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
                          className={`min-h-12 p-2 rounded-lg border text-center transition-colors cursor-pointer flex flex-col items-center justify-center ${
                            isSelected
                              ? 'border-accent bg-accent text-accent-foreground shadow-sm'
                              : 'border-border bg-card hover:bg-muted text-foreground'
                          }`}
                        >
                          <span className={`text-caption2 font-semibold ${isSelected ? 'text-accent-foreground/80' : 'text-muted-foreground'}`}>
                            {opt.weekday}
                          </span>
                          <span className="text-caption1 font-semibold font-mono tabular">
                            {opt.label}
                          </span>
                          {opt.openSlots > 0 ? (
                            <span className={`text-caption2 font-mono tabular ${isSelected ? 'text-accent-foreground/90' : 'text-success'}`}>
                              {opt.openSlots} open
                            </span>
                          ) : (
                            <span className={`text-caption2 ${isSelected ? 'text-accent-foreground/70' : 'text-muted-foreground'}`}>
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
                    <label className="text-caption1 font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Clock16Regular className="text-brand-fg" />
                      <span>3. Outing duration</span>
                    </label>
                    <span className="font-mono text-caption1 font-semibold text-brand-fg tabular">
                      {formatINR(provider.hourlyRate)} × {durationHours}h = {formatINR(subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {DURATION_PRESETS.map((hrs) => {
                      const isSelected = durationHours === hrs;
                      return (
                        <ToggleButton
                          key={hrs}
                          size="medium"
                          checked={isSelected}
                          appearance={isSelected ? 'primary' : 'outline'}
                          onClick={() => setDurationHours(hrs)}
                          className="flex-1 min-h-11 font-mono tabular"
                        >
                          {hrs} {hrs === 1 ? 'hour' : 'hours'}
                        </ToggleButton>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Section 3: Visual Day Availability Timeline */}
              <div>
                <DayAvailabilityTimeline
                  availableSlots={slotsForSelectedDate}
                  durationHours={durationHours}
                  selectedStartTime={startTime}
                  onSelectStartTime={(newTime) => setStartTime(newTime)}
                  selectedDateKey={startDate}
                />
              </div>

              {/* Section 4: Public Meeting Venue */}
              <div className="space-y-2 pt-3 border-t border-border">
                <Field
                  label="4. Public meeting venue"
                  required
                  hint="Tap any popular spot below or enter a custom public venue"
                >
                  <Input
                    value={meetingVenue}
                    onChange={(_, data) => setMeetingVenue(data.value)}
                    placeholder="e.g. Blue Tokai Coffee, Indiranagar / Cubbon Park Gate 2"
                    contentBefore={<Location16Regular className="text-brand-fg" />}
                    required
                  />
                </Field>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {getSuggestedVenues(activity).map((v) => (
                    <ToggleButton
                      key={v}
                      size="small"
                      checked={meetingVenue === v}
                      appearance={meetingVenue === v ? 'primary' : 'subtle'}
                      icon={<Location16Regular />}
                      onClick={() => setMeetingVenue(v)}
                    >
                      {v}
                    </ToggleButton>
                  ))}
                </div>
              </div>

              {/* Optional Preferences Accordion */}
              <div className="rounded-lg border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowPreferences(!showPreferences)}
                  className="w-full p-3.5 bg-muted hover:bg-subtle transition-colors flex items-center justify-between text-caption1 font-semibold text-foreground cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Options16Regular className="text-brand-fg" />
                    <span>Optional dress code & notes</span>
                  </div>
                  {showPreferences ? (
                    <ChevronUp16Regular className="text-muted-foreground" />
                  ) : (
                    <ChevronDown16Regular className="text-muted-foreground" />
                  )}
                </button>

                {showPreferences && (
                  <div className="p-4 space-y-3 bg-card border-t border-border text-caption1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-caption1 font-semibold text-muted-foreground mb-1">
                          Attire / dress code
                        </label>
                        <select
                          value={dressCode}
                          onChange={(e) => setDressCode(e.target.value)}
                          className="w-full px-3 py-2 min-h-11 rounded-md border border-border bg-card text-foreground text-caption1"
                        >
                          {DRESS_CODES.map((dc) => (
                            <option key={dc} value={dc}>{dc}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-caption1 font-semibold text-muted-foreground mb-1">
                          Travel / logistics
                        </label>
                        <select
                          value={transportMode}
                          onChange={(e) => setTransportMode(e.target.value)}
                          className="w-full px-3 py-2 min-h-11 rounded-md border border-border bg-card text-foreground text-caption1"
                        >
                          {TRANSPORT_MODES.map((tm) => (
                            <option key={tm} value={tm}>{tm}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <Field label="Special activity notes">
                      <Input
                        value={specialNotes}
                        onChange={(_, data) => setSpecialNotes(data.value)}
                        placeholder="e.g. Please bring comfortable walking shoes / beginner tennis player"
                      />
                    </Field>
                  </div>
                )}
              </div>

              {/* Section 5: Trust Reassurance & Escrow Vault Total */}
              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-lg bg-trust-light border border-trust-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-card border border-trust-border flex items-center justify-center text-trust shrink-0">
                      <ShieldCheckmark24Regular />
                    </div>
                    <div>
                      <span className="text-body1 font-semibold text-foreground block">
                        100% escrow protection
                      </span>
                      <span className="text-caption1 text-muted-foreground block tabular">
                        {durationHours} hrs × {formatRate(provider.hourlyRate)} • Held until mutual PIN check-in
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-caption1 font-semibold text-trust block">Total deposit</span>
                    <span className="font-mono text-subtitle1 font-semibold text-foreground tabular">
                      {formatINR(totalAmount)}
                    </span>
                  </div>
                </div>

                <p className="text-caption1 text-muted-foreground text-center px-2">
                  By confirming, you agree to Cue&apos;s <strong>Platonic Outing Policy</strong> and public venue safety rules. Funds are released only after mutual session completion.
                </p>
              </div>
            </DialogContent>

            <DialogActions className="pt-4">
              <Button
                appearance="secondary"
                size="large"
                className="min-h-11"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                appearance="primary"
                size="large"
                className="min-h-11 tabular"
                disabled={isSubmitting || slotsForSelectedDate.length === 0}
                icon={isSubmitting ? <Spinner size="tiny" /> : <ShieldCheckmark20Regular />}
              >
                {isSubmitting ? 'Holding...' : `Hold in escrow • ${formatINR(totalAmount)}`}
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
};
