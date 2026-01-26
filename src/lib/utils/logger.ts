type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  meta?: object;
  timestamp: string;
}

function createLogEntry(
  level: LogLevel,
  message: string,
  context?: string,
  meta?: object
): LogEntry {
  return {
    level,
    message,
    context,
    meta,
    timestamp: new Date().toISOString(),
  };
}

async function sendToApi(entry: LogEntry): Promise<void> {
  try {
    await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
  } catch (error) {
    console.error('Failed to send log to API:', error);
  }
}

function log(level: LogLevel, message: string, context?: string, meta?: object): void {
  const entry = createLogEntry(level, message, context, meta);

  // Server-side: alleen console
  if (typeof window === 'undefined') {
    console[level](JSON.stringify(entry));
    return;
  }

  // Client-side: console + API
  console[level](message, context, meta);
  sendToApi(entry);
}

export const logger = {
  info: (message: string, context?: string, meta?: object) => log('info', message, context, meta),
  warn: (message: string, context?: string, meta?: object) => log('warn', message, context, meta),
  error: (message: string, context?: string, meta?: object) => log('error', message, context, meta),
  debug: (message: string, context?: string, meta?: object) => log('debug', message, context, meta),
};
