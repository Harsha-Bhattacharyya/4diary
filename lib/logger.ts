/**
 * Copyright © 2025 Harsha Bhattacharyya
 * 
 * This file is part of 4diary.
 * 
 * SPDX-License-Identifier: BSD-3-Clause
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the conditions in the LICENSE file are met.
 */

import 'server-only';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Privacy-friendly logging system for self-hosters
 * 
 * Features:
 * - Configurable log levels (DEBUG, INFO, WARN, ERROR)
 * - Automatic PII sanitization
 * - File-based logging with automatic rotation
 * - Separate log files by level (app.log, error.log)
 * - Structured JSON logging for easy parsing
 * - Environment-based configuration
 * - Zero external dependencies
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

export interface LogEntry {
  timestamp: string;
  level: string;
  category: string;
  message: string;
  metadata?: Record<string, unknown>;
  requestId?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  logDir: string;
  maxFileSize: number; // in bytes
  maxFiles: number;
  enableStructuredLogs: boolean;
  sanitizePII: boolean;
  redactPatterns: RegExp[];
  allowedMetadataFields: string[];
}

// PII patterns to redact
const DEFAULT_PII_PATTERNS: RegExp[] = [
  // Email addresses
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  // IP addresses (IPv4)
  /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
  // IP addresses (IPv6) - matches full and compressed forms
  /(?:(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?::[0-9a-fA-F]{1,4}){1,6}|:(?::[0-9a-fA-F]{1,4}){1,7}|::)/g,
  // JWT tokens
  /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,
  // API keys (generic pattern)
  /(?:api[_-]?key|apikey|api[_-]?secret)[=:]\s*['"]?[a-zA-Z0-9_-]{20,}['"]?/gi,
  // Credit card numbers
  /\b(?:\d{4}[- ]?){3}\d{4}\b/g,
  // SSN
  /\b\d{3}-\d{2}-\d{4}\b/g,
  // Phone numbers
  /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g,
  // MongoDB ObjectIds (partial redaction)
  /ObjectId\(['"]?[a-f0-9]{24}['"]?\)/gi,
  // Encryption keys (hex strings of significant length)
  /[a-fA-F0-9]{64,}/g,
];

// Safe metadata fields that can be logged
const DEFAULT_ALLOWED_FIELDS = [
  'category',
  'action',
  'feature',
  'success',
  'errorType',
  'errorCode',
  'statusCode',
  'method',
  'path',
  'duration',
  'count',
  'size',
  'version',
  'environment',
  'component',
  'operation',
  'templateId',
  'documentType',
  'workspaceId',
  'stack',
];

/**
 * File writer for log files with rotation support
 */
class LogFileWriter {
  private logDir: string;
  private maxFileSize: number;
  private maxFiles: number;
  private initialized: boolean = false;

  constructor(logDir: string, maxFileSize: number, maxFiles: number) {
    this.logDir = logDir;
    this.maxFileSize = maxFileSize;
    this.maxFiles = maxFiles;
  }

  /**
   * Initialize log directory
   */
  private ensureLogDir(): void {
    if (this.initialized) return;
    
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  /**
   * Get current date string for log file naming
   */
  private getDateString(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  /**
   * Get log file path
   */
  private getLogFilePath(type: 'app' | 'error'): string {
    const dateStr = this.getDateString();
    return path.join(this.logDir, `${type}-${dateStr}.log`);
  }

  /**
   * Rotate log files if needed
   */
  private rotateIfNeeded(filePath: string): void {
    try {
      if (!fs.existsSync(filePath)) return;

      const stats = fs.statSync(filePath);
      if (stats.size < this.maxFileSize) return;

      // Rotate existing files
      const baseName = path.basename(filePath, '.log');
      const dir = path.dirname(filePath);

      // Shift existing rotated files
      for (let i = this.maxFiles - 1; i >= 1; i--) {
        const oldPath = path.join(dir, `${baseName}.${i}.log`);
        const newPath = path.join(dir, `${baseName}.${i + 1}.log`);
        
        if (fs.existsSync(oldPath)) {
          if (i === this.maxFiles - 1) {
            fs.unlinkSync(oldPath); // Delete oldest
          } else {
            fs.renameSync(oldPath, newPath);
          }
        }
      }

      // Rotate current file
      fs.renameSync(filePath, path.join(dir, `${baseName}.1.log`));
    } catch (error) {
      console.error('Failed to rotate log file:', error);
    }
  }

  /**
   * Clean up old log files beyond retention period
   */
  cleanOldLogs(retentionDays: number = 30): void {
    this.ensureLogDir();

    try {
      const files = fs.readdirSync(this.logDir);
      const now = Date.now();
      const maxAge = retentionDays * 24 * 60 * 60 * 1000;

      for (const file of files) {
        if (!file.endsWith('.log')) continue;

        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtimeMs > maxAge) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (error) {
      console.error('Failed to clean old logs:', error);
    }
  }

  /**
   * Write log entry to file
   */
  write(entry: string, level: LogLevel): void {
    this.ensureLogDir();

    try {
      // Write to app log (all levels)
      const appLogPath = this.getLogFilePath('app');
      this.rotateIfNeeded(appLogPath);
      fs.appendFileSync(appLogPath, entry + '\n', 'utf8');

      // Write errors to separate error log
      if (level >= LogLevel.ERROR) {
        const errorLogPath = this.getLogFilePath('error');
        this.rotateIfNeeded(errorLogPath);
        fs.appendFileSync(errorLogPath, entry + '\n', 'utf8');
      }
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  /**
   * Read recent logs from file
   */
  readLogs(type: 'app' | 'error' = 'app', lines: number = 100): string[] {
    this.ensureLogDir();

    try {
      const filePath = this.getLogFilePath(type);
      if (!fs.existsSync(filePath)) return [];

      const content = fs.readFileSync(filePath, 'utf8');
      const allLines = content.split('\n').filter(line => line.trim());
      
      return allLines.slice(-lines);
    } catch (error) {
      console.error('Failed to read log file:', error);
      return [];
    }
  }

  /**
   * Get list of available log files
   */
  getLogFiles(): { name: string; size: number; modified: Date }[] {
    this.ensureLogDir();

    try {
      const files = fs.readdirSync(this.logDir);
      return files
        .filter(file => file.endsWith('.log'))
        .map(file => {
          const filePath = path.join(this.logDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            size: stats.size,
            modified: stats.mtime,
          };
        })
        .sort((a, b) => b.modified.getTime() - a.modified.getTime());
    } catch (error) {
      console.error('Failed to list log files:', error);
      return [];
    }
  }
}

// Singleton file writer instance
let fileWriter: LogFileWriter | null = null;

/**
 * Get or create file writer instance
 */
function getFileWriter(config: LoggerConfig): LogFileWriter {
  if (!fileWriter) {
    fileWriter = new LogFileWriter(config.logDir, config.maxFileSize, config.maxFiles);
  }
  return fileWriter;
}

/**
 * Get configuration from environment variables
 */
function getConfigFromEnv(): LoggerConfig {
  const levelStr = process.env.LOG_LEVEL?.toUpperCase() || 'INFO';
  const level = LogLevel[levelStr as keyof typeof LogLevel] ?? LogLevel.INFO;

  return {
    level,
    enableConsole: process.env.LOG_CONSOLE !== 'false',
    enableFile: process.env.LOG_FILE === 'true',
    logDir: process.env.LOG_DIR || './logs',
    maxFileSize: parseInt(process.env.LOG_MAX_SIZE || '10485760', 10), // 10MB default
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '5', 10),
    enableStructuredLogs: process.env.LOG_STRUCTURED === 'true',
    sanitizePII: process.env.LOG_SANITIZE_PII !== 'false',
    redactPatterns: DEFAULT_PII_PATTERNS,
    allowedMetadataFields: DEFAULT_ALLOWED_FIELDS,
  };
}

/**
 * Sanitize a string by redacting PII patterns
 */
function sanitizeString(value: string, patterns: RegExp[]): string {
  let sanitized = value;
  for (const pattern of patterns) {
    // Reset lastIndex for global regex patterns
    pattern.lastIndex = 0;
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  }
  return sanitized;
}

/**
 * Recursively sanitize an object, redacting PII
 */
function sanitizeObject(
  obj: Record<string, unknown>,
  config: LoggerConfig
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Only include allowed metadata fields
    if (!config.allowedMetadataFields.includes(key)) {
      continue;
    }

    if (typeof value === 'string') {
      sanitized[key] = config.sanitizePII
        ? sanitizeString(value, config.redactPatterns)
        : value;
    } else if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        sanitized[key] = value.map((item) =>
          typeof item === 'string'
            ? config.sanitizePII
              ? sanitizeString(item, config.redactPatterns)
              : item
            : typeof item === 'object' && item !== null
            ? sanitizeObject(item as Record<string, unknown>, config)
            : item
        );
      } else {
        sanitized[key] = sanitizeObject(
          value as Record<string, unknown>,
          config
        );
      }
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Format log entry for output
 */
function formatLogEntry(entry: LogEntry, structured: boolean): string {
  if (structured) {
    return JSON.stringify(entry);
  }

  const { timestamp, level, category, message, metadata, requestId } = entry;
  let formatted = `[${timestamp}] [${level}] [${category}]`;
  
  if (requestId) {
    formatted += ` [${requestId}]`;
  }
  
  formatted += ` ${message}`;
  
  if (metadata && Object.keys(metadata).length > 0) {
    formatted += ` ${JSON.stringify(metadata)}`;
  }

  return formatted;
}

/**
 * Get console method based on log level
 */
function getConsoleMethod(level: LogLevel): (...args: unknown[]) => void {
  switch (level) {
    case LogLevel.DEBUG:
      return console.debug;
    case LogLevel.INFO:
      return console.info;
    case LogLevel.WARN:
      return console.warn;
    case LogLevel.ERROR:
      return console.error;
    default:
      return console.log;
  }
}

/**
 * Logger class for privacy-friendly logging
 */
class Logger {
  private config: LoggerConfig;
  private category: string;
  private requestId?: string;

  constructor(category: string, requestId?: string) {
    this.config = getConfigFromEnv();
    this.category = category;
    this.requestId = requestId;
  }

  /**
   * Create a child logger with a specific category
   */
  child(category: string, requestId?: string): Logger {
    return new Logger(category, requestId ?? this.requestId);
  }

  /**
   * Set request ID for request tracing
   */
  withRequestId(requestId: string): Logger {
    return new Logger(this.category, requestId);
  }

  /**
   * Log a message at the specified level
   */
  private log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    // Skip if log level is below configured threshold
    if (level < this.config.level) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      category: this.category,
      message: this.config.sanitizePII
        ? sanitizeString(message, this.config.redactPatterns)
        : message,
      requestId: this.requestId,
    };

    if (metadata) {
      entry.metadata = sanitizeObject(metadata, this.config);
    }

    const formatted = formatLogEntry(entry, this.config.enableStructuredLogs);

    // Console output
    if (this.config.enableConsole) {
      const consoleMethod = getConsoleMethod(level);
      consoleMethod(formatted);
    }

    // File output
    if (this.config.enableFile) {
      const writer = getFileWriter(this.config);
      writer.write(formatted, level);
    }
  }

  /**
   * Log debug message
   */
  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  /**
   * Log info message
   */
  info(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  /**
   * Log warning message
   */
  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, metadata?: Record<string, unknown>): void {
    const errorMetadata: Record<string, unknown> = {
      ...metadata,
    };

    if (error) {
      errorMetadata.errorType = error.name;
      errorMetadata.errorCode = (error as NodeJS.ErrnoException).code;
      // Include stack trace for debugging
      if (error.stack) {
        errorMetadata.stack = error.stack;
      }
    }

    this.log(LogLevel.ERROR, message, errorMetadata);
  }

  /**
   * Log API request (sanitized)
   */
  request(
    method: string,
    path: string,
    statusCode: number,
    duration: number
  ): void {
    this.info('API Request', {
      method,
      path: this.sanitizePath(path),
      statusCode,
      duration,
    });
  }

  /**
   * Sanitize URL path to remove sensitive query parameters
   */
  private sanitizePath(path: string): string {
    try {
      const url = new URL(path, 'http://localhost');
      const sensitiveParams = ['token', 'key', 'secret', 'password', 'auth'];
      
      sensitiveParams.forEach((param) => {
        if (url.searchParams.has(param)) {
          url.searchParams.set(param, '[REDACTED]');
        }
      });

      return url.pathname + url.search;
    } catch {
      return path;
    }
  }
}

/**
 * Create a logger instance for a specific category
 */
export function createLogger(category: string, requestId?: string): Logger {
  return new Logger(category, requestId);
}

/**
 * Default logger instance
 */
export const logger = createLogger('app');

/**
 * Request ID generator for tracing
 */
export function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Middleware helper for Next.js API routes
 */
export function withRequestLogging<T>(
  handler: (requestId: string) => Promise<T>,
  category: string = 'api'
): Promise<T> {
  const requestId = generateRequestId();
  const log = createLogger(category, requestId);
  
  log.debug('Request started');
  const startTime = Date.now();

  return handler(requestId).finally(() => {
    const duration = Date.now() - startTime;
    log.debug('Request completed', { duration });
  });
}

/**
 * Get recent logs (for admin dashboard)
 */
export function getRecentLogs(type: 'app' | 'error' = 'app', lines: number = 100): string[] {
  const config = getConfigFromEnv();
  if (!config.enableFile) return [];
  
  const writer = getFileWriter(config);
  return writer.readLogs(type, lines);
}

/**
 * Get list of log files (for admin dashboard)
 */
export function getLogFiles(): { name: string; size: number; modified: Date }[] {
  const config = getConfigFromEnv();
  if (!config.enableFile) return [];
  
  const writer = getFileWriter(config);
  return writer.getLogFiles();
}

/**
 * Clean old log files
 */
export function cleanOldLogs(retentionDays: number = 30): void {
  const config = getConfigFromEnv();
  if (!config.enableFile) return;
  
  const writer = getFileWriter(config);
  writer.cleanOldLogs(retentionDays);
}

export default logger;
