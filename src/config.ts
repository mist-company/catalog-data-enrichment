export const DB_URL = process.env.DB_URL;
export const DB_NAME = process.env.DB_NAME ?? 'catalog-local';
export const REDIS_URL = process.env.REDIS_URL;
export const LOG_LEVEL = process.env.LOG_LEVEL ?? 'debug';
export const PORT = process.env.PORT ?? 3000;
export const JACKETT_URL = process.env.JACKETT_URL;
export const JACKETT_API_KEY = process.env.JACKETT_API_KEY;
export const FIND_TORRENT_JOB_NAME = process.env.FIND_TORRENT_JOB_NAME ?? 'find-torrent-job-local';
export const CATALOG_ENRICHMENT_QUEUE_NAME =
  process.env.CATALOG_ENRICHMENT_QUEUE_NAME ?? 'catalog-enrichment-queue-local';
export const WORKER_CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY ?? '300', 10);
export const SIMILARITY_THRESHOLD = parseFloat(process.env.SIMILARITY_THRESHOLD ?? '0.8');
