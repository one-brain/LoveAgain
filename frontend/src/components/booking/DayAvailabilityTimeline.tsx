import React, { useMemo } from 'react';
import { ClockIcon, SparklesIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import type { CompanionAvailabilitySlot } from '../../store/bookingApi';

interface DayAvailabilityTimelineProps {
  availableSlots: CompanionAvailabilitySlot[];
  durationHours: number;
  selectedStartTime: string; // "HH:mm"
  onSelectStartTime: (timeStr: string, slot: CompanionAvailabilitySlot) => void;
  selectedDateKey: string; // "YYYY-MM-DD"
}

// Timeline covers typical daytime hours (08:00 to 22:00 = 14 hours total)
const TIMELINE_START_HOUR = 8;
const TIMELINE_END_HOUR = 22;
const TOTAL_TIMELINE_HOURS = TIMELINE_END_HOUR - TIMELINE_START_HOUR;

function parseIsoToDayMinutes(isoStr: string): number {
  const d = new Date(isoStr);
  return d.getHours() * 60 + d.getMinutes();
}

function timeStringToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatMinutesTo12h(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m === 0 ? '00' : String(m).padStart(2, '0');
  return `${displayH}:${displayM} ${ampm}`;
}

export const DayAvailabilityTimeline: React.FC<DayAvailabilityTimelineProps> = ({
  availableSlots,
  durationHours,
  selectedStartTime,
  onSelectStartTime,
  selectedDateKey,
}) => {
  const timelineStartMinutes = TIMELINE_START_HOUR * 60;
  const timelineTotalMinutes = TOTAL_TIMELINE_HOURS * 60;

  // Calculate visual intervals for companion's open slots
  const visualSlotSegments = useMemo(() => {
    return availableSlots.map((slot) => {
      const startMin = parseIsoToDayMinutes(slot.startTime);
      const endMin = parseIsoToDayMinutes(slot.endTime);

      // Clamp within timeline display window
      const clampedStart = Math.max(timelineStartMinutes, Math.min(timelineStartMinutes + timelineTotalMinutes, startMin));
      const clampedEnd = Math.max(timelineStartMinutes, Math.min(timelineStartMinutes + timelineTotalMinutes, endMin));

      const leftPercent = Math.max(0, ((clampedStart - timelineStartMinutes) / timelineTotalMinutes) * 100);
      const widthPercent = Math.max(2, ((clampedEnd - clampedStart) / timelineTotalMinutes) * 100);

      return {
        slot,
        startMin,
        endMin,
        leftPercent,
        widthPercent,
      };
    });
  }, [availableSlots, timelineStartMinutes, timelineTotalMinutes]);

  // Generate valid start-time choices (in 30-min increments) where slot has space for durationHours
  const validStartOptions = useMemo(() => {
    const requiredMinutes = durationHours * 60;
    const options: { timeStr: string; minutes: number; slot: CompanionAvailabilitySlot }[] = [];
    const seenTimes = new Set<string>();

    for (const slot of availableSlots) {
      const sMin = parseIsoToDayMinutes(slot.startTime);
      const eMin = parseIsoToDayMinutes(slot.endTime);

      // Start stepping from slot start rounded up to nearest 30 mins
      let candidate = Math.ceil(sMin / 30) * 30;
      if (candidate < sMin) candidate = sMin;

      while (candidate + requiredMinutes <= eMin) {
        const timeStr = minutesToTimeString(candidate);
        if (!seenTimes.has(timeStr)) {
          seenTimes.add(timeStr);
          options.push({ timeStr, minutes: candidate, slot });
        }
        candidate += 30;
      }
    }

    return options.sort((a, b) => a.minutes - b.minutes);
  }, [availableSlots, durationHours]);

  // Selected window visual highlight
  const selectedWindowVisual = useMemo(() => {
    if (!selectedStartTime) return null;
    const startMin = timeStringToMinutes(selectedStartTime);
    const endMin = startMin + durationHours * 60;

    const clampedStart = Math.max(timelineStartMinutes, Math.min(timelineStartMinutes + timelineTotalMinutes, startMin));
    const clampedEnd = Math.max(timelineStartMinutes, Math.min(timelineStartMinutes + timelineTotalMinutes, endMin));

    const leftPercent = Math.max(0, ((clampedStart - timelineStartMinutes) / timelineTotalMinutes) * 100);
    const widthPercent = Math.max(3, ((clampedEnd - clampedStart) / timelineTotalMinutes) * 100);

    return {
      startMin,
      endMin,
      leftPercent,
      widthPercent,
    };
  }, [selectedStartTime, durationHours, timelineStartMinutes, timelineTotalMinutes]);

  const maxSlotDuration = useMemo(() => {
    if (availableSlots.length === 0) return 0;
    let max = 0;
    for (const s of availableSlots) {
      const dur = (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / (1000 * 3600);
      if (dur > max) max = dur;
    }
    return Math.round(max * 10) / 10;
  }, [availableSlots]);

  const hasNoSlots = availableSlots.length === 0;
  const durationExceeds = !hasNoSlots && validStartOptions.length === 0;

  return (
    <div className="space-y-3.5 p-4 rounded-2xl bg-card border border-border shadow-2xs">
      {/* Header with status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ClockIcon className="w-4 h-4 text-accent" />
          <span className="font-serif font-bold text-xs sm:text-sm text-foreground">
            Companion Availability Timeline
          </span>
          {selectedDateKey && (
            <span className="hidden sm:inline-block text-[11px] font-mono text-muted-foreground">
              ({selectedDateKey})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono tabular-nums">
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Open Windows</span>
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground font-medium">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
            <span>Unavailable</span>
          </span>
        </div>
      </div>

      {/* Visual Timeline Bar */}
      <div className="space-y-1.5">
        <div className="relative w-full h-8 rounded-xl bg-muted/60 border border-border/80 overflow-hidden">
          {/* Base background ticks pattern */}
          <div className="absolute inset-0 flex justify-between px-2 pointer-events-none opacity-20">
            {Array.from({ length: TOTAL_TIMELINE_HOURS + 1 }).map((_, i) => (
              <div key={i} className="h-full w-px bg-foreground/40" />
            ))}
          </div>

          {/* Render Green Available Slot Intervals */}
          {visualSlotSegments.map(({ slot, leftPercent, widthPercent }, idx) => (
            <div
              key={slot.slotId || idx}
              style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
              className="absolute top-1 bottom-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 shadow-2xs transition-all flex items-center justify-center overflow-hidden"
              title={`Available: ${formatMinutesTo12h(parseIsoToDayMinutes(slot.startTime))} – ${formatMinutesTo12h(parseIsoToDayMinutes(slot.endTime))}`}
            >
              <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 opacity-80 truncate px-1">
                Open
              </span>
            </div>
          ))}

          {/* Render Active Selection Window */}
          {selectedWindowVisual && !durationExceeds && (
            <div
              style={{
                left: `${selectedWindowVisual.leftPercent}%`,
                width: `${selectedWindowVisual.widthPercent}%`,
              }}
              className="absolute top-0.5 bottom-0.5 rounded-lg bg-accent/90 border-2 border-accent text-accent-foreground shadow-md transition-all flex items-center justify-center z-10"
            >
              <span className="text-[10px] font-mono font-bold truncate px-1 drop-shadow-xs">
                {durationHours}h outing
              </span>
            </div>
          )}
        </div>

        {/* Timeline Hour Labels */}
        <div className="flex justify-between text-[10px] font-mono text-muted-foreground tabular-nums px-1">
          <span>8 AM</span>
          <span>11 AM</span>
          <span>2 PM</span>
          <span>5 PM</span>
          <span>8 PM</span>
          <span>10 PM</span>
        </div>
      </div>

      {/* Available Start Time Chips / Warning state */}
      {hasNoSlots ? (
        <div className="p-3 rounded-xl bg-muted/50 border border-border/70 text-center text-xs text-muted-foreground">
          No open availability windows published for this date. Please select another date.
        </div>
      ) : durationExceeds ? (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
          <InformationCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            The companion's maximum continuous open window on this date is{' '}
            <strong className="font-mono">{maxSlotDuration} hours</strong>. Reduce your selected duration or pick another date to book {durationHours} hours.
          </span>
        </div>
      ) : (
        <div className="space-y-2 pt-1">
          <span className="text-xs font-semibold text-muted-foreground block">
            Select Start Time ({durationHours} hr session):
          </span>
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
            {validStartOptions.map(({ timeStr, minutes, slot }) => {
              const isSelected = selectedStartTime === timeStr;
              const formattedLabel = formatMinutesTo12h(minutes);
              const endFormatted = formatMinutesTo12h(minutes + durationHours * 60);

              return (
                <button
                  key={timeStr}
                  type="button"
                  onClick={() => onSelectStartTime(timeStr, slot)}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-accent text-accent-foreground font-bold shadow-xs ring-2 ring-accent/40'
                      : 'bg-muted/50 hover:bg-muted text-foreground border border-border hover:border-accent/40'
                  }`}
                >
                  <span className="font-mono tabular-nums">{formattedLabel}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-accent-foreground/80' : 'text-muted-foreground'}`}>
                    &rarr; {endFormatted}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active selection badge */}
          {selectedStartTime && (
            <div className="mt-2 p-2.5 rounded-xl bg-accent/5 border border-accent/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-accent font-medium">
                <SparklesIcon className="w-4 h-4 shrink-0" />
                <span>
                  Locked Interval: <strong className="font-mono">{formatMinutesTo12h(timeStringToMinutes(selectedStartTime))}</strong> to{' '}
                  <strong className="font-mono">{formatMinutesTo12h(timeStringToMinutes(selectedStartTime) + durationHours * 60)}</strong>
                </span>
              </div>
              <span className="font-mono text-[11px] font-bold text-muted-foreground">
                {durationHours} hrs confirmed
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
