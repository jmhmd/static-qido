export interface CrawlOptions {
  dicomWebUrl: string;
  includefield?: string[];
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  match?: {attributeID: string; value: string;}[];
  concurrency: number;
  dbFilePath: string;
}
