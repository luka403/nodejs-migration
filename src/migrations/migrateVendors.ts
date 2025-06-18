import { Migration } from '../utils/Migration';
import { CsvParser } from '../utils/CsvParser';
import { Vendor } from '../models/Vendor';
import { logger } from '../utils/logger';
import { DateUtils } from '../utils/dateUtils';
import { BatchProcessor } from '../utils/BatchProcessor';
import { isNonEmptyString, isValidDateString } from '../utils/validation';
import { FileError, ValidationError } from '../types/Error';
import { VendorCSV } from '../types/Vendor';
import { MigrationOptions } from '../types/Migration';
import config from '../config';
import fs from 'fs';
export class MigrateVendors extends Migration {
  constructor(options?: MigrationOptions) {
    super(options);
  }
  protected async execute(): Promise<void> {
    logger.info('Starting vendors migration');
    const csvFilePath = config.migration.paths.vendors;
    if (!fs.existsSync(csvFilePath)) {
      throw new FileError(`Vendors CSV file not found: ${csvFilePath}`);
    }
    const csvParser = new CsvParser<VendorCSV>(csvFilePath);
    const vendors = await csvParser.parse(this.validateVendor);
    logger.info(`Found ${vendors.length} valid vendors in CSV`);
    await this.clearCollection(Vendor);
    await this.insertVendors(vendors);
  }
  private validateVendor = (vendor: VendorCSV): VendorCSV | null => {
    if (!isNonEmptyString(vendor.VENDOR_ID)) {
      logger.warning(`Skipping vendor with invalid ID: ${vendor.VENDOR_ID}`);
      return null;
    }
    if (!isNonEmptyString(vendor.VENDOR_NAME)) {
      logger.warning(`Skipping vendor with empty name: ${vendor.VENDOR_ID}`);
      return null;
    }
    if (vendor.CREATE_DATE && !isValidDateString(vendor.CREATE_DATE)) {
      logger.warning(`Vendor ${vendor.VENDOR_ID} has invalid CREATE_DATE: ${vendor.CREATE_DATE}`);
    }
    if (vendor.LAST_MODIFIED_DATE && !isValidDateString(vendor.LAST_MODIFIED_DATE)) {
      logger.warning(`Vendor ${vendor.VENDOR_ID} has invalid LAST_MODIFIED_DATE: ${vendor.LAST_MODIFIED_DATE}`);
    }
    return vendor;
  };
  private async insertVendors(vendors: VendorCSV[]): Promise<void> {
    const batchProcessor = new BatchProcessor<VendorCSV>(
      vendors,
      this.options.batchSize || 1000,
      async (batch) => {
        const operations = batch.map(vendor => {
          const createdAt = DateUtils.parseDate(vendor.CREATE_DATE);
          const updatedAt = DateUtils.parseDate(vendor.LAST_MODIFIED_DATE) || createdAt;
          return {
            updateOne: {
              filter: { _id: vendor.VENDOR_ID },
              update: { 
                $set: {
                  _id: vendor.VENDOR_ID,
                  name: vendor.VENDOR_NAME,
                  createdAt,
                  updatedAt
                }
              },
              upsert: true
            }
          };
        });
        const result = await Vendor.bulkWrite(operations, { 
          session: this.session,
          ordered: false
        });
        return Array(batch.length).fill(null);
      },
      { progressInterval: 2000 }
    );
    await batchProcessor.process();
    logger.success(`Vendors inserted successfully`);
  }
}
if (require.main === module) {
  const migration = new MigrateVendors({
    useTransactions: config.migration.useTransactions,
    batchSize: config.migration.batchSize
  });
  migration.run().catch(error => {
    logger.error('Vendors migration failed', error);
    process.exit(1);
  });
}
