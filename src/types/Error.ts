export class AppError extends Error {
  code: string;
  statusCode?: number;
  constructor(message: string, code: string = 'INTERNAL_ERROR', statusCode?: number) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
export class ValidationError extends AppError {
  fields?: Record<string, string>;
  constructor(message: string, fields?: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', 400);
    this.fields = fields;
  }
}
export class DatabaseError extends AppError {
  originalError?: any;
  constructor(message: string, originalError?: any) {
    super(message, 'DATABASE_ERROR', 500);
    this.originalError = originalError;
  }
}
export class FileError extends AppError {
  filePath?: string;
  constructor(message: string, filePath?: string) {
    super(message, 'FILE_ERROR', 500);
    this.filePath = filePath;
  }
}
export class MigrationError extends AppError {
  migrationName?: string;
  stage?: string;
  constructor(message: string, migrationName?: string, stage?: string) {
    super(message, 'MIGRATION_ERROR', 500);
    this.migrationName = migrationName;
    this.stage = stage;
  }
} 