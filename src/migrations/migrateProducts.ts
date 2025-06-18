import path from 'path';
import { Migration } from '../utils/Migration';
import { CsvParser } from '../utils/CsvParser';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { Vendor } from '../models/Vendor';
import { logger } from '../utils/logger';
import { DateUtils } from '../utils/dateUtils';
import { BatchProcessor } from '../utils/BatchProcessor';
import { isNonEmptyString, isValidDateString, booleanFromString, isValidBooleanString } from '../utils/validation';
import { FileError, ValidationError } from '../types/Error';
import { ProductCSV } from '../types/Product';
import { VendorReference } from '../types/Vendor';
import { CategoryReference } from '../types/Product';
import { MigrationOptions } from '../types/Migration';
import config from '../config';
import fs from 'fs';
import mongoose from 'mongoose';
export class MigrateProducts extends Migration {
  private vendors: Map<string, VendorReference> = new Map();
  private categories: Map<string, CategoryReference> = new Map();
  constructor(options?: MigrationOptions) {
    super(options);
  }
  protected async execute(): Promise<void> {
    logger.info('Starting products migration');
    const csvFilePath = config.migration.paths.products;
    if (!fs.existsSync(csvFilePath)) {
      throw new FileError(`Products CSV file not found: ${csvFilePath}`);
    }
    await this.loadVendors();
    await this.loadCategories();
    const csvParser = new CsvParser<ProductCSV>(csvFilePath);
    const products = await csvParser.parse(this.validateProduct);
    logger.info(`Found ${products.length} valid products in CSV`);
    await this.clearCollection(Product);
    await this.insertProducts(products);
  }
  private validateProduct = (product: ProductCSV): ProductCSV | null => {
    if (!isNonEmptyString(product.SKU)) {
      logger.warning(`Skipping product with invalid SKU: ${product.SKU || 'EMPTY'}`);
      return null;
    }
    if (!isNonEmptyString(product.PRODUCT_NAME)) {
      logger.warning(`Skipping product with empty name: ${product.SKU}`);
      return null;
    }
    if (!isNonEmptyString(product.DESCRIPTION)) {
      logger.warning(`Skipping product with empty description: ${product.SKU}`);
      return null;
    }
    if (!this.vendors.has(product.VENDOR)) {
      logger.warning(`Skipping product ${product.SKU}: Vendor not found: ${product.VENDOR}`);
      return null;
    }
    if (!this.categories.has(product.CATEGORY_CODE)) {
      logger.warning(`Skipping product ${product.SKU}: Category not found: ${product.CATEGORY_CODE}`);
      return null;
    }
    if (!isValidBooleanString(product.ACTIVE_STATUS)) {
      logger.warning(`Product ${product.SKU} has invalid ACTIVE_STATUS: ${product.ACTIVE_STATUS}, defaulting to 'No'`);
      product.ACTIVE_STATUS = 'No';
    }
    if (!isValidBooleanString(product.DISCONTINUED)) {
      logger.warning(`Product ${product.SKU} has invalid DISCONTINUED: ${product.DISCONTINUED}, defaulting to 'No'`);
      product.DISCONTINUED = 'No';
    }
    if (product.CREATED_DATE && !isValidDateString(product.CREATED_DATE)) {
      logger.warning(`Product ${product.SKU} has invalid CREATED_DATE: ${product.CREATED_DATE}`);
    }
    if (product.LAST_MODIFIED_DATE && !isValidDateString(product.LAST_MODIFIED_DATE)) {
      logger.warning(`Product ${product.SKU} has invalid LAST_MODIFIED_DATE: ${product.LAST_MODIFIED_DATE}`);
    }
    return product;
  };
  private async insertProducts(products: ProductCSV[]): Promise<void> {
    let insertedCount = 0;
    let skippedCount = 0;
    const batchProcessor = new BatchProcessor<ProductCSV>(
      products,
      this.options.batchSize || 1000,
      async (batch) => {
        try {
          const operations = batch.map(product => {
            const vendor = this.vendors.get(product.VENDOR)!;
            const category = this.categories.get(product.CATEGORY_CODE)!;
            const createdAt = DateUtils.parseDate(product.CREATED_DATE);
            const updatedAt = DateUtils.parseDate(product.LAST_MODIFIED_DATE) || createdAt;
            const active = booleanFromString(product.ACTIVE_STATUS);
            const discontinued = booleanFromString(product.DISCONTINUED);
            return {
              updateOne: {
                filter: { _id: product.SKU },
                update: { 
                  $set: {
                    _id: product.SKU,
                    manufacturerPartNumber: product.MANUFACTURER_PART_NO || undefined,
                    name: product.PRODUCT_NAME,
                    description: product.DESCRIPTION,
                    color: product.COLOR || undefined,
                    active,
                    discontinued,
                    createdAt,
                    updatedAt,
                    vendor: {
                      _id: vendor._id,
                      name: vendor.name
                    },
                    category: {
                      _id: category._id,
                      name: category.name
                    }
                  }
                },
                upsert: true
              }
            };
          });
          const result = await Product.bulkWrite(operations, { 
            session: this.session,
            ordered: false
          });
          insertedCount += batch.length;
          return Array(batch.length).fill(null);
        } catch (error: any) {
          if (error && error.name === 'BulkWriteError' && error.writeErrors) {
            for (const writeError of error.writeErrors) {
              logger.error(`Error inserting product at index ${writeError.index}:`, writeError.err);
              skippedCount++;
            }
            return Array(batch.length - error.writeErrors.length).fill(null);
          } else {
            throw error;
          }
        }
      },
      { progressInterval: 2000 }
    );
    await batchProcessor.process();
    logger.success(`Products inserted successfully: ${insertedCount} inserted, ${skippedCount} skipped`);
  }
  private async loadVendors(): Promise<void> {
    const vendors = await Vendor.find({}, { _id: 1, name: 1 });
    for (const vendor of vendors) {
      this.vendors.set(vendor._id, { _id: vendor._id, name: vendor.name });
    }
    logger.info(`Loaded ${this.vendors.size} vendors for lookups`);
  }
  private async loadCategories(): Promise<void> {
    const categories = await Category.find({}, { _id: 1, name: 1 });
    for (const category of categories) {
      this.categories.set(category._id, { _id: category._id, name: category.name });
    }
    logger.info(`Loaded ${this.categories.size} categories for lookups`);
  }
}
if (require.main === module) {
  const migration = new MigrateProducts({
    useTransactions: config.migration.useTransactions,
    batchSize: config.migration.batchSize
  });
  migration.run().catch(error => {
    logger.error('Products migration failed', error);
    process.exit(1);
  });
}
