import { Migration } from '../utils/Migration';
import { CsvParser } from '../utils/CsvParser';
import { Category } from '../models/Category';
import { CategoryTree } from '../models/CategoryTree';
import { logger } from '../utils/logger';
import { BatchProcessor } from '../utils/BatchProcessor';
import { isValidCategoryCode } from '../utils/validation';
import { FileError, ValidationError } from '../types/Error';
import { CategoryCSV, CategoryNode } from '../types/Category';
import { MigrationOptions } from '../types/Migration';
import config from '../config';
import fs from 'fs';
export class MigrateCategories extends Migration {
  constructor(options?: MigrationOptions) {
    super(options);
  }
  protected async execute(): Promise<void> {
    logger.info('Starting categories migration');
    const csvFilePath = config.migration.paths.categories;
    if (!fs.existsSync(csvFilePath)) {
      throw new FileError(`Categories CSV file not found: ${csvFilePath}`);
    }
    const csvParser = new CsvParser<CategoryCSV>(csvFilePath);
    const categories = await csvParser.parse(this.validateCategory);
    logger.info(`Found ${categories.length} valid categories in CSV`);
    await this.clearCollection(Category);
    await this.clearCollection(CategoryTree);
    await this.insertCategories(categories);
    await this.insertCategoryTree(categories);
    logger.info('Category tree created successfully');
  }
  private validateCategory = (category: CategoryCSV): CategoryCSV | null => {
    if (!isValidCategoryCode(category.CATEGORY_CODE)) {
      logger.warning(`Skipping invalid category code: ${category.CATEGORY_CODE}`);
      return null;
    }
    if (!category.CATEGORY_NAME || category.CATEGORY_NAME.trim().length === 0) {
      logger.warning(`Skipping category with empty name: ${category.CATEGORY_CODE}`);
      return null;
    }
    return category;
  };
  private async insertCategories(categories: CategoryCSV[]): Promise<void> {
    const batchProcessor = new BatchProcessor<CategoryCSV>(
      categories,
      this.options.batchSize || 1000,
      async (batch) => {
        const operations = batch.map(category => ({
          updateOne: {
            filter: { _id: category.CATEGORY_CODE },
            update: { $set: { _id: category.CATEGORY_CODE, name: category.CATEGORY_NAME } },
            upsert: true
          }
        }));
        const result = await Category.bulkWrite(operations, { 
          session: this.session,
          ordered: false
        });
        return Array(batch.length).fill(null);
      },
      { progressInterval: 2000 }
    );
    await batchProcessor.process();
    logger.success(`Categories inserted successfully`);
  }
  private async insertCategoryTree(categories: CategoryCSV[]): Promise<void> {
    const rootNodes = this.buildCategoryTree(categories);
    await CategoryTree.updateOne(
      { _id: 'categoryTree' },
      { $set: { children: rootNodes } },
      { upsert: true, session: this.session }
    );
    logger.info('Category tree created/updated successfully');
  }
  private buildCategoryTree(categories: CategoryCSV[]): CategoryNode[] {
    const categoryMap = new Map<string, CategoryNode>();
    const rootNodes: CategoryNode[] = [];
    for (const category of categories) {
      categoryMap.set(category.CATEGORY_CODE, {
        _id: category.CATEGORY_CODE,
        name: category.CATEGORY_NAME,
        children: []
      });
    }
    for (const category of categories) {
      const id = category.CATEGORY_CODE;
      const node = categoryMap.get(id)!;
      if (id.length === 2) {
        rootNodes.push(node);
      } else {
        const parentId = id.slice(0, -2);
        const parent = categoryMap.get(parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          logger.warning(`Parent category not found for ${id}, adding to root`);
          rootNodes.push(node);
        }
      }
    }
    return rootNodes;
  }
}
if (require.main === module) {
  const migration = new MigrateCategories({
    useTransactions: config.migration.useTransactions,
    batchSize: config.migration.batchSize
  });
  migration.run().catch(error => {
    logger.error('Categories migration failed', error);
    process.exit(1);
  });
}
