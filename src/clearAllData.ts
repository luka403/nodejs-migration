import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './db';
import { Category } from './models/Category';
import { CategoryTree } from './models/CategoryTree';
import { Product } from './models/Product';
import { Vendor } from './models/Vendor';
import { logger } from './utils/logger';
async function clearAllData(): Promise<void> {
  try {
    await connectDB();
    logger.info('Connected to database');
    logger.info('Clearing all collections...');
    const categoryResult = await Category.deleteMany({});
    logger.info(`Deleted ${categoryResult.deletedCount} documents from Category collection`);
    const categoryTreeResult = await CategoryTree.deleteMany({});
    logger.info(`Deleted ${categoryTreeResult.deletedCount} documents from CategoryTree collection`);
    const vendorResult = await Vendor.deleteMany({});
    logger.info(`Deleted ${vendorResult.deletedCount} documents from Vendor collection`);
    const productResult = await Product.deleteMany({});
    logger.info(`Deleted ${productResult.deletedCount} documents from Product collection`);
    logger.info('All collections cleared successfully');
  } catch (error) {
    logger.error('Error clearing collections:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
    logger.info('Disconnected from database');
  }
}
if (require.main === module) {
  clearAllData()
    .then(() => process.exit(0))
    .catch(error => {
      logger.error('Unhandled error:', error);
      process.exit(1);
    });
} 