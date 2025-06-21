type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: Date;
}

class Logger {
  private isDevelopment = __DEV__;

  private log(level: LogLevel, message: string, data?: any) {
    if (!this.isDevelopment && level === 'debug') {
      return;
    }

    const logEntry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date(),
    };

    const consoleMethod = level === 'error' ? console.error : console.log;
    consoleMethod(`[${level.toUpperCase()}] ${message}`, data || '');

    // In production, you might want to send logs to a service
    if (!this.isDevelopment) {
      // TODO: Send to logging service
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
}

export const logger = new Logger();
