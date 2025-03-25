import os from 'node:os';

export const POSTGRES_URL = process.env.POSTGRES_URL;
export const MONGO_URL = process.env.MONGO_URL;
export const REDIS_URL = process.env.REDIS_URL;
export const LOG_LEVEL = process.env.LOG_LEVEL ?? 'debug';
export const PORT = process.env.PORT ?? 3000;

export const SUPPORTED_TITLE_TYPES = ['movie']; // 'tvSeries', 'tvMiniSeries';
export const FIND_TITLES_JOB_NAME = 'FIND_TITLES';
export const NORMALIZE_TITLE_JOB_NAME = 'NORMALIZE_TITLE';
export const ENRICH_TITLE_JOB_NAME = 'ENRICH_TITLE';
export const CATALOG_DATA_ENRICHMENT_QUEUE_NAME = 'CATALOG_DATA_ENRICHMENT';
export const CATALOG_DATA_ENRICHMENT_QUEUE_CONCURRENCY = process.env.CATALOG_DATA_ENRICHMENT_QUEUE_CONCURRENCY
  ? parseInt(process.env.CATALOG_DATA_ENRICHMENT_QUEUE_CONCURRENCY)
  : os.cpus().length;
