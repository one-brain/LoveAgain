import React, { useMemo } from 'react';
import { ToggleButton, MessageBar, MessageBarBody } from '@fluentui/react-components';
import { Clock16Regular, CheckmarkCircle16Regular } from '@fluentui/react-icons';
import type { CompanionAvailabilitySlot } from '../../store/bookingApi';

interface DayAvailabilityTimelineProps {
  availableSlots: CompanionAvailabilitySlot[];
  durationHours: number;
  selectedStartTime: string; // "HH:mm"
  onSelectStartTime: (timeStr: string, slot: CompanionAvailabilitySlot) => void;
  selectedDateKey: string; // "YYYY-MM-DD"
}

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

  const visualSlotSegments = useMemo(() => {
    return availableSlots.map((slot) => {
      const startMin = parseIsoToDayMinutes(slot.startTime);
      const endMin = parseIsoToDayMinutes(slot.endTime);

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

  const validStartOptions = useMemo(() => {
    const requiredMinutes = durationHours * 60;
    const options: { timeStr: string; minutes: number; slot: CompanionAvailabilitySlot }[] = [];
    const seenTimes = new Set<string>();

    for (const slot of availableSlots) {
      const sMin = parseIsoToDayMinutes(slot.startTime);
      const eMin = parseIsoToDayMinutes(slot.endTime);

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
    <div className="space-y-3.5 p-4 rounded-2xl bg-card border border-border shadow-sm">
      {/* Header with status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Clock16Regular className="text-brand-fg" />
          <span className="font-semibold text-body1 text-foreground">
            Companion availability timeline
          </span>
          {selectedDateKey && (
            <span className="hidden sm:inline-block text-caption1 font-mono tabular text-muted-foreground">
              ({selectedDateKey})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-caption1 font-mono tabular">
          <span className="inline-flex items-center gap-1 text-success font-semibold">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span>Open windows</span>
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-border-strong" />
            <span>Unavailable</span>
          </span>
        </div>
      </div>

      {/* Visual Timeline Bar */}
      <div className="space-y-1.5">
        <div className="relative w-full h-8 rounded-lg bg-muted border border-border overflow-hidden">
          <div className="absolute inset-0 flex justify-between px-2 pointer-events-none opacity-20">
            {Array.from({ length: TOTAL_TIMELINE_HOURS + 1 }).map((_, i) => (
              <div key={i} className="h-full w-px bg-foreground" />
            ))}
          </div>

          {visualSlotSegments.map(({ slot, leftPercent, widthPercent }, idx) => (
            <div
              key={slot.slotId || idx}
              style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
              className="absolute top-1 bottom-1 rounded bg-success-light border border-success transition-all flex items-center justify-center overflow-hidden"
              title={`Available: ${formatMinutesTo12h(parseIsoToDayMinutes(slot.startTime))} – ${formatMinutesTo12h(parseIsoToDayMinutes(slot.endTime))}`}
            >
              <span className="text-caption2 font-mono font-semibold text-success truncate px-1">
                Open
              </span>
            </div>
          ))}

          {selectedWindowVisual && !durationExceeds && (
            <div
              style={{
                left: `${selectedWindowVisual.leftPercent}%`,
                width: `${selectedWindowVisual.widthPercent}%`,
              }}
              className="absolute top-0.5 bottom-0.5 rounded bg-accent text-accent-foreground shadow-sm transition-all flex items-center justify-center z-10"
            >
              <span className="text-caption2 font-mono tabular font-semibold truncate px-1">
                {durationHours}h outing
              </span>
            </div>
          )}
        </div>

        {/* Timeline Hour Labels */}
        <div className="flex justify-between text-caption2 font-mono text-muted-foreground tabular px-1">
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
        <div className="p-3 rounded-lg bg-muted border border-border text-center text-caption1 text-muted-foreground">
          No open availability windows published for this date. Please select another date.
        </div>
      ) : durationExceeds ? (
        <MessageBar intent="warning">
          <MessageBarBody>
            The companion&apos;s maximum continuous open window on this date is{' '}
            <strong className="font-mono tabular">{maxSlotDuration} hours</strong>. Reduce your selected duration or pick another date to book {durationHours} hours.
          </MessageBarBody>
        </MessageBar>
      ) : (
        <div className="space-y-2 pt-1">
          <span className="text-caption1 font-semibold text-muted-foreground block tabular">
            Select start time ({durationHours} hr session):
          </span>
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
            {validStartOptions.map(({ timeStr, minutes, slot }) => {
              const isSelected = selectedStartTime === timeStr;
              const formattedLabel = formatMinutesTo12h(minutes);
              const endFormatted = formatMinutesTo12h(minutes + durationHours * 60);

              return (
                <ToggleButton
                  key={timeStr}
                  size="medium"
                  checked={isSelected}
                  appearance={isSelected ? 'primary' : 'subtle'}
                  onClick={() => onSelectStartTime(timeStr, slot)}
                  className="min-h-11 font-mono tabular"
                >
                  <span>{formattedLabel}</span>
                  <span className="ml-1 text-caption2 opacity-80">
                    → {endFormatted}
                  </span>
                </ToggleButton>
              );
            })}
          </div>

          {selectedStartTime && (
            <div className="mt-2 p-2.5 rounded-lg bg-accent-light border border-border flex items-center justify-between text-caption1">
              <div className="flex items-center gap-1.5 text-brand-fg font-semibold">
                <CheckmarkCircle16Regular className="shrink-0" />
                <span>
                  Locked interval: <strong className="font-mono tabular">{formatMinutesTo12h(timeStringToMinutes(selectedStartTime))}</strong> to{' '}
                  <strong className="font-mono tabular">{formatMinutesTo12h(timeStringToMinutes(selectedStartTime) + durationHours * 60)}</strong>
                </span>
              </div>
              <span className="font-mono tabular text-caption1 font-semibold text-muted-foreground">
                {durationHours} hrs confirmed
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
