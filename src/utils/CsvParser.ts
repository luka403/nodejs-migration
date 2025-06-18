import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { logger } from './logger';
export class CsvParser<T> {
  private filePath: string;
  constructor(filePath: string) {
    this.filePath = filePath;
  }
  async parse(transformFn?: (row: any) => T | null): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const results: T[] = [];
      fs.createReadStream(this.filePath)
        .on('error', (error) => {
          logger.error(`Error reading CSV file: ${this.filePath}`, error);
          reject(error);
        })
        .pipe(csv())
        .on('data', (row) => {
          try {
            if (transformFn) {
              const transformedRow = transformFn(row);
              if (transformedRow !== null) {
                results.push(transformedRow);
              }
            } else {
              results.push(row as T);
            }
          } catch (error) {
            logger.error(`Error transforming row: ${JSON.stringify(row)}`, error);
          }
        })
        .on('end', () => {
          logger.info(`CSV parsing complete: ${this.filePath}, ${results.length} records processed`);
          resolve(results);
        })
        .on('error', (error) => {
          logger.error(`Error parsing CSV: ${this.filePath}`, error);
          reject(error);
        });
    });
  }
} 