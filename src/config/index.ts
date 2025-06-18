import dotenv from 'dotenv';
import path from 'path';
dotenv.config();
export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test'
}
export interface DatabaseConfig {
  uri: string;
  options: {
    serverSelectionTimeoutMS: number;
    socketTimeoutMS: number;
    connectTimeoutMS: number;
    maxPoolSize: number;
    retryAttempts: number;
  };
}
export interface MigrationConfig {
  batchSize: number;
  retryAttempts: number;
  useTransactions: boolean;
  paths: {
    categories: string;
    vendors: string;
    products: string;
  };
}
export interface AppConfig {
  env: Environment;
  database: DatabaseConfig;
  migration: MigrationConfig;
}
function getEnvironment(): Environment {
  const env = process.env.NODE_ENV || 'development';
  switch (env.toLowerCase()) {
    case 'production':
      return Environment.PRODUCTION;
    case 'test':
      return Environment.TEST;
    default:
      return Environment.DEVELOPMENT;
  }
}
function getDatabaseConfig(): DatabaseConfig {
  return {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/migration',
    options: {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      retryAttempts: parseInt(process.env.MONGO_RETRY_ATTEMPTS || '5', 10)
    }
  };
}
function getMigrationConfig(): MigrationConfig {
  return {
    batchSize: parseInt(process.env.MIGRATION_BATCH_SIZE || '1000', 10),
    retryAttempts: parseInt(process.env.MIGRATION_RETRY_ATTEMPTS || '3', 10),
    useTransactions: process.env.MIGRATION_USE_TRANSACTIONS === 'true',
    paths: {
      categories: process.env.CATEGORIES_PATH || path.join(process.cwd(), 'categories.csv'),
      vendors: process.env.VENDORS_PATH || path.join(process.cwd(), 'vendors.csv'),
      products: process.env.PRODUCTS_PATH || path.join(process.cwd(), 'products.csv')
    }
  };
}
const config: AppConfig = {
  env: getEnvironment(),
  database: getDatabaseConfig(),
  migration: getMigrationConfig()
};
export default config; 