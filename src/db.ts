import mongoose from "mongoose";
import dotenv from "dotenv";
import { logger } from "./utils/logger";
import config from "./config";

dotenv.config();

export const connectDB = async (retryAttempt = 0): Promise<mongoose.Connection> => {
  const maxRetries = config.database.options.retryAttempts || 5;
  const retryDelay = 1000 * Math.pow(2, retryAttempt); 
  
  try {
    logger.info(`Connecting to MongoDB: ${config.database.uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
    
    await mongoose.connect(config.database.uri);
    
    logger.success('MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    if (retryAttempt < maxRetries) {
      logger.warning(`MongoDB connection failed, retrying in ${retryDelay}ms (attempt ${retryAttempt + 1}/${maxRetries})`, error);
      
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(connectDB(retryAttempt + 1));
        }, retryDelay);
      });
    }
    
    logger.error('MongoDB connection failed after maximum retry attempts', error);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      logger.info('MongoDB disconnected');
    }
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error);
  }
};

export const getConnection = (): mongoose.Connection => {
  return mongoose.connection;
};

export const startTransaction = async (): Promise<mongoose.ClientSession> => {
  const conn = mongoose.connection;
  const session = await conn.startSession();
  session.startTransaction();
  return session;
};

export const commitTransaction = async (session: mongoose.ClientSession): Promise<void> => {
  await session.commitTransaction();
  await session.endSession();
};

export const abortTransaction = async (session: mongoose.ClientSession): Promise<void> => {
  await session.abortTransaction();
  await session.endSession();
};