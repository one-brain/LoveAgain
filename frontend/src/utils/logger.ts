/**
 * Production-Grade Structured Client-Side Logger and Telemetry Sink.
 * Logs failures for review, buffers recent errors, and attaches correlation IDs.
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface StructuredLogEntry {
  id: string;
  level: LogLevel;
  message: string;
  context?: string;
  error?: {
    name?: string;
    message?: string;
    stack?: string;
  };
  metadata?: Record<string, unknown>;
  timestamp: string;
  url: string;
  userAgent: string;
  userId?: string | null;
}

const ERROR_BUFFER_KEY = 'cue_error_logs';
const MAX_LOG_ENTRIES = 50;

class StructuredLogger {
  private buffer: StructuredLogEntry[] = [];

  constructor() {
    this.loadBuffer();
  }

  private loadBuffer(): void {
    try {
      const raw = localStorage.getItem(ERROR_BUFFER_KEY);
      if (raw) {
        this.buffer = JSON.parse(raw);
      }
    } catch {
      this.buffer = [];
    }
  }

  private persistBuffer(): void {
    try {
      localStorage.setItem(ERROR_BUFFER_KEY, JSON.stringify(this.buffer.slice(0, MAX_LOG_ENTRIES)));
    } catch {
      // ignore storage quota issues
    }
  }

  private createEntry(
    level: LogLevel,
    message: string,
    context?: string,
    error?: Error | unknown,
    metadata?: Record<string, unknown>
  ): StructuredLogEntry {
    let errorDetails: StructuredLogEntry['error'];
    if (error instanceof Error) {
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (error && typeof error === 'object') {
      errorDetails = {
        message: JSON.stringify(error),
      };
    }

    let userId: string | null = null;
    try {
      userId = localStorage.getItem('userId');
      if (!userId) {
        const rawUser = localStorage.getItem('user');
        if (rawUser) userId = JSON.parse(rawUser)?.id;
      }
    } catch {
      // ignore
    }

    return {
      id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      level,
      message,
      context,
      error: errorDetails,
      metadata,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      userId,
    };
  }

  public debug(message: string, context?: string, metadata?: Record<string, unknown>): void {
    const entry = this.createEntry('DEBUG', message, context, undefined, metadata);
    if (import.meta.env.DEV) {
      console.debug(`[${entry.timestamp}] [${context || 'App'}]`, message, metadata);
    }
  }

  public info(message: string, context?: string, metadata?: Record<string, unknown>): void {
    const entry = this.createEntry('INFO', message, context, undefined, metadata);
    console.info(`[${entry.timestamp}] [${context || 'App'}]`, message);
  }

  public warn(message: string, context?: string, metadata?: Record<string, unknown>): void {
    const entry = this.createEntry('WARN', message, context, undefined, metadata);
    console.warn(`[${entry.timestamp}] [${context || 'App'}]`, message, metadata);
  }

  public error(message: string, context?: string, error?: Error | unknown, metadata?: Record<string, unknown>): string {
    const entry = this.createEntry('ERROR', message, context, error, metadata);
    console.error(`[${entry.timestamp}] [${context || 'App'}]`, message, error, metadata);

    this.buffer.unshift(entry);
    if (this.buffer.length > MAX_LOG_ENTRIES) {
      this.buffer.pop();
    }
    this.persistBuffer();

    return entry.id;
  }

  public getRecentLogs(): StructuredLogEntry[] {
    return [...this.buffer];
  }

  public clearLogs(): void {
    this.buffer = [];
    try {
      localStorage.removeItem(ERROR_BUFFER_KEY);
    } catch {
      // ignore
    }
  }
}

export const logger = new StructuredLogger();

