import { Platform } from 'react-native';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  error?: Error;
}

/**
 * Simple logger utility for consistent logging across the app
 * In production, this would send logs to a remote service
 */
class Logger {
  private isDevelopment = __DEV__;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private log(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
    };

    // Store log entry
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output in development
    if (this.isDevelopment) {
      const prefix = `[${level.toUpperCase()}] ${entry.timestamp}`;
      const logData = data ? { message, ...data } : message;

      switch (level) {
        case 'debug':
          console.log(prefix, logData);
          break;
        case 'info':
          console.info(prefix, logData);
          break;
        case 'warn':
          console.warn(prefix, logData);
          break;
        case 'error':
          console.error(prefix, logData);
          break;
      }
    }

    // In production, send to remote logging service
    if (!this.isDevelopment && level === 'error') {
      this.sendToRemote(entry);
    }
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  private async sendToRemote(entry: LogEntry) {
    // Implement remote logging service integration
    // Example: Sentry, LogRocket, etc.
    try {
      // await remoteLogger.log(entry);
    } catch (error) {
      // Fail silently to avoid infinite loop
    }
  }
}

export const logger = new Logger();
