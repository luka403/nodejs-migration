import { logger } from './utils/logger';
import { MigrateCategories } from './migrations/migrateCategories';
import { MigrateVendors } from './migrations/migrateVendors';
import { MigrateProducts } from './migrations/migrateProducts';
import config from './config';
import chalk from 'chalk';
async function runMigrations(): Promise<void> {
  const startTime = Date.now();
  try {
    logger.info(chalk.bold('Starting all migrations'));
    const migrationOptions = {
      useTransactions: config.migration.useTransactions,
      batchSize: config.migration.batchSize
    };
    logger.info(chalk.bold('\n=== Migrating Categories ==='));
    await new MigrateCategories(migrationOptions).run();
    logger.info(chalk.bold('\n=== Migrating Vendors ==='));
    await new MigrateVendors(migrationOptions).run();
    logger.info(chalk.bold('\n=== Migrating Products ==='));
    await new MigrateProducts(migrationOptions).run();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.success(chalk.bold(`\nAll migrations completed successfully (duration: ${duration}s)`));
  } catch (error) {
    logger.error('Migration process failed', error);
    process.exit(1);
  }
}
if (require.main === module) {
  runMigrations().catch(error => {
    logger.error('Unhandled error', error);
    process.exit(1);
  });
}
export { runMigrations }; 