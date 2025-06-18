import mongoose from 'mongoose';
import { connectDB, disconnectDB, startTransaction, commitTransaction, abortTransaction } from '../db';
import { logger } from './logger';
import config from '../config';

export interface MigrationOptions {
  useTransactions?: boolean;
  clearExistingData?: boolean;
  batchSize?: number;
}

export abstract class Migration {
  protected options: MigrationOptions;
  protected session?: mongoose.ClientSession;
  private startTime: number = 0;
  private transactionCommitted: boolean = false;

  constructor(options: MigrationOptions = {}) {
    this.options = {
      useTransactions: options.useTransactions !== undefined 
        ? options.useTransactions 
        : config.migration.useTransactions,
      clearExistingData: options.clearExistingData !== undefined 
        ? options.clearExistingData 
        : true,
      batchSize: options.batchSize || config.migration.batchSize
    };
  }

  async run(): Promise<void> {
    this.startTime = Date.now();
    logger.info(`Starting migration: ${this.getName()}`);
    
    try {
      await connectDB();
      
      if (this.options.useTransactions) {
        this.session = await startTransaction();
        logger.info('Transaction started');
      }
      
      await this.execute();
      
      if (this.options.useTransactions && this.session) {
        await commitTransaction(this.session);
        this.transactionCommitted = true;
        logger.info('Transaction committed');
      }
      
      const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
      logger.success(`Migration completed: ${this.getName()} (duration: ${duration}s)`);
    } catch (error) {
      if (this.options.useTransactions && this.session && !this.transactionCommitted) {
        try {
          await abortTransaction(this.session);
          logger.warning('Transaction aborted');
        } catch (abortError) {
          logger.error('Error aborting transaction:', abortError);
        }
      }
      
      logger.error(`${this.getName()} migration failed`, error);
      process.exit(1);
    } finally {
      await disconnectDB();
    }
  }

  getName(): string {
    return this.constructor.name;
  }

  protected abstract execute(): Promise<void>;

  protected async clearCollection(model: mongoose.Model<any>): Promise<void> {
    if (!this.options.clearExistingData) {
      logger.info(`Skipping clearing collection ${model.collection.name} (clearExistingData is disabled)`);
      return;
    }
    
    logger.info(`Clearing collection: ${model.collection.name}`);
    try {
      await model.deleteMany({}, { session: this.session });
      logger.info(`Collection cleared: ${model.collection.name}`);
    } catch (error) {
      logger.error(`Failed to clear collection: ${model.collection.name}`, error);
      throw error;
    }
  }
} 