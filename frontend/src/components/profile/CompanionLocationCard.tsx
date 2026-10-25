import React, { useState } from 'react';
import {
  MapPinIcon,
  GlobeAmericasIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import {
  INDIAN_METRO_HUBS,
  resolveNearestHub,
  getCurrentCoordinates,
} from '../../utils/location';
import { useUpdateProviderLocationMutation } from '../../store/api';

interface CompanionLocationCardProps {
  currentLatitude?: number | null;
  currentLongitude?: number | null;
  currentMaxRadiusKm?: number;
  onLocationUpdated?: (lat: number, lon: number, radiusKm: number) => void;
}

export const CompanionLocationCard: React.FC<CompanionLocationCardProps> = ({
  currentLatitude,
  currentLongitude,
  currentMaxRadiusKm = 25,
  onLocationUpdated,
}) => {
  const [updateLocation, { isLoading: isUpdating }] = useUpdateProviderLocationMutation();

  const [lat, setLat] = useState<number | null>(currentLatitude ?? null);
  const [lon, setLon] = useState<number | null>(currentLongitude ?? null);
  const [maxRadius, setMaxRadius] = useState<number>(currentMaxRadiusKm || 25);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Derive human-readable hub name
  const activeHubInfo =
    lat != null && lon != null
      ? resolveNearestHub(lat, lon)
      : null;

  const handleDetectGps = async () => {
    setIsDetectingGps(true);
    setStatusMessage(null);
    try {
      const coords = await getCurrentCoordinates();
      setLat(coords.latitude);
      setLon(coords.longitude);

      await updateLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        maxRadiusKm: maxRadius,
      }).unwrap();

      const hub = resolveNearestHub(coords.latitude, coords.longitude);
      setStatusMessage({
        type: 'success',
        text: `Base location updated to ${hub.hubName} (GPS).`,
      });
      onLocationUpdated?.(coords.latitude, coords.longitude, maxRadius);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Could not detect your GPS location. Please choose a city hub below.',
      });
    } finally {
      setIsDetectingGps(false);
    }
  };

  const handleSelectHub = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const hubId = e.target.value;
    if (!hubId) return;

    const selected = INDIAN_METRO_HUBS.find((h) => h.id === hubId);
    if (!selected) return;

    setLat(selected.latitude);
    setLon(selected.longitude);
    setStatusMessage(null);

    try {
      await updateLocation({
        latitude: selected.latitude,
        longitude: selected.longitude,
        maxRadiusKm: maxRadius,
      }).unwrap();

      setStatusMessage({
        type: 'success',
        text: `Relocated to ${selected.area}, ${selected.city}.`,
      });
      onLocationUpdated?.(selected.latitude, selected.longitude, maxRadius);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.data?.error || 'Failed to update location. Please try again.',
      });
    }
  };

  const handleRadiusChange = async (newRadius: number) => {
    setMaxRadius(newRadius);
    if (lat != null && lon != null) {
      try {
        await updateLocation({
          latitude: lat,
          longitude: lon,
          maxRadiusKm: newRadius,
        }).unwrap();
        onLocationUpdated?.(lat, lon, newRadius);
      } catch {
        // silently handled
      }
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-accent/10 text-accent">
              <MapPinIcon className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-foreground">Base Location & Service Area</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Update your operational base anytime. Seekers will discover you based on your proximity.
          </p>
        </div>

        {/* Current status pill */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-full bg-muted/60 border border-border text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-foreground">
            {activeHubInfo ? activeHubInfo.hubName : 'Bengaluru (Default)'}
          </span>
        </div>
      </div>

      {/* Coordinate & Area Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-background border border-border space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
            Active Operating Center
          </span>
          <div className="text-sm font-semibold text-foreground flex items-center gap-2">
            <GlobeAmericasIcon className="w-4 h-4 text-accent" />
            <span>
              {activeHubInfo
                ? `${activeHubInfo.area}, ${activeHubInfo.city}`
                : 'Not Set (Set your location below)'}
            </span>
          </div>
          {lat != null && lon != null && (
            <p className="text-xs text-muted-foreground tabular-nums">
              Coordinates: {lat.toFixed(4)}° N, {lon.toFixed(4)}° E
            </p>
          )}
        </div>

        <div className="p-4 rounded-xl bg-background border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Maximum Travel Radius
            </span>
            <span className="text-xs font-bold text-accent tabular-nums">{maxRadius} km</span>
          </div>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={maxRadius}
            onChange={(e) => handleRadiusChange(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
          />
          <p className="text-[11px] text-muted-foreground">
            Seekers within {maxRadius} km of your base will find you in nearby discovery.
          </p>
        </div>
      </div>

      {/* Action Controls: GPS vs Quick City Hub Selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleDetectGps}
          disabled={isDetectingGps || isUpdating}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-xs transition hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
        >
          {isDetectingGps ? (
            <>
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
              <span>Detecting GPS Location...</span>
            </>
          ) : (
            <>
              <MapPinIcon className="w-4 h-4" />
              <span>Use My Device GPS (Instant)</span>
            </>
          )}
        </button>

        <div className="flex-1 relative">
          <select
            defaultValue=""
            onChange={handleSelectHub}
            disabled={isUpdating}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-1 focus:ring-accent appearance-none pr-8 cursor-pointer"
          >
            <option value="" disabled>
              Select Metro Hub / Travel Relocation...
            </option>
            {INDIAN_METRO_HUBS.map((hub) => (
              <option key={hub.id} value={hub.id}>
                {hub.city} — {hub.area}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-muted-foreground">
            <GlobeAmericasIcon className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Notifications / Toast */}
      {statusMessage && (
        <div
          className={`flex items-start gap-2 p-3 rounded-xl text-xs font-medium ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <InformationCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}
    </div>
  );
};

