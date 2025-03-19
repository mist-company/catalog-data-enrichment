import { Queue } from 'bullmq';
import { CATALOG_DATA_ENRICHMENT_QUEUE_NAME } from '../config';

export const queue = new Queue(CATALOG_DATA_ENRICHMENT_QUEUE_NAME, { connection: { url: process.env.REDIS_URL } });
