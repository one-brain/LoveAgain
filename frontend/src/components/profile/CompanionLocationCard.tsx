import React, { useState } from 'react';
import {
  Button,
  Card,
  Badge,
  Dropdown,
  Option,
  Field,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components';
import {
  Location20Regular,
  Globe20Regular,
  ArrowSync20Regular,
} from '@fluentui/react-icons';
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
  const [selectedHubId, setSelectedHubId] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const activeHubInfo = lat != null && lon != null ? resolveNearestHub(lat, lon) : null;

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

  const handleSelectHubById = async (hubId: string) => {
    if (!hubId) return;
    setSelectedHubId(hubId);

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

  const selectedHubObj = INDIAN_METRO_HUBS.find((h) => h.id === selectedHubId);

  return (
    <Card className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-accent-light text-brand-fg">
              <Location20Regular />
            </span>
            <h3 className="text-subtitle2 font-semibold text-foreground">Base location & service area</h3>
          </div>
          <p className="text-caption1 text-muted-foreground mt-1">
            Update your operational base anytime. Seekers will discover you based on your proximity.
          </p>
        </div>

        <Badge appearance="tint" color="success" className="self-start sm:self-auto">
          {activeHubInfo ? activeHubInfo.hubName : 'Bengaluru (Default)'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-background border border-border space-y-2">
          <span className="text-caption1 font-semibold text-muted-foreground block">
            Active operating center
          </span>
          <div className="text-body1 font-semibold text-foreground flex items-center gap-2">
            <Globe20Regular className="text-brand-fg" />
            <span>
              {activeHubInfo
                ? `${activeHubInfo.area}, ${activeHubInfo.city}`
                : 'Not set (set your location below)'}
            </span>
          </div>
          {lat != null && lon != null && (
            <p className="text-caption1 text-muted-foreground tabular">
              Coordinates: {lat.toFixed(4)}° N, {lon.toFixed(4)}° E
            </p>
          )}
        </div>

        <div className="p-4 rounded-lg bg-background border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-caption1 font-semibold text-muted-foreground">
              Maximum travel radius
            </span>
            <span className="text-caption1 font-semibold text-brand-fg tabular">{maxRadius} km</span>
          </div>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={maxRadius}
            onChange={(e) => handleRadiusChange(Number(e.target.value))}
            aria-label="Maximum travel radius in kilometers"
            className="w-full h-2 bg-muted rounded-md appearance-none cursor-pointer accent-accent"
          />
          <p className="text-caption1 text-muted-foreground">
            Seekers within <span className="tabular">{maxRadius} km</span> of your base will find you in nearby discovery.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 pt-2">
        <Button
          appearance="primary"
          icon={isDetectingGps ? <ArrowSync20Regular className="animate-spin" /> : <Location20Regular />}
          onClick={handleDetectGps}
          disabled={isDetectingGps || isUpdating}
          className="flex-1 min-h-11"
        >
          {isDetectingGps ? 'Detecting GPS location...' : 'Use my device GPS'}
        </Button>

        <div className="flex-1">
          <Field label="Metro hub / travel relocation">
            <Dropdown
              placeholder="Select metro hub..."
              disabled={isUpdating}
              value={selectedHubObj ? `${selectedHubObj.city} — ${selectedHubObj.area}` : ''}
              selectedOptions={selectedHubId ? [selectedHubId] : []}
              onOptionSelect={(_e, data) => {
                if (data.optionValue) {
                  handleSelectHubById(data.optionValue);
                }
              }}
            >
              {INDIAN_METRO_HUBS.map((hub) => (
                <Option key={hub.id} value={hub.id} text={`${hub.city} — ${hub.area}`}>
                  {hub.city} — {hub.area}
                </Option>
              ))}
            </Dropdown>
          </Field>
        </div>
      </div>

      {statusMessage && (
        <MessageBar intent={statusMessage.type === 'success' ? 'success' : 'error'}>
          <MessageBarBody>{statusMessage.text}</MessageBarBody>
        </MessageBar>
      )}
    </Card>
  );
};
