import mongoose from 'mongoose';
export interface MigrationOptions {
  useTransactions?: boolean;
  clearExistingData?: boolean;
  batchSize?: number;
  reportProgress?: boolean;
  session?: mongoose.ClientSession;
}
export interface BulkWriteOptions {
  session?: mongoose.ClientSession;
  ordered?: boolean;
} 