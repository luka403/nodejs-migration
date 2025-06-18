import { logger } from './logger';
export class BatchProcessor<T, R = any> {
  private data: T[];
  private batchSize: number;
  private processFunction: (items: T[], startIndex: number, endIndex: number) => Promise<R[]>;
  private progressInterval: number;
  private lastProgressTime: number = 0;
  private reportProgress: boolean;
  constructor(
    data: T[],
    batchSize: number,
    processFunction: (items: T[], startIndex: number, endIndex: number) => Promise<R[]>,
    options: { 
      progressInterval?: number;
      reportProgress?: boolean;
    } = {}
  ) {
    this.data = data;
    this.batchSize = batchSize;
    this.processFunction = processFunction;
    this.progressInterval = options.progressInterval || 5000; 
    this.reportProgress = options.reportProgress !== undefined ? options.reportProgress : true;
  }
  async process(): Promise<R[]> {
    const totalItems = this.data.length;
    let processedItems = 0;
    let results: R[] = [];
    logger.info(`Starting batch processing of ${totalItems} items with batch size ${this.batchSize}`);
    this.lastProgressTime = Date.now();
    for (let i = 0; i < totalItems; i += this.batchSize) {
      const end = Math.min(i + this.batchSize, totalItems);
      const batch = this.data.slice(i, end);
      try {
        const batchResults = await this.processFunction(batch, i, end);
        results = results.concat(batchResults);
      } catch (error) {
        logger.error(`Error processing batch ${i}-${end}:`, error);
      }
      processedItems += batch.length;
      if (this.reportProgress && this.shouldReportProgress()) {
        const percentComplete = ((processedItems / totalItems) * 100).toFixed(2);
        logger.info(`Progress: ${processedItems}/${totalItems} (${percentComplete}%)`);
        this.lastProgressTime = Date.now();
      }
    }
    logger.success(`Batch processing complete: ${processedItems}/${totalItems} items processed`);
    return results;
  }
  private shouldReportProgress(): boolean {
    return (Date.now() - this.lastProgressTime) > this.progressInterval;
  }
} 