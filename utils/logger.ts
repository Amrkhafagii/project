type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
}

class Logger {
  private isDevelopment = __DEV__;

  private log(level: LogLevel, message: string, data?: any) {
    if (!this.isDevelopment && level === 'debug') {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    switch (level) {
      case 'info':
        console.log(`[INFO] ${message}`, data || '');
        break;
      case 'warn':
        console.warn(`[WARN] ${message}`, data || '');
        break;
      case 'error':
        console.error(`[ERROR] ${message}`, data || '');
        break;
      case 'debug':
        console.log(`[DEBUG] ${message}`, data || '');
        break;
    }
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

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }
}

export const logger = new Logger();
