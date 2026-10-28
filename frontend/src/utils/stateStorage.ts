/**
 * Resilient State & History Storage Manager
 * Preserves user preferences, draft workflows, navigation history, and telemetry across sessions.
 */

export interface HistoryEvent {
  id: string;
  type: 'navigation' | 'search' | 'booking_draft' | 'profile_view' | 'system_action';
  title: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

const STORAGE_PREFIX = 'cue_state_v1:';
const HISTORY_STORAGE_KEY = `${STORAGE_PREFIX}history_events`;
const MAX_HISTORY_EVENTS = 50;

/**
 * Safely persists typed state to localStorage with automatic version wrapping and fallback logic.
 */
export function saveState<T>(key: string, value: T, ttlMs?: number): boolean {
  try {
    const fullKey = `${STORAGE_PREFIX}${key}`;
    const payload = {
      version: 1,
      timestamp: Date.now(),
      expiresAt: ttlMs ? Date.now() + ttlMs : null,
      data: value,
    };
    localStorage.setItem(fullKey, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.warn(`[stateStorage] Failed to save state for key "${key}":`, error);
    return false;
  }
}

/**
 * Safely retrieves typed state from localStorage with expiration and corruption fallbacks.
 */
export function loadState<T>(key: string, fallback: T): T {
  try {
    const fullKey = `${STORAGE_PREFIX}${key}`;
    const raw = localStorage.getItem(fullKey);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return fallback;

    // Check TTL expiration
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      localStorage.removeItem(fullKey);
      return fallback;
    }

    return (parsed.data as T) ?? fallback;
  } catch (error) {
    console.warn(`[stateStorage] Corrupted state for key "${key}", reverting to fallback:`, error);
    return fallback;
  }
}

/**
 * Removes a specific state item.
 */
export function removeState(key: string): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch {
    // ignore
  }
}

/**
 * Records an immutable user history event to a rolling buffer (capped at MAX_HISTORY_EVENTS).
 */
export function recordHistoryEvent(
  type: HistoryEvent['type'],
  title: string,
  metadata?: Record<string, unknown>
): void {
  try {
    const existing = getHistoryEvents();
    const newEvent: HistoryEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type,
      title,
      timestamp: Date.now(),
      metadata,
    };

    const updated = [newEvent, ...existing].slice(0, MAX_HISTORY_EVENTS);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn('[stateStorage] Failed to record history event:', error);
  }
}

/**
 * Retrieves the chronological list of user history events across sessions.
 */
export function getHistoryEvents(): HistoryEvent[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Clears recorded history events.
 */
export function clearHistoryEvents(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch {
    // ignore
  }
}

