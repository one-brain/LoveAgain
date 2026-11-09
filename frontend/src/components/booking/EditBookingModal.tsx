import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Input,
  Textarea,
  Field,
  TabList,
  Tab,
  ToggleButton,
  Badge,
  MessageBar,
  MessageBarBody,
  Spinner,
} from '@fluentui/react-components';
import {
  Dismiss20Regular,
  ShieldCheckmark20Regular,
  CheckmarkCircle20Regular,
  Calendar16Regular,
  Options16Regular,
  Location16Regular,
  Clock16Regular,
  ArrowRight16Regular,
  ArrowLeft16Regular,
} from '@fluentui/react-icons';
import type { BookingSummary } from '../BookingCard';
import { useUpdateBookingMutation } from '../../store/bookingApi';
import { formatINR } from '../../utils/currency';

interface EditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingSummary | null;
}

const VENUE_SUGGESTIONS = [
  'Specialty Cafe / Coffee Date',
  'Fine Dining / Restaurant Visit',
  'City Mall / Shopping District',
  'Cinema / Multiplex Outing',
  'Scenic Spot / Weekend Activity',
  'Concert / Special Event Gala',
  'Public Park / Garden',
  'Sports Club / Tennis Courts',
];

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
  'Coffee Date & Cafe Chat',
  'Restaurant Visit & Dining',
  'Shopping & Styling Companion',
  'Movies & Cinema Outing',
  'Weekend Activity & Day Out',
  'Special Event & Plus-One',
  'Sports / Tennis Practice',
  'Art Gallery / Museum Tour',
  'City Walk / Mindful Stroll',
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

  if (!isOpen || !booking) return null;

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

  const guestName = booking.providerName || 'Verified Guest';

  return (
    <Dialog open={isOpen} onOpenChange={(_, data) => !data.open && onClose()}>
      <DialogSurface className="max-w-xl w-full bg-card border border-border rounded-2xl p-6 max-h-[92vh] overflow-y-auto">
        <DialogBody>
          <DialogTitle
            action={
              <Button
                appearance="subtle"
                aria-label="Close edit booking dialog"
                icon={<Dismiss20Regular />}
                onClick={onClose}
              />
            }
          >
            <div className="flex items-center gap-3 min-w-0">
              {booking.providerPhoto ? (
                <img
                  src={booking.providerPhoto}
                  alt={guestName}
                  className="w-12 h-12 rounded-lg object-cover border border-border shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-accent-light text-brand-fg text-subtitle1 font-semibold flex items-center justify-center border border-border shrink-0">
                  {guestName.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span id="edit-booking-title" className="text-subtitle1 font-semibold text-foreground truncate">
                    Edit booking: {guestName}
                  </span>
                  <Badge
                    appearance="tint"
                    color={isPendingPayment ? 'warning' : isConfirmed ? 'success' : 'informative'}
                  >
                    {isPendingPayment ? 'Awaiting escrow' : isConfirmed ? 'Escrow confirmed' : booking.status}
                  </Badge>
                </div>
                <p className="text-caption1 font-normal text-muted-foreground truncate tabular">
                  Step {step} of 2: {step === 1 ? 'Schedule & activity' : 'Venue & experience preferences'} • Ref #{booking.orderId.slice(0, 8)}
                </p>
              </div>
            </div>
          </DialogTitle>

          <DialogContent className="space-y-4 pt-4">
            <TabList
              selectedValue={step}
              onTabSelect={(_, data) => setStep(data.value as 1 | 2)}
              className="border-b border-border"
            >
              <Tab value={1} icon={<Calendar16Regular />}>
                1. Schedule & activity
              </Tab>
              <Tab value={2} icon={<Options16Regular />}>
                2. Venue & preferences
              </Tab>
            </TabList>

            {errorMsg && (
              <MessageBar intent="error">
                <MessageBarBody>{errorMsg}</MessageBarBody>
              </MessageBar>
            )}

            {successMsg && (
              <MessageBar intent="success">
                <MessageBarBody>{successMsg}</MessageBarBody>
              </MessageBar>
            )}

            {step === 1 ? (
              <form id="edit-step-1-form" onSubmit={handleStep1Submit} className="space-y-4">
                <div>
                  <label className="block text-caption1 font-semibold text-muted-foreground mb-1.5">
                    Select activity / outing focus
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {POPULAR_ACTIVITIES.map((act) => {
                      const isSelected = activity === act;
                      return (
                        <ToggleButton
                          key={act}
                          size="small"
                          checked={isSelected}
                          appearance={isSelected ? 'primary' : 'outline'}
                          onClick={() => {
                            setActivity(act);
                            setCustomActivity('');
                          }}
                          className="justify-start text-left min-h-11"
                        >
                          {act}
                        </ToggleButton>
                      );
                    })}
                  </div>

                  <div className="mt-2.5">
                    <Input
                      value={customActivity || (POPULAR_ACTIVITIES.some((p) => p.includes(activity)) ? '' : activity)}
                      onChange={(_, data) => {
                        setCustomActivity(data.value);
                        setActivity(data.value);
                      }}
                      placeholder="Or type custom activity (e.g. Badminton practice, Heritage walk)"
                      className="w-full"
                    />
                  </div>
                </div>

                {isPendingPayment ? (
                  <div className="pt-2 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Date" required>
                        <input
                          type="date"
                          value={startDate}
                          min={minDateStr}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-3 py-2 min-h-11 rounded-md border border-border bg-card text-foreground text-caption1 font-mono tabular"
                          required
                        />
                      </Field>

                      <Field label="Start time" required>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full px-3 py-2 min-h-11 rounded-md border border-border bg-card text-foreground text-caption1 font-mono tabular"
                          required
                        />
                      </Field>
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-caption1 font-semibold text-muted-foreground">
                          Duration: <strong className="text-foreground tabular">{durationHours} {durationHours === 1 ? 'hour' : 'hours'}</strong>
                        </span>
                        <span className="text-caption1 font-semibold text-brand-fg font-mono tabular">
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
                      <div className="flex justify-between text-caption2 text-muted-foreground px-1 mt-0.5 font-mono tabular">
                        <span>1 hr</span>
                        <span>2 hrs</span>
                        <span>4 hrs</span>
                        <span>6 hrs</span>
                        <span>8 hrs</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-muted border border-border space-y-1.5">
                    <div className="flex items-center gap-2 text-caption1 font-semibold text-foreground">
                      <Clock16Regular className="text-brand-fg" />
                      <span>Active escrow confirmed schedule</span>
                    </div>
                    <p className="text-caption1 text-muted-foreground">
                      Outing timing is locked under confirmed escrow. You can modify your public venue, dress code, and preferences on Step 2. To reschedule timing, please coordinate with your guest in Chat.
                    </p>
                  </div>
                )}

                <div className="p-3.5 rounded-lg bg-trust-light border border-trust-border flex items-center justify-between text-caption1">
                  <div className="flex items-center gap-2">
                    <ShieldCheckmark20Regular className="text-trust shrink-0" />
                    <span className="text-trust font-semibold">Protected payment (safe escrow)</span>
                  </div>
                  <span className="text-body1 font-semibold font-mono tabular text-foreground">
                    {formatINR(estimatedTotal)}
                  </span>
                </div>

                <DialogActions className="pt-2">
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
                    className="min-h-11"
                    icon={<ArrowRight16Regular />}
                    iconPosition="after"
                  >
                    Next
                  </Button>
                </DialogActions>
              </form>
            ) : (
              <form id="edit-step-2-form" onSubmit={handleFinalSubmit} className="space-y-4">
                <div>
                  <Field
                    label="Public meeting venue / spot"
                    required
                    hint="Always specify public spaces (cafes, malls, lounges, parks) for verified safety."
                  >
                    <Input
                      value={meetingVenue}
                      onChange={(_, data) => setMeetingVenue(data.value)}
                      placeholder="e.g. Third Wave Coffee, Koramangala / Cubbon Park Gate 2"
                      contentBefore={<Location16Regular className="text-brand-fg" />}
                      required
                    />
                  </Field>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {VENUE_SUGGESTIONS.map((v) => (
                      <ToggleButton
                        key={v}
                        size="small"
                        checked={meetingVenue === v}
                        appearance={meetingVenue === v ? 'primary' : 'subtle'}
                        onClick={() => setMeetingVenue(v)}
                      >
                        {v}
                      </ToggleButton>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
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
                      Logistics / transport
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-caption1 font-semibold text-muted-foreground mb-1">
                      Food / diet preference
                    </label>
                    <select
                      value={dietPreference}
                      onChange={(e) => setDietPreference(e.target.value)}
                      className="w-full px-3 py-2 min-h-11 rounded-md border border-border bg-card text-foreground text-caption1"
                    >
                      {DIET_PREFERENCES.map((dp) => (
                        <option key={dp} value={dp}>{dp}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-caption1 font-semibold text-muted-foreground mb-1">
                      Preferred language
                    </label>
                    <select
                      value={languagePreference}
                      onChange={(e) => setLanguagePreference(e.target.value)}
                      className="w-full px-3 py-2 min-h-11 rounded-md border border-border bg-card text-foreground text-caption1"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Field label="Equipment / gear required (optional)">
                  <Input
                    value={equipmentGear}
                    onChange={(_, data) => setEquipmentGear(data.value)}
                    placeholder="e.g. Bring own tennis racket, running shoes, camera"
                  />
                </Field>

                <Field label="Special notes / conversation topics">
                  <Textarea
                    rows={2}
                    value={specialNotes}
                    onChange={(_, data) => setSpecialNotes(data.value)}
                    placeholder="Share any special instructions, preferences, or conversation topics..."
                  />
                </Field>

                <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                  <div>
                    <span className="text-caption2 text-muted-foreground font-semibold block">
                      Total escrow
                    </span>
                    <span className="text-subtitle2 font-semibold font-mono tabular text-foreground">
                      {formatINR(estimatedTotal)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      appearance="secondary"
                      size="large"
                      className="min-h-11"
                      icon={<ArrowLeft16Regular />}
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>

                    <Button
                      type="submit"
                      appearance="primary"
                      size="large"
                      className="min-h-11"
                      disabled={isUpdating}
                      icon={isUpdating ? <Spinner size="tiny" /> : <CheckmarkCircle20Regular />}
                    >
                      {isUpdating ? 'Saving...' : 'Save changes'}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
